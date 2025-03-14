import { IIdentity } from '@module/recovery/application/interface/identity.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UpdateRecoveryMethodsRequestDto {
  @ApiProperty()
  @IsArray()
  methods: IIdentity[];
}
