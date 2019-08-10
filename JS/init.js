/***************************************************************
 * 파일명 : init.js
 * 작성일 : 2019. 08. 08
 * 작성자 : 한광훈
 * 내  용 : GameEngine Class
 * 비  고 :  실직적인 이동좌표 생성,
 *           게임로직 관리 (게임시나리오에 따른 게임 Win or lose 판별)
 *           Element별 생존상태 및 개별 자원에 대한 관리 (생성 and 소멸 포함)
 ***************************************************************/

 /***************************************************************
 * 사용자 정의 자료구조 (Abstract Data Type)
***************************************************************/
// const MAX_ENEMY_COUNT = 30;
const RUNNIG_BACKGROUND_IMAGE = "url(./RESOURCE/images/bg.png)";
const WIN_BACKGROUND_IMAGE = "url(./RESOURCE/images/youwin_bg.png)";
const LOST_BACKGROUND_IMAGE = "url(./RESOURCE/images/youlost_bg.png)";

const BACKGROUND_ID = "BG";
const START_BTN_CLASS = "START";
const END_BTN_CLASS = "END";
const ENEMIES_WRAP_CLASS = "ENEMIES_WRAP";
const TOTAL_MONSTER_CNT = "TOTAL_MONSTER_CNT";
const MUST_FIND_MONSTER = "MUST_FIND_MONSTER";
const MONSTER_SPEED = "MONSTER_SPEED";

// const BASE_TIME_TICK = 50; // 10ms (BASE TIME TICK은 10ms로 세팅해야 함(기준))
const SIN_X_GAIN = 1/2; // 주기가 늘어짐
const SIN_Y_GAIN = 100; // Y증부
const SIN_X_INTERCEPT = 0;
const SIN_Y_INTERCEPT = 0;
const SIN_CURVE_MAX_HEIGHT = 1; // 300px
const SIN_CURVE_DELAY = 1/3; // x2 Multiply

// HERO ITEM GAIN
const HERO_SPEED_GAIN = 10; // x5 Multiply (추후 시나리오 및 외부 CONFIGURATION으로 변경 예정)

const TIME_TICK_TYPE = {
    TIME_TICK_10MS: 1,
    TIME_TICK_50MS: 5,
    TIME_TICK_100MS: 10,
    TIME_TICK_300MS: 30,
    TIME_TICK_500MS: 50,
    TIME_TICK_1000MS: 100,
    TIME_TICK_2000MS: 200
};

const KEY_CODE = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};

const DIRECTION = {
    MINUS: -1,
    PLUS: 1,
};

const POS = {
    X: 0,
    Y: 1,
    DIRECTION: 2,
};

const POS_TYPE = {
    VERTICAL_MOVE: 0,
    HORIZONTAL_MOVE: 1,
    SIN_CURVE_MOVE: 2,
    // 추후 여러가지의 위치 자동 생성 알고리즘 개발
    MAX_POS_TYPE: 3,
};

const STATUS = {
    LIVE: 0,
    DEAD: 1,
    EMPTY:2,
};

const MONSTER_SPEED_MODE = {
    LOW: 50,
    MIDDLE: 20,
    HIGH: 5,
};

const BACKGOURD_MODE = {
    RUNNIG: 0,
    WIN: 1,
    LOST: 2,
};

/*
const ENEMY_DATA = {
    ENEMY_OBJECT: 0,
    ENEMY_INFO: 1,
};
*/

const SELECTOR_PLACEHOLDER = {
    TOTAL_MONSTER_CNT: "몬스터 수",
    MUST_FIND_MONSTER: "찾아야할 놈",
    MONSTER_SPEED: "스피드",
};

const GAME_ENGINE_STATUS = {
    STOP: 0,
    RUNNING: 1,
};

const CRASH_TYPE = {
    NO_CRASH: 0,
    WIN_CRASH: 1,
    LOST_CRASH: 2,
};

const CLOSE_MODE = {
    ALL_CLEAR: 0,
    ONLY_TIMER: 1,
};

class ItemInfo {
    constructor(){
        this.m_itemID = 0;
        this.m_posType = POS_TYPE.VERTICAL;
        this.m_posDirection = DIRECTION.PLUS;
        this.m_X = 0;
        this.m_Y = 0;
        this.m_status = STATUS.LIVE;
        // ENEMY 속도조절 상태도 추가할 수 있음 (추후예정)
    }
};


