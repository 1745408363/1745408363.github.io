import { _decorator, Component, EditBox, Button, Node, Toggle } from 'cc';
import { DataManager } from '../Core/DataManager';
import { SceneManager } from '../Core/SceneManager';
const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends Component {
  @property(EditBox) phoneEditBox: EditBox = null; // 登录-手机号输入框
  @property(EditBox) pwdEditBox: EditBox = null;   // 登录-密码输入框
  @property(Node) registerModal: Node = null; // 注册弹窗
  @property(EditBox) regPhoneEdit: EditBox = null; // 注册-手机号输入框
  @property(EditBox) regPwdEdit: EditBox = null;   // 注册-密码输入框
  @property(EditBox) regPwdConfirmEdit: EditBox = null; // 注册-确认密码输入框
  @property(Toggle) roleToggle: Toggle = null; 
  private dataMgr: DataManager = DataManager.getInstance();

  // 生命周期：场景加载时执行（检查是否已登录，直接跳转菜品页）
  onLoad() {
    // const currentUser = localStorage.getItem("currentUser");
    // if (currentUser) {
    //   SceneManager.loadScene("DishListScene"); // 跳转到菜品浏览场景
    // }
  }

  // 登录按钮点击事件（需求文档Fun_02）
  onLoginBtnClick() {
    const phone = this.phoneEditBox.string.trim();
    const pwd = this.pwdEditBox.string.trim();

    // 1. 输入验证（符合概要设计“实用性”原则：操作提示清晰）
    if (!phone || !pwd) {
      alert("手机号或密码不能为空！");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) { // 简单手机号格式验证
      alert("请输入正确的手机号！");
      return;
    }

    // 2. 调用DataManager验证登录
    const user = this.dataMgr.verifyLogin(phone, pwd);
    if (user) {
      // 登录成功：存储当前用户（全局可用），跳转菜品页
      localStorage.setItem("currentUser", JSON.stringify(user));
      // 新增角色判断：管理员跳转到统计页，其他角色跳转到菜品页
    if (user.role === "admin") {
      SceneManager.loadScene("AdminStatsScene"); // 管理员默认跳转到统计页
    } else {
      SceneManager.loadScene("DishListScene"); // 食客/厨师跳转到菜品页
    }
      // SceneManager.loadScene("DishListScene");
    } else {
      alert("手机号或密码错误，请重新输入！");
    }
  }

  // 注册按钮点击事件（打开注册弹窗，需求文档Fun_01）
  onRegisterBtnClick() {
    this.registerModal.active = true;
    // 清空弹窗输入框（避免残留数据）
    this.regPhoneEdit.string = "";
    this.regPwdEdit.string = "";
    this.regPwdConfirmEdit.string = "";
  }

  // 注册弹窗-确认注册按钮点击事件
  onRegConfirmBtnClick() {
    const phone = this.regPhoneEdit.string.trim();
    const pwd = this.regPwdEdit.string.trim();
    const pwdConfirm = this.regPwdConfirmEdit.string.trim();
    const selectedRole = this.roleToggle.isChecked ? "chef" : "diner";
    // 1. 输入验证
    if (!phone || !pwd || !pwdConfirm) {
      alert("请完善所有注册信息！");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert("请输入正确的手机号！");
      return;
    }
    if (pwd.length < 6) {
      alert("密码长度不能少于6位！");
      return;
    }
    if (pwd !== pwdConfirm) {
      alert("两次输入的密码不一致，请重新输入！");
      return;
    }

    // 2. 检查手机号是否已注册
    if (this.dataMgr.checkPhoneExist(phone)) {
      alert("该手机号已注册，请直接登录！");
      return;
    }

    // 3. 注册成功：添加用户到user_table
    // LoginScene.ts 中 onRegConfirmBtnClick 方法，注册时默认设为食客（或加“身份选择”UI）
  this.dataMgr.addData(this.dataMgr.TABLES.USER, {
    phone: phone,
    password: pwd,
    name: selectedRole === "chef" ? `厨师${phone.slice(-4)}` : `食客${phone.slice(-4)}`,
    role: selectedRole // 存入角色（diner/chef）
  });

    alert("注册成功！请登录~");
    this.registerModal.active = false; // 关闭弹窗
  }


  onClearAllDataBtnClick() {
  if (confirm("确定要删除所有数据吗？此操作不可恢复！")) {
    DataManager.getInstance().clearAllData();
   // SceneManager.loadScene("LoginScene"); // 清空后跳登录页
  }
}
}