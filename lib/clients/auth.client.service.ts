import { ValidateApiKeyResponse } from "@/lib/types";

import { authContract } from "birthday-bot-contracts";
import { initClient } from "@ts-rest/core";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
export const authClient = initClient(authContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
});
export class AuthClientService {
  /**
   * Validates an API key with the backend
   * @param apiKey The API key to validate
   * @returns Promise containing validation result with admin status
   */
  static async validateApiKey(apiKey: string): Promise<ValidateApiKeyResponse> {
    const response = await authClient.validate({
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (response.status === 200) {
      return {
        isAdmin: response.body?.isAdmin || false,
      };
    }
    return {
      isAdmin: false,
    };
  }
}
