"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/seo", label: "SEO Agent" },
  { href: "/content", label: "Content Strategist" },
  { href: "/outreach", label: "Outreach" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent font-bold text-white">
          Z
        </span>
        <span className="text-sm font-semibold tracking-tight">
          Marketing Agents
        </span>
      </Link>
      <nav className="flex items-center gap-1">
        {links.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-muted hover:text-slate-100"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
