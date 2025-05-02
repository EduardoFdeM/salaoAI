import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  salon_id: string | null;
}

interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  salon_id: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'supersecret',
    });
  }

  validate(payload: JwtPayload): UserPayload {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      salon_id: payload.salon_id,
    };
  }
} 