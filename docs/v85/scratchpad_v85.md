# V8.5 Plan — Stripe Real + Jobs + Truth

## Stripe Integration Scope
We implement Stripe integration as an **optional provider**. If STRIPE_SECRET_KEY is set, billing is real. If not, manual mode continues working.

### Events to handle
- checkout.session.completed → activate subscription
- customer.subscription.updated → sync status (active, past_due, canceled)
- customer.subscription.deleted → mark expired
- invoice.paid → record BillingInvoice PAID
- invoice.payment_failed → mark PAST_DUE

### Webhook Security
- Verify Stripe signature with STRIPE_WEBHOOK_SECRET
- Deduplicate via BillingEvent (source=WEBHOOK, externalEventId=event.id)

### Tenant mapping
- TenantSubscription.providerCustomerId = Stripe customer ID
- TenantSubscription.providerSubscriptionId = Stripe subscription ID

## Jobs
- Export: keep synchronous (low volume). Mark as V9 deferral if needed.
- Outbound: already cron-automated (V8).

## Truth cleanup
- resolveCustomer() already exists. New deliveries should prefer customerId.
- resolvePlan() already exists. Stripe webhook updates TenantSubscription as truth.
- Tenant.planCode synced as cache only from webhook handler.
