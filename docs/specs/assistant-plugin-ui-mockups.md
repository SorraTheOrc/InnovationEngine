# 002-Assistant Plugin UI Design for Iterative Exec Doc Authoring (Mockups)

**Status:** Draft


> **Note:** This document contains UI mockups and specifications for the Assistant Headlamp plugin. These mockups illustrate the intended UI flows, interactions, and accessibility features, but do not represent final implementation or code.

## Overview

This specification provides detailed UI mockups for the Assistant Headlamp plugin that enables iterative authoring, editing, and validation of Executable Documents (Exec Docs) with GitHub Copilot integration.

## UI Component Mockups

> **Note:** These mockups focus on the main body of the page content and do not include standard Headlamp UI Chrome (navigation bars, menus, etc.).

### 1. Main Plugin Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Innovation Engine Assistant Plugin                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Context: production-cluster    Namespace: default                  [Change] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [Overview Authoring Panel - collapsed/expanded based on state]             │
│                                                                             │
│ [Exec Doc Steps View - main content area]                                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Save] [Load] [Export]                                    Status: Ready   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:** 
- Main container has `role="main"` and `aria-label="Innovation Engine Assistant Plugin"`
- Header has `role="banner"`
- Footer has `role="contentinfo"`
- Focus indicator visible on all interactive elements

### 2. Overview Authoring Panel

#### 2.1 Initial State (New Document)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✨ Create New Executable Document                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Prompt for Copilot:                                                        │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Describe what you want to accomplish with Kubernetes...                │ │
│ │                                                                         │ │
│ │ Example: "Deploy a web application with Redis cache and configure      │ │
│ │ ingress routing"                                                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [Generate Overview with Copilot]                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Panel has `aria-expanded="true"` when visible
- Textarea has `aria-label="Describe your Kubernetes workflow for Copilot"`
- Button has `aria-describedby="copilot-help-text"`
- Placeholder text available to screen readers

#### 2.2 Overview Generated State
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📝 Document Overview                                          [Edit] [✓ Approve] │
├─────────────────────────────────────────────────────────────────────────────┤
│ Generated Overview:                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ # Deploy Web Application with Redis                                     │ │
│ │                                                                         │ │
│ │ This document guides you through deploying a scalable web application  │ │
│ │ with Redis caching on Kubernetes. We'll create deployments, services,  │ │
│ │ and configure ingress routing for external access.                     │ │
│ │                                                                         │ │
│ │ Prerequisites:                                                          │ │
│ │ - Kubernetes cluster access                                             │ │
│ │ - kubectl configured                                                    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Refine with Copilot:                                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ "Add monitoring with Prometheus" or edit directly above...              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [Refine] [Direct Edit] [✓ Approve & Generate Steps]                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Overview text area has `aria-label="Generated document overview"`
- Edit button has `aria-label="Edit overview directly"`
- Approve button has `aria-label="Approve overview and generate steps"`
- Refinement input has `aria-label="Provide additional instructions to Copilot"`

### 3. Exec Doc Steps View

#### 3.1 Steps Generated View
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📋 Executable Document Steps                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ Step 1: Create Namespace ─────────────────────────────── [▼] [✏️] [▶️] ─┐ │
│ │ Create a dedicated namespace for our application                        │ │
│ │                                                                         │ │
│ │ ```bash                                                                 │ │
│ │ kubectl create namespace webapp                                         │ │
│ │ ```                                                                     │ │
│ │                                                                         │ │
│ │ Expected: namespace/webapp created                                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ Step 2: Deploy Redis ─────────────────────────────────── [▼] [✏️] [▶️] ─┐ │
│ │ Deploy Redis instance for caching                                      │ │
│ │                                                                         │ │
│ │ ```yaml                                                                 │ │
│ │ apiVersion: apps/v1                                                     │ │
│ │ kind: Deployment                                                        │ │
│ │ metadata:                                                               │ │
│ │   name: redis                                                           │ │
│ │ [...content collapsed...]                                               │ │
│ │ ```                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ Step 3: Deploy Web Application ──────────────────────── [▼] [✏️] [▶️] ─┐ │
│ │ [Collapsed - click to expand]                                          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [▶️ Run All Steps] [💾 Save Document] [📤 Export]                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Each step is a `<details>` element with proper `aria-expanded` state
- Step headers are `<summary>` elements with `role="button"`
- Collapse/expand buttons have `aria-label="Expand step details"`
- Edit buttons have `aria-label="Edit step content"`
- Run buttons have `aria-label="Execute this step"`
- Code blocks have `role="code"` and language annotation

