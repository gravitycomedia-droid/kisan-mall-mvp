// Store locations parsed from store.csv
export interface StoreLocation {
  id: number
  brandId: number
  name: string
  address: string
  city: string
  state: string
  pinCode: string
}

export const STORES: StoreLocation[] = [
  { id: 1, brandId: 1, name: 'NIZAMABAD Branch', address: 'NH 63, Kumar Gali', city: 'Nizamabad', state: 'Telangana', pinCode: '503001' },
  { id: 2, brandId: 1, name: 'Kama Reddy Branch', address: '88CP+F3M Nizam Sagar, X Road', city: 'Kamareddy', state: 'Telangana', pinCode: '503111' },
  { id: 3, brandId: 1, name: 'Medak Branch', address: 'Post Office Rd, Mission Compound, Medak', city: 'Medak', state: 'Telangana', pinCode: '502110' },
  { id: 4, brandId: 1, name: 'Suchitra Branch', address: '9A, Jeedimetla, Green Park Road, Quthbullapur', city: 'Hyderabad', state: 'Telangana', pinCode: '500067' },
  { id: 5, brandId: 1, name: 'Nirmal Branch', address: 'Old Bus Stand Road, Zohra Nagar Colony', city: 'Nirmal', state: 'Telangana', pinCode: '504106' },
  { id: 6, brandId: 1, name: 'Korutla Branch', address: "Padala's PNG Plaza, NH 63, beside Canara Bank, Hajipura", city: 'Korutla', state: 'Telangana', pinCode: '505326' },
  { id: 7, brandId: 1, name: 'Nanded Branch', address: 'Shivaji Nagar, Guru Gobind Singh Ji Rd', city: 'Nanded', state: 'Maharashtra', pinCode: '431602' },
  { id: 8, brandId: 1, name: 'Udgir Branch', address: '63, National Highway, Khatib Colony, Vikas Nagar', city: 'Udgir', state: 'Maharashtra', pinCode: '413517' },
  { id: 9, brandId: 1, name: 'Parbhani Branch', address: 'Anand Nagar', city: 'Parbhani', state: 'Maharashtra', pinCode: '431401' },
  { id: 10, brandId: 1, name: 'Latur Branch', address: 'Dayaram Rd, Gandhi Market, Sawe Wadi', city: 'Latur', state: 'Maharashtra', pinCode: '413512' },
  { id: 11, brandId: 3, name: 'Nizamabad Branch (Brand 3)', address: 'Sh No, 1-10-106, beside Akruthi, Phulong', city: 'Nizamabad', state: 'Telangana', pinCode: '503003' },
  { id: 12, brandId: 2, name: 'Nanded Branch (Brand 2)', address: 'Industrial Estate, Vishnu Nagar, Nanded', city: 'Nanded-Waghala', state: 'Maharashtra', pinCode: '431602' },
]
