"use client";

import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  Globe2,
  Link2,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CompanyMark } from "@/app/ui/company-mark";
import { usePersistedState } from "@/lib/use-persisted-state";
import { isOnboardingDraft, storageKeys, type OnboardingDraft } from "@/lib/storage-schema";

const steps = ["Connect", "Discover", "Campaign"] as const;
const campaignPlatforms = ["Reddit", "LinkedIn", "Instagram", "X"];

const suggestedCompetitors = ["Duolingo", "Notion", "Canva"];
const suggestedAudiences = [
  "Startup founders at teams under 20 people",
  "Social media managers at growing brands",
  "Solo marketers building their first content engine",
];

const initialDraft: OnboardingDraft = {
  step: 0,
  discovered: false,
  website: "",
  linkedinUrl: "",
  instagramUrl: "",
  redditUrl: "",
  xUrl: "",
  companyContext: "",
  competitors: [],
  audiences: [],
  competitorInput: "",
  audienceInput: "",
  goalTitle: "",
  goalDescription: "",
  platforms: ["Reddit", "LinkedIn", "Instagram"],
};

function EditableList({
  label,
  items,
  input,
  placeholder,
  setInput,
  onAdd,
  onRemove,
  kind,
}: {
  label: string;
  items: string[];
  input: string;
  placeholder: string;
  setInput: (value: string) => void;
  onAdd: () => void;
  onRemove: (item: string) => void;
  kind: "company" | "audience";
}) {
  return (
    <div className="editable-list">
      <span className="editable-list-label">{label}</span>
      <div className="editable-list-items">
        {items.map((item, index) => (
          <span
            className="editable-item"
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
              <X size={13} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      <div className="quick-add">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
        <button className="icon-button" type="button" onClick={onAdd} aria-label={`Add ${label.toLowerCase()}`}>
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function CompanyIntake() {
  const [draft, setDraft] = usePersistedState(storageKeys.onboardingDraft, initialDraft, isOnboardingDraft);
  const { step, discovered, competitors, audiences, competitorInput, audienceInput } = draft;
  const router = useRouter();

  function updateDraft(patch: Partial<OnboardingDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function addItem(value: string, list: "competitors" | "audiences", input: "competitorInput" | "audienceInput") {
    const nextItem = value.trim();
    const items = draft[list];
    if (!nextItem || items.includes(nextItem)) return;
    updateDraft({ [list]: [...items, nextItem], [input]: "" });
  }

  function discoverMarket() {
    updateDraft({ competitors: suggestedCompetitors, audiences: suggestedAudiences, discovered: true });
  }

  function continueFlow() {
    if (step < steps.length - 1) {
      updateDraft({ step: step + 1 });
      return;
    }
    router.push("/research");
  }

  return (
    <form className="flow-card" onSubmit={(event) => event.preventDefault()}>
      <div className="flow-progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
        <div className="flow-progress-copy">
          <span>Step {step + 1} of {steps.length}</span>
          <strong>{steps[step]}</strong>
        </div>
        <ol>
          {steps.map((label, index) => (
            <li data-state={index === step ? "current" : index < step ? "complete" : undefined} key={label}>
              <span>{index < step ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
              <small>{label}</small>
            </li>
          ))}
        </ol>
      </div>

      <section className="flow-step" hidden={step !== 0} aria-labelledby="connect-step-title">
        <div className="section-heading">
          <h2 id="connect-step-title">Connect your company presence</h2>
          <p>Campco uses these public sources to understand the company and seed market discovery.</p>
        </div>
        <label className="field company-website-field">
          <span>Company website</span>
          <span className="input-with-icon">
            <Globe2 size={17} aria-hidden="true" />
            <input name="website" type="url" placeholder="https://yourcompany.com" autoComplete="url" value={draft.website} onChange={(event) => updateDraft({ website: event.target.value })} />
          </span>
        </label>
        <div className="social-link-grid">
          <label className="field">
            <span><Link2 size={15} aria-hidden="true" /> LinkedIn</span>
            <input name="linkedinUrl" type="url" placeholder="linkedin.com/company/..." value={draft.linkedinUrl} onChange={(event) => updateDraft({ linkedinUrl: event.target.value })} />
          </label>
          <label className="field">
            <span><AtSign size={15} aria-hidden="true" /> Instagram</span>
            <input name="instagramUrl" type="url" placeholder="instagram.com/..." value={draft.instagramUrl} onChange={(event) => updateDraft({ instagramUrl: event.target.value })} />
          </label>
          <label className="field">
            <span><MessageCircle size={15} aria-hidden="true" /> Reddit</span>
            <input name="redditUrl" type="url" placeholder="reddit.com/r/..." value={draft.redditUrl} onChange={(event) => updateDraft({ redditUrl: event.target.value })} />
          </label>
          <label className="field">
            <span><span className="text-platform-icon" aria-hidden="true">X</span> X</span>
            <input name="xUrl" type="url" placeholder="x.com/..." value={draft.xUrl} onChange={(event) => updateDraft({ xUrl: event.target.value })} />
          </label>
        </div>
        <label className="field">
          <span>Extra context</span>
          <textarea
            name="companyContext"
            rows={4}
            placeholder="Add positioning, products to prioritize, or anything the public sources may miss."
            value={draft.companyContext}
            onChange={(event) => updateDraft({ companyContext: event.target.value })}
          />
        </label>
      </section>

      <section className="flow-step" hidden={step !== 1} aria-labelledby="discover-step-title">
        <div className="section-heading">
          <h2 id="discover-step-title">Review the market Campco found</h2>
          <p>Use the agent suggestions as a starting point, then add or remove anything before research.</p>
        </div>
        {!discovered ? (
          <div className="discovery-empty">
            <span className="discovery-icon" aria-hidden="true"><Search size={23} /></span>
            <div>
              <h3>Find competitors and audience groups</h3>
              <p>The MVP will use the company website and social links to propose both lists.</p>
            </div>
            <button className="button primary" type="button" onClick={discoverMarket}>
              <Sparkles size={17} aria-hidden="true" /> Discover market
            </button>
          </div>
        ) : (
          <div className="discovery-lists">
            <EditableList
              label="Competitors"
              kind="company"
              items={competitors}
              input={competitorInput}
              placeholder="Add a company or URL"
              setInput={(value) => updateDraft({ competitorInput: value })}
              onAdd={() => addItem(competitorInput, "competitors", "competitorInput")}
              onRemove={(item) => updateDraft({ competitors: competitors.filter((entry) => entry !== item) })}
            />
            <EditableList
              label="Audience groups"
              kind="audience"
              items={audiences}
              input={audienceInput}
              placeholder="Describe another audience"
              setInput={(value) => updateDraft({ audienceInput: value })}
              onAdd={() => addItem(audienceInput, "audiences", "audienceInput")}
              onRemove={(item) => updateDraft({ audiences: audiences.filter((entry) => entry !== item) })}
            />
          </div>
        )}
      </section>

      <section className="flow-step" hidden={step !== 2} aria-labelledby="campaign-step-title">
        <div className="section-heading">
          <h2 id="campaign-step-title">Define the first campaign goal</h2>
          <p>Keep this broad. Research will help sharpen the eventual campaign.</p>
        </div>
        <label className="field">
          <span>Campaign title</span>
          <input name="goalTitle" placeholder="e.g. Launch our new team plan" value={draft.goalTitle} onChange={(event) => updateDraft({ goalTitle: event.target.value })} />
        </label>
        <label className="field campaign-description-field">
          <span>Description</span>
          <textarea
            name="goalDescription"
            rows={8}
            placeholder="What are you trying to achieve, what are you promoting, and what should change for the audience?"
            value={draft.goalDescription}
            onChange={(event) => updateDraft({ goalDescription: event.target.value })}
          />
        </label>
        <fieldset className="platform-fieldset campaign-platforms">
          <legend>Platforms to research for this campaign</legend>
          <p>Choose where Campco should compare competitors and audience behavior.</p>
          <div className="platform-grid research-platform-grid">
            {campaignPlatforms.map((platform) => (
              <label className="platform-option" key={platform}>
                <input
                  type="checkbox"
                  name="platforms"
                  value={platform}
                  checked={draft.platforms.includes(platform)}
                  onChange={(event) => updateDraft({
                    platforms: event.target.checked
                      ? [...draft.platforms, platform]
                      : draft.platforms.filter((item) => item !== platform),
                  })}
                />
                <span>{platform}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="campaign-context-note">
          <Sparkles size={18} aria-hidden="true" />
          <p>Campco will combine this goal with your sources, competitors, and audience groups when it creates the research brief.</p>
        </div>
      </section>

      <footer className="flow-actions">
        <button
          className="button secondary"
          type="button"
          onClick={() => updateDraft({ step: Math.max(0, step - 1) })}
          disabled={step === 0}
        >
          <ArrowLeft size={17} aria-hidden="true" /> Back
        </button>
        <span>You can edit these inputs later.</span>
        <button className="button primary" type="button" onClick={continueFlow}>
          {step === steps.length - 1 ? "Save and research" : "Continue"}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </footer>
    </form>
  );
}
