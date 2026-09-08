# Management Tools Documentation

This document explains the FarmBuzz management tools available in this app and what each screen is used for. The app is built as an Expo SDK 57 React Native app and uses a central dashboard to open each management module.

## App Overview

FarmBuzz Management Tools is a farm operations app for tracking gamefowl records, breeding activity, incubation batches, health care, team work, tasks, and sales or ownership transfers.

The app starts on the Dashboard. From there, users can open seven main modules:

- Flock
- Breeding
- Eggs & Incubation
- Health & Care
- Tasks
- Team
- Sales

Most screens follow the same pattern:

- A visual header with the farm name and context.
- Summary cards showing important counts.
- Search or filter controls.
- A list of records.
- Detail screens for deeper record management.
- Add or edit forms for creating new records.

## Dashboard

The Dashboard is the central hub for all management tools.

Users can see:

- Farm name, location, and established year.
- Quick stats for active birds, records needing attention, and tasks due.
- The seven management modules.
- Recent activity across health, incubation, and tasks.
- A settings button for farm and module defaults.

Primary actions:

- Open Flock from the Active Birds stat or Flock module card.
- Open Needs Attention from the attention stat.
- Open Tasks from the task stat.
- Open any management module from its card.
- Open Management Settings from the settings icon.

## Management Settings

Management Settings controls farm profile information, module defaults, notifications, and record tools.

Users can manage:

- Farm Profile: farm name, location, and established year.
- General defaults: temperature unit and weight unit.
- Bird & Flock defaults: inactive bird visibility, care review interval, and bird ID prefix.
- Breeding defaults: first egg tracking, pairing reminders, and egg holding limit.
- Health & Care defaults: treatment note requirements, routine health review interval, and vaccination notice timing.
- Eggs & Incubation defaults: incubation cycle length, candling day, recommended temperature, lockdown humidity, and default incubator.
- Tasks defaults: daily summary, assignee requirement, default priority, and repeat behavior.
- Team & Access defaults: approval requirement and default new member role.
- Notifications: health alerts, task reminders, incubation alerts, and vaccination reminders.
- Data & Records: export farm records and review archived records.

Saving settings returns the user to the Dashboard.

## Flock

The Flock screen is the main bird inventory.

Users can see:

- Total bird count.
- Bird filters for all birds, cocks, hens, stags, and pullets.
- Search by bird name, bloodline, or FarmBuzz ID.
- Bird cards showing name, bird type, bloodline, FarmBuzz ID, image, and health/status label.

Primary actions:

- Add a bird.
- Open a bird profile.
- Filter the flock by type.
- Search for a specific bird.

## Add Or Edit Bird

The Add Bird screen creates a new flock record. The same screen is also used to edit an existing bird.

Users can enter or update:

- Bird type, such as cock, hen, stag, or pullet.
- Bird name or ring number.
- Bloodline.
- Hatch date.
- Status and related bird information.

When saved, the bird appears in the Flock list and can be opened as a full Bird Profile.

## Bird Profile

Bird Profile is the main record page for one bird.

Users can see:

- Bird image, name, type, bloodline, and FarmBuzz ID.
- Age and estimated hatch information.
- Current pen or farm location.
- Quick profile sections for deeper records.

Available sections:

- Health & Care
- Breeding Performance, Egg Production, or Egg Production & Breeding depending on bird type
- Pedigree & Bloodline
- Location
- Ownership
- Notes & Observations
- Media
- Documents & Attachments

Primary actions:

- Edit bird details.
- Share a QR profile.
- Archive, mark inactive, or delete through the options menu.
- Open related record sections.

## Pedigree & Bloodline

Pedigree & Bloodline explains the selected bird's family and lineage.

Users can see:

- Bird identity and bloodline.
- Bloodline mix.
- Parent and family information where available.
- Visual lineage-style sections for ancestry review.

This screen is used when checking breeding history, lineage quality, or bloodline records before pairing or sale decisions.

## Bird Health & Care

Bird Health & Care shows health information for one selected bird.

Users can see:

- Health summary for the selected bird.
- Recent health records.
- Treatments.
- Vaccination status.
- Weight history access.

Primary actions:

- Add a health record for the bird.
- Open all health records for the bird.
- Open active treatments.
- Open vaccination management scoped to the bird.
- Open weight history.

## Bird Breeding

Bird Breeding shows breeding or egg production records for one selected bird.

