# Complete Guide: RamaLama n8n Custom Node with Custom Icons

## 🎯 Key Concepts

### Declarative vs Programmatic Nodes

**Declarative Nodes:**
- ❌ Cannot properly load custom image assets (JPEG/PNG icons)
- ❌ Limited asset bundling capabilities
- ❌ Icon references like `icon: 'file:icon.jpeg'` don't work reliably
- ✅ Simpler structure for basic nodes

**Programmatic Nodes:**
- ✅ **Full control over asset loading and custom icons**
- ✅ Better file organization with separated concerns
- ✅ Proper TypeScript integration and error handling
- ✅ Can embed icons using various methods (`file:`, base64, etc.)

### Why Custom Icons Don't Work in Declarative Nodes

1. **Asset Bundling**: n8n's declarative node loader doesn't properly bundle custom assets
2. **File Path Resolution**: Path references in declarative nodes are resolved incorrectly
3. **Runtime Loading**: Custom assets aren't available at runtime in declarative structure

## 🚀 Final Working Solution

### Step-by-Step Implementation

#### 1. Create Programmatic Node Structure

```bash
cd /root/ramalama/custom-nodes/
```

**Directory Structure:**
```
custom-nodes/
├── nodes/
│   ├── index.ts                    # Exports all nodes
│   └── RamaLama/
│       ├── RamaLama.node.ts        # Main programmatic node
│       ├── Functions.ts            # API helper functions
│       └── icon.svg                # Custom icon (SVG works best)
├── index.ts                        # Main entry point
├── package.json                    # Updated for programmatic structure
└── tsconfig.json                   # Updated TypeScript config
```

#### 2. Create Main Node File (`nodes/RamaLama/RamaLama.node.ts`)

```typescript
import {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';
import { executeRamaLamaCommand, buildRamaLamaCommand } from './Functions';

export class RamaLama implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'RamaLama',
        name: 'ramaLama',
        icon: 'file:icon.svg',  // 🎯 KEY: Custom icon reference
        group: ['ai'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["model"]}}',
        description: 'Interact with AI models using RamaLama',
        defaults: {
            name: 'RamaLama',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
            // ... node properties
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // ... execution logic
    }
}
```

#### 3. Create Helper Functions (`nodes/RamaLama/Functions.ts`)

```typescript
import { 
    IHookFunctions, 
    IExecuteFunctions, 
    IHttpRequestMethods, 
    IDataObject, 
    IHttpRequestOptions, 
    NodeOperationError, 
} from "n8n-workflow";

export async function ramaLamaApiRequest(
    this: IHookFunctions | IExecuteFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
): Promise<any> {
    const containerUrl = this.getNodeParameter('containerUrl', 0, 'http://ramalama-service:8080') as string;
    
    const options: IHttpRequestOptions = {
        method,
        body,
        url: `${containerUrl}${endpoint}`,
        json: true,
        timeout: 60000,
    };

    return await this.helpers.request(options);
}
```

#### 4. Create Node Registration (`nodes/index.ts`)

```typescript
import { RamaLama } from './RamaLama/RamaLama.node';

export const nodes = [
    RamaLama,
];
```

#### 5. Update Main Entry Point (`index.ts`)

```typescript
export * from './nodes';
```

#### 6. Update Package.json Configuration

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
      "nodes/RamaLama/RamaLama.node.js"
    ]
  }
}
```

#### 7. Update TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2019",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["*.ts", "nodes/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### 8. Create Custom Icon

**Option A: SVG Icon (Recommended)**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="8" fill="#1F8EB2"/>
  <text x="32" y="42" text-anchor="middle" font-family="Arial, sans-serif" 
        font-size="24" font-weight="bold" fill="white">R</text>
  <circle cx="32" cy="20" r="8" fill="white" opacity="0.7"/>
</svg>
```

**Option B: Convert Existing Icon**
```bash
# Convert JPEG to PNG if needed
convert /root/ramalama/ramalama.jpeg /root/ramalama/custom-nodes/nodes/RamaLama/icon.png
```

### Installation Steps

#### 1. Build the Node
```bash
cd /root/ramalama/custom-nodes
npm run build
```

#### 2. Deploy to n8n Docker Volume
```bash
# Clean previous installation
sudo rm -rf /srv/n8n/data/custom/node_modules/ramalama-node/*

# Deploy built files
sudo cp -r /root/ramalama/custom-nodes/dist/* /srv/n8n/data/custom/node_modules/ramalama-node/

# Deploy package.json
sudo cp /root/ramalama/custom-nodes/package.json /srv/n8n/data/custom/node_modules/ramalama-node/

# Deploy source nodes directory (contains icon)
sudo cp -r /root/ramalama/custom-nodes/nodes /srv/n8n/data/custom/node_modules/ramalama-node/

# Fix ownership for Docker container
sudo chown -R 1000:1000 /srv/n8n/data/custom/node_modules/ramalama-node/
```

