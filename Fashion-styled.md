# FASHION STYLE BOARD AI — COMPLETE SOFTWARE DESIGN DOCUMENT (SDD)

## 1. PROJECT OVERVIEW

Project Name: Fashion Style Board AI

Project Type: Full-stack AI-powered fashion recommendation web application.

Primary Goal: Build a visually stunning, responsive, production-ready fashion styling platform that recommends personalized outfits based on occasion, aesthetic, color preferences, weather, budget, and the user's existing wardrobe.

Developer Environment: VS Code using OpenAI Codex.

Technology Stack:
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + TypeScript
- Database: MongoDB Atlas + Mongoose
- AI: Configurable server-side LLM provider
- Authentication: Secure cookie-based authentication
- Image Storage: Cloudinary or another configurable image storage provider
- Deployment: Vercel
- Testing: Vitest, React Testing Library, Supertest, Playwright
- Package Manager: npm

IMPORTANT: Build the application incrementally. Inspect the repository first, preserve existing files, and implement one milestone at a time. Do not generate the entire application in a single uncontrolled step.

---

## 2. PRODUCT VISION

Fashion Style Board AI should feel like a premium digital personal stylist combining a fashion editorial magazine, an intelligent outfit recommendation engine, and a personal digital wardrobe.

Users should be able to:

1. Explore different fashion aesthetics.
2. Generate personalized outfit recommendations.
3. Select occasions such as college, casual outings, parties, interviews, travel, weddings, and formal events.
4. Select preferred aesthetics, colors, dress codes, and budgets.
5. Receive coordinated outfit suggestions with styling explanations.
6. Save outfits into personal style boards.
7. Create and manage a digital wardrobe.
8. Generate combinations using clothes they already own.
9. View outfit details, color palettes, footwear, accessories, and styling tips.
10. Optionally receive weather-aware recommendations.
11. Manage their profile and preferences.
12. Use the website comfortably on mobile, tablet, and desktop.

The experience must be genuinely functional, not merely a collection of static mockup screens.

---

## 3. DESIGN DIRECTION

Create a premium, fashion-editorial interface.

Visual inspiration:
- Contemporary fashion magazines
- Minimal luxury e-commerce websites
- Editorial fashion photography
- Modern Pinterest-style inspiration boards
- Clean, high-end personal styling dashboards

Color palette:
- Warm ivory: #F6F1E9
- Charcoal: #252522
- Cognac brown: #A47C61
- White: #FFFFFF
- Muted olive: #747761
- Soft neutral borders: #E7E0D7

Typography:
- Use an elegant editorial serif for major headings.
- Use a modern sans-serif for navigation, buttons, forms, and body text.
- Maintain a clear typographic hierarchy.
- Use consistent spacing, line heights, and font weights.

UI principles:
- Large editorial photography.
- Asymmetrical layouts where appropriate.
- Generous whitespace.
- Clean navigation.
- Subtle borders and restrained shadows.
- Consistent image aspect ratios.
- Smooth, lightweight animations.
- Carefully designed hover and focus states.
- Responsive card grids.
- Minimal, tasteful gradients.
- Avoid excessive glassmorphism, generic AI-dashboard styling, excessive rounded cards, and unnecessary animations.

Use Lucide React icons.

Use shadcn/ui components where appropriate, with customized styling to maintain the fashion-editorial identity.

Support light mode by default. A dark mode is optional and should only be implemented if it does not compromise the core product.

Use accessible color contrast, semantic HTML, keyboard navigation, and reduced-motion support.

---

## 4. APPLICATION ROUTES

Implement the following routes:

Public routes:
- / — Landing page
- /explore — Explore fashion aesthetics and inspiration
- /generate — Outfit recommendation generator
- /outfits/:id — Outfit details when access is permitted
- /login — Login
- /register — Registration

Authenticated routes:
- /boards — User's saved style boards
- /boards/:id — Individual style board
- /wardrobe — Digital wardrobe
- /profile — User profile and styling preferences

Additional:
- A custom 404 page.
- Appropriate loading, empty, error, and unauthorized states.

Use React Router.

Protect private routes while also enforcing authorization on the backend. Frontend route protection alone is not sufficient.

---

## 5. LANDING PAGE REQUIREMENTS

