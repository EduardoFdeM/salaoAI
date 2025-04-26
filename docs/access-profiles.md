# Perfis de Acesso do Sistema

Este documento descreve os diferentes perfis de acesso do sistema, suas permissões e funcionalidades disponíveis.

## Visão Geral dos Perfis

O sistema possui quatro perfis de acesso principais, cada um com permissões específicas:

| Perfil        | Código         | Descrição                                             |
| ------------- | -------------- | ----------------------------------------------------- |
| Administrador | `ADMIN`        | Gerencia todo o sistema, incluindo múltiplos salões   |
| Dono de Salão | `SALON_OWNER`  | Gerencia seu próprio salão e todas suas configurações |
| Profissional  | `PROFESSIONAL` | Acessa sua agenda e gerencia seus serviços            |
| Recepcionista | `RECEPTIONIST` | Gerencia agendamentos e atendimento de clientes       |

## Detalhamento de Permissões

### Administrador (`ADMIN`)

O administrador tem acesso total ao sistema e pode:

- **Salões**:
  - Visualizar todos os salões cadastrados
  - Criar, editar e desativar salões
  - Monitorar métricas de todos os salões
- **Usuários**:
  - Gerenciar todos os usuários do sistema
  - Definir perfis de acesso
  - Resetar senhas
- **Planos e Pagamentos**:
  - Configurar planos de assinatura
  - Visualizar histórico de pagamentos
  - Gerenciar status das assinaturas
- **Suporte**:
  - Acessar tickets de suporte
  - Responder dúvidas de usuários
  - Monitorar problemas reportados
- **Relatórios**:
  - Gerar relatórios globais do sistema
  - Visualizar métricas de uso e faturamento
  - Acompanhar métricas de crescimento
- **Configurações do Sistema**:
  - Ajustar configurações globais
  - Gerenciar integrações (WhatsApp, pagamentos)
  - Realizar manutenções no sistema

### Dono de Salão (`SALON_OWNER`)

O dono do salão gerencia seu estabelecimento e pode:

- **Dashboard**:
  - Visualizar métricas do seu salão
  - Acompanhar agendamentos do dia
  - Monitorar desempenho financeiro
- **Profissionais**:
  - Cadastrar e gerenciar profissionais
  - Definir especialidades e serviços de cada profissional
  - Configurar disponibilidade e agenda
- **Serviços**:
  - Criar e gerenciar catálogo de serviços
  - Definir preços e duração
  - Organizar serviços por categorias
- **Clientes**:
  - Gerenciar cadastro de clientes
  - Visualizar histórico de atendimentos
  - Registrar preferências e observações
- **Agendamentos**:
  - Visualizar e gerenciar todos os agendamentos
  - Fazer alterações em qualquer agendamento
  - Configurar regras de agendamento
- **Configurações do Salão**:
  - Ajustar informações do estabelecimento
  - Definir horários de funcionamento
  - Configurar integração com WhatsApp
- **Financeiro**:
  - Acompanhar faturamento
  - Visualizar relatórios financeiros
  - Gerenciar plano de assinatura

### Profissional (`PROFESSIONAL`)

O profissional acessa suas informações de trabalho e pode:

- **Agenda Pessoal**:
  - Visualizar seus agendamentos
  - Confirmar ou cancelar atendimentos
  - Registrar conclusão de serviços
- **Clientes Atendidos**:
  - Visualizar histórico de clientes atendidos
  - Acessar observações e preferências
  - Registrar notas sobre atendimentos
- **Serviços Realizados**:
  - Visualizar tipos de serviços que realiza
  - Ver estatísticas de serviços mais realizados
  - Registrar tempo médio de cada serviço
- **Disponibilidade**:
  - Configurar dias e horários disponíveis
  - Solicitar folgas ou ausências
  - Visualizar carga horária

### Recepcionista (`RECEPTIONIST`)

O recepcionista gerencia o atendimento aos clientes e pode:

- **Agendamentos**:
  - Criar e gerenciar agendamentos
  - Realizar check-in de clientes
  - Reagendar e cancelar horários
- **Clientes**:
  - Cadastrar novos clientes
  - Pesquisar e editar dados de clientes
  - Visualizar histórico de atendimentos
- **Agenda do Salão**:
  - Visualizar agenda completa do salão
  - Verificar disponibilidade de profissionais
  - Otimizar distribuição de horários
- **Comunicação**:
  - Enviar confirmações e lembretes
  - Responder mensagens de WhatsApp
  - Atender chamadas e registrar contatos
