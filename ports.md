# 🔌 Port Configuratie voor dotfiles-visualizer

Gegenereerd op: 2025-12-28 13:39:16

## 🎯 Standaard Poorten

Voor lokale development en standaard deployments:

- **Frontend**: 20903
- **Backend**: 20904
- **API**: 20905
- **Docs**: 20906

## 🐋 Docker Production Poorten

Voor Docker production containers (host-side poorten):

- **Frontend**: 42728
- **Backend**: 42729
- **API**: 42730
- **Docs**: 42731

## 🐳 Docker Development Poorten

Voor Docker development containers (host-side poorten):

- **Frontend**: 34004
- **Backend**: 34005
- **API**: 34006
- **Docs**: 34007

## 📋 Docker Compose Voorbeelden

### Standaard (zelfde poorten binnen/buiten container)

```yaml
services:
  frontend:
    ports: ['20903:20903']
  backend:
    ports: ['20904:20904']
  api:
    ports: ['20905:20905']
  docs:
    ports: ['20906:20906']
```

### Production (verschillende host/container poorten)

```yaml
services:
  frontend:
    ports: ['42728:20903']  # dockerProd → standaard
  backend:
    ports: ['42729:20904']  # dockerProd → standaard
  api:
    ports: ['42730:20905']  # dockerProd → standaard
  docs:
    ports: ['42731:20906']  # dockerProd → standaard
```

### Development (aparte dev poorten)

```yaml
services:
  frontend:
    ports: ['34004:20903']  # dockerDev → standaard
  backend:
    ports: ['34005:20904']  # dockerDev → standaard
  api:
    ports: ['34006:20905']  # dockerDev → standaard
  docs:
    ports: ['34007:20906']  # dockerDev → standaard
```

## 💡 Gebruik

### Poorten opnieuw genereren

```bash
calcport                    # Bereken poorten voor huidige directory
calcport dotfiles-visualizer     # Bereken voor specifiek project
```

---

_Gegenereerd met calcport - Smart Search toolkit_
