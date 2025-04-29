import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

// Entities
import { Product } from "./entities/product.entity"
import { Subscription } from "./entities/subscription.entity"
import { Order } from "./entities/order.entity"
import { Discount } from "./entities/discount.entity"
import { RevenueShare } from "./entities/revenue-share.entity"
import { FinancialReport } from "./entities/financial-report.entity"

// Controllers
import { ProductController } from "./controllers/product.controller"
import { OrderController } from "./controllers/order.controller"
import { SubscriptionController } from "./controllers/subscription.controller"
import { DiscountController } from "./controllers/discount.controller"
import { ProductService } from "./providers/product.service"
import { OrderService } from "./providers/order.service"
import { SubscriptionService } from "./providers/subscription.service"
import { DiscountService } from "./providers/discount.service"
import { Payment } from "./entities/payment.entity"

// Services

@Module({
  imports: [TypeOrmModule.forFeature([Product, Subscription, Order, Payment, Discount, RevenueShare, FinancialReport])],
  controllers: [ProductController, OrderController, SubscriptionController, DiscountController],
  providers: [ProductService, OrderService, SubscriptionService, DiscountService],
  exports: [ProductService, OrderService, SubscriptionService, DiscountService],
})
export class EcommerceModule {}
