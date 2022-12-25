import { NextApiRequest, NextApiResponse } from 'next'
import { getChannelCache } from '@/lib/pusher'
import { completeMessages } from '@/lib/openai'
import { handleChatMessage } from '@/lib/stashbox/messages'
import personality from '@/lib/openai/personalities/bot'
import { PusherChannel } from '@/store/constants'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { room } = req.body as any
  const channel_name = PusherChannel.room(room)
  let roomData = await getChannelCache(channel_name);
  let message = await completeMessages(roomData.messages, personality)
  message = message?.trim() || '';
  if (message.length > 0) {
    const { name } = personality
    roomData = await handleChatMessage(
      roomData.code, 
        {
        name,
        message,
        time: Date.now()
      })
  }
  res.status(200).json({ message })
}
