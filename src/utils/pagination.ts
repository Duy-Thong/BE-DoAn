/**
 * Pagination utility functions
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
  defaultLimit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginationUtils {
  /**
   * Parse pagination parameters from query
   */
  static parsePagination(
    query: any,
    options: PaginationOptions = {}
  ): { page: number; limit: number; skip: number } {
    const {
      maxLimit = 100,
      defaultLimit = 10,
    } = options;

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(
      Math.max(1, parseInt(query.limit || defaultLimit.toString(), 10)),
      maxLimit
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Calculate pagination metadata
   */
  static calculatePagination(
    page: number,
    limit: number,
    total: number
  ): PaginationResult {
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    return {
      page,
      limit,
      skip: (page - 1) * limit,
      total,
      pages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Create pagination metadata for response
   */
  static createPaginationMeta(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    return {
      page,
      limit,
      total,
      pages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(
    page?: number,
    limit?: number,
    maxLimit: number = 100
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
      errors.push('Page must be a positive integer');
    }

    if (limit !== undefined && (limit < 1 || limit > maxLimit || !Number.isInteger(limit))) {
      errors.push(`Limit must be between 1 and ${maxLimit}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create Prisma pagination options
   */
  static createPrismaPagination(
    page: number,
    limit: number
  ): { skip: number; take: number } {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  /**
   * Create MongoDB pagination options
   */
  static createMongoPagination(
    page: number,
    limit: number
  ): { skip: number; limit: number } {
    return {
      skip: (page - 1) * limit,
      limit,
    };
  }

  /**
   * Create cursor-based pagination
   */
  static createCursorPagination(
    cursor?: string,
    limit: number = 10
  ): { cursor?: string; limit: number } {
    return {
      cursor,
      limit,
    };
  }

  /**
   * Calculate offset for cursor-based pagination
   */
  static calculateCursorOffset(
    cursor?: string,
    limit: number = 10
  ): { offset: number; limit: number } {
    const offset = cursor ? parseInt(cursor, 10) : 0;
    return {
      offset,
      limit,
    };
  }

  /**
   * Create pagination links
   */
  static createPaginationLinks(
    baseUrl: string,
    page: number,
    pages: number,
    queryParams: Record<string, any> = {}
  ): {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  } {
    const links: any = {};

    // First page
    if (page > 1) {
      links.first = this.buildUrl(baseUrl, 1, queryParams);
    }

    // Previous page
    if (page > 1) {
      links.prev = this.buildUrl(baseUrl, page - 1, queryParams);
    }

    // Next page
    if (page < pages) {
      links.next = this.buildUrl(baseUrl, page + 1, queryParams);
    }

    // Last page
    if (page < pages) {
      links.last = this.buildUrl(baseUrl, pages, queryParams);
    }

    return links;
  }

  /**
   * Build URL with query parameters
   */
  private static buildUrl(
    baseUrl: string,
    page: number,
    queryParams: Record<string, any>
  ): string {
    const params = new URLSearchParams({
      ...queryParams,
      page: page.toString(),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Create pagination info for database queries
   */
  static createPaginationInfo(
    page: number,
    limit: number,
    total: number
  ): {
    pagination: PaginationMeta;
    prismaOptions: { skip: number; take: number };
  } {
    const pagination = this.createPaginationMeta(page, limit, total);
    const prismaOptions = this.createPrismaPagination(page, limit);

    return {
      pagination,
      prismaOptions,
    };
  }

  /**
   * Handle pagination for array data
   */
  static paginateArray<T>(
    data: T[],
    page: number,
    limit: number
  ): {
    data: T[];
    pagination: PaginationMeta;
  } {
    const total = data.length;
    const pagination = this.createPaginationMeta(page, limit, total);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination,
    };
  }

  /**
   * Create pagination for search results
   */
  static createSearchPagination(
    page: number,
    limit: number,
    total: number,
    query: string
  ): PaginationMeta & { query: string } {
    const pagination = this.createPaginationMeta(page, limit, total);
    return {
      ...pagination,
      query,
    };
  }

  /**
   * Calculate pagination for infinite scroll
   */
  static calculateInfiniteScroll(
    currentPage: number,
    limit: number,
    total: number
  ): {
    hasMore: boolean;
    nextPage?: number;
    remainingItems: number;
  } {
    const totalPages = Math.ceil(total / limit);
    const hasMore = currentPage < totalPages;
    const nextPage = hasMore ? currentPage + 1 : undefined;
    const remainingItems = Math.max(0, total - (currentPage * limit));

    return {
      hasMore,
      nextPage,
      remainingItems,
    };
  }
}
