---
title: tofa
description: tofa Media Server Widget Configuration
---

Learn more about [tofa](https://tofa.tv).

Shows the streams currently playing on a tofa media server: title, progress, play or pause state and how each stream is delivered (direct play, direct stream or transcode), in the same layout as the Tautulli widget. Live TV viewers and downloads are not shown.

The widget calls `GET /api/v1/system/activity/now-playing` and needs a tofa API key with the **Read only** scope. A server admin can create one in the tofa web app under Settings, API keys. Keys start with `tofa_` and only work on direct connections to the server (its LAN address or a custom URL), not through tofa's relay.

```yaml
widget:
  type: tofa
  url: http://tofa.host.or.ip:33333
  key: tofa_apikeyapikeyapikey
  enableUser: true # optional, defaults to false
  expandOneStreamToTwoRows: false # optional, defaults to true
```
