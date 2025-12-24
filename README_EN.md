# EyesOnCalendar - Shift Management System

A modern shift management system built with Next.js, supporting multi-user scheduling, group management, and data persistence.

## Features

### Core Features

- **Monthly Shift Management**: Visual monthly shift calendar supporting various work types (workday, weekend, annual leave, sick leave, training, etc.)
- **People Management**: Add, delete, and manage team members
- **Group Management**: Create and manage different team groups (e.g., Azure Monitor, SCEM)
- **Global Configuration**: Unified people and group configuration that automatically syncs to all months
- **Date Locking**: Support locking specific dates to prevent accidental modifications


### Technical Features

- **Data Persistence**: Uses PostgreSQL database for data storage
- **JSONB Storage**: Leverages PostgreSQL JSONB type to store complex shift data
- **Optimistic Updates**: Frontend responds instantly for better user experience
- **Docker Support**: Easily packaged as Docker image for deployment
- **Responsive Design**: Supports desktop and mobile access

## Tech Stack

- **Frontend Framework**: Next.js 16.0.8 + React 19.2.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Azure PostgreSQL Flexible Server recommended)
- **Deployment**: Docker + Standalone mode

## Quick Start

### Requirements

- Node.js 20+
- PostgreSQL database
- npm or pnpm

### Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd EyesOnCalendar
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create `.env` file:

```env
# PostgreSQL database configuration
PGHOST=your-postgres-host.postgres.database.azure.com
PGUSER=your-username
PGPORT=5432
PGDATABASE=eyesoncalendar
PGPASSWORD=your-password


```

4. **Initialize database**

```bash
# Connect to PostgreSQL and execute
psql -h <PGHOST> -U <PGUSER> -d <PGDATABASE> -f scripts/init-db.sql
```

5. **Start development server**

```bash
npm run dev
```

Visit <http://localhost:3000> to view the application.

### Docker Deployment

1. **Build image**

```bash
docker build -f Dockerfile -t your-org/eyesoncalendar:latest .
```

2. **Run container**

```bash
docker run -d \
  -p 3000:3000 \
  -e PGHOST=your-postgres-host \
  -e PGUSER=your-username \
  -e PGPORT=5432 \
  -e PGDATABASE=eyesoncalendar \
  -e PGPASSWORD=your-password \
  your-org/eyesoncalendar:latest
```

## Project Structure

```text
EyesOnCalendar/
├── app/
│   ├── [year]/[month]/        # Monthly shift pages
│   ├── api/                   # API routes
│   │   ├── mapping/          # Mapping configuration API
│   │   ├── shifts/           # Shift data API
│   │   ├── people/           # People management API
│   │   ├── groups/           # Group management API
│   │   └── management/       # Management page API
│   ├── components/           # React components
│   │   ├── ShiftGrid.tsx    # Shift grid component
│   │   ├── PeopleManager.tsx # People manager component
│   │   └── MonthNavigation.tsx # Month navigation component
│   ├── management/           # Management page
│   └── page.tsx             # Home page (auto-redirect to current month)
├── lib/
│   ├── db.ts                # Database connection pool
│   └── data.ts              # Data access layer
├── types/
│   └── index.ts             # TypeScript type definitions
├── scripts/
│   └── init-db.sql          # Database initialization script
└── public/                  # Static assets
```

## User Guide

### Creating a New Month

1. Visit any month page (e.g., `/2025/1`)
2. If the month data doesn't exist, click "Create Month Data" button
3. System will automatically create shift data for that month from global configuration

### Managing People and Groups