/***************************************************************
 * Enemy Class 선언부
***************************************************************/
class GameEngine extends Common {
    constructor(parentsElement){
        // Parentes 생성자 호출
        super();

        this.m_parentsElement = parentsElement;
        this.m_elHero = null;
        this.m_elEnemies = [];
        this.m_elEnemiesInfo = [];
        this.m_createdEnemyCnt = 0;
        this.m_timeTick = 0;
        this.m_intervalTimer = null;
        this.m_totalMonsterCnt = 5;
        this.m_mustFindMonsterNo = 1;
        this.m_monsterSpeed = 10;
        this.m_gameEngineStatus = GAME_ENGINE_STATUS.STOP;
        this.m_syncFlagForObserverAndEvent = SET.OFF; // Event와 Observer안에서의 처리 동기화 flag

        // 객체를 부모 요소에 생성하여 포함
        this.createElement();
    }

    createElement(){
        this.m_elHero = new Hero(this.m_parentsElement);
        // this.m_elHero.MoveHeroElement(HERO_TYPE.FRONT, HERO_CENTER_POSITION.X, HERO_CENTER_POSITION.Y);
        this.MoveToStartPos();

        // WINDOW EVENT BINDING
        window.onkeydown = this.onKeyDown.bind(this);

        // Observer 실행
        // this.runObserver();

        // 상태설정
        this.m_gameEngineStatus = GAME_ENGINE_STATUS.STOP;

    }

    SetSatus(statusValue){
        this.m_gameEngineStatus = statusValue;
    }

    GetStatus(){
        return this.m_gameEngineStatus;
    }

    MoveToStartPos(){
        this.m_elHero.MoveHeroElement(HERO_TYPE.FRONT, HERO_CENTER_POSITION.X, HERO_POS_LIMIT.Y);
    }

    SetMonsterConfig(totalMonsterCnt, mustFindMonsterNo, monsterSpeed){
        this.m_totalMonsterCnt = totalMonsterCnt;
        this.m_mustFindMonsterNo = mustFindMonsterNo;
        this.m_monsterSpeed = monsterSpeed;
    }

    createEnemy(newPosType){
        if(this.m_elEnemies.length < this.m_totalMonsterCnt){
            // 생성 ID
            let newID = this.m_elEnemies.length; // 생성 전 Item 개수

            // 신규 Enemy 생성과정
            let enemiesWrap = document.getElementsByClassName(ENEMIES_WRAP_CLASS).item(0);
            this.m_elEnemies[newID] = new Enemy(enemiesWrap, newID);

            // TARGET ENEMY 선정
            if(newID === this.m_mustFindMonsterNo){
                this.m_elEnemies[newID].SetTargetEnemy(SET.ON);
            }

            // ENEMY ELEMENT 정보 추가
            let newEnemyInfo = new ItemInfo();
            newEnemyInfo.m_itemID = newID;
            newEnemyInfo.m_posType = newPosType;
            newEnemyInfo.m_posDirection = DIRECTION.PLUS;

            // Random한 영역에서 Enemy생성
            switch(newPosType){
            case POS_TYPE.VERTICAL_MOVE:
                newEnemyInfo.m_X = this.generateRandomNo(0, ENEMY_POS_LIMIT.X);
                newEnemyInfo.m_Y = 0;
                break;
            case POS_TYPE.HORIZONTAL_MOVE:
                newEnemyInfo.m_X = 0;
                newEnemyInfo.m_Y = this.generateRandomNo(0, ENEMY_POS_LIMIT.Y);
                break;
            case POS_TYPE.SIN_CURVE_MOVE:
                newEnemyInfo.m_X = 0;
                newEnemyInfo.m_Y = ENEMY_POS_CENTER.Y;
                // 추후 Random한 Y값 설정 (Y값 때문에 예외처리 필요)
                // newEnemyInfo.m_Y = this.generateRandomNo(0, ENEMY_POS_LIMIT.Y);
                break;
            default:
                break;
            }

            newEnemyInfo.m_status = STATUS.EMPTY;
              
            // ENEMY ITEM 추가 
            this.m_elEnemiesInfo.push(newEnemyInfo);
            this.DisplayMsg(`[${newID}]번째 시작 위치 : X(${newEnemyInfo.m_X}, Y(${newEnemyInfo.m_Y}), 위치타입(${newEnemyInfo.m_posType})`);
        }
    }

    AutoGenerateEnemy(){
        let returnValue = 0; // 0:정상, 1이상:에러번호

        // TEST 용도
        let newPosType = this.generateRandomNo(POS_TYPE.VERTICAL_MOVE, POS_TYPE.MAX_POS_TYPE);

        this.createEnemy(newPosType);
        return returnValue;
    }

