import { Injectable, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import OpenAI from 'openai';
import { AiStatusService } from './ai-status.service';

interface MemoryItem {
  q: string;
  a: string;
  embedding: number[];
}

@Injectable()
export class AiService {
  private client: OpenAI;
  private memory: Record<string, Array<{ role: string; content: string }>> = {};
  private knowledgeBase: MemoryItem[] = []; // глобальный кэш знаний

  constructor(
    private readonly httpService: HttpService,
    private readonly aiStatusService: AiStatusService, // 👈 статус AI
  ) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // =========================
  // 🔤 Определение языка
  // =========================
  private detectLanguage(text: string): 'ru' | 'en' | 'other' {
    if (/[а-яА-ЯёЁ]/.test(text)) return 'ru';
    if (/[a-zA-Z]/.test(text)) return 'en';
    return 'other';
  }

  private systemPromptByLang(lang: 'ru' | 'en' | 'other'): string {
    if (lang === 'ru') {
      return `
      Ты — цифровой учебный ассистент Cognia от компании Student-Chat.
      Отвечай ВСЕГДА на русском языке.
      Поддерживай тему: образование, экзамены, языки, математика, ИТ.
      Если вопрос вне тематики — мягко отклоняй.
      `.trim();
    }
    if (lang === 'en') {
      return `
    You are Cognia, a digital learning assistant by Student-Chat.
    Always respond in English.
    Keep the scope: education, exams, languages, math, IT.
    Reject unrelated topics.
      `.trim();
    }
    return `
    You are Cognia, a multilingual learning assistant by Student-Chat.
    Answer in the user's language. Focus only on education/IT/exams/languages/math.
    Reject unrelated topics.
    `.trim();
  }

  // =========================
  // ⬇️ Фильтр стиля/домена
  // =========================
  private enforceStyleAndDomain(message: string): string {
    const offTopic = [
      'политик','политика','18+','порно','оруж','биржа','ставк','казино',
      'взлом','хакинг','наркот','бомб','террор','религ','рецепт','анекдот','новост'
    ];
    if (offTopic.some(k => message.toLowerCase().includes(k))) {
      throw new BadRequestException('Вопрос не относится к теме образования/ИТ.');
    }

    return `
    Ты — Cognia (Student-Chat).
    Отвечай строго в рамках: образование, ИТ, экзамены, языки, математика.
    Формат ответа:
    1) Шаги обучения или алгоритм.
    2) Мини-пример / задание для практики.
    Если не уверен — скажи "не уверен, уточните".
    ---
    Вопрос: ${message}
    Ответ:
    `.trim();
  }

  // =========================
  // ⏳ Retry + Timeout
  // =========================
  private async safeCall<T>(fn: () => Promise<T>, retries = 3, timeout = 10000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await Promise.race([
          fn(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
        ]);
        return res as T;
      } catch (err) {
        lastError = err;
        await new Promise(r => setTimeout(r, (i + 1) * 500));
      }
    }
    throw lastError;
  }

  // =========================
  // 📐 Embeddings
  // =========================
  private async getEmbedding(text: string): Promise<number[]> {
    const res = await this.safeCall(() =>
      this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })
    );
    return res.data[0].embedding;
  }

  private cosineSim(a: number[], b: number[]): number {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (normA * normB || 1);
  }

  private async searchKnowledge(query: string, threshold = 0.85): Promise<string | null> {
    if (this.knowledgeBase.length === 0) return null;
    const queryEmbedding = await this.getEmbedding(query);

    let best: { a: string; score: number } | null = null;
    for (const item of this.knowledgeBase) {
      const score = this.cosineSim(queryEmbedding, item.embedding);
      if (!best || score > best.score) {
        best = { a: item.a, score };
      }
    }
    return best && best.score >= threshold ? best.a : null;
  }

  private async saveToKnowledge(q: string, a: string) {
    if (!q || !a) return;
    const embedding = await this.getEmbedding(q);
    this.knowledgeBase.push({ q, a, embedding });
    if (this.knowledgeBase.length > 500) {
      this.knowledgeBase.splice(0, this.knowledgeBase.length - 500);
    }
  }

  // =========================
  // 🤝 GPT-4 запрос
  // =========================
  async askGPT4(message: string, persona?: string): Promise<{ reply: string; source: 'memory' | 'model' }> {
    // 👉 Проверяем статус AI
    if (!this.aiStatusService.isRunning()) {
      throw new ForbiddenException('AI is disabled by admin');
    }

    // Проверяем в knowledge base
    const cached = await this.searchKnowledge(message);
    if (cached) return { reply: cached, source: 'memory' };

    const lang = this.detectLanguage(message);
    const systemPrompt = this.systemPromptByLang(lang);
    const finalPrompt = persona ? `${systemPrompt}\n\n${persona}` : systemPrompt;
    const filteredPrompt = this.enforceStyleAndDomain(message);

    try {
      const completion = await this.safeCall(() =>
        this.client.chat.completions.create({
          model: 'gpt-4.1-nano',
          messages: [
            { role: 'system', content: finalPrompt },
            { role: 'user', content: filteredPrompt },
          ],
          temperature: 0.3,
        })
      );

      const reply = completion.choices[0].message?.content?.trim() || 'Нет ответа';
      await this.saveToKnowledge(message, reply);
      return { reply, source: 'model' };
    } catch (error: any) {
      console.error('GPT-4 Error:', error.response?.data || error.message);
      throw new InternalServerErrorException('GPT-4 service failed');
    }
  }

  // =========================
  // 🛡️ SAFE fallback
  // =========================
  async askAISafe(message: string, persona?: string) {
    try {
      return await this.askGPT4(message, persona);
    } catch (e) {
      console.error('Model failed:', e);
    }

    const lang = this.detectLanguage(message);
    const fallback =
      lang === 'ru'
        ? 'Сейчас не могу получить ответ. Попробуйте позже.'
        : 'I cannot fetch an answer right now. Please try again later.';
    return { reply: fallback, source: 'fallback' as const };
  }

  // =========================
  // 🔥 Метод: ask с userId + history
  // =========================
  async ask(userId: string, message: string, style: string, history?: any[]) {
    if (history) {
      this.memory[userId] = history.map(m => ({ role: m.role, content: m.text }));
    }
    if (!this.memory[userId]) this.memory[userId] = [];
    this.memory[userId].push({ role: 'user', content: message });

    // лимит истории (макс 40 сообщений)
    if (this.memory[userId].length > 40) {
      this.memory[userId] = this.memory[userId].slice(-40);
    }

    const persona = style ? `${style}\n\n${this.systemPromptByLang(this.detectLanguage(message))}` : undefined;
    const { reply, source } = await this.askAISafe(message, persona);

    this.memory[userId].push({ role: 'assistant', content: reply });
    return { reply, source, history: this.memory[userId] };
  }
}
