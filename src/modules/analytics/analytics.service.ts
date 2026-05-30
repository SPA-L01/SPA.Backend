import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly repo: Repository<AnalyticsEvent>,
  ) {}

  async trackEvent(dto: CreateAnalyticsEventDto): Promise<void> {
    const event = this.repo.create({
      eventName: dto.eventName,
      params: dto.params ?? null,
      screenName: dto.screenName ?? null,
      sessionId: dto.sessionId ?? null,
      userId: dto.userId ?? null,
      deviceOs: dto.deviceOs ?? null,
      appVersion: dto.appVersion ?? null,
    });
    await this.repo.save(event);
  }

  /**
   * Báo cáo tổng hợp đầy đủ cho đồ án
   */
  async getStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalEvents,
      eventBreakdown,
      screenViews,
      deviceBreakdown,
      dailyActivity,
      checkoutFunnel,
      sessionStats,
      appVersions,
    ] = await Promise.all([
      // 1. Tổng số event
      this.repo.count(),

      // 2. Breakdown theo event name
      this.repo
        .createQueryBuilder('e')
        .select('e.eventName', 'name')
        .addSelect('COUNT(*)', 'count')
        .groupBy('e.eventName')
        .orderBy('count', 'DESC')
        .getRawMany(),

      // 3. Screen views (chỉ event screen_view)
      this.repo
        .createQueryBuilder('e')
        .select('e.screenName', 'screen')
        .addSelect('COUNT(*)', 'count')
        .where('e.eventName = :name', { name: 'screen_view' })
        .andWhere('e.screenName IS NOT NULL')
        .groupBy('e.screenName')
        .orderBy('count', 'DESC')
        .getRawMany(),

      // 4. Device OS breakdown
      this.repo
        .createQueryBuilder('e')
        .select('e.deviceOs', 'os')
        .addSelect('COUNT(DISTINCT e.sessionId)', 'sessions')
        .addSelect('COUNT(*)', 'events')
        .where('e.deviceOs IS NOT NULL')
        .groupBy('e.deviceOs')
        .orderBy('sessions', 'DESC')
        .getRawMany(),

      // 5. Daily activity (30 ngày gần nhất)
      this.repo
        .createQueryBuilder('e')
        .select("DATE(e.event_timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')", 'date')
        .addSelect('COUNT(DISTINCT e.sessionId)', 'sessions')
        .addSelect('COUNT(DISTINCT e.userId)', 'users')
        .addSelect('COUNT(*)', 'events')
        .where('e.eventTimestamp >= :since', { since: thirtyDaysAgo })
        .groupBy("DATE(e.event_timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')")
        .orderBy('date', 'ASC')
        .getRawMany(),

      // 6. Checkout funnel
      this.repo
        .createQueryBuilder('e')
        .select('e.eventName', 'event')
        .addSelect('COUNT(*)', 'count')
        .where('e.eventName IN (:...events)', {
          events: [
            'checkout_started',
            'checkout_success',
            'checkout_failed',
            'checkout_cancelled_by_user',
          ],
        })
        .groupBy('e.eventName')
        .getRawMany(),

      // 7. Session stats (unique sessions, avg events per session)
      this.repo
        .createQueryBuilder('e')
        .select('COUNT(DISTINCT e.sessionId)', 'totalSessions')
        .addSelect('COUNT(DISTINCT e.userId)', 'uniqueUsers')
        .addSelect(
          'ROUND(COUNT(*) * 1.0 / NULLIF(COUNT(DISTINCT e.sessionId), 0), 1)',
          'avgEventsPerSession',
        )
        .getRawOne(),

      // 8. App version breakdown
      this.repo
        .createQueryBuilder('e')
        .select('e.appVersion', 'version')
        .addSelect('COUNT(DISTINCT e.sessionId)', 'sessions')
        .where('e.appVersion IS NOT NULL')
        .groupBy('e.appVersion')
        .orderBy('sessions', 'DESC')
        .getRawMany(),
    ]);

    // Tính checkout conversion rate
    const funnelMap = Object.fromEntries(
      (checkoutFunnel as any[]).map((r) => [r.event, parseInt(r.count)]),
    );
    const checkoutConversion =
      funnelMap['checkout_started'] > 0
        ? Math.round(
            (funnelMap['checkout_success'] / funnelMap['checkout_started']) *
              100,
          )
        : null;

    return {
      generatedAt: now.toISOString(),
      summary: {
        totalEvents,
        totalSessions: parseInt((sessionStats as any)?.totalSessions ?? '0'),
        uniqueUsers: parseInt((sessionStats as any)?.uniqueUsers ?? '0'),
        avgEventsPerSession: parseFloat(
          (sessionStats as any)?.avgEventsPerSession ?? '0',
        ),
      },
      eventBreakdown: (eventBreakdown as any[]).map((r) => ({
        name: r.name,
        count: parseInt(r.count),
      })),
      screenViews: (screenViews as any[]).map((r) => ({
        screen: r.screen,
        count: parseInt(r.count),
      })),
      deviceBreakdown: (deviceBreakdown as any[]).map((r) => ({
        os: r.os,
        sessions: parseInt(r.sessions),
        events: parseInt(r.events),
      })),
      checkoutFunnel: {
        started: funnelMap['checkout_started'] ?? 0,
        success: funnelMap['checkout_success'] ?? 0,
        failed: funnelMap['checkout_failed'] ?? 0,
        cancelledByUser: funnelMap['checkout_cancelled_by_user'] ?? 0,
        conversionRate: checkoutConversion,
      },
      dailyActivity: dailyActivity as any[],
      appVersions: appVersions as any[],
    };
  }
}
