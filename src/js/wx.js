(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.wx = {}, global.jQuery));
})(this, (function (exports, $) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var $__default = /*#__PURE__*/_interopDefaultLegacy($);

  /**
   * Main plugin constructor
   *
   * @param input {Object} link to base input element
   * @param options {Object} slider config
   * @param plugin_count {Number}
   * @constructor
   */

  var mSlider = function mSlider(input, options) {
    this.VERSION = '1.0.0';
    this.input = input;
    this.plugin_count = input;
    this.current_plugin = input;
    this.calc_count = 0;
    this.update_tm = 0;
    this.old_from = 0;
    this.old_to = 0;
    this.old_min_interval = null;
    this.raf_id = null;
    this.dragging = false;
    this.force_redraw = false;
    this.no_diapason = false;
    this.has_tab_index = true;
    this.is_key = false;
    this.is_update = false;
    this.is_start = true;
    this.is_finish = false;
    this.is_active = false;
    this.is_resize = false;
    this.is_click = false;
    options = options || {};

    (function () {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];

      for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
      if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
    })();

    this.base_html = '<span class="irs">' + '<span class="irs-line" tabindex="0"></span>' + '<span class="irs-min">0</span><span class="irs-max">1</span>' + '<span class="irs-from">0</span><span class="irs-to">0</span><span class="irs-single">0</span>' + '</span>' + '<span class="irs-grid"></span>';
    this.single_html = '<span class="irs-bar irs-bar--single"></span>' + '<span class="irs-shadow shadow-single"></span>' + '<span class="irs-handle single"><i></i><i></i><i></i></span>';
    this.double_html = '<span class="irs-bar"></span>' + '<span class="irs-shadow shadow-from"></span>' + '<span class="irs-shadow shadow-to"></span>' + '<span class="irs-handle from"><i></i><i></i><i></i></span>' + '<span class="irs-handle to"><i></i><i></i><i></i></span>';
    this.disable_html = '<span class="irs-disable-mask"></span>'; // cache for links to all DOM elements

    this.$cache = {
      win: $__default["default"](window),
      body: $__default["default"](document.body),
      input: $__default["default"](input),
      cont: null,
      rs: null,
      min: null,
      max: null,
      from: null,
      to: null,
      single: null,
      bar: null,
      line: null,
      s_single: null,
      s_from: null,
      s_to: null,
      shad_single: null,
      shad_from: null,
      shad_to: null,
      edge: null,
      grid: null,
      grid_labels: []
    }; // IE8 fix

    this.is_old_ie = function () {
      var n = navigator.userAgent,
          r = /msie\s\d+/i,
          v;

      if (n.search(r) > 0) {
        v = r.exec(n).toString();
        v = v.split(" ")[1];

        if (v < 9) {
          $__default["default"]("html").addClass("lt-ie9");
          return true;
        }
      }

      return false;
    }();

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {
        var target = this;
        var slice = [].slice;

        if (typeof target != "function") {
          throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function bound() {
          if (this instanceof bound) {
            var F = function F() {};

            F.prototype = target.prototype;
            var self = new F();
            var result = target.apply(self, args.concat(slice.call(arguments)));

            if (Object(result) === result) {
              return result;
            }

            return self;
          } else {
            return target.apply(that, args.concat(slice.call(arguments)));
          }
        };

        return bound;
      };
    }

    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (searchElement, fromIndex) {
        var k;

        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var O = Object(this);
        var len = O.length >>> 0;

        if (len === 0) {
          return -1;
        }

        var n = +fromIndex || 0;

        if (Math.abs(n) === Infinity) {
          n = 0;
        }

        if (n >= len) {
          return -1;
        }

        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        while (k < len) {
          if (k in O && O[k] === searchElement) {
            return k;
          }

          k++;
        }

        return -1;
      };
    } // storage for measure variables


    this.coords = {
      // left
      x_gap: 0,
      x_pointer: 0,
      // width
      w_rs: 0,
      w_rs_old: 0,
      w_handle: 0,
      // percents
      p_gap: 0,
      p_gap_left: 0,
      p_gap_right: 0,
      p_step: 0,
      p_pointer: 0,
      p_handle: 0,
      p_single_fake: 0,
      p_single_real: 0,
      p_from_fake: 0,
      p_from_real: 0,
      p_to_fake: 0,
      p_to_real: 0,
      p_bar_x: 0,
      p_bar_w: 0,
      // grid
      grid_gap: 0,
      big_num: 0,
      big: [],
      big_w: [],
      big_p: [],
      big_x: []
    }; // storage for labels measure variables

    this.labels = {
      // width
      w_min: 0,
      w_max: 0,
      w_from: 0,
      w_to: 0,
      w_single: 0,
      // percents
      p_min: 0,
      p_max: 0,
      p_from_fake: 0,
      p_from_left: 0,
      p_to_fake: 0,
      p_to_left: 0,
      p_single_fake: 0,
      p_single_left: 0
    };
    /**
     * get and validate config
     */

    var $inp = this.$cache.input,
        val = $inp.prop("value"),
        config,
        config_from_data,
        prop; // default config

    config = {
      skin: "meadow",
      type: "double",
      min: 10,
      max: 100,
      from: null,
      to: null,
      step: 1,
      min_interval: 0,
      max_interval: 0,
      drag_interval: false,
      values: [],
      p_values: [],
      from_fixed: false,
      from_min: null,
      from_max: null,
      from_shadow: false,
      to_fixed: false,
      to_min: null,
      to_max: null,
      to_shadow: false,
      prettify_enabled: true,
      prettify_separator: " ",
      prettify: null,
      force_edges: false,
      keyboard: true,
      grid: false,
      grid_margin: true,
      grid_num: 4,
      grid_snap: false,
      hide_min_max: false,
      hide_from_to: false,
      prefix: "",
      postfix: "",
      max_postfix: "",
      decorate_both: true,
      values_separator: " ??? ",
      input_values_separator: ";",
      disable: false,
      block: false,
      extra_classes: "",
      scope: null,
      onStart: null,
      onChange: null,
      onFinish: null,
      onUpdate: null
    }; // check if base element is input

    if ($inp[0].nodeName !== "INPUT") {
      console && console.warn && console.warn("Base element should be <input>!", $inp[0]);
    } // config from data-attributes extends js config


    config_from_data = {
      skin: $inp.data("skin"),
      type: $inp.data("type"),
      min: $inp.data("min"),
      max: $inp.data("max"),
      from: $inp.data("from"),
      to: $inp.data("to"),
      step: $inp.data("step"),
      min_interval: $inp.data("minInterval"),
      max_interval: $inp.data("maxInterval"),
      drag_interval: $inp.data("dragInterval"),
      values: $inp.data("values"),
      from_fixed: $inp.data("fromFixed"),
      from_min: $inp.data("fromMin"),
      from_max: $inp.data("fromMax"),
      from_shadow: $inp.data("fromShadow"),
      to_fixed: $inp.data("toFixed"),
      to_min: $inp.data("toMin"),
      to_max: $inp.data("toMax"),
      to_shadow: $inp.data("toShadow"),
      prettify_enabled: $inp.data("prettifyEnabled"),
      prettify_separator: $inp.data("prettifySeparator"),
      force_edges: $inp.data("forceEdges"),
      keyboard: $inp.data("keyboard"),
      grid: $inp.data("grid"),
      grid_margin: $inp.data("gridMargin"),
      grid_num: $inp.data("gridNum"),
      grid_snap: $inp.data("gridSnap"),
      hide_min_max: $inp.data("hideMinMax"),
      hide_from_to: $inp.data("hideFromTo"),
      prefix: $inp.data("prefix"),
      postfix: $inp.data("postfix"),
      max_postfix: $inp.data("maxPostfix"),
      decorate_both: $inp.data("decorateBoth"),
      values_separator: $inp.data("valuesSeparator"),
      input_values_separator: $inp.data("inputValuesSeparator"),
      disable: $inp.data("disable"),
      block: $inp.data("block"),
      extra_classes: $inp.data("extraClasses")
    };
    config_from_data.values = config_from_data.values && config_from_data.values.split(",");

    for (prop in config_from_data) {
      if (config_from_data.hasOwnProperty(prop)) {
        if (config_from_data[prop] === undefined || config_from_data[prop] === "") {
          delete config_from_data[prop];
        }
      }
    } // input value extends default config


    if (val !== undefined && val !== "") {
      val = val.split(config_from_data.input_values_separator || options.input_values_separator || ";");

      if (val[0] && val[0] == +val[0]) {
        val[0] = +val[0];
      }

      if (val[1] && val[1] == +val[1]) {
        val[1] = +val[1];
      }

      if (options && options.values && options.values.length) {
        config.from = val[0] && options.values.indexOf(val[0]);
        config.to = val[1] && options.values.indexOf(val[1]);
      } else {
        config.from = val[0] && +val[0];
        config.to = val[1] && +val[1];
      }
    } // js config extends default config


    $__default["default"].extend(config, options); // data config extends config

    $__default["default"].extend(config, config_from_data);
    this.options = config; // validate config, to be sure that all data types are correct

    this.update_check = {};
    this.validate(); // default result object, returned to callbacks

    this.result = {
      input: this.$cache.input,
      slider: null,
      min: this.options.min,
      max: this.options.max,
      from: this.options.from,
      from_percent: 0,
      from_value: null,
      to: this.options.to,
      to_percent: 0,
      to_value: null
    };
    this.init();
  };

  mSlider.prototype = {
    /**
     * Starts or updates the plugin instance
     *
     * @param [is_update] {boolean}
     */
    init: function init(is_update) {
      this.no_diapason = false;
      this.coords.p_step = this.convertToPercent(this.options.step, true);
      this.target = "base";
      this.toggleInput();
      this.append();
      this.setMinMax();

      if (is_update) {
        this.force_redraw = true;
        this.calc(true); // callbacks called

        this.callOnUpdate();
      } else {
        this.force_redraw = true;
        this.calc(true); // callbacks called

        this.callOnStart();
      }

      this.updateScene();
    },

    /**
     * Appends slider template to a DOM
     */
    append: function append() {
      var container_html = '<span class="irs irs--' + this.options.skin + ' js-irs-' + this.plugin_count + ' ' + this.options.extra_classes + '"></span>';
      this.$cache.input.before(container_html);
      this.$cache.input.prop("readonly", true);
      this.$cache.cont = this.$cache.input.prev();
      this.result.slider = this.$cache.cont;
      this.$cache.cont.html(this.base_html);
      this.$cache.rs = this.$cache.cont.find(".irs");
      this.$cache.min = this.$cache.cont.find(".irs-min");
      this.$cache.max = this.$cache.cont.find(".irs-max");
      this.$cache.from = this.$cache.cont.find(".irs-from");
      this.$cache.to = this.$cache.cont.find(".irs-to");
      this.$cache.single = this.$cache.cont.find(".irs-single");
      this.$cache.line = this.$cache.cont.find(".irs-line");
      this.$cache.grid = this.$cache.cont.find(".irs-grid");

      if (this.options.type === "single") {
        this.$cache.cont.append(this.single_html);
        this.$cache.bar = this.$cache.cont.find(".irs-bar");
        this.$cache.edge = this.$cache.cont.find(".irs-bar-edge");
        this.$cache.s_single = this.$cache.cont.find(".single");
        this.$cache.from[0].style.visibility = "hidden";
        this.$cache.to[0].style.visibility = "hidden";
        this.$cache.shad_single = this.$cache.cont.find(".shadow-single");
      } else {
        this.$cache.cont.append(this.double_html);
        this.$cache.bar = this.$cache.cont.find(".irs-bar");
        this.$cache.s_from = this.$cache.cont.find(".from");
        this.$cache.s_to = this.$cache.cont.find(".to");
        this.$cache.shad_from = this.$cache.cont.find(".shadow-from");
        this.$cache.shad_to = this.$cache.cont.find(".shadow-to");
        this.setTopHandler();
      }

      if (this.options.hide_from_to) {
        this.$cache.from[0].style.display = "none";
        this.$cache.to[0].style.display = "none";
        this.$cache.single[0].style.display = "none";
      }

      this.appendGrid();

      if (this.options.disable) {
        this.appendDisableMask();
        this.$cache.input[0].disabled = true;
      } else {
        this.$cache.input[0].disabled = false;
        this.removeDisableMask();
        this.bindEvents();
      } // block only if not disabled


      if (!this.options.disable) {
        if (this.options.block) {
          this.appendDisableMask();
        } else {
          this.removeDisableMask();
        }
      }

      if (this.options.drag_interval) {
        this.$cache.bar[0].style.cursor = "ew-resize";
      }
    },

    /**
     * Determine which handler has a priority
     * works only for double slider type
     */
    setTopHandler: function setTopHandler() {
      var min = this.options.min,
          max = this.options.max,
          from = this.options.from,
          to = this.options.to;

      if (from > min && to === max) {
        this.$cache.s_from.addClass("type_last");
      } else if (to < max) {
        this.$cache.s_to.addClass("type_last");
      }
    },

    /**
     * Determine which handles was clicked last
     * and which handler should have hover effect
     *
     * @param target {String}
     */
    changeLevel: function changeLevel(target) {
      switch (target) {
        case "single":
          this.coords.p_gap = this.toFixed(this.coords.p_pointer - this.coords.p_single_fake);
          this.$cache.s_single.addClass("state_hover");
          break;

        case "from":
          this.coords.p_gap = this.toFixed(this.coords.p_pointer - this.coords.p_from_fake);
          this.$cache.s_from.addClass("state_hover");
          this.$cache.s_from.addClass("type_last");
          this.$cache.s_to.removeClass("type_last");
          break;

        case "to":
          this.coords.p_gap = this.toFixed(this.coords.p_pointer - this.coords.p_to_fake);
          this.$cache.s_to.addClass("state_hover");
          this.$cache.s_to.addClass("type_last");
          this.$cache.s_from.removeClass("type_last");
          break;

        case "both":
          this.coords.p_gap_left = this.toFixed(this.coords.p_pointer - this.coords.p_from_fake);
          this.coords.p_gap_right = this.toFixed(this.coords.p_to_fake - this.coords.p_pointer);
          this.$cache.s_to.removeClass("type_last");
          this.$cache.s_from.removeClass("type_last");
          break;
      }
    },

    /**
     * Then slider is disabled
     * appends extra layer with opacity
     */
    appendDisableMask: function appendDisableMask() {
      this.$cache.cont.append(this.disable_html);
      this.$cache.cont.addClass("irs-disabled");
    },

    /**
     * Then slider is not disabled
     * remove disable mask
     */
    removeDisableMask: function removeDisableMask() {
      this.$cache.cont.remove(".irs-disable-mask");
      this.$cache.cont.removeClass("irs-disabled");
    },

    /**
     * Remove slider instance
     * and unbind all events
     */
    remove: function remove() {
      this.$cache.cont.remove();
      this.$cache.cont = null;
      this.$cache.line.off("keydown.irs_" + this.plugin_count);
      this.$cache.body.off("touchmove.irs_" + this.plugin_count);
      this.$cache.body.off("mousemove.irs_" + this.plugin_count);
      this.$cache.win.off("touchend.irs_" + this.plugin_count);
      this.$cache.win.off("mouseup.irs_" + this.plugin_count);

      if (this.is_old_ie) {
        this.$cache.body.off("mouseup.irs_" + this.plugin_count);
        this.$cache.body.off("mouseleave.irs_" + this.plugin_count);
      }

      this.$cache.grid_labels = [];
      this.coords.big = [];
      this.coords.big_w = [];
      this.coords.big_p = [];
      this.coords.big_x = [];
      cancelAnimationFrame(this.raf_id);
    },

    /**
     * bind all slider events
     */
    bindEvents: function bindEvents() {
      if (this.no_diapason) {
        return;
      }

      this.$cache.body.on("touchmove.irs_" + this.plugin_count, this.pointerMove.bind(this));
      this.$cache.body.on("mousemove.irs_" + this.plugin_count, this.pointerMove.bind(this));
      this.$cache.win.on("touchend.irs_" + this.plugin_count, this.pointerUp.bind(this));
      this.$cache.win.on("mouseup.irs_" + this.plugin_count, this.pointerUp.bind(this));
      this.$cache.line.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
      this.$cache.line.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
      this.$cache.line.on("focus.irs_" + this.plugin_count, this.pointerFocus.bind(this));

      if (this.options.drag_interval && this.options.type === "double") {
        this.$cache.bar.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "both"));
        this.$cache.bar.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "both"));
      } else {
        this.$cache.bar.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
        this.$cache.bar.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
      }

      if (this.options.type === "single") {
        this.$cache.single.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "single"));
        this.$cache.s_single.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "single"));
        this.$cache.shad_single.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
        this.$cache.single.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "single"));
        this.$cache.s_single.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "single"));
        this.$cache.edge.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
        this.$cache.shad_single.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
      } else {
        this.$cache.single.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, null));
        this.$cache.single.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, null));
        this.$cache.from.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "from"));
        this.$cache.s_from.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "from"));
        this.$cache.to.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "to"));
        this.$cache.s_to.on("touchstart.irs_" + this.plugin_count, this.pointerDown.bind(this, "to"));
        this.$cache.shad_from.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
        this.$cache.shad_to.on("touchstart.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
        this.$cache.from.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "from"));
        this.$cache.s_from.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "from"));
        this.$cache.to.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "to"));
        this.$cache.s_to.on("mousedown.irs_" + this.plugin_count, this.pointerDown.bind(this, "to"));
        this.$cache.shad_from.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
        this.$cache.shad_to.on("mousedown.irs_" + this.plugin_count, this.pointerClick.bind(this, "click"));
      }

      if (this.options.keyboard) {
        this.$cache.line.on("keydown.irs_" + this.plugin_count, this.key.bind(this, "keyboard"));
      }

      if (this.is_old_ie) {
        this.$cache.body.on("mouseup.irs_" + this.plugin_count, this.pointerUp.bind(this));
        this.$cache.body.on("mouseleave.irs_" + this.plugin_count, this.pointerUp.bind(this));
      }
    },

    /**
     * Focus with tabIndex
     *
     * @param e {Object} event object
     */
    pointerFocus: function pointerFocus(e) {
      if (!this.target) {
        var x;
        var $handle;

        if (this.options.type === "single") {
          $handle = this.$cache.single;
        } else {
          $handle = this.$cache.from;
        }

        x = $handle.offset().left;
        x += $handle.width() / 2 - 1;
        this.pointerClick("single", {
          preventDefault: function preventDefault() {},
          pageX: x
        });
      }
    },

    /**
     * Mousemove or touchmove
     * only for handlers
     *
     * @param e {Object} event object
     */
    pointerMove: function pointerMove(e) {
      if (!this.dragging) {
        return;
      }

      var x = e.pageX || e.originalEvent.touches && e.originalEvent.touches[0].pageX;
      this.coords.x_pointer = x - this.coords.x_gap;
      this.calc();
    },

    /**
     * Mouseup or touchend
     * only for handlers
     *
     * @param e {Object} event object
     */
    pointerUp: function pointerUp(e) {
      if (this.current_plugin !== this.plugin_count) {
        return;
      }

      if (this.is_active) {
        this.is_active = false;
      } else {
        return;
      }

      this.$cache.cont.find(".state_hover").removeClass("state_hover");
      this.force_redraw = true;

      if (this.is_old_ie) {
        $__default["default"]("*").prop("unselectable", false);
      }

      this.updateScene();
      this.restoreOriginalMinInterval(); // callbacks call

      if ($__default["default"].contains(this.$cache.cont[0], e.target) || this.dragging) {
        this.callOnFinish();
      }

      this.dragging = false;
    },

    /**
     * Mousedown or touchstart
     * only for handlers
     *
     * @param target {String|null}
     * @param e {Object} event object
     */
    pointerDown: function pointerDown(target, e) {
      e.preventDefault();
      var x = e.pageX || e.originalEvent.touches && e.originalEvent.touches[0].pageX;

      if (e.button === 2) {
        return;
      }

      if (target === "both") {
        this.setTempMinInterval();
      }

      if (!target) {
        target = this.target || "from";
      }

      this.current_plugin = this.plugin_count;
      this.target = target;
      this.is_active = true;
      this.dragging = true;
      this.coords.x_gap = this.$cache.rs.offset().left;
      this.coords.x_pointer = x - this.coords.x_gap;
      this.calcPointerPercent();
      this.changeLevel(target);

      if (this.is_old_ie) {
        $__default["default"]("*").prop("unselectable", true);
      }

      this.$cache.line.trigger("focus");
      this.updateScene();
    },

    /**
     * Mousedown or touchstart
     * for other slider elements, like diapason line
     *
     * @param target {String}
     * @param e {Object} event object
     */
    pointerClick: function pointerClick(target, e) {
      e.preventDefault();
      var x = e.pageX || e.originalEvent.touches && e.originalEvent.touches[0].pageX;

      if (e.button === 2) {
        return;
      }

      this.current_plugin = this.plugin_count;
      this.target = target;
      this.is_click = true;
      this.coords.x_gap = this.$cache.rs.offset().left;
      this.coords.x_pointer = +(x - this.coords.x_gap).toFixed();
      this.force_redraw = true;
      this.calc();
      this.$cache.line.trigger("focus");
    },

    /**
     * Keyborard controls for focused slider
     *
     * @param target {String}
     * @param e {Object} event object
     * @returns {boolean|undefined}
     */
    key: function key(target, e) {
      if (this.current_plugin !== this.plugin_count || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
        return;
      }

      switch (e.which) {
        case 83: // W

        case 65: // A

        case 40: // DOWN

        case 37:
          // LEFT
          e.preventDefault();
          this.moveByKey(false);
          break;

        case 87: // S

        case 68: // D

        case 38: // UP

        case 39:
          // RIGHT
          e.preventDefault();
          this.moveByKey(true);
          break;
      }

      return true;
    },

    /**
     * Move by key
     *
     * @param right {boolean} direction to move
     */
    moveByKey: function moveByKey(right) {
      var p = this.coords.p_pointer;
      var p_step = (this.options.max - this.options.min) / 100;
      p_step = this.options.step / p_step;

      if (right) {
        p += p_step;
      } else {
        p -= p_step;
      }

      this.coords.x_pointer = this.toFixed(this.coords.w_rs / 100 * p);
      this.is_key = true;
      this.calc();
    },

    /**
     * Set visibility and content
     * of Min and Max labels
     */
    setMinMax: function setMinMax() {
      if (!this.options) {
        return;
      }

      if (this.options.hide_min_max) {
        this.$cache.min[0].style.display = "none";
        this.$cache.max[0].style.display = "none";
        return;
      }

      if (this.options.values.length) {
        this.$cache.min.html(this.decorate(this.options.p_values[this.options.min]));
        this.$cache.max.html(this.decorate(this.options.p_values[this.options.max]));
      } else {
        var min_pretty = this._prettify(this.options.min);

        var max_pretty = this._prettify(this.options.max);

        this.result.min_pretty = min_pretty;
        this.result.max_pretty = max_pretty;
        this.$cache.min.html(this.decorate(min_pretty, this.options.min));
        this.$cache.max.html(this.decorate(max_pretty, this.options.max));
      }

      this.labels.w_min = this.$cache.min.outerWidth(false);
      this.labels.w_max = this.$cache.max.outerWidth(false);
    },

    /**
     * Then dragging interval, prevent interval collapsing
     * using min_interval option
     */
    setTempMinInterval: function setTempMinInterval() {
      var interval = this.result.to - this.result.from;

      if (this.old_min_interval === null) {
        this.old_min_interval = this.options.min_interval;
      }

      this.options.min_interval = interval;
    },

    /**
     * Restore min_interval option to original
     */
    restoreOriginalMinInterval: function restoreOriginalMinInterval() {
      if (this.old_min_interval !== null) {
        this.options.min_interval = this.old_min_interval;
        this.old_min_interval = null;
      }
    },
    // =============================================================================================================
    // Calculations

    /**
     * All calculations and measures start here
     *
     * @param update {boolean=}
     */
    calc: function calc(update) {
      if (!this.options) {
        return;
      }

      this.calc_count++;

      if (this.calc_count === 10 || update) {
        this.calc_count = 0;
        this.coords.w_rs = this.$cache.rs.outerWidth(false);
        this.calcHandlePercent();
      }

      if (!this.coords.w_rs) {
        return;
      }

      this.calcPointerPercent();
      var handle_x = this.getHandleX();

      if (this.target === "both") {
        this.coords.p_gap = 0;
        handle_x = this.getHandleX();
      }

      if (this.target === "click") {
        this.coords.p_gap = this.coords.p_handle / 2;
        handle_x = this.getHandleX();

        if (this.options.drag_interval) {
          this.target = "both_one";
        } else {
          this.target = this.chooseHandle(handle_x);
        }
      }

      switch (this.target) {
        case "base":
          var w = (this.options.max - this.options.min) / 100,
              f = (this.result.from - this.options.min) / w,
              t = (this.result.to - this.options.min) / w;
          this.coords.p_single_real = this.toFixed(f);
          this.coords.p_from_real = this.toFixed(f);
          this.coords.p_to_real = this.toFixed(t);
          this.coords.p_single_real = this.checkDiapason(this.coords.p_single_real, this.options.from_min, this.options.from_max);
          this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max);
          this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);
          this.coords.p_single_fake = this.convertToFakePercent(this.coords.p_single_real);
          this.coords.p_from_fake = this.convertToFakePercent(this.coords.p_from_real);
          this.coords.p_to_fake = this.convertToFakePercent(this.coords.p_to_real);
          this.target = null;
          break;

        case "single":
          if (this.options.from_fixed) {
            break;
          }

          this.coords.p_single_real = this.convertToRealPercent(handle_x);
          this.coords.p_single_real = this.calcWithStep(this.coords.p_single_real);
          this.coords.p_single_real = this.checkDiapason(this.coords.p_single_real, this.options.from_min, this.options.from_max);
          this.coords.p_single_fake = this.convertToFakePercent(this.coords.p_single_real);
          break;

        case "from":
          if (this.options.from_fixed) {
            break;
          }

          this.coords.p_from_real = this.convertToRealPercent(handle_x);
          this.coords.p_from_real = this.calcWithStep(this.coords.p_from_real);

          if (this.coords.p_from_real > this.coords.p_to_real) {
            this.coords.p_from_real = this.coords.p_to_real;
          }

          this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max);
          this.coords.p_from_real = this.checkMinInterval(this.coords.p_from_real, this.coords.p_to_real, "from");
          this.coords.p_from_real = this.checkMaxInterval(this.coords.p_from_real, this.coords.p_to_real, "from");
          this.coords.p_from_fake = this.convertToFakePercent(this.coords.p_from_real);
          break;

        case "to":
          if (this.options.to_fixed) {
            break;
          }

          this.coords.p_to_real = this.convertToRealPercent(handle_x);
          this.coords.p_to_real = this.calcWithStep(this.coords.p_to_real);

          if (this.coords.p_to_real < this.coords.p_from_real) {
            this.coords.p_to_real = this.coords.p_from_real;
          }

          this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);
          this.coords.p_to_real = this.checkMinInterval(this.coords.p_to_real, this.coords.p_from_real, "to");
          this.coords.p_to_real = this.checkMaxInterval(this.coords.p_to_real, this.coords.p_from_real, "to");
          this.coords.p_to_fake = this.convertToFakePercent(this.coords.p_to_real);
          break;

        case "both":
          if (this.options.from_fixed || this.options.to_fixed) {
            break;
          }

          handle_x = this.toFixed(handle_x + this.coords.p_handle * 0.001);
          this.coords.p_from_real = this.convertToRealPercent(handle_x) - this.coords.p_gap_left;
          this.coords.p_from_real = this.calcWithStep(this.coords.p_from_real);
          this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max);
          this.coords.p_from_real = this.checkMinInterval(this.coords.p_from_real, this.coords.p_to_real, "from");
          this.coords.p_from_fake = this.convertToFakePercent(this.coords.p_from_real);
          this.coords.p_to_real = this.convertToRealPercent(handle_x) + this.coords.p_gap_right;
          this.coords.p_to_real = this.calcWithStep(this.coords.p_to_real);
          this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);
          this.coords.p_to_real = this.checkMinInterval(this.coords.p_to_real, this.coords.p_from_real, "to");
          this.coords.p_to_fake = this.convertToFakePercent(this.coords.p_to_real);
          break;

        case "both_one":
          if (this.options.from_fixed || this.options.to_fixed) {
            break;
          }

          var real_x = this.convertToRealPercent(handle_x),
              from = this.result.from_percent,
              to = this.result.to_percent,
              full = to - from,
              half = full / 2,
              new_from = real_x - half,
              new_to = real_x + half;

          if (new_from < 0) {
            new_from = 0;
            new_to = new_from + full;
          }

          if (new_to > 100) {
            new_to = 100;
            new_from = new_to - full;
          }

          this.coords.p_from_real = this.calcWithStep(new_from);
          this.coords.p_from_real = this.checkDiapason(this.coords.p_from_real, this.options.from_min, this.options.from_max);
          this.coords.p_from_fake = this.convertToFakePercent(this.coords.p_from_real);
          this.coords.p_to_real = this.calcWithStep(new_to);
          this.coords.p_to_real = this.checkDiapason(this.coords.p_to_real, this.options.to_min, this.options.to_max);
          this.coords.p_to_fake = this.convertToFakePercent(this.coords.p_to_real);
          break;
      }

      if (this.options.type === "single") {
        this.coords.p_bar_x = this.coords.p_handle / 2;
        this.coords.p_bar_w = this.coords.p_single_fake;
        this.result.from_percent = this.coords.p_single_real;
        this.result.from = this.convertToValue(this.coords.p_single_real);
        this.result.from_pretty = this._prettify(this.result.from);

        if (this.options.values.length) {
          this.result.from_value = this.options.values[this.result.from];
        }
      } else {
        this.coords.p_bar_x = this.toFixed(this.coords.p_from_fake + this.coords.p_handle / 2);
        this.coords.p_bar_w = this.toFixed(this.coords.p_to_fake - this.coords.p_from_fake);
        this.result.from_percent = this.coords.p_from_real;
        this.result.from = this.convertToValue(this.coords.p_from_real);
        this.result.from_pretty = this._prettify(this.result.from);
        this.result.to_percent = this.coords.p_to_real;
        this.result.to = this.convertToValue(this.coords.p_to_real);
        this.result.to_pretty = this._prettify(this.result.to);

        if (this.options.values.length) {
          this.result.from_value = this.options.values[this.result.from];
          this.result.to_value = this.options.values[this.result.to];
        }
      }

      this.calcMinMax();
      this.calcLabels();
    },

    /**
     * calculates pointer X in percent
     */
    calcPointerPercent: function calcPointerPercent() {
      if (!this.coords.w_rs) {
        this.coords.p_pointer = 0;
        return;
      }

      if (this.coords.x_pointer < 0 || isNaN(this.coords.x_pointer)) {
        this.coords.x_pointer = 0;
      } else if (this.coords.x_pointer > this.coords.w_rs) {
        this.coords.x_pointer = this.coords.w_rs;
      }

      this.coords.p_pointer = this.toFixed(this.coords.x_pointer / this.coords.w_rs * 100);
    },
    convertToRealPercent: function convertToRealPercent(fake) {
      var full = 100 - this.coords.p_handle;
      return fake / full * 100;
    },
    convertToFakePercent: function convertToFakePercent(real) {
      var full = 100 - this.coords.p_handle;
      return real / 100 * full;
    },
    getHandleX: function getHandleX() {
      var max = 100 - this.coords.p_handle,
          x = this.toFixed(this.coords.p_pointer - this.coords.p_gap);

      if (x < 0) {
        x = 0;
      } else if (x > max) {
        x = max;
      }

      return x;
    },
    calcHandlePercent: function calcHandlePercent() {
      if (this.options.type === "single") {
        this.coords.w_handle = this.$cache.s_single.outerWidth(false);
      } else {
        this.coords.w_handle = this.$cache.s_from.outerWidth(false);
      }

      this.coords.p_handle = this.toFixed(this.coords.w_handle / this.coords.w_rs * 100);
    },

    /**
     * Find closest handle to pointer click
     *
     * @param real_x {Number}
     * @returns {String}
     */
    chooseHandle: function chooseHandle(real_x) {
      if (this.options.type === "single") {
        return "single";
      } else {
        var m_point = this.coords.p_from_real + (this.coords.p_to_real - this.coords.p_from_real) / 2;

        if (real_x >= m_point) {
          return this.options.to_fixed ? "from" : "to";
        } else {
          return this.options.from_fixed ? "to" : "from";
        }
      }
    },

    /**
     * Measure Min and Max labels width in percent
     */
    calcMinMax: function calcMinMax() {
      if (!this.coords.w_rs) {
        return;
      }

      this.labels.p_min = this.labels.w_min / this.coords.w_rs * 100;
      this.labels.p_max = this.labels.w_max / this.coords.w_rs * 100;
    },

    /**
     * Measure labels width and X in percent
     */
    calcLabels: function calcLabels() {
      if (!this.coords.w_rs || this.options.hide_from_to) {
        return;
      }

      if (this.options.type === "single") {
        this.labels.w_single = this.$cache.single.outerWidth(false);
        this.labels.p_single_fake = this.labels.w_single / this.coords.w_rs * 100;
        this.labels.p_single_left = this.coords.p_single_fake + this.coords.p_handle / 2 - this.labels.p_single_fake / 2;
        this.labels.p_single_left = this.checkEdges(this.labels.p_single_left, this.labels.p_single_fake);
      } else {
        this.labels.w_from = this.$cache.from.outerWidth(false);
        this.labels.p_from_fake = this.labels.w_from / this.coords.w_rs * 100;
        this.labels.p_from_left = this.coords.p_from_fake + this.coords.p_handle / 2 - this.labels.p_from_fake / 2;
        this.labels.p_from_left = this.toFixed(this.labels.p_from_left);
        this.labels.p_from_left = this.checkEdges(this.labels.p_from_left, this.labels.p_from_fake);
        this.labels.w_to = this.$cache.to.outerWidth(false);
        this.labels.p_to_fake = this.labels.w_to / this.coords.w_rs * 100;
        this.labels.p_to_left = this.coords.p_to_fake + this.coords.p_handle / 2 - this.labels.p_to_fake / 2;
        this.labels.p_to_left = this.toFixed(this.labels.p_to_left);
        this.labels.p_to_left = this.checkEdges(this.labels.p_to_left, this.labels.p_to_fake);
        this.labels.w_single = this.$cache.single.outerWidth(false);
        this.labels.p_single_fake = this.labels.w_single / this.coords.w_rs * 100;
        this.labels.p_single_left = (this.labels.p_from_left + this.labels.p_to_left + this.labels.p_to_fake) / 2 - this.labels.p_single_fake / 2;
        this.labels.p_single_left = this.toFixed(this.labels.p_single_left);
        this.labels.p_single_left = this.checkEdges(this.labels.p_single_left, this.labels.p_single_fake);
      }
    },
    // =============================================================================================================
    // Drawings

    /**
     * Main function called in request animation frame
     * to update everything
     */
    updateScene: function updateScene() {
      if (this.raf_id) {
        cancelAnimationFrame(this.raf_id);
        this.raf_id = null;
      }

      clearTimeout(this.update_tm);
      this.update_tm = null;

      if (!this.options) {
        return;
      }

      this.drawHandles();

      if (this.is_active) {
        this.raf_id = requestAnimationFrame(this.updateScene.bind(this));
      } else {
        this.update_tm = setTimeout(this.updateScene.bind(this), 300);
      }
    },

    /**
     * Draw handles
     */
    drawHandles: function drawHandles() {
      this.coords.w_rs = this.$cache.rs.outerWidth(false);

      if (!this.coords.w_rs) {
        return;
      }

      if (this.coords.w_rs !== this.coords.w_rs_old) {
        this.target = "base";
        this.is_resize = true;
      }

      if (this.coords.w_rs !== this.coords.w_rs_old || this.force_redraw) {
        this.setMinMax();
        this.calc(true);
        this.drawLabels();

        if (this.options.grid) {
          this.calcGridMargin();
          this.calcGridLabels();
        }

        this.force_redraw = true;
        this.coords.w_rs_old = this.coords.w_rs;
        this.drawShadow();
      }

      if (!this.coords.w_rs) {
        return;
      }

      if (!this.dragging && !this.force_redraw && !this.is_key) {
        return;
      }

      if (this.old_from !== this.result.from || this.old_to !== this.result.to || this.force_redraw || this.is_key) {
        this.drawLabels();
        this.$cache.bar[0].style.left = this.coords.p_bar_x + "%";
        this.$cache.bar[0].style.width = this.coords.p_bar_w + "%";

        if (this.options.type === "single") {
          this.$cache.bar[0].style.left = 0;
          this.$cache.bar[0].style.width = this.coords.p_bar_w + this.coords.p_bar_x + "%";
          this.$cache.s_single[0].style.left = this.coords.p_single_fake + "%";
          this.$cache.single[0].style.left = this.labels.p_single_left + "%";
        } else {
          this.$cache.s_from[0].style.left = this.coords.p_from_fake + "%";
          this.$cache.s_to[0].style.left = this.coords.p_to_fake + "%";

          if (this.old_from !== this.result.from || this.force_redraw) {
            this.$cache.from[0].style.left = this.labels.p_from_left + "%";
          }

          if (this.old_to !== this.result.to || this.force_redraw) {
            this.$cache.to[0].style.left = this.labels.p_to_left + "%";
          }

          this.$cache.single[0].style.left = this.labels.p_single_left + "%";
        }

        this.writeToInput();

        if ((this.old_from !== this.result.from || this.old_to !== this.result.to) && !this.is_start) {
          this.$cache.input.trigger("change");
          this.$cache.input.trigger("input");
        }

        this.old_from = this.result.from;
        this.old_to = this.result.to; // callbacks call

        if (!this.is_resize && !this.is_update && !this.is_start && !this.is_finish) {
          this.callOnChange();
        }

        if (this.is_key || this.is_click) {
          this.is_key = false;
          this.is_click = false;
          this.callOnFinish();
        }

        this.is_update = false;
        this.is_resize = false;
        this.is_finish = false;
      }

      this.is_start = false;
      this.is_key = false;
      this.is_click = false;
      this.force_redraw = false;
    },

    /**
     * Draw labels
     * measure labels collisions
     * collapse close labels
     */
    drawLabels: function drawLabels() {
      if (!this.options) {
        return;
      }

      var values_num = this.options.values.length;
      var p_values = this.options.p_values;
      var text_single;
      var text_from;
      var text_to;
      var from_pretty;
      var to_pretty;

      if (this.options.hide_from_to) {
        return;
      }

      if (this.options.type === "single") {
        if (values_num) {
          text_single = this.decorate(p_values[this.result.from]);
          this.$cache.single.html(text_single);
        } else {
          from_pretty = this._prettify(this.result.from);
          text_single = this.decorate(from_pretty, this.result.from);
          this.$cache.single.html(text_single);
        }

        this.calcLabels();

        if (this.labels.p_single_left < this.labels.p_min + 1) {
          this.$cache.min[0].style.visibility = "hidden";
        } else {
          this.$cache.min[0].style.visibility = "visible";
        }

        if (this.labels.p_single_left + this.labels.p_single_fake > 100 - this.labels.p_max - 1) {
          this.$cache.max[0].style.visibility = "hidden";
        } else {
          this.$cache.max[0].style.visibility = "visible";
        }
      } else {
        if (values_num) {
          if (this.options.decorate_both) {
            text_single = this.decorate(p_values[this.result.from]);
            text_single += this.options.values_separator;
            text_single += this.decorate(p_values[this.result.to]);
          } else {
            text_single = this.decorate(p_values[this.result.from] + this.options.values_separator + p_values[this.result.to]);
          }

          text_from = this.decorate(p_values[this.result.from]);
          text_to = this.decorate(p_values[this.result.to]);
          this.$cache.single.html(text_single);
          this.$cache.from.html(text_from);
          this.$cache.to.html(text_to);
        } else {
          from_pretty = this._prettify(this.result.from);
          to_pretty = this._prettify(this.result.to);

          if (this.options.decorate_both) {
            text_single = this.decorate(from_pretty, this.result.from);
            text_single += this.options.values_separator;
            text_single += this.decorate(to_pretty, this.result.to);
          } else {
            text_single = this.decorate(from_pretty + this.options.values_separator + to_pretty, this.result.to);
          }

          text_from = this.decorate(from_pretty, this.result.from);
          text_to = this.decorate(to_pretty, this.result.to);
          this.$cache.single.html(text_single);
          this.$cache.from.html(text_from);
          this.$cache.to.html(text_to);
        }

        this.calcLabels();
        var min = Math.min(this.labels.p_single_left, this.labels.p_from_left),
            single_left = this.labels.p_single_left + this.labels.p_single_fake,
            to_left = this.labels.p_to_left + this.labels.p_to_fake,
            max = Math.max(single_left, to_left);

        if (this.labels.p_from_left + this.labels.p_from_fake >= this.labels.p_to_left) {
          this.$cache.from[0].style.visibility = "hidden";
          this.$cache.to[0].style.visibility = "hidden";
          this.$cache.single[0].style.visibility = "visible";

          if (this.result.from === this.result.to) {
            if (this.target === "from") {
              this.$cache.from[0].style.visibility = "visible";
            } else if (this.target === "to") {
              this.$cache.to[0].style.visibility = "visible";
            } else if (!this.target) {
              this.$cache.from[0].style.visibility = "visible";
            }

            this.$cache.single[0].style.visibility = "hidden";
            max = to_left;
          } else {
            this.$cache.from[0].style.visibility = "hidden";
            this.$cache.to[0].style.visibility = "hidden";
            this.$cache.single[0].style.visibility = "visible";
            max = Math.max(single_left, to_left);
          }
        } else {
          this.$cache.from[0].style.visibility = "visible";
          this.$cache.to[0].style.visibility = "visible";
          this.$cache.single[0].style.visibility = "hidden";
        }

        if (min < this.labels.p_min + 1) {
          this.$cache.min[0].style.visibility = "hidden";
        } else {
          this.$cache.min[0].style.visibility = "visible";
        }

        if (max > 100 - this.labels.p_max - 1) {
          this.$cache.max[0].style.visibility = "hidden";
        } else {
          this.$cache.max[0].style.visibility = "visible";
        }
      }
    },

    /**
     * Draw shadow intervals
     */
    drawShadow: function drawShadow() {
      var o = this.options,
          c = this.$cache,
          is_from_min = typeof o.from_min === "number" && !isNaN(o.from_min),
          is_from_max = typeof o.from_max === "number" && !isNaN(o.from_max),
          is_to_min = typeof o.to_min === "number" && !isNaN(o.to_min),
          is_to_max = typeof o.to_max === "number" && !isNaN(o.to_max),
          from_min,
          from_max,
          to_min,
          to_max;

      if (o.type === "single") {
        if (o.from_shadow && (is_from_min || is_from_max)) {
          from_min = this.convertToPercent(is_from_min ? o.from_min : o.min);
          from_max = this.convertToPercent(is_from_max ? o.from_max : o.max) - from_min;
          from_min = this.toFixed(from_min - this.coords.p_handle / 100 * from_min);
          from_max = this.toFixed(from_max - this.coords.p_handle / 100 * from_max);
          from_min = from_min + this.coords.p_handle / 2;
          c.shad_single[0].style.display = "block";
          c.shad_single[0].style.left = from_min + "%";
          c.shad_single[0].style.width = from_max + "%";
        } else {
          c.shad_single[0].style.display = "none";
        }
      } else {
        if (o.from_shadow && (is_from_min || is_from_max)) {
          from_min = this.convertToPercent(is_from_min ? o.from_min : o.min);
          from_max = this.convertToPercent(is_from_max ? o.from_max : o.max) - from_min;
          from_min = this.toFixed(from_min - this.coords.p_handle / 100 * from_min);
          from_max = this.toFixed(from_max - this.coords.p_handle / 100 * from_max);
          from_min = from_min + this.coords.p_handle / 2;
          c.shad_from[0].style.display = "block";
          c.shad_from[0].style.left = from_min + "%";
          c.shad_from[0].style.width = from_max + "%";
        } else {
          c.shad_from[0].style.display = "none";
        }

        if (o.to_shadow && (is_to_min || is_to_max)) {
          to_min = this.convertToPercent(is_to_min ? o.to_min : o.min);
          to_max = this.convertToPercent(is_to_max ? o.to_max : o.max) - to_min;
          to_min = this.toFixed(to_min - this.coords.p_handle / 100 * to_min);
          to_max = this.toFixed(to_max - this.coords.p_handle / 100 * to_max);
          to_min = to_min + this.coords.p_handle / 2;
          c.shad_to[0].style.display = "block";
          c.shad_to[0].style.left = to_min + "%";
          c.shad_to[0].style.width = to_max + "%";
        } else {
          c.shad_to[0].style.display = "none";
        }
      }
    },

    /**
     * Write values to input element
     */
    writeToInput: function writeToInput() {
      if (this.options.type === "single") {
        if (this.options.values.length) {
          this.$cache.input.prop("value", this.result.from_value);
        } else {
          this.$cache.input.prop("value", this.result.from);
        }

        this.$cache.input.data("from", this.result.from);
      } else {
        if (this.options.values.length) {
          this.$cache.input.prop("value", this.result.from_value + this.options.input_values_separator + this.result.to_value);
        } else {
          this.$cache.input.prop("value", this.result.from + this.options.input_values_separator + this.result.to);
        }

        this.$cache.input.data("from", this.result.from);
        this.$cache.input.data("to", this.result.to);
      }
    },
    // =============================================================================================================
    // Callbacks
    callOnStart: function callOnStart() {
      this.writeToInput();

      if (this.options.onStart && typeof this.options.onStart === "function") {
        if (this.options.scope) {
          this.options.onStart.call(this.options.scope, this.result);
        } else {
          this.options.onStart(this.result);
        }
      }
    },
    callOnChange: function callOnChange() {
      this.writeToInput();

      if (this.options.onChange && typeof this.options.onChange === "function") {
        if (this.options.scope) {
          this.options.onChange.call(this.options.scope, this.result);
        } else {
          this.options.onChange(this.result);
        }
      }
    },
    callOnFinish: function callOnFinish() {
      this.writeToInput();

      if (this.options.onFinish && typeof this.options.onFinish === "function") {
        if (this.options.scope) {
          this.options.onFinish.call(this.options.scope, this.result);
        } else {
          this.options.onFinish(this.result);
        }
      }
    },
    callOnUpdate: function callOnUpdate() {
      this.writeToInput();

      if (this.options.onUpdate && typeof this.options.onUpdate === "function") {
        if (this.options.scope) {
          this.options.onUpdate.call(this.options.scope, this.result);
        } else {
          this.options.onUpdate(this.result);
        }
      }
    },
    // =============================================================================================================
    // Service methods
    toggleInput: function toggleInput() {
      this.$cache.input.toggleClass("irs-hidden-input");

      if (this.has_tab_index) {
        this.$cache.input.prop("tabindex", -1);
      } else {
        this.$cache.input.removeProp("tabindex");
      }

      this.has_tab_index = !this.has_tab_index;
    },

    /**
     * Convert real value to percent
     *
     * @param value {Number} X in real
     * @param no_min {boolean=} don't use min value
     * @returns {Number} X in percent
     */
    convertToPercent: function convertToPercent(value, no_min) {
      var diapason = this.options.max - this.options.min,
          one_percent = diapason / 100,
          val,
          percent;

      if (!diapason) {
        this.no_diapason = true;
        return 0;
      }

      if (no_min) {
        val = value;
      } else {
        val = value - this.options.min;
      }

      percent = val / one_percent;
      return this.toFixed(percent);
    },

    /**
     * Convert percent to real values
     *
     * @param percent {Number} X in percent
     * @returns {Number} X in real
     */
    convertToValue: function convertToValue(percent) {
      var min = this.options.min,
          max = this.options.max,
          min_decimals = min.toString().split(".")[1],
          max_decimals = max.toString().split(".")[1],
          min_length,
          max_length,
          avg_decimals = 0,
          abs = 0;

      if (percent === 0) {
        return this.options.min;
      }

      if (percent === 100) {
        return this.options.max;
      }

      if (min_decimals) {
        min_length = min_decimals.length;
        avg_decimals = min_length;
      }

      if (max_decimals) {
        max_length = max_decimals.length;
        avg_decimals = max_length;
      }

      if (min_length && max_length) {
        avg_decimals = min_length >= max_length ? min_length : max_length;
      }

      if (min < 0) {
        abs = Math.abs(min);
        min = +(min + abs).toFixed(avg_decimals);
        max = +(max + abs).toFixed(avg_decimals);
      }

      var number = (max - min) / 100 * percent + min,
          string = this.options.step.toString().split(".")[1],
          result;

      if (string) {
        number = +number.toFixed(string.length);
      } else {
        number = number / this.options.step;
        number = number * this.options.step;
        number = +number.toFixed(0);
      }

      if (abs) {
        number -= abs;
      }

      if (string) {
        result = +number.toFixed(string.length);
      } else {
        result = this.toFixed(number);
      }

      if (result < this.options.min) {
        result = this.options.min;
      } else if (result > this.options.max) {
        result = this.options.max;
      }

      return result;
    },

    /**
     * Round percent value with step
     *
     * @param percent {Number}
     * @returns percent {Number} rounded
     */
    calcWithStep: function calcWithStep(percent) {
      var rounded = Math.round(percent / this.coords.p_step) * this.coords.p_step;

      if (rounded > 100) {
        rounded = 100;
      }

      if (percent === 100) {
        rounded = 100;
      }

      return this.toFixed(rounded);
    },
    checkMinInterval: function checkMinInterval(p_current, p_next, type) {
      var o = this.options,
          current,
          next;

      if (!o.min_interval) {
        return p_current;
      }

      current = this.convertToValue(p_current);
      next = this.convertToValue(p_next);

      if (type === "from") {
        if (next - current < o.min_interval) {
          current = next - o.min_interval;
        }
      } else {
        if (current - next < o.min_interval) {
          current = next + o.min_interval;
        }
      }

      return this.convertToPercent(current);
    },
    checkMaxInterval: function checkMaxInterval(p_current, p_next, type) {
      var o = this.options,
          current,
          next;

      if (!o.max_interval) {
        return p_current;
      }

      current = this.convertToValue(p_current);
      next = this.convertToValue(p_next);

      if (type === "from") {
        if (next - current > o.max_interval) {
          current = next - o.max_interval;
        }
      } else {
        if (current - next > o.max_interval) {
          current = next + o.max_interval;
        }
      }

      return this.convertToPercent(current);
    },
    checkDiapason: function checkDiapason(p_num, min, max) {
      var num = this.convertToValue(p_num),
          o = this.options;

      if (typeof min !== "number") {
        min = o.min;
      }

      if (typeof max !== "number") {
        max = o.max;
      }

      if (num < min) {
        num = min;
      }

      if (num > max) {
        num = max;
      }

      return this.convertToPercent(num);
    },
    toFixed: function toFixed(num) {
      num = num.toFixed(20);
      return +num;
    },
    _prettify: function _prettify(num) {
      if (!this.options.prettify_enabled) {
        return num;
      }

      if (this.options.prettify && typeof this.options.prettify === "function") {
        return this.options.prettify(num);
      } else {
        return this.prettify(num);
      }
    },
    prettify: function prettify(num) {
      var n = num.toString();
      return n.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1" + this.options.prettify_separator);
    },
    checkEdges: function checkEdges(left, width) {
      if (!this.options.force_edges) {
        return this.toFixed(left);
      }

      if (left < 0) {
        left = 0;
      } else if (left > 100 - width) {
        left = 100 - width;
      }

      return this.toFixed(left);
    },
    validate: function validate() {
      var o = this.options,
          r = this.result,
          v = o.values,
          vl = v.length,
          value,
          i;
      if (typeof o.min === "string") o.min = +o.min;
      if (typeof o.max === "string") o.max = +o.max;
      if (typeof o.from === "string") o.from = +o.from;
      if (typeof o.to === "string") o.to = +o.to;
      if (typeof o.step === "string") o.step = +o.step;
      if (typeof o.from_min === "string") o.from_min = +o.from_min;
      if (typeof o.from_max === "string") o.from_max = +o.from_max;
      if (typeof o.to_min === "string") o.to_min = +o.to_min;
      if (typeof o.to_max === "string") o.to_max = +o.to_max;
      if (typeof o.grid_num === "string") o.grid_num = +o.grid_num;

      if (o.max < o.min) {
        o.max = o.min;
      }

      if (vl) {
        o.p_values = [];
        o.min = 0;
        o.max = vl - 1;
        o.step = 1;
        o.grid_num = o.max;
        o.grid_snap = true;

        for (i = 0; i < vl; i++) {
          value = +v[i];

          if (!isNaN(value)) {
            v[i] = value;
            value = this._prettify(value);
          } else {
            value = v[i];
          }

          o.p_values.push(value);
        }
      }

      if (typeof o.from !== "number" || isNaN(o.from)) {
        o.from = o.min;
      }

      if (typeof o.to !== "number" || isNaN(o.to)) {
        o.to = o.max;
      }

      if (o.type === "single") {
        if (o.from < o.min) o.from = o.min;
        if (o.from > o.max) o.from = o.max;
      } else {
        if (o.from < o.min) o.from = o.min;
        if (o.from > o.max) o.from = o.max;
        if (o.to < o.min) o.to = o.min;
        if (o.to > o.max) o.to = o.max;

        if (this.update_check.from) {
          if (this.update_check.from !== o.from) {
            if (o.from > o.to) o.from = o.to;
          }

          if (this.update_check.to !== o.to) {
            if (o.to < o.from) o.to = o.from;
          }
        }

        if (o.from > o.to) o.from = o.to;
        if (o.to < o.from) o.to = o.from;
      }

      if (typeof o.step !== "number" || isNaN(o.step) || !o.step || o.step < 0) {
        o.step = 1;
      }

      if (typeof o.from_min === "number" && o.from < o.from_min) {
        o.from = o.from_min;
      }

      if (typeof o.from_max === "number" && o.from > o.from_max) {
        o.from = o.from_max;
      }

      if (typeof o.to_min === "number" && o.to < o.to_min) {
        o.to = o.to_min;
      }

      if (typeof o.to_max === "number" && o.from > o.to_max) {
        o.to = o.to_max;
      }

      if (r) {
        if (r.min !== o.min) {
          r.min = o.min;
        }

        if (r.max !== o.max) {
          r.max = o.max;
        }

        if (r.from < r.min || r.from > r.max) {
          r.from = o.from;
        }

        if (r.to < r.min || r.to > r.max) {
          r.to = o.to;
        }
      }

      if (typeof o.min_interval !== "number" || isNaN(o.min_interval) || !o.min_interval || o.min_interval < 0) {
        o.min_interval = 0;
      }

      if (typeof o.max_interval !== "number" || isNaN(o.max_interval) || !o.max_interval || o.max_interval < 0) {
        o.max_interval = 0;
      }

      if (o.min_interval && o.min_interval > o.max - o.min) {
        o.min_interval = o.max - o.min;
      }

      if (o.max_interval && o.max_interval > o.max - o.min) {
        o.max_interval = o.max - o.min;
      }
    },
    decorate: function decorate(num, original) {
      var decorated = "",
          o = this.options;

      if (o.prefix) {
        decorated += o.prefix;
      }

      decorated += num;

      if (o.max_postfix) {
        if (o.values.length && num === o.p_values[o.max]) {
          decorated += o.max_postfix;

          if (o.postfix) {
            decorated += " ";
          }
        } else if (original === o.max) {
          decorated += o.max_postfix;

          if (o.postfix) {
            decorated += " ";
          }
        }
      }

      if (o.postfix) {
        decorated += o.postfix;
      }

      return decorated;
    },
    updateFrom: function updateFrom() {
      this.result.from = this.options.from;
      this.result.from_percent = this.convertToPercent(this.result.from);
      this.result.from_pretty = this._prettify(this.result.from);

      if (this.options.values) {
        this.result.from_value = this.options.values[this.result.from];
      }
    },
    updateTo: function updateTo() {
      this.result.to = this.options.to;
      this.result.to_percent = this.convertToPercent(this.result.to);
      this.result.to_pretty = this._prettify(this.result.to);

      if (this.options.values) {
        this.result.to_value = this.options.values[this.result.to];
      }
    },
    updateResult: function updateResult() {
      this.result.min = this.options.min;
      this.result.max = this.options.max;
      this.updateFrom();
      this.updateTo();
    },
    // =============================================================================================================
    // Grid
    appendGrid: function appendGrid() {
      if (!this.options.grid) {
        return;
      }

      var o = this.options,
          i,
          z,
          total = o.max - o.min,
          big_num = o.grid_num,
          big_p = 0,
          big_w = 0,
          small_max = 4,
          local_small_max,
          small_p,
          small_w = 0,
          result,
          html = '';
      this.calcGridMargin();

      if (o.grid_snap) {
        big_num = total / o.step;
      }

      if (big_num > 50) big_num = 50;
      big_p = this.toFixed(100 / big_num);

      if (big_num > 4) {
        small_max = 3;
      }

      if (big_num > 7) {
        small_max = 2;
      }

      if (big_num > 14) {
        small_max = 1;
      }

      if (big_num > 28) {
        small_max = 0;
      }

      for (i = 0; i < big_num + 1; i++) {
        local_small_max = small_max;
        big_w = this.toFixed(big_p * i);

        if (big_w > 100) {
          big_w = 100;
        }

        this.coords.big[i] = big_w;
        small_p = (big_w - big_p * (i - 1)) / (local_small_max + 1);

        for (z = 1; z <= local_small_max; z++) {
          if (big_w === 0) {
            break;
          }

          small_w = this.toFixed(big_w - small_p * z);
          html += '<span class="irs-grid-pol small" style="left: ' + small_w + '%"></span>';
        }

        html += '<span class="irs-grid-pol" style="left: ' + big_w + '%"></span>';
        result = this.convertToValue(big_w);

        if (o.values.length) {
          result = o.p_values[result];
        } else {
          result = this._prettify(result);
        }

        html += '<span class="irs-grid-text js-grid-text-' + i + '" style="left: ' + big_w + '%">' + result + '</span>';
      }

      this.coords.big_num = Math.ceil(big_num + 1);
      this.$cache.cont.addClass("irs-with-grid");
      this.$cache.grid.html(html);
      this.cacheGridLabels();
    },
    cacheGridLabels: function cacheGridLabels() {
      var $label,
          i,
          num = this.coords.big_num;

      for (i = 0; i < num; i++) {
        $label = this.$cache.grid.find(".js-grid-text-" + i);
        this.$cache.grid_labels.push($label);
      }

      this.calcGridLabels();
    },
    calcGridLabels: function calcGridLabels() {
      var i,
          label,
          start = [],
          finish = [],
          num = this.coords.big_num;

      for (i = 0; i < num; i++) {
        this.coords.big_w[i] = this.$cache.grid_labels[i].outerWidth(false);
        this.coords.big_p[i] = this.toFixed(this.coords.big_w[i] / this.coords.w_rs * 100);
        this.coords.big_x[i] = this.toFixed(this.coords.big_p[i] / 2);
        start[i] = this.toFixed(this.coords.big[i] - this.coords.big_x[i]);
        finish[i] = this.toFixed(start[i] + this.coords.big_p[i]);
      }

      if (this.options.force_edges) {
        if (start[0] < -this.coords.grid_gap) {
          start[0] = -this.coords.grid_gap;
          finish[0] = this.toFixed(start[0] + this.coords.big_p[0]);
          this.coords.big_x[0] = this.coords.grid_gap;
        }

        if (finish[num - 1] > 100 + this.coords.grid_gap) {
          finish[num - 1] = 100 + this.coords.grid_gap;
          start[num - 1] = this.toFixed(finish[num - 1] - this.coords.big_p[num - 1]);
          this.coords.big_x[num - 1] = this.toFixed(this.coords.big_p[num - 1] - this.coords.grid_gap);
        }
      }

      this.calcGridCollision(2, start, finish);
      this.calcGridCollision(4, start, finish);

      for (i = 0; i < num; i++) {
        label = this.$cache.grid_labels[i][0];

        if (this.coords.big_x[i] !== Number.POSITIVE_INFINITY) {
          label.style.marginLeft = -this.coords.big_x[i] + "%";
        }
      }
    },
    // Collisions Calc Beta
    // TODO: Refactor then have plenty of time
    calcGridCollision: function calcGridCollision(step, start, finish) {
      var i,
          next_i,
          label,
          num = this.coords.big_num;

      for (i = 0; i < num; i += step) {
        next_i = i + step / 2;

        if (next_i >= num) {
          break;
        }

        label = this.$cache.grid_labels[next_i][0];

        if (finish[i] <= start[next_i]) {
          label.style.visibility = "visible";
        } else {
          label.style.visibility = "hidden";
        }
      }
    },
    calcGridMargin: function calcGridMargin() {
      if (!this.options.grid_margin) {
        return;
      }

      this.coords.w_rs = this.$cache.rs.outerWidth(false);

      if (!this.coords.w_rs) {
        return;
      }

      if (this.options.type === "single") {
        this.coords.w_handle = this.$cache.s_single.outerWidth(false);
      } else {
        this.coords.w_handle = this.$cache.s_from.outerWidth(false);
      }

      this.coords.p_handle = this.toFixed(this.coords.w_handle / this.coords.w_rs * 100);
      this.coords.grid_gap = this.toFixed(this.coords.p_handle / 2 - 0.1);
      this.$cache.grid[0].style.width = this.toFixed(100 - this.coords.p_handle) + "%";
      this.$cache.grid[0].style.left = this.coords.grid_gap + "%";
    },
    // =============================================================================================================
    // Public methods
    update: function update(options) {
      if (!this.input) {
        return;
      }

      this.is_update = true;
      this.options.from = this.result.from;
      this.options.to = this.result.to;
      this.update_check.from = this.result.from;
      this.update_check.to = this.result.to;
      this.options = $__default["default"].extend(this.options, options);
      this.validate();
      this.updateResult(options);
      this.toggleInput();
      this.remove();
      this.init(true);
    },
    reset: function reset() {
      if (!this.input) {
        return;
      }

      this.updateResult();
      this.update();
    },
    destroy: function destroy() {
      if (!this.input) {
        return;
      }

      this.toggleInput();
      this.$cache.input.prop("readonly", false);
      $__default["default"].data(this.input, "mSlider", null);
      this.remove();
      this.input = null;
      this.options = null;
    }
  };

  var mOperator = function mOperator(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.defaults = {
      item: [{
        operator: '',
        operator_index: 0,
        value: ''
      }],
      operator_order: ['-', '>', '<', '==', '>=', '<=', '!='],
      item_min: 1,
      item_max: 3,
      numerical: true,
      limit: {
        min: -Infinity,
        max: Infinity
      }
    };
    this.string = {
      Operator: 'Operator',
      Value: 'Value'
    };

    if (options.string) {
      this.string = options.string;
    }

    this.options = Object.assign({
      item: [{
        operator: '',
        operator_index: 0,
        value: ''
      }],
      operator_order: ['-', '>', '<', '==', '>=', '<=', '!='],
      item_min: 1,
      item_max: 3,
      numerical: true,
      limit: {
        min: -Infinity,
        max: Infinity
      }
    }, options);
    this.$element.on('click', '.moperator-btn.addbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.moperator-btn.delbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.deleteItem(ev.currentTarget);
    }, this));
    this.$element.on('change', '.moperator-input', $__default["default"].proxy(function callToggle(ev) {
      // ev.stopImmediatePropagation();
      if (this.options.numerical) {
        this.verifyValueRule(ev.currentTarget);
      }
    }, this));
    this.populate();
  };

  mOperator.prototype = {
    clear: function clear() {
      this.options = {
        item: [{
          operator: '',
          operator_index: 0,
          value: ''
        }],
        operator_order: ['-', '>', '<', '==', '>=', '<=', '!='],
        item_min: 1,
        item_max: 3,
        numerical: true,
        limit: {
          min: -Infinity,
          max: Infinity
        }
      };
      this.populate();
    },
    destroy: function destroy() {
      this.$element.find('table.moperator').off();
      this.$element.find('table.moperator').remove();
      this.$element.data('daai.operationtable');
      this.$element.removeData('daai.operationtable');
      this.$element.data('daai.operationtable');
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({
        item: [{
          operator: '',
          operator_index: 0,
          value: ''
        }],
        operator_order: this.options.operator_order,
        item_min: 1,
        item_max: 3,
        numerical: true,
        limit: {
          min: -Infinity,
          max: Infinity
        }
      }, options);
      this.populate();
    },
    resetTable: function resetTable() {
      this.options.item = [{
        operator: '',
        operator_index: 0,
        value: ''
      }];
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    populate: function populate() {
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    render: function render() {
      var da = this.options;

      for (var i = 0, len = da.item.length; i < len; i++) {
        var sel = da.operator_order.indexOf(da.item[i].operator);
        da.item[i].operator_index = sel == -1 ? 0 : sel;
      }

      var html = '';
      html += '<table class="moperator" id="' + this.uiid + '">';
      html += '  <thead class="moperator-header">';
      html += '    <tr>';
      html += '      <td class="moperator-title moperator-title-left" id="' + this.uiid + '-title-left">' + this.string.Operator + '</td>';
      html += '      <td class="moperator-title moperator-title-right" id="' + this.uiid + '-title-right">' + this.string.Value + '</td>';
      html += '      <td></td>';
      html += '    </tr>';
      html += '  </thead>';
      html += '  <tbody class="moperator-body">';

      for (var _i = 0, _len = da.item.length > da.item_max ? da.item_max : da.item.length; _i < _len; _i++) {
        html += '<tr class="moperator-item ' + this.uiid + '-item" data-item="' + _i + '">';
        html += '  <td class="moperator-td">';
        html += '    <select class="moperator-select ' + this.uiid + '-select" data-item="' + _i + '">';

        for (var w = 0, ln = da.operator_order.length; w < ln; w += 1) {
          html += '      <option value="' + w + '" ' + (da.item[_i].operator_index == w ? ' selected' : '') + '>' + da.operator_order[w] + '</option>';
        }

        html += '    </select>';
        html += '  </td>';
        html += '  <td class="moperator-td">';

        if (da.numerical) {
          html += '    <input class="moperator-input ' + this.uiid + '-input" type="text" value="' + da.item[_i].value + '" data-item="' + _i + '" data-previous="' + (da.item[_i].previous_value ? da.item[_i].previous_value : '') + '" data-min="' + (da.limit.min ? da.limit.min : -Infinity) + '" data-max="' + (da.limit.max ? da.limit.max : Infinity) + '">';
        } else {
          html += '    <input class="moperator-input ' + this.uiid + '-input" type="text" value="' + da.item[_i].value + '" data-item="' + _i + '">';
        }

        html += '  </td>';
        html += '  <td class="moperator-td moperator-btns">';
        html += '    <span class="moperator-btn addbtn" data-item="' + _i + '"><i class="fas fa-plus"></i></span>';
        html += '    <span class="moperator-btn delbtn" data-item="' + _i + '"><i class="fas fa-minus"></i></span>';
        html += '  </td>';
        html += '</tr>';
      }

      html += '  </tbody>';
      html += '</table>';
      return html;
    },
    addItem: function addItem(el) {
      var item = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();

      if ($__default["default"](el).hasClass('addbtn')) {
        if (items.length < this.options.item_max) {
          items.splice(item + 1, 0, {
            operator: '',
            operator_index: 0,
            value: ''
          });
        }
      }

      this.options.item = items;
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    deleteItem: function deleteItem(el) {
      var item = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();

      if ($__default["default"](el).hasClass('delbtn')) {
        if (items.length > this.options.item_min) {
          items.splice(item, 1);
        }
      }

      this.options.item = items;
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    getCurrentItems: function getCurrentItems() {
      var items = [];
      $__default["default"]('.' + this.uiid + '-item').each(function (e) {
        items.push({
          operator: '',
          operator_index: 0,
          value: '',
          previous_value: ''
        });
      });
      items.sort(function (a, b) {
        return a.item > b.item ? 1 : -1;
      });
      $__default["default"]('.' + this.uiid + '-select').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        var operator = $__default["default"](this).find('option:selected').text();
        items[item].operator = operator;
      });
      $__default["default"]('.' + this.uiid + '-input').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        var value = $__default["default"](this).val();
        var previous_value = $__default["default"](this).attr('data-previous');
        items[item].value = value;
        items[item].previous_value = previous_value;
      });
      return items;
    },
    getItems: function getItems() {
      var da = this.getCurrentItems();
      var tmp = [];
      var items = [];

      for (var i = 0, len = da.length; i < len; i++) {
        tmp.push({
          operator: '',
          operator_index: 0,
          value: ''
        });
        var sel = this.options.operator_order.indexOf(da[i].operator);
        tmp[i].operator_index = sel == -1 ? 0 : sel;
        tmp[i].operator = da[i].operator;
        tmp[i].value = da[i].value;
      }

      for (var w = 0, ln = tmp.length; w < ln; w++) {
        if (tmp[w].operator == '-' && tmp[w].value == '') {
          continue;
        }

        items.push({
          operator: tmp[w].operator,
          operator_index: tmp[w].operator_index,
          value: tmp[w].value
        });
      }

      return items;
    },
    itemBannedAction: function itemBannedAction() {
      if (!this.options.item || this.options.item.length < 1) {
        this.options.item = [];
      }

      if (this.options.item.length <= this.options.item_min) {
        $__default["default"]('#' + this.uiid).find('.moperator-btn.delbtn').addClass('banned-action');
      } else if (this.options.item.length >= this.options.item_max) {
        $__default["default"]('#' + this.uiid).find('.moperator-btn.addbtn').addClass('banned-action');
      }
    },
    verifyValueRule: function verifyValueRule(el) {
      var value = Number($__default["default"](el).val());
      var min = Number($__default["default"](el).attr('data-min'));
      var max = Number($__default["default"](el).attr('data-max'));
      var previous = $__default["default"](el).attr('data-previous');
      value = parseInt(value);

      if (!isNaN(Number(value)) && value >= min && value <= max) {
        $__default["default"](el).attr('data-previous', value);
      } else {
        $__default["default"](el).val(previous);
      }
    }
  };

  var mSelector = function mSelector(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.defaults = {
      item_min: 1,
      item_max: 3,
      item: [{
        left_value: '',
        left_label: '-',
        right_value: '-',
        right_label: '-'
      }],
      left: [{
        value: '',
        label: '-'
      }],
      right: [{
        value: '',
        label: '-'
      }]
    };
    this.string = {
      Left: 'Left Table',
      Right: 'Right Table'
    };

    if (options.string) {
      this.string = options.string;
    }

    this.options = Object.assign({
      item_min: 1,
      item_max: 3,
      item: [{
        left_value: '',
        left_label: '-',
        right_value: '-',
        right_label: '-'
      }],
      left: [{
        value: '',
        label: '-'
      }],
      right: [{
        value: '',
        label: '-'
      }]
    }, options);
    this.$element.on('click', '.addbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.delbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.deleteItem(ev.currentTarget);
    }, this));
    this.populate();
  };

  mSelector.prototype = {
    clear: function clear() {
      this.options = {
        item_min: 1,
        item_max: 3,
        item: [{
          left_value: '',
          left_label: '-',
          right_value: '-',
          right_label: '-'
        }],
        left: this.options.left,
        right: this.options.right
      };
      this.populate();
    },
    destroy: function destroy() {
      this.$element.find('table.mselector').off();
      this.$element.find('table.mselector').remove();
      this.$element.data('daai.mselector');
      this.$element.removeData('daai.mselector');
      this.$element.data('daai.mselector');
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({
        item_min: 1,
        item_max: 3,
        item: [{
          left_value: '',
          left_label: '-',
          right_value: '-',
          right_label: '-'
        }],
        left: this.options.left,
        right: this.options.right
      }, options);
      this.populate();
    },
    populate: function populate() {
      if (this.options.item.length != 0) {
        var item = [];

        for (var i = 0, len = this.options.item.length; i < len; i++) {
          if (!this.options.item[i].hasOwnProperty('left_value') || !this.options.item[i].hasOwnProperty('left_label') || !this.options.item[i].hasOwnProperty('right_value') || !this.options.item[i].hasOwnProperty('right_label')) {
            continue;
          }

          item.push(this.options.item[i]);
        }

        this.options.item = item;
      }

      if (this.options.item.length == 0) {
        this.options.item = [{
          left_value: '',
          left_label: '-',
          right_value: '',
          right_label: '-'
        }];
      }

      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    render: function render() {
      var da = this.options;
      var html = '';
      html += '<table class="mselector" id="' + this.uiid + '-table">';
      html += '  <thead class="mselector-header">';
      html += '    <tr>';
      html += '      <td class="mselector-title mselector-title-left" id="' + this.uiid + '-title-left">' + this.string.Left + '</td>';
      html += '      <td class="mselector-title mselector-title-right" id="' + this.uiid + '-title-right">' + this.string.Right + '</td>';
      html += '      <td></td>';
      html += '    </tr>';
      html += '  </thead>';
      html += '  <tbody class="mselector-body">';
      var leftselected = [];
      var rightselected = [];

      for (var i = 0, len = da.item.length > da.item_max ? da.item_max : da.item.length; i < len; i++) {
        var left = this.genList(da.item[i].left_value, leftselected, da.left);
        var right = this.genList(da.item[i].right_value, rightselected, da.right);
        html += '    <tr class="mselector-item ' + this.uiid + '-item' + '" data-item="' + i + '">';
        html += '      <td class="mselector-td">';
        html += '        <select class="mselector-select mselector-left ' + this.uiid + '-select" data-item="' + i + '">';
        html += '          <option value="">-</option>';
        html += left;
        html += '        </select>';
        html += '      </td>';
        html += '      <td class="mselector-td">';
        html += '        <select class="mselector-select mselector-right ' + this.uiid + '-select" data-item="' + i + '">';
        html += '          <option value="">-</option>';
        html += right;
        html += '        </select>';
        html += '      </td>';
        html += '      <td class="mselector-td mselector-btns">';
        html += '        <span class="mselector-btn addbtn" data-item="' + i + '"><i class="fas fa-plus"></i></span>';
        html += '        <span class="mselector-btn delbtn" data-item="' + i + '"><i class="fas fa-minus"></i></span>';
        html += '      </td>';
        html += '    </tr>';
        leftselected.push(da.item[i].left_value);
        rightselected.push(da.item[i].right_value);
      }

      html += '  </tbody>';
      html += '</table>';
      return html;
    },
    genList: function genList(curitem, selectedlist, list) {
      var html = '';

      for (var i = 0, hidden = '', selected = '', len = list.length; i < len; i++, hidden = '', selected = '') {
        selected = list[i].value == curitem ? ' selected ' : '';

        for (var w = 0, ln = selectedlist.length; w < ln; w++) {
          if (list[i].value == selectedlist[w]) {
            hidden = ' hidden ';
            break;
          }
        }

        if (!(list[i].value == '' && list[i].label == '-')) {
          html += '<option value="' + list[i].value + '"' + selected + hidden + '>' + list[i].label + '</option>';
        }
      }

      return html;
    },
    addItem: function addItem(el) {
      var idx = parseInt($__default["default"](el).attr('data-item'));
      var item = this.getCurrentItems();

      if (item.length < this.options.item_max) {
        if (!(item[idx].left_value === '' || item[idx].right_value === '')) {
          item.splice(idx + 1, 0, {
            left_value: '',
            left_label: '-',
            right_value: '',
            right_label: '-'
          });
        }
      }

      this.options.item = item;
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    deleteItem: function deleteItem(el) {
      var idx = parseInt($__default["default"](el).attr('data-item'));
      var item = this.getCurrentItems();

      if (item.length > this.options.item_min) {
        item.splice(idx, 1);
      }

      this.options.item = item;
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    getCurrentItems: function getCurrentItems() {
      var item = [];
      $__default["default"]('.' + this.uiid + '-item').each(function (e) {
        item.push({
          left_value: '',
          left_label: '',
          right_value: '',
          right_label: ''
        });
      });
      $__default["default"]('.' + this.uiid + '-select.mselector-left').each(function (e) {
        var idx = parseInt($__default["default"](this).attr('data-item'));
        var selected_val = $__default["default"](this).find('option:selected').val();
        var selected_text = $__default["default"](this).find('option:selected').text();
        item[idx].left_value = selected_val;
        item[idx].left_label = selected_text;
      });
      $__default["default"]('.' + this.uiid + '-select.mselector-right').each(function (e) {
        var idx = parseInt($__default["default"](this).attr('data-item'));
        var selected_val = $__default["default"](this).find('option:selected').val();
        var selected_text = $__default["default"](this).find('option:selected').text();
        item[idx].right_value = selected_val;
        item[idx].right_label = selected_text;
      });
      return item;
    },
    getItems: function getItems() {
      var da = this.getCurrentItems();
      var item = [];

      for (var i = 0, len = da.length; i < len; i++) {
        if (da[i].left_value === '' && da[i].left_label === '-' && da[i].right_value === '' && da[i].right_label === '-') {
          continue;
        }

        item.push({
          left_value: da[i].left_value,
          left_label: da[i].left_label,
          right_value: da[i].right_value,
          right_label: da[i].right_label
        });
      }

      return item;
    },
    itemBannedAction: function itemBannedAction() {
      if (!this.options.item || this.options.item.length < 1) {
        this.options.item = [];
      }

      if (this.options.item.length <= this.options.item_min) {
        $__default["default"]('#' + this.uiid).find('.mselector-btn.delbtn').addClass('mselector-banned-action');
      } else if (this.options.item.length >= this.options.item_max) {
        $__default["default"]('#' + this.uiid).find('.mselector-btn.addbtn').addClass('mselector-banned-action');
      }

      $__default["default"]('.' + this.uiid + '-item:not(:last-child)').each(function (i, e) {
        $__default["default"](this).find('.mselector-select').addClass('mselector-banned-action');
        $__default["default"](this).find('.mselector-btn.addbtn').addClass('mselector-banned-action');
      });
    }
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /**
   * The Base class for all Nodes.
   */
  var Segments = /*#__PURE__*/function () {
    /**
     * @param {object} options
     * @param {object} body
     * @param {Label} labelModule
     * @param captionModule
     */
    function Segments(min, max) {
      _classCallCheck(this, Segments);

      this.options = {
        min: min,
        max: max
      };
      this.occupation = [];
      this.availability = [{
        min: min,
        max: max
      }];
    }
    /**
     *
     * @param {array} occupied_segments object with min and max value
     */


    _createClass(Segments, [{
      key: "setOccupation",
      value: function setOccupation(occ) {
        var _this = this;

        this.occupation.length = 0;
        occ.forEach(function (elem) {
          if (elem.hasOwnProperty('min') && elem.hasOwnProperty('max') && elem.min <= elem.max && elem.min >= _this.options.min && elem.min <= _this.options.max && elem.max >= _this.options.min && elem.max <= _this.options.max) {
            _this.occupation.push({
              min: elem.min,
              max: elem.max
            });
          }
        });
        this.occupation.sort(function (a, b) {
          return a.min > b.min ? 1 : -1;
        });

        this._updateAvailability();

        return this;
      }
      /**
       *
       * @param {array} occupied_segments object with min and max value
       */

    }, {
      key: "getOccupation",
      value: function getOccupation() {
        return this.occupation;
      }
      /**
      *
      * @param {array} availabile_segments object with min and max value
      */

    }, {
      key: "setAvailability",
      value: function setAvailability(avail) {
        var _this2 = this;

        this.availability.length = 0;
        avail.forEach(function (elem) {
          if (elem.hasOwnProperty('min') && elem.hasOwnProperty('max') && elem.min <= elem.max && elem.min >= _this2.options.min && elem.min <= _this2.options.max && elem.max >= _this2.options.min && elem.max <= _this2.options.max) {
            _this2.availability.push({
              min: elem.min,
              max: elem.max
            });
          }
        });
        this.availability.sort(function (a, b) {
          return a.min > b.min ? 1 : -1;
        });

        this._updateOccupation();

        return this;
      }
      /**
      *
      * @param {array} availabile_segments object with min and max value
      */

    }, {
      key: "getAvailability",
      value: function getAvailability(avail) {
        return this.availability;
      }
      /**
      *
      * @param {object} current_segment Current Segment object with min and max value
      * @param {object} new_segment New Segment object with min and max value
      */

    }, {
      key: "matchSegment",
      value: function matchSegment(curSeg, newSeg) {
        if (this._segInSegment(newSeg, this.availability)) {
          return newSeg;
        }

        if (curSeg.min != newSeg.min) {
          var start = this._isPtInSegment(newSeg.min, this.availability, true, true);

          var end = this._isPtInSegment(newSeg.max, this.availability, true, true);

          if (start) {
            var adjpos = this._ptInSegment(newSeg.min, this.availability, true, false);

            if (adjpos) {
              if (this._segInSegment({
                min: newSeg.min,
                max: adjpos.max
              }, this.availability, true)) {
                return {
                  min: newSeg.min,
                  max: adjpos.max
                };
              }

              return adjpos;
            }
          } else if (end) {
            var _adjpos = this._ptInSegment(newSeg.max, this.availability, false, true);

            if (_adjpos) {
              if (this._segInSegment({
                min: _adjpos.min,
                max: newSeg.max
              }, this.availability, true)) {
                return {
                  min: _adjpos.min,
                  max: newSeg.max
                };
              }

              return _adjpos;
            }
          }
        } else {
          var _start = this._isPtInSegment(newSeg.min, this.availability, true, true);

          var _end = this._isPtInSegment(newSeg.max, this.availability, true, true);

          if (_end) {
            var _adjpos2 = this._ptInSegment(newSeg.max, this.availability, false, true);

            if (_adjpos2) {
              if (this._segInSegment({
                min: _adjpos2.min,
                max: newSeg.max
              }, this.availability, true)) {
                return {
                  min: _adjpos2.min,
                  max: newSeg.max
                };
              }

              return _adjpos2;
            }
          } else if (_start) {
            var _adjpos3 = this._ptInSegment(newSeg.min, this.availability, true, false);

            if (_adjpos3) {
              if (this._segInSegment({
                min: newSeg.min,
                max: _adjpos3.max
              }, this.availability, true)) {
                return {
                  min: newSeg.min,
                  max: _adjpos3.max
                };
              }

              return _adjpos3;
            }
          }
        }

        return this.availability.length > 0 ? this.availability[0] : curSeg;
      }
      /**
      *
      * @param {array} avail availabile object with min and max value
      */

    }, {
      key: "_updateAvailability",
      value: function _updateAvailability() {
        this.availability.length = 0;
        var pos = this.options.min;

        for (var i = 0, len = this.occupation.length; i < len; i++) {
          if (pos < this.occupation[i].min) {
            this.availability.push({
              min: pos,
              max: this.occupation[i].min
            });
          }

          pos = this.occupation[i].max;
        }

        if (pos < this.options.max) {
          this.availability.push({
            min: pos,
            max: this.options.max
          });
        }
      }
      /**
      *
      * @param {array} occ occupied object with min and max value
      */

    }, {
      key: "_updateOccupation",
      value: function _updateOccupation() {
        this.occupation.length = 0;
        var pos = this.options.min;

        for (var i = 0, len = this.availability.length; i < len; i++) {
          if (pos < this.availability[i].min) {
            this.occupation.push({
              min: pos,
              max: this.availability[i].min
            });
          }

          pos = this.availability[i].max;
        }

        if (pos < this.options.max) {
          this.occupation.push({
            min: pos,
            max: this.options.max
          });
        }
      }
      /**
      *
      * @param {segment object} x segment object with min and max value
      * @param {segment object array} y array of segment object with min and max value
      * @param {boolean} canTouch include or exclude
      */

    }, {
      key: "_segInSegment",
      value: function _segInSegment(x, y) {
        var canTouch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        for (var i = 0, len = y.length; i < len; i++) {
          if (canTouch && x.min >= y[i].min && x.min <= y[i].max && x.max >= y[i].min && x.max <= y[i].max || !canTouch && x.min > y[i].min && x.min < y[i].max && x.max > y[i].min && x.max < y[i].max) {
            return y[i];
          }
        }

        return null;
      }
      /**
      *
      * @param {segment object} x segment object with min and max value
      * @param {segment object array} y array of segment object with min and max value
      * @param {boolean} touchMin include or exclude
      * @param {boolean} touchMax include or exclude
      */

    }, {
      key: "_ptInSegment",
      value: function _ptInSegment(x, y) {
        var touchMin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var touchMax = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        for (var i = 0, len = y.length; i < len; i++) {
          if (touchMin && x >= y[i].min && touchMax && x <= y[i].max || !touchMin && x > y[i].min && touchMax && x <= y[i].max || touchMin && x >= y[i].min && !touchMax && x < y[i].max || !touchMin && x > y[i].min && !touchMax && x < y[i].max) {
            return {
              min: y[i].min,
              max: y[i].max
            };
          }
        }

        return null;
      }
      /**
      *
      * @param {segment object} x segment object with min and max value
      * @param {segment object array} y array of segment object with min and max value
      * @param {boolean} touchMin include or exclude
      * @param {boolean} touchMax include or exclude
      */

    }, {
      key: "_isPtInSegment",
      value: function _isPtInSegment(x, y) {
        var touchMin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var touchMax = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        for (var i = 0, len = y.length; i < len; i++) {
          if (touchMin && x >= y[i].min && touchMax && x <= y[i].max || !touchMin && x > y[i].min && touchMax && x <= y[i].max || touchMin && x >= y[i].min && !touchMax && x < y[i].max || !touchMin && x > y[i].min && !touchMax && x < y[i].max) {
            return true;
          }
        }

        return false;
      }
    }]);

    return Segments;
  }();

  var mSliders = function mSliders(element, options) {
    this.$element = $__default["default"](element);
    this.defaults = {
      item_min: 1,
      item_max: 3,
      item: [{
        name: '',
        from: 0,
        to: 100
      }],
      replace: false,
      limit: {
        min: 0,
        max: 100
      }
    };
    this.options = Object.assign({
      item_min: 1,
      item_max: 3,
      item: [{
        name: '',
        from: 0,
        to: 100
      }],
      replace: false,
      limit: {
        min: 0,
        max: 100
      }
    }, options);
    this.uiid = this.$element.attr('id');
    this.sliders = [];
    this.onSilderFinishCb = this.onSilderFinish.bind(this);
    this.seg = new Segments(this.options.limit.min, this.options.limit.max);
    this.$element.on('click', '.addbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.delbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.deleteItem(ev.currentTarget);
    }, this));
    this.$element.on('input', '.msliders-input', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      $__default["default"](ev.currentTarget).next().hide();
    }, this));
    this.populate();
  };

  mSliders.prototype = {
    clear: function clear() {
      this.options = {
        item_min: 1,
        item_max: 3,
        item: [{
          name: '',
          from: 0,
          to: 100
        }],
        replace: false,
        limit: {
          min: 0,
          max: 100
        }
      };
      this.setSlider();
      this.itemBannedAction();
    },
    destroy: function clear() {
      this.$element.find('div.msliders-item').remove();
      this.$element.data('daai.msliders');
      this.$element.removeData('daai.msliders');
      this.$element.data('daai.msliders');
      this.$element.off();
      return this.$element[0].outerHTML;
    },
    update: function update(options) {
      this.options = Object.assign({
        item_min: 1,
        item_max: 3,
        item: [{
          name: '',
          from: 0,
          to: 100
        }],
        replace: false,
        limit: {
          min: 0,
          max: 100
        }
      }, options);
      this.setSlider();
      this.itemBannedAction();
    },
    populate: function populate() {
      var html = this.render();
      this.$element.html(html);
      this.setSlider();
      this.itemBannedAction();
    },
    render: function render() {
      var da = this.options;
      var html = '';

      for (var i = 0, len = da.item_max; i < len; i++) {
        var hidden = da.item[i] ? ' data-min="' + da.limit.min + '" data-max="' + da.limit.max + '" ' : ' style="display: none;" ';
        var value = da.item[i] ? da.item[i].name : '';
        html += '<div class="msliders-item" data-item="' + i + '" id="' + this.uiid + '-item' + i + '"' + hidden + '>';
        html += '  <div class="msliders-header">';
        html += '    <span class="msliders-title">Name</span>';
        html += '    <input class="msliders-input" type="text" value="' + value + '"><i class="fas fa-exclamation-circle msliders-icon" style="display: none;"></i>';
        html += '    <div class="msliders-btns">';
        html += '      <span class="msliders-btn addbtn" data-curr="' + this.uiid + '-item' + i + '" data-next="' + this.uiid + '-item' + (i + 1) + '"><i class="fas fa-plus"></i></span>';
        html += '      <span class="msliders-btn delbtn" data-curr="' + this.uiid + '-item' + i + '" data-prev="' + this.uiid + '-item' + (i - 1) + '"><i class="fas fa-minus"></i></span>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="msliders-body">';
        html += '    <input class="msliders-slider" id="' + this.uiid + '-slider' + i + '" type="text" data-item="' + i + '" data-prev-start="0" data-prev-end="0">';
        html += '  </div>';
        html += '</div>';
      }

      return html;
    },
    setSlider: function setSlider() {
      var opt = {};

      for (var i = 0, len = this.options.item_max; i < len; i++) {
        opt = {
          min: this.options.limit.min,
          max: this.options.limit.max,
          from: this.options.item[i] ? this.options.item[i].from : 0,
          to: this.options.item[i] ? this.options.item[i].to : 0,
          type: 'double',
          hide_min_max: true,
          keyboard: true,
          step: 1,
          prefix: '',
          force_edges: true,
          grid_num: 10,
          grid: true,
          onFinish: this.onSilderFinishCb //this.onSilderFinish.bind(this),

        };

        if (!this.sliders[i]) {
          this.sliders[i] = new mSlider('#' + this.uiid + '-slider' + i, opt, 0);
        } else {
          this.sliders[i].update(opt);
        }

        $__default["default"]('#' + this.uiid + '-slider' + i).attr('data-prev-start', opt.from).attr('data-prev-end', opt.to);
        $__default["default"]('#' + this.uiid + '-item' + i).removeClass('item-sep').removeAttr('style').hide();
        $__default["default"]('#' + this.uiid + '-item' + i).find('.msliders-btn').removeAttr('style');
      }

      for (var w = 0, ln = this.options.item.length; w < ln; w++) {
        $__default["default"]('#' + this.uiid + '-item' + w).find('.msliders-input').val(this.options.item[w].name); // $('#' + this.uiid + '-item' + w).removeAttr('style');

        if (w < ln - 1) {
          $__default["default"]('#' + this.uiid + '-item' + w).show().css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
          $__default["default"]('#' + this.uiid + '-item' + w).find('.addbtn, .delbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
        } else if (w == ln - 1) {
          $__default["default"]('#' + this.uiid + '-item' + w).show().css({
            'cursor': 'auto',
            'pointer-events': 'auto',
            'opacity': '1'
          });
          $__default["default"]('#' + this.uiid + '-item' + w).find('.addbtn, .delbtn').removeAttr('style');
        } else if (w > ln - 1) {
          $__default["default"]('#' + this.uiid + '-item' + w).hide();
        }
      }

      var range_aval = this.verifySegment();

      if (this.options.replace) {
        return;
      } else {
        if (!range_aval || range_aval.length < 1) {
          $__default["default"]('#' + this.uiid + '-item' + 0).find('.addbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
        }
      }
    },
    onSilderFinish: function onSilderFinish(data) {
      var replace = this.options.replace;

      if (replace) {
        this.itemBannedAction();
        return;
      }

      var preSeg = {
        min: parseInt($__default["default"]('#' + data.input[0].id).attr('data-prev-start')),
        max: parseInt($__default["default"]('#' + data.input[0].id).attr('data-prev-end'))
      };
      var newSeg = {
        min: data.from,
        max: data.to
      };
      var range = [];
      var idx = parseInt($__default["default"]('#' + data.input[0].id).attr('data-item'));

      if (idx < 1) {
        range = [];
      } else {
        for (var i = 0, len = idx; i < len; i++) {
          var slider = this.sliders[i];
          range.push({
            min: slider.result.from,
            max: slider.result.to
          });
        }
      }

      var adjpos = this.seg.setOccupation(range).matchSegment(preSeg, newSeg);

      if (adjpos.min != data.from || adjpos.max != data.to) {
        $__default["default"]('#' + data.input[0].id).attr('data-prev-start', adjpos.min).attr('data-prev-end', adjpos.max);

        var _idx = $__default["default"]('#' + data.input[0].id).attr('data-item');

        this.sliders[_idx].update({
          from: adjpos.min,
          to: adjpos.max
        });
      }

      var range_aval = this.verifySegment();

      if (!range_aval || range_aval.length < 1) {
        $__default["default"]('#' + this.uiid + '-item' + idx).find('.addbtn').css({
          'cursor': 'not-allowed',
          'pointer-events': 'none',
          'opacity': '0.3'
        });
      } else {
        $__default["default"]('#' + this.uiid + '-item' + idx).find('.addbtn').css({
          'cursor': 'auto',
          'pointer-events': 'auto',
          'opacity': '1'
        });
      }

      this.itemBannedAction();
    },
    addItem: function addItem(el) {
      var curr = $__default["default"](el).attr('data-curr');
      var next = $__default["default"](el).attr('data-next');
      var name = $__default["default"]('#' + curr).find('.msliders-input').val();

      if (!name) {
        $__default["default"]('#' + curr).find('.msliders-icon').show();
      } else {
        $__default["default"]('#' + curr).find('.msliders-icon').hide();
      }

      $__default["default"]('#' + next).find('.msliders-icon').hide();
      $__default["default"]('#' + next).find('.msliders-item').removeAttr('style');
      $__default["default"]('#' + next).find('.msliders-input').val('');
      var idx = $__default["default"]('#' + next).attr('data-item');
      var slider = this.sliders[idx];
      var range = this.verifySegment(); // verify name and range -> show item

      if (!this.options.replace) {
        if (name && range.length > 0) {
          $__default["default"]('#' + curr).addClass('item-sep').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
          $__default["default"]('#' + curr).find('.addbtn, .delbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '1'
          });
          slider.update({
            from: range[0].min,
            to: range[0].max
          });
          $__default["default"]('#' + next).find('.msliders-slider').attr('data-prev-start', range[0].min).attr('data-prev-end', range[0].max);
          $__default["default"]('#' + next).show();
        } // range is empty -> disable addbtn


        var range_aval = this.verifySegment();

        if (!range_aval || range_aval.length < 1) {
          $__default["default"]('#' + next).find('.addbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
        } else {
          $__default["default"]('#' + next).find('.addbtn').css({
            'cursor': 'auto',
            'pointer-events': 'auto',
            'opacity': '0.3'
          });
        }
      } else {
        if (name) {
          $__default["default"]('#' + curr).addClass('item-sep').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
          $__default["default"]('#' + curr).find('.addbtn, .delbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
          slider.update({
            from: range.length > 0 ? range[0].min : 0,
            to: range.length > 0 ? range[0].max : 100
          });
          $__default["default"]('#' + next).find('.msliders-slider').attr('data-prev-start', 0).attr('data-prev-end', 100);
          $__default["default"]('#' + next).show();
        }
      }

      this.itemBannedAction();
    },
    deleteItem: function deleteItem(el) {
      var curr = $__default["default"](el).attr('data-curr');
      var prev = $__default["default"](el).attr('data-prev');
      var idx = $__default["default"]('#' + curr).attr('data-item');
      var slider = this.sliders[idx]; // let slider = $('#' + curr).find('.msliders-slider').data('mSlider');

      $__default["default"]('#' + prev).removeClass('item-sep').css({
        'cursor': 'auto',
        'pointer-events': 'auto',
        'opacity': '1'
      });
      $__default["default"]('#' + curr).hide();
      slider.update({
        from: this.options.limit.min,
        to: this.options.limit.max
      });
      $__default["default"]('#' + prev).find('.addbtn, .delbtn').removeAttr('style');
      $__default["default"]('#' + curr).find('.msliders-input').val('');
      this.itemBannedAction();
    },
    getItems: function getItems() {
      var item = [];

      for (var i = 0, len = this.options.item_max; i < len; i++) {
        if (!($__default["default"]('#' + this.uiid + '-item' + i).css('display') == 'none')) {
          item.push({
            name: '',
            from: '',
            to: ''
          });
          var idx = $__default["default"]('#' + this.uiid + '-item' + i).attr('data-item');
          var name = $__default["default"]('#' + this.uiid + '-item' + i).find('.msliders-input').val();
          var slider = this.sliders[idx];
          item[idx].name = name;
          item[idx].from = slider.result.from;
          item[idx].to = slider.result.to;
        }
      } // let ret = this.verifyInputName();
      // console.log(ret);


      return item;
    },
    itemBannedAction: function itemBannedAction() {
      var len = $__default["default"]('#' + this.uiid).find('.msliders-item:visible').length;
      var da = this.options;
      $__default["default"]('#' + this.uiid).find('.msliders-item').each(function (e) {
        if (!($__default["default"](this).css('display') == 'none')) {
          // $('.addbtn, .delbtn').removeAttr('style');
          if (len <= da.item_min) {
            $__default["default"](this).find('.delbtn').css({
              'cursor': 'not-allowed',
              'pointer-events': 'none',
              'opacity': '0.3'
            });
          }

          if (len >= da.item_max) {
            $__default["default"](this).find('.addbtn').css({
              'cursor': 'not-allowed',
              'pointer-events': 'none',
              'opacity': '0.3'
            });
          }
        }
      }); // $('#' + this.uiid).find('.msliders-item:visible').not(':last').each(function (i, e) {
      //   $(this).css({ 'cursor': 'not-allowed', 'pointer-events': 'none', 'opacity': '0.3' });
      // });
    },
    verifySegment: function verifySegment() {
      var rangelist = [];

      for (var i = 0, len = this.options.item_max; i < len; i++) {
        if (!($__default["default"]('#' + this.uiid + '-item' + i).css('display') == 'none')) {
          var idx = $__default["default"]('#' + this.uiid + '-item' + i).attr('data-item');
          var slider = this.sliders[idx];
          rangelist.push({
            min: slider.result.from,
            max: slider.result.to
          });
        }
      }

      var range = this.seg.setOccupation(rangelist).getAvailability();
      return range;
    },
    verifyInputName: function verifyInputName() {
      var ret = true;
      $__default["default"]('#' + this.uiid).find('.msliders-item').each(function (e) {
        if (!($__default["default"](this).css('display') == 'none')) {
          var name = $__default["default"](this).find('.msliders-input').val();

          if (!name) {
            ret = false;
            $__default["default"](this).find('.msliders-icon').show();
          }
        }
      });
      return ret;
    }
  };

  var mPosition = function mPosition() {
    this.createPosition = function ($) {
      $.ui = $.ui || {};
      $.ui.version = "1.12.0";
      /*!
      * jQuery UI Position 1.12.0
      * http://jqueryui.com
      *
      * Copyright jQuery Foundation and other contributors
      * Released under the MIT license.
      * http://jquery.org/license
      *
      * http://api.jqueryui.com/position/
      */
      //>>label: Position
      //>>group: Core
      //>>description: Positions elements relative to other elements.
      //>>docs: http://api.jqueryui.com/position/
      //>>demos: http://jqueryui.com/position/

      (function () {
        var cachedScrollbarWidth,
            _supportsOffsetFractions,
            max = Math.max,
            abs = Math.abs,
            round = Math.round,
            rhorizontal = /left|center|right/,
            rvertical = /top|center|bottom/,
            roffset = /[\+\-]\d+(\.[\d]+)?%?/,
            rposition = /^\w+/,
            rpercent = /%$/,
            _position = $.fn.position; // Support: IE <=9 only


        _supportsOffsetFractions = function supportsOffsetFractions() {
          var element = $("<div>").css("position", "absolute").appendTo("body").offset({
            top: 1.5,
            left: 1.5
          }),
              support = element.offset().top === 1.5;
          element.remove();

          _supportsOffsetFractions = function supportsOffsetFractions() {
            return support;
          };

          return support;
        };

        function getOffsets(offsets, width, height) {
          return [parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1), parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)];
        }

        function parseCss(element, property) {
          return parseInt($.css(element, property), 10) || 0;
        }

        function getDimensions(elem) {
          var raw = elem[0];

          if (raw.nodeType === 9) {
            return {
              width: elem.width(),
              height: elem.height(),
              offset: {
                top: 0,
                left: 0
              }
            };
          }

          if ($.isWindow(raw)) {
            return {
              width: elem.width(),
              height: elem.height(),
              offset: {
                top: elem.scrollTop(),
                left: elem.scrollLeft()
              }
            };
          }

          if (raw.preventDefault) {
            return {
              width: 0,
              height: 0,
              offset: {
                top: raw.pageY,
                left: raw.pageX
              }
            };
          }

          return {
            width: elem.outerWidth(),
            height: elem.outerHeight(),
            offset: elem.offset()
          };
        }

        $.position = {
          scrollbarWidth: function scrollbarWidth() {
            if (cachedScrollbarWidth !== undefined) {
              return cachedScrollbarWidth;
            }

            var w1,
                w2,
                div = $("<div " + "style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" + "<div style='height:100px;width:auto;'></div></div>"),
                innerDiv = div.children()[0];
            $("body").append(div);
            w1 = innerDiv.offsetWidth;
            div.css("overflow", "scroll");
            w2 = innerDiv.offsetWidth;

            if (w1 === w2) {
              w2 = div[0].clientWidth;
            }

            div.remove();
            return cachedScrollbarWidth = w1 - w2;
          },
          getScrollInfo: function getScrollInfo(within) {
            var overflowX = within.isWindow || within.isDocument ? "" : within.element.css("overflow-x"),
                overflowY = within.isWindow || within.isDocument ? "" : within.element.css("overflow-y"),
                hasOverflowX = overflowX === "scroll" || overflowX === "auto" && within.width < within.element[0].scrollWidth,
                hasOverflowY = overflowY === "scroll" || overflowY === "auto" && within.height < within.element[0].scrollHeight;
            return {
              width: hasOverflowY ? $.position.scrollbarWidth() : 0,
              height: hasOverflowX ? $.position.scrollbarWidth() : 0
            };
          },
          getWithinInfo: function getWithinInfo(element) {
            var withinElement = $(element || window),
                isWindow = $.isWindow(withinElement[0]),
                isDocument = !!withinElement[0] && withinElement[0].nodeType === 9,
                hasOffset = !isWindow && !isDocument;
            return {
              element: withinElement,
              isWindow: isWindow,
              isDocument: isDocument,
              offset: hasOffset ? $(element).offset() : {
                left: 0,
                top: 0
              },
              scrollLeft: withinElement.scrollLeft(),
              scrollTop: withinElement.scrollTop(),
              width: withinElement.outerWidth(),
              height: withinElement.outerHeight()
            };
          }
        };

        $.fn.position = function (options) {
          if (!options || !options.of) {
            return _position.apply(this, arguments);
          } // Make a copy, we don't want to modify arguments


          options = $.extend({}, options);
          var atOffset,
              targetWidth,
              targetHeight,
              targetOffset,
              basePosition,
              dimensions,
              target = $(options.of),
              within = $.position.getWithinInfo(options.within),
              scrollInfo = $.position.getScrollInfo(within),
              collision = (options.collision || "flip").split(" "),
              offsets = {};
          dimensions = getDimensions(target);

          if (target[0].preventDefault) {
            // Force left top to allow flipping
            options.at = "left top";
          }

          targetWidth = dimensions.width;
          targetHeight = dimensions.height;
          targetOffset = dimensions.offset; // Clone to reuse original targetOffset later

          basePosition = $.extend({}, targetOffset); // Force my and at to have valid horizontal and vertical positions
          // if a value is missing or invalid, it will be converted to center

          $.each(["my", "at"], function () {
            var pos = (options[this] || "").split(" "),
                horizontalOffset,
                verticalOffset;

            if (pos.length === 1) {
              pos = rhorizontal.test(pos[0]) ? pos.concat(["center"]) : rvertical.test(pos[0]) ? ["center"].concat(pos) : ["center", "center"];
            }

            pos[0] = rhorizontal.test(pos[0]) ? pos[0] : "center";
            pos[1] = rvertical.test(pos[1]) ? pos[1] : "center"; // Calculate offsets

            horizontalOffset = roffset.exec(pos[0]);
            verticalOffset = roffset.exec(pos[1]);
            offsets[this] = [horizontalOffset ? horizontalOffset[0] : 0, verticalOffset ? verticalOffset[0] : 0]; // Reduce to just the positions without the offsets

            options[this] = [rposition.exec(pos[0])[0], rposition.exec(pos[1])[0]];
          }); // Normalize collision option

          if (collision.length === 1) {
            collision[1] = collision[0];
          }

          if (options.at[0] === "right") {
            basePosition.left += targetWidth;
          } else if (options.at[0] === "center") {
            basePosition.left += targetWidth / 2;
          }

          if (options.at[1] === "bottom") {
            basePosition.top += targetHeight;
          } else if (options.at[1] === "center") {
            basePosition.top += targetHeight / 2;
          }

          atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
          basePosition.left += atOffset[0];
          basePosition.top += atOffset[1];
          return this.each(function () {
            var collisionPosition,
                using,
                elem = $(this),
                elemWidth = elem.outerWidth(),
                elemHeight = elem.outerHeight(),
                marginLeft = parseCss(this, "marginLeft"),
                marginTop = parseCss(this, "marginTop"),
                collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") + scrollInfo.width,
                collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") + scrollInfo.height,
                position = $.extend({}, basePosition),
                myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());

            if (options.my[0] === "right") {
              position.left -= elemWidth;
            } else if (options.my[0] === "center") {
              position.left -= elemWidth / 2;
            }

            if (options.my[1] === "bottom") {
              position.top -= elemHeight;
            } else if (options.my[1] === "center") {
              position.top -= elemHeight / 2;
            }

            position.left += myOffset[0];
            position.top += myOffset[1]; // If the browser doesn't support fractions, then round for consistent results

            if (!_supportsOffsetFractions()) {
              position.left = round(position.left);
              position.top = round(position.top);
            }

            collisionPosition = {
              marginLeft: marginLeft,
              marginTop: marginTop
            };
            $.each(["left", "top"], function (i, dir) {
              if ($.ui.position[collision[i]]) {
                $.ui.position[collision[i]][dir](position, {
                  targetWidth: targetWidth,
                  targetHeight: targetHeight,
                  elemWidth: elemWidth,
                  elemHeight: elemHeight,
                  collisionPosition: collisionPosition,
                  collisionWidth: collisionWidth,
                  collisionHeight: collisionHeight,
                  offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
                  my: options.my,
                  at: options.at,
                  within: within,
                  elem: elem
                });
              }
            });

            if (options.using) {
              // Adds feedback as second argument to using callback, if present
              using = function using(props) {
                var left = targetOffset.left - position.left,
                    right = left + targetWidth - elemWidth,
                    top = targetOffset.top - position.top,
                    bottom = top + targetHeight - elemHeight,
                    feedback = {
                  target: {
                    element: target,
                    left: targetOffset.left,
                    top: targetOffset.top,
                    width: targetWidth,
                    height: targetHeight
                  },
                  element: {
                    element: elem,
                    left: position.left,
                    top: position.top,
                    width: elemWidth,
                    height: elemHeight
                  },
                  horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                  vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
                };

                if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
                  feedback.horizontal = "center";
                }

                if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
                  feedback.vertical = "middle";
                }

                if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
                  feedback.important = "horizontal";
                } else {
                  feedback.important = "vertical";
                }

                options.using.call(this, props, feedback);
              };
            }

            elem.offset($.extend(position, {
              using: using
            }));
          });
        };

        $.ui.position = {
          fit: {
            left: function left(position, data) {
              var within = data.within,
                  withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                  outerWidth = within.width,
                  collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                  overLeft = withinOffset - collisionPosLeft,
                  overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                  newOverRight; // Element is wider than within

              if (data.collisionWidth > outerWidth) {
                // Element is initially over the left side of within
                if (overLeft > 0 && overRight <= 0) {
                  newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
                  position.left += overLeft - newOverRight; // Element is initially over right side of within
                } else if (overRight > 0 && overLeft <= 0) {
                  position.left = withinOffset; // Element is initially over both left and right sides of within
                } else {
                  if (overLeft > overRight) {
                    position.left = withinOffset + outerWidth - data.collisionWidth;
                  } else {
                    position.left = withinOffset;
                  }
                } // Too far left -> align with left edge

              } else if (overLeft > 0) {
                position.left += overLeft; // Too far right -> align with right edge
              } else if (overRight > 0) {
                position.left -= overRight; // Adjust based on position and margin
              } else {
                position.left = max(position.left - collisionPosLeft, position.left);
              }
            },
            top: function top(position, data) {
              var within = data.within,
                  withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                  outerHeight = data.within.height,
                  collisionPosTop = position.top - data.collisionPosition.marginTop,
                  overTop = withinOffset - collisionPosTop,
                  overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                  newOverBottom; // Element is taller than within

              if (data.collisionHeight > outerHeight) {
                // Element is initially over the top of within
                if (overTop > 0 && overBottom <= 0) {
                  newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
                  position.top += overTop - newOverBottom; // Element is initially over bottom of within
                } else if (overBottom > 0 && overTop <= 0) {
                  position.top = withinOffset; // Element is initially over both top and bottom of within
                } else {
                  if (overTop > overBottom) {
                    position.top = withinOffset + outerHeight - data.collisionHeight;
                  } else {
                    position.top = withinOffset;
                  }
                } // Too far up -> align with top

              } else if (overTop > 0) {
                position.top += overTop; // Too far down -> align with bottom edge
              } else if (overBottom > 0) {
                position.top -= overBottom; // Adjust based on position and margin
              } else {
                position.top = max(position.top - collisionPosTop, position.top);
              }
            }
          },
          flip: {
            left: function left(position, data) {
              var within = data.within,
                  withinOffset = within.offset.left + within.scrollLeft,
                  outerWidth = within.width,
                  offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                  collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                  overLeft = collisionPosLeft - offsetLeft,
                  overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                  myOffset = data.my[0] === "left" ? -data.elemWidth : data.my[0] === "right" ? data.elemWidth : 0,
                  atOffset = data.at[0] === "left" ? data.targetWidth : data.at[0] === "right" ? -data.targetWidth : 0,
                  offset = -2 * data.offset[0],
                  newOverRight,
                  newOverLeft;

              if (overLeft < 0) {
                newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;

                if (newOverRight < 0 || newOverRight < abs(overLeft)) {
                  position.left += myOffset + atOffset + offset;
                }
              } else if (overRight > 0) {
                newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;

                if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
                  position.left += myOffset + atOffset + offset;
                }
              }
            },
            top: function top(position, data) {
              var within = data.within,
                  withinOffset = within.offset.top + within.scrollTop,
                  outerHeight = within.height,
                  offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                  collisionPosTop = position.top - data.collisionPosition.marginTop,
                  overTop = collisionPosTop - offsetTop,
                  overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                  top = data.my[1] === "top",
                  myOffset = top ? -data.elemHeight : data.my[1] === "bottom" ? data.elemHeight : 0,
                  atOffset = data.at[1] === "top" ? data.targetHeight : data.at[1] === "bottom" ? -data.targetHeight : 0,
                  offset = -2 * data.offset[1],
                  newOverTop,
                  newOverBottom;

              if (overTop < 0) {
                newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;

                if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
                  position.top += myOffset + atOffset + offset;
                }
              } else if (overBottom > 0) {
                newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;

                if (newOverTop > 0 || abs(newOverTop) < overBottom) {
                  position.top += myOffset + atOffset + offset;
                }
              }
            }
          },
          flipfit: {
            left: function left() {
              $.ui.position.flip.left.apply(this, arguments);
              $.ui.position.fit.left.apply(this, arguments);
            },
            top: function top() {
              $.ui.position.flip.top.apply(this, arguments);
              $.ui.position.fit.top.apply(this, arguments);
            }
          }
        };
      })();

      $.ui.position;
    };
  };

  var mContextMenu = function mContextMenu() {
    this.createContextMenu = function ($) {
      // ARIA stuff: menuitem, menuitemcheckbox und menuitemradio
      // create <menu> structure if $.support[htmlCommand || htmlMenuitem] and !opt.disableNative
      // determine html5 compatibility

      $.support.htmlMenuitem = 'HTMLMenuItemElement' in window;
      $.support.htmlCommand = 'HTMLCommandElement' in window;
      $.support.eventSelectstart = 'onselectstart' in document.documentElement;
      /* // should the need arise, test for css user-select
      $.support.cssUserSelect = (function(){
      var t = false,
      e = document.createElement('div');
      $.each('Moz|Webkit|Khtml|O|ms|Icab|'.split('|'), function(i, prefix) {
      var propCC = prefix + (prefix ? 'U' : 'u') + 'serSelect',
      prop = (prefix ? ('-' + prefix.toLowerCase() + '-') : '') + 'user-select';
      e.style.cssText = prop + ': text;';
      if (e.style[propCC] == 'text') {
      t = true;
      return false;
      }
      return true;
      });
      return t;
      })();
      */

      if (!$.ui || !$.widget) {
        // duck punch $.cleanData like jQueryUI does to get that remove event
        $.cleanData = function (orig) {
          return function (elems) {
            var events, elem, i;

            for (i = 0; elems[i] != null; i++) {
              elem = elems[i];

              try {
                // Only trigger remove when necessary to save time
                events = $._data(elem, 'events');

                if (events && events.remove) {
                  $(elem).triggerHandler('remove');
                } // Http://bugs.jquery.com/ticket/8235

              } catch (e) {}
            }

            orig(elems);
          };
        }($.cleanData);
      }
      /* jshint ignore:end */
      // jscs:enable


      var // currently active contextMenu trigger
      $currentTrigger = null,
          // is contextMenu initialized with at least one menu?
      initialized = false,
          // window handle
      $win = $(window),
          // number of registered menus
      counter = 0,
          // mapping selector to namespace
      namespaces = {},
          // mapping namespace to options
      menus = {},
          // custom command type handlers
      types = {},
          // default values
      defaults = {
        // selector of contextMenu trigger
        selector: null,
        // where to append the menu to
        appendTo: null,
        // method to trigger context menu ["right", "left", "hover"]
        trigger: 'right',
        // hide menu when mouse leaves trigger / menu elements
        autoHide: false,
        // ms to wait before showing a hover-triggered context menu
        delay: 200,
        // flag denoting if a second trigger should simply move (true) or rebuild (false) an open menu
        // as long as the trigger happened on one of the trigger-element's child nodes
        reposition: true,
        // Flag denoting if a second trigger should close the menu, as long as
        // the trigger happened on one of the trigger-element's child nodes.
        // This overrides the reposition option.
        hideOnSecondTrigger: false,
        //ability to select submenu
        selectableSubMenu: false,
        // Default classname configuration to be able avoid conflicts in frameworks
        classNames: {
          hover: 'context-menu-hover',
          // Item hover
          disabled: 'context-menu-disabled',
          // Item disabled
          visible: 'context-menu-visible',
          // Item visible
          notSelectable: 'context-menu-not-selectable',
          // Item not selectable
          icon: 'context-menu-icon',
          iconEdit: 'context-menu-icon-edit',
          iconCut: 'context-menu-icon-cut',
          iconCopy: 'context-menu-icon-copy',
          iconPaste: 'context-menu-icon-paste',
          iconDelete: 'context-menu-icon-delete',
          iconAdd: 'context-menu-icon-add',
          iconQuit: 'context-menu-icon-quit',
          iconLoadingClass: 'context-menu-icon-loading'
        },
        // determine position to show menu at
        determinePosition: function determinePosition($menu) {
          // position to the lower middle of the trigger element
          if ($.ui && $.ui.position) {
            // .position() is provided as a jQuery UI utility
            // (...and it won't work on hidden elements)
            $menu.css('display', 'block').position({
              my: 'center top',
              at: 'center bottom',
              of: this,
              offset: '0 5',
              collision: 'fit'
            }).css('display', 'none');
          } else {
            // determine contextMenu position
            var offset = this.offset();
            offset.top += this.outerHeight();
            offset.left += this.outerWidth() / 2 - $menu.outerWidth() / 2;
            $menu.css(offset);
          }
        },
        // position menu
        position: function position(opt, x, y) {
          var offset; // determine contextMenu position

          if (!x && !y) {
            opt.determinePosition.call(this, opt.$menu);
            return;
          } else if (x === 'maintain' && y === 'maintain') {
            // x and y must not be changed (after re-show on command click)
            offset = opt.$menu.position();
          } else {
            // x and y are given (by mouse event)
            var offsetParentOffset = opt.$menu.offsetParent().offset();
            offset = {
              top: y - offsetParentOffset.top,
              left: x - offsetParentOffset.left
            };
          } // correct offset if viewport demands it


          var bottom = $win.scrollTop() + $win.height(),
              right = $win.scrollLeft() + $win.width(),
              height = opt.$menu.outerHeight(),
              width = opt.$menu.outerWidth();

          if (offset.top + height > bottom) {
            offset.top -= height;
          }

          if (offset.top < 0) {
            offset.top = 0;
          }

          if (offset.left + width > right) {
            offset.left -= width;
          }

          if (offset.left < 0) {
            offset.left = 0;
          }

          opt.$menu.css(offset);
        },
        // position the sub-menu
        positionSubmenu: function positionSubmenu($menu) {
          if (typeof $menu === 'undefined') {
            // When user hovers over item (which has sub items) handle.focusItem will call this.
            // but the submenu does not exist yet if opt.items is a promise. just return, will
            // call positionSubmenu after promise is completed.
            return;
          }

          if ($.ui && $.ui.position) {
            // .position() is provided as a jQuery UI utility
            // (...and it won't work on hidden elements)
            $menu.css('display', 'block').position({
              my: 'left top-5',
              at: 'right top',
              of: this,
              collision: 'flipfit fit'
            }).css('display', '');
          } else {
            // determine contextMenu position
            var offset = {
              top: -9,
              left: this.outerWidth() - 5
            };
            $menu.css(offset);
          }
        },
        // offset to add to zIndex
        zIndex: 1,
        // show hide animation settings
        animation: {
          duration: 50,
          show: 'slideDown',
          hide: 'slideUp'
        },
        // events
        events: {
          preShow: $.noop,
          show: $.noop,
          hide: $.noop,
          activated: $.noop
        },
        // default callback
        callback: null,
        // list of contextMenu items
        items: {}
      },
          // mouse position for hover activation
      hoveract = {
        timer: null,
        pageX: null,
        pageY: null
      },
          // determine zIndex
      zindex = function zindex($t) {
        var zin = 0,
            $tt = $t;

        while (true) {
          zin = Math.max(zin, parseInt($tt.css('z-index'), 10) || 0);
          $tt = $tt.parent();

          if (!$tt || !$tt.length || 'html body'.indexOf($tt.prop('nodeName').toLowerCase()) > -1) {
            break;
          }
        }

        return zin;
      },
          // event handlers
      handle = {
        // abort anything
        abortevent: function abortevent(e) {
          e.preventDefault();
          e.stopImmediatePropagation();
        },
        // contextmenu show dispatcher
        contextmenu: function contextmenu(e) {
          var $this = $(this); //Show browser context-menu when preShow returns false

          if (e.data.events.preShow($this, e) === false) {
            return;
          } // disable actual context-menu if we are using the right mouse button as the trigger


          if (e.data.trigger === 'right') {
            e.preventDefault();
            e.stopImmediatePropagation();
          } // abort native-triggered events unless we're triggering on right click


          if (e.data.trigger !== 'right' && e.data.trigger !== 'demand' && e.originalEvent) {
            return;
          } // Let the current contextmenu decide if it should show or not based on its own trigger settings


          if (typeof e.mouseButton !== 'undefined' && e.data) {
            if (!(e.data.trigger === 'left' && e.mouseButton === 0) && !(e.data.trigger === 'right' && e.mouseButton === 2)) {
              // Mouse click is not valid.
              return;
            }
          } // abort event if menu is visible for this trigger


          if ($this.hasClass('context-menu-active')) {
            return;
          }

          if (!$this.hasClass('context-menu-disabled')) {
            // theoretically need to fire a show event at <menu>
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#context-menus
            // var evt = jQuery.Event("show", { data: data, pageX: e.pageX, pageY: e.pageY, relatedTarget: this });
            // e.data.$menu.trigger(evt);
            $currentTrigger = $this;

            if (e.data.build) {
              var built = e.data.build($currentTrigger, e); // abort if build() returned false

              if (built === false) {
                return;
              } // dynamically build menu on invocation


              e.data = $.extend(true, {}, defaults, e.data, built || {}); // abort if there are no items to display

              if (!e.data.items || $.isEmptyObject(e.data.items)) {
                // Note: jQuery captures and ignores errors from event handlers
                if (window.console) {
                  (console.error || console.log).call(console, 'No items specified to show in contextMenu');
                }

                throw new Error('No Items specified');
              } // backreference for custom command type creation


              e.data.$trigger = $currentTrigger;
              op.create(e.data);
            }

            op.show.call($this, e.data, e.pageX, e.pageY);
          }
        },
        // contextMenu left-click trigger
        click: function click(e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          $(this).trigger($.Event('contextmenu', {
            data: e.data,
            pageX: e.pageX,
            pageY: e.pageY
          }));
        },
        // contextMenu right-click trigger
        mousedown: function mousedown(e) {
          // register mouse down
          var $this = $(this); // hide any previous menus

          if ($currentTrigger && $currentTrigger.length && !$currentTrigger.is($this)) {
            $currentTrigger.data('contextMenu').$menu.trigger('contextmenu:hide');
          } // activate on right click


          if (e.button === 2) {
            $currentTrigger = $this.data('contextMenuActive', true);
          }
        },
        // contextMenu right-click trigger
        mouseup: function mouseup(e) {
          // show menu
          var $this = $(this);

          if ($this.data('contextMenuActive') && $currentTrigger && $currentTrigger.length && $currentTrigger.is($this) && !$this.hasClass('context-menu-disabled')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            $currentTrigger = $this;
            $this.trigger($.Event('contextmenu', {
              data: e.data,
              pageX: e.pageX,
              pageY: e.pageY
            }));
          }

          $this.removeData('contextMenuActive');
        },
        // contextMenu hover trigger
        mouseenter: function mouseenter(e) {
          var $this = $(this),
              $related = $(e.relatedTarget),
              $document = $(document); // abort if we're coming from a menu

          if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
            return;
          } // abort if a menu is shown


          if ($currentTrigger && $currentTrigger.length) {
            return;
          }

          hoveract.pageX = e.pageX;
          hoveract.pageY = e.pageY;
          hoveract.data = e.data;
          $document.on('mousemove.contextMenuShow', handle.mousemove);
          hoveract.timer = setTimeout(function () {
            hoveract.timer = null;
            $document.off('mousemove.contextMenuShow');
            $currentTrigger = $this;
            $this.trigger($.Event('contextmenu', {
              data: hoveract.data,
              pageX: hoveract.pageX,
              pageY: hoveract.pageY
            }));
          }, e.data.delay);
        },
        // contextMenu hover trigger
        mousemove: function mousemove(e) {
          hoveract.pageX = e.pageX;
          hoveract.pageY = e.pageY;
        },
        // contextMenu hover trigger
        mouseleave: function mouseleave(e) {
          // abort if we're leaving for a menu
          var $related = $(e.relatedTarget);

          if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
            return;
          }

          try {
            clearTimeout(hoveract.timer);
          } catch (e) {}

          hoveract.timer = null;
        },
        // click on layer to hide contextMenu
        layerClick: function layerClick(e) {
          var $this = $(this),
              root = $this.data('contextMenuRoot'),
              button = e.button,
              x = e.pageX,
              y = e.pageY,
              fakeClick = x === undefined,
              target,
              offset;
          e.preventDefault();
          setTimeout(function () {
            // If the click is not real, things break: https://github.com/swisnl/jQuery-contextMenu/issues/132
            if (fakeClick) {
              if (root !== null && typeof root !== 'undefined' && root.$menu !== null && typeof root.$menu !== 'undefined') {
                root.$menu.trigger('contextmenu:hide');
              }

              return;
            }

            var $window;
            var triggerAction = root.trigger === 'left' && button === 0 || root.trigger === 'right' && button === 2; // find the element that would've been clicked, wasn't the layer in the way

            if (document.elementFromPoint && root.$layer) {
              root.$layer.hide();
              target = document.elementFromPoint(x - $win.scrollLeft(), y - $win.scrollTop()); // also need to try and focus this element if we're in a contenteditable area,
              // as the layer will prevent the browser mouse action we want

              if (target !== null && target.isContentEditable) {
                var range = document.createRange(),
                    sel = window.getSelection();
                range.selectNode(target);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              }

              $(target).trigger(e);
              root.$layer.show();
            }

            if (root.hideOnSecondTrigger && triggerAction && root.$menu !== null && typeof root.$menu !== 'undefined') {
              root.$menu.trigger('contextmenu:hide');
              return;
            }

            if (root.reposition && triggerAction) {
              if (document.elementFromPoint) {
                if (root.$trigger.is(target)) {
                  root.position.call(root.$trigger, root, x, y);
                  return;
                }
              } else {
                offset = root.$trigger.offset();
                $window = $(window); // while this looks kinda awful, it's the best way to avoid
                // unnecessarily calculating any positions

                offset.top += $window.scrollTop();

                if (offset.top <= e.pageY) {
                  offset.left += $window.scrollLeft();

                  if (offset.left <= e.pageX) {
                    offset.bottom = offset.top + root.$trigger.outerHeight();

                    if (offset.bottom >= e.pageY) {
                      offset.right = offset.left + root.$trigger.outerWidth();

                      if (offset.right >= e.pageX) {
                        // reposition
                        root.position.call(root.$trigger, root, x, y);
                        return;
                      }
                    }
                  }
                }
              }
            }

            if (target && triggerAction) {
              root.$trigger.one('contextmenu:hidden', function () {
                $(target).contextMenu({
                  x: x,
                  y: y,
                  button: button
                });
              });
            }

            if (root !== null && typeof root !== 'undefined' && root.$menu !== null && typeof root.$menu !== 'undefined') {
              root.$menu.trigger('contextmenu:hide');
            }
          }, 50);
        },
        // key handled :hover
        keyStop: function keyStop(e, opt) {
          if (!opt.isInput) {
            e.preventDefault();
          }

          e.stopPropagation();
        },
        key: function key(e) {
          var opt = {}; // Only get the data from $currentTrigger if it exists

          if ($currentTrigger) {
            opt = $currentTrigger.data('contextMenu') || {};
          } // If the trigger happen on a element that are above the contextmenu do this


          if (typeof opt.zIndex === 'undefined') {
            opt.zIndex = 0;
          }

          var targetZIndex = 0;

          var getZIndexOfTriggerTarget = function getZIndexOfTriggerTarget(target) {
            if (target.style.zIndex !== '') {
              targetZIndex = target.style.zIndex;
            } else {
              if (target.offsetParent !== null && typeof target.offsetParent !== 'undefined') {
                getZIndexOfTriggerTarget(target.offsetParent);
              } else if (target.parentElement !== null && typeof target.parentElement !== 'undefined') {
                getZIndexOfTriggerTarget(target.parentElement);
              }
            }
          };

          getZIndexOfTriggerTarget(e.target); // If targetZIndex is heigher then opt.zIndex dont progress any futher.
          // This is used to make sure that if you are using a dialog with a input / textarea / contenteditable div
          // and its above the contextmenu it wont steal keys events

          if (opt.$menu && parseInt(targetZIndex, 10) > parseInt(opt.$menu.css("zIndex"), 10)) {
            return;
          }

          switch (e.keyCode) {
            case 9:
            case 38:
              // up
              handle.keyStop(e, opt); // if keyCode is [38 (up)] or [9 (tab) with shift]

              if (opt.isInput) {
                if (e.keyCode === 9 && e.shiftKey) {
                  e.preventDefault();

                  if (opt.$selected) {
                    opt.$selected.find('input, textarea, select').blur();
                  }

                  if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                    opt.$menu.trigger('prevcommand');
                  }

                  return;
                } else if (e.keyCode === 38 && opt.$selected.find('input, textarea, select').prop('type') === 'checkbox') {
                  // checkboxes don't capture this key
                  e.preventDefault();
                  return;
                }
              } else if (e.keyCode !== 9 || e.shiftKey) {
                if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                  opt.$menu.trigger('prevcommand');
                }

                return;
              }

              break;
            // omitting break;
            // case 9: // tab - reached through omitted break;

            case 40:
              // down
              handle.keyStop(e, opt);

              if (opt.isInput) {
                if (e.keyCode === 9) {
                  e.preventDefault();

                  if (opt.$selected) {
                    opt.$selected.find('input, textarea, select').blur();
                  }

                  if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                    opt.$menu.trigger('nextcommand');
                  }

                  return;
                } else if (e.keyCode === 40 && opt.$selected.find('input, textarea, select').prop('type') === 'checkbox') {
                  // checkboxes don't capture this key
                  e.preventDefault();
                  return;
                }
              } else {
                if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                  opt.$menu.trigger('nextcommand');
                }

                return;
              }

              break;

            case 37:
              // left
              handle.keyStop(e, opt);

              if (opt.isInput || !opt.$selected || !opt.$selected.length) {
                break;
              }

              if (!opt.$selected.parent().hasClass('context-menu-root')) {
                var $parent = opt.$selected.parent().parent();
                opt.$selected.trigger('contextmenu:blur');
                opt.$selected = $parent;
                return;
              }

              break;

            case 39:
              // right
              handle.keyStop(e, opt);

              if (opt.isInput || !opt.$selected || !opt.$selected.length) {
                break;
              }

              var itemdata = opt.$selected.data('contextMenu') || {};

              if (itemdata.$menu && opt.$selected.hasClass('context-menu-submenu')) {
                opt.$selected = null;
                itemdata.$selected = null;
                itemdata.$menu.trigger('nextcommand');
                return;
              }

              break;

            case 35: // end

            case 36:
              // home
              if (opt.$selected && opt.$selected.find('input, textarea, select').length) {
                return;
              } else {
                (opt.$selected && opt.$selected.parent() || opt.$menu).children(':not(.' + opt.classNames.disabled + ', .' + opt.classNames.notSelectable + ')')[e.keyCode === 36 ? 'first' : 'last']().trigger('contextmenu:focus');
                e.preventDefault();
                return;
              }

            case 13:
              // enter
              handle.keyStop(e, opt);

              if (opt.isInput) {
                if (opt.$selected && !opt.$selected.is('textarea, select')) {
                  e.preventDefault();
                  return;
                }

                break;
              }

              if (typeof opt.$selected !== 'undefined' && opt.$selected !== null) {
                opt.$selected.trigger('mouseup');
              }

              return;

            case 32: // space

            case 33: // page up

            case 34:
              // page down
              // prevent browser from scrolling down while menu is visible
              handle.keyStop(e, opt);
              return;

            case 27:
              // esc
              handle.keyStop(e, opt);

              if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                opt.$menu.trigger('contextmenu:hide');
              }

              return;

            default:
              // 0-9, a-z
              var k = String.fromCharCode(e.keyCode).toUpperCase();

              if (opt.accesskeys && opt.accesskeys[k]) {
                // according to the specs accesskeys must be invoked immediately
                opt.accesskeys[k].$node.trigger(opt.accesskeys[k].$menu ? 'contextmenu:focus' : 'mouseup');
                return;
              }

              break;
          } // pass event to selected item,
          // stop propagation to avoid endless recursion


          e.stopPropagation();

          if (typeof opt.$selected !== 'undefined' && opt.$selected !== null) {
            opt.$selected.trigger(e);
          }
        },
        // select previous possible command in menu
        prevItem: function prevItem(e) {
          e.stopPropagation();
          var opt = $(this).data('contextMenu') || {};
          var root = $(this).data('contextMenuRoot') || {}; // obtain currently selected menu

          if (opt.$selected) {
            var $s = opt.$selected;
            opt = opt.$selected.parent().data('contextMenu') || {};
            opt.$selected = $s;
          }

          var $children = opt.$menu.children(),
              $prev = !opt.$selected || !opt.$selected.prev().length ? $children.last() : opt.$selected.prev(),
              $round = $prev; // skip disabled or hidden elements

          while ($prev.hasClass(root.classNames.disabled) || $prev.hasClass(root.classNames.notSelectable) || $prev.is(':hidden')) {
            if ($prev.prev().length) {
              $prev = $prev.prev();
            } else {
              $prev = $children.last();
            }

            if ($prev.is($round)) {
              // break endless loop
              return;
            }
          } // leave current


          if (opt.$selected) {
            handle.itemMouseleave.call(opt.$selected.get(0), e);
          } // activate next


          handle.itemMouseenter.call($prev.get(0), e); // focus input

          var $input = $prev.find('input, textarea, select');

          if ($input.length) {
            $input.focus();
          }
        },
        // select next possible command in menu
        nextItem: function nextItem(e) {
          e.stopPropagation();
          var opt = $(this).data('contextMenu') || {};
          var root = $(this).data('contextMenuRoot') || {}; // obtain currently selected menu

          if (opt.$selected) {
            var $s = opt.$selected;
            opt = opt.$selected.parent().data('contextMenu') || {};
            opt.$selected = $s;
          }

          var $children = opt.$menu.children(),
              $next = !opt.$selected || !opt.$selected.next().length ? $children.first() : opt.$selected.next(),
              $round = $next; // skip disabled

          while ($next.hasClass(root.classNames.disabled) || $next.hasClass(root.classNames.notSelectable) || $next.is(':hidden')) {
            if ($next.next().length) {
              $next = $next.next();
            } else {
              $next = $children.first();
            }

            if ($next.is($round)) {
              // break endless loop
              return;
            }
          } // leave current


          if (opt.$selected) {
            handle.itemMouseleave.call(opt.$selected.get(0), e);
          } // activate next


          handle.itemMouseenter.call($next.get(0), e); // focus input

          var $input = $next.find('input, textarea, select');

          if ($input.length) {
            $input.focus();
          }
        },
        // flag that we're inside an input so the key handler can act accordingly
        focusInput: function focusInput() {
          var $this = $(this).closest('.context-menu-item'),
              data = $this.data(),
              opt = data.contextMenu,
              root = data.contextMenuRoot;
          root.$selected = opt.$selected = $this;
          root.isInput = opt.isInput = true;
        },
        // flag that we're inside an input so the key handler can act accordingly
        blurInput: function blurInput() {
          var $this = $(this).closest('.context-menu-item'),
              data = $this.data(),
              opt = data.contextMenu,
              root = data.contextMenuRoot;
          root.isInput = opt.isInput = false;
        },
        // :hover on menu
        menuMouseenter: function menuMouseenter() {
          var root = $(this).data().contextMenuRoot;
          root.hovering = true;
        },
        // :hover on menu
        menuMouseleave: function menuMouseleave(e) {
          var root = $(this).data().contextMenuRoot;

          if (root.$layer && root.$layer.is(e.relatedTarget)) {
            root.hovering = false;
          }
        },
        // :hover done manually so key handling is possible
        itemMouseenter: function itemMouseenter(e) {
          var $this = $(this),
              data = $this.data(),
              opt = data.contextMenu,
              root = data.contextMenuRoot;
          root.hovering = true; // abort if we're re-entering

          if (e && root.$layer && root.$layer.is(e.relatedTarget)) {
            e.preventDefault();
            e.stopImmediatePropagation();
          } // make sure only one item is selected


          (opt.$menu ? opt : root).$menu.children('.' + root.classNames.hover).trigger('contextmenu:blur').children('.hover').trigger('contextmenu:blur');

          if ($this.hasClass(root.classNames.disabled) || $this.hasClass(root.classNames.notSelectable)) {
            opt.$selected = null;
            return;
          }

          $this.trigger('contextmenu:focus');
        },
        // :hover done manually so key handling is possible
        itemMouseleave: function itemMouseleave(e) {
          var $this = $(this),
              data = $this.data(),
              opt = data.contextMenu,
              root = data.contextMenuRoot;

          if (root !== opt && root.$layer && root.$layer.is(e.relatedTarget)) {
            if (typeof root.$selected !== 'undefined' && root.$selected !== null) {
              root.$selected.trigger('contextmenu:blur');
            }

            e.preventDefault();
            e.stopImmediatePropagation();
            root.$selected = opt.$selected = opt.$node;
            return;
          }

          if (opt && opt.$menu && opt.$menu.hasClass('context-menu-visible')) {
            return;
          }

          $this.trigger('contextmenu:blur');
        },
        // contextMenu item click
        itemClick: function itemClick(e) {
          var $this = $(this),
              data = $this.data(),
              opt = data.contextMenu,
              root = data.contextMenuRoot,
              key = data.contextMenuKey,
              callback; // abort if the key is unknown or disabled or is a menu

          if (!opt.items[key] || $this.is('.' + root.classNames.disabled + ', .context-menu-separator, .' + root.classNames.notSelectable) || $this.is('.context-menu-submenu') && root.selectableSubMenu === false) {
            return;
          }

          e.preventDefault();
          e.stopImmediatePropagation();

          if ($.isFunction(opt.callbacks[key]) && Object.prototype.hasOwnProperty.call(opt.callbacks, key)) {
            // item-specific callback
            callback = opt.callbacks[key];
          } else if ($.isFunction(root.callback)) {
            // default callback
            callback = root.callback;
          } else {
            // no callback, no action
            return;
          } // hide menu if callback doesn't stop that


          if (callback.call(root.$trigger, key, root, e) !== false) {
            root.$menu.trigger('contextmenu:hide');
          } else if (root.$menu.parent().length) {
            op.update.call(root.$trigger, root);
          }
        },
        // ignore click events on input elements
        inputClick: function inputClick(e) {
          e.stopImmediatePropagation();
        },
        // hide <menu>
        hideMenu: function hideMenu(e, data) {
          var root = $(this).data('contextMenuRoot');
          op.hide.call(root.$trigger, root, data && data.force);
        },
        // focus <command>
        focusItem: function focusItem(e) {
          e.stopPropagation();
          var $this = $(this),
              data = $this.data(),
              opt = data.contextMenu,
              root = data.contextMenuRoot;

          if ($this.hasClass(root.classNames.disabled) || $this.hasClass(root.classNames.notSelectable)) {
            return;
          }

          $this.addClass([root.classNames.hover, root.classNames.visible].join(' ')) // select other items and included items
          .parent().find('.context-menu-item').not($this).removeClass(root.classNames.visible).filter('.' + root.classNames.hover).trigger('contextmenu:blur'); // remember selected

          opt.$selected = root.$selected = $this;

          if (opt && opt.$node && opt.$node.hasClass('context-menu-submenu')) {
            opt.$node.addClass(root.classNames.hover);
          } // position sub-menu - do after show so dumb $.ui.position can keep up


          if (opt.$node) {
            root.positionSubmenu.call(opt.$node, opt.$menu);
          }
        },
        // blur <command>
        blurItem: function blurItem(e) {
          e.stopPropagation();
          var $this = $(this),
              data = $this.data(),
              opt = data.contextMenu,
              root = data.contextMenuRoot;

          if (opt.autoHide) {
            // for tablets and touch screens this needs to remain
            $this.removeClass(root.classNames.visible);
          }

          $this.removeClass(root.classNames.hover);
          opt.$selected = null;
        }
      },
          // operations
      op = {
        show: function show(opt, x, y) {
          var $trigger = $(this),
              css = {}; // hide any open menus

          $('#context-menu-layer').trigger('mousedown'); // backreference for callbacks

          opt.$trigger = $trigger; // show event

          if (opt.events.show.call($trigger, opt) === false) {
            $currentTrigger = null;
            return;
          } // create or update context menu


          var hasVisibleItems = op.update.call($trigger, opt);

          if (hasVisibleItems === false) {
            $currentTrigger = null;
            return;
          } // position menu


          opt.position.call($trigger, opt, x, y); // make sure we're in front

          if (opt.zIndex) {
            var additionalZValue = opt.zIndex; // If opt.zIndex is a function, call the function to get the right zIndex.

            if (typeof opt.zIndex === 'function') {
              additionalZValue = opt.zIndex.call($trigger, opt);
            }

            css.zIndex = zindex($trigger) + additionalZValue;
          } // add layer


          op.layer.call(opt.$menu, opt, css.zIndex); // adjust sub-menu zIndexes

          opt.$menu.find('ul').css('zIndex', css.zIndex + 1); // position and show context menu

          opt.$menu.css(css)[opt.animation.show](opt.animation.duration, function () {
            $trigger.trigger('contextmenu:visible');
            op.activated(opt);
            opt.events.activated(opt);
          }); // make options available and set state

          $trigger.data('contextMenu', opt).addClass('context-menu-active'); // register key handler

          $(document).off('keydown.contextMenu').on('keydown.contextMenu', handle.key); // register autoHide handler

          if (opt.autoHide) {
            // mouse position handler
            $(document).on('mousemove.contextMenuAutoHide', function (e) {
              // need to capture the offset on mousemove,
              // since the page might've been scrolled since activation
              var pos = $trigger.offset();
              pos.right = pos.left + $trigger.outerWidth();
              pos.bottom = pos.top + $trigger.outerHeight();

              if (opt.$layer && !opt.hovering && (!(e.pageX >= pos.left && e.pageX <= pos.right) || !(e.pageY >= pos.top && e.pageY <= pos.bottom))) {
                /* Additional hover check after short time, you might just miss the edge of the menu */
                setTimeout(function () {
                  if (!opt.hovering && opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                    opt.$menu.trigger('contextmenu:hide');
                  }
                }, 50);
              }
            });
          }
        },
        hide: function hide(opt, force) {
          var $trigger = $(this);

          if (!opt) {
            opt = $trigger.data('contextMenu') || {};
          } // hide event


          if (!force && opt.events && opt.events.hide.call($trigger, opt) === false) {
            return;
          } // remove options and revert state


          $trigger.removeData('contextMenu').removeClass('context-menu-active');

          if (opt.$layer) {
            // keep layer for a bit so the contextmenu event can be aborted properly by opera
            setTimeout(function ($layer) {
              return function () {
                $layer.remove();
              };
            }(opt.$layer), 10);

            try {
              delete opt.$layer;
            } catch (e) {
              opt.$layer = null;
            }
          } // remove handle


          $currentTrigger = null; // remove selected

          opt.$menu.find('.' + opt.classNames.hover).trigger('contextmenu:blur');
          opt.$selected = null; // collapse all submenus

          opt.$menu.find('.' + opt.classNames.visible).removeClass(opt.classNames.visible); // unregister key and mouse handlers
          // $(document).off('.contextMenuAutoHide keydown.contextMenu'); // http://bugs.jquery.com/ticket/10705

          $(document).off('.contextMenuAutoHide').off('keydown.contextMenu'); // hide menu

          if (opt.$menu) {
            opt.$menu[opt.animation.hide](opt.animation.duration, function () {
              // tear down dynamically built menu after animation is completed.
              if (opt.build) {
                opt.$menu.remove();
                $.each(opt, function (key) {
                  switch (key) {
                    case 'ns':
                    case 'selector':
                    case 'build':
                    case 'trigger':
                      return true;

                    default:
                      opt[key] = undefined;

                      try {
                        delete opt[key];
                      } catch (e) {}

                      return true;
                  }
                });
              }

              setTimeout(function () {
                $trigger.trigger('contextmenu:hidden');
              }, 10);
            });
          }
        },
        create: function create(opt, root) {
          if (typeof root === 'undefined') {
            root = opt;
          } // create contextMenu


          opt.$menu = $('<ul class="context-menu-list"></ul>').addClass(opt.className || '').data({
            'contextMenu': opt,
            'contextMenuRoot': root
          });

          if (opt.dataAttr) {
            $.each(opt.dataAttr, function (key, item) {
              opt.$menu.attr('data-' + opt.key, item);
            });
          }

          $.each(['callbacks', 'commands', 'inputs'], function (i, k) {
            opt[k] = {};

            if (!root[k]) {
              root[k] = {};
            }
          });

          if (!root.accesskeys) {
            root.accesskeys = {};
          }

          function createNameNode(item) {
            var $name = $('<span></span>');

            if (item._accesskey) {
              if (item._beforeAccesskey) {
                $name.append(document.createTextNode(item._beforeAccesskey));
              }

              $('<span></span>').addClass('context-menu-accesskey').text(item._accesskey).appendTo($name);

              if (item._afterAccesskey) {
                $name.append(document.createTextNode(item._afterAccesskey));
              }
            } else {
              if (item.isHtmlName) {
                // restrict use with access keys
                if (typeof item.accesskey !== 'undefined') {
                  throw new Error('accesskeys are not compatible with HTML names and cannot be used together in the same item');
                }

                $name.html(item.name);
              } else {
                $name.text(item.name);
              }
            }

            return $name;
          } // create contextMenu items


          $.each(opt.items, function (key, item) {
            var $t = $('<li class="context-menu-item"></li>').addClass(item.className || ''),
                $label = null,
                $input = null; // iOS needs to see a click-event bound to an element to actually
            // have the TouchEvents infrastructure trigger the click event

            $t.on('click', $.noop); // Make old school string seperator a real item so checks wont be
            // akward later.
            // And normalize 'cm_separator' into 'cm_seperator'.

            if (typeof item === 'string' || item.type === 'cm_separator') {
              item = {
                type: 'cm_seperator'
              };
            }

            item.$node = $t.data({
              'contextMenu': opt,
              'contextMenuRoot': root,
              'contextMenuKey': key
            }); // register accesskey
            // NOTE: the accesskey attribute should be applicable to any element, but Safari5 and Chrome13 still can't do that

            if (typeof item.accesskey !== 'undefined') {
              var aks = splitAccesskey(item.accesskey);

              for (var i = 0, ak; ak = aks[i]; i++) {
                if (!root.accesskeys[ak]) {
                  root.accesskeys[ak] = item;
                  var matched = item.name.match(new RegExp('^(.*?)(' + ak + ')(.*)$', 'i'));

                  if (matched) {
                    item._beforeAccesskey = matched[1];
                    item._accesskey = matched[2];
                    item._afterAccesskey = matched[3];
                  }

                  break;
                }
              }
            }

            if (item.type && types[item.type]) {
              // run custom type handler
              types[item.type].call($t, item, opt, root); // register commands

              $.each([opt, root], function (i, k) {
                k.commands[key] = item; // Overwrite only if undefined or the item is appended to the root. This so it
                // doesn't overwrite callbacks of root elements if the name is the same.

                if ($.isFunction(item.callback) && (typeof k.callbacks[key] === 'undefined' || typeof opt.type === 'undefined')) {
                  k.callbacks[key] = item.callback;
                }
              });
            } else {
              // add label for input
              if (item.type === 'cm_seperator') {
                $t.addClass('context-menu-separator ' + root.classNames.notSelectable);
              } else if (item.type === 'html') {
                $t.addClass('context-menu-html ' + root.classNames.notSelectable);
              } else if (item.type !== 'sub' && item.type) {
                $label = $('<label></label>').appendTo($t);
                createNameNode(item).appendTo($label);
                $t.addClass('context-menu-input');
                opt.hasTypes = true;
                $.each([opt, root], function (i, k) {
                  k.commands[key] = item;
                  k.inputs[key] = item;
                });
              } else if (item.items) {
                item.type = 'sub';
              }

              switch (item.type) {
                case 'cm_seperator':
                  break;

                case 'text':
                  $input = $('<input type="text" value="1" name="" />').attr('name', 'context-menu-input-' + key).val(item.value || '').appendTo($label);
                  break;

                case 'textarea':
                  $input = $('<textarea name=""></textarea>').attr('name', 'context-menu-input-' + key).val(item.value || '').appendTo($label);

                  if (item.height) {
                    $input.height(item.height);
                  }

                  break;

                case 'checkbox':
                  $input = $('<input type="checkbox" value="1" name="" />').attr('name', 'context-menu-input-' + key).val(item.value || '').prop('checked', !!item.selected).prependTo($label);
                  break;

                case 'radio':
                  $input = $('<input type="radio" value="1" name="" />').attr('name', 'context-menu-input-' + item.radio).val(item.value || '').prop('checked', !!item.selected).prependTo($label);
                  break;

                case 'select':
                  $input = $('<select name=""></select>').attr('name', 'context-menu-input-' + key).appendTo($label);

                  if (item.options) {
                    $.each(item.options, function (value, text) {
                      $('<option></option>').val(value).text(text).appendTo($input);
                    });
                    $input.val(item.selected);
                  }

                  break;

                case 'sub':
                  createNameNode(item).appendTo($t);
                  item.appendTo = item.$node;
                  $t.data('contextMenu', item).addClass('context-menu-submenu');
                  item.callback = null; // If item contains items, and this is a promise, we should create it later
                  // check if subitems is of type promise. If it is a promise we need to create
                  // it later, after promise has been resolved.

                  if ('function' === typeof item.items.then) {
                    // probably a promise, process it, when completed it will create the sub menu's.
                    op.processPromises(item, root, item.items);
                  } else {
                    // normal submenu.
                    op.create(item, root);
                  }

                  break;

                case 'html':
                  $(item.html).appendTo($t);
                  break;

                default:
                  $.each([opt, root], function (i, k) {
                    k.commands[key] = item; // Overwrite only if undefined or the item is appended to the root. This so it
                    // doesn't overwrite callbacks of root elements if the name is the same.

                    if ($.isFunction(item.callback) && (typeof k.callbacks[key] === 'undefined' || typeof opt.type === 'undefined')) {
                      k.callbacks[key] = item.callback;
                    }
                  });
                  createNameNode(item).appendTo($t);
                  break;
              } // disable key listener in <input>


              if (item.type && item.type !== 'sub' && item.type !== 'html' && item.type !== 'cm_seperator') {
                $input.on('focus', handle.focusInput).on('blur', handle.blurInput);

                if (item.events) {
                  $input.on(item.events, opt);
                }
              } // add icons


              if (item.icon) {
                if ($.isFunction(item.icon)) {
                  item._icon = item.icon.call(this, this, $t, key, item);
                } else {
                  if (typeof item.icon === 'string' && (item.icon.substring(0, 4) === 'fab ' || item.icon.substring(0, 4) === 'fas ' || item.icon.substring(0, 4) === 'fad ' || item.icon.substring(0, 4) === 'far ' || item.icon.substring(0, 4) === 'fal ')) {
                    // to enable font awesome
                    $t.addClass(root.classNames.icon + ' ' + root.classNames.icon + '--fa5');
                    item._icon = $('<i class="' + item.icon + '"></i>');
                  } else if (typeof item.icon === 'string' && item.icon.substring(0, 3) === 'fa-') {
                    item._icon = root.classNames.icon + ' ' + root.classNames.icon + '--fa fa ' + item.icon;
                  } else {
                    item._icon = root.classNames.icon + ' ' + root.classNames.icon + '-' + item.icon;
                  }
                }

                if (typeof item._icon === "string") {
                  $t.addClass(item._icon);
                } else {
                  $t.prepend(item._icon);
                }
              }
            } // cache contained elements


            item.$input = $input;
            item.$label = $label; // attach item to menu

            $t.appendTo(opt.$menu); // Disable text selection

            if (!opt.hasTypes && $.support.eventSelectstart) {
              // browsers support user-select: none,
              // IE has a special event for text-selection
              // browsers supporting neither will not be preventing text-selection
              $t.on('selectstart.disableTextSelect', handle.abortevent);
            }
          }); // attach contextMenu to <body> (to bypass any possible overflow:hidden issues on parents of the trigger element)

          if (!opt.$node) {
            opt.$menu.css('display', 'none').addClass('context-menu-root');
          }

          opt.$menu.appendTo(opt.appendTo || document.body);
        },
        resize: function resize($menu, nested) {
          var domMenu; // determine widths of submenus, as CSS won't grow them automatically
          // position:absolute within position:absolute; min-width:100; max-width:200; results in width: 100;
          // kinda sucks hard...
          // determine width of absolutely positioned element

          $menu.css({
            position: 'absolute',
            display: 'block'
          }); // don't apply yet, because that would break nested elements' widths

          $menu.data('width', (domMenu = $menu.get(0)).getBoundingClientRect ? Math.ceil(domMenu.getBoundingClientRect().width) : $menu.outerWidth() + 1); // outerWidth() returns rounded pixels
          // reset styles so they allow nested elements to grow/shrink naturally

          $menu.css({
            position: 'static',
            minWidth: '0px',
            maxWidth: '100000px'
          }); // identify width of nested menus

          $menu.find('> li > ul').each(function () {
            op.resize($(this), true);
          }); // reset and apply changes in the end because nested
          // elements' widths wouldn't be calculatable otherwise

          if (!nested) {
            $menu.find('ul').addBack().css({
              position: '',
              display: '',
              minWidth: '',
              maxWidth: ''
            }).outerWidth(function () {
              return $(this).data('width');
            });
          }
        },
        update: function update(opt, root) {
          var $trigger = this;

          if (typeof root === 'undefined') {
            root = opt;
            op.resize(opt.$menu);
          }

          var hasVisibleItems = false; // re-check disabled for each item

          opt.$menu.children().each(function () {
            var $item = $(this),
                key = $item.data('contextMenuKey'),
                item = opt.items[key],
                disabled = $.isFunction(item.disabled) && item.disabled.call($trigger, key, root) || item.disabled === true,
                visible;

            if ($.isFunction(item.visible)) {
              visible = item.visible.call($trigger, key, root);
            } else if (typeof item.visible !== 'undefined') {
              visible = item.visible === true;
            } else {
              visible = true;
            }

            if (visible) {
              hasVisibleItems = true;
            }

            $item[visible ? 'show' : 'hide'](); // dis- / enable item

            $item[disabled ? 'addClass' : 'removeClass'](root.classNames.disabled);

            if ($.isFunction(item.icon)) {
              $item.removeClass(item._icon);
              var iconResult = item.icon.call(this, $trigger, $item, key, item);

              if (typeof iconResult === "string") {
                $item.addClass(iconResult);
              } else {
                $item.prepend(iconResult);
              }
            }

            if (item.type) {
              // dis- / enable input elements
              $item.find('input, select, textarea').prop('disabled', disabled); // update input states

              switch (item.type) {
                case 'text':
                case 'textarea':
                  item.$input.val(item.value || '');
                  break;

                case 'checkbox':
                case 'radio':
                  item.$input.val(item.value || '').prop('checked', !!item.selected);
                  break;

                case 'select':
                  item.$input.val((item.selected === 0 ? "0" : item.selected) || '');
                  break;
              }
            }

            if (item.$menu) {
              // update sub-menu
              var subMenuHasVisibleItems = op.update.call($trigger, item, root);

              if (subMenuHasVisibleItems) {
                hasVisibleItems = true;
              }
            }
          });
          return hasVisibleItems;
        },
        layer: function layer(opt, zIndex) {
          // add transparent layer for click area
          // filter and background for Internet Explorer, Issue #23
          var $layer = opt.$layer = $('<div id="context-menu-layer"></div>').css({
            height: $win.height(),
            width: $win.width(),
            display: 'block',
            position: 'fixed',
            'z-index': zIndex - 1,
            top: 0,
            left: 0,
            opacity: 0,
            filter: 'alpha(opacity=0)',
            'background-color': '#000'
          }).data('contextMenuRoot', opt).appendTo(document.body).on('contextmenu', handle.abortevent).on('mousedown', handle.layerClick); // IE6 doesn't know position:fixed;

          if (typeof document.body.style.maxWidth === 'undefined') {
            // IE6 doesn't support maxWidth
            $layer.css({
              'position': 'absolute',
              'height': $(document).height()
            });
          }

          return $layer;
        },
        processPromises: function processPromises(opt, root, promise) {
          // Start
          opt.$node.addClass(root.classNames.iconLoadingClass);

          function completedPromise(opt, root, items) {
            // Completed promise (dev called promise.resolve). We now have a list of items which can
            // be used to create the rest of the context menu.
            if (typeof items === 'undefined') {
              // Null result, dev should have checked
              errorPromise(undefined); //own error object
            }

            finishPromiseProcess(opt, root, items);
          }

          function errorPromise(opt, root, errorItem) {
            // User called promise.reject() with an error item, if not, provide own error item.
            if (typeof errorItem === 'undefined') {
              errorItem = {
                "error": {
                  name: "No items and no error item",
                  icon: "context-menu-icon context-menu-icon-quit"
                }
              };

              if (window.console) {
                (console.error || console.log).call(console, 'When you reject a promise, provide an "items" object, equal to normal sub-menu items');
              }
            } else if (typeof errorItem === 'string') {
              errorItem = {
                "error": {
                  name: errorItem
                }
              };
            }

            finishPromiseProcess(opt, root, errorItem);
          }

          function finishPromiseProcess(opt, root, items) {
            if (typeof root.$menu === 'undefined' || !root.$menu.is(':visible')) {
              return;
            }

            opt.$node.removeClass(root.classNames.iconLoadingClass);
            opt.items = items;
            op.create(opt, root, true); // Create submenu

            op.update(opt, root); // Correctly update position if user is already hovered over menu item

            root.positionSubmenu.call(opt.$node, opt.$menu); // positionSubmenu, will only do anything if user already hovered over menu item that just got new subitems.
          } // Wait for promise completion. .then(success, error, notify) (we don't track notify). Bind the opt
          // and root to avoid scope problems


          promise.then(completedPromise.bind(this, opt, root), errorPromise.bind(this, opt, root));
        },
        // operation that will run after contextMenu showed on screen
        activated: function activated(opt) {
          var $menu = opt.$menu;
          var $menuOffset = $menu.offset();
          var winHeight = $(window).height();
          var winScrollTop = $(window).scrollTop();
          var menuHeight = $menu.height();

          if (menuHeight > winHeight) {
            $menu.css({
              'height': winHeight + 'px',
              'overflow-x': 'hidden',
              'overflow-y': 'auto',
              'top': winScrollTop + 'px'
            });
          } else if ($menuOffset.top < winScrollTop || $menuOffset.top + menuHeight > winScrollTop + winHeight) {
            $menu.css({
              'top': winScrollTop + 'px'
            });
          }
        }
      }; // split accesskey according to http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#assigned-access-key


      function splitAccesskey(val) {
        var t = val.split(/\s+/);
        var keys = [];

        for (var i = 0, k; k = t[i]; i++) {
          k = k.charAt(0).toUpperCase(); // first character only
          // theoretically non-accessible characters should be ignored, but different systems, different keyboard layouts, ... screw it.
          // a map to look up already used access keys would be nice

          keys.push(k);
        }

        return keys;
      } // handle contextMenu triggers


      $.fn.contextMenu = function (operation) {
        var $t = this,
            $o = operation;

        if (this.length > 0) {
          // this is not a build on demand menu
          if (typeof operation === 'undefined') {
            this.first().trigger('contextmenu');
          } else if (typeof operation.x !== 'undefined' && typeof operation.y !== 'undefined') {
            this.first().trigger($.Event('contextmenu', {
              pageX: operation.x,
              pageY: operation.y,
              mouseButton: operation.button
            }));
          } else if (operation === 'hide') {
            var $menu = this.first().data('contextMenu') ? this.first().data('contextMenu').$menu : null;

            if ($menu) {
              $menu.trigger('contextmenu:hide');
            }
          } else if (operation === 'destroy') {
            $.contextMenu('destroy', {
              context: this
            });
          } else if ($.isPlainObject(operation)) {
            operation.context = this;
            $.contextMenu('create', operation);
          } else if (operation) {
            this.removeClass('context-menu-disabled');
          } else if (!operation) {
            this.addClass('context-menu-disabled');
          }
        } else {
          $.each(menus, function () {
            if (this.selector === $t.selector) {
              $o.data = this;
              $.extend($o.data, {
                trigger: 'demand'
              });
            }
          });
          handle.contextmenu.call($o.target, $o);
        }

        return this;
      }; // manage contextMenu instances


      $.contextMenu = function (operation, options) {
        if (typeof operation !== 'string') {
          options = operation;
          operation = 'create';
        }

        if (typeof options === 'string') {
          options = {
            selector: options
          };
        } else if (typeof options === 'undefined') {
          options = {};
        } // merge with default options


        var o = $.extend(true, {}, defaults, options || {});
        var $document = $(document);
        var $context = $document;
        var _hasContext = false;

        if (!o.context || !o.context.length) {
          o.context = document;
        } else {
          // you never know what they throw at you...
          $context = $(o.context).first();
          o.context = $context.get(0);
          _hasContext = !$(o.context).is(document);
        }

        switch (operation) {
          case 'update':
            // Updates visibility and such
            if (_hasContext) {
              op.update($context);
            } else {
              for (var menu in menus) {
                if (menus.hasOwnProperty(menu)) {
                  op.update(menus[menu]);
                }
              }
            }

            break;

          case 'create':
            // no selector no joy
            if (!o.selector) {
              throw new Error('No selector specified');
            } // make sure internal classes are not bound to


            if (o.selector.match(/.context-menu-(list|item|input)($|\s)/)) {
              throw new Error('Cannot bind to selector "' + o.selector + '" as it contains a reserved className');
            }

            if (!o.build && (!o.items || $.isEmptyObject(o.items))) {
              throw new Error('No Items specified');
            }

            counter++;
            o.ns = '.contextMenu' + counter;

            if (!_hasContext) {
              namespaces[o.selector] = o.ns;
            }

            menus[o.ns] = o; // default to right click

            if (!o.trigger) {
              o.trigger = 'right';
            }

            if (!initialized) {
              var itemClick = o.itemClickEvent === 'click' ? 'click.contextMenu' : 'mouseup.contextMenu';
              var contextMenuItemObj = {
                // 'mouseup.contextMenu': handle.itemClick,
                // 'click.contextMenu': handle.itemClick,
                'contextmenu:focus.contextMenu': handle.focusItem,
                'contextmenu:blur.contextMenu': handle.blurItem,
                'contextmenu.contextMenu': handle.abortevent,
                'mouseenter.contextMenu': handle.itemMouseenter,
                'mouseleave.contextMenu': handle.itemMouseleave
              };
              contextMenuItemObj[itemClick] = handle.itemClick; // make sure item click is registered first

              $document.on({
                'contextmenu:hide.contextMenu': handle.hideMenu,
                'prevcommand.contextMenu': handle.prevItem,
                'nextcommand.contextMenu': handle.nextItem,
                'contextmenu.contextMenu': handle.abortevent,
                'mouseenter.contextMenu': handle.menuMouseenter,
                'mouseleave.contextMenu': handle.menuMouseleave
              }, '.context-menu-list').on('mouseup.contextMenu', '.context-menu-input', handle.inputClick).on(contextMenuItemObj, '.context-menu-item');
              initialized = true;
            } // engage native contextmenu event


            $context.on('contextmenu' + o.ns, o.selector, o, handle.contextmenu);

            if (_hasContext) {
              // add remove hook, just in case
              $context.on('remove' + o.ns, function () {
                $(this).contextMenu('destroy');
              });
            }

            switch (o.trigger) {
              case 'hover':
                $context.on('mouseenter' + o.ns, o.selector, o, handle.mouseenter).on('mouseleave' + o.ns, o.selector, o, handle.mouseleave);
                break;

              case 'left':
                $context.on('click' + o.ns, o.selector, o, handle.click);
                break;

              case 'touchstart':
                $context.on('touchstart' + o.ns, o.selector, o, handle.click);
                break;

              /*
              default:
              // http://www.quirksmode.org/dom/events/contextmenu.html
              $document
              .on('mousedown' + o.ns, o.selector, o, handle.mousedown)
              .on('mouseup' + o.ns, o.selector, o, handle.mouseup);
              break;
              */
            } // create menu


            if (!o.build) {
              op.create(o);
            }

            break;

          case 'destroy':
            var $visibleMenu;

            if (_hasContext) {
              // get proper options
              var context = o.context;
              $.each(menus, function (ns, o) {
                if (!o) {
                  return true;
                } // Is this menu equest to the context called from


                if (!$(context).is(o.selector)) {
                  return true;
                }

                $visibleMenu = $('.context-menu-list').filter(':visible');

                if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is($(o.context).find(o.selector))) {
                  $visibleMenu.trigger('contextmenu:hide', {
                    force: true
                  });
                }

                try {
                  if (menus[o.ns].$menu) {
                    menus[o.ns].$menu.remove();
                  }

                  delete menus[o.ns];
                } catch (e) {
                  menus[o.ns] = null;
                }

                $(o.context).off(o.ns);
                return true;
              });
            } else if (!o.selector) {
              $document.off('.contextMenu .contextMenuAutoHide');
              $.each(menus, function (ns, o) {
                $(o.context).off(o.ns);
              });
              namespaces = {};
              menus = {};
              counter = 0;
              initialized = false;
              $('#context-menu-layer, .context-menu-list').remove();
            } else if (namespaces[o.selector]) {
              $visibleMenu = $('.context-menu-list').filter(':visible');

              if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is(o.selector)) {
                $visibleMenu.trigger('contextmenu:hide', {
                  force: true
                });
              }

              try {
                if (menus[namespaces[o.selector]].$menu) {
                  menus[namespaces[o.selector]].$menu.remove();
                }

                delete menus[namespaces[o.selector]];
              } catch (e) {
                menus[namespaces[o.selector]] = null;
              }

              $document.off(namespaces[o.selector]);
            }

            break;

          case 'html5':
            // if <command> and <menuitem> are not handled by the browser,
            // or options was a bool true,
            // initialize $.contextMenu for them
            if (!$.support.htmlCommand && !$.support.htmlMenuitem || typeof options === 'boolean' && options) {
              $('menu[type="context"]').each(function () {
                if (this.id) {
                  $.contextMenu({
                    selector: '[contextmenu=' + this.id + ']',
                    items: $.contextMenu.fromMenu(this)
                  });
                }
              }).css('display', 'none');
            }

            break;

          default:
            throw new Error('Unknown operation "' + operation + '"');
        }

        return this;
      }; // import values into <input> commands


      $.contextMenu.setInputValues = function (opt, data) {
        if (typeof data === 'undefined') {
          data = {};
        }

        $.each(opt.inputs, function (key, item) {
          switch (item.type) {
            case 'text':
            case 'textarea':
              item.value = data[key] || '';
              break;

            case 'checkbox':
              item.selected = data[key] ? true : false;
              break;

            case 'radio':
              item.selected = (data[item.radio] || '') === item.value;
              break;

            case 'select':
              item.selected = data[key] || '';
              break;
          }
        });
      }; // export values from <input> commands


      $.contextMenu.getInputValues = function (opt, data) {
        if (typeof data === 'undefined') {
          data = {};
        }

        $.each(opt.inputs, function (key, item) {
          switch (item.type) {
            case 'text':
            case 'textarea':
            case 'select':
              data[key] = item.$input.val();
              break;

            case 'checkbox':
              data[key] = item.$input.prop('checked');
              break;

            case 'radio':
              if (item.$input.prop('checked')) {
                data[item.radio] = item.value;
              }

              break;
          }
        });
        return data;
      }; // find <label for="xyz">


      function inputLabel(node) {
        return node.id && $('label[for="' + node.id + '"]').val() || node.name;
      } // convert <menu> to items object


      function menuChildren(items, $children, counter) {
        if (!counter) {
          counter = 0;
        }

        $children.each(function () {
          var $node = $(this),
              node = this,
              nodeName = this.nodeName.toLowerCase(),
              label,
              item; // extract <label><input>

          if (nodeName === 'label' && $node.find('input, textarea, select').length) {
            label = $node.text();
            $node = $node.children().first();
            node = $node.get(0);
            nodeName = node.nodeName.toLowerCase();
          }
          /*
          * <menu> accepts flow-content as children. that means <embed>, <canvas> and such are valid menu items.
          * Not being the sadistic kind, $.contextMenu only accepts:
          * <command>, <menuitem>, <hr>, <span>, <p> <input [text, radio, checkbox]>, <textarea>, <select> and of course <menu>.
          * Everything else will be imported as an html node, which is not interfaced with contextMenu.
          */
          // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#concept-command


          switch (nodeName) {
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#the-menu-element
            case 'menu':
              item = {
                name: $node.attr('label'),
                items: {}
              };
              counter = menuChildren(item.items, $node.children(), counter);
              break;
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-a-element-to-define-a-command

            case 'a': // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-button-element-to-define-a-command

            case 'button':
              item = {
                name: $node.text(),
                disabled: !!$node.attr('disabled'),
                callback: function () {
                  return function () {
                    $node.get(0).click();
                  };
                }()
              };
              break;
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-command-element-to-define-a-command

            case 'menuitem':
            case 'command':
              switch ($node.attr('type')) {
                case undefined:
                case 'command':
                case 'menuitem':
                  item = {
                    name: $node.attr('label'),
                    disabled: !!$node.attr('disabled'),
                    icon: $node.attr('icon'),
                    callback: function () {
                      return function () {
                        $node.get(0).click();
                      };
                    }()
                  };
                  break;

                case 'checkbox':
                  item = {
                    type: 'checkbox',
                    disabled: !!$node.attr('disabled'),
                    name: $node.attr('label'),
                    selected: !!$node.attr('checked')
                  };
                  break;

                case 'radio':
                  item = {
                    type: 'radio',
                    disabled: !!$node.attr('disabled'),
                    name: $node.attr('label'),
                    radio: $node.attr('radiogroup'),
                    value: $node.attr('id'),
                    selected: !!$node.attr('checked')
                  };
                  break;

                default:
                  item = undefined;
              }

              break;

            case 'hr':
              item = '-------';
              break;

            case 'input':
              switch ($node.attr('type')) {
                case 'text':
                  item = {
                    type: 'text',
                    name: label || inputLabel(node),
                    disabled: !!$node.attr('disabled'),
                    value: $node.val()
                  };
                  break;

                case 'checkbox':
                  item = {
                    type: 'checkbox',
                    name: label || inputLabel(node),
                    disabled: !!$node.attr('disabled'),
                    selected: !!$node.attr('checked')
                  };
                  break;

                case 'radio':
                  item = {
                    type: 'radio',
                    name: label || inputLabel(node),
                    disabled: !!$node.attr('disabled'),
                    radio: !!$node.attr('name'),
                    value: $node.val(),
                    selected: !!$node.attr('checked')
                  };
                  break;

                default:
                  item = undefined;
                  break;
              }

              break;

            case 'select':
              item = {
                type: 'select',
                name: label || inputLabel(node),
                disabled: !!$node.attr('disabled'),
                selected: $node.val(),
                options: {}
              };
              $node.children().each(function () {
                item.options[this.value] = $(this).text();
              });
              break;

            case 'textarea':
              item = {
                type: 'textarea',
                name: label || inputLabel(node),
                disabled: !!$node.attr('disabled'),
                value: $node.val()
              };
              break;

            case 'label':
              break;

            default:
              item = {
                type: 'html',
                html: $node.clone(true)
              };
              break;
          }

          if (item) {
            counter++;
            items['key' + counter] = item;
          }
        });
        return counter;
      } // convert html5 menu


      $.contextMenu.fromMenu = function (element) {
        var $this = $(element),
            items = {};
        menuChildren(items, $this.children());
        return items;
      }; // make defaults accessible


      $.contextMenu.defaults = defaults;
      $.contextMenu.types = types; // export internal functions - undocumented, for hacking only!

      $.contextMenu.handle = handle;
      $.contextMenu.op = op;
      $.contextMenu.menus = menus;
    };
  };

  var mUnitMenu = function mUnitMenu(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.options = Object.assign({
      label: '',
      select: false,
      draggable: true,
      dragstart: 'dragStart',
      tool: {
        insert: false,
        config: false,
        reload: false
      },
      item: []
    }, options);
    this.icons = {
      insert: 'fa-plus',
      delete: 'fa-trash',
      copy: 'fa-clone',
      rename: 'fa-edit',
      convert: 'fa-exchange-alt',
      setting: 'fa-cog',
      export: 'fa-file-export',
      info: 'fa-file'
    };

    if (!$__default["default"].ui || !$__default["default"].ui.position) {
      var uipos = new mPosition();
      uipos.createPosition($__default["default"]);
    }

    if (!$__default["default"].contextMenu) {
      var contextm = new mContextMenu();
      contextm.createContextMenu($__default["default"]);
    }

    this.update(this.options);
  };

  mUnitMenu.prototype = {
    clear: function clear() {
      this.options = {
        label: '',
        select: false,
        draggable: true,
        dragstart: 'dragStart',
        tool: {
          insert: false,
          config: false,
          reload: false
        },
        item: []
      };
      $__default["default"](this.$element).find('.munitmenu-title > .munitmenu-icon').removeClass('fa-chevron-right').addClass('fa-chevron-down');
      $__default["default"](this.$element).find('.munitmenu-body').removeClass('munitmenu-hidden');
      $__default["default"](this.$element).removeClass('munitmenu-collapse');
      this.render();
    },
    destroy: function destroy() {
      this.$element.find('div.munitmenu-header').off();
      this.$element.find('div.munitmenu-body').off();
      this.$element.find('div.munitmenu-header').remove();
      this.$element.find('div.munitmenu-body').remove();
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({
        label: '',
        select: false,
        draggable: true,
        dragstart: 'dragStart',
        tool: {
          insert: false,
          config: false,
          reload: false
        },
        item: []
      }, options);
      this.$element.find('div.munitmenu-header').off();
      this.$element.find('div.munitmenu-body').off();
      this.$element.find('div.munitmenu-header').remove();
      this.$element.find('div.munitmenu-body').remove();
      this.render(); // munitmenu-header: toggle munitmenu-body

      this.$element.find('div.munitmenu-header').on('click', '.munitmenu-title > .munitmenu-icon', $__default["default"].proxy(function callToggle(ev) {
        this.toggleUnitMenu(ev.currentTarget);
      }, this)); // munitmenu-header: insert, config, reload btns

      this.$element.find('div.munitmenu-header').on('click', '.munitmenu-btn > .munitmenu-icon', $__default["default"].proxy(function callSelect(ev) {
        this.selectUnitMenu(ev.currentTarget);
      }, this)); // munitmenu-body: toggle item-group

      this.$element.find('div.munitmenu-body').on('click', '.munitmenu-item-group > .munitmenu-item-name', $__default["default"].proxy(function callToggle(ev) {
        this.toggleItem(ev.currentTarget);
      }, this)); // munitmenu-body: toggle item<li>

      this.$element.find('div.munitmenu-body').on('click', '.munitmenu-item', $__default["default"].proxy(function callSelect(ev) {
        this.selectItem(ev);
      }, this));
    },
    render: function render() {
      var da = this.options;
      var txt = [];
      txt += '<div class="munitmenu-header" data-select="' + da.select + '">';
      txt += '  <span class="munitmenu-title">';
      txt += '    <i class="munitmenu-icon fa fa-chevron-down"></i>' + da.label;
      txt += '  </span>';
      txt += '  <span class="munitmenu-btn">';

      if (da.tool.insert != undefined && da.tool.insert === true) {
        txt += '    <i class="munitmenu-icon fa fa-plus" id="' + this.uiid + '-insert" data-menu="' + this.uiid + '" data-type="insert"></i>';
      }

      if (da.tool.config != undefined && da.tool.config === true) {
        txt += '    <i class="munitmenu-icon fa fa-cog" id="' + this.uiid + '-config" data-menu="' + this.uiid + '" data-type="config"></i>';
      }

      if (da.tool.reload != undefined && da.tool.reload === true) {
        txt += '    <i class="munitmenu-icon fa fa-sync-alt" id="' + this.uiid + '-reload"  data-menu="' + this.uiid + '" data-type="reload"></i>';
      }

      txt += '  </span>';
      txt += '</div>';
      txt += '<div class="munitmenu-body">';

      for (var i = 0, len = da.item.length; i < len; i++) {
        if (da.item[i].type === 'branch') {
          txt += '<li class="munitmenu-item" id="' + da.item[i].id + '" data-type="' + da.item[i].type + '" data-title="' + da.item[i].label + '">';
        } else {
          if (da.draggable != undefined && da.draggable == true) {
            txt += '<li class="munitmenu-item ' + this.uiid + '-munitmenu-item" id="' + da.item[i].id + '" draggable="' + da.draggable + '" ondragstart="' + da.dragstart + '(event)" data-type="' + da.item[i].type + '" data-title="' + da.item[i].label + '" data-selected="' + da.item[i].selected + '">';
          } else {
            txt += '<li class="munitmenu-item ' + this.uiid + '-munitmenu-item" id="' + da.item[i].id + '" draggable="' + da.draggable + '" data-type="' + da.item[i].type + '" data-title="' + da.item[i].label + '" data-selected="' + da.item[i].selected + '">';
          }
        }

        txt += '  <span class="munitmenu-item-name">';
        txt += '    <i class="munitmenu-item-icon fa fa-chevron-down"></i>';
        txt += '    <span class="munitmenu-item-title">' + da.item[i].label + '</span>';

        if (da.item[i].menu) {
          txt += '    <span class="munitmenu-item-btn munitmenu-pull-right ' + this.uiid + '-list-btn" id="' + da.item[i].id + '-btn" data-item="' + da.item[i].id + '" data-title="' + da.item[i].label + '">';
          txt += '      <i class="fa fa-ellipsis-v"></i>';
          txt += '    </span>';
        }

        txt += '  </span>';
        txt += '  <ul class="munitmenu-content">';

        if (da.item[i].subitems) {
          for (var w = 0, ln = da.item[i].subitems.length; w < ln; w++) {
            if (da.draggable != undefined && da.draggable == true) {
              txt += '  <li class="munitmenu-item ' + this.uiid + '-munitmenu-item" id="' + da.item[i].subitems[w].id + '" draggable="' + da.draggable + '" ondragstart="' + da.dragstart + '(event)" data-type="' + da.item[i].subitems[w].type + '" data-title="' + da.item[i].subitems[w].label + '" data-selected="' + da.item[i].subitems[w].selected + '">';
            } else {
              txt += '  <li class="munitmenu-item ' + this.uiid + '-munitmenu-item" id="' + da.item[i].subitems[w].id + '" draggable="' + da.draggable + '" data-type="' + da.item[i].subitems[w].type + '" data-title="' + da.item[i].subitems[w].label + '" data-selected="' + da.item[i].subitems[w].selected + '">';
            }

            txt += '    <span class="munitmenu-item-name">';
            txt += '      <i class="munitmenu-item-icon fa fa-chevron-down"></i>';
            txt += '      <span class="munitmenu-item-title">' + da.item[i].subitems[w].label + '</span>';

            if (da.item[i].subitems[w].menu) {
              txt += '      <span class="munitmenu-item-btn munitmenu-pull-right ' + this.uiid + '-list-btn" id="' + da.item[i].subitems[w].id + '-btn" data-item="' + da.item[i].subitems[w].id + '" data-title="' + da.item[i].subitems[w].label + '">';
              txt += '        <i class="fa fa-ellipsis-v"></i>';
              txt += '      </span>';
            }

            txt += '    </span>';
            txt += '  </li>';
          }
        }

        txt += '  </ul>';
        txt += '</li>';
      }
      txt += '</div>';
      this.populate(this.$element, da, txt);
    },
    populate: function populate(el, da, txt) {
      this.$element.html(txt);
      this.contextMenuTxt(el, da);
      $__default["default"]('.munitmenu-item').each(function (e) {
        var id = $__default["default"](this).attr('id');

        if ($__default["default"](this).attr('data-type') === 'item') {
          $__default["default"]('[id="' + id + '"]').find('.munitmenu-item-icon, .munitmenu-content').remove(); // $('#' + id + ' .munitmenu-item-icon, #' + id + ' .munitmenu-content').remove();
        }

        if ($__default["default"](this).attr('data-type') === 'branch') {
          $__default["default"](this).addClass('munitmenu-item-group'); // $('#' + id + ' > .munitmenu-item-name > .munitmenu-item-btn').remove();
        }

        if ($__default["default"](this).attr('data-selected') === 'true') {
          $__default["default"]('[id="' + id + '"]').addClass('active'); // $('#' + id).addClass('active');
        }
      });
    },
    contextMenuTxt: function contextMenuTxt(el, da) {
      var config = [];

      for (var i = 0, len = da.item.length; i < len; i++) {
        if (da.item[i].menu) {
          var items = {};

          for (var x = 0, lnx = da.item[i].menu.length; x < lnx; x++) {
            items[da.item[i].menu[x].mid] = {
              name: da.item[i].menu[x].label,
              icon: this.icons[da.item[i].menu[x].type]
            };
          }

          config = {
            selector: '[id="' + da.item[i].id + '-btn"]',
            // "#" + da.item[i].id + "-btn",
            trigger: 'left',
            hideOnSecondTrigger: true,
            items: items,
            callback: this.selectContextItem.bind(this)
          };

          if ($__default["default"].contextMenu) {
            $__default["default"].contextMenu(config);
          }
        }

        if (da.item[i].subitems) {
          for (var w = 0, ln = da.item[i].subitems.length; w < ln; w++) {
            var _items = {};

            if (da.item[i].subitems[w].menu) {
              for (var _x = 0, _lnx = da.item[i].subitems[w].menu.length; _x < _lnx; _x++) {
                _items[da.item[i].subitems[w].menu[_x].mid] = {
                  name: da.item[i].subitems[w].menu[_x].label,
                  icon: this.icons[da.item[i].subitems[w].menu[_x].type]
                };
              }

              config = {
                selector: '[id="' + da.item[i].subitems[w].id + '-btn"]',
                // "#" + da.item[i].subitems[w].id + "-btn",
                trigger: 'left',
                hideOnSecondTrigger: true,
                items: _items,
                callback: this.selectContextItem.bind(this)
              };

              if ($__default["default"].contextMenu) {
                $__default["default"].contextMenu(config);
              }
            }
          }
        }
      }
    },
    toggleUnitMenu: function toggleUnitMenu(el) {
      if ($__default["default"](el).hasClass('fa-chevron-down')) {
        $__default["default"](el).removeClass('fa-chevron-down').addClass('fa-chevron-right');
        $__default["default"](el).parents('.munitmenu-header').next('.munitmenu-body').addClass('munitmenu-hidden');
        $__default["default"](el).parents('.munitmenu-container').addClass('munitmenu-collapse');
      } else if ($__default["default"](el).hasClass('fa-chevron-right')) {
        $__default["default"](el).removeClass('fa-chevron-right').addClass('fa-chevron-down');
        $__default["default"](el).parents('.munitmenu-header').next('.munitmenu-body').removeClass('munitmenu-hidden');
        $__default["default"](el).parents('.munitmenu-container').removeClass('munitmenu-collapse');
      }
    },
    toggleItem: function toggleItem(el) {
      if ($__default["default"](el).find('.munitmenu-item-icon').hasClass('fa-chevron-down')) {
        $__default["default"](el).find('.munitmenu-item-icon').removeClass('fa-chevron-down').addClass('fa-chevron-right');
        $__default["default"](el).next('.munitmenu-content').addClass('munitmenu-hidden');
      } else if ($__default["default"](el).find('.munitmenu-item-icon').hasClass('fa-chevron-right')) {
        $__default["default"](el).find('.munitmenu-item-icon').removeClass('fa-chevron-right').addClass('fa-chevron-down');
        $__default["default"](el).next('.munitmenu-content').removeClass('munitmenu-hidden');
      }
    },
    selectUnitMenu: function selectUnitMenu(el) {
      var id = $__default["default"](el).attr('id');
      var type = $__default["default"](el).attr('data-type');
      var title = $__default["default"](el).attr('data-menu');

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('selectmenu', {
          id: id,
          type: type,
          title: title
        });
      } else {
        if (this.$element[0].fireEvent) {
          this.$element[0].fireEvent('selectmenu');
        } else {
          var evObj = new CustomEvent('selectmenu', {
            detail: {
              id: id,
              type: type,
              title: title
            }
          });
          this.$element[0].dispatchEvent(evObj);
        }
      }
    },
    selectItem: function selectItem(el) {
      var selectable = $__default["default"]('#' + this.uiid).children().attr('data-select');
      var id, title;

      if (selectable && $__default["default"](el.currentTarget).hasClass('munitmenu-item') && !$__default["default"](el.currentTarget).hasClass('munitmenu-item-group')) {
        if (!$__default["default"](el.target).hasClass('fa')) {
          $__default["default"]('.' + this.uiid + '-munitmenu-item.active').removeClass('active');
          $__default["default"](el.currentTarget).addClass('active');
          id = $__default["default"](el.currentTarget).attr('id');
          title = $__default["default"](el.currentTarget).attr('data-title');

          if (this.options.onAction && typeof this.options.onAction === 'function') {
            this.options.onAction('selectitem', {
              id: id,
              type: 'select',
              title: title
            });
          } else {
            if (this.$element[0].fireEvent) {
              this.$element[0].fireEvent('selectitem');
            } else {
              var evObj = new CustomEvent('selectitem', {
                detail: {
                  id: id,
                  type: 'select',
                  title: title
                }
              });
              this.$element[0].dispatchEvent(evObj);
            }
          }
        }
      }
    },
    selectContextItem: function selectContextItem(key, options) {
      var id = $__default["default"](options.$trigger).attr('data-item');
      var title = $__default["default"](options.$trigger).attr('data-title');

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('selectcontext', {
          id: id,
          type: key,
          title: title
        });
      } else {
        if (this.$element[0].fireEvent) {
          this.$element[0].fireEvent('selectcontext');
        } else {
          var evObj = new CustomEvent('selectcontext', {
            detail: {
              id: id,
              type: key,
              title: title
            }
          });
          this.$element[0].dispatchEvent(evObj);
        }
      }
    }
  };

  var mInput = function mInput(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.defaults = {
      item: [{
        name: '',
        value: ''
      }],
      length: '',
      replace: false,
      item_min: 1,
      item_max: 3,
      limit: {
        min: 1,
        max: 100
      }
    };
    this.options = Object.assign({
      item: [{
        name: '',
        value: ''
      }],
      length: '',
      replace: false,
      item_min: 1,
      item_max: 3,
      limit: {
        min: 1,
        max: 100
      }
    }, options);
    this.$element.on('click', '.minput-btn.addbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.minput-btn.delbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.deleteItem(ev.currentTarget);
    }, this));
    this.$element.on('change', '.minput-input.minput-item-value', $__default["default"].proxy(function callToggle(ev) {
      this.verifyValueRule(ev.currentTarget);
      this.itemBannedAction();
    }, this));
    this.populate();
  };

  mInput.prototype = {
    clear: function clear() {
      this.options = {
        item: [{
          name: '',
          value: '',
          len: ''
        }],
        length: '',
        replace: false,
        item_min: 1,
        item_max: 3,
        limit: {
          min: 1,
          max: 100
        }
      };
      this.setItem();
      this.itemBannedAction();
    },
    destroy: function destroy() {
      this.$element.find('table.minput').off();
      this.$element.find('table.minput').remove();
      this.$element.data('daai.minput');
      this.$element.removeData('daai.minput');
      this.$element.data('daai.minput');
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({
        item: [{
          name: '',
          value: '',
          len: ''
        }],
        item_min: 1,
        item_max: 3,
        limit: {
          min: 1,
          max: 100
        },
        length: '',
        replace: false
      }, options);
      this.setItem();
      this.itemBannedAction();
    },
    populate: function populate() {
      var html = this.render();
      this.$element.html(html);
      this.setItem();
      this.itemBannedAction();
    },
    render: function render() {
      var da = this.options;
      var html = '';
      html += '<table class="minput" id="' + this.uiid + '">';
      html += '  <thead class="minput-header">';
      html += '    <tr>';
      html += '      <td class="minput-title minput-title-left" id="' + this.uiid + '-title-left">Name</td>';
      html += '      <td class="minput-title minput-title-right" id="' + this.uiid + '-title-right">Percent</td>';
      html += '      <td class="minput-title minput-title-len" id="' + this.uiid + '-title-len">Len</td>';
      html += '      <td></td>';
      html += '    </tr>';
      html += '  </thead>';
      html += '  <tbody class="minput-body">';

      for (var i = 0, len = da.item_max; i < len; i++) {
        var hidden = da.item[i] ? ' data-min="' + da.limit.min + '" data-max="' + da.limit.max + '" ' : ' style="display: none;" ';
        html += '<tr class="minput-item ' + this.uiid + '-item" id="' + this.uiid + '-item' + i + '" data-item="' + i + '"' + hidden + '>'; // name

        html += '  <td class="minput-td">';
        html += '    <input class="minput-input minput-item-name ' + this.uiid + '-input" type="text" id="' + this.uiid + '-input-name' + i + '" value="" data-item="' + i + '">';
        html += '  </td>'; // value

        html += '  <td class="minput-td">';
        html += '    <input class="minput-input minput-input-sm minput-item-value ' + this.uiid + '-input" type="text" id="' + this.uiid + '-input-value' + i + '" value="" data-item="' + i + '" data-previous="" data-min="' + da.limit.min + '" data-max="' + da.limit.max + '" data-length="' + da.length + '">';
        html += '  </td>'; // len

        html += '  <td class="minput-td">';
        html += '    <input class="minput-input minput-input-sm minput-item-len ' + this.uiid + '-input" type="text" value="" data-item="' + i + '" data-length="' + da.length + '" disabled>';
        html += '  </td>';
        html += '  <td class="minput-td minput-btns">';
        html += '    <span class="minput-btn addbtn" data-item="' + i + '" data-curr="' + this.uiid + '-item' + i + '" data-next="' + this.uiid + '-item' + (i + 1) + '"><i class="fas fa-plus"></i></span>';
        html += '    <span class="minput-btn delbtn" data-item="' + i + '" data-curr="' + this.uiid + '-item' + i + '" data-prev="' + this.uiid + '-item' + (i - 1) + '"><i class="fas fa-minus"></i></span>';
        html += '  </td>';
        html += '</tr>';
      }

      html += '  </tbody>';
      html += '</table>';
      return html;
    },
    setItem: function setItem() {
      for (var i = 0, len = this.options.item_max; i < len; i++) {
        $__default["default"]('#' + this.uiid + '-item' + i).removeAttr('style').hide();
        $__default["default"]('#' + this.uiid + '-item' + i).find('.minput-input').val('').attr('data-previous', '');
        $__default["default"]('#' + this.uiid + '-item' + i).find('.minput-btn').removeAttr('style');
      }

      for (var w = 0, ln = this.options.item.length; w < ln; w++) {
        var _range = this.verifyRange();

        if (this.options.item[w].value) {
          this.options.item[w].len = Math.floor(this.options.item[w].value * this.options.length / 100);
        }

        $__default["default"]('#' + this.uiid + '-item' + w).find('.minput-item-name').val(this.options.item[w].name);
        $__default["default"]('#' + this.uiid + '-item' + w).find('.minput-item-value').val(this.options.item[w].value);
        $__default["default"]('#' + this.uiid + '-item' + w).find('.minput-item-len').val(this.options.item[w].len);

        if (w < ln - 1) {
          $__default["default"]('#' + this.uiid + '-item' + w).show().css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
          $__default["default"]('#' + this.uiid + '-item' + w).find('.addbtn, .delbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '1'
          }); // $('#' + this.uiid + '-item' + w).find('.addbtn, .delbtn').removeAttr('style');
        } else if (w == ln - 1) {
          if (!this.options.replace) {
            $__default["default"]('#' + this.uiid + '-item' + w).find('.minput-item-value').attr('data-max', _range);
          }

          $__default["default"]('#' + this.uiid + '-item' + w).show().css({
            'cursor': 'auto',
            'pointer-events': 'auto',
            'opacity': '1'
          });
          $__default["default"]('#' + this.uiid + '-item' + w).find('.addbtn, .delbtn').removeAttr('style');
        } else if (w > ln - 1) {
          $__default["default"]('#' + this.uiid + '-item' + w).hide();
        }
      }

      var range = this.verifyRange();

      if (!this.options.replace) {
        if (!range || range === 0) {
          $__default["default"]('#' + this.uiid + '-item' + 0).find('.addbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
        }
      }
    },
    addItem: function addItem(el) {
      var curr = $__default["default"](el).attr('data-curr');
      var next = $__default["default"](el).attr('data-next');
      var name = $__default["default"]('#' + curr).find('.minput-item-name').val();
      var value = $__default["default"]('#' + curr).find('.minput-item-value').val();
      var range = this.verifyRange(); // clear next item value

      $__default["default"]('#' + next).find('.minput-item-value').attr('data-previous', '');
      $__default["default"]('#' + next).find('.minput-item').removeAttr('style');
      $__default["default"]('#' + next).find('.minput-input').val('');

      if (!this.options.replace) {
        if (name && value && range > 0) {
          $__default["default"]('#' + curr).css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
          $__default["default"]('#' + curr).find('.addbtn, .delbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '1'
          });
          $__default["default"]('#' + next).find('.minput-item-value').attr('data-max', range);
          $__default["default"]('#' + next).show();
        }
      } else {
        if (name && value) {
          $__default["default"]('#' + curr).css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
          $__default["default"]('#' + curr).find('.addbtn, .delbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '1'
          });
          $__default["default"]('#' + next).show();
        }
      }

      this.itemBannedAction();
    },
    deleteItem: function deleteItem(el) {
      var curr = $__default["default"](el).attr('data-curr');
      var prev = $__default["default"](el).attr('data-prev');
      $__default["default"]('#' + curr).hide();
      $__default["default"]('#' + curr).find('.minput-input').val('');
      $__default["default"]('#' + prev).css({
        'cursor': 'auto',
        'pointer-events': 'auto',
        'opacity': '1'
      });
      $__default["default"]('#' + prev).find('.addbtn, .delbtn').removeAttr('style');
      this.itemBannedAction();
    },
    getCurrentItems: function getCurrentItems() {
      var items = [];
      var da = this.options;
      $__default["default"]('.' + this.uiid + '-item').each(function (e) {
        items.push({
          name: '',
          value: '',
          previous_value: '',
          len: ''
        });
      });
      items.sort(function (a, b) {
        return a.item > b.item ? 1 : -1;
      });
      $__default["default"]('.' + this.uiid + '-input.minput-item-name').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        var name = $__default["default"](this).val();
        items[item].name = name;
      });
      var length = this.options.length;
      $__default["default"]('.' + this.uiid + '-input.minput-item-value').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        var len = length;
        var value = $__default["default"](this).val() === '' ? '' : Number($__default["default"](this).val());
        var previous_value = $__default["default"](this).attr('data-previous');
        items[item].value = value;
        items[item].previous_value = previous_value;

        if (value !== '' && value >= da.limit.min && value <= da.limit.max) {
          items[item].len = Math.floor(len * value / 100);
        } else {
          items[item].len = '';
        }
      });
      return items;
    },
    getItems: function getItems() {
      var da = this.getCurrentItems();
      var items = [];

      for (var i = 0, len = da.length; i < len; i++) {
        if (da[i].name === '' && da[i].value === '' || da[i].value === 0) {
          continue;
        }

        items.push({
          name: da[i].name,
          value: da[i].value
        });
      } // let ret = this.verifyInputName();
      // console.log(ret);


      return items;
    },
    itemBannedAction: function itemBannedAction() {
      var len = $__default["default"]('#' + this.uiid).find('.minput-item:visible').length;
      var da = this.options;
      $__default["default"]('#' + this.uiid).find('.minput-item').each(function (e) {
        if (!($__default["default"](this).css('display') == 'none')) {
          var idx = $__default["default"](this).attr('data-item');

          if (len <= da.item_min) {
            $__default["default"](this).find('.delbtn').css({
              'cursor': 'not-allowed',
              'pointer-events': 'none',
              'opacity': '0.3'
            });
          }

          if (len >= da.item_max && idx == len - 1) {
            $__default["default"](this).find('.addbtn').css({
              'cursor': 'not-allowed',
              'pointer-events': 'none',
              'opacity': '0.3'
            });
          }
        }
      });
    },
    verifyValueRule: function verifyValueRule(el) {
      var idx = $__default["default"](el).attr('data-item');
      var value = $__default["default"](el).val();
      var min = Number($__default["default"](el).attr('data-min'));
      var max = Number($__default["default"](el).attr('data-max'));
      var previous_value = $__default["default"](el).attr('data-previous');
      var length = this.options.length;

      if (!isNaN(Number(value)) && value !== '' && value >= min && value <= max) {
        $__default["default"](el).val(Number(value)).attr('data-previous', value);
      } else {
        $__default["default"](el).val(previous_value);
      }

      var percent = $__default["default"](el).val() === '' ? '' : Number($__default["default"](el).val());
      var len = 0;
      len = percent === '' ? '' : Math.floor(percent * length / 100);
      $__default["default"](el).parent().next().find('.minput-item-len').val(len);

      if (!this.options.replace) {
        var range = this.verifyRange();

        if (!range || range === 0) {
          $__default["default"]('#' + this.uiid + '-item' + idx).find('.addbtn').css({
            'cursor': 'not-allowed',
            'pointer-events': 'none',
            'opacity': '0.3'
          });
        } else {
          $__default["default"]('#' + this.uiid + '-item' + idx).find('.addbtn').css({
            'cursor': 'auto',
            'pointer-events': 'auto',
            'opacity': '1'
          });
        }
      }
    },
    verifyRange: function verifyRange() {
      var rangelist = [];

      for (var i = 0, len = this.options.item_max; i < len; i++) {
        if (!($__default["default"]('#' + this.uiid + '-item' + i).css('display') == 'none')) {
          var value = Number($__default["default"]('#' + this.uiid + '-item' + i).find('.minput-item-value').val());
          rangelist.push(value);
        }
      }

      var avail = this.getAvailability(rangelist);
      return avail;
    },
    getAvailability: function getAvailability(range) {
      var avail = this.options.limit.max;

      for (var i = 0, len = range.length; i < len; i++) {
        if (range[i] >= this.options.limit.min && range[i] <= this.options.limit.max) {
          avail = avail - range[i];
        }
      }

      return avail;
    },
    verifyInputName: function verifyInputName() {
      var ret = true;
      $__default["default"]('#' + this.uiid).find('.minput-item').each(function (e) {
        if (!($__default["default"](this).css('display') == 'none')) {
          var name = $__default["default"](this).find('.minput-input').val();

          if (!name) {
            ret = false;
            $__default["default"](this).find('.minput-icon').show();
          }
        }
      });
      return ret;
    }
  };

  var colSelector = function colSelector(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.defaults = {
      item_min: 1,
      item_max: 3,
      item: [{
        value: '',
        label: '-'
      }],
      columns: [{
        value: '',
        label: '-'
      }]
    };
    this.options = Object.assign({
      item_min: 1,
      item_max: 3,
      item: [{
        value: '',
        label: '-'
      }],
      columns: [{
        value: '',
        label: '-'
      }]
    }, options);
    this.$element.on('click', '.addbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.delbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.deleteItem(ev.currentTarget);
    }, this));
    this.$element.on('change', '.colselector-select', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.changeItem(ev.currentTarget);
    }, this));
    this.populate();
  };

  colSelector.prototype = {
    clear: function clear() {
      this.options = {
        item_min: 1,
        item_max: 3,
        item: [{
          value: '',
          label: '-'
        }],
        columns: this.options.columns
      };
      this.populate();
    },
    destroy: function destroy() {
      this.$element.find('table.colselector').off();
      this.$element.find('table.colselector').remove();
      this.$element.data('daai.colselector');
      this.$element.removeData('daai.colselector');
      this.$element.data('daai.colselector');
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({
        item_min: 1,
        item_max: 3,
        item: [{
          value: '',
          label: '-'
        }],
        columns: this.options.columns
      }, options);
      this.populate();
    },
    populate: function populate() {
      if (this.options.item.length != 0) {
        var item = [];

        for (var i = 0, len = this.options.item.length; i < len; i++) {
          if (!this.options.item[i].hasOwnProperty('value') || !this.options.item[i].hasOwnProperty('label')) {
            continue;
          }

          item.push(this.options.item[i]);
        }

        this.options.item = item;
      }

      if (this.options.item.length == 0) {
        this.options.item = [{
          value: '',
          label: '-'
        }];
      }

      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    render: function render() {
      var da = this.options;
      var html = '';
      html += '<table class="colselector" id="' + this.uiid + '-table">';
      html += '  <tbody class="colselector-body">';
      var colselected = [];

      for (var i = 0, len = da.item.length > da.item_max ? da.item_max : da.item.length; i < len; i++) {
        var col = this.genList(da.item[i].value, colselected, da.columns);
        html += '    <tr class="colselector-item ' + this.uiid + '-item' + '" data-item="' + i + '">';
        html += '      <td class="colselector-td">';
        html += '        <select class="colselector-select ' + this.uiid + '-select" data-item="' + i + '">';
        html += '          <option value="">-</option>';
        html += col;
        html += '        </select>';
        html += '      </td>';
        html += '      <td class="colselector-td colselector-btns">';
        html += '        <span class="colselector-btn addbtn" data-item="' + i + '"><i class="fas fa-plus"></i></span>';
        html += '        <span class="colselector-btn delbtn" data-item="' + i + '"><i class="fas fa-minus"></i></span>';
        html += '      </td>';
        html += '    </tr>';
        colselected.push(da.item[i].value);
      }

      html += '  </tbody>';
      html += '</table>';
      return html;
    },
    genList: function genList(curitem, selectedlist, list) {
      var html = '';

      for (var i = 0, hidden = '', selected = '', len = list.length; i < len; i++, hidden = '', selected = '') {
        selected = list[i].value == curitem ? ' selected ' : '';

        for (var w = 0, ln = selectedlist.length; w < ln; w++) {
          if (list[i].value == selectedlist[w]) {
            hidden = ' hidden ';
            break;
          }
        }

        if (!(list[i].value == '' && list[i].label == '-')) {
          html += '<option value="' + list[i].value + '"' + selected + hidden + '>' + list[i].label + '</option>';
        }
      }

      return html;
    },
    addItem: function addItem(el) {
      var idx = parseInt($__default["default"](el).attr('data-item'));
      var item = this.getCurrentItems();

      if (item.length < this.options.item_max) {
        if (item[idx].value) {
          item.splice(idx + 1, 0, {
            value: '',
            label: '-'
          });
        }
      }

      this.options.item = item;
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();

      if (this.options.onItems && typeof this.options.onItems === 'function') {
        this.options.onItems(this.uiid, 'add', item);
      }
    },
    deleteItem: function deleteItem(el) {
      var idx = parseInt($__default["default"](el).attr('data-item'));
      var item = this.getCurrentItems();

      if (item.length > this.options.item_min) {
        item.splice(idx, 1);
      }

      this.options.item = item;
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();

      if (this.options.onItems && typeof this.options.onItems === 'function') {
        this.options.onItems(this.uiid, 'delete', item);
      }
    },
    changeItem: function changeItem(el) {
      var item = this.getCurrentItems();
      this.itemBannedAction();

      if (this.options.onItems && typeof this.options.onItems === 'function') {
        this.options.onItems(this.uiid, 'change', item);
      }
    },
    getCurrentItems: function getCurrentItems() {
      var item = [];
      $__default["default"]('.' + this.uiid + '-item').each(function (e) {
        item.push({
          value: '',
          label: ''
        });
      });
      $__default["default"]('.' + this.uiid + '-select.colselector-select').each(function (e) {
        var idx = parseInt($__default["default"](this).attr('data-item'));
        var selected_val = $__default["default"](this).find('option:selected').val();
        var selected_text = $__default["default"](this).find('option:selected').text();
        item[idx].value = selected_val;
        item[idx].label = selected_text;
      });
      return item;
    },
    getItems: function getItems() {
      var da = this.getCurrentItems();
      var item = [];

      for (var i = 0, len = da.length; i < len; i++) {
        if (da[i].value === '' && da[i].label === '-') {
          continue;
        }

        item.push({
          value: da[i].value,
          label: da[i].label
        });
      }

      return item;
    },
    itemBannedAction: function itemBannedAction() {
      if (!this.options.item || this.options.item.length < 1) {
        this.options.item = [];
      }

      var uiid = '#' + this.uiid;
      $__default["default"](uiid).find('.colselector-select').each(function (i, e) {
        var dataitem = $__default["default"](this).attr('data-item');
        var disabled = !$__default["default"](this).val();
        $__default["default"](uiid).find('.colselector-btn.addbtn').each(function (i, e) {
          var dai = $__default["default"](this).attr('data-item');

          if (dataitem == dai) {
            $__default["default"](this).removeClass('colselector-banned-action');

            if (disabled) {
              $__default["default"](this).addClass('colselector-banned-action');
            }
          }

          return false;
        });
      });

      if (this.options.item.length <= this.options.item_min) {
        $__default["default"](uiid).find('.colselector-btn.delbtn').addClass('colselector-banned-action');
      }

      if (this.options.item.length >= this.options.item_max || this.options.item_max <= 1) {
        $__default["default"](uiid).find('.colselector-btn.addbtn').addClass('colselector-banned-action');
      }

      $__default["default"]('.' + this.uiid + '-item:not(:last-child)').each(function (i, e) {
        $__default["default"](this).find('.colselector-select').addClass('colselector-banned-action');
        $__default["default"](this).find('.colselector-btn.addbtn').addClass('colselector-banned-action');
      });
    }
  };

  var pairSelector = function pairSelector(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.defaults = {
      item_min: 1,
      item_max: 3,
      exclusive: false,
      item: [{
        left_value: '',
        left_label: '-',
        right_value: '-',
        right_label: '-'
      }],
      columns: [{
        value: '',
        label: '-'
      }],
      match: {
        undefined: [{
          value: '',
          label: '-'
        }]
      }
    };
    this.options = Object.assign({
      item_min: 1,
      item_max: 3,
      exclusive: false,
      item: [{
        left_value: '',
        left_label: '-',
        right_value: '-',
        right_label: '-'
      }],
      columns: [{
        value: '',
        label: '-'
      }],
      match: {
        undefined: [{
          value: '',
          label: '-'
        }]
      }
    }, options);
    this.$element.on('click', '.addbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.delbtn', $__default["default"].proxy(function callToggle(ev) {
      ev.stopImmediatePropagation();
      this.deleteItem(ev.currentTarget);
    }, this));
    this.$element.on('change', '.pairselector-left', $__default["default"].proxy(function callToggle(ev) {
      this.updateLeftSelector();
    }, this));
    this.$element.on('change', '.pairselector-right', $__default["default"].proxy(function callToggle(ev) {
      this.updateRightSelector();
    }, this));
    this.populate();
  };

  pairSelector.prototype = {
    clear: function clear() {
      this.options = {
        item_min: 1,
        item_max: 3,
        exclusive: false,
        item: [{
          left_value: '',
          left_label: '-',
          right_value: '-',
          right_label: '-'
        }],
        columns: this.options.columns,
        match: this.options.match
      };
      this.populate();
    },
    destroy: function destroy() {
      this.$element.find('table.pairselector').off();
      this.$element.find('table.pairselector').remove();
      this.$element.data('daai.pairselector');
      this.$element.removeData('daai.pairselector');
      this.$element.data('daai.pairselector');
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({
        item_min: 1,
        item_max: 3,
        exclusive: false,
        item: [{
          left_value: '',
          left_label: '-',
          right_value: '-',
          right_label: '-'
        }],
        columns: this.options.columns,
        match: this.options.match
      }, options);
      this.populate();
    },
    populate: function populate() {
      if (this.options.item.length != 0) {
        var item = [];

        for (var i = 0, len = this.options.item.length; i < len; i++) {
          if (!this.options.item[i].hasOwnProperty('left_value') || !this.options.item[i].hasOwnProperty('left_label') || !this.options.item[i].hasOwnProperty('right_value') || !this.options.item[i].hasOwnProperty('right_label')) {
            continue;
          }

          item.push(this.options.item[i]);
        }

        this.options.item = item;
      }

      if (this.options.item.length == 0) {
        this.options.item = [{
          left_value: '',
          left_label: '-',
          right_value: '',
          right_label: '-'
        }];
      }

      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();
    },
    render: function render() {
      var da = this.options;
      var html = '';
      html += '<table class="pairselector" id="' + this.uiid + '-table">';
      html += '  <tbody class="pairselector-body">';
      var leftselected = [];
      var rightselected = [];

      for (var i = 0, len = da.item.length > da.item_max ? da.item_max : da.item.length; i < len; i++) {
        var left = this.genList(da.item[i].left_value, leftselected, da.columns);
        var right = this.genMatchList(da.item[i].right_value, rightselected, da.match[da.item[i].left_value]);
        html += '    <tr class="pairselector-item ' + this.uiid + '-item' + '" data-item="' + i + '">';
        html += '      <td class="pairselector-td">';
        html += '        <select class="pairselector-select-left pairselector-left ' + this.uiid + '-select" data-item="' + i + '">';
        html += '          <option value="">-</option>';
        html += left;
        html += '        </select>';
        html += '      </td>';
        html += '      <td class="pairselector-td">';
        html += '        <select class="pairselector-select-right pairselector-right ' + this.uiid + '-select" data-item="' + i + '">';
        html += '          <option value="">-</option>';
        html += right;
        html += '        </select>';
        html += '      </td>';
        html += '      <td class="pairselector-td pairselector-btns">';
        html += '        <span class="pairselector-btn addbtn" data-item="' + i + '"><i class="fas fa-plus"></i></span>';
        html += '        <span class="pairselector-btn delbtn" data-item="' + i + '"><i class="fas fa-minus"></i></span>';
        html += '      </td>';
        html += '    </tr>';

        if (this.options.exclusive) {
          leftselected.push(da.item[i].left_value);
        }
      }

      html += '  </tbody>';
      html += '</table>';
      return html;
    },
    genList: function genList(curitem, selectedlist, list) {
      var html = '';

      for (var i = 0, hidden = '', selected = '', len = list.length; i < len; i++, hidden = '', selected = '') {
        selected = list[i].value == curitem ? ' selected ' : '';

        for (var w = 0, ln = selectedlist.length; w < ln; w++) {
          if (list[i].value == selectedlist[w]) {
            hidden = ' hidden ';
            break;
          }
        }

        if (!(list[i].value == '' && list[i].label == '-')) {
          html += '<option value="' + list[i].value + '"' + selected + hidden + '>' + list[i].label + '</option>';
        }
      }

      return html;
    },
    genMatchList: function genList(curitem, selectedlist, list) {
      if (!list) {
        list = [{
          value: '',
          label: '-'
        }];
      }

      var html = '';

      for (var i = 0, hidden = '', selected = '', len = list.length; i < len; i++, hidden = '', selected = '') {
        selected = list[i].value == curitem ? ' selected ' : '';

        for (var w = 0, ln = selectedlist.length; w < ln; w++) {
          if (list[i].value == selectedlist[w]) {
            hidden = ' hidden ';
            break;
          }
        }

        if (!(list[i].value == '' && list[i].label == '-')) {
          html += '<option value="' + list[i].value + '"' + selected + hidden + '>' + list[i].label + '</option>';
        }
      }

      return html;
    },
    updateLeftSelector: function updateLeftSelector(el) {
      parseInt($__default["default"](el).attr('data-item'));
      this.options.item = this.getCurrentItems();
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();

      if (this.options.onItems && typeof this.options.onItems === 'function') {
        this.options.onItems(this.uiid, 'change', this.options.item, 'left');
      }
    },
    updateRightSelector: function updateRightSelector(el) {
      parseInt($__default["default"](el).attr('data-item'));
      this.options.item = this.getCurrentItems();
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();

      if (this.options.onItems && typeof this.options.onItems === 'function') {
        this.options.onItems(this.uiid, 'change', this.options.item, 'right');
      }
    },
    addItem: function addItem(el) {
      var idx = parseInt($__default["default"](el).attr('data-item'));
      var item = this.getCurrentItems();

      if (item.length < this.options.item_max) {
        if (!(item[idx].left_value === '' || item[idx].right_value === '')) {
          item.splice(idx + 1, 0, {
            left_value: '',
            left_label: '-',
            right_value: '',
            right_label: '-'
          });
        }
      }

      this.options.item = item;
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();

      if (this.options.onItems && typeof this.options.onItems === 'function') {
        this.options.onItems(this.uiid, 'add', item);
      }
    },
    deleteItem: function deleteItem(el) {
      var idx = parseInt($__default["default"](el).attr('data-item'));
      var item = this.getCurrentItems();

      if (item.length > this.options.item_min) {
        item.splice(idx, 1);
      }

      this.options.item = item;
      var html = this.render();
      this.$element.html(html);
      this.itemBannedAction();

      if (this.options.onItems && typeof this.options.onItems === 'function') {
        this.options.onItems(this.uiid, 'delete', item);
      }
    },
    getCurrentItems: function getCurrentItems() {
      var item = [];
      $__default["default"]('.' + this.uiid + '-item').each(function (e) {
        item.push({
          left_value: '',
          left_label: '',
          right_value: '',
          right_label: ''
        });
      });
      $__default["default"]('.' + this.uiid + '-select.pairselector-left').each(function (e) {
        var idx = parseInt($__default["default"](this).attr('data-item'));
        var selected_val = $__default["default"](this).find('option:selected').val();
        var selected_text = $__default["default"](this).find('option:selected').text();
        item[idx].left_value = selected_val;
        item[idx].left_label = selected_text;
      });
      $__default["default"]('.' + this.uiid + '-select.pairselector-right').each(function (e) {
        var idx = parseInt($__default["default"](this).attr('data-item'));
        var selected_val = $__default["default"](this).find('option:selected').val();
        var selected_text = $__default["default"](this).find('option:selected').text();
        item[idx].right_value = selected_val;
        item[idx].right_label = selected_text;
      });
      return item;
    },
    getItems: function getItems() {
      var da = this.getCurrentItems();
      var item = [];

      for (var i = 0, len = da.length; i < len; i++) {
        if (da[i].left_value === '' && da[i].left_label === '-' && da[i].right_value === '' && da[i].right_label === '-') {
          continue;
        }

        item.push({
          left_value: da[i].left_value,
          left_label: da[i].left_label,
          right_value: da[i].right_value,
          right_label: da[i].right_label
        });
      }

      return item;
    },
    itemBannedAction: function itemBannedAction() {
      if (!this.options.item || this.options.item.length < 1) {
        this.options.item = [];
      }

      var uiid = '#' + this.uiid;
      $__default["default"](uiid).find('.pairselector-select-left').each(function (i, e) {
        var dataitem = $__default["default"](this).attr('data-item');
        var lvalue = !$__default["default"](this).val();
        var rvalue = true;
        $__default["default"](uiid).find('.pairselector-select-right').each(function (i, e) {
          var dai = $__default["default"](this).attr('data-item');

          if (dataitem == dai) {
            rvalue = !$__default["default"](this).val();
            return false;
          }
        });
        var disabled = lvalue || rvalue;
        $__default["default"](uiid).find('.pairselector-btn.addbtn').each(function (i, e) {
          var dai = $__default["default"](this).attr('data-item');

          if (dataitem == dai) {
            $__default["default"](this).removeClass('pairselector-banned-action');

            if (disabled) {
              $__default["default"](this).addClass('pairselector-banned-action');
            }

            return false;
          }
        });
      });

      if (this.options.item.length <= this.options.item_min || this.options.item_min <= 1 && this.options.item_max <= 1) {
        $__default["default"](uiid).find('.pairselector-btn.delbtn').addClass('pairselector-banned-action');
      }

      if (this.options.item.length >= this.options.item_max || this.options.item_max <= 1) {
        $__default["default"](uiid).find('.pairselector-btn.addbtn').addClass('pairselector-banned-action');
      }

      $__default["default"]('.' + this.uiid + '-item:not(:last-child)').each(function (i, e) {
        $__default["default"](this).find('.pairselector-select-left').addClass('pairselector-banned-action');
        $__default["default"](this).find('.pairselector-select-right').addClass('pairselector-banned-action');
        $__default["default"](this).find('.pairselector-btn.addbtn').addClass('pairselector-banned-action');
      });
    }
  };

  var mIconMenu = function mIconMenu(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.default = {
      label: '',
      collapse: null,
      select: false,
      draggable: true,
      dragstart: 'dragStart',
      tool: [],
      activeType: 'disabled',
      item: [],
      srcpath: ''
    };
    this.options = JSON.parse(JSON.stringify(options));
    this.options = Object.assign({}, this.default, this.options, options.onAction ? {
      'onAction': options.onAction
    } : '');

    if (!$__default["default"].ui || !$__default["default"].ui.position) {
      var uipos = new mPosition();
      uipos.createPosition($__default["default"]);
    }

    if (!$__default["default"].contextMenu) {
      var contextm = new mContextMenu();
      contextm.createContextMenu($__default["default"]);
    } // miconmenu-header: toggle miconmenu-body


    this.$element.on('click', '.miconmenu-title > .miconmenu-icon', $__default["default"].proxy(function (ev) {
      this.toggleIconMenu(ev.currentTarget);
    }, this)); // miconmenu-header: insert, config, reload btns

    this.$element.on('click', '.miconmenu-btn > .miconmenu-icon, .miconmenu-btn > .miconmenu-img', $__default["default"].proxy(function (ev) {
      this.selectIconMenu(ev.currentTarget);
    }, this)); // item-group: collapse content items

    this.$element.on('click', '.miconmenu-item-group > .miconmenu-item-name', $__default["default"].proxy(function (ev) {
      if ($__default["default"](ev.target).hasClass('fa-ellipsis-v') || $__default["default"](ev.target).hasClass('miconmenu-item-btn')) {
        return;
      }

      this.toggleItemGroup(ev.currentTarget);
    }, this)); // item-group: collapse content items

    this.$element.on('click', '.miconmenu-title > .miconmenu-icon', $__default["default"].proxy(function (ev) {
      if ($__default["default"](ev.target).hasClass('fa-ellipsis-v') || $__default["default"](ev.target).hasClass('miconmenu-item-btn')) {
        return;
      }

      this.toggleTitleItemGroup(ev.currentTarget);
    }, this)); // item: select item

    this.$element.on('click', '.miconmenu-item', $__default["default"].proxy(function (ev) {
      if ($__default["default"](ev.currentTarget).hasClass('miconmenu-item-group')) {
        return;
      }

      this.selectItem(ev);
    }, this));
    this.$element.on('input', '.miconmenu-filter-input', $__default["default"].proxy(function (ev) {
      this.filterItem(ev);
    }, this));
    this.$element.on('click', '.miconmenu-filter-clear-btn', $__default["default"].proxy(function (ev) {
      $__default["default"](ev.target).siblings('.miconmenu-filter-input').val('').trigger('input');
    }, this));
    this.update(this.options);
  };

  mIconMenu.prototype = {
    clear: function clear(collapse) {
      if (collapse == null) {
        collapse = true;
        var header = this.$element.find('div.miconmenu-header > .miconmenu-title > .miconmenu-icon');

        if (header.hasClass('fa-chevron-down')) {
          collapse = false;
        }
      }

      if (!collapse) {
        $__default["default"](this.$element).find('.miconmenu-title > .miconmenu-icon').removeClass('fa-chevron-right').addClass('fa-chevron-down');
        $__default["default"](this.$element).find('.miconmenu-body').removeClass('miconmenu-hidden');
        $__default["default"](this.$element).removeClass('miconmenu-collapse');
      } else {
        $__default["default"](this.$element).find('.miconmenu-title > .miconmenu-icon').addClass('fa-chevron-right').removeClass('fa-chevron-down');
        $__default["default"](this.$element).find('.miconmenu-body').addClass('miconmenu-hidden');
        $__default["default"](this.$element).addClass('miconmenu-collapse');
      }

      this.options = JSON.parse(JSON.stringify(this.default));
      this.render(collapse);
    },
    destroy: function destroy() {
      this.$element.find('div.miconmenu-header').off();
      this.$element.find('div.miconmenu-body').off();
      this.$element.find('div.miconmenu-header').remove();
      this.$element.find('div.miconmenu-body').remove();
      this.$element[0].outerHTML = '';
    },
    collapse: function collapse() {
      var header = this.$element.find('div.miconmenu-header > .miconmenu-title > .miconmenu-icon');

      if (header.hasClass('fa-chevron-down')) {
        return false;
      }

      return true;
    },
    update: function update(options) {
      this.options = JSON.parse(JSON.stringify(options));
      this.options = Object.assign({}, this.default, this.options, options.onAction ? {
        'onAction': options.onAction
      } : '');
      var collapse = false;

      if (this.options.collapse != null) {
        collapse = this.options.collapse;
      } else {
        var header = this.$element.find('div.miconmenu-header > .miconmenu-title > .miconmenu-icon');

        if (header.hasClass('fa-chevron-right')) {
          collapse = true;
        }
      }

      this.render(collapse);
    },
    render: function render(collapse) {
      var da = this.options;
      var txt = '';

      if (!collapse) {
        txt += '<div class="miconmenu-header" data-select="' + da.select + '">';
        txt += '  <span class="miconmenu-title">';
        txt += '    <i class="miconmenu-icon fa fa-chevron-down"></i>';
        txt += '    <span>' + da.label + '</span>';
        txt += '  </span>';
      } else {
        txt += '<div class="miconmenu-header" data-select="' + da.select + '">';
        txt += '  <span class="miconmenu-title">';
        txt += '    <i class="miconmenu-icon fa fa-chevron-right"></i>';
        txt += '    <span>' + da.label + '</span>';
        txt += '  </span>';
      }

      txt += '  <span class="miconmenu-btn">';
      var isFilter = {
        active: false,
        title: false,
        placeholder: ''
      };

      for (var i = 0, len = da.tool.length; i < len; i++) {
        if (da.tool[i].name === 'filter') {
          isFilter.active = da.tool[i].active;
          isFilter.title = da.tool[i].title;
          isFilter.placeholder = da.tool[i].placeholder;
        }

        if (da.tool[i].active) {
          var sortable = da.tool[i].name === 'sort' ? "data-orderby=\"".concat(da.tool[i].orderBy, "\"") : '';

          if (da.tool[i].iconType === 'img') {
            var className = da.tool[i].className ? da.tool[i].className : "miconmenu-".concat(da.tool[i].name, "-img");
            txt += "<span class=\"miconmenu-img ".concat(className, "\" id=\"").concat(this.uiid, "-").concat(da.tool[i].name, "\"\n            data-menu=\"").concat(this.uiid, "\" data-type=\"").concat(da.tool[i].name, "\" ").concat(sortable, "></span>");
          } else if (da.tool[i].iconType === 'icon') {
            txt += "<i class=\"miconmenu-icon ".concat(da.tool[i].icon, "\" id=\"").concat(this.uiid, "-").concat(da.tool[i].name, "\"\n            data-menu=\"").concat(this.uiid, "\" data-type=\"").concat(da.tool[i].name, "\" ").concat(sortable, "></i>");
          }
        }
      }

      txt += '  </span>';
      txt += '</div>';

      if (!collapse) {
        txt += '<div class="miconmenu-body">';
      } else {
        txt += '<div class="miconmenu-body">';
      }

      if (isFilter.active) {
        txt += '<span class="miconmenu-filter" style="display: none;">';
        txt += '  <input type="text" class="miconmenu-filter-input" id="' + this.uiid + '-filter-input" data-menu="' + this.uiid + '"';
        txt += '   data-filter_title="' + isFilter.title + '"';
        txt += '   placeholder="' + (isFilter.placeholder ? isFilter.placeholder.replace(/"/g, '&quot;') : 'Search ...') + '">';
        txt += '  <i class="miconmenu-filter-clear-btn">&times;</i>';
        txt += '</span>';
      }

      txt += '  <ul style="margin: 0; padding: 0;">';

      for (var _i = 0, _len = da.item.length; _i < _len; _i++) {
        txt += this.menuItemTxt(da.item[_i], {
          draggable: da.draggable,
          dragstart: da.dragstart,
          srcpath: da.srcpath
        });
      }
      txt += '  </ul>';
      txt += '</div>';
      this.populate(txt);
    },
    menuItemTxt: function menuItemTxt(da, info) {
      var tooltip_template = '<div class="tooltip tooltip-outer" role="tooltip"><div class="arrow"></div><div class="tooltip-miconmenu tooltip-inner"></div></div>';
      var txt = '';

      if (da.type === 'branch') {
        txt += '<li class="miconmenu-item-group" id="' + da.id + '" data-type="' + da.type + '" data-title="' + da.label + '">';
        txt += '  <span class="miconmenu-item-name">';
        txt += '    <i class="miconmenu-item-icon fa fa-chevron-down"></i>';
      } else if (da.type === 'item') {
        if (info.draggable != undefined && info.draggable == true) {
          txt += '<li class="miconmenu-item ' + this.uiid + '-miconmenu-item" id="' + da.id + '" draggable="' + info.draggable + '" ondragstart="' + info.dragstart + '(event)" data-type="' + da.type + '" data-title="' + da.label + '" data-selected="' + da.selected + '">';
        } else {
          txt += '<li class="miconmenu-item ' + this.uiid + '-miconmenu-item" id="' + da.id + '" draggable="' + info.draggable + '" data-type="' + da.type + '" data-title="' + da.label + '" data-selected="' + da.selected + '">';
        }

        txt += '  <span class="miconmenu-item-name">';
        txt += '    <span class="miconmenu-item-img"><img src="' + info.srcpath + (da.icon || "default.png") + '"></span>';
      }

      txt += '    <span class="miconmenu-item-title">' + da.label + '</span>';

      if (da.tooltip) {
        txt += '      <span class="miconmenu-item-info">';
        txt += da.tooltip ? "<a class=\"miconmenu-tooltip\" data-toggle=\"tooltip\" data-template=\"".concat(tooltip_template.replace(/"/g, '&quot;'), "\" data-container=\"body\" data-placement=\"bottom\" data-html=\"true\" title=\"").concat(da.tooltip.replace(/"/g, '&quot;'), "\"><i class=\"fas fa-info-circle\"></i></a>") : '';
        txt += '      </span>';
      }

      if (da.rtooltip) {
        txt += '      <span class="miconmenu-item-info miconmenu-pull-right">';
        txt += da.rtooltip ? "<a class=\"miconmenu-tooltip\" data-toggle=\"tooltip\" data-template=\"".concat(tooltip_template.replace(/"/g, '&quot;'), "\" data-container=\"body\" data-placement=\"bottom\" data-html=\"true\" title=\"").concat(da.rtooltip.replace(/"/g, '&quot;'), "\"><i class=\"fas fa-info-circle\"></i></a>") : '';
        txt += '      </span>';
      }

      if (da.menu) {
        var menuList = [];
        da.menu.forEach(function (element) {
          menuList.push("data-".concat(element.type, "=\"").concat(element.active, "\""));
        });
        txt += '    <span class="miconmenu-item-btn ' + this.uiid + '-list-btn" id="' + da.id + '-btn" data-item="' + da.id + '" data-title="' + da.label + '" ' + menuList.join(' ') + '>';
        txt += '      <i class="fa fa-ellipsis-v"></i>';
        txt += '    </span>';
      }

      txt += '  </span>';

      if (da.subitems) {
        txt += '  <ul class="miconmenu-content">';

        for (var w = 0, ln = da.subitems.length; w < ln; w++) {
          var subitems = this.menuItemTxt(da.subitems[w], {
            draggable: info.draggable,
            dragstart: info.dragstart,
            srcpath: info.srcpath
          });
          txt += subitems;
        }

        txt += '  </ul>';
      }

      txt += '</li>';
      return txt;
    },
    populate: function populate(txt) {
      this.$element.html(txt); // update if title text overflow

      var btns_width = $__default["default"]('#' + this.uiid).find('.miconmenu-header .miconmenu-btn').width();
      var headerElement = $__default["default"]('#' + this.uiid).find('.miconmenu-header');
      var titleElement = $__default["default"]('#' + this.uiid).find('.miconmenu-title').find('span');
      var width = headerElement.width() - btns_width;

      if (btns_width > 0) {
        $__default["default"]('#' + this.uiid).find('.miconmenu-header .miconmenu-title').css('max-width', width);

        if (titleElement[0].offsetWidth > width && !titleElement.attr('title')) {
          titleElement.attr('title', titleElement.text().trim());
        }
      }

      var da = this.options;

      if (!(da.item instanceof Array) || da.item.length < 1) {
        da.item = [];
      }

      for (var i = 0, len = da.item.length; i < len; i++) {
        this.generateContextMenu(da.item[i], da.activeType);
      }

      $__default["default"]('#' + this.uiid + ' .miconmenu-item').each(function (e) {
        var id = $__default["default"](this).attr('id');
        var img_width = $__default["default"](this).find('.miconmenu-item-img').width() || 0;
        var tooltip_width = $__default["default"](this).find('.miconmenu-item-info').width() || 0;
        var btn_width = $__default["default"](this).find('.miconmenu-item-btn').width() || 0;
        var width = $__default["default"](this).width() - (img_width + tooltip_width + btn_width + 4);
        var elTitle = $__default["default"](this).find('.miconmenu-item-title');

        if (elTitle) {
          if (elTitle.prop('scrollWidth') > elTitle.prop('offsetWidth')) {
            elTitle.attr('title', elTitle.html());
          }

          elTitle.css('max-width', width);
        }

        if ($__default["default"](this).attr('data-selected') === 'true') {
          $__default["default"]('[id="' + id + '"]').addClass('active');
        }

        $__default["default"]('[data-toggle="tooltip"]').tooltip();
      });
      $__default["default"]('#' + this.uiid + ' .miconmenu-item-group').each(function (e) {
        var img_width = $__default["default"](this).find('.miconmenu-item-img').width() || 0;
        var tooltip_width = $__default["default"](this).find('.miconmenu-item-info').width() || 0;
        var btn_width = $__default["default"](this).find('.miconmenu-item-btn').width() || 0;
        var width = $__default["default"](this).width() - (img_width + tooltip_width + btn_width + 4);
        var elTitle = $__default["default"](this).find('.miconmenu-item-title');

        if (elTitle) {
          if (elTitle.prop('scrollWidth') > elTitle.prop('offsetWidth')) {
            elTitle.attr('title', elTitle.html());
          }

          elTitle.css('max-width', width);
        }
      });
    },
    generateContextMenu: function generateContextMenu(da, activeType) {
      if (da.type === 'item') {
        if (da.menu && da.menu instanceof Array && da.menu.length > 0) {
          var items = this.groupContextMenuData(da.menu, activeType);
          this.buildContextMenu(da.id, items, activeType);
        }
      } else if (da.type === 'branch') {
        if (da.menu && da.menu instanceof Array && da.menu.length > 0) {
          var _items = this.groupContextMenuData(da.menu, activeType);

          this.buildContextMenu(da.id, _items, activeType);
        }

        if (da.subitems && da.subitems instanceof Array && da.subitems.length > 0) {
          for (var i = 0, len = da.subitems.length; i < len; i++) {
            this.generateContextMenu(da.subitems[i], activeType);
          }
        }
      }
    },
    groupContextMenuData: function groupContextMenuData(da, activeType) {
      var items = {};

      for (var i = 0, len = da.length; i < len; i++) {
        if (items[da[i].mid] == undefined) {
          if (activeType === 'visible') {
            items[da[i].mid] = {
              name: "<span class=\"context-menu-icon context-menu-".concat(da[i].type, "-icon\"></span>").concat(da[i].label),
              isHtmlName: true,
              visible: da[i].active
            };
          } else if (activeType === 'disabled') {
            items[da[i].mid] = {
              name: "<span class=\"context-menu-icon context-menu-".concat(da[i].type, "-icon\"></span>").concat(da[i].label),
              isHtmlName: true,
              disabled: da[i].active ? false : true
            };
          }
        }

        if (da[i].menu && da[i].menu instanceof Array && da[i].menu.length > 0) {
          if (items[da[i].mid]['items'] == undefined) {
            items[da[i].mid]['items'] = {};
            var subitems = this.groupContextMenuData(da[i].menu, activeType);
            items[da[i].mid]['items'] = subitems;
          }
        }
      }

      return items;
    },
    updateContextMenu: function updateContextMenu(mid, active) {
      for (var i = 0, len = this.options.item.length; i < len; i++) {
        // this.activeContextMenu(this.options.item[i].menu, mid, active);
        this.activeContextMenu(this.options.item[i], mid, active);
      }
    },
    activeContextMenu: function activeContextMenu(item, mid, active) {
      if (!item) {
        return;
      }

      if (item.menu) {
        for (var i = 0, len = item.menu.length; i < len; i++) {
          if (item.menu[i].mid == mid) {
            item.menu[i].active = active;
          }

          if (item.menu[i].menu) {
            this.activeContextSubMenu(menu[i].menu, mid, active);
          }
        }
      }

      if (item.subitems) {
        for (var _i2 = 0, _len2 = item.subitems.length; _i2 < _len2; _i2++) {
          this.activeContextMenu(item.subitems[_i2], mid, active);
        }
      }
    },
    activeContextSubMenu: function activeContextSubMenu(menu, mid, active) {
      if (!menu) {
        return;
      }

      for (var i = 0, len = menu.length; i < len; i++) {
        if (menu[i].mid == mid) {
          menu[i].active = active;
        }

        if (menu[i].menu) {
          this.activeContextSubMenu(menu[i].menu, mid, active);
        }
      }
    },
    getItem: function getItem(itemid, item) {
      if (!item) {
        return null;
      }

      if (item.id == itemid) {
        return item;
      }

      if (item.type == 'branch' && item.subitems && item.subitems instanceof Array) {
        for (var i = 0, len = item.subitems.length; i < len; i++) {
          var it = this.getItem(itemid, item.subitems[i]);

          if (it != null) {
            return it;
          }
        }
      }

      return null;
    },
    menubuild: function menubuild($trigger) {
      var itemid = $trigger.attr('data-item');
      var items = {};
      var clickitem = null;

      for (var i = 0, len = this.options.item.length; i < len; i++) {
        clickitem = this.getItem(itemid, this.options.item[i]);

        if (clickitem) {
          break;
        }
      }

      if (!clickitem) {
        return {
          items: {}
        };
      }

      if (clickitem.type === 'item') {
        if (clickitem.menu && clickitem.menu instanceof Array && clickitem.menu.length > 0) {
          items = this.groupContextMenuData(clickitem.menu, this.options.activeType);
          this.buildContextMenu(clickitem.id, items, this.options.activeType);
        }
      } else if (clickitem.type === 'branch') {
        if (clickitem.menu && clickitem.menu instanceof Array && clickitem.menu.length > 0) {
          items = this.groupContextMenuData(clickitem.menu, this.options.activeType);
          this.buildContextMenu(clickitem.id, items, this.options.activeType);
        }

        if (clickitem.subitems && clickitem.subitems instanceof Array && clickitem.subitems.length > 0) {
          for (var _i3 = 0, _len3 = clickitem.subitems.length; _i3 < _len3; _i3++) {
            this.generateContextMenu(clickitem.subitems[_i3], this.options.activeType);
          }
        }
      }

      return {
        items: items
      };
    },
    buildContextMenu: function buildContextMenu(id, items, activeType) {
      var config = {
        selector: "[id=\"".concat(id, "-btn\"]"),
        build: this.menubuild.bind(this),

        /*/
        build: function ($trigger) {
          // get contextMenu item data-* value
          let dataAttrs = Object.keys($trigger[0].dataset);
          let pass = ['item', 'title'];
          for (let i = 0, len = dataAttrs.length; i < len; i++) {
            if (pass.includes(dataAttrs[i])) {
              continue;
            }
            if (items[dataAttrs[i]]) {
              if (activeType === 'visible') {
                items[dataAttrs[i]].visible = $trigger[0].attributes[`data-${dataAttrs[i]}`].value === 'true' ? true : false;
              } else if (activeType === 'disabled') {
                items[dataAttrs[i]].disabled = $trigger[0].attributes[`data-${dataAttrs[i]}`].value === 'true' ? false : true;
              }
            }
          }
           return { items: items }
        },
        //*/
        trigger: 'left',
        hideOnSecondTrigger: true,
        callback: this.selectContextItem.bind(this),
        zIndex: 10
      };

      if ($__default["default"].contextMenu) {
        $__default["default"].contextMenu(config);
      }
    },
    collapseMenu: function collapseMenu() {
      var header = this.$element.find('div.miconmenu-header > .miconmenu-title > .miconmenu-icon');
      header.removeClass('fa-chevron-down').addClass('fa-chevron-right');
      header.parents('.miconmenu-header').next('.miconmenu-body').addClass('miconmenu-hidden');
      header.parents('.miconmenu-container').addClass('miconmenu-collapse');
    },
    expandeMenu: function expandeMenu() {
      var header = this.$element.find('div.miconmenu-header > .miconmenu-title > .miconmenu-icon');
      header.removeClass('fa-chevron-right').addClass('fa-chevron-down');
      header.parents('.miconmenu-header').next('.miconmenu-body').removeClass('miconmenu-hidden');
      header.parents('.miconmenu-container').removeClass('miconmenu-collapse');
    },
    isMenuCollapse: function menuCollapse() {
      var header = this.$element.find('div.miconmenu-header > .miconmenu-title > .miconmenu-icon');

      if (header.hasClass('fa-chevron-down')) {
        return false;
      }

      return true;
    },
    toggleIconMenu: function toggleIconMenu(el) {
      if ($__default["default"](el).hasClass('fa-chevron-down')) {
        $__default["default"](el).removeClass('fa-chevron-down').addClass('fa-chevron-right');
        $__default["default"](el).parents('.miconmenu-header').next('.miconmenu-body').addClass('miconmenu-hidden');
        $__default["default"](el).parents('.miconmenu-container').addClass('miconmenu-collapse');
      } else if ($__default["default"](el).hasClass('fa-chevron-right')) {
        $__default["default"](el).removeClass('fa-chevron-right').addClass('fa-chevron-down');
        $__default["default"](el).parents('.miconmenu-header').next('.miconmenu-body').removeClass('miconmenu-hidden');
        $__default["default"](el).parents('.miconmenu-container').removeClass('miconmenu-collapse');
      }
    },
    toggleItemGroup: function toggleItemGroup(el) {
      if ($__default["default"](el).find('.miconmenu-item-icon').hasClass('fa-chevron-down')) {
        $__default["default"](el).find('.miconmenu-item-icon').removeClass('fa-chevron-down').addClass('fa-chevron-right');
        $__default["default"](el).next('.miconmenu-content').addClass('miconmenu-hidden');
      } else if ($__default["default"](el).find('.miconmenu-item-icon').hasClass('fa-chevron-right')) {
        $__default["default"](el).find('.miconmenu-item-icon').removeClass('fa-chevron-right').addClass('fa-chevron-down');
        $__default["default"](el).next('.miconmenu-content').removeClass('miconmenu-hidden');
      }
    },
    selectIconMenu: function selectIconMenu(el) {
      var id = $__default["default"](el).attr('id');
      var type = $__default["default"](el).attr('data-type');
      var title = $__default["default"](el).attr('data-menu');

      if (type === 'filter') {
        if ($__default["default"]('#' + id + '-input').parent().css('display') === 'none') {
          $__default["default"]('#' + id + '-input').parent().css('display', '');
          $__default["default"]('#' + id + '-input').trigger('focus');
        } else {
          $__default["default"]('#' + id + '-input').parent().css('display', 'none');
          $__default["default"]('#' + id + '-input').val('').trigger('input');
        }
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('selectmenu', Object.assign({
          id: id,
          type: type,
          title: title
        }, type === 'sort' ? {
          orderBy: $__default["default"](el).attr('data-orderby')
        } : ''));
      } else {
        if (this.$element[0].fireEvent) {
          this.$element[0].fireEvent('selectmenu');
        } else {
          var evObj = new CustomEvent('selectmenu', {
            detail: Object.assign({
              id: id,
              type: type,
              title: title
            }, type === 'sort' ? {
              orderBy: $__default["default"](el).attr('data-orderby')
            } : '')
          });
          this.$element[0].dispatchEvent(evObj);
        }
      }
    },
    selectItem: function selectItem(el) {
      var selectable = $__default["default"]('#' + this.uiid).children().attr('data-select') === 'true' ? true : false;
      var id = '';
      var title = '';

      if ($__default["default"](el.target).hasClass('fa') || $__default["default"](el.target).hasClass('miconmenu-item-btn')) {
        return;
      }

      if (selectable && $__default["default"](el.currentTarget).hasClass('miconmenu-item')) {
        $__default["default"]('.' + this.uiid + '-miconmenu-item.active').removeClass('active');
        $__default["default"](el.currentTarget).addClass('active');
        id = $__default["default"](el.currentTarget).attr('id');
        title = $__default["default"](el.currentTarget).attr('data-title');

        if (this.options.onAction && typeof this.options.onAction === 'function') {
          this.options.onAction('selectitem', {
            id: id,
            type: 'select',
            title: title
          });
        } else {
          if (this.$element[0].fireEvent) {
            this.$element[0].fireEvent('selectitem');
          } else {
            var evObj = new CustomEvent('selectitem', {
              detail: {
                id: id,
                type: 'select',
                title: title
              }
            });
            this.$element[0].dispatchEvent(evObj);
          }
        }
      }
    },
    toggleTitleItemGroup: function toggleTitleItemGroup(el) {
      if ($__default["default"](el).hasClass('fa-chevron-down')) {
        $__default["default"](el).attr('data-expand', 'true');
      } else if ($__default["default"](el).hasClass('fa-chevron-right')) {
        $__default["default"](el).attr('data-expand', 'false');
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('collapseTitleGroupItem', {
          expand: $__default["default"](el).attr('data-expand') === 'true' ? true : false
        });
      }
    },
    selectContextItem: function selectContextItem(key, options) {
      var id = $__default["default"](options.$trigger).attr('data-item');
      var title = $__default["default"](options.$trigger).attr('data-title');

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('selectcontext', {
          id: id,
          type: key,
          title: title
        });
      } else {
        if (this.$element[0].fireEvent) {
          this.$element[0].fireEvent('selectcontext');
        } else {
          var evObj = new CustomEvent('selectcontext', {
            detail: {
              id: id,
              type: key,
              title: title
            }
          });
          this.$element[0].dispatchEvent(evObj);
        }
      }
    },
    filterItem: function filterItem(el) {
      var id = el.target.id;
      var filter_value = $__default["default"]("#".concat(id)).val();
      var menu_id = $__default["default"]("#".concat(id)).attr('data-menu');
      var title = $__default["default"]("#".concat(id)).attr('data-filter_title') === 'true' ? true : false;
      $__default["default"](el.target).siblings('.miconmenu-filter-clear-btn').toggle(filter_value ? true : false);
      $__default["default"]("#".concat(menu_id, " .miconmenu-item")).each(function (e) {
        var item_value = $__default["default"](this).find('.miconmenu-item-title').html() || '';

        if (title) {
          $__default["default"](this).parents('.miconmenu-item-group').css('display', '');
        } else {
          $__default["default"](this).parents().find('.miconmenu-item-group > .miconmenu-item-name').css('display', 'none');
          $__default["default"]('.miconmenu-content').css('margin-left', '0');
        }

        if (item_value.toLowerCase().indexOf(filter_value.toLowerCase()) >= 0) {
          $__default["default"](this).css('display', '');
        } else {
          $__default["default"](this).css('display', 'none');
        }
      });

      if (title) {
        if (!filter_value) {
          $__default["default"](el.target).trigger('focus');
          $__default["default"]("#".concat(menu_id, " .miconmenu-item-group")).each(function (e) {
            $__default["default"](this).css('display', '');
          });
        } else {
          $__default["default"]("#".concat(menu_id, " .miconmenu-item-group")).each(function (e) {
            var elements = $__default["default"](this).find('.miconmenu-item').length;

            if ($__default["default"](this).find('.miconmenu-item:hidden').length === elements) {
              $__default["default"](this).css('display', 'none');
            } else {
              $__default["default"](this).css('display', '');
            }
          });
        }
      } else {
        if (!filter_value) {
          $__default["default"](el.target).trigger('focus');
          $__default["default"](el.target).parent().siblings('ul').find('.miconmenu-item-group .miconmenu-item-name').css('display', '');
          $__default["default"]('.miconmenu-content').css('margin-left', '');
        }
      }
    }
  };

  var mTextInput = function mTextInput(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.default = {
      item: [{
        left_value: '',
        right_value: ''
      }],
      item_min: 1,
      item_max: 3,
      title: {
        left: '',
        right: ''
      },
      columnClass: {
        left: '',
        right: '',
        btn: ''
      },
      expand: {
        active: false,
        icon: ''
      }
    };
    this.options = Object.assign({}, this.default, options);
    this.clearmode = true;

    if (options.clearmode !== undefined && typeof options.clearmode === 'boolean') {
      this.clearmode = options.clearmode;
    }

    this.$element.on('click', '.mtextinput-btn.addbtn', $__default["default"].proxy(function (ev) {
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.mtextinput-btn.delbtn', $__default["default"].proxy(function (ev) {
      this.deleteItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.mtextinput-btn.expandbtn', $__default["default"].proxy(function (ev) {
      this.expandItem(ev.currentTarget);
    }, this));
    this.populate();
  };

  mTextInput.prototype = {
    clear: function clear() {
      this.options = this.default;
      this.populate();
    },
    destroy: function destroy() {
      this.$element.find('table.mtextinput').off();
      this.$element.find('table.mtextinput').remove();
      this.$element.data('daai.textinputtable');
      this.$element.removeData('daai.textinputtable');
      this.$element.data('daai.textinputtable');
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({}, this.default, options);
      this.populate();
    },
    reset: function reset() {
      this.options.item = [{
        left_value: '',
        right_value: ''
      }];
      this.populate();
    },
    populate: function populate() {
      var html = this.render();
      this.$element.html(html); // update buttons width

      $__default["default"]('#' + this.uiid).find('.mtextinput-btns').each(function () {
        $__default["default"](this).css('width', $__default["default"](this).find('.mtextinput-btn').length * 20 + 12);
      });

      if (!this.clearmode) {
        this.itemBannedAction();
      }
    },
    render: function render() {
      var da = this.options;
      var html = '';
      html += '<table class="mtextinput" id="' + this.uiid + '">';

      if (da.title) {
        html += '  <thead class="mtextinput-header">';
        html += '    <tr>';
        html += '      <td class="mtextinput-title mtextinput-title-left" id="' + this.uiid + '-title-left">' + da.title.left + '</td>';
        html += '      <td class="mtextinput-title mtextinput-title-right" id="' + this.uiid + '-title-right">' + da.title.right + '</td>';
        html += '      <td class="mtextinput-title mtextinput-title-btn" id="' + this.uiid + '-title-btn"></td>';
        html += '    </tr>';
        html += '  </thead>';
      }

      html += '  <tbody class="mtextinput-body">';

      for (var i = 0, len = da.item.length > da.item_max ? da.item_max : da.item.length; i < len; i++) {
        html += '<tr class="mtextinput-item ' + this.uiid + '-item" data-item="' + i + '">';
        html += '  <td class="mtextinput-td' + (da.columnClass.left ? ' ' + da.columnClass.left : '') + '">';
        html += '    <input class="mtextinput-input ' + this.uiid + '-input-left" type="text" data-item="' + i + '"';
        html += '      id="' + this.uiid + '-input-left-' + i + '" value="' + da.item[i].left_value.replace(/"/g, '&quot;') + '">';
        html += '  </td>';
        html += '  <td class="mtextinput-td' + (da.columnClass.right ? ' ' + da.columnClass.right : '') + '">';
        html += '    <input class="mtextinput-input ' + this.uiid + '-input-right" type="text" data-item="' + i + '"';
        html += '      id="' + this.uiid + '-input-right-' + i + '" value="' + da.item[i].right_value.replace(/"/g, '&quot;') + '">';
        html += '  </td>';
        html += '  <td class="mtextinput-td mtextinput-btns' + (da.columnClass.btn ? ' ' + da.columnClass.btn : '') + '">';

        if (da.expand.active) {
          html += '    <span class="mtextinput-btn expandbtn" data-item="' + i + '"><i class="fas ' + da.expand.icon + '"></i></span>';
        }

        html += '    <span class="mtextinput-btn addbtn" data-item="' + i + '"><i class="fas fa-plus"></i></span>';
        html += '    <span class="mtextinput-btn delbtn" data-item="' + i + '"><i class="fas fa-minus"></i></span>';
        html += '  </td>';
        html += '</tr>';
      }

      html += '  </tbody>';
      html += '</table>';
      return html;
    },
    addItem: function addItem(el) {
      var item = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();

      if ($__default["default"](el).hasClass('addbtn')) {
        if (items.length < this.options.item_max) {
          items.splice(item + 1, 0, {
            left_value: '',
            right_value: ''
          });
        }
      }

      this.options.item = items;
      this.populate();
    },
    deleteItem: function deleteItem(el) {
      var item = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();

      if ($__default["default"](el).hasClass('delbtn')) {
        if (items.length > this.options.item_min) {
          items.splice(item, 1);
        } else if (items.length == 1) {
          // clear value
          items = [{
            left_value: '',
            right_value: ''
          }];
        }
      }

      this.options.item = items;
      this.populate();
    },
    getCurrentItems: function getCurrentItems() {
      var items = [];
      $__default["default"]('.' + this.uiid + '-item').each(function (e) {
        items.push({
          left_value: '',
          right_value: ''
        });
      });
      items.sort(function (a, b) {
        return a.item > b.item ? 1 : -1;
      });
      $__default["default"]('.' + this.uiid + '-input-left').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        items[item].left_value = $__default["default"](this).val().replace(/"/g, '&quot;');
      });
      $__default["default"]('.' + this.uiid + '-input-right').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        items[item].right_value = $__default["default"](this).val().replace(/"/g, '&quot;');
      });
      return items;
    },
    getItems: function getItems() {
      var da = this.getCurrentItems();
      var items = [];

      for (var i = 0, len = da.length; i < len; i++) {
        if (da[i].left_value == '' && da[i].right_value == '') {
          continue;
        }

        items.push({
          left_value: da[i].left_value.replace(/&quot;/g, '"'),
          right_value: da[i].right_value.replace(/&quot;/g, '"')
        });
      }

      return items;
    },
    getAllItems: function getAllItems() {
      var da = this.getCurrentItems();
      var items = [];

      for (var i = 0, len = da.length; i < len; i++) {
        items.push({
          left_value: da[i].left_value.replace(/&quot;/g, '"'),
          right_value: da[i].right_value.replace(/&quot;/g, '"')
        });
      }

      return items;
    },
    getItem: function getItem(index) {
      var da = this.getCurrentItems();

      if (da.length > 0 && index >= 0 && index < da.length) {
        return {
          left_value: da[index].left_value.replace(/&quot;/g, '"'),
          right_value: da[index].right_value.replace(/&quot;/g, '"')
        };
      }

      return {
        left_value: '',
        right_value: ''
      };
    },
    itemBannedAction: function itemBannedAction() {
      if (!this.options.item || !(this.options.item instanceof Array)) {
        this.options.item = [];
      }

      if (this.options.item.length <= this.options.item_min) {
        $__default["default"]('#' + this.uiid).find('.mtextinput-btn.delbtn').addClass('banned-action');
      } else if (this.options.item.length >= this.options.item_max) {
        $__default["default"]('#' + this.uiid).find('.mtextinput-btn.addbtn').addClass('banned-action');
      }
    },
    expandItem: function expandItem(el) {
      var index = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();
      var item = {
        left_value: '',
        right_value: ''
      };
      var elements = document.getElementsByClassName(this.uiid + '-item');

      for (var i = 0, len = elements.length; i < len; i++) {
        if (index == $__default["default"](elements[i]).attr('data-item')) {
          item.left_value = $__default["default"](elements[i]).find('.' + this.uiid + '-input-left').val();
          item.right_value = $__default["default"](elements[i]).find('.' + this.uiid + '-input-right').val();
          break;
        }
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction(this.uiid, 'expand', index, item, items);
      }
    }
  };

  var mTextarea = function mTextarea(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.default = {
      item: [{
        left_value: '',
        right_value: ''
      }],
      item_min: 1,
      item_max: 3,
      title: {
        left: '',
        right: ''
      },
      columnClass: {
        left: '',
        right: '',
        btn: ''
      },
      rows: {
        left: 2,
        right: 2
      },
      placeholder: {
        left: '',
        right: ''
      },
      spellcheck: false,
      clearmode: true,
      resize: true,
      saveInputHeight: false,
      expand: {
        active: false,
        icon: ''
      },
      buttonAlign: 'center'
    };
    this.options = Object.assign({}, this.default, options);
    this.clearmode = true;

    if (options.clearmode !== undefined && typeof options.clearmode === 'boolean') {
      this.clearmode = options.clearmode;
    }

    this.$element.on('click', '.mtextarea-btn.addbtn', $__default["default"].proxy(function (ev) {
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.mtextarea-btn.delbtn', $__default["default"].proxy(function (ev) {
      this.deleteItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.mtextarea-btn.expandbtn', $__default["default"].proxy(function (ev) {
      this.expandItem(ev.currentTarget);
    }, this));
    this.populate();
  };

  mTextarea.prototype = {
    clear: function clear() {
      this.options = this.default;
      this.populate();
    },
    destroy: function destroy() {
      this.$element.find('table.mtextarea').off();
      this.$element.find('table.mtextarea').remove();
      this.$element.data('daai.textareatable');
      this.$element.removeData('daai.textareatable');
      this.$element.data('daai.textareatable');
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({}, this.default, options);
      this.populate();
    },
    reset: function reset() {
      this.options.item = [{
        left_value: '',
        right_value: ''
      }];
      this.populate();
    },
    populate: function populate() {
      var html = this.render();
      this.$element.html(html);
      $__default["default"]('.mtextarea-input').each(function () {
        var prev_height = $__default["default"](this).attr('data-prev-height');
        $__default["default"](this).css('min-height', $__default["default"](this).outerHeight());

        if (prev_height) {
          $__default["default"](this).css('height', prev_height);
        }
      }); // update buttons width

      $__default["default"]('#' + this.uiid).find('.mtextarea-btns').each(function () {
        $__default["default"](this).css('width', $__default["default"](this).find('.mtextarea-btn').length * 20 + 12);
      });

      if (!this.clearmode) {
        this.itemBannedAction();
      }
    },
    render: function render() {
      var da = this.options;
      var html = '';
      html += "<table class=\"mtextarea\" id=\"".concat(this.uiid, "\">");

      if (da.title) {
        html += "\n      <thead class=\"mtextarea-header\">\n        <tr>\n          <td class=\"mtextarea-title mtextarea-title-left\" id=\"".concat(this.uiid, "-title-left\">").concat(da.title.left, "</td>\n          <td class=\"mtextarea-title mtextarea-title-right\" id=\"").concat(this.uiid, "-title-right\">").concat(da.title.right, "</td>\n          <td class=\"mtextarea-title mtextarea-title-btn\" id=\"").concat(this.uiid, "-title-btn\"></td>\n        </tr>\n      </thead>");
      }

      html += '<tbody class="mtextarea-body">';

      for (var i = 0, len = da.item.length > da.item_max ? da.item_max : da.item.length; i < len; i++) {
        var left_prev_height = da.saveInputHeight && da.item[i].left_height ? da.item[i].left_height : '';
        var right_prev_height = da.saveInputHeight && da.item[i].right_height ? da.item[i].right_height : '';
        html += "\n      <tr class=\"mtextarea-item ".concat(this.uiid, "-item\" data-item=\"").concat(i, "\">\n        <td class=\"mtextarea-td ").concat(da.columnClass.left, "\">\n          <textarea class=\"mtextarea-input ").concat(this.uiid, "-input-left ").concat(!da.resize ? 'noresize' : '', "\"\n            id=\"").concat(this.uiid, "-input-left-").concat(i, "\" data-item=\"").concat(i, "\" rows=\"").concat(da.rows.left, "\"\n              placeholder=\"").concat(da.placeholder.left, "\" spellcheck=\"").concat(da.spellcheck, "\"\n            data-prev-height=\"").concat(left_prev_height, "\">").concat(da.item[i].left_value.replace(/"/g, '&quot;'), "</textarea>\n        </td>\n        <td class=\"mtextarea-td ").concat(da.columnClass.right, "\">\n          <textarea class=\"mtextarea-input ").concat(this.uiid, "-input-right ").concat(!da.resize ? 'noresize' : '', "\"\n            id=\"").concat(this.uiid, "-input-right-").concat(i, "\" data-item=\"").concat(i, "\" rows=\"").concat(da.rows.right, "\"\n            placeholder=\"").concat(da.placeholder.right, "\" spellcheck=\"").concat(da.spellcheck, "\"\n            data-prev-height=\"").concat(right_prev_height, "\">").concat(da.item[i].right_value.replace(/"/g, '&quot;'), "</textarea>\n        </td>\n        <td class=\"mtextarea-td mtextarea-btns ").concat(da.columnClass.btn, "\" style=\"align-items: ").concat(da.buttonAlign, ";\">\n          ").concat(da.expand.active ? "<span class=\"mtextarea-btn expandbtn\" data-item=\"".concat(i, "\"><i class=\"fas ").concat(da.expand.icon, "\"></i></span>") : '', "\n          <span class=\"mtextarea-btn addbtn\" data-item=\"").concat(i, "\"><i class=\"fas fa-plus\"></i></span>\n          <span class=\"mtextarea-btn delbtn\" data-item=\"").concat(i, "\"><i class=\"fas fa-minus\"></i></span>\n          <span></span>\n        </td>\n      </tr>");
      }

      html += "</tbody>\n    </table>";
      return html;
    },
    addItem: function addItem(el) {
      var item = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();

      if ($__default["default"](el).hasClass('addbtn')) {
        if (items.length < this.options.item_max) {
          items.splice(item + 1, 0, {
            left_value: '',
            right_value: '',
            left_height: '',
            right_height: ''
          });
        }
      }

      this.options.item = items;
      this.populate();
    },
    deleteItem: function deleteItem(el) {
      var item = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();

      if ($__default["default"](el).hasClass('delbtn')) {
        if (items.length > this.options.item_min) {
          items.splice(item, 1);
        } else if (items.length == 1) {
          // clear value
          items = [{
            left_value: '',
            right_value: '',
            left_height: '',
            right_height: ''
          }];
        }
      }

      this.options.item = items;
      this.populate();
    },
    getCurrentItems: function getCurrentItems() {
      var items = [];
      $__default["default"]('.' + this.uiid + '-item').each(function (e) {
        items.push({
          left_value: '',
          right_value: '',
          left_height: '',
          right_height: ''
        });
      });
      $__default["default"]('.' + this.uiid + '-input-left').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        items[item].left_value = $__default["default"](this).val().replace(/"/g, '&quot;');
        items[item].left_height = $__default["default"](this).outerHeight();
      });
      $__default["default"]('.' + this.uiid + '-input-right').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        items[item].right_value = $__default["default"](this).val().replace(/"/g, '&quot;');
        items[item].right_height = $__default["default"](this).outerHeight();
      });
      return items;
    },
    getItems: function getItems() {
      var da = this.getCurrentItems();
      var items = [];

      for (var i = 0, len = da.length; i < len; i++) {
        if (da[i].left_value == '' && da[i].right_value == '') {
          continue;
        }

        items.push({
          left_value: da[i].left_value.replace(/&quot;/g, '"'),
          right_value: da[i].right_value.replace(/&quot;/g, '"')
        });
      }

      return items;
    },
    getAllItems: function getAllItems() {
      var da = this.getCurrentItems();
      var items = [];

      for (var i = 0, len = da.length; i < len; i++) {
        items.push({
          left_value: da[i].left_value.replace(/&quot;/g, '"'),
          right_value: da[i].right_value.replace(/&quot;/g, '"')
        });
      }

      return items;
    },
    getItem: function getItem(index) {
      var da = this.getCurrentItems();

      if (da.length > 0 && index >= 0 && index < da.length) {
        return {
          left_value: da[index].left_value.replace(/&quot;/g, '"'),
          right_value: da[index].right_value.replace(/&quot;/g, '"')
        };
      }

      return {
        left_value: '',
        right_value: ''
      };
    },
    itemBannedAction: function itemBannedAction() {
      if (!this.options.item || !(this.options.item instanceof Array)) {
        this.options.item = [];
      }

      if (this.options.item.length <= this.options.item_min) {
        $__default["default"]('#' + this.uiid).find('.mtextarea-btn.delbtn').addClass('banned-action');
      } else if (this.options.item.length >= this.options.item_max) {
        $__default["default"]('#' + this.uiid).find('.mtextarea-btn.addbtn').addClass('banned-action');
      }
    },
    expandItem: function expandItem(el) {
      var index = parseInt($__default["default"](el).attr('data-item'));
      var data = this.getCurrentItems();
      var item = {
        left_value: '',
        right_value: ''
      };
      var items = [];
      var elements = document.getElementsByClassName(this.uiid + '-item');

      for (var i = 0, len = elements.length; i < len; i++) {
        if (index == $__default["default"](elements[i]).attr('data-item')) {
          item.left_value = $__default["default"](elements[i]).find('.' + this.uiid + '-input-left').val();
          item.right_value = $__default["default"](elements[i]).find('.' + this.uiid + '-input-right').val();
          break;
        }
      } // regroup items data


      for (var _i = 0, _len = data.length; _i < _len; _i++) {
        items.push({
          left_value: data[_i].left_value,
          right_value: data[_i].right_value
        });
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction(this.uiid, 'expand', index, item, items);
      }
    }
  };

  var mExplorerMenu = function mExplorerMenu(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.default = {
      label: '',
      collapse: null,
      select: false,
      draggable: true,
      dragstart: 'dragStart',
      tool: [],
      activeType: '',
      item: [],
      srcpath: ''
    };
    this.options = JSON.parse(JSON.stringify(options));
    this.options = Object.assign({}, this.default, this.options, options.onAction ? {
      'onAction': options.onAction
    } : '');

    if (!$__default["default"].ui || !$__default["default"].ui.position) {
      var uipos = new mPosition();
      uipos.createPosition($__default["default"]);
    }

    if (!$__default["default"].contextMenu) {
      var contextm = new mContextMenu();
      contextm.createContextMenu($__default["default"]);
    } // mexplorermenu-header: toggle mexplorermenu-body
    // this.$element.on('click', '.mexplorermenu-title > .mexplorermenu-icon', $.proxy(function (ev) {
    //   this.toggleIconMenu(ev.currentTarget);
    // }, this));
    // mexplorermenu-header: insert, config, reload btns


    this.$element.on('click', '.mexplorermenu-btn > .mexplorermenu-icon, .mexplorermenu-btn > .mexplorermenu-img', $__default["default"].proxy(function (ev) {
      this.selectIconMenu(ev.currentTarget);
    }, this)); // item-group: collapse content items

    this.$element.on('click', '.mexplorermenu-item-group > .mexplorermenu-item-name', $__default["default"].proxy(function (ev) {
      if ($__default["default"](ev.target).hasClass('fa-ellipsis-v') || $__default["default"](ev.target).hasClass('mexplorermenu-item-btn')) {
        return;
      }

      this.toggleItemGroup(ev.currentTarget);
    }, this)); // item: select item

    this.$element.on('click', '.mexplorermenu-item', $__default["default"].proxy(function (ev) {
      if ($__default["default"](ev.currentTarget).hasClass('mexplorermenu-item-group')) {
        return;
      }

      this.selectItem(ev);
    }, this));
    this.$element.on('input', '.mexplorermenu-filter-input', $__default["default"].proxy(function (ev) {
      this.filterItem(ev);
    }, this));
    this.$element.on('click', '.mexplorermenu-filter-clear-btn', $__default["default"].proxy(function (ev) {
      $__default["default"](ev.target).siblings('.mexplorermenu-filter-input').val('').trigger('input');
    }, this));
    this.render();
  };

  mExplorerMenu.prototype = {
    clear: function clear() {
      // if (collapse == null) {
      //   collapse = true;
      //   const header = this.$element.find('div.mexplorermenu-header > .mexplorermenu-title > .mexplorermenu-icon');
      //   if (header.hasClass('fa-chevron-down')) {
      //     collapse = false;
      //   }
      // }
      // if (!collapse) {
      //   $(this.$element).find('.mexplorermenu-title > .mexplorermenu-icon').removeClass('fa-chevron-right').addClass('fa-chevron-down');
      //   $(this.$element).find('.mexplorermenu-body').removeClass('mexplorermenu-hidden');
      //   // $(this.$element).removeClass('mexplorermenu-collapse');
      // } else {
      //   $(this.$element).find('.mexplorermenu-title > .mexplorermenu-icon').addClass('fa-chevron-right').removeClass('fa-chevron-down');
      //   $(this.$element).find('.mexplorermenu-body').addClass('mexplorermenu-hidden');
      //   // $(this.$element).addClass('mexplorermenu-collapse');
      // }
      this.options = JSON.parse(JSON.stringify(this.default));
      this.render();
    },
    destroy: function destroy() {
      this.$element.find('div.mexplorermenu-header').off();
      this.$element.find('div.mexplorermenu-body').off();
      this.$element.find('div.mexplorermenu-header').remove();
      this.$element.find('div.mexplorermenu-body').remove();
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = JSON.parse(JSON.stringify(options));
      this.options = Object.assign({}, this.default, this.options, options.onAction ? {
        'onAction': options.onAction
      } : ''); // let collapse = false;
      // if (this.options.collapse != null) {
      //   collapse = this.options.collapse;
      // } else {
      //   const header = this.$element.find('div.mexplorermenu-header > .mexplorermenu-title > .mexplorermenu-icon');
      //   if (header.hasClass('fa-chevron-right')) {
      //     collapse = true;
      //   }
      // }

      this.render();
    },
    render: function render() {
      var da = this.options;
      var txt = ''; // if (!collapse) {
      //   txt += '<div class="mexplorermenu-header" data-select="' + da.select + '">';
      //   txt += '  <span class="mexplorermenu-title">';
      //   txt += '    <i class="mexplorermenu-icon fa fa-chevron-down"></i>';
      //   txt += '    <span>' + da.label + '</span>'
      //   txt += '  </span>';
      // } else {
      //   txt += '<div class="mexplorermenu-header" data-select="' + da.select + '">';
      //   txt += '  <span class="mexplorermenu-title">';
      //   txt += '    <i class="mexplorermenu-icon fa fa-chevron-right"></i>';
      //   txt += '    <span>' + da.label + '</span>'
      //   txt += '  </span>';
      // }

      txt += '<div class="mexplorermenu-header" data-select="' + da.select + '">';
      txt += '  <span class="mexplorermenu-title">' + da.label + '</span>';
      txt += '  <span class="mexplorermenu-btn">';
      var isFilter = {
        active: false,
        title: false,
        placeholder: ''
      };

      for (var i = 0, len = da.tool.length; i < len; i++) {
        if (da.tool[i].name === 'filter') {
          isFilter.active = da.tool[i].active;
          isFilter.title = da.tool[i].title;
          isFilter.placeholder = da.tool[i].placeholder;
        }

        if (da.tool[i].active) {
          var sortable = da.tool[i].name === 'sort' ? "data-orderby=\"".concat(da.tool[i].orderBy, "\"") : '';

          if (da.tool[i].iconType === 'img') {
            var className = da.tool[i].className ? da.tool[i].className : "mexplorermenu-".concat(da.tool[i].name, "-img");
            txt += "<span class=\"mexplorermenu-img ".concat(className, "\" id=\"").concat(this.uiid, "-").concat(da.tool[i].name, "\"\n            data-menu=\"").concat(this.uiid, "\" data-type=\"").concat(da.tool[i].name, "\" ").concat(sortable, "></span>");
          } else if (da.tool[i].iconType === 'icon') {
            txt += "<i class=\"mexplorermenu-icon ".concat(da.tool[i].icon, "\" id=\"").concat(this.uiid, "-").concat(da.tool[i].name, "\"\n            data-menu=\"").concat(this.uiid, "\" data-type=\"").concat(da.tool[i].name, "\" ").concat(sortable, "></i>");
          }
        }
      }

      txt += '  </span>';
      txt += '</div>'; // if (!collapse) {
      //   txt += '<div class="mexplorermenu-body">';
      // } else {
      //   txt += '<div class="mexplorermenu-body">';
      // }

      txt += '<div class="mexplorermenu-body">';

      if (isFilter.active) {
        txt += '<span class="mexplorermenu-filter" style="display: none;">';
        txt += '  <input type="text" class="mexplorermenu-filter-input" id="' + this.uiid + '-filter-input" data-menu="' + this.uiid + '"';
        txt += '   data-filter_title="' + isFilter.title + '"';
        txt += '   placeholder="' + (isFilter.placeholder ? isFilter.placeholder.replace(/"/g, '&quot;') : 'Search ...') + '">';
        txt += '  <i class="mexplorermenu-filter-clear-btn">&times;</i>';
        txt += '</span>';
      }

      txt += '  <ul style="margin: 0; padding: 0;">';

      for (var _i = 0, _len = da.item.length; _i < _len; _i++) {
        txt += this.menuItemTxt(da.item[_i], {
          draggable: da.draggable,
          dragstart: da.dragstart,
          srcpath: da.srcpath
        });
      }
      txt += '  </ul>';
      txt += '</div>';
      this.populate(txt);
    },
    menuItemTxt: function menuItemTxt(da, info) {
      var tooltip_template = '<div class="tooltip tooltip-outer" role="tooltip"><div class="arrow"></div><div class="tooltip-mexplorermenu tooltip-inner"></div></div>';
      var txt = '';

      if (da.type === 'branch') {
        if (da.expandItems == null) {
          da.expandItems = true;
        }

        txt += '<li class="mexplorermenu-item-group" id="' + da.id + '" data-type="' + da.type + '" data-title="' + da.label + '">';
        txt += '  <span class="mexplorermenu-item-name" data-expand="' + da.expandItems + '">';
        txt += '    <i class="mexplorermenu-item-icon fa ' + (da.expandItems ? 'fa-chevron-down' : 'fa-chevron-right') + '"></i>';
      } else if (da.type === 'item') {
        if (info.draggable != undefined && info.draggable == true) {
          txt += '<li class="mexplorermenu-item ' + this.uiid + '-mexplorermenu-item" id="' + da.id + '" draggable="' + info.draggable + '" ondragstart="' + info.dragstart + '(event)" data-type="' + da.type + '" data-title="' + da.label + '" data-selected="' + da.selected + '">';
        } else {
          txt += '<li class="mexplorermenu-item ' + this.uiid + '-mexplorermenu-item" id="' + da.id + '" draggable="' + info.draggable + '" data-type="' + da.type + '" data-title="' + da.label + '" data-selected="' + da.selected + '">';
        }

        txt += '  <span class="mexplorermenu-item-name">';

        if (da.icon) {
          txt += '    <span class="mexplorermenu-item-img"><img src="' + info.srcpath + da.icon + '"></span>';
        }
      }

      txt += '    <span class="mexplorermenu-item-title">' + da.label + '</span>';

      if (da.tooltip) {
        txt += '      <span class="mexplorermenu-item-info">';
        txt += da.tooltip ? "<a class=\"mexplorermenu-tooltip\" data-toggle=\"tooltip\" data-template=\"".concat(tooltip_template.replace(/"/g, '&quot;'), "\" data-container=\"body\" data-placement=\"bottom\" data-html=\"true\" title=\"").concat(da.tooltip.replace(/"/g, '&quot;'), "\"><i class=\"fas fa-info-circle\"></i></a>") : '';
        txt += '      </span>';
      }

      if (da.rtooltip) {
        txt += '      <span class="mexplorermenu-item-info mexplorermenu-pull-right">';
        txt += da.rtooltip ? "<a class=\"mexplorermenu-tooltip\" data-toggle=\"tooltip\" data-template=\"".concat(tooltip_template.replace(/"/g, '&quot;'), "\" data-container=\"body\" data-placement=\"bottom\" data-html=\"true\" title=\"").concat(da.rtooltip.replace(/"/g, '&quot;'), "\"><i class=\"fas fa-info-circle\"></i></a>") : '';
        txt += '      </span>';
      }

      if (da.menu) {
        var menuList = [];
        da.menu.forEach(function (element) {
          menuList.push("data-".concat(element.type, "=\"").concat(element.active, "\""));
        });
        txt += '    <span class="mexplorermenu-item-btn ' + this.uiid + '-list-btn" id="' + da.id + '-btn" data-item="' + da.id + '" data-title="' + da.label + '" ' + menuList.join(' ') + '>';
        txt += '      <i class="fa fa-ellipsis-v"></i>';
        txt += '    </span>';
      }

      txt += '  </span>';

      if (da.type === 'branch' && da.subitems) {
        txt += '  <ul class="mexplorermenu-content">';

        for (var w = 0, ln = da.subitems.length; w < ln; w++) {
          var subitems = this.menuItemTxt(da.subitems[w], {
            draggable: info.draggable,
            dragstart: info.dragstart,
            srcpath: info.srcpath
          });
          txt += subitems;
        }

        txt += '  </ul>';
      }

      txt += '</li>';
      return txt;
    },
    populate: function populate(txt) {
      this.$element.html(txt); // update if title text overflow

      var btns_width = $__default["default"]('#' + this.uiid).find('.mexplorermenu-header .mexplorermenu-btn').width();
      var headerElement = $__default["default"]('#' + this.uiid).find('.mexplorermenu-header');
      var titleElement = $__default["default"]('#' + this.uiid).find('.mexplorermenu-title');
      var width = headerElement.width() - btns_width;

      if (btns_width > 0) {
        $__default["default"](titleElement).css('max-width', width);

        if (titleElement[0].offsetWidth > width && !titleElement.attr('title')) {
          titleElement.attr('title', titleElement.text().trim());
        }
      }

      var da = this.options;

      if (!(da.item instanceof Array) || da.item.length < 1) {
        da.item = [];
      }

      for (var i = 0, len = da.item.length; i < len; i++) {
        this.generateContextMenu(da.item[i], da.activeType);
      }

      $__default["default"]('#' + this.uiid + ' .mexplorermenu-item').each(function (e) {
        var id = $__default["default"](this).attr('id');
        var img_width = $__default["default"](this).find('.mexplorermenu-item-img').width() || 0;
        var tooltip_width = $__default["default"](this).find('.mexplorermenu-item-info').width() || 0;
        var btn_width = $__default["default"](this).find('.mexplorermenu-item-btn').width() || 0;
        var width = $__default["default"](this).width() - (img_width + tooltip_width + btn_width + 4);
        var elTitle = $__default["default"](this).find('.mexplorermenu-item-title');

        if (elTitle) {
          if (elTitle.prop('scrollWidth') > elTitle.prop('offsetWidth')) {
            elTitle.attr('title', elTitle.html());
          }

          elTitle.css('max-width', width);
        }

        if ($__default["default"](this).attr('data-selected') === 'true') {
          $__default["default"]('[id="' + id + '"]').addClass('active');
        }

        $__default["default"]('[data-toggle="tooltip"]').tooltip();
      });
      $__default["default"]('#' + this.uiid + ' .mexplorermenu-item-group').each(function (e) {
        var img_width = $__default["default"](this).find('.mexplorermenu-item-img').width() || 0;
        var tooltip_width = $__default["default"](this).find('.mexplorermenu-item-info').width() || 0;
        var btn_width = $__default["default"](this).find('.mexplorermenu-item-btn').width() || 0;
        var width = $__default["default"](this).width() - (img_width + tooltip_width + btn_width + 4);
        var elTitle = $__default["default"](this).find('.mexplorermenu-item-title');

        if (elTitle[0]) {
          if (elTitle[0].scrollWidth > elTitle[0].offsetWidth) {
            elTitle[0].title = elTitle[0].innerText;
          }

          elTitle[0].style.maxWidth = width;
        }

        if ($__default["default"](this).children('.mexplorermenu-item-name').attr('data-expand') === 'false') {
          $__default["default"](this).children('.mexplorermenu-content').addClass('mexplorermenu-hidden');
        }
      });
    },
    generateContextMenu: function generateContextMenu(da, activeType) {
      if (da.type === 'item') {
        if (da.menu && da.menu instanceof Array && da.menu.length > 0) {
          var items = this.groupContextMenuData(da.menu, activeType);
          this.buildContextMenu(da.id, items, activeType);
        }
      } else if (da.type === 'branch') {
        if (da.menu && da.menu instanceof Array && da.menu.length > 0) {
          var _items = this.groupContextMenuData(da.menu, activeType);

          this.buildContextMenu(da.id, _items, activeType);
        }

        if (da.subitems && da.subitems instanceof Array && da.subitems.length > 0) {
          for (var i = 0, len = da.subitems.length; i < len; i++) {
            this.generateContextMenu(da.subitems[i], activeType);
          }
        }
      }
    },
    groupContextMenuData: function groupContextMenuData(da, activeType) {
      var items = {};

      for (var i = 0, len = da.length; i < len; i++) {
        if (items[da[i].mid] == undefined) {
          if (activeType === 'visible') {
            items[da[i].mid] = {
              name: "<span class=\"context-menu-icon context-menu-".concat(da[i].type, "-icon\"></span>").concat(da[i].label),
              isHtmlName: true,
              visible: da[i].active
            };
          } else if (activeType === 'disabled') {
            items[da[i].mid] = {
              name: "<span class=\"context-menu-icon context-menu-".concat(da[i].type, "-icon\"></span>").concat(da[i].label),
              isHtmlName: true,
              disabled: da[i].active ? false : true
            };
          }
        }

        if (da[i].menu && da[i].menu instanceof Array && da[i].menu.length > 0) {
          if (items[da[i].mid]['items'] == undefined) {
            items[da[i].mid]['items'] = {};
            var subitems = this.groupContextMenuData(da[i].menu, activeType);
            items[da[i].mid]['items'] = subitems;
          }
        }
      }

      return items;
    },
    updateContextMenu: function updateContextMenu(mid, active) {
      for (var i = 0, len = this.options.item.length; i < len; i++) {
        // this.activeContextMenu(this.options.item[i].menu, mid, active);
        this.activeContextMenu(this.options.item[i], mid, active);
      }
    },
    activeContextMenu: function activeContextMenu(item, mid, active) {
      if (!item) {
        return;
      }

      if (item.menu) {
        for (var i = 0, len = item.menu.length; i < len; i++) {
          if (item.menu[i].mid == mid) {
            item.menu[i].active = active;
          }

          if (item.menu[i].menu) {
            this.activeContextSubMenu(menu[i].menu, mid, active);
          }
        }
      }

      if (item.subitems) {
        for (var _i2 = 0, _len2 = item.subitems.length; _i2 < _len2; _i2++) {
          this.activeContextMenu(item.subitems[_i2], mid, active);
        }
      }
    },
    activeContextSubMenu: function activeContextSubMenu(menu, mid, active) {
      if (!menu) {
        return;
      }

      for (var i = 0, len = menu.length; i < len; i++) {
        if (menu[i].mid == mid) {
          menu[i].active = active;
        }

        if (menu[i].menu) {
          this.activeContextSubMenu(menu[i].menu, mid, active);
        }
      }
    },
    getItem: function getItem(itemid, item) {
      if (!item) {
        return null;
      }

      if (item.id == itemid) {
        return item;
      }

      if (item.type == 'branch' && item.subitems && item.subitems instanceof Array) {
        for (var i = 0, len = item.subitems.length; i < len; i++) {
          var it = this.getItem(itemid, item.subitems[i]);

          if (it != null) {
            return it;
          }
        }
      }

      return null;
    },
    menubuild: function menubuild($trigger) {
      var itemid = $trigger.attr('data-item');
      var items = {};
      var clickitem = null;

      for (var i = 0, len = this.options.item.length; i < len; i++) {
        clickitem = this.getItem(itemid, this.options.item[i]);

        if (clickitem) {
          break;
        }
      }

      if (!clickitem) {
        return {
          items: {}
        };
      }

      if (clickitem.type === 'item') {
        if (clickitem.menu && clickitem.menu instanceof Array && clickitem.menu.length > 0) {
          items = this.groupContextMenuData(clickitem.menu, this.options.activeType);
          this.buildContextMenu(clickitem.id, items, this.options.activeType);
        }
      } else if (clickitem.type === 'branch') {
        if (clickitem.menu && clickitem.menu instanceof Array && clickitem.menu.length > 0) {
          items = this.groupContextMenuData(clickitem.menu, this.options.activeType);
          this.buildContextMenu(clickitem.id, items, this.options.activeType);
        }

        if (clickitem.subitems && clickitem.subitems instanceof Array && clickitem.subitems.length > 0) {
          for (var _i3 = 0, _len3 = clickitem.subitems.length; _i3 < _len3; _i3++) {
            this.generateContextMenu(clickitem.subitems[_i3], this.options.activeType);
          }
        }
      }

      return {
        items: items
      };
    },
    buildContextMenu: function buildContextMenu(id, items, activeType) {
      var config = {
        selector: "[id=\"".concat(id, "-btn\"]"),
        build: this.menubuild.bind(this),

        /*/
        build: function ($trigger) {
          // get contextMenu item data-* value
          let dataAttrs = Object.keys($trigger[0].dataset);
          let pass = ['item', 'title'];
          for (let i = 0, len = dataAttrs.length; i < len; i++) {
            if (pass.includes(dataAttrs[i])) {
              continue;
            }
            if (items[dataAttrs[i]]) {
              if (activeType === 'visible') {
                items[dataAttrs[i]].visible = $trigger[0].attributes[`data-${dataAttrs[i]}`].value === 'true' ? true : false;
              } else if (activeType === 'disabled') {
                items[dataAttrs[i]].disabled = $trigger[0].attributes[`data-${dataAttrs[i]}`].value === 'true' ? false : true;
              }
            }
          }
           return { items: items }
        },
        //*/
        trigger: 'left',
        hideOnSecondTrigger: true,
        callback: this.selectContextItem.bind(this),
        zIndex: 10
      };

      if ($__default["default"].contextMenu) {
        $__default["default"].contextMenu(config);
      }
    },
    // collapseMenu: function collapseMenu() {
    //   const header = this.$element.find('div.mexplorermenu-header > .mexplorermenu-title > .mexplorermenu-icon');
    //   header.removeClass('fa-chevron-down').addClass('fa-chevron-right');
    //   header.parents('.mexplorermenu-header').next('.mexplorermenu-body').addClass('mexplorermenu-hidden');
    //   // header.parents('.mexplorermenu-container').addClass('mexplorermenu-collapse');
    // },
    // expandeMenu: function expandeMenu() {
    //   const header = this.$element.find('div.mexplorermenu-header > .mexplorermenu-title > .mexplorermenu-icon');
    //   header.removeClass('fa-chevron-right').addClass('fa-chevron-down');
    //   header.parents('.mexplorermenu-header').next('.mexplorermenu-body').removeClass('mexplorermenu-hidden');
    //   // header.parents('.mexplorermenu-container').removeClass('mexplorermenu-collapse');
    // },
    // isMenuCollapse: function menuCollapse() {
    //   const header = this.$element.find('div.mexplorermenu-header > .mexplorermenu-title > .mexplorermenu-icon');
    //   if (header.hasClass('fa-chevron-down')) {
    //     return false;
    //   }
    //   return true;
    // },
    // toggleIconMenu: function toggleIconMenu(el) {
    //   if ($(el).hasClass('fa-chevron-down')) {
    //     $(el).removeClass('fa-chevron-down').addClass('fa-chevron-right');
    //     $(el).parents('.mexplorermenu-header').next('.mexplorermenu-body').addClass('mexplorermenu-hidden');
    //     $(el).parents('.mexplorermenu-container').addClass('mexplorermenu-collapse');
    //   } else if ($(el).hasClass('fa-chevron-right')) {
    //     $(el).removeClass('fa-chevron-right').addClass('fa-chevron-down');
    //     $(el).parents('.mexplorermenu-header').next('.mexplorermenu-body').removeClass('mexplorermenu-hidden');
    //     $(el).parents('.mexplorermenu-container').removeClass('mexplorermenu-collapse');
    //   }
    // },
    toggleItemGroup: function toggleItemGroup(el) {
      if ($__default["default"](el).find('.mexplorermenu-item-icon').hasClass('fa-chevron-down')) {
        $__default["default"](el).find('.mexplorermenu-item-icon').removeClass('fa-chevron-down').addClass('fa-chevron-right');
        $__default["default"](el).siblings('.mexplorermenu-content').addClass('mexplorermenu-hidden');
        $__default["default"](el).attr('data-expand', false);
      } else if ($__default["default"](el).find('.mexplorermenu-item-icon').hasClass('fa-chevron-right')) {
        $__default["default"](el).find('.mexplorermenu-item-icon').removeClass('fa-chevron-right').addClass('fa-chevron-down');
        $__default["default"](el).siblings('.mexplorermenu-content').removeClass('mexplorermenu-hidden');
        $__default["default"](el).attr('data-expand', true);
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('collapseGroupItem', {
          id: $__default["default"](el).parent('.mexplorermenu-item-group').attr('id'),
          type: $__default["default"](el).parent('.mexplorermenu-item-group').attr('data-type'),
          title: $__default["default"](el).parent('.mexplorermenu-item-group').attr('data-title'),
          expand: $__default["default"](el).attr('data-expand') === 'true' ? true : false
        });
      }
    },
    selectIconMenu: function selectIconMenu(el) {
      var id = $__default["default"](el).attr('id');
      var type = $__default["default"](el).attr('data-type');
      var title = $__default["default"](el).attr('data-menu');

      if (type === 'filter') {
        if ($__default["default"]('#' + id + '-input').parent().css('display') === 'none') {
          $__default["default"]('#' + id + '-input').parent().css('display', '');
          $__default["default"]('#' + id + '-input').trigger('focus');
        } else {
          $__default["default"]('#' + id + '-input').parent().css('display', 'none');
          $__default["default"]('#' + id + '-input').val('').trigger('input');
        }
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('selectmenu', Object.assign({
          id: id,
          type: type,
          title: title
        }, type === 'sort' ? {
          orderBy: $__default["default"](el).attr('data-orderby')
        } : ''));
      } else {
        if (this.$element[0].fireEvent) {
          this.$element[0].fireEvent('selectmenu');
        } else {
          var evObj = new CustomEvent('selectmenu', {
            detail: Object.assign({
              id: id,
              type: type,
              title: title
            }, type === 'sort' ? {
              orderBy: $__default["default"](el).attr('data-orderby')
            } : '')
          });
          this.$element[0].dispatchEvent(evObj);
        }
      }
    },
    selectItem: function selectItem(el) {
      var selectable = $__default["default"]('#' + this.uiid).children().attr('data-select') === 'true' ? true : false;
      var id = '';
      var title = '';

      if ($__default["default"](el.target).hasClass('fa') || $__default["default"](el.target).hasClass('mexplorermenu-item-btn')) {
        return;
      }

      if (selectable && $__default["default"](el.currentTarget).hasClass('mexplorermenu-item')) {
        $__default["default"]('.' + this.uiid + '-mexplorermenu-item.active').removeClass('active');
        $__default["default"](el.currentTarget).addClass('active');
        id = $__default["default"](el.currentTarget).attr('id');
        title = $__default["default"](el.currentTarget).attr('data-title');

        if (this.options.onAction && typeof this.options.onAction === 'function') {
          this.options.onAction('selectitem', {
            id: id,
            type: 'select',
            title: title
          });
        } else {
          if (this.$element[0].fireEvent) {
            this.$element[0].fireEvent('selectitem');
          } else {
            var evObj = new CustomEvent('selectitem', {
              detail: {
                id: id,
                type: 'select',
                title: title
              }
            });
            this.$element[0].dispatchEvent(evObj);
          }
        }
      }
    },
    selectContextItem: function selectContextItem(key, options) {
      var id = $__default["default"](options.$trigger).attr('data-item');
      var title = $__default["default"](options.$trigger).attr('data-title');

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('selectcontext', {
          id: id,
          type: key,
          title: title
        });
      } else {
        if (this.$element[0].fireEvent) {
          this.$element[0].fireEvent('selectcontext');
        } else {
          var evObj = new CustomEvent('selectcontext', {
            detail: {
              id: id,
              type: key,
              title: title
            }
          });
          this.$element[0].dispatchEvent(evObj);
        }
      }
    },
    filterItem: function filterItem(el) {
      var id = el.target.id;
      var filter_value = $__default["default"]("#".concat(id)).val();
      var menu_id = $__default["default"]("#".concat(id)).attr('data-menu');
      var title = $__default["default"]("#".concat(id)).attr('data-filter_title') === 'true' ? true : false;
      $__default["default"](el.target).siblings('.mexplorermenu-filter-clear-btn').toggle(filter_value ? true : false);
      $__default["default"]("#".concat(menu_id, " .mexplorermenu-item")).each(function (e) {
        var item_value = $__default["default"](this).find('.mexplorermenu-item-title').html() || '';

        if (title) {
          $__default["default"](this).parents('.mexplorermenu-item-group').css('display', '');
        } else {
          $__default["default"](this).parents().find('.mexplorermenu-item-group > .mexplorermenu-item-name').css('display', 'none');
          $__default["default"]('.mexplorermenu-content').css('margin-left', '0');
        }

        if (item_value.toLowerCase().indexOf(filter_value.toLowerCase()) >= 0) {
          $__default["default"](this).css('display', '');
        } else {
          $__default["default"](this).css('display', 'none');
        }
      });

      if (title) {
        if (!filter_value) {
          $__default["default"](el.target).trigger('focus');
        }

        $__default["default"]("#".concat(menu_id, " .mexplorermenu-item-group")).each(function (e) {
          var hidden_num = 0;
          var itemElements = $__default["default"](this).find('.mexplorermenu-item');
          itemElements.each(function () {
            if ($__default["default"](this).css('display') === 'none') {
              hidden_num += 1;
            }
          });
          $__default["default"](this).css('display', itemElements.length === hidden_num ? 'none' : '');
        });
      } else {
        if (!filter_value) {
          $__default["default"](el.target).trigger('focus');
          $__default["default"](el.target).parent().siblings('ul').find('.mexplorermenu-item-group .mexplorermenu-item-name').css('display', '');
          $__default["default"]('.mexplorermenu-content').css('margin-left', '');
        }
      }
    },
    renameItem: function renameItem(id, new_title) {
      if ($__default["default"]("#".concat(id)).length < 1) {
        return;
      } // rename item relative data info


      $__default["default"]("#".concat(id)).attr('data-title', new_title);
      $__default["default"]("#".concat(id)).find('.mexplorermenu-item-title').html(new_title);
      $__default["default"]("#".concat(id)).find('.mexplorermenu-item-btn').attr('data-title', new_title); // update options data

      for (var i = 0, len = this.options.item.length; i < len; i++) {
        if (this.updateItemLabel(this.options.item[i], id, new_title)) {
          break;
        }
      }
    },
    updateItemLabel: function updateItemLabel(item, id, label) {
      if (item && item.id === id) {
        item.label = label;
        return true;
      } else if (item && item.subitems && item.subitems instanceof Array) {
        for (var i = 0, len = item.subitems.length; i < len; i++) {
          this.updateItemLabel(item.subitems[i], id, label);
        }
      }

      return false;
    },
    deleteItem: function deleteItem(id) {
      var keepBranch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if ($__default["default"]("#".concat(id)).length < 1) {
        return;
      } // remove item from DOM


      var type = $__default["default"]("#".concat(id)).attr('data-type');

      if (type === 'item') {
        $__default["default"]("#".concat(id)).remove();
      } else if (type === 'branch') {
        var branch_content = $__default["default"]("#".concat(id)).find('.mexplorermenu-content');

        if (branch_content.length > 0) {
          $__default["default"](branch_content[0]).remove();
        }

        if (!keepBranch) {
          $__default["default"]("#".concat(id)).remove();
        }
      }

      for (var i = 0, len = this.options.item.length; i < len; i++) {
        if (this.options.item[i].id === id) {
          if (this.options.item[i].type === 'item' || this.options.item[i].type === 'branch' && !keepBranch) {
            this.options.item.splice(i, 1);
            return true;
          }

          this.options.item[i].subitems.length = 0;
          return true;
        }
      }

      for (var _i4 = 0, _len4 = this.options.item.length; _i4 < _len4; _i4++) {
        if (this.options.item[_i4].type === 'branch') {
          if (this.removeSubitem(this.options.item[_i4], id, keepBranch)) {
            return true;
          }
        }
      }

      return false;
    },
    removeSubitem: function removeSubitem(item, id, keepBranch) {
      if (item && item.subitems && item.subitems instanceof Array) {
        for (var i = 0, len = item.subitems.length; i < len; i++) {
          if (item.subitems[i].id == id) {
            if (item.subitems[i].type === 'item' || item.subitems[i].type === 'branch' && !keepBranch) {
              item.subitems.splice(i, 1);
              return true;
            }

            if (item.subitems[i].subitems) {
              item.subitems[i].subitems.length = 0;
            }

            return true;
          }
        }

        for (var _i5 = 0, _len5 = item.subitems.length; _i5 < _len5; _i5++) {
          if (item.subitems[_i5].type === 'branch') {
            if (this.removeSubitem(item.subitems[_i5], id, keepBranch)) {
              return true;
            }
          }
        }
      }

      return false;
    },
    appendItem: function appendItem(id, appendItems) {
      if (!appendItems || !(appendItems instanceof Array)) {
        return;
      }

      var info = {
        draggable: this.options.draggable,
        dragstart: this.options.dragstart,
        srcpath: this.options.srcpath
      };
      var txt = '';

      for (var i = 0, len = appendItems.length; i < len; i++) {
        txt += this.menuItemTxt(appendItems[i], info);
      }

      if (!txt) {
        return false;
      }

      if ($__default["default"]("#".concat(id)).children('.mexplorermenu-content').length < 1) {
        $__default["default"]("#".concat(id)).append('<ul class="mexplorermenu-content">' + txt + '</ul>');
      } else {
        $__default["default"]("#".concat(id)).children('.mexplorermenu-content').append(txt);
      } // update options data


      for (var _i6 = 0, _len6 = this.options.item.length; _i6 < _len6; _i6++) {
        if (this.options.item[_i6].type === 'branch' && this.options.item[_i6].subitems) {
          if (this.options.item[_i6].id === id) {
            for (var w = 0, ln = appendItems.length; w < ln; w++) {
              this.options.item[_i6].subitems.push(appendItems[w]);
            }

            break;
          }

          if (this.appendSubitem(this.options.item[_i6], id, appendItems)) {
            break;
          }
        }
      }

      for (var _i7 = 0, _len7 = appendItems.length; _i7 < _len7; _i7++) {
        this.generateContextMenu(appendItems[_i7], this.options.activeType);
      }

      return true;
    },
    appendSubitem: function appendSubitem(item, id, appendItems) {
      if (item && item.subitems && item.subitems instanceof Array) ;

      for (var i = 0, len = item.subitems.length; i < len; i++) {
        if (item.subitems[i].type === 'branch' && item.subitems[i].subitems) {
          if (item.subitems[i].id === id) {
            for (var w = 0, ln = appendItems.length; w < ln; w++) {
              item.subitems[i].subitems.push(appendItems[w]);
            }

            return true;
          }

          if (this.appendSubitem(item.subitems[i], id, appendItems)) {
            return true;
          }
        }
      }

      return false;
    }
  };

  var mInputTextArea = function mInputTextArea(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.default = {
      item: [{
        left_value: '',
        right_value: ''
      }],
      item_min: 1,
      item_max: 3,
      title: {
        left: '',
        right: ''
      },
      columnClass: {
        left: '',
        right: '',
        btn: ''
      },
      rows: {
        left: 2,
        right: 2
      },
      placeholder: {
        left: '',
        right: ''
      },
      spellcheck: false,
      clearmode: true,
      resize: true,
      saveInputHeight: false,
      expand: {
        active: false,
        icon: ''
      },
      buttonAlign: 'center'
    };
    this.options = Object.assign({}, this.default, options);
    this.clearmode = true;

    if (options.clearmode !== undefined && typeof options.clearmode === 'boolean') {
      this.clearmode = options.clearmode;
    }

    this.$element.on('click', '.minputtextarea-btn.addbtn', $__default["default"].proxy(function (ev) {
      this.addItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.minputtextarea-btn.delbtn', $__default["default"].proxy(function (ev) {
      this.deleteItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.minputtextarea-btn.expandbtn', $__default["default"].proxy(function (ev) {
      this.expandItem(ev.currentTarget);
    }, this));
    this.$element.on('click', '.minputtextarea-btn.expandbtn', $__default["default"].proxy(function (ev) {
      this.expandItem(ev.currentTarget);
    }, this));
    this.$element.on('change', '.minputtextarea-input', $__default["default"].proxy(function (ev) {
      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction(this.uiid, 'change', parseInt($__default["default"](ev.currentTarget).attr('data-item')), {}, []);
      }
    }, this));
    this.populate();
  };

  mInputTextArea.prototype = {
    clear: function clear() {
      this.options = this.default;
      this.populate();
    },
    destroy: function destroy() {
      this.$element.find('table.minputtextarea').off();
      this.$element.find('table.minputtextarea').remove();
      this.$element.data('daai.inputtextareatable');
      this.$element.removeData('daai.inputtextareatable');
      this.$element.data('daai.inputtextareatable');
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = Object.assign({}, this.default, options);
      this.populate();
    },
    reset: function reset() {
      this.options.item = [{
        left_value: '',
        right_value: ''
      }];
      this.populate();
    },
    populate: function populate() {
      var html = this.render();
      this.$element.html(html);
      $__default["default"]('.minputtextarea-input').each(function () {
        var prev_height = $__default["default"](this).attr('data-prev-height');
        $__default["default"](this).css('min-height', $__default["default"](this).outerHeight());

        if (prev_height) {
          $__default["default"](this).css('height', prev_height);
        }
      }); // update buttons width

      $__default["default"]('#' + this.uiid).find('.minputtextarea-btns').each(function () {
        $__default["default"](this).css('width', $__default["default"](this).find('.minputtextarea-btn').length * 20 + 12);
      });

      if (!this.clearmode) {
        this.itemBannedAction();
      }
    },
    render: function render() {
      var da = this.options;
      var html = '';
      html += "<table class=\"minputtextarea\" id=\"".concat(this.uiid, "\">");

      if (da.title) {
        html += "\n      <thead class=\"minputtextarea-header\">\n        <tr>\n          <td class=\"minputtextarea-title minputtextarea-title-left\" id=\"".concat(this.uiid, "-title-left\">").concat(da.title.left, "</td>\n          <td class=\"minputtextarea-title minputtextarea-title-right\" id=\"").concat(this.uiid, "-title-right\">").concat(da.title.right, "</td>\n          <td class=\"minputtextarea-title minputtextarea-title-btn\" id=\"").concat(this.uiid, "-title-btn\"></td>\n        </tr>\n      </thead>");
      }

      html += '<tbody class="minputtextarea-body">';

      for (var i = 0, len = da.item.length > da.item_max ? da.item_max : da.item.length; i < len; i++) {
        var left_prev_height = da.saveInputHeight && da.item[i].left_height ? da.item[i].left_height : '';
        var right_prev_height = da.saveInputHeight && da.item[i].right_height ? da.item[i].right_height : ''; // id="${this.uiid}-input-left-${i}"
        // id="${this.uiid}-input-right-${i}"

        html += "\n      <tr class=\"minputtextarea-item ".concat(this.uiid, "-item\" data-item=\"").concat(i, "\">\n        <td class=\"minputtextarea-td ").concat(da.columnClass.left, "\">\n          <input class=\"minputtextarea-input ").concat(this.uiid, "-input-left\" data-item=\"").concat(i, "\"\n            placeholder=\"").concat(da.placeholder.left, "\" spellcheck=\"").concat(da.spellcheck, "\"\n            data-prev-height=\"").concat(left_prev_height, "\" value=\"").concat(da.item[i].left_value.replace(/"/g, '&quot;'), "\">\n        </td>\n        <td class=\"minputtextarea-td ").concat(da.columnClass.right, "\">\n          <textarea class=\"minputtextarea-input ").concat(this.uiid, "-input-right ").concat(!da.resize ? 'noresize' : '', "\"\n            data-item=\"").concat(i, "\" rows=\"").concat(da.rows.right, "\"\n            placeholder=\"").concat(da.placeholder.right, "\" spellcheck=\"").concat(da.spellcheck, "\"\n            data-prev-height=\"").concat(right_prev_height, "\">").concat(da.item[i].right_value.replace(/"/g, '&quot;'), "</textarea>\n        </td>\n        <td class=\"minputtextarea-td minputtextarea-btns ").concat(da.columnClass.btn, "\" style=\"align-items: ").concat(da.buttonAlign, ";\">\n          ").concat(da.expand.active ? "<span class=\"minputtextarea-btn expandbtn\" data-item=\"".concat(i, "\"><i class=\"fas ").concat(da.expand.icon, "\"></i></span>") : '', "\n          <span class=\"minputtextarea-btn addbtn\" data-item=\"").concat(i, "\"><i class=\"fas fa-plus\"></i></span>\n          <span class=\"minputtextarea-btn delbtn\" data-item=\"").concat(i, "\"><i class=\"fas fa-minus\"></i></span>\n          <span></span>\n        </td>\n      </tr>");
      }

      html += "</tbody>\n    </table>";
      return html;
    },
    addItem: function addItem(el) {
      //*/
      var item = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();

      if (!$__default["default"](el).hasClass('addbtn') || items.length >= this.options.item_max) {
        return;
      }

      var curitem = this.$element.find("tr[data-item=\"".concat(item, "\"]"));

      if (curitem) {
        for (var i = this.options.item_max - 1; i > item; i--) {
          this.$element.find("tr [data-item=\"".concat(i, "\"]")).attr('data-item', i + 1);
          this.$element.find("tr[data-item=\"".concat(i, "\"]")).attr('data-item', i + 1);
        }

        items.splice(item + 1, 0, {
          left_value: '',
          right_value: '',
          left_height: '',
          right_height: ''
        });
        curitem.after("<tr class=\"minputtextarea-item ".concat(this.uiid, "-item\" data-item=\"").concat(item + 1, "\">\n        <td class=\"minputtextarea-td ").concat(this.options.columnClass.left, "\">\n          <input class=\"minputtextarea-input ").concat(this.uiid, "-input-left\" data-item=\"").concat(item + 1, "\"\n            placeholder=\"").concat(this.options.placeholder.left, "\" spellcheck=\"").concat(this.optionsspellcheck, "\"\n            data-prev-height=\"\" value=\"\">\n        </td>\n        <td class=\"minputtextarea-td ").concat(this.options.columnClass.right, "\">\n          <textarea class=\"minputtextarea-input ").concat(this.uiid, "-input-right ").concat(!this.options.resize ? 'noresize' : '', "\"\n            data-item=\"").concat(item + 1, "\" rows=\"").concat(this.options.rows.right, "\"\n            placeholder=\"").concat(this.options.placeholder.right, "\" spellcheck=\"").concat(this.options.pellcheck, "\"\n            data-prev-height=\"\"></textarea>\n        </td>\n        <td class=\"minputtextarea-td minputtextarea-btns ").concat(this.options.columnClass.btn, "\" style=\"align-items: ").concat(this.options.buttonAlign, ";\">\n          ").concat(this.options.expand.active ? "<span class=\"minputtextarea-btn expandbtn\" data-item=\"".concat(item + 1, "\"><i class=\"fas ").concat(this.options.expand.icon, "\"></i></span>") : '', "\n          <span class=\"minputtextarea-btn addbtn\" data-item=\"").concat(item + 1, "\"><i class=\"fas fa-plus\"></i></span>\n          <span class=\"minputtextarea-btn delbtn\" data-item=\"").concat(item + 1, "\"><i class=\"fas fa-minus\"></i></span>\n          <span></span>\n        </td>\n      </tr>"));

        if (this.options.onAction && typeof this.options.onAction === 'function') {
          this.options.onAction(this.uiid, 'additem', item, {
            left_value: '',
            right_value: ''
          }, items);
        }

        this.options.item = items;
      }
      /*/
      let item = parseInt($(el).attr('data-item'));
      let items = this.getCurrentItems();
      if ($(el).hasClass('addbtn')) {
        if (items.length < this.options.item_max) {
          items.splice(item + 1, 0, { left_value: '', right_value: '', left_height: '', right_height: '' });
        }
      }
       if (this.options.onAction && (typeof this.options.onAction === 'function')) {
        this.options.onAction(this.uiid, 'additem', item, items[item], items);
      }
       this.options.item = items;
      this.populate();
      //*/

    },
    deleteItem: function deleteItem(el) {
      var item = parseInt($__default["default"](el).attr('data-item'));
      var items = this.getCurrentItems();

      if ($__default["default"](el).hasClass('delbtn')) {
        if (items.length > this.options.item_min) {
          var rmitem = this.$element.find("tr[data-item=\"".concat(item, "\"]"));

          if (rmitem) {
            rmitem.remove();
          }

          for (var i = item + 1; i < this.options.item_max; i++) {
            this.$element.find("tr [data-item=\"".concat(i, "\"]")).attr('data-item', i - 1);
            this.$element.find("tr[data-item=\"".concat(i, "\"]")).attr('data-item', i - 1);
          }

          items.splice(item, 1);

          if (this.options.onAction && typeof this.options.onAction === 'function') {
            this.options.onAction(this.uiid, 'deleteitem', item, {}, []);
          }
        } else if (items.length == 1) {
          items = [{
            left_value: '',
            right_value: '',
            left_height: '',
            right_height: ''
          }]; // clear value
        }
      }

      this.options.item = items; //this.populate();
    },
    getCurrentItems: function getCurrentItems() {
      var items = [];
      $__default["default"]('.' + this.uiid + '-item').each(function (e) {
        items.push({
          left_value: '',
          right_value: '',
          left_height: '',
          right_height: ''
        });
      });
      $__default["default"]('.' + this.uiid + '-input-left').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        items[item].left_value = $__default["default"](this).val().replace(/"/g, '&quot;');
        items[item].left_height = $__default["default"](this).outerHeight();
      });
      $__default["default"]('.' + this.uiid + '-input-right').each(function (e) {
        var item = parseInt($__default["default"](this).attr('data-item'));
        items[item].right_value = $__default["default"](this).val().replace(/"/g, '&quot;');
        items[item].right_height = $__default["default"](this).outerHeight();
      });
      return items;
    },
    getItems: function getItems() {
      var da = this.getCurrentItems();
      var items = [];

      for (var i = 0, len = da.length; i < len; i++) {
        if (da[i].left_value == '' && da[i].right_value == '') {
          continue;
        }

        items.push({
          left_value: da[i].left_value.replace(/&quot;/g, '"'),
          right_value: da[i].right_value.replace(/&quot;/g, '"')
        });
      }

      return items;
    },
    getAllItems: function getAllItems() {
      var da = this.getCurrentItems();
      var items = [];

      for (var i = 0, len = da.length; i < len; i++) {
        items.push({
          left_value: da[i].left_value.replace(/&quot;/g, '"'),
          right_value: da[i].right_value.replace(/&quot;/g, '"')
        });
      }

      return items;
    },
    getItem: function getItem(index) {
      var da = this.getCurrentItems();

      if (da.length > 0 && index >= 0 && index < da.length) {
        return {
          left_value: da[index].left_value.replace(/&quot;/g, '"'),
          right_value: da[index].right_value.replace(/&quot;/g, '"')
        };
      }

      return {
        left_value: '',
        right_value: ''
      };
    },
    setItem: function getItem(index, value) {
      if (index >= 0 && index < this.options.item.length) {
        this.options.item[index].left_value = value.left_value;
        this.options.item[index].right_value = value.right_value;
        this.$element.find("tr[data-item=\"".concat(index, "\"] input")).val(value.left_value);
        this.$element.find("tr[data-item=\"".concat(index, "\"] textarea")).val(value.right_value);
      }
    },
    itemBannedAction: function itemBannedAction() {
      if (!this.options.item || !(this.options.item instanceof Array)) {
        this.options.item = [];
      }

      if (this.options.item.length <= this.options.item_min) {
        $__default["default"]('#' + this.uiid).find('.minputtextarea-btn.delbtn').addClass('banned-action');
      } else if (this.options.item.length >= this.options.item_max) {
        $__default["default"]('#' + this.uiid).find('.minputtextarea-btn.addbtn').addClass('banned-action');
      }
    },
    expandItem: function expandItem(el) {
      var index = parseInt($__default["default"](el).attr('data-item'));
      var data = this.getCurrentItems();
      var item = {
        left_value: '',
        right_value: ''
      };
      var items = [];
      var elements = document.getElementsByClassName(this.uiid + '-item');

      for (var i = 0, len = elements.length; i < len; i++) {
        if (index == $__default["default"](elements[i]).attr('data-item')) {
          item.left_value = $__default["default"](elements[i]).find('.' + this.uiid + '-input-left').val();
          item.right_value = $__default["default"](elements[i]).find('.' + this.uiid + '-input-right').val();
          break;
        }
      } // regroup items data


      for (var _i = 0, _len = data.length; _i < _len; _i++) {
        items.push({
          left_value: data[_i].left_value,
          right_value: data[_i].right_value
        });
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction(this.uiid, 'expand', index, item, items);
      }
    }
  };

  var mTreeMenu = function mTreeMenu(element, options) {
    this.$element = $__default["default"](element);
    this.uiid = this.$element.attr('id');
    this.default = {
      label: '',
      collapse: null,
      select: false,
      draggable: true,
      dragstart: 'dragStart',
      showheader: true,
      tool: [],
      activeType: '',
      item: [],
      srcpath: ''
    };
    this.options = JSON.parse(JSON.stringify(options));
    this.options = Object.assign({}, this.default, this.options, options.onAction ? {
      'onAction': options.onAction
    } : '');

    if (!$__default["default"].ui || !$__default["default"].ui.position) {
      var uipos = new mPosition();
      uipos.createPosition($__default["default"]);
    }

    if (!$__default["default"].contextMenu) {
      var contextm = new mContextMenu();
      contextm.createContextMenu($__default["default"]);
    } // mtreemenu-header: toggle mtreemenu-body
    // this.$element.on('click', '.mtreemenu-title > .mtreemenu-icon', $.proxy(function (ev) {
    //   this.toggleIconMenu(ev.currentTarget);
    // }, this));
    // mtreemenu-header: insert, config, reload btns


    this.$element.on('click', '.mtreemenu-btn > .mtreemenu-icon, .mtreemenu-btn > .mtreemenu-img', $__default["default"].proxy(function (ev) {
      this.selectIconMenu(ev.currentTarget);
    }, this)); // item-group: collapse content items

    this.$element.on('click', '.mtreemenu-item-group > .mtreemenu-item-name', $__default["default"].proxy(function (ev) {
      if ($__default["default"](ev.target).hasClass('fa-ellipsis-v') || $__default["default"](ev.target).hasClass('mtreemenu-item-btn')) {
        return;
      }

      this.toggleItemGroup(ev.currentTarget);
    }, this)); // item: select item

    this.$element.on('click', '.mtreemenu-item', $__default["default"].proxy(function (ev) {
      if ($__default["default"](ev.currentTarget).hasClass('mtreemenu-item-group')) {
        return;
      }

      this.selectItem(ev);
    }, this));
    this.$element.on('input', '.mtreemenu-filter-input', $__default["default"].proxy(function (ev) {
      this.filterItem(ev);
    }, this));
    this.$element.on('click', '.mtreemenu-filter-clear-btn', $__default["default"].proxy(function (ev) {
      $__default["default"](ev.target).siblings('.mtreemenu-filter-input').val('').trigger('input');
    }, this));
    this.render();
  };

  mTreeMenu.prototype = {
    clear: function clear() {
      // if (collapse == null) {
      //   collapse = true;
      //   const header = this.$element.find('div.mtreemenu-header > .mtreemenu-title > .mtreemenu-icon');
      //   if (header.hasClass('fa-chevron-down')) {
      //     collapse = false;
      //   }
      // }
      // if (!collapse) {
      //   $(this.$element).find('.mtreemenu-title > .mtreemenu-icon').removeClass('fa-chevron-right').addClass('fa-chevron-down');
      //   $(this.$element).find('.mtreemenu-body').removeClass('mtreemenu-hidden');
      //   // $(this.$element).removeClass('mtreemenu-collapse');
      // } else {
      //   $(this.$element).find('.mtreemenu-title > .mtreemenu-icon').addClass('fa-chevron-right').removeClass('fa-chevron-down');
      //   $(this.$element).find('.mtreemenu-body').addClass('mtreemenu-hidden');
      //   // $(this.$element).addClass('mtreemenu-collapse');
      // }
      this.options = JSON.parse(JSON.stringify(this.default));
      this.render();
    },
    destroy: function destroy() {
      this.$element.find('div.mtreemenu-header').off();
      this.$element.find('div.mtreemenu-body').off();
      this.$element.find('div.mtreemenu-header').remove();
      this.$element.find('div.mtreemenu-body').remove();
      this.$element[0].outerHTML = '';
    },
    update: function update(options) {
      this.options = JSON.parse(JSON.stringify(options));
      this.options = Object.assign({}, this.default, this.options, options.onAction ? {
        'onAction': options.onAction
      } : ''); // let collapse = false;
      // if (this.options.collapse != null) {
      //   collapse = this.options.collapse;
      // } else {
      //   const header = this.$element.find('div.mtreemenu-header > .mtreemenu-title > .mtreemenu-icon');
      //   if (header.hasClass('fa-chevron-right')) {
      //     collapse = true;
      //   }
      // }

      this.render();
    },
    render: function render() {
      var da = this.options;
      var txt = "<div id=\"".concat(this.uiid, "-spin\" class=\"\"></div>"); // if (!collapse) {
      //   txt += '<div class="mtreemenu-header" data-select="' + da.select + '">';
      //   txt += '  <span class="mtreemenu-title">';
      //   txt += '    <i class="mtreemenu-icon fa fa-chevron-down"></i>';
      //   txt += '    <span>' + da.label + '</span>'
      //   txt += '  </span>';
      // } else {
      //   txt += '<div class="mtreemenu-header" data-select="' + da.select + '">';
      //   txt += '  <span class="mtreemenu-title">';
      //   txt += '    <i class="mtreemenu-icon fa fa-chevron-right"></i>';
      //   txt += '    <span>' + da.label + '</span>'
      //   txt += '  </span>';
      // }

      var isFilter = {
        active: false,
        title: false,
        placeholder: ''
      };

      if (this.options.showheader) {
        txt += '<div class="mtreemenu-header" data-select="' + da.select + '">';
        txt += '  <span class="mtreemenu-title">' + da.label + '</span>';
        txt += '  <span class="mtreemenu-btn">';

        for (var i = 0, len = da.tool.length; i < len; i++) {
          if (da.tool[i].name === 'filter') {
            isFilter.active = da.tool[i].active;
            isFilter.title = da.tool[i].title;
            isFilter.placeholder = da.tool[i].placeholder;
          }

          if (da.tool[i].active) {
            var sortable = da.tool[i].name === 'sort' ? "data-orderby=\"".concat(da.tool[i].orderBy, "\"") : '';

            if (da.tool[i].iconType === 'img') {
              var className = da.tool[i].className ? da.tool[i].className : "mtreemenu-".concat(da.tool[i].name, "-img");
              txt += "<span class=\"mtreemenu-img ".concat(className, "\" id=\"").concat(this.uiid, "-").concat(da.tool[i].name, "\"\n              data-menu=\"").concat(this.uiid, "\" data-type=\"").concat(da.tool[i].name, "\" ").concat(sortable, "></span>");
            } else if (da.tool[i].iconType === 'icon') {
              txt += "<i class=\"mtreemenu-icon ".concat(da.tool[i].icon, "\" id=\"").concat(this.uiid, "-").concat(da.tool[i].name, "\"\n              data-menu=\"").concat(this.uiid, "\" data-type=\"").concat(da.tool[i].name, "\" ").concat(sortable, "></i>");
            }
          }
        }

        txt += '  </span>';
        txt += '</div>';
      } else {
        for (var _i = 0, _len = da.tool.length; _i < _len; _i++) {
          if (da.tool[_i].name === 'filter') {
            isFilter.active = da.tool[_i].active;
            isFilter.title = da.tool[_i].title;
            isFilter.placeholder = da.tool[_i].placeholder;
          }
        }
      } // if (!collapse) {
      //   txt += '<div class="mtreemenu-body">';
      // } else {
      //   txt += '<div class="mtreemenu-body">';
      // }


      if (this.options.showheader) {
        txt += '<div class="mtreemenu-body">';
      } else {
        txt += '<div class="mtreemenu-noheader-body">';
      }

      if (isFilter.active) {
        txt += '<span class="mtreemenu-filter" style="display: none;">';
        txt += '  <input type="text" class="mtreemenu-filter-input" id="' + this.uiid + '-filter-input" data-menu="' + this.uiid + '"';
        txt += '   data-filter_title="' + isFilter.title + '"';
        txt += '   placeholder="' + (isFilter.placeholder ? isFilter.placeholder.replace(/"/g, '&quot;') : 'Search ...') + '">';
        txt += '  <i class="mtreemenu-filter-clear-btn">&times;</i>';
        txt += '</span>';
      }

      txt += '    <ul style="margin: 0; padding: 0;">';

      for (var _i2 = 0, _len2 = da.item.length; _i2 < _len2; _i2++) {
        txt += this.menuItemTxt(da.item[_i2], {
          draggable: da.draggable,
          dragstart: da.dragstart,
          srcpath: da.srcpath
        });
      }
      txt += '  </ul>';
      txt += '</div>';
      this.populate(txt);
    },
    menuItemTxt: function menuItemTxt(da, info) {
      var tooltip_template = '<div class="tooltip tooltip-outer" role="tooltip"><div class="arrow"></div><div class="tooltip-mtreemenu tooltip-inner"></div></div>';
      var txt = '';

      if (da.type === 'branch') {
        if (da.expandItems == null) {
          da.expandItems = true;
        }

        txt += '<li class="mtreemenu-item-group" id="' + da.id + '" data-type="' + da.type + '" data-title="' + da.label + '" data-userinfo="' + (da.userinfo || '') + '">';
        txt += '  <span class="mtreemenu-item-name" data-expand="' + da.expandItems + '">';
        txt += '    <i class="mtreemenu-item-icon fa ' + (da.expandItems ? 'fa-chevron-down' : 'fa-chevron-right') + '"></i>';
      } else if (da.type === 'item') {
        if (info.draggable != undefined && info.draggable == true) {
          txt += '<li class="mtreemenu-item ' + this.uiid + '-mtreemenu-item" id="' + da.id + '" draggable="' + info.draggable + '" ondragstart="' + info.dragstart + '(event)" data-type="' + da.type + '" data-title="' + da.label + '" data-select="' + da.select + '" data-selected="' + da.selected + '" data-userinfo="' + (da.userinfo || '') + '">';
        } else {
          txt += '<li class="mtreemenu-item ' + this.uiid + '-mtreemenu-item" id="' + da.id + '" draggable="' + info.draggable + '" data-type="' + da.type + '" data-title="' + da.label + '" data-select="' + da.select + '" data-selected="' + da.selected + '" data-userinfo="' + (da.userinfo || '') + '">';
        }

        txt += '  <span class="mtreemenu-item-name">';

        if (da.icon) {
          txt += '    <span class="mtreemenu-item-img"><img src="' + info.srcpath + da.icon + '"></span>';
        }
      }

      txt += '    <span class="mtreemenu-item-title">' + da.label + '</span>';

      if (da.tooltip) {
        txt += '      <span class="mtreemenu-item-info">';
        txt += da.tooltip ? "<a class=\"mtreemenu-tooltip\" data-toggle=\"tooltip\" data-template=\"".concat(tooltip_template.replace(/"/g, '&quot;'), "\" data-container=\"body\" data-placement=\"bottom\" data-html=\"true\" title=\"").concat(da.tooltip.replace(/"/g, '&quot;'), "\"><i class=\"fas fa-info-circle\"></i></a>") : '';
        txt += '      </span>';
      }

      if (da.rtooltip) {
        txt += '      <span class="mtreemenu-item-info mtreemenu-pull-right">';
        txt += da.rtooltip ? "<a class=\"mtreemenu-tooltip\" data-toggle=\"tooltip\" data-template=\"".concat(tooltip_template.replace(/"/g, '&quot;'), "\" data-container=\"body\" data-placement=\"bottom\" data-html=\"true\" title=\"").concat(da.rtooltip.replace(/"/g, '&quot;'), "\"><i class=\"fas fa-info-circle\"></i></a>") : '';
        txt += '      </span>';
      }

      if (da.menu) {
        var menuList = [];
        da.menu.forEach(function (element) {
          menuList.push("data-".concat(element.type, "=\"").concat(element.active, "\""));
        });
        txt += '    <span class="mtreemenu-item-btn ' + this.uiid + '-list-btn" id="' + da.id + '-btn" data-item="' + da.id + '" data-title="' + da.label + '" ' + menuList.join(' ') + '>';
        txt += '      <i class="fa fa-ellipsis-v"></i>';
        txt += '    </span>';
      }

      txt += '  </span>';

      if (da.type === 'branch' && da.subitems) {
        txt += '  <ul class="mtreemenu-content">';

        for (var w = 0, ln = da.subitems.length; w < ln; w++) {
          var subitems = this.menuItemTxt(da.subitems[w], {
            draggable: info.draggable,
            dragstart: info.dragstart,
            srcpath: info.srcpath
          });
          txt += subitems;
        }

        txt += '  </ul>';
      }

      txt += '</li>';
      return txt;
    },
    populate: function populate(txt) {
      this.$element.html(txt); // update if title text overflow

      var btns_width = $__default["default"]('#' + this.uiid).find('.mtreemenu-header .mtreemenu-btn').width();
      var headerElement = $__default["default"]('#' + this.uiid).find('.mtreemenu-header');
      var titleElement = $__default["default"]('#' + this.uiid).find('.mtreemenu-title');
      var width = headerElement.width() - btns_width;

      if (btns_width > 0) {
        $__default["default"](titleElement).css('max-width', width);

        if (titleElement[0].offsetWidth > width && !titleElement.attr('title')) {
          titleElement.attr('title', titleElement.text().trim());
        }
      }

      var da = this.options;

      if (!(da.item instanceof Array) || da.item.length < 1) {
        da.item = [];
      }

      for (var i = 0, len = da.item.length; i < len; i++) {
        this.generateContextMenu(da.item[i], da.activeType);
      }

      $__default["default"]('#' + this.uiid + ' .mtreemenu-item').each(function (e) {
        var id = $__default["default"](this).attr('id');
        var img_width = $__default["default"](this).find('.mtreemenu-item-img').width() || 0;
        var tooltip_width = $__default["default"](this).find('.mtreemenu-item-info').width() || 0;
        var btn_width = $__default["default"](this).find('.mtreemenu-item-btn').width() || 0;
        var width = $__default["default"](this).width() - (img_width + tooltip_width + btn_width + 4);
        var elTitle = $__default["default"](this).find('.mtreemenu-item-title');

        if (elTitle) {
          if (elTitle.prop('scrollWidth') > elTitle.prop('offsetWidth')) {
            elTitle.attr('title', elTitle.html());
          }

          elTitle.css('max-width', width);
        }

        if ($__default["default"](this).attr('data-selected') === 'true') {
          $__default["default"]('[id="' + id + '"]').addClass('active');
        }

        $__default["default"]('[data-toggle="tooltip"]').tooltip();
      });
      $__default["default"]('#' + this.uiid + ' .mtreemenu-item-group').each(function (e) {
        var img_width = $__default["default"](this).find('.mtreemenu-item-img').width() || 0;
        var tooltip_width = $__default["default"](this).find('.mtreemenu-item-info').width() || 0;
        var btn_width = $__default["default"](this).find('.mtreemenu-item-btn').width() || 0;
        var width = $__default["default"](this).width() - (img_width + tooltip_width + btn_width + 4);
        var elTitle = $__default["default"](this).find('.mtreemenu-item-title');

        if (elTitle[0]) {
          if (elTitle[0].scrollWidth > elTitle[0].offsetWidth) {
            elTitle[0].title = elTitle[0].innerText;
          }

          elTitle[0].style.maxWidth = width;
        }

        if ($__default["default"](this).children('.mtreemenu-item-name').attr('data-expand') === 'false') {
          $__default["default"](this).children('.mtreemenu-content').addClass('mtreemenu-hidden');
        }
      });
    },
    generateContextMenu: function generateContextMenu(da, activeType) {
      if (da.type === 'item') {
        if (da.menu && da.menu instanceof Array && da.menu.length > 0) {
          var items = this.groupContextMenuData(da.menu, activeType);
          this.buildContextMenu(da.id, items, activeType);
        }
      } else if (da.type === 'branch') {
        if (da.menu && da.menu instanceof Array && da.menu.length > 0) {
          var _items = this.groupContextMenuData(da.menu, activeType);

          this.buildContextMenu(da.id, _items, activeType);
        }

        if (da.subitems && da.subitems instanceof Array && da.subitems.length > 0) {
          for (var i = 0, len = da.subitems.length; i < len; i++) {
            this.generateContextMenu(da.subitems[i], activeType);
          }
        }
      }
    },
    groupContextMenuData: function groupContextMenuData(da, activeType) {
      var items = {};

      for (var i = 0, len = da.length; i < len; i++) {
        if (items[da[i].mid] == undefined) {
          if (activeType === 'visible') {
            items[da[i].mid] = {
              name: "<span class=\"context-menu-icon context-menu-".concat(da[i].type, "-icon\"></span>").concat(da[i].label),
              isHtmlName: true,
              visible: da[i].active
            };
          } else if (activeType === 'disabled') {
            items[da[i].mid] = {
              name: "<span class=\"context-menu-icon context-menu-".concat(da[i].type, "-icon\"></span>").concat(da[i].label),
              isHtmlName: true,
              disabled: da[i].active ? false : true
            };
          }
        }

        if (da[i].menu && da[i].menu instanceof Array && da[i].menu.length > 0) {
          if (items[da[i].mid]['items'] == undefined) {
            items[da[i].mid]['items'] = {};
            var subitems = this.groupContextMenuData(da[i].menu, activeType);
            items[da[i].mid]['items'] = subitems;
          }
        }
      }

      return items;
    },
    updateContextMenu: function updateContextMenu(mid, active) {
      for (var i = 0, len = this.options.item.length; i < len; i++) {
        // this.activeContextMenu(this.options.item[i].menu, mid, active);
        this.activeContextMenu(this.options.item[i], mid, active);
      }
    },
    activeContextMenu: function activeContextMenu(item, mid, active) {
      if (!item) {
        return;
      }

      if (item.menu) {
        for (var i = 0, len = item.menu.length; i < len; i++) {
          if (item.menu[i].mid == mid) {
            item.menu[i].active = active;
          }

          if (item.menu[i].menu) {
            this.activeContextSubMenu(menu[i].menu, mid, active);
          }
        }
      }

      if (item.subitems) {
        for (var _i3 = 0, _len3 = item.subitems.length; _i3 < _len3; _i3++) {
          this.activeContextMenu(item.subitems[_i3], mid, active);
        }
      }
    },
    activeContextSubMenu: function activeContextSubMenu(menu, mid, active) {
      if (!menu) {
        return;
      }

      for (var i = 0, len = menu.length; i < len; i++) {
        if (menu[i].mid == mid) {
          menu[i].active = active;
        }

        if (menu[i].menu) {
          this.activeContextSubMenu(menu[i].menu, mid, active);
        }
      }
    },
    getItem: function getItem(itemid, item) {
      if (!item) {
        return null;
      }

      if (item.id == itemid) {
        return item;
      }

      if (item.type == 'branch' && item.subitems && item.subitems instanceof Array) {
        for (var i = 0, len = item.subitems.length; i < len; i++) {
          var it = this.getItem(itemid, item.subitems[i]);

          if (it != null) {
            return it;
          }
        }
      }

      return null;
    },
    menubuild: function menubuild($trigger) {
      var itemid = $trigger.attr('data-item');
      var items = {};
      var clickitem = null;

      for (var i = 0, len = this.options.item.length; i < len; i++) {
        clickitem = this.getItem(itemid, this.options.item[i]);

        if (clickitem) {
          break;
        }
      }

      if (!clickitem) {
        return {
          items: {}
        };
      }

      if (clickitem.type === 'item') {
        if (clickitem.menu && clickitem.menu instanceof Array && clickitem.menu.length > 0) {
          items = this.groupContextMenuData(clickitem.menu, this.options.activeType);
          this.buildContextMenu(clickitem.id, items, this.options.activeType);
        }
      } else if (clickitem.type === 'branch') {
        if (clickitem.menu && clickitem.menu instanceof Array && clickitem.menu.length > 0) {
          items = this.groupContextMenuData(clickitem.menu, this.options.activeType);
          this.buildContextMenu(clickitem.id, items, this.options.activeType);
        }

        if (clickitem.subitems && clickitem.subitems instanceof Array && clickitem.subitems.length > 0) {
          for (var _i4 = 0, _len4 = clickitem.subitems.length; _i4 < _len4; _i4++) {
            this.generateContextMenu(clickitem.subitems[_i4], this.options.activeType);
          }
        }
      }

      return {
        items: items
      };
    },
    buildContextMenu: function buildContextMenu(id, items, activeType) {
      var config = {
        selector: "[id=\"".concat(id, "-btn\"]"),
        build: this.menubuild.bind(this),

        /*/
        build: function ($trigger) {
          // get contextMenu item data-* value
          let dataAttrs = Object.keys($trigger[0].dataset);
          let pass = ['item', 'title'];
          for (let i = 0, len = dataAttrs.length; i < len; i++) {
            if (pass.includes(dataAttrs[i])) {
              continue;
            }
            if (items[dataAttrs[i]]) {
              if (activeType === 'visible') {
                items[dataAttrs[i]].visible = $trigger[0].attributes[`data-${dataAttrs[i]}`].value === 'true' ? true : false;
              } else if (activeType === 'disabled') {
                items[dataAttrs[i]].disabled = $trigger[0].attributes[`data-${dataAttrs[i]}`].value === 'true' ? false : true;
              }
            }
          }
           return { items: items }
        },
        //*/
        trigger: 'left',
        hideOnSecondTrigger: true,
        callback: this.selectContextItem.bind(this),
        zIndex: 10
      };

      if ($__default["default"].contextMenu) {
        $__default["default"].contextMenu(config);
      }
    },
    // collapseMenu: function collapseMenu() {
    //   const header = this.$element.find('div.mtreemenu-header > .mtreemenu-title > .mtreemenu-icon');
    //   header.removeClass('fa-chevron-down').addClass('fa-chevron-right');
    //   header.parents('.mtreemenu-header').next('.mtreemenu-body').addClass('mtreemenu-hidden');
    //   // header.parents('.mtreemenu-container').addClass('mtreemenu-collapse');
    // },
    // expandeMenu: function expandeMenu() {
    //   const header = this.$element.find('div.mtreemenu-header > .mtreemenu-title > .mtreemenu-icon');
    //   header.removeClass('fa-chevron-right').addClass('fa-chevron-down');
    //   header.parents('.mtreemenu-header').next('.mtreemenu-body').removeClass('mtreemenu-hidden');
    //   // header.parents('.mtreemenu-container').removeClass('mtreemenu-collapse');
    // },
    // isMenuCollapse: function menuCollapse() {
    //   const header = this.$element.find('div.mtreemenu-header > .mtreemenu-title > .mtreemenu-icon');
    //   if (header.hasClass('fa-chevron-down')) {
    //     return false;
    //   }
    //   return true;
    // },
    // toggleIconMenu: function toggleIconMenu(el) {
    //   if ($(el).hasClass('fa-chevron-down')) {
    //     $(el).removeClass('fa-chevron-down').addClass('fa-chevron-right');
    //     $(el).parents('.mtreemenu-header').next('.mtreemenu-body').addClass('mtreemenu-hidden');
    //     $(el).parents('.mtreemenu-container').addClass('mtreemenu-collapse');
    //   } else if ($(el).hasClass('fa-chevron-right')) {
    //     $(el).removeClass('fa-chevron-right').addClass('fa-chevron-down');
    //     $(el).parents('.mtreemenu-header').next('.mtreemenu-body').removeClass('mtreemenu-hidden');
    //     $(el).parents('.mtreemenu-container').removeClass('mtreemenu-collapse');
    //   }
    // },
    toggleItemGroup: function toggleItemGroup(el) {
      if ($__default["default"](el).find('.mtreemenu-item-icon').hasClass('fa-chevron-down')) {
        $__default["default"](el).find('.mtreemenu-item-icon').removeClass('fa-chevron-down').addClass('fa-chevron-right');
        $__default["default"](el).siblings('.mtreemenu-content').addClass('mtreemenu-hidden');
        $__default["default"](el).attr('data-expand', false);
      } else if ($__default["default"](el).find('.mtreemenu-item-icon').hasClass('fa-chevron-right')) {
        $__default["default"](el).find('.mtreemenu-item-icon').removeClass('fa-chevron-right').addClass('fa-chevron-down');
        $__default["default"](el).siblings('.mtreemenu-content').removeClass('mtreemenu-hidden');
        $__default["default"](el).attr('data-expand', true);
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('collapseGroupItem', {
          id: $__default["default"](el).parent('.mtreemenu-item-group').attr('id'),
          type: $__default["default"](el).parent('.mtreemenu-item-group').attr('data-type'),
          title: $__default["default"](el).parent('.mtreemenu-item-group').attr('data-title'),
          userinfo: $__default["default"](el).parent('.mtreemenu-item-group').attr('data-userinfo'),
          expand: $__default["default"](el).attr('data-expand') === 'true' ? true : false
        });
      }
    },
    selectIconMenu: function selectIconMenu(el) {
      var id = $__default["default"](el).attr('id');
      var type = $__default["default"](el).attr('data-type');
      var title = $__default["default"](el).attr('data-menu');

      if (type === 'filter') {
        if ($__default["default"]('#' + id + '-input').parent().css('display') === 'none') {
          $__default["default"]('#' + id + '-input').parent().css('display', '');
          $__default["default"]('#' + id + '-input').trigger('focus');
        } else {
          $__default["default"]('#' + id + '-input').parent().css('display', 'none');
          $__default["default"]('#' + id + '-input').val('').trigger('input');
        }
      }

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('selectmenu', Object.assign({
          id: id,
          type: type,
          title: title
        }, type === 'sort' ? {
          orderBy: $__default["default"](el).attr('data-orderby')
        } : ''));
      } else {
        if (this.$element[0].fireEvent) {
          this.$element[0].fireEvent('selectmenu');
        } else {
          var evObj = new CustomEvent('selectmenu', {
            detail: Object.assign({
              id: id,
              type: type,
              title: title
            }, type === 'sort' ? {
              orderBy: $__default["default"](el).attr('data-orderby')
            } : '')
          });
          this.$element[0].dispatchEvent(evObj);
        }
      }
    },
    selectItem: function selectItem(el) {
      var selectable = $__default["default"](el.currentTarget).attr('data-select') === 'true' ? true : false; // let selectable = $('#' + this.uiid).children().attr('data-select') === 'true' ? true : false;

      var id = '';
      var title = '';
      var userinfo = '';

      if ($__default["default"](el.target).hasClass('fa') || $__default["default"](el.target).hasClass('mtreemenu-item-btn')) {
        return;
      }

      if (selectable && $__default["default"](el.currentTarget).hasClass('mtreemenu-item')) {
        $__default["default"]('.' + this.uiid + '-mtreemenu-item.active').removeClass('active');
        $__default["default"](el.currentTarget).addClass('active');
        id = $__default["default"](el.currentTarget).attr('id');
        title = $__default["default"](el.currentTarget).attr('data-title');
        userinfo = $__default["default"](el.currentTarget).attr('data-userinfo');

        if (this.options.onAction && typeof this.options.onAction === 'function') {
          this.options.onAction('selectitem', {
            id: id,
            type: 'select',
            title: title,
            userinfo: userinfo
          });
        } else {
          if (this.$element[0].fireEvent) {
            this.$element[0].fireEvent('selectitem');
          } else {
            var evObj = new CustomEvent('selectitem', {
              detail: {
                id: id,
                type: 'select',
                title: title,
                userinfo: userinfo
              }
            });
            this.$element[0].dispatchEvent(evObj);
          }
        }
      }
    },
    selectContextItem: function selectContextItem(key, options) {
      var id = $__default["default"](options.$trigger).attr('data-item');
      var title = $__default["default"](options.$trigger).attr('data-title');
      var userinfo = $__default["default"]("#".concat(id)).attr('data-userinfo'); // $(options.$trigger).attr('data-userinfo');

      if (this.options.onAction && typeof this.options.onAction === 'function') {
        this.options.onAction('selectcontext', _defineProperty({
          id: id,
          type: key,
          title: title,
          userinfo: userinfo
        }, "userinfo", userinfo));
      } else {
        if (this.$element[0].fireEvent) {
          this.$element[0].fireEvent('selectcontext');
        } else {
          var evObj = new CustomEvent('selectcontext', {
            detail: _defineProperty({
              id: id,
              type: key,
              title: title,
              userinfo: userinfo
            }, "userinfo", userinfo)
          });
          this.$element[0].dispatchEvent(evObj);
        }
      }
    },
    toggleFilterItem: function toggleFilterItem() {
      var id = "".concat(this.$element.attr('id'), "-filter");

      if ($__default["default"]('#' + id + '-input').parent().css('display') === 'none') {
        $__default["default"]('#' + id + '-input').parent().css('display', '');
        $__default["default"]('#' + id + '-input').val('').trigger('focus');
      } else {
        $__default["default"]('#' + id + '-input').parent().css('display', 'none');
        $__default["default"]('#' + id + '-input').val('').trigger('input');
      }
    },
    filterItem: function filterItem(el) {
      var id = el.target.id;
      var filter_value = $__default["default"]("#".concat(id)).val();
      var menu_id = $__default["default"]("#".concat(id)).attr('data-menu');
      var title = $__default["default"]("#".concat(id)).attr('data-filter_title') === 'true' ? true : false;
      $__default["default"](el.target).siblings('.mtreemenu-filter-clear-btn').toggle(filter_value ? true : false);
      $__default["default"]("#".concat(menu_id, " .mtreemenu-item")).each(function (e) {
        var item_value = $__default["default"](this).find('.mtreemenu-item-title').html() || '';

        if (title) {
          $__default["default"](this).parents('.mtreemenu-item-group').css('display', '');
        } else {
          $__default["default"](this).parents().find('.mtreemenu-item-group > .mtreemenu-item-name').css('display', 'none');
          $__default["default"]('.mtreemenu-content').css('margin-left', '0');
        }

        if (item_value.toLowerCase().indexOf(filter_value.toLowerCase()) >= 0) {
          $__default["default"](this).css('display', '');
        } else {
          $__default["default"](this).css('display', 'none');
        }
      });

      if (title) {
        if (!filter_value) {
          $__default["default"](el.target).trigger('focus');
          $__default["default"]("#".concat(menu_id, " .mtreemenu-item-group")).each(function (e) {
            $__default["default"](this).css('display', '');
          });
        } else {
          $__default["default"]("#".concat(menu_id, " .mtreemenu-item-group")).each(function (e) {
            var item_value = $__default["default"](this).find('.mtreemenu-item-title').html() || '';

            if (item_value.toLowerCase().indexOf(filter_value.toLowerCase()) >= 0) {
              $__default["default"](this).css('display', '');
            } else {
              var hidden_num = 0;
              var itemElements = $__default["default"](this).find('.mtreemenu-item');
              itemElements.each(function () {
                if ($__default["default"](this).css('display') === 'none') {
                  hidden_num += 1;
                }
              });
              $__default["default"](this).css('display', itemElements.length === hidden_num ? 'none' : '');
            }
          });
        }
      } else {
        if (!filter_value) {
          $__default["default"](el.target).trigger('focus');
          $__default["default"](el.target).parent().siblings('ul').find('.mtreemenu-item-group .mtreemenu-item-name').css('display', '');
          $__default["default"]('.mtreemenu-content').css('margin-left', '');
        }
      }
    },
    renameItem: function renameItem(id, new_title, userinfo) {
      if ($__default["default"]("#".concat(id)).length < 1) {
        return;
      } // rename item relative data info


      $__default["default"]("#".concat(id)).attr('data-title', new_title);
      $__default["default"]("#".concat(id)).find('.mtreemenu-item-title:first').html(new_title);
      $__default["default"]("#".concat(id)).find('.mtreemenu-item-btn:first').attr('data-title', new_title);

      if (userinfo) {
        var ori_info = $__default["default"]("#".concat(id)).attr('data-userinfo');

        for (var i = 0, len = this.options.item.length; i < len; i++) {
          if (this.updateItemUserInfo(this.options.item[i], id, userinfo)) {
            break;
          }
        }

        $__default["default"]("#".concat(id)).attr('data-userinfo', userinfo);

        if ($__default["default"]("#".concat(id)).attr('data-type') == 'branch') {
          var elems = $__default["default"]("#".concat(id)).find('li');

          for (var _i5 = 0, _len5 = elems.length; _i5 < _len5; _i5++) {
            var info = $__default["default"](elems[_i5]).attr('data-userinfo');
            info = info.replace(ori_info, userinfo);
            $__default["default"](elems[_i5]).attr('data-userinfo', info);
            var elemid = $__default["default"](elems[_i5]).attr('id');

            for (var w = 0, ln = this.options.item.length; w < ln; w++) {
              if (this.updateItemUserInfo(this.options.item[w], elemid, info)) {
                break;
              }
            }
          }
        }
      } // update options data


      for (var _i6 = 0, _len6 = this.options.item.length; _i6 < _len6; _i6++) {
        if (this.updateItemLabel(this.options.item[_i6], id, new_title)) {
          break;
        }
      }
    },
    updateItemLabel: function updateItemLabel(item, id, label) {
      if (item && item.id === id) {
        item.label = label;
        return true;
      } else if (item && item.subitems && item.subitems instanceof Array) {
        for (var i = 0, len = item.subitems.length; i < len; i++) {
          this.updateItemLabel(item.subitems[i], id, label);
        }
      }

      return false;
    },
    updateItemUserInfo: function updateItemUserInfo(item, id, userinfo) {
      if (item && item.id === id) {
        item.userinfo = userinfo;
        return true;
      } else if (item && item.subitems && item.subitems instanceof Array) {
        for (var i = 0, len = item.subitems.length; i < len; i++) {
          this.updateItemUserInfo(item.subitems[i], id, userinfo);
        }
      }

      return false;
    },
    deleteItem: function deleteItem(id) {
      var keepBranch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if ($__default["default"]("#".concat(id)).length < 1) {
        return;
      } // remove item from DOM


      var type = $__default["default"]("#".concat(id)).attr('data-type');

      if (type === 'item') {
        $__default["default"]("#".concat(id)).remove();
      } else if (type === 'branch') {
        var branch_content = $__default["default"]("#".concat(id)).find('.mtreemenu-content');

        if (branch_content.length > 0) {
          $__default["default"](branch_content[0]).remove();
        }

        if (!keepBranch) {
          $__default["default"]("#".concat(id)).remove();
        }
      }

      for (var i = 0, len = this.options.item.length; i < len; i++) {
        if (this.options.item[i].id === id) {
          if (this.options.item[i].type === 'item' || this.options.item[i].type === 'branch' && !keepBranch) {
            this.options.item.splice(i, 1);
            return true;
          }

          this.options.item[i].subitems.length = 0;
          return true;
        }
      }

      for (var _i7 = 0, _len7 = this.options.item.length; _i7 < _len7; _i7++) {
        if (this.options.item[_i7].type === 'branch') {
          if (this.removeSubitem(this.options.item[_i7], id, keepBranch)) {
            return true;
          }
        }
      }

      return false;
    },
    removeSubitem: function removeSubitem(item, id, keepBranch) {
      if (item && item.subitems && item.subitems instanceof Array) {
        for (var i = 0, len = item.subitems.length; i < len; i++) {
          if (item.subitems[i].id == id) {
            if (item.subitems[i].type === 'item' || item.subitems[i].type === 'branch' && !keepBranch) {
              item.subitems.splice(i, 1);
              return true;
            }

            if (item.subitems[i].subitems) {
              item.subitems[i].subitems.length = 0;
            }

            return true;
          }
        }

        for (var _i8 = 0, _len8 = item.subitems.length; _i8 < _len8; _i8++) {
          if (item.subitems[_i8].type === 'branch') {
            if (this.removeSubitem(item.subitems[_i8], id, keepBranch)) {
              return true;
            }
          }
        }
      }

      return false;
    },
    appendItem: function appendItem(id, appendItems) {
      if (!appendItems || !(appendItems instanceof Array)) {
        return;
      }

      var info = {
        draggable: this.options.draggable,
        dragstart: this.options.dragstart,
        srcpath: this.options.srcpath
      };
      var txt = '';

      for (var i = 0, len = appendItems.length; i < len; i++) {
        txt += this.menuItemTxt(appendItems[i], info);
      }

      if (!txt) {
        return false;
      }

      if ($__default["default"]("#".concat(id)).children('.mtreemenu-content').length < 1) {
        $__default["default"]("#".concat(id)).append('<ul class="mtreemenu-content">' + txt + '</ul>');
      } else {
        $__default["default"]("#".concat(id)).children('.mtreemenu-content').append(txt);
      } // update options data


      for (var _i9 = 0, _len9 = this.options.item.length; _i9 < _len9; _i9++) {
        if (this.options.item[_i9].type === 'branch' && this.options.item[_i9].subitems) {
          if (this.options.item[_i9].id === id) {
            for (var w = 0, ln = appendItems.length; w < ln; w++) {
              this.options.item[_i9].subitems.push(appendItems[w]);
            }

            break;
          }

          if (this.appendSubitem(this.options.item[_i9], id, appendItems)) {
            break;
          }
        }
      }

      for (var _i10 = 0, _len10 = appendItems.length; _i10 < _len10; _i10++) {
        this.generateContextMenu(appendItems[_i10], this.options.activeType);
      }

      return true;
    },
    appendSubitem: function appendSubitem(item, id, appendItems) {
      if (item && item.subitems && item.subitems instanceof Array) ;

      for (var i = 0, len = item.subitems.length; i < len; i++) {
        if (item.subitems[i].type === 'branch' && item.subitems[i].subitems) {
          if (item.subitems[i].id === id) {
            for (var w = 0, ln = appendItems.length; w < ln; w++) {
              item.subitems[i].subitems.push(appendItems[w]);
            }

            return true;
          }

          if (this.appendSubitem(item.subitems[i], id, appendItems)) {
            return true;
          }
        }
      }

      return false;
    },
    getSubitemCount: function getSubitemCount(id) {
      return $__default["default"]("#".concat(id, " li")).length;
    },
    spin: function spin(show) {
      $__default["default"]("#".concat(this.uiid, "-spin")).removeClass('mtreemenu-loader').addClass(show ? 'mtreemenu-loader' : '');
    }
  };

  exports.colSelector = colSelector;
  exports.mExploreMenu = mExplorerMenu;
  exports.mIconMenu = mIconMenu;
  exports.mInput = mInput;
  exports.mInputTextArea = mInputTextArea;
  exports.mOperator = mOperator;
  exports.mSelector = mSelector;
  exports.mSlider = mSlider;
  exports.mSliders = mSliders;
  exports.mTextInput = mTextInput;
  exports.mTextarea = mTextarea;
  exports.mTreeMenu = mTreeMenu;
  exports.mUnitMenu = mUnitMenu;
  exports.pairSelector = pairSelector;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=wx.js.map
