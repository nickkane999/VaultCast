# VaultCast

A comprehensive media streaming and AI-powered image analysis platform with three microservices:

- **Website** (Next.js) - Frontend application
- **Content Server** (Node.js) - Media file serving
- **Image Analysis** (TypeScript Node.js) - AI-powered image analysis

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Website     │    │ Content Server  │    │ Image Analysis  │
│   (Next.js)     │◄──►│   (Node.js)     │    │  (TypeScript)   │
│     Port 3000   │    │    Port 3001    │    │    Port 3003    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Kubernetes (kubectl)
- Node.js 18+ (for local development)
- OpenAI API Key

### 1. Clone and Setup

```bash
git clone <repository-url>
cd VaultCast
```

### 2. Environment Setup

Create environment files:

```bash
# For image-analysis server
cp image-analysis/.env.example image-analysis/.env
# Edit image-analysis/.env and add your OpenAI API key
```

### 3. Choose Your Deployment Method

#### Option A: Single Command Launch (Fastest for Development)

```bash
# Install all dependencies
npm run install:all

# Launch all three servers with one command
npm run dev
```

Access the application at:

- Website: http://localhost:3000
- Content Server: http://localhost:3001
- Image Analysis: http://localhost:3003

#### Option B: Docker Compose (Containerized Development)

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-openai-api-key"

# Build and run all services
docker-compose up --build
```

Access the application at:

- Website: http://localhost:3000
- Content Server: http://localhost:3001
- Image Analysis: http://localhost:3003

#### Option C: Kubernetes (Production)

```bash
# 1. Build Docker images
chmod +x scripts/build-images.sh
./scripts/build-images.sh

# 2. Set up secrets
export OPENAI_API_KEY="your-openai-api-key"
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh

# 3. Deploy to Kubernetes
chmod +x scripts/deploy-k8s.sh
./scripts/deploy-k8s.sh

# 4. Access the application
kubectl port-forward -n vaultcast service/website-service 3000:3000
```

#### Option D: Manual Local Development (Multiple Terminals)

```bash
# Terminal 1: Content Server
cd content-server
npm install
npm run dev

# Terminal 2: Website
cd website
npm install
npm run dev

# Terminal 3: Image Analysis Server
cd image-analysis
npm install
npm run dev
```

## 🛠️ Available Scripts

From the root directory:

- `npm run dev` - Launch all three servers simultaneously
- `npm run install:all` - Install dependencies for all projects
- `npm run build` - Build all projects
- `npm run clean` - Clean all node_modules and build artifacts

Individual server scripts:

- `npm run dev:website` - Launch only the website (Next.js)
- `npm run dev:content-server` - Launch only the content server
- `npm run dev:image-analysis` - Launch only the image analysis server

## 📁 Project Structure

```
VaultCast/
├── website/                 # Next.js frontend application
│   ├── app/                # Next.js app directory
│   ├── lib/                # Shared libraries and utilities
│   ├── public/             # Static assets
│   ├── Dockerfile          # Docker configuration
│   └── package.json        # Dependencies and scripts
├── content-server/          # Media file server
│   ├── media/              # Media storage directory
│   ├── server.js           # Main server file
│   ├── Dockerfile          # Docker configuration
│   └── package.json        # Dependencies and scripts
├── image-analysis/          # AI image analysis server
│   ├── src/                # TypeScript source code
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── Dockerfile          # Docker configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── package.json        # Dependencies and scripts
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml      # Kubernetes namespace
│   ├── configmap.yaml      # Configuration
│   ├── secrets.yaml        # Secrets template
│   ├── persistent-volumes.yaml # Storage
│   └── *-deployment.yaml  # Service deployments
├── scripts/                # Deployment scripts
## Features

- Next.js 13+ with App Router
- TypeScript for type safety
- Modern import aliases (@/\*)
- Optimized for production

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
```
