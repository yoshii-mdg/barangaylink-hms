/**
 * Background.jsx
 *
 * FIX: `bg-linear-to-b` is not a valid Tailwind v3/v4 utility class.
 * The correct class is `bg-gradient-to-b`. Using an invalid class means the
 * gradient overlay is silently dropped, causing the image to render without
 * any dark overlay — text on top becomes unreadable on bright backgrounds.
 */
export default function Background({ children }) {
  return (
    <section className="relative w-full bg-[url('/src/assets/images/landing-bg.png')] bg-cover bg-center flex items-center justify-center min-h-screen">
      {/* Overlay — fixed: bg-linear-to-b → bg-gradient-to-b */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-emerald-950/70 to-emerald-950/80" />

      {/* Content */}
      <div className="relative z-10 w-full mx-4 sm:mx-8 md:mx-16 lg:mx-30 px-4 md:px-12 mt-10">
        {children}
      </div>
    </section>
  );
}