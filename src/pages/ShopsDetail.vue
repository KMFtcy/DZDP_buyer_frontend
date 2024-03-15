<template>
  <div style="background: #fff">
    <BaseHeader></BaseHeader>
    <Search></Search>
    <div class="shop-item-path">
      <div class="shop-nav-container">
        <Breadcrumb>
          <BreadcrumbItem to="/">首页</BreadcrumbItem>
          <BreadcrumbItem v-for="(item, index) in categoryBar" :to="goGoodsList(index)" target="_blank" :key="index">
            {{ item.name }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="store-collect" v-if="!takeDownSale">
          <span class="mr_10" v-if="shopsMsg.data">
            <router-link :to="'Merchant?id=' + shopsMsg.data.storeId">{{
              shopsMsg.data.storeName
            }}</router-link>
          </span>
          <span @click="collect">
            <Icon type="ios-heart" :color="storeCollected ? '#ed3f14' : '#666'" />
            {{ storeCollected? "已收藏店铺": "收藏店铺" }}
          </span>
          <span class="ml_10" @click="IMService(shopsMsg.data.storeId,shopsMsg.data.goodsId,shopsMsg.data.id)">联系客服</span>
        </div>
      </div>
    </div>

    <!-- 商品信息展示 -->
    <ShowShops @handleClickSku="targetClickSku" v-if="shopsMsg" :detail="shopsMsg"></ShowShops>
    <!-- 商品详细展示 -->
    <ShowShopsDetail v-if="shopsMsg" :detail="shopsMsg"></ShowShopsDetail>

    <empty _Title='当前商铺已下架' v-if="takeDownSale">
      <div class="sale-btn">
        <Button size="small" class="mr_10" @click="target('/')">返回首页</Button>
        <Button size="small" @click="target('shopsList')">返回商铺列表</Button>
      </div>
    </empty>
    <Spin size="large" fix v-if="isLoading"></Spin>
    <BaseFooter></BaseFooter>
  </div>
</template>

<script>
import Search from "@/components/Search";

import empty from "@/components/empty/Main";
import ShowGoods from "@/components/goodsDetail/ShowGoods";
import ShowGoodsDetail from "@/components/goodsDetail/ShowGoodsDetail";
import ShowShops from "@/components/dzdpShopsDetail/ShowShops";
import ShowShopsDetail from "@/components/dzdpShopsDetail/ShowShopsDetail";
import { goodsSkuDetail } from "@/api/goods";
import { getShopsDetail } from "@/api/dzdpShop";
import {
  cancelStoreCollect,
  collectStore,
  isStoreCollection,
} from "@/api/member";
import { getDetailById } from "@/api/shopentry";
import imTalk from '@/components/mixes/talkIm'
export default {
  name: "GoodsDetail",
  beforeRouteEnter (to, from, next) {
    window.scrollTo(0, 0);
    next();
  },
  mounted () {
    this.getDetail();
  },
  mixins: [imTalk],
  data () {
    return {
      shopsMsg: {}, // 商品信息
      isLoading: false, // 加载状态
      categoryBar: [], // 分类
      storeCollected: false, // 商品收藏
      storeMsg: {}, // 店铺信息
      takeDownSale:false, // 是否下架

    };
  },
  methods: {
    // 跳转首页或商品页面
    target(url){
      this.$router.push({path: url})

    },
    // 点击规格
    targetClickSku (val) {
      this.getDetail(val);
    },
    // 获取商品详情
    getDetail (val) {
      this.isLoading = true;
      const params = val || this.$route.query;

      getShopsDetail(params)
        .then((res) => {
          this.isLoading = false;
          if (res.success) {
            const result = res.result;
            const cateName = res.result.categoryName;
            const cateArr = [];
            this.$set(this, "shopsMsg", res.result);
          } else {
            this.$Message.error(res.message);
            this.isLoading = false
          }
        })
        .catch((e) => {
          console.log(e)
          this.isLoading = false
          if(e.code === 11001){
            this.takeDownSale = true
          }
        });

    },
    goGoodsList (currIndex) {
      // 跳转商品列表
      const arr = [];
      this.categoryBar.forEach((e, index) => {
        if (index <= currIndex) {
          arr.push(e.id);
        }
      });
      return location.origin + "/goodsList?categoryId=" + arr.toString();
    },
    async collect () {
      // 收藏店铺
      if (this.storeCollected) {
        let cancel = await cancelStoreCollect("STORE", this.shopsMsg.data.storeId);
        if (cancel.success) {
          this.$Message.success("已取消收藏");
          this.storeCollected = false;
        }
      } else {
        let collect = await collectStore("STORE", this.shopsMsg.data.storeId);
        if (collect.code === 200) {
          this.storeCollected = true;
          this.$Message.success("收藏店铺成功,可以前往个人中心我的收藏查看");
        }
      }
    },
  },
  watch: {},
  components: {
    Search,
    ShowShops,
    ShowShopsDetail,
    empty
  },
};
</script>
<style scoped lang="scss">
.shop-item-path {
  height: 38px;
  @include background_color($light_background_color);
  line-height: 38px;
  color: #2c2c2c;
}

.shop-nav-container {
  width: 1200px;
  margin: 0 auto;
  position: relative;

  .store-collect {
    position: absolute;
    right: 20px;
    top: 0;
    color: #999;

    span {
      &:hover {
        cursor: pointer;
        color: $theme_color;
      }
    }
  }
}
.sale-btn{
  margin:10px 0

}
</style>
