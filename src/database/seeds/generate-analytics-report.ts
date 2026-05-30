/**
 * Script tạo báo cáo Analytics cho báo cáo đồ án
 * Kéo dữ liệu trực tiếp từ database và xuất kết quả phân tích
 *
 * Chạy: npm run report:analytics
 */

import 'reflect-metadata';
require('dotenv').config();
require('tsconfig-paths/register');
import { DataSource } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Survey } from '@modules/survey/entities/survey.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'spa_dev',
  entities: [User, Survey],
  synchronize: false,
});

function bar(value: number, max: number, width = 20): string {
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatSeconds(s: number): string {
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}m ${rem}s`;
}

async function main() {
  console.log('\n🚀 Đang kết nối database...\n');
  await AppDataSource.initialize();

  const surveyRepo = AppDataSource.getRepository(Survey);
  const userRepo = AppDataSource.getRepository(User);

  const surveys = await surveyRepo.find({ relations: ['user'] });
  const totalUsers = await userRepo.count();

  if (!surveys.length) {
    console.log('⚠️  Không có dữ liệu khảo sát. Chạy `npm run seed:surveys` trước.');
    process.exit(0);
  }

  // ─────────────────────────────────────────────
  // 1. Thống kê tổng quan
  // ─────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('     📊 BÁO CÁO PHÂN TÍCH NGƯỜI DÙNG - SPA PARKING APP        ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`📅 Ngày xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`);
  console.log(`👥 Tổng số người dùng trong hệ thống : ${totalUsers}`);
  console.log(`📝 Tổng số khảo sát đã thu thập      : ${surveys.length}`);
  console.log(`📈 Tỷ lệ hoàn thành khảo sát          : ${round2((surveys.length / totalUsers) * 100)}%\n`);

  // ─────────────────────────────────────────────
  // 2. Điểm hài lòng trung bình (4 tiêu chí)
  // ─────────────────────────────────────────────
  const avgOverall    = round2(avg(surveys.map(s => s.overallRating)));
  const avgUsability  = round2(avg(surveys.map(s => s.usabilityRating)));
  const avgBooking    = round2(avg(surveys.map(s => s.bookingRating)));
  const avgUI         = round2(avg(surveys.map(s => s.uiRating)));
  const avgAllMetrics = round2((avgOverall + avgUsability + avgBooking + avgUI) / 4);

  console.log('───────────────────────────────────────────────────────────────');
  console.log('  1️⃣  ĐIỂM HÀI LÒNG TRUNG BÌNH (thang điểm 1-5)              ');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  Hài lòng tổng thể  │ ${bar(avgOverall, 5)}  ${avgOverall}/5`);
  console.log(`  Dễ tìm bãi xe      │ ${bar(avgUsability, 5)}  ${avgUsability}/5`);
  console.log(`  Đặt xe & Check-in  │ ${bar(avgBooking, 5)}  ${avgBooking}/5`);
  console.log(`  Thiết kế UI/UX     │ ${bar(avgUI, 5)}  ${avgUI}/5`);
  console.log(`  ─────────────────────────────────────────────────────`);
  console.log(`  ★ ĐIỂM TRUNG BÌNH TỔNG HỢP: ${avgAllMetrics}/5  (${round2((avgAllMetrics / 5) * 100)}% hài lòng)\n`);

  // ─────────────────────────────────────────────
  // 3. Phân phối điểm số Overall
  // ─────────────────────────────────────────────
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  2️⃣  PHÂN PHỐI ĐIỂM HÀI LÒNG TỔNG THỂ                       ');
  console.log('───────────────────────────────────────────────────────────────');
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  surveys.forEach(s => { distribution[s.overallRating] = (distribution[s.overallRating] || 0) + 1; });

  for (let star = 5; star >= 1; star--) {
    const count = distribution[star] || 0;
    const pct = round2((count / surveys.length) * 100);
    const label = star === 5 ? '⭐⭐⭐⭐⭐' : star === 4 ? '⭐⭐⭐⭐ ' : star === 3 ? '⭐⭐⭐  ' : star === 2 ? '⭐⭐   ' : '⭐    ';
    console.log(`  ${label} │ ${bar(count, surveys.length)}  ${count} lượt (${pct}%)`);
  }
  console.log();

  // ─────────────────────────────────────────────
  // 4. Thời gian phiên & tương quan hành vi
  // ─────────────────────────────────────────────
  const surveysWithDuration = surveys.filter(s => s.sessionDurationSeconds != null);
  if (surveysWithDuration.length > 0) {
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  3️⃣  THỜI GIAN PHIÊN & TƯƠNG QUAN VỚI HÀI LÒNG              ');
    console.log('───────────────────────────────────────────────────────────────');

    const allDurations = surveysWithDuration.map(s => s.sessionDurationSeconds!);
    const avgDuration = avg(allDurations);

    const lowRating  = surveysWithDuration.filter(s => s.overallRating <= 2);
    const highRating = surveysWithDuration.filter(s => s.overallRating >= 4);
    const avgLow  = lowRating.length  ? avg(lowRating.map(s => s.sessionDurationSeconds!))  : 0;
    const avgHigh = highRating.length ? avg(highRating.map(s => s.sessionDurationSeconds!)) : 0;

    console.log(`  Thời gian phiên trung bình          : ${formatSeconds(avgDuration)}`);
    console.log(`  Phiên ngắn nhất                      : ${formatSeconds(Math.min(...allDurations))}`);
    console.log(`  Phiên dài nhất                       : ${formatSeconds(Math.max(...allDurations))}`);
    console.log();
    console.log(`  👎 Rating thấp (1-2★) - Session TB  : ${formatSeconds(avgLow)}  (${lowRating.length} user)`);
    console.log(`  👍 Rating cao  (4-5★) - Session TB  : ${formatSeconds(avgHigh)}  (${highRating.length} user)`);

    if (avgLow > avgHigh) {
      console.log(`\n  💡 Insight: Người dùng không hài lòng phải dùng app LÂU hơn`);
      console.log(`     ${round2(avgLow - avgHigh)}s dài hơn → Có thể gặp khó khăn trong quá trình sử dụng.`);
    } else {
      console.log(`\n  💡 Insight: Người dùng hài lòng có xu hướng dùng app nhiều hơn.`);
    }
    console.log();
  }

  // ─────────────────────────────────────────────
  // 5. Phân tích theo thiết bị
  // ─────────────────────────────────────────────
  const surveysWithOS = surveys.filter(s => s.deviceOS);
  if (surveysWithOS.length > 0) {
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  4️⃣  PHÂN TÍCH THEO THIẾT BỊ                                 ');
    console.log('───────────────────────────────────────────────────────────────');

    const osCounts: Record<string, number> = {};
    const osRatings: Record<string, number[]> = {};
    surveysWithOS.forEach(s => {
      const os = s.deviceOS!.toLowerCase();
      osCounts[os] = (osCounts[os] || 0) + 1;
      if (!osRatings[os]) osRatings[os] = [];
      osRatings[os].push(s.overallRating);
    });

    Object.entries(osCounts).forEach(([os, count]) => {
      const pct = round2((count / surveysWithOS.length) * 100);
      const avgRating = round2(avg(osRatings[os]));
      const icon = os === 'ios' ? '🍎' : '🤖';
      console.log(`  ${icon} ${os.toUpperCase().padEnd(8)} │ ${count} user (${pct}%) │ Rating TB: ${avgRating}/5`);
    });
    console.log();
  }

  // ─────────────────────────────────────────────
  // 6. Màn hình cuối cùng (Drop-off points)
  // ─────────────────────────────────────────────
  const surveysWithScreen = surveys.filter(s => s.lastVisitedScreen);
  if (surveysWithScreen.length > 0) {
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  5️⃣  ĐIỂM RƠI (DROP-OFF) - MÀN HÌNH CUỐI CÙNG              ');
    console.log('───────────────────────────────────────────────────────────────');

    const screenCounts: Record<string, number> = {};
    surveysWithScreen.forEach(s => {
      const screen = s.lastVisitedScreen!;
      screenCounts[screen] = (screenCounts[screen] || 0) + 1;
    });

    const sorted = Object.entries(screenCounts).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([screen, count]) => {
      const pct = round2((count / surveysWithScreen.length) * 100);
      console.log(`  ${screen.padEnd(25)} │ ${bar(count, Math.max(...Object.values(screenCounts)))} ${count} lượt (${pct}%)`);
    });
    console.log();
  }

  // ─────────────────────────────────────────────
  // 7. Nhận xét của người dùng
  // ─────────────────────────────────────────────
  const comments = surveys.filter(s => s.comment && s.comment.trim().length > 5);
  if (comments.length > 0) {
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  6️⃣  NHẬN XÉT CỦA NGƯỜI DÙNG                                ');
    console.log('───────────────────────────────────────────────────────────────');

    const sorted = [...comments].sort((a, b) => b.overallRating - a.overallRating);
    sorted.slice(0, 8).forEach(s => {
      const stars = '★'.repeat(s.overallRating) + '☆'.repeat(5 - s.overallRating);
      const device = s.deviceOS ? `[${s.deviceOS}]` : '';
      console.log(`  ${stars} ${device}`);
      console.log(`  "${s.comment}"`);
      console.log();
    });
  }

  // ─────────────────────────────────────────────
  // 8. Tóm tắt điểm mạnh & cần cải thiện
  // ─────────────────────────────────────────────
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  7️⃣  KẾT LUẬN & KHUYẾN NGHỊ                                  ');
  console.log('───────────────────────────────────────────────────────────────');

  const allRatings = [avgOverall, avgUsability, avgBooking, avgUI];
  const labels = ['Hài lòng tổng thể', 'Dễ tìm bãi xe', 'Đặt xe & Check-in', 'Thiết kế UI/UX'];
  const maxIdx = allRatings.indexOf(Math.max(...allRatings));
  const minIdx = allRatings.indexOf(Math.min(...allRatings));

  console.log(`  ✅ Điểm mạnh nhất  : ${labels[maxIdx]} (${allRatings[maxIdx]}/5)`);
  console.log(`  ⚠️  Cần cải thiện  : ${labels[minIdx]} (${allRatings[minIdx]}/5)`);
  console.log(`  📊 CSAT Score      : ${round2((avgAllMetrics / 5) * 100)}% (${avgAllMetrics}/5)`);

  const positiveCount = surveys.filter(s => s.overallRating >= 4).length;
  const negativeCount = surveys.filter(s => s.overallRating <= 2).length;
  console.log(`  👍 Người hài lòng  : ${positiveCount}/${surveys.length} (${round2((positiveCount / surveys.length) * 100)}%)`);
  console.log(`  👎 Cần chú ý       : ${negativeCount}/${surveys.length} (${round2((negativeCount / surveys.length) * 100)}%)\n`);

  console.log('═══════════════════════════════════════════════════════════════\n');

  await AppDataSource.destroy();
  console.log('✅ Báo cáo hoàn thành!');
}

main().catch((err) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
