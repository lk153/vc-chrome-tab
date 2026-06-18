import { useUiStore } from "@/store/useUiStore";
import { IconSearch, IconX } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";

/** Controlled search input bound to the UI store; filters tabs instantly. */
export function SearchBar() {
  const query = useUiStore((s) => s.searchQuery);
  const setQuery = useUiStore((s) => s.setSearchQuery);

  return (
    <div className="flex h-12 items-center gap-3 rounded-full bg-surface-container-highest px-4 focus-within:ring-2 focus-within:ring-primary">
      <IconSearch size={20} className="shrink-0 text-on-surface-variant" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tabs…"
        className="w-full bg-transparent text-on-surface body-large outline-none placeholder:text-on-surface-variant"
      />
      {query && (
        <IconButton label="Clear search" onClick={() => setQuery("")} className="-mr-2 shrink-0">
          <IconX size={18} />
        </IconButton>
      )}
    </div>
  );
}
