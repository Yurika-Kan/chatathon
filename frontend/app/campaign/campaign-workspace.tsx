"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { campaignSuggestions } from "@/lib/campaigns";

type DataView = "opportunities" | "source" | "results";

const views: { id: DataView; label: string }[] = [
  { id: "opportunities", label: "Opportunities" },
  { id: "source", label: "Source data" },
  { id: "results", label: "Results" },
];

const opportunityMetrics: Record<string, { evidence: string; platform: string }> = {
  "monday-reset": { evidence: "Volume +38% · engagement +24%", platform: "LinkedIn" },
  "show-the-work": { evidence: "Audience 1.8× · competitor coverage 6%", platform: "LinkedIn" },
  "anti-productivity": { evidence: "Breakout z 3.1 · no competitor response", platform: "Reddit" },
};

const topics = [
  { id: "weekly-reset", label: "Weekly reset rituals", posts: 18, volume: "+38%", engagement: "5.6%", audience: "31%", competitor: "6%", company: "4%" },
  { id: "workflow-transformations", label: "Workflow transformations", posts: 12, volume: "+19%", engagement: "6.3%", audience: "26%", competitor: "6%", company: "8%" },
  { id: "tool-fatigue", label: "Tool fatigue", posts: 23, volume: "+31%", engagement: "7.1%", audience: "41%", competitor: "0%", company: "0%" },
] as const;

const topicEvidence: Record<string, { source: string; platform: string; excerpt: string; metric: string }[]> = {
  "weekly-reset": [
    { source: "Operations Weekly", platform: "Reddit", excerpt: "What does your team reset every Monday?", metric: "7.4% ER · z 2.2" },
    { source: "Linear", platform: "LinkedIn", excerpt: "A calmer way to begin the operating week", metric: "5.9% ER · z 1.6" },
    { source: "r/operations", platform: "Reddit", excerpt: "The five-minute ritual that stopped status hunting", metric: "6.8% ER · z 1.9" },
  ],
  "workflow-transformations": [
    { source: "OpsLevel", platform: "LinkedIn", excerpt: "Before and after: one project handoff", metric: "8.1% ER · z 2.4" },
    { source: "r/startups", platform: "Reddit", excerpt: "We removed three steps from weekly reporting", metric: "6.4% ER · z 1.7" },
    { source: "Asana", platform: "LinkedIn", excerpt: "What changed when ownership became visible", metric: "5.5% ER · z 1.3" },
  ],
  "tool-fatigue": [
    { source: "r/productivity", platform: "Reddit", excerpt: "I do not need another productivity system", metric: "9.3% ER · z 3.1" },
    { source: "r/operations", platform: "Reddit", excerpt: "More software made our reporting less clear", metric: "7.8% ER · z 2.5" },
    { source: "Operations Nation", platform: "LinkedIn", excerpt: "The case for fewer operating tools", metric: "6.2% ER · z 1.8" },
  ],
};

const mediaResults = [
  { id: "A1", platform: "LinkedIn", levers: "Question · Carousel · Soft CTA", impressions: "12.4k", engagement: "5.8%", zScore: "1.7" },
  { id: "A2", platform: "Reddit", levers: "Question · Text · Soft CTA", impressions: "9.8k", engagement: "6.2%", zScore: "2.0" },
  { id: "B1", platform: "LinkedIn", levers: "Statistic · Carousel · Soft CTA", impressions: "11.9k", engagement: "4.1%", zScore: "0.8" },
  { id: "B2", platform: "Reddit", levers: "Statistic · Text · Soft CTA", impressions: "10.1k", engagement: "4.4%", zScore: "0.9" },
] as const;

const leverStats = [
  { lever: "Hook", value: "Question", trials: 4, wins: 3, lift: "+23%" },
  { lever: "Format", value: "Carousel", trials: 4, wins: 3, lift: "+14%" },
  { lever: "CTA", value: "Soft", trials: 4, wins: 2, lift: "+7%" },
] as const;

