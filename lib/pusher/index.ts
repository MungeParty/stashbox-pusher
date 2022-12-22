import Pusher from 'pusher';

function getPusherServer() {
	return new Pusher({
		appId: process.env.PUSHER_APP_ID,
		key: process.env.PUSHER_KEY,
		secret: process.env.PUSHER_SECRET,
		cluster: process.env.PUSHER_CLUSTER,
		useTLS: true,
	});
}

// declare pusher server as a singleton
const pusher = getPusherServer()

// returns the cached data on a given channel,
// or null if no cache is set
const cacheParams = { info: 'cache' }
export async function getChannelCache(channel)
{
	const response = await pusher.get({
		path: `/channels/${channel}`,
		params: cacheParams
	})
	const { cache } = await response.json()
	if (!cache) return null;
	const { data } = cache
	if (typeof data == 'string')
		return JSON.parse(data)
	return data
}

// get the users in a given channel
export async function getChannelUsers(channel)
{
	const response = await pusher.get({
		path: `/channels/${channel}/users`,
	})
	const users = await response.json()
	return users
}

export default pusher
