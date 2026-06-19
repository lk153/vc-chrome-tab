import { useToastStore } from "@/store/useToastStore";
import { IconCheck } from "@/components/icons";

/** Bottom-center confirmation toast. */
export function Toast() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;
  return (
    <div className="animate-toast fixed bottom-7 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2.5 rounded-xl bg-inverse-surface px-4 py-2.5 label-large text-inverse-on-surface shadow-m3-3">
      <IconCheck size={16} className="text-primary" />
      {message}
    </div>
  );
}
