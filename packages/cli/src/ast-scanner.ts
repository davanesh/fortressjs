import ts from "typescript";
import { AuditScanner, ScanResult } from "./scanner";

export class ASTScanner implements AuditScanner {
  name = "ASTScanner";
  scan(fileContent: string): ScanResult {
    const sourceFile =
      ts.createSourceFile(
        "temp.ts",
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );
    const result: ScanResult = {
      hasCSP: false,
      hasRateLimiting: false,
      hasRequestSizeLimiting: false,
      hasLogger: false,
      hasThreatDetection: false,
      hasHTTPS: false
    };
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleName = node.moduleSpecifier.getText(sourceFile);
        if (moduleName.includes("@fortressjs/core")) {
          result.hasCSP = true;
        }
      }
    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      if (ts.isPropertyAccessExpression(expression)) {
        if (
          expression.expression.getText(sourceFile) ===
          "fortress"
        ) {
          switch (
            expression.name.getText(sourceFile)
          ) {
            case "headers":
              result.hasCSP = true;
              break;

            case "rateLimit":
              result.hasRateLimiting = true;
              break;

            case "requestLimit":
              result.hasRequestSizeLimiting = true;
              break;

              case "logger":
                result.hasLogger = true;
                break;

              case "threatDetector":
                result.hasThreatDetection = true;
                break;
            }
          }
        }
      } ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return result;
  }
}