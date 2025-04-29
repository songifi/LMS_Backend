import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, In } from "typeorm"
import { Product, ProductType } from "../entities/product.entity"
import type { CreateProductDto } from "../dto/create-product.dto"

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(filters: { type?: string; isSubscribable?: boolean } = {}): Promise<Product[]> {
    const query: any = {}

    if (filters.type) {
      query.type = filters.type
    }

    if (filters.isSubscribable !== undefined) {
      query.isSubscribable = filters.isSubscribable
    }

    return this.productRepository.find({
      where: query,
      relations: ["bundledProducts"],
    })
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["bundledProducts"],
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      type: createProductDto.type,
      isSubscribable: createProductDto.isSubscribable ?? false,
      isActive: createProductDto.isActive ?? true,
    })

    // Handle bundle products if provided
    if (createProductDto.type === ProductType.BUNDLE && createProductDto.bundledProductIds?.length) {
      const bundledProducts = await this.productRepository.find({
        where: { id: In(createProductDto.bundledProductIds) },
      })

      if (bundledProducts.length !== createProductDto.bundledProductIds.length) {
        throw new BadRequestException("One or more bundled products not found")
      }

      product.bundledProducts = bundledProducts
    }

    return this.productRepository.save(product)
  }
}
