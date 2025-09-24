import * as THREE from 'three';
import { BarEnvironment } from './modules/BarEnvironment';
import { NPCManager } from './modules/NPCManager';
import { PlayerController } from './modules/PlayerController';
import { LightingSystem } from './modules/LightingSystem';
import './styles/main.css';

class BarSimulator {
    constructor() {
        this.clock = new THREE.Clock();
        this.lastInteraction = false;
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
        this.environment = new BarEnvironment(this.scene);
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
        
        // 檢查互動
        const interactionTarget = this.npcManager.checkInteractions(this.playerController.position);

        // 處理互動按鍵
        if (this.playerController.isInteracting() && !this.lastInteraction) {
            this.npcManager.interact(interactionTarget);
            this.playerController.resetInteractionKey();
        }
        this.lastInteraction = this.playerController.isInteracting();
        
        // 渲染場景
        this.renderer.render(this.scene, this.camera);
    }
}

// 啟動應用
window.addEventListener('DOMContentLoaded', () => {
    new BarSimulator();
});