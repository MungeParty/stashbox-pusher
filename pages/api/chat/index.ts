import { NextApiRequest, NextApiResponse } from 'next'
import { handleChatMessage } from '@/lib/stashbox/messages'
import { getChannelCache } from '@/lib/pusher'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { channel_name, message: input, name } = req.body as any
  let message = input?.trim() || '';
  let roomData = await getChannelCache(channel_name);
  // handle message
  if (message.length > 0) {
    roomData = await handleChatMessage(roomData, {
      name, 
      message, 
      time: Date.now(),
    })
  }
  res.status(200).json(roomData)
}
