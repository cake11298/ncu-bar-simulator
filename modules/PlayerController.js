import * as THREE from 'three';

export class PlayerController {
    constructor(camera) {
        this.camera = camera;
        this.position = new THREE.Vector3(0, 1.6, 5);
        this.rotation = 0;
        this.speed = 5;
        this.rotationSpeed = 2;
        
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    update(deltaTime = 0.016) {
        // 旋轉
        if (this.keys['arrowleft']) {
            this.rotation += this.rotationSpeed * deltaTime;
        }
        if (this.keys['arrowright']) {
            this.rotation -= this.rotationSpeed * deltaTime;
        }
        
        // 計算移動方向
        const moveVector = new THREE.Vector3();
        
        if (this.keys['w']) {
            moveVector.z -= 1;
        }
        if (this.keys['s']) {
            moveVector.z += 1;
        }
        if (this.keys['a']) {
            moveVector.x -= 1;
        }
        if (this.keys['d']) {
            moveVector.x += 1;
        }
        
        // 應用旋轉到移動向量
        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.multiplyScalar(this.speed * deltaTime);
            moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
            
            // 更新位置（加入邊界檢查）
            const newPosition = this.position.clone().add(moveVector);
            if (Math.abs(newPosition.x) < 9 && Math.abs(newPosition.z) < 9) {
                this.position.add(moveVector);
            }
        }
        
        // 更新相機
        this.camera.position.copy(this.position);
        this.camera.rotation.y = this.rotation;
    }
    
    isInteracting() {
        return this.keys['e'];
    }
}