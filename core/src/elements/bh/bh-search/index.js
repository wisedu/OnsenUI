//引入标签开发需要的一些公共类
import util from 'ons/util';
import autoStyle from 'ons/autostyle';
import ModifierUtil from 'ons/internal/modifier-util';
import BaseElement from 'ons/base-element';
import contentReady from 'ons/content-ready';

const space = {
    //该组件的根样式名
    rootClassName: 'bh-search',
    value: ''
};

/**
 * 搜索框
 *
 * @example <bh-search></bh-search>
 */
export default class BhSearchElement extends BaseElement {
    /**
     * 获取或设置搜索框的值
     * @param {string} text 传入text则为设值,否则为获取值
     * @returns {string}
     */
    value(text) {
        if(typeof text === 'undefined'){
            return this.querySelector('.bh-search-input').value;
        }else{
            this.querySelector('.bh-search-input').value = text + '';
            this._showClose();
        }
    }

    _clearValue() {
        const parentObj = util.findParent(this, 'bh-search');
        const input = parentObj.querySelector('.bh-search-input');
        const clas = this.getAttribute('class');
        if (input.value != '') {

            if (clas == 'iconfont icon-cancel') {
                this.style.display = 'none';
            } else {
                this.previousSibling.parentNode.querySelector('.icon-cancel').style.display = 'none';
            }
            input.value = '';
            input.focus();
        }

        /**
         * 点击取消按钮时触发的事件
         * @event BhSearchElement#BhSearchElement cancel
         */
        if(util.hasClass(this, 'bh-search-cancel')){
            util.triggerElementEvent(this, 'cancel');
        }
    }

    _showClose() {
        const value = this.value;
        const cancel = this.parentNode.querySelector('.icon-cancel');
        if (value != '') {
            cancel.style.display = 'inline-block';
        } else {
            cancel.style.display = 'none';
        }
    }

    //组件加载完毕的回调,相当于该组件的入口方法
    init() {
        contentReady(this, () => this._compile());
    }

    //初始化方法
    _compile() {
        const contentHtml = `
            <div class="${space.rootClassName}-wrap">
                <div class="${space.rootClassName}-box">
                    <i class ="iconfont icon-search"></i>
                    <input class="${space.rootClassName}-input" value="${space.value}" type="text" />
                    <i class = "iconfont icon-cancel"></i>
                </div>
                <a href="javascript:;" class="bh-search-cancel">取消</a>
            </div>
        `;

        this.innerHTML = contentHtml;

        const cancel = this.querySelector('.bh-search-cancel');
        const close = this.querySelector('.icon-cancel');
        const Input = this.querySelector('.bh-search-input');
        cancel.addEventListener('click', this._clearValue, false);
        close.addEventListener('click', this._clearValue, false);
        Input.addEventListener('keyup', this._showClose, false);
    }

}

//注册该标签(用于浏览器不支持自定义标签的处理)
customElements.define('bh-search', BhSearchElement);
