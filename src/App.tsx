import { useHospitals } from './hooks/useHospitals'
import { useSensor } from './hooks/useSensor'
import { useEmergency } from './hooks/useEmergency'
import { HospitalCard } from './components/HospitalCard'
import { ContactSetup } from './components/ContactSetup'
import { useEffect, useState } from 'react'

function App() {
  const { ranked, locationError } = useHospitals('HIGH')
  const { crashScore, isMonitoring, countdown, startMonitoring, cancelCountdown } = useSensor()
  const { triggerEmergency, actionResults, firstAidSteps, emergencyTriggered, reset } = useEmergency()
  const [userLocation, setUserLocation] = useState({ lat: 17.0693, lon: 78.2059 })

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
    })
  }, [])

  useEffect(() => {
    const handleEmergency = () => {
      const top = ranked[0]
      triggerEmergency(
        userLocation.lat,
        userLocation.lon,
        'HIGH',
        top?.name || 'Nearest hospital',
        top?.phone || '108',
        crashScore.total
      )
    }
    window.addEventListener('roadsos:emergency', handleEmergency)
    return () => window.removeEventListener('roadsos:emergency', handleEmergency)
  }, [ranked, userLocation, triggerEmergency, crashScore.total])

  if (emergencyTriggered) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'system-ui',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <h1 style={{ color: '#dc2626', fontSize: '24px', fontWeight: '900', margin: '0 0 20px' }}>
          EMERGENCY ACTIVATED
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px', letterSpacing: '0.08em' }}>
            ACTIONS FIRED SIMULTANEOUSLY
          </p>
          {actionResults.map((r, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              marginBottom: '8px',
              background: r.status === 'fulfilled' ? '#0a1a0a' : '#1a0a0a',
              border: r.status === 'fulfilled' ? '1px solid #22c55e' : '1px solid #dc2626',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              <span style={{ color: '#fff' }}>{r.action}</span>
              <span style={{
                color: r.status === 'fulfilled' ? '#22c55e' : '#dc2626',
                fontWeight: '700'
              }}>
                {r.status === 'fulfilled' ? 'Done' : 'Failed'}
              </span>
            </div>
          ))}
        </div>

        {firstAidSteps.length > 0 && (
          <div style={{
            background: '#0a1a0a',
            border: '1px solid #22c55e',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{
              color: '#22c55e',
              margin: '0 0 12px',
              fontSize: '13px',
              letterSpacing: '0.08em'
            }}>
              FIRST AID — DO THIS NOW
            </h3>
            {firstAidSteps.map((step, i) => (
              <p key={i} style={{
                fontSize: '14px',
                lineHeight: '1.7',
                margin: '0 0 8px',
                color: '#fff'
              }}>
                {step}
              </p>
            ))}
          </div>
        )}

        {ranked[0] && (
          <div style={{
            background: '#1a1a2a',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{
              color: '#93c5fd',
              fontSize: '11px',
              margin: '0 0 6px',
              letterSpacing: '0.08em'
            }}>
              GO TO THIS HOSPITAL
            </p>
            <p style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px' }}>
              {ranked[0].name}
            </p>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
              Score: {Math.round(ranked[0].final_score * 100)}/100
              &nbsp;&middot;&nbsp;
              {ranked[0].distance_km.toFixed(1)} km
              &nbsp;&middot;&nbsp;
              Level {ranked[0].level}
            </p>
            <button
              onClick={() => { window.location.href = 'tel:' + ranked[0].phone }}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              CALL HOSPITAL NOW
            </button>
          </div>
        )}

        <button
          onClick={() => { window.location.href = 'tel:108' }}
          style={{
            display: 'block',
            width: '100%',
            padding: '14px',
            background: '#1a0a0a',
            border: '1px solid #dc2626',
            color: '#dc2626',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '14px',
            marginBottom: '16px',
            cursor: 'pointer'
          }}
        >
          CALL 108 AMBULANCE
        </button>

        <button
          onClick={reset}
          style={{
            width: '100%',
            padding: '14px',
            background: '#222',
            color: '#aaa',
            border: '1px solid #333',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Reset — I am safe
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'system-ui',
      maxWidth: '480px',
      margin: '0 auto',
      padding: '20px'
    }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#dc2626', margin: 0 }}>
          RoadSoS
        </h1>
        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', letterSpacing: '0.1em' }}>
          AI EMERGENCY RESPONSE
        </p>
      </div>

      {isMonitoring && (
        <div style={{
          background: crashScore.isCrash ? '#2a0a0a' : '#0a1a0a',
          border: crashScore.isCrash ? '1px solid #dc2626' : '1px solid #22c55e',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ color: '#aaa', fontSize: '12px', letterSpacing: '0.06em' }}>
              CRASH SCORE
            </span>
            <span style={{
              fontWeight: '700',
              fontSize: '20px',
              color: crashScore.total >= 5 ? '#dc2626' : '#22c55e'
            }}>
              {crashScore.total} / 9
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
            <span>G-force: {crashScore.breakdown.gforce}</span>
            <span>Speed: {crashScore.breakdown.speedDrop}</span>
            <span>Still: {crashScore.breakdown.noMovement}</span>
          </div>
        </div>
      )}

      {countdown !== null && (
        <div style={{
          background: '#2a0a0a',
          border: '2px solid #dc2626',
          borderRadius: '12px',
          padding: '24px 20px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '56px',
            fontWeight: '900',
            color: '#dc2626',
            lineHeight: '1'
          }}>
            {countdown}
          </div>
          <div style={{ color: '#aaa', margin: '12px 0 16px', fontSize: '14px' }}>
            Accident detected. Cancel if you are safe.
          </div>
          <button
            onClick={cancelCountdown}
            style={{
              padding: '14px 36px',
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            I AM SAFE — CANCEL
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        {!isMonitoring ? (
          <button
            onClick={startMonitoring}
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ef4444, #dc2626)',
              border: '4px solid #fff',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 0 60px rgba(220,38,38,0.5)',
              letterSpacing: '0.05em',
              lineHeight: '1.4'
            }}
          >
            TAP TO ACTIVATE
          </button>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('roadsos:emergency'))}
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ef4444, #dc2626)',
              border: '4px solid #fff',
              color: '#fff',
              fontSize: '32px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 0 60px rgba(220,38,38,0.5)',
              letterSpacing: '0.1em'
            }}
          >
            SOS
          </button>
        )}
        <p style={{ fontSize: '11px', color: '#666', marginTop: '10px' }}>
          {isMonitoring ? 'Monitoring active — auto-detects crashes' : 'Tap to start crash monitoring'}
        </p>
      </div>

      {locationError && (
        <div style={{
          background: '#1a1500',
          border: '1px solid #854d0e',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '12px',
          color: '#fbbf24',
          marginBottom: '16px'
        }}>
          {locationError}
        </div>
      )}

      <div style={{ marginBottom: '8px' }}>
        <h2 style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#aaa',
          letterSpacing: '0.08em',
          margin: '0 0 4px'
        }}>
          SMART-RANKED HOSPITALS
        </h2>
        <p style={{ fontSize: '11px', color: '#555', margin: '0 0 16px' }}>
          Ranked by trauma capability · ICU · distance · not just nearest
        </p>
      </div>

      {ranked.length === 0 ? (
        <p style={{ color: '#555', fontSize: '13px' }}>Getting your location...</p>
      ) : (
        ranked.map((hospital, index) => (
          <HospitalCard key={hospital.id} hospital={hospital} rank={index} />
        ))
      )}

      {ranked.length > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '14px',
          background: '#111',
          border: '1px solid #1a1a1a',
          borderRadius: '10px',
          fontSize: '11px',
          color: '#444',
          lineHeight: '1.9'
        }}>
          <div style={{
            color: '#666',
            fontWeight: '600',
            marginBottom: '6px',
            letterSpacing: '0.06em'
          }}>
            HOW SCORES ARE CALCULATED
          </div>
          Score = (trauma x 0.60) + (distance x 0.20) + (ICU x 0.15) + (24hr x 0.05)
          <br />
          Distance score = 1 / (1 + km / 10) using Haversine formula
          <br />
          Weights shift for HIGH severity — trauma prioritised over distance
        </div>
      )}

      <ContactSetup />

    </div>
  )
}

export default App