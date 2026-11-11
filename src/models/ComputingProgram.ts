import { Course } from './Course';
import { IElectiveValidationRule, ValidationContext } from './ElectiveRule';
import { ValidationResult } from '../types';

export interface ComputingProgramConfig {
  name: string;
  shortName: string;
  degreeType: 'Major' | 'Minor' | 'Certificate';
  totalDegreeCredits: number;
  requiredCourses: Record<string, Course>;
  electiveRule: IElectiveValidationRule;
  electivesRequired: number;
  electiveMinCredits?: number;
  catalogCourses?: Record<string, Course>;
  description?: string;
}

export class ComputingProgram {
  public readonly name: string;
  public readonly shortName: string;
  public readonly degreeType: 'Major' | 'Minor' | 'Certificate';
  public readonly totalDegreeCredits: number;
  public readonly requiredCourses: Map<string, Course>;
  public readonly electiveRule: IElectiveValidationRule;
  public readonly electivesRequired: number;
  public readonly electiveMinCredits: number;
  public readonly catalogCourses: Map<string, Course>;
  public readonly description: string;

  constructor(config: ComputingProgramConfig) {
    this.name = config.name;
    this.shortName = config.shortName;
    this.degreeType = config.degreeType;
    this.totalDegreeCredits = config.totalDegreeCredits;
    this.requiredCourses = new Map(Object.entries(config.requiredCourses));
    this.electiveRule = config.electiveRule;
    this.electivesRequired = config.electivesRequired;
    this.electiveMinCredits = config.electiveMinCredits || 3;
    this.catalogCourses = new Map(Object.entries(config.catalogCourses || {}));
    this.description = config.description || '';
  }

  /**
   * Checks if a course code is among this program's required core courses.
   */
  public isCourseInCore(code: string): boolean {
    const normalized = Course.normalizeCode(code);
    for (const [key, course] of this.requiredCourses.entries()) {
      if (Course.normalizeCode(key) === normalized || course.matchesCode(code)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Validates a candidate elective code against this program's rules.
   */
  public validateElective(
    candidateCode: string,
    completedSet: Set<string>,
    alreadySelectedInOtherSlots: string[],
    allKnownCourses: Map<string, Course>
  ): ValidationResult {
    const requiredCodes = new Set(Array.from(this.requiredCourses.keys()).map((c) => Course.normalizeCode(c)));

    // Combine program catalog with global known courses
    const mergedKnown = new Map<string, Course>(allKnownCourses);
    for (const [code, course] of this.catalogCourses.entries()) {
      mergedKnown.set(Course.normalizeCode(code), course);
    }

    const context: ValidationContext = {
      completedSet,
      allKnownCourses: mergedKnown,
      programRequiredCodes: requiredCodes,
      alreadySelectedInOtherSlots: alreadySelectedInOtherSlots.map((c) => Course.normalizeCode(c)),
    };

    return this.electiveRule.validate(candidateCode, context);
  }

  /**
   * Gets list of required courses not yet completed.
   */
  public getRemainingRequired(completedSet: Set<string>): Map<string, Course> {
    const remaining = new Map<string, Course>();
    for (const [code, course] of this.requiredCourses.entries()) {
      if (!completedSet.has(course.code)) {
        remaining.set(code, course);
      }
    }
    return remaining;
  }

  /**
   * Gets list of remaining required courses whose prerequisites have been satisfied.
   */
  public getUnlockedRequired(completedSet: Set<string>): Map<string, Course> {
    const unlocked = new Map<string, Course>();
    const remaining = this.getRemainingRequired(completedSet);

    for (const [code, course] of remaining.entries()) {
      if (course.canTake(completedSet)) {
        unlocked.set(code, course);
      }
    }
    return unlocked;
  }

  /**
   * Returns all eligible electives from catalog that satisfy prerequisites and haven't been picked yet.
   */
  public getUnlockedElectives(
    completedSet: Set<string>,
    selectedElectives: string[],
    allKnownCourses: Map<string, Course>
  ): Course[] {
    const selectedSet = new Set(selectedElectives.map((c) => Course.normalizeCode(c)));
    const requiredCodes = new Set(Array.from(this.requiredCourses.keys()).map((c) => Course.normalizeCode(c)));
    const eligible: Course[] = [];

    // Combine program catalog and global catalog
    const mergedKnown = new Map<string, Course>(allKnownCourses);
    for (const [code, course] of this.catalogCourses.entries()) {
      mergedKnown.set(Course.normalizeCode(code), course);
    }

    for (const [, course] of mergedKnown.entries()) {
      if (
        !requiredCodes.has(course.code) &&
        !selectedSet.has(course.code) &&
        this.electiveRule.isEligibleCourse(course) &&
        course.canTake(completedSet)
      ) {
        eligible.push(course);
      }
    }

    return eligible;
  }
}
