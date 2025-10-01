import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private client: any;
  private readonly logger = new Logger(OpenAIService.name);

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY not set');
      throw new Error('OPENAI_API_KEY not set');
    }
    this.client = new OpenAI({ apiKey });
  }

  async generateJson(prompt: string, maxTokens = 512) {
    const res = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You reply ONLY with strict JSON. No prose.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    });
    const content = res.choices?.[0]?.message?.content ?? '';
    return content;
  }
}


