// Scripts/Core/DataManager.ts
import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

// 表名常量（与概要设计数据库表名对应）
const TABLES = {
  USER: "user_table",
  DISH: "dish_table",
  ORDER: "order_table"
};

@ccclass('DataManager')
export class DataManager extends Component {
  private static instance: DataManager; // 单例实例
  public TABLES = TABLES; // 暴露表名供外部使用

  // 单例模式：确保全局唯一数据管理器
  public static getInstance(): DataManager {
    if (!this.instance) {
      this.instance = new DataManager();
      this.instance.initTables(); // 初始化表
    }
    return this.instance;
  }

  // 初始化所有表：无数据则创建空表/默认数据
  private initTables() {
    // 1. 初始化用户表（空表）
    if (!localStorage.getItem(TABLES.USER)) {
      localStorage.setItem(TABLES.USER, JSON.stringify([]));
    }

    // 2. 初始化菜品表（默认3个菜品，对应概要设计“菜品浏览模块”）
    if (!localStorage.getItem(TABLES.DISH)) {
      const defaultDishes = [
        { id: "d_1695200100", name: "佛跳墙", price: 298, imgUrl: "Images/dish1.png", category: "粤菜" },
        { id: "d_1695200101", name: "北京烤鸭", price: 198, imgUrl: "Images/dish2.png", category: "京菜" },
        { id: "d_1695200102", name: "东坡肉", price: 88, imgUrl: "Images/dish3.png", category: "浙菜" }
      ];
      localStorage.setItem(TABLES.DISH, JSON.stringify(defaultDishes));
    }

    // 3. 初始化订单表（空表）
    if (!localStorage.getItem(TABLES.ORDER)) {
      localStorage.setItem(TABLES.ORDER, JSON.stringify([]));
    }
  }

  // ---------------------- 通用CRUD方法（模拟概要设计“数据持久层”操作） ----------------------
  // 1. 获取表中所有数据
  public getTableAllData(tableName: string): any[] {
    const dataStr = localStorage.getItem(tableName);
    return dataStr ? JSON.parse(dataStr) : [];
  }

  // 2. 新增数据（自动生成ID，符合概要设计“唯一标识”需求）
  public addData(tableName: string, data: any): boolean {
    const tableData = this.getTableAllData(tableName);
    // 生成唯一ID：表名前缀+时间戳（避免重复）
    data.id = `${tableName.split('_')[0]}_${Date.now()}`;
    tableData.push(data);
    localStorage.setItem(tableName, JSON.stringify(tableData));
    return true;
  }

  // 3. 更新数据（按ID匹配，对应概要设计“订单状态更新”等需求）
  public updateData(tableName: string, id: string, updateObj: any): boolean {
    const tableData = this.getTableAllData(tableName);
    const targetIndex = tableData.findIndex(item => item.id === id);
    if (targetIndex === -1) return false; // 未找到数据
    // 合并旧数据与新数据（保留未修改字段）
    tableData[targetIndex] = { ...tableData[targetIndex], ...updateObj };
    localStorage.setItem(tableName, JSON.stringify(tableData));
    return true;
  }

  // ---------------------- 业务专属方法（适配需求文档功能列表） ----------------------
  // 1. 验证用户登录（需求文档Fun_02：手机号+密码匹配）
  public verifyLogin(phone: string, password: string): any {
    const users = this.getTableAllData(TABLES.USER);
    return users.find(user => user.phone === phone && user.password === password);
  }

  // 2. 检查手机号是否已注册（需求文档Fun_01：避免重复注册）
  public checkPhoneExist(phone: string): boolean {
    const users = this.getTableAllData(TABLES.USER);
    return users.some(user => user.phone === phone);
  }

  // 3. 获取后厨待处理订单（需求文档Fun_09：只显示“已支付/待接单”状态）
  public getKitchenOrders(): any[] {
    const orders = this.getTableAllData(TABLES.ORDER);
    return orders.filter(order => order.status === "已支付" || order.status === "待接单");
  }


    // DataManager.ts 中新增方法
  /**
   * 获取指定用户的后厨待处理订单
   * @param userId - 目标用户ID
   */
  public getKitchenOrdersByUserId(userId: string): any[] {
    const orders = this.getTableAllData(TABLES.ORDER);
    // 同时按“状态”和“用户ID”筛选
    return orders.filter(order => 
      (order.status === "已支付" || order.status === "待接单") && 
      order.userId === userId // 关键：只保留当前用户的订单
    );
  }

  // DataManager.ts 中新增方法
  /**
   * 根据用户角色获取待处理订单
   * @param user - 当前登录用户（含role字段）
   */
  public getOrdersByUserRole(user: any): any[] {
    const orders = this.getTableAllData(TABLES.ORDER);
    if (user.role === "chef") {
      // 厨师：返回所有待处理订单
      return orders.filter(order => order.status === "已支付" || order.status === "已接单");
    } else {
      // 食客：仅返回自己的待处理订单
      return orders.filter(order => 
        (order.status === "已支付" || order.status === "已接单"|| order.status === "已完成") && 
        order.userId === user.id
      );
    }
  }
}