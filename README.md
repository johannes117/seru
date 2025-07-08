# Seru - Simple Spreadsheet Editor

A simple and elegant desktop application for basic spreadsheet manipulation, built with Electron, React, and TypeScript.

## Features

- **Address Splitter Tool**: Parse a single address column into multiple components (unit, street, city, state, postcode).
- **Filter Tool**: Filter a spreadsheet by removing rows that match entries in a second "no-contact" list.
- **Record Splitter Tool**: Split a large spreadsheet into multiple smaller files based on a specified row count.
- **Modern UI**: Built with Shadcn UI and Tailwind CSS.
- **Cross-Platform**: Works on Windows, macOS, and Linux.

## Tech Stack

### Core 🏍️

- [Electron 35](https://www.electronjs.org)
- [Vite 6](https://vitejs.dev)
- [SWC](https://swc.rs)

### Development 🛠️

- [TypeScript 5.8](https://www.typescriptlang.org)
- [Prettier](https://prettier.io)
- [ESLint 9](https://eslint.org)
- [Zod](https://zod.dev)
- [React Query (TanStack)](https://react-query.tanstack.com)

### UI 🎨

- [React 19](https://reactjs.org)
- [Tailwind 4](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Geist](https://vercel.com/font) as default font
- [i18next](https://www.i18next.com)
- [TanStack Router](https://tanstack.com/router)
- [Lucide](https://lucide.dev)

### Testing 🧪

- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

### Build & Distribution 📦

- [Electron Forge](https://www.electronforge.io)

## Directory structure

```plaintext
.
└── ./src/
    ├── ./src/assets/
    │   └── ./src/assets/fonts/
    ├── ./src/components/
    │   ├── ./src/components/template/
    │   └── ./src/components/ui/
    ├── ./src/helpers/
    │   └── ./src/helpers/ipc/
    ├── ./src/layouts/
    ├── ./src/localization/
    ├── ./src/pages/
    ├── ./src/routes/
    ├── ./src/styles/
    ├── ./src/tests/
    ├── ./src/types/
    └── ./src/utils/
```

- `src/`: Main source directory
  - `assets/`: Images, fonts, and other static assets
  - `components/`: React components
    - `template/`: Base template components
    - `ui/`: Shadcn UI components
  - `helpers/`: Utility functions and IPC-related code
    - `ipc/`: IPC context and listener functions for theme and window management
  - `layouts/`: Layout components
  - `localization/`: Internationalization setup
  - `pages/`: Application pages/views
  - `routes/`: Routing configuration
  - `styles/`: Global CSS styles
  - `tests/`: Unit and E2E tests
  - `types/`: TypeScript type definitions
  - `utils/`: General utility functions

## NPM Scripts

To run any of these scripts:

```bash
npm run <script>
```

- `start`: Start the app in development mode
- `package`: Package the application into a platform-specific executable bundle
- `make`: Generate platform-specific distributables (e.g. .exe, .dmg, etc)
- `publish`: Publish distributables for updates or distribution
- `lint`: Run ESLint to check code quality
- `format`: Check code formatting with Prettier
- `format:write`: Format code with Prettier
- `test`: Run unit tests (Vitest)
- `test:watch`: Run unit tests in watch mode
- `test:unit`: Run Vitest tests
- `test:e2e`: Run Playwright E2E tests
- `test:all`: Run all tests (unit and E2E)

> E2E tests require the app to be built first. Run `package`, `make`, or `publish` before running E2E tests.

## Getting Started

1. Clone this repository

```bash
git clone <your-repository-url>
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run start
```

## Building for Production

1. Package the application:

```bash
npm run package
```

2. Create distributables:

```bash
npm run make
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
