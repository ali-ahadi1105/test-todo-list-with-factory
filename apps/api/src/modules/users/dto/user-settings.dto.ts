import { z } from 'zod';

export const updateUserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  timezone: z.string().optional(), // IANA timezone string, e.g., 'America/New_York'
});

export type UpdateUserSettingsDto = z.infer<typeof updateUserSettingsSchema>;

export const userSettingsResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  theme: z.enum(['light', 'dark', 'system']),
  notificationsEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  timezone: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserSettingsResponse = z.infer<typeof userSettingsResponseSchema>;
