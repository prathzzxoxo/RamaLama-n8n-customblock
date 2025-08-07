# RamaLama Programmatic n8n Custom Node Installation

This document details the implementation of the RamaLama custom node as a **programmatic node** to enable proper custom icon display in n8n.

## Why Programmatic Node?

**Issue with Declarative Nodes:**
- Declarative n8n nodes cannot properly load custom image assets like `ramalama.jpeg`
- Icon references like `icon: 'file:ramalama.jpeg'` don't work reliably
- Custom images are not bundled correctly with declarative node structure

**Programmatic Solution:**
- Programmatic nodes can embed icons as base64 data directly in the code
- Proper file structure allows for better asset management
- More control over node registration and asset loading

## New Node Structure

```
custom-nodes/
├── nodes/
│   ├── index.ts                    # Exports all nodes
│   └── RamaLama/
│       ├── RamaLama.node.ts        # Main programmatic node
│       ├── Functions.ts            # API helper functions
│       └── ramalama.jpeg           # Icon file (embedded as base64)
├── index.ts                        # Main entry point
├── package.json                    # Updated for programmatic structure
└── tsconfig.json                   # Updated TypeScript config
```

## Key Changes from Declarative to Programmatic

### 1. Icon Embedding (RamaLama.node.ts)
```typescript
export class RamaLama implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'RamaLama',
        name: 'ramaLama',
        // Icon embedded as base64 data URL
        icon: 'data:image/jpeg;base64,' + readFileSync(join(__dirname, 'ramalama.jpeg'), 'base64'),
        group: ['ai'],
        // ... rest of configuration
    };
}
```

**Benefits:**
- ✅ Icon loads reliably in n8n editor
- ✅ No dependency on external file references  
- ✅ Icon is bundled with the node code

