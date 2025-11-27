import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import OpenAI from 'openai';
import { AiStatusService } from './ai-status.service';
import { PrismaService } from '../prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // =========================
  // 🌐 Онлайн режим (Assistants API)
  // =========================
  async askWithAssistant(
    userId: string,
    message: string,
    memoryNotes?: string,
    historyForPrompt?: Array<{ role: string; content: string }>,
  ) {
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId) throw new Error('ASSISTANT_ID не задан в .env');

    try {
      const historyText = (historyForPrompt || [])
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      const context =
        `You are STUDENT-CHAT assistant. Use the user's memory notes to personalize answers.\n` +
        `Memory:\n${memoryNotes || '—'}\n---\nConversation:\n${historyText}\nUser: ${message}`;

      // 1️⃣ создаём поток сообщений
      const thread = await this.client.beta.threads.create({
        messages: [{ role: 'user', content: context }],
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
          ?.filter(
            (item: any) => item.type === 'output_text' || item.type === 'text',
          )
          ?.map((item: any) =>
            item.type === 'text' ? item.text.value : item.text,
          );

        const text = textBlocks?.join('\n').trim() || 'Нет текста';
        return { reply: text, source: 'assistant' };
      } else {
        return { reply: 'Ассистент не успел ответить.', source: 'timeout' };
      }
    } catch (error) {
      console.error('Assistant API error:', error);
      throw new InternalServerErrorException(
        'Ошибка при запросе к ассистенту.',
      );
    }
  }

  private async loadUserMemoryFromLogin(authHeader?: string): Promise<string> {
    const base = process.env.LOGIN_API_URL || 'http://localhost:3000';
    if (!authHeader) return '';

    try {
      const res = await this.httpService.axiosRef.get(`${base}/memory`, {
        headers: { Authorization: authHeader },
      });
      const data = res.data;
      if (Array.isArray(data)) {
        return data
          .map((m: any) => `${m.key}: ${JSON.stringify(m.value)}`)
          .join('\n');
      }
      return '';
    } catch (error) {
      console.error('Failed to load user memory from backend-login', error);
      return '';
    }
  }

  private async saveLastTopicToLogin(
    authHeader: string | undefined,
    message: string,
  ): Promise<void> {
    const base = process.env.LOGIN_API_URL || 'http://localhost:3000';
    if (!authHeader) return;
    try {
      await this.httpService.axiosRef.post(
        `${base}/memory/save`,
        {
          key: 'lastTopic',
          value: { at: new Date().toISOString(), message },
        },
        { headers: { Authorization: authHeader } },
      );
    } catch (error) {
      console.error(
        'Failed to persist lastTopic to backend-login memory',
        error,
      );
    }
  }

  // =========================
  // 🔥 Главный метод: ask()
  // =========================
  async ask(
    userId: string,
    message: string,
    mode: string,
    history?: Array<{ role: string; content: string }>,
    authHeader?: string,
  ) {
    if (!this.aiStatusService.isRunning()) {
      throw new ForbiddenException('AI отключен администратором');
    }

    // загружаем долговременную память из backend-login
    const memoryNotes = await this.loadUserMemoryFromLogin(authHeader);

    // сохраняем краткосрочную историю диалога в памяти процесса
    if (!this.memory[userId]) this.memory[userId] = history || [];
    this.memory[userId].push({ role: 'user', content: message });

    if (this.memory[userId].length > 40) {
      this.memory[userId] = this.memory[userId].slice(-40);
    }

    // ✅ ассистент Cognia с учетом долговременной памяти и истории
    const replyData = await this.askWithAssistant(
      userId,
      message,
      memoryNotes,
      this.memory[userId],
    );

    this.memory[userId].push({ role: 'assistant', content: replyData.reply });

    // 🧠 сохраняем историю диалога в БД (ChatHistory)
    const numericUserId = Number(userId);
    if (!Number.isNaN(numericUserId)) {
      try {
        await this.prisma.chatHistory.create({
          data: {
            userId: numericUserId,
            question: message,
            answer: replyData.reply,
          },
        });
      } catch (error) {
        // не ломаем основной ответ, если логирование истории упало

        console.error('Failed to persist Cognia chat history', error);
      }
    }

    // 🧠 сохраняем последнюю тему в долговременную память backend-login
    await this.saveLastTopicToLogin(authHeader, message);

    return { ...replyData, history: this.memory[userId] };
  }
}
