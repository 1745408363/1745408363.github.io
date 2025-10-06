import { director } from 'cc';

export class SceneManager {
  // 加载场景（带加载提示，简化版）
  public static loadScene(sceneName: string) {
    alert(`正在跳转到${sceneName.split('Scene')[0]}页面...`);
    director.loadScene(sceneName);
  }
}