import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IeltsService } from './ielts.service';
import { AuthGuard } from '@nestjs/passport';
import { OpenAIService } from '../openai/openai.service';
import { HistoryService } from '../history/history.service';

type AuthedRequest = Request & { user: { id: number } };

@Controller('ielts')
@UseGuards(AuthGuard('jwt'))
export class IeltsController {
  constructor(
    private readonly ieltsService: IeltsService,
    private readonly openai: OpenAIService,
    private readonly history: HistoryService,
  ) {}

  @Post('save')
  async save(@Req() req: AuthedRequest, @Body() body: { type: 'writing' | 'reading'; payload: any; band?: number }) {
    const userId = req.user.id;
    const saved = await this.ieltsService.saveResultForUser(userId, body.type, body.payload, body.band);
    return { ok: true, id: saved.id };
  }

  @Get('list')
  async list(@Req() req: AuthedRequest) {
    const userId = req.user.id;
    const results = await this.ieltsService.listResultsForUser(userId);
    return results;
  }

  // New endpoints (stubs)
  @Post('writing/task')
  async getWritingTask(@Body() body: { difficulty: 'easy'|'medium'|'hard' }) {
    const diff = (body?.difficulty || 'easy').toLowerCase() as any;
    return this.ieltsService.generateWritingTask(['easy','medium','hard'].includes(diff) ? diff : 'easy');
  }

  @Post('reading/task')
  async getReadingTask(@Body() body: { difficulty: 'easy'|'medium'|'hard' }) {
    const diff = (body?.difficulty || 'easy').toLowerCase() as any;
    return this.ieltsService.generateReadingTask(['easy','medium','hard'].includes(diff) ? diff : 'easy');
  }

  @Post('reading/score')
  async readingScore(@Req() req: AuthedRequest, @Body() body: { answers: string[]; correct?: string[] }) {
    const userId = req.user.id;
    const correct = body.correct && Array.isArray(body.correct) && body.correct.length === 40
      ? body.correct
      : this.ieltsService.generateReadingTask('easy').correct;
    const result = this.ieltsService.scoreReading(body.answers || [], correct);
    await this.ieltsService.saveResultForUser(userId, 'reading', { answers: body.answers, correct, result }, result.band);
    return result;
  }

  @Post('writing/score')
  async writingScore(@Req() req: AuthedRequest, @Body() body: { essay: string }) {
    // placeholder scoring: length-based
    const text = (body?.essay || '').trim();
    const band = Math.max(4.5, Math.min(9, 4.5 + Math.floor(text.length / 200)));
    await this.ieltsService.saveResultForUser(req.user.id, 'writing', { essay: text, length: text.length }, band);
    return { overall: band };
  }

  @Get('results')
  async getResults(@Req() req: AuthedRequest) {
    return this.list(req);
  }

  @Post('results/save')
  async saveResults(@Req() req: AuthedRequest, @Body() body: { type: 'writing'|'reading'; payload: any; band?: number }) {
    return this.save(req, body);
  }

  @Post('check-writing')
  async checkWriting(@Req() req: AuthedRequest, @Body() body: { essay: string }) {
    const userId = req.user.id;
    const essay = (body?.essay || '').trim();
    if (!essay) throw new BadRequestException('essay is required');

    const prompt = `Assess the following IELTS Writing Task 2 essay. Return STRICT JSON with keys: band (0-9 number), feedback { taskAchievement, coherence, lexicalResource, grammar }.
Essay:\n${essay}`;
    const raw = await this.openai.generateJson(prompt, 600);
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      // try to extract JSON substring
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start >= 0 && end > start) parsed = JSON.parse(raw.slice(start, end + 1));
      else throw new BadRequestException('AI response is not valid JSON');
    }

    const band = Number(parsed?.band ?? 0);
    const feedback = parsed?.feedback ?? {};

    await this.history.add(userId, 'ielts-writing', { essay, band, feedback });

    return { band, feedback };
  }
}


