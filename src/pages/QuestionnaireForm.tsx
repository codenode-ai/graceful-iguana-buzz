import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { employees } from "@/lib/mockData";

const questions = [
  "Com quem você gostaria de limpar uma casa difícil?",
  "Quem você chamaria para revisar seu trabalho antes do cliente ver?",
  "Com quem você se sente mais tranquila no transporte?",
];

const QuestionnaireForm = () => {
  const { employeeId: encodedId } = useParams();
  const [submitted, setSubmitted] = useState(false);
  
  let employeeId: string | null = null;
  try {
    employeeId = encodedId ? atob(encodedId) : null;
  } catch (e) {
    console.error("Invalid base64 string:", encodedId);
  }

  const currentEmployee = employees.find(e => e.id.toString() === employeeId);
  const otherEmployees = employees.filter(e => e.id.toString() !== employeeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Obrigado por responder!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">Sua contribuição é muito importante para nós.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl text-destructive">Link Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">O link do questionário que você tentou acessar não é válido.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Questionário de Afinidade</CardTitle>
          <CardDescription>Olá, {currentEmployee.name}. Selecione suas colegas para cada situação.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="space-y-4">
                <h3 className="font-semibold">{qIndex + 1}. {question}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {otherEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-2">
                      <Checkbox id={`q${qIndex}-e${employee.id}`} />
                      <Label htmlFor={`q${qIndex}-e${employee.id}`}>{employee.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button type="submit" className="w-full text-lg py-6">Finalizar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionnaireForm;