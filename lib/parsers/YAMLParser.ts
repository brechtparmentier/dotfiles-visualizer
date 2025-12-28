/**
 * YAML Parser
 * Parses .chezmoi.yaml configuration file
 */

import yaml from 'js-yaml';
import { DotfilesConfig, ModuleConfiguration } from '../types';

export class YAMLParser {
  /**
   * Parse .chezmoi.yaml content into DotfilesConfig
   */
  static parse(content: string): DotfilesConfig {
    try {
      const parsed = yaml.load(content) as any;

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid YAML format');
      }

      if (!parsed.data?.modules) {
        throw new Error('Missing required data.modules section in .chezmoi.yaml');
      }

      // Validate structure
      return parsed as DotfilesConfig;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`YAML parsing failed: ${error.message}`);
      }
      throw new Error('Unknown error parsing YAML');
    }
  }

  /**
   * Stringify DotfilesConfig back to YAML
   */
  static stringify(config: DotfilesConfig): string {
    try {
      return yaml.dump(config, {
        lineWidth: -1, // No line wrapping
        noRefs: true,
        sortKeys: false,
      });
    } catch (error) {
      throw new Error('Failed to stringify config to YAML');
    }
  }

  /**
   * Extract just the module configuration
   */
  static getModules(config: DotfilesConfig): ModuleConfiguration {
    return config.data.modules;
  }

  /**
   * Update module configuration
   */
  static setModules(
    config: DotfilesConfig,
    modules: Partial<ModuleConfiguration>
  ): DotfilesConfig {
    return {
      ...config,
      data: {
        ...config.data,
        modules: {
          ...config.data.modules,
          ...modules,
        },
      },
    };
  }

  /**
   * Validate module configuration
   */
  static validateModules(modules: ModuleConfiguration): boolean {
    const requiredModules = ['shell', 'git', 'vscode', 'powershell', 'start_menu', 'modern_tools', 'smart_search'];

    for (const moduleName of requiredModules) {
      if (!(moduleName in modules)) {
        console.warn(`Missing module in configuration: ${moduleName}`);
        return false;
      }

      const module = modules[moduleName];
      if (typeof module !== 'object' || module === null) {
        console.warn(`Invalid module structure: ${moduleName}`);
        return false;
      }

      if (!('enabled' in module)) {
        console.warn(`Module missing 'enabled' property: ${moduleName}`);
        return false;
      }
    }

    return true;
  }
}
