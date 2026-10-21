import { Github, Linkedin, Mail } from "lucide-react";

export function Hero() {
  return (
    <section className="home-intro" aria-label="Introduction">
      <div className="home-intro-copy">
        <h1>Hi, I&apos;m Enguerrand.</h1>
        <p className="home-intro-statement">I build secure and reliable cloud platforms.</p>
        <p className="home-intro-description">
          Senior Platform Security Engineer working on AI-first development
          guardrails, cloud and Kubernetes security, and secure-by-default
          developer platforms. This site is my notebook for talks, ideas, and
          field notes from real systems.
        </p>
        <div id="contact" className="home-contact">
          <a href="mailto:hello@enguerrand.dev"><Mail size={20} aria-hidden="true" />hello@enguerrand.dev</a>
          <a href="https://github.com/AEnguerrand"><Github size={20} aria-hidden="true" />GitHub</a>
          <a href="https://www.linkedin.com/in/enguerrandallamel/"><Linkedin size={20} aria-hidden="true" />LinkedIn</a>
        </div>
      </div>
      <img src="/avatar.webp" alt="Enguerrand Allamel speaking at a conference" className="home-portrait" width="224" height="224" loading="eager" decoding="async" />
    </section>
  );
}
