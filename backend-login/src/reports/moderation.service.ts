import { Injectable } from '@nestjs/common';

@Injectable()
export class ModerationService {
  // простая эвристика; список можно расширять
  private badWords = [
    'сука', 'бляд', 'хер', 'мраз', 'долбо', 'идиот', 'тупой', 'fuck', 'shit', 'bitch'
  ];

  score(text: string): { toxicity: number; flagged: boolean; priority: 'low' | 'normal' | 'high' | 'critical' } {
    if (!text) return { toxicity: 0, flagged: false, priority: 'normal' };

    const lower = text.toLowerCase();
    const hits = this.badWords.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
    const toxicity = Math.min(1, hits / 3); // 0..1

    let priority: 'low' | 'normal' | 'high' | 'critical' = 'normal';
    if (toxicity >= 0.66) priority = 'critical';
    else if (toxicity >= 0.33) priority = 'high';
    else if (toxicity > 0) priority = 'normal';

    const flagged = toxicity >= 0.33;
    return { toxicity, flagged, priority };
  }
}

