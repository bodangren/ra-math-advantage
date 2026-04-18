'use client';

import { useState } from 'react';
import { RefreshCw, Plus, ToggleLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, AlertDialog } from '@/components/ui/dialog';
import type { ObjectivePriority } from '@/lib/practice/objective-proficiency';

export interface ObjectiveIntervention {
  objectiveId: string;
  standardCode: string;
  description: string;
  currentPriority: ObjectivePriority;
}

export interface StudentIntervention {
  studentId: string;
  studentName: string;
  objectiveId: string;
  objectiveDescription: string;
}

export interface InterventionActionsProps {
  classId?: string;
  courseKey?: string;
  onUpdatePriority?: (objectiveId: string, priority: ObjectivePriority) => Promise<void>;
  onResetCards?: (studentId: string, objectiveId: string) => Promise<void>;
  onAddExtraCards?: (studentId: string, objectiveId: string) => Promise<void>;
}

export function InterventionActions({
  onUpdatePriority,
  onResetCards,
  onAddExtraCards,
}: InterventionActionsProps) {
  const [selectedObjective, setSelectedObjective] = useState<ObjectiveIntervention | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentIntervention | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExtraCardsDialog, setShowExtraCardsDialog] = useState(false);

  const handlePriorityToggle = async (objective: ObjectiveIntervention) => {
    if (!onUpdatePriority) return;

    const newPriority: ObjectivePriority =
      objective.currentPriority === 'essential' ? 'triaged' : 'essential';

    setIsLoading(true);
    setError(null);
    try {
      await onUpdatePriority(objective.objectiveId, newPriority);
      setSelectedObjective(null);
    } catch {
      setError('Failed to update priority. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCards = async () => {
    if (!onResetCards || !selectedStudent) return;

    setIsLoading(true);
    setError(null);
    try {
      await onResetCards(selectedStudent.studentId, selectedStudent.objectiveId);
      setShowResetDialog(false);
      setSelectedStudent(null);
    } catch {
      setError('Failed to reset cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExtraCards = async () => {
    if (!onAddExtraCards || !selectedStudent) return;

    setIsLoading(true);
    setError(null);
    try {
      await onAddExtraCards(selectedStudent.studentId, selectedStudent.objectiveId);
      setShowExtraCardsDialog(false);
      setSelectedStudent(null);
    } catch {
      setError('Failed to add extra cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-4">Intervention Actions</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="font-medium text-foreground">Priority Toggle</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Toggle an objective between Essential and Triaged priority to adjust SRS scheduling.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (selectedObjective) {
                handlePriorityToggle(selectedObjective);
              }
            }}
            disabled={!selectedObjective || isLoading}
            className="w-full"
          >
            {selectedObjective
              ? `${selectedObjective.currentPriority === 'essential' ? 'Triaged' : 'Essential'} Priority`
              : 'Select Objective'}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-600" aria-hidden="true" />
            <h3 className="font-medium text-foreground">Reset Cards</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Reset a student&apos;s cards for an objective back to &quot;new&quot; state.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            disabled={!selectedStudent}
            className="w-full"
          >
            Reset Student Cards
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" aria-hidden="true" />
            <h3 className="font-medium text-foreground">Add Extra Cards</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Assign additional new cards to a student for extra practice.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExtraCardsDialog(true)}
            disabled={!selectedStudent}
            className="w-full"
          >
            Add Extra Cards
          </Button>
        </div>
      </div>

      <AlertDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset Student Cards"
        description={`This will reset all cards for ${selectedStudent?.studentName} on objective ${selectedStudent?.objectiveDescription} back to new state. The student will need to re-practice these cards.`}
        confirmLabel="Reset Cards"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleResetCards}
      />

      <Dialog
        open={showExtraCardsDialog}
        onOpenChange={setShowExtraCardsDialog}
        title="Add Extra Cards"
        description={`This will add additional new cards for ${selectedStudent?.studentName} on ${selectedStudent?.objectiveDescription}.`}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The student will receive new practice cards for this objective on their next practice session.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowExtraCardsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExtraCards} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Cards'
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ObjectivePriorityBadge({ priority }: { priority: ObjectivePriority }) {
  const variants: Record<ObjectivePriority, string> = {
    essential: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    supporting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    extension: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    triaged: 'bg-muted text-muted-foreground',
  };

  return (
    <Badge variant="secondary" className={cn('text-xs', variants[priority])}>
      {priority}
    </Badge>
  );
}
