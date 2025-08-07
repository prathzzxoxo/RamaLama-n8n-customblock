# RamaLama Custom n8n Node - Manual Installation Guide

This repository contains a custom n8n node for RamaLama AI model operations. Follow these instructions to manually add this custom node to your own n8n installation.

## Prerequisites

- n8n installed and running (version compatible with API version 1)
- Node.js and npm installed
- TypeScript compiler (`tsc`) available
- Basic command line knowledge

## Installation Steps

### Step 1: Download the Node Files

Download or clone this repository to get the custom node files:

```bash
git clone <your-repo-url>
cd ramalama
```

### Step 2: Locate Your n8n Custom Nodes Directory

Find where your n8n installation stores custom nodes. This is typically:

- **Docker installations**: Volume mounted custom nodes directory
- **npm global installation**: `~/.n8n/custom/`
- **Local installation**: `./nodes/` in your n8n project root

Create the custom nodes directory if it doesn't exist:

```bash
mkdir -p ~/.n8n/custom
```

### Step 3: Copy the Node Files

Copy the entire `custom-nodes` directory to your n8n custom nodes location:

```bash
cp -r custom-nodes ~/.n8n/custom/ramalama-node
```

### Step 4: Install Dependencies

Navigate to the copied node directory and install dependencies:

```bash
cd ~/.n8n/custom/ramalama-node
npm install
```

### Step 5: Build the TypeScript Files

Compile the TypeScript files to JavaScript:

```bash
npm run build
```

This will create a `dist` directory with the compiled JavaScript files.

### Step 6: Verify File Structure

Your custom node directory should now contain:

```
~/.n8n/custom/ramalama-node/
├── package.json
├── tsconfig.json
├── index.ts
├── nodes/
│   ├── index.ts
│   └── RamaLama/
│       ├── RamaLama.node.ts
│       ├── Functions.ts
│       ├── icon.svg
│       ├── icon.png
│       └── ramalama.jpeg
├── dist/ (generated after build)
│   └── [compiled JS files]
└── node_modules/ (created after npm install)
```

### Step 7: Restart n8n

Restart your n8n instance to load the new custom node:

```bash
# If running n8n directly
npx n8n

# If using PM2
pm2 restart n8n

# If using Docker
docker restart your-n8n-container
```

## Configuration

### Node Parameters

The RamaLama node supports these operations:

1. **Serve Model**: Start serving an AI model
   - Model: Specify the AI model (e.g., `granite-code:3b`, `llama3.2`)
   - Model Port: Port where the model will be served (default: 11434)

2. **List Containers**: List running AI model containers

3. **Benchmark Model**: Benchmark a specified AI model
   - Model: Specify the AI model to benchmark

4. **Get Info**: Display RamaLama configuration information

### RamaLama Service Setup

The node expects a RamaLama service to be running. You can set this up using:

1. **Docker Compose** (recommended):
   ```bash
   # Use the provided docker-compose.ramalama.yml
   docker-compose -f docker-compose.ramalama.yml up -d
   ```

2. **Manual Setup**:
   - Install RamaLama on your system
   - Run the provided `ramalama-api.py` script
   - Ensure it's accessible at the configured URL (default: `http://ramalama-service:8080`)

## Troubleshooting

### Node Not Appearing in n8n

1. Check that files are in the correct custom nodes directory
2. Verify the build completed successfully (`dist` folder exists)
3. Check n8n logs for any loading errors
4. Ensure package.json has correct n8n configuration

### Connection Issues

1. Verify RamaLama service is running and accessible
2. Check the Container URL parameter in the node configuration
3. Ensure network connectivity between n8n and RamaLama service

### Build Errors

1. Ensure TypeScript is installed: `npm install -g typescript`
2. Check that all dependencies are installed: `npm install`
3. Verify TypeScript configuration in `tsconfig.json`

## Development

To modify the node:

1. Edit the TypeScript files in the `nodes/` directory
2. Run `npm run build` to compile changes
3. Restart n8n to load updated code
4. Use `npm run watch` for automatic compilation during development

## Support

The node is configured to work with:
- n8n API version 1
- TypeScript 4.2+
- Node.js 16+

For issues specific to RamaLama functionality, check the RamaLama documentation and ensure your service is properly configured.