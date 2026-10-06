import * as React from "react";
import { IconChevronLeft, IconChevronRight } from "@myproject/icons";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import s from "./Pagination.module.scss";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current page. */
  siblings?: number;
  label?: string;
  className?: string;
}

function range(page: number, total: number, siblings: number): Array<number | "gap"> {
  const pages = new Set([1, total]);
  for (let p = page - siblings; p <= page + siblings; p++) if (p >= 1 && p <= total) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages, onPageChange, siblings = 1, label, className }: PaginationProps) {
  const navLabel = useLabel("pagination", "Pagination");
  const previousPage = useLabel("previousPage", "Previous page");
  const nextPage = useLabel("nextPage", "Next page");
  const pageWord = useLabel("page", "Page");
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={label || navLabel} className={cx(s.pagination, className)}>
      <ul>
        <li>
          <button type="button" className={s.item} disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            <IconChevronLeft size="sm" /><span className="visually-hidden">{previousPage}</span>
          </button>
        </li>
        {range(page, totalPages, siblings).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className={s.gap} aria-hidden="true">…</li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={s.item}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
              >
                <span className="visually-hidden">{pageWord} </span>{p}
              </button>
            </li>
          )
        )}
        <li>
          <button type="button" className={s.item} disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
            <IconChevronRight size="sm" /><span className="visually-hidden">{nextPage}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
