Req flow:
Route → Controller → Service → Model → DB

## Create the first admin user

The first admin is created using the bootstrap user flow in the server identity module.

### 1. Set the bootstrap token environment variable

In your server environment, define:

- `BOOTSTRAP_USER_TOKEN` — any secret value you choose.

Example:

```bash
export BOOTSTRAP_USER_TOKEN=your-secret-bootstrap-token
```

On Windows PowerShell:

```powershell
$env:BOOTSTRAP_USER_TOKEN = 'your-secret-bootstrap-token'
```

### 2. Call the bootstrap endpoint

Send a POST request to:

`POST /api/identity/users/bootstrap`

Headers:

- `x-bootstrap-token: your-secret-bootstrap-token`
- `Content-Type: application/json`

Body:

```json
{
  "email": "admin@example.com",
  "name": "First Admin",
  "password": "your-strong-password"
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/identity/users/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: 74dbaaede00fd474578ff75a96b22e07a4c6ed26594f426b2dfb2ddcb208d1e7" \
  -d '{"email":"odayibrahimdev@gmail.com","name":"First Admin","password":"12345678"}'
```

### 3. What this does

- Creates the first admin user in the `users` collection
- Sets `roles` to `['superadmin', 'admin']`
- Marks the account as active
- Returns a session token if successful

### 4. Important notes

- Bootstrap only works once if there are no existing users.
- If a user already exists, the endpoint returns `Bootstrap already completed`.
- After bootstrap, use the normal admin user invitation flow to create additional team users.
