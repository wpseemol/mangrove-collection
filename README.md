Here's an enhanced `README.md` with detailed file structure and comprehensive project documentation:

# Mangrove Collection - E-Commerce Platform

![Mangrove Collection Architecture Diagram](./md-images/mangrove-screenshot.png)

## Project Structure (Detailed)

```
mangrove-collection/
│
├── .vscode/                          # VS Code configurations
│   ├── settings.json                 # Workspace settings
│   └── extensions.json               # Recommended extensions
│
├── mangrove_mongodb_data/            # MongoDB persistent volume
│   └── [MongoDB data files]          # WiredTiger storage files
│
├── md-images/                        # Documentation assets
│   └── mangrove-architecture.png     # System diagram
│
├── nextjs-project/                   # Next.js application
│   ├── .next/                        # Next.js build outputs
│   │   └── [Build cache files]       # Auto-generated
│   │
│   ├── node_modules/                 # NPM dependencies
│   │   └── [All installed packages]  # ~200MB typically
│   │
│   ├── public/                       # Static assets
│   │   ├── images/                   # Product/media files
│   │   ├── favicon.ico               # Site icon
│   │   └── robots.txt                # SEO configuration
│   │
│   ├── src/                          # Application source
│   │   ├── app/                      # App router
│   │   ├── components/               # React components
│   │   ├── lib/                      # Utility functions
│   │   ├── models/                   # MongoDB schemas
│   │   ├── styles/                   # CSS modules
│   │   └── pages/                    # Page components
│   │
│   ├── .dockerignore                 # Docker exclusion rules
│   ├── .env                          # Local environment vars
│   ├── .env.production               # Production env vars
│   ├── .gitignore                    # Version control ignores
│   ├── components.json               # UI component registry
│   ├── Dockerfile                    # Dev container config
│   ├── Dockerfile.prod               # Production build
│   ├── next.config.ts                # Next.js settings
│   ├── package.json                  # NPM configuration
│   ├── pnpm-lock.yaml                # Exact dependency tree
│   └── server.js                     # Custom server (if used)
│
├── .env                              # Global environment vars
├── .gitignore                        # Repository ignores
├── docker-compose.yaml               # Multi-container setup
└── README.md                         # This file
```

## Key Technical Specifications

1. **Containerization**:

     - Development: 2 services (Next.js + MongoDB)
     - Production: 3 services (Next.js, MongoDB, NGINX)

2. **Database**:

     - MongoDB 6.0+ with WiredTiger storage
     - Persistent volume via Docker
     - Default credentials:
          ```
          Username: root
          Password: 123456
          ```

3. **Frontend**:
     - Next.js 14 (App Router)
     - TypeScript 5.0+
     - CSS Modules + Tailwind
     - React Server Components

## Setup Guide

### Development Environment

```bash
# 1. Clone repository
git clone https://github.com/your-repo/mangrove-collection.git
cd mangrove-collection

# 2. Configure environment
cp .env.example .env
nano .env  # Edit MongoDB credentials

# 3. Start services
docker-compose up -d --build

# Access:
# - Frontend: http://localhost:3000
# - MongoDB: mongodb://root:123456@localhost:27017
```

### Production Deployment

```bash
# 1. Build optimized containers
docker-compose -f docker-compose.prod.yaml build

# 2. Run with persistent volumes
docker-compose -f docker-compose.prod.yaml up -d

# Access via:
# - NGINX: https://your-domain.com
# - MongoDB: (internal only)
```

## Maintenance Commands

```bash
# View running containers
docker ps

# Check logs (specific service)
docker logs mangrove-collection -f

# Access MongoDB shell
docker exec -it dev_mc_mongo_db mongosh -u root -p 123456

# Rebuild after dependency changes
docker-compose up -d --force-recreate --build
```

## File Size Breakdown

| Directory     | Approx Size | Contents                          |
| ------------- | ----------- | --------------------------------- |
| node_modules  | 200-300MB   | NPM dependencies                  |
| .next/        | 50-100MB    | Next.js build artifacts           |
| mongodb_data  | Variable    | Database storage (grows with use) |
| Docker images | 1.2GB total | Combined container sizes          |

## Troubleshooting

**Common Issues**:

1. **MongoDB Connection Refused**:

     - Verify `.env` matches compose credentials
     - Check if port 27017 is available:
          ```bash
          netstat -tulnp | grep 27017
          ```

2. **Next.js Build Failures**:

     - Clear Docker cache:
          ```bash
          docker system prune -a
          ```
     - Reinstall dependencies:
          ```bash
          docker-compose exec mangrove-collection pnpm install
          ```

3. **File Permission Issues**:
     ```bash
     sudo chown -R $USER:$USER mangrove_mongodb_data
     ```

---

_Last Updated: 2023-11-15 | Version: 2.1.0 | License: MIT_  
_Total Project Size (uncompressed): ~1.42GB (development)_