#### 3.2 Step Edit Mode
```
┌─ Step 1: Create Namespace (EDITING) ──────────────────── [💾] [❌] [🤖] ─┐
│ Step Description:                                                       │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Create a dedicated namespace for our application                    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Command:                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ kubectl create namespace webapp                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Expected Output (optional):                                             │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ namespace/webapp created                                            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Ask Copilot:                                                            │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ "Add labels for better organization" or other modifications...       │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [💾 Save Changes] [❌ Cancel] [🤖 Get Copilot Suggestions]               │
└─────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Form has `role="form"` with `aria-label="Edit step content"`
- All input fields have proper labels
- Save button has `aria-label="Save step changes"`
- Cancel button has `aria-label="Cancel editing and revert changes"`
- Copilot button has `aria-label="Get AI suggestions for this step"`

#### 3.3 Step Execution Result
```
┌─ Step 1: Create Namespace ─────────────────────────────── [▼] [✏️] [✅] ─┐
│ Create a dedicated namespace for our application                        │
│                                                                         │
│ ```bash                                                                 │
│ kubectl create namespace webapp                                         │
│ ```                                                                     │
│                                                                         │
│ ✅ Execution Result (completed in 1.2s):                               │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ namespace/webapp created                                            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Context: production-cluster | Namespace: webapp ✅                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Success icon has `aria-label="Step completed successfully"`
- Result area has `role="log"` for screen reader announcements
- Execution time is included in accessible text
- Context information clearly labeled

#### 3.4 Step Execution Error
```
┌─ Step 2: Deploy Redis ─────────────────────────────────── [▼] [✏️] [❌] ─┐
│ Deploy Redis instance for caching                                      │
│                                                                         │
│ ```yaml                                                                 │
│ kubectl apply -f redis-deployment.yaml                                 │
│ ```                                                                     │
│                                                                         │
│ ❌ Execution Failed (after 5.3s):                                      │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Error: unable to recognize "redis-deployment.yaml": no matches for │ │
│ │ kind "Deployment" in version "apps/v1beta1"                         │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ 💡 Suggestions:                                                         │
│ • Check API version (should be apps/v1)                                │
│ • Verify file exists and is accessible                                 │
│                                                                         │
│ [🔄 Retry] [✏️ Edit Step] [🤖 Ask Copilot for Fix]                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Error icon has `aria-label="Step failed with errors"`
- Error details have `role="alert"` for immediate screen reader announcement
- Suggestions list has proper list semantics
- Action buttons clearly labeled with purpose

### 4. Kubernetes Context/Namespace Selector

#### 4.1 Context Selection Modal
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚙️ Select Kubernetes Context & Namespace                              [✕] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Current Context: production-cluster                                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ◉ production-cluster                                                    │ │
│ │ ○ staging-cluster                                                       │ │
│ │ ○ development-cluster                                                   │ │
│ │ ○ local-minikube                                                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Current Namespace: default                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ◉ default                                                               │ │
│ │ ○ kube-system                                                           │ │
│ │ ○ webapp                                                                │ │
│ │ ○ monitoring                                                            │ │
│ │ ○ [Type custom namespace...]                                            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ⚠️ Warning: Changing context will affect all step executions               │
│                                                                             │
│ [Apply Changes] [Cancel]                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Modal has `role="dialog"` with `aria-labelledby` pointing to title
- Radio button groups have `role="radiogroup"` with proper labels
- Warning has `role="alert"`
- Focus is trapped within modal
- ESC key closes modal

#### 4.2 Context Change Confirmation
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Confirm Context Change                                              [✕] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ You are about to change:                                                    │
│ • Context: production-cluster → staging-cluster                            │
│ • Namespace: default → webapp                                              │
│                                                                             │
│ This will affect:                                                           │
│ • All future step executions                                               │
│ • Kubernetes resource queries                                              │
│ • Current document context                                                  │
│                                                                             │
│ ✓ I understand the implications                                             │
│                                                                             │
│ [Confirm Change] [Cancel]                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Confirmation dialog has appropriate ARIA labels
- Checkbox for understanding has clear label
- Impact list uses proper list semantics

### 5. File Operations Interface

#### 5.1 Save Document Dialog
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 💾 Save Executable Document                                           [✕] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ File Name:                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ webapp-deployment-guide.md                                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Location:                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ /home/user/documents/kubernetes/                                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Format:                                                                     │
│ ◉ Markdown (.md) - Innovation Engine format                                │
│ ○ Bash (.sh) - Shell script export                                         │
│                                                                             │
│ ✓ Include execution results                                                 │
│ ✓ Include context information                                               │
│                                                                             │
│ [Save] [Browse...] [Cancel]                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- File inputs have proper labels and file type restrictions
- Radio buttons for format selection properly grouped
- Checkboxes have clear descriptions
- File browser button has `aria-label="Browse for save location"`

#### 5.2 Load Document Dialog
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📂 Load Executable Document                                           [✕] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Recent Documents:                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ○ webapp-deployment-guide.md (2 hours ago)                             │ │
│ │ ○ database-migration.md (1 day ago)                                    │ │
│ │ ○ monitoring-setup.md (3 days ago)                                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Or ask AI for a file that matches a prompt:                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Describe the type of file you're looking for...                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ⚠️ Note: Loading a document will replace current work                       │
│                                                                             │
│ [Load Selected] [Ask AI] [Cancel]                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Recent documents list has proper radio button semantics
- File browser properly labeled
- Warning clearly announced to screen readers

### 6. Status and Feedback Areas

#### 6.1 Global Status Bar
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Status: Executing Step 2/5... ●●●○○ | Context: prod | NS: webapp | ⚡ Ready │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 6.3 Copilot Integration Feedback
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 Copilot is thinking...                                              [✕] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ●●● Analyzing your request...                                           │ │
│ │ ●●● Generating Kubernetes manifests...                                  │ │
│ │ ●○○ Optimizing for best practices...                                    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Estimated completion: ~15 seconds                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 6.4 Error State with Recovery Options
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ❌ Connection Error                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Unable to connect to Copilot API:                                          │
│ • Network timeout after 30 seconds                                         │
│ • Please check your internet connection                                    │
│                                                                             │
│ You can:                                                                    │
│ • [🔄 Retry Request] - Try connecting again                                 │
│ • [✏️ Edit Manually] - Continue without AI assistance                       │
│ • [💾 Save Draft] - Save current progress                                   │
│                                                                             │
│ [Retry] [Edit Manually] [Save Draft]                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Error states use `role="alert"` for immediate attention
- Recovery options clearly labeled and keyboard accessible
- Loading states announced to screen readers with `aria-live="polite"`

## Detailed Component Specifications

### Component Hierarchy
```
AssistantPlugin
├── Header
│   ├── PluginTitle
│   ├── ContextSelector
│   └── StatusIndicator
├── MainContent
│   ├── OverviewPanel (conditional)
│   │   ├── PromptInput
│   │   ├── GeneratedOverview
│   │   └── ActionButtons
│   └── StepsView
│       ├── StepList
│       │   └── StepItem[]
│       │       ├── StepHeader
│       │       ├── StepContent
│       │       ├── ExecutionResult
│       │       └── StepActions
│       └── GlobalActions
└── Footer
    ├── FileOperations
    └── StatusBar
