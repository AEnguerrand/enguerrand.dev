import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";

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
          <a className="home-button home-button-primary" href="#selected-talks">
            Explore talks <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="home-button home-button-secondary" href="#projects">
            View projects <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div id="contact" className="home-contact" aria-label="Contact links">
          <a href="mailto:hello@enguerrand.dev" aria-label="Email hello@enguerrand.dev"><Mail size={20} aria-hidden="true" />Email</a>
          <a href="https://github.com/AEnguerrand"><Github size={20} aria-hidden="true" />GitHub</a>
          <a href="https://www.linkedin.com/in/enguerrandallamel/"><Linkedin size={20} aria-hidden="true" />LinkedIn</a>
        </div>
      </div>
      <img src="/avatar.webp" alt="Enguerrand Allamel speaking at a conference" className="home-portrait" width="224" height="224" loading="eager" decoding="async" />
    </section>
  );
}
