import { peopleClient } from "@/lib/api-client";
import { Response } from "./response.type";

type Person = {
  id: number;
  name: string;
  birthDate: Date | null;
  application: string;
  applicationMetadata: Record<string, string | number | boolean>;
  groupName?: string | null;
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
              groupName: person.groupName,
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
      data: { people: [], count: 0 },
      error: "Unknown error",
    };
  }
}

export const peopleClientService = new PeopleClientService(peopleClient);
