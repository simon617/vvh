# PRD: Vision Values Website Revamp

## Background

Vision Values Holdings Limited maintains a corporate website at `visionvalues.com.hk` that currently has an outdated layout and limited mobile support. The site needs a modern redesign that preserves all current features, while making content editable and report updates easy for non-technical users.

## Problem Statement

The existing site looks dated and is not optimized for mobile devices. Content changes and report updates are difficult for the business to manage, and the site does not provide a modern, polished experience for English and Traditional Chinese visitors.

## Objectives

- Modernize the website design with clean layout, updated typography, and contemporary visual language.
- Provide a responsive mobile-first experience that works well on phones and tablets.
- Preserve all existing website content and sections.
- Enable administrators to update any website content without developer involvement.
- Allow Business users to add, edit, and publish documents for:
    - Financial Reports
    - Environmental, Social and Governance (ESG) Reports
- Support both English and Traditional Chinese languages with easy translation management.
- All page content and information on existing website should appear on the revamp website.

## Success Metrics

- Launch a responsive website with at least 90% page usability score on mobile devices.
- Reduce content update turnaround time to under 10 minutes for non-technical users.
- Achieve a content edit workflow that requires no code changes for text, images, links, and report files.
- Support bilingual content consistently across the site.
- Maintain or improve current feature set and navigation structure.

## Target Audience

- Institutional investors and shareholders
- Financial analysts and advisors
- ESG stakeholders and regulators
- Company employees and partners
- Hong Kong audience preferring Traditional Chinese and English readers

## Scope

### Included

- Full redesign of existing website pages and navigation structure.
- Responsive layout and mobile optimization.
- Self-hosted website with a CMS-style admin interface and built-in admin login on the same website.
- Fixed page templates with editable section fields for each content page.
- Report management for Financial Reports and ESG Reports sections.
- Bilingual site support: English and Traditional Chinese.
- Accessible design with clear typography, spacing, and readability.
- Retain every existing page and section exactly as-is.
- Admin interface for content updates, images, downloadable reports, and metadata.

### Out of Scope

- Adding a third language beyond English and Traditional Chinese.
- Complex investor portals, login systems, or private user accounts.
- Full marketing automation or e-commerce capabilities.
- Major brand refresh beyond modernizing layout, typography, and visual polish.

## Requirements

### Functional Requirements

1. Content Editing

- Admins can edit page text, headings, links, button labels, and images.
- Admins access the CMS through a secure built-in login on the same website.
- The system begins with a single admin account for content management.
- The admin account is created during deployment through an initial setup step.
- Content fields are localized for both English and Traditional Chinese.
- Changes go live immediately after saving.

2. Reports Management

- Financial Reports section supports upload, remove, and reorder of report documents.
- ESG Reports section supports upload, remove, and reorder of report documents.
- Only PDF documents are supported for report uploads.
- Each report item includes title, year/period, description, language, and downloadable file link.
- Users can mark reports as visible or hidden.

3. Website Structure

- Preserve the current navigation and section structure exactly.
- Homepage, corporate profile, investor information, reports, contact, and other existing page categories remain available.
- Preserve existing page URLs where possible; light URL normalization is acceptable if all old URLs are redirected to the matching new pages.
- Support clear page-level metadata and breadcrumb navigation if needed.

4. Localization

- UI labels, navigation, and content are available in both English and Traditional Chinese.
- Language switcher is prominent and easy to use.
- Content editing workflow supports separate translations for each text block.

5. Mobile Experience

- All pages are fully responsive and maintain usability on standard mobile screen sizes.
- Navigation collapses to a mobile menu.
- Buttons, links, and touch targets meet mobile accessibility guidelines.

### Non-functional Requirements

- Visual design should feel modern, professional, and corporate.
- Page performance should be optimized for both desktop and mobile.
- The site should be easy to maintain and deploy.
- Content management should minimize developer dependency.

## Design Principles

- Mobile-first responsive design.
- Clear visual hierarchy, spacing, and readable typography.
- Minimal, corporate-friendly aesthetics with strong emphasis on clarity.
- Consistent bilingual layout and language switching.
- Accessible navigation and interactions.

## Implementation Notes

- Implement this as a self-hosted editable website with a secure built-in admin login and web-based CMS UI on the same website.
- Start with a single admin account for content management.
- The admin account is created during deployment via a one-time setup prompt for username and password.
- Use fixed page templates with editable section fields to keep the CMS simple and maintainable.
- Prefer a content-focused CMS or static site generator with editable content if the user needs full control.
- Use a theme or component system that supports bilingual content and responsive design.
- Keep the data model for reports simple: title, language, date, description, file, visibility.
- Ensure the Financial Reports and ESG Reports pages are easy to manage separately.

## Risks and Mitigations

- Risk: Rebuilding content management without clear content structure. Mitigation: Audit existing website pages and map each section before redesign.
- Risk: Translating content inconsistently. Mitigation: Build a bilingual content model and require both languages for published pages.
- Risk: Losing current features during redesign. Mitigation: Preserve the exact page structure and content sections in the specification.

## Next Steps

1. Review the current website content and sitemap to confirm all sections and features.
2. Define the page inventory and existing content blocks for migration.
3. Choose the implementation approach (CMS, headless CMS, or static site framework).
4. Design high-fidelity page templates for desktop and mobile.
5. Build the editable site and test report upload workflows.
