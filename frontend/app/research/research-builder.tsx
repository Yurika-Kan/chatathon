"use client";

import { ArrowUpRight, Building2, Globe2, Plus, Sparkles, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CompanyMark } from "@/app/ui/company-mark";
import { readStoredValue } from "@/lib/browser-storage";
import type { ResearchEntityType } from "@/lib/research";
import { isOnboardingDraft, isResearchDraft, storageKeys, type ResearchDraft } from "@/lib/storage-schema";
import { usePersistedState } from "@/lib/use-persisted-state";

const platformOptions = ["Reddit", "LinkedIn", "Instagram", "X"];

const initialDraft: ResearchDraft = {
  platforms: ["Reddit", "LinkedIn", "Instagram"],
  companies: ["Amazon", "Google", "Duolingo"],
  audiences: ["Women ages 18–20 based in Texas"],
  companyInput: "",
  audienceInput: "",
  goalTitle: "",
  goalDescription: "",
  submitted: false,
  initializedFromOnboarding: false,
};

function EntityList({
  icon,
  type,
  title,
  items,
  input,
  placeholder,
  setInput,
  onAdd,
  onRemove,
  onStart,
}: {
  icon: ReactNode;
  type: ResearchEntityType;
  title: string;
  items: string[];
  input: string;
  placeholder: string;
  setInput: (value: string) => void;
  onAdd: (event: FormEvent) => void;
  onRemove: (item: string) => void;
  onStart: (type: ResearchEntityType, item: string) => void;
}) {
  return (
    <section className="research-input-card">
      <div className="research-input-heading compact">
        <span className={`selection-icon ${type === "company" ? "blue" : "coral"}`} aria-hidden="true">
          {icon}
        </span>
        <h2>{title}</h2>
      </div>

      <div className="research-entity-list">
        {items.map((item, index) => (
          <div className="research-entity-row" key={item} style={{ animationDelay: `${index * 35}ms` }}>
            <button
              className="research-entity-action"
              type="button"
              onClick={() => onStart(type, item)}
              aria-label={`Start research on ${item}`}
            >
              <span className="research-entity-identity">
                {type === "company" ? (
                  <CompanyMark company={item} />
                ) : (
                  <span className="audience-mark" aria-hidden="true"><Users size={15} /></span>
                )}
                <strong>{item}</strong>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </button>
            <button
              className="research-entity-remove"
              type="button"
              onClick={() => onRemove(item)}
              aria-label={`Remove ${item}`}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
        {items.length === 0 ? <p className="list-empty">Add one to begin.</p> : null}
      </div>

      <form className="quick-add" onSubmit={onAdd}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          aria-label={`Add to ${title.toLowerCase()}`}
        />
        <button className="icon-button" type="submit" aria-label={`Add to ${title.toLowerCase()}`}>
          <Plus size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

export function ResearchBuilder() {
  const router = useRouter();
  const [draft, setDraft, hydrated] = usePersistedState(storageKeys.researchDraft, initialDraft, isResearchDraft);
  const { platforms, companies, audiences, companyInput, audienceInput } = draft;
  const [error, setError] = useState("");

  function updateDraft(patch: Partial<ResearchDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  useEffect(() => {
    if (!hydrated || draft.initializedFromOnboarding) return;
    void readStoredValue(storageKeys.onboardingDraft, isOnboardingDraft).then((onboarding) => {
      setDraft((current) => ({
        ...current,
        companies: onboarding?.competitors.length ? onboarding.competitors : current.companies,
        audiences: onboarding?.audiences.length ? onboarding.audiences : current.audiences,
        platforms: onboarding?.platforms.length ? onboarding.platforms : current.platforms,
        goalTitle: onboarding?.goalTitle || current.goalTitle,
        goalDescription: onboarding?.goalDescription || current.goalDescription,
        initializedFromOnboarding: true,
      }));
    });
  }, [draft.initializedFromOnboarding, hydrated, setDraft]);

  function addItem(
    event: FormEvent,
    value: string,
    setValue: (value: string) => void,
    items: string[],
    setItems: (value: string[]) => void,
  ) {
    event.preventDefault();
    const nextItem = value.trim();
    if (!nextItem || items.some((item) => item.toLocaleLowerCase() === nextItem.toLocaleLowerCase())) return;
    setItems([...items, nextItem]);
    setValue("");
  }

  function startResearch(entityType: ResearchEntityType, entityName: string) {
    if (platforms.length === 0) {
      setError("Select a platform first.");
      return;
    }

    const query = new URLSearchParams({ entityType, entityName });
    platforms.forEach((platform) => query.append("platform", platform));
    router.push(`/research/new?${query.toString()}`);
  }

  return (
    <div className="research-builder">
      <section className="platform-card" aria-labelledby="platforms-title">
        <div className="research-input-heading compact">
          <span className="selection-icon lime" aria-hidden="true"><Globe2 size={20} /></span>
          <h2 id="platforms-title">Platforms</h2>
        </div>
        <div className="platform-grid research-platform-grid">
          {platformOptions.map((platform) => (
            <label className="platform-option" key={platform}>
              <input
                type="checkbox"
                checked={platforms.includes(platform)}
                onChange={(event) => {
                  updateDraft({
                    platforms: event.target.checked
                      ? [...platforms, platform]
                      : platforms.filter((item) => item !== platform),
                  });
                  setError("");
                }}
              />
              <span>{platform}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="research-choice-note">
        <Sparkles size={17} aria-hidden="true" />
        <strong>Choose a company or audience.</strong>
      </div>

      {error ? <div className="research-error" role="alert">{error}</div> : null}

      <div className="research-columns">
        <EntityList
          icon={<Building2 size={20} />}
          type="company"
          title="Companies"
          items={companies}
          input={companyInput}
          placeholder="Add company name or URL"
          setInput={(value) => updateDraft({ companyInput: value })}
          onAdd={(event) => addItem(event, companyInput, (value) => updateDraft({ companyInput: value }), companies, (value) => updateDraft({ companies: value }))}
          onRemove={(item) => updateDraft({ companies: companies.filter((entry) => entry !== item) })}
          onStart={startResearch}
        />
        <EntityList
          icon={<Users size={20} />}
          type="audience"
          title="Audiences"
          items={audiences}
          input={audienceInput}
          placeholder="Add an audience"
          setInput={(value) => updateDraft({ audienceInput: value })}
          onAdd={(event) => addItem(event, audienceInput, (value) => updateDraft({ audienceInput: value }), audiences, (value) => updateDraft({ audiences: value }))}
          onRemove={(item) => updateDraft({ audiences: audiences.filter((entry) => entry !== item) })}
          onStart={startResearch}
        />
      </div>
    </div>
  );
}
