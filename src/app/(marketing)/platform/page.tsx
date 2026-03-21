import PlatformNav from '@/components/platform/PlatformNav'
import PlatformHero from '@/components/platform/PlatformHero'
import PlatformLogos from '@/components/platform/PlatformLogos'
import PlatformTools from '@/components/platform/PlatformTools'
import PlatformProgrammes from '@/components/platform/PlatformProgrammes'
import PlatformHowItWorks from '@/components/platform/PlatformHowItWorks'
import PlatformComparison from '@/components/platform/PlatformComparison'
import PlatformStats from '@/components/platform/PlatformStats'
import PlatformTestimonial from '@/components/platform/PlatformTestimonial'
import CreatedBy from '@/components/marketing/CreatedBy'
import Pricing from '@/components/marketing/Pricing'
import PlatformFAQ from '@/components/platform/PlatformFAQ'
import PlatformCTAForm from '@/components/platform/PlatformCTAForm'
import Footer from '@/components/marketing/Footer'

export default function PlatformPage() {
  return (
    <main className="antialiased overflow-x-hidden" style={{ background: '#fcf6ef', color: '#2b180a' }}>
      <PlatformNav />
      <PlatformHero />
      <PlatformLogos />
      <PlatformTools />
      <PlatformProgrammes />
      <PlatformHowItWorks />
      <PlatformComparison />
      <PlatformStats />
      <PlatformTestimonial />
      <CreatedBy />
      <Pricing />
      <PlatformFAQ />
      <PlatformCTAForm />
      <Footer />
    </main>
  )
}
