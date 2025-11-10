import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';

interface WorldMapProps {
  visitedCountries: Record<string, string>;
  selectedCountries: Set<string>;
}

interface Country {
  type: string;
  id: string;
  properties: {
    name: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

const WorldMap: React.FC<WorldMapProps> = ({ visitedCountries, selectedCountries }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 1200;
    const height = 800;

    // Clear existing content
    svg.selectAll('*').remove();

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'absolute hidden bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm pointer-events-none transform -translate-x-1/2 transition-opacity duration-200')
      .style('z-index', '1000');

    // Set up Mercator projection centered on Japan with adjusted rotation and scale
    const projection = d3.geoMercator()
      .center([135, 35])
      .scale(250)
      .rotate([-160, 0])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load world map data with error handling
    const loadMapData = async () => {
      try {
        const response = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const topology = await response.json() as Topology;
        
        const countries = feature(topology, topology.objects.countries) as {
          type: string;
          features: Country[];
        };

        // Filter out Antarctica
        const filteredFeatures = countries.features.filter(feature => 
          feature.id !== '010'
        );

        // Create a group for the map
        const g = svg.append('g');

        // Draw countries
        g.selectAll('path')
          .data(filteredFeatures)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('fill', (d) => {
            if (d.id in visitedCountries) {
              return visitedCountries[d.id];
            }
            return '#f5f5f5';
          })
          .attr('stroke', '#000')
          .attr('stroke-width', '0.5')
          .attr('class', 'transition-all duration-300')
          .style('cursor', 'pointer')
          .on('mouseover', function(event, d) {
            // Highlight effect on hover
            d3.select(this)
              .attr('stroke-width', '1.5')
              .attr('fill', (d: any) => {
                if (d.id in visitedCountries) {
                  const color = d3.color(visitedCountries[d.id])!;
                  return color.brighter(0.2);
                }
                return '#e5e5e5';
              });
            
            tooltip
              .style('left', `${event.pageX}px`)
              .style('top', `${event.pageY - 28}px`)
              .html(d.properties.name)
              .classed('hidden', false)
              .style('opacity', 1);
          })
          .on('mousemove', function(event) {
            tooltip
              .style('left', `${event.pageX}px`)
              .style('top', `${event.pageY - 28}px`);
          })
          .on('mouseout', function(event, d) {
            // Reset highlight on mouseout
            d3.select(this)
              .attr('stroke-width', '0.5')
              .attr('fill', (d: any) => {
                if (d.id in visitedCountries) {
                  return visitedCountries[d.id];
                }
                return '#f5f5f5';
              });
            
            tooltip
              .style('opacity', 0)
              .classed('hidden', true);
          })
          .on('click', function(event, d) {
            // Click animation effect
            d3.select(this)
              .transition()
              .duration(100)
              .attr('transform', 'scale(0.95)')
              .transition()
              .duration(100)
              .attr('transform', 'scale(1)');

            // Dispatch custom event for country selection
            const customEvent = new CustomEvent('countrySelect', {
              detail: { id: d.id, name: d.properties.name }
            });
            event.currentTarget.dispatchEvent(customEvent);
          });

        // Calculate optimal scale and translation for filtered data
        const [[x0, y0], [x1, y1]] = path.bounds({ 
          type: 'FeatureCollection', 
          features: filteredFeatures 
        });
        
        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;
        
        const scale = 0.9 * Math.min(width / dx, height / dy);
        const translate = [
          width / 2 - scale * x,
          height / 2 - scale * y * 1.0
        ];

        g.attr('transform', `translate(${translate}) scale(${scale})`);

      } catch (error) {
        console.error('Error loading map data:', error);
        // Display error message on the map
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('class', 'text-red-500 text-lg')
          .text('Error loading map data. Please try refreshing the page.');
      }
    };

    loadMapData();

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [visitedCountries, selectedCountries]);

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <svg
        ref={svgRef}
        viewBox={`0 0 1200 800`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
        style={{ backgroundColor: '#ffffff' }}
      />
    </div>
  );
};

export default WorldMap;