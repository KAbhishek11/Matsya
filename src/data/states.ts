// States that have an official state fish. `mapId` matches the location ids in @svg-maps/india.
export type Region = 'North' | 'Northeast' | 'East' | 'West' | 'South' | 'Central'

export interface StateInfo {
  id: string
  name: string
  mapId: string
  region: Region
}

export const STATES: StateInfo[] = [
  { id: 'ap', name: 'Andhra Pradesh', mapId: 'ap', region: 'South' },
  { id: 'ar', name: 'Arunachal Pradesh', mapId: 'ar', region: 'Northeast' },
  { id: 'br', name: 'Bihar', mapId: 'br', region: 'East' },
  { id: 'ga', name: 'Goa', mapId: 'ga', region: 'West' },
  { id: 'gj', name: 'Gujarat', mapId: 'gj', region: 'West' },
  { id: 'hr', name: 'Haryana', mapId: 'hr', region: 'North' },
  { id: 'hp', name: 'Himachal Pradesh', mapId: 'hp', region: 'North' },
  { id: 'jk', name: 'Jammu & Kashmir', mapId: 'jk', region: 'North' },
  { id: 'jh', name: 'Jharkhand', mapId: 'jh', region: 'East' },
  { id: 'ka', name: 'Karnataka', mapId: 'ka', region: 'South' },
  { id: 'kl', name: 'Kerala', mapId: 'kl', region: 'South' },
  { id: 'mp', name: 'Madhya Pradesh', mapId: 'mp', region: 'Central' },
  { id: 'mh', name: 'Maharashtra', mapId: 'mh', region: 'West' },
  { id: 'mn', name: 'Manipur', mapId: 'mn', region: 'Northeast' },
  { id: 'ml', name: 'Meghalaya', mapId: 'ml', region: 'Northeast' },
  { id: 'mz', name: 'Mizoram', mapId: 'mz', region: 'Northeast' },
  { id: 'nl', name: 'Nagaland', mapId: 'nl', region: 'Northeast' },
  { id: 'or', name: 'Odisha', mapId: 'or', region: 'East' },
  { id: 'pb', name: 'Punjab', mapId: 'pb', region: 'North' },
  { id: 'sk', name: 'Sikkim', mapId: 'sk', region: 'Northeast' },
  { id: 'tg', name: 'Telangana', mapId: 'tg', region: 'South' },
  { id: 'tr', name: 'Tripura', mapId: 'tr', region: 'Northeast' },
  { id: 'up', name: 'Uttar Pradesh', mapId: 'up', region: 'North' },
  { id: 'ut', name: 'Uttarakhand', mapId: 'ut', region: 'North' },
  { id: 'wb', name: 'West Bengal', mapId: 'wb', region: 'East' },
]

export const STATE_BY_ID: Record<string, StateInfo> = Object.fromEntries(STATES.map((s) => [s.id, s]))
