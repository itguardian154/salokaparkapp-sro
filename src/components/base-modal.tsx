import { FaTimes } from "react-icons/fa";
import type { ReactElement, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

type AppModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

type AppModalSectionProps = {
  title?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  showHeader?: boolean;
  headerAction?: ReactNode;
};

type AppModalComponent = ((
  props: AppModalProps,
) => ReactElement | null) & {
  Section: (props: AppModalSectionProps) => ReactElement;
};

const AppModal: AppModalComponent = ({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  className = "",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 font-poppins backdrop-blur-sm">
      <div
        className={`
          flex min-h-0 w-full max-w-4xl flex-col
          overflow-hidden rounded-3xl
          bg-slate-50 shadow-2xl
          dark:bg-slate-900
          max-h-full
          lg:max-h-[calc(100vh-2rem)]
          ${className}
        `}
      >
        {/* HEADER MODAL */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-3 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {icon}
            </div>

            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors duration-200 hover:bg-rose-500 hover:text-white dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-rose-600 dark:hover:text-white"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* CONTENT MODAL */}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* FOOTER MODAL */}
        {footer && (
          <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

AppModal.Section = function Section({
  title,
  icon,
  children,
  showHeader = true,
  headerAction,
}: AppModalSectionProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* HEADER SECTION */}
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/20">
          <CardTitle className="flex min-w-0 items-center gap-3 text-base font-semibold text-slate-800 dark:text-white">
            {icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                {icon}
              </span>
            )}

            <span className="min-w-0">{title}</span>
          </CardTitle>

          {headerAction && (
            <div className="ml-auto shrink-0">
              {headerAction}
            </div>
          )}
        </CardHeader>
      )}

      {/* CONTENT SECTION */}
      <CardContent className="px-4 py-2">
        {children}
      </CardContent>
    </Card>
  );
};

export default AppModal;