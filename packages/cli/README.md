# @fortressjs/cli

Security auditing CLI for Express applications.

Analyze Express projects and identify missing security protections such as security headers, rate limiting, request size limits, logging, threat detection, and HTTPS enforcement.

## Installation

### Global Installation

```bash
npm install -g @fortressjs/cli
```

### Run Without Installation

```bash
npx @fortressjs/cli audit
```

## Usage

Audit the current project:

```bash
fortress audit
```

Audit a specific directory:

```bash
fortress audit .
fortress audit ./src
fortress audit ./src/app.ts
```

Generate JSON output:

```bash
fortress audit . --json
```

Generate a Markdown security report:

```bash
fortress audit . --report
```

Creates:

```text
fortress-report.md
```

## Example Output

```text
🛡️ FortressJS Security Audit CLI

Security Score: 70/100

Missing Protections:
✗ Threat Intelligence Engine
✗ HTTPS Enforcement / HSTS

Recommendations:
• Add fortress.threatDetector()
• Configure strict transport security
```

## Example Report

```md
# FortressJS Security Report

Generated: 2026-06-27

## Security Score

70/100

## Missing Protections

- Threat Intelligence Engine
- HTTPS Enforcement / HSTS
```

## Security Checks

FortressJS currently audits for:

* Content Security Policy (CSP)
* Security Headers
* Rate Limiting
* Request Size Limiting
* Security Logging
* Threat Detection
* HTTPS / HSTS Configuration

## Features

* AST-based code analysis
* Security scoring
* Actionable recommendations
* JSON export
* Markdown report generation
* Project-wide scanning

## Repository

https://github.com/davanesh/fortressjs

## License

MIT
