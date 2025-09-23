import * as THREE from 'three';

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.setupLighting();
    }
    
    setupLighting() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // 主要照明（暖色調酒吧燈光）
        const mainLight = new THREE.PointLight(0xffa500, 1, 15);
        mainLight.position.set(0, 6, 0);
        mainLight.castShadow = true;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 15;
        this.scene.add(mainLight);
        this.lights.push(mainLight);
        
        // 吧檯聚光燈
        const spotLight = new THREE.SpotLight(0xffd700, 0.8);
        spotLight.position.set(0, 8, -3);
        spotLight.target.position.set(0, 0, -3);
        spotLight.castShadow = true;
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.3;
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
        this.lights.push(spotLight);
        
        // 酒架照明（紫色氛圍光）
        const shelfLight = new THREE.PointLight(0x6b46c1, 0.5, 10);
        shelfLight.position.set(0, 5, -7);
        this.scene.add(shelfLight);
        this.lights.push(shelfLight);
        
        // 動態燈光效果
        this.createDynamicLights();
    }
    
    createDynamicLights() {
        // 模擬霓虹燈效果
        const neonColors = [0xff00ff, 0x00ffff, 0xffff00];
        
        neonColors.forEach((color, index) => {
            const neonLight = new THREE.PointLight(color, 0.3, 5);
            neonLight.position.set(
                Math.cos(index * Math.PI * 2 / 3) * 5,
                2,
                Math.sin(index * Math.PI * 2 / 3) * 5
            );
            this.scene.add(neonLight);
            this.lights.push({
                light: neonLight,
                isDynamic: true,
                phase: index * Math.PI * 2 / 3
            });
        });
    }
    
    update(time) {
        // 更新動態燈光
        this.lights.forEach(lightObj => {
            if (lightObj.isDynamic) {
                const intensity = 0.3 + Math.sin(time * 2 + lightObj.phase) * 0.2;
                lightObj.light.intensity = intensity;
            }
        });
    }
}