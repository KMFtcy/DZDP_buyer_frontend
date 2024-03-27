<template>
  <div style="height:auto;">
    <div class="item-intro-show">
      <div class="item-intro-detail" ref="itemIntroDetail">
        <div class="item-intro-nav item-tabs">
          <div class="remarks-container" ref="itemGoodsComment">
            <div class="remarks-bar"> </div>
            <div class="review-body">
              <div class="title">我要评价</div>
              <div class="metric-star metric-star-wrapper">
                <div class="metric-star-item">
                  <div class="rc-rate-name">总体评价<em class="rc-rate-required">*</em></div>
                  <span>
                    <Rate v-model="overallRate" allow-half @on-change="overallRateChange" />
                  </span>
                  <div class="rc-rate-desc ">点击星星给商户打分</div>
                </div>
                <div class="metric-star-item">
                  <div class="rc-rate-name">环境<em class="rc-rate-required">*</em></div>
                  <span>
                    <Rate v-model="envRate" allow-half @on-change="onChange" />
                  </span>
                  <div class="rc-rate-desc ">给环境打分</div>
                </div>
                <div class="metric-star-item">
                  <div class="rc-rate-name">服务<em class="rc-rate-required">*</em></div>
                  <span>
                    <Rate v-model="serviceRate" allow-half @on-change="onChange" />
                  </span>
                  <div class="rc-rate-desc ">给服务打分</div>
                </div>
                <div class="metric-star-item">
                  <div class="rc-rate-name">师资<em class="rc-rate-required">*</em></div>
                  <span>
                    <Rate v-model="cateRate" allow-half @on-change="onChange" />
                  </span>
                  <div class="rc-rate-desc ">给教师打分</div>
                </div>
              </div>
              <div class="text-area-module">
                <div class="module-title-text">评价<em class="required">*</em></div>
                <div>
                  <div class="comment-body"><textarea class="comment-text-area" placeholder="亲，菜品的口味如何，环境怎么样，服务满意吗？"
                      v-model="commentText"
                      style="overflow: hidden; overflow-wrap: break-word; resize: horizontal; height: 190px;"></textarea>
                  </div>
                </div>
              </div>
              <div class="upload-image-module">
                <div class="module-title">上传图片</div>
                <div class="upload-wrapper">
                  <div class="demo-upload-list" v-for="item in uploadList">
                    <template v-if="item.status === 'finished'">
                      <img :src="item.url" width="100%" height="100%" />
                      <div class="demo-upload-list-cover">
                        <Icon type="ios-eye-outline" @click="handleView(item.name)"></Icon>
                        <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
                      </div>
                    </template>
                    <template v-else>
                      <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                    </template>
                  </div>
                  <Upload :action="ossEndpoint" :data="ossSTSObj" ref="upload" :show-upload-list="false"
                    :on-success="handleSuccess" :format="['jpg', 'jpeg', 'png']" :max-size="10240"
                    :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize"
                    :before-upload="handleBeforeUpload" type="drag" style="display: inline-block;width:58px;">
                    <div style="width: 58px;height:58px;line-height: 58px;">
                      <Icon type="ios-camera" size="20"></Icon>
                    </div>
                  </Upload>
                  <div class="upload-desc">单张图片不超过10MB，尺寸不小于300*300px，支持jpg、png和bmp格式</div>
                </div>
              </div>
              <!-- <div class="expense-module">
                <div class="expense-item">
                  <div class="module-title">人均</div>
                  <div class="expense-wrapper"><input class="expense-input" value="" data-title="人均" data-index="0">
                    <div class="unit">元</div>
                  </div>
                </div>
              </div> -->
              <div class="warn">
                评价和打分都将是其他网友的参考依据，并影响该商户评价。请发布真实、客观的本人消费体验评价。如您收到威
                或并非本人体验的虚假/恶意评价，则评价视为违规，同时影响您的信誉度
              </div>
              <div class="btn-block-module">
                <div class="btn-block-wrapper">
                  <div class="btn-wrapper">
                    <!-- <button class="btn btn-1 btn-save"><span>保存草稿</span></button> -->
                    <button class="btn btn-2" @click="comment()"><span>发表评价</span></button>
                  </div>
                  <!-- <div class="save-auto-hide">评价已经在 自动保存</div> -->
                </div>
                <!-- <div class="save-success-hide">保存成功，此草稿仅可在PC端使用</div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { goodsComment, goodsCommentNum } from '@/api/member.js';
