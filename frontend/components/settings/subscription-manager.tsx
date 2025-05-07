import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeDate } from "@/lib/date";

interface SalonSubscription {
  id: string;
  status: "ACTIVE" | "TRIALING" | "CANCELED" | "PAST_DUE";
  planName: string;
  planDescription: string;
  planPrice: number;
  startDate: string;
  currentPeriodEnd: string;
  trialEndDate?: string;
}

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<SalonSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/salon/subscription");
      if (!response.ok) throw new Error("Falha ao carregar os dados da assinatura");
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("Erro ao carregar assinatura:", error);
      toast({
        title: "Erro ao carregar assinatura",
        description: error instanceof Error ? error.message : "Algo deu errado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = () => {
    window.open("https://salao.planos.app/portal", "_blank");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Ativa", color: "bg-green-100 text-green-800" },
      TRIALING: { label: "Período de Teste", color: "bg-blue-100 text-blue-800" },
      CANCELED: { label: "Cancelada", color: "bg-red-100 text-red-800" },
      PAST_DUE: { label: "Pagamento Pendente", color: "bg-yellow-100 text-yellow-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      color: "bg-gray-100 text-gray-800" 
    };

    return (
      <Badge className={`${config.color} font-medium`} variant="outline">
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center p-6">
          <p>Carregando informações da assinatura...</p>
        </div>
      ) : subscription ? (
        <>
          <div className="rounded-lg border">
            <div className="flex items-center p-4 border-b">
              <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
              <h3 className="font-medium">Sua Assinatura</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-lg">{subscription.planName}</h4>
                  <p className="text-sm text-muted-foreground">{subscription.planDescription}</p>
                </div>
                <div>
                  {getStatusBadge(subscription.status)}
                </div>
              </div>

              <Table className="mt-4">
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Preço</TableCell>
                    <TableCell>R$ {subscription.planPrice.toFixed(2)}/mês</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    <TableCell>
                      {subscription.status === "ACTIVE" && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ativa
                        </div>
                      )}
                      {subscription.status === "TRIALING" && (
                        <div className="flex items-center text-blue-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Período de teste ativo até {formatRelativeDate(new Date(subscription.trialEndDate || ""))}
                        </div>
                      )}
                      {subscription.status === "PAST_DUE" && (
                        <div className="flex items-center text-yellow-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Pagamento pendente - acesso limitado
                        </div>
                      )}
                      {subscription.status === "CANCELED" && (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Assinatura cancelada
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Data de início</TableCell>
                    <TableCell>{new Date(subscription.startDate).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                  {subscription.status !== "CANCELED" && (
                    <TableRow>
                      <TableCell className="font-medium">Próxima renovação</TableCell>
                      <TableCell>{new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-muted/20 border-t">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="text-sm">
                    {subscription.status === "ACTIVE" && "Sua assinatura renovará automaticamente."}
                    {subscription.status === "TRIALING" && "Sua assinatura será ativada automaticamente após o período de teste."}
                    {subscription.status === "PAST_DUE" && "Atualize seu cartão para restaurar o acesso completo."}
                    {subscription.status === "CANCELED" && "Sua assinatura foi cancelada."}
                  </p>
                </div>
                <Button onClick={handleUpdatePlan}>
                  {subscription.status === "CANCELED" ? "Assinar novamente" : "Gerenciar assinatura"}
                </Button>
              </div>
            </div>
          </div>
          {subscription.status === "CANCELED" && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Assinatura inativa</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Sua assinatura está cancelada. Algumas funcionalidades como integração com WhatsApp e API não 
                      estão disponíveis. Renove sua assinatura para recuperar o acesso completo.
                    </p>
                    <Button onClick={handleUpdatePlan} variant="outline" className="mt-3 border-yellow-300 hover:bg-yellow-100">
                      Renovar assinatura
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {subscription.status === "PAST_DUE" && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Pagamento pendente</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Sua assinatura está com pagamento pendente. Algumas funcionalidades como integração com WhatsApp e API 
                      foram temporariamente desativadas. Atualize seu cartão para restaurar o acesso completo.
                    </p>
                    <Button onClick={handleUpdatePlan} variant="outline" className="mt-3 border-red-300 hover:bg-red-100">
                      Atualizar forma de pagamento
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Nenhuma assinatura encontrada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você ainda não possui uma assinatura ativa para este salão.
                </p>
              </div>
              <Button onClick={handleUpdatePlan}>
                Assinar agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 