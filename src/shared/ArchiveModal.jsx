/**
 * ArchiveModal.jsx
 *
 * FIXES applied (bring in line with DeactiveModal standards):
 * 1. Added `role="dialog"` + `aria-modal="true"` — screen readers now
 *    correctly announce this as a modal dialog.
 * 2. Added `aria-labelledby` pointing to the heading — WCAG 2.1 §4.1.2.
 * 3. Added Escape key listener — users can dismiss without mouse.
 * 4. Added `useRef` + `useEffect` focus trap on open — keyboard focus is
 *    moved to the Cancel button automatically (safer default than Confirm).
 * 5. Added `type="button"` to all buttons — prevents accidental form submit.
 * 6. Reordered buttons: Cancel on left (safe default), Archive on right (destructive).
 */
import { useEffect, useRef } from 'react';

export default function ArchiveModal({
  isOpen,
  title = 'Archive',
  message = 'This record will be archived and removed from the active list.',
  onConfirm,
  onCancel,
}) {
  const cancelBtnRef = useRef(null);

  // Auto-focus Cancel button when modal opens
  useEffect(() => {
    if (isOpen && cancelBtnRef.current) cancelBtnRef.current.focus();
  }, [isOpen]);

  // Escape key closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-t-lg border-b border-gray-200">
          <h2 id="archive-modal-title" className="text-xl font-semibold text-gray-900">
            Archive {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you sure you want to archive this {title.toLowerCase()}?
          </h3>
          <p className="text-gray-600 text-sm mb-7">{message}</p>
          <div className="flex gap-3">
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={onCancel}
              className="flex-1 px-10 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-10 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}