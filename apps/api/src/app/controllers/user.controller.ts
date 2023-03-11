import { Body, Delete, Post, Put } from '@nestjs/common'
import { Controller, Get, Param } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { UserService } from '../services/user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user/:id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.show({ id })
  }

  @Get('users')
  async getUsers(): Promise<User[]> {
    return this.userService.index({})
  }

  @Post('user/signup')
  async createUser(@Body() data: Prisma.UserCreateInput): Promise<User> {
    return this.userService.create(data)
  }

  @Put('user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: Prisma.UserUpdateInput
  ): Promise<User> {
    return this.userService.update({ where: { id }, data })
  }

  @Delete('user/:id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.delete({ id })
  }
}
