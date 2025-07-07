export const ERROR_MESSAGES = {
    EMPTY_TEXT: 'Text cannot be empty',
    AUDIO_FAILED: 'Audio playback failed',
    AUDIO_FAILED_WITH_REASON: 'Audio playback failed: ',
    UNKNOWN: 'An unknown error occurred.',
    GENERATE_FAIL: 'Failed to generate speech',

    API: {
        INVALID_KEY: 'Invalid API key',
        INVALID_PARAMETERS: 'Invalid request parameters',
        RATE_LIMIT: 'Rate limit exceeded',
        SERVER_ERROR: 'Internal server error',
        GENERIC: (status: number) => `Server error (${status})`
    },
    INTERVIEW: {
        INVALID_CANDIDATE_ID: 'Invalid candidate ID',
        INVALID_OFFER_ID: 'Invalid offer ID',
        INVALID_INTERVIEW_ID: 'Invalid interview ID',
        INVALID_SCHEDULED_DATE: 'Invalid scheduled date',
        UNKNOWN: 'An unknown interview error occurred.'
    },
    EMAIL: {
        INVALID_CANDIDATE_NAME: 'Invalid candidate full name',
        INVALID_OFFER_TITLE: 'Invalid offer title',
        INVALID_SCHEDULED_DATE: 'Invalid scheduled date for email'
    }
};
