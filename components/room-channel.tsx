import { useMemo } from 'react'
import { withRoomChannel } from '@/store/pusher'
import ChatMessageContainer from './chat';

const chatFetchConfig: any = {
  method: 'POST',
  cache: 'no-cache',
  next: { revalidate: 0 }, 
  headers: { 'Content-Type': 'application/json' }
};

const botReplyDelay = 200;

async function sendClientMessage(name, channel, message, isViewer) {
  console.log('sendClientMessage', name, channel, message);
  await fetch('/api/chat', {
    ...chatFetchConfig,
    body: JSON.stringify({
      name,
      channel_name: channel,
      message,
      isViewer
    })
  })
  // await 1s timeout
  await new Promise((resolve) => setTimeout(resolve, botReplyDelay));
  // query host response
  // host response X% chance of being sent
  const sendHost = Math.random() > 0.2;
  let hostResponse = sendHost 
    && await fetch('/api/chat/host', {
      ...chatFetchConfig,
      body: JSON.stringify({ channel_name: channel })
    })
  const hostMessage = hostResponse && await hostResponse.json();
  console.log(hostMessage);
  // bot chain response X% chance of being sent
  // if host didnt reply, always send bot
  if (!hostMessage?.message && Math.random() > 0.3)
    return;
  // await 1s timeout
  await new Promise((resolve) => setTimeout(resolve, botReplyDelay)); 
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
    async (name, channel, message, isViewer) => { 
      await sendClientMessage(name, channel, message, isViewer)
    }
	const { messages = [] } = update || {} as any;
  return (
		<div className='vbox flex'>
			<div className='hbox flex'>
        {/* <div className='vbox flex'>
        </div> */}
        <div className='vbox flex sidebar shade'>
          <UserList update={update} />
          <ChatMessageContainer room={room} user={user} messages={messages} sendMessage={sendMessage} />
        </div>
      </div>
		</div>
	)
}

export default withRoomChannel(RoomChannel)
