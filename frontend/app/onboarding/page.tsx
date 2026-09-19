import type { Metadata } from "next";
import { PageHeader } from "../ui/page-header";
import { CompanyIntake } from "./company-intake";

export const metadata: Metadata = { title: "Your company" };

export default function OnboardingPage() {
  return (
    <div className="page onboarding-page">
      <PageHeader
        eyebrow="First-time setup"
        title="Connect your company to Campco."
        description="Start with the company website and social presence. Campco will propose competitors and audience groups before you define the first campaign goal."
      />
      <CompanyIntake />
    </div>
  );
}
