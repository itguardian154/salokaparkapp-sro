import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "text-white bg-red-500 hover:bg-red-700 rounded-full shadow-lg shadow-red-500/20 flex items-center gap-2 transition-all active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        primer:
          "text-white bg-primer-60 hover:bg-primer-80 rounded-full shadow-lg shadow-primer-80/20 flex items-center gap-2 transition-all active:scale-95",

        amberBorder:
          "gap-2 rounded-xl border-2 border-amber-500 bg-white text-xs text-amber-500 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-md dark:bg-slate-900 dark:text-amber-400 dark:hover:bg-amber-100",
        sekunder:
          "bg-sekunder-60 text-white hover:bg-sekunder-40 rounded-full shadow-md shadow-sekunder-60/20 hover:shadow-md gap-2",
        back: "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 shadow-sm gap-2", // netral
        backDark:
          "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-sm gap-2", // untuk dark mode
        backOutline:
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 gap-2", // mirip outline
        backGhost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 gap-2", //
        blue: "bg-blue-600 text-white hover:bg-blue-700 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95",
      },
      size: {
        default:
          "h-11 px-5 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
        "icon-xl": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
