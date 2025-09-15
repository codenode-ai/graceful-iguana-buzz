import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SociogramChart from "@/components/SociogramChart";
import { employees, mockResponses } from "@/lib/mockData";

const Sociogram = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sociograma da Equipe</CardTitle>
        <CardDescription>
          Visualize os vínculos de trabalho entre as funcionárias. Nós maiores indicam mais escolhas recebidas. Linhas mais grossas indicam escolhas mútuas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] border rounded-lg bg-white">
          <SociogramChart employees={employees} responses={mockResponses} />
        </div>
      </CardContent>
    </Card>
  );
};

export default Sociogram;