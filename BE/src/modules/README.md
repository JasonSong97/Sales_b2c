# Backend Modules

This folder is reserved for business modules. Each module owns its domain model, use cases, infrastructure adapters, and presentation layer.

Current module map:

| Module | Purpose |
|---|---|
| `auth` | Supabase token exchange, App token, session, devices |
| `user` | current user, settings, account deletion |
| `company` | company CRUD, company logs |
| `contact` | contact CRUD, company relationship, contact logs |
| `product` | product CRUD, product logs, product connections |
| `deal` | deal CRUD, stage, next action, activities |
| `schedule` | schedules, reminders, Google Calendar import |
| `meeting-note` | meeting notes, AI generation, deal link |
| `business-card` | OCR scan and confirmation |
| `import-export` | import jobs, export jobs, file adapters |
| `notification` | in-app/email/browser push notifications |
| `tag` | tags, assignments, append-only tag logs |
| `audit-log` | audit log query and write ports |
| `admin` | Admin read models and sensitive raw view workflows |
| `health` | lightweight health endpoint |

Use `_template` as the folder contract when adding a full vertical slice.
