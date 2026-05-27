import type { ScoredHospital } from '../core/routing/scoring'

interface Props {
  hospital: ScoredHospital
  rank: number
}

export function HospitalCard({ hospital, rank }: Props) {
  const score = Math.round(hospital.final_score * 100)
  const isTop = rank === 0
  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{
      background: isTop ? '#1a2a1a' : '#1a1a2a',
      border: isTop ? '1px solid #22c55e' : '1px solid #333',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px'
    }}>

      {isTop && (
        <div style={{
          fontSize: '10px',
          color: '#22c55e',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          marginBottom: '8px'
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
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>
            {hospital.name}
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
            {hospital.specialty}
          </div>
        </div>
        <div style={{ textAlign: 'right', marginLeft: '12px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: scoreColor }}>
            {score}
          </div>
          <div style={{ fontSize: '9px', color: '#666' }}>/ 100</div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '12px',
        fontSize: '12px',
        color: '#aaa',
        flexWrap: 'wrap'
      }}>
        <span>{hospital.distance_km.toFixed(1)} km</span>
        <span>Level {hospital.level}</span>
        <span>{hospital.has_icu ? 'ICU available' : 'No ICU'}</span>
        <span>{hospital.is_24hr ? '24hr open' : 'Limited hours'}</span>
      </div>

      <button
        onClick={() => { window.location.href = 'tel:' + hospital.phone }}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '12px',
          padding: '8px',
          background: '#dc2626',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          letterSpacing: '0.05em'
        }}
      >
        CALL NOW
      </button>
    </div>
  )
}