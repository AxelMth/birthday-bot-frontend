export interface Person {
  id: number
  name: string
  birthdate: Date
  application: string
  metadata: Record<string, unknown>
  communications: Array<{
    application: Application
    metadata: Record<string, string> | null
  }>
}

export type Application = "slack" | "none"

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreatePersonRequest {
  name: string
  birthdate: string
  application: string
  metadata?: Record<string, unknown>
}

export interface UpdatePersonRequest extends CreatePersonRequest {
  id: number
}
