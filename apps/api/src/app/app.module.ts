import { Module } from '@nestjs/common'

import { AppController } from '@controllers/app.controller'
import { AppService } from '@services/app.service'
import { UserService } from '@services/user.service'
import { UserController } from '@controllers/user.controller'

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [AppService, UserService]
})
export class AppModule {}
