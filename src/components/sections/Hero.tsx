import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="home-intro" aria-label="Introduction">
      <div className="home-intro-copy">
        <h1>Hi, I&apos;m <span className="home-name">Enguerrand.</span></h1>
        <p className="home-intro-statement">I build secure and reliable cloud platforms.</p>
        <p className="home-intro-description">
          I&apos;m a Senior Platform Security Engineer based in Vancouver. Here I
          share talks, notes, and the software I&apos;m building.
        </p>
        <div className="home-actions">
          <a className="site-action-button site-action-button-primary" href="#selected-talks">
            Talks <ArrowRight size={15} aria-hidden="true" />
          </a>
          <a className="site-action-button site-action-button-secondary" href="#projects">
            Projects <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div id="contact" className="home-contact" aria-label="Contact links">
          <a className="site-text-link" href="mailto:hello@enguerrand.dev" aria-label="Email hello@enguerrand.dev">Email</a>
          <a className="site-text-link" href="https://github.com/AEnguerrand">GitHub</a>
          <a className="site-text-link" href="https://www.linkedin.com/in/enguerrandallamel/">LinkedIn</a>
        </div>
      </div>
      <img src="/avatar.webp" alt="Enguerrand Allamel speaking at a conference" className="home-portrait" width="224" height="224" loading="eager" decoding="async" />
    </section>
  );
}
