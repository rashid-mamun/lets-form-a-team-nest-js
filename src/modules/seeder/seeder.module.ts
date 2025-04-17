import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { DataModule } from 'src/dataModules/data.module';
import { CentralLogger } from 'src/shared/loggerServices/centralLogger.service';

@Module({
    imports: [DataModule],
    providers: [SeederService, CentralLogger],
    controllers: [SeederController],
})
export class SeederModule {}
