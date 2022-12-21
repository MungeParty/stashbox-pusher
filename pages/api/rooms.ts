import { NextApiRequest, NextApiResponse } from 'next'
import { getRooms } from '@/lib/records'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const rooms = await getRooms()
	res.status(200).json(rooms)
}
