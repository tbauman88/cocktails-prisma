import { Injectable } from '@nestjs/common'
import { Drink, Prisma } from '@prisma/client'
import { PrismaService } from '@services/prisma.service'

@Injectable()
export class DrinkService {
  constructor(private prisma: PrismaService) {}

  async index(): Promise<Drink[]> {
    return this.prisma.drink.findMany()
  }

  async show(
    drinkWhereUniqueInput: Prisma.DrinkWhereUniqueInput
  ): Promise<Drink | null> {
    return this.prisma.drink.findUnique({ where: drinkWhereUniqueInput })
  }
}
