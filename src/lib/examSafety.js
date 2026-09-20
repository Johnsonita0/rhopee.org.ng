export const MAX_MALPRACTICE_WARNINGS = 10;

export function shouldAutoSubmitMalpractice(warningCount) {
  return warningCount >= MAX_MALPRACTICE_WARNINGS;
}

export function getCameraStatus({ warningCount, hasWarning }) {
  if (hasWarning || warningCount >= MAX_MALPRACTICE_WARNINGS) {
    return 'warning';
  }

  return 'safe';
}
