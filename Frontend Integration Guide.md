# React Front-End Integration Guide

This guide explains how the React client should integrate with the Pulse Integrations API that is documented in `Technical Specification.md`. It focuses on the user journeys for connecting a provider via OAuth, configuring sync behaviour, and operating existing integrations.

---

## Audience & Scope
- Target audience: front-end engineers building the Pulse React application.
- Covers: API access patterns, UI flows, data contracts, notification handling, and error expectations.
- Excludes: back-end implementation details, provider-specific UI copy, or infrastructure provisioning.

---

## Prerequisites
- **API host** – configure `process.env.REACT_APP_API_BASE_URL` (or equivalent) to point to the Pulse Web API.
- **Authentication** – every `/integrations` endpoint requires an authenticated caller. Reuse the existing auth pipeline to inject the `Authorization: Bearer <token>` header on every request.
- **HTTP client** – examples below use [`axios`](https://axios-http.com/) with React Query, but any fetch abstraction that supports interceptors and error mapping is acceptable.
- **Error format** – failed requests return problem payloads from `CustomResults.Problem`:
  ```json
  {
    "type": "https://docs.pulse/errors/integration.notconfigured",
    "title": "Integration.NotConfigured",
    "detail": "Integration must be configured before syncing",
    "traceId": "00-4e8...",
    "metadata": {
      "configurationEndpoint": "/integrations/..."
    }
  }
  ```
  Always log the `traceId`, surface actionable `metadata`, and show friendly copy to the user.

---

## Recommended Client Setup

```ts
// api/integrationsClient.ts
import axios from "axios";

export const integrationsApi = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/integrations`,
  withCredentials: true,
});

integrationsApi.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Pair the client with React Query (TanStack Query) to manage caching and refetches around key mutations.

---

## Lifecycle Overview

| Step | Endpoint | Purpose | Primary UI Surface |
| ---- | -------- | ------- | ------------------ |
| 1 | `GET /integrations` | List integrations for the company | Integrations list, dashboards |
| 2 | `POST /integrations/{type}/connect` | Start OAuth redirect | Provider picker modal/card |
| 3 | `POST /integrations/{type}/callback` | Finalise OAuth exchange | Redirect handler route |
| 4 | `POST /integrations/{integrationId}/configure` | Persist sync preferences | Integration settings form |
| 5 | `POST /integrations/{integrationId}/sync` | Trigger manual sync | Sync controls panel |
| 6 | `POST /integrations/{integrationId}/test` | Validate live connectivity | Troubleshooting sheet |
| 7 | `POST /integrations/{integrationId}/inspect` | Fetch provider capabilities | Mapping/permissions view |
| 8 | `POST /integrations/{integrationId}/reconnect` | Renew tokens for broken link | Token expiry banner |
| 9 | `DELETE /integrations/{integrationId}` | Disconnect & purge credentials | Danger zone |
| 10 | `GET /integrations/sync-jobs` | Inspect recurring Hangfire jobs | Admin/monitoring page |
| 11 | `GET /integrations/{integrationId}` | Fetch a single integration | Detail page refreshes |

Statuses derive from `SharedKernel.Enums.IntegrationStatus`: `Connected`, `Disconnected`, `Error`, `Syncing`. Treat `Syncing` as a transient state and gate manual actions while active.

---

## React Implementation Details

### 1. Listing Integrations

```ts
const useIntegrations = () => {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data } = await integrationsApi.get<IntegrationStatusResponse[]>("/");
      return data;
    },
  });
};
```

Key response fields (`IntegrationStatusResponse`):
- `integrationId` – primary key for downstream calls.
- `status` – drives status badges; map to tokens: `connected` (green), `disconnected` (gray), `error` (red), `syncing` (blue spinner).
- `isTokenExpired` / `needsTokenRefresh` – display reconnect prompts.
- `syncConfiguration` – dictionary persisted from the configuration form; introspect keys such as `syncFrequency`, `dataTypes`, `batchSize`.
- `errorMessage` – last sync failure message; show inline with retry CTA.

Support optional filters (`type`, `status`) when building analytics dashboards: `GET /integrations?type=Stripe&status=Connected`.

### 2. Starting an OAuth Connection

