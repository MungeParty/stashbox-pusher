import { NextApiRequest, NextApiResponse } from 'next'
import { completeMessages } from '@/lib/openai'
import configuration from '@/lib/openai/bot'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const prompt = req.query.prompt
  const messages = [{ name: 'User', message: prompt }]
  const response = await completeMessages(messages, configuration)
  res.status(200).json(response)
}
