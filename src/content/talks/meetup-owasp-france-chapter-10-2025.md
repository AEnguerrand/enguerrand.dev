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
summary: "The September 2025 npm attacks, how they spread, and controls for safer JavaScript pipelines."
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

## Talk overview

At the OWASP France meetup on 13 October 2025, I covered the npm supply chain attacks from the previous month. These notes follow the compromised maintainer accounts, the later attack waves, and ways to protect JavaScript pipelines.

## The target: npmjs.com

- Central registry and default dependency provider for the JavaScript ecosystem
- Owned by GitHub since 2020, hosting more than 3 million public packages
- A platform created in 2010 with limited recent improvements to token management and 2FA enforcement, leaving room for abuse

## Timeline of the attacks

### 8 September 2025 — First wave “Qix maintainer”

- Phishing email posing as npm support (`npmjs.help`) that urged a 2FA reset
- Maintainer Josh Junon (aka **Qix**) entered credentials, handing full control to the attacker
- Attacker pushed malicious releases of widely used packages (2–3 billion downloads per week)
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

- Automated spread using stolen npm and GitHub tokens, plus targeted phishing
- Goals: publish compromised releases, steal secrets, and keep access through GitHub Actions
- Linked maintainer compromises to malicious changes in repositories
- Wiz analysis of the Shai-Hulud npm supply chain attack

## GitHub response (9 October 2025)

- Strengthened 2FA: migration toward FIDO security keys and tighter TOTP flows
- Removal of all 2FA bypass paths for publishing packages
- Sunset of legacy automation tokens in favor of 90-day *fine-grained* tokens
- Expansion of **Trusted Publishing** via OIDC to sign releases automatically
- Public roadmap for a more secure npm supply chain

## How to protect your pipelines

- **Commit lockfiles**: commit `package-lock.json` / `pnpm-lock.yaml` to pin dependencies
- **Control install scripts**: prefer `pnpm` or other tooling capable of blocking post-install scripts
- **Monitor dependencies**: integrate services like Socket.dev, JFrog Xray, or Snyk for anomaly detection
- **Use OIDC**: move publishing and CI/CD authentication to OIDC-based workflows
- **Limit credentials**: keep token lifetimes short, review permissions often, and log every credential use
