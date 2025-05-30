# Innovation Engine Assistant

The Innovation Engine Assistant is an interactive command-line tool that helps users generate executable documents for Kubernetes tasks using natural language queries.

## Features

- **Interactive Terminal Interface**: Built using the same bubble tea framework as Innovation Engine's interactive mode
- **Natural Language Queries**: Type questions in plain English about Kubernetes tasks
- **Executable Document Generation**: All responses are properly formatted markdown documents that can be executed with Innovation Engine
- **Quick Start Actions**: Pre-defined shortcuts for common tasks
- **Comprehensive Coverage**: Supports deployments, services, ingress, storage, pods, and more

## Usage

Launch the assistant with:

```bash
ie assistant
```

## Interface

### Text Input
- Type your question in the text area at the bottom
- Press `Ctrl+S` to send your query
- Press `Ctrl+L` to clear the conversation
- Press `Ctrl+C` or `Esc` to quit

### Quick Start Actions
- **F1**: Deploy an application to Kubernetes
- **F2**: Create a Kubernetes service
- **F3**: Set up an ingress controller

## Example Queries

The assistant can help with various Kubernetes tasks:

- "How do I create a deployment?"
- "Help me set up a service"
- "I need to configure ingress"
- "Show me how to work with pods"
- "How do I create persistent storage?"
- "Help me scale an application"

## Generated Documents

All responses from the assistant are executable documents that can be:

1. **Saved to a file**: Copy the response and save as a `.md` file
2. **Executed automatically**: `ie execute filename.md`
3. **Run interactively**: `ie interactive filename.md`
4. **Tested**: `ie test filename.md`

## Example Workflow

1. Launch the assistant: `ie assistant`
2. Ask a question: "How do I deploy an nginx application?"
3. Copy the generated response to a file: `deployment.md`
4. Execute the document: `ie execute deployment.md`

The assistant generates complete, runnable documentation that follows Kubernetes best practices and includes verification steps.

## Integration

The assistant integrates seamlessly with Innovation Engine's existing features:

- Uses the same CLI structure and configuration options
- Follows established patterns from the interactive mode
- Generates documents compatible with all Innovation Engine execution modes
- Maintains consistency with the existing user experience

## Future Enhancements

The assistant is designed to be extensible and could be enhanced with:

- Integration with actual AI services (GitHub Copilot, OpenAI, etc.)
- Custom templates and user-defined scenarios
- Integration with cluster introspection for context-aware responses
- Support for other orchestration platforms beyond Kubernetes