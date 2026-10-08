import type { ComponentType, ReactNode } from "react";
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
  return (
    <main className="fixed inset-0 z-100 flex flex-col bg-white dark:bg-slate-900">
      <PageHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-full space-y-6 p-4 pb-28 md:p-6">
          {children}
        </div>
      </div>

      {footer}
    </main>
  );
}
