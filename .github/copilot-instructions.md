## Specifications
When asked to write a specification document you will store it in the `specifications` folder of the appropriate project subfolder.
Specification documents should be written in Markdown format and follow the structure outlined below.
1. **Title**: A clear and concise title for the specification. Each specification will be given a three digit ID number which will be placed at the start of the name, e.g. `001-My Specification`. The number will be incremeneted with each new specification.
2. **Status**: The current status of the specification (Draft, In Review, Final).
3. **Introduction**: A brief overview of the purpose and scope of the specification expressed as a user story.
4. **Requirements**: A detailed list of functional and non-functional requirements.
5. **Design**: High-level design considerations, including architecture, components, and interfaces.
6. **Testing**: Outline of testing strategies, including unit tests, integration tests, and acceptance criteria.
7. **References**: Any relevant documents, standards, or resources that informed the specification.

### Management of Specifications
When instructed to do so you will change the status of the specification document to the specified status. The status will be one of DRAFT, IN REVIEW, or FINAL.
When asked to review a specification document you will read the document and provide feedback on the content, structure, and clarity. You will not make changes to the document unless specifically instructed to do so.
When making any edit to a specification you will always ensure that the status is set to DRAFT. This is to ensure that the document is not considered final until it has been reviewed and approved.
When asked to create a new specification document you will create a new file in the appropriate subfolder of the `specifications` folder, following the naming convention outlined above. You will also ensure that the status is set to DRAFT.
When asked to create a specification document based on an existing issue you will read the issue and extract the relevant information to create a new specification document. The title of the specification will be based on the issue title, and the content will be derived from the issue description and any comments. The status will be set to DRAFT.
When asked to update a specification document you will make the requested changes and update the status of the document to DRAFT if it is not already in that state.
When asked to do so you will change the status to "FINAL" and create a new issue in the original remote repository with the specification document attached. The issue should be titled with the specification title and include the specification content in the body of the issue.
When asked to do so, create an issue in Github for the specification document you will first ensure that the issue is in FINAL status, if not you will aks the user if they want to udpate it.
When an issue is created you will ensure it is linked to the original specification document in the repository.

## Documentation
When asked to write documentation, you will store it in the `docs` folder of the appropriate project subfolder.
Feature documentation should be written in Markdown format and include the following sections:
1. **Overview**: A brief introduction to the feature including brief example use cases.
2. **Usage**: Examples and explanations of how to use the feature.
3. **Configuration**: Details any configuration options the project or feature, including any environment variables or configuration files.
4. **API Reference**: If applicable, a reference for any APIs provided by the feature.
5. **Troubleshooting**: Common issues and their solutions.
When appropriate documentation will be written in the form of an Executable Document

## Code Comments
When writing code comments, you will follow these guidelines:
1. **Clarity**: Comments should be clear and concise, explaining the purpose of the code.
2. **Relevance**: Comments should be relevant to the code they describe, avoiding unnecessary information.
3. **Consistency**: Use a consistent style for comments throughout the codebase.
4. **Documentation**: Use comments to reference relevant documentation or specifications when applicable.

## Code Reviews
When performing code reviews, you will follow these guidelines:
1. **Readability**: Ensure the code is easy to read and understand.
2. **Functionality**: Verify that the code meets the requirements outlined in the specification.
3. **Performance**: Check for any performance issues or inefficiencies.
4. **Security**: Look for potential security vulnerabilities or risks.
5. **Testing**: Ensure that appropriate tests are included and that they cover the functionality adequately.
6. **Style**: Adhere to the project's coding style and conventions.

## Using Git
When running Git commands ensure you are using the origin unless otherwise specified.
Use `git remote` if you are unsure which remote you are using, if still unsure then ask for clarification
