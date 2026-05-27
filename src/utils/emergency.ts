export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface EmergencyData {
  lat: number
  lon: number
  severity: string
  topHospital: string
  topHospitalPhone: string
  timestamp: string
}

export interface ActionResult {
  action: string
  status: 'fulfilled' | 'rejected'
  detail: string
}

// Action 1: SMS via native URI (offline fallback)
function sendNativeSMS(phone: string, message: string): Promise<string> {
  return new Promise((resolve) => {
    const uri = `sms:${phone}?body=${encodeURIComponent(message)}`
    window.open(uri, '_blank')
    resolve(`SMS opened for ${phone}`)
  })
}

// Action 2: WhatsApp deep link
function sendWhatsApp(phone: string, message: string): Promise<string> {
  return new Promise((resolve) => {
    const clean = phone.replace(/\D/g, '')
    const uri = `https://wa.me/91${clean}?text=${encodeURIComponent(message)}`
    window.open(uri, '_blank')
    resolve(`WhatsApp opened for ${phone}`)
  })
}

// Action 3: 108 deep link
function trigger108(): Promise<string> {
  return new Promise((resolve) => {
    window.location.href = 'tel:108'
    resolve('108 dialer opened')
  })
}

// Action 4: First aid — always succeeds
function getFirstAidSteps(severity: string): Promise<string[]> {
  return new Promise((resolve) => {
    const steps = severity === 'HIGH' ? [
      '1. Do NOT move the victim — possible spinal injury',
      '2. Check breathing — tilt head back gently if unconscious',
      '3. Apply firm pressure to any bleeding wounds',
      '4. Keep victim warm and still — wait for ambulance'
    ] : [
      '1. Move victim away from traffic safely',
      '2. Check for injuries — ask what hurts',
      '3. Call family and emergency services',
      '4. Stay with victim until help arrives'
    ]
    resolve(steps)
  })
}

// Build the emergency message
function buildMessage(data: EmergencyData): string {
  return `ROADSOS ALERT
Accident detected at ${data.timestamp}
Location: ${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}
Severity: ${data.severity}
Best hospital: ${data.topHospital}
Map: https://maps.google.com/?q=${data.lat},${data.lon}`
}

// MAIN FUNCTION — all actions fire in parallel
export async function executeEmergencyResponse(
  data: EmergencyData,
  contacts: EmergencyContact[]
): Promise<ActionResult[]> {

  const message = buildMessage(data)
  const results: ActionResult[] = []

  // Build all actions
  const actions: Promise<string>[] = [
    trigger108(),
    getFirstAidSteps(data.severity).then(steps => steps.join('\n')),
    ...contacts.map(contact =>
      sendNativeSMS(contact.phone, message)
        .catch(() => sendWhatsApp(contact.phone, message))
    )
  ]

  // Fire ALL simultaneously — Promise.allSettled means
  // one failure never stops the others
  const settled = await Promise.allSettled(actions)

  settled.forEach((result, index) => {
    const actionName = index === 0 ? '108 Call' :
                       index === 1 ? 'First Aid' :
                       `Contact ${contacts[index - 2]?.name}`

    results.push({
      action: actionName,
      status: result.status === 'fulfilled' ? 'fulfilled' : 'rejected',
      detail: result.status === 'fulfilled'
        ? result.value
        : String((result as PromiseRejectedResult).reason)
    })
  })

  return results
}