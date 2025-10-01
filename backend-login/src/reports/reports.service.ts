import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationService } from './moderation.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private moderation: ModerationService,
    private notifications: NotificationsService,
  ) {}

  async createReport(reporterId: number, dto: { targetId?: number; reason: string }) {
    const m = this.moderation.score(dto.reason || '');
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        targetId: dto.targetId || null,
        reason: dto.reason,
        priority: m.priority as any,
        toxicityScore: m.toxicity,
        autoFlagged: m.flagged,
        status: 'pending',
      },
      include: { reporter: true, target: true },
    });
    // уведомить всех админов/суперадминов
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['admin', 'creator'] } },
      select: { id: true },
    });
    await Promise.all(
      admins.map(a =>
        this.notifications.push(a.id, {
          type: 'report.new',
          title: `Новая жалоба #${report.id}`,
          body: `${reporterId} → ${report.targetId ?? '—'} | priority: ${report.priority}`,
        }),
      ),
    );
    return report;
  }

  async list() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, email: true, name: true } },
        target:   { select: { id: true, email: true, name: true } },
        admin:    { select: { id: true, email: true, name: true } },
      },
    });
  }

  // назначить на админа + отметить первый ответ
  async assign(reportId: number, adminId: number) {
    const r = await this.prisma.report.findUnique({ where: { id: reportId }});
    if (!r) throw new NotFoundException('Report not found');
    const firstResponseAt = r.firstResponseAt ?? new Date();
    return this.prisma.report.update({
      where: { id: reportId },
      data: { assignedAdminId: adminId, firstResponseAt },
    });
  }

  // обновить статус; начислить карму; апдейт KPI
  async updateStatus(reportId: number, adminId: number, status: 'in_review'|'resolved'|'rejected') {
    const r = await this.prisma.report.findUnique({ where: { id: reportId }});
    if (!r) throw new NotFoundException('Report not found');
    const now = new Date();
    const data: any = { status };
    if (status === 'resolved') data.resolvedAt = now;
    const updated = await this.prisma.report.update({ where: { id: reportId }, data });
    // уведомить репортера
    await this.notifications.push(r.reporterId, {
      type: 'report.status',
      title: `Жалоба #${r.id}: ${status}`,
      body: `Статус вашей жалобы изменён на "${status}".`,
    });
    // карма пользователю за полезную жалобу
    if (status === 'resolved') {
      await this.prisma.user.update({
        where: { id: r.reporterId },
        data: { karmaPoints: { increment: 5 } },
      });
    }
    // KPI админа
    await this.updateAdminKPI(adminId, r);

    return updated;
  }

  private async updateAdminKPI(adminId: number, report: { firstResponseAt: Date|null }) {
    const now = new Date();
    const firstRespSec = report.firstResponseAt
      ? Math.max(0, Math.floor((now.getTime() - new Date(report.firstResponseAt).getTime())/1000))
      : 0;
    
    // Check if KPI exists
    const existingKPI = await this.prisma.adminKPI.findUnique({
      where: { adminId }
    });

    if (existingKPI) {
      // Update existing KPI
      const handledCount = existingKPI.handledCount + 1;
      const avgFirstResponseSec = Math.floor((existingKPI.avgFirstResponseSec * existingKPI.handledCount + firstRespSec) / handledCount);
      const rating = Math.max(0, 10 - avgFirstResponseSec / 60); // 0..10
      
      return this.prisma.adminKPI.update({
        where: { adminId },
        data: { handledCount, avgFirstResponseSec, rating }
      });
    } else {
      // Create new KPI
      return this.prisma.adminKPI.create({
        data: { 
          adminId, 
          handledCount: 1, 
          avgFirstResponseSec: firstRespSec, 
          rating: 5 
        }
      });
    }
  }
}
