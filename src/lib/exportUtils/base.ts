import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export interface ExportColumn<T = any> {
  key: keyof T | string;
  label: string;
  format?: (value: any, row: T) => string;
}

/**
 * Prepara dados para exportação aplicando formatação nas colunas
 */
export const prepareExportData = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[]
): Record<string, string>[] => {
  return data.map((row) => {
    const exportRow: Record<string, string> = {};
    
    columns.forEach((col) => {
      const value = row[col.key as keyof T];
      exportRow[col.label] = col.format ? col.format(value, row) : String(value ?? '-');
    });
    
    return exportRow;
  });
};

/**
 * Cria uma planilha Excel
 */
export const createExcelWorksheet = (
  data: Record<string, any>[],
  sheetName: string = 'Dados'
): XLSX.WorkSheet => {
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Auto-ajustar largura das colunas
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  
  ws['!cols'] = colWidths;
  
  return ws;
};

/**
 * Exporta dados para Excel
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string
): void => {
  const exportData = prepareExportData(data, columns);
  const ws = createExcelWorksheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
  XLSX.writeFile(wb, `${fileName}-${timestamp}.xlsx`);
};

/**
 * Cria uma tabela PDF
 */
export const createPDFTable = (
  doc: jsPDF,
  data: Record<string, any>[],
  title: string
): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((header) => row[header]));

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 30,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 30, right: 10, bottom: 10, left: 10 },
  });
};

/**
 * Exporta dados para PDF
 */
export const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  title: string
): void => {
  const exportData = prepareExportData(data, columns);
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Adicionar título
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  // Adicionar data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 26);

  // Criar tabela
  createPDFTable(doc, exportData, title);

  // Salvar
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
  doc.save(`${fileName}-${timestamp}.pdf`);
};

/**
 * Formata valor monetário para exportação
 */
export const formatCurrencyForExport = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formata data para exportação
 */
export const formatDateForExport = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd/MM/yyyy');
  } catch {
    return '-';
  }
};

/**
 * Formata data e hora para exportação
 */
export const formatDateTimeForExport = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
  } catch {
    return '-';
  }
};
