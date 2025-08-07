"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RamaLama = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const Functions_1 = require("./Functions");
class RamaLama {
    constructor() {
        this.description = {
            displayName: 'RamaLama',
            name: 'ramaLama',
            icon: 'file:icon.svg',
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
                const operation = this.getNodeParameter('operation', i);
                const model = this.getNodeParameter('model', i, '');
                const modelPort = this.getNodeParameter('modelPort', i, 11434);
                const additionalArgs = this.getNodeParameter('additionalArgs', i, '');
                const parameters = {
                    model,
                    modelPort,
                    additionalArgs,
                };
                // Build the RamaLama command
                const command = (0, Functions_1.buildRamaLamaCommand)(operation, parameters);
                // Execute the command
                const result = await Functions_1.executeRamaLamaCommand.call(this, command);
                // Add operation-specific data
                if (operation === 'serve') {
                    result.modelPort = modelPort;
                    result.model = model;
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
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `RamaLama operation failed: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`, { itemIndex: i });
            }
        }
        return [returnData];
    }
}
exports.RamaLama = RamaLama;
//# sourceMappingURL=RamaLama.node.js.map