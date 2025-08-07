"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RamaLamaNode = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const axios_1 = __importDefault(require("axios"));
class RamaLamaNode {
    constructor() {
        this.description = {
            displayName: 'RamaLama',
            name: 'ramaLama',
            icon: 'file:ramalama.jpeg',
            group: ['ai'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["model"]}}',
            description: 'Interact with AI models using RamaLama',
            defaults: {
                name: 'RamaLama',
                color: '#1F8EB2',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'RamaLama Container URL',
                    name: 'containerUrl',
                    type: 'string',
                    default: 'http://ramalama-service:8080',
                    placeholder: 'http://ramalama-service:8080',
                    description: 'URL of the RamaLama container service',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: false,
                    options: [
                        {
                            name: 'Serve Model',
                            value: 'serve',
                            description: 'Start serving an AI model',
                            action: 'Serve a model',
                        },
                        {
                            name: 'List Containers',
                            value: 'containers',
                            description: 'List running AI model containers',
                            action: 'List running containers',
                        },
                        {
                            name: 'Benchmark Model',
                            value: 'bench',
                            description: 'Benchmark a specified AI model',
                            action: 'Benchmark a model',
                        },
                        {
                            name: 'Get Info',
                            value: 'info',
                            description: 'Display RamaLama configuration information',
                            action: 'Get configuration info',
                        },
                    ],
                    default: 'serve',
                },
                {
                    displayName: 'Model',
                    name: 'model',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['serve', 'bench'],
                        },
                    },
                    default: 'granite-code:3b',
                    placeholder: 'granite-code:3b',
                    description: 'The AI model to use (e.g., granite-code:3b, llama3.2)',
                },
                {
                    displayName: 'Model Port',
                    name: 'modelPort',
                    type: 'number',
                    displayOptions: {
                        show: {
                            operation: ['serve'],
                        },
                    },
                    default: 11434,
                    description: 'Port where the model will be served',
                },
                {
                    displayName: 'Additional Arguments',
                    name: 'additionalArgs',
                    type: 'string',
                    default: '',
                    placeholder: '--detach --port 11434',
                    description: 'Additional command line arguments',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const containerUrl = this.getNodeParameter('containerUrl', i);
                const operation = this.getNodeParameter('operation', i);
                const additionalArgs = this.getNodeParameter('additionalArgs', i, '');
                let command = ['ramalama', operation];
                let result = {};
                switch (operation) {
                    case 'serve':
                        const serveModel = this.getNodeParameter('model', i);
                        const modelPort = this.getNodeParameter('modelPort', i);
                        command.push(serveModel);
                        if (modelPort !== 11434) {
                            command.push('--port', modelPort.toString());
                        }
                        break;
                    case 'bench':
                        const benchModel = this.getNodeParameter('model', i);
                        command.push(benchModel);
                        break;
                    case 'containers':
                    case 'info':
                        // No additional parameters needed
                        break;
                }
                // Add additional arguments if provided
                if (additionalArgs.trim()) {
                    const additionalArgsList = additionalArgs.trim().split(' ');
                    command.push(...additionalArgsList);
                }
                // Execute the ramalama command via API
                try {
                    const response = await axios_1.default.post(`${containerUrl}/execute`, {
                        command: command,
                    });
                    result = {
                        operation,
                        command: command.join(' '),
                        output: response.data.output,
                        exitCode: response.data.exitCode,
                        success: response.data.success,
                        timestamp: new Date().toISOString(),
                    };
                    if (operation === 'serve') {
                        result.modelPort = this.getNodeParameter('modelPort', i);
                        result.model = this.getNodeParameter('model', i);
                    }
                }
                catch (error) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `RamaLama operation failed: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
                }
                returnData.push({
                    json: result,
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error',
                            timestamp: new Date().toISOString(),
                        },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.RamaLamaNode = RamaLamaNode;
//# sourceMappingURL=RamaLamaNode.node.js.map