```ts
const startConnection = async (type: IntegrationType) => {
  const { data } = await integrationsApi.post<StartConnectionResult>(`/${type}/connect`);
  sessionStorage.setItem(`integration_state:${type}`, data.state);
  window.location.assign(data.authorizationUrl);
};
```

UI behaviour:
- Disable the CTA while awaiting the response to avoid double-submission.
- If the API returns `Integration.AlreadyExists`, surface `metadata.existingIntegrationId` and direct users to reconnect instead of starting a parallel pending integration.
- When `authorizationUrl` is returned, store the `state` in session storage for callback verification and redirect the browser.

### 3. Handling the OAuth Callback

Implement a dedicated route (e.g., `/integrations/callback/:type`) that parses the provider’s query params.

```ts
const IntegrationCallbackPage = () => {
  const { type } = useParams<{ type: string }>();
  const search = new URLSearchParams(window.location.search);
  const code = search.get("code");
  const state = search.get("state");
  const error = search.get("error");

  useEffect(() => {
    if (!type || !state) {
      toast.error("Missing OAuth state");
      return;
    }

    integrationsApi
      .post<HandleCallbackResult>(`/${type}/callback`, { code, state, error })
      .then(({ data }) => {
        queryClient.invalidateQueries({ queryKey: ["integrations"] });
        if (data.needsConfiguration) navigate(`/integrations/${data.integrationId}/configure`);
        else navigate(`/integrations/${data.integrationId}`);
      })
      .catch(showProblemToast);
  }, [type, code, state, error]);

  return <LoadingScreen message="Finishing connection…" />;
};
```

Considerations:
- Reject the flow if the returned `state` does not match the value saved in session storage (prevent CSRF/shadowed logins).
- The API may respond with `Integration.InvalidState`, `Integration.OAuthError`, or `Integration.ConfigurationMissing`. Display inline copy and link to support docs.
- Use `needsConfiguration` to branch to the configuration form. When false, the integration is ready for immediate syncing.

### 4. Configuring Sync Behaviour

`SyncConfigRequest` fields control scheduling and data scope. Build a form backed by schema validation (e.g., `zod` + `react-hook-form`) that maps to the DTO contract:

```ts
const configureIntegration = ({ integrationId, values }: { integrationId: string; values: SyncConfigFormValues; }) =>
  integrationsApi.post<ConfigureIntegrationResult>(
    `/${integrationId}/configure`,
    {
      syncEnabled: values.syncEnabled,
      syncFrequency: values.syncFrequency,
      dataTypes: values.dataTypes,
      customFields: values.customFields,
      historicalSyncDays: values.historicalSyncDays,
      batchSize: values.batchSize,
    }
  );
```

UI guidance:
- Populate selectable frequencies from `ConfigurationOptions.syncFrequencies` when available (fetch via `POST /integrations/{integrationId}/inspect` or embed from configuration definitions).
- Clamp numeric inputs to the documented ranges: `historicalSyncDays` 1–730, `batchSize` 10–1000.
- Persist `syncEnabled` to toggle auto-sync scheduling. When disabled, show a banner explaining manual sync only.
- After mutation, invalidate both `["integrations"]` and `[ "integrations", integrationId ]` caches.

### 5. Manual Sync

```ts
const triggerSync = (integrationId: string, options?: { incrementalSync?: boolean; syncFromDate?: string; }) =>
  integrationsApi.post<TriggerSyncResult>(`/${integrationId}/sync`, options);
```

UX best practices:
- Disable the sync button and show progress once the request succeeds. The integration enters `Syncing`; polling or notifications (see below) keep the UI current.
- Handle `Integration.SyncInProgress`: show metadata fields (e.g., `status`, `retryAfterSeconds`) in an inline alert with a retry CTA.
- If the API returns `Integration.NotConfigured`, redirect to the configure form using `metadata.configurationEndpoint`.
- After a `SyncCompleted` notification, refetch integration data and surface the metrics returned in the notification payload.

### 6. Notifications

`IntegrationManagementService` emits user-scoped notifications through `INotificationService`:
- `integrations/sync-started`
  ```json
  {
    "integrationId": "…",
    "requestedAt": "2025-10-23T10:24:00Z",
    "incrementalSync": true,
    "syncFromDate": "2025-10-01T00:00:00Z"
  }
  ```
