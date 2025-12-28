/**
 * Platform Switcher Component
 * Allows switching between Linux, macOS, and Windows views
 */

'use client';

import { Platform } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlatformSwitcherProps {
  currentPlatform: Platform;
  onChange: (platform: Platform) => void;
  className?: string;
}

const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'linux', label: 'Linux', icon: '🐧' },
  { value: 'darwin', label: 'macOS', icon: '' },
  { value: 'windows', label: 'Windows', icon: '🪟' },
];

export function PlatformSwitcher({
  currentPlatform,
  onChange,
  className,
}: PlatformSwitcherProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {PLATFORMS.map((platform) => {
        const isActive = currentPlatform === platform.value;

        return (
          <button
            key={platform.value}
            onClick={() => onChange(platform.value)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all',
              'border-2 flex items-center gap-2',
              isActive
                ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            )}
          >
            <span className="text-lg">{platform.icon}</span>
            <span>{platform.label}</span>
          </button>
        );
      })}
    </div>
  );
}
