# @fortressjs/cli

Security auditing CLI for Express applications.

Analyze Express projects and identify missing security protections such as rate limiting, request validation, security headers, and threat detection.

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

## What It Checks

* Content Security Policy (CSP)
* Security Headers
* Rate Limiting
* Request Size Limiting
* Security Logging
* Threat Detection
* HTTPS / HSTS Configuration

## Roadmap

Planned improvements:

* File and directory path support
* AST-based code analysis
* More advanced security checks
* Framework-specific auditing

## Repository

https://github.com/davanesh/fortressjs

## License

MIT