import { getShopsComments } from '../../api/dzdpShop';
import { postShopsComments, obtainOSSToken } from '../../api/dzdpShop';
import { v4 as uuidv4 } from 'uuid';
export default {
  name: 'CommentBody',
  props: {
    detail: { // 商品详情
      type: Object,
      default: null
    }
  },
  watch: {
    detail: {
      handler(val) {
        this.getCommentsList()
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      commentList: [], // 评论列表
      commentParams: { // 评论传参
        pageNumber: 1,
        pageSize: 10,
        grade: '',
        storeId: ''
      },
      commentTypeNum: {}, // 评论数量，包括好中差分别的数量
      commentTotal: 0, // 评论总数
      onceFlag: true, // 只调用一次
      overallRate: 0,
      envRate: 0,
      serviceRate: 0,
      cateRate: 0,
      commentText: "",
      tips: ['不满意', '糟糕', '一般', '优秀', '非常满意'],
      ossEndpoint: "",
      ossSTSObj: {},
      imgName: '',
      visible: false,
      uploadList: [],
    };
  },
  computed: {
    // 商品详情
    shopDetail() {
      return this.detail;
    }
  },
  methods: {
    show() {
      this.$viewerApi({
        images: this.images,
      })
    },
    getCommentsList() { // 获取评论列表
      this.commentParams.storeId = this.shopDetail.id;
      getShopsComments(this.commentParams).then(res => {
        if (res.success) {
          this.commentList = res.result.records
          this.commentTotal = res.result.total;
        } else {
          this.$Message.error(res.message);
          this.isLoading = false
        }
      })
        .catch((e) => {
          console.log(e)
          this.isLoading = false
        });
      // goodsCommentNum(this.skuDetail.goodsId).then(res => {
      //   if (res.success) {
      //     this.commentTypeNum = res.result;
      //   }
      // });
    },
    changePageNum(val) { // 修改评论页码
      this.commentParams.pageNumber = val;
      this.getCommentsList();
    },
    changePageSize(val) { // 修改评论页数
      this.commentParams.pageNumber = 1;
      this.commentParams.pageSize = val;
      this.getCommentsList();
    },
    changeHeight(name) { // 设置商品详情高度
      let heightCss = window.getComputedStyle(this.$refs[name]).height;
      heightCss = parseInt(heightCss.substr(0, heightCss.length - 2)) + 89;
      this.$refs.itemIntroDetail.style.height = heightCss + 'px';
    },
    handleScroll() { // 监听页面滚动
      if (this.onceFlag) {
        this.$nextTick(() => {
          this.changeHeight('itemGoodsComment')
        });
        this.onceFlag = false
      }
    },
    previewImg(img, item) { // 预览图片
      this.$set(item, 'previewImg', img);
      this.$nextTick(() => {
        this.changeHeight('itemGoodsComment')
      });
    },
    updateCommentsHeight() {
      this.changeHeight('itemGoodsComment')
    },
    onChange(value) {
      // console.log('你打了' + value + '分');
    },
    overallRateChange(value) {
      this.envRate = value;
      this.serviceRate = value;
      this.cateRate = value;
    },
    deleteImage(index) {
      this.images.splice(index, 1)
      console.log(this.images)
    },
    comment() {
      let uploadImages = []
      this.uploadList.forEach(function (val, index, arr) {
        uploadImages.push(val.url)
      });
      const postParams = {
        comment: this.commentText,
        // consumption: "",
        environmentScore: this.envRate,
        images: uploadImages,
        serviceScore: this.serviceRate,
        starNum: this.overallRate,
        storeId: this.shopDetail.id,
        varietyScore: this.cateRate
      };
      postShopsComments(postParams)
        .then((res) => {
          if (res.success) {
            this.$Message.success("评论分享成功！");
            // 跳转回商铺页面
            let routeUrl = this.$router.push({
              path: "/shopsDetail",
              query: { id: this.shopDetail.id },
            });
          } else {
            this.$Message.warning(res.message);
          }
        })
        .catch(() => {
          this.$Message.error(res.message);
          //   });
        })
    },
    handleRemove(file) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },
    handleSuccess(res, file) {
      console.log(this.ossSTSObj.host + "/" + this.ossSTSObj.key.replace("${filename}", file.name))
      file.url = this.ossSTSObj.host + "/" + this.ossSTSObj.key.replace("${filename}", file.name)
      // file.name = file.name;
    },
    handleFormatError(file) {
      this.$Message.warning('图片格式错误！')
    },
    handleMaxSize(file) {
      this.$Message.warning('图片大小超出限制！')
    },
    handleBeforeUpload() {
      const check = this.uploadList.length < 9;
      if (!check) {
        this.$Message.warning('最多上传9张图片！')
        return check;
      }
      let _self = this;
      return new Promise((resolve, reject) => {
        obtainOSSToken()
          .then(response => {
            let result = response.result
            _self.ossSTSObj.policy = result.policy;
            _self.ossSTSObj.signature = result.signature;
            _self.ossSTSObj.ossaccessKeyId = result.accessid;
            _self.ossSTSObj.key = result.dir + "/" + uuidv4() + "_${filename}";
            _self.ossSTSObj.dir = result.dir;
            _self.ossSTSObj.host = result.host;
            _self.ossEndpoint = result.host;
            resolve(true);
          })
          .catch(err => {
            console.log("出错了...", err)
            reject(false);
          });
      });
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    this.getCommentsList();
    setTimeout(this.updateCommentsHeight, 500);
    this.uploadList = this.$refs.upload.fileList;
  }
};
</script>
<style scoped lang="scss">
.item-intro-show {
  width: 1200px;
  margin: 15px auto;
  display: flex;
  overflow-x: hidden;
  flex-direction: row;
}

.item-intro-detail {
  margin: 0 30px;
  width: 100%;
  border: 1px solid #f0f0f0;
}

.remarks-bar {
  height: 36px;
  line-height: 36px;
  color: #666666;
  background-color: #F7F7F7;

  .selectedBar {
    color: $theme_color;
  }
}

.review-body {
  box-sizing: border-box;
  padding: 24px 60px 46px 20px;
  background: #fff;
}

.title {
  --rem: 16;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  margin: 0;
  padding: 0;
  border: 0;
  vertical-align: baseline;
  box-sizing: border-box;
  font-family: PingFangSC-Semibold;
  font-size: 16px;
  color: #333;
  margin-bottom: 17px;
}

#__dx_app__>div>div.review-module>div.review-left>div.review-body>div.metric-star.metric-star-wrapper {
  --rem: 16;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  margin: 0;
  padding: 0;
  border: 0;
  vertical-align: baseline;
  box-sizing: border-box;
  background-color: #fff;
  font-family: PingFangSC-Regular;
  font-size: 14px;
}

