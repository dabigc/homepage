---
title: Teamarr
description: Teamarr Widget Configuration
---

Learn more about [Teamarr](https://github.com/Pharaoh-Labs/teamarr).

Teamarr's API does not require authentication by default, so no credentials are needed. The widget reads `/api/v1/stats/homepage`, `/api/v1/groups` and `/api/v1/stats/runs`, which are available in Teamarr 2.19.0 and later.

```yaml
widget:
  type: teamarr
  url: http://teamarr.host.or.ip:9195
  fields: ["channels", "groups", "lastRun", "runDuration"] # optional
```

## Fields

Allowed fields: `["channels", "groups", "lastRun", "runDuration", "liveNow", "gamesToday"]` (maximum of 4).

Default fields: `["channels", "groups", "lastRun", "runDuration"]`.

`runDuration` is the duration of the most recent run.
