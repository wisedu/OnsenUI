import util from 'ons/util';
import autoStyle from 'ons/autostyle';
import ModifierUtil from 'ons/internal/modifier-util';
import BaseElement from 'ons/base-element';
import contentReady from 'ons/content-ready';

const space = {
    //该组件的根样式名
    rootClassName: 'bh-input',
    value: ''
};

/**
 * 输入框
 *
 * @example <bh-input label="label值" value="输入框的值"></bh-input>
 */
export default class BhInputElement extends BaseElement {

    /**
     * 获取输入框的值
     * @returns {string}
     */
    value(){
        return util.findChild(this, 'input').value;
    }

    //组件加载完毕的回调,相当于该组件的入口方法
    init() {
        contentReady(this, () => this._compile());
    }

    //初始化方法
    _compile() {
        const initValue = this.getAttribute('value');
        if(initValue){
            space.value = initValue;
        }

        const label = this.getAttribute('label');


        const stepHtml = `
            <div class="${space.rootClassName}-label">${label}</div>
            <input class="${space.rootClassName}" value="${space.value}" type="text" />
        `;

        this.innerHTML = stepHtml;
    }

}

//注册该标签(用于浏览器不支持自定义标签的处理)
customElements.define('bh-input', BhInputElement);
