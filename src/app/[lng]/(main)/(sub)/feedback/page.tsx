import { PageHeader } from '@/src/components/PageHeader'
import type { Metadata } from 'next/types'

export const metadata: Metadata = {
  title: 'Feedback',
  openGraph: {
    title: 'Feedback',
  },
}

export default async function Page({
  params: { lng },
}: {
  params: { lng: string }
}) {
  return (
    <div>
      <PageHeader heading="Feedback"></PageHeader>
      <p className="py-4">
        <a
          className="text-blue-500"
          href="https://padlet.com/VamosMuenster/feedback-zur-plattform-mapstories-vxeo28o2lzldiwuy"
          target="_blank"
        >
          Hier {}
        </a>
        kannst Du uns Rückmeldung zu unserer Plattform geben. Ausführliches
        Feedback kannst Du gerne an mapstories@vamos-muenster.de senden.
      </p>
      <p className="py-4">
        <a
          className="text-blue-500"
          href="https://github.com/reedu-reengineering-education/mapstories-2.0"
          target="_blank"
        >
          Hier {}
        </a>
        kannst du dir den Quellcode von Mapstories anschauen, Bugs direkt an die
        Entwickler:innen senden, oder dich bei der Entwicklung beteiligen
      </p>
    </div>
  )
}