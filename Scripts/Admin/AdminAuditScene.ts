import { _decorator, Component, Node, Prefab, instantiate, ScrollView, Label, Button, Sprite, resources } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('AdminAuditScene')
export class AdminAuditScene extends Component {
  @property(ScrollView) qualScroll: ScrollView = null;
  @property(Prefab) qualItemPrefab: Prefab = null;
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
    if (this.currentUser.role !== "admin") {
      alert("仅管理员可访问");
      SceneManager.loadScene("DishListScene");
      return;
    }
    this.loadPendingQualifications();
  }
  onBackBtnClick() {
    SceneManager.loadScene("AdminStatsScene");
  }
  loadPendingQualifications() {
    const quals = this.dataMgr.getPendingQualifications();
    this.emptyTips.active = quals.length === 0;
    this.qualScroll.content.removeAllChildren();

    quals.forEach(qual => {
      const item = instantiate(this.qualItemPrefab);
      this.qualScroll.content.addChild(item);
      
      // 查找厨师信息（假设用户表有name字段）
      const chef = this.dataMgr.getTableAllData(this.dataMgr.TABLES.USER).find(u => u.id === qual.chefId);
      
      item.getChildByName("ChefNameLabel").getComponent(Label).string = `厨师：${chef?.name || "未知"}`;
      item.getChildByName("IdCardLabel").getComponent(Label).string = `身份证：${qual.idCard}`;
      
      // 加载证书图片
      const certSprite = item.getChildByName("CertificateSprite").getComponent(Sprite);
    //   resources.load(qual.certificate, SpriteFrame, (err, sf) => {
    //     if (!err) certSprite.spriteFrame = sf;
    //   });
      
      // 审核按钮
      item.getChildByName("ApproveBtn").getComponent(Button).node.on(Button.EventType.CLICK, () => {
        this.dataMgr.auditQualification(qual.id, "approved", this.currentUser.id);
        this.loadPendingQualifications();
      }, this);
      
      item.getChildByName("RejectBtn").getComponent(Button).node.on(Button.EventType.CLICK, () => {
        this.dataMgr.auditQualification(qual.id, "rejected", this.currentUser.id);
        this.loadPendingQualifications();
      }, this);
    });
  }
}