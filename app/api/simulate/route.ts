/**
 * Simulate API Endpoint
 * POST /api/simulate
 *
 * Simulates module configuration changes and returns the diff
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGitHubService } from '@/lib/services/GitHubService';
import { YAMLParser } from '@/lib/parsers/YAMLParser';
import { IgnoreParser } from '@/lib/parsers/IgnoreParser';
import { FileMapper } from '@/lib/parsers/FileMapper';
import { TemplateParser } from '@/lib/parsers/TemplateParser';
import { Platform, FileMapping, SimulateRequest, SimulateResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: SimulateRequest = await request.json();
    const { moduleChanges, platform = 'linux' } = body;

    if (!moduleChanges || typeof moduleChanges !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid moduleChanges' },
        { status: 400 }
      );
    }

    const github = getGitHubService();

    // Fetch base configuration and ignore file
    const [configContent, ignoreContent] = await Promise.all([
      github.getConfig(),
      github.getIgnoreFile(),
    ]);

    // Parse base configuration
    const baseConfig = YAMLParser.parse(configContent);

    // Create simulated configuration with module changes
    const simulatedConfig = TemplateParser.applyModuleChanges(baseConfig, moduleChanges);

    // Get all source files
    const allSourceFiles = await github.getAllSourceFiles();

    // Helper function to get files for a given configuration
    const getFilesForConfig = (config: typeof baseConfig): FileMapping[] => {
      const ignorePatterns = IgnoreParser.getIgnorePatterns(
        ignoreContent,
        config,
        platform as Platform
      );

      const files: FileMapping[] = [];

      for (const sourcePath of allSourceFiles) {
        // Skip special files
        if (
          sourcePath === '.chezmoi.yaml' ||
          sourcePath === '.chezmoiignore' ||
          sourcePath.includes('.git/') ||
          sourcePath.includes('node_modules/') ||
          sourcePath.startsWith('.')
        ) {
          continue;
        }

        // Map source to deploy path
        const fileMapping = FileMapper.mapFile(sourcePath);
        const fullMapping: FileMapping = {
          ...fileMapping,
          sourcePath,
          deployPath: fileMapping.deployPath || sourcePath,
          platforms: fileMapping.platforms || [platform as Platform],
          requiredModules: fileMapping.requiredModules || [],
        };

        // Check if file should be ignored
        if (IgnoreParser.shouldIgnore(fullMapping.sourcePath, ignorePatterns)) {
          continue;
        }

        // Check platform compatibility
        if (!fullMapping.platforms.includes(platform as Platform)) {
          continue;
        }

        // Check module requirements
        const moduleRequirementsMet = fullMapping.requiredModules.every(
          (mod) => config.data.modules[mod as keyof typeof config.data.modules]?.enabled
        );

        if (!moduleRequirementsMet) {
          continue;
        }

        files.push(fullMapping);
      }

      return files;
    };

    // Get files for both configurations
    const baseFiles = getFilesForConfig(baseConfig);
    const simulatedFiles = getFilesForConfig(simulatedConfig);

    // Calculate diff
    const baseFilePaths = new Set(baseFiles.map((f) => f.deployPath));
    const simulatedFilePaths = new Set(simulatedFiles.map((f) => f.deployPath));

    const filesAdded = simulatedFiles.filter((f) => !baseFilePaths.has(f.deployPath));
    const filesRemoved = baseFiles.filter((f) => !simulatedFilePaths.has(f.deployPath));

    // TODO: Extract aliases from files (Phase 4)
    const aliasesAdded: string[] = [];
    const aliasesRemoved: string[] = [];

    const response: SimulateResponse = {
      filesAdded,
      filesRemoved,
      aliasesAdded,
      aliasesRemoved,
      totalFilesBefore: baseFiles.length,
      totalFilesAfter: simulatedFiles.length,
      platform: platform as Platform,
      moduleChanges,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to simulate configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
