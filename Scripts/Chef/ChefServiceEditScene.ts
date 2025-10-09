import { _decorator, Component, EditBox, Button, Node, Prefab, instantiate, Label } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('ChefServiceEditScene')
export class ChefServiceEditScene extends Component {
  @property(EditBox) titleEdit: EditBox = null;
  @property(EditBox) descEdit: EditBox = null;
  @property(EditBox) priceEdit: EditBox = null;
  @property(EditBox) dateEdit: EditBox = null; // 简化为文本输入，实际用日期选择器
  @property(Node) menuContainer: Node = null;
  @property(Prefab) menuItemPrefab: Prefab = null;

  private currentUser: any = null;
  private dataMgr = DataManager.getInstance();

  onLoad() {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      SceneManager.loadScene("LoginScene");
      return;
    }
    this.currentUser = JSON.parse(userStr);
    if (this.currentUser.role !== "chef") {
      SceneManager.loadScene("DishListScene");
    }
    this.menuContainer.removeAllChildren();
    this.addMenuItem(); // 默认添加一个菜单项
  }

  onAddMenuBtnClick() {
    this.addMenuItem();
  }

  addMenuItem() {
    const item = instantiate(this.menuItemPrefab);
    this.menuContainer.addChild(item);
    // 删除按钮事件
    item.getChildByName("DeleteBtn").getComponent(Button).node.on(Button.EventType.CLICK, () => {
      if (this.menuContainer.children.length > 1) item.destroy();
    }, this);
  }

  onPublishBtnClick() {
    // 收集表单数据
    const title = this.titleEdit.string.trim();
    const description = this.descEdit.string.trim();
    const price = Number(this.priceEdit.string);
    const date = this.dateEdit.string.trim();
    
    // 收集菜单
    const menu = [];
    for (const child of this.menuContainer.children) {
      const name = child.getChildByName("NameEdit").getComponent(EditBox).string.trim();
      const itemPrice = Number(child.getChildByName("PriceEdit").getComponent(EditBox).string);
      if (name && !isNaN(itemPrice)) menu.push({ name, price: itemPrice });
    }

    if (!title || !description || isNaN(price) || !date || menu.length === 0) {
      alert("请完善服务信息");
      return;
    }

    // 发布服务
    this.dataMgr.publishService({
      id: `service_${Date.now()}`,
      chefId: this.currentUser.id,
      title,
      description,
      price,
      menu,
      date,
      status: "active"
    });

    alert("服务发布成功");
    // SceneManager.loadScene("ChefServiceListScene");
    SceneManager.loadScene("KitchenScene");
  }

  onBackBtnClick() {
    SceneManager.loadScene("KitchenScene");
  }
}