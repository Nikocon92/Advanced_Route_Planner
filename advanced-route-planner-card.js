class AdvancedRoutePlannerCard extends HTMLElement {
  setConfig(config) {
    const required = ["presence_entity", "to_work_entity", "to_nursery_entity"];

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
    const workZone = this._getWorkZoneName();
    const isAtWork = presenceState === workZone;

    const primaryEntityId = isAtWork
      ? this.config.to_nursery_entity
      : this.config.to_work_entity;

    const primaryLabel = isAtWork
      ? this.config.to_nursery_label || "Home → Nursery"
      : this.config.to_work_label || "Home → Work";

    this.content.innerHTML = `
      <div>${this._primaryRoute(primaryEntityId, primaryLabel)}</div>
    `;
  }

  _primaryRoute(entityId, label) {
    if (!entityId) {
      return `
        <div style="font-size: 1.05em; font-weight: 700; margin-bottom: 4px;">${this._escapeHtml(label)}</div>
        <div style="font-size: 0.95em; color: var(--secondary-text-color);">Route entity not configured</div>
      `;
    }

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

  _getWorkZoneName() {
    const zoneEntityId = this.config.work_zone_entity;
    if (zoneEntityId && zoneEntityId.startsWith("zone.")) {
      return zoneEntityId.slice("zone.".length).toLowerCase();
    }
    return (this.config.work_zone || "work").toLowerCase();
  }

  static async getConfigElement() {
    return document.createElement("advanced-route-planner-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Advanced Route Planner",
      presence_entity: "",
      work_zone_entity: "zone.work",
      to_work_entity: "",
      to_nursery_entity: "",
      to_work_label: "Home → Work",
      to_nursery_label: "Home → Nursery"
    };
  }

  getCardSize() {
    return 2;
  }
}

class AdvancedRoutePlannerCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._updateFieldValues();
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._rendered) {
      this._updateEntityPickerHass();
    }
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) {
      return;
    }

    if (this._rendered) {
      return;
    }

    this._rendered = true;
    this.innerHTML = `
      <div class="card-config">
        <ha-textfield label="Title" data-config="title"></ha-textfield>
        <ha-entity-picker label="Person entity" data-config="presence_entity"></ha-entity-picker>
        <ha-entity-picker label="Work zone entity" data-config="work_zone_entity"></ha-entity-picker>
        <ha-entity-picker label="To work sensor" data-config="to_work_entity"></ha-entity-picker>
        <ha-entity-picker label="To nursery sensor" data-config="to_nursery_entity"></ha-entity-picker>
        <ha-textfield label="To work label" data-config="to_work_label"></ha-textfield>
        <ha-textfield label="To nursery label" data-config="to_nursery_label"></ha-textfield>
      </div>
    `;

    this._bindEntityPicker("presence_entity", "person");
    this._bindEntityPicker("work_zone_entity", "zone");
    this._bindEntityPicker("to_work_entity", "sensor");
    this._bindEntityPicker("to_nursery_entity", "sensor");
    this._bindTextField("title");
    this._bindTextField("to_work_label");
    this._bindTextField("to_nursery_label");
  }

  _updateEntityPickerHass() {
    if (!this._rendered) {
      return;
    }

    this.querySelectorAll("ha-entity-picker").forEach((field) => {
      field.hass = this._hass;
    });
  }

  _updateFieldValues() {
    if (!this._rendered) {
      return;
    }

    const keys = [
      "title",
      "presence_entity",
      "work_zone_entity",
      "to_work_entity",
      "to_nursery_entity",
      "to_work_label",
      "to_nursery_label"
    ];

    keys.forEach((key) => {
      const field = this.querySelector(`[data-config="${key}"]`);
      if (field) {
        field.value = this._config[key] || "";
      }
    });
  }

  _bindEntityPicker(key, domain) {
    const field = this.querySelector(`ha-entity-picker[data-config="${key}"]`);
    if (!field) {
      return;
    }

    field.hass = this._hass;
    field.includeDomains = [domain];
    field.value = this._config[key] || "";
    field.addEventListener("value-changed", this._onValueChanged);
  }

  _bindTextField(key) {
    const field = this.querySelector(`ha-textfield[data-config="${key}"]`);
    if (!field) {
      return;
    }

    field.value = this._config[key] || "";
    field.addEventListener("change", this._onValueChanged);
  }

  _onValueChanged = (event) => {
    event.stopPropagation();
    const key = event.target.dataset.config;
    if (!key) {
      return;
    }

    const value = event.detail?.value ?? event.target.value ?? "";
    if ((this._config[key] || "") === value) {
      return;
    }

    if (value === "") {
      delete this._config[key];
    } else {
      this._config = {
        ...this._config,
        [key]: value
      };
    }

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config }
    }));
  };
}

if (!customElements.get("advanced-route-planner-card-editor")) {
  customElements.define("advanced-route-planner-card-editor", AdvancedRoutePlannerCardEditor);
}

customElements.define("advanced-route-planner-card", AdvancedRoutePlannerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "advanced-route-planner-card",
  name: "Advanced Route Planner",
  description: "Shows either the work or nursery route based on whether your person is at work"
});
