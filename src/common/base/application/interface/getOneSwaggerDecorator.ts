import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { OneSerializedResponseDto } from '../dto/one-serialized-response.dto';

type Constructor = new (...args: any[]) => any;

export function GetOneSwaggerDecorator(responseDto: Constructor) {
  return applyDecorators(
    ApiExtraModels(OneSerializedResponseDto, responseDto),
    ApiOkResponse({
      schema: {
        properties: {
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              attributes: {
                $ref: getSchemaPath(responseDto),
              },
              relationships: {
                type: 'object',
              },
            },
          },
          included: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          links: {
            type: 'object',
            properties: {
              self: { type: 'string' },
            },
          },
        },
      },
    }),
  );
}
