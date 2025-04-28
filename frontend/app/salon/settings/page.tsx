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
import { SalonSettings, SettingsFormData } from '@/types/salon' // Importar tipos
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

// Mock data - Substituir por chamada à API real
const MOCK_SETTINGS: SalonSettings = {
  id: 'setting1',
  salon_id: '1',
  business_hours: { /* Preencher com dados mock */ 
      monday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      tuesday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      wednesday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      thursday: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      friday: { isOpen: true, slots: [{ start: "09:00", end: "20:00" }] },
      saturday: { isOpen: true, slots: [{ start: "09:00", end: "16:00" }] },
      sunday: null,
  },
  appointment_interval: 30,
  booking_lead_time: 2, // 2 horas
  booking_cancel_limit: 4, // 4 horas
  active: true,
  evolution_api_url: 'https://evo.example.com',
  evolution_api_key: 'ABC-123-XYZ',
  evolution_instance_name: 'MySalonInstance',
  ai_bot_model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  ai_bot_prompt_template: 'Você é um assistente de agendamento para o salão {salon_name}...',
  ai_bot_enabled: true,
  updated_at: '2023-10-26T11:00:00Z',
};

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

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<SettingsFormData | null>(null) // Usar FormData
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState(''); // Apenas números
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+55'); // Estado para o código do país
  const [connecting, setConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar configurações da API (simulado)
  useEffect(() => {
    setLoading(true);
    // Simular fetch
    setTimeout(() => {
      const fetchedSettings = {
         business_hours: MOCK_SETTINGS.business_hours,
         appointment_interval: MOCK_SETTINGS.appointment_interval,
         booking_lead_time: MOCK_SETTINGS.booking_lead_time,
         booking_cancel_limit: MOCK_SETTINGS.booking_cancel_limit,
         evolution_api_url: MOCK_SETTINGS.evolution_api_url,
         evolution_api_key: MOCK_SETTINGS.evolution_api_key,
         evolution_instance_name: MOCK_SETTINGS.evolution_instance_name,
         ai_bot_model: MOCK_SETTINGS.ai_bot_model,
         ai_bot_prompt_template: MOCK_SETTINGS.ai_bot_prompt_template,
         ai_bot_enabled: MOCK_SETTINGS.ai_bot_enabled,
         // Simular busca de telefone conectado, se houver
         whatsappConnected: false, // Exemplo: inicialmente não conectado
         whatsappPhone: '', // Exemplo: sem número salvo
      };
      setSettings(fetchedSettings);
      // Se houver um telefone conectado salvo, inicializar o estado
      if (fetchedSettings.whatsappConnected && fetchedSettings.whatsappPhone) {
          // Extrair código do país e número (simplificado, pode precisar de lógica melhor)
          // Assumindo que o número salvo pode ou não incluir o DDI
          // Esta parte pode precisar de ajuste dependendo de como o número é salvo no backend
          const phoneDigits = fetchedSettings.whatsappPhone.replace(/\D/g, '');
          // Tentar detectar DDI (exemplo simples para +55)
          if (phoneDigits.startsWith('55') && phoneDigits.length > 11) {
              setWhatsappCountryCode('+55');
              setWhatsappPhone(phoneDigits.substring(2));
          } else {
              // Assume DDI padrão ou lógica mais complexa necessária
              setWhatsappPhone(phoneDigits);
          }
      }
      setLoading(false);
    }, 500);
  }, []); // Adicionar array de dependência vazio

  const handleInputChange = (field: keyof SettingsFormData, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  }
  
  const handleBusinessHoursChange = (day: keyof SettingsFormData['business_hours'], field: string, value: any) => {
      console.log("Atualizar horário:", day, field, value);
      // Lógica de atualização...
       setSettings(prev => {
        if (!prev) return null;
        const updatedHours = { ...prev.business_hours };
        // Implementar a lógica de atualização profunda aqui
        return { ...prev, business_hours: updatedHours };
    });
  }

  const handleSave = async (tab: string) => {
    setSaving(true);
    console.log(`Salvando aba: ${tab}`, settings);
    // Simular chamada API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({ title: "Sucesso", description: `Configurações da aba ${tab} salvas!` });
  }

  // Apenas Dono do Salão pode editar configurações
  const canManage = user?.role === UserRole.SALON_OWNER;

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
        description: error.message || "Não foi possível conectar o WhatsApp. Tente novamente.",
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
        description: error.message || "Falha ao verificar status do WhatsApp",
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
            <TabsTrigger value="whatsapp">WhatsApp (Evolution)</TabsTrigger>
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
                  <Label className="text-base">Horários de Funcionamento</Label>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(settings.business_hours).map(([day, schedule]) => (
                      <DayScheduleInput
                        key={day}
                        day={day}
                        schedule={schedule}
                        onChange={(value) => {
                          handleInputChange('business_hours', {
                            ...settings.business_hours,
                            [day]: value
                          })
                        }}
                        disabled={!canManage || saving}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div>
                      <Label htmlFor="interval">Intervalo entre horários (min)</Label>
                      <Input id="interval" type="number" value={settings.appointment_interval} 
                             onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('appointment_interval', parseInt(e.target.value))} 
                             disabled={!canManage || saving} />
                   </div>
                   <div>
                      <Label htmlFor="leadTime">Antecedência mín. agend. (horas)</Label>
                      <Input id="leadTime" type="number" value={settings.booking_lead_time} 
                             onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('booking_lead_time', parseInt(e.target.value))} 
                             disabled={!canManage || saving} />
                   </div>
                   <div>
                      <Label htmlFor="cancelLimit">Limite cancelamento (horas)</Label>
                      <Input id="cancelLimit" type="number" value={settings.booking_cancel_limit} 
                             onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('booking_cancel_limit', parseInt(e.target.value))} 
                             disabled={!canManage || saving} />
                   </div>
                </div>
              </CardContent>
              {canManage && (
                 <CardFooter className="border-t px-6 py-4">
                   <Button onClick={() => handleSave('general')} disabled={saving}>
                     {saving ? 'Salvando...' : 'Salvar Configurações Gerais'}
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
                          onCountryChange={setWhatsappCountryCode}
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
                          Número: {PhoneInput.formatPhoneNumber(settings.whatsappPhone || '', settings.whatsappCountryCode || '+55') || 'N/A'}
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
              {canManage && (
                <CardFooter className="border-t px-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div>
                          <Label htmlFor="evoUrl">URL da API Evolution</Label>
                          <Input id="evoUrl" placeholder="https://seu.dominio.evolution" value={settings.evolution_api_url || ''} 
                                 onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('evolution_api_url', e.target.value)} 
                                 disabled={!canManage || saving} />
                        </div>
                        <div>
                          <Label htmlFor="evoKey">Chave da API (apikey)</Label>
                          <Input id="evoKey" type="password" placeholder="SuaChaveSecreta" value={settings.evolution_api_key || ''} 
                                 onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('evolution_api_key', e.target.value)} 
                                 disabled={!canManage || saving} />
                        </div>
                        <div>
                           <Label htmlFor="evoInstance">Nome da Instância</Label>
                           <Input id="evoInstance" placeholder="NomeUnicoInstancia" value={settings.evolution_instance_name || ''} 
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('evolution_instance_name', e.target.value)} 
                                  disabled={!canManage || saving} />
                        </div>
                    </div>
                     {canManage && (
                       <Button onClick={() => handleSave('whatsapp')} disabled={saving} className="mt-4 ml-auto"> 
                         {saving ? 'Salvando...' : 'Salvar Configurações API'}
                       </Button>
                     )}
                </CardFooter>
              )}
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
                    <Switch id="aiEnabled" checked={settings.ai_bot_enabled} 
                            onCheckedChange={(checked: boolean) => handleInputChange('ai_bot_enabled', checked)}
                            disabled={!canManage || saving} />
                    <Label htmlFor="aiEnabled">Ativar Bot IA</Label>
                 </div>
                 <div>
                  <Label htmlFor="aiModel">Modelo de Linguagem (LLM)</Label>
                  <Input id="aiModel" placeholder="ex: mistralai/Mixtral-8x7B-Instruct-v0.1" value={settings.ai_bot_model || ''}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('ai_bot_model', e.target.value)}
                         disabled={!canManage || saving || !settings.ai_bot_enabled} />
                   <p className="text-sm text-muted-foreground mt-1">Nome do modelo (compatível com DeepInfra ou similar).</p>
                </div>
                 <div>
                  <Label htmlFor="aiPrompt">Template de Prompt</Label>
                  <Textarea id="aiPrompt" placeholder="Você é um assistente do {salon_name}..." rows={8} 
                            value={settings.ai_bot_prompt_template || ''}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('ai_bot_prompt_template', e.target.value)}
                            disabled={!canManage || saving || !settings.ai_bot_enabled} />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use variáveis como `{'{salon_name}'}`, `{'{services}'}`, `{'{professionals}'}` que serão substituídas dinamicamente.
                  </p>
                </div>
              </CardContent>
               {canManage && (
                 <CardFooter className="border-t px-6 py-4">
                   <Button onClick={() => handleSave('ai')} disabled={saving}>
                     {saving ? 'Salvando...' : 'Salvar Configurações IA'}
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

// Adicionar formatação estática ao PhoneInput para uso externo
PhoneInput.formatPhoneNumber = (value: string, country: string): string => {
  const numbers = value.replace(/\D/g, "");

  // Adapte esta lógica conforme a formatação definida em phone-input.tsx
  if (country === "+55") {
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
  if (country === "+1") {
    if (numbers.length <= 3) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  }
  // Adicione outros países se necessário...

  return numbers; 
};