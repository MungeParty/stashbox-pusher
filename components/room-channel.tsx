import { useMemo } from 'react'
import { withRouteParams, withRoomChannel } from '@/store/pusher'
import ChatMessageContainer from './chat';

async function sendMessage(name, channel, message) {
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
  console.log('sentClientMessage', name, channel, data)
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

const UserList = ({ roomChannel }) => {
  const { update } = roomChannel; 
  const { connections, viewers = [], users, players = [] } = ( update ) ?? {} as any;
  const { playerList, viewerList } = useMemo(() => {
    return {
      playerList: players.map((player) => ({...users[player]})),
      viewerList: viewers.map((viewer) => ({...connections[viewer]}))
    }
  }, [connections, viewers, users, players])
  return (
    <div className='user-list hilite'>
      <>
        <PlayerList playerList={playerList} />
        <ViewerList viewerList={viewerList} />
      </>
    </div>
  )
}

function RoomChannel({ roomChannel }) {// members list
	const { update } = roomChannel;
	const { messages = [] } = update || {};
  console.log('RoomChannel', messages.slice(-1)[0]?.message)
	return (
		<div className='vbox flex'>
			<div className='hbox flex'>
        <div className='vbox flex'>
        </div>
        <div className='vbox sidebar shade'>
          <UserList roomChannel={roomChannel} />
          <ChatMessageContainer messages={messages} sendMessage={sendMessage} />
        </div>
      </div>
		</div>
	)
}

export default withRouteParams(withRoomChannel(RoomChannel))
