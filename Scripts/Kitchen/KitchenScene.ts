import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
import { KitchenOrderItem } from './KitchenOrderItem';
const { ccclass, property } = _decorator;

@ccclass('KitchenScene')
export class KitchenScene extends Component {
  @property(Node) orderListContainer: Node = null; // 后厨订单列表容器
  @property(Prefab) kitchenOrderItemPrefab: Prefab = null; // 后厨订单项预制体
  @property(Button) refreshBtn: Button = null; // 刷新订单按钮

  private dataMgr: DataManager = DataManager.getInstance();

  // 生命周期：场景加载时初始化
  onLoad() {
    // 1. 验证登录状态（未登录则跳转登录页）
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      SceneManager.loadScene("LoginScene");
      return;
    }

    // 2. 加载后厨订单并渲染
    this.loadAndRenderKitchenOrders();

    // 3. 绑定刷新按钮事件
    this.refreshBtn.node.on(Button.EventType.CLICK, this.loadAndRenderKitchenOrders, this);
  }

  // KitchenScene.ts 中修改 loadAndRenderKitchenOrders 方法
loadAndRenderKitchenOrders() {
  this.orderListContainer.removeAllChildren();

  // 获取当前登录用户信息（含role）
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) {
    SceneManager.loadScene("LoginScene");
    return;
  }
  const currentUser = JSON.parse(userStr);

  // 按角色获取订单（食客仅看自己的，厨师看所有）
  const kitchenOrders = this.dataMgr.getOrdersByUserRole(currentUser);

  // 渲染订单时传递当前用户信息
  kitchenOrders.forEach(order => {
    const orderItemNode = instantiate(this.kitchenOrderItemPrefab);
    orderItemNode.parent = this.orderListContainer;
    const orderItemScript = orderItemNode.getComponent(KitchenOrderItem);
    // 传入currentUser（含role）用于按钮权限判断
    orderItemScript.initOrderData(order, currentUser, (orderId, newStatus) => {
      this.dataMgr.updateData(this.dataMgr.TABLES.ORDER, orderId, { status: newStatus });
      this.loadAndRenderKitchenOrders();
    });
  });
}

  // 返回菜品页按钮点击事件
  onBackToDishBtnClick() {
    SceneManager.loadScene("DishListScene");
  }
}