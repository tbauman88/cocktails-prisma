import { Injectable } from '@nestjs/common'
import { Drink, Prisma } from '@prisma/client'
import { PrismaService } from '@services/prisma.service'

type DrinkWithIngredients = Drink & {
  ingredients: {
    name: string
    amount: string
  }[]
}

type Ingredient = {
  id: string
  name: string
  amount: string
  amount_unit?: string
  brand?: string
  garnish?: boolean
}

export class CreateDrinkDto {
  name: string
  description?: string
  published?: boolean
  userId: string
  ingredients: Ingredient[]
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
      ingredients: drink.ingredients.map(
        ({ amount, amount_unit, ingredient }) => ({
          name: ingredient.name,
          amount: `${amount} ${amount_unit}`
        })
      )
    }))
  }

  async show(
    drinkWhereUniqueInput: Prisma.DrinkWhereUniqueInput
  ): Promise<DrinkWithIngredients | string> {
    const drink = await this.prisma.drink.findUnique({
      where: drinkWhereUniqueInput,
      include: this.includeIngredients
    })

    if (!drink) return `Drink with ID ${drinkWhereUniqueInput.id} not found.`

    if (drink.deletedAt) return `${drink.name} drink has been deleted.`

    return {
      ...drink,
      ingredients: drink.ingredients.map(
        ({ amount, amount_unit, ingredient }) => ({
          name: ingredient.name,
          amount: `${amount} ${amount_unit}`
        })
      )
    }
  }

  async create(data: CreateDrinkDto): Promise<Drink> {
    const { name, description, ingredients, userId } = data

    return await this.prisma.drink.create({
      data: {
        name,
        description,
        user: { connect: { id: userId } },
        ingredients: {
          create: await this.upsertIngredients(ingredients)
        }
      },
      include: { ingredients: true }
    })
  }

  async update(params: {
    where: Prisma.DrinkWhereUniqueInput
    data: Prisma.DrinkUpdateInput
  }): Promise<Drink> {
    const { where, data } = params
    return this.prisma.drink.update({
      where,
      data,
      include: { ingredients: true }
    })
  }

  async delete(where: Prisma.DrinkWhereUniqueInput): Promise<Drink> {
    return this.prisma.drink.delete({ where })
  }

  private async upsertIngredients(
    ingredients: Ingredient[]
  ): Promise<Prisma.IngredientOnDrinkCreateWithoutDrinkInput[]> {
    return await Promise.all(
      ingredients.map(async (ingredient) => {
        const { id } = await this.prisma.ingredient.upsert({
          where: { name: ingredient.name },
          create: { name: ingredient.name },
          update: {}
        })

        return {
          amount: ingredient.amount,
          amount_unit: ingredient.amount_unit || null,
          brand: ingredient.brand || null,
          garnish: ingredient.garnish || false,
          ingredient: { connect: { id } }
        }
      })
    )
  }
}
