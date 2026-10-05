import * as React from "react";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import s from "./Tabs.module.scss";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Accessible name for the tab list. */
  label: string;
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** "automatic" selects on arrow key; "manual" requires Enter/Space (use when panels are expensive to render). */
  activation?: "automatic" | "manual";
  className?: string;
}

/** WAI-ARIA APG Tabs: roving tabindex, ←/→, Home/End. */
export function Tabs({ label, items, value, defaultValue, onChange, activation = "automatic", className }: TabsProps) {
  const [selected, setSelected] = useControllableState(value, defaultValue ?? items[0]?.id, onChange);
  const [focusId, setFocusId] = React.useState(selected);
  const base = React.useId();
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = items.filter((t) => !t.disabled);

  React.useEffect(() => setFocusId(selected), [selected]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = enabled.findIndex((t) => t.id === focusId);
    let next: TabItem | undefined;
    if (e.key === "ArrowRight") next = enabled[(i + 1) % enabled.length];
    else if (e.key === "ArrowLeft") next = enabled[(i - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (!next) return;
    e.preventDefault();
    setFocusId(next.id);
    refs.current[next.id]?.focus();
    if (activation === "automatic") setSelected(next.id);
  };

  return (
    <div className={cx(s.tabs, className)}>
      <div role="tablist" aria-label={label} className={s.list} onKeyDown={onKeyDown}>
        {items.map((t) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            role="tab"
            type="button"
            id={`${base}-tab-${t.id}`}
            aria-selected={t.id === selected}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={t.id === focusId ? 0 : -1}
            disabled={t.disabled}
            className={s.tab}
            onClick={() => setSelected(t.id)}
            onFocus={() => setFocusId(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== selected}
          tabIndex={0}
          className={s.panel}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
