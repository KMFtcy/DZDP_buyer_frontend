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