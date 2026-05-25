import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,
  ) {}

  async create(userId: string | null, createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const survey = this.surveyRepo.create({
      ...createSurveyDto,
      userId,
    });
    return this.surveyRepo.save(survey);
  }

  async getAnalytics() {
    // 1. Tổng số khảo sát
    const totalSurveys = await this.surveyRepo.count();

    if (totalSurveys === 0) {
      return {
        totalSurveys: 0,
        averages: { overallRating: 0, usabilityRating: 0, bookingRating: 0, uiRating: 0 },
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        behaviorCorrelation: {
          lowRatingSessionAvg: 0,
          highRatingSessionAvg: 0,
        },
        comments: [],
      };
    }

    // 2. Điểm trung bình của từng câu hỏi
    const avgRatings = await this.surveyRepo
      .createQueryBuilder('survey')
      .select('AVG(survey.overallRating)', 'overall')
      .addSelect('AVG(survey.usabilityRating)', 'usability')
      .addSelect('AVG(survey.bookingRating)', 'booking')
      .addSelect('AVG(survey.uiRating)', 'ui')
      .getRawOne();

    // 3. Phân phối điểm số (Overall Rating)
    const distributionRaw = await this.surveyRepo
      .createQueryBuilder('survey')
      .select('survey.overallRating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .groupBy('survey.overallRating')
      .getRawMany();

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionRaw.forEach((item) => {
      const rating = parseInt(item.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating] = parseInt(item.count);
      }
    });

    // 4. Phân tích tương quan hành vi (Session duration của người dùng hài lòng thấp vs hài lòng cao)
    const correlationRaw = await this.surveyRepo
      .createQueryBuilder('survey')
      .select(
        'AVG(CASE WHEN survey.overallRating <= 2 THEN survey.sessionDurationSeconds ELSE null END)',
        'lowRatingAvg',
      )
      .addSelect(
        'AVG(CASE WHEN survey.overallRating >= 4 THEN survey.sessionDurationSeconds ELSE null END)',
        'highRatingAvg',
      )
      .getRawOne();

    // 5. Danh sách các đóng góp ý kiến (mới nhất trước)
    const comments = await this.surveyRepo.find({
      select: ['id', 'overallRating', 'comment', 'createdAt', 'deviceOS', 'appVersion'],
      where: {},
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return {
      totalSurveys,
      averages: {
        overallRating: parseFloat(parseFloat(avgRatings?.overall || '0').toFixed(2)),
        usabilityRating: parseFloat(parseFloat(avgRatings?.usability || '0').toFixed(2)),
        bookingRating: parseFloat(parseFloat(avgRatings?.booking || '0').toFixed(2)),
        uiRating: parseFloat(parseFloat(avgRatings?.ui || '0').toFixed(2)),
      },
      distribution,
      behaviorCorrelation: {
        lowRatingSessionAvg: parseFloat(parseFloat(correlationRaw?.lowRatingAvg || '0').toFixed(1)),
        highRatingSessionAvg: parseFloat(parseFloat(correlationRaw?.highRatingAvg || '0').toFixed(1)),
      },
      comments,
    };
  }
}
