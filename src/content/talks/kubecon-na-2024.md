---
author: ["Enguerrand Allamel"]
title: "KubeCon CloudNativeCon North America 2024: Practical Supply Chain Security: Implementing SLSA Compliance from Build to Runtime"
displayTitle: "Practical supply chain security with SLSA"
seoTitle: "Practical SLSA Supply Chain Security"
date: "2024-11-15"
event: "KubeCon + CloudNativeCon North America 2024"
location: "Salt Lake City, Utah"
language: ["English"]
sessionType: "Conference talk"
summary: "End-to-end implementation patterns for SLSA compliance using GitHub Actions, Cosign, Kyverno, in-toto, and Kubescape."
tags:
  ["kubecon", "cloudnativecon", "security", "software supply chain security"]
resources:
  - label: "Talk Video (YouTube)"
    url: "https://www.youtube.com/watch?v=0w_dBmvu5l8"
  - label: "Presentation Slides"
    url: "https://static.sched.com/hosted_files/kccncna2024/0b/Practical%20Supply%20Chain%20Security_%20Implementing%20SLSA%20Compliance%20from%20Build%20to%20Runtime.pdf.pdf"
  - label: "Lab Repository"
    url: "https://github.com/AEnguerrand/kubecon-cloudnativecon-na-2024-supply-chain-security-lab"
---

## Description

Securing the software supply chain can feel overwhelming, especially with dynamic frameworks like SLSA (Supply-chain Levels for Software Artifacts). This beginner-friendly session explores practical strategies to secure your software from build to runtime using cloud-native tools and methodologies.

In this comprehensive talk, I demonstrate how to implement robust supply chain security practices within the CNCF ecosystem, covering:

- **CI/CD security**: Utilizing GitHub Actions for secure automated build processes
- **Keyless signing**: Implementing Cosign for seamless artifact signing without key management overhead
- **Policy enforcement**: Applying Kyverno for runtime security policy enforcement
- **Integrity verification**: Using in-toto and Kubescape to verify and maintain artifact integrity
- **Hardware security**: Exploring Hardware Security Modules (HSMs) integration for enhanced key management
- **SLSA compliance**: Practical steps to achieve Supply-chain Levels for Software Artifacts compliance

By the end of this talk, attendees gain actionable insights and a clear understanding of how to achieve SLSA compliance within the CNCF ecosystem, with hands-on examples and real-world implementations.

---

## Key Highlights

### Challenge

- **Framework complexity**: SLSA compliance can feel overwhelming for development teams
- **Tool fragmentation**: Multiple security tools need seamless integration
- **Operational overhead**: Balancing security with developer productivity
- **Knowledge gap**: Bridging the gap between security theory and practical implementation

### Solution

- **Practical approach**: Step-by-step implementation guide using proven CNCF tools
- **Integrated workflow**: Seamless security integration from build to runtime
- **Keyless operations**: Simplified artifact signing reducing operational complexity
- **Comprehensive coverage**: End-to-end supply chain security strategy

### Technologies & Tools

- **GitHub Actions**: Automated CI/CD security integration
- **Cosign**: Container and artifact signing with keyless capabilities
- **Kyverno**: Kubernetes-native policy engine for runtime enforcement
- **in-toto**: Software supply chain integrity and attestation
- **Kubescape**: Kubernetes security posture scanning
- **Hardware Security Modules (HSMs)**: Enhanced cryptographic key protection
- **SLSA Framework**: Industry-standard supply chain security levels

---

## Impact & Results

✅ **Actionable Implementation**: Clear roadmap for SLSA compliance in production environments  
✅ **Developer-Friendly**: Security practices that enhance rather than hinder development workflows  
✅ **Industry Standards**: Implementation of recognized supply chain security frameworks  
✅ **Hands-on Learning**: Practical lab exercises with real-world applications  
✅ **Ecosystem Integration**: Comprehensive use of CNCF security toolchain
