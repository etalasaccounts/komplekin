# Shadcn Dashboard Template

This template creates a complete dashboard UI with sidebar navigation using Shadcn UI components.

## Prerequisites

Before using this template, make sure you have the required Shadcn UI components installed:

```bash
npx shadcn-ui@latest add sidebar
npx shadcn-ui@latest add breadcrumb
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add collapsible
```

Also, install the required dependencies:

```bash
npm install lucide-react
```

Make sure your project has the necessary Shadcn UI setup.

## Usage

Run the following command to generate the dashboard:

```bash
npx plop dashboard
```

You'll be prompted for:

1. Dashboard name (e.g., 'admin' will create AdminPage)

The template uses default values for other customizable fields:

- Company name: "Acme Inc."
- Company type: "Enterprise"
- User name: "John Doe"
- User email: "john@example.com"

## Generated Files

The template will generate the following files:

### Pages

1. `src/app/<name>/page.tsx` - Main dashboard page

### Components

1. `src/components/<name>/app-sidebar.tsx` - The main sidebar component
2. `src/components/<name>/nav-main.tsx` - Main navigation menu component
3. `src/components/<name>/nav-projects.tsx` - Projects section in the sidebar
4. `src/components/<name>/nav-secondary.tsx` - Secondary navigation menu
5. `src/components/<name>/nav-user.tsx` - User dropdown menu component

## Features

The dashboard includes:

- Responsive sidebar that collapses to icon-only mode on smaller screens
- Breadcrumb navigation
- Collapsible navigation groups
- Projects section with dropdown actions
- User profile dropdown with various options
- Content area with sample layout
- Mobile-friendly design

## Customization

You can customize the dashboard by:

1. Modifying the navigation items in the `data` object in app-sidebar.tsx
2. Changing the layout of the content area in page.tsx
3. Adding or removing menu items in the various nav components
4. Styling using Tailwind CSS classes
5. Updating company and user information directly in the files after generation

The dashboard structure is modular, allowing you to easily add or remove components as needed.
