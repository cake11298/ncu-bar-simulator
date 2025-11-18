# NCU Bar Simulator - 中央大學酒吧模擬器

## 專案簡介

這是一個使用 Three.js 打造的 3D 酒吧模擬器，玩家可以在虛擬酒吧中體驗調酒、與 NPC 互動、演奏吉他等豐富功能。專案採用模組化架構設計，包含完整的物理系統、互動系統和調酒系統。

## 主要特色

### 🍸 真實的調酒體驗
- **25+ 種經典 IBA 調酒配方**：包括 Martini、Mojito、Margarita 等經典調酒
- **專業調酒工具**：Shaker（搖酒器）、Jigger（量酒器）、Mixing Glass（調酒杯）
- **多樣化材料**：六大基酒（琴酒、伏特加、威士忌、蘭姆酒、龍舌蘭、白蘭地）+ 各式調味料與果汁
- **視覺化液體系統**：即時顯示杯中液體顏色、容量與成分
- **精確倒酒機制**：需要同時滿足準星對準和距離條件（2.5m 內）才能倒酒
- **倒酒進度條**：即時顯示容器容量與倒入量

### 🎮 豐富的互動系統
- **物品拾取與放置**：可以拾取酒瓶、杯子、工具等物品
- **物理模擬**：真實的重力、碰撞檢測系統
- **智能高亮顯示**：準星對準可互動物品時會顯示黃色外框
- **距離與視角判定**：倒酒需要同時滿足準星指向和距離條件

### 🎵 音樂與社交
- **吉他演奏**：與吉他互動可以播放音樂
- **NPC 互動系統**：與酒吧裡的 NPC 交談
- **調酒評分**：可以將調好的酒給 NPC 品嚐並獲得評價

### 🎨 精緻的視覺效果
- **專業酒吧環境**：包含吧檯、酒架、展示櫃、座位區等
- **動態光影系統**：真實的光照與陰影效果
- **粒子特效**：倒酒時的液體流動效果
- **透明材質**：逼真的玻璃杯與酒瓶材質

## 專案結構

```
ncu-bar-simulator/
├── src/                          # 原始碼
│   ├── index.html               # 入口 HTML
│   ├── index.js                 # 主程式入口與遊戲循環
│   ├── modules/                 # 核心模組
│   │   ├── BarEnvironment.js    # 酒吧環境協調器
│   │   ├── CocktailSystem.js    # 調酒系統（倒酒、搖酒、喝酒）
│   │   ├── InteractionSystem.js # 互動系統（拾取、放置、檢測）
│   │   ├── PhysicsSystem.js     # 物理系統（重力、碰撞）
│   │   ├── PlayerController.js  # 玩家控制器（移動、視角）
│   │   ├── NPCManager.js        # NPC 管理器
│   │   ├── LightingSystem.js    # 光照系統
│   │   ├── RetirementLounge.js  # 退休區環境
│   │   └── bar/                 # 酒吧子模組
│   │       ├── BarStructure.js  # 建築結構（地板、牆壁、吧檯）
│   │       ├── BarBottles.js    # 酒瓶與杯子
│   │       ├── BarTools.js      # 調酒工具
│   │       ├── BarDisplays.js   # 展示櫃與材料瓶
│   │       └── BarFurniture.js  # 家具（桌椅、吉他等）
│   └── styles/                  # CSS 樣式
│       └── main.css             # 主樣式表
├── public/                      # 編譯後的檔案（自動生成）
├── package.json                 # 專案配置和腳本
└── webpack.config.js            # Webpack 打包配置
```

## 系統架構

### 核心系統

1. **PhysicsSystem（物理系統）**
   - 重力模擬
   - 碰撞檢測
   - 剛體物理
   - 靜態碰撞體（吧檯、酒架）

2. **InteractionSystem（互動系統）**
   - 射線檢測（Raycaster）
   - 物品註冊與追蹤
   - 拾取/放置邏輯
   - 準星對準檢測

3. **CocktailSystem（調酒系統）**
   - 容器內容追蹤
   - 液體視覺化
   - 倒酒動畫與粒子效果
   - 調酒辨識系統
   - 酒精濃度計算

## 操作指南

### 基本操作
- **W/A/S/D**：移動
- **滑鼠**：視角控制
- **E**：拾取物品 / 與 NPC 或吉他互動
- **R**：將物品放回原位
- **M**：開啟/關閉調酒配方面板
- **P**：開啟/關閉製作人資訊面板

