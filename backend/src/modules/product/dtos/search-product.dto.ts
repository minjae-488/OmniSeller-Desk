import { IsString, IsOptional, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchProductDto {
    // 검색어 (상품명 또는 설명에서 검색)
    @IsString()
    @IsOptional()
    search?: string;

    // 카테고리 필터
    @IsString()
    @IsOptional()
    category?: string;

    // 최소 가격
    @IsNumber()
    @IsOptional()
    @Min(0, { message: 'Minimum price must be greater than or equal to 0' })
    @Type(() => Number)
    minPrice?: number;

    // 최대 가격
    @IsNumber()
    @IsOptional()
    @Min(0, { message: 'Maximum price must be greater than or equal to 0' })
    @Type(() => Number)
    maxPrice?: number;

    // 재고 필터 (재고 있음/없음)
    @IsString()
    @IsOptional()
    @IsIn(['inStock', 'outOfStock', 'all'], { message: 'Stock filter must be one of: inStock, outOfStock, all' })
    stockFilter?: 'inStock' | 'outOfStock' | 'all';

    // 정렬 기준
    @IsString()
    @IsOptional()
    @IsIn(['name', 'price', 'stock', 'createdAt'], { message: 'Sort by must be one of: name, price, stock, createdAt' })
    sortBy?: 'name' | 'price' | 'stock' | 'createdAt';

    // 정렬 순서
    @IsString()
    @IsOptional()
    @IsIn(['asc', 'desc'], { message: 'Sort order must be one of: asc, desc' })
    sortOrder?: 'asc' | 'desc';

    // 페이지 번호 (1부터 시작)
    @IsNumber()
    @IsOptional()
    @Min(1, { message: 'Page must be greater than or equal to 1' })
    @Type(() => Number)
    page?: number;

    // 페이지당 항목 수
    @IsNumber()
    @IsOptional()
    @Min(1, { message: 'Limit must be greater than or equal to 1' })
    @Type(() => Number)
    limit?: number;
}
