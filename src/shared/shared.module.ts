import { HttpModule } from "@nestjs/axios";
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from "@nestjs/common";
import { CentralLogger } from "./loggerServices/centralLogger.service";
import { AxiosService } from "./httpServices/axios.service";

const httpServices = [AxiosService];

@Module({
    imports: [
        HttpModule,
        ConfigModule
       
    ],
    exports: [HttpModule, CentralLogger, ...httpServices],
    providers: [CentralLogger, ...httpServices]
})

export class SharedModule { 
    
}