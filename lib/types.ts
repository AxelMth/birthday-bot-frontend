export type Application = "slack" | "none"


export interface CreatePersonRequest {
  name: string
  birthdate: string
  application: string
  metadata?: Record<string, unknown>
}