Build a highly polished homepage.

### Navigation

Include:
- Brand wordmark: FASHION STYLE BOARD AI
- Explore
- AI Stylist
- My Boards
- My Wardrobe
- Login or profile menu
- A prominent Start Styling button

Use a responsive mobile navigation menu.

### Hero section

Headline:

"YOUR STYLE. YOUR MOOD. YOUR NEXT LOOK."

Supporting text:

"Discover outfits curated around your occasion, aesthetic, and personal wardrobe."

Primary CTA:
"Create My Outfit"

Secondary CTA:
"Explore Styles"

Design:
- Large editorial fashion image or asymmetric collage.
- Balanced text and imagery.
- Strong typography.
- Subtle entrance animation.
- High-quality responsive image handling.

### Additional sections

1. Featured fashion aesthetics.
2. How the AI stylist works.
3. Example outfit combinations.
4. Preview of personal style boards.
5. Wardrobe-based styling feature.
6. Final CTA.
7. Footer containing About, Privacy, Terms, and Contact links.

All buttons must perform meaningful actions.

Do not use broken image links or represent placeholder actions as complete features.

---

## 6. AI OUTFIT GENERATOR

This is the core feature of the application.

Create a polished form with visual selection cards, selectable chips, color controls, and clear sections.

### Required inputs

1. Occasion:
   - College
   - Casual
   - Date
   - Party
   - Interview
   - Wedding
   - Travel
   - Gym
   - Formal event
   - Other

2. Fashion aesthetic:
   - Minimalist
   - Streetwear
   - Old Money
   - Smart Casual
   - Classic
   - Y2K
   - Vintage
   - Sporty
   - Formal
   - Casual Chic
   - Custom

3. Dress code:
   - Casual
   - Smart Casual
   - Business Casual
   - Formal
   - Black Tie
   - Flexible

4. Preferred color palette:
   - Neutral
   - Monochrome
   - Earth Tones
   - Pastels
   - Bright Colors
   - Black and White
   - Custom

5. Colors to avoid:
   - Optional multi-select.

6. Weather:
   - Hot
   - Warm
   - Mild
   - Cold
   - Rainy
   - Use Live Weather

7. Budget:
   - Prefer Existing Wardrobe
   - Low Budget
   - Moderate Budget
   - Flexible Budget
   - Optional numeric budget and currency.

8. Wardrobe mode:
   - Use My Wardrobe
   - Suggest New Combinations
   - Mix Existing and New Pieces

9. Additional preferences:
   - Optional text input for comfort, clothing preferences, and styling constraints.

10. Number of recommendations:
   - 3
   - 6
   - 9

### Generator behavior

- Validate all required inputs.
- Prevent duplicate submissions.
- Display a loading animation or skeleton.
- Explain that recommendations are being prepared.
- Preserve form inputs after errors.
- Display multiple outfit recommendations.
- Allow users to regenerate variations.
- Allow users to save outfits.
- Require authentication only when a user wants to persist personal data.
- Provide meaningful error messages.
- Support retry without resetting the entire form.

Do not request body measurements, weight, or appearance ratings by default.

---

## 7. OUTFIT RECOMMENDATION CARDS

Each outfit card must include:

- Outfit title.
- Aesthetic.
- Occasion.
- Editorial image or coordinated clothing-item images.
- Recommended top.
- Recommended bottom.
- Outerwear where appropriate.
- Footwear.
- Accessories.
- Color palette.
- Styling explanation.
- Styling tips.
- Weather suitability when known.
- Estimated price when supported by reliable data.
- Save or favorite action.
- View details action.
- Regenerate variation action.

Use realistic, licensed, curated, or configured imagery.

Do not imply that an illustrative image depicts the exact recommended garment unless it actually does.

When no image is available, display a well-designed fallback placeholder.

Do not fabricate shopping prices, stock availability, or product links.

---

## 8. OUTFIT DETAIL PAGE

Display:
- Large outfit imagery.
- Outfit name and description.
- All recommended clothing pieces.
- Color palette.
- Occasion and dress code.
- Styling tips.
- Weather considerations when available.
- Budget information when supported.
- Save to board.
- Favorite.
- Generate a similar look.
- Return to recommendations.

Use responsive layouts and accessible controls.

---

