import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: 'Product name is required' })
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0, { message: 'Price must be greater than or equal to 0' })
    price!: number;

    @IsNumber()
    @IsOptional()
    @Min(0, { message: 'Stock must be greater than or equal to 0' })
    stock?: number;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}
