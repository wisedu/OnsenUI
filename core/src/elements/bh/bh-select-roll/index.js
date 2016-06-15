/*
 步进组件
 */

//引入标签开发需要的一些公共类
import util from 'ons/util';
import platform from 'ons/platform';
import autoStyle from 'ons/autostyle';
import ModifierUtil from 'ons/internal/modifier-util';
import BaseElement from 'ons/base-element';
import contentReady from 'ons/content-ready';

const SPACE = {
    //该组件的根样式名
    rootClassName: 'bh-select-roll',
    touchStartData: {},
    dataCount: 0,
    rotateXstep: 20,
    activeIndex: 0
};

//继承标签开发所需的类
class BhSelectRollElement extends BaseElement {
    getValue(){
        var selectedValue = this.querySelector('.bh-active').getAttribute("value");
        this.setAttribute("selected", selectedValue);
        return selectedValue;
    }
    
    _touchStartHandle(event){
        SPACE.touchStartData.timeStamp = event.timeStamp;
        SPACE.touchStartData.pageY = event.touches[0].pageY;
        this._resetItemActive('hide');
    }

    _touchMoveHandle(event){
        const pageY = event.touches[0].pageY;
        const diff = SPACE.touchStartData.pageY - pageY;
        const ulObj = this.querySelector('ul');
        const ulTransform = ulObj.style.transform;
        const rotateX = ulTransform.match(/rotateX\(\-?\d*\.+\d*deg\)|rotateX\(\-?\d*deg\)/);
        const rotateXNum = Number(rotateX[0].replace(/[^\-\.0-9]*/g, ''));
        const newRotateXNum = rotateXNum + diff;
        const newTransform = ulTransform.replace(/rotateX\(.+deg\)/, `rotateX(${newRotateXNum}deg)`);
        const index = Math.round(newRotateXNum / SPACE.rotateXstep);

        if(index >= 0 && index < SPACE.dataCount){
            SPACE.activeIndex = index;
        }else{
            if(index < 0){
                SPACE.activeIndex = 0;
                if(index < -1){
                    return;
                }
            }else{
                SPACE.activeIndex = SPACE.dataCount - 1;
                if(index > SPACE.dataCount){
                    return;
                }
            }
        }

        ulObj.style.transform = newTransform;
        SPACE.touchStartData.pageY = pageY;

        this._resetItemVisible(index);
    }

    _resetItemVisible(index){
        const liList = this.querySelectorAll('li');
        // this.querySelector('.bh-active').classList.remove('bh-active');
        const liLen = liList.length;
        for(let i=0; i<liLen; i++){
            if(i > index - 5 && i < index + 5){
                liList[i].classList.add('bh-visible');
            }else{
                liList[i].classList.remove('bh-visible');
            }
        }
    }

    _touchEndHandle(event){
        SPACE.touchStartData = {};
        this._resetItemActive('show');
        const ulObj = this.querySelector('ul');
        ulObj.style.transform = this._getUlTransform(SPACE.activeIndex * SPACE.rotateXstep);

        util.triggerElementEvent(this, 'change', {
            value: JSON.parse(this.getValue())
        });
    }

    _resetItemActive(type){
        const ulObj = this.querySelector('ul');
        const liList = ulObj.querySelectorAll('li');
        if(type === 'hide'){
            liList[SPACE.activeIndex].classList.remove('bh-active');
        }else{
            liList[SPACE.activeIndex].classList.add('bh-active');
        }
    }

    _getUlTransform(rotateX){
        return `perspective(500rem) rotateY(0deg) rotateX(${rotateX}deg)`;
    }

    //组件加载完毕的回调,相当于该组件的入口方法
    createdCallback() {
        contentReady(this, () => this._compile());
    }

    //属性变更的回调，vue集成时，会被多次触发
    attributeChangedCallback(propName,oldValue,newValue){
        switch(propName){
            case "value":
                if(newValue === undefined || newValue == null || newValue == ""){return;}
                var items = JSON.parse(newValue);
                this._renderItems(items);
                break;
            case "selected":
                let activeItem = this.querySelector(".bh-select-roll-list .bh-active");
                if(activeItem){
                    var curClass = activeItem.getAttribute("class");
                    activeItem.setAttribute("class", curClass.replace("bh-active", ""));
                }
                //this.querySelector(`li[value='${newValue}']`).setAttribute("class", "bh-active bh-visible");
                break;
            default:
                break;
        }
    }

    _renderItems(items){
        const selectDatas = items;
        const selectDataLen = selectDatas.length;

        SPACE.dataCount = selectDataLen;
        let listHtml = '';
        const itemStyle = `transform-origin: center center -7rem; transform: translateZ(7rem) rotateX(@rotateXNumdeg);`;
        for(let i=0; i<selectDataLen; i++){
            let itemClass = '';
            if(i < 4){
                if(i !== 0){
                    itemClass = 'bh-visible';
                }else{
                    itemClass = 'bh-active bh-visible';
                }
            }
            const selectItem = selectDatas[i];
            let itemValue = JSON.stringify(selectDatas[i]);
            
            listHtml += `<li class="${itemClass}" value='${itemValue}' style="${itemStyle.replace('@rotateXNum', -(i * SPACE.rotateXstep))}">${selectDatas[i].VALUE}</li>`;
        }
        this.querySelector(".bh-select-roll-list").innerHTML = listHtml;
    }

    //初始化方法
    _compile() {
        if(this.querySelector('.'+SPACE.rootClassName+'-body')){
            this.removeEventListener('touchstart', this._touchStartHandle, false);
            this.addEventListener('touchstart', this._touchStartHandle, false);

            this.removeEventListener('touchmove', this._touchMoveHandle, false);
            this.addEventListener('touchmove', this._touchMoveHandle, false);
            
            this.removeEventListener('touchend', this._touchEndHandle, false);
            this.addEventListener('touchend', this._touchEndHandle, false);
            return;
        }
        const modalBottomContentObj = util.findParent(this, '.bh-modal-bottom-content');
        if(modalBottomContentObj){
            modalBottomContentObj.style.height = '17rem';
        }

        const mobileOs = platform.getMobileOS();
        let iosUltransformOrigin = '';
        if(mobileOs === 'ios'){
            iosUltransformOrigin = 'transform-origin: center center 7rem;';
        }

        const contentHtml = `
            <div class="${SPACE.rootClassName}-body">
                <div class="${SPACE.rootClassName}-box"></div>
                <ul class="bh-select-roll-list" style="${iosUltransformOrigin} transform: ${this._getUlTransform(0)}"></ul>
            </div>
        `;

        this.innerHTML = contentHtml;

        //监听该组件的事件
        this.addEventListener('touchstart', this._touchStartHandle, false);
        this.addEventListener('touchmove', this._touchMoveHandle, false);
        this.addEventListener('touchend', this._touchEndHandle, false);
    }

}

//注册该标签(用于浏览器不支持自定义标签的处理)
window.BhSelectRollElement = document.registerElement('bh-select-roll', {
    prototype: BhSelectRollElement.prototype
});

