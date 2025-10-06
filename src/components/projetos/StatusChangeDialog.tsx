import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  projetoId: string;
  onStatusChanged: () => void;
}

const statusChangeSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("Em Andamento"),
  }),
  z.object({
    status: z.literal("Em Pausa"),
    motivo_pausa: z.string().min(10, "Mínimo de 10 caracteres"),
  }),
  z.object({
    status: z.literal("Concluído"),
    data_conclusao: z.date(),
    prazo_real_conclusao: z.date().optional(),
  }),
  z.object({
    status: z.literal("Cancelado"),
    motivo_cancelamento: z.string().min(10, "Mínimo de 10 caracteres"),
  }),
]);

type StatusChangeData = z.infer<typeof statusChangeSchema>;

export const StatusChangeDialog = ({
  open,
  onOpenChange,
  currentStatus,
  projetoId,
  onStatusChanged,
}: StatusChangeDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<StatusChangeData>({
    resolver: zodResolver(statusChangeSchema),
    defaultValues: {
      status: currentStatus as any,
    },
  });

  const selectedStatus = form.watch("status");

  const onSubmit = async (data: StatusChangeData) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Preparar dados de atualização
      const updateData: any = {
        status: data.status,
      };

      // Campos específicos por status
      if (data.status === "Em Pausa") {
        updateData.motivo_pausa = (data as any).motivo_pausa;
      } else if (data.status === "Concluído") {
        updateData.data_conclusao = (data as any).data_conclusao;
        updateData.prazo_real_conclusao = (data as any).prazo_real_conclusao;
      } else if (data.status === "Cancelado") {
        updateData.motivo_cancelamento = (data as any).motivo_cancelamento;
      }

      // Atualizar projeto
      const { error: updateError } = await supabase
        .from("projetos")
        .update(updateData)
        .eq("id", projetoId);

      if (updateError) throw updateError;

      // Registrar no histórico
      await supabase.from("projetos_historico").insert({
        projeto_id: projetoId,
        usuario_id: user.id,
        acao: `Status alterado para: ${data.status}`,
        campo_alterado: "status",
        valor_anterior: currentStatus,
        valor_novo: data.status,
      });

      toast({
        title: "Status atualizado!",
        description: `Projeto agora está "${data.status}"`,
      });

      onOpenChange(false);
      onStatusChanged();
    } catch (error: any) {
      console.error("Erro ao mudar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alterar Status do Projeto</DialogTitle>
          <DialogDescription>
            Status atual: <span className="font-semibold">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Seleção de Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Novo Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Em Pausa">Em Pausa</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos condicionais */}
            {selectedStatus === "Em Pausa" && (
              <FormField
                control={form.control}
                name="motivo_pausa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Motivo da Pausa <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o motivo da pausa..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Mínimo de 10 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedStatus === "Concluído" && (
              <>
                <FormField
                  control={form.control}
                  name="data_conclusao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Data de Conclusão <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={ptBR}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prazo_real_conclusao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo Real de Conclusão</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data (opcional)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={ptBR}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Campo opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {selectedStatus === "Cancelado" && (
              <FormField
                control={form.control}
                name="motivo_cancelamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Motivo do Cancelamento <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o motivo do cancelamento..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Mínimo de 10 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Confirmar Alteração"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
