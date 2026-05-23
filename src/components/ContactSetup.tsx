import { useState, useEffect } from 'react'
import { saveContact, getContacts } from '../utils/storage'
import type { EmergencyContact } from '../utils/emergency'

export function ContactSetup() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getContacts().then(setContacts)
  }, [])

  const handleSave = async () => {
    if (!name || !phone) return
    const contact: EmergencyContact = { name, phone, relationship }
    await saveContact(contact)
    const updated = await getContacts()
    setContacts(updated)
    setName('')
    setPhone('')
    setRelationship('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '24px'
    }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#aaa',
        letterSpacing: '0.08em',
        margin: '0 0 12px'
      }}>
        EMERGENCY CONTACTS
      </h3>

      {contacts.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {contacts.map((c, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: '#0a1a0a',
              border: '1px solid #22c55e',
              borderRadius: '8px',
              marginBottom: '6px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#fff' }}>{c.name}</span>
              <span style={{ color: '#22c55e' }}>{c.phone}</span>
            </div>
          ))}
        </div>
      )}

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Contact name"
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '13px',
          marginBottom: '8px',
          boxSizing: 'border-box'
        }}
      />
      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="Phone number"
        type="tel"
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '13px',
          marginBottom: '8px',
          boxSizing: 'border-box'
        }}
      />
      <input
        value={relationship}
        onChange={e => setRelationship(e.target.value)}
        placeholder="Relationship (e.g. Mother)"
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '13px',
          marginBottom: '10px',
          boxSizing: 'border-box'
        }}
      />
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '10px',
          background: saved ? '#22c55e' : '#dc2626',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        {saved ? '✓ SAVED' : 'SAVE CONTACT'}
      </button>
    </div>
  )
}