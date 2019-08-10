/***************************************************************
 * 파일명 : enemy.js
 * 작성일 : 2019. 08. 08
 * 작성자 : 한광훈
 * 내  용 : Enemy Class
 * 비  고 :  주요기능은 이동명령에 따른 움직임 디스플레이
 *          모든 제어권(멈춤/이동 .etc)은 상위 게임엔진에서 관리되며
 *           Enemy Class는 단순히 이동영상만 위치에 맞게 표시
 ***************************************************************/

 /***************************************************************
 * 사용자 정의 자료구조 (Abstract Data Type)
***************************************************************/
const ENEMY_SIZE = {
    X: 45,
    Y: 54,
};

const ENEMY_POS_LIMIT = {
    X: (Math.floor(PLAY_VIEW_MAX.X) - Math.floor(ENEMY_SIZE.X)),
    Y: (Math.floor(PLAY_VIEW_MAX.Y) - Math.floor(ENEMY_SIZE.Y)),
};

const ENEMY_POS_CENTER = {
    X: (Math.floor(PLAY_VIEW_MAX.X/2) - Math.floor(ENEMY_SIZE.X/2)),
    Y: (Math.floor(PLAY_VIEW_MAX.Y/2) - Math.floor(ENEMY_SIZE.Y/2)),
};

const ENEMY_TYPE = {
    LIVE: 0,
    DIE: 1,
    EMPTY: 2
};

const ENEMY_CSS_CLASS = {
    ENEMY_LIVE: "ENEMY_LIVE",
    ENEMY_DIE: "ENEMY_DIE",
    ENEMY_EMPTY: "ENEMY_EMPTY",
    ENEMY_COMMON: "ENEMY_COMMON",
};


/***************************************************************
 * Enemy Class 선언부
***************************************************************/
class Enemy {
    constructor(parentsElement, enemyID){
        this.enemyID = enemyID;
        this.parentsElement = parentsElement;
        this.currentEnemyType = ENEMY_TYPE.EMPTY;
        this.elEnemy = null;
        this.isTargetEnemy = 0;

        // 객체를 부모 요소에 생성하여 포함
        this.createElement();
    }

    createElement(){
        let elNewEnemy = document.createElement(TAG.div);
        
        // TEST용도
        const ENEMY_COLOR = (this.isTargetEnemy === SET.ON)? "yellow" : "red";
        elNewEnemy.style.color = ENEMY_COLOR;
        elNewEnemy.style.fontSize = "24pt";
        elNewEnemy.style.fontWeight = "bold";
        elNewEnemy.innerHTML = `${this.enemyID}`;

        this.elEnemy = elNewEnemy;

        elNewEnemy.className = ENEMY_CSS_CLASS.ENEMY_EMPTY.concat(" ", ENEMY_CSS_CLASS.ENEMY_COMMON);
        this.parentsElement.appendChild(elNewEnemy);

        // [ 동일한 선택자들이 많은 경우 문제가 있는 코드 ]
        // 1. 해결책은 클래스 내 정적변수를 두어 new로 instance 생성시마다 element에 
        //    고유 ID를 부여하여 getElementById()함수를 이용하여 고유한 Element를 찾아오는 방법
        // 2. 생성시 자체 Member변수에 고유ID를 관리하여 getElementsByClassName()함수로 찾아와 배열에 접근하는 방법
        // cf. 1번 방법은 Mitter에서 사용했기 때문에 교육차원에서 2번으로 문제를 해결해
        // 문제코드 : this.elEnemy = document.querySelector(".".concat(ENEMY_CSS_CLASS.ENEMY_LIVE));
        // 확인필요사항 : Instance생성 순서로 element가 찾아지는지는 확인 필요 (ID동기화가 필요)
        // 참고 : Hero도 아래와 같은 처리를 해야 함(추후예정 : 단일 ITEM으로 진행상 문제는 없음)
        
        // 아래코드의 문제점 GAME GENGIN에서 AutoGenerateMovingPos()함수가 호출되면서 CSS CLASS명이 
        // ENEMY_LIVE로 변경되기 때문에 찾아지지 않는다.
        // this.elEnemy = document.getElementsByClassName(ENEMY_CSS_CLASS.ENEMY_EMPTY).item(this.enemyID);
    }

    SetTargetEnemy(setValue){
        this.isTargetEnemy = setValue;
        const ENEMY_COLOR = (this.isTargetEnemy === SET.ON)? "yellow" : "red";
        this.elEnemy.style.color = ENEMY_COLOR;
    }

    MoveEnemyElement(drawType, drawX, drawY){
        // 현재 영상을 Transparent Image로 전환
        this.removeCurrentElEnemy();
      
        // 위치이동
        this.elEnemy.style.left = String(drawX).concat("px");
        this.elEnemy.style.top = String(drawY).concat("px");

        // 신규영상 Refresh
        switch(drawType){
        case ENEMY_TYPE.LIVE :
            this.elEnemy.className = ENEMY_CSS_CLASS.ENEMY_LIVE.concat(" ", ENEMY_CSS_CLASS.ENEMY_COMMON);
            break;
        case ENEMY_TYPE.ENEMY_DIE :
            this.elEnemy.className = ENEMY_CSS_CLASS.ENEMY_DIE.concat(" ", ENEMY_CSS_CLASS.ENEMY_COMMON);
            break;
        default:
            break;
        }
    }

    GetCurrentXPos(){
        let XPos = Number(this.elEnemy.style.left.replace("px", ""));
        return XPos;
    }

    GetCurrentYPos(){
        let YPox = Number(this.elEnemy.style.top.replace("px", ""));
        return YPox;
    }

    // 내부함수
    removeCurrentElEnemy(){
        // Transparent Image로 전환
        this.elEnemy.className = ENEMY_CSS_CLASS.ENEMY_EMPTY.concat(" ", ENEMY_CSS_CLASS.ENEMY_COMMON);
    }
};