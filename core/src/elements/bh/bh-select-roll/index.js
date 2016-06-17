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
    //获取当前选中数据
    getValue(){
        const activeItem = this.querySelector('.bh-active');
        return {"key": activeItem.getAttribute('key'), "value": activeItem.getAttribute('value')};
    }

    /**
     * 开始触摸
     * 记录当前的y轴位置,存入SPACE.touchStartData.pageY中
     * 将高亮节点的高亮去掉
     * @param event
     * @private
     */
    _touchStartHandle(event){
        SPACE.touchStartData.timeStamp = event.timeStamp;
        SPACE.touchStartData.pageY = event.touches[0].pageY;
        this._resetItemActive('hide');
    }

    /**
     * 滑动处理
     * 获取当前的y轴值,计算滑动距离与应滑动到的节点位置
     * 设置ul的transform
     * 更新SPACE.touchStartData.pageY为当前节点位置
     * 更新SPACE.activeIndex为当前节点index
     * @param event
     * @private
     */
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
            //当滑动到顶时或底部时,最多可偏移一个节点的距离
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

        //根据当前位置index设置节点的显示隐藏
        this._resetItemVisible(index);
    }

    /**
     * 根据当前位置index设置节点的显示隐藏
     * @param index
     * @private
     */
    _resetItemVisible(index){
        const liList = this.querySelectorAll('li');
        const liLen = liList.length;
        for(let i=0; i<liLen; i++){
            if(i > index - 5 && i < index + 5){
                liList[i].classList.add('bh-visible');
            }else{
                liList[i].classList.remove('bh-visible');
            }
        }
    }

    /**
     * 触摸结束
     * 对当前选中节点设置高亮
     * 当节点不在正中间,移动节点居中
     * trigger一个change事件,把key和value值返回
     * @param event
     * @private
     */
    _touchEndHandle(event){
        SPACE.touchStartData = {};
        this._resetItemActive('show');
        const ulObj = this.querySelector('ul');
        ulObj.style.transform = this._getUlTransform(SPACE.activeIndex * SPACE.rotateXstep);

        util.triggerElementEvent(this, 'change', this.getValue());
    }

    /**
     * 当动态设置selected属性时的处理
     * 可传入json字符串或则key值
     * 根据传入的值设置高亮节点,并触发change事件
     * @param newValue
     * @private
     */
    _resetSelectItem(newValue){
        let selectData = null;
        try {
            selectData = JSON.parse(newValue).key;
        }catch (e){
            selectData = newValue;
        }

        const selectItem = this.querySelector(`li[key='${selectData}']`);
        if(selectItem){
            this._resetItemActive('hide');
            SPACE.activeIndex = util.getElementIndex(selectItem);
            this._resetItemVisible(SPACE.activeIndex);
            this._touchEndHandle();
        }
    }

    /**
     * 设置节点高亮class
     * @param type show对当前节点设置高亮,hide移除当前节点的高亮
     * @private
     */
    _resetItemActive(type){
        const ulObj = this.querySelector('ul');
        const liList = ulObj.querySelectorAll('li');
        if(type === 'hide'){
            liList[SPACE.activeIndex].classList.remove('bh-active');
        }else{
            liList[SPACE.activeIndex].classList.add('bh-active');
        }
    }

    /**
     * ul的transform值
     * @param rotateX
     * @returns {string}
     * @private
     */
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
            //该组件的数据,必须是json字符串
            //修改data数据的处理
            case 'data':
                if(!newValue){return;}
                //渲染数据
                this._renderItems(newValue);
                break;
            //设置选中节点的处理
            case 'selected':
                this._resetSelectItem(newValue);
                break;
            default:
                break;
        }
    }

    /**
     * 渲染节点列表
     * @param items 节点数据,是json字符串
     * @param type init是初始化时以字符串返回,否则直接添加到HTML中
     * @returns {string}
     * @private
     */
    _renderItems(items, type){
        let listHtml = '';
        if(items){
            try{
                items = JSON.parse(items);
            }catch (e){
                //当数据是静态的直接写在HTML标签上的处理,将其转换成json可解析的格式
                items = JSON.parse(items.replace(/{ *' *key *'/ig, '{"key"')
                    .replace(/{ *' *value *'/ig, '{"value"')
                    .replace(/' *key *' *:/ig, '"key":')
                    .replace(/' *value *' *:/ig, '"value":')
                    .replace(/{ *key *:/ig, '{"key":')
                    .replace(/{ *value *:/ig, '{"value":')
                    .replace(/, *key *:/ig, ',"key":')
                    .replace(/, *value *:/ig, ',"value":')
                    .replace(/: *' */g, ':"')
                    .replace(/ *' *}/g, '"}')
                    .replace(/' *,/g, '",'));
            }
            const selectDatas = items;
            const selectDataLen = selectDatas.length;

            SPACE.dataCount = selectDataLen;

            const itemStyle = `transform-origin: center center -7rem; transform: translateZ(7rem) rotateX(@rotateXNumdeg);`;
            for(let i=0; i<selectDataLen; i++){
                let itemClass = '';
                //前4条数据让其为显示状态
                if(i < 4){
                    if(i !== 0){
                        itemClass = 'bh-visible';
                    }else{
                        itemClass = 'bh-active bh-visible';
                    }
                }
                const selectItem = selectDatas[i];
                const selectKey = selectItem.key ? selectItem.key : selectItem.KEY;
                const selectValue = selectItem.value ? selectItem.value : selectItem.VALUE;

                listHtml += `<li class="${itemClass}" value="${selectValue}" key="${selectKey}" style="${itemStyle.replace('@rotateXNum', -(i * SPACE.rotateXstep))}">${selectValue}</li>`;
            }
        }

        if(type === 'init'){
            return listHtml;
        }else{
            this.querySelector('.bh-select-roll-list').innerHTML = listHtml;
        }
    }

    //初始化方法
    _compile() {
        //当这个组件已经初始化过,则不再进行初始化处理
        if(this.querySelector('.'+SPACE.rootClassName+'-body')){
            this.removeEventListener('touchstart', this._touchStartHandle, false);
            this.addEventListener('touchstart', this._touchStartHandle, false);

            this.removeEventListener('touchmove', this._touchMoveHandle, false);
            this.addEventListener('touchmove', this._touchMoveHandle, false);
            
            this.removeEventListener('touchend', this._touchEndHandle, false);
            this.addEventListener('touchend', this._touchEndHandle, false);
            return;
        }

        //当该组件是嵌在底部弹框组件里,则设置底部弹框的高度
        const modalBottomContentObj = util.findParent(this, '.bh-modal-bottom-content');
        if(modalBottomContentObj){
            modalBottomContentObj.style.height = '17rem';
        }

        const mobileOs = platform.getMobileOS();
        let ultransformOrigin = '';
        //当该组件是在iOS中,则给其加入动画定位点,以确保动画的正确
        if(mobileOs === 'ios'){
            ultransformOrigin = 'transform-origin: center center 7rem;';
        }

        const data = this.getAttribute('data');
        const listHtml = this._renderItems(data, 'init');

        //拼接内容串
        const contentHtml = `
            <div class="${SPACE.rootClassName}-body">
                <div class="${SPACE.rootClassName}-box"></div>
                <ul class="bh-select-roll-list" style="${ultransformOrigin} transform: ${this._getUlTransform(0)}">
                    ${listHtml}
                </ul>
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

