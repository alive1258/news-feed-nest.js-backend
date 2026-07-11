import { Injectable } from '@nestjs/common';
import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class QueryBuilderHelper {
  applyRelations<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    relations: string[] = [],
  ) {
    relations.forEach((relation) => {
      const relAlias = relation.replace('.', '_');
      qb.leftJoinAndSelect(`${alias}.${relation}`, relAlias);
    });
  }

  applySearch<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    fields: Array<keyof T>,
    search?: string,
  ) {
    if (!search || !fields.length) return;

    qb.andWhere(
      new Brackets((sub) => {
        fields.forEach((field) => {
          sub.orWhere(`${alias}.${String(field)} ILIKE :search`, {
            search: `%${search}%`,
          });
        });
      }),
    );
  }

  applyFilters<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    filters: Partial<Record<keyof T, unknown>> = {},
    allowedFields: Array<keyof T> = [],
  ) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || !allowedFields.includes(key as keyof T)) {
        return;
      }

      qb.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
    });
  }
}
