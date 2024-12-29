import { Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
    constructor(private readonly seederService: SeederService) { }

    @Post('')
    async seedDatabase(@Res() res: Response): Promise<void> {

        const result = await this.seederService.seedDatabase();
        if (result) {
            res.status(HttpStatus.ACCEPTED).send({ message: 'Database seeded successfully' });
        }
        else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Database seeding failed' });
        }

    }
}
