import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Discount } from "../entities/discount.entity";
import { CreateDiscountDto } from "../dto/create-ecommerce.dto";

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  async findAll(): Promise<Discount[]> {
    return this.discountRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findByCode(code: string): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { code },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with code ${code} not found`);
    }

    return discount;
  }

  async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    const existingDiscount = await this.discountRepository.findOne({
      where: { code: createDiscountDto.code },
    });

    if (existingDiscount) {
      throw new BadRequestException(`Discount code ${createDiscountDto.code} already exists`);
    }

    if (createDiscountDto.endDate && createDiscountDto.startDate > createDiscountDto.endDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const discount = this.discountRepository.create({
      code: createDiscountDto.code,
      description: createDiscountDto.description,
      type: createDiscountDto.type,
      value: createDiscountDto.value,
      startDate: createDiscountDto.startDate,
      endDate: createDiscountDto.endDate,
      maxUses: createDiscountDto.maxUses,
      isActive: createDiscountDto.isActive ?? true,
      usedCount: 0,
    });

    return this.discountRepository.save(discount);
  }
}
