# 🏢 MunderDifflin // OfficeDev

> **Autonomous Multi-Agent AI Software Engineering Team in an Interactive 2D Pixel-Art Virtual Office.**

MunderDifflin turns multiple specialized AI coding agents into a virtual software development agency. Instead of monitoring isolated terminal windows, watch your autonomous team collaborate, plan sprints, write code, conduct peer reviews, and deploy builds inside an interactive 2D office simulation.

---

## 🌟 Key Features

### 🎮 60 FPS Procedural 2D Office Engine
- **Pure Canvas Rendering:** Zero external asset dependencies or broken sprite sheets—all pixel characters, desks, and office equipment render via HTML5 Canvas.
- **Interactive Office Zones:**
  - 🖥️ **Developer Desks:** Dedicated workstations with dual monitors and typing animations.
  - 📋 **Conference Room:** Meeting hub for product planning and sprint breakdowns.
  - ☕ **Break Lounge:** Coffee machine with real-time procedural steam particles.
  - 🖧 **Server Cluster:** Pulsing status LEDs and terminal dispatch for deployment checks.
- **Viewport Navigation:** Smooth drag-to-pan, mouse-wheel zoom, and agent click-to-inspect.

### 🤖 Multi-Agent Autonomous Team Protocol
- **Michael (Product Manager / Planner):** Breaks down user feature prompts into actionable Kanban tickets with priority tagging.
- **Jim (Senior Fullstack Coder):** Walks to workstation, implements files in `./workspace`, and streams live typewriter stdout/stderr logs.
- **Dwight (QA & Security Reviewer):** Inspects AST diffs, enforces test coverage, and signs off or requests changes.
- **Pam (DevOps Engineer):** Manages Git branches, triggers build/test pipelines in the server cluster, and completes deployments.

### ⚡ Developer Tools & Telemetry
- **Live xterm.js Terminals:** High-fidelity ANSI-colored terminal streams per agent or aggregated view.
- **Real-Time Kanban Board:** Visual task pipeline tracking state across *Backlog*, *In Progress*, *Review*, and *Done*.
- **Workspace Explorer:** Interactive file tree and diff viewer for files generated in `./workspace`.
- **Live Metrics:** Real-time token counter, cost estimates, and active agent telemetry.

---

## 🏗️ Architecture

munder-difflin/├── apps/│   ├── web/               # Next.js 15 App Router, Tailwind CSS, xterm.js, HTML5 Canvas│   └── server/            # Node.js, Express, Socket.io, Task Orchestrator, Sandbox Runner├── workspace/             # Isolated sandbox target where agents generate and build code├── package.json           # Monorepo workspaces manifest└── README.md
---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/munder-difflin.git](https://github.com/your-username/munder-difflin.git)
   cd munder-difflin
Install all dependencies across the monorepo:Bashnpm install
Start the development environment:Bashnpm run dev
Both servers will spin up simultaneously:Frontend & 2D Office: http://localhost:3000Backend Orchestrator & WebSocket: http://localhost:4000⚙️ Configuration & EnvironmentThe platform runs out-of-the-box in Simulation Mode (deterministic agent routines and realistic typing streams). To enable live LLM integration, create a .env file in apps/server:Code snippetPORT=4000
NODE_ENV=development

# Optional: Live LLM Providers
GEMINI_API_KEY="your-gemini-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
OPENAI_API_KEY="your-openai-api-key"
🕹️ Controls & NavigationActionControlPan OfficeClick & drag canvasZoom In / OutMouse wheel or viewport overlay buttonsInspect AgentLeft-click any characterAgent TerminalsClick tabs in bottom drawer (Michael, Jim, Dwight, Pam)Submit New FeatureUse top prompt input or click quick-start presets📜 LicenseMIT License. Open-source and free to customize.# munder-difflin-office-dev
