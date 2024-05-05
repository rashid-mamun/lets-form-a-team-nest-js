import { Injectable } from '@nestjs/common';
import { CentralLogger } from './shared/loggerServices/centralLogger.service';


@Injectable()
export class AppService {
  constructor(private readonly logger: CentralLogger) {}

}