#### 3. Restart n8n Docker Container
```bash
sudo docker restart n8n
```

## 📁 Final File Structure in Container

```
/srv/n8n/data/custom/node_modules/ramalama-node/
├── nodes/                          # Source directory with icon
│   ├── index.js                    # Compiled node exports
│   ├── index.d.ts                  # TypeScript definitions
│   └── RamaLama/
│       ├── RamaLama.node.js        # Compiled main node
│       ├── RamaLama.node.d.ts      # TypeScript definitions
│       ├── Functions.js            # Compiled API functions
│       ├── Functions.d.ts          # TypeScript definitions
│       └── icon.svg                # 🎯 Custom icon file
├── index.js                        # Main entry point
├── index.d.ts                      # TypeScript definitions
└── package.json                    # Node configuration
```

## 🔑 Key Success Factors

### 1. Icon File Location
- ✅ **Must be in same directory as the .node.ts file**
- ✅ **Must be deployed with the source `nodes/` directory**
- ✅ **File ownership must be 1000:1000 for Docker container access**

### 2. Icon Reference Format
```typescript
icon: 'file:icon.svg',    // ✅ Works - SVG format
icon: 'file:icon.png',    // ✅ Works - PNG format  
icon: 'file:ramalama.jpeg', // ❌ May not work - JPEG can be problematic
```

### 3. Package.json Node Path
```json
"nodes": [
  "nodes/RamaLama/RamaLama.node.js"  // ✅ Must match actual compiled file location
]
```

### 4. File Deployment
- ✅ **Both compiled `dist/` files AND source `nodes/` directory must be deployed**
- ✅ **Icon file must be accessible at runtime in the container**

## 🔧 Troubleshooting Guide

### Node Not Appearing in Palette

1. **Check n8n logs:**
   ```bash
   sudo docker logs n8n --tail 50
   ```

2. **Verify file structure:**
   ```bash
   sudo docker exec n8n ls -la /home/node/.n8n/custom/node_modules/ramalama-node/nodes/RamaLama/
   ```

3. **Check package.json path:**
   ```bash
   sudo docker exec n8n cat /home/node/.n8n/custom/node_modules/ramalama-node/package.json
   ```

### Icon Not Displaying

1. **Verify icon file exists:**
   ```bash
   sudo docker exec n8n ls -la /home/node/.n8n/custom/node_modules/ramalama-node/nodes/RamaLama/icon.*
   ```

2. **Check file ownership:**
   ```bash
   sudo docker exec n8n ls -la /home/node/.n8n/custom/node_modules/ramalama-node/nodes/RamaLama/
   ```
   All files should be owned by `node:node`

3. **Try different icon formats:**
   - SVG (recommended) - `icon: 'file:icon.svg'`
   - PNG - `icon: 'file:icon.png'`
   - Avoid JPEG for icons

### Build Errors

1. **TypeScript import errors:**
   ```bash
   # Check n8n-workflow version
   npm list n8n-workflow
   ```
   Use correct imports for your version:
   - `IHttpRequestOptions` (not `IRequestOptions`)
   - `NodeOperationError` (not `NodeApiError`)

2. **Path resolution errors:**
   ```bash
   # Ensure tsconfig.json includes all TypeScript files
   "include": ["*.ts", "nodes/**/*.ts"]
   ```

## 📋 Update Workflow

### To Update the Node:

1. **Edit source files:**
   ```bash
   cd /root/ramalama/custom-nodes
   # Edit nodes/RamaLama/RamaLama.node.ts
   # Edit nodes/RamaLama/Functions.ts
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Redeploy:**
   ```bash
   sudo cp -r dist/* /srv/n8n/data/custom/node_modules/ramalama-node/
   sudo cp -r nodes /srv/n8n/data/custom/node_modules/ramalama-node/
   sudo chown -R 1000:1000 /srv/n8n/data/custom/node_modules/ramalama-node/
   sudo docker restart n8n
   ```

## ✅ Success Verification

1. **Node appears in n8n palette:** "RamaLama" under AI section
2. **Custom icon displays:** Your SVG/PNG icon shows correctly
3. **Node functions:** All operations (serve, bench, containers, info) work
4. **No console errors:** Browser developer console shows no icon loading errors

## 🎯 Key Learnings

1. **Programmatic nodes are required for custom icons** - Declarative approach has fundamental limitations
2. **File deployment must include both compiled and source files** - Icon files live in source directory
3. **SVG icons work most reliably** - Better cross-platform compatibility than JPEG/PNG
4. **Docker ownership is critical** - Files must be owned by container user (1000:1000)
5. **Path references must be exact** - Package.json paths must match actual file structure

This programmatic approach provides a robust, maintainable solution for n8n custom nodes with proper icon support.