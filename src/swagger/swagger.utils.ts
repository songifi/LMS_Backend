import type { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

/**
 * Sets up Swagger documentation for the application
 * @param app NestJS application instance
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Learning Management System API")
    .setDescription("API documentation for the Learning Management System")
    .setVersion("1.0")
    .addTag("auth", "Authentication endpoints")
    .addTag("users", "User management endpoints")
    .addTag("faculty", "Faculty management endpoints")
    .addTag("course-management", "Course management endpoints")
    .addTag("content", "Content management endpoints")
    .addTag("assessment", "Assessment endpoints")
    .addTag("forum", "Discussion forum endpoints")
    .addTag("calendar", "Calendar endpoints")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  })
}
