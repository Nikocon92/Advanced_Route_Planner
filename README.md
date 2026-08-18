# Advanced Route Planner

Home Assistant Lovelace custom card to display Waze travel duration and route details for home/work/nursery trips.

## What it does

- Shows duration + route attribute from Waze entities.
- Displays routes:
  - Home → Work
  - Work → Home
  - Home → Nursery
  - Nursery → Home
- Automatically highlights:
  - **Route to Work** when your presence entity is **not** at work
  - **Route to Nursery** when your presence entity **is** at work

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

Configure the card with your entities.

```yaml
type: custom:advanced-route-planner-card
title: Commute Planner
presence_entity: person.your_name
work_zone: work
to_work_entity: sensor.home_to_work
from_work_entity: sensor.work_to_home
to_nursery_entity: sensor.home_to_nursery
from_nursery_entity: sensor.nursery_to_home
```

### Notes

- `presence_entity` should be an entity whose state becomes `work` when you are at work (for example a `person.*` entity).
- `work_zone` defaults to `work`.
- The route text is read from each Waze entity's `route` attribute.
