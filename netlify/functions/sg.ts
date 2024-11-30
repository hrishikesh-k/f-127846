import type { Config, Context } from '@netlify/functions'
import { type IncomingHttpHeaders, request } from 'node:http'
import { resolve4 } from 'node:dns'

export default async function(_: Request, context: Context) {

  const ips = await new Promise<string[]>((resolve, reject) => {
    resolve4('sendgrid.net', (err, addresses) => {
      if (err) {
        reject(err)
      }
      resolve(addresses)
    })
  })
  
  const headers = await new Promise<IncomingHttpHeaders>((resolve, reject) => {
    const req = request({
      headers: {
        host: 'email.tejalshinde.com'
      },
      hostname: ips[0],
      method: 'GET',
      path: '/ls/click?upn=' + context.url.searchParams.get('upn'),
      port: 80
    }, (res) => {
      req.destroy()
      resolve(res.headers)
    })
    req.on('error', (err) => {
      reject(err)
    })
  })

  return new Response('', {
    headers: {
      location: headers.location || '',
      'x-robots-tag': 'nofollow, noindex'
    },
    status: 302
  })
  
}

export const config: Config = {
  path: '/'
}