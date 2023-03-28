import { TestingModule, Test } from '@nestjs/testing'
import { PrismaService } from '../../services/prisma.service'
import {
  DrinkService,
  DrinkWithIngredients
} from '../../services/drink.service'
import { DrinkController } from '../../controllers/drink.controller'
import prisma from '../utils/client'
import { Drink, User } from '@prisma/client'
import { faker } from '@faker-js/faker'

const createDrinkForUser = async () => {
  const user = await prisma.user.create({
    data: {
      email: faker.internet.exampleEmail(),
      name: faker.name.fullName()
    }
  })

  await prisma.drink.create({
    data: { name: 'Manhattan', user: { connect: { id: user.id } } }
  })
}

describe('DrinkController', () => {
  let controller: DrinkController
  let service: DrinkService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrinkController],
      providers: [DrinkService, PrismaService]
    }).compile()

    controller = module.get<DrinkController>(DrinkController)
    service = module.get<DrinkService>(DrinkService)
  })

  afterAll(async () => {
    const deleteDrinks = prisma.drink.deleteMany()
    const deleteUsers = prisma.user.deleteMany()
    await prisma.$transaction([deleteDrinks, deleteUsers])
    prisma.$disconnect()
  })

  describe('index', () => {
    it('should return an array of drinks', async () => {
      await createDrinkForUser()

      const drinks = await prisma.drink.findMany()

      jest.spyOn(service, 'index').mockResolvedValue(drinks as Drink[])

      expect(await controller.drinks()).toEqual(drinks)
    })
  })

  describe('show', () => {
    it('should return a drink', async () => {
      await createDrinkForUser()

      const newDrink = await prisma.drink.findFirst()

      const drink = {
        name: newDrink.name,
        id: newDrink.id
      } as DrinkWithIngredients

      jest.spyOn(service, 'show').mockResolvedValue(drink)

      expect(await controller.getDrinkById(drink.id)).toEqual(drink)
    })
  })
})
