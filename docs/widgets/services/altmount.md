---
title: AltMount
description: AltMount Widget Configuration
---

Learn more about [AltMount](https://github.com/kipsilabs/altmount).

The widget reads AltMount's import queue, download speed and library health stats. Provide the AltMount username and password; they can be omitted if login is disabled in AltMount.

```yaml
widget:
  type: altmount
  url: http://altmount.host.or.ip:8080
  username: username # optional if login is disabled
  password: password # optional if login is disabled
  fields: ["queue", "speed", "healthy", "corrupted"] # optional
```

## Fields

Allowed fields: `["queue", "speed", "failed", "healthy", "pending", "degraded", "corrupted", "repairing"]` (maximum of 4).

Default fields: `["queue", "speed", "healthy", "corrupted"]`.

- `queue`: NZBs queued or processing.
- `speed`: current download speed across all providers.
- `failed`: failed imports.
- `healthy`, `pending`, `degraded`, `corrupted`: files in each library health state (`pending` includes files being checked).
- `repairing`: files with a repair triggered in the arr apps.
