# Advanced Route Planner

Home Assistant Lovelace custom card to display Waze travel duration and route details for work/nursery trips.

## What it does

- Shows duration + route attribute from Waze entities.
- Shows only one route at a time:
  - **To Nursery** when the selected person is at the selected work zone (for example `person.nick` at `zone.work`)
  - **To Work** when the selected person is not at the selected work zone
- Includes a visual Lovelace editor with selectable `person.*`, `zone.*`, and `sensor.*` entities.

## Installation

### Via HACS (recommended)

1. Open HACS in your Home Assistant instance.
2. Go to **Frontend**.
3. Click the **⋮** menu → **Custom repositories**.
4. Add `https://github.com/Nikocon92/Advanced_Route_Planner` with category **Dashboard**.
5. Search for **Advanced Route Planner** and click **Download**.
6. Reload your browser.

### Manual

1. Copy `advanced-route-planner-card.js` to your `www/` folder.
2. Add it as a dashboard resource:
   - **URL:** `/local/advanced-route-planner-card.js`
   - **Type:** JavaScript module

## Lovelace usage

Configure the card with your entities (YAML or visual editor).

```yaml
type: custom:advanced-route-planner-card
title: Commute Planner
presence_entity: person.nick
work_zone_entity: zone.work
to_work_entity: sensor.nick_to_work
to_nursery_entity: sensor.nick_to_nursery
to_work_label: Nick → Work
to_nursery_label: Nick → Nursery
```

### Notes

- `presence_entity` should be a `person.*` entity (for example `person.nick`).
- `work_zone_entity` should be a `zone.*` entity (for example `zone.work`).  
  The card compares `person` state to the selected zone name.
- `work_zone` is still supported for backward compatibility and defaults to `work`.
- The route text is read from each Waze entity's `route` attribute.
