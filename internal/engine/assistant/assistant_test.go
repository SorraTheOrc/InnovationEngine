package assistant

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewAssistantModel(t *testing.T) {
	model := NewAssistantModel("local")
	
	assert.Equal(t, "local", model.environment)
	assert.NotNil(t, model.commands)
	assert.NotNil(t, model.help)
	assert.NotNil(t, model.textarea)
	assert.NotNil(t, model.viewport)
	assert.Equal(t, false, model.ready)
	assert.Len(t, model.responses, 1)
}

func TestGenerateResponse(t *testing.T) {
	tests := []struct {
		name     string
		query    string
		contains []string
	}{
		{
			name:     "deployment query",
			query:    "Create a deployment for my app",
			contains: []string{"deployment", "kubectl create deployment", "nginx:latest"},
		},
		{
			name:     "service query",
			query:    "Create a Kubernetes service",
			contains: []string{"service", "apiVersion: v1", "kind: Service"},
		},
		{
			name:     "ingress query",
			query:    "Set up ingress controller",
			contains: []string{"ingress", "nginx.ingress.kubernetes.io", "ingress-nginx"},
		},
		{
			name:     "general query",
			query:    "What can you help with?",
			contains: []string{"Kubernetes tasks", "deployments", "services"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := generateResponse(tt.query)
			
			for _, expected := range tt.contains {
				assert.Contains(t, response, expected, "Response should contain '%s'", expected)
			}
		})
	}
}