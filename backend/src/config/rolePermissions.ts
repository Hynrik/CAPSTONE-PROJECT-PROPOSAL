export const rolePermissions: Record<string, string[]> = {
  admin: [
    // dashboard
    "dashboard.view",

    // payments (READ + UPDATE ONLY)
    "payments.view",
    "payments.update",
    "payments.create",

    // members (VIEW ONLY)
    "members.view",
    "members.update",

    // analytics
    "analytics.view",

    // funeral assistance
    "funeral.view"
  ],

  superadmin: [
    // dashboard
    "dashboard.view",

    // payments (FULL CONTROL)
    "payments.view",
    "payments.update",
    "payments.delete",
    "payments.create",

    // members (FULL CONTROL)
    "members.view",
    "members.manage",

    // analytics
    "analytics.view",

    // funeral assistance
    "funeral.view",

    // admin management
    "users.manage",

    // system logs
    "logs.view"
  ]
};