/**
 * Template Parser
 * Evaluates Go template conditionals for simulation
 */

import { DotfilesConfig, Platform } from '../types';

/**
 * Evaluates Go template expressions in the context of a dotfiles configuration
 *
 * Supports:
 * - .modules.X.enabled checks
 * - eq .chezmoi.os "platform" checks
 * - not operator
 * - and/or operators (basic support)
 */
export class TemplateParser {
  /**
   * Evaluate a Go template conditional expression
   *
   * @param expression - The expression inside {{- if ... }}
   * @param config - The dotfiles configuration
   * @param platform - The target platform
   * @returns true if the condition evaluates to true
   */
  static evaluateCondition(
    expression: string,
    config: DotfilesConfig,
    platform: Platform
  ): boolean {
    const trimmed = expression.trim();

    // Handle: not EXPR
    if (trimmed.startsWith('not ')) {
      const innerExpr = trimmed.substring(4).trim();
      return !this.evaluateCondition(innerExpr, config, platform);
    }

    // Handle: and EXPR1 EXPR2
    if (trimmed.startsWith('and ')) {
      const parts = this.splitExpression(trimmed.substring(4).trim());
      return parts.every(part => this.evaluateCondition(part, config, platform));
    }

    // Handle: or EXPR1 EXPR2
    if (trimmed.startsWith('or ')) {
      const parts = this.splitExpression(trimmed.substring(3).trim());
      return parts.some(part => this.evaluateCondition(part, config, platform));
    }

    // Handle: eq .chezmoi.os "platform"
    if (trimmed.includes('eq .chezmoi.os')) {
      const platformMatch = trimmed.match(/eq\s+\.chezmoi\.os\s+"(\w+)"/);
      if (platformMatch) {
        const targetPlatform = platformMatch[1];
        return platform === targetPlatform;
      }
    }

    // Handle: .modules.X.enabled
    if (trimmed.includes('.modules.')) {
      const moduleMatch = trimmed.match(/\.modules\.(\w+)\.enabled/);
      if (moduleMatch) {
        const moduleName = moduleMatch[1];
        return config.data.modules[moduleName as keyof typeof config.data.modules]?.enabled ?? false;
      }
    }

    // Handle: .modules.X.Y (nested properties like .modules.shell.zsh_extras)
    if (trimmed.startsWith('.modules.')) {
      const propertyMatch = trimmed.match(/\.modules\.(\w+)\.(\w+)/);
      if (propertyMatch) {
        const moduleName = propertyMatch[1];
        const propertyName = propertyMatch[2];
        const module = config.data.modules[moduleName as keyof typeof config.data.modules];
        if (module && typeof module === 'object') {
          return (module as any)[propertyName] ?? false;
        }
      }
    }

    // Default: true (allow everything we don't understand)
    return true;
  }

  /**
   * Split expression into parts for and/or operators
   * This is a simple implementation that doesn't handle nested parentheses
   */
  private static splitExpression(expr: string): string[] {
    // For now, just split on common patterns
    // A more robust implementation would use proper parsing
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === ' ' && !inQuotes && current.trim()) {
        // Check if this is the start of a new expression
        if (current.startsWith('.') || current.startsWith('eq') || current.startsWith('not')) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts.length > 0 ? parts : [expr];
  }

  /**
   * Process a template file and determine if it should be included
   * based on the configuration and platform
   *
   * @param templateContent - The full template file content
   * @param config - The dotfiles configuration
   * @param platform - The target platform
   * @returns true if the file should be included
   */
  static shouldIncludeTemplate(
    templateContent: string,
    config: DotfilesConfig,
    platform: Platform
  ): boolean {
    const lines = templateContent.split('\n');
    const conditionStack: boolean[] = [true];

    for (const line of lines) {
      const trimmed = line.trim();

      // Check for conditional start: {{- if ... }}
      if (trimmed.match(/\{\{-?\s*if\s+/)) {
        const match = trimmed.match(/\{\{-?\s*if\s+(.+?)\s*\}\}/);
        if (match) {
          const expression = match[1];
          const parentCondition = conditionStack[conditionStack.length - 1];
          const currentCondition = parentCondition && this.evaluateCondition(expression, config, platform);
          conditionStack.push(currentCondition);
        }
      }
      // Check for else: {{- else }}
      else if (trimmed.match(/\{\{-?\s*else\s*\}\}/)) {
        if (conditionStack.length > 1) {
          const current = conditionStack.pop()!;
          const parent = conditionStack[conditionStack.length - 1];
          conditionStack.push(parent && !current);
        }
      }
      // Check for end: {{- end }}
      else if (trimmed.match(/\{\{-?\s*end\s*\}\}/)) {
        if (conditionStack.length > 1) {
          conditionStack.pop();
        }
      }
    }

    // If we're in a false condition anywhere, the file should not be included
    return conditionStack.every(cond => cond);
  }

  /**
   * Simulate module configuration changes
   *
   * @param baseConfig - The base configuration
   * @param moduleChanges - Module changes to apply { moduleName: enabled }
   * @returns A new configuration with changes applied
   */
  static applyModuleChanges(
    baseConfig: DotfilesConfig,
    moduleChanges: Record<string, boolean>
  ): DotfilesConfig {
    const newConfig = JSON.parse(JSON.stringify(baseConfig)) as DotfilesConfig;

    for (const [moduleName, enabled] of Object.entries(moduleChanges)) {
      if (moduleName in newConfig.data.modules) {
        (newConfig.data.modules as any)[moduleName].enabled = enabled;
      }
    }

    return newConfig;
  }
}
