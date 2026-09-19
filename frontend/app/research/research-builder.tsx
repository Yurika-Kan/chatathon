"use client";

import {
  ArrowRight,
  Building2,
  Check,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type ResearchOption = {
  id: string;
  name: string;
  detail: string;
};

const initialCompanies: ResearchOption[] = [
  { id: "duolingo", name: "Duolingo", detail: "Consumer brand" },
  { id: "notion", name: "Notion", detail: "Productivity software" },
  { id: "canva", name: "Canva", detail: "Design platform" },
];

const initialAudiences: ResearchOption[] = [
  { id: "founders", name: "Startup founders", detail: "Early-stage teams" },
  { id: "social", name: "Social media managers", detail: "In-house and agency" },
  { id: "solo", name: "Solo marketers", detail: "One-person teams" },
  { id: "skincare", name: "Skincare creators", detail: "Creator-led brands" },
];

export function ResearchBuilder() {
  const [companies, setCompanies] = useState(initialCompanies);
  const [audiences, setAudiences] = useState(initialAudiences);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(["duolingo"]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(["social"]);
  const [companyInput, setCompanyInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectionCount = selectedCompanies.length + selectedAudiences.length;
  const selectionSummary = useMemo(() => {
    const companyNames = companies.filter((company) => selectedCompanies.includes(company.id)).map((item) => item.name);
    const audienceNames = audiences.filter((audience) => selectedAudiences.includes(audience.id)).map((item) => item.name);
    return { companyNames, audienceNames };
  }, [audiences, companies, selectedAudiences, selectedCompanies]);

  function toggleSelection(id: string, selected: string[], update: (value: string[]) => void) {
    update(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
    setSubmitted(false);
  }

  function addOption(
    event: FormEvent,
    value: string,
    setValue: (value: string) => void,
    options: ResearchOption[],
    setOptions: (value: ResearchOption[]) => void,
    selected: string[],
    setSelected: (value: string[]) => void,
  ) {
    event.preventDefault();
    const name = value.trim();
    if (!name) return;

    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${options.length}`;
    setOptions([...options, { id, name, detail: "Added by you" }]);
    setSelected([...selected, id]);
    setValue("");
    setSubmitted(false);
  }

  return (
    <div className="research-builder">
      <div className="research-columns">
        <section className="selection-card" aria-labelledby="companies-title">
          <div className="selection-heading">
            <span className="selection-icon blue" aria-hidden="true"><Building2 size={20} /></span>
            <div>
              <h2 id="companies-title">Companies to analyze</h2>
              <p>Choose competitors or brands worth learning from.</p>
            </div>
          </div>
          <div className="selection-list">
            {companies.map((company) => {
              const selected = selectedCompanies.includes(company.id);
              return (
                <button
                  className="selection-option"
                  data-selected={selected || undefined}
                  type="button"
                  aria-pressed={selected}
                  key={company.id}
                  onClick={() => toggleSelection(company.id, selectedCompanies, setSelectedCompanies)}
                >
                  <span><strong>{company.name}</strong><small>{company.detail}</small></span>
                  <span className="selection-check" aria-hidden="true">{selected ? <Check size={14} /> : <Plus size={14} />}</span>
                </button>
              );
            })}
          </div>
          <form
            className="quick-add"
            onSubmit={(event) => addOption(event, companyInput, setCompanyInput, companies, setCompanies, selectedCompanies, setSelectedCompanies)}
          >
            <input
              aria-label="Company name or URL"
              value={companyInput}
              onChange={(event) => setCompanyInput(event.target.value)}
              placeholder="Company name or URL"
            />
            <button className="icon-button" type="submit" aria-label="Add company"><Plus size={18} /></button>
          </form>
        </section>

        <section className="selection-card" aria-labelledby="audiences-title">
          <div className="selection-heading">
            <span className="selection-icon coral" aria-hidden="true"><Users size={20} /></span>
            <div>
              <h2 id="audiences-title">Audiences to research</h2>
              <p>Choose the people whose interests and behavior matter.</p>
            </div>
          </div>
          <div className="selection-list">
            {audiences.map((audience) => {
              const selected = selectedAudiences.includes(audience.id);
              return (
                <button
                  className="selection-option"
                  data-selected={selected || undefined}
                  type="button"
                  aria-pressed={selected}
                  key={audience.id}
                  onClick={() => toggleSelection(audience.id, selectedAudiences, setSelectedAudiences)}
                >
                  <span><strong>{audience.name}</strong><small>{audience.detail}</small></span>
                  <span className="selection-check" aria-hidden="true">{selected ? <Check size={14} /> : <Plus size={14} />}</span>
                </button>
              );
            })}
          </div>
          <form
            className="quick-add"
            onSubmit={(event) => addOption(event, audienceInput, setAudienceInput, audiences, setAudiences, selectedAudiences, setSelectedAudiences)}
          >
            <input
              aria-label="Audience description"
              value={audienceInput}
              onChange={(event) => setAudienceInput(event.target.value)}
              placeholder="Describe another audience"
            />
            <button className="icon-button" type="submit" aria-label="Add audience"><Plus size={18} /></button>
          </form>
        </section>
      </div>

      <section className="research-prompt-card" aria-labelledby="research-direction-title">
        <div className="prompt-heading">
          <Sparkles size={20} aria-hidden="true" />
          <div>
            <h2 id="research-direction-title">Research direction</h2>
            <p>Tell the analyst what you want to learn from these selections.</p>
          </div>
        </div>
        <textarea
          rows={5}
          placeholder="Example: Find the themes and formats that are working with these audiences. Show competitor patterns, gaps, and strong post ideas we could adapt."
          onChange={() => setSubmitted(false)}
        />
        <div className="research-prompt-footer">
          <div className="selection-summary" aria-live="polite">
            <strong>{selectionCount} selected</strong>
            <span>{[...selectionSummary.companyNames, ...selectionSummary.audienceNames].join(", ") || "Add at least one company or audience"}</span>
          </div>
          <button
            className="button primary"
            type="button"
            disabled={selectionCount === 0}
            onClick={() => setSubmitted(true)}
          >
            Start research
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="research-output" aria-labelledby="research-output-title">
        <div className="research-output-icon" aria-hidden="true">
          {submitted ? <Check size={21} /> : <Search size={21} />}
        </div>
        <div>
          <h2 id="research-output-title">{submitted ? "Research brief ready" : "Research results"}</h2>
          <p>
            {submitted
              ? "The company and audience selections are ready for the Monid and analyst pipeline."
              : "Trends, competitor patterns, standout evidence, and post opportunities will appear here."}
          </p>
        </div>
        {submitted ? (
          <button className="button text-button" type="button" onClick={() => setSubmitted(false)}>
            <X size={16} aria-hidden="true" /> Clear
          </button>
        ) : null}
      </section>
    </div>
  );
}
