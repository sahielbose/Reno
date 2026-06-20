import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Reno Button — pill-shaped, ported from the prototype's `.btn` family.
 * Variants: primary (brand), dark (ink), ghost (outline), ghostOnDark,
 * accent (amber), secondary, link. Renders any element via Base UI's
 * `render` prop (e.g. `<Button render={<Link href="…" />}>`).
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-[1.5px] border-transparent font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform,box-shadow] duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[1.05em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:-translate-y-px hover:bg-brand-700",
        dark: "bg-ink text-white hover:-translate-y-px hover:bg-black",
        ghost:
          "border-line-2 bg-transparent text-foreground hover:border-ink hover:bg-paper",
        outline:
          "border-line bg-white text-foreground hover:bg-paper hover:text-ink",
        ghostOnDark:
          "border-white/35 bg-transparent text-white hover:border-white",
        accent: "bg-amber text-[#3a2a00] hover:brightness-95",
        secondary: "bg-paper text-ink hover:bg-line",
        destructive:
          "bg-danger-soft text-danger hover:bg-danger hover:text-white",
        link: "rounded-none text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[1.2rem] py-[0.7rem] text-[0.95rem]",
        sm: "px-[0.9rem] py-[0.5rem] text-[0.85rem]",
        lg: "px-6 py-3 text-base",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
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
