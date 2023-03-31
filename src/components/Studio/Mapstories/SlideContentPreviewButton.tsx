import { retrievePresignedUrl } from '@/src/helper/retrievePresignedUrl'
import { SlideContent } from '@prisma/client'

import { cx } from 'class-variance-authority'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { OgObject } from 'open-graph-scraper/dist/lib/types'
import { HTMLAttributes, useEffect, useState } from 'react'
import EmbedIconFactory from '../../Icons/EmbedIconFactory'

const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
})

const markdownPreviewStyles = {
  background: 'white',
  fontFamily: 'inherit',
}

function Wrapper(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex items-center gap-2', props.className)}
      {...props}
    />
  )
}

export default function SlideContentPreviewButton({
  content,
  type,
  ogData,
}: SlideContent) {
  const og = ogData as OgObject | null

  const [imageUrl, setImageUrl] = useState(String)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    console.log(content, ogData)
    if (type == 'IMAGE') {
      const getImageWrapper = async () => {
        await getImage(content)
      }
      getImageWrapper()
    }
  }, [])

  function IconComponent() {
    return <EmbedIconFactory className="my-1 h-8 border-none" type={type} />
  }

  async function getImage(fileName: string) {
    setIsLoading(true)
    const preSignedUrl = await retrievePresignedUrl('GET', fileName)

    const response = await fetch(preSignedUrl, { method: 'GET' })
    const blob = await response.blob()
    const src = URL.createObjectURL(blob)
    setImageUrl(src)
    setIsLoading(false)
  }

  if (type == 'TEXT') {
    return (
      <Wrapper>
        <IconComponent />
        <MarkdownPreview
          className="hover:bg-hover"
          source={content.substring(0, 12) + '...'}
          style={markdownPreviewStyles}
        />
      </Wrapper>
    )
  }

  const previewContent = og?.ogTitle ?? content

  if (type == 'TITLE') {
    return (
      <Wrapper>
        <IconComponent />
        {previewContent.substring(0, 12)}...
      </Wrapper>
    )
  }

  if (type == 'IMAGE') {
    return (
      <Wrapper>
        <IconComponent />
        <Image alt={content} height={50} src={imageUrl} width={50} />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <IconComponent />
      {previewContent.substring(0, 24)}
    </Wrapper>
  )
}
