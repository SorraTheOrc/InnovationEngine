import React from 'react';
import AssistantPanel from './components/AssistantPanel';

// Plugin registration function that would be called by Headlamp
export function registerPlugin() {
  // In a real Headlamp environment, this would use the actual Headlamp plugin API
  // For now, this is a placeholder that demonstrates the plugin structure
  console.log('Assistant Plugin: Registering with Headlamp');
  
  return {
    name: 'assistant',
    sidebar: {
      name: 'assistant',
      label: 'Assistant',
      icon: 'smart_toy', // Material-UI icon name
      url: '/assistant',
    },
    routes: [
      {
        path: '/assistant',
        exact: true,
        component: AssistantPanel,
      },
    ],
  };
}

// Export the main component for direct use
export { default as AssistantPanel } from './components/AssistantPanel';

// Default export for the plugin
export default function AssistantPlugin() {
  return <AssistantPanel />;
}