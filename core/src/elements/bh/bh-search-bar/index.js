
//引入标签开发需要的一些公共类
import util from 'ons/util';
import autoStyle from 'ons/autostyle';
import ModifierUtil from 'ons/internal/modifier-util';
import BaseElement from 'ons/base-element';
import contentReady from 'ons/content-ready';

const space = {
    //该组件的根样式名
    rootClassName: 'bh-search-bar'
};

/**
 * 搜索条
 * @example <bh-search-bar></bh-search-bar>
 * @example <bh-search-bar text="内容"></bh-search-bar>
 */
export default class BhSearchBarElement extends BaseElement {

    //组件加载完毕的回调,相当于该组件的入口方法
    init() {
        contentReady(this, () => this._compile());
    }

    //监听属性变化处理
    attributeChangedCallback(name, last, current) {
        //text 变化时的处理
        if(name === 'text'){
            this.querySelector('span').innerHTML = current;
        }
    }
    static get observedAttributes() {
        return ['span'];
    }


    //初始化方法
    _compile() {
        const value = this.getAttribute('text') || '';
        const contentHtml = `
            <div class="${space.rootClassName}">
                <i class="iconfont icon-search"></i>
                <span>` + value + `</span>
            </div>
        `;

        this.innerHTML = contentHtml;
    }

}

//注册该标签(用于浏览器不支持自定义标签的处理)
customElements.define('bh-search-bar', BhSearchBarElement);
