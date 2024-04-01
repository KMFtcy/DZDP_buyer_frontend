<template>
  <div class="person-msg">
    <Form ref="thirdForm" :model="form" :rules="rules" :label-width="140">
      <h4>基础信息</h4>
      <FormItem prop="storeName" label="店铺名称">
        <Input type="text" v-model="form.storeName" placeholder="请填写店铺名称" />
      </FormItem>

      <FormItem prop="storeLogo" label="店铺logo">
        <div class="upload-image-module">
          <div class="upload-wrapper">
            <div class="demo-upload-list" v-for="item in uploadList">
              <template v-if="item.status === 'finished'">
                <img :src="item.url" width="100%" height="100%" />
                <div class="demo-upload-list-cover">
                  <Icon type="ios-eye-outline" @click="handleView(item.url)"></Icon>
                  <Icon type="ios-trash-outline" @click="handleRemove(item)"></Icon>
                </div>
              </template>
              <template v-else>
                <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
              </template>
            </div>
            <Upload :action="ossEndpoint" :data="ossSTSObj" ref="upload" :show-upload-list="false"
              :on-success="handleSuccess" :format="['jpg', 'jpeg', 'png']" :max-size="10240"
              :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize" :before-upload="handleBeforeUpload"
              type="drag" style="display: inline-block;width:58px;">
              <div style="width: 58px;height:58px;line-height: 58px;">
                <Icon type="ios-camera" size="20"></Icon>
              </div>
            </Upload>
            <div class="upload-desc">单张图片不超过10MB，尺寸不小于300*300px，支持jpg、png和bmp格式</div>
          </div>
        </div>
      </FormItem>
      <FormItem prop="phone" label="店铺联系电话">
        <Input type="text" v-model="form.phone" placeholder="请填写店铺联系电话" />
      </FormItem>
      <FormItem prop="goodsManagementCategory" label="店铺经营类目">
        <Select v-model="form.goodsManagementCategory" style="width: 300px">
          <Option v-for="(item, index) in categoryList" :value="index" :key="item.id">{{ item.name }}</Option>
        </Select>
      </FormItem>

      <FormItem prop="storeAddressIdPath" label="店铺所在地">
        <span>{{ form.storeAddressPath || '暂无地址' }}</span>
        <Button type="default" style="margin-left: 10px;" @click="$refs.map.open()">选择</Button>
      </FormItem>
      <FormItem prop="storeAddressDetail" label="店铺详细地址">
        <Input type="text" v-model="form.storeAddressDetail" placeholder="请填写店铺详细地址" />
      </FormItem>
      <FormItem prop="storeDesc" label="店铺简介">
        <Input type="textarea" v-model="form.storeDesc" maxlength="200" show-word-limit :rows="4"
          placeholder="请输入店铺简介" />
      </FormItem>
      <FormItem prop="openingHours" label="营业时间">
        <Input type="text" v-model="form.openingHours" placeholder="请填写店铺营业时间" />
      </FormItem>

      <FormItem>
        <Button @click="$router.push('/')">返回</Button>
        <Button type="primary" :loading="loading" @click="next">提交平台审核</Button>
      </FormItem>
    </Form>
    <Modal title="View Image" v-model="visible">
      <img :src="previewPicture" v-if="visible" style="width: 100%" />
    </Modal>
    <multipleMap ref="map" @callback="getAddress" />
  </div>
</template>
<script>
import { applyThird } from '@/api/shopentry';
import { getCategory } from '@/api/goods';

import storage from '@/plugins/storage';
import { commonUrl } from '@/plugins/request.js';

import { getShopCategoryList } from "@/api/dzdpShop";

import multipleMap from "@/components/map/multiple-map";
import { obtainOSSToken } from '../../api/dzdpShop';
import { v4 as uuidv4 } from 'uuid';
import TinyQueue from 'tinyqueue';