    AutoGenerateMovingPos(){
        let returnValue = 0;  // 0:정상, 1이상:에러번호

        for(let index=0; index<this.m_elEnemies.length; index++){
            // 예외처리
            if(this.m_elEnemiesInfo[index].m_status === STATUS.DEAD){
                continue;
            }

            let posDirection = this.m_elEnemiesInfo[index].m_posDirection;
            let currentXPos = this.m_elEnemiesInfo[index].m_X;
            let currentYPos = this.m_elEnemiesInfo[index].m_Y;
            let posType = this.m_elEnemiesInfo[index].m_posType;
            let enemyDrawType = this.m_elEnemiesInfo[index].m_status = STATUS.LIVE;
            let newPos = null;
            
            if(posType === POS_TYPE.VERTICAL_MOVE){
                // 위치 자동 생성 함수
                newPos = this.creatVerticalMovingPos(posDirection, currentXPos, currentYPos);
            }
            else if(posType === POS_TYPE.HORIZONTAL_MOVE){
                // 위치 자동 생성 함수
                newPos = this.creatHorizonalMovingPos(posDirection, currentXPos, currentYPos);

            }
            else if(posType === POS_TYPE.SIN_CURVE_MOVE){
                // 위치 자동 생성 함수
                newPos = this.creatSinCurveMovingPos(posDirection, currentXPos, currentYPos);
            }

            // 위치 & 방향성 업데이트
            this.m_elEnemiesInfo[index].m_X = newPos[POS.X];
            this.m_elEnemiesInfo[index].m_Y = newPos[POS.Y];
            this.m_elEnemiesInfo[index].m_posDirection = newPos[POS.DIRECTION];
            // ENEMY ELEMENT 이동
            this.m_elEnemies[index].MoveEnemyElement(enemyDrawType, newPos[POS.X], newPos[POS.Y]);
            // this.DisplayMsg(`[${this.m_elEnemiesInfo[index].m_itemID}/${index}]번째 위치 이동 : X(${newPos[POS.X]}, Y(${newPos[POS.Y]}), 위치타입(${posType})`);
        }

        return returnValue;
    }

    checkGameScenario(){
        // Game의 시나리오를 체크하여 WIN / LOST를 판단
        /**************************************************************************** 
         * 기본 시나리오
         * 선택한 ENEMY 수만큼 요괴를 생성가 생성된 상태에서 잡아야 할 요괴번호를
         * Hero가 따라가서 그 요괴를 잡으면 이기는 게임입니다. 도중에 다른 요괴와
         * 충돌하면 게임이 끝나게 됩니다.
        ****************************************************************************/
    
        // 현재위치 HERO POSITION 읽어오기
        let currentHeroXPos = Number(this.m_elHero.GetCurrentXPos().replace("px", ""));
        let currentHeroYPos = Number(this.m_elHero.GetCurrentYPos().replace("px", ""));

        // 시나리오 로직 체크하는 부분
        let crashType = CRASH_TYPE.NO_CRASH;
        let crashEnemyID = 0;
        for(let index=0; index<this.m_elEnemiesInfo.length; index++){
            let heroPosition = [currentHeroXPos, currentHeroYPos];
            let enemyPosition = [this.m_elEnemiesInfo[index].m_X, this.m_elEnemiesInfo[index].m_Y];
            let isCrash = this.checkCrashItem(heroPosition, enemyPosition);
 
            if(isCrash === true){
                crashEnemyID = index;
                crashType = (this.m_mustFindMonsterNo === index)? CRASH_TYPE.WIN_CRASH : CRASH_TYPE.LOST_CRASH;
                break;
            }
        }

        if(crashType === CRASH_TYPE.WIN_CRASH){
            // TIMER 정지
            this.closeObserver(CLOSE_MODE.ONLY_TIMER);
            // ENEMY DEAD 영상 전환
            let crashedEnemyXPos = this.m_elEnemiesInfo[this.m_mustFindMonsterNo];
            let creashedEnemyYPos = this.m_elEnemiesInfo[this.m_mustFindMonsterNo];
            this.m_elEnemies[this.m_mustFindMonsterNo].MoveEnemyElement(ENEMY_TYPE.ENEMY_DIE, crashedEnemyXPos, creashedEnemyYPos);
            // Background 영상 전환
            this.changeBackgroundImage(BACKGOURD_MODE.WIN);
        }
        else if(crashType === CRASH_TYPE.LOST_CRASH){
            // TIMER 정지
            this.closeObserver(CLOSE_MODE.ONLY_TIMER);
            // HERO DEAD 영상 전환
            // this.m_elEnemies[this.m_mustFindMonsterNo].MoveEnemyElement(ENEMY_TYPE.DIE, currentHeroXPos, currentHeroYPos);
            // 추후 HERP DEAD 영상 추가
            // Background 영상 전환
            this.changeBackgroundImage(BACKGOURD_MODE.LOST);
        }

        // HERO KEY_DOWN EVENT 이후에 시나리오 체크전까지 KEY EVENT BLOCK상태
        // EVENT는 INTERRUPT되는 시점이 랜덤하기 때문에 연산도중에도 불려질 수 있으므로
        // EVENT와 Obser의 실행 동기를 위한 FLAG처리를 해야 한다. (중요)
        this.m_syncFlagForObserverAndEvent = SET.OFF;
    }
    // 충돌상태 확인
    checkCrashItem(heroPos, enemyPos){
        let isCrash = false;

        // 축 관점에서 생각한 CRASH
        let X_BaseWidth = (heroPos[POS.X] > enemyPos[POS.X])? Number(ENEMY_SIZE.X/2) : Number(HERO_SIZE.X/2);
        let Y_BaseWidth = (heroPos[POS.Y] > enemyPos[POS.Y])? Number(ENEMY_SIZE.Y/2) : Number(HERO_SIZE.Y/2);
        let absDistanceX = Math.abs(heroPos[POS.X] - enemyPos[POS.X]);
        let absDistanceY = Math.abs(heroPos[POS.Y] - enemyPos[POS.Y]);
        if((absDistanceX < X_BaseWidth) && (absDistanceY < Y_BaseWidth)){
            isCrash = true;
        }

        // 다른 알고리즘 관점
        // HERO가 ENEMY의 왼쪽에 있는 경우
        // HERO가 ENEMY의 오른쪽에 있는 경우
        // HERO가 ENEMY의 위쪽에 있는 경우
        // HERO가 ENEMY의 아래쪽에 있는 경우

        return isCrash;
    }

