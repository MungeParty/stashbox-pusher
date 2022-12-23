import type { Connection, Player, RoomData } from 'types/types'
import { createContext, useEffect, useState, useContext } from 'react'
import Pusher from 'pusher-js'
import { Defaults, UserMode, PusherChannel } from './constants'
import { useRouter } from 'next/router'

// local data is used to store data that is not persisted
const _localData = {
  data: {
    connection: {
      ...Defaults.Connection
    } as Connection,
    player: {
      ...Defaults.Player,
    } as Player,
    room: {
      ...Defaults.RoomData,
    } as RoomData,
  }
}

// determine if running on server
const isServer = typeof window === 'undefined'

// params provider is used set/get values from local data
function localData(key: string, data: any = null) {
  // if arg passed, mutate data
  if (!isServer && data) {
    _localData.data[key] = {
      ..._localData.data[key],
      ...data
    }
    // strip all nullish values
    for (const name in _localData.data[key]) {
      // skip numbers
      if (typeof _localData.data[key][name] === 'number') continue
      if (_localData.data[key][name] == null) {
        delete _localData.data[key][name]
      }
    }
  }
  // return current data
  return _localData.data[key]
}

export const connectionData = (data: any = null) => localData('connection', data)
export const roomData = (data: any = null) => localData('room', data)
export const playerData = (data: any = null) => localData('player', data)

// pusher client configuration
const app_key = process.env.PUSHER_PUBLIC_APP_KEY
const client_config: any = {
  cluster: process.env.PUSHER_CLUSTER,
  forceTLS: true,
  userAuthentication: {
    endpoint: '/api/pusher/auth-user',
    transport: 'ajax',
    paramsProvider: connectionData
  },
  channelAuthorization: {
    endpoint: '/api/pusher/auth-channel',
    transport: 'ajax',
    paramsProvider: connectionData
  }
}

// creates a new pusher client
function createPusherClient() {
  return new Pusher(app_key, client_config)
}

// connects to pusher channel and returns the channel and
// stateful members, messages, and update values
function useChannel(pusher: Pusher, channelName: string) {
  const [channel, setChannel] = useState<any>(undefined)
  const [members, setMembers] = useState<any[]>(undefined)
  const [messages, setMessages] = useState<any[]>(undefined)
  const [update, setUpdate] = useState<any>(undefined)
  useEffect(() => {
    if (pusher) {
      setChannel(channel => {
        if (channel && channel.name === channelName)
          return channel
        if (channel) {
          pusher.unsubscribe(channel.name)
        }
        if (!channelName) return null
        const connection = pusher.subscribe(channelName)
        // connection events
        connection.bind('pusher:subscription_succeeded', (members: any) => {
          const arr = []
          members.each((member: any) => { arr.push(member) })
          setMembers(arr)
          setMessages([])
          connectionData(members.me.info)
        })
        connection.bind('pusher:subscription_error', (status: any) => {
          console.log('subscription_error', status)
          setChannel(null)
        })
        // member events
        connection.bind('pusher:member_added', (member: any) => {
          setMembers((members: any[]) => ([...members, member]))
        })
        connection.bind('pusher:member_removed', (member: any) => {
          setMembers(members => members.filter((m: any) => m.id !== member.id))
        })
        // message events
        connection.bind('message', (data: any) => {
          setMessages((messages: any[]) => [...messages, data])
        })
        connection.bind('client-message', (data: any) => {
          console.log('pusher evt: client-message')
          // mark client messages with clientMessage flag
          setMessages((messages: any[]) => [...messages, {
            ...data,
            clientMessage: true
          }])
        })
        // status events
        connection.bind('update', (data: any) => {
          // reduce update data to only the changed values
          // const previous = roomData()
          const myId = channel?.members?.me?.user_id ?? null
          const myCon = data?.connections[myId] ?? null
          if (myCon) {
            connectionData(myCon)
            if (!!myCon.user) {
              const myUser = data?.users(myCon.user)
              if (myUser) {
                playerData(myUser)
              }
            }
          }
          // set update room data
          console.log('pusher evt: update')
          setUpdate(roomData(data))
        })
        return connection
      })
    }
    return () => {
      if (channel) {
        channel.unbind_all()
      }
    }
  }, [pusher, channelName])
  return {
    channel,
    members,
    messages,
    update
  }
}

const useRoomConnection = () => {
  // get router
  const router = useRouter()
  // get local room and user
  const { room, user } = connectionData()
  // pusher client state
  const [pusher, setPusherClient] = useState<Pusher>(undefined)
  // connection effect
  useEffect(() => {
    setPusherClient(existing => {
      if (existing) return existing
      const client = createPusherClient()
      client.signin()
      const handler = path => {
        if (!path.startsWith('/room/')) {
          client.disconnect()
          setPusherClient(null)
          // remove handler on disconnect
          router.events.off('routeChangeStart', handler)
        }
      }
      // assign handler to disconnect on route change
      router.events.on('routeChangeStart', handler)
      return client
    })
  }, [])
  // channel names: null if no room/user
  const channelNameRoom = room && PusherChannel.room(room)
  const channelNameUser = user && PusherChannel.user(room, user)
  // channel states: room and user
  const roomChannel = useChannel(pusher, channelNameRoom)
  const userChannel = useChannel(pusher, channelNameUser)
  return {
    roomChannel,
    userChannel
  }
}

const RouteContext = createContext({ room: null, user: null })
export const RouteProvider = ({ children }) => {
  // route-based state hook
  const router = useRouter()
  const { slug } = router.query
  const [room, user] = (slug as string[]) ?? []
  // init local state data
  connectionData({
    room,
    user,
    mode: user ? UserMode.Player : UserMode.Viewer
  })
  return (
    <RouteContext.Provider value={{ room, user }}>
      {children}
    </RouteContext.Provider>
  )
}

// room context and provider
const RoomContext = createContext({ roomChannel: null, userChannel: null })
export const RoomProvider = ({ children }) => {
  const { roomChannel, userChannel } = useRoomConnection()
  return (
    <RoomContext.Provider value={{ roomChannel, userChannel }}>
      {children}
    </RoomContext.Provider>
  )
}

// with route values
export const withRouteParams = Component => props => {
  const { room, user } = useContext(RouteContext)
  return (<Component {...props} room={room} user={user} />)
}

// with room values
export const withRoomChannel = Component => props => {
  const { roomChannel: {
    channel,
    members,
    messages,
    update
  } } = useContext(RoomContext)
  console.log('withRoomChannel', messages?.slice(-1)?.[0]?.message)
  return (<Component {...props} roomChannel={{
    channel,
    members,
    messages,
    update
  }} />)
}

// with user channel values
export const withUserChannel = Component => props => {
  const { userChannel } = useContext(RoomContext)
  return (<Component {...props} userChannel={userChannel} />)
}
