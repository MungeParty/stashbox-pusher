import { RoomProvider, connectionData } from '@/store/pusher';
import Container from '@/components/container';
import RoomChannel from '@/components/room-channel';
import Loading from '@/components/loading';

export default function Room() {
  const { room, user } = connectionData()
  return (
    <Container title={!room
      ? 'Loading...'
      : `Stashbox Room: ${room}`}>
      {!room
        ? <Loading />
        : (
          <RoomProvider>
            <RoomChannel room={room} user={user} />
          </RoomProvider>
        )}
    </Container>
  )
}
