import { createContext, useContext, useEffect } from 'react'
import useSWR from 'swr'
import { toast } from 'react-toastify'

export const StateContext = createContext(null)

export default function StateProvider({ children }) {
    const rooms = useSWR(`/api/rooms`, {
        fallbackData: []
    })
    const { error, mutate } = rooms;
    useEffect(() => {
        if (error) {
            toast.error(error.message)
        }
    }, [error])

    const onPublish = async (item) => {
        fetch(`/api/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    toast.error(data.error)
                } else {
                    mutate()
                }
            })
    }

    const onRemove = async (item) => {
        fetch(`/api/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    toast.error(data.error)
                } else {
                    mutate()
                }
            })
    }

    const onVote = async (item) => {
        fetch(`/api/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    toast.error(data.error)
                } else {
                    mutate()
                }
            })
    }

    const onCreate = async (title, callback = () => { }) => {
        fetch(`/api/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title
            })
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    toast.error(data.error)
                } else {
                    toast.info('Your feature has been added to the list.')
                    mutate()
                    callback()
                }
            })
    }
    const value = {
        rooms,
        onPublish,
        onRemove,
        onVote,
        onCreate

    }
    return (
        <StateContext.Provider value={value}>
            {children}
        </StateContext.Provider >
    )
}

export const withRooms = (Component) => (props) => {
  const { rooms, error: roomsErr } = useContext(StateContext);
  return (
    <Component {...props} rooms={rooms} roomsErr={roomsErr} />
  )
}
