export default (plop) => {
  plop.setGenerator("dashboard-page", {
    description: "Add a new page to an existing dashboard",
    prompts: [
      {
        type: "input",
        name: "dashboardName",
        message:
          "Existing dashboard name where this page will be added (e.g., 'admin'):",
      },
      {
        type: "input",
        name: "name",
        message: "Page name (e.g., 'users' will create UsersPage):",
      },
    ],
    actions: [
      // Create the page file
      {
        type: "add",
        path: "../frontend/src/app/{{dashCase dashboardName}}/{{dashCase name}}/page.tsx",
        templateFile:
          "../../packages/plop-templates/templates/dashboard-page/page.tsx.hbs",
        skipIfExists: true,
      },
      // Ensure nav-items directory exists
      {
        type: "add",
        path: "../frontend/src/components/{{dashCase dashboardName}}/nav-items/.gitkeep",
        template: "",
        skipIfExists: true,
      },
      // Create a nav item file that can be imported
      {
        type: "add",
        path: "../frontend/src/components/{{dashCase dashboardName}}/nav-items/{{dashCase name}}.tsx",
        template: `import { FileText } from "lucide-react";

// Navigation item for {{pascalCase name}} page
export const {{camelCase name}}NavItem = {
  title: "{{pascalCase name}}",
  url: "/{{dashCase dashboardName}}/{{dashCase name}}",
  icon: FileText,
  items: []
};`,
        skipIfExists: true,
      },
      // Show completion message with manual instructions
      {
        type: "add",
        path: "../frontend/src/components/{{dashCase dashboardName}}/nav-items/INTEGRATION.md",
        template: `
# Manual Integration Instructions for {{pascalCase name}} Page

To complete the integration, manually add the following to your app-sidebar.tsx file:

1. Import the navigation item:
\`\`\`tsx
import { {{camelCase name}}NavItem } from "./nav-items/{{dashCase name}}";
\`\`\`

2. Add it to your navMain array (or another appropriate navigation section):
\`\`\`tsx
navMain: [
  {{camelCase name}}NavItem,
  // ... other navigation items
]
\`\`\`

The page has been created at: /{{dashCase dashboardName}}/{{dashCase name}}
`,
        force: true,
        skipIfExists: false,
      },
    ],
  });
};
