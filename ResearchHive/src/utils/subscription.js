const SUBSCRIPTION_STORAGE_KEY = 'rh_subscription'

export function getSubscription() {
  try {
    const subscription = JSON.parse(
      localStorage.getItem(SUBSCRIPTION_STORAGE_KEY) || 'null'
    )
    if (subscription?.plan === 'pro' && subscription.status === 'active') {
      return subscription
    }
  } catch (error) {
    console.error('Could not read the saved ResearchHive plan.', error)
  }

  return { plan: 'free', status: 'inactive' }
}

export function activateDemoProPlan() {
  const subscription = {
    plan: 'pro',
    status: 'active',
    billingCycle: 'monthly',
    activatedAt: new Date().toISOString(),
    paymentMode: 'demo',
  }
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription))
  return subscription
}

export function resetDemoProPlan() {
  localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
}
