/**
 * Query filter utility functions
 */

import { z } from 'zod';

export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
}

export interface SortCondition {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationCondition {
  page: number;
  limit: number;
  skip: number;
}

export interface QueryFilters {
  filters: FilterCondition[];
  sort: SortCondition[];
  pagination: PaginationCondition;
  search?: string;
}

export class FilterUtils {
  /**
   * Parse query parameters into filter conditions
   */
  static parseQueryParams(query: any): QueryFilters {
    const filters: FilterCondition[] = [];
    const sort: SortCondition[] = [];
    
    // Parse filters
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('filter_')) {
        const field = key.replace('filter_', '');
        const [fieldName, operator] = field.split('_');
        
        if (fieldName && operator && value !== undefined) {
          filters.push({
            field: fieldName,
            operator: operator || 'equals',
            value: this.parseValue(value),
          });
        }
      }
    }
    
    // Parse sort
    if (query.sort) {
      const sortFields = Array.isArray(query.sort) ? query.sort : [query.sort];
      
      for (const sortField of sortFields) {
        const [field, direction] = sortField.split(':');
        if (field) {
          sort.push({
            field,
            direction: (direction as 'asc' | 'desc') || 'asc',
          });
        }
      }
    }
    
    // Parse pagination
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(Math.max(1, parseInt(query.limit || '10', 10)), 100);
    const skip = (page - 1) * limit;
    
