import type { CSSProperties, ReactNode } from "react";

export const BRAND = "#147a4a";

/** Centered branded card used by the verify / reset / landing pages. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#eef1ec",
        padding: 24,
        fontFamily: "'Hanken Grotesk', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#1a1c19",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,.08)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: BRAND, marginBottom: 24 }}>VC Tabs</div>
        {children}
      </div>
    </main>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>{children}</h1>
      {sub ? <p style={{ fontSize: 15, lineHeight: 1.6, color: "#43483e", margin: 0 }}>{sub}</p> : null}
    </>
  );
}

export const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  fontSize: 15,
  borderRadius: 10,
  border: "1px solid #c3c8bd",
  outline: "none",
  fontFamily: "inherit",
};

export const buttonStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  background: BRAND,
  border: "none",
  borderRadius: 999,
  cursor: "pointer",
  fontFamily: "inherit",
};
