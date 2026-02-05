# Admin Account Credentials

## Default Administrator Account

**IMPORTANT: Change this password immediately after first login!**

### Credentials

- **Username:** `admin`
- **Password:** `Admin123!`
- **Role:** Administrator (full access)
- **User ID:** `usr_admin_real`

### First Login Steps

1. Navigate to the login page
2. Enter credentials above
3. After successful login, go to Account Settings
4. Change your password immediately
5. Update your profile information

### Login Endpoints

**Production:**
```bash
POST https://guild-management.na-infini.workers.dev/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "usr_admin_real",
      "username": "admin",
      "role": "admin",
      "power": 99999
    },
    "sessionId": "ses_..."
  }
}
```

### Admin Capabilities

As an administrator, you have access to:

✅ **User Management**
- Create, update, delete users
- Assign roles (member, moderator, admin)
- Adjust power levels
- View and edit member profiles
- Add admin notes to members

✅ **Content Management**
- Create, edit, archive announcements
- Pin/unpin announcements
- Schedule and manage events
- Lock/unlock event signups

✅ **War Management**
- Create and assign teams
- Record war history and statistics
- Input individual member performance data
- Generate analytics reports

✅ **Media Management**
- Upload images to gallery
- Moderate gallery submissions
- Manage featured images

✅ **System Oversight**
- View audit logs
- Track all administrative actions
- Monitor system health
- Access API key management

### Security Notes

⚠️ **Important Security Practices:**

1. **Change Default Password:** The default password is publicly known in this repository
2. **Use Strong Password:** Minimum 8 characters with uppercase, lowercase, numbers, and symbols
3. **Secure Session:** Always logout when using shared computers
4. **Regular Audits:** Review audit logs regularly for suspicious activity
5. **Principle of Least Privilege:** Create separate moderator accounts for team leads

### Password Recovery

If you forget your password after changing it:

1. Contact the system administrator
2. Or manually reset via database:

```bash
# Generate new password hash
node scripts/generate-admin-password.js

# Update database with new hash
npx wrangler d1 execute testdatabase --remote --command="
UPDATE user_auth_password
SET password_hash = 'NEW_HASH',
    salt = 'NEW_SALT',
    updated_at_utc = datetime('now')
WHERE user_id = 'usr_admin_real';
"
```

### Creating Additional Admin Accounts

To create another admin account, use the signup endpoint to create a regular account, then promote:

```bash
# 1. User signs up normally
POST /api/auth/signup

# 2. Admin promotes to admin role via database
npx wrangler d1 execute testdatabase --remote --command="
UPDATE users
SET role = 'admin',
    power = 95000,
    updated_at_utc = datetime('now')
WHERE username = 'new_admin_username';
"
```

Or use the admin panel's user management interface once it's implemented.

---

**Migration File:** `D1 schema/migrations/0002_create_admin_account.sql`
**Password Generator:** `scripts/generate-admin-password.js`
