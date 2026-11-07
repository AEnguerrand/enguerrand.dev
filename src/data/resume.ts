interface ResumeRole {
  title: string;
  period?: string;
  bullets: readonly string[];
}

interface ResumeCompany {
  company: string;
  period: string;
  roles: readonly ResumeRole[];
}

export const resumeProfile = {
  eyebrow: "Resume",
  name: "Enguerrand Allamel",
  title: "Platform Security Engineer",
  intro: "Senior Platform Security Engineer with a strong SRE background and hands-on work across AI-first development, cloud security, Kubernetes, AWS, and CI/CD in production.",
  linkLabel: "View LinkedIn Profile",
  linkHref: "https://www.linkedin.com/in/enguerrandallamel/",
} as const;

export const resumeSections = {
  experience: "Work Experience",
  education: "Education",
  community: "Community & Speaking",
  skills: "Technical Skills",
  certifications: "Certifications",
} as const;

export const experience: readonly ResumeCompany[] = [
  {
    company: "Procurify",
    period: "Apr 2026 - Present",
    roles: [
      {
        title: "Senior Platform Security Engineer",
        bullets: [
          "Lead platform security initiatives across cloud and developer infrastructure with a focus on practical, secure-by-default controls.",
          "Design guardrails for AI-first development workflows, including agentic tooling, LLM-assisted engineering, and internal developer platforms.",
          "Automate security checks across CI/CD pipelines, AWS environments, and Kubernetes platforms to improve coverage without adding friction.",
          "Strengthen detection and response through SIEM improvements, incident review, and cloud-native monitoring patterns.",
          "Drive architecture reviews, threat modeling, and security enablement so engineering teams can ship faster with clearer risk boundaries.",
        ],
      },
    ],
  },
  {
    company: "Ledger",
    period: "Apr 2022 - Apr 2026",
    roles: [
      {
        title: "Staff Cloud Security Engineer",
        period: "Sep 2024 - Apr 2026",
        bullets: [
          "Acted as security owner and technical advisor for infrastructure and engineering teams across cloud, products, and Kubernetes platforms.",
          "Designed and led cloud security initiatives on AWS, from posture hardening to detection and response.",
          "Built and rolled out software supply chain security practices using SLSA, Sigstore (keyless signing), GitHub Actions, Socket.dev, and JFrog while building custom APIs in Go.",
          "Deployed and operated Wiz across cloud and on-prem environments, improving visibility and threat detection at scale.",
          "Defined and built secure architecture patterns adopted by multiple engineering teams from Data to Firmware.",
        ],
      },
      {
        title: "Senior Cloud Security Engineer",
        period: "Apr 2024 - Sep 2024",
        bullets: [
          "Introduced keyless artifact signing using GitHub OIDC and Sigstore.",
          "Laid the foundation of an organization-wide software supply chain security program (SLSA).",
          "Contributed to security tooling rollout, including Wiz and JFrog Artifactory.",
        ],
      },
      {
        title: "Senior Site Reliability Engineer",
        period: "Jul 2023 - Apr 2024",
        bullets: [
          "Technical lead for the infrastructure redesign of Ledger Recover with strict stability and security constraints.",
          "Built and operated GitOps deployment platforms using ArgoCD, Linkerd, and Helm libraries.",
          "Improved reliability, observability, and incident response using Datadog and Kubernetes-native tooling.",
          "Mentored engineers and promoted SRE and DevOps best practices.",
        ],
      },
      {
        title: "Site Reliability Engineer",
        period: "Apr 2022 - Jul 2023",
        bullets: [
          "Optimized private cloud and Kubernetes platforms supporting core and firmware services.",
          "Built and maintained observability stacks using Prometheus, Grafana, Loki, and OpsGenie.",
          "Improved CI/CD availability to 99.99% using GitHub Actions and custom Golang tooling.",
          "Delivered self-service deployment platforms, reducing rollout time from days to minutes.",
        ],
      },
    ],
  },
  {
    company: "Ubisoft",
    period: "Jun 2021 - Apr 2022",
    roles: [
      {
        title: "Cloud Engineer Kubernetes",
        bullets: [
          "Contributed to the design and operation of a global Kubernetes platform (OpenStack, Rancher, Prometheus).",
          "Participated in on-call rotations for production-grade Kubernetes services supporting worldwide apps.",
        ],
      },
    ],
  },
  {
    company: "Equativ",
    period: "Mar 2020 - Jun 2021",
    roles: [
      {
        title: "Site Reliability Engineer",
        bullets: [
          "Supported a global ad-tech platform across 6 datacenters and 900+ servers, handling 30B+ daily auctions.",
          "Designed and deployed a Kubernetes production platform on a hybrid stack (Rancher, Alibaba Cloud).",
          "Built CI/CD pipelines and GitOps workflows using GitLab CI, Terraform, and Ansible.",
          "Led GCP operations and drove GitLab adoption across 100+ applications.",
          "Improved observability and incident response using Prometheus, Grafana, Datadog, and Stackdriver.",
        ],
      },
    ],
  },
] as const;