### 調酒操作
1. **拾取酒瓶/杯子**：走近物品並按 **E** 鍵
2. **倒酒**：
   - 手持酒瓶或 Shaker
   - **準星對準**目標杯子（會顯示黃色高亮）
   - 確保距離在 **2.5m 內**
   - 按住**滑鼠左鍵**開始倒酒
3. **搖酒**：手持 Shaker 並按住**滑鼠左鍵**（當 Shaker 內無液體或附近無容器時）
4. **喝酒**：手持有液體的杯子，按**滑鼠右鍵**
5. **給 NPC 喝酒**：手持有液體的杯子，靠近 NPC 後按 **F** 鍵

### 調酒配方範例

#### Martini（馬丁尼）
- 60ml 琴酒 (Gin)
- 10ml 不甜香艾酒 (Dry Vermouth)
- 作法：攪拌法，濾入冰鎮馬丁尼杯

#### Mojito（莫希托）
- 45ml 蘭姆酒 (Rum)
- 20ml 萊姆汁 (Lime Juice)
- 20ml 糖漿 (Simple Syrup)
- 適量蘇打水 (Soda Water)
- 作法：壓碎薄荷葉與糖，加冰和材料，上方加蘇打水

#### Margarita（瑪格麗特）
- 50ml 龍舌蘭 (Tequila)
- 20ml 橙皮酒 (Triple Sec)
- 15ml 萊姆汁 (Lime Juice)
- 作法：搖盪法，濾入杯緣抹鹽的杯中

*更多配方請在遊戲中按 **M** 鍵查看完整食譜面板*

## 技術細節

### 倒酒判定機制
倒酒需要同時滿足以下條件：
1. **距離判定**：手持物品與目標容器距離 < 2.5m
2. **視角判定**：準星朝向與容器方向夾角 < 30° (cos θ ≥ 0.866)
3. **高亮顯示**：滿足條件時容器會顯示黃色外框

### 液體視覺系統
- 動態生成圓柱體幾何體表現液體
- 根據容量計算液體高度
- 加權平均計算混合顏色
- 透明度與光澤度模擬真實液體

### 物理碰撞層級
- **玩家碰撞**：與牆壁、地板、吧檯互動
- **物品碰撞**：與吧檯、酒架、展示櫃架子互動
- **架子特殊碰撞**：只與物品碰撞，玩家可以穿過

## 安裝與執行

### 環境需求
- Node.js 14+
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd ncu-bar-simulator
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發伺服器**
   ```bash
   npm start
   ```

4. **開啟瀏覽器**
   ```
   http://localhost:8080
   ```

### 建置生產版本
```bash
npm run build
```
建置完成後，檔案會輸出到 `public/` 目錄。

## 開發指南

### 新增調酒配方
在 `CocktailSystem.js` 的 `identifyCocktail` 方法中新增配方辨識邏輯：

```javascript
// 範例：新增 Cosmopolitan
if (types.includes('vodka') &&
    types.includes('triple_sec') &&
    types.includes('cranberry_juice') &&
    types.includes('lime_juice')) {
    return '柯夢波丹 (Cosmopolitan) ✨';
}
```

### 新增可互動物品
1. 在對應模組中創建物品（如 `BarTools.js`）
2. 在 `BarEnvironment.js` 的 `setupInteractables` 中註冊：
   ```javascript
   this.interaction.registerInteractable(object, 'type', originalPosition);
   this.physics.addCylinderBody(object, ...);
   ```

### 修改倒酒參數
在 `index.js` 的 `findNearbyContainer` 方法中調整：
- `distance > 2.5`：修改距離閾值
- `dotProduct >= 0.85`：修改視角閾值（對應約 30°）

## 已知問題與未來改進

### 待優化項目
- [ ] 增加冰塊系統
- [ ] 更多調酒工具（吧匙、濾冰器等）
- [ ] NPC AI 對話系統
- [ ] 音效系統（倒酒聲、搖酒聲等）
- [ ] 存檔功能
- [ ] 多人連線模式

### 效能優化
- [ ] 物件池管理
- [ ] LOD 系統
- [ ] 粒子系統優化

## 授權資訊

本專案採用 MIT 授權條款。

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 本專案
2. 創建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 致謝

- Three.js 社群
- IBA（國際調酒師協會）經典調酒配方
- 所有貢獻者

---

**Enjoy your virtual bartending experience! 🍹**
