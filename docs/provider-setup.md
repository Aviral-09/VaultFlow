# Provider Credential Setup

This guide explains how to create credentials for the cloud providers supported by VaultFlow.

Keep this guide separate from the main `README.md` so the README stays short while provider-specific setup can stay detailed.

## Redirect URIs used by VaultFlow

Use these callback URLs while running VaultFlow locally:

| Provider | Redirect URI |
| --- | --- |
| Google Drive | `http://localhost:8787/api/accounts/google/callback` |
| OneDrive | `http://localhost:8787/api/accounts/onedrive/callback` |

If you change the API port or deploy the API to another domain, update the redirect URIs in both the provider dashboard and `backend/.env`.

## Environment Variables

Add the credentials to `backend/.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8787/api/accounts/google/callback

ONEDRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_SECRET=
ONEDRIVE_TENANT_ID=common
ONEDRIVE_REDIRECT_URI=http://localhost:8787/api/accounts/onedrive/callback
```

MEGA, pCloud, and S3-compatible services do not use developer credentials in `.env`. MEGA and pCloud connect from the app UI with email/password; S3 services use per-bucket access keys entered directly in the connection form.

## Google Drive

### 1. Open Google Cloud Console

Open:

`https://console.cloud.google.com/`

Sign in with the Google account that will manage the app credentials.

### 2. Create a project

1. Click the project dropdown at the top of the console.
2. Click **New Project**.
3. Name it, for example `VaultFlow Local`.
4. Click **Create**.

### 3. Enable Google Drive API

1. In the sidebar, open **APIs & Services** → **Library**.
2. Search for `Google Drive API`.
3. Select it and click **Enable**.

### 4. Configure OAuth consent screen

1. In the sidebar, open **APIs & Services** → **OAuth consent screen**.
2. For User Type, select **External**, then click **Create**.
3. Fill in the required fields:
   - **App name**: `VaultFlow Local`
   - **User support email**: your email
   - **Developer contact information**: your email
4. Click **Save and Continue**.
5. On the **Scopes** page, click **Add or Remove Scopes**. Add:
   - `.../auth/drive`
6. Save and continue.
7. Under **Test users**, click **Add Users** and enter every Google account that will connect to your local VaultFlow instance.
8. Save and continue.

### 5. Create OAuth credentials

1. In the sidebar, open **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth client ID**.
3. For **Application type**, choose **Web application**.
4. Set the name to `VaultFlow Web Client`.
5. Under **Authorized redirect URIs**, add:

   ```text
   http://localhost:8787/api/accounts/google/callback
   ```

6. Click **Create**.

### 6. Copy values into `.env`

Copy the values into `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8787/api/accounts/google/callback
```

## Microsoft OneDrive

### 1. Open Microsoft Entra admin center

Open:

`https://entra.microsoft.com/`

Sign in with a personal Microsoft account or work/school administrator account.

### 2. Register an application

1. Open **Identity** → **Applications** → **App registrations**.
2. Click **New registration**.
3. Fill in:
   - **Name**: `VaultFlow Local`
   - **Supported account types**: **Accounts in any organizational directory and personal Microsoft accounts (e.g. Skype, Xbox)**
   - **Redirect URI**: choose **Web** and enter:

     ```text
     http://localhost:8787/api/accounts/onedrive/callback
     ```

4. Click **Register**.

### 3. Copy Application (client) ID

In the app **Overview** page:

- Copy **Application (client) ID** into `ONEDRIVE_CLIENT_ID`.

### 4. Create a client secret

1. In the sidebar, click **Certificates & secrets**.
2. Open the **Client secrets** tab and click **New client secret**.
3. Add a description (e.g. `vaultflow-dev`) and pick an expiration.
4. Click **Add**.
5. Immediately copy the **Value** (not Secret ID) into `ONEDRIVE_CLIENT_SECRET`.

### 5. Configure API permissions

1. In the sidebar, click **API permissions**.
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**.
3. Check these permissions:
   - `Files.ReadWrite.All`
   - `offline_access`
   - `User.Read`
4. Click **Add permissions**.

### 6. Copy values into `.env`

```env
ONEDRIVE_CLIENT_ID=your_application_client_id
ONEDRIVE_CLIENT_SECRET=your_client_secret_value
ONEDRIVE_TENANT_ID=common
ONEDRIVE_REDIRECT_URI=http://localhost:8787/api/accounts/onedrive/callback
```

## MEGA

MEGA does not require creating a developer OAuth application for VaultFlow.

### How MEGA connection works

1. Start VaultFlow.
2. Open the dashboard.
3. Click **Connect** → **MEGA**.
4. Enter:
   - MEGA email
   - MEGA password
   - 2FA code if your account uses two-factor authentication
