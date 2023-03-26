import { Test, TestingModule } from '@nestjs/testing'
import { AppService } from '../../services/app.service'
import { AppController } from '../../controllers/app.controller'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService]
    }).compile()
  })

  describe('getData', () => {
    it('should return "Welcome to api!"', () => {
      const appController = app.get<AppController>(AppController)
      expect(appController.getData()).toEqual({ message: 'Welcome to api!' })
    })
  })
})
