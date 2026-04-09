# SX9 Command Center Dashboard

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/cp5337/ctas-7-command-center-ui)

A sophisticated command center dashboard built with React, TypeScript, and Tailwind CSS. Features AI-powered personas, real-time communications, task management, and system monitoring.

## Features

- **AI Personas**: Interactive team of AI specialists with different roles and capabilities
- **Real-time Communications**: Chat interface with voice message support
- **Task Management**: Kanban-style operations board
- **System Monitoring**: Live metrics and performance tracking
- **WebSocket Support**: Real-time updates (when backend is available)

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Bolt Hosting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sx9-command-center
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Quick Start with StackBlitz

You can also run this project instantly in StackBlitz:

1. Click the "Open in StackBlitz" button above
2. Wait for dependencies to install
3. The app will automatically start and open in the preview pane

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── data/               # Mock data
```

## Environment Setup

The application works in offline mode by default. For full functionality with a backend:

1. Set up a backend server on port 18082
2. Implement WebSocket endpoint at `/ws`
3. Implement REST API endpoints as defined in `src/services/api.ts`

## Deployment

This project is configured for deployment on Bolt Hosting and other static hosting platforms.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.