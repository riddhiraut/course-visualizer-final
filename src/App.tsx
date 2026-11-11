import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Plus,
  Trash2,
  Search,
  BookOpen,
  LogOut,
  Save,
  User,
  Sparkles,
} from 'lucide-react';
import { ALL_PROGRAMS, ALL_COURSES } from './data/coursesData';
import { Course, EQUIVALENCE_MAP } from './models/Course';
import { ComputingProgram } from './models/ComputingProgram';
import { AuthModal } from './components/AuthModal';
import { api, AuthUser, PlannerData } from './services/api';

// Unified requirement representation (handles interchangeable courses like CSCI 2720 / 2725)
interface RequirementItem {
  id: string; // canonical identifier
  codes: string[]; // interchangeable course codes
  displayName: string;
  name: string;
  credits: number;
  prereqs: string[];
  description: string;
  requiredByPrograms: string[];
}

export default function App() {
  // Active programs (multi-select for double majors, major + minor, etc.)
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([
    'B.S. in Computer Science',
  ]);

  // Completed course codes stored in state (starts completely empty per user request)
  const [completedCodes, setCompletedCodes] = useState<string[]>([]);

  // Selected electives (starts completely empty per user request)
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);

  // Elective text input
  const [electiveInput, setElectiveInput] = useState<string>('');
  const [electiveFeedback, setElectiveFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Exactly two tabs: Required Courses & Electives
  const [activeTab, setActiveTab] = useState<'required' | 'electives'>('required');

  // Classification filters for each tab: 'all' | 'complete' | 'unlocked' | 'locked'
  const [requiredClassificationFilter, setRequiredClassificationFilter] = useState<
    'all' | 'complete' | 'unlocked' | 'locked'
  >('all');
  const [electiveClassificationFilter, setElectiveClassificationFilter] = useState<
    'all' | 'complete' | 'unlocked' | 'locked'
  >('all');

  // Auth & Database
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Electives tab search & filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogDept, setCatalogDept] = useState('ALL');

  // On boot: check auth session
  useEffect(() => {
    async function initAuth() {
      const session = await api.getCurrentUser();
      if (session) {
        setUser(session.user);
        if (session.planner) {
          if (session.planner.programs?.length) setSelectedPrograms(session.planner.programs);
          if (Array.isArray(session.planner.completed)) setCompletedCodes(session.planner.completed);
          if (Array.isArray(session.planner.electives)) setSelectedElectives(session.planner.electives);
        }
      }
    }
    initAuth();
  }, []);

  const handleSaveToDatabase = async () => {
    if (!user) return;
    const data: PlannerData = {
      programs: selectedPrograms,
      completed: completedCodes,
      electives: selectedElectives,
    };

    try {
      await api.savePlanner(data);
      setSaveStatus(
        `Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message}`);
    }
  };

  const handleLogout = () => {
    api.clearSession();
    setUser(null);
    setSaveStatus('Signed out.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  // All completed or selected course codes (both required courses checked off AND selected electives)
  const allUserCompletedCodes = Array.from(
    new Set([...completedCodes, ...selectedElectives])
  );
  const completedSet = new Set(allUserCompletedCodes);

  // Helper: check if a course code is satisfied (including interchangeable equivalents)
  const isSatisfied = (code: string) => Course.isSatisfied(code, completedSet);

  const activeProgramObjects: ComputingProgram[] = selectedPrograms
    .map((name) => ALL_PROGRAMS[name])
    .filter(Boolean);

  // Helper: checks whether a course is an eligible elective for a specific program
  // RULE: A course CANNOT count as an elective for a program if it is already a required core course of that same program.
  const isEligibleElectiveForProgram = (
    course: Course | undefined,
    prog: ComputingProgram
  ): boolean => {
    if (!course) return false;
    const norm = Course.normalizeCode(course.code);

    // 1. If it is required for prog (or equivalent to a required course), it cannot be an elective for prog!
    const isReq =
      prog.requiredCourses.has(norm) ||
      Boolean(EQUIVALENCE_MAP[norm]?.some((eq) => prog.requiredCourses.has(eq)));
    if (isReq) {
      return false;
    }

    // 2. Program elective rule
    if (prog.electiveRule && prog.electiveRule.isEligibleCourse(course)) {
      return true;
    }

    // 3. Departmental upper-division rules
    const match = norm.match(/^([A-Z]{3,4})\s*(\d{4}[A-Z]?)/i);
    if (match) {
      const dept = match[1].toUpperCase();
      const num = parseInt(match[2].replace(/\D/g, ''), 10);
      if (prog.name.includes('Computer Science') && prog.degreeType === 'Major' && dept === 'CSCI' && num >= 4000 && num <= 4999) {
        return true;
      }
      if (prog.name.includes('Computer Science') && prog.degreeType === 'Minor' && dept === 'CSCI' && num >= 3000 && num <= 4999) {
        return true;
      }
      if (prog.name.includes('Statistics') && dept === 'STAT' && num >= 4000 && num <= 5999) {
        return true;
      }
      if (prog.name.includes('Mathematics') && prog.degreeType === 'Major' && dept === 'MATH' && num >= 4000 && num <= 5999) {
        return true;
      }
      if (prog.name.includes('Mathematics') && prog.degreeType === 'Minor' && dept === 'MATH' && num >= 3000 && num <= 5999) {
        return true;
      }
    }

    return false;
  };

  // Helper: determines what programs a course satisfies (required and/or elective) for double-dipping analysis
  const getCourseRelevance = (courseCode: string, courseObj?: Course) => {
    const norm = Course.normalizeCode(courseCode);
    const targetCourse = courseObj || ALL_COURSES[norm];
    const requiredIn: string[] = [];
    const electiveIn: string[] = [];

    for (const prog of activeProgramObjects) {
      // Check required
      const isReq =
        prog.requiredCourses.has(norm) ||
        Boolean(EQUIVALENCE_MAP[norm]?.some((eq) => prog.requiredCourses.has(eq)));
      if (isReq) {
        requiredIn.push(prog.shortName || prog.name);
      }

      // Check elective eligibility (strict: never counts as elective if required in the SAME program)
      if (isEligibleElectiveForProgram(targetCourse, prog)) {
        electiveIn.push(prog.shortName || prog.name);
      }
    }

    const allApplicablePrograms = Array.from(new Set([...requiredIn, ...electiveIn]));
    // Double dipping applies when a course counts across multiple active programs
    // or counts as required in one program and elective in another
    const isDoubleDip =
      allApplicablePrograms.length > 1 || (requiredIn.length > 0 && electiveIn.length > 0);

    return {
      requiredIn,
      electiveIn,
      allApplicablePrograms,
      isDoubleDip,
      programLabel: allApplicablePrograms.length > 0 ? allApplicablePrograms.join(' & ') : '',
      electiveLabel: electiveIn.length > 0 ? electiveIn.join(' & ') : '',
      requiredLabel: requiredIn.length > 0 ? requiredIn.join(' & ') : '',
    };
  };

  // Build canonical unified required courses across all selected programs
  const unifiedRequirements: RequirementItem[] = [];
  const processedKeys = new Set<string>();

  for (const prog of activeProgramObjects) {
    for (const [rawCode, course] of prog.requiredCourses.entries()) {
      const code = Course.normalizeCode(rawCode);

      // Check interchangeability: CSCI 2720 / 2725
      if (code === 'CSCI 2720' || code === 'CSCI 2725') {
        const key = 'CSCI 2720/2725';
        const existing = unifiedRequirements.find((r) => r.id === key);
        if (existing) {
          if (!existing.requiredByPrograms.includes(prog.shortName || prog.name)) {
            existing.requiredByPrograms.push(prog.shortName || prog.name);
          }
        } else if (!processedKeys.has(key)) {
          processedKeys.add(key);
          processedKeys.add('CSCI 2720');
          processedKeys.add('CSCI 2725');
          unifiedRequirements.push({
            id: key,
            codes: ['CSCI 2720', 'CSCI 2725'],
            displayName: 'CSCI 2720 / 2725',
            name: 'Data Structures (CSCI 2720 / 2725)',
            credits: 4,
            prereqs: ['CSCI 1302', 'CSCI 2610'],
            description: 'Abstract data types, lists, trees, hash tables, heaps (CSCI 2720 and CSCI 2725 are interchangeable).',
            requiredByPrograms: [prog.shortName || prog.name],
          });
        }
        continue;
      }

      // Check interchangeability: MATH 3000 / 3300
      if (code === 'MATH 3000' || code === 'MATH 3300') {
        const key = 'MATH 3000/3300';
        const existing = unifiedRequirements.find((r) => r.id === key);
        if (existing) {
          if (!existing.requiredByPrograms.includes(prog.shortName || prog.name)) {
            existing.requiredByPrograms.push(prog.shortName || prog.name);
          }
        } else if (!processedKeys.has(key)) {
          processedKeys.add(key);
          processedKeys.add('MATH 3000');
          processedKeys.add('MATH 3300');
          unifiedRequirements.push({
            id: key,
            codes: ['MATH 3000', 'MATH 3300'],
            displayName: 'MATH 3000 / 3300',
            name: 'Linear Algebra (MATH 3000 / 3300)',
            credits: 3,
            prereqs: ['MATH 2250'],
            description: 'Linear algebra, vector spaces, matrices, eigenvalues (interchangeable).',
            requiredByPrograms: [prog.shortName || prog.name],
          });
        }
        continue;
      }

      // Check interchangeability: STAT 4520 / 4530
      if (code === 'STAT 4520' || code === 'STAT 4530') {
        const key = 'STAT 4520/4530';
        const existing = unifiedRequirements.find((r) => r.id === key);
        if (existing) {
          if (!existing.requiredByPrograms.includes(prog.shortName || prog.name)) {
            existing.requiredByPrograms.push(prog.shortName || prog.name);
          }
        } else if (!processedKeys.has(key)) {
          processedKeys.add(key);
          processedKeys.add('STAT 4520');
          processedKeys.add('STAT 4530');
          unifiedRequirements.push({
            id: key,
            codes: ['STAT 4520', 'STAT 4530'],
            displayName: 'STAT 4520 / 4530',
            name: 'Mathematical Statistics II / Inference',
            credits: 3,
            prereqs: ['STAT 4510'],
            description: 'Estimation, hypothesis testing, likelihood methods (interchangeable).',
            requiredByPrograms: [prog.shortName || prog.name],
          });
        }
        continue;
      }

      const existing = unifiedRequirements.find((r) => r.id === code);
      if (existing) {
        if (!existing.requiredByPrograms.includes(prog.shortName || prog.name)) {
          existing.requiredByPrograms.push(prog.shortName || prog.name);
        }
      } else if (!processedKeys.has(code)) {
        processedKeys.add(code);
        unifiedRequirements.push({
          id: code,
          codes: [code],
          displayName: code,
          name: course.name,
          credits: course.credits,
          prereqs: course.prereqs,
          description: course.description,
          requiredByPrograms: [prog.shortName || prog.name],
        });
      }
    }
  }

  // Toggle required item
  const handleToggleRequirement = (item: RequirementItem) => {
    const isCompleted = item.codes.some((c) => isSatisfied(c));

    if (isCompleted) {
      setCompletedCodes(completedCodes.filter((c) => !item.codes.includes(c)));
      setSelectedElectives(selectedElectives.filter((c) => !item.codes.includes(c)));
    } else {
      setCompletedCodes([...completedCodes, item.codes[0]]);
    }
  };

  const handleToggleCoreCode = (courseCode: string) => {
    const norm = Course.normalizeCode(courseCode);
    const equivalents = [norm, ...(EQUIVALENCE_MAP[norm] || [])];
    const isCompleted = equivalents.some((c) => isSatisfied(c));

    if (isCompleted) {
      setCompletedCodes(completedCodes.filter((c) => !equivalents.includes(c)));
      setSelectedElectives(selectedElectives.filter((c) => !equivalents.includes(c)));
    } else {
      setCompletedCodes([...completedCodes, norm]);
    }
  };

  // Total electives required across selected programs
  const totalElectivesRequired = activeProgramObjects.reduce(
    (acc, p) => acc + p.electivesRequired,
    0
  );

  // Required courses progress
  const totalRequiredCount = unifiedRequirements.length;
  const satisfiedRequiredCount = unifiedRequirements.filter((req) =>
    req.codes.some((c) => isSatisfied(c))
  ).length;

  // Find all courses checked off in required courses that also satisfy an elective rule for at least one active program
  const completedCoreElectives = completedCodes.filter((code) => {
    const norm = Course.normalizeCode(code);
    const course = ALL_COURSES[norm];
    const relevance = getCourseRelevance(norm, course);
    return relevance.electiveIn.length > 0;
  });

  // Only electives that qualify for at least one active selected program count toward progress
  const validSelectedElectives = selectedElectives.filter((code) => {
    const relevance = getCourseRelevance(code);
    return relevance.electiveIn.length > 0;
  });

  // All completed electives: approved user electives + required courses that double-dip as electives for another program
  const allCompletedElectivesList = Array.from(
    new Set([...validSelectedElectives, ...completedCoreElectives])
  );

  const elecCount = allCompletedElectivesList.length;
  const countedElectives = Math.min(elecCount, totalElectivesRequired);

  const totalItems = totalRequiredCount + totalElectivesRequired;
  const completedItems = satisfiedRequiredCount + countedElectives;
  const overallPct = totalItems > 0 ? completedItems / totalItems : 0;

  // Track double dipping courses among completed courses & electives
  const doubleDippingCourses: string[] = [];
  for (const code of [...completedCodes, ...validSelectedElectives]) {
    const relevance = getCourseRelevance(code);
    if (relevance.isDoubleDip && !doubleDippingCourses.includes(code)) {
      doubleDippingCourses.push(code);
    }
  }

  // Smart Elective Validation logic with double-dipping support
  const handleAddElective = (codeToAdd?: string) => {
    const raw = (codeToAdd || electiveInput).trim();
    if (!raw) return;

    const normalized = Course.normalizeCode(raw);
    setElectiveFeedback(null);

    // 1. Already in selected electives?
    if (selectedElectives.includes(normalized)) {
      setElectiveFeedback({
        type: 'error',
        message: `${normalized} has already been added to your electives.`,
      });
      return;
    }

    const courseObj = ALL_COURSES[normalized];
    const relevance = getCourseRelevance(normalized, courseObj);

    // 2. Check if it is a core course for ALL active programs without any elective flexibility
    if (
      relevance.requiredIn.length === activeProgramObjects.length &&
      relevance.electiveIn.length === 0
    ) {
      setElectiveFeedback({
        type: 'error',
        message: `${normalized} is a required core course for your active program(s). Check it off under Required Courses.`,
      });
      return;
    }

    // 3. If it's already satisfied in required courses and double-dips as an elective:
    const isCompletedInCore = completedCodes.some((c) => {
      const n = Course.normalizeCode(c);
      return n === normalized || (EQUIVALENCE_MAP[normalized] || []).includes(n);
    });
    if (isCompletedInCore && relevance.electiveIn.length > 0) {
      setElectiveFeedback({
        type: 'success',
        message: `${normalized} is already completed via your Required Courses and counts toward ${relevance.electiveLabel} electives (Double-Dip)!`,
      });
      return;
    }

    // 4. Qualification check: MUST be an approved elective for at least one active selected program!
    if (relevance.electiveIn.length === 0) {
      setElectiveFeedback({
        type: 'error',
        message: `${normalized} is not an approved elective for ${selectedPrograms.join(
          ' / '
        )}. It will not count toward your degree progress.`,
      });
      return;
    }

    const credits = courseObj ? courseObj.credits : 3;

    // Prerequisite checks
    if (courseObj && !courseObj.canTake(completedSet)) {
      const missing = courseObj.getMissingPrereqs(completedSet);
      setSelectedElectives([...selectedElectives, normalized]);
      setElectiveInput('');
      setElectiveFeedback({
        type: 'warning',
        message: `Added ${normalized} (${credits} hrs). Warning: Missing course prerequisites: ${missing.join(
          ', '
        )}.`,
      });
      return;
    }

    setSelectedElectives([...selectedElectives, normalized]);
    setElectiveInput('');
    setElectiveFeedback({
      type: 'success',
      message: `Added ${normalized} (${credits} hrs). Course prereqs met • Counts toward ${relevance.electiveLabel} Elective!${
        relevance.isDoubleDip ? ' (Counts toward multiple programs)' : ''
      }`,
    });
  };

  const handleRemoveElective = (code: string) => {
    setSelectedElectives(selectedElectives.filter((c) => c !== code));
    setElectiveFeedback(null);
  };

  // Helper: checks if an elective course is complete (either explicitly added or completed in required courses)
  const isCourseCompleteElective = (code: string) => {
    const norm = Course.normalizeCode(code);
    return (
      validSelectedElectives.includes(norm) ||
      (isSatisfied(norm) && getCourseRelevance(norm).electiveIn.length > 0)
    );
  };

  // Active electives pool: courses that are approved electives for at least one active selected program
  const activeElectivesPool: Course[] = Object.values(ALL_COURSES)
    .filter((c) => activeProgramObjects.some((p) => isEligibleElectiveForProgram(c, p)))
    .sort((a, b) => a.code.localeCompare(b.code));

  // Required Courses classification breakdown
  const completeRequired = unifiedRequirements.filter((req) =>
    req.codes.some((c) => isSatisfied(c))
  );
  const unlockedRequired = unifiedRequirements.filter(
    (req) =>
      !req.codes.some((c) => isSatisfied(c)) &&
      req.prereqs.every((p) => isSatisfied(p))
  );
  const lockedRequired = unifiedRequirements.filter(
    (req) =>
      !req.codes.some((c) => isSatisfied(c)) &&
      !req.prereqs.every((p) => isSatisfied(p))
  );

  const displayedRequired =
    requiredClassificationFilter === 'complete'
      ? completeRequired
      : requiredClassificationFilter === 'unlocked'
      ? unlockedRequired
      : requiredClassificationFilter === 'locked'
      ? lockedRequired
      : unifiedRequirements;

  // Electives classification breakdown: accounts for required courses that fulfill electives
  const completeElectives = activeElectivesPool.filter((c) =>
    isCourseCompleteElective(c.code)
  );
  const unlockedElectives = activeElectivesPool.filter(
    (c) => !isCourseCompleteElective(c.code) && c.canTake(completedSet)
  );
  const lockedElectives = activeElectivesPool.filter(
    (c) => !isCourseCompleteElective(c.code) && !c.canTake(completedSet)
  );

  const displayedElectivesPool =
    electiveClassificationFilter === 'complete'
      ? completeElectives
      : electiveClassificationFilter === 'unlocked'
      ? unlockedElectives
      : electiveClassificationFilter === 'locked'
      ? lockedElectives
      : activeElectivesPool;

  const filteredElectives = displayedElectivesPool.filter((c) => {
    if (catalogDept !== 'ALL') {
      if (catalogDept === 'BUSINESS') {
        if (!['FINA', 'MARK', 'MGMT', 'MIST', 'RMIN'].includes(c.department)) return false;
      } else if (c.department !== catalogDept) {
        return false;
      }
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-black font-body">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Top Header & Auth Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DEDEDE] text-xs">
          <div className="font-semibold text-black tracking-wide">
            UGA Computing Programs
          </div>

          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className="text-emerald-700 font-medium font-mono-tabular">
                {saveStatus}
              </span>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[#666666] flex items-center gap-1 font-mono-tabular">
                  <User className="w-3.5 h-3.5 text-[#BA0C2F]" />
                  {user.email}
                </span>
                <button
                  onClick={handleSaveToDatabase}
                  className="px-2.5 py-1 bg-[#BA0C2F] text-white hover:bg-[#990A26] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span>Save Progress</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-[#666666] hover:text-black cursor-pointer text-xs ml-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1 bg-[#BA0C2F] text-white hover:bg-[#990A26] rounded text-xs font-semibold cursor-pointer"
              >
                Sign In / Register to Save
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-bold tracking-tight text-black border-b-[3px] border-[#BA0C2F] pb-1.5 mb-2">
          UGA Computing Course Plan Visualizer
        </h1>
        <p className="text-xs text-[#666666] mb-5">
          Select your degree program(s), track core & elective requirements, and explore unlocked courses with double-dipping support.
        </p>

        {/* Program Selector */}
        <div className="mb-5 bg-[#F2F2F2] p-3.5 rounded border border-[#DEDEDE]">
          <label className="block font-display text-xs font-bold text-black mb-2">
            Select Programs (Multi-Select to combine Majors & Minors):
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(ALL_PROGRAMS).map((progName) => {
              const isSelected = selectedPrograms.includes(progName);
              return (
                <button
                  key={progName}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (selectedPrograms.length > 1) {
                        setSelectedPrograms(selectedPrograms.filter((p) => p !== progName));
                      }
                    } else {
                      setSelectedPrograms([...selectedPrograms, progName]);
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#BA0C2F] text-white border-[#BA0C2F]'
                      : 'bg-white text-black border-[#DEDEDE] hover:border-neutral-400'
                  }`}
                >
                  {progName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two Columns: Required Courses (Checklist) & Electives (Smart Input) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Column 1: Required Courses Quick Check */}
          <div className="bg-white border border-[#DEDEDE] p-3.5 rounded">
            <div className="flex items-center justify-between mb-2">
              <label className="font-display font-semibold text-xs text-black">
                Required Courses Checkoff
              </label>
              <span className="text-xs text-[#666666] font-mono-tabular">
                {satisfiedRequiredCount} / {totalRequiredCount} Complete
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto border border-[#DEDEDE] rounded p-2 bg-white space-y-1 text-xs">
              {unifiedRequirements.map((req) => {
                const isChecked = req.codes.some((c) => isSatisfied(c));
                const relevance = getCourseRelevance(req.codes[0]);

                return (
                  <label
                    key={req.id}
                    className="flex items-center justify-between p-1 rounded hover:bg-neutral-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRequirement(req)}
                        className="rounded border-[#DEDEDE] text-[#BA0C2F] focus:ring-[#BA0C2F]"
                      />
                      <span className="font-mono-tabular font-semibold text-black">
                        {req.displayName}
                      </span>
                      <span className="text-[#666666] truncate text-[11px]">
                        - {req.name}
                      </span>
                    </div>

                    {relevance.isDoubleDip && (
                      <span className="shrink-0 text-[10px] bg-neutral-100 text-[#BA0C2F] font-semibold px-1.5 py-0.5 rounded border border-[#DEDEDE]">
                        Double-Dip
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Column 2: Electives Smart Text Input */}
          <div className="bg-white border border-[#DEDEDE] p-3.5 rounded flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-display font-semibold text-xs text-black">
                  Electives Completed (including Double-Dips)
                </label>
                <span className="text-xs text-[#666666] font-mono-tabular">
                  {allCompletedElectivesList.length} / {totalElectivesRequired} Complete
                </span>
              </div>

              {/* Text Input */}
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={electiveInput}
                  onChange={(e) => setElectiveInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddElective();
                    }
                  }}
                  placeholder="Enter elective code (e.g. MATH 4600, CSCI 4300, STAT 4510)..."
                  className="flex-1 text-xs px-2.5 py-1.5 border border-[#DEDEDE] rounded bg-white text-black font-mono-tabular focus:border-[#BA0C2F] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddElective()}
                  className="px-3 py-1.5 bg-[#BA0C2F] hover:bg-[#990A26] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Feedback Alert */}
              {electiveFeedback && (
                <div
                  className={`text-xs p-1.5 rounded mb-2 border-l-4 ${
                    electiveFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                      : electiveFeedback.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 border-amber-500'
                      : 'bg-red-50 text-[#BA0C2F] border-[#BA0C2F]'
                  }`}
                >
                  {electiveFeedback.message}
                </div>
              )}

              {/* Added Electives Tags */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {allCompletedElectivesList.length === 0 ? (
                  <span className="text-[11px] text-[#666666] italic">
                    No electives completed yet. Check off required courses that double-dip or add electives below.
                  </span>
                ) : (
                  allCompletedElectivesList.map((code) => {
                    const c = ALL_COURSES[code];
                    const isFromCore =
                      completedCoreElectives.includes(code) && !selectedElectives.includes(code);

                    return (
                      <span
                        key={code}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono-tabular ${
                          isFromCore
                            ? 'bg-neutral-800 text-white'
                            : 'bg-[#BA0C2F] text-white'
                        }`}
                      >
                        <span>{code}</span>
                        <span className="text-[10px] text-white/80">
                          ({c ? `${c.credits} cr` : '3 cr'})
                        </span>
                        {isFromCore ? (
                          <span className="text-[9px] bg-white/20 px-1 rounded">
                            Core Double-Dip
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveElective(code)}
                            className="hover:text-black cursor-pointer ml-0.5"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Clickable Link to Electives Tab */}
            <div className="mt-2 pt-2 border-t border-[#DEDEDE] text-[11px] text-[#666666]">
              Tip: Switch to the{' '}
              <button
                type="button"
                onClick={() => setActiveTab('electives')}
                className="text-[#BA0C2F] font-semibold underline cursor-pointer"
              >
                Electives tab
              </button>{' '}
              to explore courses classified as Complete, Unlocked, and Locked.
            </div>
          </div>
        </div>

        {/* Degree Progress Bar Section */}
        <div className="mb-6 p-3.5 bg-[#F9F9F9] border border-[#DEDEDE] rounded">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="font-display text-sm font-bold text-black">
              Degree Progress
            </h2>
            <span className="text-xs font-bold font-mono-tabular text-black">
              {completedItems}/{totalItems} requirements satisfied ({(overallPct * 100).toFixed(1)}%)
            </span>
          </div>

          <div className="w-full bg-[#DEDEDE] h-3 rounded-full overflow-hidden mb-2">
            <div
              className="bg-[#E4002B] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, overallPct * 100)}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#666666]">
            <div>
              Required courses: <strong>{satisfiedRequiredCount}/{totalRequiredCount}</strong> | Electives:{' '}
              <strong>{countedElectives}/{totalElectivesRequired}</strong>
            </div>

            {doubleDippingCourses.length > 0 && (
              <div className="text-[#BA0C2F] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#BA0C2F]" />
                <span>{doubleDippingCourses.length} double-dipping course{doubleDippingCourses.length > 1 ? 's' : ''} applied</span>
              </div>
            )}
          </div>
        </div>

        {/* 2 MAIN TABS: Strictly Required Courses & Electives */}
        <div className="flex border-b border-[#DEDEDE] mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('required')}
            className={`font-display text-xs py-2 px-4 transition-colors cursor-pointer border-b-2 font-bold ${
              activeTab === 'required'
                ? 'text-[#BA0C2F] border-[#BA0C2F]'
                : 'text-[#666666] border-transparent hover:text-black'
            }`}
          >
            Required Courses ({satisfiedRequiredCount}/{totalRequiredCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('electives')}
            className={`font-display text-xs py-2 px-4 transition-colors cursor-pointer border-b-2 font-bold ${
              activeTab === 'electives'
                ? 'text-[#BA0C2F] border-[#BA0C2F]'
                : 'text-[#666666] border-transparent hover:text-black'
            }`}
          >
            Electives ({countedElectives}/{totalElectivesRequired})
          </button>
        </div>

        {/* TAB 1: REQUIRED COURSES (Complete, Unlocked, Locked) */}
        {activeTab === 'required' && (
          <div className="space-y-4 text-xs">
            {/* 3 Classification Toggle Filter */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#DEDEDE]">
              <span className="text-[#666666] font-semibold text-[11px]">Filter by Status:</span>
              {[
                { id: 'all', label: `All (${unifiedRequirements.length})` },
                { id: 'complete', label: `Complete (${completeRequired.length})`, color: 'text-emerald-700' },
                { id: 'unlocked', label: `Unlocked (${unlockedRequired.length})`, color: 'text-blue-700' },
                { id: 'locked', label: `Locked (${lockedRequired.length})`, color: 'text-[#BA0C2F]' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setRequiredClassificationFilter(pill.id as any)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                    requiredClassificationFilter === pill.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-[#DEDEDE] hover:border-neutral-400'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* List of Required Courses */}
            {displayedRequired.length === 0 ? (
              <div className="p-4 bg-neutral-50 border border-[#DEDEDE] rounded text-center text-[#666666]">
                No required courses match the selected classification.
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayedRequired.map((req) => {
                  const isComplete = req.codes.some((c) => isSatisfied(c));
                  const ready = req.prereqs.every((p) => isSatisfied(p));
                  const missing = req.prereqs.filter((p) => !isSatisfied(p));
                  const relevance = getCourseRelevance(req.codes[0]);

                  return (
                    <div
                      key={req.id}
                      className={`p-3 border rounded transition-colors ${
                        isComplete
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : ready
                          ? 'border-blue-200 bg-white'
                          : 'border-[#DEDEDE] bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono-tabular font-bold text-sm text-black">
                              {req.displayName}
                            </span>
                            <span className="font-semibold text-black">
                              {req.name}
                            </span>
                            <span className="text-[#666666] font-mono-tabular text-[11px]">
                              ({req.credits} hrs)
                            </span>

                            {/* Double dipping badge */}
                            {relevance.isDoubleDip && (
                              <span className="text-[10px] bg-red-50 text-[#BA0C2F] font-semibold px-2 py-0.5 rounded border border-red-200">
                                Double-Dip: {relevance.programLabel}
                              </span>
                            )}
                          </div>

                          <div className="text-[#666666] text-xs mb-1.5">
                            {req.description}
                          </div>

                          <div className="text-[11px]">
                            {req.prereqs.length > 0 ? (
                              <span className="text-[#666666]">
                                Prerequisites: {req.prereqs.join(', ')}
                              </span>
                            ) : (
                              <span className="text-[#666666]">No prerequisites</span>
                            )}

                            {/* Classification Specific Indicators */}
                            {!isComplete && !ready && missing.length > 0 && (
                              <span className="text-[#BA0C2F] font-semibold ml-2">
                                — Locked (Missing: {missing.join(', ')})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Action / Badge */}
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {isComplete ? (
                            <button
                              type="button"
                              onClick={() => handleToggleRequirement(req)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          ) : ready ? (
                            <button
                              type="button"
                              onClick={() => handleToggleRequirement(req)}
                              className="px-2.5 py-1 bg-[#BA0C2F] hover:bg-[#990A26] text-white rounded font-semibold text-xs cursor-pointer"
                            >
                              Mark Complete
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 bg-neutral-100 text-[#666666] rounded font-semibold text-[11px] border border-[#DEDEDE] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-neutral-400" />
                              <span>Locked</span>
                            </span>
                          )}

                          {/* Explicit Program Satisfaction Label */}
                          {!isComplete && ready && (
                            <span className="text-[10px] text-emerald-700 font-semibold text-right">
                              Course prereqs met • Required for {req.requiredByPrograms.join(' & ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ELECTIVES (Complete, Unlocked, Locked) */}
        {activeTab === 'electives' && (
          <div className="space-y-4 text-xs">
            {/* 3 Classification Toggle Filter + Search & Department Controls */}
            <div className="space-y-2.5 p-3 bg-[#F2F2F2] rounded border border-[#DEDEDE]">
              {/* Classification filter pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#666666] font-semibold text-[11px]">Classification:</span>
                {[
                  { id: 'all', label: `All Electives (${activeElectivesPool.length})` },
                  { id: 'complete', label: `Complete (${completeElectives.length})` },
                  { id: 'unlocked', label: `Unlocked (${unlockedElectives.length})` },
                  { id: 'locked', label: `Locked (${lockedElectives.length})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setElectiveClassificationFilter(pill.id as any)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                      electiveClassificationFilter === pill.id
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-neutral-700 border-[#DEDEDE] hover:border-neutral-400'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Department & Search row */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DEDEDE]">
                <div className="relative flex-1 min-w-[180px]">
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search code, title, or topic (e.g. MATH 4600, AI, graphics)..."
                    className="w-full pl-7 pr-2.5 py-1 border border-[#DEDEDE] rounded bg-white text-black text-xs"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2" />
                </div>

                <div>
                  <select
                    value={catalogDept}
                    onChange={(e) => setCatalogDept(e.target.value)}
                    className="px-2 py-1 border border-[#DEDEDE] rounded bg-white text-black text-xs"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="CSCI">CSCI (Computer Science)</option>
                    <option value="MATH">MATH (Mathematics)</option>
                    <option value="STAT">STAT (Statistics)</option>
                    <option value="ARTI">ARTI (Artificial Intelligence)</option>
                    <option value="PHIL">PHIL (Philosophy / Logic)</option>
                    <option value="PSYC">PSYC (Cognitive Psychology)</option>
                    <option value="LING">LING (Linguistics)</option>
                    <option value="BUSINESS">Business & Analytics (FINA/MARK/MGMT/MIST/RMIN)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Electives Grid */}
            {filteredElectives.length === 0 ? (
              <div className="p-4 bg-neutral-50 border border-[#DEDEDE] rounded text-center text-[#666666]">
                No electives found matching current filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredElectives.map((course) => {
                  const isExplicitElective = selectedElectives.includes(course.code);
                  const isCompletedViaCore = isSatisfied(course.code) && !isExplicitElective;
                  const isComplete = isExplicitElective || isCompletedViaCore;
                  const ready = !isComplete && course.canTake(completedSet);
                  const missing = course.getMissingPrereqs(completedSet);
                  const relevance = getCourseRelevance(course.code, course);

                  return (
                    <div
                      key={course.code}
                      className={`p-2.5 border rounded flex flex-col justify-between ${
                        isComplete
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : ready
                          ? 'border-[#DEDEDE] bg-white'
                          : 'border-[#E5E5E5] bg-neutral-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-mono-tabular font-bold text-black text-xs">
                            {course.code}
                          </span>
                          <span className="text-[#666666] font-mono-tabular text-[11px]">
                            {course.credits} hrs
                          </span>
                        </div>

                        <div className="font-semibold text-black mb-1 text-xs">
                          {course.name}
                        </div>

                        <div className="text-[#666666] text-[11px] line-clamp-2 mb-1.5">
                          {course.description}
                        </div>

                        {/* Double Dipping Badge */}
                        {relevance.isDoubleDip && (
                          <div className="mb-1.5">
                            <span className="text-[10px] bg-red-50 text-[#BA0C2F] font-semibold px-1.5 py-0.5 rounded border border-red-200">
                              Double-Dip: {relevance.programLabel}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-[#DEDEDE] flex items-center justify-between text-[11px] gap-2">
                        <div className="truncate">
                          {isComplete ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">
                                {isCompletedViaCore
                                  ? 'Completed (Core Double-Dip)'
                                  : 'Completed / Added'}
                              </span>
                            </span>
                          ) : ready ? (
                            <span className="text-emerald-700 font-semibold truncate">
                              Course prereqs met • Counts toward {relevance.electiveLabel || 'Selected Programs'} Elective
                            </span>
                          ) : (
                            <span className="text-[#BA0C2F] truncate">
                              Locked (Missing: {missing.join(', ')})
                            </span>
                          )}
                        </div>

                        {isComplete ? (
                          isExplicitElective ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveElective(course.code)}
                              className="px-2 py-0.5 bg-neutral-200 hover:bg-neutral-300 text-black rounded font-semibold cursor-pointer shrink-0"
                            >
                              × Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleCoreCode(course.code)}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded font-semibold cursor-pointer shrink-0 text-[10px]"
                              title="Toggle completion in Required Courses"
                            >
                              Uncheck Core
                            </button>
                          )
                        ) : ready ? (
                          <button
                            type="button"
                            onClick={() => handleAddElective(course.code)}
                            className="px-2 py-0.5 bg-[#BA0C2F] hover:bg-[#990A26] text-white rounded font-semibold cursor-pointer shrink-0"
                          >
                            + Add
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#DEDEDE] text-center text-[11px] text-[#666666]">
          Student Project - Independent UGA Computing Course Visualizer. Not affiliated with or endorsed by the University of Georgia.
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentPlannerState={{
          programs: selectedPrograms,
          completed: completedCodes,
          electives: selectedElectives,
        }}
        onAuthSuccess={(loggedUser: AuthUser, planner?: PlannerData) => {
          setUser(loggedUser);
          if (planner) {
            if (planner.programs?.length) setSelectedPrograms(planner.programs);
            if (Array.isArray(planner.completed)) setCompletedCodes(planner.completed);
            if (Array.isArray(planner.electives)) setSelectedElectives(planner.electives);
          }
        }}
      />
    </div>
  );
}
