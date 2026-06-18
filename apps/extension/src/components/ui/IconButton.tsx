import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

/** Material 3 standard icon button (40dp target, circular state layer). */
export function IconButton({ label, className = "", type = "button", children, ...props }: IconButtonProps) {
  return (
    <button type={type} title={label} aria-label={label} className={`m3-icon-btn ${className}`} {...props}>
      {children}
    </button>
  );
}
