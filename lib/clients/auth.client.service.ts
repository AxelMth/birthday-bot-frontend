import { ValidateApiKeyResponse, LoginResponse } from "@/lib/types";
import { authContract } from "birthday-bot-contracts";
import { initClient } from "@ts-rest/core";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

export const authClient = initClient(authContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
});

export class AuthClientService {
  static async validateToken(
    token: string,
  ): Promise<ValidateApiKeyResponse> {
    const response = await authClient.validate({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return { isAdmin: response.body?.isAdmin || false };
    }
    return { isAdmin: false };
  }

  static async login(
    username: string,
    password: string,
  ): Promise<LoginResponse> {
    const response = await authClient.login({
      body: { username, password },
    });

    if (response.status === 200) {
      return {
        token: response.body.token ?? "",
        username: response.body.username ?? "",
      };
    }

    throw new Error(
      response.status === 401
        ? "Invalid username or password"
        : "Login failed",
    );
  }
}
