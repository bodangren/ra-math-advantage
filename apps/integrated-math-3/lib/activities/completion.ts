export class PhaseActivityTracker {
  private completions: Map<string, Set<string>> = new Map();

  markActivityComplete(studentId: string, activityId: string): void {
    if (!this.completions.has(studentId)) {
      this.completions.set(studentId, new Set());
    }
    this.completions.get(studentId)!.add(activityId);
  }

  isActivityComplete(studentId: string, activityId: string): boolean {
    const studentCompletions = this.completions.get(studentId);
    return studentCompletions?.has(activityId) ?? false;
  }

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

  getCompletedActivities(studentId: string): string[] {
    const studentCompletions = this.completions.get(studentId);
    return studentCompletions ? Array.from(studentCompletions) : [];
  }

  clearStudent(studentId: string): void {
    this.completions.delete(studentId);
  }
}
