/**
 * Registration Status Utility
 * Checks if registration is currently open or closed
 */

/**
 * Check if registration is currently open
 * Uses environment variable: VITE_REGISTRATION_OPEN (default: true)
 * Can also be controlled via localStorage for dynamic updates
 * @returns {boolean} true if registration is open, false if closed
 */
export function isRegistrationOpen() {
  // Check localStorage first (allows dynamic updates without rebuild)
  if (typeof window !== 'undefined') {
    const storageOverride = window.localStorage.getItem('rhopee_registration_open');
    if (storageOverride !== null) {
      return storageOverride === 'true';
    }
  }

  // Fall back to environment variable
  const envValue = import.meta.env.VITE_REGISTRATION_OPEN ?? 'true';
  return envValue === 'true' || envValue === true;
}

/**
 * Get current registration status
 * @returns {Object} Object with status and message
 */
export function getRegistrationStatus() {
  const isOpen = isRegistrationOpen();
  return {
    isOpen,
    status: isOpen ? 'open' : 'closed',
    message: isOpen 
      ? 'Registration is currently open' 
      : 'Registration has been closed',
  };
}

/**
 * Set registration status in localStorage (for testing/admin override)
 * @param {boolean} isOpen - true to open registration, false to close it
 */
export function setRegistrationStatus(isOpen) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('rhopee_registration_open', String(isOpen));
    // Notify other tabs/windows
    window.dispatchEvent(new CustomEvent('rhopee:registration-status-changed', { 
      detail: { isOpen } 
    }));
  }
}

/**
 * Clear registration status override (use environment variable)
 */
export function clearRegistrationStatusOverride() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('rhopee_registration_open');
    window.dispatchEvent(new CustomEvent('rhopee:registration-status-changed', { 
      detail: { isOpen: import.meta.env.VITE_REGISTRATION_OPEN !== 'false' } 
    }));
  }
}
