/**
 * Split layout for Login and SignUp pages.
 *
 * BUGS FIXED:
 * 1. `top-110`  — not a valid Tailwind class, caused the entire form to
 *    be positioned off-screen (this was the PRIMARY reason auth pages
 *    appeared blank/unreachable).
 * 2. `max-w-`   — incomplete Tailwind class (missing the size value),
 *    caused a CSS parsing warning and broke the container width.
 * 3. `bg-linear-to-b` — not a valid Tailwind v3 class; correct class is
 *    `bg-gradient-to-b`.
 * 4. Layout now uses overflow-y-auto so tall forms (SignUp multi-step)
 *    scroll properly on small screens instead of being clipped.
 */
export default function AuthLayout({ header, children }) {
  return (
    <div className="min-h-screen relative">
      {/* Top section: background image */}
      <div
        className="fixed inset-0 bg-[url('/src/assets/images/landing-bg.png')] bg-cover bg-center"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-emerald-950/75 to-emerald-950/90" />
      </div>

      {/* Scrollable content layer */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-12 overflow-y-auto">
        {/* Logo / header */}
        <div className="flex flex-col items-center mb-6 w-full max-w-lg">
          {header}
        </div>

        {/* Form card */}
        <div className="w-full max-w-lg">
          {children}
        </div>

        {/* Bottom padding so content isn't flush against bottom on short screens */}
        <div className="h-8 flex-shrink-0" />
      </div>
    </div>
  );
}