## 9. STYLE BOARD SYSTEM

Users must be able to create and manage collections of saved outfits.

Features:
- Create a board.
- Rename a board.
- Delete a board.
- Add an outfit to a board.
- Remove an outfit from a board.
- View saved outfits.
- Filter by aesthetic, occasion, and color.
- Display board cover images where available.
- Display a useful empty state.
- Persist all changes in MongoDB.
- Confirm destructive operations.

Create a default board called "My Style Board" when appropriate.

Allow multiple boards.

Ensure that deleting outfits or boards does not leave invalid references.

All board operations must enforce user ownership on the backend.

---

## 10. DIGITAL WARDROBE

Allow authenticated users to add, edit, browse, filter, and delete clothing items.

### Wardrobe item fields

- Item name.
- Category.
- Main color.
- Optional secondary colors.
- Occasion suitability.
- Season suitability.
- Optional image.
- Optional brand.
- Optional size.
- Optional notes.
- Creation timestamp.
- Updated timestamp.

### Categories

- Tops
- Bottoms
- Dresses
- Outerwear
- Shoes
- Accessories

### Features

- Add clothing item manually.
- Upload an image using configured image storage.
- Edit item details.
- Delete items.
- Filter by category, color, and occasion.
- Display items in a responsive grid.
- Display a useful empty state.
- Use actual wardrobe items as inputs to the outfit generator.

When "Use My Wardrobe" is selected, prioritize existing clothing items.

Never invent wardrobe item IDs.

If the user's wardrobe cannot support a complete outfit, identify the missing clothing categories rather than falsely claiming the entire outfit can be assembled from owned items.

---

## 11. AI ARCHITECTURE

Implement a provider-independent AI recommendation service.

Create:
- OutfitGenerationService
- AIProviderAdapter
- DemoOutfitProvider
- OutfitValidationService
- OutfitRankingService
- PromptBuilder

The demo provider must produce deterministic, valid sample recommendations for development and automated tests.

Clearly label demo recommendations.

Never silently fall back to demo data in production when a real AI provider fails.

If the AI provider is unavailable, return a useful error and preserve the user's form state.

Keep all AI credentials on the server.

### AI recommendation pipeline

1. Receive preferences.
2. Validate the request.
3. Normalize the input.
4. Load authorized wardrobe items if requested.
5. Apply hard constraints.
6. Generate candidate outfits.
7. Validate structured model output.
8. Check wardrobe references.
9. Rank recommendations.
10. Return validated results.

### Ranking defaults

Start with these configurable weights:

- Occasion and dress-code compatibility: 30%.
- Aesthetic preference: 25%.
- Color coordination: 20%.
- Weather suitability: 15%.
- Budget or wardrobe compatibility: 10%.

Hard constraints must be evaluated separately and cannot be overridden by a high aggregate score.

These scores are initial engineering heuristics, not scientifically established fashion measurements.

If weather or reliable pricing data is unavailable, do not invent it.

### Structured output

Use a consistent TypeScript contract similar to:

interface OutfitRecommendation {
  id: string;
  title: string;
  aesthetic: string;
  occasion: string;
  description: string;
  items: Array<{
    category:
      | "top"
      | "bottom"
      | "dress"
      | "outerwear"
      | "shoes"
      | "accessory";
    name: string;
    color: string;
    description: string;
    wardrobeItemId?: string;
    imageUrl?: string;
    estimatedPrice?: {
      amount: number;
      currency: string;
    };
  }>;
  colorPalette: string[];
  stylingTips: string[];
  suitability: {
    occasion: string;
    weather?: string;
    dressCode: string;
  };
  warnings: string[];
  score?: number;
}

Use runtime schema validation. TypeScript interfaces alone do not validate external JSON.

Generate stable server-side IDs.

Bound the number of AI retries and output tokens.

Reject malformed output or attempt a bounded repair.

Do not trust model-generated IDs for authorization.

---

## 12. DATABASE SCHEMAS

Use MongoDB Atlas and Mongoose.

Implement the following models.

### User

Fields:
- name
- normalized email
- password hash when using local authentication
- authentication provider
- preferences
- favorite colors
- excluded colors
- preferred aesthetics
- default occasions
- currency preference
- timestamps

Use a unique index on normalized email when applicable.

