# Trackr Project Details

## 1. Project Overview

**Trackr** is a comprehensive web application designed to help students and professionals organize, track, and manage their job or On-the-Job Training (OJT) applications through an intuitive, visual pipeline system. The application provides a kanban-style board interface where users can create custom pipelines with stages (e.g., "Interested" → "Applied" → "Interview" → "Offer" → "Rejected"), drag applications between stages, attach notes, files, and set reminders.

### Key Objectives
- **Fast and Intuitive**: Drag-and-drop first user experience
- **Personal by Default**: Single-user focused with optional team collaboration
- **Flexible but Opinionated**: Avoids enterprise CRM complexity while remaining customizable
- **Comprehensive Tracking**: Covers all aspects of job application management

### Target Users
- Students applying for internships and entry-level positions
- Professionals managing multiple job applications
- Career counselors and placement officers
- Anyone needing organized application tracking

## 2. System Architecture

### High-Level System Context

```
[Web/Mobile Client]
   |  HTTPS (REST/JSON)
   v
[API Gateway / BFF (NestJS)]
   |-> Authentication (JWT)
   |-> Core API (Domain Services)
   |-> Realtime (WebSocket/SSE) - Optional
   v
[Database] <----> [Search Index] (Future)
   |
   +--> [Object Storage] (Files - S3/R2)
   |
   +--> [Queue/Worker] (Reminders, Emails - Future)
           |
           +--> Email/SMS/Push Providers
```

### Application Architecture

Trackr follows a **monorepo structure** with separate frontend and backend applications:

```
trackr/
├── apps/
│   ├── frontend/          # Next.js React Application
│   └── backend/           # NestJS API Server
├── package.json           # Root orchestration scripts
└── README.md
```

### Data Flow Architecture

1. **Frontend**: React components with optimistic updates
2. **API Layer**: RESTful endpoints with workspace-scoped authorization
3. **Database**: PostgreSQL with Prisma ORM
4. **File Storage**: Cloudflare R2 / AWS S3 (planned)
5. **Background Jobs**: Queue system for reminders (planned)

## 3. Technology Stack

### Backend (NestJS)
- **Framework**: NestJS 11.x (Node.js)
- **Language**: TypeScript 5.7.x
- **Database**: PostgreSQL 16
- **ORM**: Prisma 7.3.x
- **Authentication**: JWT with Passport
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: bcrypt
- **File Upload**: AWS SDK (pre-signed URLs)
- **Testing**: Jest + Supertest

