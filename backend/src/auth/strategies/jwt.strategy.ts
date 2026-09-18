import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Ambil data employee terkait, kalau user ini sudah punya profil employee
    const employee = await this.prisma.employee.findUnique({
      where: { userId: payload.sub },
      select: { id: true },
    });

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      employeeId: employee?.id ?? null,
    };
  }
}