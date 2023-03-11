import { Controller, Get, Param } from '@nestjs/common'
import { Drink } from '@prisma/client'
import { DrinkService } from '@services/drink.service'

@Controller()
export class DrinkController {
  constructor(private readonly drinkService: DrinkService) {}

  @Get('drinks')
  async drinks(): Promise<Drink[]> {
    return this.drinkService.index({})
  }

  @Get('drink/:id')
  async getDrinkById(@Param('id') id: string): Promise<Drink> {
    return this.drinkService.show({ id })
  }
}
