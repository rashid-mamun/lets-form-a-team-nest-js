
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { DataModule } from 'src/dataModules/data.module';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { TokenService } from './token.service';


@Module({
  imports: [
    DataModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    ConfigModule,
  ],
  providers: [AuthService, JwtStrategy, TokenService, LocalStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
