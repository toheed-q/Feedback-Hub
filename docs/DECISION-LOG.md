# Feedback Hub — Design Decisions

My notes on the key decisions behind Feedback Hub and the reasoning for each one.

---

## Keeping the existing Next.js setup

**Problem:** The project already had a Next.js 16 + React 19 + Tailwind + shadcn/ui + Prisma
setup in place. Start from scratch or build on it?

**Decision I take:** Build on the existing setup and remove the placeholder code as real
features replace it.

**Why:** The setup already matches the stack I'd choose anyway and it works. Rebuilding it
would only waste time and add risk for no real benefit.

---

## Single workspace instead of multi-tenant

**Problem:** Should the app support multiple separate organizations, or just one?

**Decision I take:** One single workspace — one admin managing all the feedback.

**Why:** The app is for one business owner triaging feedback for their own internal apps.
There's no second organization anywhere in the requirements, so adding multi-tenant isolation
would only make the code heavier and slower to build with no benefit.

---

## Password-protected admin using a proper auth layer

**Problem:** The admin dashboard needs to be password-protected. A single hard-coded password,
or a real login system?

**Decision I take:** A real login using NextAuth (Auth.js) with one admin account. The password
is stored hashed in the database, never in plain text.

**Why:** It still gives the simple "one password to get in" experience that's needed, but does
it securely and cleanly. A plain-text password would be a security risk, and a full multi-user
role system would be overkill for a single admin.

---

## One central "Ticket" as the core of the data

**Problem:** How should the feedback data be structured?

**Decision I take:** A single `Ticket` holds the submission (name, optional email, category,
priority, title, description, status). Admin notes and uploaded screenshots are each stored in
their own table linked to the ticket, so a ticket can have several notes and several screenshots.
Category, priority, and status are fixed lists defined in one place.

**Why:** Every requirement fits neatly onto this shape. Keeping notes and screenshots in their
own tables lets a ticket carry more than one of each cleanly, instead of cramming them into
single fields. Defining the fixed lists in one place means the form, filters, and validation can
never fall out of sync.

---

## Storing screenshots in Supabase Storage

**Problem:** Uploaded screenshots need a reliable place to live.

**Decision I take:** Upload screenshots to Supabase Storage and save only the resulting link on
the ticket.

**Why:** The database is already on Supabase, so its storage is the natural fit with nothing new
to add. Saving files to local disk would not survive a restart and would break in production.

---

## Warning submitters about likely duplicates

**Problem:** Different people often report the same issue in different words, creating duplicate
tickets that waste time and make submitters feel unheard.

**Decision I take:** As someone types the title, quietly check for similar existing tickets and,
if any are found, show them with their current status and let the person confirm whether it's
the same issue or a new one.

**Why:** Stopping a duplicate before it's created is a much better experience than cleaning it up
later — and the submitter gets the reassurance that their issue is already being looked at. The
matching uses the database's own search, so there's nothing extra to depend on.

---

## A consistent, professional design system

**Problem:** The app needs to look polished and feel consistent across every screen, not like a
set of loosely styled pages.

**Decision I take:** Commit to one design system up front: a neutral (zinc) base with a single
indigo/violet accent used for primary actions, links and focus states; Geist as the typeface; an
8-point spacing rhythm with restrained borders instead of heavy shadows; every control built only
from the shadcn/ui component set; full light and dark theme support with proper contrast and
visible focus states. Status and priority colours are defined once and reused everywhere.

**Why:** Consistency is what makes an interface feel professional. Deciding the colours, type,
spacing and components once — and pulling them from shared tokens — means every later screen looks
like part of the same product with no guesswork. Indigo on a neutral base is a modern, trustworthy
SaaS look; supporting dark mode and accessible focus states is expected of a top-tier app.

---

## Building in a clear order

**Problem:** In what order should the features be built?

**Decision I take:** Foundation first (data + shared pieces), then the public submission form,
then the admin login, then the list with search and filters, then the ticket detail with status
updates, notes and delete, then the summary cards, and finally polish.

**Why:** Each step builds on the one before it. The form is the front door and comes before the
admin screens that manage it, and the login has to exist before anything sits behind it. This
keeps every step small and easy to review on its own.
