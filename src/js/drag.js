/**
 * @doc drag可拖拽区域实现
 * @author Heanes
 * @time 2017-03-03 19:07:45 周五
 */

;(function($, window, document, undefined){
    "use strict";
    let pluginName = 'draggable';
    let _default = {};
    _default.setting = {
        draggable: true,                                    // 是否可以拖拽
        resizable: true,                                    // 是否可以改变窗体大小
        title: '<h2 class="content-title">拖拽一下试试</h2>', // 拖拽窗体的标题
        showStatusBar: false,                               // 是否显示状态信息栏
        // resize边框的配置
        dragBorder: {
            topSize: '60px',
            bottomSize: '60px',
            leftSize: '60px',
            rightSize: '60px',
            borderRadius: '4px',
            topColor: '#efdfed',
            bottomColor: '#ceb455',
            leftColor: '#cdef75',
            rightColor: '#a7bbef',
        },
        // 显示内容的外套的配置
        $dragContent: {
            padding: '18px',
            borderWidth: '10px',
            borderColor: '#a0b3d6',
            borderStyle: 'solid'
        },
        // 拖拽移动框的配置
        dragMoveBar: {
            height:           '80px',
            bgColor:          '#258cef',
            color:            '#fff',
            borderTopSize:    '20px',
            borderBottomSize: '20px',
            borderLeftSize:   '20px',
            borderRightSize:  '20px',
            borderStyle:      'solid',
            borderColor:      '#c9e7e4',
            fontSize:         '14px'
        },
        // 整体样式
        dragWrap: {
            borderSize:     '30px',
            borderStyle:    'solid',
            BorderColor:    'rgba(248, 233, 104, 0.42)',
            boxShadow:      '2px 2px 4px rgba(130, 130, 130, .5)',
        }
    };

    let Draggable = function (element, options) {
        this.$element = $(element);
        this._defaults = _default;
        this._name = pluginName;
        this.version = 'v1.0.0';
        this.init(options);
        return {
            // Options (public access)
            options: this.options,

            // Initialize / destroy methods
            init:                   $.proxy(this.init, this),
            remove:                 $.proxy(this.remove, this),

            // Method
            setValue:               $.proxy(this.setValue, this),

            // prepare use
            test:                   $.proxy(this.test, this)
        };
    };

    Draggable.prototype = {
        inlineData: {
            dragFlag: false,
            resizeFlag: false,
            resizeBorderPlace: '',
            left: 0,
            top: 0,
            currentX: 0,
            currentY: 0,
            moveOffset: {
                offsetX: 0,
                offsetY: 0
            },
            dragWrapWindow: {
                outerWidth: 0,
                outerHeight: 0
            },
            dragMoveBarWindow: {
                outerWidth: 0
            },
            dragContentWindow: {
                outerWidth: 0,
                outerHeight: 0
            },
            originContentWindow: {
                outerWidth: 0,
                outerHeight: 0
            },
            // 垂直边框的高度
            dragBorderVerticalWindow:{
                outerHeight: 0
            },
            // 水平边框的高度
            dragBorderHorizontalWindow:{
                outerWidth: 0
            }
        },
        __inElement: {
            $originContent:          undefined,
            $dragWrap:               undefined,
            $dragContent:            undefined,
            $dragOperateWrap:        undefined,
            $dragMoveBar:            undefined,
            $dragBorder:             undefined,
            $dragBorderTop:          undefined,
            $dragBorderBottom:       undefined,
            $dragBorderLeft:         undefined,
            $dragBorderRight:        undefined,
            $dragBorderTopLeft:      undefined,
            $dragBorderTopRight:     undefined,
            $dragBorderBottomLeft:   undefined,
            $dragBorderBottomRight:  undefined
        },
        init: function (options) {
            this.options = $.extend(true, {}, _default.setting, options);
            this.render(this.options);
            return this;
        },

        bindMouseEvent: function (options) {
            let that = this;
            // 全局 - 鼠标移动
            $(document).on('mousemove', function (event) {
                let e = event ? event: window.event;

                if(options.draggable || options.resizable){
                    that.__inElement.moveOffset = {
                        offsetX: e.clientX - that.inlineData.currentX,
                        offsetY: e.clientY - that.inlineData.currentY
                    };
                    //console.log(that.__inElement.moveOffset);

                    // 拖拽窗体部分
                    that.mouseMoveToDrag(options, that.__inElement.moveOffset);

                    // 改变窗体大小部分
                    that.mouseMoveToResize(options, that.__inElement.moveOffset);

                }
            });

            // 全局 - 释放鼠标
            $(document).on('mouseup', function () {
                if(options.draggable){
                    that.inlineData.dragFlag = false;
                }
                if(options.resizable){
                    that.inlineData.resizeFlag = false;
                }
            });

            this.bindDrag(options);
            this.bindResize(options);
            return this;
        },

        bindDrag: function (options) {
            let that = this;
            // 标题栏按下鼠标时，拖拽
            that.__inElement.$dragMoveBar.on('mousedown', function (event) {
                if(!options.draggable){
                    return false;
                }
                that.inlineData.dragFlag = true;

                let e = event ? event: window.event;

                that.inlineData.currentX = e.clientX;
                that.inlineData.currentY = e.clientY;
                let targetPosition = getTargetPosition(that.__inElement.$dragWrap);
                that.inlineData.left = targetPosition.left;
                that.inlineData.top = targetPosition.top;
            });
        },

        // 鼠标移动来拖拽
        mouseMoveToDrag: function (options, moveOffset) {
            let that = this;
            if(options.draggable){
                if (that.inlineData.dragFlag) {
                    preventTextSelectable(that.__inElement.$dragWrap);
                    let nowPosition = {
                            top: that.inlineData.top + moveOffset.offsetY,
                            left: that.inlineData.left + moveOffset.offsetX
                        };
                    moveTargetPosition(that.__inElement.$dragWrap, nowPosition);
                    this.showStatusInfo(options);
                }
            }

        },
        bindResize: function (options) {
            let that = this;
            // 边框部分按下鼠标时，改变窗体大小
            that.__inElement.$dragBorder.on('mousedown', function (event) {
                if(!options.draggable){
                    return false;
                }
                that.inlineData.resizeFlag = true;

                let e = event ? event: window.event;
                let $target = $(e.target);

                // 判断是哪个边框被按下
                if($target.hasClass('drag-border-top')){
                    that.inlineData.resizeBorderPlace = 'top';
                }
                if($target.hasClass('drag-border-bottom')){
                    that.inlineData.resizeBorderPlace = 'bottom';
                }
                if($target.hasClass('drag-border-left')){
                    that.inlineData.resizeBorderPlace = 'left';
                }
                if($target.hasClass('drag-border-right')){
                    that.inlineData.resizeBorderPlace = 'right';
                }

                if($target.hasClass('drag-border-top-left')){
                    that.inlineData.resizeBorderPlace = 'top-left';
                }
                if($target.hasClass('drag-border-top-right')){
                    that.inlineData.resizeBorderPlace = 'top-right';
                }
                if($target.hasClass('drag-border-bottom-left')){
                    that.inlineData.resizeBorderPlace = 'bottom-left';
                }
                if($target.hasClass('drag-border-bottom-right')){
                    that.inlineData.resizeBorderPlace = 'bottom-right';
                }

                that.inlineData.currentX = e.clientX;
                that.inlineData.currentY = e.clientY;
                let targetPosition = getTargetPosition(that.__inElement.$dragWrap);
                that.inlineData.left = targetPosition.left;
                that.inlineData.top = targetPosition.top;

                let dragWrapWindowOuterSize     = getTargetWindowOuterSize(that.__inElement.$dragWrap);
                let dragContentWindowOuterSize  = getTargetWindowOuterSize(that.__inElement.$dragContent);
                let contentWindowOuterSize      = getTargetWindowOuterSize(that.__inElement.$originContent);
                let dragMoveBarWindowOuterSize  = getTargetWindowOuterSize(that.__inElement.$dragMoveBar);
                let dragBorderTopOuterSize      = getTargetWindowOuterSize(that.__inElement.$dragBorderTop);
                let dragBorderLeftOuterSize     = getTargetWindowOuterSize(that.__inElement.$dragBorderLeft);
                // 拖拽整体
                that.inlineData.dragWrapWindow.outerWidth = dragWrapWindowOuterSize.outerWidth;
                that.inlineData.dragWrapWindow.outerHeight = dragWrapWindowOuterSize.outerHeight;
                // 拖拽内容外套
                that.inlineData.dragContentWindow.outerWidth = dragContentWindowOuterSize.outerWidth;
                that.inlineData.dragContentWindow.outerHeight = dragContentWindowOuterSize.outerHeight;
                // 原始内容
                that.inlineData.originContentWindow.outerWidth = contentWindowOuterSize.outerWidth;
                that.inlineData.originContentWindow.outerHeight = contentWindowOuterSize.outerHeight;
                that.inlineData.dragMoveBarWindow.outerWidth = dragMoveBarWindowOuterSize.outerWidth;
                // 边框的宽高
                that.inlineData.dragBorderVerticalWindow.outerHeight = dragBorderLeftOuterSize.outerHeight;
                that.inlineData.dragBorderHorizontalWindow.outerWidth = dragBorderTopOuterSize.outerWidth;
            });
        },

        // 鼠标移动来改变窗体大小部分
        mouseMoveToResize: function (options, moveOffset) {
            let that = this;
            if(options.resizable){
                if (that.inlineData.resizeFlag) {
                    preventTextSelectable(that.__inElement.$dragWrap);
                    let nowPosition = {};
                    /*console.log('moveOffset： ');
                    console.log(moveOffset);
                    console.log(this.inlineData);*/
                    let dragWrapNowSize = {}, dragContentNowSize = {}, contentNowSize = {},
                        dragMoveBarNowSize = {}, dragBorderVerticalNowSize = {}, dragBorderHorizontalNowSize = {};
                    // 左右上下四个角拖动时
                    let cornerFlag = false;
                    let offsetX = moveOffset.offsetX, offsetY = moveOffset.offsetY;
                    if(that.inlineData.resizeBorderPlace === 'top-left' || that.inlineData.resizeBorderPlace === 'top-right' || that.inlineData.resizeBorderPlace === 'bottom-left' || that.inlineData.resizeBorderPlace === 'bottom-right'){
                        cornerFlag = true;
                    }
                    // 上下边框拖动时改变高度
                    if(cornerFlag || that.inlineData.resizeBorderPlace === 'top' || that.inlineData.resizeBorderPlace === 'bottom'){
                        // 鼠标向上移动时，y轴竖直方向偏移量为负值
                        if(that.inlineData.resizeBorderPlace === 'top' || that.inlineData.resizeBorderPlace === 'top-left' || that.inlineData.resizeBorderPlace === 'top-right'){
                            offsetY = 0 - offsetY;
                        }
                        dragWrapNowSize.height = that.inlineData.dragWrapWindow.outerHeight + offsetY;
                        dragContentNowSize.height = that.inlineData.dragContentWindow.outerHeight + offsetY;
                        contentNowSize.height = that.inlineData.originContentWindow.outerHeight + offsetY;
                        dragBorderVerticalNowSize .height = that.inlineData.dragBorderVerticalWindow.outerHeight + offsetY;

                        // 当时从上方或左方拖动时才改变水平方向定位
                        if(that.inlineData.resizeBorderPlace === 'top' || that.inlineData.resizeBorderPlace === 'top-left' || that.inlineData.resizeBorderPlace === 'top-right'){
                            nowPosition.top = that.inlineData.top + moveOffset.offsetY;
                        }
                    }
                    // 左右边框拖动改变宽度
                    if(cornerFlag || that.inlineData.resizeBorderPlace === 'left' || that.inlineData.resizeBorderPlace === 'right' || that.inlineData.resizeBorderPlace === 'bottom-left'){
                        // 鼠标向左移动时，x轴水平方向偏移量为负值
                        if(that.inlineData.resizeBorderPlace === 'left' || that.inlineData.resizeBorderPlace === 'top-left' || that.inlineData.resizeBorderPlace === 'bottom-left'){
                            offsetX = 0 - offsetX;
                        }
                        // 鼠标向上移动时，偏移量为负值
                        dragWrapNowSize.width = that.inlineData.dragWrapWindow.outerWidth + offsetX;
                        dragContentNowSize.width = that.inlineData.dragContentWindow.outerWidth + offsetX;
                        dragMoveBarNowSize.width = that.inlineData.dragMoveBarWindow.outerWidth + offsetX;
                        contentNowSize.width = that.inlineData.originContentWindow.outerWidth + offsetX;
                        dragBorderHorizontalNowSize.width = that.inlineData.dragBorderHorizontalWindow.outerWidth + offsetX;

                        // 当时从上方或左方拖动时才改变竖直方向定位
                        if(that.inlineData.resizeBorderPlace === 'left' || that.inlineData.resizeBorderPlace === 'top-left' || that.inlineData.resizeBorderPlace === 'bottom-left'){
                            nowPosition.left = that.inlineData.left + moveOffset.offsetX;
                        }
                    }

                    // 更改窗体位置
                    if(that.inlineData.resizeBorderPlace === 'top' || that.inlineData.resizeBorderPlace === 'left' || that.inlineData.resizeBorderPlace === 'top-left' || that.inlineData.resizeBorderPlace === 'top-right' || that.inlineData.resizeBorderPlace === 'bottom-left'){
                        moveTargetPosition(that.__inElement.$dragWrap, nowPosition);
                    }

                    // 改变窗体大小
                    changeTargetWindowSize(that.__inElement.$dragWrap, dragWrapNowSize);
                    changeTargetWindowSize(that.__inElement.$dragContent, dragContentNowSize);
                    changeTargetWindowSize(that.__inElement.$originContent, contentNowSize);
                    changeTargetWindowSize(that.__inElement.$dragMoveBar, dragMoveBarNowSize);
                    changeTargetWindowSize(that.__inElement.$dragBorderTop, dragBorderHorizontalNowSize);
                    changeTargetWindowSize(that.__inElement.$dragBorderBottom, dragBorderHorizontalNowSize);
                    changeTargetWindowSize(that.__inElement.$dragBorderLeft, dragBorderVerticalNowSize);
                    changeTargetWindowSize(that.__inElement.$dragBorderRight, dragBorderVerticalNowSize);
                    this.showStatusInfo(options);

                }
            }
            return this;
        },

        showStatusInfo: function (options) {
            this.__inElement.$dragBorderBottom.empty().append('x:' + this.inlineData.moveOffset.offsetX + 'y:' + this.inlineData.moveOffset.offsetY);
        },

        render: function (options) {
            let $dragWrap = $(this.template.dragWrap);
            let $dragOperateWrap = $(this.template.dragOperateWrap);

            let $dragMoveBar = $(this.template.dragMoveBar);
            $dragMoveBar.append($(this.options.title));
            let $dragBorderTop          = $(this.template.dragBorderTop),
                $dragBorderBottom       = $(this.template.dragBorderBottom),
                $dragBorderLeft         = $(this.template.dragBorderLeft),
                $dragBorderRight        = $(this.template.dragBorderRight),
                $dragBorderTopLeft      = $(this.template.dragBorderTopLeft),
                $dragBorderTopRight     = $(this.template.dragBorderTopRight),
                $dragBorderBottomLeft   = $(this.template.dragBorderBottomLeft),
                $dragBorderBottomRight  = $(this.template.dragBorderBottomRight);

            $dragOperateWrap.append($dragMoveBar)
            // 上边
                .append($dragBorderTopLeft).append($dragBorderTop).append($dragBorderTopRight)
            // 侧边
                .append($dragBorderLeft).append($dragBorderRight)
            // 下边
                .append($dragBorderBottomLeft).append($dragBorderBottom).append($dragBorderBottomRight);

            let $dragContent = $(this.template.dragContent);
            this.$element.wrap($dragContent);
            let $dragContentNew = this.$element.parent();
            $dragContentNew.wrap($dragWrap);
            let $dragWrapNew = $dragContentNew.parent();
            $dragWrapNew.prepend($dragOperateWrap);

            this.__inElement.$originContent         = this.$element;
            this.__inElement.$dragWrap              = $dragWrapNew;
            this.__inElement.$dragContent           = $dragContentNew;
            this.__inElement.$dragOperateWrap       = $dragOperateWrap;
            this.__inElement.$dragMoveBar           = $dragMoveBar;
            this.__inElement.$dragBorder            = $dragWrapNew.find('.drag-border');
            this.__inElement.$dragBorderTop         = $dragBorderTop;
            this.__inElement.$dragBorderBottom      = $dragBorderBottom;
            this.__inElement.$dragBorderLeft        = $dragBorderLeft;
            this.__inElement.$dragBorderRight       = $dragBorderRight;
            this.__inElement.$dragBorderTopLeft     = $dragBorderTopLeft;
            this.__inElement.$dragBorderTopRight    = $dragBorderTopLeft;
            this.__inElement.$dragBorderBottomLeft  = $dragBorderBottomLeft;

            this.calculateRenderSize(options);

            this.bindMouseEvent(options);

            return this;
        },

        calculateRenderSize: function (options) {
            getTargetPosition(this.__inElement.$originContent);
            /*let
                // 原始内容窗体的宽高
                $originContentWindow = {
                    width:      this.__inElement.$originContent.outerWidth(),
                    height:     this.__inElement.$originContent.outerHeight(),
                    offsetTop:  this.__inElement.$originContent.offset().top,
                    offsetLeft: this.__inElement.$originContent.offset().left
                },
                // 拖拽的窗体内容区域的宽高
                dragWrapWindow = {
                    width:  0,
                    height: 0,
                    top:    0,
                    left:   0
                },
                // 整个窗体的宽高
                dragContentWindow = {
                    width:  $originContentWindow + $dragContentPadding * 2 + $dragContentBorderWidth * 2,
                    height: 0
                },
                // 窗体拖拽移动操作区域的宽高
                dragMoveBarWindow = {
                    width:  0,
                    height: 0
                };*/
            this.showStatusInfo();
            return this;
        },

        /**
         * @doc 模版
         */
        template: {
            dragWrap:               '<div class="drag-wrap">',
            dragContent:            '<div class="drag-content">',
            dragOperateWrap:        '<div class="drag-operate-wrap"></div>',
            dragMoveBar:            '<div class="drag-move-bar"></div>',
            dragBorderTop:          '<div class="drag-border drag-border-top"></div>',
            dragBorderBottom:       '<div class="drag-border drag-border-bottom"></div>',
            dragBorderLeft:         '<div class="drag-border drag-border-left"></div>',
            dragBorderRight:        '<div class="drag-border drag-border-right"></div>',
            dragBorderTopLeft:      '<div class="drag-border drag-border-top-left"></div>',
            dragBorderTopRight:     '<div class="drag-border drag-border-top-right"></div>',
            dragBorderBottomLeft:   '<div class="drag-border drag-border-bottom-left"></div>',
            dragBorderBottomRight:  '<div class="drag-border drag-border-bottom-right"></div>',
        }
    };
    /**
     * @doc 将目标窗体宽高该表至指定大小
     * @param $target
     * @param size
     */
    function changeTargetWindowSize($target, size) {
        if(size){
            if(size.width){
                $target.css({width: size.width});
            }
            if(size.height){
                $target.css({height: size.height});
            }
        }
    }

    /**
     * @doc 移动目标dom到指定位置
     * @param $target
     * @param position
     */
    function moveTargetPosition($target, position){
        if(position.top || position.left){
            $target.css({
                position: 'absolute',
            });
        }
        if(position.top){
            $target.css({
                top: position.top + 'px',
            });
        }
        if(position.left){
            $target.css({
                left: position.left + 'px'
            });
        }
    }

    /**
     * @doc 获取目标dom的定位值
     * @param $target
     * @returns {{top: number, left: number}}
     */
    function getTargetPosition($target) {
        let positionTop = 0;
        let positionLeft = 0;
        if($target){
            positionTop = $target.offset().top;
            positionLeft = $target.offset().left;
        }
        return {top: positionTop, left: positionLeft};
    }

    /**
     * @doc 获取指定目标dom的可视窗体的宽高
     * @param $target
     * @returns {{outerWidth: number, outerHeight: number}}
     */
    function getTargetWindowOuterSize($target) {
        if($target){
            let outerWidth = $target.outerWidth();
            let outerHeight = $target.outerHeight();
            return {outerWidth: outerWidth, outerHeight: outerHeight};
        }

    }

    /**
     * @doc 阻止可选中文本
     */
    function preventTextSelectable($dom) {
        $dom.on('selectstart', function(){ return false; });
    }

    /**
     * @doc 恢复可选中文本
     */
    function recoverTextSelectable($dom) {
        // todo
    }

    function logError(message) {
        if(window.console){
            window.console.error(message);
        }
    }

    $.fn[pluginName] = function (options, args) {
        let result = undefined;
        this.each(function () {
            let _this = $.data(this, pluginName);
            if (typeof options === 'string') {
                if (!_this) {
                    logError('Not initialized, can not call method : ' + options);
                }
                else if (!$.isFunction(_this[options]) || options.charAt(0) === '_') {
                    logError('No such method : ' + options);
                }
                else {
                    if (!(args instanceof Array)) {
                        args = [ args ];
                    }
                    result = _this[options].apply(_this, args);
                }
            }
            else if (typeof options === 'boolean') {
                result = _this;
            }
            else {
                $.data(this, pluginName, new Draggable(this, $.extend(true, {}, options)));
            }
        });
        return result || this;
    };

})(jQuery, window, document);