Users can see:

- Pairings connected to the bird.
- Egg records for hens and pullets.
- Fertility and offspring-related information.
- Breeding history and future eligibility context.

Primary actions:

- Open pairing details.
- Open offspring records.
- Add a pairing.
- Record or review egg production where applicable.

## Bird Location

Bird Location manages where a bird is housed.

Users can see:

- Current pen or farm area.
- Available farm locations.
- Movement history.
- Pen details such as enclosure type, capacity, area, and caretaker.

Primary actions:

- Move a bird to another location.
- Add a new pen.
- Choose enclosure type when creating a pen.

## Bird Ownership

Bird Ownership tracks who currently owns a bird and how ownership changed.

Users can see:

- Current owner.
- Owner contact or location.
- Ownership status.
- Transfer history.

Primary actions:

- Record a transfer.
- Mark a bird as transferred, sold, or gifted.
- Add transfer price and notes when relevant.

Sales records can also feed into ownership information.

## Bird Media

Bird Media stores visual records for a bird.

Users can manage:

- Photos.
- Videos.
- Profile or record-related media.

This screen is useful for visual progress tracking, buyer review, condition documentation, and identification.

## Bird Notes & Observations

Bird Notes & Observations stores written notes for a bird.

Users can:

- Add an observation.
- Edit an existing observation.
- Delete a note.
- Mark an observation as important.
- Categorize notes.

This screen is useful for behavior notes, feeding notes, breeding observations, and caretaker updates.

## Bird Documents & Attachments

Bird Documents & Attachments stores supporting files for a bird.

Users can:

- Add attachments.
- View document category, size, date, status, and uploader.
- Open a file.
- Delete an attachment.
- Change document category.

Examples include certificates, ownership paperwork, health records, and supporting documents.

## Breeding

The Breeding screen manages active pairings.

Users can see:

- Active pairs.
- Active sires.
- Active dams.
- Eggs in holding.
- Search by bird name, ring number, bloodline, or pairing ID.
- Pairing cards with sire, dam, bloodlines, pairing ID, status, start date, held eggs, and oldest egg age.

Primary actions:

- Add a pairing.
- Open pairing details.
- Search existing pairings.
- Review pair productivity.

## Add Pairing

The Add Pairing screen creates a breeding pair.

Users can enter:

- Male bird.
- Female bird.
- Pairing type.
- Start date and pairing information.
- Notes.

Saving creates the pairing and returns to the breeding flow.

## Pairing Details

Pairing Details shows one breeding pair in depth.

Users can see:

- Pair ID and status.
- Sire and dam records.
- Bloodline information.
- Egg production metrics.
- Offspring count.
- Pairing activity timeline.
- Notes.

Primary actions:

- Record an egg collection.
- Open offspring records.
- Edit pairing.
- End pairing.

## Offspring

The Offspring screen shows hatch and registration information for chicks produced by a pairing.

Users can see:

- Offspring records tied to a pairing.
- Hatch and registration details.
- Searchable offspring list.

Primary action:

- Register offspring and assign a FarmBuzz ID.

## Eggs & Incubation

Eggs & Incubation manages eggs from holding through active incubation.

Users can see:

- Eggs in holding.
- Active incubation batches.
- Hatching soon count.
- Search across eggs and batches.
- Holding pairs with egg count and oldest egg age.
- Active batch cards with batch ID, egg count, incubation day, and next event.

Primary actions:

- Open Egg Holding.
- Create an incubation batch.
- Open batch details.
- Open incubation history.
- Review eggs ready to set.

## Egg Holding

Egg Holding shows eggs collected from breeding pairs before incubation.

Users can see:

- Holding groups by pair.
- Egg count by pair.
- Oldest egg age.
- Holding history.

Primary actions:

- Add an egg collection.
- Create an incubation batch from held eggs.

## Create Batch

Create Batch starts a new incubation batch.

Users can enter:

- Batch ID.
- Source eggs or pair groups.
- Incubator.
- Start date.
- Handling notes.

Users can also add a new incubator from this flow. Saving confirms the batch creation and returns to incubation.

## Incubation Batch Detail

Incubation Batch Detail tracks one active incubation batch.

Users can see:

- Batch ID.
- Egg count.
- Current incubation day.
- Hatch progress.
- Estimated hatch date.
- Temperature and humidity.
- Incubator assignment.
- Source pairings.
- Stage timeline.
- Notes.

