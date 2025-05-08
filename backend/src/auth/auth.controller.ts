import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  UnauthorizedException,
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
import { ConfigService } from '@nestjs/config';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

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

  @Post('system-token')
  @ApiOperation({ summary: 'Gera token para integração com sistemas externos' })
  @ApiResponse({ status: 200, description: 'Token gerado com sucesso' })
  @ApiResponse({ status: 401, description: 'API Secret inválida' })
  async getSystemToken(@Body() data: { salonId: string; apiSecret: string }) {
    // Verificar a apiSecret
    const apiSecret = this.configService.get<string>('N8N_API_SECRET');
    if (!apiSecret || data.apiSecret !== apiSecret) {
      throw new UnauthorizedException('API Secret inválida');
    }
    
    return this.authService.generateSystemToken(data.salonId);
  }

  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica se um token JWT é válido' })
  @ApiResponse({ status: 200, description: 'Informações de validade do token' })
  async verifyToken(@Body() data: { token: string }) {
    try {
      // Extrair o token do corpo da requisição
      const { token } = data;
      
      if (!token) {
        return {
          valid: false,
          error: 'Token não fornecido',
        };
      }
      
      // Usar o novo método que verifica tokens do sistema e de usuário
      return this.authService.verifyToken(token);
    } catch (error) {
      return {
        valid: false,
        error: error.message || 'Erro ao verificar token',
      };
    }
  }
}
