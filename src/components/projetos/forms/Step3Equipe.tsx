import { UseFormReturn } from "react-hook-form";
import { ProjetoFormData } from "@/lib/projectValidation";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Step3EquipeProps {
  form: UseFormReturn<ProjetoFormData>;
}

export const Step3Equipe = ({ form }: Step3EquipeProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Equipe Técnica Responsável</h3>
        <p className="text-sm text-muted-foreground">
          Campos opcionais. Informe o nome completo e posto/graduação dos responsáveis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Arquiteto */}
        <FormField
          control={form.control}
          name="arquiteto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arquiteto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Cap Eng João Silva"
                  {...field}
                />
              </FormControl>
              <FormDescription>Nome completo e posto/graduação</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Engenheiro Civil */}
        <FormField
          control={form.control}
          name="engenheiro_civil"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engenheiro Civil</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Maj Eng Maria Santos"
                  {...field}
                />
              </FormControl>
              <FormDescription>Nome completo e posto/graduação</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Engenheiro Eletricista */}
        <FormField
          control={form.control}
          name="engenheiro_eletricista"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engenheiro Eletricista</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: 1º Ten Eng Pedro Costa"
                  {...field}
                />
              </FormControl>
              <FormDescription>Nome completo e posto/graduação</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Engenheiro Mecânico */}
        <FormField
          control={form.control}
          name="engenheiro_mecanico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engenheiro Mecânico</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Ten Cel Eng Ana Lima"
                  {...field}
                />
              </FormControl>
              <FormDescription>Nome completo e posto/graduação</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Observações Iniciais */}
      <FormField
        control={form.control}
        name="observacoes_iniciais"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações Iniciais</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Observações relevantes sobre o projeto..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Campo opcional para informações adicionais
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-lg border border-dashed p-6 bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-lg">💡</span>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Dica</p>
            <p className="text-sm text-muted-foreground">
              Após criar o projeto, você poderá adicionar anexos, definir etapas do Gantt
              e acompanhar o andamento em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
