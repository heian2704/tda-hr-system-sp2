import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateProductDto } from "@/domain/models/product/create-product.dto";
import { Product } from "@/domain/models/product/get-product.dto";
import { UpdateProductDto } from "@/domain/models/product/update-product.dto";

export interface ProductInterface {
    getAllProducts(): Promise<Product[]>;
    getProductById(id: string): Promise<Product>;
    createProduct(token: BearerTokenedRequest, createProductDto: CreateProductDto): Promise<Product>;
    updateProduct(idToken: TokenedRequest, updateProductDto: UpdateProductDto): Promise<Product>;
    deleteProduct(idToken: TokenedRequest): Promise<Product>;
}