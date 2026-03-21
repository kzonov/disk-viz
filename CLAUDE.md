# Disk Viz - Claude Code Instructions

## Project Overview

Disk Viz is a macOS desktop application for visualizing disk usage as an interactive sunburst chart. Built with Electron and D3.js, it helps users understand their disk space usage through an intuitive visual interface.

### Key Features
- Interactive sunburst chart visualization
- Click segments to drill down, click center to go back
- Breadcrumb navigation
- Exclude paths from scanning
- Background scanning with progress indicator

### Tech Stack
- **Frontend**: Electron, D3.js, HTML/CSS/JavaScript
- **Build**: electron-builder for macOS .dmg distribution
- **Dependencies**: d3 for data visualization

## Development Workflow Rules

### Git Workflow
- **Direct main branch commits**: Push directly to main branch - no pull requests required
- **Commit messages**: Use concise one-liner commit messages, no need to mention Claude as co-author

### Development Commands
```bash
npm install    # Install dependencies
npm start      # Run in development mode
npm run build  # Build .app/.dmg for distribution
```

### Project Structure
- `main.js` - Main Electron process
- `preload.js` - Preload script for renderer security
- `scanner-worker.js` - Background worker for disk scanning
- `index.html` - Main application UI
- `renderer/` - Renderer process files
- `styles/` - CSS styling