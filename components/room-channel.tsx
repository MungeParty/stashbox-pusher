import styles from 'styles/Home.module.css'
import { withRouteParams, withRoomChannel } from '@/store/pusher'
import { useCallback } from 'react';

function sendClientMessage(user, channel) {
    if (!channel) return
    const message = {
        text: `${user || '[unknown]'} sent a message`,
    }
    channel.trigger('client-message', message)
}

function RoomChannel({ user, roomChannel }) {
    // get room channel from connection
    // message click handler
    const messageClick = useCallback(() =>
        sendClientMessage(user, roomChannel.channel),
        [user, roomChannel.channel])
    // members list
    const { members: presenceData, messages, update } = roomChannel;
    const messageList = (messages || []).map((message, index) => {
        return <li key={index}>{message.text}</li>
    })
    // pressence list
    const presentClients = (presenceData || []).map(({ id, info }, index) => (
        <li key={id}>{id}: {info?.user ?? (`[${info.type}]`)}</li>
    ))
    // render
    return (
        <main className={styles.main}>
            <ul>{presentClients}</ul>
            <div>
                <button className={styles.button} onClick={messageClick}>
                    Send A Message
                </button>
            </div>
            <ul>{messageList}</ul>
        </main>
    )
}

export default withRouteParams(withRoomChannel(RoomChannel))
