import { _decorator, Component, Node, Prefab, instantiate, ScrollView, Label, Button } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('OrderHistoryScene')
export class OrderHistoryScene extends Component {
  @property(ScrollView) orderScroll: ScrollView = null;
  @property(Prefab) orderItemPrefab: Prefab = null;
  @property(Node) emptyTips: Node = null;

  private currentUser: any = null;
  private dataMgr = DataManager.getInstance();

  onLoad() {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      SceneManager.loadScene("LoginScene");
      return;
    }
    this.currentUser = JSON.parse(userStr);
    this.loadOrders();
  }

  loadOrders() {
    const orders = this.dataMgr.getTableAllData(this.dataMgr.TABLES.ORDER)
      .filter(o => o.userId === this.currentUser.id)
      .reverse(); // 倒序显示

    this.emptyTips.active = orders.length === 0;
    this.orderScroll.content.removeAllChildren();

    orders.forEach(order => {
      const item = instantiate(this.orderItemPrefab);
      this.orderScroll.content.addChild(item);
      
      // 设置订单信息
      item.getChildByName("OrderIdLabel").getComponent(Label).string = `订单ID：${order.id.slice(-8)}`;
      item.getChildByName("TimeLabel").getComponent(Label).string = order.createTime;
      item.getChildByName("PriceLabel").getComponent(Label).string = `¥${order.totalPrice}`;
      item.getChildByName("StatusLabel").getComponent(Label).string = `状态：${order.status}`;
      
      // 评价按钮控制
      const reviewBtn = item.getChildByName("ReviewBtn").getComponent(Button);
      const isCompleted = order.status === "已完成";
      const hasReviewed = this.dataMgr.getReviewByOrderId(order.id);
      reviewBtn.node.active = isCompleted && !hasReviewed;
      
      reviewBtn.node.on(Button.EventType.CLICK, () => {
        localStorage.setItem("review_target_order", order.id);
        SceneManager.loadScene("OrderReviewScene");
      }, this);
    });
  }

  onBackBtnClick() {
    SceneManager.loadScene("DishListScene");
  }
}