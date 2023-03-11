import { Body, Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { PrismaService } from './prisma-service.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async show(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: { drinks: true }
    })
  }

  async index(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { drinks: true }
    })
  }

  async create(@Body() data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput
    data: Prisma.UserUpdateInput
  }): Promise<User> {
    const { where, data } = params
    return this.prisma.user.update({ data, where })
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where })
  }
}
