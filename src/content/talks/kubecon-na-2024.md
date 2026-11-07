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
  - label: "Lab: container and npm provenance"
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

## Start with the lab

The [lab repository](https://github.com/AEnguerrand/kubecon-cloudnativecon-na-2024-supply-chain-security-lab#readme) contains two GitHub Actions workflows: one publishes a container image to GitHub Container Registry; the other publishes an npm package with provenance. The README explains how to verify their attestations.

Start with verification. You do not need to publish a package or run a Kubernetes cluster for this part. The repository does not include the Kyverno or Kubescape setup discussed in the talk.

## What you need

- **For npm verification:** Node.js and npm, a terminal, and access to the public npm registry. Use a currently supported Node.js LTS release. Work in a new directory to keep the example separate from your projects.
- **For container verification:** [GitHub CLI](https://cli.github.com/manual/installation), GitHub authentication, and the full digest of the image you want to check. Docker is needed to build or run the image, not for the GitHub CLI verification command.
- **For the alternative verification steps:** [Cosign](https://docs.sigstore.dev/cosign/installation/), `curl`, and [jq](https://jqlang.org/download/). These are not required for the npm CLI path.

## Suggested order

1. Read the [build workflows](https://github.com/AEnguerrand/kubecon-cloudnativecon-na-2024-supply-chain-security-lab/tree/main/.github/workflows) to see where each attestation is created.
2. Follow [npm package verification](https://github.com/AEnguerrand/kubecon-cloudnativecon-na-2024-supply-chain-security-lab#npm-package-verification). Use the example version, `0.1.0`, and install it with `--ignore-scripts`. Then run `npm audit signatures`.
3. Follow [container verification](https://github.com/AEnguerrand/kubecon-cloudnativecon-na-2024-supply-chain-security-lab#container-image-verification). Replace the shortened digest in the README with the full SHA-256 digest from the image you intend to verify. Check the expected repository and workflow identity, not only whether a signature is valid.

To publish your own artifacts, fork the repository and review the manually triggered workflows first. You need GitHub Actions enabled, permission to publish container images, and an npm package name you control. The original npm workflow uses an `NPMJS_TOKEN` secret; consult the [current npm provenance instructions](https://docs.npmjs.com/generating-provenance-statements/) before configuring publishing.

## Notes on the 2024 example

The lab is a conference example, not a maintained production template. Its Dockerfile uses Node.js 16, its npm workflow uses Node.js 20, and it has no committed lockfile. Review the runtimes, dependencies, and action versions before reusing the build workflows.

Provenance records how an artifact was built. It does not by itself prove that the artifact is secure or that a build meets a SLSA level. See the [GitHub attestation verification reference](https://cli.github.com/manual/gh_attestation_verify) for identity checks and [npm signature verification](https://docs.npmjs.com/cli/v11/commands/npm-audit#description) for the npm path.
