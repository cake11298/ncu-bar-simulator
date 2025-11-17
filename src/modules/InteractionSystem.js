import * as THREE from 'three';

/**
 * 互動系統 - 處理物品拿取、放置、使用
 */
export default class InteractionSystem {
    constructor(camera, physicsSystem) {
        this.camera = camera;
        this.physics = physicsSystem;

        // 射線檢測器（用於檢測玩家看向的物品）
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 3; // 互動距離 3 米

        // 可互動物品列表
        this.interactableObjects = [];

        // 當前瞄準的物品
        this.targetedObject = null;

        // 當前手持的物品
        this.heldObject = null;

        // 手持物品的偏移位置（相對於相機）
        this.holdOffset = new THREE.Vector3(0.3, -0.3, -0.8);

        // 物品原始位置（用於放回酒牆）
        this.originalPositions = new Map();

        // 物品類型標記
        this.objectTypes = new Map();

        // 互動狀態
        this.isHolding = false;
    }

    /**
     * 註冊可互動物品
     * @param {THREE.Object3D} object - Three.js 物品
     * @param {string} type - 物品類型 ('bottle', 'glass', 'shaker', 'jigger')
     * @param {THREE.Vector3} originalPosition - 原始位置（可選）
     */
    registerInteractable(object, type, originalPosition = null) {
        this.interactableObjects.push(object);
        this.objectTypes.set(object, type);

        // 儲存原始位置（用於放回酒牆）
        if (originalPosition) {
            this.originalPositions.set(object, originalPosition.clone());
        } else {
            this.originalPositions.set(object, object.position.clone());
        }

        // 標記為可互動
        object.userData.interactable = true;
        object.userData.type = type;
    }

    /**
     * 取消註冊互動物品
     * @param {THREE.Object3D} object - Three.js 物品
     */
    unregisterInteractable(object) {
        const index = this.interactableObjects.indexOf(object);
        if (index > -1) {
            this.interactableObjects.splice(index, 1);
        }
        this.objectTypes.delete(object);
        this.originalPositions.delete(object);
    }

    /**
     * 檢測玩家瞄準的物品
     * @returns {Object|null} { object, type, distance }
     */
    checkTargeted() {
        // 從相機中心發射射線
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // 檢測碰撞
        const intersects = this.raycaster.intersectObjects(
            this.interactableObjects,
            true // 遞迴檢查子物件
        );

        if (intersects.length > 0) {
            // 找到最近的物品
            let targetObject = intersects[0].object;

            // 如果碰撞的是子物件，找到父級 Group
            while (targetObject.parent && !targetObject.userData.interactable) {
                targetObject = targetObject.parent;
            }

            if (targetObject.userData.interactable) {
                this.targetedObject = {
                    object: targetObject,
                    type: this.objectTypes.get(targetObject),
                    distance: intersects[0].distance
                };
                return this.targetedObject;
            }
        }

        this.targetedObject = null;
        return null;
    }

    /**
     * 拾取物品
     * @param {THREE.Object3D} object - 要拾取的物品（可選，默認拾取瞄準的物品）
     * @returns {boolean} 是否成功拾取
     */
    pickupObject(object = null) {
        // 如果已經拿著物品，不能再拿
        if (this.isHolding) {
            return false;
        }

        const targetObj = object || (this.targetedObject ? this.targetedObject.object : null);

        if (!targetObj) {
            return false;
        }

        // 拿起物品
        this.heldObject = targetObj;
        this.isHolding = true;

        // 禁用物理模擬
        this.physics.setBodyEnabled(targetObj, false);

        // 從可互動列表中暫時移除（避免重複拾取）
        const index = this.interactableObjects.indexOf(targetObj);
        if (index > -1) {
            this.interactableObjects.splice(index, 1);
        }

        return true;
    }

    /**
     * 放下物品
     * @param {boolean} returnToOriginal - 是否放回原位
     */
    dropObject(returnToOriginal = false) {
        if (!this.heldObject) {
            return;
        }

        const object = this.heldObject;

        if (returnToOriginal) {
            // 放回原位（酒牆）
            const originalPos = this.originalPositions.get(object);
            if (originalPos) {
                object.position.copy(originalPos);

                // 凍結在原位置（不受物理影響）
                this.physics.freezeBodyAt(object, originalPos);
            }
        } else {
            // 放在當前位置（會掉落）
            // 啟用物理模擬
            this.physics.setBodyEnabled(object, true);

            // 給予微小的向下速度
            this.physics.setBodyVelocity(
                object,
                new THREE.Vector3(0, -0.5, 0)
            );
        }

        // 重新加入可互動列表
        this.interactableObjects.push(object);

        // 清空手持狀態
        this.heldObject = null;
        this.isHolding = false;
    }

