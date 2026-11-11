import { Course } from './Course';
import { ValidationResult } from '../types';

export interface ValidationContext {
  completedSet: Set<string>;
  allKnownCourses: Map<string, Course>;
  programRequiredCodes: Set<string>;
  alreadySelectedInOtherSlots: string[];
}

export interface IElectiveValidationRule {
  readonly description: string;
  validate(candidateCode: string, context: ValidationContext): ValidationResult;
  isEligibleCourse(course: Course): boolean;
}

/**
 * Strategy 1: Any course in a specified department at or above a given level.
 * Example: UGA CS accepts ANY CSCI 4000-level course (credits >= 3 or 4).
 */
export class AnyDepartmentLevelRule implements IElectiveValidationRule {
  public readonly description: string;

  constructor(
    public readonly department: string,
    public readonly minLevel: number = 4000,
    public readonly maxLevel: number = 4999,
    public readonly minCredits: number = 3,
    customDescription?: string
  ) {
    this.description =
      customDescription ||
      `Any ${department.toUpperCase()} course at level ${minLevel}–${maxLevel} (≥ ${minCredits} credit hours)`;
  }

  public isEligibleCourse(course: Course): boolean {
    return (
      course.department === this.department.toUpperCase() &&
      course.courseNumber >= this.minLevel &&
      course.courseNumber <= this.maxLevel &&
      course.credits >= this.minCredits
    );
  }

  public validate(candidateCode: string, context: ValidationContext): ValidationResult {
    const normalized = Course.normalizeCode(candidateCode);

    // 1. Check if course exists in catalog
    const course = context.allKnownCourses.get(normalized);
    if (!course) {
      // If student typed a recognized format e.g. "CSCI 4990" not yet in pre-loaded mock list,
      // parse it smartly if it follows the department and level rule!
      const match = normalized.match(/^([A-Z]{3,4})\s*(\d{4}[A-Z]?)/i);
      if (match) {
        const dept = match[1].toUpperCase();
        const num = parseInt(match[2].replace(/\D/g, ''), 10);
        if (dept === this.department.toUpperCase() && num >= this.minLevel && num <= this.maxLevel) {
          return {
            valid: true,
            code: normalized,
            title: `${normalized} (Upper-Level Elective)`,
            credits: 4,
            reason: `Qualifies as an approved ${this.department} ${this.minLevel}-level major elective.`,
          };
        }
      }

      return {
        valid: false,
        code: candidateCode,
        reason: `Course "${candidateCode}" is not recognized in the UGA registry. Please check the department and 4-digit number.`,
      };
    }

    // 2. Cannot be a required core course for this degree program
    if (context.programRequiredCodes.has(course.code)) {
      return {
        valid: false,
        code: course.code,
        title: course.name,
        credits: course.credits,
        alreadyUsedBy: 'Core Requirement',
        reason: `${course.code} is already a mandatory core course for this degree and cannot fulfill an elective requirement.`,
      };
    }

    // 3. Cannot duplicate an already selected elective
    if (context.alreadySelectedInOtherSlots.includes(course.code)) {
      return {
        valid: false,
        code: course.code,
        title: course.name,
        credits: course.credits,
        alreadyUsedBy: 'Another Elective Slot',
        reason: `${course.code} has already been assigned to another elective slot.`,
      };
    }

    // 4. Verify department and level
    if (!this.isEligibleCourse(course)) {
      if (course.department !== this.department.toUpperCase()) {
        return {
          valid: false,
          code: course.code,
          title: course.name,
          credits: course.credits,
          reason: `${course.code} is in department "${course.department}". This slot requires a "${this.department}" course.`,
        };
      }
      if (course.courseNumber < this.minLevel) {
        return {
          valid: false,
          code: course.code,
          title: course.name,
          credits: course.credits,
          reason: `${course.code} is a ${course.courseNumber}-level course. Must be at least ${this.minLevel}-level.`,
        };
      }
    }

    // 5. Check prerequisites
    const missing = course.getMissingPrereqs(context.completedSet);

    return {
      valid: true,
      code: course.code,
      title: course.name,
      credits: course.credits,
      missingPrereqs: missing,
      reason:
        missing.length > 0
          ? `Qualifies for elective credit, but has pending prerequisite(s): ${missing.join(', ')}.`
          : `Valid elective. All prerequisites satisfied.`,
    };
  }
}