```

### State Management Schema
```typescript
interface PluginState {
  // Document state
  document: {
    overview: string;
    steps: Step[];
    metadata: DocumentMetadata;
    isDirty: boolean;
  };
  
  // UI state
  ui: {
    activeView: 'overview' | 'steps';
    expandedSteps: number[];
    editingStep: number | null;
    selectedContext: string;
    selectedNamespace: string;
  };
  
  // Execution state
  execution: {
    isExecuting: boolean;
    currentStep: number | null;
    results: ExecutionResult[];
  };
  
  // Copilot integration
  copilot: {
    isLoading: boolean;
    lastRequest: string;
    error: string | null;
  };
}
```

## User Interaction Flows

### Flow 1: Create New Document
1. **Initial State**: User opens plugin → Overview Authoring Panel visible
2. **Prompt Entry**: User enters descriptive prompt → Copilot integration triggers
3. **Review Generated Overview**: User reviews AI-generated content → Can edit or refine
4. **Approval**: User approves overview → System generates executable steps
5. **Steps Display**: Steps View shows collapsible panels → User can proceed to editing

**Keyboard Navigation**: Tab through prompt → Generate button → Edit overview → Approve button

### Flow 2: Edit Existing Step
1. **Step Selection**: User clicks edit icon or presses Enter on focused step
2. **Edit Mode**: Step expands to show editable fields → Form controls become active
3. **Content Modification**: User edits directly or requests Copilot assistance
4. **Save/Cancel**: User saves changes or cancels → Returns to display mode
5. **Validation**: System validates step content → Shows feedback if needed

**Error Handling**: Invalid YAML → Inline validation → Suggestion tooltips

### Flow 3: Execute Steps
1. **Context Verification**: User selects/confirms Kubernetes context and namespace
2. **Step Selection**: User clicks run on individual step or runs all steps
3. **Execution Monitoring**: Real-time progress indication → Output streaming
4. **Results Review**: Success/error feedback → Execution logs display
5. **Next Actions**: User can retry failed steps or proceed to next step

**Accessibility**: Screen reader announcements for status changes → Keyboard shortcuts for execution

### Flow 4: Save/Load Operations
1. **Save Trigger**: User clicks save button → Save dialog opens
2. **File Configuration**: User sets filename, location, format → Validates inputs
3. **Save Execution**: Document saved with metadata → Success notification
4. **Load Process**: User opens load dialog → Selects from recent or browses
5. **Document Restoration**: Content loaded into editor → Previous state restored

**Data Persistence**: Auto-save drafts → Recovery after browser crashes

### Flow 1: Create New Document
1. User opens plugin → Overview Authoring Panel visible
2. User enters prompt → Copilot generates overview
3. User reviews/edits → Approves overview
4. System generates steps → Steps View displays
5. User can edit individual steps → Execute when ready

### Flow 2: Edit Existing Step
1. User clicks edit on step → Step enters edit mode
2. User modifies content or uses Copilot → Reviews changes
3. User saves or cancels → Step returns to display mode

### Flow 3: Execute Steps
1. User selects context/namespace → Confirms if changing
2. User clicks run on step → System validates context
3. Step executes → Results displayed inline
4. User proceeds to next step or addresses errors

### Flow 4: Save/Load Operations
1. User clicks save → Save dialog appears
2. User specifies location/format → Document saved
3. Success notification → User can continue working

## Accessibility Compliance

### Keyboard Navigation
- Tab order: Header → Main content → Footer
- All interactive elements focusable via keyboard
- Custom keyboard shortcuts available (documented)
- Focus indicators clearly visible

### Screen Reader Support
- Semantic HTML structure throughout
- ARIA labels for complex interactions
- Live regions for dynamic content updates
- Alternative text for all meaningful icons

### Visual Accessibility
- High contrast ratios (4.5:1 minimum)
- Focus indicators visible in high contrast mode
- Text scalable up to 200% without horizontal scrolling
- No color-only information conveyance

### Motor Accessibility
- Target sizes minimum 44px touch targets
- Generous spacing between interactive elements
- No time-based interactions required
- Alternative input methods supported

## Technical Implementation Notes

This mockup specification provides the foundation for implementing the Assistant Plugin using:

- **React Components**: Each UI section should be implemented as reusable React components
- **State Management**: Local state with optional persistence for user preferences
- **Accessibility Libraries**: Use headlessui or similar for accessible component primitives
- **Styling**: CSS modules or styled-components with design system tokens
- **Integration**: Headlamp plugin APIs for Kubernetes context and Copilot APIs for AI features

## Testing Requirements

### Accessibility Testing
- Automated testing with axe-core or similar accessibility testing tools
- Manual keyboard navigation testing across all interactive elements
- Screen reader testing with NVDA, JAWS, and VoiceOver
- High contrast mode verification and color blindness simulation
- Focus management testing for modals and dynamic content
- ARIA attributes validation and semantic HTML verification

### Usability Testing
- User task completion rates for core workflows (create, edit, execute, save)
- Error recovery scenarios and user guidance effectiveness
- Mobile/responsive behavior on tablet and smaller screens
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Performance testing with large documents (10+ steps)
- Copilot integration reliability and response handling

### Integration Testing
- Headlamp plugin integration and lifecycle management
- Kubernetes context switching and permission validation
- File operations across different file systems and permissions
- Copilot API integration with various response scenarios
- Error boundary testing and graceful degradation

## Possible Future Enhancements

### Phase 2 Features
- **Dark/Light Theme Toggle**: User preference with system theme detection
- **Customizable Keyboard Shortcuts**: User-defined hotkeys for common actions
- **Plugin Preferences Panel**: Settings for Copilot behavior, auto-save, themes
- **Advanced Context Management**: Multi-cluster support with context switching
- **Template System**: Pre-built templates for common Kubernetes workflows

### Phase 3 Integrations
- **Git Repository Integration**: Version control for executable documents
- **Multi-Document Management**: Project-based organization with document linking
- **Collaboration Features**: Shared documents with real-time editing
- **Advanced AI Features**: Context-aware suggestions, best practice validation
- **Enterprise Features**: SSO integration, audit logging, compliance reporting

### Long-term Vision
- **Community Marketplace**: Shared templates and step libraries
- **Visual Workflow Builder**: Drag-and-drop interface for complex workflows
- **Automated Testing**: Built-in test runner for executable documents
- **Integration Ecosystem**: Plugins for CI/CD, monitoring, and documentation tools

## Implementation Phases

### Phase 1: Core MVP
- Basic UI components and layout
- Overview authoring with Copilot integration
- Step-by-step execution interface
- File operations (save/load)
- Basic accessibility compliance

### Phase 2: Enhanced Features
- Advanced editing capabilities
- Error handling and recovery
- Kubernetes context management
- Comprehensive accessibility testing
- Performance optimization

### Phase 3: Production Ready
- Enterprise features and security
- Comprehensive testing suite
- Documentation and training materials
- Community feedback integration
- Production deployment

---

This specification provides a comprehensive mockup design for the Assistant Plugin UI, ensuring accessibility, usability, and integration with the Headlamp ecosystem while supporting the core workflows of executable document authoring and management.