import { IHookFunctions, IExecuteFunctions, IHttpRequestMethods, IDataObject } from "n8n-workflow";
export declare function ramaLamaApiRequest(this: IHookFunctions | IExecuteFunctions, method: IHttpRequestMethods, endpoint: string, body?: IDataObject, qs?: IDataObject, uri?: string | undefined): Promise<any>;
export declare function executeRamaLamaCommand(this: IExecuteFunctions, command: string[]): Promise<any>;
export declare function buildRamaLamaCommand(operation: string, parameters: IDataObject): string[];
