package assistant

import (
	"fmt"
	"strings"

	"github.com/Azure/InnovationEngine/internal/ui"
	"github.com/charmbracelet/bubbles/help"
	"github.com/charmbracelet/bubbles/key"
	"github.com/charmbracelet/bubbles/textarea"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// Assistant mode commands
type AssistantCommands struct {
	send     key.Binding
	quit     key.Binding
	clear    key.Binding
	example1 key.Binding
	example2 key.Binding
	example3 key.Binding
}

func newAssistantCommands() AssistantCommands {
	return AssistantCommands{
		send: key.NewBinding(
			key.WithKeys("ctrl+s"),
			key.WithHelp("ctrl+s", "send query"),
		),
		quit: key.NewBinding(
			key.WithKeys("ctrl+c", "esc"),
			key.WithHelp("ctrl+c/esc", "quit"),
		),
		clear: key.NewBinding(
			key.WithKeys("ctrl+l"),
			key.WithHelp("ctrl+l", "clear"),
		),
		example1: key.NewBinding(
			key.WithKeys("f1"),
			key.WithHelp("f1", "deploy app"),
		),
		example2: key.NewBinding(
			key.WithKeys("f2"),
			key.WithHelp("f2", "create service"),
		),
		example3: key.NewBinding(
			key.WithKeys("f3"),
			key.WithHelp("f3", "setup ingress"),
		),
	}
}

type AssistantModel struct {
	commands     AssistantCommands
	help         help.Model
	textarea     textarea.Model
	viewport     viewport.Model
	width        int
	height       int
	responses    []string
	environment  string
	ready        bool
}

// Create a new assistant model
func NewAssistantModel(environment string) AssistantModel {
	commands := newAssistantCommands()
	help := help.New()
	help.ShowAll = false

	ta := textarea.New()
	ta.Placeholder = "Ask me about Kubernetes deployment tasks..."
	ta.Focus()
	ta.CharLimit = 500

	vp := viewport.New(80, 20)
	vp.SetContent("Welcome to the Innovation Engine Assistant!\n\nI can help you create executable documents for Kubernetes tasks.\n\nType your question below and press Ctrl+S to send, or use the quick start options:")

	return AssistantModel{
		commands:    commands,
		help:        help,
		textarea:    ta,
		viewport:    vp,
		responses:   []string{"Welcome to the Innovation Engine Assistant!\n\nI can help you create executable documents for Kubernetes tasks.\n\nType your question below and press Ctrl+S to send, or use the quick start options:"},
		environment: environment,
		ready:       false,
	}
}

func (m AssistantModel) Init() tea.Cmd {
	return textarea.Blink
}

func (m AssistantModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var (
		tiCmd tea.Cmd
		vpCmd tea.Cmd
	)

	m.textarea, tiCmd = m.textarea.Update(msg)
	m.viewport, vpCmd = m.viewport.Update(msg)

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		
		if !m.ready {
			m.viewport.Width = msg.Width - 4
			m.viewport.Height = msg.Height - 10
			m.textarea.SetWidth(msg.Width - 4)
			m.ready = true
		}

	case tea.KeyMsg:
		switch {
		case key.Matches(msg, m.commands.quit):
			return m, tea.Quit
		case key.Matches(msg, m.commands.clear):
			m.responses = []string{"Chat cleared. How can I help you?"}
			m.viewport.SetContent(strings.Join(m.responses, "\n\n"))
			return m, nil
		case key.Matches(msg, m.commands.send):
			if m.textarea.Value() != "" {
				return m.handleQuery(m.textarea.Value()), nil
			}
		case key.Matches(msg, m.commands.example1):
			return m.handleQuery("Create a deployment for my application"), nil
		case key.Matches(msg, m.commands.example2):
			return m.handleQuery("Create a Kubernetes service"), nil
		case key.Matches(msg, m.commands.example3):
			return m.handleQuery("Set up ingress controller"), nil
		}
	}

	return m, tea.Batch(tiCmd, vpCmd)
}

