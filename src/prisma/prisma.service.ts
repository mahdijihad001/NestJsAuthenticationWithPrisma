import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from "pg"
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            // এই ত্রুটিটি আর আসার কথা না কারণ আপনি main.ts-এ dotenv কনফিগার করেছেন
            throw new Error('DATABASE_URL is not set');
        }

        // Fix: Pass an object { connectionString } to pg.Pool constructor
        const pool = new pg.Pool({ connectionString });

        // Pass the Pool instance to the adapter
        const adapter = new PrismaPg(pool);

        super({
            adapter,
        });
    }

    async onModuleInit() {
        // connect() কল করার প্রয়োজন নেই যদি আপনি adapter ব্যবহার করেন
        // await this.$connect(); 
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
