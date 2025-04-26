export interface PaginationParams {
    page: number;
    limit: number;
  }
  
  export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }