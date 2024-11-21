import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ConfigService } from '@nestjs/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { AppModule } from './app.module';
import { CustomLogger } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });
  const logger = app.get(CustomLogger);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 4000;

  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(logger);
  app.useGlobalFilters(app.get(HttpAdapterHost));

  const fileAPI = fs.readFileSync(
    path.join(__dirname, '../doc/api.yaml'),
    'utf8',
  );
  const docfileAPI = yaml.load(fileAPI);

  SwaggerModule.setup('doc', app, docfileAPI as OpenAPIObject);

  await app.listen(PORT, () => console.log('App is running on the port', PORT));
}
bootstrap();
