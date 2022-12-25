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
  `Hold onto your _.`,
  `It's _ it's _! See? Noboty cares.`,
  `Get _ed, peasant.`,
  `_er beware`,
  `I'm _ and don't you forget it.`,
  `I got 99 _ and a _ ain't _`,
  `You _ all the _ you don't _.`,
  `_? Damn near _!`,
  `_ or get off the _`,
  `I'm _ and I'm _`,
  `Gimmme that _! That's not your _!`,
  `If you _ you _. `,
  `East coast girls are _.`,
  `Surf's _!`,
  `Please _ my _.`,
  `All _ and no _ makes _ a _ _.`,
  `And I would know! I'm _ of _.`,
  `There is no _ - only _!`,
  `_ lobster. Rock the _`,
  `I climbed to the top of the _ and saw _`,
  `_?! That's no _!`,
  `Hang _.`,
  
  `_-adena! _ City!`,
  `You _.. and then I'll _.`,
  `If we _ , they win.`,
  `If you _ it they will _...`,
  `What's _ got to do with it?`,
  `_ your _ ya filthty animal.`,
  `Ooops I _ again..`,
  `Cah't you see I'm _ here?!`,
  `I'm glad you _. Follow me into the _...`,
  `When life gives you _, make _.`, 
  `There... has been anohter _.`,
  `_-scratch fever!`,
  `Merry _-mas!`,
  `It is a good day to _.`,
  `If I can't _ then what has this all been about?`,
  `You know, you'd catch more _ with _.`,
  `It's fine. It's _, but it's fine.`,
  `If it's _ you're lookin' for, Andy's not you're _.`,
  `_, _, _.`,
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
];



async function sendBotMessage(room, message) {
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
    || reply.includes(`PunBot`)) {
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

  // // disable chatbots for now
  // return false;

  // // wait bot delay
  // await new Promise(resolve => setTimeout(resolve, botReplyDelay));
  // // query host response
  // // host response X% chance of being sent
  // const sendHost = true //Math.random() > 0.2;
  // let hostResponse = sendHost 
  //   && await fetch('/api/chat/host', {
  //     ...chatFetchConfig,
  //     body: JSON.stringify({ room })
  //   })
  // // get host message
  // const hostMessage = hostResponse && await hostResponse.json();
  // // default reply chance 30%
  // let chance = 0.8;
  // // if host message is empty, reply 100%
  // const reply: string = hostMessage?.message ?? '';
  // if (reply.length == 0 
  //   || reply.endsWith('!')
  //   || reply.endsWith('?')
  //   || reply.includes('_')
  //   || reply.includes('vote')
  //   || reply.includes('voting')
  //   || reply.includes(`PunBot`)) {
  //   chance = 1.0;
  // }
  // // roll for bot reply
  // if (Math.random() > chance) return
  // // wait bot delay
  // await new Promise(resolve => setTimeout(resolve, botReplyDelay));
  // // send bot reply
  // await fetch('/api/chat/bot', {
  //   ...chatFetchConfig,
  //   body: JSON.stringify({ room })
  // })
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
          <div className='hbox'>
            <button className='flex shade'onClick={() => {
                sendBotMessage(room, '')}}
            >BOT BANTER</button>
          </div>
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