Never store plaintext passwords or raw authentication secrets.

### WardrobeItem

Fields:
- userId
- name
- category
- colors
- occasions
- seasons
- imageUrl
- optional brand
- optional size
- optional notes
- timestamps

### Outfit

Fields:
- ownerId
- title
- aesthetic
- occasion
- validated item list
- color palette
- styling tips
- warnings
- source: ai, manual, or demo
- public visibility flag
- timestamps

### StyleBoard

Fields:
- userId
- title
- optional description
- outfitIds
- optional cover image
- timestamps

Define clear deletion behavior for outfit and board references.

Add indexes for frequently queried owner IDs, user IDs, normalized emails, and timestamps.

Use pagination for collection endpoints.

Validate database input and avoid embedding unrestricted external model responses.

---

## 13. BACKEND REST API

Prefix all API routes with:

/api/v1

Use a consistent JSON response format.

Success:

{
  "success": true,
  "data": {},
  "meta": {}
}

Failure:

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check your preferences.",
    "details": []
  }
}

### Authentication

POST /api/v1/auth/register

POST /api/v1/auth/login

POST /api/v1/auth/logout

GET /api/v1/auth/me

PATCH /api/v1/auth/me

### Outfits

POST /api/v1/outfits/generate

GET /api/v1/outfits

GET /api/v1/outfits/:id

POST /api/v1/outfits

PATCH /api/v1/outfits/:id

DELETE /api/v1/outfits/:id

POST /api/v1/outfits/:id/regenerate

### Style boards

GET /api/v1/boards

POST /api/v1/boards

GET /api/v1/boards/:id

PATCH /api/v1/boards/:id

DELETE /api/v1/boards/:id

POST /api/v1/boards/:id/outfits

DELETE /api/v1/boards/:id/outfits/:outfitId

### Wardrobe

GET /api/v1/wardrobe

POST /api/v1/wardrobe

GET /api/v1/wardrobe/:id

PATCH /api/v1/wardrobe/:id

DELETE /api/v1/wardrobe/:id

### Weather

GET /api/v1/weather?location=...

Implement weather integration only when configured.

Requirements:
- Validate every request.
- Enforce ownership.
- Apply rate limits.
- Return correct HTTP status codes.
- Use centralized error handling.
- Avoid exposing stack traces.
- Support pagination and filtering.
- Prevent unauthorized access to private resources.

---

## 14. FRONTEND ARCHITECTURE

Use the following logical structure:

src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  components/
    layout/
    outfits/
    boards/
    wardrobe/
    forms/
    ui/
  features/
    auth/
    generator/
    explore/
    boards/
    wardrobe/
    profile/
  hooks/
  lib/
  services/
  types/
  utils/
  styles/
  main.tsx

server/
  app.ts
  config/
  middleware/
  models/
  routes/
  controllers/
  services/
    ai/
    outfits/
    wardrobe/
    weather/
  validators/
  utils/
  types/

api/
  index.ts

shared/
  schemas/
  types/

tests/
  unit/
  integration/
  e2e/

docs/
  SDD.md
  API.md
  DEPLOYMENT.md

Use the structure as a guide and create only files required by the current milestone.

Create reusable components including:

- Navbar
- MobileNavigation
- Footer
- OutfitCard
- OutfitGrid
- OutfitDetailPanel
- StyleBoardCard
- BoardSelector
- PreferenceForm
- MultiSelectChips
- ColorPalettePicker
- WardrobeItemCard
- WardrobeItemForm
- LoadingSkeleton
- EmptyState
- ErrorState
- ConfirmDialog
- ProtectedRoute

Keep presentation components separate from business logic.

Use TanStack Query for server state, React Hook Form for complex forms, and Zod for validation.

Use a centralized API client and consistent error handling.

---

## 15. AUTHENTICATION AND SECURITY

Implement secure authentication.

Requirements:
- Hash passwords with Argon2id or bcrypt.
- Use secure, HttpOnly authentication cookies.
- Set Secure in production.
- Configure SameSite appropriately.
- Use appropriate CSRF protection.
- Apply rate limiting to login, registration, and AI endpoints.
- Validate all request bodies, route parameters, and query parameters.
- Enforce authorization on every private resource.
- Use Helmet and secure response headers.
- Restrict CORS to configured origins when cross-origin requests are needed.
- Validate image uploads and restrict file size and type.
- Keep provider API keys on the server.
- Avoid logging passwords, cookies, tokens, or API keys.
- Never expose private user data through public APIs.
- Sanitize user-generated content.
- Use safe production error messages.
- Implement bounded AI provider retries and timeouts.
- Avoid collecting unnecessary personal data.

