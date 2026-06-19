import { VerifyClient } from "./verify-client";

// referrer:no-referrer keeps the token out of any outbound Referer header.
export const metadata = {
  title: "Verify email · VC Tabs",
  referrer: "no-referrer",
};

export default function VerifyPage() {
  return <VerifyClient />;
}