export const education = [
  {
    school: "EPITECH - European Institute of Technology",
    period: "2015 - 2020",
    degree: "Expert in Information Technologies (Master's equivalent)",
  },
  {
    school: "Tsinghua University",
    period: "2018 - 2019",
    degree: "Master's in Advanced Computing",
  },
] as const;

export const skills = [
  ["Cloud & Platform", "Kubernetes, AWS, EKS, GitOps, Helm"],
  ["Infrastructure as Code", "Terraform, Ansible"],
  ["Security", "Platform security architecture, threat modeling, IAM, Wiz, software supply chain security (SLSA, Sigstore, OIDC), AI development guardrails"],
  ["Observability", "Grafana, Prometheus, Datadog"],
  ["CI/CD", "GitHub Actions, ArgoCD, Atlantis, security automation"],
  ["Programming", "Go, Python, Bash"],
] as const;

export const community = [
  {
    text: "Speaker at KubeCon + CloudNativeCon (North America, China), AWS Summit, and CNCF / OWASP meetups.",
    links: [
      { label: "KubeCon North America", href: "/talks/kubecon-na-2024/" },
      { label: "KubeCon China", href: "/talks/kubecon-china-2024/" },
      { label: "AWS Summit", href: "/talks/aws-summit-paris-2025/" },
      { label: "OWASP France", href: "/talks/meetup-owasp-france-chapter-10-2025/" },
    ],
  },
  {
    text: "Contributor to open-source and security projects.",
    links: [
      { label: "Foliobruma Scanner", href: "https://github.com/AEnguerrand/foliobruma-scanner" },
      { label: "Supply chain security lab", href: "https://github.com/AEnguerrand/kubecon-cloudnativecon-na-2024-supply-chain-security-lab" },
    ],
  },
] as const;

export const certifications = [
  {
    name: "CKA: Certified Kubernetes Administrator",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg",
    alt: "Kubernetes official logo",
  },
  {
    name: "AWS Certified Security – Specialty",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    alt: "AWS official logo",
  },
] as const;

// The page and search share these strings so neither can omit a visible claim.
export const resumeSearchText = [
  resumeProfile.eyebrow,
  resumeProfile.name,
  resumeProfile.title,
  resumeProfile.intro,
  resumeProfile.linkLabel,
  resumeSections.experience,
  ...experience.flatMap((company) => [
    company.company,
    ...(company.roles.length > 1 ? [company.period] : []),
    ...company.roles.flatMap((role) => [role.title, role.period ?? company.period, ...role.bullets]),
  ]),
  resumeSections.education,
  ...education.flatMap((item) => [item.school, item.period, item.degree]),
  resumeSections.community,
  ...community.flatMap((item) => [item.text, ...item.links.map((link) => link.label)]),
  resumeSections.skills,
  resumeSections.certifications,
  ...certifications.map((item) => item.name),
  ...skills.flat(),
].join(" ");
