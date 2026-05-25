import 'reflect-metadata';
require('dotenv').config();
require('tsconfig-paths/register');
import { DataSource } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Survey } from '@modules/survey/entities/survey.entity';
import { Role } from '@modules/user/enums/role.enum';
import * as bcrypt from 'bcrypt';

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

const FAKE_USERS = [
  { email: 'user.test1@gmail.com', first: 'Hải', last: 'Nguyễn' },
  { email: 'user.test2@gmail.com', first: 'Thành', last: 'Lê' },
  { email: 'user.test3@gmail.com', first: 'Trang', last: 'Phạm' },
  { email: 'user.test4@gmail.com', first: 'Minh', last: 'Đỗ' },
  { email: 'user.test5@gmail.com', first: 'An', last: 'Vũ' },
  { email: 'user.test6@gmail.com', first: 'Khánh', last: 'Trần' },
  { email: 'user.test7@gmail.com', first: 'Phương', last: 'Hoàng' },
  { email: 'user.test8@gmail.com', first: 'Huy', last: 'Ngô' },
  { email: 'user.test9@gmail.com', first: 'Linh', last: 'Bùi' },
  { email: 'user.test10@gmail.com', first: 'Đức', last: 'Phan' },
];

const FAKE_SURVEYS = [
  { overall: 5, usability: 5, booking: 5, ui: 5, comment: 'Ứng dụng cực kỳ mượt mà, định vị bãi xe rất chính xác.', os: 'ios', duration: 90, lastScreen: 'index' },
  { overall: 4, usability: 5, booking: 4, ui: 4, comment: 'Tìm bãi xe nhanh nhưng thời gian check-in cần tối ưu thêm chút.', os: 'android', duration: 120, lastScreen: 'history' },
  { overall: 5, usability: 4, booking: 5, ui: 5, comment: 'Giao diện dark mode rất sang trọng, dễ sử dụng.', os: 'ios', duration: 80, lastScreen: 'index' },
  { overall: 2, usability: 3, booking: 2, ui: 3, comment: 'App bị đơ lúc checkout, mong sớm cập nhật bản vá.', os: 'android', duration: 320, lastScreen: 'checkout' },
  { overall: 3, usability: 3, booking: 4, ui: 3, comment: 'Giao diện hơi tối, đôi lúc load bản đồ hơi chậm.', os: 'ios', duration: 210, lastScreen: 'map' },
  { overall: 5, usability: 5, booking: 5, ui: 4, comment: 'Rất hài lòng, tiết kiệm nhiều thời gian tìm bãi đỗ.', os: 'ios', duration: 95, lastScreen: 'history' },
  { overall: 1, usability: 2, booking: 1, ui: 2, comment: 'Thanh toán ví lỗi liên tục, bị kẹt màn hình nạp tiền.', os: 'android', duration: 450, lastScreen: 'wallet' },
  { overall: 4, usability: 4, booking: 4, ui: 5, comment: 'Tính năng lưu vị trí xe rất hay, đỡ phải đi tìm quanh bãi.', os: 'ios', duration: 130, lastScreen: 'spot' },
  { overall: 5, usability: 4, booking: 5, ui: 5, comment: 'Tiện lợi, hy vọng có thêm nhiều bãi xe liên kết hơn ở Q7.', os: 'android', duration: 110, lastScreen: 'index' },
  { overall: 2, usability: 2, booking: 3, ui: 3, comment: 'App dùng được nhưng load lâu và tốn pin quá.', os: 'ios', duration: 380, lastScreen: 'map' },
];

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const surveyRepo = AppDataSource.getRepository(Survey);

  // Xóa surveys và user test cũ để đảm bảo seed sạch
  await surveyRepo.createQueryBuilder().delete().execute();
  
  for (const fake of FAKE_USERS) {
    await userRepo.createQueryBuilder()
      .delete()
      .where('email = :email', { email: fake.email })
      .execute();
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('🌱 Bắt đầu seeding 10 Users và 10 Surveys tương ứng...');

  for (let i = 0; i < FAKE_USERS.length; i++) {
    const fakeUser = FAKE_USERS[i];
    const fakeSurvey = FAKE_SURVEYS[i];

    // 1. Tạo User
    const user = userRepo.create({
      email: fakeUser.email,
      password: hashedPassword,
      firstName: fakeUser.first,
      lastName: fakeUser.last,
      role: Role.USER,
    });
    const savedUser = await userRepo.save(user);

    // 2. Tạo Khảo sát liên kết
    const survey = surveyRepo.create({
      overallRating: fakeSurvey.overall,
      usabilityRating: fakeSurvey.usability,
      bookingRating: fakeSurvey.booking,
      uiRating: fakeSurvey.ui,
      comment: fakeSurvey.comment,
      userId: savedUser.id,
      deviceOS: fakeSurvey.os,
      appVersion: '1.0.0',
      sessionDurationSeconds: fakeSurvey.duration,
      lastVisitedScreen: fakeSurvey.lastScreen,
    });
    await surveyRepo.save(survey);

    console.log(`  ✅ [${i + 1}/10] User: ${fakeUser.email} -> Đánh giá: ${fakeSurvey.overall} sao`);
  }

  console.log('\n🎉 Đã hoàn tất seed 10 Users & 10 Khảo sát mẫu!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Lỗi Seeding:', err);
  process.exit(1);
});
