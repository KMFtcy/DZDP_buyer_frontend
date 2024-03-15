<template>
  <div class="wrapper">
    <div class="item-detail-show">
      <div id="basic-info" class="basic-info default nug_shop_ab_pv-a"> <s class="cover J_cover"></s>
        <h1 class="shop-name"> {{ detail.storeName }} </h1>
        <div class="brief-info">
          <div class="star-wrapper">
            <Rate disabled :value="Number(detail.descriptionScore)" allow-half class="remarks-star"></Rate>
            <div class="mid-score score-40">{{ detail.descriptionScore }}</div>
          </div> <span id="reviewCount" class="item">{{detail.commentNum}}条评价</span>
            <span id="comment_score">
              <span class="item">描述评分：{{ detail.descriptionScore }}</span>
              <span class="item">物流评分：{{ detail.deliveryScore }}</span>
              <span class="item">服务评分：{{ detail.serviceScore }}</span>
            </span>
          </div>
        <div class="expand-info address" itemprop="street-address">
          <span class="info-name">地址：</span>
          <div id="J_map-show" class="map_address">
            <span class="item" itemprop="street-address" id="address"> {{ detail.storeAddressDetail }} </span>
            <div class="addressIcon"></div>
          </div>
        </div>
        <p class="expand-info tel"> <span class="info-name">电话：</span> {{ detail.phone }} </p>
        <p class="expand-info tel"> <span class="info-name">营业时间：</span> {{ detail.businessHour }} </p>
        <div class="action">
          <a class="write left-action" href="//www.dianping.com/shop/k7oNYLP4CBg2Wi2E/review"
            target="_blank" rel="nofollow" data-click-name="写评价">
            <i class="icon"></i>
            <span id="dpReviewBtn">写评价</span>
          </a>
        </div>
      </div>
      <div class="store-image">
        <img :src="detail.storeImages[0].url">
      </div>
    </div>
  </div>
</template>

<script>
import PicZoom from "vue-piczoom"; // 图片放大
import DPlayer from "dplayer";
import {
  collectGoods,
  isCollection,
  receiveCoupon,
  cancelCollect,
} from "@/api/member.js";
import { addCartGoods } from "@/api/cart.js";

export default {
  name: "ShowShops",
  props: {
    // 商品数据
    detail: {
      type: Object,
      default: null,
    },
  },
  watch: {
    detail: {
      handler(val) {
        this.skuDetail = val.data;
        this.wholesaleList = val.wholesaleList;
        if (this.wholesaleList && this.wholesaleList.length > 0) {
          this.count = this.wholesaleList[0].num;
        }

      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      showGoodsVideo: false,
      goodsVideo: "",
      wholesaleList: [],
      count: 1, // 商品数量
      imgIndex: 0, // 展示图片下标
      currentSelceted: [], // 当前商品sku
      imgList: [], // 商品图片列表
      skuDetail: {
        specList: [],
      }, // sku详情
      goodsSpecList: this.detail.specs, // 商品spec
      promotionMap: {
        // 活动状态
        SECKILL: null,
        FULL_DISCOUNT: null,
        COUPON: [],
      }, // 促销活动
      formatList: [], // 选择商品品类的数组
      loading: false, // 立即购买loading
      loading1: false, // 加入购物车loading
      isCollected: false, // 是否收藏
      images: {
          'normal_size':  // required
          [
            {'id':'unique id', 'url': 'image url'},
            {'id':'unique id', 'url': 'image url'}
          ]
        }
    };
  },
  components: { PicZoom },
  computed: {
  },
  methods: {
  },
  mounted() {
    console.log(this.detail)
    // document.title = this.skuDetail.goodsName;
  },
};
</script>

<style scoped lang="scss">
#basic-info {
  --rem: 16;
  --swiper-theme-color: #007aff;
  --swiper-navigation-size: 44px;
  color: #282828;
  font: 12px/1.5 PingFangSC-Regular, 'Hiragino Sans GB', Helvetica;
  -webkit-font-smoothing: auto;
  outline: 0;
  position: relative;
  margin: 0;
  width: 700px;
  background-color: #fff;
  margin-right: 0;
  min-height: 187px;
  border: 1px solid #f0f0f0;
  padding: 18px 20px 50px;
  height: initial;
}

.store-image{
  position: relative;
  width: 300px;
  min-height: 187px;
  background-color: #fff;
  margin-left: 10px;
  border: 1px solid #f0f0f0;
}

.store-image img{
  max-width: 100%;
  max-height: 100%;
  display: block;
  margin: auto;
}

#basic-info>h1 {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 22px;
  line-height: 33px;
  margin-top: -7.5px;
  color: #333;
  font-weight: 700;
}

