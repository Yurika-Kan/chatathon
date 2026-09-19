import { ArrowLeft, Building2, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResearchRunner } from "./research-runner";

export const metadata: Metadata = { title: "New research" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewResearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const entityType = query.entityType;
  const entityName = query.entityName;
  const platforms = Array.isArray(query.platform) ? query.platform : query.platform ? [query.platform] : [];

  if ((entityType !== "company" && entityType !== "audience") || typeof entityName !== "string") {
    redirect("/research");
  }

  const EntityIcon = entityType === "company" ? Building2 : Users;

  return (
    <div className="page research-detail-page">
      <Link className="back-link" href="/research"><ArrowLeft size={16} /> Research</Link>

      <header className="research-detail-header compact">
        <span className={`research-detail-icon ${entityType}`} aria-hidden="true"><EntityIcon size={24} /></span>
        <div>
          <p className="eyebrow">{entityType} research</p>
          <h1>{entityName}</h1>
        </div>
      </header>

      <div className="research-platform-tags" aria-label="Selected platforms">
        {platforms.map((platform) => <span key={platform}>{platform}</span>)}
      </div>
      <ResearchRunner entityType={entityType} entityName={entityName} platforms={platforms} />
    </div>
  );
}
