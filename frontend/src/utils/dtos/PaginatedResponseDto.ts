export interface PaginatedResponseDto<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}
