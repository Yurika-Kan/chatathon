"use client";

import { Building2, FlaskConical, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/onboarding", label: "Your company", icon: Building2 },
  { href: "/research", label: "Research", icon: FlaskConical },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/onboarding" aria-label="Campco home">
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={17} strokeWidth={2.3} />
          </span>
          <span>campco</span>
        </Link>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                className="nav-link"
                data-active={isActive || undefined}
                href={item.href}
                key={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <span className="workspace-avatar" aria-hidden="true">C</span>
          <span>
            <strong>Campco workspace</strong>
            <small>Prototype</small>
          </span>
          <Layers3 size={17} aria-hidden="true" />
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
