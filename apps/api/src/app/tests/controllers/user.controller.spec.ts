import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from '@controllers/user.controller'
import { UserService } from '@services/user.service'
import { PrismaService } from '@services/prisma.service'
import { faker } from '@faker-js/faker'
import { Role, User } from '@prisma/client'

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

  const users: User[] = [
    {
      id: faker.datatype.uuid(),
      name: faker.name.fullName({ firstName: 'Steve', lastName: 'French' }),
      email: faker.internet.exampleEmail('Steve'),
      role: Role.USER
    },
    {
      id: faker.datatype.uuid(),
      name: faker.name.fullName({ firstName: 'Jenn', sex: 'female' }),
      email: faker.internet.exampleEmail('Jenn'),
      role: Role.USER
    }
  ]

  const [user] = users

  it('should return an array of users', async () => {
    jest.spyOn(service, 'index').mockResolvedValue(users)

    expect(await controller.getUsers()).toEqual(users)
  })

  it('should return a user', async () => {
    jest.spyOn(service, 'show').mockResolvedValue(user)

    expect(await controller.getUserById(user.id)).toEqual(user)
  })

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

  it('should update a user', async () => {
    const updatedUser = { ...user, role: Role.ADMIN }
    jest.spyOn(service, 'update').mockResolvedValue(updatedUser)

    const result = await controller.updateUser(user.id, updatedUser)

    expect(result).toEqual(updatedUser)
    expect(service.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: updatedUser
    })
  })

  it('should delete a user', async () => {
    jest.spyOn(service, 'delete').mockResolvedValue(user)
    await controller.deleteUser(user.id)

    expect(await service.delete).toEqual(
      `User: ${user.id} was deleted successfully`
    )
  })
})
