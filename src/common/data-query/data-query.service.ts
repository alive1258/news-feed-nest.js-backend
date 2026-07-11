import { Injectable } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import { DataQueryOptions } from './data-query-options.interface';

import { IPagination } from './pagination.interface';
import { QueryBuilderHelper } from './helper/query-builder-helper';

@Injectable()
export class DataQueryService {
  constructor(private readonly helper: QueryBuilderHelper) { }

  async execute<T extends ObjectLiteral>({
    repository,
    alias = 'entity',
    pagination,
    searchableFields = [],
    filterableFields = [],
    relations = [],
    select = [],
    selectRelations = [],
    sumFields = [],
  }: DataQueryOptions<T>): Promise<IPagination<T>> {
    const page = Number(pagination.page) || 1;
    const limit = Math.min(Number(pagination.limit) || 10, 100);

    const qb = repository.createQueryBuilder(alias);

    this.helper.applyRelations(qb, alias, relations);
    this.helper.applyFilters(
      qb,
      alias,
      pagination.filters as Partial<Record<keyof T, unknown>> | undefined,
      filterableFields,
    );
    this.helper.applySearch(qb, alias, searchableFields, pagination.search);

    if (select.length) {
      qb.select(select.map((f) => `${alias}.${String(f)}`));
    }

    if (selectRelations.length) {
      qb.select([alias, ...selectRelations]);
    }

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy(`${alias}.created_at`, 'DESC');

    const [data, total] = await qb.getManyAndCount();

    let sums: Record<string, number> | undefined;

    if (sumFields.length) {
      const sumQb = repository.createQueryBuilder(alias);
      sumFields.forEach((field) => {
        sumQb.addSelect(
          `SUM(${alias}.${String(field)})`,
          `sum_${String(field)}`,
        );
      });

      sums = await sumQb.getRawOne();
    }

    const totalPages = Math.ceil(total / limit);

    return {
      meta: { total, page, limit, totalPages },
      links: {
        first: `?page=1&limit=${limit}`,
        last: `?page=${totalPages}&limit=${limit}`,
        current: `?page=${page}&limit=${limit}`,
        next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : '',
        previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : '',
      },
      data,
      sums,
    };
  }
}
