import { ProductInterface } from "@/domain/interfaces/product/ProductInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateProductDto } from "@/domain/models/product/create-product.dto";
import { Product } from "@/domain/models/product/get-product.dto";
import { UpdateProductDto } from "@/domain/models/product/update-product.dto";
import { apiDeleteRequestsHandler, apiGetRequestsHandler, apiPatchRequestsHandler, apiPostRequestsHandler } from "@/services/network/api";

export class ProductInterfaceImpl implements ProductInterface {
    getAllProducts(): Promise<Product[]> {
        return apiGetRequestsHandler<Product[]>({
            endpoint: "/product"
        });
    }
    getProductById(id: string): Promise<Product> {
        return apiGetRequestsHandler<Product>({
            endpoint: `/product/${id}`
        });
    }
    createProduct(token: BearerTokenedRequest, createProductDto: CreateProductDto): Promise<Product> {
        return apiPostRequestsHandler<Product>({
            endpoint: "/product",
            body: createProductDto,
            token: token.token
        });
    }
    updateProduct(idToken: TokenedRequest, updateProductDto: UpdateProductDto): Promise<Product> {
        return apiPatchRequestsHandler<Product>({
            endpoint: `/product/${idToken}`,
            body: updateProductDto,
            token: idToken.token
        });
    }

    deleteProduct(idToken: TokenedRequest): Promise<Product> {
        return apiDeleteRequestsHandler<Product>({
            endpoint: `/product/${idToken.id}`,
            token: idToken.token
        });
    }
    
}