export default {
  props: {
    content: {
      default: {},
      type: Object
    }
  },
  components: { multipleMap },
  data() {
    return {
      loading: false, // 加载状态
      uploadLoading: false, // 上传加载状态
      action: commonUrl + '/common/common/upload/file', // 上传地址
      accessToken: {}, // 验证token
      previewPicture: '', // 预览图片

      visible: false, // 图片预览
      form: { // 表单数据
        storeLogo: []
      },
      rules: { // 验证规则
        goodsManagementCategory: [
          { required: true, message: '请选择店铺经营类目' }
        ],
        storeName: [{ required: true, message: '请填写店铺名称' }],
        storeLogo: [{ required: true, message: '请上传店铺logo' }],
        phone: [{ required: true, message: '请填写店铺联系电话' }],
        storeDesc: [{ required: true, message: '请填写店铺简介' }],
        storeCenter: [{ required: true, message: '请选择店铺位置' }],
        storeAddressIdPath: [{ required: true, message: '请选择店铺位置' }],
        storeAddressDetail: [{ required: true, message: '请输入店铺详细地址' }],
        openingHours: [{ required: true, message: '请输入店铺营业时间' }]
      },
      categoryList: [], // 分类数据
      ossEndpoint: "",
      ossSTSObj: {},
      imgName: '',
      visible: false,
      uploadList: [],
    };
  },
  methods: {
    // 下一步
    next() {
      this.$refs.thirdForm.validate((valid) => {
        if (valid) {
          let formJSON = JSON.parse(JSON.stringify(this.form));
          let params = {}
          params.storeName = formJSON.storeName
          params.storeLogo = formJSON.storeLogo[0].url;
          params.phone = formJSON.phone;
          params.categoryName = this.categoryList[formJSON.goodsManagementCategory].name;
          params.categoryId = this.categoryList[formJSON.goodsManagementCategory].id;
          params.goodsManagementCategory = this.goodsManagementCategory
          params.storeAddressPath = formJSON.storeAddressPath
          params.storeAddressIdPath = formJSON.storeAddressIdPath
          params.storeAddressDetail = formJSON.storeAddressDetail
          params.storeCenter = formJSON.storeCenter
          params.storeDesc = formJSON.storeDesc
          params.businessHour = this.form.openingHours;
          console.log(formJSON)
          console.log(params)
          applyThird(params)
            .then((res) => {
              this.loading = false;
              if (res.success) this.$emit('change', 3);
              this.$parent.getData()
            })
            .catch((error) => {
              this.loading = false;
              console.log(error)
            });
          this.$emit('change', 1);
        } else {
          console.log('validate error');
        }
      });
    },
    // 查看图片
    handleView(item) {
      this.previewPicture = item;
      this.visible = true;
    },
    // 删除图片
    handleRemove(index, listName) {
      this.form[listName].splice(index, 1);
    },
    // 选择坐标回调
    getAddress(val) {
      if (val.type === 'select') {
        const paths = val.data.map(item => item.name).join(',')
        const ids = val.data.map(item => item.id).join(',')
        this.$set(this.form, "storeAddressPath", paths);
        this.$set(this.form, "storeAddressIdPath", ids);
        this.form.storeCenter = val.data[val.data.length - 1].center
      } else {
        this.$set(this.form, "storeAddressPath", val.data.addr);
        this.$set(this.form, "storeAddressIdPath", val.data.addrId);
        this.$set(
          this.form,
          'storeCenter',
          val.data.position.lng + ',' + val.data.position.lat
        );
      }
    },
    // 获取商品分类
    getCategoryList() {
      getShopCategoryList().then((res) => {
        if (res.success) {
          let cateList = []
          var children = new TinyQueue();
          res.result.forEach(child => {
            children.push(child)
          });
          while (children.length > 0) {
            let top = children.pop()
            cateList.push({ id: top.categoryId, name: top.name })
            if (top.children != null) {
              top.children.forEach(child => {
                children.push(child)
              });
            }
          }
          this.categoryList = cateList
        }
      });
    },
    handleRemove(file) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },
    handleSuccess(res, file) {
      console.log(this.ossSTSObj.host + "/" + this.ossSTSObj.key.replace("${filename}", file.name))
      file.url = this.ossSTSObj.host + "/" + this.ossSTSObj.key.replace("${filename}", file.name)
      // this.form.storeLogo.push(file.url);
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
    this.accessToken.accessToken = storage.getItem('accessToken');
    this.getCategoryList();
    if (this.content != {}) {
      this.form = JSON.parse(JSON.stringify(this.content));
      if (this.form.storeLogo) {
        this.form.storeLogo = this.content.storeLogo.split(',');
        this.form.goodsManagementCategory = this.content.goodsManagementCategory.split(
          ','
        );
      } else {
        this.form.storeLogo = [];
      }
      this.$forceUpdate();
    }
    this.uploadList = this.$refs.upload.fileList;
    this.form.storeLogo = this.uploadList
    this.$refs.thirdForm.resetFields()
  }
};
</script>
<style lang="scss" scoped>
h4 {
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: left;
}

.ivu-input-wrapper {
  width: 300px;
}

.img-list {
  display: inline-block;
  margin: 10px;
  width: 100px;
  height: auto;
  position: relative;

  .cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    width: inherit;
    height: inherit;
    align-items: center;
    justify-content: space-around;

    i {
      color: #fff;
      font-size: 30px;
      cursor: pointer;
    }
  }

  &:hover .cover {
    display: flex;
  }
}

.describe {
  font-size: 12px;
  color: #999;
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
