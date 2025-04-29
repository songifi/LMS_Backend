import { PartialType } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-ecommerce.dto';

export class UpdateEcommerceDto extends PartialType(CreateDiscountDto) {}
