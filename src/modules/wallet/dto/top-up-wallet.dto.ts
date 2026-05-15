import { IsInt, Min } from 'class-validator';

export class TopUpWalletDto {
  @IsInt()
  @Min(1000)
  amount: number;
}
