import { Module } from '@nestjs/common'

import { AppController } from '@controllers/app.controller'
import { UserController } from '@controllers/user.controller'
import { DrinkController } from '@controllers/drink.controller'
import { IngredientController } from '@controllers/ingredient.controller'

import { AppService } from '@services/app.service'
import { UserService } from '@services/user.service'
import { DrinkService } from '@services/drink.service'
import { PrismaService } from '@services/prisma.service'
import { IngredientService } from '@services/ingredient.service'

const controllers = [
  AppController,
  UserController,
  DrinkController,
  IngredientController
]

const providers = [
  AppService,
  PrismaService,
  UserService,
  DrinkService,
  IngredientService
]
@Module({
  imports: [],
  controllers,
  providers
})
export class AppModule {}
