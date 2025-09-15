import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Reports = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const exportToPdf = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
        pdf.save('relatorio-sociograma.pdf');
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <Button onClick={exportToPdf}>
          <Download className="mr-2 h-4 w-4" />
          Exportar como PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatório de Análise Sociométrica</CardTitle>
          <CardDescription>Insights preliminares baseados nos dados coletados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={reportRef} className="p-6 bg-white text-black">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-4">Sumário Executivo</h2>
              <p>
                Este relatório apresenta uma análise dos padrões de relacionamento e colaboração dentro da equipe,
                com base nas respostas do questionário de afinidade. O objetivo é identificar líderes informais,
                subgrupos (panelinhas) e funcionárias que possam estar em situação de isolamento.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Principais Insights</h3>
              <ul>
                <li>
                  <strong>Líderes Naturais:</strong> As funcionárias Ana Silva e Eduarda Lima foram as mais escolhidas
                  pelas colegas, indicando uma posição de liderança informal e confiança dentro do grupo.
                </li>
                <li>
                  <strong>Vínculos Mútuos Fortes:</strong> Observou-se uma forte reciprocidade entre Ana Silva e Beatriz Costa,
                  sugerindo uma parceria de trabalho eficaz e bem estabelecida.
                </li>
                <li>
                  <strong>Potencial de Isolamento:</strong> A funcionária Fernanda Mota recebeu poucas escolhas, o que pode
                  indicar uma necessidade de maior integração com a equipe. Recomenda-se atenção e ações para
                  promover sua participação.
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">Recomendações</h3>
              <ol>
                <li>
                  <strong>Aproveitar Lideranças:</strong> Envolver Ana Silva e Eduarda Lima em projetos de mentoria e
                  treinamento para disseminar boas práticas na equipe.
                </li>
                <li>
                  <strong>Incentivar a Integração:</strong> Criar oportunidades de trabalho em duplas ou trios que
                  misturem diferentes grupos, focando em incluir funcionárias como Fernanda Mota em projetos
                  colaborativos.
                </li>
                <li>
                  <strong>Monitoramento Contínuo:</strong> Realizar esta análise periodicamente para acompanhar a evolução
                  da dinâmica da equipe e o impacto das ações implementadas.
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;