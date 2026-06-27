interface AuditResult {
  target: string;
  score: number;
  missing: string[];
  recommendations: string[];
}

export function generateMarkdownReport(
  auditResult: AuditResult
): string {
  const date = new Date()
    .toISOString()
    .split("T")[0];

  return `# FortressJS Security Report

Generated: ${date}

## Target

${auditResult.target}

## Security Score

${auditResult.score}/100

## Missing Protections

${auditResult.missing
  .map(item => `- ${item}`)
  .join("\n")}

## Recommendations

${auditResult.recommendations
  .map(item => `- ${item}`)
  .join("\n")}
`;
}