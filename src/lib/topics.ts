export const topicDescriptions: Record<string, string> = {
  aws: "AWS cloud security talks covering posture management, runtime protection, detection, and practical controls for production environments.",
  "aws-summit": "Sessions presented at AWS Summit, with field-tested lessons for securing cloud infrastructure from code through runtime.",
  cloudnativecon: "CloudNativeCon sessions on building and protecting cloud-native systems with open standards and CNCF tooling.",
  "cloud security": "Cloud security talks and case studies covering AWS, CNAPP, posture management, risk prioritization, detection, and runtime protection.",
  compliance: "Practical approaches to cloud and software compliance that turn policy requirements into repeatable engineering controls.",
  cryptocurrency: "Infrastructure security lessons from protecting cloud systems and digital-asset products in a highly targeted industry.",
  javascript: "JavaScript ecosystem security, including dependency risk, npm compromise patterns, and safer package delivery pipelines.",
  kubecon: "KubeCon talks on Kubernetes, SLSA, artifact integrity, policy enforcement, and cloud-native supply chain security.",
  ledger: "Public talks and case studies about cloud security, platform reliability, and developer security practices at Ledger.",
  npm: "Analysis of npm supply chain attacks and practical guidance for trusted publishing, lockfiles, tokens, and dependency monitoring.",
  owasp: "OWASP community sessions focused on current application-security incidents and controls engineering teams can apply.",
  phishing: "Security incident analysis showing how phishing can compromise maintainers, packages, CI/CD credentials, and downstream users.",
  security: "Conference talks and case studies spanning cloud security, Kubernetes security, software supply chains, and incident response.",
  "software supply chain security": "Hands-on guidance for SLSA, Sigstore and Cosign, build provenance, attestations, admission policy, and secure CI/CD.",
  "supply chain": "Research and talks on dependency compromise, artifact trust, package ecosystems, and end-to-end software supply chain defense.",
  wiz: "Real-world Wiz and CNAPP lessons for cloud visibility, contextual risk prioritization, shift-left security, and runtime detection.",
};

export function topicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function topicTitle(topic: string): string {
  const preserved = new Map([
    ["aws", "AWS"],
    ["aws-summit", "AWS Summit"],
    ["cloudnativecon", "CloudNativeCon"],
    ["javascript", "JavaScript"],
    ["kubecon", "KubeCon"],
    ["npm", "npm"],
    ["owasp", "OWASP"],
    ["wiz", "Wiz"],
  ]);

  return (
    preserved.get(topic.toLowerCase()) ??
    topic.replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

export function topicDescription(topic: string): string {
  return (
    topicDescriptions[topic.toLowerCase()] ??
    `Talks, resources, and field notes about ${topic}, curated by Enguerrand Allamel.`
  );
}

export function topicHref(topic: string): string {
  return `/topics/${topicSlug(topic)}/`;
}
