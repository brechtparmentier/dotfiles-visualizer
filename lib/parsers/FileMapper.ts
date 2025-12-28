/**
 * File Mapper
 * Maps chezmoi source files to their deployed paths
 */

import { FileMapping, Platform } from '../types';

export class FileMapper {
  /**
   * Map a single source file to its deployment information
   */
  static mapFile(sourcePath: string): Partial<FileMapping> {
    let deployPath = sourcePath;
    let isExecutable = false;
    let isTemplate = false;

    // Get the filename from the path
    const pathParts = sourcePath.split('/');
    let filename = pathParts[pathParts.length - 1];
    const dirPath = pathParts.slice(0, -1);

    // Handle executable_ prefix
    if (filename.startsWith('executable_')) {
      isExecutable = true;
      filename = filename.replace(/^executable_/, '');
    }

    // Handle .tmpl suffix
    if (filename.endsWith('.tmpl')) {
      isTemplate = true;
      filename = filename.replace(/\.tmpl$/, '');
    }

    // Reconstruct the path with modified filename
    const modifiedPath = [...dirPath, filename].join('/');

    // Handle dot_ prefix in directory names and filename
    deployPath = modifiedPath
      .split('/')
      .map(part => part.replace(/^dot_/, '.'))
      .join('/');

    // Prepend home directory for root-level files
    if (!deployPath.startsWith('/') && !deployPath.startsWith('.')) {
      deployPath = `~/${deployPath}`;
    } else if (deployPath.startsWith('.')) {
      deployPath = `~/${deployPath}`;
    }

    return {
      sourcePath,
      deployPath,
      isTemplate,
      isExecutable,
    };
  }

  /**
   * Infer which modules are required for a file
   */
  static inferModules(sourcePath: string): string[] {
    const modules: string[] = [];

    // Check path patterns
    if (sourcePath.includes('shell/') || sourcePath.includes('dot_bashrc') || sourcePath.includes('dot_zshrc')) {
      modules.push('shell');
    }

    if (sourcePath.includes('Code/User/')) {
      modules.push('vscode');
    }

    if (sourcePath.includes('PowerShell/')) {
      modules.push('powershell');
    }

    if (sourcePath.includes('start_menu')) {
      modules.push('start_menu');
    }

    if (sourcePath.includes('gitconfig')) {
      modules.push('git');
    }

    if (sourcePath.includes('smart-search') || sourcePath.includes('smart_search')) {
      modules.push('smart_search');
    }

    // If no specific module found, might be a general file
    return modules;
  }

  /**
   * Infer which platforms support this file
   */
  static inferPlatforms(sourcePath: string): Platform[] {
    // PowerShell = Windows only
    if (sourcePath.includes('PowerShell/')) {
      return ['windows'];
    }

    // Most shell configs = Unix-like
    if (sourcePath.includes('dot_bashrc') || sourcePath.includes('dot_zshrc')) {
      return ['linux', 'darwin'];
    }

    // VS Code paths differ between platforms
    if (sourcePath.includes('Code/User/')) {
      // On Windows it's in AppData, but the config is the same
      return ['linux', 'darwin', 'windows'];
    }

    // Scripts in bin/ are typically Unix
    if (sourcePath.includes('bin/executable_') || sourcePath.includes('scripts/')) {
      return ['linux', 'darwin'];
    }

    // Default: all platforms
    return ['linux', 'darwin', 'windows'];
  }

  /**
   * Check if a path should be ignored based on patterns
   */
  static shouldIgnore(path: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      // Convert glob pattern to regex
      // ** matches anything including /
      // * matches anything except /
      let regexPattern = pattern
        .replace(/\*\*/g, '___DOUBLESTAR___')
        .replace(/\*/g, '[^/]*')
        .replace(/___DOUBLESTAR___/g, '.*')
        .replace(/\?/g, '.')
        .replace(/\./g, '\\.');

      // Anchor the pattern
      regexPattern = `^${regexPattern}$`;

      try {
        const regex = new RegExp(regexPattern);
        return regex.test(path);
      } catch (e) {
        console.warn(`Invalid ignore pattern: ${pattern}`);
        return false;
      }
    });
  }

  /**
   * Build complete FileMapping from source file
   */
  static buildFileMapping(
    sourcePath: string,
    requiredModules?: string[],
    platforms?: Platform[]
  ): FileMapping {
    const baseMapping = this.mapFile(sourcePath);

    return {
      sourcePath,
      deployPath: baseMapping.deployPath || '',
      isTemplate: baseMapping.isTemplate || false,
      isExecutable: baseMapping.isExecutable || false,
      requiredModules: requiredModules || this.inferModules(sourcePath),
      platforms: platforms || this.inferPlatforms(sourcePath),
    };
  }

  /**
   * Group files into a tree structure
   */
  static buildFileTree(files: FileMapping[]): FileTreeNode {
    const root: FileTreeNode = {
      name: '~',
      path: '~',
      type: 'directory',
      children: [],
    };

    for (const file of files) {
      // Remove leading ~/ from path
      const relativePath = file.deployPath.replace(/^~\//, '');
      const parts = relativePath.split('/');

      let currentNode = root;

      // Build tree path
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = i === parts.length - 1;

        // Find or create child node
        let childNode = currentNode.children?.find(child => child.name === part);

        if (!childNode) {
          childNode = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            type: isLastPart ? 'file' : 'directory',
            children: isLastPart ? undefined : [],
            fileInfo: isLastPart ? file : undefined,
          };

          if (!currentNode.children) {
            currentNode.children = [];
          }
          currentNode.children.push(childNode);
        }

        currentNode = childNode;
      }
    }

    return root;
  }
}

/**
 * File Tree Node
 */
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  fileInfo?: FileMapping;
}
