import fs from "fs";
import path from "path";
import { RegexScanner, ScanResult } from "./scanner";

// ANSI Terminal Colors
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip node_modules, build directories, hidden files, and coverage files
    if (
      file === "node_modules" ||
      file === "dist" ||
      file === "build" ||
      file === "coverage" ||
      file.startsWith(".")
    ) {
      continue;
    }

    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (filePath.endsWith(".ts") || filePath.endsWith(".js")) {
      // Exclude definition files and config files
      if (!filePath.endsWith(".d.ts") && !filePath.includes("config.js")) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

export function runAudit(): void {
  console.log(`\n${C.bold}${C.cyan}🛡️  FortressJS Security Audit CLI${C.reset}`);
  console.log(`${C.dim}=========================================${C.reset}\n`);

  const cwd = process.cwd();
  const files = getFilesRecursively(cwd);

  if (files.length === 0) {
    console.log(`${C.yellow}No JavaScript or TypeScript files found to scan in: ${cwd}${C.reset}`);
    return;
  }

  console.log(`${C.dim}Scanning ${files.length} file(s)...${C.reset}`);
  const scanner = new RegexScanner();

  // Aggregate results across all files in the project
  const aggregated: ScanResult = {
    hasCSP: false,
    hasRateLimiting: false,
    hasRequestSizeLimiting: false,
    hasLogger: false,
    hasThreatDetection: false,
    hasHTTPS: false
  };

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const result = scanner.scan(content);

      if (result.hasCSP) aggregated.hasCSP = true;
      if (result.hasRateLimiting) aggregated.hasRateLimiting = true;
      if (result.hasRequestSizeLimiting) aggregated.hasRequestSizeLimiting = true;
      if (result.hasLogger) aggregated.hasLogger = true;
      if (result.hasThreatDetection) aggregated.hasThreatDetection = true;
      if (result.hasHTTPS) aggregated.hasHTTPS = true;
    } catch (e) {
      console.error(`${C.red}Error reading file ${file}: ${(e as Error).message}${C.reset}`);
    }
  }

  // Calculate score
  let score = 100;
  const missing: string[] = [];
  const recommendations: string[] = [];

  if (!aggregated.hasCSP) {
    score -= 15;
    missing.push("Content Security Policy (CSP)");
    recommendations.push("Add fortress.headers() to configure secure CSP and other headers");
  }
  if (!aggregated.hasRateLimiting) {
    score -= 20;
    missing.push("Rate Limiting");
    recommendations.push("Add fortress.rateLimit() to prevent DDoS and Brute Force attacks");
  }
  if (!aggregated.hasRequestSizeLimiting) {
    score -= 15;
    missing.push("Request Size Limiting");
    recommendations.push("Add fortress.requestLimit() to restrict payload sizes");
  }
  if (!aggregated.hasLogger) {
    score -= 15;
    missing.push("Security Logger");
    recommendations.push("Add fortress.logger() to record requests in event store");
  }
  if (!aggregated.hasThreatDetection) {
    score -= 20;
    missing.push("Threat Intelligence Engine");
    recommendations.push("Add fortress.threatDetector() to intercept automated scans and brute force");
  }
  if (!aggregated.hasHTTPS) {
    score -= 15;
    missing.push("HTTPS Enforcement / HSTS");
    recommendations.push("Configure fortress.headers({ strictTransportSecurity: ... }) for HSTS");
  }

  score = Math.max(0, score);

  // Pick color based on score
  let scoreColor = C.red;
  if (score >= 90) scoreColor = C.green;
  else if (score >= 70) scoreColor = C.yellow;

  console.log(`${C.bold}Security Score: ${scoreColor}${score}/100${C.reset}\n`);

  if (missing.length === 0) {
    console.log(`${C.bold}${C.green}🎉 Congratulations! Perfect score. Your application follows core FortressJS security best practices.${C.reset}\n`);
    return;
  }

  console.log(`${C.bold}${C.red}Missing Protections:${C.reset}`);
  for (const item of missing) {
    console.log(`  ${C.red}✗${C.reset} ${item}`);
  }

  console.log(`\n${C.bold}${C.yellow}Recommendations:${C.reset}`);
  for (const rec of recommendations) {
    console.log(`  ${C.cyan}•${C.reset} ${rec}`);
  }
  console.log("");
}

// CLI entry point
const args = process.argv.slice(2);
if (args[0] === "audit") {
  runAudit();
} else {
  console.log(`\n${C.bold}FortressJS CLI${C.reset}`);
  console.log(`${C.dim}Usage: npx fortress audit${C.reset}\n`);
}
