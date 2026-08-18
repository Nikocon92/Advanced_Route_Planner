class AdvancedRoutePlannerCard extends HTMLElement {
  setConfig(config) {
    const required = [
      "presence_entity",
      "to_work_entity",
      "from_work_entity",
      "to_nursery_entity",
      "from_nursery_entity"
    ];

    const missing = required.filter((key) => !config[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required config: ${missing.join(", ")}`);
    }

    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.content) {
      const card = document.createElement("ha-card");
      card.header = this.config.title || "Advanced Route Planner";
      this.content = document.createElement("div");
      this.content.style.padding = "16px";
      card.appendChild(this.content);
      this.appendChild(card);
    }

    const presenceState = (hass.states[this.config.presence_entity]?.state || "").toLowerCase();
    const workZone = (this.config.work_zone || "work").toLowerCase();
    const isAtWork = presenceState === workZone;

    const primaryEntityId = isAtWork
      ? this.config.to_nursery_entity
      : this.config.to_work_entity;

    const primaryLabel = isAtWork
      ? this.config.to_nursery_label || "Home → Nursery"
      : this.config.to_work_label || "Home → Work";

    const rows = [
      this._routeRow(this.config.to_work_entity, this.config.to_work_label || "Home → Work"),
      this._routeRow(this.config.from_work_entity, this.config.from_work_label || "Work → Home"),
      this._routeRow(this.config.to_nursery_entity, this.config.to_nursery_label || "Home → Nursery"),
      this._routeRow(this.config.from_nursery_entity, this.config.from_nursery_label || "Nursery → Home")
    ].join("");

    this.content.innerHTML = `
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--divider-color);">
        ${this._primaryRoute(primaryEntityId, primaryLabel)}
      </div>
      <div>${rows}</div>
    `;
  }

  _routeRow(entityId, label) {
    const stateObj = this._hass.states[entityId];
    const duration = this._formatDuration(stateObj?.state);
    const route = this._escapeHtml(stateObj?.attributes?.route || "Route details unavailable");
    const safeLabel = this._escapeHtml(label);

    return `
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 600;">${safeLabel}: ${duration}</div>
        <div style="font-size: 0.9em; color: var(--secondary-text-color);">${route}</div>
      </div>
    `;
  }

  _primaryRoute(entityId, label) {
    const stateObj = this._hass.states[entityId];
    const duration = this._formatDuration(stateObj?.state);
    const route = this._escapeHtml(stateObj?.attributes?.route || "Route details unavailable");
    const safeLabel = this._escapeHtml(label);

    return `
      <div style="font-size: 1.05em; font-weight: 700; margin-bottom: 4px;">${safeLabel}</div>
      <div style="font-size: 1.25em; margin-bottom: 4px;">${duration}</div>
      <div style="font-size: 0.9em; color: var(--secondary-text-color);">${route}</div>
    `;
  }

  _formatDuration(value) {
    const numericDuration = Number(value);
    if (Number.isFinite(numericDuration)) {
      return `${numericDuration} min`;
    }
    return this._escapeHtml(String(value ?? "unavailable"));
  }

  _escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  getCardSize() {
    return 4;
  }
}

customElements.define("advanced-route-planner-card", AdvancedRoutePlannerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "advanced-route-planner-card",
  name: "Advanced Route Planner",
  description: "Shows Waze route durations and route plans between home, work, and nursery"
});
