"use client";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CirclePause,
  Clock3,
  Eye,
  Lightbulb,
  MessageSquareText,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { campaignSuggestions, type SuggestionStatus } from "@/lib/campaigns";

const interests = [
  { label: "Calm operating systems", momentum: "+38% topic volume", strength: 88 },
  { label: "Before-and-after workflows", momentum: "1.8× baseline engagement", strength: 76 },
  { label: "Fewer tools, clearer ownership", momentum: "+21% discussion growth", strength: 67 },
];

const pipeline = [
  { label: "Research", detail: "Corpus and signals ready", state: "complete" },
  { label: "Direction", detail: "Choose the next-wave suggestions", state: "current" },
  { label: "Media", detail: "Generate 4 lever-assigned variants", state: "waiting" },
  { label: "Publish", detail: "Mock wave scheduled after approval", state: "waiting" },
  { label: "Learn", detail: "Attribute results by creative lever", state: "waiting" },
] as const;

export function CampaignWorkspace() {
  const [statuses, setStatuses] = useState<Record<string, SuggestionStatus>>(
    Object.fromEntries(campaignSuggestions.map((suggestion) => [suggestion.id, "pending"])),
  );
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(campaignSuggestions[0].id);

  const approvedCount = useMemo(
    () => Object.values(statuses).filter((status) => status === "approved").length,
    [statuses],
  );

  function setSuggestionStatus(id: string, status: SuggestionStatus) {
    setStatuses((current) => ({ ...current, [id]: status }));
  }

  return (
    <div className="page campaign-page">
      <Link className="back-link" href="/dashboard">
        <ArrowLeft size={16} aria-hidden="true" /> Dashboard
      </Link>

      <header className="campaign-header">
        <div>
          <div className="campaign-kicker">
            <span className="campaign-status" data-status="active">Active</span>
            <span>Demo campaign · Wave 2 of 3</span>
          </div>
          <h1>Customer stories</h1>
          <p>Turn real customer outcomes into an ongoing social proof series for operations leaders.</p>
        </div>
        <div className="campaign-header-actions">
          <button className="button secondary" type="button">
            <CirclePause size={17} aria-hidden="true" /> Pause
          </button>
          <button className="button primary" type="button" disabled={approvedCount === 0}>
            Generate next wave <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className="campaign-facts" aria-label="Campaign facts">
        <div><CalendarDays size={17} aria-hidden="true" /><span><small>Calendar</small><strong>Sep 19–27</strong></span></div>
        <div><Target size={17} aria-hidden="true" /><span><small>Goal</small><strong>Qualified engagement</strong></span></div>
        <div><Users size={17} aria-hidden="true" /><span><small>Audience</small><strong>Operations leads</strong></span></div>
        <div><Zap size={17} aria-hidden="true" /><span><small>Platforms</small><strong>LinkedIn · Reddit</strong></span></div>
      </section>

      <div className="campaign-workspace-layout">
        <main className="campaign-primary">
          <section className="campaign-section" aria-labelledby="opportunities-title">
            <div className="campaign-section-heading">
              <div>
                <p className="eyebrow">Research synthesis</p>
                <h2 id="opportunities-title">Choose the next directions</h2>
                <p>Each suggestion comes from a scored trend, content gap, or unanswered viral moment.</p>
              </div>
              <span className="decision-count" aria-live="polite">{approvedCount} approved</span>
            </div>

            <div className="suggestion-list">
              {campaignSuggestions.map((suggestion) => {
                const status = statuses[suggestion.id];
                const expanded = expandedSuggestion === suggestion.id;

                return (
                  <article className="suggestion-card" data-status={status} key={suggestion.id}>
                    <div className="suggestion-card-main">
                      <div className="suggestion-card-topline">
                        <span className="signal-label" data-signal={suggestion.type.toLowerCase().replace(" ", "-")}>
                          {suggestion.type}
                        </span>
                        <span className="signal-score">Signal {suggestion.score}/100</span>
                      </div>
                      <h3>{suggestion.title}</h3>
                      <p className="suggestion-angle">{suggestion.angle}</p>
                      <p className="suggestion-rationale">{suggestion.rationale}</p>

                      <dl className="suggestion-meta">
                        <div><dt>Audience</dt><dd>{suggestion.audience}</dd></div>
                        <div><dt>Platforms</dt><dd>{suggestion.platforms.join(" · ")}</dd></div>
                      </dl>

                      <button
                        className="evidence-toggle"
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setExpandedSuggestion(expanded ? null : suggestion.id)}
                      >
                        <Eye size={16} aria-hidden="true" />
                        {expanded ? "Hide evidence" : `View ${suggestion.evidence.length} evidence points`}
                        {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                      </button>

                      {expanded ? (
                        <div className="evidence-grid">
                          {suggestion.evidence.map((item) => (
                            <div key={item.summary}>
                              <strong>{item.summary}</strong>
                              <span>{item.detail}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <footer className="suggestion-actions">
                      {status === "approved" ? <span className="decision-state approved"><Check size={15} /> Approved</span> : null}
                      {status === "passed" ? <span className="decision-state passed"><X size={15} /> Passed</span> : null}
                      <button
                        className="button secondary"
                        type="button"
                        onClick={() => setSuggestionStatus(suggestion.id, status === "passed" ? "pending" : "passed")}
                      >
                        {status === "passed" ? "Undo pass" : "Pass"}
                      </button>
                      <button
                        className="button primary"
                        type="button"
                        onClick={() => setSuggestionStatus(suggestion.id, status === "approved" ? "pending" : "approved")}
                      >
                        {status === "approved" ? "Undo approval" : "Approve direction"}
                      </button>
                    </footer>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="campaign-section performance-section" aria-labelledby="performance-title">
            <div className="campaign-section-heading">
              <div>
                <p className="eyebrow">Simulated performance</p>
                <h2 id="performance-title">What Wave 2 taught us</h2>
                <p>Directional results are attributed to the levers that changed, not merely to winning variants.</p>
              </div>
              <span className="performance-lift">+18% engagement</span>
            </div>

            <div className="performance-layout">
              <div className="lever-results">
                <div>
                  <span><strong>Question hook</strong><small>vs. statistic hook</small></span>
                  <meter min="0" max="100" value="82">82%</meter>
                  <strong>+23%</strong>
                </div>
                <div>
                  <span><strong>Carousel</strong><small>vs. single image</small></span>
                  <meter min="0" max="100" value="71">71%</meter>
                  <strong>+14%</strong>
                </div>
                <div>
                  <span><strong>Soft CTA</strong><small>vs. direct CTA</small></span>
                  <meter min="0" max="100" value="61">61%</meter>
                  <strong>+7%</strong>
                </div>
              </div>
              <aside className="refinement-note">
                <Lightbulb size={19} aria-hidden="true" />
                <div>
                  <h3>Next-wave bias</h3>
                  <p>Campco will favor question-led carousel concepts while preserving one alternative hook for exploration.</p>
                </div>
              </aside>
            </div>
            <p className="performance-caveat">Four demo posts per wave provide directional evidence, not statistical significance.</p>
          </section>
        </main>

        <aside className="campaign-secondary">
          <section className="campaign-side-card" aria-labelledby="interests-title">
            <div className="side-card-heading">
              <div>
                <p className="eyebrow">Audience interests</p>
                <h2 id="interests-title">What is resonating</h2>
              </div>
              <MessageSquareText size={19} aria-hidden="true" />
            </div>
            <div className="interest-list">
              {interests.map((interest) => (
                <div key={interest.label}>
                  <span><strong>{interest.label}</strong><small>{interest.momentum}</small></span>
                  <meter min="0" max="100" value={interest.strength}>{interest.strength}%</meter>
                </div>
              ))}
            </div>
          </section>

          <section className="campaign-side-card" aria-labelledby="pipeline-title">
            <div className="side-card-heading">
              <div>
                <p className="eyebrow">Campaign pipeline</p>
                <h2 id="pipeline-title">Current loop</h2>
              </div>
              <Clock3 size={19} aria-hidden="true" />
            </div>
            <ol className="pipeline-list">
              {pipeline.map((step, index) => (
                <li data-state={step.state} key={step.label}>
                  <span>{step.state === "complete" ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
                  <div><strong>{step.label}</strong><small>{step.detail}</small></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="campaign-side-card campaign-cost" aria-labelledby="cost-title">
            <div>
              <p className="eyebrow">Run cost</p>
              <h2 id="cost-title">$24.18</h2>
            </div>
            <BarChart3 size={21} aria-hidden="true" />
            <p>Includes cached Monid retrieval, analysis, GPT calls, and generated media for two demo waves.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
