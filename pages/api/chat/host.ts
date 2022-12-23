import { NextApiRequest, NextApiResponse } from 'next'
import { getChannelCache } from '@/lib/pusher'
import { completeMessages } from '@/lib/openai'
import { handleChatMessage } from '@/lib/stashbox/messages'
import personality from '@/lib/openai/schitty'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { channel_name } = req.body as any
  let roomData = await getChannelCache(channel_name);
  const message = await completeMessages(roomData.messages, personality)
  roomData = await handleChatMessage(roomData, {
    name, 
    message, 
    time: Date.now(),
  })
  res.status(200).json(roomData)
}
