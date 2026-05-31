"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
const links = [
  { href: "/", label: "Dashboard" },
  { href: "/monitoring", label: "Monitoring" },
  // { href: "/corridor/feeder-1a", label: "Corridor Detail" },
  { href: "/developer", label: "Developer" },
];
export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) =>
    pathname === href ||
    (href.startsWith("/corridor") && pathname.startsWith("/corridor")) ||
    pathname.startsWith("/halte");
  return (
    <div className="app-nav-wrap">
      <nav className="app-nav">
        <div className="app-brand">
          <span className="brand-dot" />
          <span>SmartTransit Jakarta</span>
        </div>
        <button className="nav-toggle" onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : "Menu"}
        </button>
        <div className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${active(l.href) ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
