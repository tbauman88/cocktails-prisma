import { Test, TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { Role } from '@prisma/client'
import { PrismaService } from '../../services/prisma.service'
import { UserService } from '../../services/user.service'
import { UserController } from '../../controllers/user.controller'
import { HttpStatus, INestApplication } from '@nestjs/common'
import request from 'supertest'

describe('UserController', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService]
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
    it('should return an array of users', async () => {
      const users = [
        { name: faker.name.fullName(), email: faker.internet.exampleEmail() },
        { name: faker.name.fullName(), email: faker.internet.exampleEmail() }
      ]

      await prisma.user.createMany({ data: users })

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: users[0].email,
            name: users[0].name
          }),
          expect.objectContaining({
            email: users[1].email,
            name: users[1].name
          })
        ])
      )
    })
  })

  describe('show', () => {
    it('should return a user', async () => {
      const user = await createUser()

      const response = await request(app.getHttpServer())
        .get(`/user/${user.id}`)
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(expect.objectContaining({ id: user.id }))
    })
  })

  describe('create', () => {
    it('should create a user', async () => {
      const user = {
        name: faker.name.fullName(),
        email: faker.internet.exampleEmail()
      }

      const response = await request(app.getHttpServer())
        .post(`/user/signup`)
        .send(user)
        .expect(HttpStatus.CREATED)

      expect(response.body).toEqual(
        expect.objectContaining({ name: user.name, email: user.email })
      )
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const user = await createUser()

      const response = await request(app.getHttpServer())
        .put(`/user/${user.id}`)
        .send({ role: Role.ADMIN })
        .expect(HttpStatus.OK)

      expect(response.body).toEqual(
        expect.objectContaining({ role: Role.ADMIN })
      )
    })

    it('should throw an error if the user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .put(`/user/123`)
        .send({ role: Role.ADMIN })
        .expect(HttpStatus.NOT_FOUND)

      expect(response.body.message).toEqual('Record to update does not exist.')
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = await createUser()

      const response = await request(app.getHttpServer())
        .delete(`/user/${user.id}`)
        .expect(HttpStatus.OK)

      expect(response.body.message).toEqual(
        `User: ${user.id} was deleted successfully`
      )
    })
  })

  const createUser = async () =>
    await prisma.user.create({
      data: {
        name: faker.name.fullName(),
        email: faker.internet.exampleEmail()
      }
    })
})
