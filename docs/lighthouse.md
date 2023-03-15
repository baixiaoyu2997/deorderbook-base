# Lighthouse CI

## Use

1. go `https://github.com/apps/lighthouse-ci` get your `LHCI_GITHUB_APP_TOKEN` and add to your project(`github.com/***/***/settings/secrets/actions`)
2. create `lighthouserc.json`

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "collect": {
      "url": "xxx", // Vercel URL
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "onlyCategories": [
          "performance",
          "accessibility",
          "best-practices",
          "seo"
        ]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

3. add github workflow

```yml
name: CI
on:
  pull_request:
    paths-ignore:
      - '**/*.md'
      - 'types/**'
    branches:
      - develop
  push:
    paths-ignore:
      - '**/*.md'
      - 'types/**'
    branches:
      - develop
jobs:
  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install Lighthouse
        run: npm i @lhci/cli -g

      - name: Wait for Vercel Preview
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 240

      - name: lighthouse desktop audit
        run: npx @lhci/cli autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```
