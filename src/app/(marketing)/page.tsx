import ScienceHero from '@/components/science/ScienceHero'
import SciencePrinciples from '@/components/science/SciencePrinciples'
import ScienceMetrics from '@/components/science/ScienceMetrics'
import ScienceCTA from '@/components/science/ScienceCTA'
import ScienceFooter from '@/components/science/ScienceFooter'

export default function SciencePage() {
  return (
    <main
      style={{ background: '#0A0A0A', color: 'white', overflowX: 'hidden' }}
      className="antialiased"
    >
      <ScienceHero />
      <SciencePrinciples />
      <ScienceMetrics />
      <ScienceCTA />
      <ScienceFooter />
    </main>
  )
}
