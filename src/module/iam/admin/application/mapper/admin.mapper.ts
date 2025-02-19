import { Injectable } from '@nestjs/common';

import { AdminResponseDto } from '@iam/admin/application/dto/admin-response.dto';
import { Admin } from '@iam/admin/domain/admin.entity';

@Injectable()
export class AdminMapper {
  fromAdminToAdminResponseDto(admin: Admin): AdminResponseDto {
    const adminResponseDto = new AdminResponseDto();
    adminResponseDto.id = admin.id?.toString();
    adminResponseDto.uuid = admin.uuid;
    adminResponseDto.username = admin.username;
    adminResponseDto.externalId = admin.externalId;
    adminResponseDto.roles = admin.roles;
    adminResponseDto.createdAt = admin.createdAt;
    adminResponseDto.updatedAt = admin.updatedAt;
    adminResponseDto.deletedAt = admin.deletedAt;
    return adminResponseDto;
  }
}
