import { useMemo } from 'react'
import { withRoomChannel } from '@/store/pusher'
import ChatMessageContainer from './chat';

const chatFetchConfig: any = {
  method: 'POST',
  cache: 'no-cache',
  next: { revalidate: 0 }, 
  headers: { 'Content-Type': 'application/json' }
};

async function sendClientMessage(name, channel, message) {
  console.log('sendClientMessage', name, channel, message);
  await fetch('/api/chat', {
    ...chatFetchConfig,
    body: JSON.stringify({
      name,
      channel_name: channel,
      message
    })
  })
  // query host
  // const hostResp = 
  await fetch('/api/chat/host', {
    ...chatFetchConfig,
    body: JSON.stringify({ channel_name: channel })
  })
  // only query bot if host STFU
  // const hostRespJson = await hostResp.json();
  // if (hostRespJson) return;
  // query bot for a response
  await fetch('/api/chat/bot', {
    ...chatFetchConfig,
    body: JSON.stringify({ channel_name: channel })
  })
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

function RoomChannel({ room, user, roomChannel }) {
	const { update } = roomChannel;
  const sendMessage = 
    async (name, channel, message) => { 
      await sendClientMessage(name, channel, message)
    }
	const { messages = [] } = update || {} as any;
  return (
		<div className='vbox flex'>
			<div className='hbox flex'>
        <div className='vbox flex'>
        </div>
        <div className='vbox sidebar shade'>
          <UserList update={update} />
          <ChatMessageContainer room={room} user={user} messages={messages} sendMessage={sendMessage} />
        </div>
      </div>
		</div>
	)
}

export default withRoomChannel(RoomChannel)
