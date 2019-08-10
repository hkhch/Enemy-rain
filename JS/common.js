/***************************************************************
 * 파일명 : common.js
 * 작성일 : 2019. 08. 08
 * 작성자 : 한광훈
 * 내  용 : 공통으로 사용되는 자료구조 (Class, Function, Value, etc.)
 * 비  고 : 의미화된 자료구조나 재사용이 필요한 데이터들
 ***************************************************************/

 /***************************************************************
 * 사용자 정의 자료구조 (Abstract Data Type)
***************************************************************/

 /***************************************************************
 * HTML관련 자료구조
***************************************************************/
const TAG = {
    div: "div",
    span: "span",
    ul: "ul",
    li: "li",
    input: "input",
    button: "button",
    hr: "hr"
};


/***************************************************************
 * VIEW 관련 자료구조
***************************************************************/
const PLAY_VIEW_MAX = {
    X: 800,
    Y: 600,
};


/***************************************************************
 * 사용자 MEMEBR 함수 정의
***************************************************************/
Number.prototype.padLeft = function() {
    if(this < 10) {
        return '0' + String(this);
    }
    else {
        return String(this);
    }
}

Date.prototype.format = function() {
    var yyyy = this.getFullYear();
    var month = (this.getMonth() + 1).padLeft();
    var dd = this.getDate().padLeft();
    var HH = this.getHours().padLeft();
    var mm = this.getMinutes().padLeft();
    var ss = this.getSeconds().padLeft();

    var format = [yyyy, month, dd].join('-') + ' ' + [HH, mm, ss].join(':');
    return format;
}


/***************************************************************
 * COMMON UTILITY 관련 자료구조
***************************************************************/
const SET = {
    ON: 1,
    OFF: 0,
};

const DISPLAY_MODE = {
    CONCOLE: 0,
    ALERT: 1,
};

class Common {
    constructor(displayMode=0){ // displayMode : 0(console), 1(alert)
        // 공통된 맴버변수 추가
        this.m_displayMode = displayMode;
    }

    // 공통된 맴버함수 추가
    DisplayMsg(displayMsg){
        // 추후 별도의 인터페이스 Element구성
        let date = new Date().format();
        let strMessage = "";

        // Display Message 가공
        strMessage += `[${date}] ${displayMsg}`;

        // Display Mode 선택
        // console창
        if(this.m_displayMode == 0){
            console.log(strMessage);
        }
        // alert창
        else if(this.m_displayMode == 1){
            alert(strMessage);
        }
    }

    SetDisplayMode(displayMode){
        this.m_displayMode = displayMode;
    }
};