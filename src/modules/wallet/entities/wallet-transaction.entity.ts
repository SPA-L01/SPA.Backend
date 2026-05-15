import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@core/domain/base.entity';
import { Wallet } from './wallet.entity';
import { WalletTransactionStatus, WalletTransactionType } from '../enums/wallet-transaction.enum';

@Entity('wallet_transactions')
export class WalletTransaction extends BaseEntity {
  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ type: 'enum', enum: WalletTransactionType })
  type: WalletTransactionType;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'enum', enum: WalletTransactionStatus, default: WalletTransactionStatus.COMPLETED })
  status: WalletTransactionStatus;
}
