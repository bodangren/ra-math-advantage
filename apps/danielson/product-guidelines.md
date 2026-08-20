# Danielson Product Guidelines

## Evidence and Trust

- Show the source and status of each administrative fact.
- Use clear denial messages. Do not expose private record details in an error.
- Do not infer Danielson proficiency from account or role data.
- Do not use system-administrator access as evaluation access.

## Access

- Get the actor identity from the verified server session.
- Get the actor account, organization, roles, and assignments from current
  server data.
- Do not authorize from the role or organization claims in the session token.
- Apply a grant or revocation on the next protected request.
- Deny cross-organization access.
- Deny evaluation writes when the actor is the subject teacher.
- Deny private leadership reads when the actor is the subject teacher.

## Interface

- Use short labels and direct instructions.
- Show only actions that the current role can use.
- Keep the server as the source of each permission decision.
- Keep each administration form focused on one task.
- Confirm destructive account deactivation before submission.
- Preserve data when an account is deactivated.
- Put a visible text label on each form control.
- Show keyboard focus on every interactive control.
- Use status text with color. Do not use color as the only status signal.

## Content

- Use `teacher` for the person whose proficiency is evaluated.
- Use `supervisor` for HOD, coach, school head, and SLT roles.
- Use `system administrator` for account administration.
- Define each abbreviation when it first occurs on a page.
- Keep private leadership content out of teacher-facing response shapes.
