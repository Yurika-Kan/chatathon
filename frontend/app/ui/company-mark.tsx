"use client";

import { useState } from "react";

const knownCompanyDomains: Record<string, string> = {
  amazon: "amazon.com",
  canva: "canva.com",
  duolingo: "duolingo.com",
  google: "google.com",
  notion: "notion.so",
};

function resolveCompanyDomain(company: string) {
  const normalized = company.trim().toLowerCase();
  if (knownCompanyDomains[normalized]) return knownCompanyDomains[normalized];
  if (!normalized.includes(".") && !normalized.includes("://")) return null;

  try {
    const url = new URL(company.includes("://") ? company : `https://${company}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function CompanyMark({ company }: { company: string }) {
  const [failed, setFailed] = useState(false);
  const domain = resolveCompanyDomain(company);
  const initial = company.trim().charAt(0).toUpperCase() || "?";

  return (
    <span className="company-mark" aria-hidden="true">
      <span className="company-mark-fallback">{initial}</span>
      {domain && !failed ? (
        // A plain image keeps arbitrary discovered domains compatible without a remote image allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
          alt=""
          width="20"
          height="20"
          onError={() => setFailed(true)}
        />
      ) : null}
    </span>
  );
}
