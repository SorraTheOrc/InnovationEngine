package commands

import (
	"fmt"
	"os"

	"github.com/Azure/InnovationEngine/internal/engine"
	"github.com/Azure/InnovationEngine/internal/logging"
	"github.com/spf13/cobra"
)

// Register the assistant command with our command runner.
func init() {
	rootCommand.AddCommand(assistantCommand)

	// String flags
	assistantCommand.PersistentFlags().
		String("working-directory", ".", "Sets the working directory for innovation engine to operate out of. Restores the current working directory when finished.")
}

var assistantCommand = &cobra.Command{
	Use:   "assistant",
	Short: "Launch the Innovation Engine assistant for generating executable documents.",
	Long: `The assistant command provides an interactive interface for generating 
executable documents with the help of AI guidance. Users can enter natural
language queries to receive step-by-step instructions for Kubernetes tasks.`,
	Run: func(cmd *cobra.Command, args []string) {
		environment, _ := cmd.Flags().GetString("environment")
		workingDirectory, _ := cmd.Flags().GetString("working-directory")

		innovationEngine, err := engine.NewEngine(engine.EngineConfiguration{
			Environment:      environment,
			WorkingDirectory: workingDirectory,
		})
		if err != nil {
			logging.GlobalLogger.Errorf("Error creating engine: %s", err)
			fmt.Printf("Error creating engine: %s", err)
			os.Exit(1)
		}

		// Launch the assistant
		err = innovationEngine.LaunchAssistant()
		if err != nil {
			logging.GlobalLogger.Errorf("Error launching assistant: %s", err)
			fmt.Printf("Error launching assistant: %s", err)
			os.Exit(1)
		}
	},
}