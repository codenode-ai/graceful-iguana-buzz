export interface Employee {
  id: number;
  name: string;
  language: 'Português' | 'Inglês' | 'Espanhol';
  observations: string;
}

export const employees: Employee[] = [
  { id: 1, name: 'Ana Silva', language: 'Português', observations: 'Excelente em limpezas pesadas.' },
  { id: 2, name: 'Beatriz Costa', language: 'Português', observations: 'Muito detalhista.' },
  { id: 3, name: 'Carla Dias', language: 'Inglês', observations: 'Ótima com clientes estrangeiros.' },
  { id: 4, name: 'Daniela Rocha', language: 'Espanhol', observations: 'Rápida e eficiente.' },
  { id: 5, name: 'Eduarda Lima', language: 'Português', observations: 'Boa em trabalho em equipe.' },
  { id: 6, name: 'Fernanda Mota', language: 'Português', observations: 'Prefere trabalhar sozinha.' },
];

// Mock responses for sociogram
// from -> to
export const mockResponses = [
  { from: 1, to: 2 }, { from: 1, to: 5 },
  { from: 2, to: 1 }, { from: 2, to: 4 },
  { from: 3, to: 5 }, { from: 3, to: 1 },
  { from: 4, to: 2 }, { from: 4, to: 5 },
  { from: 5, to: 1 }, { from: 5, to: 3 },
  { from: 6, to: 4 },
];