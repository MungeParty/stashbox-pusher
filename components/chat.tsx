import { useRef, useCallback, useEffect } from 'react';
import { PusherChannel } from '@/store/constants'

export default function ChatMessageView({ room, user, messages, sendMessage }) {
  // container ref
  const containerRef = useRef(null);
	// message ref
	const messageRef = useRef(null);
	// get room channel from connection
	// message click handler
  const isViewer = !user;
	const messageClick = useCallback(() => {
    const message = messageRef.current.value;
    messageRef.current.value = '';
    if (message.legth == 0) return;
    const name = user ?? ``;
    const channel = PusherChannel.room(room);
    sendMessage(name, channel, message, isViewer);
  },	[messageRef, sendMessage])
  
  // handle enter press with click handler
  const handleEnter = useCallback((e) => {
    if (e.key === 'Enter') messageClick()
  }, [messageClick])

  // scroll to bottom on mount and resize
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [containerRef])

  // scroll to bottom on message update
  useEffect(() => {
    const container = containerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [messages, containerRef]);

  // respond to window height changes
  useEffect(() => {
    window.addEventListener('resize', scrollToBottom);
    return () => {
      window.removeEventListener('resize', scrollToBottom);
    };
  }, [scrollToBottom]);

  return (
    <div className='vbox flex chat-area'>
      <div className='vbox flex relative'>
        <div className='vbox absolute all-0 overflow-auto' ref={containerRef}>
          {messages.map(({time, name, message}) => (
            <div className='chat-message' key={`${time}:${name}`}>
              <><span className='chat-name'>{name}:</span>{message}</>
            </div>
          ))}
        </div>
      </div>
      <div className='hbox'>
        <input
          className='flex input shade' 
          type='text'
          ref={messageRef} 
          onKeyDown={handleEnter}
        />
      </div>
    </div>
  );
}
