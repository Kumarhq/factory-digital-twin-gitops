# Images and Assets

This directory contains images and visual assets for the Factory Digital Twin Dashboard.

## Directory Structure

```
images/
├── screenshots/          # Application screenshots
│   ├── dashboard/       # Live Dashboard screenshots
│   ├── asset-explorer/  # Asset Explorer views
│   ├── rca/            # RCA Analysis screenshots
│   ├── drift/          # GitOps Drift Detection screenshots
│   └── ai-assistant/   # AI Assistant screenshots
├── diagrams/            # Architecture and flow diagrams
│   ├── architecture/   # System architecture diagrams
│   ├── deployment/     # Deployment diagrams
│   └── workflows/      # Workflow and process diagrams
└── logos/              # Logos and branding assets
```

## Screenshots

### Dashboard Views
Place screenshots here for documentation:
- `screenshots/dashboard/live-dashboard.png` - Live Dashboard view
- `screenshots/asset-explorer/graph-view.png` - Asset graph visualization
- `screenshots/asset-explorer/table-view.png` - Asset table view
- `screenshots/asset-explorer/card-view.png` - Asset card grid view
- `screenshots/rca/analysis-results.png` - RCA analysis results
- `screenshots/drift/drift-detection.png` - Drift detection dashboard
- `screenshots/drift/drift-details.png` - Drift details dialog
- `screenshots/ai-assistant/query-interface.png` - AI Assistant interface

### Architecture Diagrams
- `diagrams/architecture/system-overview.png` - Overall system architecture
- `diagrams/architecture/data-flow.png` - Data flow diagram
- `diagrams/deployment/docker-compose.png` - Docker Compose deployment
- `diagrams/deployment/kubernetes.png` - Kubernetes deployment
- `diagrams/workflows/gitops-drift.png` - GitOps drift detection workflow

## Usage in Documentation

### In README.md
```markdown
![Live Dashboard](./images/screenshots/dashboard/live-dashboard.png)
![Architecture](./images/diagrams/architecture/system-overview.png)
```

### In GitHub Issues
```markdown
![Bug Screenshot](../images/screenshots/bug-example.png)
```

## Image Guidelines

### Screenshots
- **Format**: PNG (preferred) or JPG
- **Resolution**: 1920x1080 or higher for main screenshots
- **Size**: Optimize images to keep under 500KB
- **Naming**: Use kebab-case (e.g., `drift-detection-view.png`)

### Diagrams
- **Format**: PNG, SVG (preferred for diagrams)
- **Tools**: draw.io, Lucidchart, Mermaid
- **Source**: Keep source files (`.drawio`, `.mmd`) alongside exports

### Logos
- **Format**: SVG (preferred) and PNG
- **Sizes**: Multiple sizes (16x16, 32x32, 64x64, 128x128, 512x512)
- **Background**: Transparent background

## Creating Screenshots

### Browser Screenshots
```bash
# Use browser developer tools
# Chrome: Cmd+Shift+P → "Capture screenshot"
# Firefox: Shift+F2 → "screenshot --fullpage"
```

### CLI Screenshots
```bash
# macOS
screencapture -w screenshots/terminal-output.png

# Linux
gnome-screenshot -w

# Windows
# Use Snipping Tool or Win+Shift+S
```

## Image Optimization

```bash
# Install ImageOptim (macOS) or use CLI tools
# PNG optimization
pngquant --quality=65-80 input.png -o output.png

# JPG optimization
jpegoptim --max=85 input.jpg
```

## Placeholder Images

Until actual screenshots are added, you can use placeholder images:
- https://via.placeholder.com/1200x800/0066cc/ffffff?text=Dashboard+Screenshot
- https://via.placeholder.com/800x600/10b981/ffffff?text=Architecture+Diagram

---

**Note**: When adding images, ensure:
1. No sensitive data (passwords, tokens, real IPs) is visible
2. Images are properly optimized for size
3. File names are descriptive and use kebab-case
4. Images are referenced in documentation
