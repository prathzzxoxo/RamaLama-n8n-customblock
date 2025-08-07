# RamaLama n8n Integration

This project provides a custom n8n node for RamaLama AI model operations, running RamaLama in a separate Docker container.

## Setup Instructions

### 1. Build and Start RamaLama Container

```bash
# Build the RamaLama container
docker-compose -f docker-compose.ramalama.yml build

# Start the RamaLama service (make sure your n8n network exists)
# If you don't have an n8n-network, create it first:
docker network create n8n-network

# Start RamaLama
docker-compose -f docker-compose.ramalama.yml up -d
```

### 2. Build the Custom n8n Node

```bash
cd custom-nodes
npm install
npm run build
```

### 3. Install the Custom Node in your n8n Instance

Copy the built node to your n8n custom nodes directory:

```bash
# If n8n is running in Docker, copy to the mounted volume
docker cp ./custom-nodes/dist/. your-n8n-container:/home/node/.n8n/custom/node_modules/ramalama-node/

# Or if you have a local n8n installation
cp -r ./custom-nodes/dist/* ~/.n8n/custom/node_modules/ramalama-node/
```

### 4. Restart your n8n Container

```bash
docker restart your-n8n-container
```

## Using the RamaLama Node

The RamaLama node provides the following operations:

### Available Operations

1. **Serve Model**
   - Starts serving an AI model
   - Parameters: Model name, Port
   - Example: `granite-code:3b` on port `11434`

2. **List Containers**
   - Lists all running AI model containers
   - No additional parameters required

3. **Benchmark Model**
   - Benchmarks a specified AI model
   - Parameters: Model name
   - Example: `granite-code:3b`

4. **Convert Model**
   - Converts models between different formats
   - Parameters: Source model, Target model
   - Example: `ollama://tinyllama` to `oci://example.com/model`

5. **Get Info**
   - Displays RamaLama configuration information
   - No additional parameters required

6. **Chat with Model**
   - Sends a chat message to a running model
   - Parameters: Model name, Message, Port
   - Note: The model must be served first

### Configuration

- **RamaLama Container URL**: Default is `http://ramalama-service:8080`
- **Model**: The AI model to use (e.g., `granite-code:3b`, `llama3.2`)
- **Additional Arguments**: Optional command line arguments

### Example Workflow

1. Use "Get Info" to check RamaLama configuration
2. Use "Serve Model" to start an AI model (e.g., `granite-code:3b`)
3. Use "Chat with Model" to interact with the served model
4. Use "List Containers" to see running models
5. Use "Benchmark Model" to test model performance

## Network Configuration

Ensure both containers are on the same Docker network:

```bash
# Add your n8n container to the network if not already
docker network connect n8n-network your-n8n-container
```

## Troubleshooting

1. **Container Communication**: Ensure both containers are on the same network
2. **API Endpoints**: Check if RamaLama API is accessible at `http://ramalama-service:8080/health`
3. **Model Downloads**: First-time model serving will download models, which may take time
4. **Permissions**: Ensure Docker socket permissions if using Docker-in-Docker

## API Endpoints

The RamaLama container exposes these endpoints:

- `GET /health` - Health check
- `POST /execute` - Execute ramalama commands
- `GET /info` - Get ramalama info
- `GET /containers` - List containers