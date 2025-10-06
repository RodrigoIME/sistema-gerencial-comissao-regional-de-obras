import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export const exportProjetosToExcel = (projetos: any[]) => {
  const data = projetos.map((p) => ({
    OPUS: p.numero_opus || "",
    Objeto: p.objeto || "",
    "OM Apoiada": p.organizacao?.["Organização Militar"] || "",
    Diretoria: p.diretoria_responsavel || "",
    "OM Executora": p.om_executora || "",
    "Valor DFD": p.valor_estimado_dfd
      ? `R$ ${Number(p.valor_estimado_dfd).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`
      : "",
    "Recursos 2025": p.recursos_previstos_2025
      ? `R$ ${Number(p.recursos_previstos_2025).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`
      : "",
    Status: p.status || "",
    Prioridade: p.prioridade || "",
    "Data Cadastro": p.created_at
      ? format(new Date(p.created_at), "dd/MM/yyyy")
      : "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 15 }, // OPUS
    { wch: 40 }, // Objeto
    { wch: 30 }, // OM Apoiada
    { wch: 15 }, // Diretoria
    { wch: 15 }, // OM Executora
    { wch: 18 }, // Valor DFD
    { wch: 18 }, // Recursos 2025
    { wch: 15 }, // Status
    { wch: 12 }, // Prioridade
    { wch: 15 }, // Data Cadastro
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Projetos");
  
  const fileName = `projetos_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportProjetoToPDF = (projeto: any) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Cabeçalho institucional
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("EXÉRCITO BRASILEIRO", 105, yPos, { align: "center" });
  
  yPos += 8;
  doc.setFontSize(14);
  doc.text("FICHA DE PROJETO", 105, yPos, { align: "center" });

  // Linha separadora
  yPos += 4;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);

  yPos += 10;

  // Seção 1: Identificação
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. IDENTIFICAÇÃO", 20, yPos);
  yPos += 2;

  autoTable(doc, {
    startY: yPos,
    head: [["Campo", "Valor"]],
    body: [
      ["Número OPUS", projeto.numero_opus || ""],
      ["Objeto", projeto.objeto || ""],
      ["Status", projeto.status || ""],
      ["Prioridade", projeto.prioridade || ""],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Seção 2: Organização
  doc.setFont("helvetica", "bold");
  doc.text("2. ORGANIZAÇÃO", 20, yPos);
  yPos += 2;

  autoTable(doc, {
    startY: yPos,
    head: [["Campo", "Valor"]],
    body: [
      ["OM Apoiada", projeto.organizacao?.["Organização Militar"] || ""],
      ["Diretoria Responsável", projeto.diretoria_responsavel || ""],
      ["OM Executora", projeto.om_executora || ""],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Seção 3: Orçamento
  doc.setFont("helvetica", "bold");
  doc.text("3. ORÇAMENTO", 20, yPos);
  yPos += 2;

  autoTable(doc, {
    startY: yPos,
    head: [["Campo", "Valor"]],
    body: [
      [
        "Valor Estimado DFD",
        projeto.valor_estimado_dfd
          ? `R$ ${Number(projeto.valor_estimado_dfd).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`
          : "",
      ],
      [
        "Recursos Previstos 2025",
        projeto.recursos_previstos_2025
          ? `R$ ${Number(projeto.recursos_previstos_2025).toLocaleString(
              "pt-BR",
              { minimumFractionDigits: 2 }
            )}`
          : "",
      ],
      ["Ação Orçamentária", projeto.acao_orcamentaria || ""],
      ["Plano Orçamentário", projeto.plano_orcamentario || ""],
      ["PRO", projeto.pro || ""],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  // Nova página se necessário
  if ((doc as any).lastAutoTable.finalY > 240) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Seção 4: Equipe Técnica
  doc.setFont("helvetica", "bold");
  doc.text("4. EQUIPE TÉCNICA", 20, yPos);
  yPos += 2;

  autoTable(doc, {
    startY: yPos,
    head: [["Função", "Responsável"]],
    body: [
      ["Arquiteto", projeto.arquiteto || ""],
      ["Engenheiro Civil", projeto.engenheiro_civil || ""],
      ["Engenheiro Eletricista", projeto.engenheiro_eletricista || ""],
      ["Engenheiro Mecânico", projeto.engenheiro_mecanico || ""],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Seção 5: Indicadores
  doc.setFont("helvetica", "bold");
  doc.text("5. INDICADORES", 20, yPos);
  yPos += 2;

  autoTable(doc, {
    startY: yPos,
    head: [["Indicador", "Status"]],
    body: [
      ["Está no PCA 2025?", projeto.esta_no_pca_2025 ? "Sim" : "Não"],
      ["Está no DFD?", projeto.esta_no_dfd ? "Sim" : "Não"],
      ["Foi lançado no OPUS?", projeto.foi_lancado_opus ? "Sim" : "Não"],
      [
        "Data de Lançamento OPUS",
        projeto.data_lancamento_opus
          ? format(new Date(projeto.data_lancamento_opus), "dd/MM/yyyy")
          : "",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Seção 6: Prazos
  doc.setFont("helvetica", "bold");
  doc.text("6. PRAZOS", 20, yPos);
  yPos += 2;

  autoTable(doc, {
    startY: yPos,
    head: [["Tipo de Prazo", "Data"]],
    body: [
      [
        "Prazo Inicial",
        projeto.prazo_inicial
          ? format(new Date(projeto.prazo_inicial), "dd/MM/yyyy")
          : "",
      ],
      [
        "Prazo Previsto",
        projeto.prazo_previsto
          ? format(new Date(projeto.prazo_previsto), "dd/MM/yyyy")
          : "",
      ],
      [
        "Prazo Real de Conclusão",
        projeto.prazo_real_conclusao
          ? format(new Date(projeto.prazo_real_conclusao), "dd/MM/yyyy")
          : "",
      ],
      [
        "Data de Conclusão",
        projeto.data_conclusao
          ? format(new Date(projeto.data_conclusao), "dd/MM/yyyy")
          : "",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  // Nova página se necessário
  if ((doc as any).lastAutoTable.finalY > 240) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Seção 7: Observações
  if (projeto.observacoes_iniciais || projeto.motivo_pausa || projeto.motivo_cancelamento) {
    doc.setFont("helvetica", "bold");
    doc.text("7. OBSERVAÇÕES", 20, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    if (projeto.observacoes_iniciais) {
      doc.text("Observações Iniciais:", 20, yPos);
      yPos += 5;
      const splitText = doc.splitTextToSize(projeto.observacoes_iniciais, 170);
      doc.text(splitText, 20, yPos);
      yPos += splitText.length * 5 + 5;
    }

    if (projeto.motivo_pausa) {
      doc.text("Motivo de Pausa:", 20, yPos);
      yPos += 5;
      const splitText = doc.splitTextToSize(projeto.motivo_pausa, 170);
      doc.text(splitText, 20, yPos);
      yPos += splitText.length * 5 + 5;
    }

    if (projeto.motivo_cancelamento) {
      doc.text("Motivo de Cancelamento:", 20, yPos);
      yPos += 5;
      const splitText = doc.splitTextToSize(projeto.motivo_cancelamento, 170);
      doc.text(splitText, 20, yPos);
    }
  }

  // Footer com número de páginas
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
    doc.text(
      `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      105,
      295,
      { align: "center" }
    );
  }

  const fileName = `Projeto_OPUS_${projeto.numero_opus || "sem_numero"}.pdf`;
  doc.save(fileName);
};
