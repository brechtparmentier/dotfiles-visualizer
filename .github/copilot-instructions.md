## Port Configuration for dotfiles-visualizer

**IMPORTANT: Always use these specific ports for this project**

### Standard Development Ports (local/direct)
- Frontend: Port **20903** (MUST use this port)
- Backend: Port **20904** (MUST use this port)
- API: Port **20905** (MUST use this port)
- Docs: Port **20906** (MUST use this port)

### Docker Production Ports (host-side mapping)
- Frontend: Port **42728** → maps to container port 20903
- Backend: Port **42729** → maps to container port 20904
- API: Port **42730** → maps to container port 20905
- Docs: Port **42731** → maps to container port 20906

### Docker Development Ports (host-side mapping)
- Frontend: Port **34004** → maps to container port 20903
- Backend: Port **34005** → maps to container port 20904
- API: Port **34006** → maps to container port 20905
- Docs: Port **34007** → maps to container port 20906

### Rules for Port Usage:
1. **NEVER hardcode ports** - always use these calculated ports
2. **Standard ports** are for local development (non-Docker)
3. **Docker Production ports** map to standard ports inside containers
4. **Docker Development ports** are separate dev environment mappings
5. If ports conflict, verify with `ports.json` and `ports.md`

### Example Docker Compose Configuration:
```yaml
services:
  frontend:
    ports: ['42728:20903']  # Production
    # or
    ports: ['34004:20903']   # Development
```

For regenerating ports, run: `calcport`
