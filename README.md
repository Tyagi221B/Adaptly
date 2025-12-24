This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Testing

This project includes comprehensive automated tests to ensure code quality and reliability.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-reruns when files change)
npm test:watch

# Run tests with coverage report
npm test:coverage
```

### Test Coverage

- **Unit Tests**: Rate limiting, validation schemas, utility functions
- **Component Tests**: Footer, UI components
- **Integration Tests**: Authentication flows, course management

### CI/CD Pipeline

Tests run automatically on every push to `main` via GitHub Actions:
- ✅ Linting checks
- ✅ All test suites
- ✅ Build verification

For detailed testing documentation, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Deployment Status**: Automatic deployment configured with Vercel. Every push to `main` triggers:
1. GitHub Actions CI (tests & build)
2. Vercel deployment (on CI success)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