1. Click "⚙️ Manage People & Groups" button in the top right corner
2. **Add Member**: Enter alias (user identifier) and display name
3. **Delete Member**: Click delete button next to member (removes from all months)
4. **Create Group**: Enter group name and create
5. **Delete Group**: Click delete button next to group ("All" group cannot be deleted)
6. **Assign Member to Group**: Select member and target group, click "Add to Group" (Note: "All" group won't appear in dropdown as all members automatically belong to "All" group)

### Editing Shifts

1. On the monthly shift page, click any cell
2. Select work type (W=Workday, AL=Annual Leave, SL=Sick Leave, etc.)
3. Changes are immediately saved to database

### Locking Dates

1. Click the lock icon in the date column
2. Locked dates will show a lock indicator
3. Only users in POWER_USERS can lock/unlock dates

## Work Type Reference

| Code | Tag | Meaning | On Duty |
| ---- | --- | ------- | ------- |
| W | - | Workday | Yes (1.0) |
| MS | MS | Morning Shift | Yes (1.0) |
| NS | NS | Night Shift | Yes (1.0) |
| T | T | Training | No (0.0) |
| AL | AL | Annual Leave | No (0.0) |
| HMAL | H(M) | Morning Annual Leave | Half (0.5) |
| HAAL | H(A) | Afternoon Annual Leave | Half (0.5) |
| SL | SL | Sick Leave | No (0.0) |
| HMSL | H(M) | Morning Sick Leave | Half (0.5) |
| HASL | H(A) | Afternoon Sick Leave | Half (0.5) |
| PO | PO | Holiday On Duty | Yes (1.0) |
| PM | PM | Holiday Morning Shift | Yes (1.0) |
| PH | PH | Public Holiday | No (0.0) |
| WD | WD | Weekend | No (0.0) |
| TFL | TFL | Time for Learning | No (0.0) |

## Database Schema

### shift_mapping Table

Stores global configuration:

- `day_types`: Work type definitions (JSONB)
- `tag_groups`: Global group configuration (JSONB)
- `global_people`: Global people list (JSONB)

### shift_data Table

Stores monthly shift data:

- `year`, `month`: Year-month identifier
- `pod`: Team name
- `lockdate`: Array of locked dates
- `people`: People and their shift data (JSONB)
- `tag_arrangement`: Monthly group configuration (JSONB, auto-synced from global)

## Global Configuration Mechanism

The system uses a two-tier architecture with global configuration + monthly data:

1. **Global Configuration** (stored in `shift_mapping` table):
   - Global people list (`global_people`)
   - Global group configuration (`tag_groups`)
   - Work type definitions (`day_types`)

2. **Monthly Data** (stored in `shift_data` table):
   - Specific shift information for each month
   - Automatically synced from global configuration for people and groups

3. **Sync Mechanism**:
   - Add/delete people: Automatically syncs to all existing months
   - Create/delete groups: Automatically syncs to all existing months
   - Move members to different groups: Automatically syncs to all existing months
   - Create new month: Automatically initialized from global configuration

## Environment Variables

| Variable | Description | Example |
| -------- | ----------- | ------- |
| PGHOST | PostgreSQL host address | `postgresql-sea.postgres.database.azure.com` |
| PGUSER | Database username | `admin` |
| PGPORT | Database port | `5432` |
| PGDATABASE | Database name | `eyesoncalendar` |
| PGPASSWORD | Database password | `your-password` |

## API Endpoints

### GET /api/mapping

Get global configuration (work types, groups, people)

### GET /api/management

Get global people and group configuration (for management page)

### GET /api/shifts?year=YYYY&month=MM

Get shift data for specified month

### POST /api/shifts

Create shift data for new month

```json
{
  "year": 2025,
  "month": 1
}
```

### PUT /api/shifts

Update shift data (modify work type or lock status)

### POST /api/people

Add new member (auto-syncs to global configuration and all months)

```json
{
  "alias": "johndoe",
  "name": "John Doe"
}
```

### DELETE /api/people

Delete member (removes from global configuration and all months)

```json
{
  "alias": "johndoe"
}
```

### PUT /api/groups

Update group configuration (auto-syncs to all months)

```json
{
  "tag_arrangement": [
    {
      "full_name": "All",
      "member": [...]
    },
    {
      "full_name": "Azure Monitor",
      "member": [...]
    }
  ]
}
```

## Development Guide

### Adding New Work Types

1. Modify `day_types` definition in `scripts/init-db.sql`
2. Or directly update `day_types` field in `shift_mapping` table via database

### Customizing Styles

The project uses Tailwind CSS. Customize themes in `tailwind.config.ts`.

### Modifying Database Connection

Edit `lib/db.ts` file to adjust connection pool configuration.

## FAQ

### Q: How to reset the database?

A: Delete all data and re-execute `scripts/init-db.sql`.

### Q: Why are deleted groups still showing?

A: Refresh the page to clear cache. The system has already auto-synced the deletion.

### Q: How to backup data?

A: Use `pg_dump` tool to backup PostgreSQL database:

```bash
pg_dump -h <PGHOST> -U <PGUSER> -d <PGDATABASE> > backup.sql
```

### Q: Can it run without a database?

A: No, the system depends on PostgreSQL for data persistence.

### Q: What's special about the "All" group?

A: The "All" group is the system default group containing all members and cannot be deleted. New members are automatically added to the "All" group. When adding members to other groups, the "All" group won't appear in the dropdown list.


## Contributing

Issues and Pull Requests are welcome!

## License

MIT License

## Contact

For questions or suggestions, please contact us via Issues.
