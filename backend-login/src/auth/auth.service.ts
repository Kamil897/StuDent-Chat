import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string, name: string, role: 'user'|'admin'|'creator'='admin') {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { email, password: hash, name, role } });
    return user;
  }

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.status === 'banned') throw new UnauthorizedException('User is banned');
    const match = await bcrypt.compare(pass, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwt.sign(payload), user: { id: user.id, email: user.email, role: user.role, name: user.name } };
  }

  async getMe(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, email: true, name: true, role: true, status: true, 
        avatar: true, avatarBorders: true,
        firstName: true, lastName: true, hobby: true, education: true, // 👈
      },
    });
  }


// async updateProfile(userId: number, updateDto: { name?: string }) {
//   return this.prisma.user.update({
//     where: { id: userId },
//     data: updateDto,
//     select: { id: true, email: true, name: true, role: true, status: true },
//   });



}
