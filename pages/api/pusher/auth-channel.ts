import { NextApiRequest, NextApiResponse } from 'next'
import { getSocketType, updateUserPresence } from '@/lib/stashbox/presence'
import pusher from '@/lib/pusher'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { socket_id: user_id, channel_name, ...user_info } = req.body;
  const uaString = req.headers['user-agent'] ?? '';
  const socketTYpe = getSocketType(uaString)
  // merge presence data with user info
  const presenceData = {
    user_id: user_id,
    channel_name,
    user_info: {
      ...user_info,
      id: user_id,
      channel: channel_name,
      type: socketTYpe
    }
  }
  // run channel authorization
  const authResponse = pusher.authorizeChannel(user_id, channel_name, presenceData)
  // update presence data
  await updateUserPresence(channel_name, presenceData)
  // return auth response
  return res.send(authResponse)
}
