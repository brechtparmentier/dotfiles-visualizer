/**
 * File Explorer Page
 * Browse dotfiles with platform switching and search
 */

'use client';

import { useEffect, useState } from 'react';
import { FileMapping, FilesResponse, Platform } from '@/lib/types';
import { FileMapper } from '@/lib/parsers/FileMapper';
import { PlatformSwitcher } from '@/components/PlatformSwitcher';
import { FileTree } from '@/components/FileTree';

export default function FileExplorer() {
  const [files, setFiles] = useState<FileMapping[]>([]);
  const [platform, setPlatform] = useState<Platform>('linux');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileMapping | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [platform]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/files?platform=${platform}`);

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data: FilesResponse = await response.json();
      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build file tree from flat list
  const fileTree = files.length > 0 ? FileMapper.buildFileTree(files) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Files</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchFiles}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">File Explorer</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse deployed files by platform
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

        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Files
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to filter files..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {files.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              files deployed
            </span>
          </div>
        </div>
      </div>

      {/* File Tree and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Tree */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 max-h-[70vh] overflow-y-auto">
          {fileTree ? (
            <FileTree
              root={fileTree}
              onFileSelect={setSelectedFile}
              searchQuery={searchQuery}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-500 py-8">
              No files found
            </div>
          )}
        </div>

        {/* File Preview Panel */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 max-h-[70vh] overflow-y-auto">
          {selectedFile ? (
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                File Details
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-1">
                    DEPLOYED PATH
                  </div>
                  <div className="font-mono text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {selectedFile.deployPath}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-1">
                    SOURCE PATH
                  </div>
                  <div className="font-mono text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {selectedFile.sourcePath}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2">
                    PROPERTIES
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFile.isTemplate && (
                      <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        📝 Template
                      </span>
                    )}
                    {selectedFile.isExecutable && (
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                        ⚙️ Executable
                      </span>
                    )}
                  </div>
                </div>

                {selectedFile.requiredModules.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2">
                      REQUIRED MODULES
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.requiredModules.map((module) => (
                        <span
                          key={module}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2">
                    PLATFORMS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFile.platforms.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {p === 'linux' && '🐧 Linux'}
                        {p === 'darwin' && ' macOS'}
                        {p === 'windows' && '🪟 Windows'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <a
                    href={`https://github.com/brechtparmentier/dotfiles/blob/main/${selectedFile.sourcePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Source on GitHub →
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-500 py-8">
              <div className="text-4xl mb-2">👆</div>
              <p>Select a file to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
