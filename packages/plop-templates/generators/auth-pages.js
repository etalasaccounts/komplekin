import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export default (plop) => {
  // Custom action type: shell
  plop.setActionType("shell", function (answers, config, plop) {
    try {
      execSync(config.command, { stdio: "inherit" });
      return config.command + " executed";
    } catch (err) {
      throw err;
    }
  });

  plop.setActionType("appendEnvIfNotExists", (answers, config, plop) => {
    const filePath = plop.renderString(config.path, answers);
    const linesToAdd = plop.renderString(config.lines, answers).split("\n").filter(Boolean);

    let fileContent = "";
    if (fs.existsSync(filePath)) {
      fileContent = fs.readFileSync(filePath, "utf8");
    }

    // Cek dan tambahkan baris yang belum ada
    let newLines = [];
    for (const line of linesToAdd) {
      if (!fileContent.includes(line)) {
        newLines.push(line);
      }
    }

    // Jika ingin baris tertentu di atas, misal SITE_URL
    if (newLines.length) {
      // Pisahkan SITE_URL dan baris lain
      const siteUrlLine = newLines.find(l => l.startsWith("NEXT_PUBLIC_SITE_URL="));
      const otherLines = newLines.filter(l => !l.startsWith("NEXT_PUBLIC_SITE_URL="));
      let newContent = fileContent;

      // Tambahkan SITE_URL di paling atas jika belum ada
      if (siteUrlLine) {
        newContent = siteUrlLine + "\n" + (fileContent.startsWith("\n") ? fileContent : fileContent.replace(/^\n+/, ""));
      }
      // Tambahkan baris lain di bawah
      if (otherLines.length) {
        newContent += (newContent.endsWith("\n") ? "" : "\n") + otherLines.join("\n") + "\n";
      }
      fs.writeFileSync(filePath, newContent);
      return `Appended to ${filePath}: ${newLines.join(", ")}`;
    }
    return `No new lines added to ${filePath}`;
  });

  plop.setActionType("appendGoogleButtonIfNotExists", (answers, config, plop) => {
    const filePath = plop.renderString(config.path, answers);
    const importToAdd = plop.renderString(config.import, answers);
    const separator = `
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <GoogleSignupButton />
    `;

    let fileContent = "";
    if (fs.existsSync(filePath)) {
      fileContent = fs.readFileSync(filePath, "utf8");
    }

    // Tambahkan import jika belum ada
    if (!fileContent.includes(importToAdd)) {
      const lastImportIndex = fileContent.lastIndexOf("import");
      const nextLineIndex = fileContent.indexOf("\n", lastImportIndex);
      fileContent = fileContent.slice(0, nextLineIndex + 1) +
        importToAdd + "\n" +
        fileContent.slice(nextLineIndex + 1);
    }

    // Cari button submit (Create account atau Login)
    const buttonRegex = /<Button[^>]*type=["']submit["'][^>]*>[\s\S]*?<\/Button>/g;
    const match = buttonRegex.exec(fileContent);

    if (match) {
      // Cek apakah separator sudah ada setelah button submit
      const afterButton = fileContent.slice(match.index + match[0].length, match.index + match[0].length + 300);
      if (!afterButton.includes("Or continue with") && !afterButton.includes("<GoogleSignupButton")) {
        // Sisipkan separator + GoogleSignupButton setelah button submit
        const newContent = fileContent.slice(0, match.index + match[0].length) +
          separator +
          fileContent.slice(match.index + match[0].length);
        fs.writeFileSync(filePath, newContent);
        return `Added separator and GoogleSignupButton after submit button in ${filePath}`;
      }
      return `Separator or GoogleSignupButton already exists after submit button in ${filePath}`;
    }
    return `No submit button found in ${filePath}`;
  });

  plop.setGenerator("auth-pages", {
    description: "Create a complete authentication system with Shadcn UI",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Auth section name (e.g., 'auth' will create AuthPage):",
      },
      {
        type: "confirm",
        name: "withSupabase",
        message: "Would you like to connect or integrate it with Supabase for implementing the auth pages?",
      },
      {
        type: "input",
        name: "API_URL",
        message: "Enter your API URL:",
        when: (answers) => answers.withSupabase,
      },
      {
        type: "input",
        name: "API_KEY",
        message: "Enter your API KEY:",
        when: (answers) => answers.withSupabase,
      },
      {
        type: "confirm",
        name: "withGoogle",
        message: "Would you like to connect signup button with Google?",
        when: (answers) => answers.withSupabase,
      }
    ],
    actions: function (data) {
      // Actions yang selalu dijalankan (UI, dsb)
      const baseActions = [
        // Install shadcn-ui components & lucide-react
        { type: "shell", command: "npx shadcn@latest add button" },
        { type: "shell", command: "npx shadcn@latest add input" },
        { type: "shell", command: "npx shadcn@latest add label" },
        { type: "shell", command: "npx shadcn@latest add checkbox" },
        { type: "shell", command: "npm install lucide-react" }
      ];
      const uiActions = [
        // Create the main login page
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/page.tsx",
          templateFile:
            "../../packages/plop-templates/templates/login-page.tsx.hbs",
          data: {
            companyName: "Acme Inc.",
          },
          skipIfExists: true,
        },
        // Create the login form
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/login-form.tsx",
          templateFile:
            "../../packages/plop-templates/templates/login-form.tsx.hbs",
          data: {
            loginTitle: "Login to your account",
            loginDescription: "Enter your email below to login to your account",
          },
          skipIfExists: true,
        },
        // Create the forgot password page
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/forgot-password/page.tsx",
          templateFile:
            "../../packages/plop-templates/templates/forgot-password.tsx.hbs",
          data: {
            companyName: "Acme Inc.",
          },
          skipIfExists: true,
        },
        // Create the forgot password form
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/forgot-password-form.tsx",
          templateFile:
            "../../packages/plop-templates/templates/forgot-password-form.tsx.hbs",
          skipIfExists: true,
        },
        // Create the signup page
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/signup/page.tsx",
          templateFile: "../../packages/plop-templates/templates/signup.tsx.hbs",
          data: {
            companyName: "Acme Inc.",
          },
          skipIfExists: true,
        },
        // Create the signup form
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/signup-form.tsx",
          templateFile:
            "../../packages/plop-templates/templates/signup-form.tsx.hbs",
          skipIfExists: true,
        },
        // Create the reset password page
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/reset-password/page.tsx",
          templateFile:
            "../../packages/plop-templates/templates/reset-password.tsx.hbs",
          data: {
            companyName: "Acme Inc.",
          },
          skipIfExists: true,
        },
        // Create the reset password form
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/reset-password-form.tsx",
          templateFile:
            "../../packages/plop-templates/templates/reset-password-form.tsx.hbs",
          skipIfExists: true,
        },
      ];
      const uiActionsWithSupabase = [
        // create env.local 
        {
          type: "appendEnvIfNotExists",
          path: "../frontend/.env.local",
          lines: `
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL={{API_URL}}
NEXT_PUBLIC_SUPABASE_ANON_KEY={{API_KEY}}
          `,
        },
        // create confirm 
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/confirm/route.ts",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/confirm.ts.hbs",
          skipIfExists: true,
        },
        // create action
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/actions.ts",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/actions.ts.hbs",
          skipIfExists: true,
        },
        //create page login
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/page.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/login-page.tsx.hbs",
          skipIfExists: true,
        },
        //create component login form
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/login-form.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/login-form.tsx.hbs",
          skipIfExists: true,
        },
        //create page signup
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/signup/page.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/signup.tsx.hbs",
          skipIfExists: true,
        },
        //create component signup form
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/signup-form.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/signup-form.tsx.hbs",
          skipIfExists: true,
        },
        //create page forgot password
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/forgot-password/page.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/forgot-password.tsx.hbs",
          skipIfExists: true,
        },
        //create component forgot password form
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/forgot-password-form.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/forgot-password-form.tsx.hbs",
          skipIfExists: true,
        },
        //create page reset password
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/reset-password/page.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/reset-password.tsx.hbs",
          skipIfExists: true,
        },
        //create component reset password form
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/reset-password-form.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/reset-password-form.tsx.hbs",
          skipIfExists: true,
        },
        //create page verify
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/verify/page.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/verify.tsx.hbs",
          skipIfExists: true,
        },
        // create page private
        {
          type: "add",
          path: "../frontend/src/app/private/page.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/private.tsx.hbs",
          skipIfExists: true,
        },
        // create page error (jangan overwrite)
        {
          type: "add",
          path: "../frontend/src/app/error/page.tsx",
          templateFile: "../../packages/plop-templates/templates/error.tsx.hbs",
          skipIfExists: true,
        },
        // middleware client
        {
          type: "add",
          path: "../frontend/src/middleware.ts",
          templateFile: "../../packages/plop-templates/templates/auth/middleware.ts.hbs",
          skipIfExists: true,
        },
        // create middleware server
        {
          type: "add",
          path: "../frontend/src/utils/supabase/middleware.ts",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/middleware.ts.hbs",
          skipIfExists: true,
        },
        // create supabase client (jangan overwrite)
        {
          type: "add",
          path: "../frontend/src/utils/supabase/client.ts",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/client.ts.hbs",
          skipIfExists: true,
        },
        // create supabase server client (jangan overwrite)
        {
          type: "add",
          path: "../frontend/src/utils/supabase/server.ts",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/server.ts.hbs",
          skipIfExists: true,
        },
      ];
      // Actions khusus jika pakai Supabase
      const supabaseActions = [
        // install react-icons
        {
          type: "shell",
          command: "npm install @react-icons/all-files --save",
        },
        // install supabase server
        {
          type: "shell",
          command: "npm install @supabase/ssr",
        },
        // install supabase client
        {
          type: "shell",
          command: "npm install @supabase/supabase-js",
        },
      ];

      const googleActions = [
        // install react-icons
        {
          type: "shell",
          command: "npm install @react-icons/all-files --save",
        },
        {
          type: "shell",
          command: "npm install react-icons",
        },
        // Create google signup button
        {
          type: "add",
          path: "../frontend/src/components/{{dashCase name}}/googleSignupButton.tsx",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/googleSingupButton.tsx.hbs",
          skipIfExists: true,
        },
        // Create google callback
        {
          type: "add",
          path: "../frontend/src/app/{{dashCase name}}/callback/route.ts",
          templateFile: "../../packages/plop-templates/templates/auth/supabase/callback.ts.hbs",
          skipIfExists: true,
        },
        // Append GoogleSignupButton to login-form if not exists
        {
          type: "appendGoogleButtonIfNotExists",
          path: "../frontend/src/components/{{dashCase name}}/login-form.tsx",
          import: "import { GoogleSignupButton } from '@/components/{{dashCase name}}/googleSignupButton'",
          component: "<GoogleSignupButton />",
        },
        // Append GoogleSignupButton to signup-form if not exists
        {
          type: "appendGoogleButtonIfNotExists",
          path: "../frontend/src/components/{{dashCase name}}/signup-form.tsx",
          import: "import { GoogleSignupButton } from '@/components/{{dashCase name}}/googleSignupButton'",
          component: "<GoogleSignupButton />",
        },
      ];

      // Gabungkan actions sesuai pilihan user
      return data.withSupabase
        ? [
            ...baseActions,
            ...supabaseActions,
            ...uiActionsWithSupabase,
            ...(data.withGoogle ? googleActions : [])
          ]
        : [...baseActions, ...uiActions];
    },
  });
};
