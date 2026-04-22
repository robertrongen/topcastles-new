import { convertToParamMap, Params } from '@angular/router';
import { of } from 'rxjs';

export function createActivatedRouteMock(
  params: Params = {},
  queryParams: Params = {},
) {
  return {
    snapshot: {
      params,
      queryParams,
      paramMap: convertToParamMap(params),
      queryParamMap: convertToParamMap(queryParams),
    },
    params: of(params),
    queryParams: of(queryParams),
    paramMap: of(convertToParamMap(params)),
    queryParamMap: of(convertToParamMap(queryParams)),
  };
}
