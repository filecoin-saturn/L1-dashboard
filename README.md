# Saturn Node Web UI

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai/)
[![](https://img.shields.io/badge/project-Filecoin-blue.svg?style=flat-square)](https://filecoin.io/)
[![ci](https://github.com/filecoin-project/saturn-webui/actions/workflows/ci.yml/badge.svg)](https://github.com/filecoin-project/saturn-webui/actions/workflows/ci.yml)

A dashboard UI for Filecoin Saturn's [L1](https://github.com/filecoin-saturn/L1-node) node.

Hosted at [https://dashboard.saturn.tech](https://dashboard.saturn.tech)

## Install

```
npm install
```

## Development

```
npm run dev
```

This will start a development server for the frontend. Follow the Saturn L2 docs to setup the backend.

## WebUI

This dashboard apart from being served as a standalone website, is also embedded in L2 node in what is called webui mode. In this mode navigation bar is hidden and only the address page is accessible.

To develop dashboard in webui mode:

```
npm run dev:webui
```

To build dashboard in webui mode:

```
npm run build:webui
```

To preview webui dashboard build:

```
npm run preview:webui
```

## Tips

- Use the special "all" FIL wallet address to view metrics for all of Saturn.

## Continuous Deployment

This repository is connected to [fleek.co](https://app.fleek.co/) and set up to:

- deploy production build automatically to IPFS on every update to `main` branch
  - available via [dashboard-strn.on.fleek.co](https://dashboard-strn.on.fleek.co/) using fleek.co subdomain
  - available via [dashboard.saturn.tech](https://dashboard.saturn.tech/) using CNAME record pointing at [dedicated Fleek CDN subdomain](https://b0cac29553481fefb931.b-cdn.net/)
- deploy pull request previews of every branch with open pull request

## Updating Saturn-L2 Release Version

1. Commit changes to the `main` branch
1. Update the version (`npm version [major|minor|patch]`, it will create a new tag `vN.N.N`, note it down)
1. Push `main` branch and the `vN.N.N` tag to GitHub: `git push --atomic origin main vN.N.N`
1. Modify the Saturn L2 [release workflow](https://github.com/filecoin-project/saturn-l2/blob/main/.github/workflows/release.yml) to reference to new tag `vN.N.N`.

## License

[SPDX-License-Identifier: Apache-2.0 OR MIT](LICENSE.md)
