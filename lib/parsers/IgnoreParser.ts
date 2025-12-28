/**
 * Ignore Parser
 * Parses .chezmoiignore file with Go template conditionals
 */

import { DotfilesConfig, Platform } from '../types';

export class IgnoreParser {
  /**
   * Parse .chezmoiignore content and return ignore patterns
   * based on the current platform and module configuration
   */
  static parse(
    ignoreContent: string,
    config: DotfilesConfig,
    platform: Platform
  ): string[] {
    const lines = ignoreContent.split('\n');
    const patterns: string[] = [];

    // State stack for nested conditionals
    const conditionStack: boolean[] = [true]; // Start with "include" state

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        continue;
      }

      // Handle conditional blocks
      if (trimmed.startsWith('{{-')) {
        this.handleConditional(trimmed, conditionStack, config, platform);
        continue;
      }

      // Skip comments
      if (trimmed.startsWith('#')) {
        continue;
      }

      // Current state is top of stack
      const currentlyIncluded = conditionStack[conditionStack.length - 1];

      // Add pattern if we're in an included block
      if (currentlyIncluded && trimmed) {
        patterns.push(trimmed);
      }
    }

    return patterns;
  }

  /**
   * Handle conditional template syntax
   */
  private static handleConditional(
    line: string,
    stack: boolean[],
    config: DotfilesConfig,
    platform: Platform
  ): void {
    const trimmed = line.trim();

    // {{- if ... }}
    if (trimmed.includes('{{- if ')) {
      const condition = this.extractCondition(trimmed);
      const result = this.evaluateCondition(condition, config, platform);
      const parentState = stack[stack.length - 1];
      stack.push(parentState && result);
    }
    // {{- else }}
    else if (trimmed.includes('{{- else')) {
      if (stack.length > 1) {
        const parentState = stack[stack.length - 2];
        const currentState = stack.pop()!;
        stack.push(parentState && !currentState);
      }
    }
    // {{- end }}
    else if (trimmed.includes('{{- end')) {
      if (stack.length > 1) {
        stack.pop();
      }
    }
  }

  /**
   * Extract condition from template syntax
   */
  private static extractCondition(line: string): string {
    const match = line.match(/\{\{-?\s*if\s+(.+?)\s*\}\}/);
    return match ? match[1].trim() : '';
  }

  /**
   * Evaluate a condition
   */
  private static evaluateCondition(
    condition: string,
    config: DotfilesConfig,
    platform: Platform
  ): boolean {
    // Handle: eq .chezmoi.os "platform"
    if (condition.includes('eq .chezmoi.os')) {
      const platformMatch = condition.match(/eq\s+\.chezmoi\.os\s+"(\w+)"/);
      if (platformMatch) {
        const targetPlatform = platformMatch[1];
        return platform === targetPlatform;
      }
    }

    // Handle: not .modules.X.Y (nested properties like .modules.shell.zsh_extras)
    if (condition.includes('not .modules.') && !condition.includes('.enabled')) {
      const propertyMatch = condition.match(/not\s+\.modules\.(\w+)\.(\w+)/);
      if (propertyMatch) {
        const moduleName = propertyMatch[1];
        const propertyName = propertyMatch[2];
        const moduleConfig = config.data.modules[moduleName];
        if (moduleConfig && typeof moduleConfig === 'object') {
          return !((moduleConfig as any)[propertyName]);
        }
        return true;
      }
    }

    // Handle: not .modules.X.enabled
    if (condition.includes('not .modules.')) {
      const moduleMatch = condition.match(/not\s+\.modules\.(\w+)\.enabled/);
      if (moduleMatch) {
        const moduleName = moduleMatch[1];
        const moduleConfig = config.data.modules[moduleName];
        return !(moduleConfig && moduleConfig.enabled);
      }
    }

    // Handle: .modules.X.Y (nested properties)
    if (condition.includes('.modules.') && !condition.includes('.enabled')) {
      const propertyMatch = condition.match(/\.modules\.(\w+)\.(\w+)/);
      if (propertyMatch) {
        const moduleName = propertyMatch[1];
        const propertyName = propertyMatch[2];
        const moduleConfig = config.data.modules[moduleName];
        if (moduleConfig && typeof moduleConfig === 'object') {
          return !!((moduleConfig as any)[propertyName]);
        }
        return false;
      }
    }

    // Handle: .modules.X.enabled
    if (condition.includes('.modules.')) {
      const moduleMatch = condition.match(/\.modules\.(\w+)\.enabled/);
      if (moduleMatch) {
        const moduleName = moduleMatch[1];
        const moduleConfig = config.data.modules[moduleName];
        return !!(moduleConfig && moduleConfig.enabled);
      }
    }

    // Default: true (include)
    console.warn(`Unknown condition: ${condition}`);
    return true;
  }

  /**
   * Get ignore patterns for a specific platform and config
   */
  static getIgnorePatterns(
    ignoreContent: string,
    config: DotfilesConfig,
    platform: Platform
  ): string[] {
    return this.parse(ignoreContent, config, platform);
  }

  /**
   * Check if a file should be ignored
   */
  static shouldIgnore(
    filePath: string,
    ignorePatterns: string[]
  ): boolean {
    return ignorePatterns.some(pattern => {
      // Convert glob pattern to regex
      let regexPattern = pattern
        .replace(/\*\*/g, '___DOUBLESTAR___')
        .replace(/\*/g, '[^/]*')
        .replace(/___DOUBLESTAR___/g, '.*')
        .replace(/\?/g, '.')
        .replace(/\./g, '\\.');

      // Anchor the pattern
      regexPattern = `^${regexPattern}`;

      try {
        const regex = new RegExp(regexPattern);
        return regex.test(filePath);
      } catch (e) {
        console.warn(`Invalid ignore pattern: ${pattern}`);
        return false;
      }
    });
  }
}
