import { NextApiRequest, NextApiResponse } from 'next'
// import {  } from '@/lib/stashbox/presence'
import { getChannelCache } from '@/lib/pusher'
import { noCache } from '@/lib/stashbox/headers';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { channel_name } = req.query;
  // get room data from cache
  const roomData = await getChannelCache(channel_name);
  noCache(res).status(200).json(roomData)
}