    // CREATE ENEMY
    runObserver(){
        if(this.m_intervalTimer === null){
            this.m_intervalTimer = window.setInterval(this.Observer.bind(this), this.m_monsterSpeed);
        }
    }
    // CLOSE ENEMY
    closeObserver(closeMode=CLOSE_MODE.ALL_CLEAR){
        // TIMER OFF
        if(this.m_intervalTimer !== null){        
            window.clearInterval(this.m_intervalTimer);
            this.m_intervalTimer = null;
        }

        if(closeMode === CLOSE_MODE.ALL_CLEAR){
            this.clearEnemyInstance();
        }
    }

    // CLEAR ENEMY
    clearEnemyInstance(){
        // 전체 ELEMENT 삭제
        let elEnemiesWrap = document.getElementsByClassName(ENEMIES_WRAP_CLASS).item(0);
        while(elEnemiesWrap.firstChild) {
            elEnemiesWrap.removeChild(elEnemiesWrap.firstChild);
        }

        // ELEMENT관련 MEMBER변수 초기화
        this.m_elEnemies = [];
        this.m_elEnemiesInfo = [];
        this.m_createdEnemyCnt = 0;
    }

    // OBSERVER 정의부 (TIME SCHEDULER)
    // BASE TIME TICK이 너무 작으면 CPU 점유율이 현저히 올라감 (ex. 1ms)
    // 필요시 해당 TIME SCHEDULLER에 구동함수를 추가하면 됨
    // ITEM들의 속도조절에 사용가능
    Observer(){
        // 10ms마다 실행되는 부분
        if((this.m_timeTick % TIME_TICK_TYPE.TIME_TICK_10MS) === 0){
            // this.DisplayMsg(`ENEMY 위치이동`);
            // 위치이동
            this.AutoGenerateMovingPos();
            // 위치이동 후 게임 시나리오 체크 (WIN/LOST 판단)
            this.checkGameScenario();
        }
        // 50ms마다 실행되는 부분
        if((this.m_timeTick % TIME_TICK_TYPE.TIME_TICK_50MS) === 0){
        /*
            if(this.m_elEnemies.length < MAX_ENEMY_COUNT){
                this.DisplayMsg(`[${this.m_elEnemies.length}]번째 ENEMY 생성`);
            }
            this.AutoGenerateEnemy();
        */
        }
        // 100ms마다 실행되는 부분
        if((this.timeTick % TIME_TICK_TYPE.TIME_TICK_100MS) === 0){

        }
        // 300ms마다 실행되는 부분
        if((this.m_timeTick % TIME_TICK_TYPE.TIME_TICK_300MS) === 0){

        }
        // 500ms마다 실행되는 부분
        if((this.m_timeTick % TIME_TICK_TYPE.TIME_TICK_500MS) === 0){
            
        }
        // 1000ms마다 실행되는 부분
        if((this.m_timeTick % TIME_TICK_TYPE.TIME_TICK_1000MS) === 0){

        }
        // 2000ms마다 실행되는 부분
        if((this.m_timeTick % TIME_TICK_TYPE.TIME_TICK_2000MS) === 0){
            if(this.m_elEnemies.length < this.m_totalMonsterCnt){
                this.DisplayMsg(`[${this.m_elEnemies.length}]번째 ENEMY 생성`);
            }
            this.AutoGenerateEnemy();
        }

        // TIME TICK 증가
        ++this.m_timeTick;
    }

