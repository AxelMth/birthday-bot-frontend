import { birthdayContract } from "birthday-bot-contracts";
import { initClient } from "@ts-rest/core";
import { Response } from "./response.type";

type Person = {
  name: string;
  birthDate: string;
};

type NextBirthdaysResponse = {
  people: Person[];
};

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
export const birthdayClient = initClient(birthdayContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
});

export class BirthdaysClientService {
  constructor(private readonly client: typeof birthdayClient) {}

  async getNextBirthdays(
    date: string,
  ): Promise<Response<NextBirthdaysResponse>> {
    const response = await this.client.getNextBirthdays({
      query: { date },
    });
    if (response.status === 200) {
      return {
        data: {
          people:
            response.body?.people?.map((person) => ({
              name: person.name ?? "",
              birthDate: person.birthDate?.toISOString() ?? "",
            })) ?? [],
        },
        error: null,
      };
    }
    if (response.status === 500) {
      return {
        data: {
          people: [],
        },
        error: response.body?.error ?? "Failed to get next birthdays",
      };
    }
    return {
      data: {
        people: [],
      },
      error: "Unknown error",
    };
  }
}

export const birthdaysClientService = new BirthdaysClientService(
  birthdayClient,
);
