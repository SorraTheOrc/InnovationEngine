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
	welcomeMessage := `Welcome to the Innovation Engine Assistant!

I can help you create executable documents for Kubernetes tasks. Here's how it works:

🚀 GETTING STARTED:
• Type your question in the text box below
• Press Ctrl+S to send your query
• I'll generate an executable document you can save and run

⚡ QUICK START OPTIONS:
• F1: Deploy an application to Kubernetes
• F2: Create a Kubernetes service  
• F3: Set up an ingress controller

📝 EXAMPLE QUERIES:
• "How do I create a deployment?"
• "Help me set up persistent storage"
• "I need to configure a load balancer"
• "Show me how to scale an application"

💡 TIP: All responses are executable documents you can save as .md files and run with:
   ie execute filename.md (automatic execution)
   ie interactive filename.md (step-by-step guide)

Ready to get started? Ask me anything about Kubernetes!`
	vp.SetContent(welcomeMessage)

	return AssistantModel{
		commands:    commands,
		help:        help,
		textarea:    ta,
		viewport:    vp,
		responses:   []string{welcomeMessage},
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

## Prerequisites

Make sure you have a running Kubernetes cluster:

` + "```bash" + `
kubectl cluster-info
` + "```" + `

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
kubectl describe deployment my-app
` + "```" + `

## Optional: Scale the Deployment

` + "```bash" + `
kubectl scale deployment my-app --replicas=5
` + "```" + `

Save this as 'deployment.md' and run: 
- ie execute deployment.md (to run automatically)
- ie interactive deployment.md (to run step by step)`
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
  labels:
    app: my-app
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

## Step 4: Test Service Connectivity

` + "```bash" + `
kubectl run test-pod --image=busybox --rm -it --restart=Never -- /bin/sh -c "wget -qO- http://my-service"
` + "```" + `

Save this as 'service.md' and run: ie execute service.md`
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

## Step 5: Verify Ingress

` + "```bash" + `
kubectl get ingress
kubectl describe ingress my-ingress
` + "```" + `

Save this as 'ingress.md' and run: ie execute ingress.md`
	}

	if strings.Contains(queryLower, "pod") {
		return `Here's how to work with pods:

# Working with Kubernetes Pods

## Step 1: Create a Simple Pod

` + "```bash" + `
cat <<EOF > pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: my-app
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
EOF
` + "```" + `

## Step 2: Apply Pod Configuration

` + "```bash" + `
kubectl apply -f pod.yaml
` + "```" + `

## Step 3: Monitor Pod Status

` + "```bash" + `
kubectl get pods
kubectl describe pod my-pod
` + "```" + `

## Step 4: View Pod Logs

` + "```bash" + `
kubectl logs my-pod
` + "```" + `

## Step 5: Execute Commands in Pod

` + "```bash" + `
kubectl exec -it my-pod -- /bin/bash
` + "```" + `

Save this as 'pod.md' and run: ie interactive pod.md`
	}

	if strings.Contains(queryLower, "storage") || strings.Contains(queryLower, "volume") || strings.Contains(queryLower, "pv") {
		return `Here's how to set up persistent storage:

# Kubernetes Storage and Volumes

## Step 1: Create a PersistentVolume

` + "```bash" + `
cat <<EOF > pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /tmp/data
EOF
` + "```" + `

## Step 2: Create a PersistentVolumeClaim

` + "```bash" + `
cat <<EOF > pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF
` + "```" + `

## Step 3: Apply Storage Resources

` + "```bash" + `
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
` + "```" + `

## Step 4: Verify Storage

` + "```bash" + `
kubectl get pv
kubectl get pvc
` + "```" + `

Save this as 'storage.md' and run: ie execute storage.md`
	}
	
	// Default response
	return `I can help you with Kubernetes tasks! Here are some things I can assist with:

**Deployments & Services:**
- Creating and managing deployments
- Setting up services and load balancers
- Scaling applications

**Networking:**
- Configuring ingress controllers
- Setting up service mesh
- Network policies

**Storage:**
- Persistent volumes and claims
- Storage classes
- StatefulSets

**Pods & Workloads:**
- Pod management and troubleshooting
- Jobs and CronJobs
- DaemonSets

**Common Commands:**
Try asking questions like:
- "How do I create a deployment?"
- "Help me set up a service"
- "I need to configure ingress"
- "How do I create persistent storage?"
- "Show me how to work with pods"

**Quick Start Options:**
- F1: Deploy an application
- F2: Create a service  
- F3: Set up ingress controller

All responses are executable documents that you can save as .md files and run with Innovation Engine:
- 'ie execute filename.md' (runs automatically)
- 'ie interactive filename.md' (step-by-step)
- 'ie test filename.md' (validates commands)

What would you like to learn about?`
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