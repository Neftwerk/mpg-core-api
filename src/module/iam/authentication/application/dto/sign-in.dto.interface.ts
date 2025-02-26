import { SignUpDto } from '@iam/authentication/application/dto/sign-up.dto';

export interface ISignInDto
  extends Omit<SignUpDto, 'name' | 'surname' | 'biography'> {}
