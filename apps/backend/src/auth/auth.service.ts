import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true, email: true, hashedPw: true, name: true },
    });

    if (!user || !user.hashedPw) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.hashedPw);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwt.signAsync(
      { sub: user.id },
    );

    return { accessToken };
  }
}
