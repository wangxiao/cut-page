(function() {
    var jmaths, jpaths;
    (function() {
        var define = function(factory) {
            jmaths = factory();
        };
        define.amd = true;
        (function(exportName) {
  'use strict';
  var exports = exports || {};
  /**
   * 数学函数收集
   *
   * @author 王集鹄(wangjihu,http://weibo.com/zswang)
   * @version 2015-04-12
   */
  /**
   * 计算点到点之间的距离
   *
   * @param {Array[number,number]} a 坐标1
   * @param {Array[number,number]} b 坐标2
   * @return {number} 返回点与点间的距离
   */
  function pointToPoint(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
  }
  exports.pointToPoint = pointToPoint;
  /**
   * 计算点的角度
   *
   * @param {Array} origin 圆心坐标
   * @param {Array} point 点坐标
   * @return {number} 返回角度，单位：弧度
   */
  function pointToAngle(origin, point) {
    return Math.atan2(point[1] - origin[1], point[0] - origin[0]);
  }
  exports.pointToAngle = pointToAngle;
  /**
   * 旋转一个点坐标
   *
   * @param {Array} point 目标坐标
   * @param {Array} center 中心点
   * @param {number} angle 选择角度，单位:弧度
   * @return {Array} 返回旋转后的坐标
   */
  function rotatePoint(point, center, angle) {
    var radius = pointToPoint(center, point); // 半径
    angle = pointToAngle(center, point) + angle; // 角度
    return [
      center[0] + Math.cos(angle) * radius,
      center[1] + Math.sin(angle) * radius
    ];
  }
  exports.rotatePoint = rotatePoint;
  /**
   * 贝赛尔公式，支持多维数组
   *
   * @param{Array[Array[number, ...],...]} items 每个参考点
   * @param{number} rate 比率
   * @return{number|Array[number, ...]} 返回
   */
  function bezier(items, rate) {
    if (!items || !items.length) {
      return;
    }
    var first = items[0],
      second = items[1];
    var level = first instanceof Array ? first.length : 0; // 下标数,0为非数组
    var i;
    switch (items.length) {
      case 1:
        return level ? first.slice() : first; // 数组需要克隆，非数组直接返回
      case 2:
        if (level) { // 非数组
          var result = [];
          for (i = 0; i < level; i++) {
            result[i] = bezier([first[i], second[i]], rate);
          }
          return result;
        }
        return first + (second - first) * rate;
      default:
        var temp = [];
        for (i = 1; i < items.length; i++) {
          temp.push(bezier([items[i - 1], items[i]], rate));
        }
        return bezier(temp, rate);
    }
  }
  exports.bezier = bezier;
  /**
   * 将一条贝赛尔数组剪成两段
   *
   * @param {Array[Array[number, number],...]} items 贝赛尔每个参考点
   * @param {number} rate 比率
   * @return {Array[Array,Array]} 返回被裁剪后的两个贝赛尔数组
   */
  function cutBezier(items, rate) {
    if (!items || items.length < 2) {
      return;
    }
    var ta = [];
    var tb = [];
    var ra = [];
    var rb = [];
    for (var i = 0; i < items.length; i++) {
      ta.push(items[i]);
      ra.push(bezier(ta, rate));
      tb.unshift(items[items.length - i - 1]);
      rb.unshift(bezier(tb, rate));
    }
    return [ra, rb];
  }
  exports.cutBezier = cutBezier;
  /**
   * 计算点到线段的距离
   *
   * @param {Array[number,number]} point 点坐标
   * @param {Array[number,number]} a 线段坐标1
   * @param {Array[number,number]} b 线段坐标2
   * @return {number} 返回点到线段的距离
   */
  function pointToLine(point, a, b) {
    if (a[0] == b[0] && a[1] == b[1]) {
      return 0;
    }
    var t = ((a[0] - b[0]) * (a[0] - point[0]) + (a[1] - b[1]) * (a[1] - point[1])) /
      ((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
    return pointToPoint(point, bezier([a, b], Math.max(0, Math.min(1, t))));
  }
  exports.pointToLine = pointToLine;
  /**
   * 获取正负符号
   *
   * @param {number} x 数值
   * @return 返回x的符号
   */
  function sign(x) {
    return x === 0 ? 0 : (x < 0 ? -1 : 1);
  }
  exports.sign = sign;
  /**
   * 获取两条线段的交点
   *
   * @see http://www.kevlindev.com/gui/math/intersection/Intersection.js
   * @param {Array[number,number]} a 第一条线段坐标1
   * @param {Array[number,number]} b 第一条线段坐标2
   * @param {Array[number,number]} c 第二条线段坐标1
   * @param {Array[number,number]} d 第二条线段坐标2
   * @return {Array[number,number]} 返回两条线段的交点坐标
   */
  function doubleLineIntersect(a, b, c, d) {
    var ua_t = (d[0] - c[0]) * (a[1] - c[1]) - (d[1] - c[1]) * (a[0] - c[0]);
    var ub_t = (b[0] - a[0]) * (a[1] - c[1]) - (b[1] - a[1]) * (a[0] - c[0]);
    var u_b = (d[1] - c[1]) * (b[0] - a[0]) - (d[0] - c[0]) * (b[1] - a[1]);
    if (u_b !== 0) {
      var ua = ua_t / u_b;
      var ub = ub_t / u_b;
      if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        return [
          a[0] + ua * (b[0] - a[0]),
          a[1] + ua * (b[1] - a[1])
        ];
      }
    }
  }
  exports.doubleLineIntersect = doubleLineIntersect;
  /**
   * 计算点到多边形的距离
   *
   * @param {Array[number,number]} point
   * @param {Array[Array[number,number]]} polyline
   * @return {number} 返回距离
   */
  function pointToPolyline(point, polyline) {
    if (!point || !polyline || !polyline.length) {
      return;
    }
    var result = pointToPoint(point, polyline[0]);
    for (var i = 1, l = polyline.length; i < l; i++) {
      result = Math.min(result, pointToLine(point, polyline[i - 1], polyline[i]));
    }
    return result;
  }
  exports.pointToPolyline = pointToPolyline;
  /**
   * 判断点是否在多边形中
   *
   * @param {Array} p 点坐标
   * @param {Array} polygon 多边形坐标
   * @return {boolean} 返回点是否在多边形中
   */
  function pointInPolygon(p, polygon) {
    var cross = 0;
    for (var i = 0; i < polygon.length; i++) {
      var p1 = polygon[i];
      var p2 = polygon[(i + 1) % polygon.length];
      if (p1[1] === p2[1]) {
        continue;
      }
      if (p[1] < Math.min(p1[1], p2[1])) {
        continue;
      }
      if (p[1] >= Math.max(p1[1], p2[1])) {
        continue;
      }
      var x = (p[1] - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1]) + p1[0];
      if (x > p[0]) {
        cross++;
      }
    }
    return cross % 2 === 1;
  }
  exports.pointInPolygon = pointInPolygon;
  /**
   * 生成正多边形顶点
   *
   * @param {number} edges 边数
   * @param {number} x 中心坐标 x
   * @param {number} y 中心坐标 y
   * @param {number} radius 半径
   * @param {=number} starting 默认为 0
   * @return {Array} 返回正多边形顶点数组
   */
  function regularPolygon(edges, x, y, radius, starting) {
    var angle = starting || 0;
    var result = [];
    for (var i = 0; i < edges; i++) {
      var a = angle + i / edges * Math.PI * 2;
      var p = [x + Math.cos(a) * radius, y + Math.sin(a) * radius];
      result.push(p);
    }
    return result;
  }
  exports.regularPolygon = regularPolygon;
  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function() {
        return exports;
      });
    }
  }
  else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  }
  else {
    window[exportName] = exports;
  }
})('jmaths');
        var define = function(factory) {
            jpaths = factory();
        };
        define.amd = true;
        (function(exportName) {
  'use strict';
  var exports = exports || {};
  /**
   * jpaths
   *
   * @file 一个简单绘图库，兼容 svg、vml、canvas，路径只支持其交集。
   * @author 王集鹄(wangjihu,http://weibo.com/zswang)
   * @version 2015-04-11
   */
  /**
   * 是否 IE
   */
  var ie = document.all && document.attachEvent;
  /**
   * IE 放大的倍数，保证精度
   */
  var ieZoom = 1000;
  /*
   * 是否 IE9+
   */
  var ie9plus = ie && window.XMLHttpRequest && window.addEventListener && document.documentMode >= 9;
  /*
   * 渲染模式 'svg' | 'vml' | 'canvas'
   */
  var renderMode = !ie || ie9plus ? 'svg' : 'vml';
  /*
   * 容器列表，如果容器是一样的，则不用生成新的 svg 对象
   */
  var parentList = [];
  /**
   * 格式化函数
   *
   * @param {string} template 模板
   * @param {Object} json 数据项
   */
  function format(template, json) {
    return template.replace(/#\{(.*?)\}/g, function(all, key) {
      return json && (key in json) ? json[key] : "";
    });
  }
  /**
   * 解析路径字符串中的详情
   *
   * @param {string} path 路径表达式
   * @return {Array} 返回每个子路径
   */
  function parsePath(path) {
    var current = [0, 0];
    var movePos = [0, 0];
    var result = [];
    String(path).replace(
      /([mlcza])((\s*,?\s*([+-]?\d+(?:\.\d+)?)+)*)/gi,
      function(all, flag, params) {
        switch (flag) {
          case 'M':
          case 'L':
            var passing = false; // 是否已经处理过参数
            params.replace(
              /\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)/gi,
              function(all, x, y) {
                current = [+x, +y];
                result.push([flag === 'L' || passing ? 'L' : 'M', current]);
                passing = true;
                if (flag === 'M') {
                  movePos = current;
                }
              }
            );
            break;
          case 'C':
            params.replace(
              /\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)/gi,
              function(all, x1, y1, x2, y2, x, y) {
                current = [0, 0];
                result.push(['C', [+x1 + current[0], +y1 + current[1], +x2 + current[0], +y2 + current[1], +x + current[0], +y + current[1]]]);
                current = [+x + current[0], +y + current[1]];
              });
            break;
          case 'Z':
            result.push(['Z']);
            current = movePos;
            break;
        }
      }
    );
    return result;
  }
  /**
   * 矢量路径类
   *
   * @param {Object} options 配置
   * @param {string|Element} options.parent 容器
   * @param {string} options.fill 填充色
   * @param {number} options.fillOpacity 填充透明度
   * @param {string} options.stroke 描边色
   * @param {number} options.strokeOpacity 描边透明度
   * @param {number} options.strokeWidth 描边宽度
   * @param {string} options.path 路径
   */
  function Path(options) {
    options = options || {};
    if (typeof options.parent === 'string') {
      this.parent = document.getElementById(options.parent);
    } else {
      this.parent = options.parent || document.body;
    }
    this.fill = options.fill || 'none';
    this.fillOpacity = options.fillOpacity || options['fill-opacity'] || 1;
    this.stroke = options.stroke || 'black';
    this.strokeWidth = options.strokeWidth || options['stroke-width'] || 1;
    this.strokeOpacity = options.strokeOpacity || options['stroke-opacity'] || 1;
    this.path = options.path || 'M 0,0';
    // 处理相同的容器
    var parentInfo;
    for (var i = parentList.length - 1; i >= 0; i--) {
      var item = parentList[i];
      if (item.parent === this.parent) {
        parentInfo = item;
        break;
      }
    }
    if (/^canvas$/i.test(this.parent.tagName)) {
      renderMode = 'canvas';
      this.pathDetails = parsePath(this.path);
      this.repaint(true);
    }
    var div;
    switch (renderMode) {
      case 'canvas':
        this.canvas = this.parent;
        if (parentInfo) {
          this.canvasPaths = parentInfo.paths;
        } else {
          this.canvasPaths = [];
          parentList.push({
            parent: this.parent,
            paths: this.canvasPaths
          });
        }
        this.canvasPaths.push(this);
        this.repaint(true);
        break;
      case 'svg':
        div = document.createElement('div');
        div.innerHTML = format( /*#*/ "\n<svg width=100% height=100% xmlns=\"http://www.w3.org/2000/svg\">\n  <path fill=\"#{fill}\"\n    fill-rule=\"evenodd\"\n    stroke-linejoin=\"round\"\n    fill-opacity=\"#{fillOpacity}\"\n    stroke=\"#{stroke}\"\n    stroke-opacity=\"#{strokeOpacity}\"\n    stroke-width=\"#{strokeWidth}\" d=\"#{path}\"\n</svg>\n", this);
        this.elementPath = div.lastChild.lastChild;
        if (parentInfo) {
          this.element = parentInfo.element;
          this.element.appendChild(this.elementPath);
        } else {
          this.element = div.lastChild;
          parentList.push({
            parent: this.parent,
            element: this.element
          });
          this.parent.appendChild(this.element);
        }
        break;
      case 'vml':
        div = document.createElement('div');
        this.filled = this.fill == 'none' ? 'f' : 't';
        this.stroked = this.stroke == 'none' ? 'f' : 't';
        this.zoom = ieZoom;
        div.innerHTML = format( /*#*/ "\n<v:shape class=\"jpaths_path_shape jpaths_vml\"\n  coordsize=\"#{zoom},#{zoom}\"\n  stroked=\"#{stroked}\"\n  filled=\"#{filled}\"\n  path=\"#{path}\">\n  <v:stroke class=\"jpaths_vml\"\n    opacity=\"#{strokeOpacity}\"\n    color=\"#{stroke}\"\n    weight=\"#{strokeWidth}\">\n  </v:stroke>\n  <v:fill class=\"jpaths_vml\"\n    opacity=\"#{fillOpacity}\"\n    color=\"#{fill}\">\n  </v:fill>\n</v:shape>\n", this);
        this.elementPath = div.lastChild;
        if (parentInfo) {
          this.element = parentInfo.element;
          this.element.appendChild(this.elementPath);
        } else {
          this.element = div;
          div.className = 'jpaths_path_panel';
          parentList.push({
            parent: this.parent,
            element: this.element
          });
          this.parent.appendChild(this.element);
        }
        this.elementFill = this.elementPath.getElementsByTagName('fill')[0];
        this.elementStroke = this.elementPath.getElementsByTagName('stroke')[0];
        break;
    }
  }
  /**
   * 绘制路径
   *
   * @params {boolean} all 是否全部更新
   * @see http://code.google.com/p/canvg/
   */
  Path.prototype.repaint = function(all) {
    if (!this.canvas) {
      return;
    }
    var context = this.canvas.getContext('2d');
    if (!context) {
      return;
    }
    var i;
    if (all) {
      context.save();
      context.fillStyle = 'transparent';
      context.globalCompositeOperation = 'copy'; // 彻底清除
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      context.restore();
      for (i = 0; i < this.canvasPaths.length; i++) {
        this.canvasPaths[i].repaint();
      }
      return;
    }
    if (!this.pathDetails) {
      return;
    }
    context.save();
    context.beginPath();
    var current = [0, 0]; // 当前坐标
    var movePos = [0, 0]; // 位移坐标
    for (i = 0; i < this.pathDetails.length; i++) {
      var item = this.pathDetails[i];
      switch (item[0]) {
        case 'Z':
          context.closePath();
          current = movePos;
          break;
        case 'C':
          context.bezierCurveTo(
            item[1][0],
            item[1][1],
            item[1][2],
            item[1][3],
            item[1][4],
            item[1][5]
          );
          current = [item[1][2], item[1][3]];
          break;
        case 'L':
          current = [item[1][0], item[1][1]];
          context.lineTo(item[1][0], item[1][1]);
          break;
        case 'M':
          current = [item[1][0], item[1][1]];
          movePos = [item[1][0], item[1][1]];
          context.moveTo(item[1][0], item[1][1]);
          break;
      }
    }
    if (this.stroke !== 'none') {
      context.strokeStyle = this.stroke;
      context.stroke();
    }
    context.lineWidth = this.strokeWidth;
    if (this.fill !== 'none') {
      context.fillStyle = this.fill;
      context.fill();
    }
    context.restore();
  };
  /**
   * 设置或获取属性
   *
   * @param {Object} values
   * @param {boolean} batch 是否正在批处理
   * @or
   * @param {string} name
   * @param {string} value
   * @param {boolean} batch 是否正在批处理
   * @or
   * @param {string} name
   * @return {Any} 返回该属性值
   */
  Path.prototype.attr = function(name, value) {
    if (this.freed) {
      return;
    }
    if (arguments.length === 1) {
      if (typeof name === 'string') {
        if (name === 'stroke-width') {
          name = 'strokeWidth';
        }
        return this[name];
      }
      if (typeof name === 'object') {
        for (var p in name) {
          this.attr(p, name[p], true);
        }
        return this;
      }
    } else if (arguments.length > 1) {
      switch (name) {
        case 'path':
          if (this.path === value) {
            break;
          }
          this.path = value;
          switch (renderMode) {
            case 'svg':
              this.elementPath.setAttribute('d', value || 'M 0,0');
              break;
            case 'vml':
              this.elementPath.path = String(value || 'M 0,0')
                .replace(/\d+(\.\d+)?/g, function(number) { // 清理小数
                  return parseInt(number * ieZoom);
                })
                .replace(/z/ig, 'X'); // 处理闭合
              break;
            case 'canvas':
              this.pathDetails = parsePath(this.path);
              this.repaint(true);
              break;
          }
          break;
        case 'fill':
          if (this.fill === value) {
            break;
          }
          this.fill = value;
          switch (renderMode) {
            case 'svg':
              this.elementPath.setAttribute('fill', value);
              break;
            case 'vml':
              this.elementPath.Filled = this.filled = this.fill === 'none' ? 'f' : 't';
              this.elementFill.Color = value;
              break;
            case 'canvas':
              if (batch) {
                this.repaint(true);
              }
              break;
          }
          break;
        case 'stroke':
          if (this.stroke === value) {
            break;
          }
          this.stroke = value;
          switch (renderMode) {
            case 'svg':
              this.elementPath.setAttribute('stroke', value);
              break;
            case 'vml':
              this.elementPath.Stroked = this.stroked = this.stroke === 'none' ? 'f' : 't';
              this.elementStroke.Color = value;
              break;
            case 'canvas':
              if (batch) {
                this.repaint(true);
              }
              break;
          }
          break;
        case 'fillOpacity':
        case 'fill-opacity':
          if (this.fillOpacity === value) {
            break;
          }
          this.fillOpacity = value;
          switch (renderMode) {
            case 'svg':
              this.elementPath.setAttribute('fill-opacity', value);
              break;
            case 'vml':
              this.elementFill.Opacity = Math.min(Math.max(0, value), 1);
              break;
            case 'canvas':
              if (batch) {
                this.repaint(true);
              }
              break;
          }
          break;
        case 'strokeOpacity':
        case 'stroke-opacity':
          if (this.strokeOpacity === value) {
            break;
          }
          this.strokeOpacity = value;
          switch (renderMode) {
            case 'svg':
              this.elementPath.setAttribute('stroke-opacity', value);
              break;
            case 'vml':
              this.elementStroke.Opacity = Math.min(Math.max(0, value), 1);
              break;
            case 'canvas':
              if (batch) {
                this.repaint(true);
              }
              break;
          }
          break;
        case 'strokeWidth':
        case 'stroke-width':
          if (this.strokeWidth == value) {
            break;
          }
          this.strokeWidth = value;
          switch (renderMode) {
            case 'svg':
              this.elementPath.setAttribute('stroke-width', value);
              break;
            case 'vml':
              this.elementStroke.weight = value;
              break;
            case 'canvas':
              if (batch) {
                this.repaint(true);
              }
              break;
          }
          break;
      }
      return this;
    }
  };
  /**
   * 释放资源
   */
  Path.prototype.free = function() {
    if (this.freed) {
      return;
    }
    this.freed = true;
    switch (renderMode) {
      case 'svg':
      case 'vml':
        this.elementPath.parentNode.removeChild(this.elementPath);
        this.elementPath = null;
        break;
      case 'canvas':
        for (var i = 0; i < this.canvasPaths.length; i++) {
          if (this.canvasPaths[i] === this) {
            this.canvasPaths.splice(i, 1);
            this.repaint(true);
            break;
          }
        }
        break;
    }
  };
  function create(options) {
    return new Path(options);
  }
  if (renderMode === 'vml') {
    document.createStyleSheet().cssText = format( /*#*/ "\n.#{this}_vml {\n  behavior: url(#default#VML);\n}\n.#{this}_path_shape {\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: 0;\n  left: 0;\n  top: 0;\n  position: absolute;\n}\n.#{this}_path_panel {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  padding: 0;\n  margin: 0;\n  position: relative;\n}\n", exportName);
  }
  exports.create = create;
  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function() {
        return exports;
      });
    }
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    window[exportName] = exports;
  }
})('jpaths');
    })();
    (function(exportName) {
    'use strict';
    var exports = exports || {};
    /**
     * 比较两个多边形的相似度
     *
     * @param {Array} a 多边形 1 // [[1, 2], [3, 4], [4, 5]]
     * @param {Array} b 多边形 2 // [[1, 2], [3, 4], [4, 7]]
     * @return {number} 返回两个多边形的相似度，范围：0~1，为 1 表示完全相等
     */
    function diffPolygon(a, b) {
        var canvas1 = document.createElement("canvas");
        var canvas2 = document.createElement("canvas");
        var minX = Infinity;
        var minY = Infinity;
        var maxX = 0;
        var maxY = 0;
        var point;
        var i;
        for (i = 0; i < a.length; i++) {
            point = a[i];
            minX = (minX > point[0]) ? point[0] : minX;
            minY = (minY > point[1]) ? point[1] : minY;
            maxX = (maxX < point[0]) ? point[0] : maxX;
            maxY = (maxY < point[1]) ? point[1] : maxY;
        }
        for (i = 0; i < b.length; i++) {
            point = b[i];
            minX = (minX > point[0]) ? point[0] : minX;
            minY = (minY > point[1]) ? point[1] : minY;
            maxX = (maxX < point[0]) ? point[0] : maxX;
            maxY = (maxY < point[1]) ? point[1] : maxY;
        }
        var width = maxX - minX + 1;
        var height = maxY - minY + 1;
        canvas1.width = width;
        canvas1.height = height;
        canvas2.width = width;
        canvas2.height = height;
        drawPolygon(canvas1, a, minX, minY);
        drawPolygon(canvas2, b, minX, minY);
        var similarity = 1 - calculateDiff(canvas1, canvas2, width, height);
        return similarity;
    }
    exports.diffPolygon = diffPolygon;
    /**
     * 获得完整剪纸的多边形
     *
     * @param {Array} polygon 基础多边线 // [[x, y], [x1, y1], ...]
     * @param {number} edges 边数 // 5
     * @param {number} center 中心点
     * @return {Array} 选择和映射后的多边形数组 [[[x, y], [x1, y1], ...], [[x, y], [x1, y1], ...] ...]
     */
    function getCutPolygons(edges, center, polygon) {
        //计算与之对称的多边形的端点集
        var newPolygon = [];
        var deltaAngle = 360 / (4 * edges);
        var i;
        var arc;
        for (i = 0; i < polygon.length; i++) {
            var m = polygon[i][0];
            var n = polygon[i][1];
            var angle;
            if (n === center[1]) {
                angle = 90;
            }
            else {
                angle = Math.atan(Math.abs(m - center[0]) / Math.abs(n - center[1])) * 180 / Math.PI;
            }
            if (m > center[0]) {
                angle = deltaAngle - angle;
            }
            else {
                angle = deltaAngle + angle;
            }
            arc = 2 * angle * Math.PI / 180;
            newPolygon.push(jmaths.rotatePoint(polygon[i], center, arc));
        }
        //将两个相互对称的端点集旋转相应的角度
        var polygons = [];
        polygons.push(polygon);
        polygons.push(newPolygon);
        for (i = 1; i < edges; i++) {
            arc = (i * 360 / edges) * Math.PI / 180;
            var rPolygon = [];
            var rNewPolygon = [];
            for (var j = 0; j < polygon.length; j++) {
                rPolygon.push(jmaths.rotatePoint(polygon[j], center, arc));
                rNewPolygon.push(jmaths.rotatePoint(newPolygon[j], center, arc));
            }
            polygons.push(rPolygon);
            polygons.push(rNewPolygon);
        }
        return polygons;
    }
    exports.getCutPolygons = getCutPolygons;
    /**
     * 在canvas上根据多边形端点数组绘制多边形
     * 要求端点数组有序
     *
     * @param {canvas DOM element} canvas 画布元素
     * @param {Array} vertex 多边形端点数组 // [[1, 2], [3, 4], [4, 7]]
     * @param {number} offsetX x轴偏移量，默认为0
     * @param {number} offsetY y轴偏移量，默认为0
     * @param {string} color 多边形填充色，默认为黑色
     */
    function drawPolygon(canvas, vertex, offsetX, offsetY, color) {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        var context = canvas.getContext('2d');
        context.beginPath();
        var beginX;
        var beginY;
        for (var i = 0; i < vertex.length; i++) {
            var point = vertex[i];
            var x = point[0] - offsetX;
            var y = point[1] - offsetY;
            if (i === 0) {
                beginX = x;
                beginY = y;
                context.moveTo(x, y);
            }
            else {
                context.lineTo(x, y);
            }
        }
        context.lineTo(beginX, beginY);
        context.closePath();
        if (color) {
            context.fillStyle = color;
        }
        context.fill();
    }
    /**
     * 比较两个canvas黑色多边形的不同度
     *
     * @param {canvas DOM element} canvas1 要比较的第一个画布元素 1
     * @param {canvas DOM element} canvas2 要比较的第二个画布元素 2
     * @param {number} width 要比较的绘制区域的宽 3
     * @param {number} height 要比较的绘制区域的高 4
     * @return {number} 返回两个canvas黑色多边形的不同度，范围：0~1，为 1 表示完全不同
     */
    function calculateDiff(canvas1, canvas2, width, height) {
        var context1 = canvas1.getContext('2d');
        var context2 = canvas2.getContext('2d');
        var imgData1 = context1.getImageData(0, 0, width, height);
        var imgData2 = context2.getImageData(0, 0, width, height);
        var diffPixelNum = 0;
        var baseNum = 0;
        for (var i = 0; i < imgData1.data.length; i += 4) {
            baseNum += imgData1.data[i + 3] / 255;
            baseNum += imgData2.data[i + 3] / 255;
            var pixelDiff = Math.abs(imgData1.data[i + 3] - imgData2.data[i + 3]) / 255;
            diffPixelNum += pixelDiff;
        }
        return diffPixelNum / baseNum;
    }
    /**
     * 多边形掉落效果
     *
     * @param {Array} vertex 多边形端点集
     * @param {string} color 多边形填充色
     */
    function polygonDrop(vertex, color, container) {
        //绘制多边形
        var canvas = document.createElement("canvas");
        var minX = Infinity;
        var minY = Infinity;
        var maxX = 0;
        var maxY = 0;
        for (var i = 0; i < vertex.length; i++) {
            var point = vertex[i];
            minX = (minX > point[0]) ? point[0] : minX;
            minY = (minY > point[1]) ? point[1] : minY;
            maxX = (maxX < point[0]) ? point[0] : maxX;
            maxY = (maxY < point[1]) ? point[1] : maxY;
        }
        var width = maxX - minX + 1;
        var height = maxY - minY + 1;
        canvas.width = width;
        canvas.height = height;
        drawPolygon(canvas, vertex, minX, minY, color);
        //添加掉落效果
        var paperWrap = document.createElement('div');
        paperWrap.className += 'paper-wrap ';
        paperWrap.className += 'fall ';
        var body = document.getElementsByTagName('body')[0];
        if (container) {
            body = container;
        }
        var rect = document.body.getBoundingClientRect();
        var top = rect.top + minY;
        var left = rect.left + minX;
        paperWrap.style.width = width + "px";
        paperWrap.style.height = height + "px";
        paperWrap.style.top = top + "px";
        paperWrap.style.left = left + "px";
        var area = width * height;
        if (area < 1600) {
            var innerWrap = document.createElement('div');
            innerWrap.className += 'rotate ';
            innerWrap.appendChild(canvas);
            paperWrap.appendChild(innerWrap);
        } else if (area > 10000) {
            var innerWrap = document.createElement('div');
            innerWrap.className += 'sway3d ';
            innerWrap.appendChild(canvas);
            paperWrap.appendChild(innerWrap);
        } else {
            var innerWrap = document.createElement('div');
            innerWrap.className += 'rotate-slow ';
            innerWrap.appendChild(canvas);
            var outerWrap = document.createElement('div');
            outerWrap.className += 'sway2d ';
            outerWrap.appendChild(innerWrap);
            paperWrap.appendChild(outerWrap);
        }
        body.appendChild(paperWrap);
        setTimeout(function () {
            body.removeChild(paperWrap);
        }, 2800);
    }
    exports.polygonDrop = polygonDrop;
    /**
     * 格式化函数
     *
     * @param {string} template 模板
     * @param {Object} json 数据项
     */
    function format(template, json) {
        return template.replace(/#\{(.*?)\}/g, function(all, key) {
            return json && (key in json) ? json[key] : "";
        });
    }
    exports.format = format;
    /**
     * 坐标系转换
     *
     * @param {Array} polygon 多边形
     * @param {Object} fromBase 源坐标信息
     * @param {Array} fromBase.center 中心坐标
     * @param {Array} fromBase.radius 中心坐标
     * @param {Object} toBase 源坐标信息
     * @param {Array} toBase.center 中心坐标
     * @param {Array} toBase.radius 中心坐标
     * @return {Array} 返回转换后的多边形
     */
    function coordinateTransformation(polygon, fromBase, toBase) {
        var result = [];
        console.log(JSON.stringify(polygon));
        polygon.forEach(function(item) {
            var point = item.slice();
            var t = fromBase.radius / toBase.radius;
            var d = jmaths.pointToPoint(fromBase.center, item) / t;
            var a = jmaths.pointToAngle(fromBase.center, item);
            point[0] = toBase.center[0] + Math.cos(a) * d;
            point[1] = toBase.center[1] + Math.sin(a) * d;
            result.push(point);
        });
        console.log(JSON.stringify(result));
        return result;
    }
    exports.coordinateTransformation = coordinateTransformation;
    /**
     * 创建剪纸对象
     *
     * @param {number} edges 边数 4 - 7
     * @param {=Array} center 中心坐标
     * @param {=number} radius 半径
     * @return {Object} 返回剪纸对象
     */
    function createPaper(edges, center, radius) {
        var instance = {};
        center = center || [0, 0];
        radius = radius || 100;
        instance.getCenter = function() {
            return center;
        };
        instance.getRadius = function() {
            return radius;
        };
        /**
         * 作为模型的路径
         */
        // flag => synechiaA: 粘黏 A, synechiaB: 粘黏 B, boundary: 边界, scar: 痕迹
        // [[x0, y0], [x1, y1], flag]]
        var modelPath = [];
        /**
         * 裁剪的路径
         *
         * @type {Array}
         */
        var cutModelPath = [];
        // init
        var _allPolygon =
            jmaths.regularPolygon(edges * 2, center[0], center[1], radius, -Math.PI * 0.5 - Math.PI / edges / 2);
        // ======================
        // start           next
        //  +-------------+
        //   X           X
        //    X         X  
        //     X       X
        //      X     X
        //       X   X
        //        X X
        //         X
        //       center
        // =======================
        function rebuild() {
            var start = _allPolygon[0];
            var next = _allPolygon[1];
            modelPath = [];
            cutModelPath = [];
            modelPath.push([start, center, 'synechiaA']);
            modelPath.push([center, next, 'synechiaB']);
            modelPath.push([next, start, 'boundary']);
        }
        instance.rebuild = rebuild;
        rebuild();
        /**
         * 获取完整绘制路径
         *
         * @return {string} 返回完整绘制路径
         */
        function getFullPath() {
            var m = jmaths.regularPolygon(edges * 2, x, y, radius, -Math.PI * 0.5 - Math.PI / edges / 2);
            //  M #{center} L #{start}
            return format('M #{start} L #{lines} Z', {
                start: m[0],
                lines: m.slice(1).join(' '),
                center: [x, y]
            });
        }
        instance.getFullPath = getFullPath;
        /**
         * 获取模型绘制路径
         *
         * @return {string} 返回模型绘制路径
         */
        function getModelPath() {
            var m = [];
            modelPath.forEach(function(line) {
                m.push([line[0].slice(), line[1].slice()]);
            });
            // console.log(JSON.stringify(m));
            return format('M #{start} L #{lines}', {
                start: m[0][0],
                lines: m.join(' ')
            });
        }
        /**
         * 获取模型多边形
         *
         * @return {Array} 返回多边形
         */
        function getModelPolygon() {
            var result = [];
            modelPath.forEach(function(line) {
                result.push(line[0].slice());
            });
            return result;
        }
        instance.getModelPolygon = getModelPolygon;
        /**
         * 获取模型多边形
         *
         * @return {Array} 返回多边形
         */
        function getCutPolygon() {
            var result = [];
            cutModelPath.forEach(function(line) {
                result.push(line[0].slice());
            });
            return result;
        }
        instance.getCutPolygon = getCutPolygon;
        /**
         * 获取模型绘制路径
         *
         * @return {string} 返回模型绘制路径
         */
        function getCutModelPath() {
            var m = [];
            cutModelPath.forEach(function(line) {
                m.push([line[0].slice(), line[1].slice()]);
            });
            return format('M #{start} L #{lines}' +
                'M #{start} m -5,0 h 10 M #{start} m 0,-5 v 10' +
                'M #{end} m -8,0 h 16 M #{end} m 0,-8 v 16', {
                    start: m[0][0],
                    end: m[m.length - 1][1],
                    lines: m.join(' ')
                });
        }
        instance.getCutModelPath = getCutModelPath;
        /**
         * 剪切纸片
         *
         * @param {Array} polygon 剪刀经过的路径
         * @return {boolean} 剪切是否成功
         */
        function cut(polygon) {
            if (!polygon || polygon.length < 2) {
                return;
            }
            function doCut(startModelIndex, endModelIndex) {
                var a = [];
                var b = [];
                var start = cutModelPath[0][0];
                var end = cutModelPath[cutModelPath.length - 1][1];
                var modelIndex;
                var temp;
                var i;
                var j;
                if (startModelIndex !== endModelIndex) {
                    modelIndex = startModelIndex;
                    temp = start;
                    for (i = 0; i < modelPath.length; i++) {
                        next = modelPath[modelIndex][1];
                        if (modelIndex === endModelIndex) {
                            a.push([
                                temp,
                                end,
                                modelPath[modelIndex][2]
                            ]);
                            for (j = cutModelPath.length - 1; j >= 0; j--) {
                                a.push([
                                    cutModelPath[j][1],
                                    cutModelPath[j][0],
                                    cutModelPath[j][2]
                                ]);
                            }
                            break;
                        }
                        a.push([
                            temp,
                            next,
                            modelPath[modelIndex][2]
                        ]);
                        temp = next;
                        modelIndex = (modelIndex + 1) % modelPath.length;
                    }
                    modelIndex = startModelIndex;
                    temp = start;
                    for (i = 0; i < modelPath.length; i++) {
                        next = modelPath[modelIndex][0];
                        if (modelIndex === endModelIndex) {
                            b.push([
                                temp,
                                end,
                                modelPath[modelIndex][2]
                            ]);
                            for (j = cutModelPath.length - 1; j >= 0; j--) {
                                b.push([
                                    cutModelPath[j][1],
                                    cutModelPath[j][0],
                                    cutModelPath[j][2]
                                ]);
                            }
                            break;
                        }
                        b.push([
                            temp,
                            next,
                            modelPath[modelIndex][2]
                        ]);
                        temp = next;
                        modelIndex--;
                        if (modelIndex < 0) {
                            modelIndex = modelPath.length - 1;
                        }
                    }
                }
                else { // 在同一条边上
                    if (jmaths.pointToPoint(modelPath[startModelIndex][0], start) <
                        jmaths.pointToPoint(modelPath[startModelIndex][0], end)) {
                        a.push([
                            modelPath[startModelIndex][0],
                            start,
                            modelPath[startModelIndex][2]
                        ]);
                        for (j = 0; j < cutModelPath.length; j++) {
                            a.push(cutModelPath[j]);
                        }
                        a.push([
                            end,
                            modelPath[startModelIndex][1],
                            modelPath[startModelIndex][2]
                        ]);
                        for (i = 1; i < modelPath.length; i++) {
                            a.push(modelPath[
                                (startModelIndex + i) % modelPath.length]);
                        }
                        for (j = 0; j < cutModelPath.length; j++) {
                            b.push(cutModelPath[j]);
                        }
                        b.push([
                            end,
                            start,
                            modelPath[startModelIndex][2]
                        ]);
                    }
                    else { // 逆方向
                        a.push([
                            start,
                            modelPath[startModelIndex][1],
                            modelPath[startModelIndex][2]
                        ]);
                        for (i = 1; i < modelPath.length; i++) {
                            a.push(modelPath[
                                (startModelIndex + i) % modelPath.length]);
                        }
                        a.push([
                            modelPath[startModelIndex][0],
                            end,
                            modelPath[startModelIndex][2]
                        ]);
                        for (j = cutModelPath.length - 1; j >= 0; j--) {
                            a.push([
                                cutModelPath[j][1],
                                cutModelPath[j][0],
                                cutModelPath[j][2]
                            ]);
                        }
                        b.push([
                            end,
                            start,
                            modelPath[startModelIndex][2]
                        ]);
                        for (j = 0; j < cutModelPath.length; j++) {
                            b.push(cutModelPath[j]);
                        }
                    }
                }
                var synechiaA = 0;
                var countA = {};
                a.forEach(function(item) {
                    countA[item[2]] = true;
                    if (item[2].indexOf('synechia') === 0) {
                        synechiaA += jmaths.pointToPoint(item[0], item[1]);
                    }
                });
                var synechiaB = 0;
                var countB = {};
                b.forEach(function(item) {
                    countB[item[2]] = true;
                    if (item[2].indexOf('synechia') === 0) {
                        synechiaB += jmaths.pointToPoint(item[0], item[1]);
                    }
                });
                if (countA.synechiaA && countA.synechiaB) {
                    if (!countB.synechiaA || !countB.synechiaB) {
                        modelPath = a;
                        cutModelPath = b;
                        return;
                    }
                }
                else if (countB.synechiaA && countB.synechiaB) {
                    if (!countA.synechiaA || !countA.synechiaB) {
                        modelPath = b;
                        cutModelPath = a;
                        return;
                    }
                }
                if (synechiaA >= synechiaB) {
                    modelPath = a;
                    cutModelPath = b;
                }
                else {
                    modelPath = b;
                    cutModelPath = a;
                }
            }
            function cutSub(intersect, polygonIndex, modelIndex) {
                cutModelPath = [];
                var start = intersect;
                for (var i = polygonIndex; i < polygon.length; i++) {
                    var next = polygon[i];
                    for (var j = 0; j < modelPath.length; j++) {
                        var line = modelPath[j];
                        if (i === polygonIndex && modelIndex === j) {
                            continue;
                        }
                        var p = jmaths.doubleLineIntersect(
                            start, next, line[0], line[1]);
                        if (p) {
                            cutModelPath.push([start, p, 'scar']);
                            doCut(modelIndex, j);
                            return;
                        }
                    }
                    cutModelPath.push([start, next, 'scar']);
                    start = next;
                }
            }
            // 起点和终点不能在纸里
            var modelPolygon = getModelPolygon();
            if (jmaths.pointInPolygon(polygon[0], modelPolygon) ||
                jmaths.pointInPolygon(polygon[polygon.length - 1], modelPolygon)) {
                return;
            }
            var i;
            var j;
            // 稀释路径
            if (polygon.length >= 3) {
                var tempPolygon = [polygon[0]];
                for (i = 1; i < polygon.length - 1; i++) {
                    var a = polygon[i - 1];
                    var b = polygon[i];
                    var c = polygon[i + 1];
                    if (jmaths.pointToLine(b, a, c) > 0.27) {
                        tempPolygon.push(b);
                    }
                }
                tempPolygon.push(polygon[polygon.length - 1]);
                polygon = tempPolygon;
            }
            // 自身不要碰撞
            for (i = 1; i < polygon.length - 2; i++) {
                var lineA = [polygon[i - 1], polygon[i]];
                for (j = i + 2; j < polygon.length; j++) {
                    var lineB = [polygon[j - 1], polygon[j]];
                    if (jmaths.doubleLineIntersect(
                        lineA[0], lineA[1], lineB[0], lineB[1])) {
                        return;
                    }
                }
            }
            var start = polygon[0];
            for (i = 1; i < polygon.length - 1; i++) {
                var next = polygon[i];
                for (j = 0; j < modelPath.length; j++) {
                    var line = modelPath[j];
                    var intersect = jmaths.doubleLineIntersect(
                        start, next, line[0], line[1]);
                    if (intersect) { // 出现相交
                        cutSub(intersect, i, j);
                        // console.log(JSON.stringify(polygon));
                        return true;
                    }
                }
                start = next;
            }
        }
        instance.cut = cut;
        instance.getModelPath = getModelPath;
        return instance;
    }
    exports.createPaper = createPaper;
    /**
     * 创建剪纸游戏实例
     *
     * @param {Object} options 配置项
     * @param {Element|string} options.container 容器，选择器或者元素对象
     * @param {=number} options.edges 边数，3~6，默认 6
     * @param {=string} options.stroke 描边颜色
     * @param {=string} options.fill 填充颜色
     * @param {=string} options.cutStroke 切线描边颜色
     * @param {=Function} options.onchange 用户剪切纸张
     * @return {Object} 返回游戏实例
     */
    function createGame(options) {
        options = options || {};
        var container = typeof options.container === 'string' ?
            document.querySelector(options.container) :
            options.container || document.body;
        var edges = options.edges || 6;
        var onchange = options.onchange;
        var instance = {};
        var status = 'running'; // stop
        var downPoint;
        var points;
        var center = [container.clientWidth / 2, container.clientHeight / 2 * 1.8];
        var radius = Math.min(container.clientWidth, container.clientHeight) * 0.8;
        var paper = createPaper(edges, center, radius);
        var paperBackgrund = jpaths.create({
            parent: container,
            stroke: options.stroke || 'black',
            fill: options.fill || 'none'
        });
        var paperHint = jpaths.create({
            parent: container,
            stroke: options.cutStroke || 'green',
            strokeWidth: 2
        });
        function render() {
            paperBackgrund.attr({
                path: paper.getModelPath()
            });
        }
        render();
        console.log('createGame');
        /**
         * 返回当前用户剪辑留下的形状
         *
         * @return {Array} 返回形状路径数据
         */
        instance.getShape = function() {
            console.log('getShape()');
            return {
                edges: edges,
                base: {
                    center: center,
                    radius: radius
                },
                polygon: paper.getModelPolygon()
            };
        };
        /**
         * 返回当前用户剪辑掉落的形状
         *
         * @return {Array} 返回形状路径数据
         */
        instance.getCutPolygon = function() {
            console.log('getCutPolygon()');
            return paper.getCutPolygon();
        };
        /**
         * 开始游戏
         */
        instance.replay = function() {
            console.log('replay()');
            status = 'running';
            paper.rebuild();
            doChange();
        };
        function doChange() {
            render();
            if (typeof onchange === 'function') {
                onchange.call(instance, {
                    type: 'change'
                });
            }
        }
        /**
         * 停止游戏
         */
        instance.stop = function() {
            console.log('stop()');
            if (status === 'stop') {
                return;
            }
            status = 'stop';
        };
        var freed;
        /**
         * 释放游戏资源
         */
        instance.free = function() {
            if (freed) {
                return;
            }
            freed = true;
            container.removeEventListener('touchmove', mouseMoveHandler);
            container.removeEventListener('touchstart', mouseDownHandler);
            container.removeEventListener('touchend', mouseUpHandler);
            container.removeEventListener('mousedown', mouseDownHandler);
            container.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            paperBackgrund.free();
            paperHint.free();
        };
        function mouseMoveHandler(e) {
            if (!downPoint) {
                return;
            }
            var movePoint = e.type === 'mousemove' ?
                [e.pageX - this.offsetLeft, e.pageY - this.offsetTop] :
                [e.targetTouches[0].pageX - this.offsetLeft, e.targetTouches[0].pageY - this.offsetTop];
            points.push(movePoint);
            paperHint.attr({
                path: jcuts.format('M #{from} L #{lines}', {
                    from: points[0],
                    lines: points.slice(1)
                })
            });
        }
        function mouseDownHandler(e) {
            if (status !== 'running') {
                return;
            }
            downPoint = e.type === 'mousedown' ?
                [e.pageX - this.offsetLeft, e.pageY - this.offsetTop] :
                [e.targetTouches[0].pageX - this.offsetLeft, e.targetTouches[0].pageY - this.offsetTop];
            points = [downPoint];
        }
        function mouseUpHandler() {
            if (!downPoint) {
                return;
            }
            downPoint = null;
            paperHint.attr({
                path: ''
            });
            if (status !== 'running') {
                return;
            }
            var ok = paper.cut(points);
            if (!ok) {
                return;
            }
            polygonDrop(paper.getCutPolygon(), options.fill || 'none', container);
            doChange();
        }
        container.addEventListener('touchmove', mouseMoveHandler);
        container.addEventListener('touchstart', mouseDownHandler);
        container.addEventListener('touchend', mouseUpHandler);
        container.addEventListener('mousedown', mouseDownHandler);
        container.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        return instance;
    }
    exports.createGame = createGame;
    /**
     * 渲染剪纸效果
     *
     * @param {Object} options 配置项
     * @param {Element|string} options.container 容器，选择器或者元素对象
     * @param {=string} options.stroke 描边颜色
     * @param {=string} options.fill 填充颜色
     * @return {Object} 渲染示例
     */
    function createRender(options) {
        options = options || {};
        var container = typeof options.container === 'string' ?
            document.querySelector(options.container) :
            options.container || document.body;
        var instance = {};
        var paperBackgrund = jpaths.create({
            parent: container,
            stroke: options.stroke || 'none',
            fill: options.fill || 'yellow'
        });
        var center = [container.clientWidth / 2, container.clientHeight / 2];
        var radius = Math.min(container.clientWidth, container.clientHeight) * 0.5;
        var base = {
            center: center,
            radius: radius
        };
        /**
         * 渲染容器
         *
         * @param {Object} shape 图案
         * @param {number} shape.edges 边数，3~6
         * @param {Array} shape.polygon 多边形
         */
        function render(shape) {
            var polygon = coordinateTransformation(shape.polygon, shape.base, base);
            var polygons = getCutPolygons(shape.edges, center, polygon);
            var path = '';
            polygons.forEach(function(polygon) {
                path += format('M #{start} L #{lines} Z', {
                    start: polygon[0],
                    lines: polygon.slice(1).join(' ')
                });
            });
            paperBackgrund.attr({
                path: path
            });
        }
        instance.render = render;
        var freed;
        /**
         * 释放游戏资源
         */
        instance.free = function() {
            if (freed) {
                return;
            }
            freed = true;
            paperBackgrund.free();
            console.log('free');
        };
        return instance;
    }
    exports.createRender = createRender;
    if (typeof define === 'function') {
        if (define.amd || define.cmd) {
            define(function() {
                return exports;
            });
        }
    }
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = exports;
    }
    else {
        window[exportName] = exports;
    }
})('jcuts');
})();
