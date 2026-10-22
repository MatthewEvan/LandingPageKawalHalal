import { useCallback, useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Problem from './components/Problem'
import Solution from './components/Solution'
import HowItWorks from './components/HowItWorks'
import WaitlistSection from './components/WaitlistForm'
import Faq from './components/Faq'
import Footer from './components/Footer'
import { getStats, type Stats } from './lib/waitlist'

export default function App() {
  const [stats, setStats] = useState<Stats | null>(null)

  const refreshStats = useCallback(() => {
    getStats().then(setStats).catch(() => setStats(null))
  }, [])

  useEffect(() => {
    refreshStats()
    const id = setInterval(refreshStats, 30_000)
    return () => clearInterval(id)
  }, [refreshStats])

  return (
    <>
      <Navbar />
      <main>
        <Hero stats={stats} />
        <Problem />
        <Solution />
        <HowItWorks />
        <WaitlistSection stats={stats} onJoined={refreshStats} />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
