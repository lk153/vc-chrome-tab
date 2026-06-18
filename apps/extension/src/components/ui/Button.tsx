import type { ButtonHTMLAttributes } from "react";

type Variant = "filled" | "tonal" | "outlined" | "text" | "fab";

const VARIANT_CLASS: Record<Variant, string> = {
  filled: "m3-btn-filled",
  tonal: "m3-btn-tonal",
  outlined: "m3-btn-outlined",
  text: "m3-btn-text",
  fab: "m3-fab",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Material 3 button. Defaults to the filled (high-emphasis) variant. */
export function Button({ variant = "filled", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${VARIANT_CLASS[variant]} ${className}`} {...props} />;
}
