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
			contains: []string{"deployment", "kubectl create deployment", "nginx:latest", "Prerequisites"},
		},
		{
			name:     "service query",
			query:    "Create a Kubernetes service",
			contains: []string{"service", "apiVersion: v1", "kind: Service", "my-service"},
		},
		{
			name:     "ingress query",
			query:    "Set up ingress controller",
			contains: []string{"ingress", "nginx.ingress.kubernetes.io", "ingress-nginx"},
		},
		{
			name:     "pod query",
			query:    "How do I work with pods?",
			contains: []string{"pod", "kubectl apply", "kubectl logs"},
		},
		{
			name:     "storage query",
			query:    "I need persistent storage",
			contains: []string{"PersistentVolume", "PersistentVolumeClaim", "storage"},
		},
		{
			name:     "general query",
			query:    "What can you help with?",
			contains: []string{"Kubernetes tasks", "Deployments", "Quick Start"},
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