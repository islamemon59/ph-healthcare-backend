/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PrismaFindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean> | Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
}

export interface PrismaCountArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean> | Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
}

export interface PrismaModelDelegate {
  findMany(arg?: any): Promise<any[]>;
  count(arg?: any): Promise<number>;
}

export interface IQueryParams {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fields?: string;
  includes?: string;
  [key: string]: string | undefined;
}

export interface IQueryConfig {
  searchableFields?: string[];
  filterableFields?: string[];
}

export interface PrismaStringFilter{
  contains?: string;
  endsWith?: string;
  equals?: string;
  mode?: "insensitive" | "default";
  gt?: string;
  gte?: string;
  in?: string[];
  lt?: string;
  lte?: string;
  not?: string;
  notIn?: string[];
  startsWith?: string;
}


export interface PrismaNumberFilter{
  equals?: number;
  gt?: number;
  gte?: number;
  in?: number[];
  lt?: number;
  lte?: number;
  not?: number;
  notIn?: number[];
}

export interface PrismaBooleanFilter{
  equals?: boolean;
  not?: boolean;  
}

export interface PrismaWhereConditions{
  OR?: Record<string, unknown>[];
  AND?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
  [key: string]: unknown;
}