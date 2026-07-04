'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Renders a native dialog modal with backdrop click-to-close and animated transitions.
 *
 * a11y note (wcag-aa-remediation_20260605 follow-up): This dialog uses the
 * native `<dialog>` element which provides implicit role="dialog" + focus
 * scoping in most browsers; we also add explicit role="dialog" + aria-modal
 * for screen readers that don't yet expose the native semantics. Full
 * JavaScript tab-cycling (trapping Tab on the last focusable and wrapping to
 * the first) is deferred to a follow-up — native `<dialog>.showModal()`
 * already limits Tab cycling in Chromium/Firefox, but Safari and some older
 * AT combos benefit from an explicit trap. Track as tech-debt.
 *
 * @param {DialogProps} props - Dialog configuration.
 * @returns {JSX.Element} A dialog element.
 */
export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onOpenChange(false);
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onOpenChange]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onOpenChange(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cn(
        'p-0 rounded-xl shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        'open:animate-in open:fade-in-0 open:zoom-in-95',
        'closed:animate-out closed:fade-out-0 closed:zoom-out-95'
      )}
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-xl w-full max-w-[calc(100vw-2rem)] sm:max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </dialog>
  );
}

export interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

/**
 * Renders an alert dialog with confirm/cancel buttons and optional destructive variant.
 *
 * @param {AlertDialogProps} props - Alert dialog configuration.
 * @returns {JSX.Element} A composed alert dialog.
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
