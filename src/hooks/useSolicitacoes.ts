import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SolicitacoesService, CreateSolicitacaoDTO } from "@/services/solicitacoes.service";
import { useToast } from "./use-toast";

export const useCreateSolicitacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      data: CreateSolicitacaoDTO;
      documentoOrigemFile: File | null;
      anexosAdicionais: File[];
    }) =>
      SolicitacoesService.create(
        params.data,
        params.documentoOrigemFile,
        params.anexosAdicionais
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      toast({
        title: "Sucesso",
        description: "Solicitação criada com sucesso",
      });
    },
    onError: (error: any) => {
      // Erro já tratado pelo handleError no service
      toast({
        title: "Erro",
        description: error.userMessage || "Erro ao criar solicitação",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSolicitacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: { id: number; data: Partial<CreateSolicitacaoDTO> }) =>
      SolicitacoesService.update(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      toast({
        title: "Sucesso",
        description: "Solicitação atualizada com sucesso",
      });
    },
  });
};

export const useDeleteSolicitacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => SolicitacoesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      toast({
        title: "Sucesso",
        description: "Solicitação deletada com sucesso",
      });
    },
  });
};
