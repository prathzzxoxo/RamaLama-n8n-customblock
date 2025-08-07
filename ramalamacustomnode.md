# RamaLama n8n Custom Node Installation Guide

This document details the complete process of installing and configuring the RamaLama custom node in your n8n Docker instance.

## Overview

The RamaLama custom node allows you to interact with AI models through RamaLama directly from your n8n workflows. This node provides operations like serving models, benchmarking, listing containers, and getting system information.

## Pre-Installation Analysis

### What Was Already Available

✅ **Complete TypeScript Implementation**
- `custom-nodes/RamaLamaNode.node.ts` - Main node implementation
- `custom-nodes/index.ts` - Node entry point
- `custom-nodes/package.json` - Node dependencies and configuration
- `custom-nodes/tsconfig.json` - TypeScript compilation settings

✅ **Built JavaScript Files**
- `custom-nodes/dist/RamaLamaNode.node.js` - Compiled main node
- `custom-nodes/dist/index.js` - Compiled entry point
- `custom-nodes/dist/*.d.ts` - TypeScript definitions

✅ **Assets and Documentation**
- `ramalama.jpeg` - Node icon (23KB)
- `README.md` - Usage documentation
- `n8nguide.md` - n8n custom node development guide

## Installation Process

### Step 1: Fix Icon Reference

**Issue Found:** The node code referenced `ramalama.svg` but we have `ramalama.jpeg`

**Fix Applied:**
```bash
# File: /root/ramalama/custom-nodes/RamaLamaNode.node.ts
# Line 14: Changed from:
icon: 'file:ramalama.svg',
# To:
icon: 'file:ramalama.jpeg',
```

**Rebuild after fix:**
```bash
cd /root/ramalama/custom-nodes
npm run build
```

### Step 2: Create n8n Custom Node Directory (Docker Volume)

```bash
sudo mkdir -p /srv/n8n/data/custom/node_modules/ramalama-node
```

**What this does:**
- Creates the proper directory structure for n8n custom nodes in Docker
- n8n Docker container has `/srv/n8n/data` mounted to `/home/node/.n8n` inside the container
- Custom nodes are loaded from `/home/node/.n8n/custom/node_modules/` inside the container

### Step 3: Copy Built Node Files to Docker Volume

```bash
sudo cp -r /root/ramalama/custom-nodes/dist/* /srv/n8n/data/custom/node_modules/ramalama-node/
```

**Files copied:**
- `RamaLamaNode.node.js` - Main node implementation
- `RamaLamaNode.node.js.map` - Source map for debugging
- `RamaLamaNode.node.d.ts` - TypeScript definitions
- `index.js` - Entry point
- `index.js.map` - Source map for entry point
- `index.d.ts` - Entry point TypeScript definitions

### Step 4: Copy Configuration and Assets to Docker Volume

```bash
sudo cp /root/ramalama/custom-nodes/package.json /srv/n8n/data/custom/node_modules/ramalama-node/
sudo cp /root/ramalama/ramalama.jpeg /srv/n8n/data/custom/node_modules/ramalama-node/
```

**Files copied:**
- `package.json` - Node metadata and n8n configuration (fixed paths)
- `ramalama.jpeg` - Node icon for n8n palette

### Step 5: Set Proper File Ownership for Docker

```bash
sudo chown -R 1000:1000 /srv/n8n/data/custom/node_modules/ramalama-node
```

**Why this is important:**
- n8n Docker container runs as user ID 1000 (`node` user)
- Without proper ownership, n8n cannot read the custom node files inside the container
- This ensures n8n can load and execute the custom node from the mounted volume

### Step 6: Restart n8n Docker Container

```bash
sudo docker restart n8n
```

**What happens during restart:**
- n8n scans the `/home/node/.n8n/custom/node_modules/` directory
- Discovers the `ramalama-node` package
- Reads `package.json` to understand node configuration
- Loads the node classes defined in the `n8n.nodes` array
- Makes the "RamaLama" node available in the editor palette

## Installation Verification

### Files Successfully Installed

```bash
/srv/n8n/data/custom/node_modules/ramalama-node/
├── RamaLamaNode.node.js      # Main node implementation
├── RamaLamaNode.node.js.map  # Source map
├── RamaLamaNode.node.d.ts    # TypeScript definitions
├── index.js                  # Entry point
├── index.js.map              # Source map
├── index.d.ts                # Entry point definitions
├── package.json              # Node configuration
└── ramalama.jpeg             # Node icon
```

### Node Configuration (from package.json)