    // EVENT HANDLER 정의부
    onKeyDown(event){
        // 아직 변경된 위치값을 이용한 처리가 완료되지 않은 경우 (EVENT SKIP)
        if(this.m_syncFlagForObserverAndEvent === SET.ON){
            return;
        }

        // 현재위치 HERO POSITION 읽어오기
        let currentXPos = Number(this.m_elHero.GetCurrentXPos().replace("px", ""));
        let currentYPos = Number(this.m_elHero.GetCurrentYPos().replace("px", ""));

        // LEFT EVENT
        if(event.keyCode === KEY_CODE.LEFT){
            // X MIN값 처리
            if(currentXPos > 0){
                this.m_elHero.MoveHeroElement(HERO_TYPE.LEFT, (currentXPos-HERO_SPEED_GAIN), currentYPos);
            }
        }
       // UP EVENT
        if(event.keyCode === KEY_CODE.UP){
            // Y MIN값 처리
            if(currentYPos > 0){
                this.m_elHero.MoveHeroElement(HERO_TYPE.REAR, currentXPos, (currentYPos-HERO_SPEED_GAIN));
            }
        }
        if(event.keyCode === KEY_CODE.RIGHT){
            // X MAX값 처리
            if(currentXPos <= HERO_POS_LIMIT.X){
                this.m_elHero.MoveHeroElement(HERO_TYPE.RIGHT, (currentXPos+HERO_SPEED_GAIN), currentYPos);
            }
        }
        if(event.keyCode === KEY_CODE.DOWN){
            // Y MAX값 처리
            if(currentYPos <= HERO_POS_LIMIT.Y){
                this.m_elHero.MoveHeroElement(HERO_TYPE.FRONT, currentXPos, (currentYPos+HERO_SPEED_GAIN));
            }
        }

        // 동기화를 위한 Flag처리 (중요) THREAD에서 세마포어나 뮤텍스를 사용하는 이유와 비슷
        // Observer에서 Hero의 위치값을 이용하여 처리로직을 처리하기 전까지는 
        // 이벤트에 의한 위치변화를 Member변수에 적용하지 않음
        this.m_syncFlagForObserverAndEvent = SET.ON;
    }
    

    // 내부연산
    // POSITION AUTO GENERATION FUNCTION
    creatVerticalMovingPos(direction, currentX, currentY){
        let newPos = [];

        // 내부변수 초기화 (X값은 그대로 유지)
        newPos[POS.X] = currentX;
        newPos[POS.Y] = currentY;

        // Y축 연산
        if(direction === DIRECTION.PLUS){
            if(currentY < ENEMY_POS_LIMIT.Y){
                newPos[POS.DIRECTION] = DIRECTION.PLUS;
                ++newPos[POS.Y];
            }
            else{
                newPos[POS.DIRECTION] = DIRECTION.MINUS;
                --newPos[POS.Y];
            }
        }
        else{
            if(currentY > 0){
                newPos[POS.DIRECTION] = DIRECTION.MINUS;
                --newPos[POS.Y];
            }
            else{
                newPos[POS.DIRECTION] = DIRECTION.PLUS;
                ++newPos[POS.Y];       
            }
        }

        return newPos;
    }

    // POSITION AUTO GENERATION FUNCTION
    creatHorizonalMovingPos(direction, currentX, currentY){
        let newPos = [];

        // 내부변수 초기화 (X값은 그대로 유지)
        // 추후 Vertival와 Horizonal 코드 수정 (중첩코드가 많음)
        // 일단 가독성을 위해 추후 수정
        newPos[POS.X] = currentX;
        newPos[POS.Y] = currentY;

        // Y축 연산
        if(direction === DIRECTION.PLUS){
            if(currentX < ENEMY_POS_LIMIT.X){
                newPos[POS.DIRECTION] = DIRECTION.PLUS;
                ++newPos[POS.X];
            }
            else{
                newPos[POS.DIRECTION] = DIRECTION.MINUS;
                --newPos[POS.X];
            }
        }
        else{
            if(currentX > 0){
                newPos[POS.DIRECTION] = DIRECTION.MINUS;
                --newPos[POS.X];
            }
            else{
                newPos[POS.DIRECTION] = DIRECTION.PLUS;
                ++newPos[POS.X];       
            }
        }

        return newPos;
    }

