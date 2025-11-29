import { FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { IoAlertCircleSharp } from "react-icons/io5";
import { FaCircleXmark } from "react-icons/fa6";

const icons = {
  info: <FaInfoCircle className="size-6 text-blue-500" aria-hidden="true" />,
  success: <FaCheckCircle className="size-6 text-green-500" aria-hidden="true" />,
  warning: (
    <IoAlertCircleSharp className="size-6 text-yellow-500" aria-hidden="true" />
  ),
  error: <FaCircleXmark className="size-6 text-red-500" aria-hidden="true" />,
};

export type NotificationProps = {
  notification: {
    id: string;
    type: keyof typeof icons;
    title: string;
    message?: string;
    actionLabel?: string;
    actionHref?: string;
  };
  onDismiss: (id: string) => void;
};

export const Notification = ({
  notification: { id, type, title, message, actionHref, actionLabel },
  onDismiss,
}: NotificationProps) => {
  return (
    <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-surface-primary/95 backdrop-blur-xl shadow-2xl ring-1 ring-border-primary/30 border border-border-primary/20">
        <div className="p-4 sm:p-6" role="alert" aria-label={title}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="shrink-0">
              <div className="relative">
                {icons[type]}
                <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse"></div>
              </div>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-text-primary">{title}</p>
              {message && (
                <p className="mt-1 text-sm text-text-secondary">
                  {message}
                </p>
              )}
              {actionHref && (
                <div className="mt-3">
                  <a
                    href={actionHref}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent-primary/90 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-accent-primary"
                  >
                    {actionLabel ?? 'View'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
            <div className="ml-4 flex shrink-0">
              <button
                type="button"
                className="inline-flex rounded-full bg-surface-secondary/60 p-1 text-text-secondary hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/70 focus:ring-offset-2"
                onClick={() => onDismiss(id)}
                aria-label="Dismiss notification"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
