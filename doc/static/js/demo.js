/**
 * @doc demo样式
 * @author fanggang
 * @time 2018-07-05 11:49:47 周四
 */
$(function () {
    //console.clear();

    $.fn.serializeObject = function() {
        let o = {};
        let a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    let optionDev = {
        width: undefined,
        height: undefined,
        dragDirection: 'all',                               // 可以拖动的方向，x|y|all
        enableDirectionKeyToMove: true,                     // 是否允许按方向键移动窗体，当鼠标置于拖拽移动框位置时
        directionKeyDownToMoveOffset: 5,                    // 按一次方向键移动窗体时的偏移量
        showStatusBar: true,                                // 是否显示状态信息栏
        onWindowMove: function () {
            // console.log('You had move the target dev window');
        }
    };

    let $demoConfigForm = $('.demo-config-form');

    $.each($demoConfigForm, function (i, item) {
        let $form = $(item),
            $demoConfigConfirmBtn = $form.find('.demo-config-confirm-btn'),
            $table = $form.parents('table'),
            $dragDemo = $table.find('.draggable-demo');

        $demoConfigConfirmBtn.on('click', function(){
            let formDataObj = $(item).serializeObject();

            let formConfig = {
                enableDrag:     formDataObj.enableDrag === 'true',
                enableResize:   formDataObj.enableResize === 'true',
                showStatusInfo: formDataObj.showStatusInfo === 'true'
            };
            let config = $.extend(true, {}, optionDev, formDataObj, formConfig);
            if(config.theme !== ''){
                switch (config.theme){
                    case 'mac':
                        break;
                    case 'windows10':
                        config.headerMenuOrder = ['min', 'max', 'close'];
                        config.headerMenu = {
                            close:      '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-windows10-close"></use></svg>',
                            min:        '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-windows10-min"></use></svg>',
                            minRestore: '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-windows10-restore"></use></svg>',
                            max:        '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-windows10-max"></use></svg>',
                            maxRestore: '<svg class="drag-icon" aria-hidden="true"><use xlink:href="#drag-icon-windows10-restore"></use></svg>',
                        };
                }
            }
            try{
                $dragDemo.draggableView(config);
            }catch (e) {
                console.error(e);
            }

            return false;
        })
    });

});