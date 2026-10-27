import {
  Cloud,
  EnvelopeSimple,
  Fingerprint,
  GitBranch,
  GithubLogo,
  LinkedinLogo,
  Package,
  TerminalWindow,
} from "@phosphor-icons/react";

export function Hero() {
  return (
    <section className="home-intro" aria-label="Introduction" data-hero-motion>
      <div className="home-intro-copy">
        <h1 data-hero-item>Hi, I&apos;m <span className="home-name">Enguerrand.</span></h1>
        <p className="home-intro-statement" data-hero-item>I build secure and reliable cloud platforms.</p>
        <p className="home-intro-description" data-hero-item>
          I&apos;m a Senior Platform Security Engineer based in Vancouver. Here I
          share talks, notes, and the software I&apos;m building.
        </p>
        <div id="contact" className="home-contact" aria-label="Contact links" data-hero-item>
          <a className="site-text-link" href="mailto:hello@enguerrand.dev" aria-label="Email hello@enguerrand.dev"><EnvelopeSimple size={16} aria-hidden="true" />Email</a>
          <a className="site-text-link" href="https://github.com/AEnguerrand"><GithubLogo size={16} aria-hidden="true" />GitHub</a>
          <a className="site-text-link" href="https://www.linkedin.com/in/enguerrandallamel/"><LinkedinLogo size={16} aria-hidden="true" />LinkedIn</a>
        </div>
      </div>
      <div className="home-security-stage" data-hero-item data-motion-story>
        <div className="home-security-stage-header">
          <p>Path to production</p>
          <span className="home-security-stage-state"><span aria-hidden="true"></span>Trust boundary enforced</span>
        </div>

        <div className="home-security-topology">
          <svg className="home-security-network home-security-network-desktop" viewBox="0 0 620 360" preserveAspectRatio="none" aria-hidden="true">
            <path className="security-connector" d="M140 112 H480" pathLength="1" />
            <path className="security-connector security-connector-untrusted" d="M296 286 C356 286 342 162 392 145" pathLength="1" />
            <path className="security-flow security-flow-verified" d="M140 112 H480" pathLength="1" />
            <path className="security-flow security-flow-untrusted" d="M296 286 C356 286 342 162 392 145" pathLength="1" />
          </svg>
          <svg className="home-security-network home-security-network-mobile" viewBox="0 0 360 580" preserveAspectRatio="none" aria-hidden="true">
            <path className="security-connector" d="M154 62 H206 M280 98 C280 142 80 126 80 162 M154 198 H206" pathLength="1" />
            <path className="security-connector security-connector-untrusted" d="M180 346 C146 312 80 280 80 228" pathLength="1" />
            <path className="security-flow security-flow-verified" d="M154 62 H206 M280 98 C280 142 80 126 80 162 M154 198 H206" pathLength="1" />
            <path className="security-flow security-flow-untrusted" d="M180 346 C146 312 80 280 80 228" pathLength="1" />
          </svg>

          <span className="security-boundary-label" aria-hidden="true">Trust boundary</span>
          <span className="security-boundary-line" aria-hidden="true"></span>

          <div className="security-node security-node-source" aria-hidden="true">
            <GitBranch size={19} weight="duotone" />
            <span><small>Source</small><strong>Review</strong></span>
          </div>
          <div className="security-node security-node-build" aria-hidden="true">
            <TerminalWindow size={19} weight="duotone" />
            <span><small>Build</small><strong>Verify</strong></span>
          </div>
          <div className="security-node security-node-policy" aria-hidden="true">
            <Fingerprint size={19} weight="duotone" />
            <span><small>Policy gate</small><strong>Enforce</strong></span>
          </div>
          <div className="security-node security-node-runtime" aria-hidden="true">
            <Cloud size={19} weight="duotone" />
            <span><small>Runtime</small><strong>Observe</strong></span>
          </div>
          <div className="security-node security-node-dependency" aria-hidden="true">
            <Package size={19} weight="duotone" />
            <span><small>Untrusted input</small><strong>Package</strong></span>
          </div>

          <button className="home-security-profile" type="button" aria-label="Celebrate" title="Celebrate" data-confetti-trigger>
            <img src="/avatar.webp" alt="" width="48" height="48" loading="eager" decoding="async" />
            <span><small>Platform security</small><strong>Enguerrand</strong></span>
          </button>

          <div className="security-contained" aria-hidden="true">
            <span className="security-contained-mark"><span></span></span>
            <span><small>Control response</small><strong>Untrusted path contained</strong></span>
          </div>
        </div>

        <p className="sr-only">
          A security architecture diagram shows source review, build verification,
          a policy gate, and runtime observation. A trusted delivery path reaches
          runtime while an untrusted dependency path is contained at the policy gate.
        </p>
      </div>
    </section>
  );
}
