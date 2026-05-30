/**
 * Tracks phase activity completion for student sessions.
 */
export class PhaseActivityTracker {
  private completions: Map<string, Set<string>> = new Map();

  /**
   * Marks an activity as complete for a student.
   * @param studentId - The student's unique identifier
   * @param activityId - The activity's unique identifier
   */
  markActivityComplete(studentId: string, activityId: string): void {
    if (!this.completions.has(studentId)) {
      this.completions.set(studentId, new Set());
    }
    this.completions.get(studentId)!.add(activityId);
  }

  /**
   * Checks if an activity is complete for a student.
   * @param studentId - The student's unique identifier
   * @param activityId - The activity's unique identifier
   * @returns True if the activity is complete
   */
  isActivityComplete(studentId: string, activityId: string): boolean {
    const studentCompletions = this.completions.get(studentId);
    return studentCompletions?.has(activityId) ?? false;
  }

  /**
   * Checks if all activities are complete for a student.
   * @param studentId - The student's unique identifier
   * @param requiredActivityIds - Array of activity IDs that must be complete
   * @returns True if all activities are complete
   */
  areAllActivitiesComplete(studentId: string, requiredActivityIds: string[]): boolean {
    if (requiredActivityIds.length === 0) {
      return true;
    }

    const studentCompletions = this.completions.get(studentId);
    if (!studentCompletions) {
      return false;
    }

    return requiredActivityIds.every((activityId) => studentCompletions.has(activityId));
  }

  /**
   * Gets all completed activity IDs for a student.
   * @param studentId - The student's unique identifier
   * @returns Array of completed activity IDs
   */
  getCompletedActivities(studentId: string): string[] {
    const studentCompletions = this.completions.get(studentId);
    return studentCompletions ? Array.from(studentCompletions) : [];
  }

  /**
   * Clears all completion data for a student.
   * @param studentId - The student's unique identifier
   */
  clearStudent(studentId: string): void {
    this.completions.delete(studentId);
  }
}