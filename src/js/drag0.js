$(function () {

    // 拖拽总区域
    let $dragWrap = $('.drag-wrap');
    let $dragContent = $('.drag-content');
    let $originContent = $dragContent.children().eq(0);

    // 添加窗体头部，拖拽操作区
    //let $dragBar = $('<div class="drag-move-bar"></div>');
    let $dragMoveBar = $('.drag-move-bar');

    // 添加侧边框，可以改变窗体宽/高
    //let $dragBorder = $('<div class="drag-border"></div>');
    let $dragBorder = $('.drag-border');
    // 边框，改变窗体大小操作区
    let $dragBorderTop = $('.drag-border-top');
    let $dragBorderBottom = $('.drag-border-bottom');
    let $dragBorderLeft = $('.drag-border-left');
    let $dragBorderRight = $('.drag-border-right');

    // 记录初始状态
    let inlineData = {
        dragFlag: false,
        resizeFlag: false,
        resizeBorderPlace: '',
        left: 0,
        top: 0,
        currentX: 0,
        currentY: 0,
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

    };

    let defaultOption = {
        draggable: true,        // 是否可以拖拽
        resizable: true,        // 是否可以改变窗体大小
    };


    let userOption = {
        draggable: true,
    };

    let options = $.extend(true, {}, defaultOption, userOption);

    /****************************** 鼠标移动，拖拽窗体位置 ******************************/
    // 标题栏按下鼠标时，拖拽
    $dragMoveBar.on('mousedown', function (event) {
        if(!options.draggable){
            return false;
        }
        inlineData.dragFlag = true;

        let e = event ? event: window.event;

        inlineData.currentX = e.clientX;
        inlineData.currentY = e.clientY;
        let targetPosition = getTargetPosition($dragWrap);
        inlineData.left = targetPosition.left;
        inlineData.top = targetPosition.top;
    });

    // 全局 - 鼠标移动
    $(document).on('mousemove', function (event) {
        let e = event ? event: window.event;

        if(options.draggable || options.resizable){
            preventTextSelectable($dragWrap);
            let moveOffset = {
                offsetX: e.clientX - inlineData.currentX,
                offsetY: e.clientY - inlineData.currentY
            };
            // 拖拽窗体部分
            if(options.draggable){
                if (inlineData.dragFlag) {
                    let nowPosition = {
                        top: inlineData.top + moveOffset.offsetY,
                        left: inlineData.left + moveOffset.offsetX
                    };
                    moveTargetPosition($dragWrap, nowPosition);
                }
            }

            // 改变窗体大小部分
            if(options.resizable){
                if (inlineData.resizeFlag) {
                    let nowPosition = {};
                    console.log('moveOffset： ');
                    console.log(moveOffset);
                    console.log(inlineData);
                    let dragWrapNowSize = {}, dragContentNowSize = {}, contentNowSize = {},
                        dragMoveBarNowSize = {}, dragBorderVerticalNowSize = {}, dragBorderHorizontalNowSize = {};
                    // 左右上下四个角拖动时
                    let cornerFlag = false;
                    let offsetX = moveOffset.offsetX, offsetY = moveOffset.offsetY;
                    if(inlineData.resizeBorderPlace === 'top-left' || inlineData.resizeBorderPlace === 'top-right' || inlineData.resizeBorderPlace === 'bottom-left' || inlineData.resizeBorderPlace === 'bottom-right'){
                        cornerFlag = true;
                    }
                    // 上下边框拖动时改变高度
                    if(cornerFlag || inlineData.resizeBorderPlace === 'top' || inlineData.resizeBorderPlace === 'bottom'){
                        // 鼠标向上移动时，y轴竖直方向偏移量为负值
                        if(inlineData.resizeBorderPlace === 'top' || inlineData.resizeBorderPlace === 'top-left' || inlineData.resizeBorderPlace === 'top-right'){
                            offsetY = 0 - offsetY;
                        }
                        dragWrapNowSize.height = inlineData.dragWrapWindow.outerHeight + offsetY;
                        dragContentNowSize.height = inlineData.dragContentWindow.outerHeight + offsetY;
                        contentNowSize.height = inlineData.originContentWindow.outerHeight + offsetY;
                        dragBorderVerticalNowSize .height = inlineData.dragBorderVerticalWindow.outerHeight + offsetY;

                        // 当时从上方或左方拖动时才改变水平方向定位
                        if(inlineData.resizeBorderPlace === 'top' || inlineData.resizeBorderPlace === 'top-left' || inlineData.resizeBorderPlace === 'top-right'){
                            nowPosition.top = inlineData.top + moveOffset.offsetY;
                        }
                        console.log('nowPosition:' + nowPosition);
                    }
                    // 左右边框拖动改变宽度
                    if(cornerFlag || inlineData.resizeBorderPlace === 'left' || inlineData.resizeBorderPlace === 'right' || inlineData.resizeBorderPlace === 'bottom-left'){
                        // 鼠标向左移动时，x轴水平方向偏移量为负值
                        if(inlineData.resizeBorderPlace === 'left' || inlineData.resizeBorderPlace === 'top-left' || inlineData.resizeBorderPlace === 'bottom-left'){
                            offsetX = 0 - offsetX;
                        }
                        // 鼠标向上移动时，偏移量为负值
                        dragWrapNowSize.width = inlineData.dragWrapWindow.outerWidth + offsetX;
                        dragContentNowSize.width = inlineData.dragContentWindow.outerWidth + offsetX;
                        dragMoveBarNowSize.width = inlineData.dragMoveBarWindow.outerWidth + offsetX;
                        contentNowSize.width = inlineData.originContentWindow.outerWidth + offsetX;
                        dragBorderHorizontalNowSize.width = inlineData.dragBorderHorizontalWindow.outerWidth + offsetX;

                        // 当时从上方或左方拖动时才改变竖直方向定位
                        if(inlineData.resizeBorderPlace === 'left' || inlineData.resizeBorderPlace === 'top-left' || inlineData.resizeBorderPlace === 'bottom-left'){
                            nowPosition.left = inlineData.left + moveOffset.offsetX;
                        }
                    }

                    // 更改窗体位置
                    if(inlineData.resizeBorderPlace === 'top' || inlineData.resizeBorderPlace === 'left' || inlineData.resizeBorderPlace === 'top-left' || inlineData.resizeBorderPlace === 'top-right' || inlineData.resizeBorderPlace === 'bottom-left'){
                        moveTargetPosition($dragWrap, nowPosition);
                    }

                    // 改变窗体大小
                    changeTargetWindowSize($dragWrap, dragWrapNowSize);
                    changeTargetWindowSize($dragContent, dragContentNowSize);
                    changeTargetWindowSize($originContent, contentNowSize);
                    changeTargetWindowSize($dragMoveBar, dragMoveBarNowSize);
                    changeTargetWindowSize($dragBorderTop, dragBorderHorizontalNowSize);
                    changeTargetWindowSize($dragBorderBottom, dragBorderHorizontalNowSize);
                    changeTargetWindowSize($dragBorderLeft, dragBorderVerticalNowSize);
                    changeTargetWindowSize($dragBorderRight, dragBorderVerticalNowSize);


                }
            }
        }

    });

    // 全局 - 释放鼠标
    $(document).on('mouseup', function (event) {
        if(options.draggable){
            inlineData.dragFlag = false;
        }
        if(options.resizable){
            inlineData.resizeFlag = false;
        }
    });

    /****************************** 改变窗体大小 ******************************/
    // 边框部分按下鼠标时，改变窗体大小
    $dragBorder.on('mousedown', function (event) {
        if(!options.draggable){
            return false;
        }
        inlineData.resizeFlag = true;

        let e = event ? event: window.event;
        let $target = $(e.target);

        // 判断是哪个边框被按下
        if($target.hasClass('drag-border-top')){
            inlineData.resizeBorderPlace = 'top';
        }
        if($target.hasClass('drag-border-bottom')){
            inlineData.resizeBorderPlace = 'bottom';
        }
        if($target.hasClass('drag-border-left')){
            inlineData.resizeBorderPlace = 'left';
        }
        if($target.hasClass('drag-border-right')){
            inlineData.resizeBorderPlace = 'right';
        }

        if($target.hasClass('drag-border-top-left')){
            inlineData.resizeBorderPlace = 'top-left';
        }
        if($target.hasClass('drag-border-top-right')){
            inlineData.resizeBorderPlace = 'top-right';
        }
        if($target.hasClass('drag-border-bottom-left')){
            inlineData.resizeBorderPlace = 'bottom-left';
        }
        if($target.hasClass('drag-border-bottom-right')){
            inlineData.resizeBorderPlace = 'bottom-right';
        }

        inlineData.currentX = e.clientX;
        inlineData.currentY = e.clientY;
        let targetPosition = getTargetPosition($dragWrap);
        inlineData.left = targetPosition.left;
        inlineData.top = targetPosition.top;

        let dragWrapWindowOuterSize = getTargetWindowOuterSize($dragWrap);
        let dragContentWindowOuterSize = getTargetWindowOuterSize($dragContent);
        let contentWindowOuterSize = getTargetWindowOuterSize($originContent);
        let dragMoveBarWindowOuterSize = getTargetWindowOuterSize($dragMoveBar);
        let dragBorderTopOuterSize = getTargetWindowOuterSize($dragBorderTop);
        let dragBorderLeftOuterSize = getTargetWindowOuterSize($dragBorderLeft);
        // 拖拽整体
        inlineData.dragWrapWindow.outerWidth = dragWrapWindowOuterSize.outerWidth;
        inlineData.dragWrapWindow.outerHeight = dragWrapWindowOuterSize.outerHeight;
        // 拖拽内容外套
        inlineData.dragContentWindow.outerWidth = dragContentWindowOuterSize.outerWidth;
        inlineData.dragContentWindow.outerHeight = dragContentWindowOuterSize.outerHeight;
        // 原始内容
        inlineData.originContentWindow.outerWidth = contentWindowOuterSize.outerWidth;
        inlineData.originContentWindow.outerHeight = contentWindowOuterSize.outerHeight;
        inlineData.dragMoveBarWindow.outerWidth = dragMoveBarWindowOuterSize.outerWidth;
        // 边框的宽高
        inlineData.dragBorderVerticalWindow.outerHeight = dragBorderLeftOuterSize.outerHeight;
        inlineData.dragBorderHorizontalWindow.outerWidth = dragBorderTopOuterSize.outerWidth;
    });

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
            positionTop = $target.position().top;
            positionLeft = $target.position().left;
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
});