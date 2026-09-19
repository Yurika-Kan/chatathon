import type { Metadata } from "next";
import { PageHeader } from "../ui/page-header";
import { ResearchBuilder } from "./research-builder";

export const metadata: Metadata = { title: "Research" };

export default function ResearchPage() {
  return (
    <div className="page research-page">
      <PageHeader
        eyebrow="Research library"
        title="What do you want to understand?"
      />
      <ResearchBuilder />
    </div>
  );
}
