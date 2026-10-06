import * as React from "react";
import { FormField } from "../FormField/FormField";
import type { FieldBaseProps } from "../TextInput/TextInput";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import f from "../FormField/FormField.module.scss";
import s from "./Autocomplete.module.scss";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

export interface AutocompleteProps extends FieldBaseProps {
  options: AutocompleteOption[];
  /** Custom matcher. Default: case-insensitive "contains" on label. */
  filter?: (option: AutocompleteOption, query: string) => boolean;
  value?: AutocompleteOption | null;
  onChange?: (option: AutocompleteOption | null) => void;
  /** Fires on every keystroke — use for async options. */
  onInputChange?: (query: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  emptyMessage?: string;
  maxResults?: number;
}

const defaultFilter = (o: AutocompleteOption, q: string) => o.label.toLowerCase().includes(q.toLowerCase());

/** WAI-ARIA APG combobox (list autocomplete, manual selection). */
export function Autocomplete({
  label, hint, error, hideLabel, fieldClassName, options, filter = defaultFilter, value, onChange, onInputChange,
  placeholder, required, disabled, id, emptyMessage, maxResults = 8,
}: AutocompleteProps) {
  const [query, setQuery] = React.useState(value?.label ?? "");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const listId = React.useId();
  const statusId = React.useId();

  React.useEffect(() => { if (value !== undefined) setQuery(value?.label ?? ""); }, [value]);

  const results = React.useMemo(
    () => (query ? options.filter((o) => filter(o, query)) : options).slice(0, maxResults),
    [options, query, filter, maxResults]
  );
  const noMatches = useLabel("noMatches", "No matches");
  const suggestions = useLabel("suggestions", "{count} suggestions available. Use up and down arrows to review.", { count: results.length });
  const empty = emptyMessage || noMatches;

  const select = (o: AutocompleteOption) => {
    setQuery(o.label);
    onChange?.(o);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        setActive((i) => (results.length ? (i + 1) % results.length : -1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        setActive((i) => (results.length ? (i <= 0 ? results.length - 1 : i - 1) : -1));
        break;
      case "Enter":
        if (open && active >= 0 && results[active]) { e.preventDefault(); select(results[active]); }
        break;
      case "Escape":
        if (open) { e.preventDefault(); setOpen(false); setActive(-1); }
        else if (query) { setQuery(""); onChange?.(null); }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;
  const expanded = open && !disabled;

  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled} hideLabel={hideLabel} id={id} className={fieldClassName}>
      {(ctx) => (
        <div className={s.wrap}>
          <input
            id={ctx.id}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={listId}
            aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
            aria-describedby={ctx.describedBy}
            aria-invalid={ctx.invalid || undefined}
            required={required}
            disabled={disabled}
            autoComplete="off"
            placeholder={placeholder}
            className={f.control}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onInputChange?.(e.target.value);
              setOpen(true);
              setActive(-1);
              if (value && e.target.value !== value.label) onChange?.(null);
            }}
            onKeyDown={onKeyDown}
            onClick={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          />
          <ul id={listId} role="listbox" aria-label={typeof label === "string" ? label : undefined} className={cx(s.listbox, expanded && s.open)}>
            {results.map((o, i) => (
              <li
                key={o.value}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className={s.option}
                // mousedown so the input's blur doesn't close the list before selection
                onMouseDown={(e) => { e.preventDefault(); select(o); }}
                onMouseMove={() => setActive(i)}
              >
                <span>{o.label}</span>
                {o.description && <span className={s.description}>{o.description}</span>}
              </li>
            ))}
            {expanded && results.length === 0 && <li className={s.empty} role="presentation">{empty}</li>}
          </ul>
          <span id={statusId} className="visually-hidden" aria-live="polite">
            {expanded && query ? (results.length ? suggestions : empty) : ""}
          </span>
        </div>
      )}
    </FormField>
  );
}
