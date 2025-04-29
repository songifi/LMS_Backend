import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Subscription, SubscriptionStatus, BillingPeriod } from "../entities/subscription.entity"
import { Product } from "../entities/product.entity"
import type { CreateSubscriptionDto } from "../dto/create-subscription.dto"

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  async findAllByUser(userId: string, status?: string): Promise<Subscription[]> {
    const query: any = { userId }

    if (status) {
      query.status = status
    }

    return this.subscriptionRepository.find({
      where: query,
      relations: ["product"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ["product"],
    })

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`)
    }

    return subscription
  }

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Find the product
    const product = await this.productRepository.findOne({
      where: { id: createSubscriptionDto.productId },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${createSubscriptionDto.productId} not found`)
    }

    if (!product.isSubscribable) {
      throw new BadRequestException(
        `Product with ID ${createSubscriptionDto.productId} is not available for subscription`,
      )
    }

    // Calculate dates
    const startDate = createSubscriptionDto.startDate || new Date()
    let nextBillingDate: Date

    switch (createSubscriptionDto.billingPeriod) {
      case BillingPeriod.MONTHLY:
        nextBillingDate = new Date(startDate)
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
        break
      case BillingPeriod.QUARTERLY:
        nextBillingDate = new Date(startDate)
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
        break
      case BillingPeriod.ANNUAL:
        nextBillingDate = new Date(startDate)
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
        break
      default:
        nextBillingDate = new Date(startDate)
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    }

    // Create the subscription
    const subscription = this.subscriptionRepository.create({
      userId: createSubscriptionDto.userId,
      productId: product.id,
      status: SubscriptionStatus.PENDING,
      billingPeriod: createSubscriptionDto.billingPeriod,
      price: createSubscriptionDto.price || product.price,
      startDate,
      nextBillingDate,
      externalSubscriptionId: createSubscriptionDto.externalSubscriptionId,
    })

    return this.subscriptionRepository.save(subscription)
  }
}
