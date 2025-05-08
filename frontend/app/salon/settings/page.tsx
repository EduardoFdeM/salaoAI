"use client"

import { useState, ChangeEvent, SyntheticEvent, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PhoneInput } from '@/components/ui/phone-input'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth'
import { SalonSettingsData, SettingsFormData, BusinessHours } from '@/types/salon'
import { CheckCircle, Info } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

// Interface local para o estado do formulário, incluindo a nova config
// Poderia ser movido para types/salon.ts se preferir
interface ExtendedSettingsFormData extends SettingsFormData {
  clientRequiredFields?: {
    phone: boolean;
    email: boolean;
  };
  whatsappConnected?: boolean; // Manter para UI
  whatsappPhone?: string; // Manter para UI
  whatsappCountryCode?: string; // Manter para UI
  weekStartDay?: number; // Adicionar novo campo
}

// Adicionar novo tipo para horários
type TimeSlot = {
  start: string;
  end: string;
};

type DaySchedule = {
  isOpen: boolean;
  slots: TimeSlot[];
} | null;

// Adicionar componente de horário do dia
const DayScheduleInput = ({ 
  day, 
  schedule, 
  onChange, 
  disabled 
}: { 
  day: string;
  schedule: DaySchedule;
  onChange: (value: DaySchedule) => void;
  disabled: boolean;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium capitalize">{day}</Label>
        <Switch 
          checked={schedule?.isOpen ?? false}
          onCheckedChange={(checked) => {
            onChange(checked ? { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] } : null)
          }}
          disabled={disabled}
        />
      </div>
      {schedule?.isOpen && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="time"
              value={schedule.slots[0].start}
              onChange={(e) => {
                onChange({
                  ...schedule,
                  slots: [{ ...schedule.slots[0], start: e.target.value }]
                })
              }}
              disabled={disabled}
            />
          </div>
          <div>
            <Input
              type="time"
              value={schedule.slots[0].end}
              onChange={(e) => {
                onChange({
                  ...schedule,
                  slots: [{ ...schedule.slots[0], end: e.target.value }]
                })
              }}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Adicionar constantes para os nomes dos dias
const daysOfWeekPortuguese: { [key: string]: string } = {
  sunday: "Domingo",
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
};

const dayOrder = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<ExtendedSettingsFormData | null>(null)
  const [loading, setLoading] = useState(true);
  const [savingTabs, setSavingTabs] = useState<Record<string, boolean>>({}); // Estado de salvamento por aba
  const [whatsappPhone, setWhatsappPhone] = useState(''); // Apenas números
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+55'); // Estado para o código do país
  const [connecting, setConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // Estado de erro
  const { toast } = useToast();

  // Função para obter a ordem dos dias baseada na configuração
  const getOrderedDays = (startDay: number = 1): string[] => {
    if (startDay === 0) { // Começa no Domingo
      return dayOrder;
    }
    // Começa na Segunda (padrão)
    const sunday = dayOrder[0];
    const restOfWeek = dayOrder.slice(1);
    return [...restOfWeek, sunday];
  };

  // Função para buscar configurações
  const fetchSettings = async () => {
    setLoading(true);
      setError(null); // Limpa erro anterior
      try {
          const response = await fetch('/api/salon/settings'); // Chamar nossa API route
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Falha ao carregar configurações');
          }
          const data = await response.json();

          // Parse clientRequiredFields se for string JSON
          if (data.clientRequiredFields && typeof data.clientRequiredFields === 'string') {
               try {
                  data.clientRequiredFields = JSON.parse(data.clientRequiredFields);
               } catch (e) {
                  console.error("Erro ao parsear clientRequiredFields:", e);
                  data.clientRequiredFields = { phone: true, email: false }; // Fallback
               }
          } else if (!data.clientRequiredFields) {
              data.clientRequiredFields = { phone: true, email: false }; // Default se nulo/undefined
          }


          // Inicializar estado whatsapp (se necessário, backend pode retornar isso)
          // Por enquanto, mantemos a lógica local de inicialização
          setSettings({
              ...data,
              // Adicionar campos de UI se não vierem do backend
              whatsappConnected: data.whatsappStatus === 'CONNECTED', // Exemplo
              whatsappPhone: data.whatsappPhone || '',
              whatsappCountryCode: data.whatsappCountryCode || '+55',
          });

          // Lógica para inicializar estado local de whatsappPhone/CountryCode
          // (Ajustar conforme o que o backend /api/salon/settings retorna)
          if (data.whatsappStatus === 'CONNECTED' && data.whatsappPhone) {
               const phoneDigits = data.whatsappPhone.replace(/\D/g, '');
               // ... (lógica de detecção de DDI existente) ...
               setWhatsappPhone(phoneDigits); // Ajustar se necessário
          }

      } catch (err) {
          console.error("Erro ao buscar configurações:", err);
          setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar.');
          setSettings(null); // Limpar settings em caso de erro
      } finally {
          setLoading(false);
      }
  };


  useEffect(() => {
    fetchSettings(); // Chamar a função de busca
  }, []);

  // Atualizado para lidar com clientRequiredFields
  const handleInputChange = (
    field: keyof ExtendedSettingsFormData | `clientRequiredFields.${'phone' | 'email'}`,
    value: any
  ) => {
       setSettings(prev => {
        if (!prev) return null;

      if (field.startsWith('clientRequiredFields.')) {
        const subField = field.split('.')[1] as 'phone' | 'email';
        return {
          ...prev,
          clientRequiredFields: {
            ...(prev.clientRequiredFields ?? { phone: true, email: false }), // Garante objeto base
            [subField]: value,
          },
        };
      } else {
        // Correção: Garantir que field seja uma chave válida de ExtendedSettingsFormData
        const validField = field as keyof ExtendedSettingsFormData;
        return { ...prev, [validField]: value };
      }
    });
  }

  const handleBusinessHoursChange = (day: keyof BusinessHours, field: string, value: any) => {
     console.log("Atualizar horário:", day, field, value);
     setSettings(prev => {
       if (!prev || !prev.business_hours) return prev;
       const dayKey = day as keyof BusinessHours; // Tipagem
       const currentDaySchedule = prev.business_hours[dayKey];

       let updatedDaySchedule: DaySchedule;

       if (field === 'isOpen') {
           updatedDaySchedule = value ? { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] } : null;
       } else if (currentDaySchedule?.isOpen && (field === 'start' || field === 'end')) {
           // Garante que temos um slot antes de atualizar
           const updatedSlot = { ...(currentDaySchedule.slots[0] ?? { start: '', end: '' }), [field]: value };
           updatedDaySchedule = { ...currentDaySchedule, slots: [updatedSlot] };
       } else {
            // Não faz nada se o dia está fechado ou o campo é inválido
           return prev;
       }

       return {
         ...prev,
         business_hours: {
           ...prev.business_hours,
           [dayKey]: updatedDaySchedule,
         },
       };
    });
  }

  // handleSave atualizado
  const handleSave = async (tab: string) => {
    if (!settings) return;

    setSavingTabs(prev => ({ ...prev, [tab]: true }));

    let payload: Partial<ExtendedSettingsFormData> = {};
    // Usar snake_case como esperado pelo backend
    if (tab === 'general') {
        payload = {
            appointmentInterval: settings.appointment_interval, // Agora em camelCase
            bookingLeadTime: settings.booking_lead_time,     // Agora em camelCase
            bookingCancelLimit: settings.booking_cancel_limit, // Agora em camelCase
            clientRequiredFields: settings.clientRequiredFields,
            weekStartDay: settings.weekStartDay,
        };
    } else if (tab === 'whatsapp') {
         payload = {
            evolution_api_url: settings.evolution_api_url,     // snake_case
            evolution_api_key: settings.evolution_api_key,     // snake_case
            evolution_instance_name: settings.evolution_instance_name, // snake_case
        };
    } else if (tab === 'ai') {
        payload = {
            ai_bot_enabled: settings.ai_bot_enabled,         // snake_case
        };
    } else {
        console.warn("Tentativa de salvar aba desconhecida:", tab);
        setSavingTabs(prev => ({ ...prev, [tab]: false }));
        return;
    }

     console.log(`Salvando aba: ${tab}`, payload);


    try {
        const response = await fetch('/api/salon/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
             console.error("Erro ao salvar API:", errorData);
             let description = 'Falha ao salvar configurações';
             if (errorData.message && Array.isArray(errorData.message) && errorData.message.length > 0) {
                 description = errorData.message.join(', ');
             } else if (errorData.message) {
                 description = errorData.message;
             }
            throw new Error(description);
        }

    toast({ title: "Sucesso", description: `Configurações da aba ${tab} salvas!` });

    } catch (err) {
        console.error(`Erro ao salvar aba ${tab}:`, err);
        toast({
            title: "Erro ao Salvar",
            // Tratar tipo unknown
            description: err instanceof Error ? err.message : 'Ocorreu um erro desconhecido',
            variant: "destructive",
        });
    } finally {
       setSavingTabs(prev => ({ ...prev, [tab]: false }));
    }
  }

  // Apenas Dono do Salão pode editar configurações
  const canManage = user?.role === UserRole.SALON_OWNER;

   // Tratar estado de erro global
   if (error && !loading) {
       return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-red-600">
               <p>Erro ao carregar configurações:</p>
               <p>{error}</p>
               <Button onClick={fetchSettings} variant="outline" className="mt-4">Tentar Novamente</Button>
           </div>
       );
   }

   if (loading || !settings) {
     return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">Carregando configurações...</div>;
   }

  // Ajustar handleConnectWhatsApp
  const handleConnectWhatsApp = async () => {
    if (!settings || !whatsappPhone) return;
    
    // Combinar código do país com número local (já são apenas números)
    const fullPhone = whatsappCountryCode.replace("+", "") + whatsappPhone;
    
    console.log(`Conectando WhatsApp: ${fullPhone} (Code: ${whatsappCountryCode}, Number: ${whatsappPhone})`);
    setConnecting(true);
    setQrCode(null); // Limpa QR code antigo
    
    try {
      const response = await fetch('/api/salon/connect-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: fullPhone }),
      });
      
      console.log(`Status da resposta: ${response.status}`);
      const data = await response.json();
      console.log(`Dados da resposta:`, data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao conectar WhatsApp');
      }
      
      toast({
        title: "Processando",
        description: "Gerando QR Code para conexão. Aguarde...",
        variant: "default",
      });
      
      // Iniciar polling para verificar QR code
      checkForQrCode();
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast({
        title: "Erro",
        // Tratar tipo unknown
        description: error instanceof Error ? error.message : "Não foi possível conectar o WhatsApp. Tente novamente.",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const checkForQrCode = async () => {
    if (!settings) return;
    
    try {
      console.log('Verificando status do WhatsApp...');
      const response = await fetch('/api/salon/whatsapp-status');
      
      console.log(`Status da verificação: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Erro na resposta: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.message || 'Falha ao verificar status');
      }
      
      const data = await response.json();
      console.log('Status do WhatsApp:', data);
      
      if (data.whatsappQrCode) {
        console.log('QR Code recebido');
        setQrCode(data.whatsappQrCode);
      }
      
      if (data.whatsappStatus === 'CONNECTED') {
        console.log('WhatsApp conectado com sucesso');
        setConnecting(false);
        setQrCode(null);
        toast({
          title: "Sucesso",
          description: "WhatsApp conectado com sucesso!",
          variant: "default",
        });
        
        // Corrigir erro de tipagem com verificação de nulidade
        setSettings(prev => prev ? {
          ...prev,
          whatsappConnected: true,
          whatsappPhone: data.whatsappPhone,
        } : null);
      } else if (data.whatsappStatus === 'PENDING_QR' || data.whatsappStatus === 'CONNECTING') {
        // Continuar verificando
        console.log(`Status ${data.whatsappStatus}, verificando novamente em 3 segundos...`);
        setTimeout(checkForQrCode, 3000);
      } else {
        console.log(`Status desconhecido: ${data.whatsappStatus}`);
        setConnecting(false);
        toast({
          title: "Atenção",
          description: `Status inesperado: ${data.whatsappStatus}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar QR code:', error);
      setConnecting(false);
      toast({
        title: "Erro",
        // Tratar tipo unknown
        description: error instanceof Error ? error.message : "Falha ao verificar status do WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWhatsApp = () => {
    // Implemente a lógica para desconectar o WhatsApp
    console.log('Desconectar WhatsApp');
    // Simular desconexão
    setSettings(prev => prev ? { ...prev, whatsappConnected: false, whatsappPhone: '' } : null);
    setWhatsappPhone('');
    setWhatsappCountryCode('+55'); // Reset para o padrão
    toast({ title: "Desconectado", description: "WhatsApp desconectado." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
        <CardDescription>Ajuste as configurações gerais, integrações e comportamento do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="ai">Bot IA</TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Horários de funcionamento, intervalos e regras de agendamento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Horários de Funcionamento</Label>
                  <div className="rounded-md border">
                    <Table>
                      <TableBody>
                        {/* Usar a ordem correta dos dias */}
                        {settings.business_hours &&
                          getOrderedDays(settings.weekStartDay).map((dayKey) => {
                            const schedule = settings.business_hours![dayKey as keyof BusinessHours]; // Acessar com ! pois verificamos antes
                            return (
                            <TableRow key={dayKey}>
                              <TableCell className="font-medium capitalize w-[120px]"> {/* Ajuste largura */}
                                 {/* Usar nome em português */}
                                {daysOfWeekPortuguese[dayKey] || dayKey}
                              </TableCell>
                              <TableCell className="w-[80px]">
                                <Switch
                                  checked={schedule?.isOpen ?? false}
                                  onCheckedChange={(checked) => {
                                    handleBusinessHoursChange(
                                      dayKey as keyof BusinessHours,
                                      "isOpen",
                                      checked,
                                    );
                                  }}
                                  disabled={!canManage || savingTabs["general"]}
                                />
                              </TableCell>
                              <TableCell>
                                {schedule?.isOpen ? (
                                  <div className="flex items-center gap-2"> {/* Alinhar itens */}
                                    <Input
                                      type="time"
                                      className="w-[100px]"
                                      value={schedule.slots[0]?.start || ""}
                                      onChange={(e) => {
                                        handleBusinessHoursChange(
                                          dayKey as keyof BusinessHours,
                                          "start",
                                          e.target.value,
                                        );
                                      }}
                                      disabled={!canManage || savingTabs["general"]}
                                    />
                                    <span className="text-muted-foreground">-</span> {/* Traço mais sutil */}
                                    <Input
                                      type="time"
                                      className="w-[100px]"
                                      value={schedule.slots[0]?.end || ""}
                                      onChange={(e) => {
                                        handleBusinessHoursChange(
                                          dayKey as keyof BusinessHours,
                                          "end",
                                          e.target.value,
                                        );
                                      }}
                                      disabled={!canManage || savingTabs["general"]}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Fechado
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="space-y-4 border-t pt-6">
                   <Label className="text-base font-semibold">Regras de Agendamento</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                       <div>
                          {/* Labels em português */}
                          <Label htmlFor="appointmentInterval">Intervalo entre horários (min)</Label>
                          <Input id="appointmentInterval" type="number" value={settings.appointment_interval ?? 0}
                                 onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('appointment_interval', parseInt(e.target.value) || 0)}
                                 disabled={!canManage || savingTabs['general']} />
                       </div>
                   <div>
                          <Label htmlFor="bookingLeadTime">Antecedência mínima (hr)</Label>
                          <Input id="bookingLeadTime" type="number" value={settings.booking_lead_time ?? 0}
                                 onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('booking_lead_time', parseInt(e.target.value) || 0)}
                                 disabled={!canManage || savingTabs['general']} />
                   </div>
                   <div>
                          <Label htmlFor="bookingCancelLimit">Limite p/ Cancelar (hr)</Label>
                          <Input id="bookingCancelLimit" type="number" value={settings.booking_cancel_limit ?? 0}
                                 onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('booking_cancel_limit', parseInt(e.target.value) || 0)}
                                 disabled={!canManage || savingTabs['general']} />
                   </div>
                   <div>
                            <Label htmlFor="weekStartDay">Primeiro dia da semana</Label>
                            <Select
                                value={settings.weekStartDay?.toString() ?? '1'}
                                onValueChange={(value) => handleInputChange('weekStartDay', parseInt(value))}
                                disabled={!canManage || savingTabs['general']}
                            >
                                <SelectTrigger id="weekStartDay">
                                <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                {/* Opções em português */}
                                <SelectItem value="0">Domingo</SelectItem>
                                <SelectItem value="1">Segunda-feira</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Campos Obrigatórios Cliente */}
                <div className="space-y-4 border-t pt-6">
                    <Label className="text-base font-semibold">Informações Obrigatórias do Cliente</Label>
                    <p className="text-sm text-muted-foreground">
                        Defina quais informações são obrigatórias ao cadastrar ou editar um cliente.
                    </p>
                    <div className="space-y-2">
                       <div className="flex items-center space-x-2">
                           <Switch
                               id="requireClientPhone"
                               checked={settings.clientRequiredFields?.phone ?? true}
                               onCheckedChange={(checked: boolean) => handleInputChange('clientRequiredFields.phone', checked)}
                               disabled={!canManage || savingTabs['general']}
                           />
                           <Label htmlFor="requireClientPhone">Exigir Telefone do Cliente</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                           <Switch
                               id="requireClientEmail"
                               checked={settings.clientRequiredFields?.email ?? false}
                               onCheckedChange={(checked: boolean) => handleInputChange('clientRequiredFields.email', checked)}
                               disabled={!canManage || savingTabs['general']}
                           />
                           <Label htmlFor="requireClientEmail">Exigir Email do Cliente</Label>
                       </div>
                   </div>
                </div>
              </CardContent>
              {canManage && (
                 <CardFooter className="border-t px-6 py-4">
                   <Button onClick={() => handleSave('general')} disabled={savingTabs['general']}>
                     {savingTabs['general'] ? 'Salvando...' : 'Salvar Configurações Gerais'}
                   </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Aba WhatsApp */}
          <TabsContent value="whatsapp">
             <Card>
              <CardHeader>
                <CardTitle>Conexão WhatsApp</CardTitle>
                <CardDescription>Conecte o número de WhatsApp do seu salão.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!settings.whatsappConnected ? (
                  <>
                    <div>
                      <Label htmlFor="whatsappPhoneInput">Número de WhatsApp do Salão</Label>
                      <div className="flex flex-col sm:flex-row gap-2 items-start">
                        <PhoneInput
                          id="whatsappPhoneInput"
                          value={whatsappPhone}
                          onChange={(value) => setWhatsappPhone(value)}
                          defaultCountryCode={whatsappCountryCode}
                          disabled={connecting || !canManage}
                          required
                        />
                        <Button 
                          onClick={handleConnectWhatsApp} 
                          disabled={connecting || !whatsappPhone || !canManage}
                          className="w-full sm:w-auto"
                        >
                          {connecting ? 'Conectando...' : 'Conectar'}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        O número será usado para notificações e agendamento via bot (se ativado).
                      </p>
                    </div>
                    
                    {connecting && !qrCode && (
                       <div className="mt-4 text-center">
                          <p>Aguardando QR Code...</p> 
                       </div>
                    )}

                    {qrCode && (
                      <div className="mt-4 text-center">
                        <h3 className="mb-2 font-medium">Escaneie o QR Code com seu WhatsApp</h3>
                        <div className="inline-block p-4 bg-white border rounded-md">
                          <Image src={qrCode} alt="WhatsApp QR Code" width={200} height={200} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Abra o WhatsApp no seu celular, vá em Menu &gt; Aparelhos conectados &gt; Conectar um aparelho
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 border rounded-md bg-green-50">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">WhatsApp Conectado</p>
                        <p className="text-sm text-muted-foreground">
                          {/* Corrigido: Número formatado (lógica movida para dentro do componente se necessário) */}
                          {/* Idealmente, o backend retornaria o número já formatado ou o PhoneInput faria isso */}
                           Número: {settings.whatsappPhone || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {canManage && (
                      <Button variant="outline" className="mt-4" onClick={handleDisconnectWhatsApp}>
                        Desconectar WhatsApp
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Bot IA */}
          <TabsContent value="ai">
             <Card>
              <CardHeader>
                <CardTitle>Bot de Atendimento IA</CardTitle>
                <CardDescription>Configure o assistente virtual para WhatsApp.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Switch id="aiEnabled" checked={settings.ai_bot_enabled ?? false}
                            onCheckedChange={(checked: boolean) => handleInputChange('ai_bot_enabled', checked)}
                            disabled={!canManage || savingTabs['ai']} />
                    <Label htmlFor="aiEnabled">Ativar Bot IA</Label>
                </div>
              </CardContent>
               {canManage && (
                 <CardFooter className="border-t px-6 py-4">
                   <Button onClick={() => handleSave('ai')} disabled={savingTabs['ai']}>
                     {savingTabs['ai'] ? 'Salvando...' : 'Salvar Configurações IA'}
                   </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Adicionar constante COUNTRY_CODES (se não estiver importada de outro lugar)
const COUNTRY_CODES = [
  { code: "+55", country: "Brasil", flag: "🇧🇷", placeholder: "(11) 99988-7766", maxLength: 11, minLength: 10 }, // Ajustado maxLength e add minLength
  { code: "+1", country: "EUA", flag: "🇺🇸", placeholder: "(555) 123-4567", maxLength: 10, minLength: 10 }, // Ajustado maxLength e add minLength
  { code: "+595", country: "Paraguai", flag: "🇵🇾", placeholder: "09XX XXX XXX", maxLength: 10, minLength: 9 }, // Ajustado maxLength e add minLength
  { code: "+598", country: "Uruguai", flag: "🇺🇾", placeholder: "09X XXX XXX", maxLength: 9, minLength: 9 }, // Ajustado maxLength e add minLength
  { code: "+351", country: "Portugal", flag: "🇵🇹", placeholder: "9XX XXX XXX", maxLength: 9, minLength: 9 }, // Ajustado maxLength e add minLength
  { code: "+34", country: "Espanha", flag: "🇪🇸", placeholder: "6XX XXX XXX", maxLength: 9, minLength: 9 }, // Ajustado maxLength e add minLength
];