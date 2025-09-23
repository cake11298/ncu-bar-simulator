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
            position: new THREE.Vector3(2, 0, -2),
            color: 0x0066cc,
            dialogues: [
                "嗨！我是 Gustave，NCU 分子創新調酒研究社的共同創辦人！",
                "你知道嗎？分子調酒運用了球晶化技術，可以把液體變成像魚子醬一樣的小球！",
                "我們使用海藻酸鈉和氯化鈣來創造驚人的質地變化。",
                "想像一下，威士忌做成的泡沫，或是會在嘴裡爆開的莫吉托球！",
                "分子調酒不只是技術，更是科學與藝術的完美結合！"
            ]
        });
        
        // Seaton - 調酒技術大師
        this.addNPC({
            name: 'Seaton',
            position: new THREE.Vector3(-2, 0, -2),
            color: 0xcc0066,
            dialogues: [
                "哈囉！我是 Seaton，也是社團的共同創辦人！",
                "調酒最重要的是平衡 - 酸、甜、苦、烈的完美比例。",
                "你知道搖盪法和攪拌法的差別嗎？含果汁的要搖，純酒精的要攪！",
                "溫度控制超級重要！冰塊的大小會影響稀釋速度。",
                "我最喜歡的是經典的 Old Fashioned，簡單卻充滿深度！"
            ]
        });
        
        // 其他成員
        this.addNPC({
            name: '社團成員小明',
            position: new THREE.Vector3(0, 0, 2),
            color: 0x00cc66,
            dialogues: [
                "歡迎來到我們的分子調酒實驗室！",
                "我剛學會用液態氮做煙霧效果，超酷的！",
                "社團每週三晚上有聚會，歡迎來玩！",
                "我們不只調酒，還會研究背後的化學原理呢！"
            ]
        });
    }
    
    addNPC(config) {
        const npc = new THREE.Group();
        
        // 身體
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.35, 1.2),
            new THREE.MeshPhongMaterial({ color: config.color })
        );
        body.position.y = 0.6;
        body.castShadow = true;
        
        // 頭部
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.25),
            new THREE.MeshPhongMaterial({ color: 0xfdbcb4 })
        );
        head.position.y = 1.5;
        head.castShadow = true;
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.05);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 1.5, 0.2);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 1.5, 0.2);
        
        npc.add(body);
        npc.add(head);
        npc.add(leftEye);
        npc.add(rightEye);
        npc.position.copy(config.position);
        
        // 儲存NPC資料
        npc.userData = {
            name: config.name,
            dialogues: config.dialogues,
            currentDialogue: 0
        };
        
        this.npcs.push(npc);
        this.scene.add(npc);
    }
    
    checkInteractions(playerPosition) {
        const interactionDistance = 2;
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
        if (nearNPC) {
            hint.classList.add('active');
        } else {
            hint.classList.remove('active');
        }
        
        return closestNPC;
    }
    
    interact(npc) {
        if (!npc) return;
        
        const dialogueBox = document.getElementById('dialogue-box');
        const characterName = document.getElementById('character-name');
        const dialogueText = document.getElementById('dialogue-text');
        
        const userData = npc.userData;
        characterName.textContent = userData.name;
        dialogueText.textContent = userData.dialogues[userData.currentDialogue];
        
        dialogueBox.classList.add('active');
        
        // 循環對話
        userData.currentDialogue = (userData.currentDialogue + 1) % userData.dialogues.length;
        
        // 3秒後自動隱藏
        setTimeout(() => {
            dialogueBox.classList.remove('active');
        }, 3000);
    }
    
    update(deltaTime) {
        // 讓 NPC 輕微動畫
        this.npcs.forEach((npc, index) => {
            npc.rotation.y = Math.sin(Date.now() * 0.001 + index) * 0.1;
        });
    }
}