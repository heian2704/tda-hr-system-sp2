export interface BearerTokenedRequest {
  token: string;
}

export interface TokenedRequest extends BearerTokenedRequest {
  id: string;
}