.metric-star-item {
  --rem: 16;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  margin: 0;
  padding: 0;
  border: 0;
  vertical-align: baseline;
  box-sizing: border-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  margin-bottom: 16px;
}

.rc-rate-name,
.module-title-text {
  --rem: 16;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  margin: 0;
  padding: 0;
  border: 0;
  vertical-align: baseline;
  box-sizing: border-box;
  width: 88px;
  height: 24px;
  line-height: 24px;
  text-align: right;
  color: #333;
  margin-right: 12px;
}

.rc-rate-required,
.required {
  --rem: 16;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  font-family: PingFangSC-Regular;
  text-align: right;
  margin: 0;
  padding: 0;
  border: 0;
  vertical-align: baseline;
  font-style: normal;
  color: #f63;
  font-size: 14px;
  line-height: 20px;
}

.text-area-module {
  display: flex;
  margin-bottom: 13px;
  margin-top: -3px;
}

.metric-star .rc-rate-desc {
  font-size: 12px;
  color: #999;
}

.warn {
  --rem: 16;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  margin: 0;
  border: 0;
  vertical-align: baseline;
  box-sizing: border-box;
  width: 690px;
  height: 54px;
  padding: 10px;
  background: #f6f6f6;
  font-family: PingFangSC-Regular;
  font-size: 12px;
  line-height: 17px;
  color: #999;
  margin-left: 100px;
  margin-bottom: 16px;
}

.btn-block-wrapper {
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  margin-left: 100px;
}

.btn-wrapper {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.btn {
  --rem: 16;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  background-color: transparent;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  width: 88px;
  height: 34px;
  cursor: pointer;
  border-radius: 2px;
  font-family: PingFangSC-Regular;
  font-size: 16px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  outline: 0;
  margin: 0;
  padding: 0;
  border: 1px solid #f63;
  color: #f63;
}

.btn-save {
  margin-right: 10px;
}

.btn-2 {
  background: #f63;
  color: #fff;
}

.comment-body {
  width: 690px;
  position: relative;
  border: 1px solid #ccc;
}

.comment-body .comment-text-area {
  width: 100%;
  height: 190px;
  background-color: #fff;
  padding: 5px 10px 34px;
  font-family: PingFangSC;
  font-size: 14px;
  line-height: 20px;
  color: #333;
  border: none;
  outline: none;
}

.comment-body .emoji-wrap {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 29px;
  background: #f6f6f6;
}

.upload-image-module {
  display: flex;
  margin-bottom: 15px;
}

.module-title {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  line-height: 20px;
  color: #333;
  margin-right: 20px;
  width: 80px;
  text-align: right;
}

.upload-image-module .upload-info {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  margin-bottom: 13px;
  position: relative;
}

.upload-image-module .upload-image {
  width: 80px;
  height: 24px;
  left: 0;
  top: 0;
  position: absolute !important;
  opacity: 0;
  cursor: pointer;
}

.upload-image-module input {
  cursor: pointer;
}

.btn-image-upload span {
  z-index: 10;
  cursor: pointer;
}

.upload-image-module .btn-upload {
  width: 80px;
  height: 24px;
  margin-right: 10px;
  font-size: 14px;
  cursor: pointer;
}

.upload-image-module .upload-module {
  cursor: pointer;
}

.upload-images {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  position: relative;
}

.images-preview {
  position: relative;
  display: flex;
  // top: -108px;
  // right: -42px;
}

.corner {
  position: relative;
  top: -95px;
  right: -70px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: rgba(200, 200, 200, 0.8);
  font-size: 18px;
  text-align: center;
  line-height: 20px;
  cursor: pointer;
}

.demo-upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  // border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
  margin-right: 4px;
}

.demo-upload-list img {
  width: 100%;
  height: 100%;
}

.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, .6);
}

.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}

.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
</style>