    creatSinCurveMovingPos(direction, currentX, currentY){
        let newPos = [];

        // 내부변수 초기화 (X값은 그대로 유지)
        // 추후 X, Y 모든 영역에 대한 LIMIT처리가 필요 (현재는 X축에 대한 처리만)
        newPos[POS.X] = currentX;
        newPos[POS.Y] = currentY;

        // Y축 연산
        if(direction === DIRECTION.PLUS){
            if(currentX < ENEMY_POS_LIMIT.X){
                newPos[POS.DIRECTION] = DIRECTION.PLUS;
                ++newPos[POS.X];
                let radian = SIN_X_GAIN * ((Math.PI / 180) * newPos[POS.X]);
                newPos[POS.Y] =  ENEMY_POS_CENTER.Y + this.generateSinNo(0, SIN_Y_GAIN, Math.sin(radian));
            }
            else{
                newPos[POS.DIRECTION] = DIRECTION.MINUS;
                --newPos[POS.X];
                let radian = SIN_X_GAIN * ((Math.PI / 180) * newPos[POS.X]);
                newPos[POS.Y] =  ENEMY_POS_CENTER.Y - this.generateSinNo(0, SIN_Y_GAIN, Math.sin(radian));
            }
        }
        else{
            if(currentX > 0){
                newPos[POS.DIRECTION] = DIRECTION.MINUS;
                --newPos[POS.X];
                let radian = SIN_X_GAIN * ((Math.PI / 180) * newPos[POS.X]);
                newPos[POS.Y] =  ENEMY_POS_CENTER.Y - this.generateSinNo(0, SIN_Y_GAIN, Math.sin(radian));
            }
            else{
                newPos[POS.DIRECTION] = DIRECTION.PLUS;
                let radian = SIN_X_GAIN * ((Math.PI / 180) * newPos[POS.X]);
                newPos[POS.Y] = ENEMY_POS_CENTER.Y + this.generateSinNo(0, SIN_Y_GAIN, Math.sin(radian));
            }
        }

        return newPos;
    }
    
    // 난수발생기
    generateRandomNo(min, max){
        // let ranNum = Math.floor(Math.random()*(max-min+1)) + min; // (max포함)
        let ranNum = Math.floor(Math.random() * (max - min)) + min; // (max미포함)
        return ranNum;
    }

    generateSinNo(min, max, sinValue){
        // let sinNum = Math.floor(sinValue*(max-min+1)) + min; // (max포함)
        let sinNum = Math.floor(sinValue * (max - min)) + min; // (max미포함)
        return sinNum;
    }

    // POSITION AUTO GENERATION FUNCTION
    creatHorizonalMovingPos(direction, currentX, currentY){
        let newPos = [];

        // 내부변수 초기화 (X값은 그대로 유지)
        // 추후 Vertival와 Horizonal 코드 수정 (중첩코드가 많음)
        // 일단 가독성을 위해 추후 수정
        newPos[POS.X] = currentX;
        newPos[POS.Y] = currentY;

        // Y축 연산
        if(direction === DIRECTION.PLUS){
            if(currentX < ENEMY_POS_LIMIT.X){
                newPos[POS.DIRECTION] = DIRECTION.PLUS;
                ++newPos[POS.X];
            }
            else{
                newPos[POS.DIRECTION] = DIRECTION.MINUS;
                --newPos[POS.X];
            }
        }
        else{
            if(currentX > 0){
                newPos[POS.DIRECTION] = DIRECTION.MINUS;
                --newPos[POS.X];
            }
            else{
                newPos[POS.DIRECTION] = DIRECTION.PLUS;
                ++newPos[POS.X];       
            }
        }

        return newPos;
    }

    // BACKGROUND IMAGE 변경하기
    changeBackgroundImage(BGMode){
        const elBackground = document.getElementById(BACKGROUND_ID);
        const IMAGE_PASS = [RUNNIG_BACKGROUND_IMAGE, WIN_BACKGROUND_IMAGE, LOST_BACKGROUND_IMAGE];

        // BACKGROUND IMAGE 적용
        elBackground.style.backgroundImage = IMAGE_PASS[BGMode];
    }
};


