import { useEffect, useState } from 'react'

// Batas wajib halal UMK: 18 Oktober 2028 (WIB)
const DEADLINE = new Date('2028-10-18T00:00:00+07:00').getTime()

function remaining() {
  const diff = Math.max(0, DEADLINE - Date.now())
  return {
    hari: Math.floor(diff / 86_400_000),
    jam: Math.floor((diff / 3_600_000) % 24),
    menit: Math.floor((diff / 60_000) % 60),
    detik: Math.floor((diff / 1000) % 60),
  }
}

export default function Countdown() {
  const [t, setT] = useState(remaining)

  useEffect(() => {
    const id = setInterval(() => setT(remaining()), 1000)
    return () => clearInterval(id)
  }, [])

  const units: [string, number][] = [
    ['hari', t.hari],
    ['jam', t.jam],
    ['menit', t.menit],
    ['detik', t.detik],
  ]

  return (
    <div className="flex gap-2" role="timer" aria-label={`${t.hari} hari lagi menuju 18 Oktober 2028`}>
      {units.map(([label, value]) => (
        <div key={label} className="min-w-[4rem] rounded-md bg-brand px-2 py-2 text-center text-on-brand">
          <div className="text-h2 font-extrabold tabular-nums">
            {label === 'hari' ? value : String(value).padStart(2, '0')}
          </div>
          <div className="text-caption font-medium opacity-80">{label}</div>
        </div>
      ))}
    </div>
  )
}
