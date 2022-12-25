import { NextApiRequest, NextApiResponse } from 'next'
import { getChannelCache } from '@/lib/pusher'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { channel_name } = req.query;
  // get room data from cache
  const roomData = await getChannelCache(channel_name);
  res.status(200).json(roomData)
}