Choose one authentication strategy and document it. If using JWT cookies, configure expiration, verification, renewal, and logout invalidation appropriately. If using server-side sessions, use a durable session store rather than in-memory sessions.

Never treat frontend route protection as a substitute for backend authorization.

---

## 16. IMAGE MANAGEMENT

Use Cloudinary or another configured image service.

Requirements:
- Store image URLs and relevant metadata in MongoDB.
- Validate image uploads.
- Restrict file sizes and permitted formats.
- Use authorized or signed uploads.
- Avoid exposing private storage credentials.
- Optimize image delivery.
- Use lazy loading.
- Preserve aspect ratios.
- Provide fallback placeholders.
- Delete or clean up uploaded images when required by the data lifecycle.

Use properly licensed or authorized fashion images.

Do not invent image URLs.

Do not claim that illustrative imagery represents an exact garment unless verified.

---

## 17. ENVIRONMENT CONFIGURATION

Create `.env.example` with placeholders.

NODE_ENV=development
APP_URL=http://localhost:5173
API_BASE_URL=/api/v1

MONGODB_URI=

SESSION_SECRET=
JWT_SECRET=

AI_PROVIDER=
AI_API_KEY=
AI_MODEL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

WEATHER_API_KEY=

Use only variables required by the selected implementation.

Do not commit real secrets.

Never prefix server-only secrets with VITE_.

Validate required variables at startup.

Configure production secrets through Vercel project settings.

Document the required environment variables and their purposes.

---

## 18. VERCEL DEPLOYMENT

The application must deploy to Vercel.

Architecture:
- React/Vite frontend built into dist/.
- Express API exposed through a Vercel-compatible serverless entry point.
- MongoDB Atlas for persistent storage.
- Configured external AI and image providers.

Before implementing the deployment adapter, verify the current supported Vercel Express/runtime integration.

Do not assume a traditional long-running Express server can run unchanged in a serverless environment.

Do not use in-memory state for persistent user data or durable sessions.

Create:
- vercel.json only when required by the verified routing configuration.
- api/index.ts using a currently supported approach.
- docs/DEPLOYMENT.md with complete deployment instructions.

Ensure:
- Frontend routes work on direct navigation and refresh.
- API routes are not accidentally rewritten to index.html.
- API requests use the correct base URL.
- Environment variables are configured.
- Database access works in production.
- Authentication cookies work on the deployed domain.
- External provider timeouts respect deployment limits.
- The application handles unavailable external services gracefully.

Never claim deployment success without actually verifying it.

---

## 19. TESTING REQUIREMENTS

Use Vitest for unit tests.

Use React Testing Library for component tests.

Use Supertest for backend integration tests.

Use Playwright for end-to-end tests.

### Unit tests

Test:
- Preference validation.
- Color and dress-code constraints.
- Outfit ranking.
- AI output normalization.
- Wardrobe item validation.
- Budget validation.
- Result-count limits.
- Authentication utilities.
- Error serialization.

### Integration tests

Test:
- Registration and login.
- Logout and current-user retrieval.
- MongoDB persistence.
- Cross-user authorization.
- Outfit generation with a mocked provider.
- Saving and deleting outfits.
- Creating and managing boards.
- Wardrobe CRUD.
- AI provider failures.
- Invalid request payloads.
- Rate limits.

### End-to-end tests

Verify:
1. Homepage navigation.
2. Selecting outfit preferences.
3. Generating recommendations.
4. Opening outfit details.
5. Registering and logging in.
6. Saving an outfit.
7. Creating and updating boards.
8. Adding, editing, and deleting wardrobe items.
9. Refreshing and confirming persistence.
10. Rejection of unauthorized access.
11. Mobile responsiveness.
12. Error handling when a provider is unavailable.

Mock external services in automated tests. Do not require paid AI calls or live weather services for routine test execution.

---

