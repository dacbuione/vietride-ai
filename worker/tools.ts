import type { WeatherResult, ErrorResult } from './types';
import { mcpManager } from './mcp-client';
import { mockTrips, Trip } from '../src/lib/mockData';
import { format, addDays, parseISO } from 'date-fns';
export type ToolResult = WeatherResult | { content: string } | ErrorResult | Trip[];
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'search_routes',
      description: 'Search for bus or car tickets between two locations in Vietnam on a specific date.',
      parameters: {
        type: 'object',
        properties: {
          origin: { type: 'string', description: 'The departure city, e.g., Hanoi' },
          destination: { type: 'string', description: 'The arrival city, e.g., Sapa' },
          date: { type: 'string', description: 'The date of travel in YYYY-MM-DD format. If not provided, defaults to today.' },
        },
        required: ['origin', 'destination'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string', description: 'The city or location name' } },
        required: ['location']
      }
    }
  },
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
function searchRoutes(origin: string, destination: string, date: string): Trip[] {
  console.log(`Searching routes from ${origin} to ${destination} on ${date}`);
  const originClean = origin.toLowerCase().replace(/city/g, '').trim();
  const destClean = destination.toLowerCase().replace(/city/g, '').trim();
  const results = mockTrips.filter(trip =>
    trip.from.toLowerCase().includes(originClean) &&
    trip.to.toLowerCase().includes(destClean)
  );
  // In a real scenario, you'd filter by date. Here we just return matching routes.
  return results;
}
export async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  try {
    // Dispatch an event with tool results for frontend consumption
    const dispatchToolResult = (toolName: string, result: any) => {
      const event = new CustomEvent('tool-result', { detail: { toolName, result } });
      // This is a mock for server-side events. In a real app, you'd use websockets or another mechanism.
      // For this project, we'll rely on the AI's text response to convey results.
      // The frontend will listen for this event if it's in the same context (not applicable here in worker).
      // The primary way results get to the user is via the AI's textual response.
      // However, we can also use this to pass structured data back to the agent handler.
    };
    switch (name) {
      case 'search_routes': {
        const { origin, destination } = args as { origin: string; destination: string };
        let { date } = args as { date?: string };
        if (!date) {
          date = format(new Date(), 'yyyy-MM-dd');
        } else {
          // Handle relative dates like "tomorrow"
          if (date.toLowerCase() === 'tomorrow') {
            date = format(addDays(new Date(), 1), 'yyyy-MM-dd');
          }
          // Basic validation, can be improved
          try {
            date = format(parseISO(date), 'yyyy-MM-dd');
          } catch (e) {
             // If parsing fails, default to today
             console.warn("Invalid date format, defaulting to today:", date);
             date = format(new Date(), 'yyyy-MM-dd');
          }
        }
        const results = searchRoutes(origin, destination, date);
        dispatchToolResult(name, results);
        return results;
      }
      case 'get_weather':
        return {
          location: args.location as string,
          temperature: Math.floor(Math.random() * 40) - 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 100)
        };
      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}