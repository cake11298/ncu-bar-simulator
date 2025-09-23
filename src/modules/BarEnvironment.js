import * as THREE from 'three';

export class BarEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.bottles = [];
        this.createEnvironment();
    }
    
    createEnvironment() {
        this.createFloor();
        this.createWalls();
        this.createBarCounter();
        this.createLiquorShelf();
    }
    
    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c1810,
            shininess: 30
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }
    
    createWalls() {
        const wallMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4a3c28,
            shininess: 10
        });
        
        // 建立三面牆
        const wallPositions = [
            { pos: [0, 5, -10], rot: [0, 0, 0] }, // 後牆
            { pos: [-10, 5, 0], rot: [0, Math.PI/2, 0] }, // 左牆
            { pos: [10, 5, 0], rot: [0, -Math.PI/2, 0] } // 右牆
        ];
        
        wallPositions.forEach(({ pos, rot }) => {
            const wall = new THREE.Mesh(
                new THREE.PlaneGeometry(20, 10),
                wallMaterial
            );
            wall.position.set(...pos);
            wall.rotation.set(...rot);
            wall.receiveShadow = true;
            this.scene.add(wall);
        });
    }
    
    createBarCounter() {
        // 吧檯主體
        const counterGroup = new THREE.Group();
        
        const counter = new THREE.Mesh(
            new THREE.BoxGeometry(12, 1.2, 2),
            new THREE.MeshPhongMaterial({ 
                color: 0x8b4513,
                shininess: 60
            })
        );
        counter.position.set(0, 1.2, -3);
        counter.castShadow = true;
        counter.receiveShadow = true;
        
        // 大理石檯面
        const counterTop = new THREE.Mesh(
            new THREE.BoxGeometry(12.2, 0.1, 2.2),
            new THREE.MeshPhongMaterial({ 
                color: 0xf0f0f0,
                shininess: 100
            })
        );
        counterTop.position.set(0, 1.85, -3);
        
        counterGroup.add(counter);
        counterGroup.add(counterTop);
        this.scene.add(counterGroup);
    }
    
    createLiquorShelf() {
        // 酒架背板
        const shelfBack = new THREE.Mesh(
            new THREE.BoxGeometry(10, 6, 0.3),
            new THREE.MeshPhongMaterial({ color: 0x654321 })
        );
        shelfBack.position.set(0, 4, -8.5);
        shelfBack.castShadow = true;
        this.scene.add(shelfBack);
        
        // 建立多層架子與酒瓶
        for (let i = 0; i < 4; i++) {
            const shelf = new THREE.Mesh(
                new THREE.BoxGeometry(10, 0.2, 1),
                new THREE.MeshPhongMaterial({ color: 0x8b4513 })
            );
            shelf.position.set(0, 2 + i * 1.3, -8);
            shelf.castShadow = true;
            this.scene.add(shelf);
            
            this.createBottleRow(2 + i * 1.3);
        }
        
        this.createBarTools();
    }
    
    createBottleRow(height) {
        const bottleColors = [0x2e7d32, 0xc62828, 0xf57c00, 0x1565c0, 0x6a1b9a];
        
        for (let i = 0; i < 8; i++) {
            const bottle = this.createBottle(
                bottleColors[Math.floor(Math.random() * bottleColors.length)]
            );
            bottle.position.set(-4 + i * 1.1, height + 0.5, -7.8);
            this.bottles.push(bottle);
            this.scene.add(bottle);
        }
    }
    
    createBottle(color) {
        const bottleGroup = new THREE.Group();
        
        // 瓶身
        const bottle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 0.8),
            new THREE.MeshPhongMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            })
        );
        
        // 瓶頸
        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.15, 0.3),
            new THREE.MeshPhongMaterial({ color: 0x333333 })
        );
        neck.position.y = 0.55;
        
        // 瓶蓋
        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.09, 0.1),
            new THREE.MeshPhongMaterial({ color: 0x666666 })
        );
        cap.position.y = 0.75;
        
        bottleGroup.add(bottle);
        bottleGroup.add(neck);
        bottleGroup.add(cap);
        bottleGroup.castShadow = true;
        
        return bottleGroup;
    }
    
    createBarTools() {
        // Shaker
        const shaker = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, 1),
            new THREE.MeshPhongMaterial({ 
                color: 0xc0c0c0,
                shininess: 100,
                metalness: 0.8
            })
        );
        shaker.position.set(-2, 2.3, -3);
        shaker.castShadow = true;
        this.scene.add(shaker);
        
        // 更多調酒工具...
    }
}