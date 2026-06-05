# Database ER Design

## Entity Relationship Overview

```
Platform
  └── Schools (tenant root)
        ├── Users (all roles)
        ├── AcademicSessions
        ├── Branches
        ├── Departments
        ├── Classes → Sections
        ├── Subjects → Syllabus → LessonPlans
        ├── Students → Parents (M:N via studentIds)
        ├── Teachers → ClassAssignments
        ├── Employees
        ├── Attendance (polymorphic: student/teacher/employee)
        ├── Exams → Results → ReportCards
        ├── FeeStructures → Payments → Receipts
        ├── Books → IssuedBooks
        ├── Vehicles → Routes → Stops
        ├── HostelBuildings → Rooms → Allocations
        ├── Inventory (Assets, Stock, Vendors, Purchases)
        ├── Payroll → Payslips
        ├── Announcements → Notifications
        ├── Events → Holidays
        └── AuditLogs
```

## Base Document Schema (All Collections)

```typescript
{
  _id: ObjectId,
  schoolId: ObjectId | null,  // null for platform-level
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  isDeleted: boolean
}
```

## Core Collections

### schools
| Field | Type | Description |
|-------|------|-------------|
| name | String | School name |
| code | String | Unique school code |
| email | String | Primary contact |
| phone | String | Contact phone |
| address | Object | Full address |
| subscription | Object | Plan, status, expiry |
| branding | Object | Logo, colors, theme |
| domain | String | Custom domain |
| settings | Object | General settings |
| status | Enum | active, suspended, trial |

### users
| Field | Type | Description |
|-------|------|-------------|
| email | String | Login email |
| password | String | Hashed |
| role | Enum | super_admin, school_admin, etc. |
| permissions | Array | Granular permissions |
| profile | Object | Name, avatar, phone |
| schoolId | ObjectId | Tenant reference |
| refreshTokens | Array | Active refresh tokens |
| loginHistory | Array | Login audit |
| isActive | Boolean | Account status |

### students
| Field | Type | Description |
|-------|------|-------------|
| admissionNo | String | Unique per school |
| rollNo | String | Class roll number |
| firstName, lastName | String | Name |
| classId, sectionId | ObjectId | Current class |
| parentIds | Array | Linked parents |
| documents | Array | Uploaded docs |
| status | Enum | active, alumni, transferred |
| admissionDate | Date | Admission date |

### Index Strategy

All tenant collections:
- `{ schoolId: 1, isDeleted: 1 }`
- `{ schoolId: 1, createdAt: -1 }`

Specific indexes:
- users: `{ schoolId: 1, email: 1 }` unique
- students: `{ schoolId: 1, admissionNo: 1 }` unique
- attendance: `{ schoolId: 1, date: 1, entityId: 1, entityType: 1 }`
- payments: `{ schoolId: 1, studentId: 1, status: 1 }`

## Soft Delete Pattern

All queries filter `{ isDeleted: false }`. Delete operations set `isDeleted: true` and `updatedAt`.

## Audit Trail

`auditLogs` collection records:
- action: create | update | delete | login | export
- entity: collection name
- entityId: document ID
- changes: before/after diff
- userId, schoolId, ip, userAgent, timestamp
