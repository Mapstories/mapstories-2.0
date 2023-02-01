import { Button } from '@/src/components/Elements/Button'
import EditMapstoryView from '@/src/components/Studio/Mapstories/EditMapstoryView'
import MapstorySidebar from '@/src/components/Studio/Mapstories/Sidebar/MapstorySidebar'
import { authOptions } from '@/src/lib/auth'
import { db } from '@/src/lib/db'
import { getCurrentUser } from '@/src/lib/session'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Story, User } from '@prisma/client'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const generateStaticParams =
  process.env.NODE_ENV !== 'development'
    ? async () => {
      return []
    }
    : undefined

interface DashboardLayoutProps {
  params: { storyId: string }
  children?: React.ReactNode
}

async function getStoryForUser(storyId: Story['id'], userId: User['id']) {
  return await db.story.findFirst({
    where: {
      id: storyId,
      ownerId: userId,
    },
    include: {
      steps: {
        include: {
          content: true
        }
      }
    },
  })
}

export default async function DashboardLayout({
  params: { storyId },
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions.pages?.signIn!)
  }

  const story = await getStoryForUser(storyId, user.id)

  if (!story) {
    return notFound()
  }

  return (
    <>
      <Link href={'/studio'}>
        <Button
          startIcon={<ArrowLeftIcon className="w-5" />}
          variant={'inverse'}
        >
          Zurück
        </Button>
      </Link>

      <div className="mt-8 grid w-full flex-1 flex-col gap-12 overflow-hidden md:grid-cols-[200px_1fr] re-studio-height-full-screen">
        <aside className="flex-col md:flex md:w-[200px] re-studio-height-full-screen">
          <MapstorySidebar storyID={story.id} />
        </aside>
        <main className="relative flex w-full flex-1 flex-col overflow-hidden re-studio-height-full-screen">
          <EditMapstoryView data-superjson story={story} />
          <div className="absolute top-0 left-0 h-full w-full">{children}</div>
        </main>
      </div>
    </>
  )
}
