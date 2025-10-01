import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface JwtRequest extends Request {
  user: { id: number };
}

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('add')
  async addFriend(@Req() req: JwtRequest, @Body('friendId') friendId: number) {
    if (!friendId || isNaN(friendId)) {
      throw new BadRequestException('Invalid friendId');
    }
    return this.friendsService.addFriend(req.user.id, friendId);
  }

  @Post('accept')
  async acceptFriend(@Req() req: JwtRequest, @Body('friendId') friendId: number) {
    if (!friendId || isNaN(friendId)) {
      throw new BadRequestException('Invalid friendId');
    }
    return this.friendsService.acceptFriendRequest(req.user.id, friendId);
  }

  @Get()
  async getCurrentUserFriends(@Req() req: JwtRequest) {
    return this.friendsService.getFriends(req.user.id);
  }

  @Get('pending/requests')
  async getPendingRequests(@Req() req: JwtRequest) {
    return this.friendsService.getPendingRequests(req.user.id);
  }

  @Post('remove')
  async removeFriend(@Req() req: JwtRequest, @Body('friendId') friendId: number) {
    if (!friendId || isNaN(friendId)) {
      throw new BadRequestException('Invalid friendId');
    }
    return this.friendsService.removeFriend(req.user.id, friendId);
  }

  @Post('block')
  async blockUser(@Req() req: JwtRequest, @Body('friendId') friendId: number) {
    if (!friendId || isNaN(friendId)) {
      throw new BadRequestException('Invalid friendId');
    }
    return this.friendsService.blockUser(req.user.id, friendId);
  }
}
