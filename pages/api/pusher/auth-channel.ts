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
  const update = await updateUserPresence(channel_name, presenceData)
  const { room, players = [] } = (update ?? {}) as any
  if (room) {
    // update successful, revalidate cache
    await Promise.all([
      res.revalidate(`/api/auth-user`),
      res.revalidate(`/api/auth-channel`),
      res.revalidate(`/rooms/${room}`),
      ...players.map(player => res.revalidate(`/rooms/${room}/${player}`))
    ])
  }
  // return auth response
  res.send(authResponse)
}
