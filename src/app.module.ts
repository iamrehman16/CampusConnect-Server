import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ResourceModule } from './modules/resource/resource.module';
import { StorageModule } from './modules/storage/storage.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PostModule } from './modules/post/post.module';
import { AiModule } from './modules/ai/ai.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    MongooseModule.forRootAsync({
      inject:[ConfigService],
      useFactory:(configService:ConfigService)=>({
        uri: configService.get<string>("MONGO_URI_Local")
      })
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    ResourceModule,
    StorageModule,
    DashboardModule,
    PostModule,
    AiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
