const variants = {
  primary:
    "bg-brand-500 text-ink shadow-[0_3px_0_var(--color-brand-800)] hover:bg-brand-400",
  dark: "bg-ink text-white shadow-[0_3px_0_rgb(0_0_0/0.4)] hover:bg-black",
  light:
    "bg-white text-ink shadow-[0_3px_0_rgb(154_48_0/0.35)] hover:bg-brand-50",
} as const;

const sizes = {
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-14 px-7 text-lg",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
) {
  return `inline-flex items-center justify-center gap-2.5 rounded-full font-bold transition active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}