/***************************************************************
 * Game Control Class 선언부
***************************************************************/
class GameController extends Common {
    constructor(){
        // Parentes 생성자 호출
        super();

        this.m_cGameEngine = null;
        this.m_elStartBtn = null;
        this.m_elEndBtn = null;
        this.m_elTotalMonsterCntList = null;
        this.m_elMustFindMonsterNo = null;
        this.m_elMonsterSpeed = null;
        this.m_totalMonsterCnt = 0;
        this.m_mustFindMonsterNo = 0;
        this.m_monsterSpeed = 0;

        // 객체를 부모 요소에 생성하여 포함
        this.createElement();
    }

    createElement(){
        let elBackGroundView = document.getElementById(BACKGROUND_ID);
        this.m_cGameEngine = new GameEngine(elBackGroundView,  this.m_totalMonsterCnt, this.m_mustFindMonsterNo, this.m_monsterSpeed);
        this.m_elStartBtn = document.getElementsByClassName(START_BTN_CLASS).item(0);
        this.m_elEndBtn = document.getElementsByClassName(END_BTN_CLASS).item(0);
        this.m_elTotalMonsterCntList = document.getElementsByClassName(TOTAL_MONSTER_CNT).item(0);
        this.m_elMustFindMonsterNo = document.getElementsByClassName(MUST_FIND_MONSTER).item(0);
        this.m_elMonsterSpeed = document.getElementsByClassName(MONSTER_SPEED).item(0);

        this.m_elTotalMonsterCntList.placeholder = SELECTOR_PLACEHOLDER.TOTAL_MONSTER_CNT;
        this.m_elMustFindMonsterNo.placeholder = SELECTOR_PLACEHOLDER.MUST_FIND_MONSTER;
        this.m_elMonsterSpeed.placeholder = SELECTOR_PLACEHOLDER.MONSTER_SPEED;

        // 내부환경설정
        this.initTotalMonsterCntList();
        this.initMustFindMonsterNo();
        this.initMonsterSpeed();
        this.SetDisplayMode(DISPLAY_MODE.ALERT);

        // SELECT INDEX
        this.m_elTotalMonsterCntList.selectedIndex = 3;
        this.m_elMustFindMonsterNo.selectedIndex = 0;
        this.m_elMonsterSpeed.selectedIndex = 2;

        this.m_totalMonsterCnt = Number(this.m_elTotalMonsterCntList.options[this.m_elTotalMonsterCntList.selectedIndex].text);
        this.m_mustFindMonsterNo = Number(this.m_elMustFindMonsterNo.options[this.m_elMustFindMonsterNo.selectedIndex].text);
        this.m_monsterSpeed = Number(this.m_elMonsterSpeed.options[this.m_elMonsterSpeed.selectedIndex].text);
        this.m_cGameEngine.SetMonsterConfig(this.m_totalMonsterCnt, this.m_mustFindMonsterNo, this.m_monsterSpeed);
  
        // EVENT BINDING
        this.m_elStartBtn.onclick = this.onClickStartBtn.bind(this);
        this.m_elEndBtn.onclick = this.onClickEndBtn.bind(this);
        this.m_elTotalMonsterCntList.onchange = this.onChangeMonsterCnt.bind(this);
        this.m_elMustFindMonsterNo.onchange = this.onChangeFindMonsterNo.bind(this);
        this.m_elMonsterSpeed.onchange = this.onChangeMonsterSpeed.bind(this);
    }

    // EVENT HANDLER 정의부
    onClickStartBtn(){
        let gameEngineStatus = this.m_cGameEngine.GetStatus();

        // 예외처리 (현재 게임이 진행되는 경우)
        if(gameEngineStatus == GAME_ENGINE_STATUS.RUNNING){
            this.DisplayMsg("현재 게임이 진행되고 있는 중입니다.")
            return;
        }

        // 설정 버튼 비활성화 시킴
        this.m_elTotalMonsterCntList.disabled = true;
        this.m_elMustFindMonsterNo.disabled = true;
        this.m_elMonsterSpeed.disabled = true;
        this.m_elMustFindMonsterNo = document.getElementsByClassName(MUST_FIND_MONSTER).item(0);
        this.m_elMosterSpeed = document.getElementsByClassName(MONSTER_SPEED).item(0);

        // 환경변수 업데이트
        /*
        this.m_totalMonsterCnt = Number(this.m_elTotalMonsterCntList.options[this.m_elTotalMonsterCntList.selectedIndex].text);
        this.m_mustFindMonsterNo = Number(this.m_elMustFindMonsterNo.options[this.m_elMustFindMonsterNo.selectedIndex].text);
        this.m_monsterSpeed = Number(this.m_eMonsterSpeed.options[this.m_eMonsterSpeed.selectedIndex].text);
        */

        // Game Engine 업데이트
        this.m_cGameEngine.SetMonsterConfig(this.m_totalMonsterCnt, this.m_mustFindMonsterNo, this.m_monsterSpeed);

        // Element 초기화
        this.m_cGameEngine.MoveToStartPos();

        // Observer동작시킴 & Game Engine 상태변경
        this.m_cGameEngine.runObserver();
        this.m_cGameEngine.SetSatus(GAME_ENGINE_STATUS.RUNNING);

    }

