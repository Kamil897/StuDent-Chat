import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
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
  private knowledgeBase: MemoryItem[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly aiStatusService: AiStatusService,
  ) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // =========================
  // 🌐 Онлайн режим (Assistants API)
  // =========================
  async askWithAssistant(userId: string, message: string) {
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId) throw new Error('ASSISTANT_ID не задан в .env');

    try {
      // 1️⃣ создаём поток сообщений
      const thread = await this.client.beta.threads.create({
        messages: [{ role: 'user', content: message }],
      });

      // 2️⃣ запускаем ассистента Cognia
      const run = await this.client.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistantId,
      });

      // 3️⃣ ждём ответа
      if (run.status === 'completed') {
        const msgs = await this.client.beta.threads.messages.list(thread.id);
        const last = msgs.data[0];

        // 🧠 Исправленный способ извлечения текста (новый формат SDK)
        const textBlocks = last.content
          ?.filter((item: any) => item.type === 'output_text' || item.type === 'text')
          ?.map((item: any) =>
            item.type === 'text' ? item.text.value : item.text
          );

        const text = textBlocks?.join('\n').trim() || 'Нет текста';
        return { reply: text, source: 'assistant' };
      } else {
        return { reply: 'Ассистент не успел ответить.', source: 'timeout' };
      }
    } catch (error) {
      console.error('Assistant API error:', error);
      throw new InternalServerErrorException('Ошибка при запросе к ассистенту.');
    }
  }

  // =========================
  // 🔥 Главный метод: ask()
  // =========================
  async ask(
    userId: string,
    message: string,
    mode: 'online' | 'offline' = 'online', // ✅ теперь онлайн по умолчанию
    history?: any[],
  ) {
    if (!this.aiStatusService.isRunning()) {
      throw new ForbiddenException('AI отключен администратором');
    }

    // сохраняем историю
    if (!this.memory[userId]) this.memory[userId] = history || [];
    this.memory[userId].push({ role: 'user', content: message });

    if (this.memory[userId].length > 40) {
      this.memory[userId] = this.memory[userId].slice(-40);
    }

    // ✅ только ассистент Cognia
    const replyData = await this.askWithAssistant(userId, message);

    this.memory[userId].push({ role: 'assistant', content: replyData.reply });
    return { ...replyData, history: this.memory[userId] };
  }
}
