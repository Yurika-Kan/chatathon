"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileUp,
  Link2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = ["Company", "Knowledge", "Marketing"] as const;
const platforms = ["Instagram", "TikTok", "LinkedIn", "YouTube", "Reddit", "X"];

export function CompanyIntake() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  function continueFlow() {
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
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

      <section className="flow-step" hidden={step !== 0} aria-labelledby="company-step-title">
        <div className="section-heading">
          <h2 id="company-step-title">Start with the company</h2>
          <p>Basic context helps Campco understand what you sell and how to describe it.</p>
        </div>
        <div className="field-grid two-column">
          <label className="field">
            <span>Company name</span>
            <input name="companyName" placeholder="Acme" autoComplete="organization" />
          </label>
          <label className="field">
            <span>Company website</span>
            <span className="input-with-icon">
              <Link2 size={17} aria-hidden="true" />
              <input name="website" type="url" placeholder="https://acme.com" autoComplete="url" />
            </span>
          </label>
        </div>
        <label className="field">
          <span>What does the company do?</span>
          <textarea
            name="companyDescription"
            rows={5}
            placeholder="Describe the product or service, the problem it solves, and who it is for."
          />
        </label>
        <div className="field-grid two-column compact-grid">
          <label className="field">
            <span>Industry or niche</span>
            <input name="industry" placeholder="e.g. team productivity" />
          </label>
          <label className="field">
            <span>Main social profile</span>
            <input name="socialProfile" type="url" placeholder="https://instagram.com/acme" />
          </label>
        </div>
      </section>

      <section className="flow-step" hidden={step !== 1} aria-labelledby="knowledge-step-title">
        <div className="section-heading">
          <h2 id="knowledge-step-title">Add what the company knows</h2>
          <p>These sources ground future research and generated content.</p>
        </div>
        <label className="upload-field">
          <FileUp size={21} aria-hidden="true" />
          <span>
            <strong>Upload company media</strong>
            <small>Brand guides, decks, product images, videos, reviews, or past ads</small>
          </span>
          <input name="companyMedia" type="file" multiple />
        </label>
        <label className="field">
          <span>Other source links</span>
          <textarea
            name="sourceLinks"
            rows={4}
            placeholder={"Add one URL per line: product pages, review pages, social profiles, or ad libraries."}
          />
        </label>
        <label className="field">
          <span>Context that may not exist in a file</span>
          <textarea
            name="companyContext"
            rows={5}
            placeholder="Add customer insights, positioning decisions, claims to avoid, or any internal context Campco should preserve."
          />
        </label>
      </section>

      <section className="flow-step" hidden={step !== 2} aria-labelledby="marketing-step-title">
        <div className="section-heading">
          <h2 id="marketing-step-title">Set the starting marketing context</h2>
          <p>This is a baseline, not a permanent campaign brief.</p>
        </div>
        <div className="field-grid two-column">
          <label className="field">
            <span>What do you want to market?</span>
            <input name="marketingFocus" placeholder="Product, service, launch, or offer" />
          </label>
          <label className="field">
            <span>Primary goal</span>
            <select name="goal" defaultValue="">
              <option value="" disabled>Select a goal</option>
              <option>Awareness</option>
              <option>Engagement</option>
              <option>Leads</option>
              <option>Conversions</option>
              <option>Retention</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>Brand voice</span>
          <textarea
            name="brandVoice"
            rows={4}
            placeholder="Describe how the company should sound. Include examples or phrases to use or avoid."
          />
        </label>
        <fieldset className="platform-fieldset">
          <legend>Platforms you currently use</legend>
          <div className="platform-grid">
            {platforms.map((platform) => (
              <label className="platform-option" key={platform}>
                <input type="checkbox" name="platforms" value={platform} />
                <span>{platform}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <footer className="flow-actions">
        <button
          className="button secondary"
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back
        </button>
        <span>Your progress stays editable.</span>
        <button className="button primary" type="button" onClick={continueFlow}>
          {step === steps.length - 1 ? "Save and research" : "Continue"}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </footer>
    </form>
  );
}
