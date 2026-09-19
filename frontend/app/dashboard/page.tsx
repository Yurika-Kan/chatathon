import type { Metadata } from "next";
import {
  ArrowRight,
  CirclePlus,
  Clock3,
  Lightbulb,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { campaignSummaries } from "@/lib/campaigns";
import { PageHeader } from "../ui/page-header";

export const metadata: Metadata = { title: "Dashboard" };

const learnings = [
  {
    title: "Question hooks are winning",
    detail: "They produced 23% more engagement than statistic-led openings across two waves.",
  },
  {
    title: "LinkedIn carousels earn the saves",
    detail: "Carousel posts are the strongest format for operations audiences in this workspace.",
  },
];

export default function DashboardPage() {
  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="Workspace overview"
        title="Keep the campaign loop moving."
        description="See what needs a decision, what is running, and what Campco has learned across active organic campaigns."
        action={(
          <Link className="button primary" href="/onboarding">
            <CirclePlus size={17} aria-hidden="true" /> New campaign
          </Link>
        )}
      />

      <section className="attention-banner" aria-labelledby="attention-title">
        <div className="attention-icon" aria-hidden="true"><Clock3 size={21} /></div>
        <div>
          <p className="eyebrow">Needs your attention</p>
          <h2 id="attention-title">Customer stories has 3 next-wave directions ready.</h2>
          <p>Research is complete. Review the evidence and choose which directions should shape the next media wave.</p>
        </div>
        <Link className="button primary" href="/campaign">
          Review suggestions <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <section className="dashboard-summary" aria-label="Campaign summary">
        <div>
          <strong>3</strong>
          <span>Campaigns in workspace</span>
        </div>
        <div>
          <strong>2</strong>
          <span>Running or awaiting approval</span>
        </div>
        <div>
          <strong>+14%</strong>
          <span>Average wave-over-wave lift</span>
        </div>
        <div>
          <strong>$43.96</strong>
          <span>Demo research and generation spend</span>
        </div>
      </section>

      <div className="dashboard-layout">
        <section className="campaigns-panel" aria-labelledby="campaigns-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Campaigns</p>
              <h2 id="campaigns-title">Current work</h2>
            </div>
            <button className="button text-button" type="button">View all</button>
          </div>

          <div className="campaign-table-wrap">
            <table className="campaign-table">
              <thead>
                <tr>
                  <th scope="col">Campaign</th>
                  <th scope="col">State</th>
                  <th scope="col">Next step</th>
                  <th scope="col">Performance</th>
                  <th scope="col"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {campaignSummaries.map((campaign) => (
                  <tr key={campaign.id}>
                    <td data-label="Campaign">
                      <strong>{campaign.name}</strong>
                      <small>{campaign.platforms.join(" · ")}</small>
                    </td>
                    <td data-label="State">
                      <span className="campaign-status" data-status={campaign.status.toLowerCase().replace(" ", "-")}>
                        {campaign.status}
                      </span>
                      <small>{campaign.wave}</small>
                    </td>
                    <td data-label="Next step">{campaign.nextAction}</td>
                    <td data-label="Performance">{campaign.performance}</td>
                    <td>
                      <Link className="table-link" href="/campaign" aria-label={`Open ${campaign.name}`}>
                        <ArrowRight size={17} aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="learning-panel" aria-labelledby="learning-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Learning state</p>
              <h2 id="learning-title">What is working</h2>
            </div>
            <Lightbulb size={20} aria-hidden="true" />
          </div>
          <div className="learning-list">
            {learnings.map((learning) => (
              <article key={learning.title}>
                <TrendingUp size={17} aria-hidden="true" />
                <div>
                  <h3>{learning.title}</h3>
                  <p>{learning.detail}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="learning-note">Directional demo findings, not statistically significant conclusions.</p>
        </aside>
      </div>

      <section className="spend-strip" aria-labelledby="spend-title">
        <span className="spend-icon" aria-hidden="true"><ReceiptText size={20} /></span>
        <div>
          <h2 id="spend-title">Workspace spend</h2>
          <p>Monid tools, GPT calls, and media generation are tracked per stage.</p>
        </div>
        <dl>
          <div><dt>Data collection</dt><dd>$18.22</dd></div>
          <div><dt>Text and analysis</dt><dd>$9.84</dd></div>
          <div><dt>Media generation</dt><dd>$15.90</dd></div>
        </dl>
      </section>
    </div>
  );
}
