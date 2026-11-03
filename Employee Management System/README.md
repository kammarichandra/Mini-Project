# Employee Management System

A React application built with Vite for employee, attendance, leave, payroll, and team management.

## Project structure

```text
src/
  app/                 Application shell and route definitions
  features/            Route-level pages grouped by business feature
    attendance/
    auth/
    dashboard/
    employees/
    home/
    leave/
    payroll/
    performance/
    recruitment/
    reports/
    settings/
    welcome/
  shared/
    components/        Reusable UI and layout components
    data/              Shared local/sample data
    utils/             Shared business and storage helpers
  assets/              Shared images and static assets
  styles/              Base, shell, workspace, theme, and responsive styles
  main.jsx             Vite application entry point
```

Use the `@/` alias for imports from `src`, for example `@/shared/utils/auth`.

## Development

```sh
npm install
npm run dev
```

Run `npm run lint` and `npm run build` to validate changes.
