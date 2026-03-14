import { useRef } from 'react';

import { hapticError } from '@/utils/haptic';

interface FormLike {
  Subscribe: React.ComponentType<{
    selector: (state: { submissionAttempts: number; canSubmit: boolean }) => {
      submissionAttempts: number;
      canSubmit: boolean;
    };
    children: (value: {
      submissionAttempts: number;
      canSubmit: boolean;
    }) => React.ReactNode;
  }>;
}

interface ValidationSnackbarSyncProps {
  form: FormLike;
  setSnackbarMessage: (msg: string) => void;
  setSnackbarOpen: (open: boolean) => void;
  t: (key: string) => string;
}

/**
 * Subscribes to form submission attempts. On invalid submit attempt,
 * triggers haptic error and shows snackbar with the given message key.
 * Renders nothing.
 */
export function ValidationSnackbarSync({
  form,
  setSnackbarMessage,
  setSnackbarOpen,
  t,
}: ValidationSnackbarSyncProps) {
  const prevAttemptsRef = useRef(0);

  return (
    <form.Subscribe
      selector={(s) => ({
        submissionAttempts: s.submissionAttempts,
        canSubmit: s.canSubmit,
      })}
    >
      {({ submissionAttempts, canSubmit }) => {
        if (submissionAttempts > prevAttemptsRef.current && !canSubmit) {
          prevAttemptsRef.current = submissionAttempts;
          hapticError();
          setSnackbarMessage(t('fixFormErrors'));
          setSnackbarOpen(true);
        } else {
          prevAttemptsRef.current = submissionAttempts;
        }
        return null;
      }}
    </form.Subscribe>
  );
}
