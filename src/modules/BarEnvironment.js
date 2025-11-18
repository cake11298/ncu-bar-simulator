import * as THREE from 'three';
import { BarStructure } from './bar/BarStructure.js';
import { BarBottles } from './bar/BarBottles.js';
import { BarTools } from './bar/BarTools.js';
import { BarDisplays } from './bar/BarDisplays.js';
import { BarFurniture } from './bar/BarFurniture.js';

/**
 * 吧台環境主協調類(已重構)
 * 這個類現在只負責協調各個模組,不再包含具體的創建邏輯
 */
export class BarEnvironment {
    constructor(scene, interactionSystem = null, physicsSystem = null, cocktailSystem = null) {
        this.scene = scene;
        this.bottles = [];
        this.interactables = []; // 可互動物品列表
        this.glasses = []; // 杯子列表
        this.barTools = {}; // 吧檯工具(shaker, jigger等)
        this.guitar = null; // 吉他物件(暫時移除)
        this.ingredientBottles = []; // 材料瓶列表

        // 系統引用
        this.interaction = interactionSystem;
        this.physics = physicsSystem;
        this.cocktail = cocktailSystem;

        // 創建環境
        this.createEnvironment();

        // 如果系統已初始化,設置互動物品
        if (this.interaction && this.physics && this.cocktail) {
            this.setupInteractables();
        }
    }

    /**
     * 設置可互動物品(在系統初始化後調用)
     */
    setupInteractables() {
        // 添加吧台碰撞體(允許物品放置)
        this.physics.addStaticBox(
            new THREE.Vector3(0, 1.05, -3),    // 檯面位置
            new THREE.Vector3(12.2, 0.1, 2.2)  // 檯面尺寸
        );

        // 添加酒架碰撞體(3層架子)
        for (let i = 0; i < 3; i++) {
            const shelfY = 1.5 + i * 1.2;
            this.physics.addStaticBox(
                new THREE.Vector3(0, shelfY, -8),     // 酒架位置
                new THREE.Vector3(10, 0.2, 1)          // 酒架尺寸
            );
        }

        // 註冊酒瓶為可互動物品
        this.bottles.forEach((bottle, index) => {
            const bottleType = this.getBottleTypeFromIndex(index);
            this.interaction.registerInteractable(bottle, 'bottle', bottle.position.clone());

            // 添加物理屬性
            this.physics.addCylinderBody(bottle, 0.15, 0.18, 0.85, 0.5, 'glass');

            // 標記酒類型
            bottle.userData.liquorType = bottleType;
        });

        // 註冊杯子為可互動物品
        this.glasses.forEach(glass => {
            this.interaction.registerInteractable(glass, 'glass', glass.position.clone());
            this.physics.addCylinderBody(glass, 0.13, 0.15, 0.6, 0.3, 'glass');

            // 初始化杯子容器
            this.cocktail.initContainer(glass, 300);
        });

        // 註冊 Shaker
        if (this.barTools.shaker) {
            this.interaction.registerInteractable(this.barTools.shaker, 'shaker', this.barTools.shaker.position.clone());
            this.physics.addCylinderBody(this.barTools.shaker, 0.18, 0.22, 0.65, 0.6, 'metal');
            this.cocktail.initContainer(this.barTools.shaker, 500);
        }

        // 註冊 Jigger
        if (this.barTools.jigger) {
            this.interaction.registerInteractable(this.barTools.jigger, 'jigger', this.barTools.jigger.position.clone());
            this.physics.addCylinderBody(this.barTools.jigger, 0.09, 0.13, 0.18, 0.2);
        }

        // 註冊材料瓶為可互動物品
        if (this.ingredientBottles) {
            this.ingredientBottles.forEach(ingredientData => {
                const bottle = ingredientData.mesh;
                // 計算世界位置
                const worldPos = new THREE.Vector3();
                bottle.getWorldPosition(worldPos);

                this.interaction.registerInteractable(bottle, 'bottle', worldPos);
                this.physics.addCylinderBody(bottle, 0.08, 0.1, 0.35, 0.2, 'glass');

                // 標記材料類型
                bottle.userData.liquorType = ingredientData.type;
                bottle.userData.displayName = ingredientData.displayName;
            });
        }
    }

    /**
     * 根據索引獲取酒類型
     */
    getBottleTypeFromIndex(index) {
        const types = ['gin', 'vodka', 'whiskey', 'gin', 'whiskey', 'tequila', 'rum', 'vodka'];
        return types[index % types.length];
    }

    /**
     * 創建環境(協調各個模組)
     */
    createEnvironment() {
        // 1. 創建基礎結構(地板、牆壁、吧檯、酒架)
        const structure = new BarStructure(this.scene);
        structure.createAll();
        const shelfInfo = structure.createLiquorShelf();

        // 2. 創建酒瓶和杯子
        const bottles = new BarBottles(this.scene);
        bottles.createShelfBottles([1.5, 2.7, 3.9]); // 使用酒架高度
        bottles.createDrinkingGlasses(); // 創建3個 mixing glass 杯子
        this.bottles = bottles.getBottles();
        this.glasses = bottles.getGlasses();

        // 3. 創建吧檯工具(只保留核心工具)
        const tools = new BarTools(this.scene);
        tools.createAll();
        this.barTools = tools.getTools();

        // 4. 創建展示櫃(材料展示櫃已調整位置)
        const displays = new BarDisplays(this.scene);
        displays.createAll();
        this.ingredientBottles = displays.getIngredientBottles();

        // 5. 創建家具
        const furniture = new BarFurniture(this.scene);
        furniture.createAll();

        // 暫時註解掉裝飾,簡化場景
        // this.createBarDecoration();
    }
}
