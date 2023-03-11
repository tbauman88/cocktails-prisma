import { Module } from '@nestjs/common'

import { AppController } from '@controllers/app.controller'
import { AppService } from '@services/app.service'
import { UserService } from '@services/user.service'
import { UserController } from '@controllers/user.controller'
import { DrinkService } from '@services/drink.service'
import { DrinkController } from '@controllers/drink.controller'

@Module({
  imports: [],
  controllers: [AppController, UserController, DrinkController],
  providers: [AppService, UserService, DrinkService]
})
export class AppModule {}
