export default (plop) => {
  plop.setGenerator("dashboard", {
    description: "Create a dashboard layout with sidebar navigation",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Dashboard name (e.g., 'admin' will create AdminPage):",
      },
      {
        type: "confirm",
        name: "addNewPage",
        message: "Do you want to add a new page?",
        default: false,
      },
      {
        type: "input",
        name: "pageName",
        message: "What is the name of your new page?",
        when: (answers) => answers.addNewPage,
      },
      {
        type: "input",
        name: "menuLabel",
        message: "What label do you want to show in the sidebar menu?",
        when: (answers) => answers.addNewPage,
      },
      {
        type: "input",
        name: "iconName",
        message:
          "What Lucide React icon name do you want to use? (e.g., Home, Settings, Users)",
        when: (answers) => answers.addNewPage,
      },
    ],
    actions: (data) => {
      const actions = [
        {
          type: "add",
          path: "../../packages/plop-templates/dashboard-README.md",
          template: `# Shadcn Dashboard Template

This template requires the following Shadcn components:
... (same as before)
`,
          skipIfExists: true,
        },
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/page.tsx",
          templateFile:
            "../../packages/plop-templates/templates/dashboard/page.tsx.hbs",
          data: {
            companyName: "Etalas",
          },
          skipIfExists: true,
        },
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/app-sidebar.tsx",
          templateFile:
            "../../packages/plop-templates/templates/dashboard/app-sidebar.tsx.hbs",
          data: {
            companyName: "Etalas",
            companyType: "Enterprise",
            userName: "John Doe",
            userEmail: "john@example.com",
          },
          skipIfExists: true,
        },
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/nav-main.tsx",
          templateFile:
            "../../packages/plop-templates/templates/dashboard/nav-main.tsx.hbs",
          skipIfExists: true,
        },
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/nav-projects.tsx",
          templateFile:
            "../../packages/plop-templates/templates/dashboard/nav-projects.tsx.hbs",
          skipIfExists: true,
        },
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/nav-secondary.tsx",
          templateFile:
            "../../packages/plop-templates/templates/dashboard/nav-secondary.tsx.hbs",
          skipIfExists: true,
        },
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/nav-user.tsx",
          templateFile:
            "../../packages/plop-templates/templates/dashboard/nav-user.tsx.hbs",
          skipIfExists: true,
        },
      ];

      // Tambahkan page baru jika user ingin
      if (data.addNewPage) {
        actions.push({
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/{{dashCase pageName}}/page.tsx",
          templateFile:
            "../../packages/plop-templates/templates/dashboard/page.tsx.hbs",
          data: {
            companyName: "Etalas",
            label: data.pageName,
          },
          skipIfExists: true,
        });

        // Tambahkan icon import di app-sidebar.tsx
        actions.push({
          type: "modify",
          path: "../frontend/src/components/{{dashCase name}}/app-sidebar.tsx",
          pattern: /(import \{[^}]*)(\} from "lucide-react";)/,
          template: `$1{{iconName}}, $2`,
        });

        // Sisipkan menu item baru ke navMain
        actions.push({
          type: "modify",
          path: "../frontend/src/components/{{dashCase name}}/app-sidebar.tsx",
          pattern: /navMain: \[/,
          template: `navMain: [
    {
      title: "{{menuLabel}}",
      url: "/{{dashCase name}}/{{dashCase pageName}}",
      icon: {{iconName}},
      items: [],
    },`,
        });
      }

      return actions;
    },
  });
};
