import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TokenDto } from './dto/token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '@prisma/client';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: TokenDto,
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso',
    type: TokenDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Request() req: RequestWithUser) {
    if (req?.user) {
      return this.authService.login(req.user);
    }
    return {
      error: 'Usuário não autenticado',
      statusCode: HttpStatus.UNAUTHORIZED,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getProfile(@Request() req: RequestWithUser) {
    if (req?.user) {
      return req.user;
    }
    return {
      error: 'Usuário não autenticado',
      statusCode: HttpStatus.UNAUTHORIZED,
    };
  }
}
