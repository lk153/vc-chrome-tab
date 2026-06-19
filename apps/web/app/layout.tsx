import type { ReactNode } from "react";

export const metadata = {
  title: "VC Tabs",
  description: "Cloud sync for the VC Tabs extension.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>{children}</body>
    </html>
  );
}
