import { Controller, Post, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeederService } from './seeder.service';
import { CentralLogger } from 'src/shared/loggerServices/centralLogger.service';

@ApiTags('Seeder')
@Controller('seeder')
export class SeederController {
    constructor(
        private readonly seederService: SeederService,
        private readonly logger: CentralLogger,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Seed the database with user types and Super Admin' })
    @ApiResponse({ status: 200, description: 'Database seeded successfully' })
    @ApiResponse({ status: 500, description: 'Database seeding failed' })
    async seedDatabase() {
        try {
            const result = await this.seederService.seedDatabase();
            this.logger.info('[Seeder] Database seeded successfully', { result });
            return {
                message: 'Database seeded successfully',
                data: result,
            };
        } catch (error) {
            this.logger.error('[Seeder] Database seeding failed', error);

            throw new InternalServerErrorException({
                success: false,
                message: 'Database seeding failed',
                errors: error.message,
            });
        }
    }
}
