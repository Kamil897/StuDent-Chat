import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('plans')
  async plans() {
    return this.billing.getPlans();
  }

  @Post('subscribe')
  async subscribe(
    @Req() req: Request & { user: { id: number } },
    @Body('plan') plan: string,
  ) {
    return this.billing.subscribe(req.user.id, plan);
  }

  // Mock checkout
  @Post('checkout')
  async checkout(
    @Req() req: Request & { user: { id: number } },
    @Body('plan') plan: string,
  ) {
    // In sandbox we would create a session; here we directly activate
    return this.billing.subscribe(req.user.id, plan);
  }
}


