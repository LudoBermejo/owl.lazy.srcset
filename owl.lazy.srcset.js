/**
 * Owl lazy srcset Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

    /**
     * Creates the lazy srcset load plugin.
     * @class The Lazy Load SRCSet Plugin
     * @param {Owl} scope - The Owl Carousel
     */
    LazyLoadSrcSet = function(scope) {
        this.owl = scope;
        this.owl.options = $.extend({}, LazyLoadSrcSet.Defaults, this.owl.options);

        this.handlers = {
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.property.name == 'items' && e.property.value && !e.property.value.is(':empty')) {
                    this.check();
                }
            }, this)
        };

        this.owl.dom.$el.on(this.handlers);
    };

    /**
     * Default options.
     * @public
     */
    LazyLoadSrcSet.Defaults = {
        lazyLoad: false
    };

    /**
     * Checks all items and if necessary, calls `preload`.
     * @protected
     */
    LazyLoadSrcSet.prototype.check = function() {
        var attr = window.devicePixelRatio > 1 ? 'data-src-retina' : 'data-src',
            src, img, i, $item;

        for (i = 0; i < this.owl.num.items; i++) {
            $item = this.owl.dom.$items.eq(i);

            if ($item.data('owl-item').current === true && $item.data('owl-item').loaded === false) {
                img = $item.find('.owl-lazy');
                src = img.attr(attr);
                src = src || img.attr('data-src');

                if (src) {
                    img.css('opacity', '0');
                    this.preload(img, $item);
                }
            }
        }
    };

    /**
     * Preloads the images of an item.
     * @protected
     * @param {jQuery} images - The images to load.
     * @param {jQuery} $item - The item for which the images are loaded.
     */
    LazyLoadSrcSet.prototype.preload = function(images, $item) {
        var $el, img, srcType;

        images.each($.proxy(function(i, el) {

            this.owl.trigger('load', null, 'lazy');

            $el = $(el);
            img = new Image();
            srcType = window.devicePixelRatio > 1 ? $el.attr('data-src-retina') : $el.attr('data-src');
            srcType = srcType || $el.attr('data-src');

            img.onload = $.proxy(function() {
                $item.data('owl-item').loaded = true;
                if ($el.is('img')) {
                    $el.attr('src', img.src);
                    $el.attr(this.owl.options.srcsetLabel || 'srcset', $el.data("srcset"));
                    $el.removeAttr("data-srcset");
                } else {
                    $el.css('background-image', 'url(' + img.src + ')');
                }

                $el.css('opacity', 1);
                this.owl.trigger('loaded', null, 'lazy');
                if(window.picturefill) {
                    setTimeout(function() {
                        picturefill({
                            reevaluate: false,
                            elements:  $el[0]
                        });
                    },10)
                }
            }, this);
            img.src = srcType;
        }, this));
    };

    /**
     * Destroys the plugin.
     * @public
     */
    LazyLoadSrcSet.prototype.destroy = function() {
        var handler, property;

        for (handler in this.handlers) {
            this.owl.dom.$el.off(handler, this.handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.lazyLoad = LazyLoadSrcSet;

})(window.Zepto || window.jQuery, window, document);