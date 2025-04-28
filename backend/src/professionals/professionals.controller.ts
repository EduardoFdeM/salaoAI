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
} from "@nestjs/common";
import { ProfessionalsService } from "./professionals.service";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

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
  findAll(@Request() req: any) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.professionalsService.findAll(salonId);
  }

  @ApiOperation({ summary: "Obter um profissional específico" })
  @ApiResponse({ status: 200, description: "Detalhes do profissional" })
  @ApiResponse({ status: 404, description: "Profissional não encontrado" })
  @Get(":id")
  findOne(@Param("id") id: string, @Request() req: any) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.professionalsService.findOne(id, salonId);
  }

  @ApiOperation({ summary: "Criar um novo profissional" })
  @ApiResponse({ status: 201, description: "Profissional criado com sucesso" })
  @Post()
  create(@Request() req: any, @Body() createProfessionalDto: any) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    const data = { ...createProfessionalDto, salonId };
    return this.professionalsService.create(data);
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
    @Request() req: any,
    @Body() updateProfessionalDto: any,
  ) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.professionalsService.update(id, salonId, updateProfessionalDto);
  }

  @ApiOperation({ summary: "Remover um profissional" })
  @ApiResponse({
    status: 200,
    description: "Profissional removido com sucesso",
  })
  @ApiResponse({ status: 404, description: "Profissional não encontrado" })
  @Delete(":id")
  remove(@Param("id") id: string, @Request() req: any) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.professionalsService.remove(id, salonId);
  }

  @ApiOperation({ summary: "Convidar um profissional por email" })
  @ApiResponse({ status: 200, description: "Convite enviado com sucesso" })
  @Post("invite")
  invite(
    @Request() req: any,
    @Body() inviteDto: { email: string; message?: string },
  ) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.professionalsService.invite(
      inviteDto.email,
      salonId,
      inviteDto.message,
    );
  }
} 