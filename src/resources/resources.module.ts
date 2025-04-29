import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Resource } from "./entities/resource.entity"
import { ResourceCategory } from "./entities/resource-category.entity"
import { ResourceVersion } from "./entities/resource-version.entity"
import { ResourceTag } from "./entities/resource-tag.entity"
import { ResourceAccess } from "./entities/resource-access.entity"
import { ResourceUsage } from "./entities/resource-usage.entity"
import { ResourceRecommendation } from "./entities/resource-recommendation.entity"
import { ResourcesController } from "./controllers/resources.controller"
import { CategoriesController } from "./controllers/categories.controller"
import { MulterModule } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { extname } from "path"
import { ResourcesService } from "./providers/resources.service"
import { CategoriesService } from "./providers/categories.service"
import { VersionsService } from "./providers/versions.service"
import { SearchService } from "./providers/search.service"
import { RecommendationsService } from "./providers/recommendations.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resource,
      ResourceCategory,
      ResourceVersion,
      ResourceTag,
      ResourceAccess,
      ResourceUsage,
      ResourceRecommendation,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
        },
      }),
    }),
  ],
  controllers: [ResourcesController, CategoriesController],
  providers: [ResourcesService, CategoriesService, VersionsService, SearchService, RecommendationsService],
  exports: [ResourcesService, CategoriesService, VersionsService, SearchService, RecommendationsService],
})
export class ResourcesModule {}
