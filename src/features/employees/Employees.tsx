import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useToast } from "@/shared/components/ui/use-toast";
import { useEmployees } from "@/features/employees/hooks/useEmployees";

// Componente temporário para testes - em produção isso viria do contexto de autenticação
const useCompany = () => {
  // Para testes, usamos o ID da empresa de exemplo do script 04_sample_data.sql
  return { companyId: '11111111-1111-1111-1111-111111111111' };
};

const Employees = () => {
  const { companyId } = useCompany();
  const { employees, loading, error, addEmployee } = useEmployees(companyId);
  const [newEmployee, setNewEmployee] = useState({ name: "", language: "", notes: "" });
  const { toast } = useToast();

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmployee.name && newEmployee.language) {
      try {
        await addEmployee({ 
          name: newEmployee.name, 
          language: newEmployee.language, 
          notes: newEmployee.notes 
        });
        
        setNewEmployee({ name: "", language: "", notes: "" });
        toast({
          title: "Sucesso!",
          description: "Nova funcionária adicionada.",
        });
      } catch (err) {
        toast({
          title: "Erro",
          description: err instanceof Error ? err.message : "Falha ao adicionar funcionária.",
          variant: "destructive",
        });
      }
    }
  };

  if (!companyId) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <h3 className="font-bold">Nenhuma empresa vinculada</h3>
        <p>Conclua o onboarding da empresa para gerenciar funcionarias.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">Erro ao carregar funcionários:</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Funcionária</CardTitle>
            <CardDescription>Preencha os dados abaixo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  value={newEmployee.name} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select 
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, language: value })} 
                  value={newEmployee.language}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Português">Português</SelectItem>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                    <SelectItem value="Espanhol">Espanhol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes" 
                  value={newEmployee.notes} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, notes: e.target.value })} 
                />
              </div>
              <Button type="submit" className="w-full">Adicionar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionárias</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.language}</TableCell>
                    <TableCell>{employee.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Employees;