### 2. Separated API Logic (Functions.ts)
```typescript
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

**Benefits:**
- ✅ Clean separation of API logic
- ✅ Reusable functions across operations
- ✅ Better error handling and maintainability

### 3. Updated Package.json Structure
```json
{
  "name": "ramalama-n8n-node",
  "version": "1.0.0",
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

**Key Changes:**
- Points to programmatic node path: `nodes/RamaLama/RamaLama.node.js`
- Main entry point: `index.js` (exports from `nodes/index.ts`)

## Installation Process

### Step 1: Build Programmatic Node Structure
```bash
cd /root/ramalama/custom-nodes
npm run build
```

**Generated Files:**
```
dist/
├── nodes/
│   ├── index.js                    # Compiled node exports
│   └── RamaLama/
│       ├── RamaLama.node.js        # Compiled main node with embedded icon
│       └── Functions.js            # Compiled API functions
└── index.js                        # Main compiled entry point
```

### Step 2: Install to n8n Docker Volume
```bash
# Clear previous installation
sudo rm -rf /srv/n8n/data/custom/node_modules/ramalama-node/*

# Copy all built files
sudo cp -r /root/ramalama/custom-nodes/dist/* /srv/n8n/data/custom/node_modules/ramalama-node/

# Copy package.json
sudo cp /root/ramalama/custom-nodes/package.json /srv/n8n/data/custom/node_modules/ramalama-node/

# Copy source node directory (contains icon)
sudo cp -r /root/ramalama/custom-nodes/nodes /srv/n8n/data/custom/node_modules/ramalama-node/

# Set proper ownership
sudo chown -R 1000:1000 /srv/n8n/data/custom/node_modules/ramalama-node
```

### Step 3: Restart n8n Docker Container
```bash
sudo docker restart n8n
```

## File Structure in n8n Docker Volume

```
/srv/n8n/data/custom/node_modules/ramalama-node/
├── nodes/                          # Source TypeScript files
│   ├── index.js                    # Compiled node exports
│   ├── index.d.ts                  # TypeScript definitions
│   └── RamaLama/
│       ├── RamaLama.node.js        # Compiled node with base64 icon
│       ├── RamaLama.node.d.ts      # TypeScript definitions
│       ├── Functions.js            # Compiled API functions
│       ├── Functions.d.ts          # TypeScript definitions
│       └── ramalama.jpeg           # Original icon file (referenced by base64 embedding)
├── index.js                        # Main entry point
├── index.d.ts                      # TypeScript definitions
└── package.json                    # Node configuration
```

## Verification

### 1. Check Files in Container
```bash
sudo docker exec n8n find /home/node/.n8n/custom/node_modules/ramalama-node -name "*.jpeg" -o -name "*.js" | head -10
```

**Expected Output:**
```
/home/node/.n8n/custom/node_modules/ramalama-node/nodes/index.js
/home/node/.n8n/custom/node_modules/ramalama-node/nodes/RamaLama/RamaLama.node.js
/home/node/.n8n/custom/node_modules/ramalama-node/nodes/RamaLama/Functions.js
/home/node/.n8n/custom/node_modules/ramalama-node/nodes/RamaLama/ramalama.jpeg
/home/node/.n8n/custom/node_modules/ramalama-node/index.js
```

### 2. Check n8n Logs
```bash
sudo docker logs n8n --tail 20
```

Look for successful startup without errors.

### 3. Verify Icon Display
- Open n8n editor at http://localhost:5678
- Search for "RamaLama" in the node palette
- **Expected Result:** Node appears with the ramalama.jpeg icon properly displayed

## Technical Implementation Details

### Icon Embedding Code
```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

// In the node description:
icon: 'data:image/jpeg;base64,' + readFileSync(join(__dirname, 'ramalama.jpeg'), 'base64'),
```

**How it works:**
1. `readFileSync()` reads the JPEG file as binary data
2. `.toString('base64')` converts binary to base64 string
3. `'data:image/jpeg;base64,'` creates a proper data URL
4. n8n renders the embedded image directly in the palette

### API Request Handling
```typescript
const options: IHttpRequestOptions = {
    method,
    body,
    url: `${containerUrl}${endpoint}`,
    json: true,
    timeout: 60000,
};

return await this.helpers.request(options);
```

**Key Updates from Declarative:**
- Uses `IHttpRequestOptions` instead of `IRequestOptions`
- Uses `url` property instead of `uri`
- Proper error handling with `NodeOperationError`

### Node Registration
```typescript
// nodes/index.ts
import { RamaLama } from './RamaLama/RamaLama.node';

export const nodes = [
    RamaLama,
];

// index.ts
export * from './nodes';
```

**Registration Flow:**
1. Main `index.ts` exports all nodes from `./nodes`
2. `nodes/index.ts` exports the `RamaLama` class
3. n8n discovers and loads the node class
4. Icon is embedded and displays correctly

## Troubleshooting

### Icon Not Displaying
1. **Check file path in code**
   ```bash
   sudo docker exec n8n ls -la /home/node/.n8n/custom/node_modules/ramalama-node/nodes/RamaLama/
   ```
   Ensure `ramalama.jpeg` exists

2. **Check compiled JavaScript**
   ```bash
   sudo docker exec n8n grep -r "data:image/jpeg" /home/node/.n8n/custom/node_modules/ramalama-node/
   ```
   Should show base64 data in compiled JS

3. **Browser Developer Console**
   - Open n8n editor
   - Check browser console for image loading errors
   - Look for malformed data URLs

### Node Not Loading
1. **Check package.json path**
   ```json
   "nodes": ["nodes/RamaLama/RamaLama.node.js"]
   ```
   Must match actual file structure

2. **Check TypeScript compilation**
   ```bash
   cd /root/ramalama/custom-nodes
   npm run build
   ```
   Should complete without errors

## Advantages of Programmatic Approach

✅ **Custom Icon Support**: Proper display of custom JPEG icons
✅ **Better Structure**: Organized file hierarchy with separated concerns  
✅ **Maintainability**: Cleaner code with reusable functions
✅ **Asset Management**: Icons bundled with node code
✅ **Error Handling**: Improved error messages and debugging
✅ **Type Safety**: Better TypeScript integration and definitions

## Future Updates

### To Update the Programmatic Node:

1. **Edit Source Files**
   ```bash
   cd /root/ramalama/custom-nodes
   # Edit nodes/RamaLama/RamaLama.node.ts
   # Edit nodes/RamaLama/Functions.ts
   ```

2. **Rebuild**
   ```bash
   npm run build
   ```

3. **Reinstall**
   ```bash
   sudo cp -r dist/* /srv/n8n/data/custom/node_modules/ramalama-node/
   sudo cp -r nodes /srv/n8n/data/custom/node_modules/ramalama-node/
   sudo docker restart n8n
   ```

The programmatic approach provides a robust foundation for the RamaLama n8n custom node with proper icon display and maintainable code structure.