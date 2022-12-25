import { NextApiRequest, NextApiResponse } from 'next'
import { getChannelCache } from '@/lib/pusher'
import { completeMessages } from '@/lib/openai'
import { handleChatMessage } from '@/lib/stashbox/messages'
import { PusherChannel } from '@/store/constants'
import Personalities from '@/lib/openai/personalities'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { room, name } = req.body as any
  const channel_name = PusherChannel.room(room)
  const personality = Personalities[name];
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