Primary action:

- Open Candling when the batch reaches the candling workflow.

## Candling

Candling records candling results for an incubation batch.

Users can enter:

- Developing eggs.
- Rejected eggs.
- Eggs to recheck.

The screen validates totals against the batch egg count and saves the candling result back to the batch detail screen.

## Incubation History

Incubation History shows completed, hatched, cancelled, or archived incubation batches.

Users can see:

- Past hatch results.
- Archived batch count.
- Hatch performance.
- Result filters.

This screen is used for reviewing outcomes and comparing previous incubation cycles.

## Health & Care

Health & Care is the farm-level health dashboard.

Users can see:

- Birds needing attention.
- Active treatments.
- Vaccinations due.
- Search across birds and health records.
- Attention records.
- Upcoming care.
- Recent health records.
- Shortcuts to Treatments, Vaccinations, and Health History.

Primary actions:

- Add a health record.
- Open Needs Attention.
- Open Active Treatments.
- Open Vaccination Management.
- Open Health Records.

## Add Or Edit Health Record

The Add Health Record screen creates or updates a health record.

Users can enter:

- Bird.
- Record type: Health Check, Injury, Illness, Treatment, Vaccination, or Medication.
- Record date.
- Record title.
- Notes.
- Optional care details.
- Severity: Routine, Monitor, or Urgent.
- Affected area for injuries or illnesses.
- Photo.
- Care provided.
- Follow-up schedule.

Records with Monitor or Urgent severity are included in attention workflows.

## Health Records

Health Records is the searchable health history list.

Users can see:

- Total records.
- Follow-up count.
- Resolved count.
- Search field.
- Record type filter.
- Record status filter.
- Record history ordered newest first.

This screen can show all farm records or records scoped to one bird.

## Health Record Details

Health Record Details explains one clinical or care record.

Users can see:

- Record type.
- Record title.
- Bird name and bloodline.
- Findings or symptoms.
- Care provided.
- Recorded by.
- Affected area.
- Follow-up status.

Primary actions:

- Edit record.
- Mark record resolved.
- Delete health record.

## Active Treatments

Active Treatments tracks medication and treatment plans.

Users can see:

- Active treatment count.
- Treatment filters: Active, Due Today, and Completed.
- Care schedule.
- Treatment history.
- Medication, dosage, caregiver, progress, and next dose.

Primary actions:

- Add or record treatment through health records.
- Mark a dose as completed.
- Open treatment details from a card.

## Vaccination Management

Vaccination Management tracks vaccine schedules and completed doses.

Users can see:

- All vaccination records.
- Due vaccinations.
- Upcoming vaccinations.
- Completed vaccinations.
- Search by bird or vaccine.
- Vaccine name, dose, method, due date, administered date, and status.

Primary actions:

- Record a vaccination.
- Mark a due vaccine as given.
- Open vaccination record details.

Vaccination reminders are included in Health & Care alerts when enabled.

## Weight History

Weight History tracks bird measurements.

Users can see:

- Current weight trend.
- Recent measurements in kilograms.
- Measurement history ordered newest first.

Primary actions:

- Add a weight record.
- Include an optional note with the measurement.

## Needs Attention

Needs Attention is the farm attention center.

Users can see urgent or timely items across:

- Health issues.
- Tasks.
- Vaccinations.
- Incubation events.

Filters include:

- All
- Critical
- Due Today
- Upcoming

This screen helps the farm team decide what needs action first.

## Tasks

Tasks manages daily and recurring farm work.

Users can see:

- Overdue task count.
- Tasks due today.
- Upcoming task count.
- Search across tasks, birds, batches, and locations.
- Filters for Open, Upcoming, and Completed.
- Task cards with title, related subject, category, recurrence, due status, date, and priority.

Primary actions:

- Add a task.
- Open task details.
- Filter tasks by status.
- Search for assigned work.

## Add Or Edit Task

The Add Task screen creates or updates a task.

Users can enter:

- Title.
- Description.
- Related bird, batch, or location.
- Category.
- Due date and time.
- Priority.
- Assigned team member.
- Repeat schedule.
- Reminder setting.

Saving creates the task or updates the existing task detail.

## Task Details

Task Details shows one task in depth.

Users can see:

- Task category.
- Status.
- Task title and ID.
- Assigned member.
- Due date.
- Priority.
- Related record.
- Repeat schedule.
- Reminder state.
- Created by information.
- Activity timeline.

