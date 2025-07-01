// HTTP Status codes for ElevenLabs API
export const HTTP_STATUS_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
} as const;

export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'audio/mpeg',
    'User-Agent': 'Angular-ElevenLabs-Client/1.0'
} as const;