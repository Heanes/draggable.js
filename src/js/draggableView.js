/**
 * @doc draggableView 可拖拽区域实现
 * @author Heanes
 * @time 2017-03-03 19:07:45 周五
 */

/*
  todo  0. 初始化时就判断窗体距离屏幕边缘太近时的问题，并进行处理
        1. 当边缘超出屏幕边缘时不可继续拖拽
        2. 指定可拖拽的边缘区域
        3. 拖动前的事件、拖动后的事件
        4. 鼠标拖拽时，左右侧边框移动到浏览器边缘时，自动按当前浏览器窗口分隔为一半宽度，上边框移动到顶部时最大化。贴边隐藏功能
        5. 最小化，最大化，关闭按钮，仿windows 10 windows 7 windows xp mac os风格
        6. 支持指定拖拽移动的dom，推动改dom即可拖动窗体
        7. 多个实例时，遮盖问题
        8. 双击标题栏切换最大化
*/

;(function ($, window, document, undefined) {
    "use strict";
    let pluginName = 'draggableView';
    let version = '1.0.0';

    let _default = {};
    _default.setting = {
        dragViewContainer: '<div class="drag-view-container"></div>',
    };
    _default.option = {
        title: '<h2 class="content-title">title</h2>',          // 拖拽窗体的标题

        // 窗体大小
        width: undefined,                                             // 窗体宽度
        height: undefined,                                            // 窗体高度
        minWidth: 200,                                          // 最小窗体宽度
        minHeight: 200,                                         // 最小窗体高度
        maxWidth: undefined,                                    // 最大窗体宽度，为undefined时不限制
        maxHeight: undefined,                                   // 最大窗体高度，为undefined时不限制

        top: undefined,
        left: undefined,

        // 窗体操作
        showMinMenu: true,                                      // 是否显示最小化按钮
        enableMin: true,                                        // 是否允许最小化
        showMaxMenu: true,                                      // 是否显示最小化按钮
        enableMax: true,                                        // 是否允许最大化
        showCloseMenu: true,                                    // 是否显示关闭按钮
        enableClose: true,                                      // 是否允许关闭
        showStickMenu: false,                                   // 是否显示置顶窗口按钮
        enableStick: false,                                     // 是否允许置顶窗口

        dbClickTitleBarToMax: true,                             // 双击标题栏自动最大化
        dragNearTopAutoMax: true,                               // 拖动到靠近浏览器视图顶部时自动最大化
        escKey: true,                                           // 按esc键时是否关闭当前窗口
        autoClose: false,                                       // 自动关闭窗口，boolean/number
        buttonHandlers: [],                                     // 窗口右下角按钮

        // 窗体样式
        theme: 'mac',                                           // 窗体风格
        showIcon: false,                                        // 是否显示窗体图标
        icon: '',                                               // 窗体图标
        headerMenuOrder: ['close', 'min', 'max'],
        headerMenu: {
            close:      '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-mac-close"></use></svg>',
            min:        '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-mac-min"></use></svg>',
            minRestore: '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-mac-min"></use></svg>',
            max:        '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-mac-max"></use></svg>',
            maxRestore: '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-mac-max"></use></svg>',
        },
        showStatusBar: false,                                   // 是否显示状态信息栏
        opacity: 1,                                             // 窗体透明度

        // 窗体操作的事件
        beforeClose: function(){

        },
        afterClose: function(){

        },

        beforeSetMin: function(){

        },
        afterSetMin: function(){

        },

        beforeSetMax: function(){

        },
        afterSetMax: function(){

        },

        beforeSetStick: function(){

        },
        afterSetStick: function(){

        },

        // 多标签
        enableTabs: false,                                      // 是否允许多tab

        enableDrag:      true,                                  // 是否可以拖拽移动
        dragDirection:   'all',                                 // 可以拖动的方向，x|y|all
        dragRangeOffset: {                                      // 拖动移动范围(总相对拖移量)
            top: 100,                                           // 拖拽限制顶部范围
            bottom: 100,                                        // 拖拽限制底部范围
            left: 100,                                          // 拖拽限制左侧范围
            right: 100                                          // 拖拽限制右侧范围
        },
        dragRangePosition: {                                    // 拖动移动范围(具体坐标范围)
            top: 100,                                           // 拖拽限制顶部范围
            bottom: 100,                                        // 拖拽限制底部范围
            left: 100,                                          // 拖拽限制左侧范围
            right: 100                                          // 拖拽限制右侧范围
        },

        enableDirectionKeyToMove:     true,                     // 是否允许按方向键移动窗体，仅当鼠标置于拖拽移动框位置时有效
        directionKeyDownToMoveOffset: 1,                        // 按一次方向键移动窗体时的偏移量

        enableResize:    true,                                  // 是否可以拖拽调整窗体大小
        resizeMinWidth:  150,                                   // 调整大小后的最小宽度
        resizeMinHeight: 150,                                   // 调整大小后的最小高度
        resizeMaxWidth:  500,                                   // 调整大小后的最大高度
        resizeMaxHeight: 500,                                   // 调整大小后的最大高度
        resizeRangeOffset: {                                    // 拖动调整大小的范围(总相对调整量)
            left: 100,
            right: 100,
            top: 100,
            bottom: 100
        },

        // 窗体移动时的事件
        onWindowMove:    undefined,

        // 整体样式
        dragWrap:        {
            borderWidth:  undefined,
            borderStyle:  undefined,
            borderColor:  undefined,
            boxShadow:    undefined,
            borderRadius: undefined,
        },
        // 窗体头部
        dragHeaderWrap:     {
            height:            undefined,
            padding:           undefined,
            bgColor:           undefined,
            color:             undefined,
            fontSize:          undefined
        },
        dragBorder: {
            bgColor: '',
        },
        // 显示内容的外套的配置
        dragContentWrap: {
            padding:     undefined,
            bgColor:     undefined,
            borderWidth: undefined,
        },
        dratStatusWrap: {
            height: undefined
        },
    };

    let DraggableView = function (element, options) {
        this._defaults  = this.getDefaultOption();
        this.options    = null;
        this.$element   = null;
        this._name = pluginName;
        this.version = 'v1.0.0';
        this.init(element, options);
        return {
            // Options (public access)
            options: this.options,

            // Initialize / destroy methods
            init:   $.proxy(this.init, this),
            remove: $.proxy(this.remove, this),

            // Method
            setValue: $.proxy(this.setValue, this),

            // prepare use
            test: $.proxy(this.test, this)
        };
    };

    DraggableView.V = DraggableView.VERSION = version;
    /**
     * @doc 默认选项
     * @type Object
     */
    DraggableView.DEFAULTS = _default;

    DraggableView.prototype.setValue = function () {
        console.log('setValue');
    };

    /**
     * @doc init
     * @param element
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.init = function (element, options) {
        this.$element = $(element);

        if(this.checkIsInitialized()){
            return this;
        }

        this.$el_ = this.$element.clone(true);  // 保留一份原始dom

        this.options = this.getOptions(options);
        this.inElement = {
            $originContent:         undefined,
            // 整体容器
            $dragWrap:              undefined,

            // 头部
            $dragHeaderWrap:        undefined,
            // 窗体图标
            $dragIconWrap:          undefined,
            // 标题
            $dragTitleWrap:         undefined,
            // 头部菜单
            $dragHeaderOperateWrap: undefined,
            $dragOpMenuMin:         undefined,
            $dragOpMenuMax:         undefined,
            $dragOpMenuClose:       undefined,
            $dragOpMenuPinUp:       undefined,

            // 标签分组
            $dragGroupTabsWrap:     undefined,

            // 内容容器
            $dragContentWrap:       undefined,

            // 窗体操作栏
            $dragOperateWrap:       undefined,
            $dragBorderTop:         undefined,
            $dragBorderBottom:      undefined,
            $dragBorderLeft:        undefined,
            $dragBorderRight:       undefined,
            $dragBorderTopLeft:     undefined,
            $dragBorderTopRight:    undefined,
            $dragBorderBottomLeft:  undefined,
            $dragBorderBottomRight: undefined,

            // 状态栏
            $dratStatusWrap:        undefined,
        };

        this.data = {
            id: '',
            // 原始的数据记录(重置用)，只在开始时初始化一次，将不再改变
            origin: {
                originContent: {
                    width:  0,
                    height: 0,
                    top:    0,
                    left:   0
                },
                dragWrap: {
                    width:  0,
                    height: 0,
                    left:   0,
                    top:    0
                },
                dragHeaderWrap:   {
                    width:  0,
                    height: 0,
                },
                dragContentWrap:   {
                    width:  0,
                    height: 0,
                },
            },

            // 计算后的数据，操作时动态变化
            calculated: {
                dragWrap:      {
                    width:  0,
                    height: 0,
                    left:   0,
                    top:    0
                },
            },

            // 动态变化的数据
            dynamic: {
                dragFlag:           false,
                resizeFlag:         false,
                maxFlag:            false,
                minFlag:            false,
                stickFlag:          false,
                resizeBorderPlace:  '',
                // 鼠标按下时的鼠标坐标
                mouseDownPosition:  {
                    X: 0,
                    Y: 0
                },
                // 当前窗体坐标
                currentPosition:    {
                    left: 0,
                    top:  0
                },
                // 当前一次偏移位置量
                moveOffset:         {
                    offsetX: 0,
                    offsetY: 0
                },
                // 偏移位置累积总量，向左右移动时，X轴偏移量发生改变，且向左移动X轴偏移量为负；向上下移动时，Y轴偏移量发生改变，且向上Y轴偏移量为负
                moveOffsetTotal:    {
                    offsetX: 0,
                    offsetY: 0
                },
                lastSize: {
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0
                }
            }
        };
        this.render(this.options);
        return this;
    };

    /**
     * @doc init
     * @param options
     * @returns {boolean}
     */
    DraggableView.prototype.checkIsInitialized = function (options) {
        return !!this.$element.hasClass('draggable-view-initialized');
    };

    /**
     * @doc 渲染
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.render = function (options) {

        this.buildDom(options);

        this.injectStyle(options);

        this.showStatusInfo(options);

        this.bindMouseEvent(options);

        this.bindWindowMoveEvent(options);

        this.bindKeyEvent(options);

        return this;
    };

    /**
     * @doc 绑定鼠标事件
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.bindMouseEvent = function (options) {
        let _this = this, dynamic = this.data.dynamic;
        // 窗体层级
        this.inElement.$dragWrap.on('click', function () {
            if(_this.shareData.focusId !== _this.dragUId){
                _this.updateZIndex(options);
                _this.shareData.focusId = _this.dragUId;
            }
        });

        // 全局 - 鼠标移动
        $(document).on('mousemove', function (event) {
            let e = event ? event : window.event;

            if (options.enableDrag || options.enableResize) {
                if (dynamic.dragFlag || dynamic.resizeFlag) {
                    dynamic.moveOffset.offsetX = e.clientX - dynamic.mouseDownPosition.X;
                    dynamic.moveOffset.offsetY = e.clientY - dynamic.mouseDownPosition.Y;
                }

                //console.log(_this.inElement.moveOffset);

                // 拖拽窗体部分
                _this.mouseMoveToDrag(options);

                // 改变窗体大小部分
                _this.mouseMoveToResize(options);

            }
        });

        // 全局 - 释放鼠标
        $(document).on('mouseup', function () {
            if (options.enableDrag && dynamic.dragFlag) {
                dynamic.dragFlag = false;
            }
            if (options.enableResize && dynamic.resizeFlag) {
                dynamic.resizeFlag = false;
            }

            // 恢复窗体可选中
            recoverTextSelectable(_this.inElement.$dragWrap);
        });

        this.bindDrag(options);
        this.bindResize(options);

        this.bindMenuOperate(options);

        return this;
    };

    /**
     * @doc 窗体操作菜单
     * @param options
     * @author Heanes
     * @time 2018-09-14 16:29:34 周五
     */
    DraggableView.prototype.bindMenuOperate = function (options) {
        let _this = this;
        let dynamic = _this.data.dynamic;
        // 是否允许关闭
        if (options.enableClose) {
            this.inElement.$dragOpMenuClose.on('click', function () {
                _this.inElement.$dragWrap.remove();
            });
        }

        // 是否允许最小化
        if (options.enableMin) {
            this.inElement.$dragOpMenuMin.on('click', function () {
                if(dynamic.minFlag){
                    _this.restoreLastSize(options);
                }else{
                    _this.setMinSize(options);
                }
            });
        }

        // 是否允许最大化
        if (options.enableMax) {
            this.inElement.$dragOpMenuMax.on('click', function () {
                if(dynamic.maxFlag){
                    _this.restoreLastSize(options);
                }else{
                    _this.setMaxSize(options);
                }
            });
        }

        // 窗体头部双击最大化
        this.inElement.$dragHeaderWrap.dblclick(function () {
            if(dynamic.maxFlag){
                _this.restoreLastSize(options);
            }else{
                _this.setMaxSize(options);
            }
        });

        return this;
    };

    /**
     * @doc 设置为最大化窗口
     * @param options
     * @author Heanes
     * @time 2018-09-16 22:34:56 周日
     */
    DraggableView.prototype.setMaxSize = function (options) {
        options = options || this.getOptions();
        let dynamic = this.data.dynamic;

        let $window = $(window);
        let viewSize = {
            width: $window.width(),
            height: $window.height()
        };
        if(!dynamic.minFlag){
            dynamic.lastSize = this.getElementPosition(this.inElement.$dragWrap);
        }

        this.inElement.$dragWrap
            .removeClass('drag-min-size')
            .addClass('drag-max-size')
            .css({
                top:    0,
                left:   0,
                width:  viewSize.width,
                height: viewSize.height,
            });

        this.inElement.$dragOpMenuMax.empty().append(options.headerMenu['maxRestore']);

        // 直接从最小化状态变为最大化时
        if(dynamic.minFlag){
            this.inElement.$dragOpMenuMin.empty().append(options.headerMenu['min']);
        }

        dynamic.minFlag = false;
        dynamic.maxFlag = true;
    };

    /**
     * @doc 设置为最小化窗口
     * @param options
     * @author Heanes
     * @time 2018-09-19 22:33:34 周三
     */
    DraggableView.prototype.setMinSize = function (options) {
        options = options || this.getOptions();
        let dynamic = this.data.dynamic;

        if(!dynamic.maxFlag){
            dynamic.lastSize = this.getElementPosition(this.inElement.$dragWrap);
        }

        this.inElement.$dragWrap
            .removeClass('drag-max-size')
            .addClass('drag-min-size')
            .css({
                top:    'unset',
                bottom: '10px',
                left:   '10px',
                width:  '200px',
                height: this.data.calculated.dragHeaderWrap.height + 2,
            });
        this.inElement.$dragOpMenuMin.empty().append(options.headerMenu['minRestore']);
        this.shareData.minList.push(this.dragUId);

        // 直接从最大化状态变为最小化时
        if(dynamic.maxFlag){
            this.inElement.$dragOpMenuMax.empty().append(options.headerMenu['max']);
        }

        dynamic.maxFlag = false;
        dynamic.minFlag = true;
    };

    /**
     * @doc 恢复为上次窗口大小
     * @param options
     * @author Heanes
     * @time 2018-09-16 22:34:56 周日
     */
    DraggableView.prototype.restoreLastSize = function (options) {
        let dynamic = this.data.dynamic;
        this.inElement.$dragWrap.css({
            top: dynamic.lastSize.top,
            left: dynamic.lastSize.left,
            width: dynamic.lastSize.width,
            height: dynamic.lastSize.height,
        })
            .removeClass('drag-min-size')
            .removeClass('drag-max-size');

        this.inElement.$dragOpMenuMin.empty().append(options.headerMenu['min']);
        this.inElement.$dragOpMenuMax.empty().append(options.headerMenu['max']);

        dynamic.maxFlag = false;
        dynamic.minFlag = false;
    };

    /**
     * @doc 检查是否还能拖拽移动
     * @param options
     * @author Heanes
     * @time 2018-09-11 18:25:28 周二
     */
    DraggableView.prototype.checkCanDrag = function (options) {
        // 配置项是否允许拖拽
        if (!options.enableDrag) {
            return false;
        }

        // 限制拖拽的范围
    };

    /**
     * @doc 检查是否还能拖拽调整窗体大小
     * @param options
     * @author Heanes
     * @time 2018-09-11 18:25:28 周二
     */
    DraggableView.prototype.checkCanResize = function (options) {
        // 配置项是否允许拖拽
        if (!options.enableResize) {
            return false;
        }

        // 限制拖拽调整大小的范围
    };

    /**
     * @doc 计算总偏移量
     * @param options
     */
    DraggableView.prototype.calculateMoveOffset = function (options) {
        let origin = this.data.origin, dynamic = this.data.dynamic, calculated = this.data.calculated;
        // 记录总体偏移量
        dynamic.moveOffsetTotal.offsetX = calculated.dragWrap.left - origin.dragWrap.left;
        dynamic.moveOffsetTotal.offsetY = calculated.dragWrap.top - origin.dragWrap.top;
    };

    /**
     * @doc 窗体移动时的事件
     * @param options
     */
    DraggableView.prototype.bindWindowMoveEvent = function (options) {
        let _this = this;
        this.inElement.$dragWrap.on('move', function (event) {
            _this.calculateMoveOffset(options);
        });
        // 用户定义的窗体移动事件
        if (typeof options.onWindowMove === 'function') {
            this.inElement.$dragWrap.on('move', this.options.onWindowMove);
        }
    };

    /**
     * @doc 绑定拖拽移动事件
     * @param options
     */
    DraggableView.prototype.bindDrag = function (options) {
        if (!options.enableDrag) {
            return this;
        }
        let _this = this, dynamic = this.data.dynamic;
        // 标题栏按下鼠标时，拖拽
        _this.inElement.$dragHeaderWrap.on('mousedown', function (event) {
            dynamic.dragFlag = true;

            let e = event ? event : window.event;

            dynamic.mouseDownPosition.X = e.clientX;
            dynamic.mouseDownPosition.Y = e.clientY;
            let targetPosition = getElementPosition(_this.inElement.$dragWrap);
            dynamic.currentPosition.left = targetPosition.left;
            dynamic.currentPosition.top = targetPosition.top;
        });
        return this;
    };

    // 鼠标移动来拖拽
    /**
     * @doc 鼠标移动来拖拽
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.mouseMoveToDrag = function (options) {
        let dynamic = this.data.dynamic, calculated = this.data.calculated;
        if (options.enableDrag && dynamic.dragFlag) {
            preventTextSelectable(this.inElement.$dragWrap);
            // 可以拖动的方向
            if (options.dragDirection.toLowerCase() === 'y') {
                dynamic.moveOffset.offsetY = 0;
            }
            if (options.dragDirection.toLowerCase() === 'x') {
                dynamic.moveOffset.offsetX = 0;
            }
            let nowPosition = {
                top:  dynamic.currentPosition.top + dynamic.moveOffset.offsetY,
                left: dynamic.currentPosition.left + dynamic.moveOffset.offsetX
            };

            // 窗体移动到屏幕顶端区域，自动最大化，再次拖移到离开顶部区域，自动恢复原来大小
            if(nowPosition.top < 3 && !dynamic.maxFlag){
                this.setMaxSize(options);
                nowPosition.top = 0;
                nowPosition.left = 0;
            }
            if(nowPosition.top > 3 && dynamic.maxFlag){
                this.restoreLastSize(options);
            }

            nowPosition.top < 0 ? nowPosition.top = 0 : null;
            dynamic.maxFlag ? nowPosition.left = 0 : null;
            moveTargetPosition(this.inElement.$dragWrap, nowPosition);
            calculated.dragWrap.top = nowPosition.top;
            calculated.dragWrap.left = nowPosition.left;
            this.inElement.$dragWrap.trigger('move');
            this.showStatusInfo(options);
        }
        return this;
    };

    /**
     * @doc 绑定按键事件
     * @param options
     */
    DraggableView.prototype.bindKeyEvent = function (options) {
        this.bindDirectionKeyToMove(options);
        return this;
    };

    /**
     * @doc 按键来移动窗体
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.bindDirectionKeyToMove = function (options) {
        if (!options.enableDirectionKeyToMove || options.directionKeyDownToMoveOffset <= 0) return this;
        // 按键触发拖拽移动
        let _this = this, dynamic = this.data.dynamic;
        $(document).on('keydown', function (event) {
            let e = event ? event : window.event;
            // 按上下左右方向键触发拖拽
            // 上
            if (e.keyCode === 38) {
                //alert('你按下了上');
                dynamic.dragFlag = true;
                dynamic.moveOffset.offsetY = -options.directionKeyDownToMoveOffset;
                dynamic.moveOffset.offsetX = 0;
                _this.mouseMoveToDrag(options);
            }
            // 下
            if (e.keyCode === 40) {
                //alert('你按下了下');
                dynamic.moveOffset.offsetY = options.directionKeyDownToMoveOffset;
                dynamic.moveOffset.offsetX = 0;
                dynamic.dragFlag = true;
                _this.mouseMoveToDrag(options);
            }
            // 左
            if (e.keyCode === 37) {
                //alert('你按下了左');
                dynamic.dragFlag = true;
                dynamic.moveOffset.offsetX = -options.directionKeyDownToMoveOffset;
                dynamic.moveOffset.offsetY = 0;
                _this.mouseMoveToDrag(options);
            }
            // 右
            if (e.keyCode === 39) {
                //alert('你按下了右');
                dynamic.dragFlag = true;
                dynamic.moveOffset.offsetX = options.directionKeyDownToMoveOffset;
                dynamic.moveOffset.offsetY = 0;
                _this.mouseMoveToDrag(options);
            }
            let targetPosition = getElementPosition(_this.inElement.$dragWrap);
            dynamic.currentPosition.left = targetPosition.left;
            dynamic.currentPosition.top = targetPosition.top;
        });

        $(document).on('keyup', function (event) {
            let e = event ? event : window.event;
            if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
                dynamic.dragFlag = false;
            }
        });

        return this;
    };

    /**
     * @doc 绑定拖拽调整大小事件
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.bindResize = function (options) {
        if (!options.enableResize) {
            return this;
        }
        let _this = this, dynamic = this.data.dynamic, calculated = this.data.calculated;
        // 边框部分按下鼠标时，改变窗体大小
        _this.inElement.$dragBorder.on('mousedown', function (event) {
            dynamic.resizeFlag = true;

            let e = event ? event : window.event;
            let $target = $(e.target);

            // 判断是哪个边框被按下
            if ($target.hasClass('drag-border-top')) {
                dynamic.resizeBorderPlace = 'top';
            }
            if ($target.hasClass('drag-border-bottom')) {
                dynamic.resizeBorderPlace = 'bottom';
            }
            if ($target.hasClass('drag-border-left')) {
                dynamic.resizeBorderPlace = 'left';
            }
            if ($target.hasClass('drag-border-right')) {
                dynamic.resizeBorderPlace = 'right';
            }

            if ($target.hasClass('drag-border-top-left')) {
                dynamic.resizeBorderPlace = 'top-left';
            }
            if ($target.hasClass('drag-border-top-right')) {
                dynamic.resizeBorderPlace = 'top-right';
            }
            if ($target.hasClass('drag-border-bottom-left')) {
                dynamic.resizeBorderPlace = 'bottom-left';
            }
            if ($target.hasClass('drag-border-bottom-right')) {
                dynamic.resizeBorderPlace = 'bottom-right';
            }

            dynamic.mouseDownPosition.X = e.clientX;
            dynamic.mouseDownPosition.Y = e.clientY;
            let targetPosition = getElementPosition(_this.inElement.$dragWrap);
            dynamic.currentPosition.left = targetPosition.left;
            dynamic.currentPosition.top = targetPosition.top;

            let dragWrapWindowOuterSize = getTargetWindowOuterSize(_this.inElement.$dragWrap);
            // 拖拽整体
            calculated.dragWrap.width = dragWrapWindowOuterSize.outerWidth;
            calculated.dragWrap.height = dragWrapWindowOuterSize.outerHeight;
        });
        return _this;
    };

    /**
     * @doc 鼠标移动来改变窗体大小部分
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.mouseMoveToResize = function (options) {
        let _this = this, dynamic = this.data.dynamic, calculated = this.data.calculated;
        if (options.enableResize && dynamic.resizeFlag) {
            preventTextSelectable(_this.inElement.$dragWrap);
            let nowPosition = {};
            /*console.log('moveOffset： ');
            console.log(moveOffset);
            console.log(this.inlineData);*/
            let dragWrapNowSize = {}, dragContentWrapNowSize = {}, contentNowSize = {},
                dragMoveBarNowSize = {}, dragBorderVerticalNowSize = {}, dragBorderHorizontalNowSize = {};
            // 左右上下四个角拖动时
            let cornerFlag = false;
            let moveOffset = dynamic.moveOffset;
            let offsetX = moveOffset.offsetX, offsetY = moveOffset.offsetY;
            if (dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'top-right' || dynamic.resizeBorderPlace === 'bottom-left' || dynamic.resizeBorderPlace === 'bottom-right') {
                cornerFlag = true;
            }
            // 上下边框拖动时改变高度
            if (cornerFlag || dynamic.resizeBorderPlace === 'top' || dynamic.resizeBorderPlace === 'bottom') {
                // 鼠标向上移动时，y轴竖直方向偏移量为负值
                if (dynamic.resizeBorderPlace === 'top' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'top-right') {
                    offsetY = 0 - offsetY;
                }
                dragWrapNowSize.height = calculated.dragWrap.height + offsetY;

                // 当时从上方或左方拖动时才改变水平方向定位
                if (dynamic.resizeBorderPlace === 'top' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'top-right') {
                    nowPosition.top = dynamic.currentPosition.top + moveOffset.offsetY;
                }
            }
            // 左右边框拖动改变宽度
            if (cornerFlag || dynamic.resizeBorderPlace === 'left' || dynamic.resizeBorderPlace === 'right' || dynamic.resizeBorderPlace === 'bottom-left') {
                // 鼠标向左移动时，x轴水平方向偏移量为负值
                if (dynamic.resizeBorderPlace === 'left' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'bottom-left') {
                    offsetX = 0 - offsetX;
                }
                // 鼠标向上移动时，偏移量为负值
                dragWrapNowSize.width = calculated.dragWrap.width + offsetX;

                // 当时从上方或左方拖动时才改变竖直方向定位
                if (dynamic.resizeBorderPlace === 'left' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'bottom-left') {
                    nowPosition.left = dynamic.currentPosition.left + moveOffset.offsetX;
                }
            }

            // 四个角拖拽时，会更改窗体位置
            if (dynamic.resizeBorderPlace === 'top' || dynamic.resizeBorderPlace === 'left' || dynamic.resizeBorderPlace === 'top-left' || dynamic.resizeBorderPlace === 'top-right' || dynamic.resizeBorderPlace === 'bottom-left') {
                moveTargetPosition(_this.inElement.$dragWrap, nowPosition);
            }

            // 改变窗体大小
            changeTargetWindowSize(_this.inElement.$dragWrap, dragWrapNowSize);

            this.showStatusInfo(options);

        }
        return this;
    };

    DraggableView.prototype.calculateOriginSize = function (options) {
        let origin = this.data.origin, dynamic = this.data.dynamic;

        // 1. 原始内容的position
        let originContentPosition = getElementPosition(this.$element);
        let originContentWindow = getTargetWindowOuterSize(this.$element);

        // [计算项] 1.【原始内容窗体的宽高】
        origin.originContent = {
            width:  originContentWindow.outerWidth,
            height: originContentWindow.outerHeight,
            top:    originContentPosition.top,
            left:   originContentPosition.left
        };
    };

    /**
     * @doc 计算显示相关的数值
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.calculateRenderSize = function (options) {
        // 根据配置计算得到初始化时的显示信息
        let origin = this.data.origin, dynamic = this.data.dynamic;

        console.log(origin.originContent);


        // [计算项] 2.【窗体内容区域的宽高】
        let dragContentWrapWidth = origin.originContent.width,// + parseInt(options.dragContentWrap.padding) * 2 + parseInt(options.dragContentWrap.borderWidth) * 2,
            dragContentWrapHeight = origin.originContent.height;// + parseInt(options.dragContentWrap.padding) * 2 + parseInt(options.dragContentWrap.borderWidth) * 2;

        origin.dragContentWrap = {
            width:  dragContentWrapWidth,
            height: dragContentWrapHeight
        };
        // [计算项] 3.【窗体头部操作区域的宽高】
        origin.dragHeaderWrap = {
            width:  origin.dragContentWrap.width,
            height: parseInt(options.dragHeaderWrap.height ? options.dragHeaderWrap.height : getTargetWindowOuterSize(this.inElement.$dragHeaderWrap).outerHeight)
        };

        // [计算想] 4. 【状态栏的宽高】
        origin.dratStatusWrap = {
            width:  dragContentWrapWidth,
            height: parseInt(options.dratStatusWrap.height ? options.dratStatusWrap.height : getTargetWindowOuterSize(this.inElement.$dratStatusWrap).outerHeight)
        };

        // 整个窗体的宽高
        origin.dragWrap = {
            width:  options.width ? options.width : origin.dragContentWrap.width,
            height: options.height ? options.height : origin.dragContentWrap.height,
            top:    origin.originContent.top,
            left:   origin.originContent.left
        };
        dynamic.currentPosition.top = origin.dragWrap.top;
        dynamic.currentPosition.left = origin.dragWrap.left;
        this.data.calculated = deepCopy(origin);

        return this;
    };

    /**
     * @doc 构建dom
     * @param options
     */
    DraggableView.prototype.buildDom = function (options) {
        this.calculateOriginSize(options);
        let $dragWrap               = $(this.template.dragWrap),

            $dragHeaderWrap         = $(this.template.dragHeaderWrap),

            $dragIconWrap           = $(this.template.dragIconWrap),

            $dragTitleWrap          = $(this.template.dragTitleWrap),

            $dragHeaderOperateWrap  = $(this.template.dragHeaderOperateWrap),
            $dragOpMenuMin          = $(this.template.dragOpMenuMin),
            $dragOpMenuMax          = $(this.template.dragOpMenuMax),
            $dragOpMenuClose        = $(this.template.dragOpMenuClose),

            $dragGroupTabsWrap      = $(this.template.dragGroupTabsWrap),
            $dragContentWrap        = $(this.template.dragContentWrap),

            $dragOperateWrap        = $(this.template.dragOperateWrap),
            $dragBorderTop          = $(this.template.dragBorderTop),
            $dragBorderBottom       = $(this.template.dragBorderBottom),
            $dragBorderLeft         = $(this.template.dragBorderLeft),
            $dragBorderRight        = $(this.template.dragBorderRight),
            $dragBorderTopLeft      = $(this.template.dragBorderTopLeft),
            $dragBorderTopRight     = $(this.template.dragBorderTopRight),
            $dragBorderBottomLeft   = $(this.template.dragBorderBottomLeft),
            $dragBorderBottomRight  = $(this.template.dragBorderBottomRight),

            $dratStatusWrap         = $(this.template.dratStatusWrap),
            $dragStatusInfo         = $(this.template.dratStatusBar);

        // 头部窗体按钮
        $.each(options.headerMenuOrder, function (i, item) {
            if(item.toLowerCase() === 'close'){
                if(options.showCloseMenu)   $dragHeaderOperateWrap.append($dragOpMenuClose.append(options.headerMenu['close']));
            }
            if(item.toLowerCase() === 'min'){
                if(options.showMinMenu)     $dragHeaderOperateWrap.append($dragOpMenuMin.append(options.headerMenu['min']));
            }
            if(item.toLowerCase() === 'max'){
                if(options.showMaxMenu)     $dragHeaderOperateWrap.append($dragOpMenuMax.append(options.headerMenu['max']));
            }
        });

        // 头部窗体图标
        if(options.showIcon){
            $dragHeaderWrap.append($dragIconWrap.append(this.options.icon));
        }

        $dragHeaderWrap.append($dragTitleWrap.append(this.options.title));

        $dragHeaderWrap.append($dragHeaderOperateWrap);

        $dragOperateWrap.append($dragHeaderWrap)
            // 上边及上边两个角
            .append($dragBorderTopLeft).append($dragBorderTop).append($dragBorderTopRight)
            // 侧边
            .append($dragBorderLeft).append($dragBorderRight)
            // 下边及下边两个角
            .append($dragBorderBottomLeft).append($dragBorderBottom).append($dragBorderBottomRight);

        /*
        this.$element.wrap($dragContentWrap);
        this.$element.addClass('draggable-view-initialized').addClass('draggable-view-content');
        
        $dragContentWrap = this.$element.parent();
        $dragContentWrap.wrap($dragWrap);

        $dragWrap = $dragContentWrap.parent();*/

        // 原dom处做一个标记
        this.data.id = this.dragUId = this.getUID(pluginName) + '';
        this.$element.after('<div class="drag-view-place" id="dragPlace' + this.data._id + '" style="display:none"></div>');
        $dragWrap.attr('id', this.dragUId);

        // 加载到指定容器或者body中去
        let $dragViewContainer = this.shareData.$dragViewContainer = this.shareData.$dragViewContainer || $(_default.setting.dragViewContainer);
        $('body').append($dragViewContainer);
        $dragViewContainer.append($dragWrap);

        $dragContentWrap.append(this.$element);

        $dragWrap.prepend($dragHeaderWrap);
        $dragWrap.append($dragContentWrap);
        $dragWrap.append($dragOperateWrap);

        if(options.showStatusBar){
            $dragWrap.append($dratStatusWrap
                .append($dragStatusInfo)
            );
        }

        this.inElement.$dragWrap                = $dragWrap;
        this.inElement.$originContent           = this.$element;

        this.inElement.$dragHeaderWrap          = $dragHeaderWrap;
        this.inElement.$dragIconWrap            = $dragIconWrap;
        this.inElement.$dragTitleWrap           = $dragTitleWrap;
        this.inElement.$dragHeaderOperateWrap   = $dragHeaderOperateWrap;
        this.inElement.$dragOpMenuMin           = $dragOpMenuMin;
        this.inElement.$dragOpMenuMax           = $dragOpMenuMax;
        this.inElement.$dragOpMenuClose         = $dragOpMenuClose;

        this.inElement.$dragGroupTabsWrap       = $dragGroupTabsWrap;
        this.inElement.$dragContentWrap         = $dragContentWrap;

        this.inElement.$dragOperateWrap         = $dragOperateWrap;
        this.inElement.$dragBorder              = this.inElement.$dragWrap.find('.drag-border');
        this.inElement.$dragBorderTop           = $dragBorderTop;
        this.inElement.$dragBorderBottom        = $dragBorderBottom;
        this.inElement.$dragBorderLeft          = $dragBorderLeft;
        this.inElement.$dragBorderRight         = $dragBorderRight;
        this.inElement.$dragBorderTopLeft       = $dragBorderTopLeft;
        this.inElement.$dragBorderTopRight      = $dragBorderTopRight;
        this.inElement.$dragBorderBottomLeft    = $dragBorderBottomLeft;
        this.inElement.$dragBorderBottomRight   = $dragBorderBottomRight;

        this.inElement.$dratStatusWrap          = $dratStatusWrap;
        this.inElement.$dragStatusInfo          = $dragStatusInfo;

        this.inElement.$dragWrap.addClass(options.theme);

        this.initZIndex(options);

        this.calculateRenderSize(options);

        // 记录所有已加载的窗体
        this.shareData.dragViewList[this.dragUId] = this;
        this.shareData.focusId = this.shareData.focusId && this.shareData.stickId !== this.shareData.focusId
            ? this.shareData.stickId : this.dragUId;

        this.$dragWrap = this.inElement.$dragWrap;
        return this;

    };

    /**
     * @doc 设置z-index值
     * @param options
     * @author Heanes
     * @time 2018-09-26 19:49:29 周三
     */
    DraggableView.prototype.initZIndex = function (options) {
        // 如果有钉住的窗体，则将钉住的窗体的z-index值增加2，新构建的窗体z-index值为原先钉住窗体的z-index值
        // 如果已有共享的maxZIndex，则新生成的窗体需要在此基础上加2
        let shareData = this.shareData;
        if(shareData.stickId){
            this.data.zIndex = shareData.maxZIndex;
            shareData.maxZIndex += 2;
            shareData.dragViewList[shareData.stickId].css('z-index', shareData.maxZIndex);
        }else{
            if(shareData.maxZIndex){
                shareData.maxZIndex += 2;
                this.data.zIndex = shareData.maxZIndex;
            }else{
                this.data.zIndex = shareData.maxZIndex = parseInt(this.inElement.$dragWrap.css('z-index'));
            }
        }
        this.inElement.$dragWrap.css('z-index', this.data.zIndex);
    };

    /**
     * @doc 注入样式
     * @param options
     */
    DraggableView.prototype.injectStyle = function (options) {
        let origin = this.data.origin, dynamic = this.data.dynamic;
        // 添加样式
        // $originContent
        this.inElement.$originContent.css({
            'left':     'unset',
            'top':      'unset'
        });
        // $dragContentWrap
        this.inElement.$dragContentWrap.css({
            'border':           options.dragContentWrap.borderWidth + ' ' + options.dragContentWrap.borderStyle + ' ' + options.dragContentWrap.borderColor,
            'padding':          options.dragContentWrap.padding,
            'background-color': options.dragContentWrap.bgColor
        });

        // $dragHeaderWrap
        this.inElement.$dragHeaderWrap.css({
            'height':           options.dragHeaderWrap.height,
            'color':            options.dragHeaderWrap.color,
            'background-color': options.dragHeaderWrap.bgColor
        });
        this.inElement.$dragBorder.css({
            'background-color': options.dragBorder.bgColor
        });

        // $dragWrap
        this.inElement.$dragWrap.css({
            left:               origin.dragWrap.left + 'px',
            top:                origin.dragWrap.top + 'px',
            width:              origin.dragWrap.width + 'px',
            height:             origin.dragWrap.height + 'px',
            border:             options.dragWrap.borderWidth + ' ' + options.dragWrap.borderStyle + ' ' + options.dragWrap.borderColor,
            'border-radius':    options.dragWrap.borderRadius,
            'box-shadow':       options.dragWrap.boxShadow,
            'opacity':          options.opacity
        });

        let $divs = this.inElement.$dragWrap.find('div');
        $divs.eq(0).css({
            'border-top-left-radius': options.dragWrap.borderRadius,
            'border-top-right-radius': options.dragWrap.borderRadius
        });
        $divs.eq($divs.length - 1).css({
            'border-top-left-radius': options.dragWrap.borderRadius,
            'border-top-right-radius': options.dragWrap.borderRadius
        });
    };

    /**
     * @doc 更新z-index值
     * @param options
     * @author Heanes
     * @time 2018-09-26 19:49:29 周三
     */
    DraggableView.prototype.updateZIndex = function (options) {
        let shareData = this.shareData;
        let dragViewList = shareData.dragViewList;
        // 更新当前页面所有z-index大于当前窗体z-index值的窗体的值
        // 当前窗体更新为最大值，大于当前窗体z-index值的窗体的值的窗体每个都减小2
        if(this.shareData.focusId !== this.dragUId){
            for(let i in dragViewList) {
                if (dragViewList.hasOwnProperty(i)) {
                    let $dragView = dragViewList[i];
                    if(i !== this.dragUId){
                        let zIndexTemp = parseInt($dragView.$dragWrap.css('z-index'));
                        if(zIndexTemp > this.data.zIndex){
                            $dragView.data.zIndex = zIndexTemp - 2;
                            $dragView.$dragWrap.css('z-index', $dragView.data.zIndex);
                        }
                    }
                }
            }
            this.data.zIndex = shareData.maxZIndex;
        }
        this.inElement.$dragWrap.css('z-index', this.data.zIndex);
    };

    /**
     * @doc 置顶窗口
     * @desc 置顶策略： 1. 只允许1个窗口处于置顶状态
     * @param options
     * @author Heanes
     * @time 2018-09-30 11:50:59 周日
     */
    DraggableView.prototype.setStick = function (options) {
        let shareData = this.shareData;
        let dragViewList = shareData.dragViewList;
        // 置顶策略
        // 更新当前页面所有z-index大于当前窗体z-index值的窗体的值
        // 当前窗体更新为最大值，大于当前窗体z-index值的窗体的值的窗体每个都减小2
        for (let i = 0, length = dragViewList.length; i < length; i++){
            ;
        }
    };

    /**
     * @doc 保存页面的共享数据
     * @param options
     * @returns {boolean}
     */
    DraggableView.prototype.shareData = {
        $dragViewContainer: undefined,  // 放置所有窗体的容器
        focusId: undefined,             // 当前激活的窗体
        stickId: undefined,             // 置顶的窗体
        maxZIndex: undefined,           // 当前所有窗体的最大z-index
        minList: [],                    // 最小化窗体列表
        dragViewList: {}                // 所有DraggableView对象
    };

    /**
     * @doc 获取随机唯一id
     * @param prefix
     * @returns {*}
     */
    DraggableView.prototype.getUID = function (prefix) {
        this.data._id = 0;
        do prefix += (this.data._id = ~~(Math.random() * 1000000));
        while (document.getElementById(prefix));
        return prefix;
    };

    /**
     * @doc 显示状态栏信息
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.showStatusInfo = function (options) {
        if (!options.showStatusBar) return this;
        // 0. 原始position originPositionInfo
        // 1. 当前position currentPositionInfo
        // 2. 当前此次移动的偏移position moveOffsetInfo
        // 3. 累积移动的偏移position moveOffsetTotalInfo
        let $dragStatusInfo = this.inElement.$dragStatusInfo;
        let dynamic = this.data.dynamic;
        let calculated = this.data.calculated;

        let $moveOffsetInfo = '<span class="info-item move-offset-info"><span class="field">x :</span><span class="value">' + dynamic.moveOffset.offsetX
            + '<span><span class="field">y :</span><span class="value">' + dynamic.moveOffset.offsetY + '</span></span>';
        let $moveOffsetTotalInfo = '<span class="info-item move-offset-total-info"><span class="field">x :</span><span class="value">' + calculated.dragWrap.top
            + '<span><span class="field">y :</span><span class="value">' + calculated.dragWrap.left + '</span></span>';
        $dragStatusInfo.empty().append($moveOffsetInfo).append($moveOffsetTotalInfo);
    };

    /**
     * @doc 获取元素位置
     * @param $element
     * @returns {*}
     */
    DraggableView.prototype.getElementPosition = function ($element) {
        $element = $element || this.$element;
        var el     = $element[0];

        var isBody = el.tagName.toUpperCase() === 'BODY';

        var elRect    = el.getBoundingClientRect();
        if (elRect.width == null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
        }
        var isSvg = window.SVGElement && el instanceof window.SVGElement;
        // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
        // See https://github.com/twbs/bootstrap/issues/20280
        var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset());
        var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() };
        var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null;

        return $.extend({}, elRect, scroll, outerDims, elOffset)
    };

    /**
     * @doc 模版
     */
    DraggableView.prototype.template = {
        // 整体容器
        dragWrap:               '<div class="drag-wrap">',

        // 头部
        dragHeaderWrap:         '<div class="drag-header-wrap"></div>',
        // 窗体图标
        dragIconWrap:           '<div class="drag-icon-wrap"></div>',
        // 标题
        dragTitleWrap:          '<div class="drag-title-wrap"></div>',
        // 头部菜单
        dragHeaderOperateWrap:  '<div class="drag-header-operate-wrap"></div>',
        dragOpMenuMin:          '<div class="drag-op-btn drag-op-menu-min"></div>',   // 最小化
        dragOpMenuMax:          '<div class="drag-op-btn drag-op-menu-max"></div>',   // 最大化
        dragOpMenuClose:        '<div class="drag-op-btn drag-op-menu-close"></div>', // 关闭窗体
        dragOpMenuPinUp:        '<div class="drag-op-btn drag-op-menu-pin-up"></div>',// 关闭窗体

        // 标签分组
        dragGroupTabsWrap:      '<div class="drag-group-tabs-wrap"></div>',

        // 内容容器
        dragContentWrap:        '<div class="drag-content-wrap">',

        // 窗体操作栏
        dragOperateWrap:        '<div class="drag-operate-wrap"></div>',
        dragBorderTop:          '<div class="drag-border drag-border-top"></div>',          // 顶部栏
        dragBorderBottom:       '<div class="drag-border drag-border-bottom"></div>',       // 底部栏
        dragBorderLeft:         '<div class="drag-border drag-border-left"></div>',         // 左侧栏
        dragBorderRight:        '<div class="drag-border drag-border-right"></div>',        // 右侧栏
        dragBorderTopLeft:      '<div class="drag-border drag-border-top-left"></div>',
        dragBorderTopRight:     '<div class="drag-border drag-border-top-right"></div>',
        dragBorderBottomLeft:   '<div class="drag-border drag-border-bottom-left"></div>',
        dragBorderBottomRight:  '<div class="drag-border drag-border-bottom-right"></div>',

        // 状态栏
        dratStatusWrap:         '<div class="drag-status-wrap"></div>',
        dratStatusBar:          '<div class="drag-status-bar"></div>',
    };

    /**
     * @doc 获取options
     * @param options
     * @returns {void | {}}
     */
    DraggableView.prototype.getOptions = function (options) {
        return this.handleToStandardOption(options);
    };

    /**
     * @doc 处理为合法的标准option
     * @param options
     * @returns {void | {}}
     */
    DraggableView.prototype.handleToStandardOption = function (options) {
        let defaultOption = this.getDefaultOption().option;
        options = $.extend({}, defaultOption, this.$element.data(), options);
        return options;
    };

    /**
     * @doc 刷新option
     * @param options
     * @returns {DraggableView}
     */
    DraggableView.prototype.refreshOption = function (options) {
        this.options = $.extend(true, {}, this.options, options);
        this.getOptions(this.options);

        this.destroy();
        this.init();
        return this;
    };

    /**
     * @doc 销毁插件功能
     * @returns {DraggableView}
     */
    DraggableView.prototype.destroy = function () {
        this.$element.html(this.$el_.html());
        return this;
    };

    /**
     * @doc 获取默认选项
     * @returns Object
     */
    DraggableView.prototype.getDefaultOption = function () {
        return DraggableView.DEFAULTS;
    };

    /**
     * @doc 将目标窗体宽高该表至指定大小
     * @param $target
     * @param size
     */
    function changeTargetWindowSize($target, size) {
        if (size) {
            if (size.width) {
                $target.css({width: size.width});
            }
            if (size.height) {
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
    function moveTargetPosition($target, position) {
        /*if (position.top || position.left) {
            $target.css({
                position: 'fixed',
            });
        }*/
        if (position.top) {
            $target.css({
                top: position.top + 'px',
            });
        }
        if (position.left) {
            $target.css({
                left: position.left + 'px'
            });
        }
    }

    /**
     * @doc 获取元素的定位值
     * @param $element
     * @returns {{top: number, left: number}}
     */
    function getElementPosition($element) {
        var el     = $element[0];

        var isBody = el.tagName.toUpperCase() === 'BODY';

        var elRect    = el.getBoundingClientRect();
        if (elRect.width == null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
        }
        var isSvg = window.SVGElement && el instanceof window.SVGElement;
        // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
        // See https://github.com/twbs/bootstrap/issues/20280
        var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset());
        var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() };
        var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null;

        return $.extend({}, elRect, scroll, outerDims, elOffset)
        //return this.getElementPosition($element)
    }

    /**
     * @doc 获取指定目标dom的可视窗体的宽高
     * @param $target
     * @returns {{outerWidth: number, outerHeight: number}}
     */
    function getTargetWindowOuterSize($target) {
        if ($target) {
            let outerWidth = $target.outerWidth();
            let outerHeight = $target.outerHeight();
            return {outerWidth: outerWidth, outerHeight: outerHeight};
        }

    }

    /**
     * @doc 阻止可选中文本
     */
    function preventTextSelectable($dom) {
        $dom.on('selectstart', function (e) {
            e.stopPropagation();
        });
        $dom.css('user-select', 'none');
    }

    /**
     * @doc 恢复可选中文本
     */
    function recoverTextSelectable($dom) {
        // todo
        $dom.css('user-select', 'auto');
    }

    function logError(message) {
        if (window.console) {
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
                        args = [args];
                    }
                    result = _this[options].apply(_this, args);
                }
            }
            else if (typeof options === 'boolean') {
                result = _this;
            }
            else {
                $.data(this, pluginName, new DraggableView(this, $.extend(true, {}, options)));
            }
        });
        return result || this;
    };

})(jQuery, window, document);