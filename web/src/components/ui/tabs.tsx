"use client";

interface TabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

// Cuộn ngang khi quá hẹp trên điện thoại
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className="bg-surface border-line flex w-full gap-1 overflow-x-auto rounded-xl border p-1 sm:w-fit"
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
              active
                ? "bg-primary text-white"
                : "text-fg-muted hover:bg-surface-hover"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
