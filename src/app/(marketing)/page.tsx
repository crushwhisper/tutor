import ScienceHero from '@/components/science/ScienceHero'
import SciencePrinciples from '@/components/science/SciencePrinciples'
import ScienceMetrics from '@/components/science/ScienceMetrics'
import ScienceCTA from '@/components/science/ScienceCTA'
import ScienceFooter from '@/components/science/ScienceFooter'

export default function SciencePage() {
  return (
    <main
      style={{ background: '#fcf6ef', color: '#2b180a', overflowX: 'hidden' }}
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
