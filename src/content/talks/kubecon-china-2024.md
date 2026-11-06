---
author: ["Enguerrand Allamel"]
title: "KubeCon CloudNativeCon China 2024: Securing the Supply Chain: A Practical Guide to SLSA Compliance from Build to Runtime | 保障供应链安全：从构建到运行的SLSA合规实用指南"
displayTitle: "Securing the supply chain with SLSA"
seoTitle: "SLSA Supply Chain Security from Build to Runtime"
date: "2024-08-21"
event: "KubeCon + CloudNativeCon + Open Source Summit China 2024"
location: "Hong Kong"
language: ["English", "Chinese"]
sessionType: "Conference talk"
summary: "An introduction to SLSA supply chain security, from build pipelines to Kubernetes policy enforcement."
tags:
  ["kubecon", "cloudnativecon", "security", "software supply chain security"]
resources:
  - label: "Talk Video (YouTube)"
    url: "https://www.youtube.com/watch?v=733HXxEnm0I"
  - label: "English Slides"
    url: "https://static.sched.com/hosted_files/kccncossaidevchn2024/91/English%20-%20Securing%20the%20Supply%20Chain%20A%20Practical%20Guide%20to%20SLSA%20Compliance%20from%20Build%20to%20Runtime.pdf"
  - label: "Chinese Slides"
    url: "https://static.sched.com/hosted_files/kccncossaidevchn2024/3d/Chinese%20%28Automatic%20Translation%29%20-%20Securing%20the%20Supply%20Chain%20A%20Practical%20Guide%20to%20SLSA%20Compliance%20from%20Build%20to%20Runtime.pdf"
---

## Talk overview

This beginner-friendly session introduces SLSA (Supply-chain Levels for Software Artifacts) and practical ways to secure software from build to runtime. It covers how cloud-native tools work together, with a focus on artifact signing and policy checks.

## Topics covered

- **Build security**: GitHub Actions for automated builds and CI/CD pipelines
- **Keyless signing**: Cosign for signing containers and other artifacts without managing long-lived signing keys
- **Policy enforcement**: Kyverno for Kubernetes security policies
- **Integrity and posture checks**: in-toto for supply chain integrity; Kubescape for Kubernetes security scanning
- **Key protection**: Hardware Security Modules (HSMs) for cryptographic key management

The recording and slides cover practical steps to apply SLSA in the Kubernetes ecosystem. Slides are available in English and Chinese.
