import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LuBadgeCheck, LuX, LuInfo, LuTriangleAlert, LuX as LuClose } from 'react-icons/lu';

const ToastContext = createContext(null);

const ICONS = {
  success: LuBadgeCheck,
  error: LuX,
  info: LuInfo,
  warning: LuTriangleAlert,
};

const STYLES = {
  success: 'bg-white border-l-4 border-emerald-500',
  error: 'bg-white border-l-4 border-red-500',
  info: 'bg-white border-l-4 border-blue-500',
  warning: 'bg-white border-l-4 border-yellow-500',
};

const ICON_STYLES = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
};

function Toast({ id, type = 'info', title, message, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const Icon = ICONS[type];

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 350);
  }, [id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 4500);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <div
      className={`
        flex items-start gap-3 w-80 rounded-xl shadow-xl px-4 py-3
        ${STYLES[type]}
        transition-all duration-350 ease-out
        ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${ICON_STYLES[type]}`} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-gray-900">{title}</p>}
        {message && <p className="text-sm text-gray-600 mt-0.5 leading-snug">{message}</p>}
      </div>
      <button
        onClick={dismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 flex-shrink-0"
        aria-label="Dismiss"
      >
        <LuClose className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onRemove={removeToast} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}