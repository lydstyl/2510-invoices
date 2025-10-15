# Features & Implementation Details

## Completed Features ✅

### 1. Authentication System
- **Single user authentication** with email/password
- Password hashed with bcryptjs (10 rounds)
- Session-based authentication using cookies
- Protected routes (redirects to login if not authenticated)
- Logout functionality

**Implementation:**
- `src/infrastructure/auth/auth.ts` - AuthService
- `src/infrastructure/auth/session.ts` - Session management
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/logout/route.ts` - Logout endpoint
- `app/connexion/page.tsx` - Login page (French UI)

### 2. Invoice Management

#### Create Invoice
- Upload PDF file
- Manual metadata entry via form
- Real-time filename generation
- Supplier management (select existing or create new)
- Category selection (optional)
- Payment status tracking

**Fields:**
- Date
- Supplier (dropdown or new)
- Invoice number
- Description
- Amount (with decimals)
- Payment status (not paid, partially paid, paid)
- Partial payment details (conditional fields)
- Category (optional)

#### List Invoices
- Table view with all invoices
- Sorted by date (descending)
- Shows: date, supplier, number, description, amount, status
- Direct PDF viewing
- Color-coded payment status badges

### 3. PDF Handling
- **Upload**: File input with PDF validation
- **Storage**: Saved to `public/uploads/invoices/`
- **Preview**: Real-time preview while filling form (left side)
- **Access**: Direct links from invoice list

**Component:** `src/ui/components/PDFPreview.tsx`

### 4. Filename Generation
**Format:** `AAMMJJ.SUPPLIER.INVOICE_NUMBER_description.amountE00`

**Example:** `250929.DOM'ELEC.F.202509145_interphone.90E00`

**Features:**
- Real-time generation as form is filled
- Copy to clipboard button
- Preserves special characters (apostrophes, accents)
- Amount formatted with 'E' instead of decimal point

**Implementation:**
- `src/usecases/GenerateInvoiceFilename.ts` (TDD)
- `tests/usecases/GenerateInvoiceFilename.test.ts` (6 tests)

### 5. Database Management

#### Schema (Prisma + SQLite)
**Models:**
1. **User**
   - id, email (unique), password (hashed), timestamps

2. **Supplier**
   - id, name (unique), timestamps
   - Relations: invoices[]

3. **Category**
   - id, name (unique), timestamps
   - Relations: invoices[]

4. **Invoice**
   - id, date, invoiceNumber, description, amount
   - supplierId (required)
   - categoryId (optional)
   - paymentStatus (enum: NOT_PAID, PARTIALLY_PAID, PAID)
   - partialPaymentAmount, partialPaymentDate (optional)
   - filePath (PDF location)
   - timestamps
   - Unique constraint: [supplierId, invoiceNumber]

#### Seed Data
- Default user (from .env)
- 6 default categories (Comptabilité, Réparation, etc.)

### 6. Testing (TDD)

**Test Framework:** Vitest with happy-dom

**Tested Use Cases:**
1. **GenerateInvoiceFilename** (6 tests)
   - Correct format generation
   - Date formatting (YYMMDD)
   - Amount formatting (E instead of comma)
   - Special character preservation
   - Decimal handling

2. **CreateInvoice** (4 tests)
   - Valid invoice creation
   - Supplier validation
   - Amount validation (positive)
   - Partial payment validation

**Commands:**
```bash
npm test           # Watch mode
npm test:ui        # UI interface
npm test -- --run  # Single run
```

**Results:** ✅ 10/10 tests passing

### 7. UI/UX (French Interface)

**Pages:**
1. **/** - Home (redirects to /factures or /connexion)
2. **/connexion** - Login page
3. **/factures** - Invoice list
4. **/factures/nouvelle** - Create new invoice

