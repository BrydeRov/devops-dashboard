import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CategoriesModule } from './categories/categories.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { AlertsModule } from './alerts/alerts.module';
import { MovementsModule } from './movements/movements.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.NODE_ENV === 'production'
        ? {
          url: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        }
        : {
          host: process.env.DATABASE_HOST || 'postgres',
          port: parseInt(process.env.DATABASE_PORT ?? '5432') || 5432,
          username: process.env.DATABASE_USER || 'user',
          password: process.env.DATABASE_PASSWORD || 'pswd',
          database: process.env.DATABASE_NAME || 'mydb',
        }),
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    DashboardModule,
    CategoriesModule,
    SuppliersModule,
    ProductsModule,
    AlertsModule,
    MovementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
