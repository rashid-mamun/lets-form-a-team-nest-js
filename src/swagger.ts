import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder().setTitle('Lets-form-a-team API').addBearerAuth();

    const api = options.build();

    const document = SwaggerModule.createDocument(app, api);
    SwaggerModule.setup('api-doc', app, document, {
        customSiteTitle: 'Lets-form-a-team api documentation',
        swaggerOptions: {
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            persistAuthorization: true, // preserve token after refresh
            docExpansion: false,
        },
    });
}