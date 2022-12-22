import { createContext, useContext } from 'react'
import useSWR from 'swr'

export const StateContext = createContext(null)

export default function StateProvider({ children }) {
    const rooms = useSWR(`/api/rooms`, {
        fallbackData: []
    })
    return (
        <StateContext.Provider value={rooms}>
            {children}
        </StateContext.Provider >
    )
}

export const withRooms = (Component) => (props) => {
  const rooms = useContext(StateContext);
  console.log('value context' ,rooms)
  return (
    <Component {...props} rooms={rooms} />
  )
}
