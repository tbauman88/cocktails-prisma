import { TestingModule, Test } from '@nestjs/testing'
import { PrismaService } from '../../services/prisma.service'
import {
  DrinkService,
  DrinkWithIngredients
} from '../../services/drink.service'
import { DrinkController } from '../../controllers/drink.controller'
import prisma from '../../utils/client'
import { Drink } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { NotFoundException } from '@nestjs/common'

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

    it('should throw an error if the drink does not exist', async () => {
      jest
        .spyOn(service, 'show')
        .mockRejectedValueOnce(new NotFoundException('Drink not found.'))

      await expect(controller.getDrinkById('Drink A')).rejects.toThrow(
        NotFoundException
      )
    })

    it('should return message when drink has been deleted', async () => {
      await createDrinkForUser()

      const newDrink = await prisma.drink.findFirst()

      jest
        .spyOn(service, 'show')
        .mockResolvedValueOnce('Drink has been deleted.')

      expect(await controller.getDrinkById(newDrink.id)).toEqual(
        'Drink has been deleted.'
      )
    })
  })

  describe('create', () => {
    it('should create a drink', async () => {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.exampleEmail(),
          name: faker.name.fullName()
        }
      })

      const drink = {
        name: 'Fernet Is My Safe Word',
        userId: user.id,
        notes: 'Fernet Blanc spray on glass, garnished with a lemon',
        ingredients: []
      }

      const createDrink: Drink = {
        id: faker.datatype.uuid(),
        name: drink.name,
        notes: drink.notes,
        published: false,
        saveCount: 0,
        userId: user.id,
        serves: 1,
        directions: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      jest.spyOn(service, 'create').mockResolvedValue(createDrink)

      expect(await controller.createDrink(drink)).toEqual(createDrink)
    })
  })

  describe('update', () => {
    it('should update a drink', async () => {
      await createDrinkForUser()
      const newDrink = await prisma.drink.findFirst()

      const updateDrink = { published: true }

      jest
        .spyOn(service, 'update')
        .mockResolvedValue({ ...newDrink, ...updateDrink })

      expect(await controller.updateDrink(newDrink.id, updateDrink)).toEqual({
        ...newDrink,
        ...updateDrink
      })
    })
  })

  describe('delete', () => {
    it('should delete a drink', async () => {
      await createDrinkForUser()
      const newDrink = await prisma.drink.findFirst()

      jest
        .spyOn(service, 'delete')
        .mockResolvedValue('Drink deleted successfully.')

      expect(await controller.deleteDrink(newDrink.id)).toEqual(
        'Drink deleted successfully.'
      )
    })

    it('should return drink already deleted message if drink has been deleted', async () => {
      await createDrinkForUser()
      const newDrink = await prisma.drink.findFirst()

      jest.spyOn(service, 'delete').mockResolvedValue('Drink already deleted.')

      expect(await controller.deleteDrink(newDrink.id)).toEqual(
        'Drink already deleted.'
      )
    })
  })
})
