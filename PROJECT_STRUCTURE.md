# Project Structure

## Overview

This project follows Clean Architecture principles with clear separation of concerns.

```
2510-invoices/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts      # Login endpoint
│   │   │   └── logout/
│   │   │       └── route.ts      # Logout endpoint
│   │   └── invoices/
│   │       └── route.ts          # Invoice CRUD endpoints
│   ├── connexion/
│   │   └── page.tsx              # Login page (French: "Connexion")
│   ├── factures/                 # Invoices pages (French: "Factures")
│   │   ├── nouvelle/
│   │   │   └── page.tsx          # New invoice page
│   │   └── page.tsx              # Invoice list page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects)
│   └── globals.css               # Global styles
│
├── src/                          # Source code (Clean Architecture)
│   ├── domain/                   # Domain Layer (Business Entities)
│   │   ├── entities/
│   │   │   ├── Category.ts       # Category entity
│   │   │   ├── Invoice.ts        # Invoice entity with DTOs
│   │   │   ├── Supplier.ts       # Supplier entity
│   │   │   └── User.ts           # User entity
│   │   └── interfaces/           # Repository Interfaces
│   │       ├── ICategoryRepository.ts
│   │       ├── IInvoiceRepository.ts
│   │       ├── ISupplierRepository.ts
│   │       └── IUserRepository.ts
│   │
│   ├── usecases/                 # Application Business Logic (TDD)
│   │   ├── CreateInvoice.ts      # Create invoice use case
│   │   └── GenerateInvoiceFilename.ts  # Generate filename use case
│   │
│   ├── infrastructure/           # Infrastructure Layer
│   │   ├── database/             # Database implementations
│   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   ├── CategoryRepository.ts
│   │   │   ├── InvoiceRepository.ts
│   │   │   ├── SupplierRepository.ts
│   │   │   └── UserRepository.ts
│   │   └── auth/                 # Authentication
│   │       ├── auth.ts           # Auth service
│   │       └── session.ts        # Session management
│   │
│   └── ui/                       # Presentation Layer
│       └── components/           # React components
│           ├── Header.tsx        # App header with logout
│           ├── InvoiceForm.tsx   # Invoice creation form
│           ├── InvoiceList.tsx   # Invoice table
│           └── PDFPreview.tsx    # PDF viewer component
│
├── tests/                        # Tests (Vitest + TDD)
│   └── usecases/
│       ├── CreateInvoice.test.ts
│       └── GenerateInvoiceFilename.test.ts
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Database seeding
│   └── *.db                      # SQLite database (gitignored)
│
├── public/                       # Static files
│   └── uploads/
│       └── invoices/             # Uploaded invoice PDFs
│
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── vitest.config.ts              # Vitest configuration
├── README.md                     # Full documentation
├── QUICK_START.md                # Quick setup guide
└── PROJECT_STRUCTURE.md          # This file
```

## Key Files

### Domain Layer
- **Entities**: Pure TypeScript interfaces/types, no external dependencies
- **Interfaces**: Repository contracts (dependency inversion)

### Use Cases (Business Logic)
- **CreateInvoice**: Validates and creates invoices
- **GenerateInvoiceFilename**: Generates standardized filename format
- All use cases are tested with Vitest (TDD approach)

### Infrastructure
- **Repositories**: Prisma implementations of domain interfaces
- **Auth**: Simple session-based authentication

### UI Components
- All components use Tailwind CSS
- French language interface
- Client components where needed (forms, interactivity)
- Server components for data fetching

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Prisma, SQLite |
| **Authentication** | bcryptjs, Cookie-based sessions |
| **Testing** | Vitest, @testing-library/react |

## Clean Architecture Principles

1. **Dependency Rule**: Dependencies point inward
   - Domain has no dependencies
   - Use cases depend only on domain
   - Infrastructure implements domain interfaces
   - UI depends on use cases and infrastructure

2. **Separation of Concerns**
   - Business logic isolated in use cases
   - Database details hidden behind repositories
   - UI is just a delivery mechanism

3. **Testability**
   - Domain and use cases fully unit testable
   - No framework dependencies in core logic
   - Mock repositories for testing

## File Count

- **Domain Entities**: 4 files
- **Domain Interfaces**: 4 files
- **Use Cases**: 2 files (+ 2 test files)
- **Infrastructure**: 7 files
- **UI Components**: 4 files
- **App Routes**: 8 files

**Total**: ~35 TypeScript files (excluding config)

## Future Extensibility

The architecture is designed to easily add:

1. **MCP Server**: Add in `src/infrastructure/mcp/`
2. **LLM Integration**: Add use cases in `src/usecases/`
3. **New Features**: Add entities, use cases, and repositories
4. **New UI**: Add pages in `app/` and components in `src/ui/`

Each layer can be extended independently without affecting others.
