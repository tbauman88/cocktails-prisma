/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from '@api/app.module'
import { PrismaService } from '@api/services/prisma.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)
  const port = process.env.PORT || 3333
  await app.listen(port)

  // const prismaService = app.get(PrismaService)
  // await prismaService.enableShutdownHooks(app)

  Logger.log(`🚀 Application is running on: http://localhost:${port}`)
}

bootstrap()
