import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { WalletTransactionStatus, WalletTransactionType } from './enums/wallet-transaction.enum';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepo: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async createForUser(userId: string): Promise<Wallet> {
    const existing = await this.walletRepo.findOne({ where: { userId } });
    if (existing) return existing;

    const wallet = this.walletRepo.create({ userId, balance: 0 });
    return this.walletRepo.save(wallet);
  }

  async getOrCreateForUser(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { userId } });
    if (wallet) return wallet;
    return this.createForUser(userId);
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    const wallet = await this.getOrCreateForUser(userId);
    return this.transactionRepo.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async topUp(userId: string, amount: number) {
    return this.dataSource.transaction(async (manager) => {
      let wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        wallet = manager.create(Wallet, { userId, balance: 0 });
        wallet = await manager.save(Wallet, wallet);
      }

      wallet.balance += amount;
      const savedWallet = await manager.save(Wallet, wallet);

      const transaction = manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: WalletTransactionType.TOP_UP,
        amount,
        note: 'Mock top-up',
        status: WalletTransactionStatus.COMPLETED,
      });
      const savedTransaction = await manager.save(WalletTransaction, transaction);

      return {
        walletId: savedWallet.id,
        newBalance: savedWallet.balance,
        transaction: savedTransaction,
      };
    });
  }

  async createPayment(userId: string, amount: number, note?: string) {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.balance < amount) throw new NotFoundException('Insufficient balance');

      wallet.balance -= amount;
      const savedWallet = await manager.save(Wallet, wallet);
      const transaction = await manager.save(WalletTransaction, manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: WalletTransactionType.PAYMENT,
        amount,
        note: note ?? 'Parking payment',
        status: WalletTransactionStatus.COMPLETED,
      }));

      return { walletId: savedWallet.id, newBalance: savedWallet.balance, transaction };
    });
  }
}
