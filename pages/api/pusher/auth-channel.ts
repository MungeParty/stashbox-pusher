import { NextApiRequest, NextApiResponse } from 'next'
import pusher from '@/lib/pusher'
import { updatePresence } from '@/lib/records'
import { parse } from 'next-useragent'

// get memory-cached socket type name from ua string
const types = {}
function getSocketType(uaString) {
  if (uaString in types) {
    return types[uaString]
  }
  if (uaString.length == 0)
    types[uaString] = 'unknown'
  else{
    const ua = parse(uaString)
    types[uaString] = ua.os.split(' ')[0] ?? ua.browser
  }
    return types[uaString]
}

// authorize a channel
const authorize = (user_id, channel_name, user_info) => {
  const authResponse = pusher.authorizeChannel(
    user_id, 
    channel_name, 
    user_info
  )
  return authResponse
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// get user id, channel name, and user info from request body
  const { socket_id: user_id, channel_name, ...user_info } = (req.body ?? {}) as any;
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
  const authResponse = authorize(user_id, channel_name, presenceData)
  // update presence data
  await updatePresence(channel_name, presenceData)
  // return auth response
  return res.send(authResponse)
}
