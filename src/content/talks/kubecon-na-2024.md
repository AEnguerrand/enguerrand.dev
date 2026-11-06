---
author: ["Enguerrand Allamel"]
title: "KubeCon CloudNativeCon North America 2024: Practical Supply Chain Security: Implementing SLSA Compliance from Build to Runtime"
displayTitle: "Practical supply chain security with SLSA"
seoTitle: "Practical SLSA Supply Chain Security"
date: "2024-11-15"
event: "KubeCon + CloudNativeCon North America 2024"
location: "Salt Lake City, Utah"
language: ["English"]
sessionLanguages: ["English"]
notesLanguages: ["English"]
sessionType: "Conference talk"
summary: "Practical SLSA supply chain security, from GitHub Actions builds to Kubernetes policy enforcement."
tags:
  ["kubecon", "cloudnativecon", "security", "software supply chain security"]
resources:
  - label: "Talk Video (YouTube)"
    url: "https://www.youtube.com/watch?v=0w_dBmvu5l8"
  - label: "Presentation Slides"
    language: "English"
    url: "https://static.sched.com/hosted_files/kccncna2024/0b/Practical%20Supply%20Chain%20Security_%20Implementing%20SLSA%20Compliance%20from%20Build%20to%20Runtime.pdf.pdf"
  - label: "Lab Repository"
    url: "https://github.com/AEnguerrand/kubecon-cloudnativecon-na-2024-supply-chain-security-lab"
---

## Talk overview

This beginner-friendly session shows how to apply SLSA (Supply-chain Levels for Software Artifacts) practices from build to runtime. It covers how to connect build security, artifact signing, and Kubernetes policy checks in one workflow.

## Topics covered

- **Build security**: GitHub Actions for automated CI/CD pipelines
- **Keyless signing**: Cosign for signing containers and other artifacts without managing long-lived signing keys
- **Policy enforcement**: Kyverno for Kubernetes security policies
- **Integrity and posture checks**: in-toto for supply chain integrity and attestations; Kubescape for Kubernetes security scanning
- **Key protection**: Hardware Security Modules (HSMs) for cryptographic key management
- **SLSA adoption**: Practical steps to apply the framework in a cloud-native environment

The slides and lab repository provide the examples used in the session.
