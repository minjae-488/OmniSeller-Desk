import { ProductService } from '../product.service';
import { prisma } from '../../../core/services/prisma.service';
import { SearchProductDto } from '../dtos/search-product.dto';

// Prisma 모킹
jest.mock('../../../core/services/prisma.service', () => ({
    prisma: {
        product: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

describe('ProductService - Search and Filter', () => {
    let productService: ProductService;
    const mockUserId = 'user-123';

    beforeEach(() => {
        productService = new ProductService();
        jest.clearAllMocks();
    });

    describe('searchProducts', () => {
        const mockProducts = [
            {
                id: '1',
                name: 'iPhone 15',
                description: 'Latest Apple smartphone',
                price: 1200,
                stock: 10,
                category: 'Electronics',
                imageUrl: null,
                userId: mockUserId,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
            {
                id: '2',
                name: 'Samsung Galaxy S24',
                description: 'Latest Samsung smartphone',
                price: 1100,
                stock: 5,
                category: 'Electronics',
                imageUrl: null,
                userId: mockUserId,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            },
        ];

        it('should search products by name', async () => {
            const searchDto: SearchProductDto = {
                search: 'iPhone',
            };

            (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProducts[0]]);
            (prisma.product.count as jest.Mock).mockResolvedValue(1);

            const result = await productService.searchProducts(mockUserId, searchDto);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('iPhone 15');
            expect(result.total).toBe(1);
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: mockUserId,
                        OR: expect.arrayContaining([
                            expect.objectContaining({ name: expect.objectContaining({ contains: 'iPhone' }) }),
                        ]),
                    }),
                })
            );
        });

        it('should filter products by category', async () => {
            const searchDto: SearchProductDto = {
                category: 'Electronics',
            };

            (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
            (prisma.product.count as jest.Mock).mockResolvedValue(2);

            const result = await productService.searchProducts(mockUserId, searchDto);

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: mockUserId,
                        category: 'Electronics',
                    }),
                })
            );
        });

        it('should filter products by price range', async () => {
            const searchDto: SearchProductDto = {
                minPrice: 1000,
                maxPrice: 1150,
            };

            (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProducts[1]]);
            (prisma.product.count as jest.Mock).mockResolvedValue(1);

            const result = await productService.searchProducts(mockUserId, searchDto);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].price).toBe(1100);
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: mockUserId,
                        price: {
                            gte: 1000,
                            lte: 1150,
                        },
                    }),
                })
            );
        });

        it('should filter products by stock availability', async () => {
            const searchDto: SearchProductDto = {
                stockFilter: 'inStock',
            };

            (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
            (prisma.product.count as jest.Mock).mockResolvedValue(2);

            await productService.searchProducts(mockUserId, searchDto);

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: mockUserId,
                        stock: { gt: 0 },
                    }),
                })
            );
        });

        it('should filter out of stock products', async () => {
            const searchDto: SearchProductDto = {
                stockFilter: 'outOfStock',
            };

            (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.product.count as jest.Mock).mockResolvedValue(0);

            await productService.searchProducts(mockUserId, searchDto);

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: mockUserId,
                        stock: { lte: 0 },
                    }),
                })
            );
        });

        it('should sort products by price ascending', async () => {
            const searchDto: SearchProductDto = {
                sortBy: 'price',
                sortOrder: 'asc',
            };

            (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
            (prisma.product.count as jest.Mock).mockResolvedValue(2);

            await productService.searchProducts(mockUserId, searchDto);

            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { price: 'asc' },
                })
            );
        });

        it('should paginate results', async () => {
            const searchDto: SearchProductDto = {
                page: 2,
                limit: 10,
            };

            (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.product.count as jest.Mock).mockResolvedValue(25);

            const result = await productService.searchProducts(mockUserId, searchDto);

            expect(result.page).toBe(2);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(3);
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10,
                    take: 10,
                })
            );
        });

        it('should combine multiple filters', async () => {
            const searchDto: SearchProductDto = {
                search: 'phone',
                category: 'Electronics',
                minPrice: 1000,
                maxPrice: 1200,
                stockFilter: 'inStock',
                sortBy: 'price',
                sortOrder: 'desc',
                page: 1,
                limit: 20,
            };

            (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
            (prisma.product.count as jest.Mock).mockResolvedValue(2);

            const result = await productService.searchProducts(mockUserId, searchDto);

            expect(result.data).toHaveLength(2);
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: mockUserId,
                        category: 'Electronics',
                        price: {
                            gte: 1000,
                            lte: 1200,
                        },
                        stock: { gt: 0 },
                        OR: expect.any(Array),
                    }),
                    orderBy: { price: 'desc' },
                    skip: 0,
                    take: 20,
                })
            );
        });

        it('should use default pagination values', async () => {
            const searchDto: SearchProductDto = {};

            (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
            (prisma.product.count as jest.Mock).mockResolvedValue(2);

            const result = await productService.searchProducts(mockUserId, searchDto);

            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(prisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 0,
                    take: 10,
                })
            );
        });
    });
});
