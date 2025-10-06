import { _decorator, Component, Node, Label, Sprite, Button, SpriteFrame, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DishItem')
export class DishItem extends Component {
  @property(Sprite) dishImgSprite: Sprite = null; // 菜品图片
  @property(Label) dishNameLabel: Label = null;   // 菜品名称
  @property(Label) dishPriceLabel: Label = null;  // 菜品价格
  @property(Label) countLabel: Label = null;      // 数量标签
  @property(Button) minusBtn: Button = null;      // 减少数量按钮
  @property(Button) plusBtn: Button = null;       // 增加数量按钮

  private dishData: any = null; // 菜品数据
  private count: number = 0;    // 当前选择数量
  private cartUpdateCallback: (dishId: string, count: number) => void = null; // 购物车更新回调

  // 初始化菜品数据
  initDishData(dish: any, callback: (dishId: string, count: number) => void) {
    this.dishData = dish;
    this.cartUpdateCallback = callback;

    // 1. 设置菜品基本信息
    this.dishNameLabel.string = dish.name;
    this.dishPriceLabel.string = `¥${dish.price}`;
    this.countLabel.string = this.count.toString();

    // 2. 加载菜品图片（从Resources目录）
    resources.load(dish.imgUrl, SpriteFrame, (err, spriteFrame) => {
      if (!err) {
        this.dishImgSprite.spriteFrame = spriteFrame;
      }
    });

    // 3. 绑定按钮事件
    this.minusBtn.node.on(Button.EventType.CLICK, this.onMinusBtnClick, this);
    this.plusBtn.node.on(Button.EventType.CLICK, this.onPlusBtnClick, this);
  }

  // 减少数量按钮点击
  onMinusBtnClick() {
    if (this.count > 0) {
      this.count--;
      this.countLabel.string = this.count.toString();
      this.cartUpdateCallback(this.dishData.id, this.count); // 通知父场景更新购物车
    }
  }

  // 增加数量按钮点击
  onPlusBtnClick() {
    this.count++;
    this.countLabel.string = this.count.toString();
    this.cartUpdateCallback(this.dishData.id, this.count); // 通知父场景更新购物车
  }
}