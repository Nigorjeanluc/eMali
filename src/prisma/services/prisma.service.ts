import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
      .then(() => {
        console.log('Connected to database');
      })
      .catch((err) => {
        console.log('Error connecting to database', err);
      });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
