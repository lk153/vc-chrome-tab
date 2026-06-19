import { ResetClient } from "./reset-client";

// referrer:no-referrer keeps the token out of any outbound Referer header.
export const metadata = {
  title: "Reset password · VC Tabs",
  referrer: "no-referrer",
};

export default function ResetPage() {
  return <ResetClient />;
}
