import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DataModule } from 'src/dataModules/data.module';
import { CentralLogger } from 'src/shared/loggerServices/centralLogger.service';

@Module({
  imports: [DataModule],
  providers: [UserService, CentralLogger],
  controllers: [UserController]
})
export class UserModule { }
