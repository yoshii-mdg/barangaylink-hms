You are a senior full-stack engineer.
Build this project using React (Vite or Next.js) for the frontend and Supabase as the backend/database.

Follow strict production-level standards and ensure all best practices from frontend development, backend logic, database design, security, performance optimization, and testing are applied.

FRONTEND DEVELOPMENT (React Standards)

### Architecture & Structure

* Use clean folder structure.
* Use reusable components.
* Separate UI from business logic.
* Use custom hooks for API logic.
* Keep components small and single-purpose.

### State Management

* Use React Context or Zustand if needed.
* Avoid unnecessary re-renders.
* Use memoization (`useMemo`, `useCallback`) when appropriate.

### Forms

* Use proper client-side validation.
* Show inline error messages.
* Disable submit button while loading.
* Handle loading, success, and error states clearly.

### Accessibility

* Use semantic HTML.
* Add `aria-*` attributes where necessary.
* Ensure keyboard navigation works.
* Provide `alt` text for images.
* Properly associate labels with inputs.

### UI/UX

* Fully responsive (mobile-first).
* Consistent spacing and typography.
* Clear navigation and error handling.
* Add skeleton loaders or spinners.

---

BACKEND LOGIC (Supabase Integration)

Use Supabase for:

* Authentication
* Database (PostgreSQL)
* Storage (if needed)
* Row Level Security (RLS)

### Authentication

* Use Supabase Auth.
* Handle:

  * Signup
  * Login
  * Logout
  * Session persistence
  * Password reset
* Protect private routes.
* Implement role-based access control.

### API Layer

* Create a dedicated `supabaseClient.js`.
* Abstract queries inside `/services` folder.
* Never expose service role key in frontend.
* Handle all async operations with try/catch.
* Show proper error messages to users.

---

DATABASE DESIGN (Supabase PostgreSQL)

Design schema properly:

### Structure

* Use UUID as primary keys.
* Proper foreign key relationships.
* Use `created_at` and `updated_at` timestamps.
* Add indexes for frequently queried columns.

### Constraints

* NOT NULL where necessary.
* UNIQUE constraints.
* Proper data types.
* Avoid redundant data.

### Row Level Security (CRITICAL)

* Enable RLS on all tables.
* Create policies:

  * Users can only access their own data.
  * Admins can access all data.
* Never leave tables publicly accessible.

---

SECURITY REQUIREMENTS

### Environment

* Use `.env` for:

  * Supabase URL
  * Public anon key
* Never commit `.env` to GitHub.

### Frontend Security

* Never store sensitive data in localStorage.
* Use Supabase session handling.
* Prevent XSS by sanitizing user-generated content.
* Validate inputs before sending to database.

### Supabase Security

* Use RLS properly.
* Use policies instead of frontend checks.
* Do NOT use service_role key in client.
* Use edge functions if secure server-side logic is required.

### API Protection

* Validate data before insert/update.
* Prevent mass assignment.
* Rate limit if necessary.

---

PERFORMANCE OPTIMIZATION

### React Optimization

* Use lazy loading (`React.lazy`).
* Code splitting.
* Optimize images.
* Avoid unnecessary state updates.
* Avoid large component trees.

### Supabase Optimization

* Select only needed columns.
* Use pagination for large datasets.
* Add indexes on filtered columns.
* Avoid N+1 queries.

### General

* Debounce search inputs.
* Cache data when appropriate.
* Use suspense if applicable.
* Minimize bundle size.

---

TESTING REQUIREMENTS

### Manual Testing

* Test all CRUD operations.
* Test login/logout flows.
* Test role-based restrictions.
* Test edge cases (empty input, invalid data).
* Test mobile responsiveness.

### Functional Testing

* Ensure protected routes work.
* Ensure unauthorized users cannot access restricted data.
* Ensure RLS policies are enforced.

### Error Testing

* Simulate network failure.
* Test expired sessions.
* Test invalid Supabase responses.

### Performance Testing

* Test large dataset loading.
* Test slow internet simulation.
* Test memory leaks.

---

# 🔥 DEVELOPMENT RULES

* Never trust frontend validation alone.
* Always rely on RLS for data protection.
* Always handle loading and error states.
* Always clean up subscriptions.
* Always remove console.logs in production.
* Always test before deployment.

---

# 🔥 OPTIONAL ADVANCED STANDARDS

If building production-level app:

* Add logging system.
* Implement optimistic UI updates.
* Add retry mechanism for failed requests.
* Implement proper error boundaries in React.
* Add global toast notification system.
