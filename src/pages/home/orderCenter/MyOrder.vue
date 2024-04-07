<template>
  <div class="wrapper">
    <!-- 卡片组件 -->
    <card _Title="我的评论" :_Size="16" v-if="!homePage"></card>
    <card _Title="我的评论" :_Size="16" _More="全部评论" _Src="/home/MyOrder" v-else>
    </card>
    <!-- 搜索 筛选 -->
    <div class="mb_24 box" v-if="!homePage">
      <div class="global_float_right">
        <!-- <Input class="width_300" search enter-button v-model="params.keywords" @on-search="getList"
          placeholder="搜索评论" /> -->
        <div class="goods-list-tool">
          <ul>
            <li v-for="(item, index) in goodsTool" :key="index" @click="orderBy(item.en, index)">
              <span :class="{ 'goods-list-tool-active': index === sortIndex }">{{ item.title }}
                <Icon :class="{ 'reverse': item.order === 'asc' }" type="ios-arrow-round-down" />
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 订单列表 -->
    <empty v-if="commentList.length === 0" />
    <div class="remarks-box" v-for="(item, index) in commentList" :key="index" v-else>
      <div class="remarks-user">
        <Avatar :src="item.memberProfile" />
        <span class="remarks-user-name">{{ item.memberName | secrecyMobile }}</span>
      </div>
      <div class="remarks-content-box">
        <p>
          <Rate disabled :value="Number(item.starNum)" allow-half class="remarks-star"></Rate>
        </p>
        <p class="remarks-content">{{ item.comment }}</p>
        <div class="comment-img" v-if="item.images">
          <div v-for="(img, imgIndex) in item.images" :class="{ borderColor: img === item.previewImg }" :key="imgIndex">
            <el-image style="width: 50px;height: 50px;" :src="img" :preview-src-list="item.images"></el-image>
          </div>
        </div>
        <p class="remarks-sub">
          <span class="remarks-item">{{ item.createdTime }}</span>
          <!-- <span class="remarks-time">{{item.createdTime}}</span> -->
        </p>
      </div>
    </div>
    <!-- 分页 -->
    <div class="page-size" v-if="!homePage">
      <Page :total="total" @on-change="changePageNum" @on-page-size-change="changePageSize" :page-size="params.pageSize"
        show-total show-sizer>
      </Page>
    </div>
  </div>
</template>

<script>
import { getComments } from '@/api/order';
import { Image, Loading } from 'element-ui'
export default {
  name: 'MyOrder',
  components: { elImage: Image },
  props: {
    homePage: { // 判断是否个人中心首页展示内容
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      params: { // 请求参数
        pageNumber: 1,
        pageSize: 10,
        sort: 'createdTime',
        order: 'asc'
      },
      total: 0, // 数据总数
      commentList: [],
      sortIndex: 0,
      goodsTool: [
        { title: "评论时间", en: "createdTime", order: 'asc' },
        { title: "综合评分", en: "starNum", order: 'asc' }
      ],
    };
  },
  mounted () {
    if (this.homePage) this.params.pageSize = 5;
    this.getCommentList();
  },
  methods: {
    getCommentList() {
      let loading = Loading.service({text: '加载中'})
      getComments(this.params).then(res => {
        if (res.success && res.result) {
          this.commentList = res.result.records;
          this.total = res.result.total;
        }
      }).finally(() => {
        loading && loading.close()
      })
    },
    
    changePageNum (val) { // 修改页码
      this.params.pageNumber = val;
      this.getCommentList()
    },
    changePageSize (val) { // 修改页数
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getCommentList()
    },
    orderBy(data, index) {
      this.sortIndex = index;
      this.params.sort = data;
      const item = this.goodsTool[index];
      item['order'] = (item['order'] === 'asc') ? 'desc' : 'asc';
      this.params.order = item['order'];
      this.getCommentList();
    },
  }
};
</script>

<style scoped lang="scss">
.wrapper {
  margin-bottom: 40px;
}
.box {
  overflow: hidden;
}
.page-size {
  margin: 15px 0px;
  text-align: right;
}
.remarks-box {
  padding: 15px;
  display: flex;
  flex-direction: row;
  border-bottom: 1px #ccc dotted;
}

.remarks-user {
  width: 180px;
}

.remarks-user-name {
  padding-left: 15px;
}

.remarks-content-box {
  width: calc(100% - 180px);

  .comment-img {
    display: flex;

    .borderColor {
      border-color: $theme_color;
    }

    div {
      border: 1px solid #999;
      margin-right: 5px;
      width: 50px;
      height: 50px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  .preview-img {
    position: relative;
    border: 1px solid #eee;
    margin: 10px 0;
    width: 200px;

    div {
      position: absolute;
      top: 3px;
      left: 3px;
      z-index: 3;

      span {
        display: inline-block;
        background-color: rgba(0, 0, 0, .5);
        padding: 3px 5px;
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
      }

      span:nth-child(1) .ivu-icon {
        transform: rotateY(180deg);
      }
    }

  }
}
.remarks-content {
  font-size: 14px;
  color: #232323;
  line-height: 28px;
}

.remarks-sub {
  margin-top: 5px;
  color: #ccc;
}

.remarks-time {
  margin-left: 15px;
}
.goods-list-tool {
  width: 100%;
  height: 38px;
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

.reverse {
  transform: rotate(180deg);
}
</style>
