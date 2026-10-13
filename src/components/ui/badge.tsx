import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "cn";

const badgeVariants = cva(
  "inline-flex w-fit max-w-44 shrink-0 items-center justify-center rounded-full border border-transparent px-2.5 py-1 text-xs font-medium  transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-white",
        outline: "border-border text-foreground",
        success:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        warning:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        muted: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
        blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        blueCircle:
          "gap-1.5 border border-blue-200 bg-blue-50 text-blue-800 before:size-1.5 before:shrink-0 before:rounded-full before:bg-blue-500 before:content-[''] dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-200 dark:before:bg-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
