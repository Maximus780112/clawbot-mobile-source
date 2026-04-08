import { html } from "lit";
import { t } from "../../i18n/index.ts";
import type { AppViewState } from "../app-view-state.ts";
import { icons } from "../icons.ts";
import { normalizeBasePath } from "../navigation.ts";
import { agentLogoUrl } from "./agents-utils.ts";

export function renderLoginGate(state: AppViewState) {
  const basePath = normalizeBasePath(state.basePath ?? "");
  const faviconSrc = agentLogoUrl(basePath);
  const forcedUrl = "wss://clawbot.ch";

  if (typeof window !== "undefined") {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const hashToken = hashParams.get("token") ?? "";
    const savedToken = window.localStorage.getItem("clawbot.gatewayToken") ?? "";
    const bootToken = hashToken || savedToken || state.settings.token || "";

    if (state.settings.gatewayUrl !== forcedUrl || state.settings.token !== bootToken) {
      state.applySettings({
        ...state.settings,
        gatewayUrl: forcedUrl,
        token: bootToken,
      });
    }
  }

  return html`
    <div class="login-gate">
      <div class="login-gate__card">
        <div class="login-gate__header">
          <img class="login-gate__logo" src=${faviconSrc} alt="Clawbot" />
          <div class="login-gate__title">Clawbot</div>
          <div class="login-gate__sub">${t("login.subtitle")}</div>
        </div>

        <div class="login-gate__form">
          <label class="field">
            <span>${t("overview.access.wsUrl")}</span>
            <input .value=${forcedUrl} placeholder="wss://clawbot.ch" readonly />
          </label>

          <label class="field">
            <span>${t("overview.access.token")}</span>
            <div class="login-gate__secret-row">
              <input
                type=${state.loginShowGatewayToken ? "text" : "password"}
                autocomplete="off"
                spellcheck="false"
                .value=${state.settings.token}
                @input=${(e: Event) => {
                  const v = (e.target as HTMLInputElement).value;
                  window.localStorage.setItem("clawbot.gatewayToken", v);
                  state.applySettings({ ...state.settings, gatewayUrl: forcedUrl, token: v });
                }}
                placeholder="Enter token once"
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === "Enter") {
                    const v = (e.target as HTMLInputElement).value;
                    window.localStorage.setItem("clawbot.gatewayToken", v);
                    state.applySettings({ ...state.settings, gatewayUrl: forcedUrl, token: v });
                    state.connect();
                  }
                }}
              />
              <button
                type="button"
                class="btn btn--icon ${state.loginShowGatewayToken ? "active" : ""}"
                title=${state.loginShowGatewayToken ? "Hide token" : "Show token"}
                aria-label="Toggle token visibility"
                aria-pressed=${state.loginShowGatewayToken}
                @click=${() => {
                  state.loginShowGatewayToken = !state.loginShowGatewayToken;
                }}
              >
                ${state.loginShowGatewayToken ? icons.eye : icons.eyeOff}
              </button>
            </div>
          </label>

          <button
            class="btn primary login-gate__connect"
            @click=${() => {
              window.localStorage.setItem("clawbot.gatewayToken", state.settings.token);
              state.applySettings({
                ...state.settings,
                gatewayUrl: forcedUrl,
                token: state.settings.token,
              });
              state.connect();
            }}
          >
            ${t("common.connect")}
          </button>
        </div>

        ${state.lastError
          ? html`<div class="callout danger" style="margin-top: 14px;">
              <div>${state.lastError}</div>
            </div>`
          : ""}
      </div>
    </div>
  `;
}
