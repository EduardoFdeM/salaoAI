"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Copy, Eye, EyeOff, Trash2, PlusCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

// --- Tipagem para os dados da API Key (visível no frontend) ---
interface ApiKeyDisplay {
  id: string;
  name: string;
  keyPrefix: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  active: boolean;
}

// --- Componente Principal ---
export function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<ApiKeyDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState<ApiKeyDisplay | null>(null);
  const [showGeneratedKey, setShowGeneratedKey] = useState<{ id: string, apiKey: string } | null>(null);
  const { toast } = useToast();

  // -- Estados para o formulário de criação --
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiresAt, setNewKeyExpiresAt] = useState<Date | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  // -- Função para buscar as chaves --
  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/salon/settings/api-keys');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar chaves API');
      }
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      console.error("Erro ao buscar chaves:", err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
      setApiKeys([]); // Limpa em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  // -- Efeito para buscar chaves na montagem --
  useEffect(() => {
    fetchApiKeys();
  }, []);

  // -- Função para criar chave --
  const handleCreateKey = async () => {
    if (!newKeyName) {
      toast({ title: "Erro", description: "Por favor, informe um nome para a chave.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const payload = {
        name: newKeyName,
        expiresAt: newKeyExpiresAt ? newKeyExpiresAt.toISOString() : undefined,
      };
      const response = await fetch('/api/salon/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json(); // { apiKey: string, id: string } ou erro
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao criar chave API');
      }
      toast({ title: "Sucesso", description: `Chave "${newKeyName}" criada.` });
      setShowGeneratedKey(data); // Guarda a chave gerada para mostrar
      setShowCreateDialog(false); // Fecha o diálogo de criação
      fetchApiKeys(); // Atualiza a lista
      // Limpa o formulário
      setNewKeyName('');
      setNewKeyExpiresAt(undefined);
    } catch (err) {
      console.error("Erro ao criar chave:", err);
      toast({ title: "Erro", description: err instanceof Error ? err.message : 'Ocorreu um erro', variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  // -- Função para revogar chave --
  const handleRevokeKey = async (key: ApiKeyDisplay) => {
    if (!key) return;
    setShowConfirmRevoke(null); // Fecha confirmação antes de tentar
    try {
      const response = await fetch(`/api/salon/settings/api-keys?keyId=${key.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Tenta pegar erro, senão obj vazio
        throw new Error(errorData.message || `Erro ao revogar chave (Status: ${response.status})`);
      }
      toast({ title: "Sucesso", description: `Chave "${key.name}" revogada.` });
      fetchApiKeys(); // Atualiza a lista
    } catch (err) {
      console.error("Erro ao revogar chave:", err);
      toast({ title: "Erro", description: err instanceof Error ? err.message : 'Ocorreu um erro', variant: "destructive" });
    }
  };

  // -- Função para copiar chave gerada --
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copiado!", description: "Chave API copiada para a área de transferência." });
    }).catch(err => {
      console.error('Falha ao copiar:', err);
      toast({ title: "Erro", description: "Não foi possível copiar a chave.", variant: "destructive" });
    });
  };

  // -- Formatar data --
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  // --- Renderização --- 
  if (isLoading) {
    return <div>Carregando chaves API...</div>;
  }

  if (error) {
    return <div className="text-red-600">Erro ao carregar chaves: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Chaves de API</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Gerar Nova Chave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Nova Chave API</DialogTitle>
              <DialogDescription>
                Dê um nome descritivo para sua chave. Você pode definir uma data de expiração opcional.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Nome da Chave</Label>
                <Input
                  id="key-name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Integração N8N, App Externo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-expires">Data de Expiração (Opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="key-expires"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newKeyExpiresAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newKeyExpiresAt ? format(newKeyExpiresAt, "PPP", { locale: ptBR }) : <span>Sem expiração</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newKeyExpiresAt}
                      onSelect={setNewKeyExpiresAt}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>Cancelar</Button>
              <Button onClick={handleCreateKey} disabled={isCreating || !newKeyName}>
                {isCreating ? "Gerando..." : "Gerar Chave"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Chaves */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>Suas chaves de API ativas e inativas.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Prefixo</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Último Uso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma chave API gerada ainda.
                </TableCell>
              </TableRow>
            )}
            {apiKeys.map((key) => (
              <TableRow key={key.id} className={!key.active ? "text-muted-foreground opacity-70" : ""}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell><code>{key.keyPrefix}...</code></TableCell>
                <TableCell>{formatDate(key.createdAt)}</TableCell>
                <TableCell>{key.expiresAt ? formatDate(key.expiresAt) : 'Nunca'}</TableCell>
                <TableCell>{formatDate(key.lastUsedAt)}</TableCell>
                <TableCell>
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", key.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                    {key.active ? 'Ativa' : 'Revogada'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {key.active && (
                    <Dialog open={showConfirmRevoke?.id === key.id} onOpenChange={(open) => !open && setShowConfirmRevoke(null)}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setShowConfirmRevoke(key)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Revogar</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar Revogação</DialogTitle>
                          <DialogDescription>
                            Tem certeza que deseja revogar a chave "{key.name}"? Esta ação não pode ser desfeita e a chave deixará de funcionar imediatamente.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                           <Button variant="outline" onClick={() => setShowConfirmRevoke(null)}>Cancelar</Button>
                           <Button variant="destructive" onClick={() => handleRevokeKey(key)}>Revogar Chave</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal para mostrar chave gerada */}
      <Dialog open={!!showGeneratedKey} onOpenChange={(open) => !open && setShowGeneratedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" /> Chave API Gerada com Sucesso!
            </DialogTitle>
            <DialogDescription>
              Copie sua nova chave API. Esta é a **única vez** que ela será exibida.
              Guarde-a em um local seguro.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-3 bg-muted rounded-md flex items-center justify-between">
            <code className="text-sm break-all mr-2">{showGeneratedKey?.apiKey}</code>
            <Button variant="ghost" size="icon" onClick={() => showGeneratedKey && copyToClipboard(showGeneratedKey.apiKey)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
           <DialogFooter>
             <Button onClick={() => setShowGeneratedKey(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 