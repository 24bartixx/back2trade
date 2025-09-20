import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Default-Route')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'The default api',
    description: 'Just here for testing purpose'
  })
  @ApiResponse({
    status: 200,
    description: 'It works'
  })
  @HttpCode(200)
  getHello(): string {
    return this.appService.getHello();
  }
}
