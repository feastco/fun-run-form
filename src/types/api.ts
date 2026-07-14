export interface ApiResponse<T> {
  status: 'success'
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    total_pages?: number
  }
}

export interface ApiErrorResponse {
  status: 'error'
  code: number
  message: string
  errors?: { field: string; message: string }[]
}
