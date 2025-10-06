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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Step2OrcamentoProps {
  form: UseFormReturn<ProjetoFormData>;
}

export const Step2Orcamento = ({ form }: Step2OrcamentoProps) => {
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Valor Estimado DFD */}
        <FormField
          control={form.control}
          name="valor_estimado_dfd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Valor Estimado (DFD) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    className="pl-10"
                    placeholder="0,00"
                    value={field.value ? formatCurrency(field.value.toString()) : ""}
                    onChange={(e) => {
                      const numbers = e.target.value.replace(/\D/g, "");
                      const value = parseFloat(numbers) / 100;
                      field.onChange(value);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recursos Previstos 2025 */}
        <FormField
          control={form.control}
          name="recursos_previstos_2025"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Recursos Previstos para 2025 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    className="pl-10"
                    placeholder="0,00"
                    value={field.value ? formatCurrency(field.value.toString()) : ""}
                    onChange={(e) => {
                      const numbers = e.target.value.replace(/\D/g, "");
                      const value = parseFloat(numbers) / 100;
                      field.onChange(value);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plano Orçamentário */}
        <FormField
          control={form.control}
          name="plano_orcamentario"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Plano Orçamentário <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ex: 12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ação Orçamentária */}
        <FormField
          control={form.control}
          name="acao_orcamentaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Ação Orçamentária <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ex: 2000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* PRO */}
      <FormField
        control={form.control}
        name="pro"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PRO (Programa de Recuperação Operacional)</FormLabel>
            <FormControl>
              <Input placeholder="Opcional" {...field} />
            </FormControl>
            <FormDescription>Campo opcional</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Indicadores de Controle */}
      <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
        <h3 className="font-medium">Indicadores de Controle</h3>
        
        <FormField
          control={form.control}
          name="esta_no_pca_2025"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                Está no PCA 2025? (Plano de Custeio Anual)
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="esta_no_dfd"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                Está no DFD? (Documento Fiscal Digital)
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="foi_lancado_opus"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                Foi lançado no OPUS?
              </FormLabel>
            </FormItem>
          )}
        />

        {form.watch("foi_lancado_opus") && (
          <FormField
            control={form.control}
            name="data_lancamento_opus"
            render={({ field }) => (
              <FormItem className="ml-6">
                <FormLabel>Data de Lançamento no OPUS</FormLabel>
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
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Prazos */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="prazo_inicial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo Inicial</FormLabel>
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
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Data de início do projeto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prazo_previsto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo Previsto</FormLabel>
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
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Data prevista para conclusão</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
