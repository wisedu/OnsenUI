/*
 步进组件
 */

//引入标签开发需要的一些公共类
import util from 'ons/util';
import autoStyle from 'ons/autostyle';
import ModifierUtil from 'ons/internal/modifier-util';
import BaseElement from 'ons/base-element';
import contentReady from 'ons/content-ready';

const space = {
    //该组件的根样式名
    rootClassName: 'bh-modal-bottom',
    animateTime: 450
};

//继承标签开发所需的类
class BhModalBottomElement extends BaseElement {

    show(options = {}){
        options = util.extend(
            options || {}
        );

        const content = this.querySelector('.'+space.rootClassName+'-content');
        const cover = util.findChild(this, '.'+space.rootClassName+'-cover');

        if(cover){
            cover.classList.remove('bh-animate-fadeIn');
            cover.classList.add('bh-animate-out-fadeOut');
        }

        content.classList.remove('bh-animate-out-bottom');
        content.classList.add('bh-animate-into-bottom');
        this.style.display = 'block';

        if(typeof options.callback !='undefined' && options.callback instanceof Function){
            //执行的回调
            options.callback();
        }
    }
    hide(options = {}){
        options = util.extend(
            options || {}
        );

        let root = this;
        if(this.localName !== space.rootClassName){
            root = util.findParent(this, space.rootClassName);
        }
        const content = util.findChild(root, '.'+space.rootClassName+'-content');
        const cover = util.findChild(root, '.'+space.rootClassName+'-cover');

        if(cover){
            cover.classList.remove('bh-animate-fadeIn');
            cover.classList.add('bh-animate-out-fadeOut');
        }

        content.classList.remove('bh-animate-into-bottom');
        content.classList.add('bh-animate-out-bottom');

        setTimeout(function () {
            root.style.display = 'none';
        }, space.animateTime);
        if(typeof options.callback !='undefined' && options.callback instanceof Function){
            //执行的回调
            options.callback();
        }
    }

    //点击底部弹框的非内容区域,将弹框隐藏
    _clickAllHandle(event){
        this.hide();
    }
    //点击弹框的内容区域将事件冒泡阻止,防止误隐藏操作
    _contentClickAllHandle(event){
        event.preventDefault();
        event.stopPropagation();
    }

    //组件加载完毕的回调,相当于该组件的入口方法
    createdCallback() {
        contentReady(this, () => this._compile());
    }

    //初始化方法
    _compile() {
        const selectContent = this.querySelector('.'+space.rootClassName+'-content');
        if(selectContent){
            const selectCloseIcon = util.findChild(selectContent, '.icon-close');
            if(selectCloseIcon){
                selectCloseIcon.removeEventListener('click', this.hide, false);
                selectCloseIcon.addEventListener('click', this.hide, false);
            }
            return;
        }
        const content = util.create('.'+space.rootClassName+'-content');

        let isHaveClose = false;
        let closeIcon = null;
        if(this.hasAttribute('close-icon')){
            closeIcon = util.create('i');
            closeIcon.classList.add('iconfont');
            closeIcon.classList.add('icon-close');
            content.appendChild(closeIcon);
            isHaveClose = true;
        }

        while (this.firstChild) {
            content.appendChild(this.firstChild);
        }

        if(this.hasAttribute('cover')){
            const cover = util.create('.'+space.rootClassName+'-cover');
            //给遮罩层添加动画
            cover.classList.add('bh-animated');
            this.appendChild(cover);
        }

        this.appendChild(content);

        this.style.display = 'none';
        content.classList.add('bh-animated');

        let bottom = this.getAttribute('bottom');
        if(bottom){
            this.style.bottom = util.pxToRem(bottom);
        }

        if(isHaveClose){
            //给关闭按钮添加点击事件
            closeIcon.addEventListener('click', this.hide, false);
        }

        //给内容去添加事件监听
        this.querySelector('.'+space.rootClassName+'-content').addEventListener('click', this._contentClickAllHandle, false);
        //给整个底部弹框添加点击事件监听
        this.addEventListener('click', this._clickAllHandle, false);
    }
}

//注册该标签(用于浏览器不支持自定义标签的处理)
window.BhModalBottomElement = document.registerElement('bh-modal-bottom', {
    prototype: BhModalBottomElement.prototype
});
