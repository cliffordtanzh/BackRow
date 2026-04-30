# Project TODOs

## Frontend

- [ ] Fix hasError logic in StatsPage and ManagementPage to handle null values correctly.
- [ ] Add a value prop to FieldInput for YouTube URL to avoid uncontrolled input.
- [ ] Refactor onRecordEvent to avoid race conditions with state updates.
- [ ] Add unique key props when mapping error messages.
- [ ] Add error handling for failed YouTube API requests.
- [ ] Ensure chooseProps returns consistent shapes/types for all headers.
- [ ] Make checkAuthorised update state reactively (not just check once).
- [ ] Initialize jwtToken state from localStorage to persist auth state across reloads.
- [ ] Use real IDs in roles array instead of hardcoded zeros.
- [ ] Add missing dependency arrays in useEffect hooks for players/teams.
- [ ] Add a global error boundary for catching unexpected errors.
- [ ] Add fallback UI for failed API requests.
- [ ] Add loading indicators for async data fetching.
- [ ] Add validation for user input fields (e.g., email, password).

## Backend

- [ ] Add input validation for all user-supplied data.
- [ ] Filter out sensitive fields (like passwordHash) in /player endpoint responses.
- [ ] In /team_results, check for empty history before accessing history[-1].
- [ ] Add rate limiting or brute-force protection on login endpoint.
- [ ] Ensure JWT secret is loaded and not None.
- [ ] Add CSRF protection for state-changing endpoints.
- [ ] Add logging for failed login attempts or suspicious activity.
- [ ] Check for expired JWTs on protected endpoints.
- [ ] Add role-based access control on protected endpoints.
- [ ] Ensure all exceptions are handled gracefully in database operations.
