import { Injectable } from '@nestjs/common'
import { Drink, Prisma } from '@prisma/client'
import { PrismaService } from '@services/prisma.service'

type DrinkWithIngredients = Drink & {
  ingredients: {
    name: string
    amount: string
  }[]
}

@Injectable()
export class DrinkService {
  private includeIngredients = {
    ingredients: {
      select: {
        ingredient: true,
        amount: true,
        amount_unit: true
      }
    }
  }

  constructor(private prisma: PrismaService) {}

  async index(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<Drink[]> {
    const { skip, take, cursor, where, orderBy } = params
    const drinks = await this.prisma.drink.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: this.includeIngredients
    })

    return drinks.map((drink) => ({
      ...drink,
      ingredients: drink.ingredients.map((parent) => ({
        name: parent.ingredient.name,
        amount: `${parent.amount}${parent.amount_unit}`
      }))
    }))
  }

  async show(
    drinkWhereUniqueInput: Prisma.DrinkWhereUniqueInput
  ): Promise<DrinkWithIngredients | null> {
    const drink = await this.prisma.drink.findUnique({
      where: drinkWhereUniqueInput,
      include: this.includeIngredients
    })

    return {
      ...drink,
      ingredients: drink.ingredients.map((parent) => ({
        name: parent.ingredient.name,
        amount: `${parent.amount}${parent.amount_unit}`
      }))
    }
  }
}