- `integrations/sync-completed`
  ```json
  {
    "integrationId": "…",
    "startTime": "2025-10-23T10:24:01Z",
    "endTime": "2025-10-23T10:24:06Z",
    "totalRecords": 540,
    "processedRecords": 520,
    "errorRecords": 20
  }
  ```
- `integrations/sync-failed`
  ```json
  {
    "integrationId": "…",
    "error": "Provider rate limit exceeded",
    "failedAt": "2025-10-23T10:24:03Z"
  }
  ```

Hook into the existing real-time channel (SignalR/WebSocket client) and register listeners for these event types. Update local caches (`queryClient.invalidateQueries`), append entries to an activity timeline, and surface toast messages.

### 7. Monitoring Jobs

`GET /integrations/sync-jobs` returns Hangfire job metadata:
- Use it for an admin “Sync Schedule” screen.
- Display `lastExecution`, `nextExecution`, and `isProcessing` for each integration.
- Provide filters by `integrationId` for detailed diagnostics.

### 8. Testing & Inspection
- `POST /integrations/{integrationId}/test` – show connectivity result, token expiration, and refresh eligibility. Use this on troubleshooting popovers.
- `POST /integrations/{integrationId}/inspect` – populate capability tables with `DataTypeCapability` (supported, missing scopes) and recommended field mappings. Highlight any `missingScopes` the admin must add in the provider UI before syncing.

### 9. Reconnection & Disconnection
- When `isTokenExpired` or `needsTokenRefresh` is true, show a persistent reconnect banner. Calling `POST /{integrationId}/reconnect` returns a new authorization URL; follow the same redirect flow as initial connection.
- `DELETE /{integrationId}` should gate behind a confirmation modal. After success, remove the integration from local state and show guidance on how to reconnect later.

---

## Error Handling Cheat-Sheet

| Code | Scenario | Suggested UX |
| ---- | -------- | ------------ |
| `Integration.AlreadyExists` | User tries to connect a provider that is already active | Inline warning with “Reconnect” CTA using `metadata.existingIntegrationId` |
| `Integration.ConfigurationMissing` | Missing server-side OAuth/config keys | Display “Contact support” with list of `metadata.requiredKeys` |
| `Integration.InvalidState` | OAuth state mismatch (likely stale tab) | Inform user and offer to restart connection |
| `Integration.NotConfigured` | Manual sync requested before configuration | Redirect to configure form using `metadata.configurationEndpoint` |
| `Integration.SyncInProgress` | Concurrent sync attempt | Show status, disable controls until `Syncing` clears |
| `Integration.SyncFailed` | Provider or infrastructure failure | Surface `detail`, log `traceId`, offer retry |
| `UserErrors.UserNotInCompany` | Authenticated user lacks company context | Force logout or prompt to switch workspace |

Always prefer human-readable copy in the UI while logging structured errors for support.

---

## Sample TypeScript Interfaces

```ts
export interface IntegrationStatusResponse {
  integrationId: string;
  type: string;
  name: string;
  status: "Connected" | "Disconnected" | "Error" | "Syncing";
  connectedAt?: string;
  lastSyncAt?: string;
  nextSyncAt?: string;
  syncedRecordCount: number;
  errorMessage?: string;
  isTokenExpired: boolean;
  needsTokenRefresh: boolean;
  syncConfiguration?: Record<string, unknown>;
}

export interface StartConnectionResult {
  authorizationUrl: string;
  state: string;
  existingIntegrationId?: string;
}

export interface HandleCallbackResult {
  integrationId: string;
  status: string;
  message: string;
  needsConfiguration: boolean;
}
```

Keep these types in sync with the DTOs under `DataTransferObjects/Integrations`.

---

## Testing Checklist
- Verify each provider flow against both happy path and error scenarios (expired state, duplicate integration, missing scopes).
- Exercise configuration validation (min/max ranges) via unit tests for the form schema.
- Mock notification events in Storybook or integration tests to ensure UI reacts correctly to `sync-started/completed/failed`.
- Use Cypress or Playwright to cover the end-to-end journey: list → connect → callback → configure → manual sync → disconnect.

---

## Maintenance Tips
- When new providers or integration types are added (see `SharedKernel.Enums.IntegrationType`), update the provider picker and copy decks.
- Surface `NextSyncAt` and schedule details prominently so admins understand cadence.
- Keep UX copy aligned with the error codes documented above; update this guide whenever the API adds new problem metadata or endpoints.
