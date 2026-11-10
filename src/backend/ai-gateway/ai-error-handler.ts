export type AIErrorCode =
  | 'API_KEY_MISSING'
  | 'INVALID_API_KEY'
  | 'CLOUD_CONSENT_REQUIRED'
  | 'QUOTA_EXHAUSTED'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | 'MODEL_NOT_FOUND'
  | 'PROVIDER_ERROR';

export class AINormalizedError extends Error {
  public readonly code: AIErrorCode;
  public readonly statusCode: number;
  public readonly userActionableMessage: string;

  constructor(code: AIErrorCode, message: string, userActionableMessage: string, statusCode = 400) {
    super(message);
    this.name = 'AINormalizedError';
    this.code = code;
    this.statusCode = statusCode;
    this.userActionableMessage = userActionableMessage;
  }
}

export class AIErrorHandler {
  public static normalize(err: any): AINormalizedError {
    if (err instanceof AINormalizedError) {
      return err;
    }

    const msg = String(err?.message || err || '').toLowerCase();

    if (msg.includes('api key') && (msg.includes('missing') || msg.includes('not found') || msg.includes('empty'))) {
      return new AINormalizedError(
        'API_KEY_MISSING',
        'Gemini API key is not configured in environment.',
        'Please set GEMINI_API_KEY in your .env file or backend environment to enable cloud AI inference.',
        400
      );
    }

    if (msg.includes('api_key_invalid') || msg.includes('permission_denied') || msg.includes('403') || msg.includes('unauthorized')) {
      return new AINormalizedError(
        'INVALID_API_KEY',
        'Invalid or unauthorized Gemini API key.',
        'Your GEMINI_API_KEY appears invalid or unauthorized. Check your credentials in Google AI Studio.',
        403
      );
    }

    if (msg.includes('resource_exhausted') || msg.includes('quota') || msg.includes('exceeded')) {
      return new AINormalizedError(
        'QUOTA_EXHAUSTED',
        'Free-tier quota exhausted.',
        'Gemini API free tier quota limit reached for today. AEGIS will pause cloud requests until quota resets.',
        429
      );
    }

    if (msg.includes('rate') || msg.includes('429') || msg.includes('too many requests')) {
      return new AINormalizedError(
        'RATE_LIMITED',
        'Gemini API rate limit reached.',
        'Rate limit reached (429). AEGIS will automatically retry with exponential backoff.',
        429
      );
    }

    if (msg.includes('timeout') || msg.includes('aborted')) {
      return new AINormalizedError(
        'TIMEOUT',
        'Gemini API request timed out.',
        'Request timed out. Please check your network connection or try again.',
        504
      );
    }

    if (msg.includes('404') || msg.includes('not_found') || msg.includes('model')) {
      return new AINormalizedError(
        'MODEL_NOT_FOUND',
        'Requested Gemini model is invalid or unavailable.',
        'Model identifier not found. Verify GEMINI_MODEL in your environment (default: gemini-3.8-flash).',
        404
      );
    }

    return new AINormalizedError(
      'PROVIDER_ERROR',
      `Gemini provider error: ${err?.message || 'Unknown error'}`,
      'An unexpected error occurred while communicating with Gemini API. Check server logs.',
      500
    );
  }
}
