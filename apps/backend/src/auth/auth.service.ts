import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

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
async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException("Email already in use");

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name?.trim() || null,
        hashedPw: passwordHash,
      },
      select: { id: true, email: true },
    });

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