export function CampaignWorkspace() {
  const [view, setView] = useState<DataView>("opportunities");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(campaignSuggestions[0].id);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0].id);

  const selectedOpportunity = campaignSuggestions.find((item) => item.id === selectedOpportunityId) ?? campaignSuggestions[0];
  const selectedTopic = topics.find((item) => item.id === selectedTopicId) ?? topics[0];

  return (
    <div className="page campaign-page campaign-data-page">
      <Link className="back-link" href="/dashboard">
        <ArrowLeft size={16} aria-hidden="true" /> Dashboard
      </Link>

      <header className="campaign-data-header">
        <p>Campaign data · Demo corpus</p>
        <h1>Customer stories</h1>
        <div className="campaign-data-context">
          <span>Goal: qualified engagement</span>
          <span>Operations leads</span>
          <span>LinkedIn + Reddit</span>
          <span>Sep 19–27</span>
        </div>
      </header>

      <div className="campaign-data-surface">
        <nav className="campaign-data-tabs" aria-label="Campaign data views">
          {views.map((item) => (
            <button
              aria-pressed={view === item.id}
              className="campaign-data-tab"
              key={item.id}
              onClick={() => setView(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {view === "opportunities" ? (
          <section className="campaign-data-panel" aria-labelledby="opportunities-heading">
            <header className="campaign-data-panel-heading">
              <div>
                <h2 id="opportunities-heading">Research opportunities</h2>
                <p>Deterministically scored from topic momentum, audience response, and competitor coverage.</p>
              </div>
              <span>3 signals</span>
            </header>

            <div className="campaign-data-split">
              <div className="campaign-data-table-wrap">
                <table className="campaign-data-table">
                  <thead>
                    <tr>
                      <th scope="col">Opportunity</th>
                      <th scope="col">Signal</th>
                      <th scope="col">Score</th>
                      <th scope="col">Strongest evidence</th>
                      <th scope="col">Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignSuggestions.map((suggestion) => {
                      const selected = suggestion.id === selectedOpportunity.id;
                      const metrics = opportunityMetrics[suggestion.id];

                      return (
                        <tr data-selected={selected || undefined} key={suggestion.id}>
                          <td data-label="Opportunity">
                            <button aria-pressed={selected} className="campaign-data-row-button" onClick={() => setSelectedOpportunityId(suggestion.id)} type="button">
                              {suggestion.title}
                            </button>
                            <small>{suggestion.angle}</small>
                          </td>
                          <td data-label="Signal"><span className="signal-label" data-signal={suggestion.type.toLowerCase().replace(" ", "-")}>{suggestion.type}</span></td>
                          <td data-label="Score"><strong>{suggestion.score}</strong></td>
                          <td data-label="Evidence">{metrics.evidence}</td>
                          <td data-label="Platform">{metrics.platform}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <aside className="campaign-data-detail" aria-live="polite">
                <div className="campaign-data-detail-topline">
                  <span className="signal-label" data-signal={selectedOpportunity.type.toLowerCase().replace(" ", "-")}>{selectedOpportunity.type}</span>
                  <strong>{selectedOpportunity.score}/100</strong>
                </div>
                <h3>{selectedOpportunity.title}</h3>
                <p className="campaign-data-angle">{selectedOpportunity.angle}</p>
                <p>{selectedOpportunity.rationale}</p>
                <dl className="campaign-data-definition">
                  <div><dt>Audience</dt><dd>{selectedOpportunity.audience}</dd></div>
                  <div><dt>Platforms</dt><dd>{selectedOpportunity.platforms.join(" · ")}</dd></div>
                </dl>
                <h4>Evidence</h4>
                <div className="campaign-evidence-list">
                  {selectedOpportunity.evidence.map((item) => (
                    <div key={item.summary}><strong>{item.summary}</strong><span>{item.detail}</span></div>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {view === "source" ? (
          <section className="campaign-data-panel" aria-labelledby="source-heading">
            <header className="campaign-data-panel-heading">
              <div>
                <h2 id="source-heading">Topic corpus</h2>
                <p>Normalized audience, competitor, and company coverage from the cached post corpus.</p>
              </div>
              <span>53 posts</span>
            </header>

            <div className="campaign-data-split">
              <div className="campaign-data-table-wrap">
                <table className="campaign-data-table source-data-table">
                  <thead>
                    <tr>
                      <th scope="col">Topic</th>
                      <th scope="col">Volume</th>
                      <th scope="col">Mean ER</th>
                      <th scope="col">Audience</th>
                      <th scope="col">Competitors</th>
                      <th scope="col">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((topic) => {
                      const selected = topic.id === selectedTopic.id;

                      return (
                        <tr data-selected={selected || undefined} key={topic.id}>
                          <td data-label="Topic">
                            <button aria-pressed={selected} className="campaign-data-row-button" onClick={() => setSelectedTopicId(topic.id)} type="button">
                              {topic.label}
                            </button>
                            <small>{topic.posts} posts</small>
                          </td>
                          <td data-label="Volume">{topic.volume}</td>
                          <td data-label="Mean ER">{topic.engagement}</td>
                          <td data-label="Audience">{topic.audience}</td>
                          <td data-label="Competitors">{topic.competitor}</td>
                          <td data-label="Company">{topic.company}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <aside className="campaign-data-detail" aria-live="polite">
                <p className="campaign-data-detail-label">Evidence posts</p>
                <h3>{selectedTopic.label}</h3>
                <p>{selectedTopic.posts} posts in this topic cluster, ranked by account-relative performance.</p>
                <div className="source-evidence-list">
                  {topicEvidence[selectedTopic.id].map((item) => (
                    <article key={`${item.source}-${item.excerpt}`}>
                      <div><strong>{item.source}</strong><span>{item.platform}</span></div>
                      <p>{item.excerpt}</p>
                      <small>{item.metric}</small>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {view === "results" ? (
          <section className="campaign-data-panel" aria-labelledby="results-heading">
            <header className="campaign-data-panel-heading">
              <div>
                <h2 id="results-heading">Wave 2 results</h2>
                <p>Four simulated posts, normalized against each account&apos;s trailing baseline.</p>
              </div>
              <span>Directional</span>
            </header>

            <div className="campaign-data-split">
              <div className="campaign-data-table-wrap">
                <table className="campaign-data-table results-data-table">
                  <thead>
                    <tr>
                      <th scope="col">Media</th>
                      <th scope="col">Lever assignment</th>
                      <th scope="col">Impressions</th>
                      <th scope="col">Engagement rate</th>
                      <th scope="col">z-score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediaResults.map((result) => (
                      <tr key={result.id}>
                        <td data-label="Media"><strong>{result.id}</strong><small>{result.platform}</small></td>
                        <td data-label="Levers">{result.levers}</td>
                        <td data-label="Impressions">{result.impressions}</td>
                        <td data-label="Engagement rate"><strong>{result.engagement}</strong></td>
                        <td data-label="z-score">{result.zScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <aside className="campaign-data-detail results-detail">
                <p className="campaign-data-detail-label">Learned levers</p>
                <h3>What carries into the next wave</h3>
                <div className="lever-stat-list">
                  {leverStats.map((stat) => (
                    <div key={stat.lever}>
                      <span><strong>{stat.lever}</strong><small>{stat.value}</small></span>
                      <span><small>{stat.wins}/{stat.trials} wins</small><strong>{stat.lift}</strong></span>
                    </div>
                  ))}
                </div>
                <p className="campaign-data-caveat">Four posts provide directional evidence, not statistical significance.</p>
              </aside>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
