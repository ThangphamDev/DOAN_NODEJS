import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const NotifyContext = createContext(null);

const typeStyles = {
  success: {
    icon: "check_circle",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-500",
  },
  error: {
    icon: "error",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    iconClassName: "text-rose-500",
  },
  warning: {
    icon: "warning",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    iconClassName: "text-amber-500",
  },
  info: {
    icon: "info",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    iconClassName: "text-sky-500",
  },
};

export const NotifyProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const timeoutMapRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));

    const activeTimeout = timeoutMapRef.current.get(id);
    if (activeTimeout) {
      window.clearTimeout(activeTimeout);
      timeoutMapRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    ({ type = "info", title = "", message, duration = 3500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const nextNotification = { id, type, title, message };

      setNotifications((current) => [...current, nextNotification]);

      const timeoutId = window.setTimeout(() => {
        dismiss(id);
      }, duration);

      timeoutMapRef.current.set(id, timeoutId);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      show,
      success: (message, options = {}) => show({ ...options, type: "success", message }),
      error: (message, options = {}) => show({ ...options, type: "error", message }),
      warning: (message, options = {}) => show({ ...options, type: "warning", message }),
      info: (message, options = {}) => show({ ...options, type: "info", message }),
      dismiss,
    }),
    [dismiss, show]
  );

  return (
    <NotifyContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {notifications.map((item) => {
          const style = typeStyles[item.type] || typeStyles.info;

          return (
            <div
              className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${style.className}`}
              key={item.id}
            >
              <div className="flex items-start gap-3">
                <span className={`material-symbols-outlined text-xl ${style.iconClassName}`}>{style.icon}</span>
                <div className="min-w-0 flex-1">
                  {item.title ? <p className="text-sm font-semibold">{item.title}</p> : null}
                  <p className="text-sm leading-6">{item.message}</p>
                </div>
                <button
                  className="rounded-md p-1 text-slate-400 transition hover:bg-white/60 hover:text-slate-700"
                  onClick={() => dismiss(item.id)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotifyContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotifyContext);

  if (!context) {
    throw new Error("useNotify must be used within a NotifyProvider");
  }

  return context;
};
