import { NextApiRequest, NextApiResponse } from 'next'
import { handleChatMessage } from '@/lib/stashbox/messages'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { channel_name, message, name } = req.body as any
  let filteredMessage = message.trim();
  if (filteredMessage.length > 1) {
    await handleChatMessage(channel_name, {
      name,
      message: filteredMessage,
      time: Date.now(),
    })
  }
  res.status(200).json({ status: 'ok' })
}
