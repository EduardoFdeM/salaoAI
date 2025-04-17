"use client"

import { useState, ChangeEvent, SyntheticEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth'
import { SalonSettings, SettingsFormData } from '@/types/salon' // Importar tipos

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

  // Carregar configurações da API (simulado)
  useState(() => {
    setLoading(true);
    // Simular fetch
    setTimeout(() => {
      setSettings({
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
      });
      setLoading(false);
    }, 500);
  });

  const handleInputChange = (field: keyof SettingsFormData, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  }
  
  const handleBusinessHoursChange = (day: keyof SettingsFormData['business_hours'], field: string, value: any) => {
      // Lógica mais complexa para atualizar horários (precisa de UI específica)
      console.log("Atualizar horário:", day, field, value);
  }

  const handleSave = async (tab: string) => {
    setSaving(true);
    console.log(`Salvando aba: ${tab}`, settings);
    // Simular chamada API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // Adicionar toast de sucesso/erro
  }

  // Apenas Dono do Salão pode editar configurações
  const canManage = user?.role === UserRole.SALON_OWNER;

   if (loading || !settings) {
     return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">Carregando configurações...</div>;
   }

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
                <CardTitle>Integração WhatsApp</CardTitle>
                <CardDescription>Configure a conexão com a Evolution API.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="evoUrl">URL da Evolution API</Label>
                  <Input id="evoUrl" placeholder="https://api.seuservidor.com" value={settings.evolution_api_url || ''}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('evolution_api_url', e.target.value)}
                         disabled={!canManage || saving} />
                </div>
                 <div>
                  <Label htmlFor="evoKey">API Key</Label>
                  <Input id="evoKey" type="password" placeholder="Chave_Global_API" value={settings.evolution_api_key || ''}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('evolution_api_key', e.target.value)}
                         disabled={!canManage || saving} />
                </div>
                 <div>
                  <Label htmlFor="evoInstance">Nome da Instância</Label>
                  <Input id="evoInstance" placeholder="InstanciaWhatsAppSalao" value={settings.evolution_instance_name || ''}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('evolution_instance_name', e.target.value)}
                         disabled={!canManage || saving} />
                  <p className="text-sm text-muted-foreground mt-1">O nome da instância criada na sua Evolution API.</p>
                </div>
              </CardContent>
              {canManage && (
                 <CardFooter className="border-t px-6 py-4">
                   <Button onClick={() => handleSave('whatsapp')} disabled={saving}>
                     {saving ? 'Salvando...' : 'Salvar Configurações WhatsApp'}
                   </Button>
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