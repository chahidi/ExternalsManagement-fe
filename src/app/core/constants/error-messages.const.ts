// src/app/constants/error-messages.const.ts

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
    GENERIC: (status: number) => `Server error (${status})`,
  },
};