    /**
     * 投擲物品
     * @param {number} force - 投擲力度
     */
    throwObject(force = 5) {
        if (!this.heldObject) {
            return;
        }

        const object = this.heldObject;

        // 啟用物理
        this.physics.setBodyEnabled(object, true);

        // 計算投擲方向（相機朝向）
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        direction.multiplyScalar(force);

        // 設置速度
        this.physics.setBodyVelocity(object, direction);

        // 重新加入可互動列表
        this.interactableObjects.push(object);

        // 清空手持狀態
        this.heldObject = null;
        this.isHolding = false;
    }

    /**
     * 更新手持物品位置（每幀調用）
     */
    update() {
        if (this.heldObject) {
            // 計算手持位置（相機前方偏右下）
            const holdPosition = new THREE.Vector3();
            holdPosition.copy(this.holdOffset);

            // 轉換到世界坐標
            holdPosition.applyMatrix4(this.camera.matrixWorld);

            // 更新物品位置
            this.heldObject.position.copy(holdPosition);

            // 使物品朝向相機方向
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);

            // 計算旋轉
            const targetQuaternion = new THREE.Quaternion();
            const lookAtMatrix = new THREE.Matrix4();
            lookAtMatrix.lookAt(
                holdPosition,
                holdPosition.clone().add(cameraDirection),
                new THREE.Vector3(0, 1, 0)
            );
            targetQuaternion.setFromRotationMatrix(lookAtMatrix);

            // 平滑旋轉
            this.heldObject.quaternion.slerp(targetQuaternion, 0.2);
        }
    }

    /**
     * 獲取當前手持物品
     * @returns {THREE.Object3D|null}
     */
    getHeldObject() {
        return this.heldObject;
    }

    /**
     * 獲取手持物品類型
     * @returns {string|null}
     */
    getHeldObjectType() {
        if (!this.heldObject) {
            return null;
        }
        return this.objectTypes.get(this.heldObject);
    }

    /**
     * 是否正在拿著物品
     * @returns {boolean}
     */
    isHoldingObject() {
        return this.isHolding;
    }

    /**
     * 獲取當前瞄準的物品
     * @returns {Object|null}
     */
    getTargetedObject() {
        return this.targetedObject;
    }

    /**
     * 獲取互動提示文本
     * @returns {string}
     */
    getInteractionHint() {
        if (this.isHolding) {
            const type = this.getHeldObjectType();

            switch(type) {
                case 'bottle':
                    return '按 Q 放下 | 按住滑鼠左鍵倒酒 | 按 R 放回酒牆';
                case 'glass':
                    return '按 Q 放下 | 按滑鼠右鍵喝掉 | 按 R 放回原位';
                case 'shaker':
                    return '按 Q 放下 | 按住滑鼠左鍵搖晃 | 按 R 放回原位';
                case 'jigger':
                    return '按 Q 放下 | 用於精確量酒 | 按 R 放回原位';
                default:
                    return '按 Q 放下 | 按 R 放回原位';
            }
        } else if (this.targetedObject) {
            const type = this.targetedObject.type;
            const distance = this.targetedObject.distance.toFixed(1);

            return `按 E 拾取 ${this.getTypeName(type)} (${distance}m)`;
        }

        return '';
    }

    /**
     * 獲取物品類型名稱（中文）
     * @param {string} type - 物品類型
     * @returns {string}
     */
    getTypeName(type) {
        const names = {
            'bottle': '酒瓶',
            'glass': '杯子',
            'shaker': '搖酒器',
            'jigger': '量酒器'
        };
        return names[type] || '物品';
    }

    /**
     * 檢測兩個物品是否接近（用於倒酒等互動）
     * @param {THREE.Object3D} obj1 - 物品1
     * @param {THREE.Object3D} obj2 - 物品2
     * @param {number} maxDistance - 最大距離
     * @returns {boolean}
     */
    areObjectsNear(obj1, obj2, maxDistance = 0.5) {
        if (!obj1 || !obj2) {
            return false;
        }
        return obj1.position.distanceTo(obj2.position) < maxDistance;
    }
}
