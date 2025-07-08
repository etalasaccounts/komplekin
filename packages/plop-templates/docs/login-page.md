# Shadcn Authentication System Template

This template creates a complete authentication system using Shadcn UI components, including:

- Login page
- Signup page
- Forgot password page
- Reset password page

## Prerequisites

Before using this template, make sure you have the required Shadcn UI components installed:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add checkbox
```

Also, install the required dependencies:

```bash
npm install lucide-react
```

Make sure your project has a `lib/utils.ts` file with the `cn` utility function (which is standard in Shadcn setup).

## Usage

Run the following command to generate the authentication system:

```bash
npx plop auth-pages
```

You'll be prompted for:

1. Auth section name (e.g., 'auth' will create AuthPage, SignupAuthPage, etc.)

## Generated Files

The template will generate the following files:

### Pages

1. `src/app/<name>/page.tsx` - Main login page
2. `src/app/<name>/signup/page.tsx` - Signup page
3. `src/app/<name>/forgot-password/page.tsx` - Forgot password page
4. `src/app/<name>/reset-password/page.tsx` - Reset password page

### Components

1. `src/components/<name>/login-form.tsx` - Login form component
2. `src/components/<name>/signup-form.tsx` - Signup form component
3. `src/components/<name>/forgot-password-form.tsx` - Forgot password form component
4. `src/components/<name>/reset-password-form.tsx` - Reset password form component

## Features

The authentication system includes:

### Login Page

- Email and password fields
- "Forgot password" link
- Social login button (GitHub)
- "Sign up" link

### Signup Page

- Name, email, and password fields
- Terms and conditions checkbox
- Social signup button (GitHub)
- "Sign in" link for existing users

### Forgot Password Page

- Email input to request password reset
- "Back to login" link

### Reset Password Page

- New password and confirm password fields
- "Back to login" link

## Customization

You can customize the appearance and behavior of the authentication pages by editing the templates or the generated files.
