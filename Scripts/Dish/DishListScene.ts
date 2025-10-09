import { _decorator, Component, Node, EditBox, Button, Prefab, instantiate, Label, Sprite } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
import { DishItem } from './DishItem';
const { ccclass, property } = _decorator;

@ccclass('DishListScene')
export class DishListScene extends Component {
  @property(Label) userNicknameLabel: Label = null; // 顶部用户昵称标签
  // 替换Dropdown为按钮组：每个按钮对应一个菜系（第一个按钮固定为“全部”）
  @property(Button) categoryButtons: Button[] = []; // 筛选按钮组（[0] = 全部, [1] = 粤菜, ...）
  @property(Sprite) selectedIndicator: Sprite = null; // 选中状态指示器（可选，用于高亮当前选中按钮）
  @property(Node) dishListContainer: Node = null; // 菜品列表容器
  @property(Prefab) dishItemPrefab: Prefab = null; // 菜品项预制体
  @property(Label) checkoutBtnLabel: Label = null; // 结算按钮标签

  private dataMgr: DataManager = DataManager.getInstance();
  private currentUser: any = null;
  private allDishes: any[] = [];
  private cart: any[] = [];
  private currentCategory: string = "全部"; // 当前选中的菜系（默认“全部”）

  onLoad() {
    // 1. 验证登录状态
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      SceneManager.loadScene("LoginScene");
      return;
    }
    this.currentUser = JSON.parse(userStr);
    this.userNicknameLabel.string = `欢迎，${this.currentUser.name}`;

    // 2. 加载菜品数据并初始化筛选按钮
    this.allDishes = this.dataMgr.getTableAllData(this.dataMgr.TABLES.DISH);
    this.initCategoryButtons(); // 初始化筛选按钮事件
    this.renderDishList(this.allDishes); // 初始渲染全部菜品

    // 3. 初始化购物车
    const cartStr = localStorage.getItem(`cart_${this.currentUser.id}`);
    this.cart = cartStr ? JSON.parse(cartStr) : [];
    this.updateCheckoutBtnLabel();
  }

  // 初始化筛选按钮：绑定点击事件，设置初始选中状态
  private initCategoryButtons() {
    // 给每个筛选按钮绑定点击事件
    this.categoryButtons.forEach((btn, index) => {
      // 按钮文字从按钮的Label组件获取（假设按钮节点下有Label子节点）
      const btnLabel = btn.node.getChildByName("Label").getComponent(Label);
      const category = btnLabel.string;

      btn.node.on(Button.EventType.CLICK, () => {
        this.currentCategory = category; // 更新当前选中类别
        this.updateSelectedIndicator(btn.node); // 更新选中指示器位置（可选）
        this.onCategoryFilter(category); // 执行筛选
      }, this);
    });

    // 默认选中第一个按钮（“全部”）
    this.updateSelectedIndicator(this.categoryButtons[0].node);
  }

  // 更新选中指示器位置（可选功能：视觉上高亮当前选中的按钮）
  private updateSelectedIndicator(btnNode: Node) {
    if (this.selectedIndicator) {
      this.selectedIndicator.node.position = btnNode.position; // 指示器位置与选中按钮对齐
    }
  }

  // 按菜系筛选菜品（替代原Dropdown的筛选逻辑）
  private onCategoryFilter(category: string) {
    let filteredDishes = this.allDishes;
    if (category !== "全部") {
      filteredDishes = this.allDishes.filter(dish => dish.category === category);
    }
    this.renderDishList(filteredDishes);
  }

  // 渲染菜品列表（逻辑不变）
  private renderDishList(dishes: any[]) {
    this.dishListContainer.removeAllChildren();
    dishes.forEach(dish => {
      const dishItemNode = instantiate(this.dishItemPrefab);
      dishItemNode.parent = this.dishListContainer;
      const dishItemScript = dishItemNode.getComponent(DishItem);
      dishItemScript.initDishData(dish, (dishId, count) => {
        this.updateCart(dishId, count);
      });
    });
  }

  // 以下方法与原逻辑一致，保持不变
  private updateCart(dishId: string, count: number) {
    const cartItemIndex = this.cart.findIndex(item => item.dishId === dishId);
    const dishInfo = this.allDishes.find(dish => dish.id === dishId);

    if (count > 0) {
      cartItemIndex > -1 
        ? (this.cart[cartItemIndex].count = count)
        : this.cart.push({ dishId, count, dishInfo });
    } else if (cartItemIndex > -1) {
      this.cart.splice(cartItemIndex, 1);
    }

    localStorage.setItem(`cart_${this.currentUser.id}`, JSON.stringify(this.cart));
    this.updateCheckoutBtnLabel();
  }

  private updateCheckoutBtnLabel() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.count, 0);
    this.checkoutBtnLabel.string = totalCount > 0 ? `去结算(${totalCount})` : "去结算";
  }

  onCheckoutBtnClick() {
    if (this.cart.length === 0) {
      alert("购物车为空，请先选择菜品！");
      return;
    }
    localStorage.setItem("temp_cart", JSON.stringify(this.cart));
    SceneManager.loadScene("OrderConfirmScene");
  }

  onKitchenBtnClick() {
    SceneManager.loadScene("KitchenScene");
  }

  onHistoryBtnClick() {
    SceneManager.loadScene("OrderHistoryScene");
  }
}