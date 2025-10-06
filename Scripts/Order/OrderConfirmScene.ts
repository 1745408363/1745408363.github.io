import { _decorator, Component, Node, Label, EditBox, Button, Prefab, instantiate } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('OrderConfirmScene')
export class OrderConfirmScene extends Component {
  @property(Node) orderItemContainer: Node = null; // 订单菜品列表容器
  @property(Label) totalPriceLabel: Label = null;  // 总价标签
  @property(EditBox) addressEditBox: EditBox = null; // 配送地址输入框
  @property(Prefab) orderItemPrefab: Prefab = null; // 订单菜品项预制体

  private dataMgr: DataManager = DataManager.getInstance();
  private currentUser: any = null; // 当前登录用户
  private tempCart: any[] = [];    // 临时购物车数据
  private totalPrice: number = 0;  // 订单总价

  // 生命周期：场景加载时初始化
  onLoad() {
    // 1. 验证登录状态
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      SceneManager.loadScene("LoginScene");
      return;
    }
    this.currentUser = JSON.parse(userStr);

    // 2. 读取临时购物车数据（无数据则返回菜品页）
    const cartStr = localStorage.getItem("temp_cart");
    if (!cartStr) {
      SceneManager.loadScene("DishListScene");
      return;
    }
    this.tempCart = JSON.parse(cartStr);

    // 3. 渲染订单菜品列表并计算总价
    this.renderOrderItems();
    this.calculateTotalPrice();
  }

  // 渲染订单菜品列表
  private renderOrderItems() {
    this.orderItemContainer.removeAllChildren();

    this.tempCart.forEach(cartItem => {
      const orderItemNode = instantiate(this.orderItemPrefab);
      orderItemNode.parent = this.orderItemContainer;

      // 设置订单菜品项信息（名称、数量、单价）
      const nameLabel = orderItemNode.getChildByName("NameLabel").getComponent(Label);
      const countLabel = orderItemNode.getChildByName("CountLabel").getComponent(Label);
      const priceLabel = orderItemNode.getChildByName("PriceLabel").getComponent(Label);

      nameLabel.string = cartItem.dishInfo.name;
      countLabel.string = `×${cartItem.count}`;
      priceLabel.string = `¥${cartItem.dishInfo.price}`;
    });
  }

  // 计算订单总价
  private calculateTotalPrice() {
    this.totalPrice = this.tempCart.reduce((sum, item) => {
      return sum + (item.dishInfo.price * item.count);
    }, 0);
    this.totalPriceLabel.string = `¥${this.totalPrice}`;
  }

  // 确认支付按钮点击事件（需求文档Fun_04：简化支付，点击即成功）
  onPayBtnClick() {
    const address = this.addressEditBox.string.trim();
    if (!address) {
      alert("请输入配送地址！");
      return;
    }

    // 1. 构造订单数据（符合概要设计order_table结构）
    const orderData = {
      userId: this.currentUser.id,
      dishList: this.tempCart.map(item => ({
        dishId: item.dishId,
        count: item.count
      })),
      totalPrice: this.totalPrice,
      status: "已支付", // 简化：支付成功直接设为“已支付”
      createTime: new Date().toLocaleString() // 本地时间格式
    };

    // 2. 保存订单到order_table
    this.dataMgr.addData(this.dataMgr.TABLES.ORDER, orderData);

    // 3. 清空临时购物车和用户购物车
    localStorage.removeItem("temp_cart");
    localStorage.removeItem(`cart_${this.currentUser.id}`);

    // 4. 提示支付成功并返回菜品页
    alert(`支付成功！订单总价：¥${this.totalPrice}\n配送地址：${address}`);
    SceneManager.loadScene("DishListScene");
  }

  // 返回菜品页按钮点击事件
  onBackBtnClick() {
    SceneManager.loadScene("DishListScene");
  }
}