import * as React from "react";

const LabelsContext = React.createContext<Record<string, string>>({});

/** Localized UI strings. Missing keys keep the English fallback. */
export function LabelProvider({ labels, children }: { labels?: Record<string, string>; children: React.ReactNode }) {
  return <LabelsContext.Provider value={labels ?? {}}>{children}</LabelsContext.Provider>;
}

export function useLabel(key: string, fallback: string, values?: Record<string, string | number>) {
  const labels = React.useContext(LabelsContext);
  const template = labels[key] || fallback;
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => (values[name] == null ? "" : String(values[name])));
}
