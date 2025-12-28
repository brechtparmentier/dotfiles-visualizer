/**
 * API Route: GET /api/config
 * Returns the current dotfiles configuration from GitHub
 */

import { NextResponse } from 'next/server';
import { getGitHubService } from '@/lib/services/GitHubService';
import { YAMLParser } from '@/lib/parsers/YAMLParser';
import type { ConfigResponse } from '@/lib/types';

export const dynamic = 'force-dynamic'; // Disable caching for development

export async function GET() {
  try {
    // Fetch config from GitHub
    const github = getGitHubService();
    const configContent = await github.getConfig();

    // Parse YAML
    const config = YAMLParser.parse(configContent);

    // Validate modules
    if (!YAMLParser.validateModules(config.data.modules)) {
      console.warn('Module validation failed, but continuing with response');
    }

    const response: ConfigResponse = {
      config,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching config:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
