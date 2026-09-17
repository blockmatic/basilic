import { CTA } from '@/components/landing/cta'
import { Hero } from '@/components/landing/hero'
import { RunIt } from '@/components/landing/run-it'
import { Skills } from '@/components/landing/skills'
import { Stack } from '@/components/landing/stack'

export default function HomePage() {
  return (
    <>
      <Hero />
      <RunIt />
      <Stack />
      <Skills />
      <CTA />
    </>
  )
}
