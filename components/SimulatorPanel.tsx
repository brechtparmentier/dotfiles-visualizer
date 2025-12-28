/**
 * Simulator Panel Component
 * Interactive toggles for module configuration simulation
 */

'use client';

import { ModuleConfiguration, MODULE_METADATA } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SimulatorPanelProps {
  modules: ModuleConfiguration;
  onModuleToggle: (moduleId: string, enabled: boolean) => void;
  isSimulating?: boolean;
}

export function SimulatorPanel({ modules, onModuleToggle, isSimulating }: SimulatorPanelProps) {
  const moduleGroups = {
    core: ['shell', 'git'],
    application: ['vscode', 'powershell'],
    optional: ['start_menu', 'modern_tools', 'smart_search'],
  };

  const renderModuleToggle = (moduleId: string) => {
    const module = modules[moduleId as keyof ModuleConfiguration];
    const metadata = MODULE_METADATA[moduleId];

    if (!module || !metadata) return null;

    const isEnabled = typeof module === 'object' && 'enabled' in module
      ? module.enabled
      : false;

    return (
      <div
        key={moduleId}
        className={cn(
          'p-4 rounded-lg border-2 transition-all',
          isEnabled
            ? 'bg-green-50 dark:bg-green-950/20 border-green-500 dark:border-green-700'
            : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {metadata.name}
            </h4>
            {metadata.recommended && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                recommended
              </span>
            )}
          </div>

          <button
            onClick={() => onModuleToggle(moduleId, !isEnabled)}
            disabled={isSimulating}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {metadata.description}
        </p>

        {metadata.dependencies && metadata.dependencies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-500">Requires:</span>
            {metadata.dependencies.map((dep) => (
              <span
                key={dep}
                className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
              >
                {MODULE_METADATA[dep]?.name || dep}
              </span>
            ))}
          </div>
        )}

        {metadata.platforms && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-500">Platforms:</span>
            {metadata.platforms.map((platform) => (
              <span
                key={platform}
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                {platform === 'linux' && '🐧'}
                {platform === 'darwin' && ''}
                {platform === 'windows' && '🪟'}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Core Modules */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
          Core Modules
        </h3>
        <div className="space-y-3">
          {moduleGroups.core.map(renderModuleToggle)}
        </div>
      </div>

      {/* Application Modules */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
          Application Modules
        </h3>
        <div className="space-y-3">
          {moduleGroups.application.map(renderModuleToggle)}
        </div>
      </div>

      {/* Optional Modules */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
          Optional Modules
        </h3>
        <div className="space-y-3">
          {moduleGroups.optional.map(renderModuleToggle)}
        </div>
      </div>
    </div>
  );
}
