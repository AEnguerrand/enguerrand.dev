import {
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
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
      <button className="home-portrait-trigger" type="button" aria-label="Celebrate" title="Celebrate" data-hero-item data-confetti-trigger>
        <img src="/avatar.webp" alt="Enguerrand Allamel speaking at a conference" className="home-portrait" width="224" height="224" loading="eager" decoding="async" />
      </button>
    </section>
  );
}
