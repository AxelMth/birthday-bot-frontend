import { communicationContract } from "birthday-bot-contracts";
import { initClient } from "@ts-rest/core";
import { Response } from "./response.type";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
export const communicationClient = initClient(communicationContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
});

type Communication = {
  id: number;
  personName: string;
  applicationName: string;
  message: string;
  sentAt: Date;
};

type PaginatedCommunicationsResponse = {
  communications: Communication[];
  total: number;
};

export class CommunicationsClientService {
  constructor(private readonly client: typeof communicationClient) {}

  async getCommunications(
    pageNumber: number,
    pageSize: number,
  ): Promise<Response<PaginatedCommunicationsResponse>> {
    const response = await this.client.getPaginatedCommunications({
      query: { pageNumber, pageSize },
    });
    if (response.status === 200) {
      return {
        data: {
          communications:
            response.body?.communications?.map((communication) => ({
              id: communication.id ?? 0,
              personName: communication.personName ?? "",
              applicationName: communication.applicationName ?? "",
              message: communication.message ?? "",
              sentAt: communication.sentAt ?? new Date(),
            })) ?? [],
          total: response.body?.count ?? 0,
        },
        error: null,
      };
    }
    if (response.status === 500) {
      return {
        data: {
          communications: [],
          total: 0,
        },
        error: response.body?.error ?? "Failed to get communications",
      };
    }
    return {
      data: {
        communications: [],
        total: 0,
      },
      error: "Unknown error",
    };
  }
}

export const communicationsClientService = new CommunicationsClientService(
  communicationClient,
);
