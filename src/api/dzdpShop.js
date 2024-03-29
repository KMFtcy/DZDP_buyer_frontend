import request, {
  Method
} from '@/plugins/request.js'

// 店铺分页列表
export function getShopCategoryList () {
  return request({
    url: '/dzdp/storeCategory/storeCategoryTree',
    method: Method.GET,
  })
}

export function getShopsList (params) {
  return request({
    url: `/dzdp/storeExtension/storeList`,
    method: Method.GET,
    params
  })
}

export function getShopsDetail (params) {
  return request({
    url: `/dzdp/storeExtension/storeDetail`,
    method: Method.GET,
    params
  })
}

export function getShopsComments (params) {
  return request({
    url: `/dzdp/storeComment/getPage`,
    method: Method.GET,
    params
  })
}

export function postShopsComments (params) {
  return request({
    url: `/dzdp/storeComment/insert`,
    method: Method.POST,
    needToken: true,
    data: params
  })
}

export function obtainOSSToken() {
  return request({
    url: `/dzdp/oss/getToken`,
    method: Method.GET,
    needToken: true
  })
}