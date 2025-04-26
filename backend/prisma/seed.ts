import { PrismaClient, Role, AppointmentStatus, Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Limpar tabelas existentes - REMOVIDO pois o reset faz isso

    // --- Criação de Usuários ---
    console.log("Criando usuários...");
    // Senhas
    const superuserPasswordHash = await bcrypt.hash("superuser123", 10);
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const ownerGenericPasswordHash = await bcrypt.hash("salon123", 10);
    const professionalGenericPasswordHash = await bcrypt.hash("professional123", 10);
    const receptionistGenericPasswordHash = await bcrypt.hash("receptionist123", 10);
    const defaultPasswordHash = await bcrypt.hash("senha123", 10); // Senha padrão para os específicos

    // -- Usuários de Teste Genéricos --
    const superuserUser = await prisma.user.create({
      data: {
        name: "Super Usuário",
        email: "superuser@example.com",
        phone: "00000000000", // Telefone único
        passwordHash: superuserPasswordHash,
        isSystemAdmin: true, // Superusuário também é admin de sistema
      },
    });
    console.log(`Superusuário criado: ${superuserUser.email}`);

    const adminUser = await prisma.user.create({
      data: {
        name: "Admin Genérico",
        email: "admin@example.com",
        phone: "00000000001", // Telefone único
        passwordHash: adminPasswordHash,
        isSystemAdmin: true,
      },
    });
    console.log(`Admin Genérico criado: ${adminUser.email}`);

    const ownerGenericUser = await prisma.user.create({
      data: {
        name: "Dono Genérico Salão",
        email: "salon@example.com",
        phone: "00000000002", // Telefone único
        passwordHash: ownerGenericPasswordHash,
      },
    });
    console.log(`Dono Genérico criado: ${ownerGenericUser.email}`);

    const professionalGenericUser = await prisma.user.create({
      data: {
        name: "Profissional Genérico",
        email: "professional@example.com",
        phone: "00000000003", // Telefone único
        passwordHash: professionalGenericPasswordHash,
      },
    });
    console.log(`Profissional Genérico criado: ${professionalGenericUser.email}`);

    const receptionistGenericUser = await prisma.user.create({
      data: {
        name: "Recepcionista Genérico",
        email: "receptionist@example.com",
        phone: "00000000004", // Telefone único
        passwordHash: receptionistGenericPasswordHash,
      },
    });
    console.log(`Recepcionista Genérico criado: ${receptionistGenericUser.email}`);


    // -- Usuários Específicos (mantidos do seed anterior) --
    // Criar usuário Dono de Salão (Específico)
    const ownerUser = await prisma.user.create({
        data: {
        name: "Maria Silva (Dona)",
        email: "maria.dona@email.com", // Email específico
          phone: "11911111111", // Telefone específico
        passwordHash: defaultPasswordHash,
      },
    });
    console.log(`Dono Específico criado: ${ownerUser.email}`);

    // Criar Usuário Profissional 1 (Específico)
    const professionalUser1 = await prisma.user.create({
        data: {
        name: "Ana Oliveira (Profissional)",
        email: "ana.pro@email.com", // Email específico
          phone: "11922222222", // Telefone específico
        passwordHash: defaultPasswordHash,
      },
    });
    console.log(`Profissional Específico 1 criado: ${professionalUser1.email}`);

    // Criar Usuário Profissional 2 (Específico)
    const professionalUser2 = await prisma.user.create({
        data: {
        name: "João Santos (Profissional)",
        email: "joao.pro@email.com", // Email específico
          phone: "11933333333", // Telefone específico
        passwordHash: defaultPasswordHash,
      },
    });
    console.log(`Profissional Específico 2 criado: ${professionalUser2.email}`);

    // Criar Usuário Recepcionista (Específico)
    const receptionistUser = await prisma.user.create({
        data: {
        name: "Clara Luz (Recepcionista)",
        email: "clara.recep@email.com", // Email específico
          phone: "11944444444", // Telefone específico
        passwordHash: defaultPasswordHash,
      },
    });
    console.log(`Recepcionista Específico criado: ${receptionistUser.email}`);

    // --- Criação do Salão ---
    console.log("Criando salão...");
    const businessHoursData: Prisma.JsonObject = {
      monday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      tuesday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      wednesday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      thursday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      friday: { isOpen: true, slots: [{ start: "09:00", end: "20:00" }] },
      saturday: { isOpen: true, slots: [{ start: "09:00", end: "16:00" }] },
      sunday: { isOpen: false, slots: [] },
    };
    const notificationSettingsData: Prisma.JsonObject = {
      appointmentConfirmation: true,
      appointmentReminderHoursBefore: [24, 2],
      cancellationConfirmation: true,
      rescheduleConfirmation: true,
    };

    const exampleSalon = await prisma.salon.create({
      data: {
        name: "Salão Beleza Total",
        address: "Rua das Flores, 123 - Centro",
        phone: "11999998888",
        email: "contato@belezatotal.com",
        logoUrl: null,
        businessHours: businessHoursData,
        notificationSettings: notificationSettingsData,
      },
    });
    console.log(`Salão criado: ${exampleSalon.name} (ID: ${exampleSalon.id})`);


    // --- Criação de Serviços do Salão ---
    console.log("Criando serviços...");
    const serviceCut = await prisma.service.create({
        data: {
          salonId: exampleSalon.id,
          name: "Corte Feminino",
        description: "Corte moderno, inclui lavagem e secagem básica.",
        price: 90.0,
        duration: 60,
      },
    });
    const serviceColor = await prisma.service.create({
        data: {
          salonId: exampleSalon.id,
        name: "Coloração Raiz",
        description: "Aplicação de coloração na raiz.",
        price: 120.0,
        duration: 90,
      },
    });
    const serviceManicure = await prisma.service.create({
        data: {
          salonId: exampleSalon.id,
        name: "Manicure Simples",
        description: "Cutilagem e esmaltação.",
        price: 35.0,
        duration: 45,
      },
    });
    console.log("Serviços criados:", serviceCut.name, serviceColor.name, serviceManicure.name);

    // --- Associação Usuários ao Salão (SalonUser) ---
    console.log("Associando usuários ao salão...");
    const ownerWorkingHours: Prisma.JsonObject = businessHoursData;
    const prof1WorkingHours: Prisma.JsonObject = {
      monday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      tuesday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      wednesday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      thursday: { isOpen: false, slots: [] },
      friday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      saturday: { isOpen: true, slots: [{ start: "09:00", end: "14:00" }] },
      sunday: { isOpen: false, slots: [] },
    };
    const prof2WorkingHours: Prisma.JsonObject = {
      monday: { isOpen: false, slots: [] },
      tuesday: { isOpen: true, slots: [{ start: "11:00", end: "20:00" }] },
      wednesday: { isOpen: true, slots: [{ start: "11:00", end: "20:00" }] },
      thursday: { isOpen: true, slots: [{ start: "11:00", end: "20:00" }] },
      friday: { isOpen: true, slots: [{ start: "11:00", end: "20:00" }] },
      saturday: { isOpen: true, slots: [{ start: "10:00", end: "16:00" }] },
      sunday: { isOpen: false, slots: [] },
    };

    // Associar Dono Específico
    await prisma.salonUser.create({
      data: {
        userId: ownerUser.id, // Específico
        salonId: exampleSalon.id,
        role: Role.OWNER,
        workingHours: ownerWorkingHours,
      },
    });

    // Associar Profissional Específico 1
    const professionalSalonUser1 = await prisma.salonUser.create({
      data: {
        userId: professionalUser1.id, // Específico
        salonId: exampleSalon.id,
        role: Role.PROFESSIONAL,
        workingHours: prof1WorkingHours,
      },
    });

    // Associar Profissional Específico 2
    const professionalSalonUser2 = await prisma.salonUser.create({
      data: {
        userId: professionalUser2.id, // Específico
        salonId: exampleSalon.id,
        role: Role.PROFESSIONAL,
        workingHours: prof2WorkingHours,
      },
    });

    // Associar Recepcionista Específico
    await prisma.salonUser.create({
      data: {
        userId: receptionistUser.id, // Específico
        salonId: exampleSalon.id,
        role: Role.RECEPTIONIST,
      },
    });

    // Associar Dono Genérico
     await prisma.salonUser.create({
      data: {
        userId: ownerGenericUser.id, // Genérico
        salonId: exampleSalon.id,
        role: Role.OWNER,
        // Pode adicionar workingHours se necessário
      },
    });

    // Associar Profissional Genérico
    await prisma.salonUser.create({
      data: {
        userId: professionalGenericUser.id, // Genérico
        salonId: exampleSalon.id,
        role: Role.PROFESSIONAL,
         // Pode adicionar workingHours se necessário
      },
    });

    // Associar Recepcionista Genérico
    await prisma.salonUser.create({
      data: {
        userId: receptionistGenericUser.id, // Genérico
        salonId: exampleSalon.id,
        role: Role.RECEPTIONIST,
      },
    });
    console.log("Usuários associados ao salão.");

    // --- Criação de Clientes (Exemplo) ---
    console.log("Criando clientes...");
    const client1 = await prisma.client.create({
        data: {
          salonId: exampleSalon.id,
        name: "Fernanda Lima",
        phone: "11987654321",
        email: "fernanda.lima@email.com",
        notes: "Prefere produtos sem parabenos.",
      },
    });
    const client2 = await prisma.client.create({
        data: {
          salonId: exampleSalon.id,
        name: "Ricardo Alves",
        phone: "11912345678",
        email: "ricardo.alves@email.com",
        notes: "Cliente antigo.",
      },
    });
    console.log("Clientes criados:", client1.name, client2.name);

    // --- Associação Serviços aos Profissionais (ProfessionalService) ---
    console.log("Associando serviços aos profissionais...");
    await prisma.professionalService.createMany({
      data: [
        {
          professionalId: professionalSalonUser1.id,
          serviceId: serviceCut.id,
          price: 90.0,
          durationMinutes: 60,
        },
        {
          professionalId: professionalSalonUser1.id,
          serviceId: serviceManicure.id,
          price: 35.0,
          durationMinutes: 45,
        },
      ],
    });
    await prisma.professionalService.createMany({
      data: [
        {
          professionalId: professionalSalonUser2.id,
          serviceId: serviceCut.id,
          price: 95.0,
          durationMinutes: 55,
        },
        {
          professionalId: professionalSalonUser2.id,
          serviceId: serviceColor.id,
          price: 120.0,
          durationMinutes: 90,
        },
      ],
    });
    console.log("Serviços associados aos profissionais.");

    // --- Criação de Agendamentos (Exemplo) ---
    console.log("Criando agendamentos de exemplo...");
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const appointment1 = await prisma.appointment.create({
        data: {
          salonId: exampleSalon.id,
        clientId: client1.id,
        professionalId: professionalSalonUser1.id, // Profissional específico
        serviceId: serviceCut.id,
        startTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
        status: AppointmentStatus.CONFIRMED,
        price: 90.0,
        notes: "Cliente pediu confirmação por WhatsApp.",
      },
    });

    const appointment2 = await prisma.appointment.create({
        data: {
          salonId: exampleSalon.id,
        clientId: client2.id,
        professionalId: professionalSalonUser2.id, // Profissional específico
        serviceId: serviceColor.id,
        startTime: new Date(nextWeek.setHours(14, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(15, 30, 0, 0)),
        status: AppointmentStatus.PENDING,
        price: 120.0,
      },
    });
    console.log("Agendamentos de exemplo criados.");

    // --- Resumo Final ---
    console.log("-------------------------------------------");
    console.log("SEED COMPLETADO COM SUCESSO!");
    console.log("-------------------------------------------");
    console.log("Usuários de Teste:");
    console.log("  - Superusuário:", superuserUser.email, "/ superuser123");
    console.log("  - Admin:", adminUser.email, "/ admin123");
    console.log("Salão:", exampleSalon.name, `(ID: ${exampleSalon.id})`);
    console.log("  - Dono Genérico:", ownerGenericUser.email, "/ salon123");
    console.log("  - Profissional Genérico:", professionalGenericUser.email, "/ professional123");
    console.log("  - Recepcionista Genérico:", receptionistGenericUser.email, "/ receptionist123");
    console.log("  ---");
    console.log("  - Dona Específica:", ownerUser.email, "/ senha123");
    console.log("  - Profissional Específico 1:", professionalUser1.email, "/ senha123");
    console.log("  - Profissional Específico 2:", professionalUser2.email, "/ senha123");
    console.log("  - Recepcionista Específico:", receptionistUser.email, "/ senha123");
    console.log("Clientes:");
    console.log("  -", client1.name, `(${client1.phone})`);
    console.log("  -", client2.name, `(${client2.phone})`);
    console.log("Agendamentos:");
    console.log(`  - ${appointment1.id.substring(0,8)}... (${appointment1.status}) - ${client1.name} com Profissional ID ${appointment1.professionalId.substring(0,8)}...`);
    console.log(`  - ${appointment2.id.substring(0,8)}... (${appointment2.status}) - ${client2.name} com Profissional ID ${appointment2.professionalId.substring(0,8)}...`);
    console.log("-------------------------------------------");

    // Criar uma franquia de exemplo
    console.log("Criando franquia de exemplo...");
    const exampleFranchise = await prisma.franchise.create({
      data: {
        name: "Rede Beleza Brasil",
        description: "Rede nacional de salões de beleza premium",
        logoUrl: "https://exemplo.com/logos/belezabrasil.png",
        active: true,
      },
    });
    console.log(`Franquia criada: ${exampleFranchise.name} (ID: ${exampleFranchise.id})`);

    // Criar usuário dono de franquia
    const franchiseOwnerPasswordHash = await bcrypt.hash("franchise123", 10);
    const franchiseOwnerUser = await prisma.user.create({
      data: {
        name: "Roberto Franquia",
        email: "franchise@example.com",
        phone: "11900000000",
        passwordHash: franchiseOwnerPasswordHash,
      },
    });
    console.log(`Dono de Franquia criado: ${franchiseOwnerUser.email}`);

    // Associar usuário à franquia
    await prisma.franchiseOwner.create({
      data: {
        franchiseId: exampleFranchise.id,
        userId: franchiseOwnerUser.id,
      }
    });

    // Associar salão existente à franquia
    await prisma.salon.update({
      where: { id: exampleSalon.id },
      data: { franchiseId: exampleFranchise.id }
    });

    // Criar um segundo salão para a mesma franquia
    const secondSalon = await prisma.salon.create({
      data: {
        name: "Beleza Total - Filial 2",
        address: "Av. Paulista, 1000 - Centro",
        phone: "11988887777",
        email: "filial2@belezatotal.com",
        logoUrl: null,
        businessHours: businessHoursData,
        notificationSettings: notificationSettingsData,
        franchiseId: exampleFranchise.id,
      },
    });
    console.log(`Segundo salão criado: ${secondSalon.name} (ID: ${secondSalon.id})`);

    // Adicionar na seção de resumo final
    console.log("  - Franquia:", exampleFranchise.name, `(ID: ${exampleFranchise.id})`);
    console.log("  - Dono de Franquia:", franchiseOwnerUser.email, "/ franchise123");

  } catch (error) {
    console.error("Erro detalhado ao executar seeds:", error);
    process.exitCode = 1;
  } finally {
    console.log("Desconectando Prisma Client...");
    await prisma.$disconnect();
    console.log("Prisma Client desconectado.");
  }
}

main()
  .then(() => {
    process.exit(process.exitCode ?? 0);
  })
  .catch((e) => {
    console.error("Erro crítico durante a execução do script de seed:", e);
    process.exit(1);
  }); 