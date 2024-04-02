import request, { Method } from '@/plugins/request.js'

// report user behaviour
export function report(params) {
  return request({
    url: '/behaviour/',
    method: Method.POST,
    needToken: true,
    params
  });
}