import { _decorator, Component, EditBox, Button, Label, Sprite, resources } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('ChefQualificationScene')
export class ChefQualificationScene extends Component {
  @property(EditBox) realNameEdit: EditBox = null;
  @property(EditBox) idCardEdit: EditBox = null;
  @property(Sprite) certificateSprite: Sprite = null;
  @property(Label) statusLabel: Label = null;

  private currentUser: any = null;
  private dataMgr = DataManager.getInstance();
  private certificateUrl: string = "";

  onLoad() {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      SceneManager.loadScene("LoginScene");
      return;
    }
    this.currentUser = JSON.parse(userStr);
    if (this.currentUser.role !== "chef") {
      alert("仅厨师可访问此页面");
      SceneManager.loadScene("DishListScene");
      return;
    }
    this.checkQualificationStatus();
  }

  checkQualificationStatus() {
    const qual = this.dataMgr.getChefQualification(this.currentUser.id);
    if (qual) {
      this.statusLabel.string = `当前状态：${qual.status === "pending" ? "待审核" : qual.status === "approved" ? "已通过" : "已拒绝"}`;
      this.realNameEdit.string = qual.realName;
      this.idCardEdit.string = qual.idCard;
      this.certificateUrl = qual.certificate;
    //   // 加载证书图片
    //   resources.load(qual.certificate, SpriteFrame, (err, sf) => {
    //     if (!err) this.certificateSprite.spriteFrame = sf;
    //   });
      // 已提交则禁用输入
      this.realNameEdit.enabled = this.idCardEdit.enabled = (qual.status === "rejected");
    }
  }

  onUploadBtnClick() {
    // 模拟上传，实际项目需对接文件选择API
    this.certificateUrl = "Images/certificate_sample"; // 示例图片路径
    // resources.load(this.certificateUrl, SpriteFrame, (err, sf) => {
    //   if (!err) this.certificateSprite.spriteFrame = sf;
    // });
  }

  onSubmitBtnClick() {
    const realName = this.realNameEdit.string.trim();
    const idCard = this.idCardEdit.string.trim();
    if (!realName || !idCard || !this.certificateUrl) {
      alert("请完善所有信息");
      return;
    }
    this.dataMgr.submitQualification(this.currentUser.id, { realName, idCard, certificate: this.certificateUrl });
    alert("提交成功，等待审核");
    this.checkQualificationStatus();
  }

  onBackBtnClick() {
    SceneManager.loadScene("KitchenScene");
  }
}