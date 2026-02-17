import { useState, useRef, useEffect } from 'react';
import { FiLogOut } from 'react-icons/fi';

export default function DashboardHeader({
  title = 'Dashboard',
  userName = 'Super Administrator',
  userRole = 'Super Admin',
  onLogout, // <== Placeholder lang
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (showConfirm && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [showConfirm]);

  const handleOpen = () => setShowConfirm(true);
  const handleClose = () => setShowConfirm(false);

  const handleConfirm = async () => {
    try {
      await onLogout?.(); // Placeholder Logout Function
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <header className="h-21 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
      <h1 className="text-4xl font-semibold">{title}</h1>

      <div className="flex items-center gap-3 text-sm">
        <div className="text-right leading-tight select-none">
          <div className="font-semibold">{userName}</div>
          <div className="text-xs text-gray-500">{userRole}</div>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          aria-label="Log Out"
          title="Log Out"
          className="
            inline-flex items-center justify-center
            w-9 h-9
            rounded-md
            hover:text-red-600
            focus:outline-none focus:ring-1 focus:ring-red-500/50
            transition-colors
          "
        >
          <FiLogOut className="w-6 h-6" />
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleClose}
          initialFocusRef={cancelBtnRef}
        />
      )}
    </header>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  initialFocusRef, 
}) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const panelRef = useRef(null);
  const onBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      onCancel?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onMouseDown={onBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative bg-white w-[90%] max-w-sm rounded-xl shadow-xl p-6 animate-in fade-in zoom-in duration-150 "
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={initialFocusRef}
            type="button"
            onClick={onCancel}
            className="px-4 h-9 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 h-9 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}