5. Submit the form.

VaultFlow stores the MEGA session and credentials encrypted in the local SQLite database so it can sync and perform file operations securely.

### Notes

- There is no `MEGA_CLIENT_ID` or `MEGA_CLIENT_SECRET` for this implementation.
- Keep your local `.env` and SQLite database private.
- If MEGA returns `EAGAIN`, it means MEGA is temporarily busy or unavailable. Try connecting again later.

## What needs OAuth, and what does not

VaultFlow supports two connection styles:

| Provider | OAuth app required? | What you prepare | Where you connect |
| --- | --- | --- | --- |
| Google Drive | Yes (OAuth client in Google Cloud) | Client ID + secret in `.env` or UI | Connect → Google Drive (redirect login) |
| OneDrive | Yes (Entra app registration) | Client ID + secret in `.env` or UI | Connect → OneDrive (redirect login) |
| MEGA | No | Email + password (+ 2FA) | Connect → MEGA (in-app form) |
| pCloud | No | Email + password | Connect → pCloud (in-app form) |
| S3 (R2, B2, Tebi, Storj, iDrive e2, MinIO, any S3 API) | No | Access Key ID + Secret + bucket + endpoint (+ region) | Connect → S3 (in-app form) |

The distinction is between **developer credentials** (register an app once and put keys in `.env` or in the UI) and **end-user credentials** (each user logs in with their own account):

- **Developer credentials:** Google Drive and OneDrive use a redirect OAuth flow.
- **End-user credentials only (no `.env`):** **MEGA** and **pCloud** take the user's email/password directly. **S3 services** take per-bucket access keys in the connect form.

## pCloud

pCloud does not require a developer OAuth application.

### How pCloud connection works

1. Start VaultFlow.
2. Open the dashboard.
3. Click **Connect** → **pCloud**.
4. Enter your pCloud email and password.
5. Submit.

VaultFlow logs in using pCloud's digest auth, stores the resulting auth token (and your credentials, encrypted) so it can re-login automatically when the token expires. Both the US (`api.pcloud.com`) and EU (`eapi.pcloud.com`) regions are detected automatically.

### Notes

- No `PCLOUD_CLIENT_ID` / secret needed.
- If you have 2FA enabled on pCloud, generate an app-specific password or disable 2FA for this login.

## S3-compatible storage (Cloudflare R2, Backblaze B2, Tebi.io, Storj, iDrive e2, MinIO, and more)

All S3-compatible services share a single adapter. None require OAuth — you generate access keys in each provider's console.

The VaultFlow **Connect → S3** form has no provider presets: every field is entered manually, so the same form works with any S3-compatible service. Paste the access keys, bucket, endpoint, and region straight from your provider console.

### Fields in the form

- **Access Key ID** and **Secret Access Key** — generated in the provider console.
- **Bucket Name** — an existing bucket (VaultFlow verifies access with a `HeadBucket` check before saving). Use the exact bucket name from your console; a wrong name returns a clear "bucket not found" error.
- **Region** — type the region for your bucket; defaults to `auto` if left blank.
- **Endpoint** — required. Paste the S3 endpoint URL for your provider (e.g. `https://s3.tebi.io`).
- **Display Name** (optional) — a friendly label shown in the UI.
- **Quota (GB)** (optional) — object storage does not report a quota, so VaultFlow uses this value for allocation math. Defaults to 10 GB if left blank.

### Notes

- The access key needs read + write + list permissions on the bucket.
- For Cloudflare R2, the account ID in the endpoint is found on the R2 overview page.
- For Backblaze B2, the S3 endpoint region must match the region shown for your bucket.
- No `.env` changes are needed for S3 — everything is entered in the form and stored encrypted.

## After editing `.env`

Restart the API server so the new values are loaded:

```text
npm run dev
```

Then open VaultFlow and connect accounts from the dashboard. For the redirect-based providers (Google Drive, OneDrive), you are sent to the provider to authorize and then returned to the dashboard.

## Troubleshooting

### Redirect URI mismatch

If a provider says the redirect URI is invalid, verify that the value in the provider dashboard exactly matches the value in `.env`.

### Missing client secret

For OneDrive, use the client secret **Value**, not the Secret ID.

### Google app is blocked or unavailable

Make sure the OAuth consent screen is configured and that your Google account is added as a test user while the app is in testing mode.

### OneDrive consent fails

Some Microsoft work or school accounts require admin consent. Use a personal Microsoft account or ask the tenant admin to approve the requested permissions.

### MEGA temporary error

`EAGAIN` means the MEGA service is temporarily busy or unavailable. Wait a few moments and try again.
