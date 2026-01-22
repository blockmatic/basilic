type NotificationChannel = 'in_app' | 'email'

export interface NotificationType {
  type: string
  channels: NotificationChannel[]
  showInSettings: boolean
  category?: string
  order?: number
}

export const allNotificationTypes: NotificationType[] = [
  {
    type: 'login_notification',
    channels: ['in_app', 'email'],
    showInSettings: true,
    category: 'security',
    order: 1,
  },
  {
    type: 'transactions_created',
    channels: ['in_app', 'email'],
    showInSettings: true,
    category: 'transactions',
    order: 2,
  },
]

// Get all notification types (including hidden ones)
export function getAllNotificationTypes(): NotificationType[] {
  return allNotificationTypes
}

// Get only notification types that should appear in user settings
export function getUserSettingsNotificationTypes(): NotificationType[] {
  return allNotificationTypes.filter(type => type.showInSettings)
}

// Get a specific notification type by its type string
export function getNotificationTypeByType(typeString: string): NotificationType | undefined {
  return allNotificationTypes.find(type => type.type === typeString)
}

// Check if a notification type should appear in settings
export function shouldShowInSettings(typeString: string): boolean {
  const notificationType = getNotificationTypeByType(typeString)
  return notificationType?.showInSettings ?? false
}

// Get notification types grouped by category
export interface NotificationCategory {
  category: string
  order: number
  types: NotificationType[]
}

export function getNotificationTypesByCategory(): NotificationCategory[] {
  const settingsTypes = getUserSettingsNotificationTypes()
  const categoryMap = new Map<string, NotificationCategory>()

  for (const notificationType of settingsTypes) {
    const category = notificationType.category ?? 'other'
    const order = notificationType.order ?? 999

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        order,
        types: [],
      })
    }

    const categoryEntry = categoryMap.get(category)
    if (categoryEntry) {
      categoryEntry.types.push(notificationType)
    }
  }

  // Sort categories by order, then by name
  return Array.from(categoryMap.values()).sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order
    }
    return a.category < b.category ? -1 : a.category > b.category ? 1 : 0
  })
}
