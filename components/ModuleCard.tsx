/**
 * Module Card Component
 * Displays a single module with its status and metadata
 */

'use client';

import { cn } from '@/lib/utils';
import { MODULE_METADATA } from '@/lib/types';

interface ModuleCardProps {
  id: string;
  module: {
    enabled: boolean;
    [key: string]: any;
  };
}

export function ModuleCard({ id, module }: ModuleCardProps) {
  const metadata = MODULE_METADATA[id];

  if (!metadata) {
    return null;
  }

  const isEnabled = module.enabled;

  return (
    <div
      className={cn(
        'p-6 rounded-lg border transition-all hover:shadow-md',
        isEnabled
          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
          : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">{metadata.name}</h3>
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                metadata.category === 'core' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                metadata.category === 'application' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                metadata.category === 'optional' && 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'
              )}
            >
              {metadata.category}
            </span>
            {metadata.recommended && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                recommended
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {metadata.description}
          </p>

          {metadata.platforms && metadata.platforms.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <span>Platforms:</span>
              {metadata.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800"
                >
                  {platform}
                </span>
              ))}
            </div>
          )}

          {metadata.dependencies && metadata.dependencies.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              <span>Requires: {metadata.dependencies.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="ml-4">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold',
              isEnabled
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            )}
          >
            {isEnabled ? '✓' : '○'}
          </div>
        </div>
      </div>
    </div>
  );
}
