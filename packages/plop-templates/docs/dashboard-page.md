# Dashboard Page Generator

This template adds a new page to an existing dashboard created with the dashboard generator.

## Usage

This generator assumes you've already created a dashboard using the `dashboard` generator. You'll need to provide the name of that dashboard to properly integrate the new page.

Run the following command to add a new page to an existing dashboard:

```bash
npx plop dashboard-page
```

You'll be prompted for:

1. **Dashboard Name**: The name of the existing dashboard where this page will be added
2. **Page Name**: The name of the new page to create

## What This Generator Does

1. Creates a new page file at `src/app/<dashboard-name>/<page-name>/page.tsx` with a basic layout including:

   - Header and description
   - Cards for different content sections
   - Responsive grid layout

2. Creates a navigation item file at `src/components/<dashboard-name>/nav-items/<page-name>.tsx` that:

   - Imports the necessary icon
   - Defines a navigation item object for your new page

3. Creates a README with instructions on how to manually integrate the navigation item into your sidebar

## Manual Integration

After running the generator, you'll need to manually integrate the navigation item:

1. Import the navigation item in your app-sidebar.tsx file:

```tsx
import { yourPageNavItem } from "./nav-items/your-page";
```

2. Add it to your navigation array in app-sidebar.tsx:

```tsx
navMain: [
  yourPageNavItem,
  // ... other navigation items
];
```

## Prerequisites

- An existing dashboard created with the `dashboard` generator
- Shadcn UI components installed, particularly:
  - card
  - heading
  - separator

## Example

If you have a dashboard named "admin" and you create a page named "users", the generator will:

1. Create a file at `src/app/admin/users/page.tsx`
2. Create a file at `src/components/admin/nav-items/users.tsx`
3. Create instructions for importing and using the navigation item

The new page will be accessible at `/admin/users` once you've completed the manual integration steps.

## Why Manual Integration?

We've opted for a semi-automated approach because:

1. It's more reliable than trying to automatically modify complex React code
2. It gives you more control over where to place the navigation item
3. It avoids potential syntax errors from automated code manipulation

## Customization

After generating the page, you can:

1. Customize the layout and components
2. Add functionality specific to your use case
3. Modify the page's appearance in the navigation (like changing the icon or adding sub-items)

This approach keeps your dashboard modular and organized, making it easy to add new sections as your application grows.
