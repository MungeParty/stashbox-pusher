import { Head } from 'next/document'

export default ({ title, children }) => (
  <main className='viewport vbox flex shade'>
    <div className='header hbox shade'>{title}</div>
    <div className='hbox flex'>{children}</div>
  </main>
)
