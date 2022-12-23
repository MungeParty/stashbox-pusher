import { RoomProvider, connectionData } from '@/store/pusher';
import Container from '@/components/container';
import RoomChannel from '@/components/room-channel';
import Loading from '@/components/loading';

export async function getServerSideProps({ query, res }) {
  if (res) res.setHeader('Cache-Control', 'no-store');
  return { props: { query } }
}

export default function Room(props) {
  const { query } = props;
  const { slug: [room, user] } = query;
  return (
    <Container title={!room
      ? 'Loading...'
      : `Stashbox Room: ${room}`}>
      {!room
        ? <Loading />
        : (
          <RoomProvider room={room} user={user}>
            <RoomChannel room={room} user={user} />
          </RoomProvider>
        )}
    </Container>
  )
}
