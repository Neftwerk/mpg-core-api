import { Injectable } from '@nestjs/common';

import { BaseResponseAdapter } from '@common/base/application/adapter/base-response.adapter';

@Injectable()
export class BookResponseAdapter extends BaseResponseAdapter {}
