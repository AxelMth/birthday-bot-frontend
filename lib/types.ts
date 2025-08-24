export type Application = "slack" | "none";

export interface CreatePersonRequest {
  name: string;
  birthDate: string;
  application: string;
  metadata?: Record<string, unknown>;
}
