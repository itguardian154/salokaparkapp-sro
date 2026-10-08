import { FaTimes } from "react-icons/fa";
import type { ReactElement, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
};

type AppModalComponent = ((props: AppModalProps) => ReactElement | null) & {
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
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-poppins">
      <div
        className={`
          bg-slate-50 dark:bg-slate-900
          w-full max-w-4xl
          max-h-full lg:max-h-[calc(100vh-2rem)]
          rounded-3xl
          shadow-2xl
          flex flex-col
          overflow-hidden
          min-h-0
          ${className}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              {icon}
            </div>

            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-rose-600 dark:hover:text-white flex items-center justify-center transition-colors duration-200"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* CONTENT - YANG SCROLL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
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
}: AppModalSectionProps) {
  return (
    <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm rounded-2xl overflow-hidden">
      {showHeader && (
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/20">
          <CardTitle className="flex items-center gap-3 text-base font-semibold text-slate-800 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              {icon}
            </span>

            <span>{title}</span>
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="px-4 py-2">{children}</CardContent>
    </Card>
  );
};

export default AppModal;
