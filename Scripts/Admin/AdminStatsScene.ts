import { _decorator, Component, Label, Button } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('AdminStatsScene')
export class AdminStatsScene extends Component {
  @property(Label) totalUserLabel: Label = null;
  @property(Label) dinerLabel: Label = null;
  @property(Label) chefLabel: Label = null;
  @property(Label) totalOrderLabel: Label = null;
  @property(Label) completedLabel: Label = null;
  @property(Label) revenueLabel: Label = null;

  private dataMgr = DataManager.getInstance();

  onLoad() {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr || JSON.parse(userStr).role !== "admin") {
      SceneManager.loadScene("LoginScene");
    } else {
      this.refreshStats();
    }
  }
  // 新增：跳转到审核页
  onAuditBtnClick() {
    SceneManager.loadScene("AdminAuditScene");
  }
  refreshStats() {
    const stats = this.dataMgr.getStats();
    this.totalUserLabel.string = `总用户数：${stats.userStats.total}`;
    this.dinerLabel.string = `食客数：${stats.userStats.diner}`;
    this.chefLabel.string = `厨师数：${stats.userStats.chef}`;
    this.totalOrderLabel.string = `总订单数：${stats.orderStats.total}`;
    this.completedLabel.string = `已完成订单：${stats.orderStats.completed}`;
    this.revenueLabel.string = `总销售额：¥${stats.orderStats.revenue}`;
  }

  onRefreshBtnClick() {
    this.refreshStats();
  }
}