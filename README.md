# Thesis Management System

A modern web application for managing academic theses and faculty collaboration built with Next.js, Prisma, and NextAuth.

## Features

- **Authentication System**: Secure login with NextAuth support for multiple user roles
- **Admin Dashboard**: Manage users, theses, promotions, faculty, and broadcast notifications
- **Doctor Dashboard**: Access personal thesis management, notifications, and profile settings
- **Thesis Management**: Create, track, and manage academic theses and external collaborations
- **Real-time Notifications**: WebSocket support for instant updates
- **Responsive Design**: Mobile-friendly UI with dark mode support
- **Database**: Prisma ORM with Neon PostgreSQL support

## Tech Stack

- **Frontend**: React 19, Next.js 16 with TypeScript
- **Styling**: Tailwind CSS 4 with PostCSS
- **Database**: Prisma 6 with Neon Adapter
- **Authentication**: NextAuth 4
- **UI Components**: Radix UI with custom components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Real-time**: WebSocket (ws)
- **Icons**: Lucide React

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin dashboard routes
│   ├── (auth)/            # Authentication routes
│   ├── (doctor)/          # Doctor dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   └── ui/               # Radix UI wrapper components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions (Prisma client)
├── prisma/              # Prisma schema and migrations
├── public/              # Static files
├── styles/              # Global CSS
└── types/               # TypeScript definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create `.env.local`):
```env
# Database
DATABASE_URL=your_neon_database_url

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Add other required environment variables
```

4. Set up the database with Prisma:
```bash
npx prisma migrate dev
```

5. Seed the database (optional):
```bash
npm run seed
```

## Running the Project

### Development Mode
```bash
npm run dev
```
The application will run at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## Database

### Prisma Commands
- Create a new migration: `npx prisma migrate dev --name <migration_name>`
- View database UI: `npx prisma studio`
- Check migration status: `npx prisma migrate status`
- Reset database: `npx prisma migrate reset`

### Schema
The Prisma schema is located in `prisma/schema.prisma`

## Key Pages

### Admin Routes (`/admin`)
- Dashboard: `/admin-dashboard`
- Thesis Management: `/admin-dashboard/theses`
- Doctors: `/admin-dashboard/doctors`
- Faculty Doctors: `/admin-dashboard/faculty-doctors`
- Promotions: `/admin-dashboard/promotions`
- External Collaborators: `/admin-dashboard/externals`
- Broadcast: `/admin-dashboard/broadcast`

### Doctor Routes (`/doctor`)
- Dashboard: `/doctor-dashboard`
- My Theses: `/doctor-dashboard/theses`
- Thesis Details: `/doctor-dashboard/thesis/[id]`
- Profile: `/doctor-dashboard/profile`
- Notifications: `/doctor-dashboard/notifications`
- Contact: `/doctor-dashboard/contact`

### Auth Routes
- Login: `/login`

## API Routes

- Authentication: `/api/auth/[...nextauth]`
- Admin Creation: `/api/create-admin`

## UI Components

Custom UI components are built on Radix UI and located in `components/ui/`:
- Forms, inputs, buttons
- Dialogs, modals, drawers
- Cards, tables, charts
- Navigation components
- And many more...

## Configuration Files

- `next.config.mjs`: Next.js configuration
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.mjs`: PostCSS configuration
- `components.json`: Shadcn component configuration

## Development Tips

1. **Type Safety**: Make sure to use TypeScript for all new components
2. **Components**: Use the UI components from `components/ui/` for consistency
3. **Styling**: Follow Tailwind CSS naming conventions
4. **Server Actions**: Use server-side actions for mutations (in `actions.ts` files)
5. **Environment Variables**: Always use environment variables for sensitive data

## Contributing

When contributing to this project:
1. Follow TypeScript best practices
2. Use existing UI components
3. Keep components focused and reusable
4. Write meaningful commit messages

## License

All rights reserved. DR. Mohamed Atta

## Support

For issues and questions, please contact the development team.
