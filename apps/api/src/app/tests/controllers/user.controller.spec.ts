import { Test, TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { Role, User } from '@prisma/client'
import { PrismaService } from '../../services/prisma.service'
import { UserService } from '../../services/user.service'
import { UserController } from '../../controllers/user.controller'
import { HttpStatus, INestApplication, NotFoundException } from '@nestjs/common'
import request from 'supertest'

describe('UserController', () => {
  let app: INestApplication

  let controller: UserController
  let service: UserService
  let prisma: PrismaService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService]
    }).compile()

    app = module.createNestApplication()
    await app.init()

    prisma = module.get<PrismaService>(PrismaService) // Get an instance of your Prisma service
  })

  afterAll(async () => {
    const deleteDrinks = prisma.drink.deleteMany()
    const deleteUsers = prisma.user.deleteMany()
    await prisma.$transaction([deleteDrinks, deleteUsers])
    prisma.$disconnect()
  })

  const createUser = async () =>
    await prisma.user.create({
      data: {
        name: faker.name.fullName(),
        email: faker.internet.exampleEmail()
      }
    })

  describe('index', () => {
    it('should return an array of users', async () => {
      const users = [
        { name: faker.name.fullName(), email: faker.internet.exampleEmail() },
        { name: faker.name.fullName(), email: faker.internet.exampleEmail() }
      ]

      await prisma.user.createMany({ data: users })

      const response = await request(app.getHttpServer()).get('/users')

      expect(response.status).toEqual(HttpStatus.OK)

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

  describe.skip('show', () => {
    it('should return a user', async () => {
      const user = await createUser()

      jest.spyOn(service, 'show').mockResolvedValue(user as User)

      expect(await controller.getUserById(user.id)).toEqual(user)
    })
  })

  describe.skip('create', () => {
    it('should create a user', async () => {
      jest.spyOn(service, 'create').mockImplementation()
      const user: Pick<User, 'name' | 'email'> = {
        name: faker.name.fullName(),
        email: faker.internet.exampleEmail()
      }

      await controller.createUser(user)

      expect(await service.create).toHaveBeenCalledWith({
        name: user.name,
        email: user.email
      })
    })
  })

  describe.skip('update', () => {
    it('should update a user', async () => {
      const user = await createUser()
      const updatedUser = { ...user, role: Role.ADMIN }

      jest
        .spyOn(service, 'update')
        .mockResolvedValue({ ...user, role: Role.ADMIN })

      expect(await controller.updateUser(user.id, updatedUser)).toEqual(
        updatedUser
      )
    })

    it('should throw an error if the user does not exist', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(
          new NotFoundException('Record to update does not exist.')
        )

      await expect(controller.updateUser('123', {})).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe.skip('delete', () => {
    it('should delete a user', async () => {
      const user = await createUser()

      jest.spyOn(service, 'delete').mockResolvedValue(user as User)

      expect(await controller.deleteUser(user.id)).toEqual(
        expect.objectContaining({
          message: `User: ${user.id} was deleted successfully`
        })
      )
    })
  })
})
