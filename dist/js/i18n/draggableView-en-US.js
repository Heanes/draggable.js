/**
 * @doc 语言包，中文
 * @author Heanes
 * @time 2018-10-04 12:52:01 周四
 */
(function ($) {
    'use strict';

    $.fn.draggableView.languages['en-US'] = {
        lang_dragOpMenuMinTitle: function () {
            return 'min size';
        },
        lang_dragOpMenuMinRestoreTitle: function () {
            return 'restore';
        },
        lang_dragOpMenuMaxTitle: function () {
            return 'max size';
        },
        lang_dragOpMenuMaxRestoreTitle: function () {
            return 'restore';
        },
        lang_dragOpMenuCloseTitle: function () {
            return 'close';
        },
        lang_dragOpMenuPinTopTitle: function () {
            return 'pin top';
        },
        lang_dragOpMenuPinTopRestoreTitle: function () {
            return 'cancel top';
        },
    };

    $.extend($.fn.draggableView.defaults, $.fn.draggableView.languages['en-US']);

})(jQuery);