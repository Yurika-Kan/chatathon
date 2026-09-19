import type { Metadata } from "next";
import { PageHeader } from "../ui/page-header";
import { CompanyIntake } from "./company-intake";

export const metadata: Metadata = { title: "Your company" };

export default function OnboardingPage() {
  return (
    <div className="page onboarding-page">
      <PageHeader
        eyebrow="First-time setup"
        title="Teach Campco about your company."
        description="Give the system enough source material to research your market and create work that sounds like your business."
      />
      <CompanyIntake />
    </div>
  );
}
