import { useState } from 'react'
import type { ScoredHospital } from '../core/routing/scoring'

interface Props {
  contacts: ScoredHospital[]
}

const TABS = [
  { key: 'hospital', label: 'Hospitals', emoji: '🏥' },
  { key: 'police', label: 'Police', emoji: '🚔' },
  { key: 'ambulance', label: 'Ambulance', emoji: '🚑' },
  { key: 'towing', label: 'Towing', emoji: '🚗' },
  { key: 'puncture', label: 'Puncture', emoji: '🔧' },
]

export function EmergencyTabs({ contacts }: Props) {
  const [activeTab, setActiveTab] = useState('hospital')

  const filtered = contacts.filter((c: any) =>
    (c.type || 'hospital') === activeTab
  )

  return (
    <div>
      {/* Tab buttons */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '16px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {TABS.map(tab => {
          const count = contacts.filter((c: any) =>
            (c.type || 'hospital') === tab.key
          ).length
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: activeTab === tab.key
                  ? '1px solid #dc2626'
                  : '1px solid #333',
                background: activeTab === tab.key ? '#dc2626' : '#111',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em'
              }}
            >
              {tab.emoji} {tab.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Contact cards */}
      {filtered.length === 0 ? (
        <p style={{ color: '#555', fontSize: '13px' }}>
          No {activeTab} contacts available
        </p>
      ) : (
        filtered.map((contact: any, index: number) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            index={index}
            showScore={activeTab === 'hospital'}
          />
        ))
      )}
    </div>
  )
}

function ContactCard({
  contact,
  index,
  showScore
}: {
  contact: any
  index: number
  showScore: boolean
}) {
  const score = Math.round((contact.final_score || 0) * 100)
  const isTop = index === 0

  return (
    <div style={{
      background: isTop && showScore ? '#1a2a1a' : '#111',
      border: isTop && showScore
        ? '1px solid #22c55e'
        : '1px solid #222',
      borderRadius: '10px',
      padding: '14px',
      marginBottom: '10px'
    }}>
      {isTop && showScore && (
        <div style={{
          fontSize: '10px',
          color: '#22c55e',
          fontWeight: '700',
          marginBottom: '6px',
          letterSpacing: '0.1em'
        }}>
          AI RECOMMENDED
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
            {contact.name}
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
            {contact.specialty}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {contact.distance_km?.toFixed(1)} km away
            {contact.is_24hr && (
              <span style={{ color: '#22c55e', marginLeft: '8px' }}>24hr</span>
            )}
          </div>
        </div>

        {showScore && (
          <div style={{ textAlign: 'right', marginLeft: '12px' }}>
            <div style={{
              fontSize: '22px',
              fontWeight: '700',
              color: score >= 70
                ? '#22c55e'
                : score >= 40
                ? '#f59e0b'
                : '#ef4444'
            }}>
              {score}
            </div>
            <div style={{ fontSize: '9px', color: '#666' }}>/100</div>
          </div>
        )}
      </div>

      {showScore && contact.type === 'hospital' && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px',
          fontSize: '11px',
          color: '#666',
          flexWrap: 'wrap'
        }}>
          <span>Level {contact.level}</span>
          <span>{contact.has_icu ? '✓ ICU' : '✗ No ICU'}</span>
        </div>
      )}

      <button
        onClick={() => { window.location.href = 'tel:' + contact.phone }}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '10px',
          padding: '8px',
          background: '#dc2626',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          letterSpacing: '0.04em'
        }}
      >
        CALL {contact.phone}
      </button>
    </div>
  )
}