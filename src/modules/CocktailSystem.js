import * as THREE from 'three';

/**
 * 調酒系統 - 處理倒酒、搖酒、喝酒等調酒邏輯
 */
export default class CocktailSystem {
    constructor(scene, interactionSystem) {
        this.scene = scene;
        this.interaction = interactionSystem;

        // 容器內容追蹤 { container -> { ingredients: [], color, volume } }
        this.containerContents = new Map();

        // 倒酒狀態
        this.isPouringActive = false;
        this.pouringStartTime = 0;

        // 搖酒狀態
        this.isShakingActive = false;
        this.shakeIntensity = 0;
        this.shakeTime = 0;

        // 粒子系統（用於倒酒效果）
        this.particleSystems = new Map();

        // 酒類資料庫
        this.liquorDatabase = this.initLiquorDatabase();
    }

    /**
     * 初始化酒類資料庫
     * @returns {Map} 酒類資料
     */
    initLiquorDatabase() {
        const database = new Map();

        // === 六大基酒 ===
        database.set('vodka', {
            name: '伏特加',
            displayName: 'Vodka',
            color: 0xf0f0f0,
            alcoholContent: 40,
            category: 'base_spirit'
        });

        database.set('gin', {
            name: '琴酒',
            displayName: 'Gin',
            color: 0xe8f4f8,
            alcoholContent: 40,
            category: 'base_spirit'
        });

        database.set('rum', {
            name: '蘭姆酒',
            displayName: 'Rum',
            color: 0xd4a574,
            alcoholContent: 40,
            category: 'base_spirit'
        });

        database.set('whiskey', {
            name: '威士忌',
            displayName: 'Whiskey',
            color: 0xb87333,
            alcoholContent: 40,
            category: 'base_spirit'
        });

        database.set('tequila', {
            name: '龍舌蘭',
            displayName: 'Tequila',
            color: 0xf5deb3,
            alcoholContent: 40,
            category: 'base_spirit'
        });

        database.set('brandy', {
            name: '白蘭地',
            displayName: 'Brandy',
            color: 0x8b4513,
            alcoholContent: 40,
            category: 'base_spirit'
        });

        // === 調味料 ===
        database.set('lemon_juice', {
            name: '檸檬汁',
            displayName: 'Lemon Juice',
            color: 0xfff44f,
            alcoholContent: 0,
            category: 'mixer'
        });

        database.set('lime_juice', {
            name: '萊姆汁',
            displayName: 'Lime Juice',
            color: 0x32cd32,
            alcoholContent: 0,
            category: 'mixer'
        });

        database.set('simple_syrup', {
            name: '糖漿',
            displayName: 'Simple Syrup',
            color: 0xffe4b5,
            alcoholContent: 0,
            category: 'mixer'
        });

        database.set('grenadine', {
            name: '紅石榴糖漿',
            displayName: 'Grenadine',
            color: 0xff0000,
            alcoholContent: 0,
            category: 'mixer'
        });

        database.set('angostura_bitters', {
            name: '安格仕苦精',
            displayName: 'Angostura Bitters',
            color: 0x8b0000,
            alcoholContent: 44.7,
            category: 'mixer'
        });

        // === 果汁類 ===
        database.set('orange_juice', {
            name: '柳橙汁',
            displayName: 'Orange Juice',
            color: 0xffa500,
            alcoholContent: 0,
            category: 'juice'
        });

        database.set('pineapple_juice', {
            name: '鳳梨汁',
            displayName: 'Pineapple Juice',
            color: 0xffeb3b,
            alcoholContent: 0,
            category: 'juice'
        });

        database.set('cranberry_juice', {
            name: '蔓越莓汁',
            displayName: 'Cranberry Juice',
            color: 0xdc143c,
            alcoholContent: 0,
            category: 'juice'
        });

        database.set('tomato_juice', {
            name: '番茄汁',
            displayName: 'Tomato Juice',
            color: 0xff6347,
            alcoholContent: 0,
            category: 'juice'
        });

        database.set('grapefruit_juice', {
            name: '葡萄柚汁',
            displayName: 'Grapefruit Juice',
            color: 0xff69b4,
            alcoholContent: 0,
            category: 'juice'
        });

        // === 其他常見材料 ===
        database.set('soda_water', {
            name: '蘇打水',
            displayName: 'Soda Water',
            color: 0xe0ffff,
            alcoholContent: 0,
            category: 'mixer'
        });

        database.set('tonic_water', {
            name: '通寧水',
            displayName: 'Tonic Water',
            color: 0xf0ffff,
            alcoholContent: 0,
            category: 'mixer'
        });

        database.set('cola', {
            name: '可樂',
            displayName: 'Cola',
            color: 0x3e2723,
            alcoholContent: 0,
            category: 'mixer'
        });

        database.set('liqueur', {
            name: '利口酒',
            displayName: 'Liqueur',
            color: 0xff6b9d,
            alcoholContent: 20,
            category: 'liqueur'
        });

        return database;
    }

