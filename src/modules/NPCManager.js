import * as THREE from 'three';

export class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];
        this.createNPCs();
    }
    
    createNPCs() {
        // Gustave - 分子調酒專家
        this.addNPC({
            name: 'Gustave',
            position: new THREE.Vector3(2, 0, -5),
            shirtColor: 0x0066cc,
            pantsColor: 0x1a1a1a,
            role: '分子調酒專家',
            dialogues: [
                "嗨！我是 Gustave Yang，NCU 分子創意飲品研究社的創辦人！",
                "你知道嗎？ 曦樂他家裡有養一隻貓！",
                "我們用煙燻機差點把教研大樓燒了",
                "想像一下，上次曦樂把汽水提早加入雪克杯，搖到一半炸開了",
                "分子調酒不只是技術，更是科學與藝術的融合",
                "自由無價",
                "有些事情不是靠早上的一杯咖啡解決，而是晚上的一杯調酒遺忘的",
                "分子調酒的知識非常寬廣，像是...痾我忘記了",
                "說道搖盪法，你需要有點想像力，想像液體在裡面的螺旋混和",
                "如果感覺快撐不住了 記得去給加油站 因為他們會跟你說 要加油喔!",
                "什麼? 你說你有口水病 上次這樣說的人已經在溫哥華了"
            ]
        });
        
        // Seaton - 調酒技術大師
        this.addNPC({
            name: 'Seaton',
            position: new THREE.Vector3(-2, 0, -5),
            shirtColor: 0xcc0066,
            pantsColor: 0x333333,
            role: '調酒技術大師',
            dialogues: [
                "哈囉！我是 Seaton 曦樂，也是社團的共同創辦人！",
                "挖勒，還得(ㄉㄟˇ)是你啊",
                "我最喜歡日本威士忌，特別是安德手裡那瓶山崎12年",
                "今天超累，回家打一場招喚峽谷",
                "我最喜歡的是經典的 Old Fashioned"
            ]
        });
    }
    
    addNPC(config) {
        const npc = new THREE.Group();

        // === 軀幹（白襯衫 + 黑背心）===
        const shirt = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.45, 1.0, 16),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
        );
        shirt.position.y = 1.2;
        shirt.castShadow = true;

        const vest = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.47, 1.0, 16, 1, true),
            new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 })
        );
        vest.position.y = 1.2;
        vest.castShadow = true;

        // === 褲子 ===
        const pants = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.35, 1.0, 16),
            new THREE.MeshStandardMaterial({ color: config.pantsColor, roughness: 0.9 })
        );
        pants.position.y = 0.2;
        pants.castShadow = true;

        // === 腿 ===
        const leftLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 1.0, 16),
            new THREE.MeshStandardMaterial({ color: config.pantsColor })
        );
        leftLeg.position.set(-0.18, -0.3, 0);
        leftLeg.castShadow = true;

        const rightLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 1.0, 16),
            new THREE.MeshStandardMaterial({ color: config.pantsColor })
        );
        rightLeg.position.set(0.18, -0.3, 0);
        rightLeg.castShadow = true;

        // === 手臂 ===
        const leftArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12),
            new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
        );
        leftArm.position.set(-0.55, 1.2, 0);
        leftArm.castShadow = true;

        const rightArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12),
            new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
        );
        rightArm.position.set(0.55, 1.2, 0);
        rightArm.castShadow = true;

        // === 頭部 ===
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
        );
        head.position.y = 2.1;
        head.castShadow = true;

        // === 頭髮（簡單的蓋頂）===
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
        );
        hair.position.y = 2.1;
        hair.castShadow = true;

        // === 領結 ===
        const bowTie = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x990000, metalness: 0.2 })
        );
        bowTie.position.set(0, 1.7, 0.35);

        // === 酒杯（右手）===
        const glassCup = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 0.3, 16),
            new THREE.MeshPhysicalMaterial({ 
                color: 0xffffff, 
                transparent: true, 
                opacity: 0.4, 
                roughness: 0, 
                metalness: 0,
                transmission: 1.0, // 玻璃效果
                ior: 1.5
            })
        );
        glassCup.position.set(0.75, 1.2, 0);
        glassCup.rotation.x = Math.PI / 8;

        // === 臉部（眼睛 + 嘴巴）===
        const faceGroup = new THREE.Group();
        faceGroup.position.y = 2.1;

        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        leftEye.position.set(-0.12, 0.05, 0.33);

        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        rightEye.position.set(0.12, 0.05, 0.33);

        const mouth = new THREE.Mesh(
            new THREE.TorusGeometry(0.12, 0.02, 8, 16, Math.PI),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        mouth.rotation.x = Math.PI;
        mouth.position.set(0, -0.1, 0.32);

        faceGroup.add(leftEye);
        faceGroup.add(rightEye);
        faceGroup.add(mouth);

        // === 名字標籤 ===
        const nameTag = this.createNameTag(config.name, config.role);
        nameTag.position.y = 2.8;

        // === 組裝 ===
        npc.add(shirt);
        npc.add(vest);
        npc.add(pants);
        npc.add(leftLeg);
        npc.add(rightLeg);
        npc.add(leftArm);
        npc.add(rightArm);
        npc.add(head);
        npc.add(hair);
        npc.add(bowTie);
        npc.add(glassCup);
        npc.add(faceGroup);
        npc.add(nameTag);

        npc.position.copy(config.position);

        // 儲存資料
        npc.userData = {
            name: config.name,
            role: config.role,
            dialogues: config.dialogues,
            currentDialogue: 0,
            originalY: config.position.y,
            nameTagSprite: nameTag.children[0]
        };

        this.npcs.push(npc);
        this.scene.add(npc);
    }
    
    createNameTag(name, role) {
        const tagGroup = new THREE.Group();
        
        // 創建 Canvas 來繪製文字
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        // 清除畫布並設定透明背景
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // 繪製半透明背景
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.roundRect = context.roundRect || function(x, y, w, h, r) {
            context.beginPath();
            context.moveTo(x + r, y);
            context.lineTo(x + w - r, y);
            context.arc(x + w - r, y + r, r, -Math.PI/2, 0);
            context.lineTo(x + w, y + h - r);
            context.arc(x + w - r, y + h - r, r, 0, Math.PI/2);
            context.lineTo(x + r, y + h);
            context.arc(x + r, y + h - r, r, Math.PI/2, Math.PI);
            context.lineTo(x, y + r);
            context.arc(x + r, y + r, r, Math.PI, -Math.PI/2);
            context.closePath();
            context.fill();
        };
        
        // 繪製圓角矩形背景
        if (context.roundRect) {
            context.roundRect(50, 70, 412, 116, 20);
        } else {
            context.fillRect(50, 70, 412, 116);
        }
        
        // 繪製名字
        context.fillStyle = 'white';
        context.font = 'bold 64px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(name, 256, 110);
        
        // 繪製角色職稱
        context.font = '40px Arial';
        context.fillStyle = '#FFD700';
        context.fillText(role, 256, 160);
        
        // 創建材質和精靈
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            depthWrite: false // 避免深度問題
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 1, 1);
        
        tagGroup.add(sprite);
        
        return tagGroup;
    }
    
    checkInteractions(playerPosition) {
        const interactionDistance = 2.5;
        let nearNPC = false;
        let closestNPC = null;
        let minDistance = Infinity;
        
        for (const npc of this.npcs) {
            const distance = playerPosition.distanceTo(npc.position);
            
            if (distance < interactionDistance) {
                nearNPC = true;
                if (distance < minDistance) {
                    minDistance = distance;
                    closestNPC = npc;
                }
            }
        }
        
        const hint = document.getElementById('interaction-hint');
        if (hint) {
            if (nearNPC) {
                hint.classList.add('active');
            } else {
                hint.classList.remove('active');
            }
        }
        
        return closestNPC;
    }
    
    interact(npc) {
        if (!npc) return;
        
        const dialogueBox = document.getElementById('dialogue-box');
        const characterName = document.getElementById('character-name');
        const dialogueText = document.getElementById('dialogue-text');
        
        if (!dialogueBox || !characterName || !dialogueText) return;
        
        const userData = npc.userData;
        characterName.textContent = `${userData.name} - ${userData.role}`;
        dialogueText.textContent = userData.dialogues[userData.currentDialogue];
        
        dialogueBox.classList.add('active');
        
        // 循環對話
        userData.currentDialogue = (userData.currentDialogue + 1) % userData.dialogues.length;
        
        // 3秒後自動隱藏
        setTimeout(() => {
            dialogueBox.classList.remove('active');
        }, 4000);
    }
    
    update(deltaTime) {
        // 讓 NPC 有簡單的動畫
        this.npcs.forEach((npc, index) => {
            // 輕微的上下浮動
            const floatY = Math.sin(Date.now() * 0.001 + index) * 0.02;
            npc.position.y = npc.userData.originalY + floatY;
            
            // 輕微的左右搖擺
            npc.rotation.y = Math.sin(Date.now() * 0.0008 + index * 2) * 0.05;
            
            // 讓名字標籤始終面向相機（Sprite 會自動面向相機）
        });
    }
}