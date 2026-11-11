/**
 * Course domain model implementing core object-oriented principles.
 */

export const EQUIVALENCE_MAP: Record<string, string[]> = {
  'CSCI 2720': ['CSCI 2725'],
  'CSCI 2725': ['CSCI 2720'],
  'MATH 3000': ['MATH 3300'],
  'MATH 3300': ['MATH 3000'],
  'STAT 4520': ['STAT 4530'],
  'STAT 4530': ['STAT 4520'],
};

export class Course {
  public readonly code: string;
  public readonly name: string;
  public readonly credits: number;
  public readonly prereqs: string[];
  public readonly coreqs: string[];
  public readonly aliases: string[];
  public readonly department: string;
  public readonly courseNumber: number;
  public readonly description: string;
  public readonly typicallyOffered: string[];

  constructor(
    code: string,
    name: string,
    credits: number,
    options?: {
      prereqs?: string[];
      coreqs?: string[];
      aliases?: string[];
      description?: string;
      typicallyOffered?: string[];
    }
  ) {
    this.code = code.trim().toUpperCase();
    this.name = name;
    this.credits = credits;
    this.prereqs = (options?.prereqs || []).map((p) => p.trim().toUpperCase());
    this.coreqs = (options?.coreqs || []).map((c) => c.trim().toUpperCase());
    this.aliases = (options?.aliases || []).map((a) => a.trim().toUpperCase());
    this.description = options?.description || '';
    this.typicallyOffered = options?.typicallyOffered || ['Fall', 'Spring'];

    // Extract department and course number (e.g. "CSCI 1301" -> "CSCI", 1301)
    const match = this.code.match(/^([A-Z]{3,4})\s*(\d{4}[A-Z]?)/i);
    if (match) {
      this.department = match[1].toUpperCase();
      this.courseNumber = parseInt(match[2].replace(/\D/g, ''), 10) || 0;
    } else {
      this.department = '';
      this.courseNumber = 0;
    }
  }

  /**
   * Checks if target course or any of its interchangeable equivalents are completed.
   * e.g. CSCI 2720 and CSCI 2725 are interchangeable.
   */
  public static isSatisfied(targetCode: string, completedSet: Set<string>): boolean {
    const normalized = Course.normalizeCode(targetCode);
    if (completedSet.has(normalized)) return true;

    const equivalents = EQUIVALENCE_MAP[normalized] || [];
    return equivalents.some((eq) => completedSet.has(eq));
  }

  /**
   * Evaluates if this course can be taken given a set of completed course codes.
   */
  public canTake(completedSet: Set<string>): boolean {
    return this.prereqs.every((prereq) => Course.isSatisfied(prereq, completedSet));
  }

  /**
   * Returns list of missing prerequisites that are blocking this course.
   */
  public getMissingPrereqs(completedSet: Set<string>): string[] {
    return this.prereqs.filter((prereq) => !Course.isSatisfied(prereq, completedSet));
  }

  /**
   * Checks if user input matches this course code or any of its approved aliases.
   * Handles space insensitivity (e.g., "CSCI1301" matches "CSCI 1301").
   */
  public matchesCode(userInput: string): boolean {
    const cleanInput = Course.normalizeCode(userInput);
    const cleanPrimary = Course.normalizeCode(this.code);
    if (cleanInput === cleanPrimary) return true;

    return this.aliases.some((alias) => Course.normalizeCode(alias) === cleanInput);
  }

  /**
   * Normalizes course code by removing extra whitespace and capitalizing.
   * "csci 1301" -> "CSCI 1301", "csci1301" -> "CSCI 1301"
   */
  public static normalizeCode(input: string): string {
    const trimmed = input.trim().toUpperCase();
    const match = trimmed.match(/^([A-Z]{3,4})\s*(\d{4}[A-Z]?)$/i);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    return trimmed;
  }

  /**
   * Checks whether the course belongs to a specific department and level.
   * E.g. isDepartmentLevel("CSCI", 4000, 4999) checks if it's an upper-division 4000-level CSCI course.
   */
  public isDepartmentLevel(dept: string, minLevel: number, maxLevel: number = 9999): boolean {
    return (
      this.department === dept.toUpperCase() &&
      this.courseNumber >= minLevel &&
      this.courseNumber <= maxLevel
    );
  }

  /**
   * Returns formatted level string (e.g., "4000-level Upper Division")
   */
  public get levelCategory(): string {
    if (this.courseNumber >= 5000) return 'Graduate / Advanced';
    if (this.courseNumber >= 4000) return '4000-Level Major Elective';
    if (this.courseNumber >= 3000) return '3000-Level Upper Division';
    if (this.courseNumber >= 2000) return '2000-Level Foundation';
    return '1000-Level Introductory';
  }
}
