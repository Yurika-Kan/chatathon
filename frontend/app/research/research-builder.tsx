"use client";

import {
  ArrowRight,
  Building2,
  Check,
  Globe2,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { ResearchRequest } from "@/lib/research";
import { CompanyMark } from "@/app/ui/company-mark";

type OnboardingDraft = {
  competitors?: string[];
  audiences?: string[];
  platforms?: string[];
  goalTitle?: string;
  goalDescription?: string;
};

const platformOptions = ["Reddit", "LinkedIn", "Instagram", "X"];

function InputList({
  icon,
  title,
  description,
  items,
  input,
  placeholder,
  setInput,
  onAdd,
  onRemove,
  kind,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  items: string[];
  input: string;
  placeholder: string;
  setInput: (value: string) => void;
  onAdd: (event: FormEvent) => void;
  onRemove: (item: string) => void;
  kind: "company" | "audience";
}) {
  return (
    <section className="research-input-card">
      <div className="research-input-heading">
        <span className="selection-icon blue" aria-hidden="true">{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="research-input-list">
        {items.map((item, index) => (
          <div
            className="research-input-row"
            key={item}
            style={{ animationDelay: `${index * 35}ms` }}
          >
            <span className="item-identity">
              {kind === "company" ? (
                <CompanyMark company={item} />
              ) : (
                <span className="audience-mark" aria-hidden="true"><Users size={15} /></span>
              )}
              <span>{item}</span>
            </span>
            <button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item}`}>
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
        {items.length === 0 ? <p className="list-empty">Add at least one.</p> : null}
      </div>
      <form className="quick-add" onSubmit={onAdd}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
        <button className="icon-button" type="submit" aria-label={`Add to ${title.toLowerCase()}`}>
          <Plus size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

export function ResearchBuilder() {
  const [platforms, setPlatforms] = useState<string[]>(["Reddit", "LinkedIn", "Instagram"]);
  const [companies, setCompanies] = useState<string[]>(["Amazon", "Google", "Duolingo"]);
  const [audiences, setAudiences] = useState<string[]>(["Women ages 18–20 based in Texas"]);
  const [companyInput, setCompanyInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const storedDraft = sessionStorage.getItem("campco-onboarding-draft");
    if (!storedDraft) return;

    try {
      const draft = JSON.parse(storedDraft) as OnboardingDraft;
      if (draft.competitors?.length) setCompanies(draft.competitors);
      if (draft.audiences?.length) setAudiences(draft.audiences);
      if (draft.platforms?.length) setPlatforms(draft.platforms);
      setGoalTitle(draft.goalTitle ?? "");
      setGoalDescription(draft.goalDescription ?? "");
    } catch {
      sessionStorage.removeItem("campco-onboarding-draft");
    }
  }, []);

  function addItem(
    event: FormEvent,
    value: string,
    setValue: (value: string) => void,
    items: string[],
    setItems: (value: string[]) => void,
  ) {
    event.preventDefault();
    const nextItem = value.trim();
    if (!nextItem || items.includes(nextItem)) return;
    setItems([...items, nextItem]);
    setValue("");
    setSubmitted(false);
  }

  const ready = platforms.length > 0 && companies.length > 0 && audiences.length > 0;

  function runResearch() {
    const request: ResearchRequest = { platforms, companies, audiences };
    sessionStorage.setItem("campco-research-request", JSON.stringify(request));
    setSubmitted(true);
  }

  return (
    <div className="research-builder">
      {goalTitle || goalDescription ? (
        <section className="goal-strip" aria-label="Campaign goal">
          <span className="selection-icon lime" aria-hidden="true"><Sparkles size={19} /></span>
          <div>
            <span>Campaign goal</span>
            <strong>{goalTitle || "Untitled campaign"}</strong>
            {goalDescription ? <p>{goalDescription}</p> : null}
          </div>
        </section>
      ) : null}

      <section className="platform-card" aria-labelledby="platforms-title">
        <div className="research-input-heading">
          <span className="selection-icon coral" aria-hidden="true"><Globe2 size={20} /></span>
          <div>
            <h2 id="platforms-title">Platforms</h2>
            <p>Choose where the research agent should look for recent marketing and audience signals.</p>
          </div>
        </div>
        <div className="platform-grid research-platform-grid">
          {platformOptions.map((platform) => (
            <label className="platform-option" key={platform}>
              <input
                type="checkbox"
                checked={platforms.includes(platform)}
                onChange={(event) => {
                  setPlatforms(event.target.checked
                    ? [...platforms, platform]
                    : platforms.filter((item) => item !== platform));
                  setSubmitted(false);
                }}
              />
              <span>{platform}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="research-columns">
        <InputList
          icon={<Building2 size={20} />}
          kind="company"
          title="Companies"
          description="Competitors or reference brands to analyze."
          items={companies}
          input={companyInput}
          placeholder="Add company name or URL"
          setInput={setCompanyInput}
          onAdd={(event) => addItem(event, companyInput, setCompanyInput, companies, setCompanies)}
          onRemove={(item) => {
            setCompanies(companies.filter((entry) => entry !== item));
            setSubmitted(false);
          }}
        />
        <InputList
          icon={<Users size={20} />}
          kind="audience"
          title="Audiences"
          description="Use plain language and be as specific as useful."
          items={audiences}
          input={audienceInput}
          placeholder="e.g. Women 18–20 in Texas"
          setInput={setAudienceInput}
          onAdd={(event) => addItem(event, audienceInput, setAudienceInput, audiences, setAudiences)}
          onRemove={(item) => {
            setAudiences(audiences.filter((entry) => entry !== item));
            setSubmitted(false);
          }}
        />
      </div>

      <div className="research-run-bar">
        <div>
          <strong>{ready ? "Research input ready" : "Complete all three inputs"}</strong>
          <span>{platforms.length} platforms · {companies.length} companies · {audiences.length} audiences</span>
        </div>
        <button className="button primary" type="button" disabled={!ready} onClick={runResearch}>
          Run research
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>

      {!submitted ? (
        <section className="research-output empty" aria-labelledby="research-output-title">
          <span className="research-output-icon" aria-hidden="true"><Search size={21} /></span>
          <div>
            <h2 id="research-output-title">Research output</h2>
            <p>Company analysis, audience signals, and standout data will appear here.</p>
          </div>
        </section>
      ) : (
        <section className="results-shell" aria-labelledby="research-output-title">
          <div className="results-heading">
            <div>
              <p className="eyebrow">Output contract</p>
              <h2 id="research-output-title">Research request ready</h2>
              <p>The backend can now discover data sources, run them, and synthesize the response into these three outputs.</p>
            </div>
            <span className="ready-state"><Check size={14} /> Brief ready</span>
          </div>

          <div className="result-section">
            <h3>Company analysis</h3>
            <p className="result-section-description">One text result per company: what is working, what is not, and gaps worth pursuing.</p>
            <div className="result-items">
              {companies.map((company) => (
                <article className="result-item" key={company}>
                  <strong className="item-identity">
                    <CompanyMark company={company} />
                    <span>{company}</span>
                  </strong>
                  <span>Company research will map here.</span>
                </article>
              ))}
            </div>
          </div>

          <div className="result-section">
            <h3>Audience signals</h3>
            <p className="result-section-description">One text result per audience: what they are engaging with and responding to recently.</p>
            <div className="result-items">
              {audiences.map((audience) => (
                <article className="result-item" key={audience}>
                  <strong>{audience}</strong>
                  <span>Audience research will map here.</span>
                </article>
              ))}
            </div>
          </div>

          <div className="standout-result">
            <span className="selection-icon lime" aria-hidden="true"><Sparkles size={19} /></span>
            <div>
              <h3>Standout data</h3>
              <p>The analyst’s most important cross-company or cross-audience finding will appear here.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
