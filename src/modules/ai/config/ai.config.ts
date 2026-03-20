import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  groqApiKey: process.env.GROQ_API_KEY,
  models: {
    reasoning: process.env.GROQ_REASONING_MODEL || 'llama-3.3-70b-versatile',
    fast: process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant',
  },
}));
