import type { Metadata } from "next";
import { PageHeader } from "../ui/page-header";
import { ResearchBuilder } from "./research-builder";

export const metadata: Metadata = { title: "Research" };

export default function ResearchPage() {
  return (
    <div className="page research-page">
      <PageHeader
        eyebrow="Research workspace"
        title="Build the research input."
        description="Choose platforms, companies, and audience groups. The research agent will return competitor analysis, audience signals, and the standout finding."
      />
      <ResearchBuilder />
    </div>
  );
}
