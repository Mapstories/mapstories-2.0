'use client'

import { Button } from '@/src/components/Elements/Button'
import { Modal } from '@/src/components/Modal'
import { TrashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from '@/src/lib/toast'
import useStory from '@/src/lib/api/story/useStory'

export default function DeleteStepButton({
  storyId,
  storyStepId,
}: {
  storyId: string
  storyStepId: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { deleteStoryStep } = useStory(storyId)

  async function handleClick() {
    setLoading(true)

    try {
      await deleteStoryStep(storyStepId)
      router.refresh()
    } catch (e) {
      return toast({
        title: 'Something went wrong.',
        message: 'Your content was not created. Please try again',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <span>
          Willst du die Slide
          <span className="rounded bg-slate-100 py-1 px-2">{storyStepId}</span>
          wirklich löschen?
        </span>
      }
      trigger={
        <div className="flex cursor-pointer  p-2 transition-colors hover:bg-red-200">
          <TrashIcon className="w-5 text-red-500" />
        </div>
      }
    >
      <Modal.Footer>
        <Button
          disabled={loading}
          isLoading={loading}
          onClick={handleClick}
          variant={'danger'}
        >
          Löschen
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
