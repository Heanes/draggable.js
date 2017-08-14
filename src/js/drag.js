/**
 * @doc draggable 可拖拽区域实现
 * @author Heanes
 * @time 2017-03-03 19:07:45 周五
 */

;(function($, window, document, undefined){
    "use strict";
    let pluginName = 'draggable';
    let _default = {};
    _default.setting = {
        draggable: true,                                    // 是否可以拖拽移动
        resizable: true,                                    // 是否可以拖拽调整窗体大小
        title: '<h2 class="content-title">拖拽一下试试</h2>', // 拖拽窗体的标题
        showStatusBar: true,                                // 是否显示状态信息栏
        wrapType: 1,                                        // 添加窗体外套的方式， 1-从原始内容扩展，原始内容缩小；2-原始内容不动，向外扩展
        enableDirectionKeyToMove: true,                     // 按一次方向键移动窗体时的偏移量
        directionKeyDownToMoveOffset: 1,                    // 按一次方向键移动窗体时的偏移量
        // resize边框的配置
        dragBorder: {
            topSize:        '60px',
            bottomSize:     '60px',
            leftSize:       '60px',
            rightSize:      '60px',
            borderRadius:   '4px',
            topColor:       '#efdfed',
            bottomColor:    '#ceb455',
            leftColor:      '#cdef75',
            rightColor:     '#a7bbef',
        },
        // 显示内容的外套的配置
        dragContent: {
            padding:        '18px',
            bgColor:        '#ddedf1',
            borderWidth:    '10px',
            borderColor:    '#a0b3d6',
            borderStyle:    'solid'
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
        },
        // 窗体移动时的事件
        onWindowMove: undefined
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
        data: {
            // 原始的数据记录(重置用)，只在开始时初始化一次，将不再改变
            origin: {
                originContent: {
                    width:      0,
                    height:     0,
                    top:  0,
                    left: 0
                },
                dragContent: {
                    width:  0,
                    height: 0,
                },
                dragMoveBar: {
                    width:  0,
                    height: 0,
                },
                dragBorder: {
                    horizontalWidth:    0,
                    verticalHeight:     0,
                    cornerTopLeft: {
                        width:  0,
                        height: 0,
                    },
                    cornerTopRight: {
                        width:  0,
                        height: 0,
                    },
                    cornerBottomLeft: {
                        width:  0,
                        height: 0,
                    },
                    cornerBottomRight: {
                        width:  0,
                        height: 0,
                    },
                },
                dragWrap : {
                    width:  0,
                    height: 0,
                    left:   0,
                    top:    0
                },
            },

            // 计算后的数据，操作时动态变化
            calculated: {
                originContent: {
                    width:      0,
                    height:     0,
                    top:  0,
                    left: 0
                },
                dragContent: {
                    width:  0,
                    height: 0,
                },
                dragMoveBar: {
                    width:  0,
                    height: 0,
                },
                dragBorder: {
                    horizontalWidth:    0,
                    verticalHeight:     0,
                    cornerTopLeft: {
                        width:  0,
                        height: 0,
                    },
                    cornerTopRight: {
                        width:  0,
                        height: 0,
                    },
                    cornerBottomLeft: {
                        width:  0,
                        height: 0,
                    },
                    cornerBottomRight: {
                        width:  0,
                        height: 0,
                    },
                },
                dragWrap : {
                    width:  0,
                    height: 0,
                    left:   0,
                    top:    0
                },
            },

            // 动态变化的数据
            dynamic: {
                dragFlag: false,
                resizeFlag: false,
                resizeBorderPlace: '',
                // 鼠标按下时的鼠标坐标
                mouseDownPosition: {
                    X: 0,
                    Y: 0
                },
                // 鼠标按下时的窗体坐标
                currentPosition: {
                    left: 0,
                    top: 0
                },
                // 当前一次偏移位置量
                moveOffset: {
                    offsetX: 0,
                    offsetY: 0
                },
                // 偏移位置累积总量，向左右移动时，X轴偏移量发生改变，且向左移动X轴偏移量为负；向上下移动时，Y轴偏移量发生改变，且向上Y轴偏移量为负
                moveOffsetTotal: {
                    offsetX: 0,
                    offsetY: 0
                },
            },
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
            let that = this, dynamic = this.data.dynamic;
            // 全局 - 鼠标移动
            $(document).on('mousemove', function (event) {
                let e = event ? event: window.event;

                if(options.draggable || options.resizable){
                    if(dynamic.dragFlag || dynamic.resizeFlag){
                        dynamic.moveOffset.offsetX = e.clientX - dynamic.mouseDownPosition.X;
                        dynamic.moveOffset.offsetY = e.clientY - dynamic.mouseDownPosition.Y;
                    }

                    //console.log(that.__inElement.moveOffset);

                    // 拖拽窗体部分
                    that.mouseMoveToDrag(options);

                    // 改变窗体大小部分
                    that.mouseMoveToResize(options);

                }
            });

            // 全局 - 释放鼠标
            $(document).on('mouseup', function () {
                if(options.draggable && dynamic.dragFlag){
                    dynamic.dragFlag = false;
                }
                if(options.resizable && dynamic.resizeFlag){
                    dynamic.resizeFlag = false;
                }

            });


            this.bindDrag(options);
            this.bindDirectionKeyToMove(options);
            this.bindResize(options);

            this.bindWindowMoveEvent(options);
            return this;
        },

        /**
         * @doc 计算总偏移量
         * @param options
         */
        calculateMoveOffset: function (options) {
            let origin = this.data.origin, dynamic = this.data.dynamic, calculated = this.data.calculated;
            // 记录总体偏移量
            dynamic.moveOffsetTotal.offsetX = calculated.dragWrap.left - origin.dragWrap.left;
            dynamic.moveOffsetTotal.offsetY = calculated.dragWrap.top - origin.dragWrap.top;
        },

        /**
         * @doc 窗体移动时的事件
         * @param options
         */
        bindWindowMoveEvent: function (options) {
            let that = this;
            this.__inElement.$dragWrap.on('move', function(event){
                that.calculateMoveOffset(options);
            });
            // 用户定义的窗体移动事件
            if(typeof options.onWindowMove === 'function'){
                this.__inElement.$dragWrap.on('move', this.options.onWindowMove);
            }
        },

        /**
         * @doc 绑定拖拽移动事件
         * @param options
         */
        bindDrag: function (options) {
            if(!options.draggable){
                return this;
            }
            let that = this, dynamic = this.data.dynamic;
            // 标题栏按下鼠标时，拖拽
            that.__inElement.$dragMoveBar.on('mousedown', function (event) {
                dynamic.dragFlag = true;

                let e = event ? event: window.event;

                dynamic.mouseDownPosition.X = e.clientX;
                dynamic.mouseDownPosition.Y = e.clientY;
                let targetPosition = getTargetPosition(that.__inElement.$dragWrap);
                dynamic.currentPosition.left = targetPosition.left;
                dynamic.currentPosition.top = targetPosition.top;
            });
            return this;
        },

        // 鼠标移动来拖拽
        /**
         * @doc 鼠标移动来拖拽
         * @param options
         * @returns {Draggable}
         */
        mouseMoveToDrag: function (options) {
            let dynamic = this.data.dynamic, calculated = this.data.calculated;
            if(options.draggable && dynamic.dragFlag){
                preventTextSelectable(this.__inElement.$dragWrap);
                let nowPosition = {
                        top: dynamic.currentPosition.top + dynamic.moveOffset.offsetY,
                        left: dynamic.currentPosition.left + dynamic.moveOffset.offsetX
                    };
                moveTargetPosition(this.__inElement.$dragWrap, nowPosition);
                calculated.dragWrap.top = nowPosition.top;
                calculated.dragWrap.left = nowPosition.left;
                this.__inElement.$dragWrap.trigger('move');
                this.showStatusInfo(options);
            }
            return this;
        },

        bindDirectionKeyToMove: function (options) {
            if(!options.enableDirectionKeyToMove || options.directionKeyDownToMoveOffset) return this;
            // 按键触发拖拽移动
            let keyDownToMoveOffset = 1;
            this.__inElement.$dragMoveBar.on('keydown', function(event){
                let e = event ? event: window.event;
                let dynamic = this.data.dynamic;
                // 按上下左右方向键触发拖拽
                // 上
                if(e.keyCode === 38){
                    //alert('你按下了上');
                    dynamic.moveOffset.offsetY -= keyDownToMoveOffset;
                    dynamic.dragFlag = true;
                    that.mouseMoveToDrag(options);
                }
                // 下
                if(e.keyCode === 40){
                    //alert('你按下了下');
                    dynamic.moveOffset.offsetY += keyDownToMoveOffset;
                    dynamic.dragFlag = true;
                    that.mouseMoveToDrag(options);
                }
                // 左
                if(e.keyCode === 37){
                    //alert('你按下了左');
                    dynamic.moveOffset.offsetX -= keyDownToMoveOffset;
                    dynamic.dragFlag = true;
                    that.mouseMoveToDrag(options);
                }
                // 右
                if(e.keyCode === 39){
                    //alert('你按下了右');
                    dynamic.moveOffset.offsetX += keyDownToMoveOffset;
                    dynamic.dragFlag = true;
                    that.mouseMoveToDrag(options);
                }
            });

            $(document).on('keyup', function(event){
                let e = event ? event: window.event;
                if(e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
                    dynamic.dragFlag = false;
                }
            });
        },

        /**
         * @doc 绑定拖拽调整大小事件
         * @param options
         * @returns {Draggable}
         */
        bindResize: function (options) {
            if(!options.draggable){
                return this;
            }
            let that = this, dynamic = this.data.dynamic, calculated = this.data.calculated;
            // 边框部分按下鼠标时，改变窗体大小
            that.__inElement.$dragBorder.on('mousedown', function (event) {
                dynamic.resizeFlag = true;

                let e = event ? event: window.event;
                let $target = $(e.target);

                // 判断是哪个边框被按下
                if($target.hasClass('drag-border-top')){
                    dynamic.resizeBorderPlace = 'top';
                }
                if($target.hasClass('drag-border-bottom')){
                    dynamic.resizeBorderPlace = 'bottom';
                }
                if($target.hasClass('drag-border-left')){
                    dynamic.resizeBorderPlace = 'left';
                }
                if($target.hasClass('drag-border-right')){
                    dynamic.resizeBorderPlace = 'right';
                }

                if($target.hasClass('drag-border-top-left')){
                    dynamic.resizeBorderPlace = 'top-left';
                }
                if($target.hasClass('drag-border-top-right')){
                    dynamic.resizeBorderPlace = 'top-right';
                }
                if($target.hasClass('drag-border-bottom-left')){
                    dynamic.resizeBorderPlace = 'bottom-left';
                }
                if($target.hasClass('drag-border-bottom-right')){
                    dynamic.resizeBorderPlace = 'bottom-right';
                }

                dynamic.mouseDownPosition.X = e.clientX;
                dynamic.mouseDownPosition.Y = e.clientY;
                let targetPosition = getTargetPosition(that.__inElement.$dragWrap);
                dynamic.currentPosition.left = targetPosition.left;
                dynamic.currentPosition.top = targetPosition.top;

                let dragWrapWindowOuterSize     = getTargetWindowOuterSize(that.__inElement.$dragWrap);
                let dragContentWindowOuterSize  = getTargetWindowOuterSize(that.__inElement.$dragContent);
                let contentWindowOuterSize      = getTargetWindowOuterSize(that.__inElement.$originContent);
                let dragMoveBarWindowOuterSize  = getTargetWindowOuterSize(that.__inElement.$dragMoveBar);
                let dragBorderTopOuterSize      = getTargetWindowOuterSize(that.__inElement.$dragBorderTop);
                let dragBorderLeftOuterSize     = getTargetWindowOuterSize(that.__inElement.$dragBorderLeft);
                // 拖拽整体
                calculated.dragWrap.width = dragWrapWindowOuterSize.outerWidth;
                calculated.dragWrap.height = dragWrapWindowOuterSize.outerHeight;
                // 拖拽内容外套
                calculated.dragContent.width = dragContentWindowOuterSize.outerWidth;
                calculated.dragContent.height = dragContentWindowOuterSize.outerHeight;
                // 原始内容
                calculated.originContent.width = contentWindowOuterSize.outerWidth;
                calculated.originContent.height = contentWindowOuterSize.outerHeight;
                calculated.dragMoveBar.width = dragMoveBarWindowOuterSize.outerWidth;
                // 边框的宽高
                calculated.dragBorder.verticalHeight = dragBorderLeftOuterSize.outerHeight;
                calculated.dragBorder.horizontalWidth = dragBorderTopOuterSize.outerWidth;
            });
            return that;
        },

        // 鼠标移动来改变窗体大小部分
        mouseMoveToResize: function (options) {
            let that = this, dynamic = this.data.dynamic, calculated = this.data.calculated;
            if(options.resizable && dynamic.resizeFlag){
                preventTextSelectable(that.__inElement.$dragWrap);
                let nowPosition = {};
                /*console.log('moveOffset： ');
                console.log(moveOffset);
                console.log(this.inlineData);*/
                let dragWrapNowSize = {}, dragContentNowSize = {}, contentNowSize = {},
                    dragMoveBarNowSize = {}, dragBorderVerticalNowSize = {}, dragBorderHorizontalNowSize = {};
                // 左右上下四个角拖动时
                let cornerFlag = false;
                let moveOffset = dynamic.moveOffset;
                let offsetX = moveOffset.offsetX, offsetY = moveOffset.offsetY;
                if(dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'top-right' || dynamic.resizeBorderPlace === 'bottom-left' || dynamic.resizeBorderPlace === 'bottom-right'){
                    cornerFlag = true;
                }
                // 上下边框拖动时改变高度
                if(cornerFlag || dynamic.resizeBorderPlace === 'top' || dynamic.resizeBorderPlace === 'bottom'){
                    // 鼠标向上移动时，y轴竖直方向偏移量为负值
                    if(dynamic.resizeBorderPlace === 'top' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'top-right'){
                        offsetY = 0 - offsetY;
                    }
                    dragWrapNowSize.height = calculated.dragWrap.height + offsetY;
                    dragContentNowSize.height = calculated.dragContent.height + offsetY;
                    contentNowSize.height = calculated.originContent.height + offsetY;
                    dragBorderVerticalNowSize .height = calculated.dragBorder.verticalHeight + offsetY;

                    // 当时从上方或左方拖动时才改变水平方向定位
                    if(dynamic.resizeBorderPlace === 'top' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'top-right'){
                        nowPosition.top = dynamic.currentPosition.top + moveOffset.offsetY;
                    }
                }
                // 左右边框拖动改变宽度
                if(cornerFlag || dynamic.resizeBorderPlace === 'left' || dynamic.resizeBorderPlace === 'right' || dynamic.resizeBorderPlace === 'bottom-left'){
                    // 鼠标向左移动时，x轴水平方向偏移量为负值
                    if(dynamic.resizeBorderPlace === 'left' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'bottom-left'){
                        offsetX = 0 - offsetX;
                    }
                    // 鼠标向上移动时，偏移量为负值
                    dragWrapNowSize.width = calculated.dragWrap.width + offsetX;
                    dragContentNowSize.width = calculated.dragContent.width + offsetX;
                    dragMoveBarNowSize.width = calculated.dragMoveBar.width + offsetX;
                    contentNowSize.width = calculated.originContent.width + offsetX;
                    dragBorderHorizontalNowSize.width = calculated.dragBorder.horizontalWidth + offsetX;

                    // 当时从上方或左方拖动时才改变竖直方向定位
                    if(dynamic.resizeBorderPlace === 'left' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'bottom-left'){
                        nowPosition.left = dynamic.currentPosition.left - moveOffset.offsetX;
                    }
                }

                // 更改窗体位置
                if(dynamic.resizeBorderPlace === 'top' || dynamic.resizeBorderPlace === 'left' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'top-right' || dynamic.resizeBorderPlace === 'bottom-left'){
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
            return this;
        },

        showStatusInfo: function (options) {
            if(!options.showStatusBar) return this;
            // 0. 原始position originPositionInfo
            // 1. 当前position currentPositionInfo
            // 2. 当前此次移动的偏移position moveOffsetInfo
            // 3. 累积移动的偏移position moveOffsetTotalInfo
            let $dragStatusInfo = $(this.template.dratStatusInfo);
            let dynamic = this.data.dynamic;

            let $moveOffsetInfo = '<span class="info-item move-offset-info"><span class="field">x :</span><span class="value">' + dynamic.moveOffset.offsetX
                + '<span><span class="field">y :</span><span class="value">' + dynamic.moveOffset.offsetY + '</span></span>';
            let $moveOffsetTotalInfo = '<span class="info-item move-offset-total-info"><span class="field">x :</span><span class="value">' + dynamic.moveOffsetTotal.offsetX
                + '<span><span class="field">y :</span><span class="value">' + dynamic.moveOffsetTotal.offsetY + '</span></span>';
            let windowInfo = '';
            $dragStatusInfo.append($moveOffsetInfo).append($moveOffsetTotalInfo);
            this.__inElement.$dragBorderBottom.empty().append($dragStatusInfo);
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
            // 上边及上边两个角
                .append($dragBorderTopLeft).append($dragBorderTop).append($dragBorderTopRight)
            // 侧边
                .append($dragBorderLeft).append($dragBorderRight)
            // 下边及下边两个角
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

        /**
         * @doc 计算显示相关的数值
         * @param options
         * @returns {Draggable}
         */
        calculateRenderSize: function (options) {
            // 根据配置计算得到初始化时的显示信息
            // 1. 原始内容的position
            let originContentPosition = getTargetPosition(this.__inElement.$originContent);
            let originContentWindow = getTargetWindowOuterSize(this.__inElement.$originContent);

            let origin  = this.data.origin, dynamic = this.data.dynamic;

            // [计算项] 1.【原始内容窗体的宽高】
            origin.originContent = {
                width:  originContentWindow.outerWidth,
                height: originContentWindow.outerHeight,
                top:    originContentPosition.top,
                left:   originContentPosition.left
            };
            // [计算项] 2.【拖拽的窗体内容区域的宽高】
            let dragContentWidth = origin.originContent.width + parseInt(options.dragContent.padding) * 2 + parseInt(options.dragContent.borderWidth) * 2,
                dragContentHeight = origin.originContent.height + parseInt(options.dragContent.padding) * 2 + parseInt(options.dragContent.borderWidth) * 2;

            origin.dragContent = {
                width:  dragContentWidth,
                height: dragContentHeight
            };
            // [计算项] 3.【窗体拖拽移动操作区域的宽高】
            origin.dragMoveBar = {
                width:  origin.dragContent.width,
                height: parseInt(options.dragMoveBar.height) + parseInt(options.dragMoveBar.borderTopSize) + parseInt(options.dragMoveBar.borderBottomSize)
            };
            // [计算项] 4.【拖拽改变大小的水平边框的宽度、竖直边框的高度】
            origin.dragBorder = {
                horizontalWidth:   origin.dragContent.width - parseInt(options.dragContent.borderWidth) * 2,
                verticalHeight:    origin.dragContent.width + origin.dragMoveBar.height - parseInt(options.dragContent.borderWidth) * 2,
                cornerTopLeft:     {
                    width:  parseInt(options.dragBorder.leftSize) + parseInt(options.dragContent.borderWidth),
                    height: parseInt(options.dragBorder.topSize) + parseInt(options.dragContent.borderWidth),
                },
                cornerTopRight:    {
                    width:  parseInt(options.dragBorder.rightSize) + parseInt(options.dragContent.borderWidth),
                    height: parseInt(options.dragBorder.topSize) + parseInt(options.dragContent.borderWidth),
                },
                cornerBottomLeft:  {
                    width:  parseInt(options.dragBorder.leftSize) + parseInt(options.dragContent.borderWidth),
                    height: parseInt(options.dragBorder.bottomSize) + parseInt(options.dragContent.borderWidth),
                },
                cornerBottomRight: {
                    width:  parseInt(options.dragBorder.rightSize) + parseInt(options.dragContent.borderWidth),
                    height: parseInt(options.dragBorder.topSize) + parseInt(options.dragContent.borderWidth),
                },
            };
            // 整个窗体的宽高
            origin.dragWrap = {
                width:  dragContentWidth + parseInt(options.dragBorder.leftSize) + parseInt(options.dragBorder.rightSize) + parseInt(options.dragWrap.borderSize) * 2,
                height: dragContentWidth + parseInt(options.dragBorder.topSize) + parseInt(options.dragBorder.bottomSize) + origin.dragMoveBar.height + parseInt(options.dragWrap.borderSize) * 2,
                top:    origin.originContent.top - (parseInt(options.dragContent.padding) + parseInt(options.dragContent.borderWidth) + parseInt(options.dragBorder.topSize) + parseInt(options.dragWrap.borderSize) + origin.dragMoveBar.height),
                left:   origin.originContent.top - (parseInt(options.dragContent.padding) + parseInt(options.dragContent.borderWidth) + parseInt(options.dragBorder.leftSize) + parseInt(options.dragWrap.borderSize)),
            };
            dynamic.currentPosition.top = origin.dragWrap.top;
            dynamic.currentPosition.left = origin.dragWrap.left;
            this.data.calculated = deepCopy(origin);
            this.showStatusInfo(options);
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
            dratStatusInfo:         '<div class="drag-status-info"></div>',
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
     * @doc 对象深拷贝
     * @param source
     * @returns {{}}
     */
    function deepCopy(source) {
        let result = {};
        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                result[key] = typeof source[key] === 'object' ? deepCopy(source[key]) : source[key];
            }
        }
        return result;
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



