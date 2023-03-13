import { Controller, Get, Param, Query } from '@nestjs/common'
import { Drink } from '@prisma/client'
import { DrinkService } from '@services/drink.service'

@Controller()
export class DrinkController {
  constructor(private readonly drinkService: DrinkService) {}

  @Get('drinks')
  async drinks(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc'
  ): Promise<Drink[] | null> {
    const or = search ? { OR: [{ name: { contains: search } }] } : {}

    return this.drinkService.index({
      skip: Number(skip) || undefined,
      take: Number(take) || undefined,
      orderBy: { name: orderBy },
      where: { ...or }
    })
  }

  @Get('drink/:id')
  async getDrinkById(@Param('id') id: string): Promise<Drink | null> {
    return this.drinkService.show({ id })
  }
}
