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

## Lovelace usage

1. Add `advanced-route-planner-card.js` as a dashboard resource.
2. Configure the card with your entities.

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
