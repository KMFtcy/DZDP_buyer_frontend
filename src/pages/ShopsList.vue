<template>
  <div class="wrapper">
    <BaseHeader></BaseHeader>
    <Search @search="handleSearch"></Search>

    <div class="container">
      <!-- 商品筛选栏 -->
      <ShopsClassNav @getParams="getParams"></ShopsClassNav>

      <!-- 商品展示容器 -->
      <div class="goods-box">
        <!-- 商品列表 -->
        <div class="goods-list-box">
          <!-- 排序 -->
          <div class="goods-list-tool">
            <ul>
              <li v-for="(item, index) in goodsTool" :key="index" @click="orderBy(item.en, index)">
                <span :class="{ 'goods-list-tool-active': index === sortIndex }">{{ item.title }}
                  <Icon type="ios-arrow-round-down" />
                </span>
              </li>
              <li @click="orderBy('consumptionAvg', 5, 'up')" class="price-sort">
                <span :class="{ 'goods-list-tool-active': 5 === sortIndex }">
                  价格
                  <div>
                    <Icon type="md-arrow-dropup" :class="{ 'price-color': sortPriceIndex == 'desc' }" />
                    <Icon type="md-arrow-dropdown" :class="{ 'price-color': sortPriceIndex == 'asc' }" />
                  </div>
                  <!-- <Icon type="ios-arrow-round-down" :class="{ reverse: params.order == 'asc'}" /> -->

                </span>
              </li>
            </ul>
          </div>
          <!-- 列表 -->
          <div class="goods-list">
            <empty v-if="shopsList.length === 0" />
            <div v-else class="goods-show-info" v-for="(item, index) in shopsList" :key="index"
              @click="goGoodsDetail(item.id)">
              <div class="goods-show-img">
                <img width="172" height="129" :src="item.storeLogo" />
              </div>
              <div class="goods-show-title-wrap">
                <p class="goods-show-title">{{ item.storeName }}</p>
                <div class="goods-show-row">
                  <!-- <div class="goods-show-price">
                    <span>
                      <span class="seckill-price text-danger">{{
                        item.price | unitPrice("￥")
                        }}</span>
                    </span>
                  </div> -->
                  <!-- <div class="goods-show-detail">
                    <Tag v-if="item.salesModel === 'WHOLESALE'" class="goods-show-tag" color="purple">
                      批发
                    </Tag>
                    <span>{{ item.goodsName }}</span>
                  </div> -->
                  <!-- <div class="goods-show-num">
                    已有<span>{{ item.commentNum || 0 }}</span>人评价
                  </div> -->
                  <!-- <div class="goods-show-right">
                    <Tag class="goods-show-tag" color="red" v-if="item.selfOperated">自营</Tag>
                    <Tag class="goods-show-tag" color="blue" v-if="item.goodsType === 'VIRTUAL_GOODS'">
                      虚拟
                    </Tag>
                    <Tag class="goods-show-tag" color="blue" v-else-if="item.goodsType === 'PHYSICAL_GOODS'">
                      实物
                    </Tag>
                  </div> -->
                </div>
                <div class="goods-show-desc">
                  <div class="goods-show-desc-up">
                    <!-- <Rate allow-half disabled :model-value="item.starAvg || 0" /> -->
                    <Rate allow-half disabled v-model="item.starAvg" />
                    <!-- <p><span>{{ item.starAvg || 0 }}</span>评分 </p> -->
                    <p><span>{{ item.commentNum || 0 }}</span>条评价 </p>
                    <p>人均：<span>{{ item.consumptionAvg | unitPrice("￥") || 0 }}</span></p>
                  </div>
                  <div class="goods-show-desc-middle">
                    <p>{{ item.categoryName }}</p>
                    <p>{{ item.storeAddressPath }}</p>
                  </div>
                  <!-- <div class="goods-show-desc-down">团购：xxxx</div> -->
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div class="goods-page">
        <Page show-total show-sizer @on-change="changePageNum" @on-page-size-change="changePageSize" :total="total"
          :page-size="params.pageSize"></Page>
      </div>
    </div>
    <Spin size="large" fix v-if="loading"></Spin>
    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
