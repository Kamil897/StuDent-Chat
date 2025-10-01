import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IeltsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveResultForUser(userId: number, type: 'writing' | 'reading', payload: any, band?: number) {
    return this.prisma.ieltsResult.create({
      data: { userId, type, payload, band },
    });
  }

  async listResultsForUser(userId: number) {
    return this.prisma.ieltsResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  generateWritingTask(difficulty: 'easy'|'medium'|'hard') {
    const topicsEasy = [
      'Describe your favorite place in your city and why you like it.',
      'Write a letter to a friend about a recent trip you took.',
    ];
    const topicsMed = [
      'Some people think studying online is as effective as attending classes. Discuss both views and give your opinion.',
      'The chart shows energy consumption by sector. Summarize the information and make comparisons where relevant.',
    ];
    const topicsHard = [
      'In many countries, the gap between the rich and the poor is growing. Why is this happening, and how can this problem be tackled?',
      'The graph illustrates international migration trends over 50 years. Summarize the information and suggest causes.',
    ];
    const pool = difficulty === 'easy' ? topicsEasy : difficulty === 'medium' ? topicsMed : topicsHard;
    const prompt = pool[Math.floor(Math.random()*pool.length)];
    const type = prompt.includes('chart') || prompt.includes('graph') ? 'task1' : 'task2';
    return { type, prompt };
  }

  generateReadingTask(difficulty: 'easy'|'medium'|'hard') {
    const passage = difficulty === 'easy'
      ? 'The honeybee is a social insect that plays a vital role in pollination.'
      : difficulty === 'medium'
      ? 'Urbanization has transformed ecosystems, altering species diversity and resource flows.'
      : 'Quantum computing leverages superposition and entanglement to perform certain computations more efficiently.';
    const questions = Array.from({ length: 40 }, (_, i) => ({
      number: i + 1,
      question: `Q${i + 1}: Choose the correct option (A/B/C/D).`,
      options: ['A', 'B', 'C', 'D'],
    }));
    // simple deterministic correct answers for stub
    const correct = Array.from({ length: 40 }, (_, i) => ['A','B','C','D'][i % 4]);
    return { passage, questions, correct };
  }

  scoreReading(answers: string[], correct: string[]) {
    const total = Math.min(correct.length, answers.length);
    let correctCount = 0;
    for (let i = 0; i < total; i++) {
      if ((answers[i] || '').trim().toUpperCase() === (correct[i] || '').trim().toUpperCase()) correctCount++;
    }
    const band = this.mapScoreToBand(correctCount);
    return { correct: correctCount, total, band };
  }

  private mapScoreToBand(correct: number) {
    // rough mapping for stub
    if (correct >= 39) return 9;
    if (correct >= 37) return 8.5;
    if (correct >= 35) return 8;
    if (correct >= 32) return 7.5;
    if (correct >= 30) return 7;
    if (correct >= 27) return 6.5;
    if (correct >= 23) return 6;
    if (correct >= 19) return 5.5;
    if (correct >= 15) return 5;
    return 4.5;
  }
}