### Frontend (Next.js)
- **Framework**: Next.js 16.1.x (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.2.x
- **Styling**: Tailwind CSS 4.1.x
- **State Management**: TanStack Query (React Query) 5.90.x
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **Animations**: Framer Motion 12.29.x
- **Validation**: Zod 4.3.x
- **Build Tool**: PostCSS with Autoprefixer

### Development Tools
- **Linting**: ESLint 9.x
- **Formatting**: Prettier 3.4.x
- **Testing**: Jest (Backend), No frontend tests yet
- **Containerization**: Docker Compose (Database)
- **Package Management**: npm
- **Concurrent Development**: concurrently

### Infrastructure
- **Database**: PostgreSQL in Docker
- **File Storage**: Cloudflare R2 (planned)
- **Deployment**: Manual build process (npm scripts)
- **Environment**: Development with hot reload

## 4. Database Schema and Data Model

### Core Entities

#### User
- **Purpose**: Represents authenticated users
- **Key Fields**: id, email, name, hashedPw, timestamps
- **Relationships**: Owns workspaces, has memberships, creates activities

#### Workspace
- **Purpose**: Top-level organizational unit (personal or team)
- **Key Fields**: id, name, ownerId, timestamps
- **Relationships**: Has members, pipelines, applications, tasks, files

#### Membership
- **Purpose**: User-workspace relationship with roles
- **Key Fields**: workspaceId, userId, role (OWNER/ADMIN/MEMBER)
- **Constraints**: One membership per user per workspace

#### Pipeline
- **Purpose**: Application workflow definition
- **Key Fields**: id, workspaceId, name, isDefault
- **Relationships**: Contains stages, has applications

#### Stage
- **Purpose**: Pipeline columns for application states
- **Key Fields**: id, pipelineId, name, position, color
- **Constraints**: Unique position per pipeline

#### Application
- **Purpose**: Core entity representing job applications
- **Key Fields**: company, role, link, source, location, compMin/compMax, priority, status, position
- **Relationships**: Belongs to workspace, pipeline, stage; has activities, tasks, files

#### Activity
- **Purpose**: Audit log and notes for applications
- **Key Fields**: type (NOTE/STAGE_MOVED/INTERVIEW/EMAIL/CALL/OFFER), content, data
- **Relationships**: Belongs to application and user

#### Task
- **Purpose**: Reminders and follow-ups
- **Key Fields**: title, dueAt, status (OPEN/DONE/CANCELED)
- **Relationships**: Belongs to workspace and optionally application

#### File
- **Purpose**: Document attachments (resumes, cover letters)
- **Key Fields**: name, storageKey, mime, size
- **Relationships**: Belongs to workspace and optionally application

### Key Design Principles

1. **Workspace Scoping**: All data is scoped to workspaces for multi-tenancy
2. **Soft Deletes**: All entities support soft deletion with `deletedAt`
3. **Position-based Ordering**: Stages and applications use integer positions
4. **Flexible Relationships**: Tasks and files can be workspace-level or application-specific
5. **Audit Trail**: Activities track all changes and user actions

### Database Constraints

- Unique user membership per workspace
- Unique stage position per pipeline
- Applications must belong to exactly one stage
- Foreign key relationships with appropriate cascade behaviors
- Soft delete indexes for performance

## 5. API Design

### RESTful Endpoints Structure

All endpoints are prefixed with `/api` and require authentication. Authorization is workspace-scoped.

#### Authentication
- `POST /auth/login` - JWT token generation
- `POST /auth/register` - User registration
- `GET /me` - Current user info

#### Workspaces
- `GET /workspaces` - List user's workspaces
- `POST /workspaces` - Create workspace
- `GET /workspaces/{id}` - Get workspace details

#### Pipelines
- `GET /workspaces/{workspaceId}/pipelines` - List pipelines
- `POST /workspaces/{workspaceId}/pipelines` - Create pipeline
- `PATCH /pipelines/{pipelineId}` - Update pipeline

#### Stages
- `GET /pipelines/{pipelineId}/stages` - List stages
- `POST /pipelines/{pipelineId}/stages` - Create stage
- `PATCH /pipelines/{pipelineId}/stages/reorder` - Reorder stages

#### Applications
- `GET /workspaces/{workspaceId}/applications` - List/search applications
- `POST /workspaces/{workspaceId}/applications` - Create application
- `PATCH /applications/{id}` - Update/move application
- `DELETE /applications/{id}` - Soft delete application

#### Activities
- `GET /applications/{applicationId}/activities` - List activities
- `POST /applications/{applicationId}/activities` - Create note

#### Tasks
- `GET /workspaces/{workspaceId}/tasks` - List tasks
- `POST /applications/{applicationId}/tasks` - Create task
- `PATCH /tasks/{taskId}` - Update task

#### Files
- `POST /files/upload-url` - Generate upload URL
- `POST /applications/{id}/files` - Register file
- `GET /applications/{id}/files` - List files
- `GET /files/{id}/download-url` - Generate download URL
- `DELETE /files/{id}` - Delete file

### API Design Principles

1. **Workspace-Scoped**: All business endpoints require workspace membership
2. **Role-Based Access**: OWNER/ADMIN/MEMBER permissions
3. **Optimistic Updates**: Frontend assumes success, handles rollbacks
4. **Soft Deletes**: DELETE operations are soft deletes
5. **Filtering & Search**: Query parameters for filtering
6. **Pagination**: Not implemented yet (future enhancement)

### Authentication Flow

1. User registers/logs in → receives JWT
2. JWT included in Authorization header for all requests
3. Backend validates token and extracts user ID
4. Workspace endpoints verify user membership
5. Admin endpoints check role permissions

## 6. Frontend Architecture

### Application Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (app)/             # Protected application routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # Generic UI components
│   ├── application/      # Application-specific components
│   └── board/            # Kanban board components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API client
└── public/               # Static assets
```

### Key Components

#### Board System
- **Board**: Main kanban container
- **Column**: Represents pipeline stages
- **Card**: Individual application cards
- **Types**: TypeScript interfaces for board data

#### Application Management
- **ApplicationDrawer**: Side panel for application details
- **EditApplication**: Form for editing application data
- **ActivitiesSection**: Activity feed display
- **TasksSection**: Task management
- **FileSection**: File attachments

#### UI Components
- **AuthGate**: Authentication guard
- **Navbar**: Navigation component
- **Modal**: Reusable modal dialog

### State Management

**TanStack Query** handles:
- Server state synchronization
- Caching and invalidation
- Optimistic updates
- Background refetching

**Local State** for:
- UI interactions (modals, forms)
- Drag and drop state
- Form validation

### Custom Hooks

Each feature has dedicated hooks following naming conventions:
- `useApplications` - Application CRUD operations
- `useCreateApplication` - Application creation
- `useUpdateApplication` - Application updates
- `useMoveApplication` - Drag and drop logic
- `useActivities` - Activity management
- `useTasks` - Task operations
- `useFiles` - File handling

### Routing Structure

- `/` - Landing page
- `/login` - Authentication
- `/register` - User registration
- `/workspaces` - Workspace selection
- `/workspaces/[workspaceId]` - Main application board

## 7. Backend Architecture

### Module Structure

```
backend/src/
├── app.module.ts         # Root module
├── main.ts              # Application bootstrap
├── auth/                # Authentication module
├── workspaces/          # Workspace management
├── pipelines/           # Pipeline operations
├── stages/              # Stage management
├── applications/        # Application CRUD
├── activities/          # Activity logging
├── tasks/               # Task management
├── files/               # File operations
├── prisma/              # Database service
├── health/              # Health checks
└── test/                # Test utilities
```

### Key Modules

#### Authentication Module
- JWT strategy with Passport
- Login/register endpoints
- Password hashing with bcrypt
- Current user decorator

#### Prisma Module
- Database connection service
- Transaction management
- Soft delete middleware

#### Application Module
- CRUD operations
- Stage movement logic
- Position reordering
- Activity creation

#### File Module
- Pre-signed URL generation
- File metadata management
- Storage integration (AWS S3/R2)

### Authorization Pattern

**Workspace-Scoped Guards**:
- Verify user authentication
- Check workspace membership
- Validate role permissions
- Applied to all business endpoints

### Validation Strategy

- **DTO Classes**: Input validation with class-validator
- **Transformers**: Automatic type conversion
- **Pipes**: Global validation pipeline
- **Swagger**: API documentation generation

## 8. Development Pipeline

### Phase 0: Contract Freeze
- Backend API contracts stabilized
- DTOs and endpoints finalized
- Authentication and authorization working
- Database schema locked

### Phase 1: Read Paths
- Authentication gate
- Workspace/pipeline/stage listing
- Application display
- No mutations or interactions

### Phase 2: Write Paths (CRUD)
- Create/edit/delete applications
- Form validation
- Server state synchronization
- No drag and drop

### Phase 3: Interactions
- Drag and drop implementation
- Optimistic updates
- Position management
- Rollback handling

### Phase 4: Secondary Features
- Activities and notes
- Tasks and reminders
- File attachments
- Advanced filtering

### Phase 5: Polish
- Visual consistency
- Empty states
- Loading skeletons
- Responsive design

### Phase 6: Verification
- Reload consistency
- Cross-route navigation
- Data persistence
- Error handling

## 9. Key Features and Functionality

### Core Features

1. **Kanban Board Interface**
   - Visual pipeline representation
   - Drag and drop between stages
   - Real-time position updates

2. **Application Management**
   - Comprehensive application data
   - Priority and status tracking
   - Company and role information
   - Salary range tracking

3. **Activity Logging**
   - Automatic stage movement tracking
   - Manual notes and comments
   - Interview and communication logs

4. **Task and Reminder System**
   - Due date tracking
   - Status management
   - Application-specific tasks

5. **File Attachments**
   - Resume and document storage
   - Pre-signed upload URLs
   - Download link generation

### Advanced Features

- **Workspace Collaboration**: Multi-user support with roles
- **Custom Pipelines**: Flexible stage configuration
- **Search and Filtering**: Application discovery
- **Data Export**: Future feature for data portability

## 10. Deployment and Infrastructure

### Development Environment

- **Database**: PostgreSQL in Docker Compose
- **Backend**: Hot reload with `npm run start:dev`
- **Frontend**: Hot reload with `npm run dev`
- **Concurrent**: `npm run dev` runs both services

### Production Build

- **Backend**: `npm run build` → `npm run start:prod`
- **Frontend**: `npm run build` → `npm run start`
- **Database**: Manual migration with Prisma

### Environment Configuration

- **Backend**: `.env` file for database and secrets
- **Frontend**: Environment variables for API URLs
- **Docker**: Containerized database for consistency

### Future Infrastructure Plans

- Container orchestration (Docker Compose/Kubernetes)
- CI/CD pipeline
- Cloud database (AWS RDS/Supabase)
- Object storage (Cloudflare R2)
- Background job processing (BullMQ/Redis)

## 11. Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose
- PostgreSQL knowledge (optional)

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd trackr
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd apps/backend && npm install
   cd ../frontend && npm install
   ```

3. **Start Database**
   ```bash
   cd apps/backend
   docker-compose up -d
   ```

4. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build for production
- `npm run test` - Run backend tests

### Default Credentials

- **Email**: seed@trackr.dev
- **Password**: password123

## 12. File Structure Details

### Root Level
- `package.json` - Monorepo orchestration
- `README.md` - Project overview
- `PROJECT_STRUCTURE.md` - File tree documentation
- `.gitignore` - Git ignore rules

### Backend Structure
- `src/` - Source code
- `prisma/` - Database schema and migrations
- `test/` - End-to-end tests
- `docker-compose.yml` - Database container
- `eslint.config.mjs` - Linting configuration

### Frontend Structure
- `app/` - Next.js app directory
- `components/` - React components
- `hooks/` - Custom hooks
- `lib/` - Utilities and API client
- `public/` - Static assets

### Key Configuration Files

- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration

## 13. Dependencies and Libraries

### Backend Dependencies

**Core Framework**
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`

**Database & ORM**
- `prisma`, `@prisma/client`
- `pg` (PostgreSQL driver)

**Authentication**
- `@nestjs/jwt`, `@nestjs/passport`
- `passport`, `passport-jwt`
- `bcrypt`

**Validation & Serialization**
- `class-validator`, `class-transformer`
- `reflect-metadata`

**File Storage**
- `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

**Documentation**
- `@nestjs/swagger`, `swagger-ui-express`

### Frontend Dependencies

**Core Framework**
- `next`, `react`, `react-dom`

**State Management**
- `@tanstack/react-query`

**UI & Styling**
- `tailwindcss`, `@tailwindcss/postcss`
- `autoprefixer`, `postcss`

**Drag & Drop**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**Animations**
- `framer-motion`

**Validation**
- `zod`

### Development Dependencies

**Linting & Formatting**
- `eslint`, `prettier`
- Various ESLint plugins and configurations

**Testing**
- `jest`, `@types/jest`
- `supertest`, `@types/supertest`

**TypeScript**
- `typescript`, `@types/node`
- Various type definitions

## 14. Security Considerations

### Authentication Security
- JWT tokens with expiration
- Password hashing with bcrypt
- No sensitive data in tokens

### Authorization Security
- Workspace-scoped access control
- Role-based permissions (OWNER/ADMIN/MEMBER)
- Input validation on all endpoints

### Data Security
- Soft deletes for audit trails
- No direct file access (pre-signed URLs)
- Environment variable configuration

### API Security
- CORS configuration
- Rate limiting (not implemented yet)
- Input sanitization

## 15. Performance Considerations

### Database Performance
- Proper indexing on frequently queried fields
- Soft delete indexes
- Connection pooling (Prisma handles this)

### Frontend Performance
- Optimistic updates reduce perceived latency
- React Query caching minimizes API calls
- Code splitting with Next.js App Router

### API Performance
- Efficient queries with Prisma
- Proper error handling
- Transaction management for consistency

## 16. Testing Strategy

### Backend Testing
- Unit tests for services and utilities
- E2E tests for API endpoints
- Jest testing framework
- Supertest for HTTP testing

### Frontend Testing
- No automated tests implemented yet
- Manual testing during development phases
- Future: React Testing Library + Jest

### Database Testing
- Prisma migrations for schema consistency
- Seed data for development
- Transaction rollback in tests

## 17. Future Enhancements

### Planned Features
- Real-time collaboration with WebSockets
- Advanced search and filtering
- Calendar integration for interviews
- Email parsing for automatic application creation
- Analytics and reporting dashboard
- Mobile responsive design improvements
- API rate limiting and caching
- Background job processing for reminders

### Technical Improvements
- GraphQL API alongside REST
- Redis caching layer
- Elasticsearch for advanced search
- Docker containerization for full stack
- CI/CD pipeline implementation
- Monitoring and logging
- Database connection pooling optimization

### Architecture Evolution
- Microservices consideration for scaling
- Event-driven architecture for activities
- CQRS pattern for complex queries
- Multi-region deployment support

## 18. Contributing Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint and Prettier for consistency
- Conventional commit messages
- Comprehensive error handling

### Development Workflow
- Feature branches from main
- Pull request reviews required
- Automated testing on PR
- Manual testing checklist

### Documentation
- API documentation with Swagger
- Code comments for complex logic
- README updates for new features
- Architecture decision records

## 19. Troubleshooting

### Common Issues

**Database Connection**
- Ensure Docker container is running
- Check environment variables
- Verify PostgreSQL credentials

**Authentication Problems**
- Check JWT token expiration
- Verify user credentials
- Clear browser storage

**Drag and Drop Issues**
- Check browser compatibility
- Verify @dnd-kit versions
- Test with simple HTML elements

**Build Failures**
- Clear node_modules and reinstall
- Check TypeScript compilation errors
- Verify all dependencies are installed

### Debug Commands

```bash
# Check database status
docker ps | grep trackr_db

# View database logs
docker logs trackr_db

# Reset database
npx prisma migrate reset

# Check API health
curl http://localhost:3001/api/health

# View frontend build
npm run build
```

## 20. License and Attribution

- **License**: ISC License
- **Repository**: GitHub (dimsits/trackr)
- **Author**: Seth Davis
- **Date**: February 2026

This comprehensive documentation covers all aspects of the Trackr project, from high-level architecture to implementation details. The project represents a modern, full-stack application built with industry-standard technologies and best practices.</content>
<parameter name="filePath">c:\Users\sethd\Documents\personal-websites\trackr\PROJECT_DETAILS.md