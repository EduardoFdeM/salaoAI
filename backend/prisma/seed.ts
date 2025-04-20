import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Limpar tabelas existentes
    await prisma.appointmentHistory.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.professionalService.deleteMany();
    await prisma.service.deleteMany();
    await prisma.salonUser.deleteMany();
    await prisma.user.deleteMany();
    await prisma.salon.deleteMany();

    console.log("Banco de dados limpo.");

    // Hash padrão para senha 'senha123'
    const passwordHash = await bcrypt.hash("senha123", 10);
    
    // Hash para senhas específicas
    const superuserHash = await bcrypt.hash("superuser123", 10);
    const adminHash = await bcrypt.hash("admin123", 10);
    const salonHash = await bcrypt.hash("salon123", 10);
    const professionalHash = await bcrypt.hash("professional123", 10);
    const receptionistHash = await bcrypt.hash("receptionist123", 10);

    // Criar usuários administrativos (sem vínculo com salão)
    const adminUsers = await Promise.all([
      // Superusuário
      prisma.user.create({
        data: {
          name: "Super Usuário",
          email: "superuser@example.com",
          phone: "11900000000",
          passwordHash: superuserHash
        }
      }),
      
      // Administrador
      prisma.user.create({
        data: {
          name: "Administrador",
          email: "admin@example.com",
          phone: "11911111111",
          passwordHash: adminHash
        }
      }),
      
      // Dono genérico
      prisma.user.create({
        data: {
          name: "Dono de Salão",
          email: "salon@example.com",
          phone: "11922222222",
          passwordHash: salonHash
        }
      }),
      
      // Profissional genérico
      prisma.user.create({
        data: {
          name: "Profissional Genérico",
          email: "professional@example.com",
          phone: "11933333333",
          passwordHash: professionalHash
        }
      }),
      
      // Recepcionista genérico
      prisma.user.create({
        data: {
          name: "Recepcionista Genérico",
          email: "receptionist@example.com",
          phone: "11944444444",
          passwordHash: receptionistHash
        }
      })
    ]);

    // Criar salão exemplo
    const exampleSalon = await prisma.salon.create({
      data: {
        name: "Salão Beleza Total",
        address: "Rua das Flores, 123 - Centro",
        phone: "11999998888",
        email: "contato@belezatotal.com",
        businessHours: {
          monday: {
            isOpen: true,
            slots: [{ start: "09:00", end: "18:00" }]
          },
          tuesday: {
            isOpen: true,
            slots: [{ start: "09:00", end: "18:00" }]
          },
          wednesday: {
            isOpen: true,
            slots: [{ start: "09:00", end: "18:00" }]
          },
          thursday: {
            isOpen: true,
            slots: [{ start: "09:00", end: "18:00" }]
          },
          friday: {
            isOpen: true,
            slots: [{ start: "09:00", end: "20:00" }]
          },
          saturday: {
            isOpen: true,
            slots: [{ start: "09:00", end: "16:00" }]
          },
          sunday: {
            isOpen: false,
            slots: []
          }
        },
        notificationSettings: {
          appointmentConfirmation: true,
          appointmentReminder: true,
          marketingMessages: false,
          whatsappEnabled: true,
          emailEnabled: true
        }
      }
    });

    // Criar serviços
    const services = await Promise.all([
      prisma.service.create({
        data: {
          salonId: exampleSalon.id,
          name: "Corte Feminino",
          description: "Corte, lavagem e finalização",
          price: 80.0,
          duration: 60
        }
      }),
      prisma.service.create({
        data: {
          salonId: exampleSalon.id,
          name: "Coloração",
          description: "Coloração completa com produtos de primeira linha",
          price: 150.0,
          duration: 120
        }
      }),
      prisma.service.create({
        data: {
          salonId: exampleSalon.id,
          name: "Manicure",
          description: "Tratamento completo para unhas",
          price: 45.0,
          duration: 45
        }
      })
    ]);

    // Criar usuários do salão
    const users = await Promise.all([
      // Dono do Salão
      prisma.user.create({
        data: {
          name: "Maria Silva",
          email: "maria@belezatotal.com",
          phone: "11999990000",
          passwordHash
        }
      }),
      
      // Profissional 1
      prisma.user.create({
        data: {
          name: "Ana Oliveira",
          email: "ana@belezatotal.com",
          phone: "11999991111",
          passwordHash
        }
      }),
      
      // Profissional 2
      prisma.user.create({
        data: {
          name: "João Santos",
          email: "joao@belezatotal.com",
          phone: "11999992222",
          passwordHash
        }
      }),
      
      // Recepcionista
      prisma.user.create({
        data: {
          name: "Clara Luz",
          email: "clara@belezatotal.com",
          phone: "11999993333",
          passwordHash
        }
      })
    ]);

    // Associar salão genérico ao usuário genérico
    await prisma.salonUser.create({
      data: {
        userId: adminUsers[2].id, // Dono genérico (salon@example.com)
        salonId: exampleSalon.id,
        role: Role.OWNER,
        workingHours: {
          monday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          tuesday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          wednesday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          thursday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          friday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          saturday: { isWorking: true, slots: [{ start: "09:00", end: "14:00" }] },
          sunday: { isWorking: false, slots: [] }
        }
      }
    });

    // Associar profissional genérico ao salão
    const genericProfessionalSalonUser = await prisma.salonUser.create({
      data: {
        userId: adminUsers[3].id, // Profissional genérico (professional@example.com)
        salonId: exampleSalon.id,
        role: Role.PROFESSIONAL,
        workingHours: {
          monday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          tuesday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          wednesday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          thursday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          friday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
          saturday: { isWorking: true, slots: [{ start: "09:00", end: "14:00" }] },
          sunday: { isWorking: false, slots: [] }
        }
      }
    });

    // Associar recepcionista genérico ao salão
    await prisma.salonUser.create({
      data: {
        userId: adminUsers[4].id, // Recepcionista genérico (receptionist@example.com)
        salonId: exampleSalon.id,
        role: Role.RECEPTIONIST
      }
    });

    // Associar usuários do salão
    const salonUsers = await Promise.all([
      // Dono
      prisma.salonUser.create({
        data: {
          userId: users[0].id,
          salonId: exampleSalon.id,
          role: Role.OWNER,
          workingHours: {
            monday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            tuesday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            wednesday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            thursday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            friday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            saturday: { isWorking: true, slots: [{ start: "09:00", end: "14:00" }] },
            sunday: { isWorking: false, slots: [] }
          }
        }
      }),

      // Profissional 1
      prisma.salonUser.create({
        data: {
          userId: users[1].id,
          salonId: exampleSalon.id,
          role: Role.PROFESSIONAL,
          workingHours: {
            monday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            tuesday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            wednesday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            thursday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            friday: { isWorking: true, slots: [{ start: "09:00", end: "18:00" }] },
            saturday: { isWorking: true, slots: [{ start: "09:00", end: "14:00" }] },
            sunday: { isWorking: false, slots: [] }
          }
        }
      }),

      // Profissional 2
      prisma.salonUser.create({
        data: {
          userId: users[2].id,
          salonId: exampleSalon.id,
          role: Role.PROFESSIONAL,
          workingHours: {
            monday: { isWorking: true, slots: [{ start: "12:00", end: "20:00" }] },
            tuesday: { isWorking: true, slots: [{ start: "12:00", end: "20:00" }] },
            wednesday: { isWorking: true, slots: [{ start: "12:00", end: "20:00" }] },
            thursday: { isWorking: true, slots: [{ start: "12:00", end: "20:00" }] },
            friday: { isWorking: true, slots: [{ start: "12:00", end: "20:00" }] },
            saturday: { isWorking: true, slots: [{ start: "10:00", end: "16:00" }] },
            sunday: { isWorking: false, slots: [] }
          }
        }
      }),

      // Recepcionista
      prisma.salonUser.create({
        data: {
          userId: users[3].id,
          salonId: exampleSalon.id,
          role: Role.RECEPTIONIST
        }
      })
    ]);

    // Criar serviços dos profissionais
    await Promise.all([
      // Serviços do Profissional 1
      ...services.map((service) => 
        prisma.professionalService.create({
          data: {
            professionalId: salonUsers[1].id,
            serviceId: service.id,
            price: Math.floor(Math.random() * 100) + 50,
            durationMinutes: 60
          }
        })
      ),
      // Serviços do Profissional 2
      ...services.map((service) => 
        prisma.professionalService.create({
          data: {
            professionalId: salonUsers[2].id,
            serviceId: service.id,
            price: Math.floor(Math.random() * 100) + 50,
            durationMinutes: 60
          }
        })
      ),
      // Serviços do Profissional Genérico
      ...services.map((service) => 
        prisma.professionalService.create({
          data: {
            professionalId: genericProfessionalSalonUser.id,
            serviceId: service.id,
            price: Math.floor(Math.random() * 100) + 50,
            durationMinutes: 60
          }
        })
      )
    ]);

    console.log("Dados de exemplo criados com sucesso!");
    console.log("----------------------------");
    console.log("Usuários administrativos:");
    console.log("- Superusuário: superuser@example.com / superuser123");
    console.log("- Administrador: admin@example.com / admin123");
    console.log("- Dono Genérico: salon@example.com / salon123");
    console.log("- Profissional Genérico: professional@example.com / professional123");
    console.log("- Recepcionista Genérico: receptionist@example.com / receptionist123");
    console.log("----------------------------");
    console.log("Usuários do salão:");
    console.log("- Dono: maria@belezatotal.com / senha123");
    console.log("- Profissional 1: ana@belezatotal.com / senha123");
    console.log("- Profissional 2: joao@belezatotal.com / senha123");
    console.log("- Recepcionista: clara@belezatotal.com / senha123");
    console.log("Salão criado com ID:", exampleSalon.id);

  } catch (error) {
    console.error("Erro ao executar seeds:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Erro ao executar seeds:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 