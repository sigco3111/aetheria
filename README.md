# 🏰 AETHERIA

> An immersive, interactive open-world game companion app built for explorers, legends, and collectors.

---

## 📖 Project Overview

AETHERIA is a cinematic open-world game companion web application, originally built as part of a team effort for a frontend competition. It serves as a unified portal where players can discover maps across different games, surface hidden easter eggs, and share reusable artifacts with other players—alongside tracking multiple characters, legends, and achievements.

The core idea behind AETHERIA is to provide a breathtaking, immersive fantasy experience right from the browser. Rather than a standard dashboard, users land on a 3D cinematic reveal of a floating medieval island. From this atmospheric entry point, explorers can delve into various rich, domain-specific modules.

The project is structured with a unique micro-frontend architecture. A central Next.js application drives the 3D cinematic landing page, while the individual interactive modules (such as the map viewer, marketplace, and vaults) are served as completely independent static web applications. This separation ensures specialized tech stacks for each domain without complex build step integrations.

---

## ✨ Features

- **Cinematic 3D Landing Experience:** A meticulously crafted 3D environment featuring an island, ocean, and atmospheric effects using Three.js and React Three Fiber.
- **Interactive Fantasy World:** Ambient audio, weather toggles, and dynamic scroll-based narrative reveals.
- **Cartographer's Sanctum:** An interactive map module for world exploration, discovering forgotten kingdoms, and tracking pins.
- **Grand Guild Exchange:** A dedicated hub for sharing reusable artifacts and trading with other players.
- **Curator's Vault:** A secure repository to surface hidden easter eggs, lore, and special items.
- **Achievement System:** A system to track player legends, characters, and game progress.
- **Modular World Navigation:** Seamless transitions from a React 3D environment into standalone HTML/JS module experiences.
- **Responsive UI:** Carefully designed layouts optimized for both desktop and mobile explorers.

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Framework** | Next.js 16, React 19 |
| **3D Engine** | Three.js, React Three Fiber, React Three Drei |
| **Styling** | Tailwind CSS v4, Shadcn UI |
| **UI Components** | Base UI, Lucide React Icons |
| **Analytics** | Vercel Analytics |
| **Languages** | TypeScript, JavaScript, HTML, CSS |
| **Build Tools** | Next.js, pnpm |
| **Rendering** | App Router, Static HTML Modules, Babel Standalone (in-browser) |

---

## 📂 Project Structure

```text
AETHERIA/
├── app/                      # Next.js App Router root containing the cinematic landing page
├── components/               # Shared UI components and complex 3D cinematic scenes
├── public/                   # Static assets and independent micro-frontend modules
│   ├── achievements/         # Legends and player progress static module
│   ├── cartographers_sanctum/# Map exploration static module
│   ├── curators_vault/       # Easter eggs and artifacts static module
│   └── grand_guild_exchange/ # Marketplace/sharing hub static module
├── lib/                      # Utility functions and shared helpers
├── package.json              # Project dependencies and scripts
└── next.config.mjs           # Next.js configuration
```

- **`app/`**: Contains the core Next.js routing and layout for the 3D entry experience.
- **`components/`**: Houses both standard React UI components and the specialized 3D models/scenes (e.g., `island.tsx`, `ocean.tsx`).
- **`public/`**: Stores static assets (images, fonts) and also hosts the independent static applications that act as the project's modules.
- **`public/[module_name]/`**: Each of these folders contains its own standalone `index.html`, CSS, and JS (or in-browser React) files.

---

## 🏗 Architecture

AETHERIA employs a creative monolithic repository with a micro-frontend style delivery:
- The **main landing experience** is built using Next.js to leverage robust server-side rendering and handle the heavy React Three Fiber 3D environment.
- The **independent modules** are built with vanilla web technologies (HTML, CSS, JS, and CDN-loaded React/Tailwind) and are served directly as static applications from the `public` directory.
- **Navigation transitions** users seamlessly from the highly immersive Next.js landing page to the individual, domain-focused modules via standard anchor links, avoiding a bloated single-page application bundle.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have Node.js and a package manager like `npm` or `pnpm` installed.

```bash
git clone <your-repository-url>
cd AETHERIA
```

---

## 📦 Installation

Install the project dependencies using pnpm (recommended) or npm:

```bash
pnpm install
# or
npm install
```

---

## 🏃‍♂️ Running the Project

**Development Server:**
```bash
pnpm run dev
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the cinematic landing page.

**Production Build:**
```bash
pnpm run build
# or
npm run build
```

**Production Start:**
```bash
pnpm run start
# or
npm run start
```

---

## 🧩 Project Modules

- **Landing Experience:** A 3D interactive, scroll-driven cinematic reveal of the fantasy island.
- **Cartographer's Sanctum:** A detailed, interactive map module for plotting pins, tracing routes, and exploring world lore.
- **Grand Guild Exchange:** A marketplace hub for players to share artifacts, tools, and discoveries.
- **Curator's Vault:** A secret archive designed to surface and store hidden easter eggs and unique game artifacts.
- **Achievements (Legends):** A dynamic tracker for player progress, legends, and character stats.

---

## 👥 Team

Built with ❤️ by the **AA-OG's**:
- **Govind Jindal**
- **Aaradhya Khanna**

---

## 🔮 Future Improvements

- Add persistent global state sharing between the static modules and the Next.js app (e.g., via LocalStorage or a lightweight backend).
- Implement user authentication to save individual map pins and collected artifacts.
- Introduce multiplayer socket connections within the Grand Guild Exchange for real-time trading.
- Expand the 3D cinematic experience with additional explorable scenes or camera angles.
- Optimize the Babel standalone rendering in the Grand Guild Exchange by introducing a lightweight build step.


