import { ValidateApiKeyResponse } from "@/lib/types";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

export class AuthClientService {
  /**
   * Validates an API key with the backend
   * @param apiKey The API key to validate
   * @returns Promise containing validation result with admin status
   */
  static async validateApiKey(apiKey: string): Promise<ValidateApiKeyResponse> {
    try {
      const response = await fetch(`${baseUrl}/auth/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        isAdmin: result.isAdmin || false,
      };
    } catch (error) {
      console.error("API key validation error:", error);
      throw new Error("Failed to validate API key");
    }
  }
}
