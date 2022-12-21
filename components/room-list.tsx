import type { Connection, Player } from 'types/types'
import { useMemo } from 'react'
import Link from 'next/link'
import { withRooms } from '@/store/index'

interface RoomListData {
  code: string,
  viewers: Connection[],
  users: Player[]
}

function RoomList({ rooms }) {
  const { error, data } = useMemo(() => ({
    error: rooms.error,
    data: rooms.data as RoomListData[]
  }), [rooms])

  if (!data) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error: {JSON.stringify(error)}, reloading the page...</div>
  }
  return (
    <div>
      {data.map(
        (item) => {
          const { code, viewers, users } = item
          return (
            <div key={item.code}>
              <br />
              <Link href={`room/${code}`}>
                <div style={{ backgroundColor: 'red' }}>
                  <div>Room: {code}</div>
                  <div>&nbsp;&nbsp;-viewers: {viewers.length}</div>
                  <div>&nbsp;&nbsp;-players: {users.length}
                    {Object.values(users).map(({ name, ids }) =>
                      (<div key={name}>&nbsp;&nbsp;&nbsp;&nbsp;-{name} ({ids.length ?? 0})</div>))}
                  </div>
                </div>
              </Link>
            </div >
          )
        }
      )}
    </div >
  )
}

export default withRooms(RoomList)