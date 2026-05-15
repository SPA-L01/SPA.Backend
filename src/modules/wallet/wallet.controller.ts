import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from '@modules/auth/types/current-user.type';
import { WalletService } from './wallet.service';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user wallet' })
  getMyWallet(@CurrentUser() user: CurrentUserType) {
    return this.walletService.getOrCreateForUser(user.id);
  }

  @Get('me/transactions')
  @ApiOperation({ summary: 'Get current user wallet transactions' })
  getMyTransactions(@CurrentUser() user: CurrentUserType) {
    return this.walletService.getTransactions(user.id);
  }

  @Post('me/top-up')
  @ApiOperation({ summary: 'Mock top-up current user wallet' })
  topUp(@CurrentUser() user: CurrentUserType, @Body() dto: TopUpWalletDto) {
    return this.walletService.topUp(user.id, dto.amount);
  }
}
