# Remote Fill Site

This repository contains the public Home, Support, and Privacy pages plus the unlinked extension test utility for Remote Fill. Support consolidates the product process, security model, cryptographic profile, limitations, and third-party notices. The tokenized Transfer page is implemented in `RemoteFill-Core`.

It is intentionally not the central technical repository. The relay, phone data-entry endpoint, protocol, and security-critical tests are in `RemoteFill-Core`; the Chrome receiver is in `RemoteFill-Extension`. This repository contains no relay state machine, production configuration, deployment topology, or credentials.

## Verify locally

Node.js 24 or later is required.

```bash
npm ci
npm run check
```

The static output is written to `dist/`. All scripts, fonts, icons, and images are served locally; the pages contain no analytics or remote code.

This repository is a reduced public export. The private canonical repository and its tagged audit evidence are authoritative for release identity and deployment.

## Repository status

The source is publicly reviewable but proprietary. Public access does not grant permission to copy, modify, redistribute, sublicense, create derivative works, or use the product commercially. See `PROPRIETARY-NOTICE.md`.
