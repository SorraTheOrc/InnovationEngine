import { Plugin } from '@kinvolk/headlamp-plugin';
import AssistantPanel from './components/AssistantPanel';

// Plugin registration function that would be called by Headlamp
const plugin = new Plugin({
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
});

export function registerPlugin() {
  // Register the plugin with Headlamp
  plugin.register();
  return plugin;
}

// Export the main component for direct use
export { default as AssistantPanel } from './components/AssistantPanel';

// Default export for the plugin
export default function AssistantPlugin() {
  return <AssistantPanel />;
}
