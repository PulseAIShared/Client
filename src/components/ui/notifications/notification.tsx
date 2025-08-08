
import { FaInfoCircle, FaCheckCircle  } from "react-icons/fa";
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
  };
  onDismiss: (id: string) => void;
};

export const Notification = ({
  notification: { id, type, title, message },
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
              <p className="text-sm sm:text-base font-semibold text-text-primary">{title}</p>
              {message && (
                <p className="mt-1 text-sm text-text-muted leading-relaxed">{message}</p>
              )}
            </div>
            <div className="ml-4 flex shrink-0">
              <button
                className="inline-flex rounded-lg bg-surface-secondary/50 text-text-muted hover:text-text-primary hover:bg-surface-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 transition-all duration-300 p-1"
                onClick={() => {
                  onDismiss(id);
                }}
              >
                <span className="sr-only">Close</span>
                <FaCircleXmark className="size-4 sm:size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
