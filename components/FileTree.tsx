/**
 * File Tree Component
 * Interactive tree view for browsing files
 */

'use client';

import { useState } from 'react';
import { FileMapping } from '@/lib/types';
import { FileTreeNode } from '@/lib/parsers/FileMapper';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  root: FileTreeNode;
  onFileSelect?: (file: FileMapping) => void;
  searchQuery?: string;
}

export function FileTree({ root, onFileSelect, searchQuery }: FileTreeProps) {
  return (
    <div className="font-mono text-sm">
      <TreeNode
        node={root}
        level={0}
        onFileSelect={onFileSelect}
        searchQuery={searchQuery}
      />
    </div>
  );
}

interface TreeNodeProps {
  node: FileTreeNode;
  level: number;
  onFileSelect?: (file: FileMapping) => void;
  searchQuery?: string;
}

function TreeNode({ node, level, onFileSelect, searchQuery }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const hasChildren = node.children && node.children.length > 0;
  const isDirectory = node.type === 'directory';
  const isFile = node.type === 'file';

  // Filter children based on search query
  const filteredChildren = searchQuery
    ? node.children?.filter((child) => {
        const childName = child.name.toLowerCase();
        const query = searchQuery.toLowerCase();
        return childName.includes(query) || hasMatchingDescendant(child, query);
      })
    : node.children;

  // If searching and no matching children, don't render this node (unless it matches itself)
  if (searchQuery && isDirectory) {
    const matches = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matches && (!filteredChildren || filteredChildren.length === 0)) {
      return null;
    }
  }

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else if (isFile && node.fileInfo && onFileSelect) {
      onFileSelect(node.fileInfo);
    }
  };

  const icon = isDirectory
    ? isExpanded
      ? '📂'
      : '📁'
    : node.fileInfo?.isExecutable
    ? '⚙️'
    : node.fileInfo?.isTemplate
    ? '📝'
    : '📄';

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          isFile && 'hover:bg-blue-50 dark:hover:bg-blue-950/20'
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleClick}
      >
        {isDirectory && (
          <span className="text-gray-400 dark:text-gray-600">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        <span className="text-lg">{icon}</span>
        <span className={cn(
          isDirectory && 'font-semibold text-gray-700 dark:text-gray-300',
          isFile && 'text-gray-600 dark:text-gray-400'
        )}>
          {node.name}
        </span>

        {/* File info badges */}
        {isFile && node.fileInfo && (
          <div className="flex gap-1 ml-2">
            {node.fileInfo.isTemplate && (
              <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                template
              </span>
            )}
            {node.fileInfo.isExecutable && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                executable
              </span>
            )}
            {node.fileInfo.requiredModules.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                {node.fileInfo.requiredModules.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Render children if expanded */}
      {isDirectory && isExpanded && filteredChildren && filteredChildren.length > 0 && (
        <div>
          {filteredChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Check if a node or any of its descendants match the search query
 */
function hasMatchingDescendant(node: FileTreeNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) {
    return true;
  }

  if (node.children) {
    return node.children.some((child) => hasMatchingDescendant(child, query));
  }

  return false;
}
