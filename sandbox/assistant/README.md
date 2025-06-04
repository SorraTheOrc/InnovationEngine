# Assistant Headlamp Plugin

A Headlamp plugin that provides an integrated assistant for authoring Executable Documents with GitHub Copilot assistance. This plugin helps Kubernetes users create and manage applications using Innovation Engine's executable documentation approach.

## Features

- **Integrated Assistant UI**: Chat-like interface within Headlamp for interacting with GitHub Copilot
- **Executable Documentation**: Generate documentation that can be executed using Innovation Engine
- **Quick Start Actions**: Pre-built prompts for common Kubernetes tasks
- **Code Actions**: Copy and run generated code snippets
- **Kubernetes-focused**: Tailored responses for deployment, service, storage, and configuration management

## Installation

### Prerequisites

- [Headlamp](https://headlamp.dev/) installed and running
- Access to a Kubernetes cluster (local or remote)
- Innovation Engine CLI (optional, for executing generated documents)

### Start the Plugin

   ```bash
   cd sandbox/assistant
   npm install
   npm run start
   ```
## Usage

### Accessing the Assistant

1. Open Headlamp in your browser
2. Look for the "Assistant" entry in the sidebar (robot icon)
3. Click to open the Assistant panel

### Using the Assistant

#### Quick Start Actions
Click on any of the pre-built quick start actions:
- **Create Deployment**: Generate deployment YAML and commands
- **Add Service**: Create services to expose your applications
- **Persistent Storage**: Set up persistent volume claims
- **Configuration**: Manage ConfigMaps and Secrets

#### Chat Interface
1. Type your question or request in the text input
2. Press Enter or click the Send button
3. View the assistant's response with code snippets and explanations
4. Use the action buttons to:
   - **Copy** code snippets to clipboard
   - **Run** with Innovation Engine (if installed)
   - **Help** for additional documentation

### Example Queries

- "Create a deployment for my Node.js application"
- "How do I expose my service externally?"
- "Add persistent storage to my database pod"
- "Create a ConfigMap for my application configuration"
- "Scale my deployment to 3 replicas"

## Development

### Prerequisites

- Node.js 16+ and npm
- TypeScript knowledge
- React experience
- Familiarity with Headlamp plugin development

### Setup Development Environment

1. **Clone and install dependencies:**
   ```bash
   cd sandbox/assistant
   npm install
   ```

2. **Start development mode:**
   ```bash
   npm run start
   ```

3. **Run tests:**
   ```bash
   npx jest
   ```

### Project Structure

```
plugins/assistant/
├── src/
│   ├── components/          # React components
│   │   ├── AssistantPanel.tsx    # Main panel component
│   │   ├── ResponseDisplay.tsx   # Response rendering
│   │   └── QuickStartActions.tsx # Quick action buttons
│   ├── __tests__/          # Unit tests
│   └── index.tsx           # Plugin entry point
├── dist/                   # Built plugin files
├── package.json           # Dependencies and scripts
├── plugin.json           # Headlamp plugin metadata
├── webpack.config.js     # Build configuration
└── README.md            # This file
```

### Testing

The plugin includes comprehensive unit tests:

```bash
# Run all tests
npx jest

# Run tests in watch mode
npx jest --watch

# Generate coverage report
npx jest --coverage
```

### Building

```bash
# Production build
npm run build

# Development build with watch
npm run dev
```

## Integration with Innovation Engine

The Assistant plugin is designed to work seamlessly with Innovation Engine:

1. **Generated Code**: All code snippets are formatted as executable documentation
2. **Run Actions**: Use the "Run" button to execute code with Innovation Engine CLI
3. **Best Practices**: Responses follow Innovation Engine documentation patterns

### Example Generated Document

```markdown
# Deploy Nginx Application

This document shows how to deploy an Nginx application to Kubernetes.

## Create Deployment

```bash
# Create the deployment
kubectl create deployment nginx-app --image=nginx:latest

# Verify deployment
kubectl get deployments
\`\`\`

## Expose the Service

```bash
# Create a service
kubectl expose deployment nginx-app --port=80 --type=LoadBalancer

# Check service status
kubectl get services
\`\`\`
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- [Headlamp Documentation](https://headlamp.dev/docs/)
- [Innovation Engine Documentation](https://github.com/Azure/InnovationEngine)
- [GitHub Issues](https://github.com/SorraTheOrc/InnovationEngine/issues)
