import type { ComponentType, ReactNode } from "react";
import { createPortal } from "react-dom";
import PageHeader from "./page-header";

type DetailPageLayoutProps = {
  icon?: ComponentType<{ size?: number }>;
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
};

export default function DetailPageLayout({
  icon,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: DetailPageLayoutProps) {
  return createPortal(
    <main className="fixed inset-x-0 top-0 z-[100] flex h-dvh flex-col bg-slate-50 dark:bg-slate-900">
      <PageHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-full space-y-6 p-4 pb-28">
          {children}
        </div>
      </div>

      {footer}
    </main>,
    document.body,
  );
}
