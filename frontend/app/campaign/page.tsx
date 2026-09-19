import type { Metadata } from "next";
import { CampaignWorkspace } from "./campaign-workspace";

export const metadata: Metadata = { title: "Customer stories" };

export default function CampaignPage() {
  return <CampaignWorkspace />;
}
