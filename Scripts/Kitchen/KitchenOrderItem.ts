import { _decorator, Component, Node, Label, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KitchenOrderItem')
export class KitchenOrderItem extends Component {
  @property(Label) orderIdLabel: Label = null;     // 订单ID标签
  @property(Label) createTimeLabel: Label = null; // 创建时间标签
  @property(Label) totalPriceLabel: Label = null; // 订单总价标签
  @property(Label) statusLabel: Label = null;     // 订单状态标签
  @property(Button) acceptBtn: Button = null;     // 接单按钮
  @property(Button) completeBtn: Button = null;   // 完成按钮

  private orderData: any = null; // 订单数据
  private statusUpdateCallback: (orderId: string, newStatus: string) => void = null; // 状态更新回调
  // 新增：当前登录用户信息（用于判断权限）
  private currentUser: any = null;
  // 初始化订单数据
  initOrderData(order: any, currentUser: any, callback: (orderId: string, newStatus: string) => void) {
    this.orderData = order;
    this.currentUser = currentUser;
    this.statusUpdateCallback = callback;

    // 设置订单基础信息（不变）
    this.orderIdLabel.string = `订单ID：${order.id.slice(-8)}`;
    this.createTimeLabel.string = `创建时间：${order.createTime}`;
    this.totalPriceLabel.string = `总价：¥${order.totalPrice}`;
    this.statusLabel.string = `状态：${order.status}`;

    // 核心：根据当前用户角色控制按钮显示
    this.updateBtnVisibility();
  }


  // 根据角色更新按钮显示（食客隐藏，厨师显示）
  private updateBtnVisibility() {
    const isChef = this.currentUser.role === "chef"; // 是否为厨师
    // 食客：隐藏所有操作按钮；厨师：按订单状态显示按钮
    if (isChef) {
      this.acceptBtn.node.active = this.orderData.status === "已支付";
      this.completeBtn.node.active = this.orderData.status === "已接单";
    } else {
      this.acceptBtn.node.active = false; // 食客隐藏接单按钮
      this.completeBtn.node.active = false; // 食客隐藏完成按钮
    }
  }

  // 接单/完成按钮点击事件（不变）
  onAcceptBtnClick() {
    this.statusUpdateCallback(this.orderData.id, "已接单");
  }
  onCompleteBtnClick() {
    this.statusUpdateCallback(this.orderData.id, "已完成");
  }
}