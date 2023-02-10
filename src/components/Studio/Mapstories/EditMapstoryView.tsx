'use client'

import DrawControl from '@/src/components/Map/DrawControl'
import { Story } from '@prisma/client'
import { StudioHeader } from '../Header'
import { StudioShell } from '../Shell'
import Map from '@/src/components/Map'
import { useStoryStore } from '@/src/lib/store/story'
import { useEffect, useState } from 'react'
import { Marker, MarkerDragEvent } from 'react-map-gl'
import { updateStoryStep } from '@/src/lib/api/step/updateStep'
import { usePathname } from 'next/navigation'

type EditMapstoryViewProps = {
  story: Story
}

export default function EditMapstoryView({ story }: EditMapstoryViewProps) {
  const path = usePathname()
  const stepId = path?.split('/').at(-1)
  const updateStory = useStoryStore(state => state.updateStory)
  const [markerCoords, setMarkerCoords] = useState<number[] | undefined>()
  const addMarker = async (
    e: mapboxgl.MapLayerMouseEvent | MarkerDragEvent,
  ) => {
    setMarkerCoords([e.lngLat.lng, e.lngLat.lat])
    const storyId = await story.id
    if (stepId && storyId) {
      const response = await updateStoryStep(storyId, stepId, {
        feature: {
          point: {
            latitude: e.lngLat.lat as number,
            longitude: e.lngLat.lng as number,
          },
        },
      })
    }
  }

  useEffect(() => {
    updateStory(story)
  }, [])

  return (
    <StudioShell>
      <StudioHeader heading={story.name || ''} text={story.id} />
      <div className="re-studio-height-full-screen absolute top-0 z-10 w-full overflow-hidden rounded-lg shadow">
        {markerCoords === undefined && (
          <p className="top-15 absolute z-20 w-full text-center text-sm text-black">
            Klicke auf die Karte um deinen Marker hinzuzufügen
          </p>
        )}
        <Map onClick={e => addMarker(e)}>
          <DrawControl
            controls={{
              polygon: true,
              point: true,
              trash: true,
            }}
            displayControlsDefault={false}
            position="top-left"
          />
          {markerCoords != undefined && (
            <Marker
              draggable
              latitude={markerCoords[1]}
              longitude={markerCoords[0]}
              onDragEnd={e => addMarker(e)}
            ></Marker>
          )}
        </Map>
      </div>
    </StudioShell>
  )
}
