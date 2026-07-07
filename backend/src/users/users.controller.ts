import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getDashboard(@Req() req) {
    return this.usersService.findById(req.user.userId)
  }
}
