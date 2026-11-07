import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export type DetailAction = {
  id: string | number;
  label: ReactNode;
  icon?: ReactNode;
  position?: "left" | "right";
  variant?: ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
  mobileColor?: string;
  onClick?: () => void;
};

type DetailActionFooterProps = {
  actions?: DetailAction[];
};

type MobileActionProps = {
  icon?: ReactNode;
  label: ReactNode;
  color?: string;
  onClick?: () => void;
};

const MobileAction = ({
  icon,
  label,
  color = "bg-sky-600",
  onClick,
}: MobileActionProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-[58px]
        w-[58px]
        flex-col
        items-center
        justify-center
        gap-[2px]
        rounded-full
        text-white
        shadow-[0_3px_10px_rgba(0,0,0,0.22)]
        transition-transform
        duration-200
        hover:scale-105
        active:scale-95
        ${color}
      `}
    >
      <span
        className="
          flex
          h-[19px]
          items-center
          justify-center
        "
      >
        {icon}
      </span>

      <span
        className="
          max-w-[48px]
          text-center
          text-[8px]
          font-bold
          leading-[9px]
          text-white
        "
      >
        {label}
      </span>
    </button>
  );
};

export default function DetailActionFooter({
  actions = [],
}: DetailActionFooterProps) {
  const [open, setOpen] = useState(false);

  const leftActions = actions.filter(
    (action) => action.position === "left"
  );

  const rightActions = actions.filter(
    (action) => action.position !== "left"
  );

  const mobileActions = actions.slice(0, 4);

  const handleAction = (action: DetailAction) => {
    action.onClick?.();
    setOpen(false);
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <div
          className="
            sticky
            bottom-0
            z-50
            border-t
            border-slate-200
            bg-white/95
            px-4
            py-3
            backdrop-blur
            dark:border-slate-800
            dark:bg-slate-900/95
            md:px-6
          "
        >
          <div className="flex items-center justify-between gap-3">
            {/* LEFT ACTIONS */}
            <div className="flex items-center gap-3">
              {leftActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "blue"}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-3">
              {rightActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "blue"}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <div className="pointer-events-none fixed inset-0 z-[9999]">
          {/* FAN MENU */}
          <div
            className="
              fixed
              bottom-0
              left-1/2
              h-[180px]
              w-[320px]
              -translate-x-1/2
            "
          >
            {/* BACKGROUND + ACTION BUTTONS */}
            <div
              className={`
                absolute
                inset-0
                origin-bottom
                transition-all
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                ${
                  open
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-[30px] scale-[0.75] opacity-0"
                }
              `}
            >
              {/* BACKGROUND ARC */}
              <svg
                viewBox="0 0 320 180"
                className="absolute inset-0 h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="
                    M 12 143
                    C 18 74
                      76 20
                      160 20
                    C 244 20
                      302 74
                      308 143
                    C 309 151
                      303 156
                      294 156
                    L 242 156
                    C 233 156
                      227 151
                      224 142
                    C 214 111
                      191 96
                      160 96
                    C 129 96
                      106 111
                      96 142
                    C 93 151
                      87 156
                      78 156
                    L 26 156
                    C 17 156
                      11 151
                      12 143
                    Z
                  "
                  className="
                    fill-slate-200
                    dark:fill-slate-800
                  "
                />
              </svg>

              {/* ACTION BUTTONS */}
              <div className="relative h-full w-full">
                {mobileActions.map((action, index) => {
                  const total = mobileActions.length;

                  const positions: Record<number, { left: number; bottom: number }[]> = {
                    1: [
                      { left: 131, bottom: 82 },
                    ],

                    2: [
                      { left: 42, bottom: 42 },
                      { left: 220, bottom: 42 },
                    ],

                    3: [
                      { left: 25, bottom: 29 },
                      { left: 131, bottom: 67 },
                      { left: 237, bottom: 29 },
                    ],

                    4: [
                      { left: 25, bottom: 30 },
                      { left: 85, bottom: 84 },
                      { left: 170, bottom: 84 },
                      { left: 230, bottom: 30 },
                    ],
                  };

                  const position =
                    positions[total]?.[index];

                  if (!position) return null;

                  return (
                    <div
                      key={action.id}
                      className={`
                        pointer-events-auto
                        absolute
                        transition-all
                        duration-500
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        ${
                          open
                            ? "translate-y-0 scale-100 opacity-100"
                            : "translate-y-[25px] scale-50 opacity-0"
                        }
                      `}
                      style={{
                        left: position.left,
                        bottom: position.bottom,
                        transitionDelay: open
                          ? `${index * 60}ms`
                          : "0ms",
                      }}
                    >
                      <MobileAction
                        icon={action.icon}
                        label={action.label}
                        color={
                          action.mobileColor ||
                          "bg-sky-600"
                        }
                        onClick={() =>
                          handleAction(action)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MAIN BUTTON */}
            <button
              type="button"
              onClick={() =>
                setOpen((prev) => !prev)
              }
              className="
                pointer-events-auto
                fixed
                bottom-[5px]
                left-1/2
                z-[10000]
                flex
                h-[58px]
                w-[58px]
                -translate-x-1/2
                items-center
                justify-center
                rounded-full
                border-[3px]
                border-white
                bg-sky-600
                text-white
                shadow-[0_4px_15px_rgba(0,0,0,0.30)]
                transition-all
                duration-200
                hover:scale-105
                active:scale-95
                dark:border-sky-700
                dark:bg-sky-950
              "
            >
              <span
                className="
                  transition-transform
                  duration-300
                "
              >
                {open ? (
                  <FaTimes size={17} />
                ) : (
                  <FaPlus size={17} />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