    return {
      filters,
      sort,
      pagination: { page, limit, skip },
      search: query.search,
    };
  }

  /**
   * Parse value based on type
   */
  private static parseValue(value: any): any {
    if (typeof value === 'string') {
      // Try to parse as number
      if (!isNaN(Number(value))) {
        return Number(value);
      }
      
      // Try to parse as boolean
      if (value.toLowerCase() === 'true') {
        return true;
      }
      if (value.toLowerCase() === 'false') {
        return false;
      }
      
      // Try to parse as date
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    return value;
  }

  /**
   * Build Prisma where clause from filters
   */
  static buildPrismaWhere(filters: FilterCondition[]): any {
    if (filters.length === 0) {
      return {};
    }

    const where: any = {};

    for (const filter of filters) {
      const { field, operator, value } = filter;
      
      switch (operator) {
        case 'equals':
          where[field] = value;
          break;
        case 'not_equals':
          where[field] = { not: value };
          break;
        case 'contains':
          where[field] = { contains: value, mode: 'insensitive' };
          break;
        case 'not_contains':
          where[field] = { not: { contains: value, mode: 'insensitive' } };
          break;
        case 'starts_with':
          where[field] = { startsWith: value, mode: 'insensitive' };
          break;
        case 'ends_with':
          where[field] = { endsWith: value, mode: 'insensitive' };
          break;
        case 'gt':
          where[field] = { gt: value };
          break;
        case 'gte':
          where[field] = { gte: value };
          break;
        case 'lt':
          where[field] = { lt: value };
          break;
        case 'lte':
          where[field] = { lte: value };
          break;
        case 'in':
          where[field] = { in: Array.isArray(value) ? value : [value] };
          break;
        case 'not_in':
          where[field] = { notIn: Array.isArray(value) ? value : [value] };
          break;
        case 'between':
          if (Array.isArray(value) && value.length === 2) {
            where[field] = { gte: value[0], lte: value[1] };
          }
          break;
        case 'is_null':
          where[field] = null;
          break;
        case 'is_not_null':
          where[field] = { not: null };
          break;
        case 'date_equals':
          if (value instanceof Date) {
            const start = new Date(value);
            start.setHours(0, 0, 0, 0);
            const end = new Date(value);
            end.setHours(23, 59, 59, 999);
            where[field] = { gte: start, lte: end };
          }
          break;
        case 'date_between':
          if (Array.isArray(value) && value.length === 2) {
            const start = new Date(value[0]);
            start.setHours(0, 0, 0, 0);
            const end = new Date(value[1]);
            end.setHours(23, 59, 59, 999);
            where[field] = { gte: start, lte: end };
          }
          break;
        default:
          where[field] = value;
      }
    }

    return where;
  }

  /**
   * Build Prisma orderBy clause from sort conditions
   */
  static buildPrismaOrderBy(sort: SortCondition[]): any {
    if (sort.length === 0) {
      return { createdAt: 'desc' };
    }

    return sort.map(s => ({
      [s.field]: s.direction,
    }));
  }

  /**
   * Build search query for multiple fields
   */
  static buildSearchQuery(search: string, fields: string[]): any {
    if (!search || fields.length === 0) {
      return {};
    }

    return {
      OR: fields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive' as const,
        },
      })),
    };
  }

  /**
   * Build combined where clause
   */
  static buildCombinedWhere(
    filters: FilterCondition[],
    search?: string,
    searchFields: string[] = []
  ): any {
    const where: any = {};

    // Add filters
    const filterWhere = this.buildPrismaWhere(filters);
    if (Object.keys(filterWhere).length > 0) {
      Object.assign(where, filterWhere);
    }

    // Add search
    if (search && searchFields.length > 0) {
      const searchWhere = this.buildSearchQuery(search, searchFields);
      if (Object.keys(searchWhere).length > 0) {
        where.AND = where.AND || [];
        where.AND.push(searchWhere);
      }
    }

    return where;
  }

  /**
   * Validate filter conditions
   */
  static validateFilters(filters: FilterCondition[], allowedFields: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const filter of filters) {
      if (!allowedFields.includes(filter.field)) {
        errors.push(`Field '${filter.field}' is not allowed`);
      }

      if (!filter.operator) {
        errors.push(`Operator is required for field '${filter.field}'`);
      }

      if (filter.value === undefined || filter.value === null) {
        errors.push(`Value is required for field '${filter.field}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create filter schema for validation
   */
  static createFilterSchema(allowedFields: string[], allowedOperators: string[] = []) {
    const fieldSchema = z.enum(allowedFields as [string, ...string[]]);
    const operatorSchema = allowedOperators.length > 0 
      ? z.enum(allowedOperators as [string, ...string[]])
      : z.string();

    return z.object({
      field: fieldSchema,
      operator: operatorSchema,
      value: z.any(),
    });
  }

  /**
   * Parse nested filters
   */
  static parseNestedFilters(query: any, prefix: string = ''): FilterCondition[] {
    const filters: FilterCondition[] = [];

    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith(prefix)) {
        const field = key.replace(prefix, '');
        
        if (typeof value === 'object' && value !== null) {
          // Nested object
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            filters.push({
              field: `${field}.${nestedKey}`,
              operator: 'equals',
              value: nestedValue,
            });
          }
        } else {
          // Direct value
          filters.push({
            field,
            operator: 'equals',
            value,
          });
        }
      }
    }

    return filters;
  }

  /**
   * Build relation filters
   */
  static buildRelationFilters(relation: string, filters: FilterCondition[]): any {
    if (filters.length === 0) {
      return {};
    }

    const where = this.buildPrismaWhere(filters);
    
    return {
      [relation]: {
        some: where,
      },
    };
  }

  /**
   * Build date range filters
   */
  static buildDateRangeFilters(
    field: string,
    startDate?: Date,
    endDate?: Date
  ): any {
    const filter: any = {};

    if (startDate) {
      filter.gte = startDate;
    }

    if (endDate) {
      filter.lte = endDate;
    }

    return Object.keys(filter).length > 0 ? { [field]: filter } : {};
  }

  /**
   * Build array filters
   */
  static buildArrayFilters(field: string, values: any[], operator: string = 'in'): any {
    if (values.length === 0) {
      return {};
    }

    switch (operator) {
      case 'in':
        return { [field]: { in: values } };
      case 'not_in':
        return { [field]: { notIn: values } };
      case 'contains':
        return { [field]: { hasSome: values } };
      case 'not_contains':
        return { [field]: { not: { hasSome: values } } };
      default:
        return { [field]: { in: values } };
    }
  }

  /**
   * Build boolean filters
   */
  static buildBooleanFilters(field: string, value: boolean): any {
    return { [field]: value };
  }

  /**
   * Build numeric range filters
   */
  static buildNumericRangeFilters(
    field: string,
    min?: number,
    max?: number
  ): any {
    const filter: any = {};

    if (min !== undefined) {
      filter.gte = min;
    }

    if (max !== undefined) {
      filter.lte = max;
    }

    return Object.keys(filter).length > 0 ? { [field]: filter } : {};
  }
}
