# Saturn L2 Web UI

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai/)
[![](https://img.shields.io/badge/project-Filecoin-blue.svg?style=flat-square)](https://filecoin.io/)
[![ci](https://github.com/filecoin-project/saturn-l2-webui/actions/workflows/ci.yml/badge.svg)](https://github.com/filecoin-project/saturn-l2-webui/actions/workflows/ci.yml)

A frontend UI for the Saturn L2 node.

## Install

```
$ npm install
```

## Development

```
$ npm run dev
```

## Releasing

1. Commit changes and ensure everything is merged into `main` branch
1. Update the version (`npm version [major|minor|patch]`, it will create a new tag `vN.N.N`, note it down)
1. Push `main` branch and the `vN.N.N` tag to GitHub: `git push --atomic origin vN.N.N`
1. Wait for `vN.N.N` to [build on CI](https://github.com/filecoin-project/saturn-l2-webui/actions)
1. [Publish a release](https://github.com/filecoin-project/saturn-l2-webui/releases) with the tag you created.

## License

[SPDX-License-Identifier: Apache-2.0 OR MIT](LICENSE.md)
