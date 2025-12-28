/**
 * Dashboard Page
 * Main landing page showing dotfiles configuration overview
 */

'use client';

import { useEffect, useState } from 'react';
import { DotfilesConfig, ConfigResponse } from '@/lib/types';
import { ModuleCard } from '@/components/ModuleCard';
import { formatRelativeTime } from '@/lib/utils';

export default function Dashboard() {
  const [config, setConfig] = useState<DotfilesConfig | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/config');

      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }

      const data: ConfigResponse = await response.json();
      setConfig(data.config);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchConfig}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  const enabledModules = Object.entries(config.data.modules).filter(
    ([_, module]) => module.enabled
  );

  const totalFiles = 12; // TODO: Calculate from actual files
  const totalAliases = 35; // TODO: Calculate from actual aliases

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Brecht's Dotfiles</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive visualization of dotfiles configuration
        </p>
        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last synced: {formatRelativeTime(lastUpdated)}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalFiles}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Files Deployed</div>
        </div>

        <div className="p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalAliases}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Aliases & Functions</div>
        </div>

        <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {enabledModules.length}/{Object.keys(config.data.modules).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Modules Enabled</div>
        </div>
      </div>

      {/* User Info */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Git Configuration</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Name:</span> {config.data.gitUser.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Email:</span> {config.data.gitUser.email}
        </p>
      </div>

      {/* Core Modules */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Core Modules</h2>
        <div className="space-y-4">
          {['shell', 'git'].map((id) => (
            <ModuleCard
              key={id}
              id={id}
              module={config.data.modules[id as keyof typeof config.data.modules]}
            />
          ))}
        </div>
      </div>

      {/* Application Modules */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Application Modules</h2>
        <div className="space-y-4">
          {['vscode', 'powershell'].map((id) => (
            <ModuleCard
              key={id}
              id={id}
              module={config.data.modules[id as keyof typeof config.data.modules]}
            />
          ))}
        </div>
      </div>

      {/* Optional Modules */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Optional Modules</h2>
        <div className="space-y-4">
          {['start_menu', 'modern_tools', 'smart_search'].map((id) => (
            <ModuleCard
              key={id}
              id={id}
              module={config.data.modules[id as keyof typeof config.data.modules]}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={fetchConfig}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          🔄 Refresh Configuration
        </button>
        <a
          href="/files"
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium inline-block"
        >
          📂 Browse Files
        </a>
      </div>
    </div>
  );
}
