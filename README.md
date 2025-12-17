# HKA

Helen Keller Archive -- Electron + React app.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (included with Node.js)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/HKA.git
cd HKA

# Install dependencies
npm install
```

## Development

```bash
# Run Vite dev server only (browser)
npm run dev

# Run full Electron app in development mode
npm run electron:dev
```

## Production

```bash
# Build the app
npm run build

# Run the built Electron app
npm start

# Package for distribution
npm run dist
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run electron:dev` | Start Electron with hot reload |
| `npm start` | Run Electron app |
| `npm run build` | Build for production |
| `npm run pack` | Package app (unpacked) |
| `npm run dist` | Package app for distribution |
