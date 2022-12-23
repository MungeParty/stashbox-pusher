import { NextApiRequest, NextApiResponse } from 'next'
import { handleChatMessage } from '@/lib/stashbox/messages'
import { getChannelCache } from '@/lib/pusher'
import { noCache } from '@/lib/stashbox/headers'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { channel_name, message: input, name } = req.body;
  let message = input?.trim() || '';
  console.log('message', message, channel_name, name, req.body)
  let roomData = await getChannelCache(channel_name);
  // handle message
  if (message.length > 0) {
    roomData = await handleChatMessage(roomData, {
      name, 
      message, 
      time: Date.now(),
    })
  }
  noCache(res).status(200).json(roomData)
}