## 20. PERFORMANCE AND ACCESSIBILITY

Performance requirements:
- Target Lighthouse Performance 90+ under a representative test environment.
- Optimize images.
- Lazy-load below-the-fold media.
- Avoid unnecessary dependencies.
- Prevent layout shifts.
- Use pagination.
- Cache appropriate read operations.
- Invalidate cached data after mutations.
- Avoid duplicate AI calls.
- Apply timeouts and bounded retries.

Accessibility requirements:
- Semantic HTML.
- Proper heading hierarchy.
- Accessible form labels.
- Keyboard navigation.
- Visible focus indicators.
- Accessible dialogs.
- Sufficient contrast.
- Screen-reader announcements for errors and loading states.
- Alt text for meaningful images.
- Reduced-motion support.
- WCAG 2.2 AA as the target.

---

## 21. IMPLEMENTATION MILESTONES

### MILESTONE 1 — PROJECT FOUNDATION

- Inspect repository and installed tooling.
- Read this specification.
- Prepare an implementation plan.
- Configure TypeScript, Vite, Tailwind, routing, linting, and testing.
- Build the design system.
- Build the responsive navigation.
- Build the landing page.
- Create route placeholders.
- Verify the local development server and production build.

### MILESTONE 2 — OUTFIT GENERATOR

- Build the complete preference form.
- Implement Zod validation.
- Implement deterministic demo recommendations.
- Implement the AI provider abstraction.
- Implement output validation and ranking.
- Build outfit cards and detail views.
- Add loading, error, retry, and empty states.
- Test the complete generation flow.

### MILESTONE 3 — BACKEND AND AUTHENTICATION

- Implement Express.
- Configure MongoDB Atlas connectivity.
- Create Mongoose models.
- Implement authentication.
- Implement authorization middleware.
- Implement API routes and controllers.
- Add validation, rate limiting, and error handling.
- Write integration tests.

### MILESTONE 4 — STYLE BOARDS AND WARDROBE

- Implement board management.
- Implement outfit saving.
- Implement wardrobe CRUD.
- Add filters and pagination.
- Integrate image storage.
- Connect frontend and backend.
- Verify persistent data and ownership restrictions.

### MILESTONE 5 — PRODUCTION READINESS

- Complete unit, integration, and end-to-end tests.
- Verify accessibility.
- Optimize performance.
- Verify Vercel routing and runtime compatibility.
- Configure environment variables.
- Test production build.
- Document deployment.
- Resolve failing tests and build errors.

Do not move to the next milestone until the current milestone has been verified, unless the user explicitly authorizes the complete sequence.

---

## 22. DEFINITION OF DONE

A feature is complete only when:
- The UI works.
- The layout is responsive.
- Inputs and outputs are validated.
- Loading, success, empty, and error states exist.
- Backend authorization is enforced where required.
- Persistent data survives refresh.
- Relevant tests pass.
- TypeScript checks pass.
- No production secrets are exposed.
- The feature follows the documented architecture.
- Limitations are documented.

Do not report tests, builds, integrations, or deployment as successful unless they were actually executed and verified.

---

## 23. CODEX WORKING PROTOCOL

FIRST ACTION:

Inspect the existing repository, package manager, and current files.

Read this SDD if it is saved as docs/SDD.md.

If the specification file does not exist, ask the user to save this specification there or confirm that the current prompt should serve as the specification.

Then produce:
1. A concise repository assessment.
2. A proposed implementation plan.
3. A proposed file tree.
4. A dependency list with justifications.
5. A description of the frontend/backend data flow.
6. A Vercel deployment compatibility assessment.
7. A list of missing credentials or external services.
8. The exact commands and files needed for Milestone 1.

Do not start by generating every file.

After approval, implement Milestone 1.

After implementation:
- Run the relevant checks.
- Fix errors caused by your changes.
- Report modified files.
- Report commands executed and actual results.
- List known limitations.
- Recommend the next milestone.

Preserve existing work. Do not overwrite unrelated files or execute destructive commands without explicit approval.

FINAL OBJECTIVE:

Deliver a secure, responsive, visually excellent, genuinely functional Fashion Style Board AI application using the specified MERN stack and deployed through a verified Vercel-compatible architecture.

Begin by inspecting the repository and preparing the Milestone 1 plan.