# Disk Viz

A macOS desktop app for visualizing disk usage as an interactive sunburst chart. Built with Electron and D3.js.

## Install

Download the latest `.dmg` from [Releases](https://github.com/kzonov/disk-viz/releases), open it, and drag **Disk Viz** to Applications.

## Development

```bash
npm install
npm start
```

To build the `.app` / `.dmg`:

```bash
npm run build
# Output: dist/Disk Viz-*.dmg
```

## Usage

Click **Choose Directory** and pick a folder to scan.

## Features

- Interactive sunburst chart — click segments to drill down, click center to go back
- Breadcrumb navigation
- Exclude paths from the scan
- Background scanning with progress indicator
