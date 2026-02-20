# Implementation Log

## 2026-02-20

### Email Blast Admin Feature
- Added SMTP runtime configuration in `nuxt.config.ts` and updated `.env.example` with `SMTP_*` variables.
- Added `nodemailer` dependency to `package.json` (install required).
- Implemented mailer utilities in `server/utils/mailer.ts` using `nodemailer` with placeholder rendering.
- Added validation schema `schemas/EmailBlast.schema.ts`.
- Added admin API `POST /api/admin/email-blast` to send emails in batch (supports test mode).
- Added template storage and CRUD API:
  - `GET /api/admin/email-templates`
  - `POST /api/admin/email-templates`
  - `PUT /api/admin/email-templates/:id`
  - `DELETE /api/admin/email-templates/:id`
- Added template persistence in `server/data/email-templates.json` with default templates.
- Default templates auto-merge on load so new defaults appear even if file already exists.
- Added admin UI page `pages/admin/email-blast.vue`:
  - Upload Excel
  - Sheet + header row selection
  - Button "Dapatkan Data Excel" for manual parsing
  - Column mapping
  - Editable data table so changes sync to preview
  - Template selection + editor (save/delete)
  - Live email preview (subject + body)
  - Preview + blast send
- Email blast UI improvements:
  - Accordion sections (open/close)
  - Preview table pagination
  - Red highlight for required empty inputs
  - Mapping selection no longer overwritten after user edit
  - Mapping entries can be added/removed (username/password optional)
  - Duplicate Excel headers are disambiguated with suffixes
  - Edit data table supports row deletion
  - Edit data filter + bulk delete
  - Email validation on edit table
  - Preview shows actual target email when Test Email is set
  - Confirmation dialog when sending in Test mode
- Added default template "Undangan Tes Online Gelombang 3" (editable).
- Fixed default Gelombang 3 template text (removed unintended placeholder brackets).
- Added navigation link for admin to Email Blast.
- Extended RBAC to include `admin` resource and mapped `/api/admin` in server auth middleware.
- Added admin dashboard button to Email Blast and fixed auth middleware redirect for unauthenticated users.

### Notes
- Pastikan `nodemailer` terinstall (`npm install`) dan SMTP config sudah diisi di `.env`.
- Untuk Gmail, gunakan App Password untuk `SMTP_PASS`.

### Layout & Spacing Adjustments
- Reduced desktop gap between sidebar and content by keeping sidebar offset at `md:ml-60` and setting main padding to `px-3` (≈12px visual gap).
- Removed redundant page-level left margins (`md:ml-72`) so all pages use the layout spacing consistently.
- Removed heavy container styling (shadow, border, rounded, `mx-11`, `max-w-6xl`) for full-width layouts.
- Replaced gray page backgrounds (`bg-gray-50`) with white for a cleaner, full-width look.
