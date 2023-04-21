import { TestingModule, Test } from '@nestjs/testing'
import { PrismaService } from '../../services/prisma.service'
import {
  DrinkService,
  DrinkWithIngredients
} from '../../services/drink.service'
import { DrinkController } from '../../controllers/drink.controller'
import { faker } from '@faker-js/faker'
import { HttpStatus, INestApplication } from '@nestjs/common'
import request from 'supertest'

describe('DrinkController', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrinkController],
      providers: [DrinkService, PrismaService]
    }).compile()

    app = module.createNestApplication()
    await app.init()

    prisma = module.get<PrismaService>(PrismaService)
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

      const [drink] = await prisma.drink.findMany()

      const response = await request(app.getHttpServer())
        .get('/drinks')
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: drink.name, id: drink.id })
        ])
      )
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

      const response = await request(app.getHttpServer())
        .get(`/drink/${drink.id}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(expect.objectContaining({ id: drink.id }))
    })

    it('should throw an error if the drink does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/drink/123`)
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body.message).toEqual('Drink with ID 123 not found.')
    })

    it('should return message when drink has been deleted', async () => {
      await prisma.drink.deleteMany()
      await createDrinkForUser({ deletedAt: new Date() })
      const drink = await prisma.drink.findFirst()

      await prisma.drink.update({
        where: { id: drink.id },
        data: { deletedAt: new Date() }
      })

      const response = await request(app.getHttpServer())
        .get(`/drink/${drink.id}`)
        .expect(HttpStatus.OK)

      expect(response.text).toEqual(`${drink.name} has been deleted.`)
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

      const response = await request(app.getHttpServer())
        .post(`/drink`)
        .send(drink)
        .expect(HttpStatus.CREATED)

      expect(response.body).toEqual(expect.objectContaining(drink))
    })
  })

  describe('update', () => {
    it('should update a drink', async () => {
      await createDrinkForUser()
      const newDrink = await prisma.drink.findFirst()

      const response = await request(app.getHttpServer())
        .put(`/drink/${newDrink.id}`)
        .send({ published: true })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(
        expect.objectContaining({ published: true })
      )
    })
  })

  describe('delete', () => {
    it('should delete a drink', async () => {
      await createDrinkForUser()
      const [_, drink] = await prisma.drink.findMany()

      const response = await request(app.getHttpServer())
        .delete(`/drink/${drink.id}`)
        .expect(HttpStatus.OK)

      expect(response.text).toEqual(`Drink deleted successfully.`)
    })

    it('should return drink already deleted message if drink has been deleted', async () => {
      await prisma.drink.deleteMany()
      await createDrinkForUser({ deletedAt: new Date() })
      const drink = await prisma.drink.findFirst()

      const response = await request(app.getHttpServer())
        .delete(`/drink/${drink.id}`)
        .expect(HttpStatus.OK)

      expect(response.text).toEqual(`${drink.name} has been deleted.`)
    })
  })

  const createDrinkForUser = async (extraData = {}) => {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.exampleEmail(),
        name: faker.name.fullName()
      }
    })

    await prisma.drink.create({
      data: {
        name: 'Manhattan',
        user: { connect: { id: user.id } },
        ...extraData
      }
    })
  }
})
