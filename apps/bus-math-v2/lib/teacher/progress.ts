const percentageFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/**
 * Clamps teacher progress percentage
 * @param value - Input value
 */
export function clampTeacherProgressPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

/**
 * Formats teacher progress percentage
 * @param value - Input value
 */
export function formatTeacherProgressPercentage(value: number) {
  return `${percentageFormatter.format(clampTeacherProgressPercentage(value))}%`;
}

/**
 * Formats teacher last active
 * @param value - Input value
 */
export function formatTeacherLastActive(value: string | null) {
  if (!value) {
    return 'No activity recorded';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'No activity recorded';
  }

  return dateTimeFormatter.format(parsed);
}

/**
 * Formats teacher last active date
 * @param value - Input value
 */
export function formatTeacherLastActiveDate(value: string | null) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().split('T')[0];
}
