import { NextApiResponse } from 'next'

export const noCache = (res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
  return res
}
