"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRamaLamaCommand = exports.executeRamaLamaCommand = exports.ramaLamaApiRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function ramaLamaApiRequest(method, endpoint, body = {}, qs = {}, uri) {
    const containerUrl = this.getNodeParameter('containerUrl', 0, 'http://ramalama-service:8080');
    const options = {
        method,
        body,
        qs,
        url: uri || `${containerUrl}${endpoint}`,
        json: true,
        timeout: 60000, // 60 seconds timeout
    };
    try {
        return await this.helpers.request(options);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `RamaLama API request failed: ${error}`);
    }
}
exports.ramaLamaApiRequest = ramaLamaApiRequest;
async function executeRamaLamaCommand(command) {
    const requestBody = {
        command: command,
    };
    try {
        const response = await ramaLamaApiRequest.call(this, 'POST', '/execute', requestBody);
        return {
            operation: command[1] || 'unknown',
            command: command.join(' '),
            output: response.output || '',
            exitCode: response.exitCode || 0,
            success: response.success || false,
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Failed to execute RamaLama command: ${command.join(' ')}`);
    }
}
exports.executeRamaLamaCommand = executeRamaLamaCommand;
function buildRamaLamaCommand(operation, parameters) {
    let command = ['ramalama', operation];
    switch (operation) {
        case 'serve':
            const serveModel = parameters.model;
            const modelPort = parameters.modelPort;
            command.push(serveModel);
            if (modelPort && modelPort !== 11434) {
                command.push('--port', modelPort.toString());
            }
            break;
        case 'bench':
            const benchModel = parameters.model;
            command.push(benchModel);
            break;
        case 'containers':
        case 'info':
            // No additional parameters needed
            break;
        default:
            throw new Error(`Unsupported operation: ${operation}`);
    }
    // Add additional arguments if provided
    const additionalArgs = parameters.additionalArgs;
    if (additionalArgs && additionalArgs.trim()) {
        const additionalArgsList = additionalArgs.trim().split(' ');
        command.push(...additionalArgsList);
    }
    return command;
}
exports.buildRamaLamaCommand = buildRamaLamaCommand;
//# sourceMappingURL=Functions.js.map