import type { Metadata } from "next";
import { PageHeader } from "../ui/page-header";
import { ResearchBuilder } from "./research-builder";

export const metadata: Metadata = { title: "Research" };

export default function ResearchPage() {
  return (
    <div className="page research-page">
      <PageHeader
        eyebrow="Research workspace"
        title="Choose what Campco should investigate."
        description="Select companies and audiences, then give the research engine a question or direction."
      />
      <ResearchBuilder />
    </div>
  );
}
