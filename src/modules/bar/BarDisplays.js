import * as THREE from 'three';

/**
 * 展示櫃模組
 * 負責創建高級酒瓶展示櫃和材料展示櫃
 */
export class BarDisplays {
    constructor(scene) {
        this.scene = scene;
        this.ingredientBottles = [];
    }

    /**
     * 創建所有展示櫃
     */
    createAll() {
        // 暫時註解掉高級酒瓶展示櫃,簡化場景
        // this.createPremiumBottleDisplay();

        this.createIngredientShelf();
    }

    /**
     * 創建材料展示櫃(參考旻偉附近的高級展示櫃樣式)
     * 位置調整到 Seaton 旁邊,轉90度靠牆
     */
    createIngredientShelf() {
        const displayCase = new THREE.Group();

        // 透明玻璃展示櫃外殼
        const glassCase = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2.5, 1.0),
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1, // 非常透明
                shininess: 200,
                side: THREE.DoubleSide
            })
        );
        glassCase.position.y = 1.25;
        displayCase.add(glassCase);

        // 銀色金屬框架
        const caseFrame = new THREE.Mesh(
            new THREE.BoxGeometry(3.1, 2.6, 1.1),
            new THREE.MeshPhongMaterial({
                color: 0xc0c0c0, // 銀色
                shininess: 120,
                metalness: 0.8,
                transparent: true,
                opacity: 0.3
            })
        );
        caseFrame.position.y = 1.25;
        displayCase.add(caseFrame);

        // 3層透明玻璃架子,帶LED燈帶
        for (let i = 0; i < 3; i++) {
            // 玻璃層板
            const shelf = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 0.05, 0.8),
                new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.15,
                    shininess: 200
                })
            );
            shelf.position.set(0, 0.4 + i * 0.7, 0);
            displayCase.add(shelf);

            // LED 燈帶(藍白色光暈)
            const ledStrip = new THREE.Mesh(
                new THREE.BoxGeometry(2.6, 0.02, 0.1),
                new THREE.MeshBasicMaterial({
                    color: 0x87ceeb, // 天藍色
                    transparent: true,
                    opacity: 0.9
                })
            );
            ledStrip.position.set(0, 0.42 + i * 0.7, -0.35);
            displayCase.add(ledStrip);
        }

        // 添加三個小綠色盆栽裝飾(參考旻偉附近的風格)
        const plantPositions = [
            { x: -1.3, y: 0.05, z: 0.3 },
            { x: 0, y: 0.05, z: 0.3 },
            { x: 1.3, y: 0.05, z: 0.3 }
        ];

        plantPositions.forEach(pos => {
            const plantGroup = new THREE.Group();

            // 小花盆
            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.12, 0.2),
                new THREE.MeshPhongMaterial({
                    color: 0x654321,
                    shininess: 40
                })
            );
            pot.position.y = 0.1;

            // 綠色植物葉子
            for (let i = 0; i < 5; i++) {
                const leaf = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 6, 4),
                    new THREE.MeshPhongMaterial({
                        color: 0x2e7d32,
                        shininess: 30
                    })
                );
                leaf.scale.set(1, 0.1, 1.5);
                const angle = (i / 5) * Math.PI * 2;
                leaf.position.set(
                    Math.cos(angle) * 0.1,
                    0.25 + Math.random() * 0.1,
                    Math.sin(angle) * 0.1
                );
                leaf.rotation.y = angle;
                plantGroup.add(leaf);
            }

            plantGroup.add(pot);
            plantGroup.position.set(pos.x, pos.y, pos.z);
            displayCase.add(plantGroup);
        });

        // 調酒材料清單(經典調酒常用材料)
        const ingredients = [
            // 第一層:利口酒類
            { type: 'vermouth_dry', name: 'Dry Vermouth', displayName: '不甜香艾酒', color: 0xe8e8d0, x: -1.0, y: 0.5 },
            { type: 'vermouth_sweet', name: 'Sweet Vermouth', displayName: '甜香艾酒', color: 0x8b4513, x: -0.35, y: 0.5 },
            { type: 'campari', name: 'Campari', displayName: '金巴利', color: 0xdc143c, x: 0.35, y: 0.5 },
            { type: 'triple_sec', name: 'Triple Sec', displayName: '橙皮酒', color: 0xffa500, x: 1.0, y: 0.5 },

            // 第二層:果汁和糖漿
            { type: 'lemon_juice', name: 'Lemon Juice', displayName: '檸檬汁', color: 0xfff44f, x: -1.0, y: 1.2 },
            { type: 'lime_juice', name: 'Lime Juice', displayName: '萊姆汁', color: 0xbfff00, x: -0.35, y: 1.2 },
            { type: 'simple_syrup', name: 'Simple Syrup', displayName: '糖漿', color: 0xffffff, x: 0.35, y: 1.2 },
            { type: 'grenadine', name: 'Grenadine', displayName: '紅石榴糖漿', color: 0xff1493, x: 1.0, y: 1.2 },

            // 第三層:特殊材料
            { type: 'pineapple_juice', name: 'Pineapple Juice', displayName: '鳳梨汁', color: 0xffff66, x: -1.0, y: 1.9 },
            { type: 'coconut_cream', name: 'Coconut Cream', displayName: '椰漿', color: 0xfffaf0, x: -0.35, y: 1.9 },
            { type: 'orange_juice', name: 'Orange Juice', displayName: '柳橙汁', color: 0xff8c00, x: 0.35, y: 1.9 },
            { type: 'cranberry_juice', name: 'Cranberry Juice', displayName: '蔓越莓汁', color: 0xdc143c, x: 1.0, y: 1.9 }
        ];

        ingredients.forEach(ingredient => {
            const bottle = this.createIngredientBottle(ingredient);
            bottle.position.set(ingredient.x, ingredient.y, 0);
            displayCase.add(bottle);

            // 保存到陣列以便後續註冊為可互動物品
            this.ingredientBottles.push({
                mesh: bottle,
                type: ingredient.type,
                name: ingredient.name,
                displayName: ingredient.displayName
            });
        });

        // 重要:調整位置到 Seaton 旁邊,靠近小仙人掌位置
        // Seaton 位置大約在 (-2, 0, -5)
        // 將展示櫃放在 Seaton 的左邊,三顆小仙人掌附近有櫃子的位置
        displayCase.position.set(-4.8, 0, -4.5);
        displayCase.rotation.y = Math.PI / 6; // 稍微旋轉,面向玩家

        displayCase.castShadow = true;
        displayCase.receiveShadow = true;

        this.scene.add(displayCase);
    }

    /**
     * 創建材料瓶
     */
    createIngredientBottle(ingredient) {
        const bottleGroup = new THREE.Group();

        // 瓶身(較小的瓶子)
        const bottleBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8),
            new THREE.MeshPhongMaterial({
                color: ingredient.color,
                transparent: true,
                opacity: 0.7,
                shininess: 100
            })
        );
        bottleBody.position.y = 0.175;

        // 瓶蓋
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.04),
            new THREE.MeshPhongMaterial({
                color: 0x2c2c2c,
                shininess: 80
            })
        );
        cap.position.y = 0.37;

        // 標籤
        const label = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.12, 0.01),
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 10
            })
        );
        label.position.set(0, 0.15, 0.095);

        bottleGroup.add(bottleBody);
        bottleGroup.add(cap);
        bottleGroup.add(label);

        bottleGroup.castShadow = true;
        bottleGroup.receiveShadow = true;

        return bottleGroup;
    }

    /**
     * 獲取材料瓶列表
     */
    getIngredientBottles() {
        return this.ingredientBottles;
    }
}
