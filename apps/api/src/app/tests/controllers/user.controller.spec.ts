import { Test, TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { Role, User } from '@prisma/client'
import { PrismaService } from '../../services/prisma.service'
import { UserService } from '../../services/user.service'
import { UserController } from '../../controllers/user.controller'
import prisma from '../utils/client'
import { NotFoundException } from '@nestjs/common'

const createUser = async () =>
  await prisma.user.create({
    data: {
      name: faker.name.fullName(),
      email: faker.internet.exampleEmail()
    }
  })

describe('UserController', () => {
  let controller: UserController
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService]
    }).compile()

    controller = module.get<UserController>(UserController)
    service = module.get<UserService>(UserService)
  })

  afterAll(async () => {
    const deleteUser = prisma.user.deleteMany()
    await prisma.$transaction([deleteUser])
    prisma.$disconnect()
  })

  describe('index', () => {
    it('should return an array of users', async () => {
      const users = [
        { name: faker.name.fullName(), email: faker.internet.exampleEmail() },
        { name: faker.name.fullName(), email: faker.internet.exampleEmail() }
      ]

      await prisma.user.createMany({ data: users })

      jest.spyOn(service, 'index').mockResolvedValue(users as User[])

      expect(await controller.getUsers()).toEqual(users)
    })
  })

  describe('show', () => {
    it('should return a user', async () => {
      const user = await createUser()
      jest.spyOn(service, 'show').mockResolvedValue(user as User)

      expect(await controller.getUserById(user.id)).toEqual(user)
    })
  })

  describe('create', () => {
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

  describe('update', () => {
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

  describe('delete', () => {
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
