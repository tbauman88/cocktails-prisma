import { Module } from '@nestjs/common'

import { AppController } from '@controllers/app.controller'
import { UserController } from '@controllers/user.controller'
import { DrinkController } from '@controllers/drink.controller'

import { AppService } from '@services/app.service'
import { UserService } from '@services/user.service'
import { DrinkService } from '@services/drink.service'
import { PrismaService } from '@services/prisma.service'

@Module({
  imports: [],
  controllers: [AppController, UserController, DrinkController],
  providers: [AppService, PrismaService, UserService, DrinkService]
})
export class AppModule {}
