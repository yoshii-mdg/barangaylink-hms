/**
 * Inline validation error message component.
 * Renders a small red error below a form field with a subtle entrance animation.
 *
 * @param {{ message?: string }} props
 */
export default function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-xs text-red-600 animate-[slideDown_150ms_ease-out]">
      {message}
    </p>
  );
}