#basic-info>div.brief-info {
  margin: 0;
  padding: 0;
  border: 0;
  margin-top: 6px;
  font-size: 14px;
  color: #ebebeb;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
}

#basic-info>div.expand-info.address {
  margin: 0;
  padding: 0;
  border: 0;
  font-family: 'PingFangSC-Regular-address';
  font-size: 14px;
  margin-top: 7px;
  height: 28px;
  line-height: 28px;
  color: #666;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
}

#basic-info>p {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 14px;
  margin-top: 6px;
  color: #666;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
}

#basic-info>div.action {
  outline: 0;
  margin: -8px 0;
  padding: 0;
  border: 0;
  position: absolute;
  bottom: 15px;
  right: 15px;
  height: 36px;
  left: 20px;
}

#basic-info>div.action>a {
  margin: 0;
  border: 0;
  outline: 0;
  text-decoration: none;
  cursor: pointer;
  float: left;
  color: #fff;
  width: 120px;
  height: 34px;
  line-height: 34px;
  background: #FF794D;
  border-radius: 1px;
  padding: 0;
  font-size: 0;
  text-align: center;
  margin-right: 8px;
}

#basic-info>div.brief-info>div {
  --rem: 16;
  --swiper-theme-color: #007aff;
  --swiper-navigation-size: 44px;
  font: 12px/1.5 PingFangSC-Regular, 'Hiragino Sans GB', Helvetica;
  -webkit-font-smoothing: auto;
  font-size: 14px;
  color: #ebebeb;
  outline: 0;
  margin: 0;
  padding: 0;
  border: 0;
  display: inline-flex;
  align-items: center;
}

div.brief-info.item {
  font-size: 14px;
  outline: 0;
  padding: 0;
  border: 0;
  margin: 0 10px;
  vertical-align: middle;
  color: #666;
  margin-right: 0;
}

#basic-info>div.action>a {
  -webkit-tap-highlight-color: transparent;
  margin: 0;
  border: 0;
  outline: 0;
  text-decoration: none;
  cursor: pointer;
  float: left;
  color: #fff;
  width: 120px;
  height: 34px;
  line-height: 34px;
  background: #FF794D;
  border-radius: 1px;
  padding: 0;
  font-size: 0;
  text-align: center;
  margin-right: 8px;
}

#basic-info>div.action>a>i {
  cursor: pointer;
  color: #fff;
  line-height: 34px;
  font-size: 0;
  text-align: center;
  outline: 0;
  font-style: normal;
  margin: 0;
  padding: 0;
  border: 0;
  display: inline-block;
  vertical-align: middle;
  width: 16px;
  height: 16px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAjVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8DizOFAAAALnRSTlMAifn9SvQH7NmrfkMwHwvLuZFmWBT24NLGuF1OPjQZEAPxwbSke268m5qLclM6+4uWvAAAAM1JREFUOMu10dkOgjAQheFhabGgoiKKC4r7ft7/8SwlcYlDiSaeq0m+/27oX+tuVydp8wOAjaz3NcJI6MLiRHOBieQ9K70qCsaXGUTbXBEwYzyGcgNThPByzh3yTbED9h8+HGsnU1jcFALegPdqivNF6+FOs0+/9s6bJ58+enG3ya+cq6czD3AA17c4xd5RF5X7jA+9jPqatKec0xQhlYVCGhG3LW5UFhC8U7AqSEZnV8x5zxFfJila/TbxS4BADTpUO5nkBf2+HqzrNQZ3lu0fMOGbbw4AAAAASUVORK5CYII=) no-repeat;
  background-size: contain;
  padding-right: 3px;
  margin-right: 0;
}

#dpReviewBtn {

  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  color: #fff;
  line-height: 34px;
  text-align: center;
  outline: 0;
  margin: 0;
  padding: 0;
  border: 0;
  display: inline-block;
  vertical-align: middle;
  font-size: 16px;
}

#basic-info .brief-info .item {
  margin: 0 10px;
  color: #666;
}

.info .info-indent {
 
  font-size: 12px;
  color: #666;
  outline: 0;
  margin: 0;
  padding: 0;
  border: 0;
  position: relative;
  padding-left: 70px;
  margin-top: 10px;
}

/******************商品图片及购买详情开始******************/
.item-detail-see {
  width: 175px;
  margin-left: 30px;
}

.flex {
  display: flex;
}

.inventory {
  padding-left: 4px;
}

.wrapper {
  @include white_background_color();
}

.item-num {
  text-align: center;
  width: 100px;
}

.item-price-num {
  font-size: 16px;
  color: #666;
}

.item-detail-show {
  width: 1200px;
  margin: 0 auto;
  padding: 30px;
  display: flex;
  flex-direction: row;
}