    onClickEndBtn(){
        let gameEngineStatus = this.m_cGameEngine.GetStatus();

        // 예외처리 (현재 게임이 진행되는 경우)
        if(gameEngineStatus == GAME_ENGINE_STATUS.STOP){
            this.DisplayMsg("현재 게임이 이미 종료상태 입니다.")
            return;
        }

        // Observer동작시킴
        this.m_cGameEngine.closeObserver();

        // 설정 버튼 비활성화 시킴
        this.m_elTotalMonsterCntList.disabled = false;
        this.m_elMustFindMonsterNo.disabled = false;
        this.m_elMonsterSpeed.disabled = false;

        // 배경화면 CLEAR & Game Engine 상태변경
        this.m_cGameEngine.changeBackgroundImage(BACKGOURD_MODE.RUNNIG);
        this.m_cGameEngine.SetSatus(GAME_ENGINE_STATUS.STOP);
    }

    onChangeMonsterCnt(){
        this.m_elTotalMonsterCntList

        const MAX_MONSTER_COUNT = Number(this.m_elTotalMonsterCntList.options[this.m_elTotalMonsterCntList.selectedIndex].text);
        this.m_totalMonsterCnt = MAX_MONSTER_COUNT;

        while (this.m_elMustFindMonsterNo.hasChildNodes()){ 
            this.m_elMustFindMonsterNo.removeChild(this.m_elMustFindMonsterNo.firstChild); 
        }

        for(let index=1; index<=MAX_MONSTER_COUNT; index++){
            let elOptNew = document.createElement('option');
            elOptNew.text = String(index);
            this.m_elMustFindMonsterNo.add(elOptNew);
        }

        // 요괴수가 찾아야 할 요괴번호보다 작은 경우
        if(this.m_totalMonsterCnt < this.m_mustFindMonsterNo){
            this.m_elMustFindMonsterNo.selectedIndex = 0;
        }
    }

    onChangeFindMonsterNo(){
       this.m_mustFindMonsterNo = Number(this.m_elMustFindMonsterNo.options[this.m_elMustFindMonsterNo.selectedIndex].text);
    }

    onChangeMonsterSpeed(){
        this.m_monsterSpeed = Number(this.m_elMonsterSpeed.options[this.m_elMonsterSpeed.selectedIndex].text);  
    }

    // 내부함수
    initTotalMonsterCntList(){
        let choiceOfMonstorCnt = [3, 5, 7, 10, 30, 50, 100];

        for(let index=0; index<choiceOfMonstorCnt.length; index++){
            let elOptNew = document.createElement('option');
            elOptNew.text = String(choiceOfMonstorCnt[index]);
            this.m_elTotalMonsterCntList.add(elOptNew);
        }
        this.m_elTotalMonsterCntList.selectedIndex = 0;
    }

    initMustFindMonsterNo(){
        const MAX_MONSTER_COUNT = 10;

        for(let index=1; index<=MAX_MONSTER_COUNT; index++){
            let elOptNew = document.createElement('option');
            elOptNew.text = String(index);
            this.m_elMustFindMonsterNo.add(elOptNew);
        }
        this.m_elMustFindMonsterNo.selectedIndex = 0;
    }

    initMonsterSpeed(){
        const TOTAL_SPEED_MODE = 3;
        const SPEED_MODE = [MONSTER_SPEED_MODE.LOW, MONSTER_SPEED_MODE.MIDDLE, MONSTER_SPEED_MODE.HIGH];

        for(let index=0; index<TOTAL_SPEED_MODE; index++){
            let elOptNew = document.createElement('option');
            elOptNew.text = String(SPEED_MODE[index]);
            this.m_elMonsterSpeed.add(elOptNew);
        }
        this.m_elMonsterSpeed.selectedIndex = 0;
    }
};
// Game Controller Instance 생성
const cGameController = new GameController();
