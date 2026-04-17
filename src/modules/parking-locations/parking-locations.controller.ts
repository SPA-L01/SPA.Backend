import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { ParkingLocationsService } from './parking-locations.service';
import { CreateParkingLocationDto } from './dto/create-parking-location.dto';
import { UpdateParkingLocationDto } from './dto/update-parking-location.dto';
import { ParkingLocationQueryDto } from './dto/parking-location-query.dto';
import { CreateParkingSlotDto } from './dto/create-parking-slot.dto';
import { LocationStatus } from './enums/location-status.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

class UpdateStatusDto {
  @IsEnum(LocationStatus)
  status: LocationStatus;
}

@ApiTags('Parking Locations')
@Controller('parking-locations')
export class ParkingLocationsController {
  constructor(private readonly service: ParkingLocationsService) {}

  /**
   * GET /parking-locations
   * Lấy danh sách có filter + phân trang
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các điểm gửi xe' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách kết quả kèm phân trang' })
  findAll(@Query() query: ParkingLocationQueryDto) {
    return this.service.findAll(query);
  }

  /**
   * GET /parking-locations/nearby?lat=...&lng=...&radius=...
   * Tìm điểm gửi xe gần vị trí GPS
   * NOTE: đặt trước /:id để tránh conflict routing
   */
  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.service.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 5,
    );
  }

  /**
   * GET /parking-locations/:id
   * Chi tiết 1 điểm (kèm danh sách slots)
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  /**
   * POST /parking-locations
   * Tạo điểm gửi xe mới
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateParkingLocationDto) {
    return this.service.create(dto);
  }

  /**
   * PUT /parking-locations/:id
   * Cập nhật thông tin đầy đủ
   */
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParkingLocationDto,
  ) {
    return this.service.update(id, dto);
  }

  /**
   * PATCH /parking-locations/:id/status
   * Chỉ đổi trạng thái: active / inactive / maintenance
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateStatusDto,
  ) {
    return this.service.updateStatus(id, body.status);
  }

  /**
   * DELETE /parking-locations/:id
   * Soft delete
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  /**
   * GET /parking-locations/:id/slots
   * Lấy danh sách chỗ đậu của 1 điểm
   */
  @Get(':id/slots')
  getSlots(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getSlots(id);
  }

  /**
   * POST /parking-locations/:id/slots
   * Thêm nhiều chỗ đậu vào 1 điểm (nhận array)
   */
  @Post(':id/slots')
  @HttpCode(HttpStatus.CREATED)
  addSlots(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dtos: CreateParkingSlotDto[],
  ) {
    return this.service.addSlots(id, dtos);
  }
}
