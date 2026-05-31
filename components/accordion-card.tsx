"use client";
import { useState } from "react";
export default function AccordionCard({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card accordion-card">
      <button
        className="accordion-trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <h3>{title}</h3>
          <p className="subtle" style={{ marginTop: 8 }}>
            {subtitle}
          </p>
        </div>
        <span className="chip">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? <div className="accordion-body">{children}</div> : null}
    </div>
  );
}
