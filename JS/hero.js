/***************************************************************
 * 파일명 : hero.js
 * 작성일 : 2019. 08. 08
 * 작성자 : 한광훈
 * 내  용 : Hero Class
 * 비  고 :  주요기능은 이동명령에 따른 움직임 디스플레이
 *          모든 제어권(멈춤/이동 .etc)은 상위 게임엔진에서 관리되며
 *           Hero Class는 단순히 이동영상만 위치에 맞게 표시
 ***************************************************************/

 /***************************************************************
 * 사용자 정의 자료구조 (Abstract Data Type)
***************************************************************/
const HERO_SIZE = {
    X: 35, Y: 54,
};

const HERO_POS_LIMIT = {
    X: (Math.floor(PLAY_VIEW_MAX.X) - Math.floor(HERO_SIZE.X)),
    Y: (Math.floor(PLAY_VIEW_MAX.Y) - Math.floor(HERO_SIZE.Y)),
};

const HERO_CENTER_POSITION = {
    X: (Math.floor(PLAY_VIEW_MAX.X/2) - Math.floor(HERO_SIZE.X/2)),
    Y: (Math.floor(PLAY_VIEW_MAX.Y/2) - Math.floor(HERO_SIZE.Y/2)),
}

const HERO_TYPE = {
    FRONT: 0,
    REAR: 1,
    RIGHT: 2,
    LEFT: 3,
    EMPTY: 4,
    DIE: 5, // 추후 영상 추가
};

const HERO_CSS_CLASS = {
    HERO_FRONT_SIDE: "HERO_FRONT_SIDE",
    HERO_REAR_SIDE: "HERO_REAR_SIDE",
    HERO_RIGHT_SIDE: "HERO_RIGHT_SIDE",
    HERO_LEFT_SIDE: "HERO_LEFT_SIDE",
    HERO_EMPTY: "HERO_EMPTY",
    HERO_COMMON: "HERO_COMMON",
};


/***************************************************************
 * Hero Class 선언부
***************************************************************/
class Hero {
    constructor(parentsElement){
        this.parentsElement = parentsElement;
        this.currentHeroType = HERO_TYPE.FRONT;
        this.elHero = null;

        // 객체를 부모 요소에 생성하여 포함
        this.createElement();
    }

    createElement(){
        let elNewHero = document.createElement(TAG.div);
        elNewHero.className = HERO_CSS_CLASS.HERO_FRONT_SIDE.concat(" " + HERO_CSS_CLASS.HERO_COMMON);
        this.parentsElement.appendChild(elNewHero);
        this.elHero = document.querySelector(".".concat(HERO_CSS_CLASS.HERO_FRONT_SIDE));
    }

    MoveHeroElement(drawType, drawX, drawY){
        // 현재 영상을 Transparent Image로 전환
        this.removeCurrentElHero();
      
        // 위치이동
        this.elHero.style.left = String(drawX).concat("px");
        this.elHero.style.top = String(drawY).concat("px");

        // 신규영상 Refresh
        switch(drawType){
        case HERO_TYPE.FRONT :
            this.elHero.className = HERO_CSS_CLASS.HERO_FRONT_SIDE.concat(" " + HERO_CSS_CLASS.HERO_COMMON);
            break;
        case HERO_TYPE.REAR :
            this.elHero.className = HERO_CSS_CLASS.HERO_REAR_SIDE.concat(" " + HERO_CSS_CLASS.HERO_COMMON);
            break;
        case HERO_TYPE.RIGHT :
            this.elHero.className = HERO_CSS_CLASS.HERO_RIGHT_SIDE.concat(" " + HERO_CSS_CLASS.HERO_COMMON);
            break;
        case HERO_TYPE.LEFT :
            this.elHero.className = HERO_CSS_CLASS.HERO_LEFT_SIDE.concat(" " + HERO_CSS_CLASS.HERO_COMMON);
            break;
        default:
            break;
        }
    }

    GetCurrentXPos(){
        return this.elHero.style.left;
    }

    GetCurrentYPos(){
        return this.elHero.style.top;
    }


    // 내부함수
    removeCurrentElHero(){
        // Transparent Image로 전환
        this.elHero.className = HERO_CSS_CLASS.HERO_EMPTY.concat(" " + HERO_CSS_CLASS.HERO_COMMON);
    }
};
