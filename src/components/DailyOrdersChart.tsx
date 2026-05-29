import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { formatCurrency } from '../utils';

interface ChartPoint {
  date: string;
  count: number;
  totalLKR: number;
  totalUSD: number;
  label: string;
}

interface DailyOrdersChartProps {
  data: ChartPoint[];
  currency: 'USD' | 'LKR';
}

export default function DailyOrdersChart({ data, currency }: DailyOrdersChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    // Get element size for true responsiveness
    const width = containerRef.current.clientWidth || 500;
    const height = 180;
    const margin = { top: 15, right: 15, bottom: 25, left: 25 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

    // Tooltip helper overlay container
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#171717')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '4px')
      .style('font-size', '10px')
      .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.15)')
      .style('pointer-events', 'none')
      .style('z-index', '70');

    // X Scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.35);

    // Y Scale (for volumetric order counts)
    const maxVal = d3.max(data, d => d.count) || 1;
    const yMax = maxVal < 5 ? 5 : maxVal; // always have a decent scale height

    const y = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid-lines')
      .attr('stroke', '#f3f4f6')
      .attr('stroke-width', 1)
      .selectAll('line')
      .data(y.ticks(4))
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d));

    // Draw bars
    svg.append('g')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.label) || 0)
      .attr('y', height - margin.bottom)
      .attr('width', x.bandwidth())
      .attr('height', 0) // start at 0 for transition
      .attr('fill', '#171717')
      .attr('rx', 3)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', '#d97706'); // gold-amber hover
        const revenue = currency === 'USD' ? d.totalUSD : d.totalLKR;
        tooltip.html(`
          <div class="font-bold border-b border-neutral-700 pb-0.5 mb-1 text-yellow-400">${d.date}</div>
          <div>Orders: <span class="font-bold text-white">${d.count}</span></div>
          <div>Sales: <span class="font-bold text-white">${formatCurrency(revenue, currency)}</span></div>
        `);
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', function (event) {
        // Calculate coordinate positions relative to the scroll container
        const bounds = containerRef.current?.getBoundingClientRect();
        const mouseX = event.clientX - (bounds?.left || 0);
        const mouseY = event.clientY - (bounds?.top || 0);
        tooltip
          .style('left', (mouseX + 12) + 'px')
          .style('top', (mouseY - 45) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#171717');
        tooltip.style('visibility', 'hidden');
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 40)
      .attr('y', d => y(d.count))
      .attr('height', d => Math.max(0, height - margin.bottom - y(d.count)));

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.select('.domain').attr('stroke', '#e5e7eb'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#6b7280')
        .style('font-size', '9px')
        .style('font-family', 'Inter, sans-serif')
        .style('font-weight', '500')
      )
      .call(g => g.selectAll('.tick line').attr('stroke', '#e5e7eb'));

    // Y Axis (integer counts)
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(Math.min(yMax, 5)).tickFormat(d3.format('d')))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#9ca3af')
        .style('font-size', '9px')
        .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
      )
      .call(g => g.selectAll('.tick line').remove());

    // Cleanup tooltips on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, currency]);

  return (
    <div className="relative bg-white border border-neutral-150 rounded-lg p-3.5 shadow-xs" ref={containerRef}>
      <div className="flex justify-between items-center mb-2.5">
        <div>
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-neutral-400 font-mono block">Weekly Velocity Matrix</span>
          <h4 className="text-[11px] font-bold text-neutral-800 uppercase tracking-tight">Sales & Daily Order Rhythm</h4>
        </div>
        <div className="text-right text-[9px] text-neutral-400 font-mono">
          Last 7 Days (D3)
        </div>
      </div>
      <div className="w-full">
        <svg ref={svgRef} className="w-full h-auto" />
      </div>
    </div>
  );
}
