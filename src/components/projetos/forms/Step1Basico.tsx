import { UseFormReturn } from "react-hook-form";
import { ProjetoFormData } from "@/lib/projectValidation";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Step1BasicoProps {
  form: UseFormReturn<ProjetoFormData>;
}

export const Step1Basico = ({ form }: Step1BasicoProps) => {
  const [organizacoes, setOrganizacoes] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  useEffect(() => {
    fetchOrganizacoes();
  }, []);

  const fetchOrganizacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("organizacoes")
        .select("*")
        .order("Sigla da OM");

      if (error) throw error;
      setOrganizacoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar organizações:", error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  // Mapeamento de Diretoria por OM (baseado no Órgão Setorial)
  const mapDiretoria = (orgaoSetorial: string): string => {
    const mapa: Record<string, string> = {
      "COLOG": "COLOG",
      "COTER": "COTER",
      "DCT": "DCT",
      "DEC": "DEC",
      "DECEx": "DECEx",
      "DGP": "DGP",
      "SEF": "SEF",
    };
    return mapa[orgaoSetorial] || "COLOG";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Número OPUS */}
        <FormField
          control={form.control}
          name="numero_opus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Número OPUS <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ex: 123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organização Militar */}
        <FormField
          control={form.control}
          name="organizacao_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Organização Militar Apoiada <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  const orgId = parseInt(value);
                  field.onChange(orgId);

                  // Auto-preencher diretoria
                  const org = organizacoes.find((o) => o.id === orgId);
                  if (org) {
                    const diretoria = mapDiretoria(org["Órgão Setorial Responsável"]);
                    form.setValue("diretoria_responsavel", diretoria as any);
                  }
                }}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a OM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingOrgs ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Carregando...
                    </div>
                  ) : (
                    organizacoes.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org["Sigla da OM"]} - {org["Organização Militar"]}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Objeto do Projeto */}
      <FormField
        control={form.control}
        name="objeto"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Objeto do Projeto <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descrição detalhada do projeto..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              {field.value?.length || 0}/1000 caracteres
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Diretoria Responsável (auto-preenchido) */}
        <FormField
          control={form.control}
          name="diretoria_responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Diretoria Responsável <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="COLOG">COLOG</SelectItem>
                  <SelectItem value="COTER">COTER</SelectItem>
                  <SelectItem value="DCT">DCT</SelectItem>
                  <SelectItem value="DEC">DEC</SelectItem>
                  <SelectItem value="DECEx">DECEx</SelectItem>
                  <SelectItem value="DGP">DGP</SelectItem>
                  <SelectItem value="SEF">SEF</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* OM Executora */}
        <FormField
          control={form.control}
          name="om_executora"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                OM Responsável pela Elaboração <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CRO 1">
                    Comissão Regional de Obras 1 (CRO 1)
                  </SelectItem>
                  <SelectItem value="5º Gpt E">
                    5º Grupamento de Engenharia (5º Gpt E)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Natureza do Objeto */}
        <FormField
          control={form.control}
          name="natureza_objeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Natureza do Objeto <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Construção Nova">Construção Nova</SelectItem>
                  <SelectItem value="Reforma">Reforma</SelectItem>
                  <SelectItem value="Ampliação">Ampliação</SelectItem>
                  <SelectItem value="Manutenção Corretiva">
                    Manutenção Corretiva
                  </SelectItem>
                  <SelectItem value="Manutenção Preventiva">
                    Manutenção Preventiva
                  </SelectItem>
                  <SelectItem value="Projeto Especial">
                    Projeto Especial
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prioridade */}
        <FormField
          control={form.control}
          name="prioridade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