**Design:**
- Minimalist Tailwind CSS
- Responsive layout
- Two-column layout for invoice creation (PDF left, form right)
- Clean table for invoice list
- Color-coded status badges (red/yellow/green)
- Modern dashboard aesthetic

**Components:**
- `Header` - App header with logout
- `InvoiceList` - Sortable invoice table
- `InvoiceForm` - Create invoice form with validation
- `PDFPreview` - Embedded PDF viewer

## Architecture Decisions

### Clean Architecture Benefits

1. **Testability**
   - Use cases tested without framework dependencies
   - Repository pattern enables easy mocking
   - Domain logic isolated and pure

2. **Maintainability**
   - Clear separation of concerns
   - Each layer has single responsibility
   - Easy to locate and modify code

3. **Extensibility**
   - New features add new use cases
   - UI can be replaced without changing logic
   - Database can be swapped (Prisma makes this easy)

4. **Framework Independence**
   - Core business logic doesn't depend on Next.js
   - Could migrate to different framework
   - Domain entities are pure TypeScript

### Technical Choices

**Why Next.js 15?**
- Latest features (Server Components, Server Actions)
- App Router for modern routing
- Built-in API routes
- TypeScript first-class support

**Why SQLite?**
- Zero configuration
- Single file database
- Perfect for internal tools
- Easy to backup
- Can migrate to PostgreSQL if needed (Prisma makes this easy)

**Why Prisma?**
- Type-safe database access
- Excellent TypeScript support
- Migration system
- Prisma Studio for visual DB management
- Easy to switch databases

**Why Vitest?**
- Fast (uses Vite)
- Compatible with Vite/Next.js
- Great TypeScript support
- Better DX than Jest
- UI mode for debugging

**Why Cookie Sessions (not JWT)?**
- Simpler for internal app
- Single user scenario
- Easier to invalidate
- No token refresh complexity
- Can upgrade to NextAuth.js later if needed

## Security Considerations

**Current Implementation:**
- Passwords hashed with bcryptjs
- HTTP-only cookies
- CSRF protection via Next.js
- No SQL injection (Prisma ORM)
- File upload validation (PDF only)

**Production Recommendations:**
- Use HTTPS
- Set secure cookie flags
- Generate random NEXTAUTH_SECRET
- Implement rate limiting
- Add file size limits
- Scan uploaded PDFs
- Regular backups

## Performance

**Current State:**
- Server-side rendering where possible
- Minimal client-side JavaScript
- Optimized Prisma queries (includes relations)
- Static file serving for PDFs
- No external API calls

**Potential Optimizations:**
- Add pagination for invoice list
- Implement virtual scrolling for large lists
- Cache supplier/category lists
- Optimize PDF preview (lazy loading)
- Add search indexes

## Known Limitations

1. **Single User**: Only one user supported currently
2. **No Edit**: Can't edit invoices after creation (coming soon)
3. **No Delete**: Can't delete invoices (coming soon)
4. **No Search**: No full-text search (coming soon)
5. **No Filters**: Can't filter invoice list (coming soon)
6. **No Pagination**: All invoices loaded at once
7. **Basic Auth**: Simple session, not production-grade

## Future Roadmap

### Phase 1: Essential Features
- [ ] Edit invoice functionality
- [ ] Delete invoice with confirmation
- [ ] Search and filters
- [ ] Pagination
- [ ] Better error handling

### Phase 2: Enhancement
- [ ] Multi-user support with roles
- [ ] Invoice duplication
- [ ] Export to CSV/Excel
- [ ] Bulk operations
- [ ] Statistics dashboard

### Phase 3: Advanced (LLM Integration)
- [ ] MCP server for database access
- [ ] Automatic PDF data extraction via LLM
- [ ] Smart categorization
- [ ] Receipt vs Invoice classification
- [ ] Duplicate detection

### Phase 4: Production Ready
- [ ] Email notifications
- [ ] Audit logs
- [ ] Backup/restore
- [ ] Docker deployment
- [ ] Health checks
