# Dotfiles Visualizer - Progress Notes

**Last Updated:** 2025-12-28
**Session End:** Phase 3 completed and pushed to GitHub

---

## 🎯 Project Status

### ✅ Completed Phases

#### Phase 1: Foundation & Setup (MVP)
- [x] Repository setup on GitHub: `brechtparmentier/dotfiles-visualizer`
- [x] Next.js 14 with TypeScript, Tailwind CSS
- [x] Type definitions (`lib/types.ts`)
- [x] GitHubService for fetching from GitHub API
- [x] YAMLParser for `.chezmoi.yaml`
- [x] API endpoint: `GET /api/config`
- [x] Dashboard page with ModuleCard component
- [x] GitHub token configured in `.env.local`

#### Phase 2: File Explorer
- [x] FileMapper parser for chezmoi naming conventions
- [x] IgnoreParser for Go template conditionals in `.chezmoiignore`
- [x] API endpoint: `GET /api/files?platform={linux|darwin|windows}`
- [x] PlatformSwitcher component
- [x] FileTree component with search and expand/collapse
- [x] File Explorer page (`/files`) with split view
- [x] Updated Dashboard with "Browse Files" link
- [x] README updated with Phase 2 documentation

#### Phase 3: Module Simulator ⭐ NEW
- [x] TemplateParser for Go template conditional evaluation
- [x] API endpoint: `POST /api/simulate`
- [x] SimulatorPanel component with interactive toggles
- [x] Simulator page (`/simulator`) with live diff view
- [x] Enhanced IgnoreParser for nested properties (e.g., `shell.zsh_extras`)
- [x] Dashboard updated with "Module Simulator" link
- [x] Full testing with various module configurations

### 🚧 Remaining Phases

#### Phase 4: Alias Catalog (Next Up)
- [ ] AliasExtractor to parse `common.sh.tmpl`
- [ ] MarkdownParser for `MODULES.md`
- [ ] API endpoint: `GET /api/aliases`
- [ ] Aliases catalog page with search/filter
- [ ] Click-to-copy functionality
- [ ] Function reference section

#### Phase 5: Polish & Deployment
- [ ] Dark mode (next-themes)
- [ ] GitHub webhook handler (`POST /api/webhook`)
- [ ] Cache layer for API responses
- [ ] Command palette (Cmd+K search)
- [ ] Copy buttons everywhere
- [ ] Performance optimizations
- [ ] Optional: Deploy to Vercel (or keep local)

---

## 🏗️ Technical Architecture

### API Endpoints
- `GET /api/config` - Dotfiles configuration from `.chezmoi.yaml`
- `GET /api/files?platform={platform}` - File mappings with platform filtering
- `POST /api/simulate` - Module configuration simulation

### Key Parsers
- **YAMLParser** - Parse `.chezmoi.yaml`
- **FileMapper** - Map chezmoi source → deployed paths
- **IgnoreParser** - Evaluate `.chezmoiignore` conditionals
- **TemplateParser** - Evaluate Go template expressions

### Pages
- `/` - Dashboard (module overview, stats)
- `/files` - File Explorer (platform switching, file tree)
- `/simulator` - Module Simulator (toggle modules, diff view)

---

## 🔧 Development Environment

### Running the App
```bash
cd /home/brecht/repos/dotfiles-visualizer
pnpm dev -p 20903
# Open http://localhost:20903
```

### Environment Variables
File: `.env.local`
```env
GITHUB_TOKEN=ghp_...  # Your GitHub Personal Access Token
DOTFILES_OWNER=brechtparmentier
DOTFILES_REPO=dotfiles
DOTFILES_BRANCH=main
```

### Git Status
- **Branch:** `main`
- **Last Commit:** `d28d939` - "feat: Phase 3 - Module Simulator with live diff preview"
- **Remote:** `git@github.com:brechtparmentier/dotfiles-visualizer.git`

---

## 📊 Current Statistics

### Repository
- **22 files** deployed on Linux (current config)
- **28 files** base configuration
- **30 files** with all modules enabled
- **7 modules** total (shell, git, vscode, powershell, start_menu, modern_tools, smart_search)

### Codebase
- **7 files changed** in Phase 3
- **868 lines added** in Phase 3
- Total: ~3000+ lines of code

---

## 🧪 Testing Notes

### API Testing
All endpoints tested and working:

