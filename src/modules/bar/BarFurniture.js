import * as THREE from 'three';

/**
 * 吧檯家具模組
 * 負責創建吧台椅等家具
 */
export class BarFurniture {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * 創建所有家具
     */
    createAll() {
        this.createBarStools();
    }

    /**
     * 創建吧台椅
     */
    createBarStools() {
        for (let i = 0; i < 4; i++) {
            const stool = new THREE.Group();

            // 更舒適的軟墊座椅
            const seatPadding = new THREE.Mesh(
                new THREE.CylinderGeometry(0.42, 0.37, 0.08),
                new THREE.MeshPhongMaterial({
                    color: 0x722f37,
                    shininess: 30
                })
            );
            seatPadding.position.y = 0.82;

            const seatBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.35, 0.05),
                new THREE.MeshPhongMaterial({
                    color: 0x333333,
                    shininess: 80
                })
            );
            seatBase.position.y = 0.775;

            // 更穩固的椅腿設計
            const centerPost = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.75),
                new THREE.MeshPhongMaterial({
                    color: 0x2c2c2c,
                    shininess: 100,
                    metalness: 0.6
                })
            );
            centerPost.position.y = 0.375;

            // 腳踏環
            const footRest = new THREE.Mesh(
                new THREE.TorusGeometry(0.25, 0.02, 8, 16),
                new THREE.MeshPhongMaterial({
                    color: 0x2c2c2c,
                    shininess: 100
                })
            );
            footRest.position.y = 0.25;
            footRest.rotation.x = Math.PI / 2;

            // 底座
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.05),
                new THREE.MeshPhongMaterial({
                    color: 0x2c2c2c,
                    shininess: 100
                })
            );
            base.position.y = 0.025;

            stool.add(seatPadding);
            stool.add(seatBase);
            stool.add(centerPost);
            stool.add(footRest);
            stool.add(base);
            stool.position.set(-3 + i * 2, 0, 0);
            stool.castShadow = true;
            this.scene.add(stool);
        }
    }
}
