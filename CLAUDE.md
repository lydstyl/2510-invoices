# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal invoice archiving system for a French SCI (Société Civile Immobilière). Uses Clean Architecture principles with Next.js 15, TypeScript, Prisma (SQLite), and Vitest for TDD.

**Language**: Application UI is in French (e.g., "factures" = invoices, "connexion" = login, "fournisseur" = supplier).

## Essential Commands

### Development
```bash
npm run dev              # Start development server (http://localhost:3000)
npm test                 # Run tests in watch mode (Vitest)
npm test:ui              # Open Vitest UI for interactive testing
npm run build            # Build for production
npm start                # Run production build
npm run lint             # Run ESLint
```

### Database (Prisma)
```bash
npm run setup            # Complete setup: generate client + migrate + seed
npm run prisma:generate  # Generate Prisma client (run after schema changes)
npm run prisma:migrate   # Create and apply new migration
npm run prisma:seed      # Seed database with default user and categories
npm run prisma:studio    # Open Prisma Studio (visual DB editor)
```

### First-Time Setup
```bash
npm install
cp .env.example .env     # Then edit .env to set USER_PASSWORD
npm run setup
npm run dev
```

## Architecture

This project follows **Clean Architecture** with strict separation of concerns and dependency inversion.

### Layer Structure

```
src/
├── domain/              # Pure business entities and interfaces (no dependencies)
│   ├── entities/        # TypeScript types/interfaces (User, Invoice, Supplier, Category)
│   └── interfaces/      # Repository contracts (dependency inversion principle)
├── usecases/            # Business logic (depends only on domain layer, fully testable)
├── infrastructure/      # Technical implementations (implements domain interfaces)
│   ├── database/        # Prisma repository implementations
│   └── auth/            # Session-based authentication
└── ui/                  # React components (presentation layer)
```

### Key Architectural Principles

1. **Dependency Rule**: All dependencies point inward (infrastructure → usecases → domain)
2. **Domain Independence**: Domain layer has ZERO external dependencies
3. **Use Cases First**: Business logic lives in use cases, tested with TDD
4. **Repository Pattern**: Database access abstracted behind interfaces

### Critical Implementation Details

**Use Cases are TDD-first**:
- All use cases in `src/usecases/` have corresponding test files in `tests/usecases/`
- Tests must pass before implementation is considered complete
- Example: `GenerateInvoiceFilename` has 6 tests covering edge cases

**Repository Pattern**:
- Domain interfaces (`src/domain/interfaces/I*Repository.ts`) define contracts
- Prisma implementations (`src/infrastructure/database/*Repository.ts`) fulfill contracts
- This allows swapping data sources without changing business logic

**Invoice Filename Format**:
Critical business rule implemented in `GenerateInvoiceFilename` use case:
```
AAMMJJ.FOURNISSEUR.N°FACTURE_description.montantE00
Example: 250929.DOM'ELEC.F.202509145_interphone.90E00
```
- Date is YYMMDD format
- Amount uses 'E' instead of decimal point/comma
- Preserves special characters (apostrophes, accents)

## Database Schema (Prisma)

**Models**: User, Supplier, Category, Invoice

**Key Relationships**:
- Invoice → Supplier (required, many-to-one)
- Invoice → Category (optional, many-to-one)
- Unique constraint: `[supplierId, invoiceNumber]` prevents duplicate invoices

**Payment Status Enum**: `NOT_PAID`, `PARTIALLY_PAID`, `PAID`

**Important Fields**:
- `Invoice.filePath`: Stores PDF location in `public/uploads/invoices/`
- `Invoice.partialPaymentAmount` and `partialPaymentDate`: Only used when status is `PARTIALLY_PAID`

After schema changes, always run `npm run prisma:generate` before continuing.

## Testing Strategy

**Framework**: Vitest with happy-dom

**Test Coverage**: 10/10 tests passing
- `GenerateInvoiceFilename`: 6 tests (format validation, edge cases)
- `CreateInvoice`: 4 tests (validation logic)

**Writing Tests**:
1. Create test file in `tests/usecases/` matching use case name
2. Mock repository interfaces (don't use real database)
3. Test business logic in isolation
4. Run `npm test:ui` for interactive debugging

**Path Alias**: Use `@/` for imports (e.g., `import { Invoice } from '@/domain/entities/Invoice'`)

## Next.js App Router Structure

```
app/
├── page.tsx                    # Home (redirects based on auth)
├── connexion/page.tsx          # Login page
├── factures/page.tsx           # Invoice list (server component)
├── factures/nouvelle/page.tsx  # Create invoice (client component)
└── api/
    ├── auth/login/route.ts     # POST login
    ├── auth/logout/route.ts    # POST logout
    └── invoices/route.ts       # GET (list) and POST (create)
```

**Server vs Client Components**:
- Use server components by default for data fetching
- Use `'use client'` only when needed (forms, interactivity, useState)
- Auth checks use session cookies (see `src/infrastructure/auth/session.ts`)

## Authentication

**Type**: Cookie-based sessions (not JWT)
- Single user application (email/password from `.env`)
- Password hashed with bcryptjs (10 rounds)
- Session token stored in HTTP-only cookie
- Helper: `getSession()` from `src/infrastructure/auth/session.ts`

**Protected Routes**: Check session and redirect to `/connexion` if not authenticated

## File Uploads

**Location**: `public/uploads/invoices/`
**Validation**: PDF files only
**Access**: Files served statically via Next.js

Ensure directory exists before first upload:
```bash
mkdir -p public/uploads/invoices
```

## Common Tasks

### Adding a New Use Case
1. Define entity/interface in `src/domain/` if needed
2. Create test file in `tests/usecases/NewUseCase.test.ts`
3. Write failing tests (TDD)
4. Implement use case in `src/usecases/NewUseCase.ts`
5. Make tests pass
6. Use in API routes or server actions

### Adding a New Database Field
1. Modify `prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create migration
3. Update domain entities in `src/domain/entities/`
4. Update repository if needed
5. Run tests to ensure nothing breaks

### Adding a New API Route
1. Create `app/api/[route]/route.ts`
2. Import necessary use cases and repositories
3. Check authentication if needed
4. Return Next.js Response objects

## Known Limitations

- **Single user only** (USER_EMAIL and USER_PASSWORD in .env)
- **No edit/delete** for invoices (creation only)
- **No pagination** (all invoices loaded at once)
- **No search/filters** in UI yet
- **Basic session auth** (not production-grade for multi-user)

## Future Extensions

The architecture is designed for:
- **MCP Server**: Database access via LLM (add to `src/infrastructure/mcp/`)
- **LLM PDF Extraction**: Automatic invoice data extraction (new use case)
- **Multi-user**: Add roles to User model and auth middleware
- **Search**: Add search use case and full-text indexes

## Environment Variables

Required in `.env`:
```
DATABASE_URL="file:./dev.db"
USER_EMAIL="lydstyl@gmail.com"
USER_PASSWORD="your-secure-password"
NEXTAUTH_SECRET="generate-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Generate secret: `openssl rand -base64 32`
