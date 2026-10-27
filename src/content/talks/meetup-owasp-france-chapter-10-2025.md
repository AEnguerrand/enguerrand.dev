---
author: ["Enguerrand Allamel"]
title: "Meetup OWASP France (October 2025): npm Supply Chain Attacks - What Happened in September 2025"
displayTitle: "The September 2025 npm supply chain attacks"
seoTitle: "September 2025 npm Supply Chain Attacks Explained"
date: "2025-10-13"
event: "OWASP France Chapter Meetup (October 2025)"
location: "Paris, France"
language: ["French"]
sessionType: "Meetup talk"
summary: "A timeline-driven incident analysis of the September 2025 npm compromise waves and practical controls for safer JavaScript pipelines."
tags:
  [
    "npm",
    "supply chain",
    "javascript",
    "phishing",
    "owasp",
    "security",
  ]
resources:
  - label: "Socket: DuckDB npm account compromised"
    url: "https://socket.dev/blog/duckdb-npm-account-compromised-in-continuing-supply-chain-attack"
  - label: "Socket: npm author Qix compromised"
    url: "https://socket.dev/blog/npm-author-qix-compromised-in-major-supply-chain-attack"
  - label: "Wiz: Shai-Hulud npm supply chain attack"
    url: "https://www.wiz.io/blog/shai-hulud-npm-supply-chain-attack"
  - label: "GitHub: Plan for a more secure npm supply chain"
    url: "https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/"
  - label: "Lockfile guide for package-lock.json"
    url: "https://medium.com/pavesoft/package-lock-json-the-complete-guide-2ae40175ebdd"
---

## Description

During the OWASP Chapter France meetup on 13 October 2025, I walked through the multi-stage supply chain attacks that struck npm in September. This talk breaks down how popular package maintainers were compromised, how the attacks evolved over several days, and what builders can do to harden their JavaScript pipelines.

---

## The target: npmjs.com

- Central registry and default dependency provider for the JavaScript ecosystem
- Owned by GitHub since 2020, hosting more than 3 million public packages
- A platform created in 2010 with limited recent improvements to token management and 2FA enforcement, leaving room for abuse

---

## Timeline of the attacks

### 8 September 2025 — First wave “Qix maintainer”

- Highly realistic phishing email posing as support (`npmjs.help`) that urged a 2FA reset
- Maintainer Josh Junon (aka **Qix**) entered credentials, handing full control to the attacker
- Attacker pushed booby-trapped releases of widely used packages (2–3 billion downloads per week)
- Payload: obfuscated *wallet drainer* malware hidden inside the packages
- Exposure window: roughly two hours before npm’s security team pulled the malicious versions
- Affected packages:

```
slice-ansi@7.1.1 • simple-swizzle@0.2.3 • is-arrayish@0.3.3 • error-ex@1.3.3
has-ansi@6.0.1 • ansi-regex@6.2.1 • ansi-styles@6.2.2 • supports-color@10.2.1
proto-tinker-wc@1.8.7 • debug@4.4.2 • backslash@0.2.1 • chalk@5.6.1
chalk-template@1.1.1 • color-convert@3.1.1 • color-name@2.0.1 • color-string@2.1.1
wrap-ansi@9.0.1 • supports-hyperlinks@4.1.1 • strip-ansi@7.1.1
```

### 9 September 2025 — Second wave “duckdb_admin”

- Same phishing lure and payload reused the very next day
- `duckdb_admin` account compromised, as confirmed by Socket’s incident report
- Malicious releases pushed to the DuckDB ecosystem to maximize reach

### 16 September 2025 — Shai-Hulud worm

- Automated propagation leveraging stolen npm/GitHub tokens plus targeted phishing
- Aims: publish compromised releases, exfiltrate secrets, and establish persistence through GitHub Actions
- Demonstrated chained compromises of maintainers and repository poisoning
- Deep dive by Wiz on the Shai-Hulud npm supply chain attack

---

## GitHub response (9 October 2025)

- Strengthened 2FA: migration toward FIDO security keys and tighter TOTP flows
- Removal of all 2FA bypass paths for publishing packages
- Sunset of legacy automation tokens in favor of 90-day *fine-grained* tokens
- Expansion of **Trusted Publishing** via OIDC to sign releases automatically
- Public roadmap for a more secure npm supply chain

---

## How to protect your pipelines

- **Lockfiles everywhere**: commit `package-lock.json` / `pnpm-lock.yaml` to pin dependencies
- **Smarter CLIs**: prefer `pnpm` or other tooling capable of blocking post-install scripts
- **Dedicated monitoring**: integrate services like Socket.dev, JFrog Xray, or Snyk for anomaly detection
- **OIDC by default**: move publishing and CI/CD authentication to OIDC-based workflows
- **Secret hygiene**: keep token lifetimes short, review permissions often, and log every credential use
