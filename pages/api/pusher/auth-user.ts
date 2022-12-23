import { NextApiRequest, NextApiResponse } from 'next'
import pusher from '@/lib/pusher'
import { noCache } from '@/lib/stashbox/headers'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { socket_id, ...user_info } = req.body
	const authResponse = pusher.authenticateUser(
		socket_id,
		{
			id: socket_id,
			user_info: {
				...user_info,
				id: socket_id,
			},
		}
	)
	noCache(res).send(authResponse);
}