func (m AssistantModel) handleQuery(query string) AssistantModel {
	// Add user query to responses
	m.responses = append(m.responses, fmt.Sprintf("You: %s", query))
	
	// Generate response based on the query
	response := generateResponse(query)
	m.responses = append(m.responses, fmt.Sprintf("Assistant: %s", response))
	
	// Update viewport content
	m.viewport.SetContent(strings.Join(m.responses, "\n\n"))
	m.viewport.GotoBottom()
	
	// Clear textarea
	m.textarea.SetValue("")
	
	return m
}

func generateResponse(query string) string {
	queryLower := strings.ToLower(query)
	
	if strings.Contains(queryLower, "deployment") || strings.Contains(queryLower, "deploy") {
		return `I'll help you create a deployment. Here's an executable document:

# Deploy Application to Kubernetes

## Step 1: Create Deployment

` + "```bash" + `
kubectl create deployment my-app --image=nginx:latest --replicas=3
` + "```" + `

## Step 2: Expose the Deployment

` + "```bash" + `
kubectl expose deployment my-app --port=80 --target-port=80 --type=ClusterIP
` + "```" + `

## Step 3: Verify Deployment

` + "```bash" + `
kubectl get deployments
kubectl get pods -l app=my-app
` + "```" + `

Save this as a .md file and run: ie execute deployment.md`
	}
	
	if strings.Contains(queryLower, "service") {
		return `Here's how to create a Kubernetes service:

# Create Kubernetes Service

## Step 1: Create Service YAML

` + "```bash" + `
cat <<EOF > service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
EOF
` + "```" + `

## Step 2: Apply Service

` + "```bash" + `
kubectl apply -f service.yaml
` + "```" + `

## Step 3: Verify Service

` + "```bash" + `
kubectl get services
kubectl describe service my-service
` + "```" + `

Save this as a .md file and run: ie execute service.md`
	}
	
	if strings.Contains(queryLower, "ingress") {
		return `I'll guide you through setting up an ingress controller:

# Setup Ingress Controller

## Step 1: Install NGINX Ingress Controller

` + "```bash" + `
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
` + "```" + `

## Step 2: Wait for Controller to be Ready

` + "```bash" + `
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
` + "```" + `

## Step 3: Create Ingress Resource

` + "```bash" + `
cat <<EOF > ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: my-app.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80
EOF
` + "```" + `

## Step 4: Apply Ingress

` + "```bash" + `
kubectl apply -f ingress.yaml
` + "```" + `

Save this as a .md file and run: ie execute ingress.md`
	}
	
	// Default response
	return `I can help you with Kubernetes tasks! Here are some things I can assist with:

- Creating deployments and services
- Setting up ingress controllers
- Managing pods and containers
- Configuring storage and volumes
- Setting up monitoring and logging

Try asking more specific questions like:
- "How do I create a deployment?"
- "Help me set up a service"
- "I need to configure ingress"

Or use the quick start buttons (F1, F2, F3) for common tasks.

All responses will be in executable document format that you can save as .md files and run with Innovation Engine!`
}

func (m AssistantModel) View() string {
	if !m.ready {
		return "Loading..."
	}

	title := ui.ScenarioTitleStyle.Width(m.width).
		Align(lipgloss.Center).
		Render("Innovation Engine Assistant")

	border := lipgloss.NewStyle().
		Width(m.viewport.Width).
		Border(lipgloss.NormalBorder())

	viewport := border.Render(m.viewport.View())
	
	textareaStyle := lipgloss.NewStyle().
		Width(m.textarea.Width()).
		Border(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color("62"))

	textarea := textareaStyle.Render(m.textarea.View())
	
	helpView := m.help.View(m.commands)
	
	return fmt.Sprintf("%s\n\n%s\n\n%s\n\n%s",
		title,
		viewport,
		textarea,
		helpView,
	)
}

// ShortHelp returns keybindings to be shown in the mini help view.
func (k AssistantCommands) ShortHelp() []key.Binding {
	return []key.Binding{k.send, k.clear, k.quit}
}

// FullHelp returns keybindings for the expanded help view.
func (k AssistantCommands) FullHelp() [][]key.Binding {
	return [][]key.Binding{
		{k.send, k.clear, k.quit},
		{k.example1, k.example2, k.example3},
	}
}