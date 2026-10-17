import type { ReactNode } from "react";
import { FaPlus } from "react-icons/fa6";

type MobileFloatingActionButtonProps = {
  ariaLabel: string;
  onClick: () => void;
  icon?: ReactNode;
  colorClassName?: string;
};

export default function MobileFloatingActionButton({
  ariaLabel,
  onClick,
  icon = <FaPlus className="text-xl" />,
  colorClassName = "bg-emerald-600 hover:bg-emerald-700",
}: MobileFloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 md:hidden ${colorClassName}`}
    >
      {icon}
    </button>
  );
}
