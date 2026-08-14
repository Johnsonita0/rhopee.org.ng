# Registration Status Management

This document explains how the registration blocking feature works and how to use it.

## Overview

The registration status control allows you to easily block access to the `/rhoppe_training` route when registration is closed. When registration is closed:
- Users trying to access `/rhoppe_training` are automatically redirected to the `RegistrationClosePage`
- The "Training" button in the navbar becomes disabled and shows "Closed"
- All registration functionality is blocked

## How It Works

### Components Involved

1. **`registrationStatus.js`** - Utility module that manages registration status
2. **`App.jsx`** - Main app component that enforces registration status on routes
3. **`Navbar.jsx`** - Navigation bar that reflects registration status
4. **`RegistrationClosePage.jsx`** - The page shown when registration is closed

### Route Flow

```
User clicks "Training" button
  ↓
/rhoppe_training route
  ↓
App.jsx checks isRegistrationOpen()
  ├─ If TRUE → Shows EventRegistrationPage
  └─ If FALSE → Shows RegistrationClosePage (redirects to /registration-closed)
```

## Configuration

### Method 1: Environment Variable (Recommended for Production)

Set the environment variable in your `.env.local` file:

```env
VITE_REGISTRATION_OPEN=false
```

**Values:**
- `true` (default) - Registration is open
- `false` - Registration is closed

This is the preferred method for production deployments and is controlled at build time.

### Method 2: localStorage Override (Runtime Control)

You can dynamically toggle registration status without rebuilding:

```javascript
import { setRegistrationStatus, clearRegistrationStatusOverride } from './lib/registrationStatus.js';

// Close registration immediately
setRegistrationStatus(false);

// Open registration immediately
setRegistrationStatus(true);

// Reset to environment variable setting
clearRegistrationStatusOverride();
```

This is useful for:
- Testing the closed state without rebuilding
- Dynamic admin controls
- Temporary registration closures

### Method 3: Check Current Status

```javascript
import { isRegistrationOpen, getRegistrationStatus } from './lib/registrationStatus.js';

// Check if registration is open
if (isRegistrationOpen()) {
  console.log('Registration is open');
} else {
  console.log('Registration is closed');
}

// Get detailed status
const status = getRegistrationStatus();
console.log(status);
// Output: { isOpen: false, status: 'closed', message: 'Registration has been closed' }
```

## Usage Examples

### Setting Up an Admin Panel to Toggle Registration

```jsx
import { setRegistrationStatus, isRegistrationOpen } from '../lib/registrationStatus.js';

function RegistrationToggle() {
  const [isOpen, setIsOpen] = useState(isRegistrationOpen());

  const handleToggle = () => {
    const newStatus = !isOpen;
    setRegistrationStatus(newStatus);
    setIsOpen(newStatus);
  };

  return (
    <div>
      <p>Registration Status: {isOpen ? 'Open' : 'Closed'}</p>
      <button onClick={handleToggle}>
        {isOpen ? 'Close Registration' : 'Open Registration'}
      </button>
    </div>
  );
}
```

### Programmatically Closing Registration

```javascript
// Close registration at a specific time
function closeRegistrationAtTime(targetTime) {
  const now = new Date();
  const msUntilClose = targetTime - now;
  
  if (msUntilClose > 0) {
    setTimeout(() => {
      setRegistrationStatus(false);
      console.log('Registration has been closed');
    }, msUntilClose);
  }
}

// Usage
const closingTime = new Date('2024-08-31T23:59:59');
closeRegistrationAtTime(closingTime);
```

## User Interface Changes

### When Registration is OPEN
- Navbar "Training" button is enabled and shows "Training" text
- Clicking it navigates to `/rhoppe_training`
- Shows `EventRegistrationPage` with registration form
- Button has normal styling

### When Registration is CLOSED
- Navbar "Training" button is disabled and shows "Closed" text
- Clicking it navigates to `/registration-closed`
- Shows `RegistrationClosePage` with closure message
- Button has reduced opacity and `cursor: not-allowed`
- Tooltip shows "Registration is closed"

## Real-Time Updates

The system listens for registration status changes. If you toggle the status in one browser tab:

```javascript
// In Tab 1
setRegistrationStatus(false);

// In Tab 2 - automatically updates
// The page will update in real-time
```

This works because:
1. `setRegistrationStatus()` dispatches a custom event: `rhopee:registration-status-changed`
2. App.jsx listens for this event
3. If user is currently on the registration page when it closes, they're redirected to the closed page

## Testing the Feature

### Quick Test in Browser Console

```javascript
// Open browser Developer Tools (F12)
// Go to Console tab
// Paste this to close registration:
localStorage.setItem('rhopee_registration_open', 'false');
location.reload();

// To reopen:
localStorage.setItem('rhopee_registration_open', 'true');
location.reload();
```

### Testing Redirect

1. Open the app
2. Go to `/rhoppe_training` - should show registration form
3. Run in console: `setRegistrationStatus(false)`
4. Refresh page or wait for automatic redirect
5. Should now show registration closed page

## Environment Setup

To use the environment variable method in production:

1. **In `.env.local` (development):**
   ```env
   VITE_REGISTRATION_OPEN=false
   ```

2. **In Vercel (production):**
   - Go to your Vercel project settings
   - Add Environment Variable: `VITE_REGISTRATION_OPEN = false`
   - Redeploy

3. **In other hosting:**
   - Set the environment variable before building
   - Rebuild and redeploy

## Files Modified

- **Created:** `src/lib/registrationStatus.js` - Registration status utility
- **Updated:** `src/App.jsx` - Added registration status checking
- **Updated:** `src/components/Navbar.jsx` - Updated to reflect registration status
- **Updated:** `src/css/components/Navbar.css` - Added disabled button styles

## Key Functions

### From `registrationStatus.js`

```javascript
isRegistrationOpen()              // Returns boolean
getRegistrationStatus()           // Returns { isOpen, status, message }
setRegistrationStatus(isOpen)     // Set status dynamically
clearRegistrationStatusOverride() // Clear localStorage override
```

## Troubleshooting

**Q: Registration status won't close**
- A: Check if environment variable is set correctly
- Make sure there's no `localStorage` override: `localStorage.removeItem('rhopee_registration_open')`

**Q: "Training" button still shows as enabled when it should be disabled**
- A: Refresh the page with `F5` or `Ctrl+R`
- Clear browser cache if issues persist

**Q: Dynamic status changes aren't working**
- A: Make sure you're using `setRegistrationStatus()` not direct localStorage manipulation
- The system dispatches events that notify all components

**Q: Environment variable not working**
- A: Make sure it's in `.env.local` not `.env.example`
- Restart the dev server after changing environment variables
- Check that value is exactly `true` or `false` (not `'true'` string with quotes in some contexts)

## Security Notes

- The localStorage override is primarily for testing and admin panels
- For production, rely on the environment variable
- Consider adding proper authentication before allowing admins to change status
- The registration status is checked on the frontend - ensure backend also validates this
