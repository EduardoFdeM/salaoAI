import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from "@nestjs/common";
import { ProfessionalsService } from "./professionals.service";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Role } from "@prisma/client";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UpdateUserDto } from "../users/dto/update-user.dto";

interface AuthenticatedUser {
  id: string;
  salon_id?: string;
  role?: Role;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface CreateProfessionalBodyDto {
  userData: CreateUserDto;
  specialties?: string[];
}

interface UpdateProfessionalBodyDto {
  userData?: UpdateUserDto;
  specialties?: string[];
  active?: boolean;
  workingHours?: any;
}

@ApiTags("professionals")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/professionals")
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @ApiOperation({
    summary: "Listar todos os profissionais do salão do usuário",
  })
  @ApiResponse({ status: 200, description: "Lista de profissionais" })
  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new NotFoundException("Usuário não associado a um salão.");
    }
    return this.professionalsService.findAll({ salonId });
  }

  @ApiOperation({ summary: "Obter um profissional específico" })
  @ApiResponse({ status: 200, description: "Detalhes do profissional" })
  @ApiResponse({ status: 404, description: "Profissional não encontrado" })
  @Get(":id")
  findOne(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new NotFoundException("Usuário não associado a um salão.");
    }
    return this.professionalsService.findOne(id, salonId);
  }

  @ApiOperation({ summary: "Criar um novo profissional associado ao salão" })
  @ApiResponse({ status: 201, description: "Profissional criado com sucesso" })
  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createProfessionalDto: CreateProfessionalBodyDto,
  ) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new NotFoundException("Usuário não associado a um salão.");
    }
    const dataToCreate = {
      ...createProfessionalDto,
      salonId: salonId,
      role: Role.PROFESSIONAL,
    };
    return this.professionalsService.create(dataToCreate);
  }

  @ApiOperation({ summary: "Atualizar um profissional existente" })
  @ApiResponse({
    status: 200,
    description: "Profissional atualizado com sucesso",
  })
  @ApiResponse({ status: 404, description: "Profissional não encontrado" })
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateProfessionalDto: UpdateProfessionalBodyDto,
  ) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new NotFoundException("Usuário não associado a um salão.");
    }
    return this.professionalsService.update(id, salonId, updateProfessionalDto);
  }

  @ApiOperation({ summary: "Remover um profissional (exclusão lógica?)" })
  @ApiResponse({
    status: 200,
    description: "Profissional removido/desativado com sucesso",
  })
  @ApiResponse({ status: 404, description: "Profissional não encontrado" })
  @Delete(":id")
  remove(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new NotFoundException("Usuário não associado a um salão.");
    }
    return this.professionalsService.remove(id, salonId);
  }

  @ApiOperation({ summary: "Convidar um profissional por email" })
  @ApiResponse({ status: 200, description: "Convite enviado com sucesso" })
  @Post("invite")
  invite(
    @Request() req: AuthenticatedRequest,
    @Body() inviteDto: { email: string; message?: string },
  ) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new NotFoundException("Usuário não associado a um salão.");
    }
    return this.professionalsService.invite(
      inviteDto.email,
      salonId,
      inviteDto.message,
    );
  }
}
