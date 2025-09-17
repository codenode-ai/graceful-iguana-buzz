import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { employees } from "@/shared/lib/mockData";
import { useToast } from "@/shared/components/ui/use-toast";
import { Copy } from "lucide-react";

const Questionnaires = () => {
  const [generatedLinks, setGeneratedLinks] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const generateLink = (employeeId: number) => {
    const encodedId = btoa(employeeId.toString());
    const link = `${window.location.origin}/questionnaire/${encodedId}`;
    setGeneratedLinks({ ...generatedLinks, [employeeId]: link });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link Copiado!",
      description: "O link do questionário foi copiado para a área de transferência.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envio de Questionário</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionária</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead className="w-[50%]">Link Gerado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>
                  <Button onClick={() => generateLink(employee.id)}>Gerar Link</Button>
                </TableCell>
                <TableCell>
                  {generatedLinks[employee.id] && (
                    <div className="flex items-center space-x-2">
                      <Input value={generatedLinks[employee.id]} readOnly />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedLinks[employee.id])}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Questionnaires;