Primary actions:

- Edit task.
- Mark complete.
- Complete today's occurrence for recurring tasks.
- Reopen a completed task.

## Team

Team manages people, farms, shifts, and access.

Users can see:

- Team member count.
- On-duty count.
- Managed farm count.
- Search by person, role, farm, or status.
- Farm selector for All Farms, FarmBuzz Main Farm, Angeles Breeding Farm, and Guagua Hatchery.
- Team member cards with role, farm, shift, duty status, and assigned work.
- Today's coverage by shift.

Primary actions:

- Add a member.
- Open team member details.
- Choose which farm's team to view.
- View schedule placeholder.

## Add Team Member

Add Team Member creates a new staff record.

Users can enter:

- Name.
- Role.
- Farm assignment.
- Shift.
- Contact or related member information.

Roles include Farm Manager, Farm Worker, Flock Care Lead, Breeding Specialist, Poultry Health Aide, and Hatchery Assistant.

Saving adds the member and opens the member detail screen.

## Team Member

Team Member shows one staff member's role, duty status, permissions, and assignments.

Users can see:

- Member ID.
- Name.
- Role.
- Status.
- Role and permissions.
- Current assignments.

Primary action:

- Edit role and permissions.

## Edit Member Access

Edit Member Access updates a team member's role and module permissions.

Users can manage:

- Member role.
- Module access for Flock, Breeding, Eggs & Incubation, Health & Care, Tasks, Team, and Sales.
- Permission levels such as None, View, Edit, or Manage depending on role defaults.

Changing a role applies recommended permissions automatically.

## Sales & Transfers

Sales & Transfers tracks sold birds, ownership transfers, and reservations.

Users can see:

- Birds sold.
- Transfers without sale price.
- Reserved birds.
- Search by sale ID, bird, category, owner, or transaction type.
- Filters for all records, sold records, and transferred records.
- Transaction rows with bird, buyer or new owner, category, date, price, and confirmation status.
- Revenue or transfer breakdown.
- Reservations.
- Quick actions for sold history, new owners, and reservations.

Primary action:

- Open Buy Chicken to record a sale or reservation.

## Buy Chicken

Buy Chicken records a sale or reservation.

Users can enter:

- Chicken being sold or reserved.
- Release type: Get Immediately or Reserve Until Ready.
- Ready or pickup-before date for reservations.
- Buyer name.
- Buyer contact.
- Sale price.
- Notes.

Required fields are chicken, buyer name, and sale price. Immediate purchases become confirmed sales, while reservations stay listed as pending pickups.

## Navigation Map

Dashboard opens:

- Management Settings
- Flock
- Breeding
- Eggs & Incubation
- Health & Care
- Tasks
- Team
- Sales
- Needs Attention

Flock opens:

- Add Bird
- Bird Profile

Bird Profile opens:

- Add/Edit Bird
- Pedigree & Bloodline
- Bird Health & Care
- Bird Breeding
- Bird Location
- Bird Ownership
- Bird Media
- Bird Notes & Observations
- Bird Documents & Attachments

Breeding opens:

- Add Pairing
- Pairing Details
- Offspring

Eggs & Incubation opens:

- Egg Holding
- Create Batch
- Incubation Batch Detail
- Candling
- Incubation History

Health & Care opens:

- Add Health Record
- Health Records
- Health Record Details
- Active Treatments
- Vaccination Management
- Weight History
- Needs Attention

Tasks opens:

- Add Task
- Task Details
- Edit Task

Team opens:

- Add Team Member
- Team Member
- Edit Member Access

Sales opens:

- Buy Chicken
- Bird Ownership records through completed sales and transfers

## Current Data Behavior

The app currently keeps management data in React state during the app session. New birds, pairings, health records, tasks, members, weights, ownership changes, and purchase orders are added to in-memory state and reflected across related screens while the app is running.

Several screens also include sample default data so the management tools can be demonstrated immediately.

## Technical Notes

- Framework: Expo SDK 57 with React Native.
- Entry point: `App.js`.
- Screen files are stored at the project root.
- Shared mock incubation data is in `farmData.js`.
- Shared hero image constants are in `constants.js`.
- Main visual assets are stored in `assets/`.
- The project uses `expo-image`, `expo-linear-gradient`, `expo-status-bar`, `react-native-safe-area-context`, and `@expo/vector-icons`.

