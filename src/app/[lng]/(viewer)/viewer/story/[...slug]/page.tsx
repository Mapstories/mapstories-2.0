import { Slides } from '@/src/components/Viewer/Slides'
import { StoryOverviewControls } from '@/src/components/Viewer/StoryOverviewContols'

interface StoryPageProps {
  params: { slug: string[] }
}

export default async function StoryPage({ params: { slug } }: StoryPageProps) {
  return (
    <>
      <div className="absolute left-5 top-20 z-20">
        <StoryOverviewControls
          page={slug[1]}
          slug={slug[0]}
          // toggleSlides={toggleSlidesOpen}
        ></StoryOverviewControls>
      </div>
      <div>
        {slug[1] != 'start' && (
          <div className="re-basic-box re-slide absolute bottom-10 right-5 z-20 bg-white p-4">
            <Slides page={slug[1]} slug={slug[0]}></Slides>
          </div>
        )}
      </div>
    </>
  )
}