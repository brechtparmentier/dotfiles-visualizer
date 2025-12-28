/**
 * Module Simulator Page
 * Interactive module configuration simulator with live diff preview
 */

'use client';

import { useEffect, useState } from 'react';
import {
  DotfilesConfig,
  ConfigResponse,
  SimulateRequest,
  SimulateResponse,
  Platform,
  ModuleConfiguration,
} from '@/lib/types';
import { SimulatorPanel } from '@/components/SimulatorPanel';
import { PlatformSwitcher } from '@/components/PlatformSwitcher';
import { cn } from '@/lib/utils';

export default function ModuleSimulator() {
  const [config, setConfig] = useState<DotfilesConfig | null>(null);
  const [simulatedModules, setSimulatedModules] = useState<ModuleConfiguration | null>(null);
  const [platform, setPlatform] = useState<Platform>('linux');
  const [simulationResult, setSimulationResult] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial configuration
  useEffect(() => {
    fetchConfig();
  }, []);

  // Simulate whenever modules or platform changes
  useEffect(() => {
    if (config && simulatedModules) {
      simulateConfiguration();
    }
  }, [simulatedModules, platform]);

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
      setSimulatedModules(data.config.data.modules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  const simulateConfiguration = async () => {
    if (!config || !simulatedModules) return;

    try {
      setSimulating(true);
      setError(null);

      // Build module changes object
      const moduleChanges: Record<string, boolean> = {};
      for (const [moduleId, module] of Object.entries(simulatedModules)) {
        if (typeof module === 'object' && 'enabled' in module) {
          moduleChanges[moduleId] = module.enabled;
        }
      }

      const requestBody: SimulateRequest = {
        moduleChanges,
        platform,
      };

      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to simulate configuration');
      }

      const result: SimulateResponse = await response.json();
      setSimulationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    if (!simulatedModules) return;

    const newModules = { ...simulatedModules };
    const module = newModules[moduleId as keyof ModuleConfiguration];

    if (module && typeof module === 'object' && 'enabled' in module) {
      (module as any).enabled = enabled;
    }

    setSimulatedModules(newModules);
  };

  const handleReset = () => {
    if (config) {
      setSimulatedModules(config.data.modules);
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

  if (error && !config) {
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

  if (!config || !simulatedModules) {
    return null;
  }

  const hasChanges = simulationResult && (
    simulationResult.filesAdded.length > 0 ||
    simulationResult.filesRemoved.length > 0
  );

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Module Simulator</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Toggle modules to see what files will be deployed
            </p>
          </div>
          <a
            href="/"
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Platform Switcher */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Platform
          </label>
          <PlatformSwitcher currentPlatform={platform} onChange={setPlatform} />
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm"
        >
          🔄 Reset to Current Config
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Module Toggles */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Configure Modules
          </h2>
          <SimulatorPanel
            modules={simulatedModules}
            onModuleToggle={handleModuleToggle}
            isSimulating={simulating}
          />
        </div>

        {/* Right: Diff View */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Changes Preview
          </h2>

          {simulating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Simulating...</p>
            </div>
          ) : simulationResult ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {simulationResult.totalFilesBefore} → {simulationResult.totalFilesAfter}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {hasChanges ? (
                      <>
                        +{simulationResult.filesAdded.length} -{simulationResult.filesRemoved.length}
                      </>
                    ) : (
                      'No changes'
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">File Changes</div>
                </div>
              </div>

              {/* Added Files */}
              {simulationResult.filesAdded.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-700 dark:text-green-400 flex items-center gap-2">
                    <span>✅</span>
                    <span>Files Added ({simulationResult.filesAdded.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {simulationResult.filesAdded.map((file) => (
                      <div
                        key={file.deployPath}
                        className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900"
                      >
                        <div className="font-mono text-sm text-green-900 dark:text-green-100">
                          {file.deployPath}
                        </div>
                        {file.requiredModules.length > 0 && (
                          <div className="mt-1 flex gap-1 flex-wrap">
                            {file.requiredModules.map((mod) => (
                              <span
                                key={mod}
                                className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded"
                              >
                                {mod}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Removed Files */}
              {simulationResult.filesRemoved.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-700 dark:text-red-400 flex items-center gap-2">
                    <span>❌</span>
                    <span>Files Removed ({simulationResult.filesRemoved.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {simulationResult.filesRemoved.map((file) => (
                      <div
                        key={file.deployPath}
                        className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900"
                      >
                        <div className="font-mono text-sm text-red-900 dark:text-red-100 line-through">
                          {file.deployPath}
                        </div>
                        {file.requiredModules.length > 0 && (
                          <div className="mt-1 flex gap-1 flex-wrap">
                            {file.requiredModules.map((mod) => (
                              <span
                                key={mod}
                                className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded"
                              >
                                {mod}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Changes */}
              {!hasChanges && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✨</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    No changes detected. This is the same as your current configuration.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-500">
              Toggle modules to see changes
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
