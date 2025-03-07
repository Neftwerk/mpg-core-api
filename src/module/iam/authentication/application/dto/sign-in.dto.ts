import { OmitType } from '@nestjs/swagger';

import { SignUpDto } from '@iam/authentication/application/dto/sign-up.dto';

export class SignInDto extends OmitType(SignUpDto, [
  'name',
  'surname',
  'biography',
]) {}
