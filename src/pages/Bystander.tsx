import { useState } from 'react'
export function Bystander() {
  const [confirmed, setConfirmed] = useState(false)

  if (!confirmed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0a', color: '#fff',
        fontFamily: 'system-ui', maxWidth: '480px', margin: '0 auto',
        padding: '40px 20px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚨</div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626', margin: '0 0 12px' }}>
          ACCIDENT NEARBY
        </h1>
        <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '32px', lineHeight: '1.6' }}>
          Someone may need help at this location.
          Are you at the accident scene?
        </p>
        <button
          onClick={() => setConfirmed(true)}
          style={{
            width: '100%', padding: '18px',
            background: '#dc2626', color: '#fff',
            border: 'none', borderRadius: '12px',
            fontSize: '18px', fontWeight: '900',
            cursor: 'pointer', marginBottom: '12px'
          }}
        >
          YES — I AM AT THE SCENE
        </button>
        <button
          onClick={() => window.close()}
          style={{
            width: '100%', padding: '14px',
            background: '#111', color: '#aaa',
            border: '1px solid #333', borderRadius: '12px',
            fontSize: '14px', cursor: 'pointer'
          }}
        >
          No — I am not nearby
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', color: '#fff',
      fontFamily: 'system-ui', maxWidth: '480px', margin: '0 auto', padding: '20px'
    }}>
      <h1 style={{ color: '#22c55e', fontSize: '20px', fontWeight: '900', margin: '0 0 20px' }}>
        You are helping. Thank you.
      </h1>

      {/* Legal protection */}
      <div style={{
        background: '#1a1500', border: '1px solid #854d0e',
        borderRadius: '10px', padding: '14px', marginBottom: '16px'
      }}>
        <p style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '700', margin: '0 0 6px' }}>
          You are legally protected
        </p>
        <p style={{ color: '#aaa', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
          India's Good Samaritan Law 2016 protects you from police questioning
          and legal liability for helping this person. Help without fear.
        </p>
      </div>

      {/* First aid */}
      <div style={{
        background: '#0a1a0a', border: '1px solid #22c55e',
        borderRadius: '10px', padding: '14px', marginBottom: '16px'
      }}>
        <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: '700', margin: '0 0 10px', letterSpacing: '0.08em' }}>
          DO THIS NOW — IN ORDER
        </p>
        {[
          'Do NOT move the victim unless there is fire or water',
          'Check breathing — tilt head back gently if unconscious',
          'Apply firm pressure to any bleeding wounds with cloth',
          'Stay with them and keep them calm until ambulance arrives'
        ].map((step, i) => (
          <p key={i} style={{ fontSize: '14px', lineHeight: '1.7', margin: '0 0 8px', color: '#fff' }}>
            {i + 1}. {step}
          </p>
        ))}
      </div>

      {/* Call buttons */}
      <button
        onClick={() => { window.location.href = 'tel:108' }}
        style={{
          width: '100%', padding: '14px', background: '#dc2626',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px'
        }}
      >
        CALL 108 AMBULANCE
      </button>

      <button
        onClick={() => { window.location.href = 'tel:100' }}
        style={{
          width: '100%', padding: '14px', background: '#1a1a2a',
          color: '#fff', border: '1px solid #3b82f6', borderRadius: '10px',
          fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px'
        }}
      >
        CALL 100 POLICE
      </button>

      <button
        onClick={() => { window.location.href = 'tel:1033' }}
        style={{
          width: '100%', padding: '12px', background: '#111',
          color: '#aaa', border: '1px solid #333', borderRadius: '10px',
          fontSize: '14px', fontWeight: '600', cursor: 'pointer'
        }}
      >
        NHAI HIGHWAY HELP — 1033
      </button>
    </div>
  )
}