.item-detail-left {
  width: 350px;

  margin-right: 30px;
}

.item-detail-big-img {
  width: 350px;
  height: 350px;
  box-shadow: 0px 0px 8px $border_color;
  cursor: pointer;



}

#dplayer {
  width: 100%;
  height: 100%;
}

.item-detail-big-img img {
  width: 100%;
}

.item-detail-img-row {
  margin-top: 15px;
  display: flex;
}

.item-detail-img-small {
  width: 68px;
  height: 68px;
  box-shadow: 0px 0px 8px #ccc;
  cursor: pointer;
  margin-left: 5px;
}

.item-detail-img-small img {
  height: 100%;
  width: 100%;
}

/*商品选购详情*/
.item-detail-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-detail-title p {
  @include content_color($light_content_color);
  font-weight: bold;
  font-size: 20px;
  padding: 8px 0;
}

.item-detail-express {
  font-size: 14px;
  padding: 2px 3px;
  border-radius: 3px;
  background-color: $theme_color;
  color: #fff;
}

/*商品标签*/
.item-detail-tag {
  padding: 8px 0;
  font-size: 12px;
  color: $theme_color;
}

/*价格详情等*/
.item-detail-price-row {
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: url("../../assets/images/goodsDetail/price-bg.png");
}

.item-price-left {
  display: flex;
  flex-direction: column;
}

.item-price-title {
  color: #999999;
  font-size: 14px;
  margin-right: 15px;
}

.item-price-row {
  margin: 5px 0px;
}

.item-price {
  color: $theme_color;
  font-size: 20px;
  cursor: pointer;
}

.item-price-old {
  color: gray;
  text-decoration: line-through;
  font-size: 14px;
  margin-left: 5px;
}

.item-price-coupon-row {
  display: flex;
  align-items: center;
  margin: 5px 0px;
}

.Ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2; //控制显示几行
  -webkit-box-orient: vertical; //webbox方向
}

.dropdown {
  position: relative;
  display: inline-block;
  cursor: pointer;
  z-index: 999;
}

.dropdown .item-coupon {
  display: flex;
  align-content: center;
  align-items: center;
  color: $theme_color;
  margin: 5px 0;
  font-size: 12px;
  background-color: #ffdedf;
  border: 1px dotted $theme_color;
  cursor: pointer;

  span {
    padding: 3px;
  }
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.item-coupon {
  margin-right: 5px;
  padding: 0 5px;
  color: $theme_color;
  font-size: 12px;
  background-color: #ffdedf;
  border: 1px dotted $theme_color;
  cursor: pointer;

  span {
    padding: 3px;
  }
}

.item-promotion {
  margin-right: 5px;
  padding: 3px;
  color: $theme_color;
  font-size: 12px;
  border: 1px solid $theme_color;
}

.item-price-right {
  display: flex;
  align-content: center;
  align-items: center;
}

.item-remarks-sum {
  width: 70px;
  text-align: center;
  padding: 0 10px;
  border-left: 1px solid $border_color;
}

.item-remarks-sum p {
  color: #999999;
  font-size: 12px;
  line-height: 10px;
  text-align: center;
}

.item-remarks-num {
  line-height: 18px;
  color: #005eb7;
}

.item-select {
  display: flex;
  flex-direction: row;
  margin-top: 15px;
}

.item-select-title {
  @include content_color($light_content_color);
  font-size: 14px;
  margin-right: 15px;
  width: 60px;
}

.item-select-column {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.item-select-row {
  margin-bottom: 8px;
}

.item-select-box {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.item-select-box {
  padding: 5px;
  margin-right: 8px;
  @include background_color($light_background_color);
  border: 0.5px solid $border_color;
  cursor: pointer;
  @include content_color($light_content_color);
}

.item-select-box:hover {
  border: 0.5px solid $theme_color;
}

.item-select-box-active {
  border: 0.5px solid $theme_color;
}

.item-select-intro p {
  margin: 0px;
  padding: 5px;
}

.add-buy-car-box {
  width: 100%;

  margin-top: 15px;
  border-top: 1px dotted $border_color;
}

.add-buy-car {
  display: flex;
  align-items: center;
  margin-top: 15px;

  >* {
    margin: 0 4px;
  }
}

.goodsConfig {
  display: flex;
  justify-content: space-between;

  >span {
    padding-right: 10px;

    &:hover {
      cursor: pointer;
      color: $theme_color;
    }
  }
}

.sell-point {
  font-size: 12px;
  color: red;
  margin-bottom: 5px;
}

.view-video {
  cursor: pointer;
}

/******************商品图片及购买详情结束******************/
</style>