/**
 * Strategy 2: Explicit approved catalog list.
 * Example: Data Science program requires electives from a specific approved interdisciplinary list.
 */
export class ExplicitCatalogRule implements IElectiveValidationRule {
  public readonly description: string;
  private readonly approvedCodeSet: Set<string>;

  constructor(
    approvedCourses: string[],
    customDescription?: string
  ) {
    this.approvedCodeSet = new Set(approvedCourses.map((c) => Course.normalizeCode(c)));
    this.description =
      customDescription ||
      `Must be chosen from the ${this.approvedCodeSet.size} approved curriculum electives`;
  }

  public isEligibleCourse(course: Course): boolean {
    return this.approvedCodeSet.has(course.code) || course.aliases.some((a) => this.approvedCodeSet.has(a));
  }

  public validate(candidateCode: string, context: ValidationContext): ValidationResult {
    const normalized = Course.normalizeCode(candidateCode);

    const course = context.allKnownCourses.get(normalized);
    if (!course) {
      return {
        valid: false,
        code: candidateCode,
        reason: `Course "${candidateCode}" is not found in the approved elective list for this program.`,
      };
    }

    // Check if on approved list
    const isApproved =
      this.approvedCodeSet.has(course.code) ||
      course.aliases.some((a) => this.approvedCodeSet.has(a));

    if (!isApproved) {
      return {
        valid: false,
        code: course.code,
        title: course.name,
        credits: course.credits,
        reason: `${course.code} is not on the official approved elective list for this program.`,
      };
    }

    // Check duplication with core
    if (context.programRequiredCodes.has(course.code)) {
      return {
        valid: false,
        code: course.code,
        title: course.name,
        credits: course.credits,
        alreadyUsedBy: 'Core Requirement',
        reason: `${course.code} is already a required core course and cannot be counted as an elective.`,
      };
    }

    // Check duplication with other elective slot
    if (context.alreadySelectedInOtherSlots.includes(course.code)) {
      return {
        valid: false,
        code: course.code,
        title: course.name,
        credits: course.credits,
        alreadyUsedBy: 'Another Elective Slot',
        reason: `${course.code} is already assigned to another elective slot.`,
      };
    }

    // Check prerequisites
    const missing = course.getMissingPrereqs(context.completedSet);

    return {
      valid: true,
      code: course.code,
      title: course.name,
      credits: course.credits,
      missingPrereqs: missing,
      reason:
        missing.length > 0
          ? `Approved elective, but prerequisites are missing: ${missing.join(', ')}.`
          : `Approved elective. All prerequisites satisfied.`,
    };
  }
}

/**
 * Strategy 3: Composite OR Rule.
 * Satisfied if EITHER rule matches.
 * E.g., either in specific catalog list OR any 4000-level CSCI course.
 */
export class CompositeOrRule implements IElectiveValidationRule {
  public readonly description: string;

  constructor(
    public readonly rules: IElectiveValidationRule[],
    customDescription?: string
  ) {
    this.description = customDescription || rules.map((r) => r.description).join(' OR ');
  }

  public isEligibleCourse(course: Course): boolean {
    return this.rules.some((rule) => rule.isEligibleCourse(course));
  }

  public validate(candidateCode: string, context: ValidationContext): ValidationResult {
    let lastFailure: ValidationResult | null = null;

    for (const rule of this.rules) {
      const result = rule.validate(candidateCode, context);
      if (result.valid) {
        return result;
      }
      lastFailure = result;
    }

    return (
      lastFailure || {
        valid: false,
        code: candidateCode,
        reason: `Course "${candidateCode}" does not fulfill any approved elective criterion.`,
      }
    );
  }
}
