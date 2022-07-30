# Saturn Node Web UI

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai/)
[![](https://img.shields.io/badge/project-Filecoin-blue.svg?style=flat-square)](https://filecoin.io/)
[![ci](https://github.com/filecoin-project/saturn-webui/actions/workflows/ci.yml/badge.svg)](https://github.com/filecoin-project/saturn-webui/actions/workflows/ci.yml)

A frontend UI for Filecoin Saturn's [L1](https://github.com/filecoin-saturn/L1-node) and [L2](https://github.com/filecoin-saturn/L2-node) node.

Hosted at [https://dashboard.strn.network](https://dashboard.strn.network)

## Install

```
$ npm install
```

## Development

```
$ npm run dev
```

This will start a development server for the frontend. Follow the Saturn L2 docs to setup the backend.

## Tips

* Use the special "all" FIL wallet address to view metrics for all of Saturn.

## Releasing

Creates a new Github Release and updates the [dashboard.strn.network](https://dashboard.strn.network) website.

1. Commit changes to the `main` branch
1. Update the version (`npm version [major|minor|patch]`, it will create a new tag `vN.N.N`, note it down)
1. Push `main` branch and the `vN.N.N` tag to GitHub: `git push --atomic origin main vN.N.N`
1. Modify the Saturn L2 [release workflow](https://github.com/filecoin-project/saturn-l2/blob/main/.github/workflows/release.yml) to reference to new tag `vN.N.N`.

## License

[SPDX-License-Identifier: Apache-2.0 OR MIT](LICENSE.md)