```json
{
  "name": "ramalama-n8n-node",
  "version": "1.0.0",
  "description": "Custom n8n node for RamaLama AI model operations",
  "main": "index.js",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [],
    "nodes": [
      "RamaLamaNode.node.js"
    ]
  }
}
```

**Fixed Paths:** Updated from `dist/` prefixes to direct file references since files are copied to the root of the custom node directory.

## Node Features

### Available Operations

1. **Serve Model**
   - Starts serving an AI model
   - Parameters: Model name, Port number
   - Example: `granite-code:3b` on port `11434`

2. **List Containers**
   - Lists all running AI model containers
   - No additional parameters required

3. **Benchmark Model**
   - Benchmarks a specified AI model
   - Parameters: Model name
   - Example: `granite-code:3b`

4. **Get Info**
   - Displays RamaLama configuration information
   - No additional parameters required

### Node Properties

- **Display Name:** "RamaLama"
- **Internal Name:** "ramaLama"
- **Group:** AI nodes
- **Icon:** ramalama.jpeg
- **Version:** 1
- **Default Container URL:** `http://ramalama-service:8080`

## How to Use the Node

1. **Access n8n Editor**
   - Open your browser to your n8n instance
   - Click "New Workflow"

2. **Add RamaLama Node**
   - Click the "+" button to add a node
   - Search for "RamaLama" in the node palette
   - The node should appear with the ramalama.jpeg icon

3. **Configure the Node**
   - Select the desired operation
   - Configure parameters based on the operation
   - Set the RamaLama container URL if different from default

4. **Execute Workflow**
   - Click "Execute Workflow"
   - View results in the node output

## Troubleshooting

### Node Not Appearing in Palette

**Check these items:**

1. **File Permissions (Docker Volume)**
   ```bash
   sudo docker exec n8n ls -la /home/node/.n8n/custom/node_modules/ramalama-node/
   ```
   All files should be owned by `node:node` (1000:1000) inside the container

2. **n8n Docker Container Logs**
   ```bash
   sudo docker logs n8n --tail 50
   ```
   Look for custom node loading messages or errors

3. **File Integrity (Inside Container)**
   ```bash
   sudo docker exec n8n find /home/node/.n8n/custom/node_modules/ramalama-node -name "*.js" -exec head -1 {} \;
   ```
   JavaScript files should not be corrupted

4. **Verify Docker Volume Mount**
   ```bash
   sudo docker inspect n8n | grep -A5 -B5 Mounts
   ```
   Should show `/srv/n8n/data` mounted to `/home/node/.n8n`

### Connection Issues

1. **RamaLama Service Running**
   ```bash
   curl http://ramalama-service:8080/health
   ```

2. **Docker Network Connectivity**
   ```bash
   sudo docker network ls
   sudo docker network inspect n8n-network
   ```

## Maintenance and Updates

### To Update the Node

1. **Modify Source Code**
   ```bash
   cd /root/ramalama/custom-nodes
   # Edit RamaLamaNode.node.ts
   ```

2. **Rebuild**
   ```bash
   npm run build
   ```

3. **Reinstall in Docker Volume**
   ```bash
   sudo cp -r dist/* /srv/n8n/data/custom/node_modules/ramalama-node/
   sudo cp package.json /srv/n8n/data/custom/node_modules/ramalama-node/
   sudo docker restart n8n
   ```

### Development Workflow

1. **Watch Mode** (for development)
   ```bash
   cd /root/ramalama/custom-nodes
   npm run watch
   ```

2. **After Each Change**
   ```bash
   sudo cp -r dist/* /srv/n8n/data/custom/node_modules/ramalama-node/
   sudo docker restart n8n
   ```

## Technical Details

### Dependencies

- **Runtime:** axios ^1.0.0
- **Development:** @types/node ^16.0.0, n8n-workflow ~0.128.0, typescript ^4.2.0

### API Integration

The node communicates with RamaLama through:
- **Endpoint:** `http://ramalama-service:8080/execute`
- **Method:** POST
- **Payload:** `{ command: ["ramalama", "operation", ...args] }`

### Docker Network Requirements

- n8n and RamaLama containers must be on the same Docker network
- Default network name: `n8n-network`
- RamaLama service name: `ramalama-service`

## Success Confirmation

✅ **Installation Complete**
- Custom node directory created
- All required files copied and properly owned
- n8n Docker container restarted
- Node should now appear in n8n palette as "RamaLama" with the ramalama.jpeg icon

The RamaLama custom node is now ready for use in your n8n workflows!