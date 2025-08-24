import { ProductInterface } from "@/domain/interfaces/product/ProductInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateProductDto } from "@/domain/models/product/create-product.dto";
import { Product } from "@/domain/models/product/get-product.dto";
import { UpdateProductDto } from "@/domain/models/product/update-product.dto";

export class GetAllProductsUseCase {
    constructor(private productInterface: ProductInterface) {}

    async execute(): Promise<Product[]> {
        return this.productInterface.getAllProducts();
    }
}

export class GetProductByIdUseCase {
    constructor(private employeeInterface: ProductInterface) {}

    execute(idToken: TokenedRequest): Promise<Product> {
        return this.employeeInterface.getProductById(idToken.id);
    }
}

export class CreateProductUseCase {
    constructor(private productInterface: ProductInterface) {}

    execute(idToken: BearerTokenedRequest, productData: CreateProductDto): Promise<Product> {
        return this.productInterface.createProduct(idToken, productData);
    }
}

export class UpdateProductUseCase {
    constructor(private productInterface: ProductInterface) {}

    execute(idToken: TokenedRequest, productData: UpdateProductDto): Promise<Product> {
        return this.productInterface.updateProduct(idToken, productData);
    }
}

export class DeleteProductUseCase {
    constructor(private productInterface: ProductInterface) {}

    execute(idToken: TokenedRequest): Promise<Product> {
        return this.productInterface.deleteProduct(idToken);
    }
}