/**
 * API Route: GET /api/files
 * Returns file mappings based on platform and module configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGitHubService } from '@/lib/services/GitHubService';
import { YAMLParser } from '@/lib/parsers/YAMLParser';
import { FileMapper } from '@/lib/parsers/FileMapper';
import { IgnoreParser } from '@/lib/parsers/IgnoreParser';
import type { FilesResponse, Platform, FileMapping } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = (searchParams.get('platform') || 'linux') as Platform;

    // Fetch configuration
    const github = getGitHubService();
    const [configContent, ignoreContent] = await Promise.all([
      github.getConfig(),
      github.getIgnoreFile(),
    ]);

    const config = YAMLParser.parse(configContent);

    // Get ignore patterns for this platform and config
    const ignorePatterns = IgnoreParser.getIgnorePatterns(
      ignoreContent,
      config,
      platform
    );

    // Get all source files from GitHub
    const allSourceFiles = await github.getAllSourceFiles();

    // Filter and map files
    const files: FileMapping[] = [];

    for (const sourcePath of allSourceFiles) {
      // Skip directories and special files
      if (sourcePath.endsWith('/') ||
          sourcePath === '.git' ||
          sourcePath.startsWith('.git/') ||
          sourcePath === 'LICENSE' ||
          sourcePath === 'README.md' ||
          sourcePath === 'CLAUDE.md' ||
          sourcePath.startsWith('docs/') ||
          sourcePath === '.gitignore' ||
          sourcePath === '.pre-commit-config.yaml' ||
          sourcePath === '.secrets.baseline' ||
          sourcePath === 'Makefile') {
        continue;
      }

      // Build file mapping
      const fileMapping = FileMapper.buildFileMapping(sourcePath);

      // Check if file should be ignored based on platform
      const deployPathForIgnore = fileMapping.deployPath.replace(/^~\//, '');
      if (IgnoreParser.shouldIgnore(deployPathForIgnore, ignorePatterns)) {
        continue;
      }

      // Check if file's platforms include current platform
      if (!fileMapping.platforms.includes(platform)) {
        continue;
      }

      // Check if required modules are enabled
      const modulesEnabled = fileMapping.requiredModules.every(
        moduleName => config.data.modules[moduleName]?.enabled
      );

      if (!modulesEnabled) {
        continue;
      }

      files.push(fileMapping);
    }

    const response: FilesResponse = {
      files,
      totalFiles: files.length,
      platform,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching files:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
