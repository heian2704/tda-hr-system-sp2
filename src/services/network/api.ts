import { API_BASE_URL } from "@/constants/api-base-url";

const responseHandler = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API request failed.");
  }
  return response.json();
};

const headerBuilder = (token?: string): HeadersInit => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

const apiCaller = async <T>({ endpoint, options }: ApiRequestEssentials<T>): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return responseHandler<T>(response);
  } catch (error) {
    throw error;
  }
};

export const apiGetRequestsHandler = async <T>({
  endpoint,
  token,
}: ApiGetAndDeleteRequestEssentials): Promise<T> => {
  const headers = headerBuilder(token);
  return apiCaller<T>({
    endpoint,
    options: {
      method: "GET",
      headers,
    },
  });
};

export const apiPostRequestsHandler = async <T, B = unknown>({
  endpoint,
  body,
  token,
}: ApiPostAndPatchRequestEssentials<B>): Promise<T> => {
  const headers = headerBuilder(token);
  return apiCaller<T>({
    endpoint,
    options: {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  });
};

export const apiPutRequestsHandler = async <T, B = unknown>({
  endpoint,
  body,
  token,
}: ApiPostAndPatchRequestEssentials<B>): Promise<T> => {
  const headers = headerBuilder(token);
  return apiCaller<T>({
    endpoint,
    options: {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    },
  });
};

export const apiDeleteRequestsHandler = async <T>({
  endpoint,
  token,
}: ApiGetAndDeleteRequestEssentials): Promise<T> => {
  const headers = headerBuilder(token);
  return apiCaller<T>({
    endpoint,
    options: {
      method: "DELETE",
      headers,
    },
  });
};

interface ApiRequestEssentials<T> {
  endpoint: string;
  options: RequestInit;
}

interface ApiGetAndDeleteRequestEssentials {
  endpoint: string;
  token?: string;
}

interface ApiPostAndPatchRequestEssentials<B = unknown> {
  endpoint: string;
  body: B;
  token?: string;
}