    /**
     * 初始化容器（杯子、Shaker）
     * @param {THREE.Object3D} container - 容器物件
     * @param {number} maxVolume - 最大容量（ml）
     */
    initContainer(container, maxVolume = 300) {
        this.containerContents.set(container, {
            ingredients: [],
            color: 0xffffff,
            volume: 0,
            maxVolume: maxVolume,
            liquidMesh: null
        });

        // 創建液體視覺效果
        this.createLiquidVisual(container);
    }

    /**
     * 創建液體視覺效果
     * @param {THREE.Object3D} container - 容器物件
     */
    createLiquidVisual(container) {
        const contents = this.containerContents.get(container);
        if (!contents) return;

        // 創建液體網格（圓柱體）
        const liquidGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.01, 16);
        const liquidMaterial = new THREE.MeshPhongMaterial({
            color: contents.color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquidMesh.position.y = -0.3; // 杯子底部
        liquidMesh.visible = false; // 初始隱藏

        container.add(liquidMesh);
        contents.liquidMesh = liquidMesh;
    }

    /**
     * 更新液體視覺效果
     * @param {THREE.Object3D} container - 容器物件
     */
    updateLiquidVisual(container) {
        const contents = this.containerContents.get(container);
        if (!contents || !contents.liquidMesh) return;

        const fillRatio = contents.volume / contents.maxVolume;

        if (fillRatio > 0) {
            // 顯示液體
            contents.liquidMesh.visible = true;

            // 更新高度（根據容量）
            const maxHeight = 0.6; // 杯子高度
            const liquidHeight = maxHeight * fillRatio;

            contents.liquidMesh.scale.y = liquidHeight * 10; // 調整比例
            contents.liquidMesh.position.y = -0.3 + liquidHeight / 2;

            // 更新顏色
            contents.liquidMesh.material.color.setHex(contents.color);
        } else {
            // 隱藏液體
            contents.liquidMesh.visible = false;
        }
    }

    /**
     * 倒酒（從酒瓶到容器）
     * @param {THREE.Object3D} bottle - 酒瓶
     * @param {THREE.Object3D} targetContainer - 目標容器
     * @param {string} liquorType - 酒類類型
     * @param {number} deltaTime - 時間增量
     */
    pour(bottle, targetContainer, liquorType, deltaTime) {
        const contents = this.containerContents.get(targetContainer);
        if (!contents) return;

        // 檢查容器是否已滿
        if (contents.volume >= contents.maxVolume) {
            console.log('容器已滿！');
            return;
        }

        // 倒酒速度（ml/秒）
        const pourRate = 50;
        const amountPoured = pourRate * deltaTime;

        // 添加酒水
        const liquor = this.liquorDatabase.get(liquorType);
        if (liquor) {
            contents.ingredients.push({
                type: liquorType,
                name: liquor.name,
                amount: amountPoured,
                color: liquor.color
            });

            contents.volume += amountPoured;

            // 重新計算混合顏色
            this.updateMixedColor(targetContainer);

            // 更新視覺效果
            this.updateLiquidVisual(targetContainer);

            // 創建倒酒粒子效果
            if (!this.isPouringActive) {
                this.createPourParticles(bottle, targetContainer);
                this.isPouringActive = true;
            }
        }
    }

    /**
     * 停止倒酒
     */
    stopPouring() {
        this.isPouringActive = false;
        this.removePourParticles();
    }

    /**
     * 創建倒酒粒子效果
     * @param {THREE.Object3D} bottle - 酒瓶
     * @param {THREE.Object3D} target - 目標容器
     */
    createPourParticles(bottle, target) {
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.6
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        particleSystem.position.copy(bottle.position);
        particleSystem.position.y -= 0.3; // 瓶口位置

        this.scene.add(particleSystem);
        this.particleSystems.set('pour', particleSystem);
    }

    /**
     * 移除倒酒粒子效果
     */
    removePourParticles() {
        const particleSystem = this.particleSystems.get('pour');
        if (particleSystem) {
            this.scene.remove(particleSystem);
            this.particleSystems.delete('pour');
        }
    }

    /**
     * 搖酒（Shaker）
     * @param {THREE.Object3D} shaker - 搖酒器
     * @param {number} deltaTime - 時間增量
     */
    shake(shaker, deltaTime) {
        const contents = this.containerContents.get(shaker);
        if (!contents || contents.volume === 0) {
            console.log('Shaker 是空的！');
            return;
        }

        this.isShakingActive = true;
        this.shakeTime += deltaTime;

        // 搖晃強度（正弦波動）
        this.shakeIntensity = Math.sin(this.shakeTime * 20) * 0.05;

        // 應用搖晃旋轉
        shaker.rotation.z = this.shakeIntensity;
        shaker.rotation.x = Math.sin(this.shakeTime * 15) * 0.03;

        // 搖晃會混合酒水，增強顏色混合
        if (this.shakeTime > 2) {
            this.enhanceMixing(shaker);
        }
    }

    /**
     * 停止搖酒
     * @param {THREE.Object3D} shaker - 搖酒器
     */
    stopShaking(shaker) {
        this.isShakingActive = false;
        this.shakeTime = 0;

        // 重置旋轉
        shaker.rotation.z = 0;
        shaker.rotation.x = 0;
    }

    /**
     * 增強混合效果
     * @param {THREE.Object3D} container - 容器
     */
    enhanceMixing(container) {
        const contents = this.containerContents.get(container);
        if (!contents) return;

        // 混合後顏色更均勻
        this.updateMixedColor(container);
        this.updateLiquidVisual(container);
    }

    /**
     * 更新混合顏色
     * @param {THREE.Object3D} container - 容器
     */
    updateMixedColor(container) {
        const contents = this.containerContents.get(container);
        if (!contents || contents.ingredients.length === 0) return;

        let r = 0, g = 0, b = 0;
        let totalAmount = 0;

        // 加權平均計算混合顏色
        contents.ingredients.forEach(ingredient => {
            const color = new THREE.Color(ingredient.color);
            const weight = ingredient.amount;

            r += color.r * weight;
            g += color.g * weight;
            b += color.b * weight;
            totalAmount += weight;
        });

        if (totalAmount > 0) {
            r /= totalAmount;
            g /= totalAmount;
            b /= totalAmount;

            const mixedColor = new THREE.Color(r, g, b);
            contents.color = mixedColor.getHex();
        }
    }

    /**
     * 喝掉飲品
     * @param {THREE.Object3D} container - 容器
     * @returns {Object} 飲品資訊
     */
    drink(container) {
        const contents = this.containerContents.get(container);
        if (!contents || contents.volume === 0) {
            console.log('杯子是空的！');
            return null;
        }

        // 獲取飲品資訊
        const drinkInfo = {
            volume: contents.volume,
            ingredients: [...contents.ingredients],
            color: contents.color,
            name: this.identifyCocktail(contents)
        };

        // 清空容器
        contents.ingredients = [];
        contents.volume = 0;
        contents.color = 0xffffff;

        // 更新視覺
        this.updateLiquidVisual(container);

        console.log(`你喝了 ${drinkInfo.name}！`);
        return drinkInfo;
    }

    /**
     * 識別雞尾酒
     * @param {Object} contents - 容器內容
     * @returns {string} 雞尾酒名稱
     */
    identifyCocktail(contents) {
        const types = contents.ingredients.map(ing => ing.type);

        // 簡單的配方匹配
        if (types.includes('vodka') && types.length === 1) {
            return '伏特加純飲';
        } else if (types.includes('gin') && types.length === 1) {
            return '琴酒純飲';
        } else if (types.includes('rum') && types.includes('liqueur')) {
            return '熱帶雞尾酒';
        } else if (types.includes('vodka') && types.includes('liqueur')) {
            return '性感海灘';
        } else if (types.length > 2) {
            return '特調混酒';
        } else if (types.length === 2) {
            return '雙料調酒';
        } else {
            return '未知飲品';
        }
    }

    /**
     * 清空容器
     * @param {THREE.Object3D} container - 容器
     */
    emptyContainer(container) {
        const contents = this.containerContents.get(container);
        if (!contents) return;

        contents.ingredients = [];
        contents.volume = 0;
        contents.color = 0xffffff;

        this.updateLiquidVisual(container);
    }

    /**
     * 獲取容器資訊
     * @param {THREE.Object3D} container - 容器
     * @returns {Object|null} 容器內容
     */
    getContainerInfo(container) {
        return this.containerContents.get(container) || null;
    }

    /**
     * 檢查容器是否為空
     * @param {THREE.Object3D} container - 容器
     * @returns {boolean}
     */
    isEmpty(container) {
        const contents = this.containerContents.get(container);
        return !contents || contents.volume === 0;
    }

    /**
     * 檢查容器是否已滿
     * @param {THREE.Object3D} container - 容器
     * @returns {boolean}
     */
    isFull(container) {
        const contents = this.containerContents.get(container);
        return contents && contents.volume >= contents.maxVolume;
    }

    /**
     * 獲取配方建議
     * @returns {Array} 配方列表
     */
    getRecipeSuggestions() {
        return [
            {
                name: 'Mojito',
                ingredients: ['rum', 'liqueur'],
                description: '清新的古巴經典'
            },
            {
                name: 'Cosmopolitan',
                ingredients: ['vodka', 'liqueur'],
                description: '優雅的城市風情'
            },
            {
                name: 'Old Fashioned',
                ingredients: ['whiskey', 'liqueur'],
                description: '經典威士忌調酒'
            },
            {
                name: 'Margarita',
                ingredients: ['tequila', 'liqueur'],
                description: '墨西哥風味雞尾酒'
            }
        ];
    }

    /**
     * 顯示容器成分信息（UI）
     * @param {THREE.Object3D} container - 容器
     */
    showContainerInfo(container) {
        const contents = this.containerContents.get(container);
        const infoDiv = document.getElementById('container-info');

        if (!contents || !infoDiv) return;

        if (contents.volume > 0) {
            // 構建成分列表
            const ingredientListHTML = contents.ingredients.map(ing => {
                const liquor = this.liquorDatabase.get(ing.type);
                return `
                    <div class="ingredient-item">
                        <span class="ingredient-name">${liquor ? liquor.name : ing.name}</span>
                        <span class="ingredient-amount">${Math.round(ing.amount)} ml</span>
                    </div>
                `;
            }).join('');

            // 識別雞尾酒
            const cocktailName = this.identifyCocktail(contents);

            infoDiv.innerHTML = `
                <h3>${cocktailName}</h3>
                <div class="ingredient-list">
                    ${ingredientListHTML}
                </div>
                <div class="volume-info">
                    總容量: ${Math.round(contents.volume)} / ${contents.maxVolume} ml
                </div>
            `;
            infoDiv.classList.add('visible');
        } else {
            infoDiv.classList.remove('visible');
        }
    }

    /**
     * 隱藏容器成分信息
     */
    hideContainerInfo() {
        const infoDiv = document.getElementById('container-info');
        if (infoDiv) {
            infoDiv.classList.remove('visible');
        }
    }

    /**
     * 更新系統（每幀調用）
     * @param {number} deltaTime - 時間增量
     */
    update(deltaTime) {
        // 更新倒酒粒子動畫
        if (this.isPouringActive) {
            const particleSystem = this.particleSystems.get('pour');
            if (particleSystem) {
                const positions = particleSystem.geometry.attributes.position.array;

                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] -= deltaTime * 2; // 下降

                    // 重置粒子
                    if (positions[i + 1] < -0.5) {
                        positions[i + 1] = 0;
                    }
                }

                particleSystem.geometry.attributes.position.needsUpdate = true;
            }
        }
    }
}
