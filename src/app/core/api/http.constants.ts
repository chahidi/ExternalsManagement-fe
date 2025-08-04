export interface HttpConfig {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
}

export interface RequestConfig {
    headers: HttpHeaders;
    timeout?: number;
    responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
}

export interface ApiError {
    detail: {
        status: string;
        message: string;
    };
}

export interface HttpHeaders {
    'xi-api-key': string;
    'Content-Type': string;
    'Accept': string;
    'User-Agent'?: string;
}
