import { Controller, Get, Post, Delete, Param, UseGuards, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from '@modules/auth/types/current-user.type';
import { FavouritesService } from './favourites.service';

@ApiTags('Favourites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user favourite parking locations' })
  getFavourites(@CurrentUser() user: CurrentUserType) {
    return this.favouritesService.getFavourites(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a parking location to favourites' })
  addFavourite(@CurrentUser() user: CurrentUserType, @Body('locationId') locationId: string) {
    return this.favouritesService.addFavourite(user.id, locationId);
  }

  @Delete(':locationId')
  @ApiOperation({ summary: 'Remove a parking location from favourites' })
  removeFavourite(@CurrentUser() user: CurrentUserType, @Param('locationId') locationId: string) {
    return this.favouritesService.removeFavourite(user.id, locationId);
  }

  @Get('check/:locationId')
  @ApiOperation({ summary: 'Check if a location is in favourites' })
  isFavourite(@CurrentUser() user: CurrentUserType, @Param('locationId') locationId: string) {
    return this.favouritesService.isFavourite(user.id, locationId);
  }
}
