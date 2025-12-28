# Dotfiles Visualizer

Interactive web application for visualizing Brecht's dotfiles repository structure and configuration.

## Features

### ✅ Implemented (Phase 1-3)

- 📊 **Dashboard** - Module status overview with statistics
- 📂 **File Explorer** - Interactive file tree with platform switching
- 🎮 **Module Simulator** - Toggle modules and see deployment changes in real-time
- 🌍 **Platform Awareness** - Toggle between Linux, macOS, and Windows
- 🔍 **File Search** - Filter files by name in real-time
- 📝 **File Details** - View source paths, deployment paths, and metadata
- 🔄 **Live Diff Preview** - See exactly which files are added/removed when toggling modules

### 🚧 Coming Soon (Phase 4-5)

- 🔖 Alias Catalog - Searchable database of all aliases and functions
- 🌙 Dark Mode - Full dark mode support
- 🔄 Auto-sync - GitHub webhooks for automatic updates
- 📋 Copy Commands - Click-to-copy for all commands
- ⌨️ Command Palette - Quick search and navigation

## Tech Stack

- **Frontend**: React + TypeScript + Next.js 14
- **Styling**: TailwindCSS
- **State**: Zustand
- **API**: Next.js API Routes (Serverless Functions)
- **Data Source**: GitHub API

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- GitHub Personal Access Token (optional, for higher API rate limits)

### Installation

```bash
# Clone the repository
git clone https://github.com/brechtparmentier/dotfiles-visualizer.git
cd dotfiles-visualizer

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Add your GitHub token (optional but recommended)
# Edit .env.local and add your GITHUB_TOKEN

# Run development server
pnpm dev
```

Open [http://localhost:20903](http://localhost:20903) to see the app.

### Environment Variables

Create a `.env.local` file with:

```env
# Optional: GitHub Personal Access Token for higher API rate limits
GITHUB_TOKEN=ghp_your_token_here

# Optional: Override dotfiles repository
# DOTFILES_OWNER=brechtparmentier
# DOTFILES_REPO=dotfiles
# DOTFILES_BRANCH=main
```

**Why you need a GitHub token:**
Without a token, GitHub API limits you to 60 requests/hour. With a token, you get 5000 requests/hour. Get one at: https://github.com/settings/tokens

## Development

```bash
# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Deployment

This app is designed to be deployed on [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brechtparmentier/dotfiles-visualizer)

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Project Structure

```
dotfiles-visualizer/
├── app/
│   ├── api/              # API routes
│   │   ├── config/       # GET /api/config
│   │   └── files/        # GET /api/files
│   ├── files/            # File Explorer page
│   └── page.tsx          # Dashboard page
├── components/
│   ├── ModuleCard.tsx    # Module card component
│   ├── PlatformSwitcher.tsx  # Platform toggle
│   └── FileTree.tsx      # File tree component
├── lib/
│   ├── parsers/
│   │   ├── YAMLParser.ts     # .chezmoi.yaml parser
│   │   ├── FileMapper.ts     # Chezmoi file mapping
│   │   └── IgnoreParser.ts   # .chezmoiignore parser
│   ├── services/
│   │   └── GitHubService.ts  # GitHub API client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## API Endpoints

### GET /api/config

Returns the current dotfiles configuration from GitHub.

**Response:**

```json
{
  "config": {
    "data": {
      "gitUser": { "name": "...", "email": "..." },
      "modules": { ... }
    }
  },
  "lastUpdated": "2025-12-28T10:00:00Z"
}
```

### GET /api/files?platform=linux

Returns file mappings for a specific platform.

**Query Params:**

- `platform`: `linux` | `darwin` | `windows` (default: `linux`)

**Response:**

```json
{
  "files": [
    {
      "sourcePath": "dot_bashrc",
      "deployPath": "~/.bashrc",
      "isTemplate": false,
      "isExecutable": false,
      "requiredModules": ["shell"],
      "platforms": ["linux", "darwin"]
    }
  ],
  "totalFiles": 12,
  "platform": "linux"
}
```

## How It Works

### File Mapping

The app understands chezmoi's naming conventions:

| Source File                       | Deployed To                 | Notes                                  |
| --------------------------------- | --------------------------- | -------------------------------------- |
| `dot_bashrc`                      | `~/.bashrc`                 | `dot_` prefix becomes `.`              |
| `dot_config/shell/common.sh.tmpl` | `~/.config/shell/common.sh` | `.tmpl` files are templates            |
| `executable_script`               | `~/bin/script`              | `executable_` prefix marks executables |

### Platform Filtering

The `.chezmoiignore` file uses Go template conditionals:

```yaml
{{- if eq .chezmoi.os "windows" }}
# Ignore Unix files on Windows
.config/**
.bashrc
{{- else }}
# Ignore Windows files on Unix
PowerShell/**
{{- end }}
```

The app parses these conditionals and shows the correct files for each platform.

## License

MIT

## Related

- [Dotfiles Repository](https://github.com/brechtparmentier/dotfiles)
- [chezmoi](https://www.chezmoi.io/)
