# Senior Fullstack Engineer Take-Home Challenge

## Bookmarks with Share Controls

**Time Estimate:** 2-3 hours

Build a bookmark management application where users can organize bookmarks into collections and share those collections with configurable access controls.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client from ZenStack schema
npm run db:generate

# Create the database and seed test users
npm run db:push
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in as one of the test users.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run db:generate` | Generate Prisma client from ZenStack schema |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed database with test users |
| `npm run db:reset` | Reset database and re-seed |
| `npm run test` | Run tests with Vitest |

---

## Business Requirements

### 1. Collections Management

- Create, edit, and delete bookmark collections
- Each collection has a name, description, and share settings

### 2. Bookmarks Management

- Add bookmarks to collections (title, URL, description, optional tags)
- Edit and delete bookmarks within a collection
- Bookmarks belong to exactly one collection

### 3. Share Controls (three modes)

| Mode | Description |
|------|-------------|
| `PRIVATE` | Only the owner can view |
| `LINK_ACCESS` | Anyone with the URL can view (read-only) |
| `PASSWORD_PROTECTED` | Requires a password to view |

### 4. Public View

- Shareable URL for non-private collections (`/share/[slug]`)
- Password gate for protected collections
- Read-only view of collection and its bookmarks

---

## Technical Requirements

### 1. ZenStack Schema (`src/db/schema.zmodel`)

Extend the provided schema with `Collection` and `Bookmark` models:

```
Collection:
- id, name, description, slug (unique)
- shareMode (enum), sharePassword (hashed, @omit)
- owner relation to User
- bookmarks relation
- timestamps

Bookmark:
- id, title, url, description
- tags (see note below)
- collection relation
- timestamps

Access Policies:
- Use @@allow rules to enforce access control
- Collections: owner can CRUD, others can read if not PRIVATE
- Bookmarks: inherit access from parent collection
```

**Note on Tags:** SQLite doesn't support arrays. Options:
- Store as JSON string and parse in code
- Create a separate `Tag` model with many-to-many relation
- Skip tags (they're optional)

### 2. Server Actions

Implement the functions in `src/lib/actions/`:

**Collections (`src/lib/actions/collections.ts`):**
- `createCollection(data)` - Create a new collection
- `updateCollection(id, data)` - Update collection (including share settings)
- `deleteCollection(id)` - Delete collection and its bookmarks
- `verifySharePassword(slug, password)` - Verify password for protected collections

**Bookmarks (`src/lib/actions/bookmarks.ts`):**
- `createBookmark(data)` - Add bookmark to collection
- `updateBookmark(id, data)` - Update bookmark
- `deleteBookmark(id)` - Delete bookmark

Requirements:
- Use Zod for input validation
- Use `getEnhancedPrisma()` for database operations
- Hash passwords with bcryptjs before storing
- Use `revalidatePath()` after mutations

### 3. Pages

| Route | Description |
|-------|-------------|
| `/collections` | List user's collections with create dialog |
| `/collections/[id]` | Collection detail with bookmarks, share settings |
| `/share/[slug]` | Public share page with access control |

### 4. Tests

Implement tests in `src/__tests__/share-access.test.ts`:

```typescript
describe('Collection Share Access', () => {
  it('owner can always access their collection');
  it('PRIVATE collection is not accessible to others');
  it('LINK_ACCESS collection is readable by anyone');
  it('PASSWORD_PROTECTED requires correct password');
});
```

---

## What's Provided

| File | Description |
|------|-------------|
| `src/db/schema.zmodel` | Base schema with User model and ShareMode enum |
| `src/db/prisma.ts` | Prisma client singleton |
| `src/db/prisma/seed.ts` | Seed script with test users |
| `src/lib/auth.ts` | Mock authentication helpers |
| `src/lib/db.ts` | ZenStack enhanced Prisma clients |
| `src/app/layout.tsx` | Root layout with Toaster |
| `src/app/(dashboard)/layout.tsx` | Auth-protected layout with navbar |
| `src/app/page.tsx` | Login page with user picker |
| `src/components/ui/*` | Shadcn UI components |

---

## Evaluation Rubric

| Category | Weight | Criteria |
|----------|--------|----------|
| **ZenStack Schema Design** | 20% | Proper relationships, access policies cover all cases, password field is `@omit`, appropriate defaults |
| **Server Actions** | 25% | Type safety with Zod validation, proper error handling, uses enhanced client correctly, handles edge cases |
| **React Components** | 25% | Clean composition, loading/error states, form handling, responsive design |
| **Share Access Logic** | 20% | Password verification is secure (hashed), public view respects access mode, no data leaks |
| **Code Quality** | 10% | TypeScript strictness, naming conventions, no `any` types, clean structure |

### Bonus Points (not required)

- Optimistic UI updates for bookmark operations
- URL validation on bookmark creation
- Favicon fetching for bookmarks
- Tags autocomplete from existing tags
- Copy share link to clipboard functionality

---

## Time Allocation Guidance

| Phase | Time | Activities |
|-------|------|------------|
| Setup & Schema | 30 min | Review starter, design ZenStack schema, run migrations |
| Server Actions | 45 min | Implement CRUD actions with validation |
| Dashboard UI | 45 min | Collections list, detail page, bookmark management |
| Share Feature | 30 min | Public page, password gate, access logic |
| Testing & Polish | 30 min | Write tests, fix edge cases, cleanup |

---

## Deliverables

- [ ] Completed ZenStack schema (`src/db/schema.zmodel`) with Collection and Bookmark models
- [ ] Server actions for collections and bookmarks (`src/lib/actions/`)
- [ ] Dashboard pages for managing collections/bookmarks
- [ ] Public share page with access control
- [ ] At least one passing Vitest test for share access logic

---

## Design Decisions (Optional)

If you make any notable design decisions, document them here:

```
Example:
- Chose to store tags as JSON string because...
- Used optimistic updates for bookmarks because...
- Implemented password verification with cookies because...
```

---

## Questions?

If you have any questions about the requirements, please reach out to your interviewer.

Good luck!
