import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IeltsWritingDto, IeltsReadingDto } from './dto';
import OpenAI from 'openai';

@Injectable()
export class IeltsService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async scoreWriting(dto: IeltsWritingDto) {
    try {
      const prompt = `You are an IELTS examiner. Score the essay by IELTS Writing Task 2 criteria. Return strict JSON with keys: task_response (0-9), coherence_cohesion (0-9), lexical_resource (0-9), grammar (0-9), overall (0-9), feedback (string). Essay: \n\n${dto.essay}`;

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Return ONLY valid JSON without any extra text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      });

      const text = completion.choices[0].message?.content?.trim() || '{}';
      let result: any;
      try {
        result = JSON.parse(text);
      } catch {
        result = { overall: 0, feedback: 'parse_error' };
      }

      return result; // ⚡ без сохранения истории
    } catch (e: any) {
      throw new InternalServerErrorException('Failed to score writing');
    }
  }

  async scoreReading(dto: IeltsReadingDto) {
    const answerKeys: Record<string, string[]> = {
      'cambridge-16-test-1': [
        'A','B','C','D','A','C','B','D','A','B',
        'C','D','A','B','C','D','A','B','C','D',
        'A','B','C','D','A','B','C','D','A','B',
        'C','D','A','B','C','D','A','B','C','D'
      ],
    };

    const key = answerKeys[dto.testId] || [];
    const total = key.length;
    let correct = 0;

    for (let i = 0; i < Math.min(total, dto.answers.length); i++) {
      if ((dto.answers[i] || '').toUpperCase().trim() === (key[i] || '').toUpperCase().trim()) {
        correct++;
      }
    }

    let band = 4;
    if (correct >= 39) band = 9;
    else if (correct >= 37) band = 8.5;
    else if (correct >= 35) band = 8;
    else if (correct >= 30) band = 7;
    else if (correct >= 23) band = 6;
    else if (correct >= 16) band = 5;

    return { correct, total, band }; // ⚡ без сохранения истории
  }
}
