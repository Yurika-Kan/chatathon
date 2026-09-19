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
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = ["Connect", "Discover", "Campaign"] as const;

const suggestedCompetitors = ["Duolingo", "Notion", "Canva"];
const suggestedAudiences = [
  "Startup founders at teams under 20 people",
  "Social media managers at growing brands",
  "Solo marketers building their first content engine",
];

function EditableList({
  label,
  items,
  input,
  placeholder,
  setInput,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  input: string;
  placeholder: string;
  setInput: (value: string) => void;
  onAdd: () => void;
  onRemove: (item: string) => void;
}) {
  return (
    <div className="editable-list">
      <span className="editable-list-label">{label}</span>
      <div className="editable-list-items">
        {items.map((item) => (
          <span className="editable-item" key={item}>
            {item}
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
  const [step, setStep] = useState(0);
  const [discovered, setDiscovered] = useState(false);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const router = useRouter();

  function addItem(
    value: string,
    setValue: (value: string) => void,
    items: string[],
    setItems: (value: string[]) => void,
  ) {
    const nextItem = value.trim();
    if (!nextItem || items.includes(nextItem)) return;
    setItems([...items, nextItem]);
    setValue("");
  }

  function discoverMarket() {
    setCompetitors(suggestedCompetitors);
    setAudiences(suggestedAudiences);
    setDiscovered(true);
  }

  function continueFlow() {
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    const form = document.querySelector<HTMLFormElement>(".flow-card");
    const data = form ? new FormData(form) : null;
    const platforms = ["LinkedIn", "Instagram", "Reddit", "X"].filter((platform) => {
      const key = `${platform.toLowerCase()}Url`;
      return Boolean(data?.get(key));
    });

    sessionStorage.setItem(
      "campco-onboarding-draft",
      JSON.stringify({
        competitors,
        audiences,
        platforms,
        goalTitle: data?.get("goalTitle") ?? "",
        goalDescription: data?.get("goalDescription") ?? "",
      }),
    );
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
            <input name="website" type="url" placeholder="https://yourcompany.com" autoComplete="url" />
          </span>
        </label>
        <div className="social-link-grid">
          <label className="field">
            <span><Link2 size={15} aria-hidden="true" /> LinkedIn</span>
            <input name="linkedinUrl" type="url" placeholder="linkedin.com/company/..." />
          </label>
          <label className="field">
            <span><AtSign size={15} aria-hidden="true" /> Instagram</span>
            <input name="instagramUrl" type="url" placeholder="instagram.com/..." />
          </label>
          <label className="field">
            <span><MessageCircle size={15} aria-hidden="true" /> Reddit</span>
            <input name="redditUrl" type="url" placeholder="reddit.com/r/..." />
          </label>
          <label className="field">
            <span><span className="text-platform-icon" aria-hidden="true">X</span> X</span>
            <input name="xUrl" type="url" placeholder="x.com/..." />
          </label>
        </div>
        <label className="field">
          <span>Extra context</span>
          <textarea
            name="companyContext"
            rows={4}
            placeholder="Add positioning, products to prioritize, or anything the public sources may miss."
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
              items={competitors}
              input={competitorInput}
              placeholder="Add a company or URL"
              setInput={setCompetitorInput}
              onAdd={() => addItem(competitorInput, setCompetitorInput, competitors, setCompetitors)}
              onRemove={(item) => setCompetitors(competitors.filter((entry) => entry !== item))}
            />
            <EditableList
              label="Audience groups"
              items={audiences}
              input={audienceInput}
              placeholder="Describe another audience"
              setInput={setAudienceInput}
              onAdd={() => addItem(audienceInput, setAudienceInput, audiences, setAudiences)}
              onRemove={(item) => setAudiences(audiences.filter((entry) => entry !== item))}
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
          <input name="goalTitle" placeholder="e.g. Launch our new team plan" />
        </label>
        <label className="field campaign-description-field">
          <span>Description</span>
          <textarea
            name="goalDescription"
            rows={8}
            placeholder="What are you trying to achieve, what are you promoting, and what should change for the audience?"
          />
        </label>
        <div className="campaign-context-note">
          <Sparkles size={18} aria-hidden="true" />
          <p>Campco will combine this goal with your sources, competitors, and audience groups when it creates the research brief.</p>
        </div>
      </section>

      <footer className="flow-actions">
        <button
          className="button secondary"
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
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
