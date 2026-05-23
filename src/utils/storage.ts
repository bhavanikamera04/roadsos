import type { EmergencyContact } from './emergency'

const DB_NAME = 'roadsos_db'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Contacts store
      if (!db.objectStoreNames.contains('contacts')) {
        db.createObjectStore('contacts', { keyPath: 'phone' })
      }

      // Incident log store
      if (!db.objectStoreNames.contains('incidents')) {
        const store = db.createObjectStore('incidents', {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Save a contact
export async function saveContact(contact: EmergencyContact): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('contacts', 'readwrite')
    tx.objectStore('contacts').put(contact)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Get all contacts
export async function getContacts(): Promise<EmergencyContact[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('contacts', 'readonly')
    const request = tx.objectStore('contacts').getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Log an incident
export async function logIncident(data: {
  lat: number
  lon: number
  severity: string
  topHospital: string
  crashScore: number
}): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('incidents', 'readwrite')
    tx.objectStore('incidents').add({
      ...data,
      timestamp: new Date().toISOString()
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Get all incidents
export async function getIncidents(): Promise<any[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('incidents', 'readonly')
    const request = tx.objectStore('incidents').getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}