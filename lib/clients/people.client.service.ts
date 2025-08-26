import { initClient } from "@ts-rest/core";
import { peopleContract } from "birthday-bot-contracts";
import { Response } from "./response.type";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
export const peopleClient = initClient(peopleContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
});

type Person = {
  id: number;
  name: string;
  birthDate: Date | null;
  application: string;
  applicationMetadata: Record<string, string | number | boolean>;
};

type PaginatedPeopleResponse = {
  people: Person[];
  count: number;
};

export class PeopleClientService {
  constructor(private readonly client: typeof peopleClient) {}

  async getPaginatedPeople(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string,
    sortField?: "name" | "birthDate",
    sortDirection?: "asc" | "desc",
  ): Promise<Response<PaginatedPeopleResponse | null>> {
    const response = await this.client.getPaginatedPeople({
      query: {
        pageNumber,
        pageSize,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(sortField ? { sortBy: sortField } : {}),
        ...(sortField ? { sortOrder: sortDirection } : {}),
      },
    });
    if (response.status === 200) {
      return {
        data: {
          people:
            response.body?.people?.map((person) => ({
              id: person.id ?? 0,
              name: person.name ?? "",
              birthDate: person.birthDate ?? null,
              application: person.application ?? "",
              applicationMetadata: person.applicationMetadata ?? {},
            })) ?? [],
          count: response.body?.count ?? 0,
        },
        error: null,
      };
    }
    if (response.status === 500) {
      return {
        data: null,
        error: response.body?.error ?? "Failed to get people",
      };
    }
    return {
      data: {
        people: [],
        count: 0,
      },
      error: "Unknown error",
    };
  }

  async createPerson(person: Person): Promise<Response<Person | null>> {
    const response = await this.client.createPerson({
      body: {
        name: person.name,
        // TODO: handle null birthDate
        birthDate: person.birthDate ? new Date(person.birthDate) : new Date(),
        application: person.application,
        applicationMetadata: person.applicationMetadata,
      },
    });
    if (response.status === 200) {
      return {
        data: {
          id: response.body?.id ?? 0,
          name: response.body?.name ?? "",
          birthDate: response.body?.birthDate ?? new Date(),
          application: response.body?.application ?? "",
          applicationMetadata: response.body?.applicationMetadata ?? {},
        },
        error: null,
      };
    }
    if (response.status === 500) {
      return {
        data: null,
        error: response.body?.error ?? "Failed to create person",
      };
    }
    return {
      data: null,
      error: "Unknown error",
    };
  }

  async updatePerson(person: Person): Promise<Response<Person | null>> {
    const response = await this.client.updatePersonById({
      params: { id: person.id },
      body: {
        name: person.name,
        // TODO: handle null birthDate
        birthDate: person.birthDate ? new Date(person.birthDate) : new Date(),
        application: person.application,
        applicationMetadata: person.applicationMetadata,
      },
    });
    if (response.status === 200) {
      return {
        data: {
          id: response.body?.id ?? 0,
          name: response.body?.name ?? "",
          birthDate: response.body?.birthDate ?? null,
          application: response.body?.application ?? "",
          applicationMetadata: response.body?.applicationMetadata ?? {},
        },
        error: null,
      };
    }
    if (response.status === 500) {
      return {
        data: null,
        error: response.body?.error ?? "Failed to update person",
      };
    }
    return {
      data: null,
      error: "Unknown error",
    };
  }

  async deletePerson(id: number): Promise<Response<boolean>> {
    const response = await this.client.deletePersonById({
      params: { id },
    });
    if (response.status === 200) {
      return {
        data: true,
        error: null,
      };
    }
    if (response.status === 404) {
      return {
        data: false,
        error: "Person not found",
      };
    }
    return {
      data: false,
      error: "Unknown error",
    };
  }
}

export const peopleClientService = new PeopleClientService(peopleClient);
