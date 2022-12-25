import { useRef, useCallback, useEffect, useState } from 'react';

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
    sendMessage(user, room, message, isViewer);
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
  const [isKbOpen, setIsKbOpen] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < window.innerWidth) {
        setIsKbOpen(true);
      } else {
        setIsKbOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div className='vbox flex chat-area'>
      <div className='vbox flex relative'>
        <div 
          className={`vbox absolute all-0 overflow-auto${
            isKbOpen ? ' justify-end' : ''}`}
          ref={containerRef}
        >
          {messages.map(({time, name, message}) => (
            <p className='chat-message' key={`${time}:${name}`}>
              <span key={name} className='chat-name'>{name}:</span>
              {
                message.split('<').reduce(
                  (acc, part, ) => {
                    if (part.includes('>')) {
                      const [answer, nextPart] = part.split('>');
                      return [
                        ...acc, 
                        <span key={`${name}-${acc.length}`} className='blank'>{answer}</span>,
                        nextPart
                      ]
                    }
                    return [...acc, part]
                  },[]
                )
              }
            </p>
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
