import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Order, OrderStatus } from "../entities/order.entity";
import { Product } from "../entities/product.entity";
import { Discount } from "../entities/discount.entity";
import type { CreateOrderDto } from "../dto/create-order.dto";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  async findAllByUser(userId: string, status?: string): Promise<Order[]> {
    const query: any = { userId };

    if (status) {
      query.status = status;
    }

    return this.orderRepository.find({
      where: query,
      relations: ["product", "discount", "payments"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["product", "discount", "payments"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const product = await this.productRepository.findOne({
      where: { id: createOrderDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${createOrderDto.productId} not found`);
    }

    const originalPrice = product.price;
    let finalPrice = originalPrice;
    let discount: Discount | null = null;

    if (createOrderDto.discountCode) {
      discount = await this.discountRepository.findOne({
        where: { code: createOrderDto.discountCode, isActive: true },
      }) as Discount | null;

      if (!discount) {
        throw new BadRequestException(`Invalid or inactive discount code: ${createOrderDto.discountCode}`);
      }

      const now = new Date();

      if (discount.startDate > now || (discount.endDate && discount.endDate < now)) {
        throw new BadRequestException("Discount code is not valid at this time");
      }

      if (discount.maxUses && discount.usedCount >= discount.maxUses) {
        throw new BadRequestException("Discount code has reached maximum usage");
      }

      // Apply discount
      if (discount.type === "percentage") {
        finalPrice = originalPrice - (originalPrice * discount.value) / 100;
      } else {
        finalPrice = originalPrice - discount.value;
        if (finalPrice < 0) finalPrice = 0;
      }

      // Increment discount usage
      await this.discountRepository.update(discount.id, {
        usedCount: discount.usedCount + 1,
      });
    }

    const taxAmount = createOrderDto.taxAmount || 0;
    finalPrice += taxAmount;

    const order = this.orderRepository.create({
      userId: createOrderDto.userId,
      productId: product.id,
      originalPrice,
      finalPrice,
      taxAmount,
      status: OrderStatus.PENDING,
      discountId: discount?.id ?? null,
      subscriptionId: createOrderDto.subscriptionId,
    });

    return this.orderRepository.save(order);
  }
}
