import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe, VersioningType } from "@nestjs/common"
import helmet from "helmet";
import compression from "compression";
import { ConfigService } from "@nestjs/config"
import { QueryLoggerInterceptor } from "./database/query-logger.interceptor"
import { setupSwagger } from "./swagger/swagger.utils"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Enable CORS
  app.enableCors()

  // Use Helmet for security headers
  app.use(helmet())

  // Use compression for response
  app.use(compression())

  // Add query logger interceptor
  app.useGlobalInterceptors(new QueryLoggerInterceptor(configService))

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  })

  // Set up Swagger documentation
  setupSwagger(app)

  // Start the server
  const port = configService.get("PORT") || 3000
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
  console.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`)
}
bootstrap()
