import { NextApiRequest, NextApiResponse } from 'next'
import { handleChatMessage } from '@/lib/stashbox/messages'
import { noCache } from '@/lib/stashbox/headers'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { channel_name, message, name } = req.body as any
  let filteredMessage = message.trim();
  if (filteredMessage.length > 0) {
    const result = await handleChatMessage(channel_name, {
      name,
      message: filteredMessage,
      time: Date.now(),
    })
    noCache(res).status(200).json(result)
    return;
  }
  res.status(200).json({})
}
