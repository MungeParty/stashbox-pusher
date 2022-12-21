import { Connection, Player } from 'types/types'
import { Defaults, PusherChannel } from '@/store/constants'
import pusher from '@/lib/pusher'

// returns the cached data on a given channel,
// or null if no cache is set
const cacheParams = { info: 'cache' }
async function getChannelCache(channel)
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
async function getChannelUsers(channel)
{
	const response = await pusher.get({
		path: `/channels/${channel}/users`,
	})
	const users = await response.json()
	return users
}

// take presence update from user and update their connection
// data in the presence dataset
export async function updatePresence(
	channel_name: string,
	presence: any
) {
	// get redis presence data
	// const previous:any = await redis.hget(Datasets.Presence, presence.user_id) ?? {}
	const previous = {};
	// merge presence with previous data
	const update = {
		...previous,
		...presence,
		modified: Date.now()
	}
		// if this is the channel for the room the user is in, update
		// presence data for the room and send an update event
		if (channel_name == PusherChannel.room(presence.user_info.room)) {
			updateRoomPresence(channel_name, update)
		}
}

// take presence update from connection and update room data 
async function updateRoomPresence(
	channel_name: string,
	presence:any
) {
	const {
		user_id,
		user_info
	} = presence
  const {
    user: name,
    room: roomCode
  } = user_info
	// get channel cache and users
	const [ response, channelIds ] = await Promise.all([
		getChannelCache(channel_name),
		getUsers(roomCode)
	])
  const connected:Object = channelIds
    ?.reduce((acc, id) => ({
      ...acc,
      [id]: true
  }), {}) ?? {}
	// merge room data with cache
	let update = {
		...Defaults.RoomData,
		...(response ?? {}),
		code: roomCode,
		modified: Date.now()
	}
	// prune offline ids from room data
	update = {
		...update,
		// remove connections that are not in the channel
    // add this connection to the data set
		connections: {
      ...(Object.values(update.connections)
        .reduce((acc, c: Connection) => {
          if (connected[c.id])
            acc[c.id] = c
          return acc
        }, {}) as any),
      [user_id]: user_info
    },
		// remove viewers that are not in the channel
		viewers: update.viewers
			.filter(id => connected[id]),
		// keep user record but remove ids that are not in the channel
		users: Object.values(update.users)
      .reduce((acc, u:any) => {
        acc[u.name] = ({
          ...u,
          ids: (u?.ids ?? []).filter(id => connected[id])
        })
        return acc;
      }, {})
	}
	// update room data with new connection
	if (!!name) {
		// named user update room player data
		const user = {
			...(update?.users[name] ?? Defaults.Player),
      name,
			modified: Date.now()
		}
		if (!user.ids.includes(user_id)) { 
			user.ids.push(user_id)
		}
		// merge player back into list
		update = {
			...update,
			// users are not viewers
			viewers: update.viewers.filter(v => v !== user_id),
			// add/replace user in player data
			users: {
				...update.users,
				[name]: user
			},
			// add user name to player list
			players: [
				...update.players.filter(p => p !== name),
				name
			],
		}
	} else {
		// unnamed user update update viewer data
		update = {
			...update,
			// add user to viewer list
			viewers: [
				...update.viewers.filter(v => v !== user_id),
				user_id
			],
			// viewers are not users/players
			users: Object.values(update.users)
        .reduce((acc:any, u: Player) => ({
					...acc,
					[u.name]: {
						...u,
						ids: u.ids.filter(id => id !== user_id)
					}
				}), {}),
		}
	}
	// trigger channel cache update
	pusher.trigger(channel_name, 'update', update)
	// update rooms cache
	const rooms = await getChannelCache(PusherChannel.rooms()) ?? {}
	rooms[roomCode] = update;
	pusher.trigger(PusherChannel.rooms(), 'update', rooms)
	// return updated room data
	return update
}

// retrieve a list of connected users in a room
export async function getUsers(roomCode: string) {
	const response = await getChannelUsers(PusherChannel.room(roomCode))
	let users:any = []
	if (!!response?.users) {
		try {
			users = Object.values(response.users)
				.map(({ id }:any = {}) => id)
		} catch(e) {
			users = []
		}
	}
	return users
}

// retrieve a list of all rooms
export async function getRooms() {
	const response = await getChannelCache(PusherChannel.rooms())
	let rooms:any = []
	if (!!response) {
		try {
			rooms = Object.values(response)
		} catch(e) {
			rooms = []
		}
	}
	return rooms
}