```bash
# Config endpoint
curl http://localhost:20903/api/config | jq '.config.data.modules'

# Files endpoint
curl 'http://localhost:20903/api/files?platform=linux' | jq '.totalFiles'

# Simulate endpoint
curl -X POST http://localhost:20903/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"moduleChanges":{"shell":true,"git":true},"platform":"linux"}'
```

### Known Issues
None! Everything is working as expected. 🎉

### Important Implementation Details

#### Chezmoi File Naming
- `dot_` prefix → `.` (hidden files)
- `.tmpl` suffix → template files
- `executable_` prefix → executable files
- Example: `dot_config/shell/common.sh.tmpl` → `~/.config/shell/common.sh`

#### Go Template Conditionals
The IgnoreParser and TemplateParser support:
- `eq .chezmoi.os "linux"` - Platform checks
- `.modules.shell.enabled` - Module enabled checks
- `not .modules.X.enabled` - Module disabled checks
- `.modules.shell.zsh_extras` - Nested properties
- Basic `and`/`or` operators

#### Module Dependencies
- `smart_search` requires `shell`
- `start_menu` requires `shell`

---

## 🎯 Next Steps for Phase 4

### 1. Create AliasExtractor
File: `lib/parsers/AliasExtractor.ts`

Parse these patterns from `common.sh.tmpl`:
```bash
alias gs='git status'
alias ga='git add'
function cm() { chezmoi "$@"; }
```

Extract:
- Alias name
- Command
- Category (git, shell, chezmoi, navigation, modern-tools)
- Required module (from template conditionals)

### 2. Parse MODULES.md
File: `lib/parsers/MarkdownParser.ts`

Extract module documentation:
- Module descriptions
- Feature lists
- Usage examples

### 3. Create Aliases API
File: `app/api/aliases/route.ts`

```typescript
GET /api/aliases?module={module}&category={category}

Response: {
  aliases: Alias[],
  functions: FunctionInfo[],
  total: number
}
```

### 4. Build Aliases Page
File: `app/aliases/page.tsx`

Features:
- Searchable table of all aliases
- Filter by module/category
- Click-to-copy buttons
- Function reference with usage examples

---

## 📝 Important Files Reference

### Configuration Files
- `/home/brecht/repos/dotfiles/.chezmoi.yaml` - Dotfiles config structure
- `/home/brecht/repos/dotfiles/.chezmoiignore` - Ignore patterns
- `/home/brecht/repos/dotfiles/dot_config/shell/common.sh.tmpl` - Aliases source
- `/home/brecht/repos/dotfiles/MODULES.md` - Module documentation

### Implementation Plan
- `/home/brecht/.claude/plans/mutable-imagining-peach.md` - Full 5-phase plan

---

## 💡 Design Decisions

### Why Not Vercel?
User preference: lokaal hosten is voldoende voor persoonlijke dotfiles visualizer.
Benefits:
- Geen externe dependencies
- Volledige controle
- Kan achter nginx/apache
- Kan in Docker container

### File Structure
Using Next.js 14 App Router:
- Server components for data fetching
- Client components for interactivity
- API routes as serverless functions

### State Management
- React useState for local state
- No Zustand needed yet (originally planned for Phase 3+)
- May add for Phase 4/5 if needed

---

## 🐛 Debug Tips

### Check Dev Server
```bash
ps aux | grep "next.*20903"
```

### View Logs
```bash
tail -f /tmp/next-dev.log
```

### Restart Server
```bash
pkill -f "next.*20903"
pnpm dev -p 20903 > /tmp/next-dev.log 2>&1 &
```

### Test GitHub API
```bash
# Check rate limit
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
```

---

## 🎨 UI/UX Notes

### Color Scheme
- **Blue** - Primary actions, info
- **Green** - Enabled modules, added files
- **Red** - Disabled modules, removed files
- **Purple** - Secondary features (file explorer)
- **Gray** - Neutral, disabled states

### Icons
- 🐧 Linux
- 🍎 macOS
- 🪟 Windows
- 📂 Folders
- 📄 Files
- ⚙️ Executables
- 📝 Templates
- 🎮 Simulator
- 🔄 Refresh

---

## ✅ Ready to Resume

Alles is gecommit en gepushed naar GitHub. De dev server draait op poort 20903.

**Volgende sessie:**
Start met Phase 4 - Alias Catalog, of kies een andere richting!

**Quick Start Commands:**
```bash
cd /home/brecht/repos/dotfiles-visualizer
pnpm dev -p 20903  # Start dev server
open http://localhost:20903  # Open in browser
```

---

_Happy coding! 🚀_
