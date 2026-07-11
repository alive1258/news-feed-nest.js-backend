import { Global, Module } from '@nestjs/common';
import { DataQueryService } from './data-query.service';
import { QueryBuilderHelper } from './helper/query-builder-helper';

@Global()
@Module({
  providers: [DataQueryService, QueryBuilderHelper],
  exports: [DataQueryService],
})
export class DataQueryModule {}
