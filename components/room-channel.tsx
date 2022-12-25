import { useMemo } from 'react'
import { withRoomChannel } from '@/store/pusher'
import ChatMessageContainer from './chat';
import QuizPrompt from './prompt';

const chatFetchConfig: any = {
  method: 'POST',
  cache: 'no-cache',
  next: { revalidate: 0 }, 
  headers: { 'Content-Type': 'application/json' }
};

// bot reply delay
const botReplyDelay = 200;
const prompts = [
  `You know, you'd catch more _ with _.`,
  `I find the most _ part of the _ is the _.`,
  `We always _ what we can't _.`,
  `Keep _ and carry _.`,
  `Like a good _, _ is there!`,
  `Fifteen _ could save you _ or more on _.`,
  `Silly _, _ are for _!`,
  `The _ part of waking up, is _ in your _.`,
  `I'll never go back to _ after what happened. I found a _ in my _!`,
  `We all love to _ sometimes, don't we?`,
  `The best way to _ is to just _ it till it's _.`,
  `The best way to impress a first date is to _ their _ with your _ skills.`,
  `I can't believe I got fired from my job as a _ for _ in front of the boss.`,
  `I never thought I'd find love at a _, but then when I saw _ I knew it was meant to be.`,
]

async function sendClientMessage(user, room, message, isViewer) {
  // console.log('sendClientMessage', user, room, message);
  await fetch('/api/chat', {
    ...chatFetchConfig,
    body: JSON.stringify({
      user,
      room,
      message,
      isViewer
    })
  })
  // wait bot delay
  await new Promise(resolve => setTimeout(resolve, botReplyDelay));
  // query host response
  // host response X% chance of being sent
  const sendHost = true //Math.random() > 0.2;
  let hostResponse = sendHost 
    && await fetch('/api/chat/host', {
      ...chatFetchConfig,
      body: JSON.stringify({ room })
    })
  // get host message
  const hostMessage = hostResponse && await hostResponse.json();
  // default reply chance 30%
  let chance = 0.8;
  // if host message is empty, reply 100%
  const reply: string = hostMessage?.message ?? '';
  if (reply.length == 0 
    || reply.endsWith('!')
    || reply.endsWith('?')
    || reply.includes('_')
    || reply.includes('vote')
    || reply.includes('voting')
    || reply.includes("PunBot")) {
    chance = 1.0;
  }
  // roll for bot reply
  if (Math.random() > chance) return
  // wait bot delay
  await new Promise(resolve => setTimeout(resolve, botReplyDelay));
  // send bot reply
  await fetch('/api/chat/bot', {
    ...chatFetchConfig,
    body: JSON.stringify({ room })
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
    async (user, room, message, isViewer) => { 
      await sendClientMessage(user, room, message, isViewer)
    }
	const { messages = [] } = update || {} as any;
  return (
		<div className='vbox flex'>
			<div className='hbox flex'>
        <div className='vbox flex relative'>
          <div className='vbox absolute all-0 overflow-auto'>
            <div className='header shade'>
              <div className='player header'>Test Prompts</div>
              <div className='viewers'>TAP or CLICK any field in a prompt below and start typing, then press the SUBMIT/NEXT button on your mobile keybord (ENTER key on desktop) to submit your solution to chat. <br /><br />If there are more empty fields in that prompt, submitting a field will automatically cycle you to the next empty field until they're all filled.</div>
            </div>
            {prompts.map(prompt => (
              <QuizPrompt 
                key={prompt}
                promptText={prompt}
                onComplete={response => {
                  if (response?.filled?.length) {
                    sendMessage(user, room, response.filled, !user);
                  }
                }}
              />
            ))}
          </div>
        </div>
        <div className='vbox flex sidebar shade'>
          <UserList update={update} />
          <ChatMessageContainer
            room={room}
            user={user}
            messages={messages}
            sendMessage={sendMessage}
          />
        </div>
      </div>
		</div>
	)
}

export default withRoomChannel(RoomChannel)
