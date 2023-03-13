import { Injectable } from '@nestjs/common'
import { Ingredient, Prisma } from '@prisma/client'
import { PrismaService } from '@services/prisma.service'

type IngredientWithDrinks = Ingredient & {
  drinks: {
    id: string
    name: string
  }[]
}

@Injectable()
export class IngredientService {
  constructor(private prisma: PrismaService) {}

  async index(params: {
    skip?: number
    take?: number
    cursor?: Prisma.DrinkWhereUniqueInput
    where?: Prisma.DrinkWhereInput
    orderBy?: Prisma.DrinkOrderByWithRelationInput
  }): Promise<Ingredient[] | null> {
    const { skip, take, cursor, where, orderBy } = params
    const ingredients = await this.prisma.ingredient.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        drinks: {
          select: { drink: { select: { id: true, name: true } } }
        }
      }
    })

    return ingredients.map((ingredient) => ({
      ...ingredient,
      drinks: ingredient.drinks.map(({ drink }) => ({
        id: drink.id,
        name: drink.name
      }))
    }))
  }

  async show(
    whereUniqueInput: Prisma.IngredientWhereUniqueInput
  ): Promise<IngredientWithDrinks | null> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: whereUniqueInput,
      include: { drinks: { select: { drink: true } } }
    })

    return {
      ...ingredient,
      drinks: ingredient.drinks.map(({ drink }) => ({
        id: drink.id,
        name: drink.name
      }))
    }
  }
}
