import { format as dateFnsFormat } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data no formato brasileiro
 * @param date - Data a ser formatada
 * @param formatStr - Formato desejado (default: dd/MM/yyyy)
 * @returns String formatada
 */
export const formatDate = (
  date: Date | string | number,
  formatStr: string = 'dd/MM/yyyy'
): string => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return dateFnsFormat(dateObj, formatStr, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
};

/**
 * Formata uma data no formato extenso
 * @param date - Data a ser formatada
 * @returns String formatada (ex: "20 de janeiro de 2025")
 */
export const formatDateLong = (date: Date | string | number): string => {
  return formatDate(date, "dd 'de' MMMM 'de' yyyy");
};

/**
 * Formata uma data com hora
 * @param date - Data a ser formatada
 * @returns String formatada (ex: "20/01/2025 às 14:30")
 */
export const formatDateTime = (date: Date | string | number): string => {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
};

/**
 * Formata um valor monetário em Real brasileiro
 * @param value - Valor a ser formatado
 * @param options - Opções de formatação
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export const formatCurrency = (
  value: number | string | null | undefined,
  options?: { showSymbol?: boolean; decimals?: number }
): string => {
  const { showSymbol = true, decimals = 2 } = options || {};
  
  if (value === null || value === undefined) return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '-';

  const formatted = numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `R$ ${formatted}` : formatted;
};

/**
 * Formata um valor monetário de forma compacta (ex: R$ 1,2 mi)
 * @param value - Valor a ser formatado
 * @returns String formatada
 */
export const formatCurrencyCompact = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '-';

  if (numValue >= 1_000_000_000) {
    return `R$ ${(numValue / 1_000_000_000).toFixed(1)} bi`;
  }
  if (numValue >= 1_000_000) {
    return `R$ ${(numValue / 1_000_000).toFixed(1)} mi`;
  }
  if (numValue >= 1_000) {
    return `R$ ${(numValue / 1_000).toFixed(1)} mil`;
  }
  return formatCurrency(numValue);
};

/**
 * Formata um percentual
 * @param value - Valor a ser formatado (0-1 ou 0-100)
 * @param decimals - Número de casas decimais
 * @returns String formatada (ex: "45,67%")
 */
export const formatPercentage = (
  value: number | string | null | undefined,
  decimals: number = 2
): string => {
  if (value === null || value === undefined) return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '-';

  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Formata um CPF
 * @param cpf - CPF a ser formatado (apenas números)
 * @returns String formatada (ex: "123.456.789-00")
 */
export const formatCPF = (cpf: string | null | undefined): string => {
  if (!cpf) return '-';
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return cpf;

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata um CNPJ
 * @param cnpj - CNPJ a ser formatado (apenas números)
 * @returns String formatada (ex: "12.345.678/0001-00")
 */
export const formatCNPJ = (cnpj: string | null | undefined): string => {
  if (!cnpj) return '-';
  
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return cnpj;

  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata um telefone brasileiro
 * @param phone - Telefone a ser formatado (apenas números)
 * @returns String formatada (ex: "(21) 98765-4321")
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Formata um CEP
 * @param cep - CEP a ser formatado (apenas números)
 * @returns String formatada (ex: "12345-678")
 */
export const formatCEP = (cep: string | null | undefined): string => {
  if (!cep) return '-';
  
  const cleaned = cep.replace(/\D/g, '');
  
  if (cleaned.length !== 8) return cep;

  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formata um número com separador de milhares
 * @param value - Número a ser formatado
 * @param decimals - Número de casas decimais
 * @returns String formatada
 */
export const formatNumber = (
  value: number | string | null | undefined,
  decimals: number = 0
): string => {
  if (value === null || value === undefined) return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '-';

  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Trunca um texto com reticências
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo
 * @returns String truncada
 */
export const truncateText = (
  text: string | null | undefined,
  maxLength: number = 50
): string => {
  if (!text) return '-';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};
