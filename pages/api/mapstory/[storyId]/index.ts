import { NextApiRequest, NextApiResponse } from 'next'

import { withMethods } from '@/src/lib/apiMiddlewares/withMethods'
import { db } from '@/src/lib/db'
import { updateMapstorySchema } from '@/src/lib/validations/mapstory'
import { generateSlug } from '@/src/lib/slug'
import { withMapstory } from '@/src/lib/apiMiddlewares/withMapstory'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const storyId = req.query.storyId as string

  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions)
      const user = session?.user
      const story = await db.story.findFirst({
        where: {
          OR: [{ id: storyId }, { slug: storyId }],
        },
        include: {
          firstStep: {
            include: {
              content: true,
            },
          },
          steps: {
            include: {
              content: true,
            },
          },
        },
      })

      //AUTH HACK
      if (story?.visibility === 'PUBLIC' || story?.ownerId === user?.id) {
        return res.status(200).json(story)
      }
      return res.status(401).end()
    } catch (error) {
      return res.status(500).end()
    }
  }
  if (req.method === 'PUT') {
    try {
      const payload = updateMapstorySchema.parse(req.body)

      const storyToUpdate = await db.story.findFirst({
        where: {
          id: storyId,
        },
        select: {
          name: true,
        },
      })

      if (!storyToUpdate) {
        return res.status(404).end()
      }

      let data: any = payload

      const nameChanged = payload.name !== storyToUpdate.name
      if (nameChanged) {
        const slug = await generateSlug(payload.name)
        data = {
          ...data,
          slug,
        }
      }

      const story = await db.story.update({
        where: {
          id: storyId,
        },
        data,
      })

      return res.status(200).json(story)
    } catch (error) {
      return res.status(500).json(error)
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.story.delete({
        where: {
          id: storyId,
        },
      })

      return res.status(204).end()
    } catch (error) {
      return res.status(500).end()
    }
  }
}

export default withMethods(['GET', 'DELETE', 'PUT'], withMapstory(handler))
