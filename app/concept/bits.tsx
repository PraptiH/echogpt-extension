export function Segment<T extends string>({
  label,
  value,
  onChange,
  options,
  tone,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  tone: "paper" | "echo";
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={
        tone === "paper"
          ? "inline-flex rounded-lg bg-[var(--s-seg)] p-0.5"
          : "inline-flex rounded-lg bg-[var(--sunken)] p-0.5"
      }
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={
              tone === "paper"
                ? `rounded-md px-2.5 py-1 text-[12px] ${
                    active
                      ? "bg-[var(--s-seg-on)] font-medium text-[var(--s-text)] shadow-sm"
                      : "text-[var(--s-seg-text)] hover:text-[var(--s-text)]"
                  }`
                : `rounded-md px-2.5 py-1 text-[12px] ${
                    active
                      ? "bg-[var(--raised)] font-medium text-[var(--text)] shadow-sm"
                      : "text-[var(--muted)]"
                  }`
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-[22px] w-9 shrink-0 rounded-full transition-colors ${
        on ? "bg-[var(--accent)]" : "bg-[var(--sunken)]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-[18px] rounded-full bg-white transition-transform ${
          on ? "translate-x-[14px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}
