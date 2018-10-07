/**
 * @doc 语言包，中文
 * @author Heanes
 * @time 2018-10-04 12:52:01 周四
 */
(function ($) {
    'use strict';

    $.fn.draggableView.languages['zh-CN'] = {
        lang_dragOpMenuMinTitle: function () {
            return '最小化';
        },
        lang_dragOpMenuMinRestoreTitle: function () {
            return '恢复';
        },
        lang_dragOpMenuMaxTitle: function () {
            return '最大化';
        },
        lang_dragOpMenuMaxRestoreTitle: function () {
            return '恢复';
        },
        lang_dragOpMenuCloseTitle: function () {
            return '关闭';
        },
        lang_dragOpMenuPinTopTitle: function () {
            return '置顶';
        },
        lang_dragOpMenuPinTopRestoreTitle: function () {
            return '取消置顶';
        },
    };

    $.extend($.fn.draggableView.defaults, $.fn.draggableView.languages['zh-CN']);

})(jQuery);