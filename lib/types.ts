/**
 * Type definitions for dotfiles visualizer
 * Based on the .chezmoi.yaml structure and dotfiles repository
 */

export type Platform = 'linux' | 'darwin' | 'windows';

export type ModuleCategory = 'core' | 'application' | 'optional';

export type AliasCategory = 'git' | 'shell' | 'chezmoi' | 'navigation' | 'modern-tools';

export interface DotfilesConfig {
  data: {
    gitUser: {
      name: string;
      email: string;
    };
    windows: boolean;
    github?: {
      user: string;
      repo: string;
    };
    repoPolicy?: {
      protectedBranches: string[];
      requiredApprovals: number;
      requiredChecks: string[];
    };
    modules: ModuleConfiguration;
  };
  encryption: 'age';
  age: {
    identity: string;
    recipient: string;
  };
}

export interface ModuleConfiguration {
  shell: {
    enabled: boolean;
    zsh_extras: boolean;
  };
  git: {
    enabled: boolean;
  };
  vscode: {
    enabled: boolean;
  };
  powershell: {
    enabled: boolean;
  };
  start_menu: {
    enabled: boolean;
  };
  modern_tools: {
    enabled: boolean;
  };
  smart_search: {
    enabled: boolean;
    repo?: string;
    install_location?: string;
  };
  [key: string]: any; // Allow for future modules
}

export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  files: string[];
  aliases: Alias[];
  functions?: FunctionInfo[];
  recommended: boolean;
  dependencies: string[];
  platforms: Platform[];
  startupImpact?: string;
}

export interface FileMapping {
  sourcePath: string;
  deployPath: string;
  isTemplate: boolean;
  isExecutable: boolean;
  requiredModules: string[];
  platforms: Platform[];
  size?: number;
  lastModified?: string;
}

export interface Alias {
  name: string;
  command: string;
  category: AliasCategory;
  requiresModule?: string;
  description?: string;
}

export interface FunctionInfo {
  name: string;
  description: string;
  usage: string;
  requiresModule?: string;
}

export interface SimulationResult {
  filesAdded: FileMapping[];
  filesRemoved: FileMapping[];
  aliasesAdded: Alias[];
  aliasesRemoved: Alias[];
  totalFilesBefore: number;
  totalFilesAfter: number;
  warnings?: string[];
}

export interface ConfigResponse {
  config: DotfilesConfig;
  lastUpdated: string;
}

export interface ModulesResponse {
  modules: ModuleInfo[];
}

export interface FilesResponse {
  files: FileMapping[];
  totalFiles: number;
  platform: Platform;
}

export interface AliasesResponse {
  aliases: Alias[];
  total: number;
}

export interface SimulateRequest {
  moduleChanges: Record<string, boolean>;
  platform?: Platform;
}

export interface SimulateResponse {
  filesAdded: FileMapping[];
  filesRemoved: FileMapping[];
  aliasesAdded: string[];
  aliasesRemoved: string[];
  totalFilesBefore: number;
  totalFilesAfter: number;
  platform: Platform;
  moduleChanges: Record<string, boolean>;
}

/**
 * Module dependencies
 * Maps module ID to required parent modules
 */
export const MODULE_DEPENDENCIES: Record<string, string[]> = {
  smart_search: ['shell'],
  start_menu: ['shell'],
};

/**
 * Module metadata
 * Static information about each module
 */
export const MODULE_METADATA: Record<string, Partial<ModuleInfo>> = {
  shell: {
    name: 'Shell Environment',
    category: 'core',
    description: 'Bash/Zsh configuration with 30+ aliases and functions',
    recommended: true,
    dependencies: [],
    platforms: ['linux', 'darwin', 'windows'],
  },
  git: {
    name: 'Git Configuration',
    category: 'core',
    description: 'Git user info and default settings',
    recommended: true,
    dependencies: [],
    platforms: ['linux', 'darwin', 'windows'],
  },
  vscode: {
    name: 'VS Code Settings',
    category: 'application',
    description: 'Editor preferences and platform-specific terminal profiles',
    recommended: true,
    dependencies: [],
    platforms: ['linux', 'darwin', 'windows'],
  },
  powershell: {
    name: 'PowerShell Profile',
    category: 'application',
    description: 'PowerShell configuration with git aliases',
    recommended: false,
    dependencies: [],
    platforms: ['windows'],
  },
  start_menu: {
    name: 'Start Menu Integration',
    category: 'optional',
    description: 'Brecht-linux-toolkit integration (project-specific)',
    recommended: false,
    dependencies: ['shell'],
    platforms: ['linux', 'darwin'],
  },
  modern_tools: {
    name: 'Modern CLI Tools',
    category: 'optional',
    description: 'Aliases for exa, bat, fd, ripgrep',
    recommended: true,
    dependencies: [],
    platforms: ['linux', 'darwin'],
  },
  smart_search: {
    name: 'Smart Search Toolkit',
    category: 'optional',
    description: 'Search toolkit with port calculator',
    recommended: true,
    dependencies: ['shell'],
    platforms: ['linux', 'darwin'],
  },
};