import GoodsClassNav from "@/components/nav/GoodsClassNav";
import ShopsClassNav from "@/components/nav/ShopsClassNav";
import * as apiGoods from "@/api/goods";
import * as apiDZDPShop from "@/api/dzdpShop";
export default {
  name: "ShopsList",
  beforeRouteEnter(to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
  data() {
    return {
      sortIndex: 0, // 排序状态
      sortPriceIndex: false, // 判断价格升序还是降序
      goodsTool: [
        // 排序类型
        { title: "综合", en: "" },
        // { title: "销量", en: "buyCount" },
        { title: "评论数", en: "commentNum" },
        // { title: "新品", en: "releaseTime" },
        { title: "评分", en: "starAvg" }, // 添加评分排序选项
      ],
      shopsList: [], // 商品列表
      loading: false, // 加载状态
      total: 0, // 列表总数
      params: {
        // 请求参数
        pageNumber: 0,
        pageSize: 20,
        categoryId: "",
      },
    };
  },
  watch: {
    $route() {
      const keyword = this.$route.query.keyword;
      if (keyword) {
        this.handleSearch(keyword);
      }
      if (this.$route.query.categoryId) {
        let cateId = this.$route.query.categoryId.split(",");
        Object.assign(this.params, this.$route.query);
        this.params.categoryId = cateId[cateId.length - 1];
      }
      if (this.$route.query.promotionType) {
        this.params.promotionType = this.$route.query.promotionType;
      }
      if (this.$route.query.promotionsId) {
        this.params.promotionsId = this.$route.query.promotionsId;
      }
      this.getShopsList();
    },
  },
  methods: {
    // 搜索
    handleSearch(key) {
      this.params.keyword = key;
      this.$route.query.keyword = key
      this.params.pageNumber = 0;
      this.getShopsList();
    },
    orderBy(data, index) {
      // 排序
      this.sortIndex = index;
      this.params.sort = data;
      this.params.order = "desc"; //默认设置为降序
      if (data === "consumptionAvg") {
        if (!this.sortPriceIndex) {
          this.sortPriceIndex = "asc";
        } else {
          this.sortPriceIndex === "desc"
            ? (this.sortPriceIndex = "asc")
            : (this.sortPriceIndex = "desc");
        }
        this.params.order = this.sortPriceIndex;
      } else {
        this.sortPriceIndex = false;
      }
      this.getShopsList();
    },
    goGoodsDetail(shopId) {
      // 跳转商品详情
      let routeUrl = this.$router.push({
        path: "/shopsDetail",
        query: { id: shopId},
      });
    },
    // 分页 修改页码
    changePageNum(val) {
      this.params.pageNumber = val;
      this.getShopsList();
    },
    // 分页 修改页数
    changePageSize(val) {
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getShopsList();
    },

    // 获取商品列表
    getShopsList() {
      this.loading = true;
      apiDZDPShop
        .getShopsList(this.params)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.shopsList = res.result.records;
            this.total = res.result.total;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    getParams(val) {
      // 筛选条件回显
      Object.assign(this.params, val);
      this.getShopsList();
    },
  },
  created() {
    if (this.$route.query.categoryId) {
      let cateId = this.$route.query.categoryId.split(",");
      Object.assign(this.params, this.$route.query);
      this.params.categoryId = cateId[cateId.length - 1];
    } else {
      Object.assign(this.params, this.$route.query);
    }
    this.getShopsList();
  },
  components: {
    ShopsClassNav,
  },
};

</script>

<style scoped lang="scss">
@import "../assets/styles/goodsList.scss";
.cate-nav{
  margin-top: 10px;
}

// 商品项样式调整
.goods-show-info {
  display: flex;
  flex: 1;
  min-width: 100%;
  flex-direction: row; // 更改为横向布局
  align-items: center; // 居中对齐子元素
  // margin-bottom: 20px; // 增加商品项之间的间距
  margin: 1px auto;
  width: 948px;
  height: 172px;
}

.goods-show-img {
  // 如果需要，调整图片容器的样式
  flex-shrink: 0; // 防止图片缩放
  width: 172px; // 图片宽度，根据需要调整
  height: 129px; // 图片高度，根据需要调整
  margin-right: 20px; // 在图片和详情之间增加右边距
  margin-left: 20px;
}

.goods-show-seller {
  font-size: 16px; // 商品名称字体大小
  margin-bottom: 10px; // 商品名称与下面内容的间距
  margin-top: 20px;
}

.goods-show-num,
.goods-show-tag {
  font-size: 14px; // 这两个详情的字体稍小
  margin-bottom: 10px; // 和下面内容的间距
}

.goods-show-num {
  margin-bottom: 0;
}

.goods-show-title{
    margin-top: 30px;
    margin-bottom: 10px; // 和下面内容的间距
}

.goods-show-info > .goods-show-seller > .goods-show-buyer {
  width: 35px;
  height: 17px;
  white-space: nowrap;
  line-height: 17px;
  text-align: center;
  align-content: center;
  padding: 0 3px;
  background-color: #e23a3a;
}

.goods-show-tag {
  // height: 18px;
  // width: 32px;
  // line-height: 14px;
  white-space: nowrap;
  text-align: center;
  align-items: center;
  padding: 0 3px;
}

.goods-show-seller {
  // padding:3px 0;
  vertical-align: middle;
}

.container {
  width: 90%;
  margin:25px auto 15px auto;
  // width: 1184px;
  min-width: 400px;
  position: relative;
}
.price-sort:hover {
  color: #e23a3a;
}
.goods-box {
  display: block;
}

.goods-show-title-wrap {
  align-self: flex-start;
  .goods-show-title {
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 1.5;
    color: #333;
  }
}

// .goods-show-row {
//   display: flex;
//   align-items: center;
//   .goods-show-price {
//     margin-top: 0 !important;
//   }
// }

.goods-show-desc {
  &-up {
    display: flex;
    align-items: center;
       // 这里添加新的span元素样式
    & > p {
      color: solid #ccc; // 仅作为示例，表示字体颜色设置为红色
      margin-left: 10px; // 示例，表示左外边距设置为10px
    }
  
    & > p {
      padding-left: 10px;
      border-left: 1px solid #ccc;
    }
  }
  &-middle {
    margin: 10px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    & > p:first-of-type {
      padding-right: 10px;
      border-right: 1px solid #ccc;
    }
  }
  // &-down {
  //   padding-top: 10px;
  //   border-top: 1px dashed #ccc;
  // }
}

/* ---------------侧边广告栏开始------------------- */

.goods-show-right {
  display: flex;
  flex-direction: row;
}

.goods-list {
  width: 100%;
}

/* ---------------商品栏开始------------------- */
.goods-list-box {
  position: relative;
  // width:100%;
  // width: 948px;
  // align-items: center; // 居中对齐子元素
  // margin-left: 15px;
  // width: calc(100% - 215px);
}
.goods-list-tool {
  width: 100%;
  height: 38px;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}
.goods-list-tool ul {
  padding-left: 15px;
  font-size: 12px;
  margin-top: 10px;
  &::after {
    content: "";
    display: block;
    clear: left;
  }

  .price-sort {
    span {
      font-size: 11.6px;
      display: inline-block;
      vertical-align: middle;
      width: 55.34px;
      height: 22px;
      position: relative;
      line-height: 14.3px;
      top: -2px;
      left: 0;
    }
    span > div {
      display: inline-block;
      .ivu-icon {
        font-size: 12px;
        vertical-align: middle;
        position: absolute;
        &:nth-child(1) {
          top: 1px;
        }
        &:nth-child(2) {
          top: 7px;
        }
      }
      .price-color {
        color: #b3b3b3;
      }
    }
  }
}
.goods-list-tool li {
  cursor: pointer;
  float: left;
}
.goods-list-tool span {
  padding: 3px 5px;
  border: 1px solid #ccc;
  margin-left: -1px;
  background-color: #fff;
}
.goods-list-tool span:hover {
  border-color: $theme_color;
  position: relative;
  text-decoration: none;
  z-index: 1;
}
.goods-list-tool .ivu-icon {
  font-weight: bold;
  font-size: 16px;
}
.goods-list-tool-active {
  color: #fff;
  border-left: 1px solid #ccc;
  background-color: $theme_color !important;
}

// .reverse {
//   transform: rotate(180deg);
// }
/* ---------------商品栏结束------------------- */
</style>
