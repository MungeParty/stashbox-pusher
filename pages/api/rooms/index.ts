import { NextApiRequest, NextApiResponse } from 'next'
import { getRooms } from '@/lib/stashbox/presence'
import { noCache } from '@/lib/stashbox/headers';

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const rooms = await getRooms()
	noCache(res).status(200).json(rooms)
}
