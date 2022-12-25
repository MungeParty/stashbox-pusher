import { NextApiRequest, NextApiResponse } from 'next'
import { handleChatMessage } from '@/lib/stashbox/messages'
import { getChannelCache } from '@/lib/pusher'
import { PusherChannel } from '@/store/constants'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { room, message: input, name, isViewer } = req.body;
  let message = input?.trim() || '';
  const channel_name = PusherChannel.room(room)
  let roomData = await getChannelCache(channel_name);
  // handle message
  if (message.length > 0) {
    roomData = await handleChatMessage(
      roomData.code,
      {
        name: isViewer ? '[VIEWER]' : name, 
        message, 
        time: Date.now(),
      })
  }
  res.status(200).json(roomData)
}
