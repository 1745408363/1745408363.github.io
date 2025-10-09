import { _decorator, Component, Label, Slider, EditBox, Button } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('OrderReviewScene')
export class OrderReviewScene extends Component {
  @property(Label) orderIdLabel: Label = null;
  @property(Slider) scoreSlider: Slider = null;
  @property(Label) scoreLabel: Label = null;
  @property(EditBox) contentEdit: EditBox = null;

  private orderId: string = "";
  private currentUser: any = null;
  private dataMgr = DataManager.getInstance();

  onLoad() {
    this.orderId = localStorage.getItem("review_target_order");
    const userStr = localStorage.getItem("currentUser");
    if (!this.orderId || !userStr) {
      SceneManager.loadScene("OrderHistoryScene");
      return;
    }
    this.currentUser = JSON.parse(userStr);
    this.orderIdLabel.string = `订单ID：${this.orderId.slice(-8)}`;
  }

  onScoreChange(slider: Slider) {
    const score = Math.round(slider.progress * 5);
    this.scoreLabel.string = `评分：${score}星`;
  }

  onSubmitBtnClick() {
    const content = this.contentEdit.string.trim();
    const score = Math.round(this.scoreSlider.progress * 5);
    if (!content) {
      alert("请输入评价内容");
      return;
    }

    this.dataMgr.addReview({
      id: `review_${Date.now()}`,
      orderId: this.orderId,
      userId: this.currentUser.id,
      content,
      score,
      createTime: new Date().toLocaleString()
    });

    alert("评价提交成功！");
    SceneManager.loadScene("OrderHistoryScene");
  }

  onBackBtnClick() {
    SceneManager.loadScene("OrderHistoryScene");
  }
}