- **Caixa**:
  - Registrar pagamentos
  - Emitir recibos
  - Fechar caixa diário

## Perfil de Dono de Franquia (`FRANCHISE_OWNER`)

O dono de franquia gerencia uma rede de salões e pode:

- **Dashboard da Franquia**:

  - Visualizar métricas consolidadas de todos os salões
  - Acompanhar crescimento da rede
  - Identificar tendências entre diferentes unidades

- **Gestão de Salões**:

  - Visualizar todos os salões da franquia
  - Acessar cada salão individualmente
  - Configurar políticas comuns para todos os salões

- **Configurações da Franquia**:

  - Definir identidade visual padronizada
  - Estabelecer catálogo de serviços comum
  - Configurar preços sugeridos
  - Definir políticas de atendimento

- **Relatórios Consolidados**:

  - Comparativos entre unidades
  - Desempenho financeiro global
  - Análise de ocupação e eficiência

- **Gestão de Conhecimento**:
  - Distribuir materiais de treinamento
  - Compartilhar boas práticas entre unidades
  - Comunicar-se com todos os gerentes

### Simulação de Uso: Dono de Franquia
Fluxo Principal:
1. Login: Dono de franquia faz login com suas credenciais

2. Dashboard da Franquia: É redirecionado para a visão geral da franquia, mostrando:
* Total de agendamentos em toda a rede
* Faturamento consolidado
* Ranking de salões por desempenho
* Alertas de problemas em qualquer unidade

3. Navegação entre Salões:
* Seleciona um salão específico do menu lateral
* Visualiza dados detalhados daquele salão
* Pode fazer alterações específicas para aquela unidade

4. Aplicação de Políticas Globais:
* Acessa "Configurações de Franquia"
* Define um novo serviço padrão que aparecerá em todos os salões
* Configura um desconto promocional para toda a rede

### Casos Especiais:
1. Dono de Franquia que também é Dono de Salão
* Sistema identifica os dois papéis durante login
* Oferece opção de alternar entre visão de franquia e visão de salão específico
* Mantém permissões adequadas em cada contexto
2. Acesso Hierárquico
* Um diretor regional poderia ter acesso apenas aos salões de sua região
* Configurável através de subgrupos de salões dentro da franquia

### Funcionalidades Adicionais Desejáveis
1. Programa de Fidelidade Unificado:
* Cliente pode acumular pontos em qualquer unidade
* Histórico de atendimento centralizado
2. Central de Agendamentos:
* Sistema poderia redirecionar clientes para salões com disponibilidade
* Balanceamento de carga entre unidades próximas
3. Métricas Avançadas para Franquias:
* Análise de desempenho comparativa
* Previsões de crescimento baseadas em dados históricos
* Identificação de unidades que precisam de suporte
___

## Fluxos de Acesso

### Fluxo de Acesso do Administrador

1. Acessa o sistema pela URL principal
2. Faz login com credenciais administrativas
3. É redirecionado para o Dashboard Administrativo (`/admin/dashboard`)
4. Navega pelo menu administrativo com todas as funcionalidades

### Fluxo de Acesso do Dono de Salão

1. Acessa o sistema pela URL principal
2. Faz login com suas credenciais
3. É redirecionado para o Dashboard do Salão (`/salon/dashboard`)
4. Navega pelo menu do salão com funcionalidades de gestão

### Fluxo de Acesso do Profissional

1. Acessa o sistema pela URL principal ou específica
2. Faz login com suas credenciais
3. É redirecionado para sua Agenda Pessoal (`/professional/agenda`)
4. Visualiza menu simplificado com suas funcionalidades

### Fluxo de Acesso do Recepcionista

1. Acessa o sistema pela URL principal ou específica
2. Faz login com suas credenciais
3. É redirecionado para a Agenda do Dia (`/reception/agenda`)
4. Acessa menu com ferramentas de atendimento ao cliente

## Implementação no Código

No frontend, o tipo de usuário é armazenado no contexto de autenticação e utilizado para controlar:

1. Redirecionamento após login
2. Exibição de componentes condicionais
3. Proteção de rotas baseada no perfil

## Considerações de Segurança

- As permissões são verificadas tanto no frontend quanto no backend
- O frontend implementa proteção de rotas com `PrivateRoute`
- Todas as operações sensíveis requerem verificação adicional no backend
- Tokens JWT incluem o perfil do usuário, mas a verificação final ocorre sempre no backend
