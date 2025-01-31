'use client'

import { SlideContent, Story, StoryStep } from '@prisma/client'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { MapRef, Popup, Source } from 'react-map-gl'
import { Feature, GeoJsonProperties, LineString } from 'geojson'
// import { LineString } from 'geojson'
import { Button } from './../Elements/Button'
import { usePathname, useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import React from 'react'
import Markers from './ViewerMap/Layers/Markers'
import StorySourceLayer from './ViewerMap/Layers/StorySourceAndLayer'
import { useBoundStore } from '@/src/lib/store/store'
import { getSlideTitle } from '@/src/lib/getSlideTitle'
import Map from '../Map'
import { fallbackLng, languages } from '@/src/app/i18n/settings'
import { useTranslation } from '@/src/app/i18n/client'

type ViewerViewProps = {
  inputStories:
    | (Story & {
        steps: (StoryStep & { content: SlideContent[] })[]
      })[]
}

export default function ViewerView({ inputStories }: ViewerViewProps) {
  const mapRef = React.createRef<MapRef>()

  const path = usePathname()
  const onMyStoriesRoute = path?.includes('mystories')
  const storyID = useBoundStore(state => state.storyID)
  const setStoryID = useBoundStore(state => state.setStoryID)
  const selectedStepIndex = useBoundStore(state => state.selectedStepIndex)

  const [mapData, setMapData] = useState<
    GeoJSON.Feature<GeoJSON.LineString>[] | undefined
  >()
  const [selectedFeature, setSelectedFeature] = useState<Feature | undefined>()

  const [interactiveLayerIds, setInteractiveLayerIds] = useState<any[]>()
  const [savedView, setSavedView] = useState<any>()
  const [startView, setStartView] = useState<any>()

  const [markers, setMarkers] = useState<any[]>([])
  const [selectedStorySlug, setSelectedStorySlug] = useState<string>()

  const router = useRouter()
  const [cursor, setCursor] = useState<string>('auto')

  let lng = useBoundStore(state => state.language)
  if (languages.indexOf(lng) < 0) {
    lng = fallbackLng
  }
  const { t } = useTranslation(lng, 'viewer')
  const setViewerStories = useBoundStore(state => state.setViewerStories)
  const stories = useBoundStore(state => state.viewerStories)

  useEffect(() => {
    if (selectedStepIndex != undefined) {
      updateToStep(selectedStepIndex)
    }
  }, [selectedStepIndex])

  useEffect(() => {
    if (inputStories && inputStories.length > 0) {
      setViewerStories(inputStories)
    }
  }, [inputStories])

  useEffect(() => {
    extractGeoJson(stories)
  }, [stories])

  useEffect(() => {
    // Zoom back to former extend if not viewing a story
    const pathend = path?.split('/').at(-1)
    if (pathend === 'mystories') {
      setStoryID('')
      if (savedView) {
        mapRef.current?.fitBounds(savedView)
      }
    }
    if (pathend === 'gallery') {
      setStoryID('')
      setViewerStories([])
    }
  }, [path])

  useEffect(() => {
    if (mapData) {
      // drawMapData(mapData)
      const ids = mapData
        ?.map(m => {
          if (m.geometry.coordinates.length > 0) {
            return m.properties?.id.toString() + 'buffer'
          }
        })
        .filter(item => item != undefined)
      setInteractiveLayerIds(ids)
    }
  }, [mapData])

  useEffect(() => {
    if (storyID != undefined && mapData != undefined) {
      const m: Feature<LineString, GeoJsonProperties> | undefined =
        mapData.find(story => story?.properties?.id === storyID)
      if (m) {
        selectStory(m)
      }
    }
  }, [storyID])

  // generate markers
  useEffect(() => {
    const story = stories?.filter(story => story.id === storyID)[0]
    if (story?.steps) {
      let bounds: any = undefined
      const newMarkers = story?.steps
        .filter(step => step.feature)
        .map(({ id, feature, position, content }) => {
          const geoFeature =
            feature as unknown as GeoJSON.Feature<GeoJSON.Point>
          if (geoFeature?.geometry?.coordinates?.length > 0) {
            if (bounds === undefined) {
              bounds = new mapboxgl.LngLatBounds(
                [
                  geoFeature?.geometry?.coordinates[0],
                  geoFeature?.geometry?.coordinates[1],
                ],
                [
                  geoFeature?.geometry?.coordinates[0],
                  geoFeature?.geometry?.coordinates[1],
                ],
              )
            } else {
              bounds.extend([
                geoFeature?.geometry?.coordinates[0],
                geoFeature?.geometry?.coordinates[1],
              ])
            }
            const newMarker: any = {
              longitude: geoFeature.geometry.coordinates[0],
              latitude: geoFeature.geometry.coordinates[1],
              position: position,
              stepId: id,
              color: '#18325b',
              title: getSlideTitle(content),
            }
            return newMarker
          }
        })
      // @ts-ignore
      setMarkers(newMarkers)
      //save bounds to zoomTo once map is initiated
      setStartView(bounds)
    }
  }, [storyID])

  function extractGeoJson(
    currentStories:
      | (Story & {
          steps?: StoryStep[] | undefined
        })[]
      | undefined,
  ) {
    const geojsons: any[] = []
    if (!currentStories) {
      return
    }
    currentStories.forEach(s => {
      const story: any[] = []
      if (!s?.steps) {
        return
      }
      s.steps
        .sort((a, b) => a.position - b.position)
        .forEach((step: StoryStep) => {
          const geoFeature =
            step.feature as unknown as GeoJSON.Feature<GeoJSON.Point>
          if (geoFeature?.geometry?.coordinates?.length > 0) {
            story.push([
              geoFeature.geometry.coordinates[0],
              geoFeature.geometry.coordinates[1],
            ])
          }
        })
      geojsons.push({
        type: 'Feature',
        properties: {
          id: s.id,
          desc: s.description,
          name: s.name,
          slug: s.slug,
        },
        geometry: {
          type: 'LineString',
          coordinates: story,
        },
      })
    })
    setMapData(geojsons)
  }

  function selectStory(m: GeoJSON.Feature<GeoJSON.LineString>) {
    if (m) {
      const coordinates = m.geometry.coordinates

      // Create a 'LngLatBounds' with both corners at the first coordinate.
      if (coordinates.length !== 0) {
        const bounds = new mapboxgl.LngLatBounds(
          [coordinates[0][0], coordinates[0][1]],
          [coordinates[0][0], coordinates[0][1]],
        )
        for (const coord of coordinates) {
          bounds.extend([coord[0], coord[1]])
        }
        if (mapRef) {
          setSavedView(mapRef.current?.getBounds())
          mapRef.current?.fitBounds(bounds, {
            padding: 100,
          })
        }
      }
      // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
    }
    setSelectedStorySlug(m.properties?.slug)
    onMyStoriesRoute
      ? router.push(`/mystories/story/${m.properties?.slug}/start`)
      : router.push(`/gallery/story/${m.properties?.slug}/start`)
  }

  function updateToStep(index: number) {
    const story = stories?.filter(story => story.id === storyID)[0]
    if (story?.steps?.length && story?.steps?.length > index) {
      if (mapRef && story.steps[index].feature) {
        const feature: Feature<GeoJSON.Point> = story?.steps[index]
          .feature as unknown as Feature<GeoJSON.Point>
        mapRef.current?.flyTo({
          center: [
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1],
          ],
          padding: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 150,
          },
          zoom: 15,
          essential: true,
        })
      }
    }
  }

  // const onHover = (event: mapboxgl.MapLayerMouseEvent) => {
  //   const hoverSteps = event.features

  //   if (!hoverSteps || hoverSteps.length < 1) {
  //     setCursor('auto')
  //     return
  //   }
  //   setCursor('pointer')
  // }

  const onMapLoad = useCallback(() => {
    if (selectedStepIndex) {
      updateToStep(selectedStepIndex)
    }
    if (Number.isNaN(selectedStepIndex) && mapRef.current && startView) {
      mapRef.current?.fitBounds(startView)
    }
  }, [startView, mapRef])

  return (
    <Map
      // cursor={cursor}
      interactiveLayerIds={interactiveLayerIds}
      onLoad={onMapLoad}
      // onMouseMove={onHover}
      ref={mapRef}
    >
      <StorySourceLayer
        geojsons={mapData}
        selectedFeature={selectedFeature}
        selectedStepIndex={selectedStepIndex}
        storyID={storyID}
      />

      {mapData &&
        mapData.map((m, i) => {
          return (
            <Fragment key={m.properties?.id}>
              {m.geometry.coordinates.length > 0 && (
                <>
                  <Source
                    data={m as Feature}
                    id={m.properties?.id + 'source'}
                    type="geojson"
                  ></Source>

                  {storyID === '' && (
                    <Popup
                      anchor="top"
                      closeOnClick={false}
                      latitude={m.geometry.coordinates[0][1]}
                      longitude={m.geometry.coordinates[0][0]}
                      // onClose={() => setPopupInfo(null)}
                    >
                      <div className="re-basic-box-no-filter overflow-hidden">
                        <div className="p-5">
                          <h3>{m.properties?.name}</h3>
                          <p> {m.properties?.desc}</p>
                          <div className="mt-2 flex justify-end">
                            <Button className="" onClick={() => selectStory(m)}>
                              {t('more')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  )}
                  {storyID != '' && (
                    <>
                      <Markers
                        markers={markers}
                        // onClick={m => router.push(`/viewer/story/${SLUGWHERE}}/${m.position}`)}
                      />
                    </>
                  )}
                </>
              )}
            </Fragment>
          )
        })}
    </Map>
  )
}
