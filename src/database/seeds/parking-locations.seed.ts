import 'reflect-metadata';
require('dotenv').config();
require('tsconfig-paths/register');
import { DataSource } from 'typeorm';
import { ParkingLocation } from '@modules/parking-locations/entities/parking-location.entity';
import { ParkingSlot } from '@modules/parking-locations/entities/parking-slot.entity';
import { LocationStatus } from '@modules/parking-locations/enums/location-status.enum';
import { VehicleType, SlotStatus } from '@modules/parking-locations/enums/vehicle-type.enum';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'spa_dev',
  entities: [ParkingLocation, ParkingSlot],
  synchronize: false,
});

// 50 bãi đỗ xe TP.HCM thực tế
const LOCATIONS = [
  { name: 'Bãi xe Vincom Center Đồng Khởi', slug: 'vincom-center-dong-khoi', address: '72 Lê Thánh Tôn, Bến Nghé, Quận 1', lat: 10.7769, lng: 106.7019, phone: '02838271234', hourly: 5000, daily: 80000, monthly: 1500000, total: 300, open: '06:00', close: '23:00', is24h: false },
  { name: 'Bãi xe Bitexco Financial Tower', slug: 'bitexco-financial-tower', address: '2 Hải Triều, Bến Nghé, Quận 1', lat: 10.7717, lng: 106.7043, phone: '02838156789', hourly: 6000, daily: 100000, monthly: 2000000, total: 200, open: '00:00', close: '23:59', is24h: true },
  { name: 'Bãi xe Saigon Centre', slug: 'saigon-centre', address: '65 Lê Lợi, Bến Nghé, Quận 1', lat: 10.7744, lng: 106.7015, phone: '02838299000', hourly: 5000, daily: 90000, monthly: 1800000, total: 250, open: '07:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Lotte Mart Quận 7', slug: 'lotte-mart-quan-7', address: '469 Nguyễn Hữu Thọ, Tân Hưng, Quận 7', lat: 10.7353, lng: 106.7042, phone: '02837755678', hourly: 3000, daily: 50000, monthly: 900000, total: 500, open: '08:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Aeon Mall Tân Phú', slug: 'aeon-mall-tan-phu', address: '30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú', lat: 10.8007, lng: 106.6278, phone: '02838111222', hourly: 3000, daily: 45000, monthly: 800000, total: 600, open: '08:00', close: '22:00', is24h: false },
  { name: 'Bãi xe TTTM Crescent Mall', slug: 'crescent-mall-quan-7', address: '101 Tôn Dật Tiên, Tân Phú, Quận 7', lat: 10.7296, lng: 106.7219, phone: '02854119999', hourly: 4000, daily: 60000, monthly: 1100000, total: 400, open: '09:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Parkson Flemington', slug: 'parkson-flemington', address: '182 Lê Đại Hành, Phường 15, Quận 11', lat: 10.7630, lng: 106.6605, phone: '02838647123', hourly: 4000, daily: 65000, monthly: 1200000, total: 180, open: '09:00', close: '21:30', is24h: false },
  { name: 'Bãi xe Bến Thành Market', slug: 'ben-thanh-market', address: 'Lê Lợi, Bến Thành, Quận 1', lat: 10.7725, lng: 106.6983, phone: '02838295888', hourly: 5000, daily: 80000, monthly: 1500000, total: 120, open: '06:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Sân bay Tân Sơn Nhất P1', slug: 'san-bay-tan-son-nhat-p1', address: '60 Trường Sơn, Phường 2, Tân Bình', lat: 10.8189, lng: 106.6592, phone: '02838483848', hourly: 10000, daily: 150000, monthly: 0, total: 800, open: '00:00', close: '23:59', is24h: true },
  { name: 'Bãi xe Sân bay Tân Sơn Nhất P2', slug: 'san-bay-tan-son-nhat-p2', address: '60 Trường Sơn, Phường 2, Tân Bình', lat: 10.8195, lng: 106.6600, phone: '02838483849', hourly: 10000, daily: 150000, monthly: 0, total: 800, open: '00:00', close: '23:59', is24h: true },
  { name: 'Bãi xe Landmark 81', slug: 'landmark-81', address: '772 Điện Biên Phủ, Vinhomes Central Park, Bình Thạnh', lat: 10.7950, lng: 106.7218, phone: '02835123456', hourly: 7000, daily: 120000, monthly: 2500000, total: 350, open: '06:00', close: '23:00', is24h: false },
  { name: 'Bãi xe Pearl Plaza', slug: 'pearl-plaza-binh-thanh', address: '561A Điện Biên Phủ, Bình Thạnh', lat: 10.8028, lng: 106.7140, phone: '02835129988', hourly: 5000, daily: 90000, monthly: 1700000, total: 220, open: '07:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Giga Mall Thủ Đức', slug: 'giga-mall-thu-duc', address: '240-242 Kha Vạn Cân, Linh Đông, Thủ Đức', lat: 10.8420, lng: 106.7560, phone: '02836202000', hourly: 3000, daily: 40000, monthly: 750000, total: 700, open: '08:00', close: '22:00', is24h: false },
  { name: 'Bãi xe BigC An Lạc', slug: 'bigc-an-lac-binh-tan', address: '1 Nguyễn Thị Tú, Bình Hưng Hòa B, Bình Tân', lat: 10.7500, lng: 106.6050, phone: '02837650101', hourly: 2000, daily: 35000, monthly: 650000, total: 450, open: '08:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Co.opmart Cống Quỳnh', slug: 'coopmart-cong-quynh', address: '189 Cống Quỳnh, Phường Nguyễn Cư Trinh, Quận 1', lat: 10.7658, lng: 106.6913, phone: '02838381111', hourly: 4000, daily: 60000, monthly: 1100000, total: 150, open: '07:00', close: '21:30', is24h: false },
  { name: 'Bãi xe Nowzone Fashion Mall', slug: 'nowzone-fashion-mall', address: '235 Nguyễn Văn Cừ, Quận 1', lat: 10.7600, lng: 106.6829, phone: '02838333888', hourly: 4000, daily: 65000, monthly: 1200000, total: 200, open: '09:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Times City Quận 4', slug: 'times-city-quan-4', address: '56 Nguyễn Thị Minh Khai, Quận 3', lat: 10.7805, lng: 106.6900, phone: '02838200800', hourly: 5000, daily: 80000, monthly: 1500000, total: 280, open: '07:00', close: '23:00', is24h: false },
  { name: 'Bãi xe Vạn Hạnh Mall', slug: 'van-hanh-mall', address: '11 Sư Vạn Hạnh, Phường 12, Quận 10', lat: 10.7727, lng: 106.6700, phone: '02838633388', hourly: 4000, daily: 70000, monthly: 1300000, total: 320, open: '09:00', close: '22:00', is24h: false },
  { name: 'Bãi xe SC VivoCity', slug: 'sc-vivocity-quan-7', address: '1058 Nguyễn Văn Linh, Tân Phong, Quận 7', lat: 10.7263, lng: 106.7154, phone: '02854619999', hourly: 4000, daily: 60000, monthly: 1100000, total: 550, open: '09:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Estella Place', slug: 'estella-place-quan-2', address: '88 Song Hành, An Phú, Thủ Đức', lat: 10.8000, lng: 106.7500, phone: '02836204444', hourly: 5000, daily: 90000, monthly: 1800000, total: 400, open: '09:00', close: '22:00', is24h: false },
  { name: 'Bãi xe TTTM Sense City', slug: 'sense-city-quan-8', address: '42-44 Tùng Thiện Vương, Phường 11, Quận 8', lat: 10.7360, lng: 106.6650, phone: '02836261000', hourly: 3000, daily: 50000, monthly: 950000, total: 350, open: '09:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Lucky Plaza', slug: 'lucky-plaza-quan-1', address: '68-70 Nguyễn Huệ, Quận 1', lat: 10.7749, lng: 106.7030, phone: '02838222222', hourly: 8000, daily: 130000, monthly: 2500000, total: 100, open: '07:00', close: '22:00', is24h: false },
  { name: 'Bãi xe An Đông Plaza', slug: 'an-dong-plaza-quan-5', address: '18 An Dương Vương, Phường 9, Quận 5', lat: 10.7553, lng: 106.6793, phone: '02838353000', hourly: 4000, daily: 60000, monthly: 1100000, total: 200, open: '08:00', close: '21:30', is24h: false },
  { name: 'Bãi xe Nguyễn Kim Quận 10', slug: 'nguyen-kim-quan-10', address: '63-65 Lý Thường Kiệt, Quận 10', lat: 10.7707, lng: 106.6673, phone: '02838634567', hourly: 4000, daily: 65000, monthly: 1200000, total: 180, open: '08:00', close: '21:30', is24h: false },
  { name: 'Bãi xe Thảo Cầm Viên', slug: 'thao-cam-vien-quan-1', address: '2 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1', lat: 10.7878, lng: 106.7067, phone: '02838290927', hourly: 5000, daily: 80000, monthly: 0, total: 150, open: '07:00', close: '20:00', is24h: false },
  { name: 'Bãi xe Phú Mỹ Hưng Midtown', slug: 'phu-my-hung-midtown', address: '16 Phú Mỹ, Tân Phong, Quận 7', lat: 10.7193, lng: 106.7148, phone: '02854126666', hourly: 5000, daily: 90000, monthly: 1800000, total: 300, open: '00:00', close: '23:59', is24h: true },
  { name: 'Bãi xe Sunrise City', slug: 'sunrise-city-quan-7', address: '27 Nguyễn Hữu Thọ, Tân Hưng, Quận 7', lat: 10.7380, lng: 106.7000, phone: '02854115555', hourly: 5000, daily: 85000, monthly: 1600000, total: 250, open: '06:00', close: '23:00', is24h: false },
  { name: 'Bãi xe TTTM Etown Cộng Hòa', slug: 'etown-cong-hoa-tan-binh', address: '364 Cộng Hòa, Phường 13, Tân Bình', lat: 10.8015, lng: 106.6530, phone: '02838102233', hourly: 4000, daily: 60000, monthly: 1100000, total: 300, open: '07:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Satra Phú Thọ', slug: 'satra-phu-tho-quan-11', address: '512 Lý Thường Kiệt, Phường 8, Quận 11', lat: 10.7680, lng: 106.6567, phone: '02838567890', hourly: 3000, daily: 50000, monthly: 900000, total: 200, open: '07:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Lê Văn Sỹ Quận 3', slug: 'le-van-sy-quan-3', address: '134 Lê Văn Sỹ, Phường 10, Quận 3', lat: 10.7887, lng: 106.6876, phone: '02838447712', hourly: 5000, daily: 80000, monthly: 1500000, total: 120, open: '06:00', close: '23:00', is24h: false },
  { name: 'Bãi xe Thuận Kiều Plaza', slug: 'thuan-kieu-plaza-quan-5', address: '190 Hồng Bàng, Phường 12, Quận 5', lat: 10.7555, lng: 106.6717, phone: '02838558866', hourly: 4000, daily: 65000, monthly: 1200000, total: 220, open: '08:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Sân vận động Thống Nhất', slug: 'san-van-dong-thong-nhat', address: '138 Đặng Thị Nhu, Quận 1', lat: 10.7838, lng: 106.6956, phone: '02838235888', hourly: 5000, daily: 0, monthly: 0, total: 500, open: '06:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Indochina Park Tower', slug: 'indochina-park-tower-quan-1', address: '4 Nguyễn Đình Chiểu, Đa Kao, Quận 1', lat: 10.7850, lng: 106.6996, phone: '02838247000', hourly: 6000, daily: 100000, monthly: 2000000, total: 150, open: '06:00', close: '22:00', is24h: false },
  { name: 'Bãi xe TTTM The Garden Mall', slug: 'the-garden-mall-quan-5', address: '190 Hồng Bàng, Phường 12, Quận 5', lat: 10.7562, lng: 106.6728, phone: '02838765432', hourly: 3000, daily: 50000, monthly: 950000, total: 280, open: '09:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Cao ốc Mirae Asset', slug: 'cao-oc-mirae-asset-quan-1', address: '268 Tô Hiến Thành, Phường 15, Quận 10', lat: 10.7715, lng: 106.6608, phone: '02836260000', hourly: 5000, daily: 90000, monthly: 1800000, total: 200, open: '07:00', close: '21:00', is24h: false },
  { name: 'Bãi xe Him Lam Land', slug: 'him-lam-land-quan-7', address: 'Đường D1, Tân Hưng, Quận 7', lat: 10.7340, lng: 106.7083, phone: '02854233333', hourly: 4000, daily: 70000, monthly: 1300000, total: 350, open: '06:00', close: '23:00', is24h: false },
  { name: 'Bãi xe Phúc Lộc Thọ', slug: 'phuc-loc-tho-binh-thanh', address: '136 Đinh Tiên Hoàng, Bình Thạnh', lat: 10.8013, lng: 106.7061, phone: '02835150000', hourly: 4000, daily: 65000, monthly: 1200000, total: 160, open: '07:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Masteri Thảo Điền', slug: 'masteri-thao-dien-thu-duc', address: '159 Xa lộ Hà Nội, Thảo Điền, Thủ Đức', lat: 10.8040, lng: 106.7480, phone: '02836101999', hourly: 5000, daily: 90000, monthly: 1800000, total: 400, open: '00:00', close: '23:59', is24h: true },
  { name: 'Bãi xe Gigamall Thủ Đức B', slug: 'gigamall-thu-duc-b', address: '242 Kha Vạn Cân, Linh Đông, Thủ Đức', lat: 10.8430, lng: 106.7550, phone: '02836202001', hourly: 3000, daily: 40000, monthly: 750000, total: 300, open: '08:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Bách Hóa Xanh Bình Dương', slug: 'bach-hoa-xanh-binh-duong', address: '488 Đại lộ Bình Dương, Thuận Giao, Thuận An', lat: 10.9068, lng: 106.6860, phone: '02743700000', hourly: 2000, daily: 30000, monthly: 550000, total: 200, open: '07:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Đại học Bách Khoa HCM', slug: 'dh-bach-khoa-hcm', address: '268 Lý Thường Kiệt, Phường 14, Quận 10', lat: 10.7725, lng: 106.6578, phone: '02838647256', hourly: 3000, daily: 0, monthly: 800000, total: 400, open: '06:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Đại học Khoa học Tự nhiên', slug: 'dh-khoa-hoc-tu-nhien', address: '227 Nguyễn Văn Cừ, Phường 4, Quận 5', lat: 10.7609, lng: 106.6838, phone: '02838354069', hourly: 3000, daily: 0, monthly: 700000, total: 300, open: '06:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Bệnh viện Chợ Rẫy', slug: 'benh-vien-cho-ray', address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5', lat: 10.7540, lng: 106.6680, phone: '02838554137', hourly: 5000, daily: 0, monthly: 0, total: 250, open: '00:00', close: '23:59', is24h: true },
  { name: 'Bãi xe Bệnh viện Từ Dũ', slug: 'benh-vien-tu-du', address: '284 Cống Quỳnh, Phường Phạm Ngũ Lão, Quận 1', lat: 10.7673, lng: 106.6873, phone: '02838395117', hourly: 5000, daily: 0, monthly: 0, total: 150, open: '00:00', close: '23:59', is24h: true },
  { name: 'Bãi xe UBND Quận 1', slug: 'ubnd-quan-1', address: '86 Lê Thánh Tôn, Bến Nghé, Quận 1', lat: 10.7775, lng: 106.7003, phone: '02838292022', hourly: 5000, daily: 70000, monthly: 0, total: 100, open: '07:00', close: '21:00', is24h: false },
  { name: 'Bãi xe Trung tâm Hội nghị White Palace', slug: 'white-palace-convention-center', address: '194 Hoàng Văn Thụ, Phường 9, Phú Nhuận', lat: 10.7985, lng: 106.6741, phone: '02839971234', hourly: 5000, daily: 80000, monthly: 1500000, total: 200, open: '07:00', close: '23:00', is24h: false },
  { name: 'Bãi xe Trung tâm Tiệc cưới Majestic', slug: 'majestic-wedding-center-go-vap', address: '47 Đinh Tiên Hoàng, Gò Vấp', lat: 10.8340, lng: 106.6870, phone: '02839887654', hourly: 4000, daily: 60000, monthly: 1100000, total: 180, open: '08:00', close: '23:00', is24h: false },
  { name: 'Bãi xe Khu dân cư Cityland Park Hills', slug: 'cityland-park-hills-go-vap', address: '196/1 Nguyễn Văn Lượng, Phường 10, Gò Vấp', lat: 10.8241, lng: 106.6646, phone: '02836128888', hourly: 3000, daily: 50000, monthly: 900000, total: 300, open: '00:00', close: '23:59', is24h: true },
  { name: 'Bãi xe Phú Mỹ Hưng Plaza', slug: 'phu-my-hung-plaza-quan-7', address: 'Phú Mỹ Hưng, Phường Tân Phong, Quận 7', lat: 10.7215, lng: 106.7130, phone: '02854100000', hourly: 5000, daily: 80000, monthly: 1500000, total: 350, open: '08:00', close: '22:00', is24h: false },
  { name: 'Bãi xe Khu đô thị Sala', slug: 'khu-do-thi-sala-thu-duc', address: 'Đại lộ Mai Chí Thọ, An Lợi Đông, Thủ Đức', lat: 10.7960, lng: 106.7630, phone: '02836212121', hourly: 5000, daily: 90000, monthly: 1800000, total: 400, open: '00:00', close: '23:59', is24h: true },
];

function makeSlots(locationId: string, total: number) {
  const slots: Partial<ParkingSlot>[] = [];
  const carCount = Math.floor(total * 0.55);
  const motoCount = Math.floor(total * 0.35);
  const bikeCount = total - carCount - motoCount;

  const occupied = (count: number) => Math.floor(count * (Math.random() * 0.4));

  let n = 1;
  const addSlots = (count: number, type: VehicleType) => {
    const occ = occupied(count);
    for (let i = 0; i < count; i++) {
      slots.push({
        locationId,
        slotNumber: `${type.charAt(0).toUpperCase()}${String(n++).padStart(3, '0')}`,
        vehicleType: type,
        status: i < occ ? SlotStatus.OCCUPIED : SlotStatus.AVAILABLE,
      });
    }
  };

  addSlots(carCount, VehicleType.CAR);
  addSlots(motoCount, VehicleType.MOTORBIKE);
  addSlots(bikeCount, VehicleType.BICYCLE);
  return slots;
}

async function seed() {
  await AppDataSource.initialize();
  const locationRepo = AppDataSource.getRepository(ParkingLocation);
  const slotRepo = AppDataSource.getRepository(ParkingSlot);

  await slotRepo.createQueryBuilder().delete().execute();
  await locationRepo.createQueryBuilder().delete().execute();

  let created = 0;
  for (const loc of LOCATIONS) {
    const entity = locationRepo.create({
      name: loc.name,
      slug: loc.slug,
      address: loc.address,
      latitude: loc.lat,
      longitude: loc.lng,
      phone: loc.phone,
      hourlyRate: loc.hourly,
      dailyRate: loc.daily || null,
      monthlyRate: loc.monthly || null,
      totalSlots: loc.total,
      availableSlots: loc.total,
      openTime: loc.open,
      closeTime: loc.close,
      is24h: loc.is24h,
      status: LocationStatus.ACTIVE,
      imageUrl: `https://picsum.photos/seed/${loc.slug}/800/400`,
      description: `${loc.name} — bãi đỗ xe tiêu chuẩn tại ${loc.address.split(',').slice(-2).join(',').trim()}`,
    });
    const saved = await locationRepo.save(entity);

    const slots = makeSlots(saved.id, loc.total).map((s) => slotRepo.create(s));
    await slotRepo.save(slots);

    // Sync availableSlots
    const availableCount = slots.filter(s => s.status === SlotStatus.AVAILABLE).length;
    await locationRepo.update(saved.id, { availableSlots: availableCount });

    created++;
    console.log(`  ✅ [${created}/50] ${loc.name}`);
  }

  console.log(`\n✅ Seed hoàn tất: ${created} bãi đỗ xe + slots`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
