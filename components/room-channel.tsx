import { useMemo, useCallback } from 'react'
import { withRouteParams, withRoomChannel } from '@/store/pusher'
import useSWR from 'swr'
import ChatMessageContainer from './chat';

async function sendClientMessage(name, channel, message) {
  console.log('sendClientMessage', name, channel, message)
  const resp = await fetch('/api/chat', {
		method: 'POST',
		headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate'
    },
		cache: 'no-cache',
    next: { revalidate: 0 },
    body: JSON.stringify({ 
			channel_name: channel,
			name,
			message
		})
	})
  const data = await resp.json();
  // console.log('sentClientMessage', name, channel, data)
  return data;
}

const PlayerList = ({ playerList }) => (<>
  {(playerList || []).filter(({ids}) => ids.length).map(({ name, id, ids }) => (
      <p className='player' key={`player-${name}`}>
        {name} <span className='subtext'>{`${ids.length}`}</span>
      </p>
  ))}
  {(playerList || []).filter(({ids}) => !ids.length).map(({ name, id, ids }) => (
      <p className='player offline' key={`player-${name}`}>
        {name} <span className='subtext'>{`${ids.length}`}</span>
      </p>
  ))}
</>)

const ViewerList = ({ viewerList }) => (
  <div className='viewers hilite' key={'viewers'}>
    Viewers: {viewerList.length}
  </div>
)

const UserList = ({ update }) => {
  const { modified, connections, viewers = [], users, players = [] } = ( update ) ?? {} as any;
  const { playerList, viewerList } = useMemo(() => {
    return {
      playerList: players.map((player) => ({...users[player]})),
      viewerList: viewers.map((viewer) => ({...connections[viewer]}))
    }
  }, [modified, connections, viewers, users, players])
  return (
    <div className='user-list hilite'>
      <>
        <PlayerList playerList={playerList} />
        <ViewerList viewerList={viewerList} />
      </>
    </div>
  )
}

function RoomChannel({ roomChannel }) {
	const { channel } = roomChannel;
	const { name: channelName } = channel || {};

  // const { mutate } = rooms
  const { data, mutate } = useSWR(
    channelName && `/api/rooms/status?channel_name=${channelName}`, {
    fallbackData: {},
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshWhenHidden: true,
    refreshWhenOffline: true,
    shouldRetryOnError: true,
    errorRetryInterval: 500,
    errorRetryCount: 3,
    dedupingInterval: 100,
    focusThrottleInterval: 100,
    loadingTimeout: 100,
    refreshInterval: 100,
  });

  const sendMessage = async (name, channel, message) => {
    if (!message) return;
    const update = await sendClientMessage(name, channel, message)
    mutate(update, { revalidate: true })
  }
  console.log('RoomChannel', data)
	const { messages = [] } = data || {} as any;
  
  return (
		<div className='vbox flex'>
			<div className='hbox flex'>
        <div className='vbox flex'>
        </div>
        <div className='vbox sidebar shade'>
          <UserList update={data} />
          <ChatMessageContainer messages={messages} sendMessage={sendMessage} />
        </div>
      </div>
		</div>
	)
}

export default withRouteParams(withRoomChannel(RoomChannel))
