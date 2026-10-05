import * as React from "react";
import { IconChevronDown, IconChevronUp, IconSort } from "@myproject/icons";
import { cx } from "../../utils/cx";
import s from "./Table.module.scss";

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Return a comparable value to make the column sortable. */
  sortValue?: (row: T) => string | number;
  align?: "start" | "end";
  /** Marks this column as the row header (<th scope="row">). */
  rowHeader?: boolean;
}

export interface TableProps<T> {
  /** Required: describes the table for screen-reader table navigation. */
  caption: React.ReactNode;
  hideCaption?: boolean;
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  striped?: boolean;
  emptyMessage?: React.ReactNode;
  className?: string;
}

type Sort = { key: string; dir: "ascending" | "descending" } | null;

export function Table<T>({ caption, hideCaption, columns, rows, getRowKey, striped, emptyMessage = "No results", className }: TableProps<T>) {
  const [sort, setSort] = React.useState<Sort>(null);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const m = sort.dir === "ascending" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a), vb = col.sortValue!(b);
      return (va > vb ? 1 : va < vb ? -1 : 0) * m;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key: string) =>
    setSort((cur) => (cur?.key === key && cur.dir === "ascending" ? { key, dir: "descending" } : { key, dir: "ascending" }));

  return (
    // Scroll container is focusable so keyboard users can scroll wide tables (WCAG 2.1.1).
    <div className={cx(s.wrap, className)} tabIndex={0} role="region" aria-label={typeof caption === "string" ? caption : "Table"}>
      <table className={cx(s.table, striped && s.striped)}>
        <caption className={hideCaption ? "visually-hidden" : s.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th key={c.key} scope="col" className={cx(c.align === "end" && s.end)} aria-sort={active ? sort!.dir : undefined}>
                  {c.sortValue ? (
                    <button type="button" className={s.sortButton} onClick={() => toggleSort(c.key)}>
                      {c.header}
                      <span aria-hidden="true" className={s.sortIcon}>
                        {active ? (sort!.dir === "ascending" ? <IconChevronUp size="sm" /> : <IconChevronDown size="sm" />) : <IconSort size="sm" />}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className={s.empty}>{emptyMessage}</td></tr>
          ) : (
            sorted.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((c) =>
                  c.rowHeader ? (
                    <th key={c.key} scope="row" className={cx(c.align === "end" && s.end)}>{c.cell(row)}</th>
                  ) : (
                    <td key={c.key} className={cx(c.align === "end" && s.end)}>{c.cell(row)}</td>
                  )
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
