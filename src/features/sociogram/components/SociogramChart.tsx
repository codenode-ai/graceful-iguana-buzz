import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Employee } from '@/shared/lib/mockData';

interface Response {
  from: number;
  to: number;
}

interface SociogramChartProps {
  employees: Employee[];
  responses: Response[];
}

const SociogramChart: React.FC<SociogramChartProps> = ({ employees, responses }) => {
  const d3Container = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (employees && responses && d3Container.current) {
      const width = d3Container.current.parentElement?.clientWidth || 800;
      const height = d3Container.current.parentElement?.clientHeight || 600;

      const nodes = employees.map(e => ({ id: e.id, name: e.name, inDegree: 0 }));
      const links: { source: number; target: number; mutual: boolean }[] = [];
      const responseSet = new Set(responses.map(r => `${r.from}-${r.to}`));

      responses.forEach(response => {
        const targetNode = nodes.find(n => n.id === response.to);
        if (targetNode) {
          targetNode.inDegree += 1;
        }
        
        const isMutual = responseSet.has(`${response.to}-${response.from}`);
        links.push({ source: response.from, target: response.to, mutual: isMutual });
      });

      const svg = d3.select(d3Container.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', [-width / 2, -height / 2, width, height])
        .call(d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
          g.attr("transform", event.transform)
        }));
      
      svg.selectAll("*").remove(); // Clear previous renders
      const g = svg.append("g");

      const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-250))
        .force('center', d3.forceCenter(0, 0));

      const link = g.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', d => d.mutual ? 4 : 1.5);

      const node = g.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', d => 10 + d.inDegree * 3)
        .attr('fill', '#2563eb')
        .call(drag(simulation) as any);

      const labels = g.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.name)
        .attr("x", d => 15 + d.inDegree * 2)
        .attr("y", 5)
        .attr("font-size", "12px")
        .attr("fill", "#111");

      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
        
        labels
          .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });

      function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
        function dragstarted(event: d3.D3DragEvent<SVGCircleElement, any, any>) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }
        function dragged(event: d3.D3DragEvent<SVGCircleElement, any, any>) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }
        function dragended(event: d3.D3DragEvent<SVGCircleElement, any, any>) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }
        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      }
    }
  }, [employees, responses]);

  return (
    <svg ref={d3Container}></svg>
  );
};

export default SociogramChart;