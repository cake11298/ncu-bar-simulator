import * as THREE from 'three';
import { BarEnvironment } from './modules/BarEnvironment';
import { NPCManager } from './modules/NPCManager';
import { PlayerController } from './modules/PlayerController';
import { LightingSystem } from './modules/LightingSystem';
import { RetirementLounge } from './modules/RetirementLounge';
import PhysicsSystem from './modules/PhysicsSystem';
import InteractionSystem from './modules/InteractionSystem';
import CocktailSystem from './modules/CocktailSystem';
import './styles/main.css';

class BarSimulator {
    constructor() {
        this.clock = new THREE.Clock();
        this.lastInteraction = false;
        this.lastPickup = false;
        this.lastDrop = false;
        this.lastReturn = false;
        this.lastRightMouse = false;
        this.init();
    }
    
    init() {
        // 初始化 Three.js
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x1a0033, 10, 30);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('app').appendChild(this.renderer.domElement);
        
        // 載入模組
        this.retirementLounge = new RetirementLounge(this.scene);

        // 初始化新系統
        this.physicsSystem = new PhysicsSystem();
        this.interactionSystem = new InteractionSystem(this.camera, this.physicsSystem);
        this.cocktailSystem = new CocktailSystem(this.scene, this.interactionSystem);

        // 載入環境（傳入系統引用）
        this.environment = new BarEnvironment(
            this.scene,
            this.interactionSystem,
            this.physicsSystem,
            this.cocktailSystem
        );

        this.npcManager = new NPCManager(this.scene);
        this.playerController = new PlayerController(this.camera);
        this.lightingSystem = new LightingSystem(this.scene);
        
        // 設定視窗調整
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 隱藏載入畫面
        document.getElementById('loading').classList.add('hidden');
        
        // 開始動畫
        this.animate();
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // 更新各個系統
        this.playerController.update(deltaTime);
        this.npcManager.update(deltaTime);
        this.lightingSystem.update(elapsedTime);

        // 更新新系統
        this.physicsSystem.update(deltaTime);
        this.interactionSystem.update();
        this.cocktailSystem.update(deltaTime);

        // === 物品互動系統 ===
        // 檢測玩家瞄準的物品
        const targetedItem = this.interactionSystem.checkTargeted();

        // 處理拾取/放下物品
        const isPickupPressed = this.playerController.isPickupPressed();
        const isDropPressed = this.playerController.isDropPressed();
        const isReturnPressed = this.playerController.isReturnPressed();

        // E 鍵：拾取物品 或 與 NPC 互動
        if (isPickupPressed && !this.lastPickup) {
            if (!this.interactionSystem.isHoldingObject() && targetedItem) {
                // 拾取物品
                this.interactionSystem.pickupObject();
                this.updateInteractionHint();
            } else {
                // 與 NPC 互動
                const npcTarget = this.npcManager.checkInteractions(this.playerController.position);
                this.npcManager.interact(npcTarget);
            }
            this.playerController.resetKey('e');
        }
        this.lastPickup = isPickupPressed;

        // Q 鍵：放下物品
        if (isDropPressed && !this.lastDrop) {
            if (this.interactionSystem.isHoldingObject()) {
                this.interactionSystem.dropObject(false);
                this.updateInteractionHint();
            }
            this.playerController.resetKey('q');
        }
        this.lastDrop = isDropPressed;

        // R 鍵：放回原位
        if (isReturnPressed && !this.lastReturn) {
            if (this.interactionSystem.isHoldingObject()) {
                this.interactionSystem.dropObject(true);
                this.updateInteractionHint();
            }
            this.playerController.resetKey('r');
        }
        this.lastReturn = isReturnPressed;

        // === 調酒互動 ===
        const heldObject = this.interactionSystem.getHeldObject();
        const heldType = this.interactionSystem.getHeldObjectType();

        // 滑鼠左鍵：倒酒 或 搖酒
        if (this.playerController.isLeftMouseHeld() && heldObject) {
            if (heldType === 'bottle') {
                // 倒酒：找尋附近的容器
                const nearbyGlass = this.findNearbyContainer(heldObject);
                if (nearbyGlass) {
                    const liquorType = heldObject.userData.liquorType;
                    this.cocktailSystem.pour(heldObject, nearbyGlass, liquorType, deltaTime);
                }
            } else if (heldType === 'shaker') {
                // 搖酒
                this.cocktailSystem.shake(heldObject, deltaTime);
            }
        } else {
            // 停止倒酒/搖酒
            if (this.cocktailSystem.isPouringActive) {
                this.cocktailSystem.stopPouring();
            }
            if (heldType === 'shaker' && this.cocktailSystem.isShakingActive) {
                this.cocktailSystem.stopShaking(heldObject);
            }
        }

        // 滑鼠右鍵：喝酒
        const isRightPressed = this.playerController.isRightMousePressed();
        if (isRightPressed && !this.lastRightMouse && heldObject) {
            if (heldType === 'glass') {
                const drinkInfo = this.cocktailSystem.drink(heldObject);
                if (drinkInfo) {
                    this.showDrinkMessage(drinkInfo);
                }
            }
            this.playerController.resetMouseButton('right');
        }
        this.lastRightMouse = isRightPressed;

        // 更新 UI 提示
        this.updateInteractionHint();

        // 渲染場景
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 尋找附近的容器（用於倒酒）
     */
    findNearbyContainer(sourceObject) {
        const allContainers = [
            ...this.environment.glasses,
            this.environment.barTools.shaker
        ].filter(c => c !== null && c !== undefined);

        for (const container of allContainers) {
            if (container === sourceObject) continue;

            const distance = sourceObject.position.distanceTo(container.position);
            if (distance < 1.5) { // 1.5 米內可以倒酒
                return container;
            }
        }

        return null;
    }

    /**
     * 更新互動提示
     */
    updateInteractionHint() {
        const hintElement = document.getElementById('interaction-hint');
        if (!hintElement) return;

        const hint = this.interactionSystem.getInteractionHint();
        hintElement.textContent = hint;

        if (hint) {
            hintElement.classList.add('visible');
        } else {
            hintElement.classList.remove('visible');
        }
    }

    /**
     * 顯示飲品訊息
     */
    showDrinkMessage(drinkInfo) {
        const messageElement = document.getElementById('drink-message');
        if (!messageElement) return;

        messageElement.textContent = `你喝了 ${drinkInfo.name}！容量: ${drinkInfo.volume.toFixed(0)}ml`;
        messageElement.classList.add('visible');

        setTimeout(() => {
            messageElement.classList.remove('visible');
        }, 3000);
    }
}

// 啟動應用
window.addEventListener('DOMContentLoaded', () => {
    new BarSimulator();
});