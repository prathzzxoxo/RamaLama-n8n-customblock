import { 
    IHookFunctions, 
    IExecuteFunctions, 
    IHttpRequestMethods, 
    IDataObject, 
    IHttpRequestOptions, 
    NodeOperationError, 
    JsonObject 
} from "n8n-workflow";

export async function ramaLamaApiRequest(
    this: IHookFunctions | IExecuteFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    uri?: string | undefined,
): Promise<any> {
    const containerUrl = this.getNodeParameter('containerUrl', 0, 'http://ramalama-service:8080') as string;
    
    const options: IHttpRequestOptions = {
        method,
        body,
        qs,
        url: uri || `${containerUrl}${endpoint}`,
        json: true,
        timeout: 60000, // 60 seconds timeout
    };

    try {
        return await this.helpers.request(options);
    } catch (error) {
        throw new NodeOperationError(this.getNode(), `RamaLama API request failed: ${error}`);
    }
}

export async function executeRamaLamaCommand(
    this: IExecuteFunctions,
    command: string[],
): Promise<any> {
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
    } catch (error) {
        throw new NodeOperationError(this.getNode(), `Failed to execute RamaLama command: ${command.join(' ')}`);
    }
}

export function buildRamaLamaCommand(
    operation: string,
    parameters: IDataObject,
): string[] {
    let command: string[] = ['ramalama', operation];

    switch (operation) {
        case 'serve':
            const serveModel = parameters.model as string;
            const modelPort = parameters.modelPort as number;
            command.push(serveModel);
            if (modelPort && modelPort !== 11434) {
                command.push('--port', modelPort.toString());
            }
            break;

        case 'bench':
            const benchModel = parameters.model as string;
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
    const additionalArgs = parameters.additionalArgs as string;
    if (additionalArgs && additionalArgs.trim()) {
        const additionalArgsList = additionalArgs.trim().split(' ');
        command.push(...additionalArgsList);
    }

    return command;
}