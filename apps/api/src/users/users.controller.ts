import { Controller, Get, Patch, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Body('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  async updateProfile(
    @Body('userId') userId: string,
    @Body() data: { firstName?: string; lastName?: string; phone?: string },
  ) {
    return this.usersService.updateProfile(userId, data);
  }

  @Patch('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @Body('userId') userId: string,
    @UploadedFile() file: any,
  ) {
    // TODO: Upload to S3 and get URL
    const avatarUrl = file?.path || '';
    return this.usersService.updateAvatar(userId, avatarUrl);
  }
}
