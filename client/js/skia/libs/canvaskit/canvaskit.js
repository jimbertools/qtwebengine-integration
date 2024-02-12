
var CanvasKitInit = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(CanvasKitInit) {
  CanvasKitInit = CanvasKitInit || {};

var g;
g || (g = typeof CanvasKitInit !== 'undefined' ? CanvasKitInit : {});
(function(a) {
  a.Kk = a.Kk || [];
  a.Kk.push(function() {
    a.MakeSWCanvasSurface = function(b) {
      var c = b;
      if ("CANVAS" !== c.tagName && (c = document.getElementById(b), !c)) {
        throw "Canvas with id " + b + " was not found";
      }
      if (b = a.MakeSurface(c.width, c.height)) {
        b.Dk = c;
      }
      return b;
    };
    a.MakeCanvasSurface || (a.MakeCanvasSurface = a.MakeSWCanvasSurface);
    a.MakeSurface = function(b, c) {
      var d = {width:b, height:c, colorType:a.ColorType.RGBA_8888, alphaType:a.AlphaType.Unpremul}, e = b * c * 4, f = a._malloc(e);
      if (d = this._getRasterDirectSurface(d, f, 4 * b)) {
        d.Dk = null, d.rm = b, d.pm = c, d.Em = e, d.am = f, d.getCanvas().clear(a.TRANSPARENT);
      }
      return d;
    };
    a.SkSurface.prototype.flush = function() {
      this._flush();
      if (this.Dk) {
        var b = new Uint8ClampedArray(a.HEAPU8.buffer, this.am, this.Em);
        b = new ImageData(b, this.rm, this.pm);
        this.Dk.getContext("2d").putImageData(b, 0, 0);
      }
    };
    a.SkSurface.prototype.dispose = function() {
      this.am && a._free(this.am);
      this.delete();
    };
    a.currentContext = a.currentContext || function() {
    };
    a.setCurrentContext = a.setCurrentContext || function() {
    };
  });
})(g);
(function(a) {
  a.Kk = a.Kk || [];
  a.Kk.push(function() {
    function b(a, b, e) {
      return a && a.hasOwnProperty(b) ? a[b] : e;
    }
    a.GetWebGLContext = function(a, d) {
      d = {alpha:b(d, "alpha", 1), depth:b(d, "depth", 1), stencil:b(d, "stencil", 8), antialias:b(d, "antialias", 1), premultipliedAlpha:b(d, "premultipliedAlpha", 1), preserveDrawingBuffer:b(d, "preserveDrawingBuffer", 0), preferLowPowerToHighPerformance:b(d, "preferLowPowerToHighPerformance", 0), failIfMajorPerformanceCaveat:b(d, "failIfMajorPerformanceCaveat", 0), Il:b(d, "majorVersion", 2), $m:b(d, "minorVersion", 0), um:b(d, "enableExtensionsByDefault", 1), In:b(d, "explicitSwapControl", 0), 
      Sn:b(d, "renderViaOffscreenBackBuffer", 0)};
      if (!a || d.explicitSwapControl) {
        a = 0;
      } else {
        var c = aa(a, d);
        !c && 1 < d.Il && (d.Il = 1, d.$m = 0, c = aa(a, d));
        a = c;
      }
      return a;
    };
    a.MakeWebGLCanvasSurface = function(b, d, e) {
      var c = b;
      if (void 0 !== c.tagName && "CANVAS" !== c.tagName && (c = document.getElementById(b), !c)) {
        throw "Canvas with id " + b + " was not found";
      }
      b = this.GetWebGLContext(c);
      if (!b || 0 > b) {
        throw "failed to create webgl context: err " + b;
      }
      if (!(c || d && e)) {
        throw "height and width must be provided with context";
      }
      var k = this.MakeGrContext(b);
      k && k.setResourceCacheLimitBytes(268435456);
      d = this.MakeOnScreenGLSurface(k, d || c.width, e || c.height);
      if (!d) {
        return d = c.cloneNode(!0), c.parentNode.replaceChild(d, c), d.classList.add("ck-replaced"), a.MakeSWCanvasSurface(d);
      }
      d.hl = b;
      d.grContext = k;
      return d;
    };
    a.MakeCanvasSurface = a.MakeWebGLCanvasSurface;
  });
})(g);
(function(a) {
  function b(a) {
    return Math.round(Math.max(0, Math.min(a || 0, 255)));
  }
  function c(b, c, d) {
    if (!b || !b.length) {
      return 0;
    }
    if (b._ck) {
      return b.byteOffset;
    }
    d || (d = a._malloc(b.length * c.BYTES_PER_ELEMENT));
    c.set(b, d / c.BYTES_PER_ELEMENT);
    return d;
  }
  function d(b, c, d) {
    if (!b || !b.length) {
      return 0;
    }
    d || (d = a._malloc(b.length * b[0].length * c.BYTES_PER_ELEMENT));
    for (var m = 0, e = d / c.BYTES_PER_ELEMENT, l = 0; l < b.length; l++) {
      for (var f = 0; f < b[0].length; f++) {
        c[e + m] = b[l][f], m++;
      }
    }
    return d;
  }
  function e(a, b) {
    if (f) {
      require("fs").writeFile(b, new Buffer(a), function(a) {
        if (a) {
          throw a;
        }
      });
    } else {
      url = window.URL.createObjectURL(new Blob([a], {type:"application/octet-stream"}));
      var c = document.createElement("a");
      document.body.appendChild(c);
      c.href = url;
      c.download = b;
      c.click();
      setTimeout(function() {
        URL.revokeObjectURL(url);
        c.remove();
      }, 50);
    }
  }
  a.Color = function(a, c, d, e) {
    void 0 === e && (e = 1);
    return (b(255 * e) << 24 | b(a) << 16 | b(c) << 8 | b(d) << 0) >>> 0;
  };
  a.getColorComponents = function(a) {
    return [a >> 16 & 255, a >> 8 & 255, a >> 0 & 255, (a >> 24 & 255) / 255];
  };
  a.multiplyByAlpha = function(a, c) {
    return 1 === c ? a : (b((a >> 24 & 255) * c) << 24 | a & 16777215) >>> 0;
  };
  var f = !(new Function("try {return this===window || importScripts;}catch(e){ return false;}"))(), k = {};
  a.ll = function() {
    this.fl = [];
    this.Lk = null;
    Object.defineProperty(this, "length", {enumerable:!0, get:function() {
      return this.fl.length / 4;
    }});
  };
  a.ll.prototype.push = function(a, b, c, d) {
    this.Lk || this.fl.push(a, b, c, d);
  };
  a.ll.prototype.set = function(b, c, d, e, f) {
    0 > b || b >= this.fl.length / 4 || (b *= 4, this.Lk ? (b = this.Lk / 4 + b, a.HEAPF32[b] = c, a.HEAPF32[b + 1] = d, a.HEAPF32[b + 2] = e, a.HEAPF32[b + 3] = f) : (this.fl[b] = c, this.fl[b + 1] = d, this.fl[b + 2] = e, this.fl[b + 3] = f));
  };
  a.ll.prototype.build = function() {
    return this.Lk ? this.Lk : this.Lk = c(this.fl, a.HEAPF32);
  };
  a.ll.prototype.delete = function() {
    this.Lk && (a._free(this.Lk), this.Lk = null);
  };
  a.Bl = function() {
    this.Hl = [];
    this.Lk = null;
    Object.defineProperty(this, "length", {enumerable:!0, get:function() {
      return this.Hl.length;
    }});
  };
  a.Bl.prototype.push = function(a) {
    this.Lk || this.Hl.push(a);
  };
  a.Bl.prototype.set = function(b, c) {
    0 > b || b >= this.Hl.length || (b *= 4, this.Lk ? a.HEAPU32[this.Lk / 4 + b] = c : this.Hl[b] = c);
  };
  a.Bl.prototype.build = function() {
    return this.Lk ? this.Lk : this.Lk = c(this.Hl, a.HEAPU32);
  };
  a.Bl.prototype.delete = function() {
    this.Lk && (a._free(this.Lk), this.Lk = null);
  };
  a.SkRectBuilder = a.ll;
  a.RSXFormBuilder = a.ll;
  a.SkColorBuilder = a.Bl;
  a.Malloc = function(b, c) {
    var d = a._malloc(c * b.BYTES_PER_ELEMENT);
    b = new b(a.HEAPU8.buffer, d, c);
    b._ck = !0;
    return b;
  };
  a.onRuntimeInitialized = function() {
    a.SkMatrix = {};
    a.xn = function(b, c) {
      b = new Uint8Array(b);
      var d = a._malloc(b.byteLength);
      a.HEAPU8.set(b, d);
      return this.zn.An(d, c);
    };
    a.SkCodec.MakeFromStream = function(a) {
      return this.Bn(a);
    };
    a.yn = function(a, b, c, d) {
      return this.Cn(a, b, c, d);
    };
    a.UintColor = function(a) {
      a = this.getColorComponents(a);
      return this.Color(a[0], a[1], a[2], a[3]);
    };
    a.SkCodec.prototype.readPixels = function(b, c) {
      switch(b.xl) {
        case a.ColorType.RGBA_8888:
          var d = 4 * b.width;
          break;
        case a.ColorType.RGBA_F32:
          d = 16 * b.width;
          break;
        default:
          return;
      }
      var m = d * b.height, e = a._malloc(m), f = new a.un;
      f.Jn(c);
      f.Rn(c - 1);
      if (this._getPixels(b, e, d, f) != a.vn.Mn) {
        return null;
      }
      c = null;
      switch(b.xl) {
        case a.ColorType.RGBA_8888:
          c = (new Uint8Array(a.HEAPU8.buffer, e, m)).slice();
          break;
        case a.ColorType.RGBA_F32:
          c = (new Float32Array(a.HEAPU32.buffer, e, m)).slice();
      }
      a._free(e);
      return c;
    };
    a.SkImageGenerator.prototype.readPixels = function(b) {
      switch(b.xl) {
        case a.ColorType.RGBA_8888:
          var c = 4 * b.width;
          break;
        case a.ColorType.RGBA_F32:
          c = 16 * b.width;
          break;
        default:
          return;
      }
      var d = c * b.height, m = a._malloc(d);
      if (!this._getPixels(b, m, c)) {
        return null;
      }
      c = null;
      switch(b.xl) {
        case a.ColorType.RGBA_8888:
          c = (new Uint8Array(a.HEAPU8.buffer, m, d)).slice();
          break;
        case a.ColorType.RGBA_F32:
          c = (new Float32Array(a.HEAPU32.buffer, m, d)).slice();
      }
      a._free(m);
      return c;
    };
    a.SkCodec.prototype.width = function() {
      return this.rm();
    };
    a.SkCodec.prototype.height = function() {
      return this.pm();
    };
    a.SkMatrix.identity = function() {
      return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    };
    a.SkMatrix.invert = function(b) {
      var c = b[0] * b[4] * b[8] + b[1] * b[5] * b[6] + b[2] * b[3] * b[7] - b[2] * b[4] * b[6] - b[1] * b[3] * b[8] - b[0] * b[5] * b[7];
      return c ? [(b[4] * b[8] - b[5] * b[7]) / c, (b[2] * b[7] - b[1] * b[8]) / c, (b[1] * b[5] - b[2] * b[4]) / c, (b[5] * b[6] - b[3] * b[8]) / c, (b[0] * b[8] - b[2] * b[6]) / c, (b[2] * b[3] - b[0] * b[5]) / c, (b[3] * b[7] - b[4] * b[6]) / c, (b[1] * b[6] - b[0] * b[7]) / c, (b[0] * b[4] - b[1] * b[3]) / c] : a.SkMatrix.identity();
    };
    a.SkMatrix.mapPoints = function(a, b) {
      if (b.length % 2) {
        throw "mapPoints requires an even length arr";
      }
      for (var c = 0; c < b.length; c += 2) {
        var d = b[c], e = b[c + 1], m = a[6] * d + a[7] * e + a[8], f = a[3] * d + a[4] * e + a[5];
        b[c] = (a[0] * d + a[1] * e + a[2]) / m;
        b[c + 1] = f / m;
      }
      return b;
    };
    a.SkMatrix.multiply = function(a, b) {
      for (var c = [0, 0, 0, 0, 0, 0, 0, 0, 0], d = 0; 3 > d; d++) {
        for (var e = 0; 3 > e; e++) {
          c[3 * d + e] = a[3 * d] * b[e] + a[3 * d + 1] * b[3 + e] + (a[3 * d + 2] || 0) * (b[6 + e] || 0);
        }
      }
      return c;
    };
    a.SkMatrix.rotated = function(a, b, c) {
      b = b || 0;
      c = c || 0;
      var d = Math.sin(a);
      a = Math.cos(a);
      return [a, -d, d * c + (1 - a) * b, d, a, -d * b + (1 - a) * c, 0, 0, 1];
    };
    a.SkMatrix.scaled = function(a, b, c, d) {
      c = c || 0;
      d = d || 0;
      return [a, 0, c - a * c, 0, b, d - b * d, 0, 0, 1];
    };
    a.SkMatrix.skewed = function(a, b, c, d) {
      return [1, a, -a * (c || 0), b, 1, -b * (d || 0), 0, 0, 1];
    };
    a.SkMatrix.translated = function(a, b) {
      return [1, 0, a, 0, 1, b, 0, 0, 1];
    };
    a.SkPath.prototype.getBounds = function() {
      return this.Dn();
    };
    a.SkPath.prototype.width = function() {
      var a = this.getBounds();
      return a.fRight - a.fLeft;
    };
    a.SkPath.prototype.height = function() {
      var a = this.getBounds();
      return a.fBottom - a.fTop;
    };
    a.SkColorMatrix = {};
    a.SkColorMatrix.identity = function() {
      var a = new Float32Array(20);
      a[0] = 1;
      a[6] = 1;
      a[12] = 1;
      a[18] = 1;
      return a;
    };
    a.SkColorMatrix.scaled = function(a, b, c, d) {
      var e = new Float32Array(20);
      e[0] = a;
      e[6] = b;
      e[12] = c;
      e[18] = d;
      return e;
    };
    var b = [[6, 7, 11, 12], [0, 10, 2, 12], [0, 1, 5, 6]];
    a.SkColorMatrix.rotated = function(c, d, e) {
      var m = a.SkColorMatrix.identity();
      c = b[c];
      m[c[0]] = e;
      m[c[1]] = d;
      m[c[2]] = -d;
      m[c[3]] = e;
      return m;
    };
    a.SkColorMatrix.postTranslate = function(a, b, c, d, e) {
      a[4] += b;
      a[9] += c;
      a[14] += d;
      a[19] += e;
      return a;
    };
    a.SkColorMatrix.concat = function(a, b) {
      for (var c = new Float32Array(20), d = 0, e = 0; 20 > e; e += 5) {
        for (var m = 0; 4 > m; m++) {
          c[d++] = a[e] * b[m] + a[e + 1] * b[m + 5] + a[e + 2] * b[m + 10] + a[e + 3] * b[m + 15];
        }
        c[d++] = a[e] * b[4] + a[e + 1] * b[9] + a[e + 2] * b[14] + a[e + 3] * b[19] + a[e + 4];
      }
      return c;
    };
    a.SkPath.prototype.addArc = function(a, b, c) {
      this._addArc(a, b, c);
      return this;
    };
    a.SkPath.prototype.addOval = function(a, b, c) {
      void 0 === c && (c = 1);
      this._addOval(a, !!b, c);
      return this;
    };
    a.SkPath.prototype.addPath = function() {
      var a = Array.prototype.slice.call(arguments), b = a[0], c = !1;
      "boolean" === typeof a[a.length - 1] && (c = a.pop());
      if (1 === a.length) {
        this._addPath(b, 1, 0, 0, 0, 1, 0, 0, 0, 1, c);
      } else {
        if (2 === a.length) {
          a = a[1], this._addPath(b, a[0], a[1], a[2], a[3], a[4], a[5], a[6] || 0, a[7] || 0, a[8] || 1, c);
        } else {
          if (7 === a.length || 10 === a.length) {
            this._addPath(b, a[1], a[2], a[3], a[4], a[5], a[6], a[7] || 0, a[8] || 0, a[9] || 1, c);
          } else {
            return null;
          }
        }
      }
      return this;
    };
    a.SkPath.prototype.addPoly = function(b, c) {
      if (b._ck) {
        var e = b.byteOffset;
        b = b.length / 2;
      } else {
        e = d(b, a.HEAPF32), b = b.length;
      }
      this._addPoly(e, b, c);
      a._free(e);
      return this;
    };
    a.SkPath.prototype.addRect = function() {
      if (1 === arguments.length || 2 === arguments.length) {
        var a = arguments[0];
        this._addRect(a.fLeft, a.fTop, a.fRight, a.fBottom, arguments[1] || !1);
      } else {
        if (4 === arguments.length || 5 === arguments.length) {
          a = arguments, this._addRect(a[0], a[1], a[2], a[3], a[4] || !1);
        } else {
          return null;
        }
      }
      return this;
    };
    a.SkPath.prototype.addRoundRect = function() {
      var b = arguments;
      if (3 === b.length || 6 === b.length) {
        var d = b[b.length - 2];
      } else {
        if (6 === b.length || 7 === b.length) {
          d = b[b.length - 3];
          var e = b[b.length - 2];
          d = [d, e, d, e, d, e, d, e];
        } else {
          return null;
        }
      }
      if (8 !== d.length) {
        return null;
      }
      d = c(d, a.HEAPF32);
      if (3 === b.length || 4 === b.length) {
        e = b[0];
        var f = b[b.length - 1];
        this._addRoundRect(e.fLeft, e.fTop, e.fRight, e.fBottom, d, f);
      } else {
        6 !== b.length && 7 !== b.length || this._addRoundRect(b[0], b[1], b[2], b[3], d, f);
      }
      a._free(d);
      return this;
    };
    a.SkPath.prototype.arc = function(b, c, d, e, f, l) {
      b = a.LTRBRect(b - d, c - d, b + d, c + d);
      f = (f - e) / Math.PI * 180 - 360 * !!l;
      l = new a.SkPath;
      l.addArc(b, e / Math.PI * 180, f);
      this.addPath(l, !0);
      l.delete();
      return this;
    };
    a.SkPath.prototype.arcTo = function() {
      var a = arguments;
      if (5 === a.length) {
        this._arcTo(a[0], a[1], a[2], a[3], a[4]);
      } else {
        if (4 === a.length) {
          this._arcTo(a[0], a[1], a[2], a[3]);
        } else {
          if (7 === a.length) {
            this._arcTo(a[0], a[1], a[2], !!a[3], !!a[4], a[5], a[6]);
          } else {
            throw "Invalid args for arcTo. Expected 4, 5, or 7, got " + a.length;
          }
        }
      }
      return this;
    };
    a.SkPath.prototype.close = function() {
      this._close();
      return this;
    };
    a.SkPath.prototype.conicTo = function(a, b, c, d, e) {
      this._conicTo(a, b, c, d, e);
      return this;
    };
    a.SkPath.prototype.cubicTo = function(a, b, c, d, e, f) {
      this._cubicTo(a, b, c, d, e, f);
      return this;
    };
    a.SkPath.prototype.dash = function(a, b, c) {
      return this._dash(a, b, c) ? this : null;
    };
    a.SkPath.prototype.lineTo = function(a, b) {
      this._lineTo(a, b);
      return this;
    };
    a.SkPath.prototype.moveTo = function(a, b) {
      this._moveTo(a, b);
      return this;
    };
    a.SkPath.prototype.offset = function(a, b) {
      this._transform(1, 0, a, 0, 1, b, 0, 0, 1);
      return this;
    };
    a.SkPath.prototype.quadTo = function(a, b, c, d) {
      this._quadTo(a, b, c, d);
      return this;
    };
    a.SkPath.prototype.rArcTo = function(a, b, c, d, e, f, l) {
      this._rArcTo(a, b, c, d, e, f, l);
      return this;
    };
    a.SkPath.prototype.rConicTo = function(a, b, c, d, e) {
      this._rConicTo(a, b, c, d, e);
      return this;
    };
    a.SkPath.prototype.rCubicTo = function(a, b, c, d, e, f) {
      this._rCubicTo(a, b, c, d, e, f);
      return this;
    };
    a.SkPath.prototype.rLineTo = function(a, b) {
      this._rLineTo(a, b);
      return this;
    };
    a.SkPath.prototype.rMoveTo = function(a, b) {
      this._rMoveTo(a, b);
      return this;
    };
    a.SkPath.prototype.rQuadTo = function(a, b, c, d) {
      this._rQuadTo(a, b, c, d);
      return this;
    };
    a.SkPath.prototype.stroke = function(b) {
      b = b || {};
      b.width = b.width || 1;
      b.miter_limit = b.miter_limit || 4;
      b.cap = b.cap || a.StrokeCap.Butt;
      b.join = b.join || a.StrokeJoin.Miter;
      b.precision = b.precision || 1;
      return this._stroke(b) ? this : null;
    };
    a.SkPath.prototype.transform = function() {
      if (1 === arguments.length) {
        var a = arguments[0];
        this._transform(a[0], a[1], a[2], a[3], a[4], a[5], a[6] || 0, a[7] || 0, a[8] || 1);
      } else {
        if (6 === arguments.length || 9 === arguments.length) {
          a = arguments, this._transform(a[0], a[1], a[2], a[3], a[4], a[5], a[6] || 0, a[7] || 0, a[8] || 1);
        } else {
          throw "transform expected to take 1 or 9 arguments. Got " + arguments.length;
        }
      }
      return this;
    };
    a.SkPath.prototype.trim = function(a, b, c) {
      return this._trim(a, b, !!c) ? this : null;
    };
    a.SkVertices.prototype.applyBones = function(b) {
      var c = a.HEAPF32;
      var d = void 0;
      if (b && b.length && b[0].length) {
        d || (d = a._malloc(b.length * b[0].length * b[0][0].length * c.BYTES_PER_ELEMENT));
        for (var e = 0, f = d / c.BYTES_PER_ELEMENT, l = 0; l < b.length; l++) {
          for (var m = 0; m < b[0].length; m++) {
            for (var k = 0; k < b[0][0].length; k++) {
              c[f + e] = b[l][m][k], e++;
            }
          }
        }
        c = d;
      } else {
        c = 0;
      }
      b = this._applyBones(c, b.length);
      a._free(c);
      return b;
    };
    a.SkImage.prototype.encodeToData = function() {
      if (!arguments.length) {
        return this._encodeToData();
      }
      if (2 === arguments.length) {
        var a = arguments;
        return this._encodeToDataWithFormat(a[0], a[1]);
      }
      throw "encodeToData expected to take 0 or 2 arguments. Got " + arguments.length;
    };
    a.SkImage.prototype.makeShader = function(a, b, c) {
      return c ? (6 === c.length && c.push(0, 0, 1), this._makeShader(a, b, c)) : this._makeShader(a, b);
    };
    a.SkImage.prototype.readPixels = function(b, c, d) {
      switch(b.colorType) {
        case a.ColorType.RGBA_8888:
          var e = 4 * b.width;
          break;
        case a.ColorType.RGBA_F32:
          e = 16 * b.width;
          break;
        default:
          return;
      }
      var f = e * b.height, l = a._malloc(f);
      if (!this._readPixels(b, l, e, c, d)) {
        return null;
      }
      c = null;
      switch(b.colorType) {
        case a.ColorType.RGBA_8888:
          c = (new Uint8Array(a.HEAPU8.buffer, l, f)).slice();
          break;
        case a.ColorType.RGBA_F32:
          c = (new Float32Array(a.HEAPU8.buffer, l, f)).slice();
      }
      a._free(l);
      return c;
    };
    a.SkCanvas.prototype.drawAtlas = function(b, d, e, f, l, k) {
      if (b && f && d && e) {
        l || (l = a.BlendMode.SrcOver);
        var m;
        d.build ? m = d.build() : m = c(d, a.HEAPF32);
        var q;
        e.build ? q = e.build() : q = c(e, a.HEAPF32);
        var r = 0;
        k && (k.build ? r = k.build() : r = c(k, a.HEAPU32));
        this._drawAtlas(b, q, m, r, e.length, l, f);
        m && !d.build && a._free(m);
        q && !e.build && a._free(q);
        r && !k.build && a._free(r);
      }
    };
    a.SkCanvas.prototype.setTransform = function(a, b, c, d, e, f) {
      this._setMatrix([a, c, e, b, d, f, 0, 0, 1]);
    };
    a.SkCanvas.prototype.drawText = function(b, c, d, e, f) {
      if ("string" === typeof b) {
        var l = h(b) + 1, m = a._malloc(l);
        n(b, m, l);
        this._drawSimpleText(m, l, c, d, f, e);
      }
    };
    a.SkCanvas.prototype.drawPoints = function(b, c, e) {
      if (c._ck) {
        var f = c.byteOffset;
        c = c.length / 2;
      } else {
        f = d(c, a.HEAPF32), c = c.length;
      }
      this._drawPoints(b, f, c, e);
      a._free(f);
    };
    a.SkCanvas.prototype.readPixels = function(b, c, d, e, f, l, k) {
      f = f || a.AlphaType.Unpremul;
      l = l || a.ColorType.RGBA_8888;
      k = k || 4 * d;
      var m = e * k, q = a._malloc(m);
      if (!this._readPixels({width:d, height:e, colorType:l, alphaType:f}, q, k, b, c)) {
        return a._free(q), null;
      }
      b = (new Uint8Array(a.HEAPU8.buffer, q, m)).slice();
      a._free(q);
      return b;
    };
    a.SkCanvas.prototype.writePixels = function(b, c, d, e, f, l, k) {
      if (b.byteLength % (c * d)) {
        throw "pixels length must be a multiple of the srcWidth * srcHeight";
      }
      var m = b.byteLength / (c * d);
      l = l || a.AlphaType.Unpremul;
      k = k || a.ColorType.RGBA_8888;
      var q = m * c;
      m = a._malloc(b.byteLength);
      a.HEAPU8.set(b, m);
      b = this._writePixels({width:c, height:d, colorType:k, alphaType:l}, m, q, e, f);
      a._free(m);
      return b;
    };
    a.SkColorFilter.MakeMatrix = function(b) {
      if (b && 20 === b.length) {
        b = c(b, a.HEAPF32);
        var d = a.SkColorFilter._makeMatrix(b);
        a._free(b);
        return d;
      }
    };
    a.SkShader.Blend = function(a, b, c, d) {
      return d ? this._Blend(a, b, c, d) : this._Blend(a, b, c);
    };
    a.SkShader.Lerp = function(a, b, c, d) {
      return d ? this._Lerp(a, b, c, d) : this._Lerp(a, b, c);
    };
    a.SkSurface.prototype.readPixels = function(b, c, d) {
      console.log(b.xl, "=?", a.ColorType.RGBA_8888);
      switch(b.xl) {
        case a.ColorType.RGBA_8888:
          var e = 4 * b.width;
          break;
        case a.ColorType.RGBA_F32:
          e = 16 * b.width;
          break;
        default:
          return;
      }
      var f = e * b.height, l = a._malloc(f);
      if (!this._readPixels(b, l, e, c, d)) {
        return null;
      }
      c = null;
      switch(b.xl) {
        case a.ColorType.RGBA_8888:
          c = (new Uint8Array(a.HEAPU8.buffer, l, f)).slice();
          break;
        case a.ColorType.RGBA_F32:
          c = (new Float32Array(a.HEAPU32.buffer, l, f)).slice();
      }
      a._free(l);
      return c;
    };
    a.SkSurface.prototype.captureFrameAsSkPicture = function(b) {
      var c = new a.SkPictureRecorder, d = c.beginRecording(a.LTRBRect(0, 0, this.width(), this.height()));
      b(d);
      b = c.finishRecordingAsPicture();
      c.delete();
      return b;
    };
    a.SkSurface.prototype.requestAnimationFrame = function(b) {
      this.Cl || (this.Cl = this.getCanvas());
      window.requestAnimationFrame(function() {
        void 0 !== this.hl && a.setCurrentContext(this.hl);
        b(this.Cl);
        this.flush();
      }.bind(this));
    };
    a.SkSurface.prototype.drawOnce = function(b) {
      this.Cl || (this.Cl = this.getCanvas());
      window.requestAnimationFrame(function() {
        void 0 !== this.hl && a.setCurrentContext(this.hl);
        b(this.Cl);
        this.flush();
        this.dispose();
      }.bind(this));
    };
    a.Kk && a.Kk.forEach(function(a) {
      a();
    });
  };
  a.LTRBRect = function(a, b, c, d) {
    return {fLeft:a, fTop:b, fRight:c, fBottom:d};
  };
  a.XYWHRect = function(a, b, c, d) {
    return {fLeft:a, fTop:b, fRight:a + c, fBottom:b + d};
  };
  a.RRectXY = function(a, b, c) {
    return {rect:a, rx1:b, ry1:c, rx2:b, ry2:c, rx3:b, ry3:c, rx4:b, ry4:c};
  };
  a.MakePathFromCmds = function(b) {
    for (var d = 0, e = 0; e < b.length; e++) {
      d += b[e].length;
    }
    if (k[d]) {
      var f = k[d];
    } else {
      f = new Float32Array(d), k[d] = f;
    }
    var l = 0;
    for (e = 0; e < b.length; e++) {
      for (var B = 0; B < b[e].length; B++) {
        f[l] = b[e][B], l++;
      }
    }
    b = [c(f, a.HEAPF32), d];
    d = a._MakePathFromCmds(b[0], b[1]);
    a._free(b[0]);
    return d;
  };
  a.MakeSkDashPathEffect = function(b, d) {
    d || (d = 0);
    if (!b.length || 1 === b.length % 2) {
      throw "Intervals array must have even length";
    }
    var e = c(b, a.HEAPF32);
    b = a._MakeSkDashPathEffect(e, b.length, d);
    a._free(e);
    return b;
  };
  a.MakeAnimatedImageFromEncoded = function(b) {
    b = new Uint8Array(b);
    var c = a._malloc(b.byteLength);
    a.HEAPU8.set(b, c);
    return (b = a._decodeAnimatedImage(c, b.byteLength)) ? b : null;
  };
  a.MakeImageFromEncoded = function(b) {
    b = new Uint8Array(b);
    var c = a._malloc(b.byteLength);
    a.HEAPU8.set(b, c);
    return (b = a._decodeImage(c, b.byteLength)) ? b : null;
  };
  a.MakeRasterImageFromEncoded = function(b) {
    b = new Uint8Array(b);
    var c = a._malloc(b.byteLength);
    a.HEAPU8.set(b, c);
    return (b = a._decodeImageToRaster(c, b.byteLength)) ? b : null;
  };
  a.MakeSkDataFromEncoded = function(b) {
    b = new Uint8Array(b);
    var c = a._malloc(b.byteLength);
    a.HEAPU8.set(b, c);
    return (b = a.SkData.MakeFromMalloc(c, b.byteLength)) ? b : null;
  };
  a.MakeImage = function(b, d, e, f, k) {
    var l = b.length / (d * e);
    e = {width:d, height:e, alphaType:f, colorType:k};
    f = c(b, a.HEAPU8);
    return a._MakeImage(e, f, b.length, d * l);
  };
  a.MakeLinearGradientShader = function(b, d, e, f, k, B, z) {
    var l = c(e, a.HEAPU32);
    f = c(f, a.HEAPF32);
    z = z || 0;
    B ? (6 === B.length && B.push(0, 0, 1), b = a._MakeLinearGradientShader(b, d, l, f, e.length, k, z, B)) : b = a._MakeLinearGradientShader(b, d, l, f, e.length, k, z);
    a._free(l);
    a._free(f);
    return b;
  };
  a.MakeRadialGradientShader = function(b, d, e, f, k, B, z) {
    var l = c(e, a.HEAPU32);
    f = c(f, a.HEAPF32);
    z = z || 0;
    B ? (6 === B.length && B.push(0, 0, 1), b = a._MakeRadialGradientShader(b, d, l, f, e.length, k, z, B)) : b = a._MakeRadialGradientShader(b, d, l, f, e.length, k, z);
    a._free(l);
    a._free(f);
    return b;
  };
  a.MakeTwoPointConicalGradientShader = function(b, d, e, f, k, B, z, v, E) {
    var l = c(k, a.HEAPU32);
    B = c(B, a.HEAPF32);
    E = E || 0;
    v ? (6 === v.length && v.push(0, 0, 1), b = a._MakeTwoPointConicalGradientShader(b, d, e, f, l, B, k.length, z, E, v)) : b = a._MakeTwoPointConicalGradientShader(b, d, e, f, l, B, k.length, z, E);
    a._free(l);
    a._free(B);
    return b;
  };
  a.MakeSkVertices = function(b, e, f, k, x, B, z, v) {
    var l = z && z.length || 0, m = 0;
    f && f.length && (m |= 1);
    k && k.length && (m |= 2);
    x && x.length && (m |= 4);
    void 0 === v || v || (m |= 8);
    b = new a._SkVerticesBuilder(b, e.length, l, m);
    d(e, a.HEAPF32, b.positions());
    b.texCoords() && d(f, a.HEAPF32, b.texCoords());
    b.colors() && c(k, a.HEAPU32, b.colors());
    b.boneIndices() && d(x, a.HEAP32, b.boneIndices());
    b.boneWeights() && d(B, a.HEAPF32, b.boneWeights());
    b.indices() && c(z, a.HEAPU16, b.indices());
    return b.detach();
  };
  (function(a) {
    a.Kk = a.Kk || [];
    a.Kk.push(function() {
      a.Paragraph.prototype.getRectsForRange = function(b, c, d, e) {
        b = this._getRectsForRange(b, c, d, e);
        if (!b || !b.length) {
          return [];
        }
        c = [];
        for (d = 0; d < b.length; d += 5) {
          e = a.LTRBRect(b[d], b[d + 1], b[d + 2], b[d + 3]), e.direction = 1 === b[d + 4] ? a.TextDirection.RTL : a.TextDirection.LTR, c.push(e);
        }
        a._free(b.byteOffset);
        return c;
      };
      a.ParagraphStyle = function(b) {
        b.disableHinting = b.disableHinting || !1;
        if (b.ellipsis) {
          var c = b.ellipsis, d = h(c) + 1, e = a._malloc(d);
          n(c, e, d);
          b._ellipsisPtr = e;
          b._ellipsisLen = d;
        } else {
          b._ellipsisPtr = 0, b._ellipsisLen = 0;
        }
        b.heightMultiplier = b.heightMultiplier || 0;
        b.maxLines = b.maxLines || 0;
        b.textAlign = b.textAlign || a.TextAlign.Start;
        b.textDirection = b.textDirection || a.TextDirection.LTR;
        b.textStyle = a.TextStyle(b.textStyle);
        return b;
      };
      a.TextStyle = function(b) {
        b.backgroundColor = b.backgroundColor || 0;
        void 0 === b.color && (b.color = a.BLACK);
        b.decoration = b.decoration || 0;
        b.decorationThickness = b.decorationThickness || 0;
        b.fontSize = b.fontSize || 0;
        if (Array.isArray(b.fontFamilies) && b.fontFamilies.length) {
          var d;
          if ((d = b.fontFamilies) && d.length) {
            for (var e = [], f = 0; f < d.length; f++) {
              var l = d[f], k = h(l) + 1, m = a._malloc(k);
              n(l, m, k);
              e.push(m);
            }
            d = c(e, a.HEAPU32);
          } else {
            d = 0;
          }
          b._fontFamilies = d;
          b._numFontFamilies = b.fontFamilies.length;
        } else {
          b._fontFamilies = 0, b._numFontFamilies = 0;
        }
        d = (d = b.fontStyle) || {};
        void 0 === d.weight && (d.weight = a.FontWeight.Normal);
        d.width = d.width || a.FontWidth.Normal;
        d.slant = d.slant || a.FontSlant.Upright;
        b.fontStyle = d;
        b.foregroundColor = b.foregroundColor || 0;
        return b;
      };
    });
  })(g);
  a.MakeManagedAnimation = function(b, d) {
    if (!a._MakeManagedAnimation) {
      throw "Not compiled with MakeManagedAnimation";
    }
    if (!d) {
      return a._MakeManagedAnimation(b, 0, 0, 0, 0);
    }
    for (var e = [], f = [], l = [], k = Object.keys(d || {}), m = 0; m < k.length; m++) {
      var v = k[m], E = new Uint8Array(d[v]), L = a._malloc(E.byteLength);
      a.HEAPU8.set(E, L);
      f.push(L);
      l.push(E.byteLength);
      E = h(v) + 1;
      L = a._malloc(E);
      n(v, L, E);
      e.push(L);
    }
    d = c(e, a.HEAPU32);
    f = c(f, a.HEAPU32);
    l = c(l, a.HEAPU32);
    b = a._MakeManagedAnimation(b, k.length, d, f, l);
    a._free(d);
    a._free(f);
    a._free(l);
    return b;
  };
  a.MakeParticles = function(b, d) {
    if (!a._MakeParticles) {
      throw "Not compiled with MakeParticles";
    }
    if (!d) {
      return a._MakeParticles(b, 0, 0, 0, 0);
    }
    for (var e = [], f = [], l = [], k = Object.keys(d || {}), m = 0; m < k.length; m++) {
      var v = k[m], E = new Uint8Array(d[v]), L = a._malloc(E.byteLength);
      a.HEAPU8.set(E, L);
      f.push(L);
      l.push(E.byteLength);
      E = h(v) + 1;
      L = a._malloc(E);
      n(v, L, E);
      e.push(L);
    }
    d = c(e, a.HEAPU32);
    f = c(f, a.HEAPU32);
    l = c(l, a.HEAPU32);
    b = a._MakeParticles(b, k.length, d, f, l);
    a._free(d);
    a._free(f);
    a._free(l);
    return b;
  };
  a.Kk = a.Kk || [];
  a.Kk.push(function() {
    a.SkPath.prototype.op = function(a, b) {
      return this._op(a, b) ? this : null;
    };
    a.SkPath.prototype.simplify = function() {
      return this._simplify() ? this : null;
    };
  });
  a.Kk = a.Kk || [];
  a.Kk.push(function() {
    a.SkCanvas.prototype.drawText = function(b, c, d, e, f) {
      if ("string" === typeof b) {
        var l = h(b), k = a._malloc(l + 1);
        n(b, k, l + 1);
        this._drawSimpleText(k, l, c, d, f, e);
      } else {
        this._drawShapedText(b, c, d, e);
      }
    };
    a.SkFont.prototype.getWidths = function(b) {
      var c = b.length + 1, d = h(b) + 1, e = a._malloc(d);
      n(b, e, d);
      b = a._malloc(4 * c);
      if (!this._getWidths(e, d, c, b)) {
        return a._free(e), a._free(b), null;
      }
      c = new Float32Array(a.HEAPU8.buffer, b, c);
      c = Array.from(c);
      a._free(e);
      a._free(b);
      return c;
    };
    a.SkFontMgr.FromData = function() {
      if (!arguments.length) {
        return null;
      }
      var b = arguments;
      1 === b.length && Array.isArray(b[0]) && (b = arguments[0]);
      if (!b.length) {
        return null;
      }
      for (var d = [], e = [], f = 0; f < b.length; f++) {
        var k = new Uint8Array(b[f]), B = c(k, a.HEAPU8);
        d.push(B);
        e.push(k.byteLength);
      }
      d = c(d, a.HEAPU32);
      e = c(e, a.HEAPU32);
      b = a.SkFontMgr._fromData(d, e, b.length);
      a._free(d);
      a._free(e);
      return b;
    };
    a.SkFontMgr.prototype.MakeTypefaceFromData = function(b) {
      b = new Uint8Array(b);
      var d = c(b, a.HEAPU8);
      return (b = this._makeTypefaceFromData(d, b.byteLength)) ? b : null;
    };
    a.SkTextBlob.MakeOnPath = function(b, c, d, e) {
      if (b && b.length && c && c.countPoints()) {
        if (1 === c.countPoints()) {
          return this.MakeFromText(b, d);
        }
        e || (e = 0);
        var f = d.getWidths(b), l = new a.RSXFormBuilder;
        c = new a.SkPathMeasure(c, !1, 1);
        for (var k = 0; k < b.length; k++) {
          var m = f[k];
          e += m / 2;
          if (e > c.getLength()) {
            if (!c.nextContour()) {
              b = b.substring(0, k);
              break;
            }
            e = m / 2;
          }
          var q = c.getPosTan(e), r = q[2], Va = q[3];
          l.push(r, Va, q[0] - m / 2 * r, q[1] - m / 2 * Va);
          e += m / 2;
        }
        b = this.MakeFromRSXform(b, l, d);
        l.delete();
        c.delete();
        return b;
      }
    };
    a.SkTextBlob.MakeFromRSXform = function(b, c, d) {
      var e = h(b) + 1, f = a._malloc(e);
      n(b, f, e);
      b = c.build();
      d = a.SkTextBlob._MakeFromRSXform(f, e - 1, b, d, a.TextEncoding.UTF8);
      if (!d) {
        return null;
      }
      var l = d.delete.bind(d);
      d.delete = function() {
        a._free(f);
        l();
      };
      return d;
    };
    a.SkTextBlob.MakeFromText = function(b, c) {
      var d = h(b) + 1, e = a._malloc(d);
      n(b, e, d);
      b = a.SkTextBlob._MakeFromText(e, d - 1, c, a.TextEncoding.UTF8);
      if (!b) {
        return null;
      }
      var f = b.delete.bind(b);
      b.delete = function() {
        a._free(e);
        f();
      };
      return b;
    };
  });
  a.Kk = a.Kk || [];
  a.Kk.push(function() {
    a.MakeSkPicture = function(b) {
      b = new Uint8Array(b);
      var c = a._malloc(b.byteLength);
      a.HEAPU8.set(b, c);
      return (b = a._MakeSkPicture(c, b.byteLength)) ? b : null;
    };
    a.SkPicture.prototype.saveAsFile = function(b) {
      var c = this.serialize();
      if (c) {
        var d = a.getSkDataBytes(c);
        e(d, b);
        c.delete();
      }
    };
  });
  a.Kk = a.Kk || [];
  a.Kk.push(function() {
    a.SkRuntimeEffect.prototype.makeShader = function(b, d, e) {
      var f = c(b, a.HEAPF32);
      return e ? this._makeShader(f, 4 * b.length, !!d, e) : this._makeShader(f, 4 * b.length, !!d);
    };
  });
  (function() {
    function b(a) {
      for (var b = 0; b < a.length; b++) {
        if (void 0 !== a[b] && !Number.isFinite(a[b])) {
          return !1;
        }
      }
      return !0;
    }
    function c(b) {
      var c = a.getColorComponents(b);
      b = c[0];
      var d = c[1], e = c[2];
      c = c[3];
      if (1 === c) {
        return b = b.toString(16).toLowerCase(), d = d.toString(16).toLowerCase(), e = e.toString(16).toLowerCase(), b = 1 === b.length ? "0" + b : b, d = 1 === d.length ? "0" + d : d, e = 1 === e.length ? "0" + e : e, "#" + b + d + e;
      }
      c = 0 === c || 1 === c ? c : c.toFixed(8);
      return "rgba(" + b + ", " + d + ", " + e + ", " + c + ")";
    }
    function d(a) {
      if (void 0 === a) {
        return 1;
      }
      var b = parseFloat(a);
      return a && -1 !== a.indexOf("%") ? b / 100 : b;
    }
    function e(b) {
      b = b.toLowerCase();
      if (b.startsWith("#")) {
        var c = 255;
        switch(b.length) {
          case 9:
            c = parseInt(b.slice(7, 9), 16);
          case 7:
            var e = parseInt(b.slice(1, 3), 16);
            var f = parseInt(b.slice(3, 5), 16);
            var k = parseInt(b.slice(5, 7), 16);
            break;
          case 5:
            c = 17 * parseInt(b.slice(4, 5), 16);
          case 4:
            e = 17 * parseInt(b.slice(1, 2), 16), f = 17 * parseInt(b.slice(2, 3), 16), k = 17 * parseInt(b.slice(3, 4), 16);
        }
        return a.Color(e, f, k, c / 255);
      }
      return b.startsWith("rgba") ? (b = b.slice(5, -1), b = b.split(","), a.Color(+b[0], +b[1], +b[2], d(b[3]))) : b.startsWith("rgb") ? (b = b.slice(4, -1), b = b.split(","), a.Color(+b[0], +b[1], +b[2], d(b[3]))) : b.startsWith("gray(") || b.startsWith("hsl") || (b = $d[b], void 0 === b) ? a.BLACK : b;
    }
    function k(a) {
      a = ae.exec(a);
      if (!a) {
        return null;
      }
      var b = parseFloat(a[4]), c = 16;
      switch(a[5]) {
        case "em":
        case "rem":
          c = 16 * b;
          break;
        case "pt":
          c = 4 * b / 3;
          break;
        case "px":
          c = b;
          break;
        case "pc":
          c = 16 * b;
          break;
        case "in":
          c = 96 * b;
          break;
        case "cm":
          c = 96 * b / 2.54;
          break;
        case "mm":
          c = 96 / 25.4 * b;
          break;
        case "q":
          c = 96 / 25.4 / 4 * b;
          break;
        case "%":
          c = 16 / 75 * b;
      }
      return {style:a[1], variant:a[2], weight:a[3], sizePx:c, family:a[6].trim()};
    }
    function B(d) {
      this.Dk = d;
      this.Fk = new a.SkPaint;
      this.Fk.setAntiAlias(!0);
      this.Fk.setStrokeMiter(10);
      this.Fk.setStrokeCap(a.StrokeCap.Butt);
      this.Fk.setStrokeJoin(a.StrokeJoin.Miter);
      this.Ol = "10px monospace";
      this.nl = new a.SkFont(null, 10);
      this.Tk = this.$k = a.BLACK;
      this.ql = 0;
      this.Fl = a.TRANSPARENT;
      this.sl = this.rl = 0;
      this.Gl = this.dl = 1;
      this.El = 0;
      this.pl = [];
      this.Ek = a.BlendMode.SrcOver;
      this.il = a.FilterQuality.Low;
      this.Dl = !0;
      this.Fk.setStrokeWidth(this.Gl);
      this.Fk.setBlendMode(this.Ek);
      this.Hk = new a.SkPath;
      this.Jk = a.SkMatrix.identity();
      this.om = [];
      this.vl = [];
      this.el = function() {
        this.Hk.delete();
        this.Fk.delete();
        this.nl.delete();
        this.vl.forEach(function(a) {
          a.el();
        });
      };
      Object.defineProperty(this, "currentTransform", {enumerable:!0, get:function() {
        return {a:this.Jk[0], c:this.Jk[1], e:this.Jk[2], b:this.Jk[3], d:this.Jk[4], f:this.Jk[5]};
      }, set:function(a) {
        a.a && this.setTransform(a.a, a.b, a.c, a.d, a.e, a.f);
      }});
      Object.defineProperty(this, "fillStyle", {enumerable:!0, get:function() {
        return Number.isInteger(this.Tk) ? c(this.Tk) : this.Tk;
      }, set:function(a) {
        "string" === typeof a ? this.Tk = e(a) : a.ol && (this.Tk = a);
      }});
      Object.defineProperty(this, "font", {enumerable:!0, get:function() {
        return this.Ol;
      }, set:function(a) {
        var b = k(a), c = b.family;
        b.typeface = Ga[c] ? Ga[c][(b.style || "normal") + "|" + (b.variant || "normal") + "|" + (b.weight || "normal")] || Ga[c]["*"] : null;
        b && (this.nl.setSize(b.sizePx), this.nl.setTypeface(b.typeface), this.Ol = a);
      }});
      Object.defineProperty(this, "globalAlpha", {enumerable:!0, get:function() {
        return this.dl;
      }, set:function(a) {
        !isFinite(a) || 0 > a || 1 < a || (this.dl = a);
      }});
      Object.defineProperty(this, "globalCompositeOperation", {enumerable:!0, get:function() {
        switch(this.Ek) {
          case a.BlendMode.SrcOver:
            return "source-over";
          case a.BlendMode.DstOver:
            return "destination-over";
          case a.BlendMode.Src:
            return "copy";
          case a.BlendMode.Dst:
            return "destination";
          case a.BlendMode.Clear:
            return "clear";
          case a.BlendMode.SrcIn:
            return "source-in";
          case a.BlendMode.DstIn:
            return "destination-in";
          case a.BlendMode.SrcOut:
            return "source-out";
          case a.BlendMode.DstOut:
            return "destination-out";
          case a.BlendMode.SrcATop:
            return "source-atop";
          case a.BlendMode.DstATop:
            return "destination-atop";
          case a.BlendMode.Xor:
            return "xor";
          case a.BlendMode.Plus:
            return "lighter";
          case a.BlendMode.Multiply:
            return "multiply";
          case a.BlendMode.Screen:
            return "screen";
          case a.BlendMode.Overlay:
            return "overlay";
          case a.BlendMode.Darken:
            return "darken";
          case a.BlendMode.Lighten:
            return "lighten";
          case a.BlendMode.ColorDodge:
            return "color-dodge";
          case a.BlendMode.ColorBurn:
            return "color-burn";
          case a.BlendMode.HardLight:
            return "hard-light";
          case a.BlendMode.SoftLight:
            return "soft-light";
          case a.BlendMode.Difference:
            return "difference";
          case a.BlendMode.Exclusion:
            return "exclusion";
          case a.BlendMode.Hue:
            return "hue";
          case a.BlendMode.Saturation:
            return "saturation";
          case a.BlendMode.Color:
            return "color";
          case a.BlendMode.Luminosity:
            return "luminosity";
        }
      }, set:function(b) {
        switch(b) {
          case "source-over":
            this.Ek = a.BlendMode.SrcOver;
            break;
          case "destination-over":
            this.Ek = a.BlendMode.DstOver;
            break;
          case "copy":
            this.Ek = a.BlendMode.Src;
            break;
          case "destination":
            this.Ek = a.BlendMode.Dst;
            break;
          case "clear":
            this.Ek = a.BlendMode.Clear;
            break;
          case "source-in":
            this.Ek = a.BlendMode.SrcIn;
            break;
          case "destination-in":
            this.Ek = a.BlendMode.DstIn;
            break;
          case "source-out":
            this.Ek = a.BlendMode.SrcOut;
            break;
          case "destination-out":
            this.Ek = a.BlendMode.DstOut;
            break;
          case "source-atop":
            this.Ek = a.BlendMode.SrcATop;
            break;
          case "destination-atop":
            this.Ek = a.BlendMode.DstATop;
            break;
          case "xor":
            this.Ek = a.BlendMode.Xor;
            break;
          case "lighter":
            this.Ek = a.BlendMode.Plus;
            break;
          case "plus-lighter":
            this.Ek = a.BlendMode.Plus;
            break;
          case "plus-darker":
            throw "plus-darker is not supported";
          case "multiply":
            this.Ek = a.BlendMode.Multiply;
            break;
          case "screen":
            this.Ek = a.BlendMode.Screen;
            break;
          case "overlay":
            this.Ek = a.BlendMode.Overlay;
            break;
          case "darken":
            this.Ek = a.BlendMode.Darken;
            break;
          case "lighten":
            this.Ek = a.BlendMode.Lighten;
            break;
          case "color-dodge":
            this.Ek = a.BlendMode.ColorDodge;
            break;
          case "color-burn":
            this.Ek = a.BlendMode.ColorBurn;
            break;
          case "hard-light":
            this.Ek = a.BlendMode.HardLight;
            break;
          case "soft-light":
            this.Ek = a.BlendMode.SoftLight;
            break;
          case "difference":
            this.Ek = a.BlendMode.Difference;
            break;
          case "exclusion":
            this.Ek = a.BlendMode.Exclusion;
            break;
          case "hue":
            this.Ek = a.BlendMode.Hue;
            break;
          case "saturation":
            this.Ek = a.BlendMode.Saturation;
            break;
          case "color":
            this.Ek = a.BlendMode.Color;
            break;
          case "luminosity":
            this.Ek = a.BlendMode.Luminosity;
            break;
          default:
            return;
        }
        this.Fk.setBlendMode(this.Ek);
      }});
      Object.defineProperty(this, "imageSmoothingEnabled", {enumerable:!0, get:function() {
        return this.Dl;
      }, set:function(a) {
        this.Dl = !!a;
      }});
      Object.defineProperty(this, "imageSmoothingQuality", {enumerable:!0, get:function() {
        switch(this.il) {
          case a.FilterQuality.Low:
            return "low";
          case a.FilterQuality.Medium:
            return "medium";
          case a.FilterQuality.High:
            return "high";
        }
      }, set:function(b) {
        switch(b) {
          case "low":
            this.il = a.FilterQuality.Low;
            break;
          case "medium":
            this.il = a.FilterQuality.Medium;
            break;
          case "high":
            this.il = a.FilterQuality.High;
        }
      }});
      Object.defineProperty(this, "lineCap", {enumerable:!0, get:function() {
        switch(this.Fk.getStrokeCap()) {
          case a.StrokeCap.Butt:
            return "butt";
          case a.StrokeCap.Round:
            return "round";
          case a.StrokeCap.Square:
            return "square";
        }
      }, set:function(b) {
        switch(b) {
          case "butt":
            this.Fk.setStrokeCap(a.StrokeCap.Butt);
            break;
          case "round":
            this.Fk.setStrokeCap(a.StrokeCap.Round);
            break;
          case "square":
            this.Fk.setStrokeCap(a.StrokeCap.Square);
        }
      }});
      Object.defineProperty(this, "lineDashOffset", {enumerable:!0, get:function() {
        return this.El;
      }, set:function(a) {
        isFinite(a) && (this.El = a);
      }});
      Object.defineProperty(this, "lineJoin", {enumerable:!0, get:function() {
        switch(this.Fk.getStrokeJoin()) {
          case a.StrokeJoin.Miter:
            return "miter";
          case a.StrokeJoin.Round:
            return "round";
          case a.StrokeJoin.Bevel:
            return "bevel";
        }
      }, set:function(b) {
        switch(b) {
          case "miter":
            this.Fk.setStrokeJoin(a.StrokeJoin.Miter);
            break;
          case "round":
            this.Fk.setStrokeJoin(a.StrokeJoin.Round);
            break;
          case "bevel":
            this.Fk.setStrokeJoin(a.StrokeJoin.Bevel);
        }
      }});
      Object.defineProperty(this, "lineWidth", {enumerable:!0, get:function() {
        return this.Fk.getStrokeWidth();
      }, set:function(a) {
        0 >= a || !a || (this.Gl = a, this.Fk.setStrokeWidth(a));
      }});
      Object.defineProperty(this, "miterLimit", {enumerable:!0, get:function() {
        return this.Fk.getStrokeMiter();
      }, set:function(a) {
        0 >= a || !a || this.Fk.setStrokeMiter(a);
      }});
      Object.defineProperty(this, "shadowBlur", {enumerable:!0, get:function() {
        return this.ql;
      }, set:function(a) {
        0 > a || !isFinite(a) || (this.ql = a);
      }});
      Object.defineProperty(this, "shadowColor", {enumerable:!0, get:function() {
        return c(this.Fl);
      }, set:function(a) {
        this.Fl = e(a);
      }});
      Object.defineProperty(this, "shadowOffsetX", {enumerable:!0, get:function() {
        return this.rl;
      }, set:function(a) {
        isFinite(a) && (this.rl = a);
      }});
      Object.defineProperty(this, "shadowOffsetY", {enumerable:!0, get:function() {
        return this.sl;
      }, set:function(a) {
        isFinite(a) && (this.sl = a);
      }});
      Object.defineProperty(this, "strokeStyle", {enumerable:!0, get:function() {
        return c(this.$k);
      }, set:function(a) {
        "string" === typeof a ? this.$k = e(a) : a.ol && (this.$k = a);
      }});
      this.arc = function(a, b, c, d, e, f) {
        vb(this.Hk, a, b, c, c, 0, d, e, f);
      };
      this.arcTo = function(a, b, c, d, e) {
        L(this.Hk, a, b, c, d, e);
      };
      this.beginPath = function() {
        this.Hk.delete();
        this.Hk = new a.SkPath;
      };
      this.bezierCurveTo = function(a, c, d, e, f, k) {
        var l = this.Hk;
        b([a, c, d, e, f, k]) && (l.isEmpty() && l.moveTo(a, c), l.cubicTo(a, c, d, e, f, k));
      };
      this.clearRect = function(b, c, d, e) {
        this.Fk.setStyle(a.PaintStyle.Fill);
        this.Fk.setBlendMode(a.BlendMode.Clear);
        this.Dk.drawRect(a.XYWHRect(b, c, d, e), this.Fk);
        this.Fk.setBlendMode(this.Ek);
      };
      this.clip = function(b, c) {
        "string" === typeof b ? (c = b, b = this.Hk) : b && b.$l && (b = b.Mk);
        b || (b = this.Hk);
        b = b.copy();
        c && "evenodd" === c.toLowerCase() ? b.setFillType(a.FillType.EvenOdd) : b.setFillType(a.FillType.Winding);
        this.Dk.clipPath(b, a.ClipOp.Intersect, !0);
        b.delete();
      };
      this.closePath = function() {
        Va(this.Hk);
      };
      this.createImageData = function() {
        if (1 === arguments.length) {
          var a = arguments[0];
          return new v(new Uint8ClampedArray(4 * a.width * a.height), a.width, a.height);
        }
        if (2 === arguments.length) {
          a = arguments[0];
          var b = arguments[1];
          return new v(new Uint8ClampedArray(4 * a * b), a, b);
        }
        throw "createImageData expects 1 or 2 arguments, got " + arguments.length;
      };
      this.createLinearGradient = function(a, c, d, e) {
        if (b(arguments)) {
          var f = new E(a, c, d, e);
          this.vl.push(f);
          return f;
        }
      };
      this.createPattern = function(a, b) {
        a = new Hc(a, b);
        this.vl.push(a);
        return a;
      };
      this.createRadialGradient = function(a, c, d, e, f, k) {
        if (b(arguments)) {
          var l = new Ic(a, c, d, e, f, k);
          this.vl.push(l);
          return l;
        }
      };
      this.Dm = function() {
        var b = this.Nl();
        this.Dl ? b.setFilterQuality(this.il) : b.setFilterQuality(a.FilterQuality.None);
        return b;
      };
      this.drawImage = function(b) {
        var c = this.Dm();
        if (3 === arguments.length || 5 === arguments.length) {
          var d = a.XYWHRect(arguments[1], arguments[2], arguments[3] || b.width(), arguments[4] || b.height()), e = a.XYWHRect(0, 0, b.width(), b.height());
        } else {
          if (9 === arguments.length) {
            d = a.XYWHRect(arguments[5], arguments[6], arguments[7], arguments[8]), e = a.XYWHRect(arguments[1], arguments[2], arguments[3], arguments[4]);
          } else {
            throw "invalid number of args for drawImage, need 3, 5, or 9; got " + arguments.length;
          }
        }
        this.Dk.drawImageRect(b, e, d, c, !1);
        c.dispose();
      };
      this.ellipse = function(a, b, c, d, e, f, k, l) {
        vb(this.Hk, a, b, c, d, e, f, k, l);
      };
      this.Nl = function() {
        var b = this.Fk.copy();
        b.setStyle(a.PaintStyle.Fill);
        if (Number.isInteger(this.Tk)) {
          var c = a.multiplyByAlpha(this.Tk, this.dl);
          b.setColor(c);
        } else {
          c = this.Tk.ol(this.Jk), b.setColor(a.Color(0, 0, 0, this.dl)), b.setShader(c);
        }
        b.dispose = function() {
          this.delete();
        };
        return b;
      };
      this.fill = function(b, c) {
        "string" === typeof b ? (c = b, b = this.Hk) : b && b.$l && (b = b.Mk);
        if ("evenodd" === c) {
          this.Hk.setFillType(a.FillType.EvenOdd);
        } else {
          if ("nonzero" !== c && c) {
            throw "invalid fill rule";
          }
          this.Hk.setFillType(a.FillType.Winding);
        }
        b || (b = this.Hk);
        c = this.Nl();
        var d = this.Ql(c);
        d && (this.Dk.save(), this.Dk.concat(this.Pl()), this.Dk.drawPath(b, d), this.Dk.restore(), d.dispose());
        this.Dk.drawPath(b, c);
        c.dispose();
      };
      this.fillRect = function(b, c, d, e) {
        var f = this.Nl();
        this.Dk.drawRect(a.XYWHRect(b, c, d, e), f);
        f.dispose();
      };
      this.fillText = function(b, c, d) {
        var e = this.Nl();
        b = a.SkTextBlob.MakeFromText(b, this.nl);
        var f = this.Ql(e);
        f && (this.Dk.save(), this.Dk.concat(this.Pl()), this.Dk.drawTextBlob(b, c, d, f), this.Dk.restore(), f.dispose());
        this.Dk.drawTextBlob(b, c, d, e);
        b.delete();
        e.dispose();
      };
      this.getImageData = function(a, b, c, d) {
        return (a = this.Dk.readPixels(a, b, c, d)) ? new v(new Uint8ClampedArray(a.buffer), c, d) : null;
      };
      this.getLineDash = function() {
        return this.pl.slice();
      };
      this.qm = function(b) {
        var c = a.SkMatrix.invert(this.Jk);
        a.SkMatrix.mapPoints(c, b);
        return b;
      };
      this.isPointInPath = function(b, c, d) {
        var e = arguments;
        if (3 === e.length) {
          var f = this.Hk;
        } else {
          if (4 === e.length) {
            f = e[0], b = e[1], c = e[2], d = e[3];
          } else {
            throw "invalid arg count, need 3 or 4, got " + e.length;
          }
        }
        if (!isFinite(b) || !isFinite(c)) {
          return !1;
        }
        d = d || "nonzero";
        if ("nonzero" !== d && "evenodd" !== d) {
          return !1;
        }
        e = this.qm([b, c]);
        b = e[0];
        c = e[1];
        f.setFillType("nonzero" === d ? a.FillType.Winding : a.FillType.EvenOdd);
        return f.contains(b, c);
      };
      this.isPointInStroke = function(b, c) {
        var d = arguments;
        if (2 === d.length) {
          var e = this.Hk;
        } else {
          if (3 === d.length) {
            e = d[0], b = d[1], c = d[2];
          } else {
            throw "invalid arg count, need 2 or 3, got " + d.length;
          }
        }
        if (!isFinite(b) || !isFinite(c)) {
          return !1;
        }
        d = this.qm([b, c]);
        b = d[0];
        c = d[1];
        e = e.copy();
        e.setFillType(a.FillType.Winding);
        e.stroke({width:this.lineWidth, miter_limit:this.miterLimit, cap:this.Fk.getStrokeCap(), join:this.Fk.getStrokeJoin(), precision:.3});
        d = e.contains(b, c);
        e.delete();
        return d;
      };
      this.lineTo = function(a, b) {
        Jc(this.Hk, a, b);
      };
      this.measureText = function(a) {
        return {width:this.nl.measureText(a)};
      };
      this.moveTo = function(a, c) {
        var d = this.Hk;
        b([a, c]) && d.moveTo(a, c);
      };
      this.putImageData = function(c, d, e, f, k, l, m) {
        if (b([d, e, f, k, l, m])) {
          if (void 0 === f) {
            this.Dk.writePixels(c.data, c.width, c.height, d, e);
          } else {
            if (f = f || 0, k = k || 0, l = l || c.width, m = m || c.height, 0 > l && (f += l, l = Math.abs(l)), 0 > m && (k += m, m = Math.abs(m)), 0 > f && (l += f, f = 0), 0 > k && (m += k, k = 0), !(0 >= l || 0 >= m)) {
              c = a.MakeImage(c.data, c.width, c.height, a.AlphaType.Unpremul, a.ColorType.RGBA_8888);
              var Zd = a.XYWHRect(f, k, l, m);
              d = a.XYWHRect(d + f, e + k, l, m);
              e = a.SkMatrix.invert(this.Jk);
              this.Dk.save();
              this.Dk.concat(e);
              this.Dk.drawImageRect(c, Zd, d, null, !1);
              this.Dk.restore();
              c.delete();
            }
          }
        }
      };
      this.quadraticCurveTo = function(a, c, d, e) {
        var f = this.Hk;
        b([a, c, d, e]) && (f.isEmpty() && f.moveTo(a, c), f.quadTo(a, c, d, e));
      };
      this.rect = function(a, c, d, e) {
        var f = this.Hk;
        b([a, c, d, e]) && f.addRect(a, c, a + d, c + e);
      };
      this.resetTransform = function() {
        this.Hk.transform(this.Jk);
        var b = a.SkMatrix.invert(this.Jk);
        this.Dk.concat(b);
        this.Jk = this.Dk.getTotalMatrix();
      };
      this.restore = function() {
        var b = this.om.pop();
        if (b) {
          var c = a.SkMatrix.multiply(this.Jk, a.SkMatrix.invert(b.Gm));
          this.Hk.transform(c);
          this.Fk.delete();
          this.Fk = b.an;
          this.pl = b.Wm;
          this.Gl = b.mn;
          this.$k = b.ln;
          this.Tk = b.fs;
          this.rl = b.jn;
          this.sl = b.kn;
          this.ql = b.fn;
          this.Fl = b.hn;
          this.dl = b.Lm;
          this.Ek = b.Mm;
          this.El = b.Xm;
          this.Dl = b.Um;
          this.il = b.Vm;
          this.Ol = b.Km;
          this.Dk.restore();
          this.Jk = this.Dk.getTotalMatrix();
        }
      };
      this.rotate = function(b) {
        if (isFinite(b)) {
          var c = a.SkMatrix.rotated(-b);
          this.Hk.transform(c);
          this.Dk.rotate(b / Math.PI * 180, 0, 0);
          this.Jk = this.Dk.getTotalMatrix();
        }
      };
      this.save = function() {
        if (this.Tk.ml) {
          var a = this.Tk.ml();
          this.vl.push(a);
        } else {
          a = this.Tk;
        }
        if (this.$k.ml) {
          var b = this.$k.ml();
          this.vl.push(b);
        } else {
          b = this.$k;
        }
        this.om.push({Gm:this.Jk.slice(), Wm:this.pl.slice(), mn:this.Gl, ln:b, fs:a, jn:this.rl, kn:this.sl, fn:this.ql, hn:this.Fl, Lm:this.dl, Xm:this.El, Mm:this.Ek, Um:this.Dl, Vm:this.il, an:this.Fk.copy(), Km:this.Ol});
        this.Dk.save();
      };
      this.scale = function(c, d) {
        if (b(arguments)) {
          var e = a.SkMatrix.scaled(1 / c, 1 / d);
          this.Hk.transform(e);
          this.Dk.scale(c, d);
          this.Jk = this.Dk.getTotalMatrix();
        }
      };
      this.setLineDash = function(a) {
        for (var b = 0; b < a.length; b++) {
          if (!isFinite(a[b]) || 0 > a[b]) {
            return;
          }
        }
        1 === a.length % 2 && Array.prototype.push.apply(a, a);
        this.pl = a;
      };
      this.setTransform = function(a, c, d, e, f, k) {
        b(arguments) && (this.resetTransform(), this.transform(a, c, d, e, f, k));
      };
      this.Pl = function() {
        return a.SkMatrix.translated(this.rl / this.Jk[0], this.sl / this.Jk[4]);
      };
      this.Ql = function(b) {
        var c = a.multiplyByAlpha(this.Fl, this.dl);
        if (!a.getColorComponents(c)[3] || !(this.ql || this.sl || this.rl)) {
          return null;
        }
        b = b.copy();
        b.setColor(c);
        var d = a.SkMaskFilter.MakeBlur(a.BlurStyle.Normal, this.ql / 2, !1);
        b.setMaskFilter(d);
        b.dispose = function() {
          d.delete();
          this.delete();
        };
        return b;
      };
      this.bm = function() {
        var b = this.Fk.copy();
        b.setStyle(a.PaintStyle.Stroke);
        if (Number.isInteger(this.$k)) {
          var c = a.multiplyByAlpha(this.$k, this.dl);
          b.setColor(c);
        } else {
          c = this.$k.ol(this.Jk), b.setColor(a.Color(0, 0, 0, this.dl)), b.setShader(c);
        }
        b.setStrokeWidth(this.Gl);
        if (this.pl.length) {
          var d = a.MakeSkDashPathEffect(this.pl, this.El);
          b.setPathEffect(d);
        }
        b.dispose = function() {
          d && d.delete();
          this.delete();
        };
        return b;
      };
      this.stroke = function(a) {
        a = a ? a.Mk : this.Hk;
        var b = this.bm(), c = this.Ql(b);
        c && (this.Dk.save(), this.Dk.concat(this.Pl()), this.Dk.drawPath(a, c), this.Dk.restore(), c.dispose());
        this.Dk.drawPath(a, b);
        b.dispose();
      };
      this.strokeRect = function(b, c, d, e) {
        var f = this.bm();
        this.Dk.drawRect(a.XYWHRect(b, c, d, e), f);
        f.dispose();
      };
      this.strokeText = function(b, c, d) {
        var e = this.bm();
        b = a.SkTextBlob.MakeFromText(b, this.nl);
        var f = this.Ql(e);
        f && (this.Dk.save(), this.Dk.concat(this.Pl()), this.Dk.drawTextBlob(b, c, d, f), this.Dk.restore(), f.dispose());
        this.Dk.drawTextBlob(b, c, d, e);
        b.delete();
        e.dispose();
      };
      this.translate = function(c, d) {
        if (b(arguments)) {
          var e = a.SkMatrix.translated(-c, -d);
          this.Hk.transform(e);
          this.Dk.translate(c, d);
          this.Jk = this.Dk.getTotalMatrix();
        }
      };
      this.transform = function(b, c, d, e, f, k) {
        b = [b, d, f, c, e, k, 0, 0, 1];
        c = a.SkMatrix.invert(b);
        this.Hk.transform(c);
        this.Dk.concat(b);
        this.Jk = this.Dk.getTotalMatrix();
      };
      this.addHitRegion = function() {
      };
      this.clearHitRegions = function() {
      };
      this.drawFocusIfNeeded = function() {
      };
      this.removeHitRegion = function() {
      };
      this.scrollPathIntoView = function() {
      };
      Object.defineProperty(this, "canvas", {value:null, writable:!1});
    }
    function z(b) {
      this.cm = b;
      this.hl = new B(b.getCanvas());
      this.Rl = [];
      this.Bm = a.SkFontMgr.RefDefault();
      this.decodeImage = function(b) {
        b = a.MakeImageFromEncoded(b);
        if (!b) {
          throw "Invalid input";
        }
        this.Rl.push(b);
        return b;
      };
      this.loadFont = function(a, b) {
        a = this.Bm.MakeTypefaceFromData(a);
        if (!a) {
          return null;
        }
        this.Rl.push(a);
        var c = (b.style || "normal") + "|" + (b.variant || "normal") + "|" + (b.weight || "normal");
        b = b.family;
        Ga[b] || (Ga[b] = {"*":a});
        Ga[b][c] = a;
      };
      this.makePath2D = function(a) {
        a = new be(a);
        this.Rl.push(a.Mk);
        return a;
      };
      this.getContext = function(a) {
        return "2d" === a ? this.hl : null;
      };
      this.toDataURL = function(b, c) {
        this.cm.flush();
        var d = this.cm.makeImageSnapshot();
        if (d) {
          b = b || "image/png";
          var e = a.ImageFormat.PNG;
          "image/jpeg" === b && (e = a.ImageFormat.JPEG);
          if (c = d.encodeToData(e, c || .92)) {
            c = a.getSkDataBytes(c);
            b = "data:" + b + ";base64,";
            if (f) {
              c = Buffer.from(c).toString("base64");
            } else {
              d = 0;
              e = c.length;
              for (var k = "", l; d < e;) {
                l = c.slice(d, Math.min(d + 32768, e)), k += String.fromCharCode.apply(null, l), d += 32768;
              }
              c = btoa(k);
            }
            return b + c;
          }
        }
      };
      this.dispose = function() {
        this.hl.el();
        this.Rl.forEach(function(a) {
          a.delete();
        });
        this.cm.dispose();
      };
    }
    function v(a, b, c) {
      if (!b || 0 === c) {
        throw "invalid dimensions, width and height must be non-zero";
      }
      if (a.length % 4) {
        throw "arr must be a multiple of 4";
      }
      c = c || a.length / (4 * b);
      Object.defineProperty(this, "data", {value:a, writable:!1});
      Object.defineProperty(this, "height", {value:c, writable:!1});
      Object.defineProperty(this, "width", {value:b, writable:!1});
    }
    function E(b, c, d, f) {
      this.Ok = null;
      this.Wk = [];
      this.Rk = [];
      this.addColorStop = function(a, b) {
        if (0 > a || 1 < a || !isFinite(a)) {
          throw "offset must be between 0 and 1 inclusively";
        }
        b = e(b);
        var c = this.Rk.indexOf(a);
        if (-1 !== c) {
          this.Wk[c] = b;
        } else {
          for (c = 0; c < this.Rk.length && !(this.Rk[c] > a); c++) {
          }
          this.Rk.splice(c, 0, a);
          this.Wk.splice(c, 0, b);
        }
      };
      this.ml = function() {
        var a = new E(b, c, d, f);
        a.Wk = this.Wk.slice();
        a.Rk = this.Rk.slice();
        return a;
      };
      this.el = function() {
        this.Ok && (this.Ok.delete(), this.Ok = null);
      };
      this.ol = function(e) {
        var k = [b, c, d, f];
        a.SkMatrix.mapPoints(e, k);
        e = k[0];
        var l = k[1], m = k[2];
        k = k[3];
        this.el();
        return this.Ok = a.MakeLinearGradientShader([e, l], [m, k], this.Wk, this.Rk, a.TileMode.Clamp);
      };
    }
    function L(a, c, d, e, f, k) {
      if (b([c, d, e, f, k])) {
        if (0 > k) {
          throw "radii cannot be negative";
        }
        a.isEmpty() && a.moveTo(c, d);
        a.arcTo(c, d, e, f, k);
      }
    }
    function Va(a) {
      if (!a.isEmpty()) {
        var b = a.getBounds();
        (b.fBottom - b.fTop || b.fRight - b.fLeft) && a.close();
      }
    }
    function Kc(b, c, d, e, f, k, l) {
      l = (l - k) / Math.PI * 180;
      k = k / Math.PI * 180;
      c = a.LTRBRect(c - e, d - f, c + e, d + f);
      1e-5 > Math.abs(Math.abs(l) - 360) ? (d = l / 2, b.arcTo(c, k, d, !1), b.arcTo(c, k + d, d, !1)) : b.arcTo(c, k, l, !1);
    }
    function vb(c, d, e, f, k, l, m, q, z) {
      if (b([d, e, f, k, l, m, q])) {
        if (0 > f || 0 > k) {
          throw "radii cannot be negative";
        }
        var r = 2 * Math.PI, v = m % r;
        0 > v && (v += r);
        var x = v - m;
        m = v;
        q += x;
        !z && q - m >= r ? q = m + r : z && m - q >= r ? q = m - r : !z && m > q ? q = m + (r - (m - q) % r) : z && m < q && (q = m - (r - (q - m) % r));
        l ? (z = a.SkMatrix.rotated(l, d, e), l = a.SkMatrix.rotated(-l, d, e), c.transform(l), Kc(c, d, e, f, k, m, q), c.transform(z)) : Kc(c, d, e, f, k, m, q);
      }
    }
    function Jc(a, c, d) {
      b([c, d]) && (a.isEmpty() && a.moveTo(c, d), a.lineTo(c, d));
    }
    function be(c) {
      this.Mk = null;
      "string" === typeof c ? this.Mk = a.MakePathFromSVGString(c) : c && c.$l ? this.Mk = c.Mk.copy() : this.Mk = new a.SkPath;
      this.$l = function() {
        return this.Mk;
      };
      this.addPath = function(a, b) {
        b || (b = {a:1, c:0, e:0, b:0, d:1, f:0});
        this.Mk.addPath(a.Mk, [b.a, b.c, b.e, b.b, b.d, b.f]);
      };
      this.arc = function(a, b, c, d, e, f) {
        vb(this.Mk, a, b, c, c, 0, d, e, f);
      };
      this.arcTo = function(a, b, c, d, e) {
        L(this.Mk, a, b, c, d, e);
      };
      this.bezierCurveTo = function(a, c, d, e, f, k) {
        var l = this.Mk;
        b([a, c, d, e, f, k]) && (l.isEmpty() && l.moveTo(a, c), l.cubicTo(a, c, d, e, f, k));
      };
      this.closePath = function() {
        Va(this.Mk);
      };
      this.ellipse = function(a, b, c, d, e, f, k, l) {
        vb(this.Mk, a, b, c, d, e, f, k, l);
      };
      this.lineTo = function(a, b) {
        Jc(this.Mk, a, b);
      };
      this.moveTo = function(a, c) {
        var d = this.Mk;
        b([a, c]) && d.moveTo(a, c);
      };
      this.quadraticCurveTo = function(a, c, d, e) {
        var f = this.Mk;
        b([a, c, d, e]) && (f.isEmpty() && f.moveTo(a, c), f.quadTo(a, c, d, e));
      };
      this.rect = function(a, c, d, e) {
        var f = this.Mk;
        b([a, c, d, e]) && f.addRect(a, c, a + d, c + e);
      };
    }
    function Hc(c, d) {
      this.Ok = null;
      this.Cm = c;
      this._transform = a.SkMatrix.identity();
      "" === d && (d = "repeat");
      switch(d) {
        case "repeat-x":
          this.tl = a.TileMode.Repeat;
          this.ul = a.TileMode.Decal;
          break;
        case "repeat-y":
          this.tl = a.TileMode.Decal;
          this.ul = a.TileMode.Repeat;
          break;
        case "repeat":
          this.ul = this.tl = a.TileMode.Repeat;
          break;
        case "no-repeat":
          this.ul = this.tl = a.TileMode.Decal;
          break;
        default:
          throw "invalid repetition mode " + d;
      }
      this.setTransform = function(a) {
        a = [a.a, a.c, a.e, a.b, a.d, a.f, 0, 0, 1];
        b(a) && (this._transform = a);
      };
      this.ml = function() {
        var a = new Hc;
        a.tl = this.tl;
        a.ul = this.ul;
        return a;
      };
      this.el = function() {
        this.Ok && (this.Ok.delete(), this.Ok = null);
      };
      this.ol = function() {
        this.el();
        return this.Ok = this.Cm.makeShader(this.tl, this.ul, this._transform);
      };
    }
    function Ic(b, c, d, f, k, l) {
      this.Ok = null;
      this.Wk = [];
      this.Rk = [];
      this.addColorStop = function(a, b) {
        if (0 > a || 1 < a || !isFinite(a)) {
          throw "offset must be between 0 and 1 inclusively";
        }
        b = e(b);
        var c = this.Rk.indexOf(a);
        if (-1 !== c) {
          this.Wk[c] = b;
        } else {
          for (c = 0; c < this.Rk.length && !(this.Rk[c] > a); c++) {
          }
          this.Rk.splice(c, 0, a);
          this.Wk.splice(c, 0, b);
        }
      };
      this.ml = function() {
        var a = new Ic(b, c, d, f, k, l);
        a.Wk = this.Wk.slice();
        a.Rk = this.Rk.slice();
        return a;
      };
      this.el = function() {
        this.Ok && (this.Ok.delete(), this.Ok = null);
      };
      this.ol = function(e) {
        var m = [b, c, f, k];
        a.SkMatrix.mapPoints(e, m);
        var q = m[0], z = m[1], r = m[2];
        m = m[3];
        var v = (Math.abs(e[0]) + Math.abs(e[4])) / 2;
        e = d * v;
        v *= l;
        this.el();
        return this.Ok = a.MakeTwoPointConicalGradientShader([q, z], e, [r, m], v, this.Wk, this.Rk, a.TileMode.Clamp);
      };
    }
    a._testing = {};
    var $d = {aliceblue:4293982463, antiquewhite:4294634455, aqua:4278255615, aquamarine:4286578644, azure:4293984255, beige:4294309340, bisque:4294960324, black:4278190080, blanchedalmond:4294962125, blue:4278190335, blueviolet:4287245282, brown:4289014314, burlywood:4292786311, cadetblue:4284456608, chartreuse:4286578432, chocolate:4291979550, coral:4294934352, cornflowerblue:4284782061, cornsilk:4294965468, crimson:4292613180, cyan:4278255615, darkblue:4278190219, darkcyan:4278225803, darkgoldenrod:4290283019, 
    darkgray:4289309097, darkgreen:4278215680, darkgrey:4289309097, darkkhaki:4290623339, darkmagenta:4287299723, darkolivegreen:4283788079, darkorange:4294937600, darkorchid:4288230092, darkred:4287299584, darksalmon:4293498490, darkseagreen:4287609999, darkslateblue:4282924427, darkslategray:4281290575, darkslategrey:4281290575, darkturquoise:4278243025, darkviolet:4287889619, deeppink:4294907027, deepskyblue:4278239231, dimgray:4285098345, dimgrey:4285098345, dodgerblue:4280193279, firebrick:4289864226, 
    floralwhite:4294966e3, forestgreen:4280453922, fuchsia:4294902015, gainsboro:4292664540, ghostwhite:4294506751, gold:4294956800, goldenrod:4292519200, gray:4286611584, green:4278222848, greenyellow:4289593135, grey:4286611584, honeydew:4293984240, hotpink:4294928820, indianred:4291648604, indigo:4283105410, ivory:4294967280, khaki:4293977740, lavender:4293322490, lavenderblush:4294963445, lawngreen:4286381056, lemonchiffon:4294965965, lightblue:4289583334, lightcoral:4293951616, lightcyan:4292935679, 
    lightgoldenrodyellow:4294638290, lightgray:4292072403, lightgreen:4287688336, lightgrey:4292072403, lightpink:4294948545, lightsalmon:4294942842, lightseagreen:4280332970, lightskyblue:4287090426, lightslategray:4286023833, lightslategrey:4286023833, lightsteelblue:4289774814, lightyellow:4294967264, lime:4278255360, limegreen:4281519410, linen:4294635750, magenta:4294902015, maroon:4286578688, mediumaquamarine:4284927402, mediumblue:4278190285, mediumorchid:4290401747, mediumpurple:4287852763, 
    mediumseagreen:4282168177, mediumslateblue:4286277870, mediumspringgreen:4278254234, mediumturquoise:4282962380, mediumvioletred:4291237253, midnightblue:4279834992, mintcream:4294311930, mistyrose:4294960353, moccasin:4294960309, navajowhite:4294958765, navy:4278190208, oldlace:4294833638, olive:4286611456, olivedrab:4285238819, orange:4294944e3, orangered:4294919424, orchid:4292505814, palegoldenrod:4293847210, palegreen:4288215960, paleturquoise:4289720046, palevioletred:4292571283, papayawhip:4294963157, 
    peachpuff:4294957753, peru:4291659071, pink:4294951115, plum:4292714717, powderblue:4289781990, purple:4286578816, rebeccapurple:4284887961, red:4294901760, rosybrown:4290547599, royalblue:4282477025, saddlebrown:4287317267, salmon:4294606962, sandybrown:4294222944, seagreen:4281240407, seashell:4294964718, sienna:4288696877, silver:4290822336, skyblue:4287090411, slateblue:4285160141, slategray:4285563024, slategrey:4285563024, snow:4294966010, springgreen:4278255487, steelblue:4282811060, tan:4291998860, 
    teal:4278222976, thistle:4292394968, transparent:0, tomato:4294927175, turquoise:4282441936, violet:4293821166, wheat:4294303411, white:4294967295, whitesmoke:4294309365, yellow:4294967040, yellowgreen:4288335154};
    a._testing.parseColor = e;
    a._testing.colorToString = c;
    var ae = /(italic|oblique|normal|)\s*(small-caps|normal|)\s*(bold|bolder|lighter|[1-9]00|normal|)\s*([\d\.]+)(px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q)(.+)/, Ga = {"Noto Mono":{"*":null}, monospace:{"*":null}};
    a._testing.parseFontString = k;
    a.MakeCanvas = function(b, c) {
      return (b = a.MakeSurface(b, c)) ? new z(b) : null;
    };
    a.ImageData = function() {
      if (2 === arguments.length) {
        var a = arguments[0], b = arguments[1];
        return new v(new Uint8ClampedArray(4 * a * b), a, b);
      }
      if (3 === arguments.length) {
        var c = arguments[0];
        if (c.prototype.constructor !== Uint8ClampedArray) {
          throw "bytes must be given as a Uint8ClampedArray";
        }
        a = arguments[1];
        b = arguments[2];
        if (c % 4) {
          throw "bytes must be given in a multiple of 4";
        }
        if (c % a) {
          throw "bytes must divide evenly by width";
        }
        if (b && b !== c / (4 * a)) {
          throw "invalid height given";
        }
        return new v(c, a, c / (4 * a));
      }
      throw "invalid number of arguments - takes 2 or 3, saw " + arguments.length;
    };
  })();
})(g);
var ba = {}, ca;
for (ca in g) {
  g.hasOwnProperty(ca) && (ba[ca] = g[ca]);
}
var da = "./this.program";
function ea(a, b) {
  throw b;
}
var fa = !1, ha = !1, ia = !1, ja = !1, ka = !1;
fa = "object" === typeof window;
ha = "function" === typeof importScripts;
ia = (ja = "object" === typeof process && "object" === typeof process.versions && "string" === typeof process.versions.node) && !fa && !ha;
ka = !fa && !ia && !ha;
var p = "", la, ma, na, oa;
if (ia) {
  p = __dirname + "/", la = function(a, b) {
    na || (na = require("fs"));
    oa || (oa = require("path"));
    a = oa.normalize(a);
    return na.readFileSync(a, b ? null : "utf8");
  }, ma = function(a) {
    a = la(a, !0);
    a.buffer || (a = new Uint8Array(a));
    assert(a.buffer);
    return a;
  }, 1 < process.argv.length && (da = process.argv[1].replace(/\\/g, "/")), process.argv.slice(2), process.on("uncaughtException", function(a) {
    if (!(a instanceof pa)) {
      throw a;
    }
  }), process.on("unhandledRejection", t), ea = function(a) {
    process.exit(a);
  }, g.inspect = function() {
    return "[Emscripten Module object]";
  };
} else {
  if (ka) {
    "undefined" != typeof read && (la = function(a) {
      return read(a);
    }), ma = function(a) {
      if ("function" === typeof readbuffer) {
        return new Uint8Array(readbuffer(a));
      }
      a = read(a, "binary");
      assert("object" === typeof a);
      return a;
    }, "function" === typeof quit && (ea = function(a) {
      quit(a);
    }), "undefined" !== typeof print && ("undefined" === typeof console && (console = {}), console.log = print, console.warn = console.error = "undefined" !== typeof printErr ? printErr : print);
  } else {
    if (fa || ha) {
      ha ? p = self.location.href : document.currentScript && (p = document.currentScript.src), _scriptDir && (p = _scriptDir), 0 !== p.indexOf("blob:") ? p = p.substr(0, p.lastIndexOf("/") + 1) : p = "", la = function(a) {
        var b = new XMLHttpRequest;
        b.open("GET", a, !1);
        b.send(null);
        return b.responseText;
      }, ha && (ma = function(a) {
        var b = new XMLHttpRequest;
        b.open("GET", a, !1);
        b.responseType = "arraybuffer";
        b.send(null);
        return new Uint8Array(b.response);
      });
    }
  }
}
var qa = g.print || console.log.bind(console), ra = g.printErr || console.warn.bind(console);
for (ca in ba) {
  ba.hasOwnProperty(ca) && (g[ca] = ba[ca]);
}
ba = null;
g.thisProgram && (da = g.thisProgram);
g.quit && (ea = g.quit);
function sa(a) {
  ta || (ta = {});
  ta[a] || (ta[a] = 1, ra(a));
}
var ta, ua = 0, va;
g.wasmBinary && (va = g.wasmBinary);
var wa;
g.noExitRuntime && (wa = g.noExitRuntime);
"object" !== typeof WebAssembly && ra("no native wasm support detected");
var xa, ya = new WebAssembly.Table({initial:8642, maximum:8642, element:"anyfunc"}), za = !1;
function assert(a, b) {
  a || t("Assertion failed: " + b);
}
function Aa(a) {
  if ("number" === typeof a) {
    var b = !0;
    var c = a;
  } else {
    b = !1, c = a.length;
  }
  var d = Ba(Math.max(c, 1));
  if (b) {
    a = d;
    assert(0 == (d & 3));
    for (b = d + (c & -4); a < b; a += 4) {
      u[a >> 2] = 0;
    }
    for (b = d + c; a < b;) {
      w[a++ >> 0] = 0;
    }
    return d;
  }
  a.subarray || a.slice ? y.set(a, d) : y.set(new Uint8Array(a), d);
  return d;
}
var Ca = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function Da(a, b, c) {
  var d = b + c;
  for (c = b; a[c] && !(c >= d);) {
    ++c;
  }
  if (16 < c - b && a.subarray && Ca) {
    return Ca.decode(a.subarray(b, c));
  }
  for (d = ""; b < c;) {
    var e = a[b++];
    if (e & 128) {
      var f = a[b++] & 63;
      if (192 == (e & 224)) {
        d += String.fromCharCode((e & 31) << 6 | f);
      } else {
        var k = a[b++] & 63;
        e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;
        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      d += String.fromCharCode(e);
    }
  }
  return d;
}
function A(a, b) {
  return a ? Da(y, a, b) : "";
}
function Ea(a, b, c, d) {
  if (!(0 < d)) {
    return 0;
  }
  var e = c;
  d = c + d - 1;
  for (var f = 0; f < a.length; ++f) {
    var k = a.charCodeAt(f);
    if (55296 <= k && 57343 >= k) {
      var l = a.charCodeAt(++f);
      k = 65536 + ((k & 1023) << 10) | l & 1023;
    }
    if (127 >= k) {
      if (c >= d) {
        break;
      }
      b[c++] = k;
    } else {
      if (2047 >= k) {
        if (c + 1 >= d) {
          break;
        }
        b[c++] = 192 | k >> 6;
      } else {
        if (65535 >= k) {
          if (c + 2 >= d) {
            break;
          }
          b[c++] = 224 | k >> 12;
        } else {
          if (c + 3 >= d) {
            break;
          }
          b[c++] = 240 | k >> 18;
          b[c++] = 128 | k >> 12 & 63;
        }
        b[c++] = 128 | k >> 6 & 63;
      }
      b[c++] = 128 | k & 63;
    }
  }
  b[c] = 0;
  return c - e;
}
function n(a, b, c) {
  return Ea(a, y, b, c);
}
function h(a) {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    55296 <= d && 57343 >= d && (d = 65536 + ((d & 1023) << 10) | a.charCodeAt(++c) & 1023);
    127 >= d ? ++b : b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4;
  }
  return b;
}
"undefined" !== typeof TextDecoder && new TextDecoder("utf-16le");
var buffer, w, y, Fa, Ha, u, C, D, Ia;
function Ja(a) {
  buffer = a;
  g.HEAP8 = w = new Int8Array(a);
  g.HEAP16 = Fa = new Int16Array(a);
  g.HEAP32 = u = new Int32Array(a);
  g.HEAPU8 = y = new Uint8Array(a);
  g.HEAPU16 = Ha = new Uint16Array(a);
  g.HEAPU32 = C = new Uint32Array(a);
  g.HEAPF32 = D = new Float32Array(a);
  g.HEAPF64 = Ia = new Float64Array(a);
}
var Ka = g.TOTAL_MEMORY || 134217728;
g.wasmMemory ? xa = g.wasmMemory : xa = new WebAssembly.Memory({initial:Ka / 65536});
xa && (buffer = xa.buffer);
Ka = buffer.byteLength;
Ja(buffer);
u[460692] = 7085808;
function La(a) {
  for (; 0 < a.length;) {
    var b = a.shift();
    if ("function" == typeof b) {
      b();
    } else {
      var c = b.xm;
      "number" === typeof c ? void 0 === b.Sl ? g.dynCall_v(c) : g.dynCall_vi(c, b.Sl) : c(void 0 === b.Sl ? null : b.Sl);
    }
  }
}
var Ma = [], Na = [], Oa = [], Pa = [], Qa = !1;
function Ra() {
  var a = g.preRun.shift();
  Ma.unshift(a);
}
var Sa = Math.abs, Ta = Math.ceil, Ua = Math.floor, Wa = Math.min, Xa = 0, Ya = null, Za = null;
g.preloadedImages = {};
g.preloadedAudios = {};
function t(a) {
  if (g.onAbort) {
    g.onAbort(a);
  }
  qa(a);
  ra(a);
  za = !0;
  throw new WebAssembly.RuntimeError("abort(" + a + "). Build with -s ASSERTIONS=1 for more info.");
}
function $a() {
  var a = ab;
  return String.prototype.startsWith ? a.startsWith("data:application/octet-stream;base64,") : 0 === a.indexOf("data:application/octet-stream;base64,");
}
var ab = "canvaskit.wasm";
if (!$a()) {
  var bb = ab;
  ab = g.locateFile ? g.locateFile(bb, p) : p + bb;
}
function cb() {
  try {
    if (va) {
      return new Uint8Array(va);
    }
    if (ma) {
      return ma(ab);
    }
    throw "both async and sync fetching of the wasm failed";
  } catch (a) {
    t(a);
  }
}
function db() {
  return va || !fa && !ha || "function" !== typeof fetch ? new Promise(function(a) {
    a(cb());
  }) : fetch(ab, {credentials:"same-origin"}).then(function(a) {
    if (!a.ok) {
      throw "failed to load wasm binary file at '" + ab + "'";
    }
    return a.arrayBuffer();
  }).catch(function() {
    return cb();
  });
}
var F, G;
Na.push({xm:function() {
  eb();
}});
function fb(a) {
  g.___errno_location && (u[g.___errno_location() >> 2] = a);
}
var gb = [null, [], []], hb = 0;
function H() {
  hb += 4;
  return u[hb - 4 >> 2];
}
var ib = {}, jb = {};
function kb(a) {
  for (; a.length;) {
    var b = a.pop();
    a.pop()(b);
  }
}
function lb(a) {
  return this.fromWireType(C[a >> 2]);
}
var mb = {}, nb = {}, ob = {};
function pb(a) {
  if (void 0 === a) {
    return "_unknown";
  }
  a = a.replace(/[^a-zA-Z0-9_]/g, "$");
  var b = a.charCodeAt(0);
  return 48 <= b && 57 >= b ? "_" + a : a;
}
function qb(a, b) {
  a = pb(a);
  return (new Function("body", "return function " + a + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n'))(b);
}
function rb(a) {
  var b = Error, c = qb(a, function(b) {
    this.name = a;
    this.message = b;
    b = Error(b).stack;
    void 0 !== b && (this.stack = this.toString() + "\n" + b.replace(/^Error(:[^\n]*)?\n/, ""));
  });
  c.prototype = Object.create(b.prototype);
  c.prototype.constructor = c;
  c.prototype.toString = function() {
    return void 0 === this.message ? this.name : this.name + ": " + this.message;
  };
  return c;
}
var sb = void 0;
function tb(a) {
  throw new sb(a);
}
function I(a, b, c) {
  function d(b) {
    b = c(b);
    b.length !== a.length && tb("Mismatched type converter count");
    for (var d = 0; d < a.length; ++d) {
      ub(a[d], b[d]);
    }
  }
  a.forEach(function(a) {
    ob[a] = b;
  });
  var e = Array(b.length), f = [], k = 0;
  b.forEach(function(a, b) {
    nb.hasOwnProperty(a) ? e[b] = nb[a] : (f.push(a), mb.hasOwnProperty(a) || (mb[a] = []), mb[a].push(function() {
      e[b] = nb[a];
      ++k;
      k === f.length && d(e);
    }));
  });
  0 === f.length && d(e);
}
var wb = {};
function xb(a) {
  switch(a) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 4:
      return 2;
    case 8:
      return 3;
    default:
      throw new TypeError("Unknown type size: " + a);
  }
}
var yb = void 0;
function J(a) {
  for (var b = ""; y[a];) {
    b += yb[y[a++]];
  }
  return b;
}
var zb = void 0;
function K(a) {
  throw new zb(a);
}
function ub(a, b, c) {
  c = c || {};
  if (!("argPackAdvance" in b)) {
    throw new TypeError("registerType registeredInstance requires argPackAdvance");
  }
  var d = b.name;
  a || K('type "' + d + '" must have a positive integer typeid pointer');
  if (nb.hasOwnProperty(a)) {
    if (c.Rm) {
      return;
    }
    K("Cannot register type '" + d + "' twice");
  }
  nb[a] = b;
  delete ob[a];
  mb.hasOwnProperty(a) && (b = mb[a], delete mb[a], b.forEach(function(a) {
    a();
  }));
}
function Ab(a) {
  return {count:a.count, yl:a.yl, Jl:a.Jl, Ik:a.Ik, Nk:a.Nk, Vk:a.Vk, Zk:a.Zk};
}
function Bb(a) {
  K(a.Ck.Nk.Gk.name + " instance already deleted");
}
var Cb = !1;
function Db() {
}
function Eb(a) {
  --a.count.value;
  0 === a.count.value && (a.Vk ? a.Zk.Yk(a.Vk) : a.Nk.Gk.Yk(a.Ik));
}
function Fb(a) {
  if ("undefined" === typeof FinalizationGroup) {
    return Fb = function(a) {
      return a;
    }, a;
  }
  Cb = new FinalizationGroup(function(a) {
    for (var b = a.next(); !b.done; b = a.next()) {
      b = b.value, b.Ik ? Eb(b) : console.warn("object already deleted: " + b.Ik);
    }
  });
  Fb = function(a) {
    Cb.register(a, a.Ck, a.Ck);
    return a;
  };
  Db = function(a) {
    Cb.unregister(a.Ck);
  };
  return Fb(a);
}
var Gb = void 0, Hb = [];
function Ib() {
  for (; Hb.length;) {
    var a = Hb.pop();
    a.Ck.yl = !1;
    a["delete"]();
  }
}
function Jb() {
}
var Kb = {};
function Lb(a, b, c) {
  if (void 0 === a[b].Qk) {
    var d = a[b];
    a[b] = function() {
      a[b].Qk.hasOwnProperty(arguments.length) || K("Function '" + c + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + a[b].Qk + ")!");
      return a[b].Qk[arguments.length].apply(this, arguments);
    };
    a[b].Qk = [];
    a[b].Qk[d.wl] = d;
  }
}
function Mb(a, b, c) {
  g.hasOwnProperty(a) ? ((void 0 === c || void 0 !== g[a].Qk && void 0 !== g[a].Qk[c]) && K("Cannot register public name '" + a + "' twice"), Lb(g, a, a), g.hasOwnProperty(c) && K("Cannot register multiple overloads of a function with the same number of arguments (" + c + ")!"), g[a].Qk[c] = b) : (g[a] = b, void 0 !== c && (g[a].Qn = c));
}
function Nb(a, b, c, d, e, f, k, l) {
  this.name = a;
  this.constructor = b;
  this.zl = c;
  this.Yk = d;
  this.al = e;
  this.Nm = f;
  this.Ml = k;
  this.Im = l;
  this.cn = [];
}
function Ob(a, b, c) {
  for (; b !== c;) {
    b.Ml || K("Expected null or instance of " + c.name + ", got an instance of " + b.name), a = b.Ml(a), b = b.al;
  }
  return a;
}
function Pb(a, b) {
  if (null === b) {
    return this.im && K("null is not a valid " + this.name), 0;
  }
  b.Ck || K('Cannot pass "' + Qb(b) + '" as a ' + this.name);
  b.Ck.Ik || K("Cannot pass deleted object as a pointer of type " + this.name);
  return Ob(b.Ck.Ik, b.Ck.Nk.Gk, this.Gk);
}
function Rb(a, b) {
  if (null === b) {
    this.im && K("null is not a valid " + this.name);
    if (this.Ul) {
      var c = this.Kl();
      null !== a && a.push(this.Yk, c);
      return c;
    }
    return 0;
  }
  b.Ck || K('Cannot pass "' + Qb(b) + '" as a ' + this.name);
  b.Ck.Ik || K("Cannot pass deleted object as a pointer of type " + this.name);
  !this.Tl && b.Ck.Nk.Tl && K("Cannot convert argument of type " + (b.Ck.Zk ? b.Ck.Zk.name : b.Ck.Nk.name) + " to parameter type " + this.name);
  c = Ob(b.Ck.Ik, b.Ck.Nk.Gk, this.Gk);
  if (this.Ul) {
    switch(void 0 === b.Ck.Vk && K("Passing raw pointer to smart pointer is illegal"), this.gn) {
      case 0:
        b.Ck.Zk === this ? c = b.Ck.Vk : K("Cannot convert argument of type " + (b.Ck.Zk ? b.Ck.Zk.name : b.Ck.Nk.name) + " to parameter type " + this.name);
        break;
      case 1:
        c = b.Ck.Vk;
        break;
      case 2:
        if (b.Ck.Zk === this) {
          c = b.Ck.Vk;
        } else {
          var d = b.clone();
          c = this.en(c, Sb(function() {
            d["delete"]();
          }));
          null !== a && a.push(this.Yk, c);
        }
        break;
      default:
        K("Unsupporting sharing policy");
    }
  }
  return c;
}
function Tb(a, b) {
  if (null === b) {
    return this.im && K("null is not a valid " + this.name), 0;
  }
  b.Ck || K('Cannot pass "' + Qb(b) + '" as a ' + this.name);
  b.Ck.Ik || K("Cannot pass deleted object as a pointer of type " + this.name);
  b.Ck.Nk.Tl && K("Cannot convert argument of type " + b.Ck.Nk.name + " to parameter type " + this.name);
  return Ob(b.Ck.Ik, b.Ck.Nk.Gk, this.Gk);
}
function Ub(a, b, c) {
  if (b === c) {
    return a;
  }
  if (void 0 === c.al) {
    return null;
  }
  a = Ub(a, b, c.al);
  return null === a ? null : c.Im(a);
}
var Vb = {};
function Wb(a, b) {
  for (void 0 === b && K("ptr should not be undefined"); a.al;) {
    b = a.Ml(b), a = a.al;
  }
  return Vb[b];
}
function Xb(a, b) {
  b.Nk && b.Ik || tb("makeClassHandle requires ptr and ptrType");
  !!b.Zk !== !!b.Vk && tb("Both smartPtrType and smartPtr must be specified");
  b.count = {value:1};
  return Fb(Object.create(a, {Ck:{value:b}}));
}
function Yb(a, b, c, d, e, f, k, l, m, q, r) {
  this.name = a;
  this.Gk = b;
  this.im = c;
  this.Tl = d;
  this.Ul = e;
  this.bn = f;
  this.gn = k;
  this.Am = l;
  this.Kl = m;
  this.en = q;
  this.Yk = r;
  e || void 0 !== b.al ? this.toWireType = Rb : (this.toWireType = d ? Pb : Tb, this.Uk = null);
}
function Zb(a, b, c) {
  g.hasOwnProperty(a) || tb("Replacing nonexistant public symbol");
  void 0 !== g[a].Qk && void 0 !== c ? g[a].Qk[c] = b : (g[a] = b, g[a].wl = c);
}
function M(a, b) {
  a = J(a);
  if (void 0 !== g["FUNCTION_TABLE_" + a]) {
    var c = g["FUNCTION_TABLE_" + a][b];
  } else {
    if ("undefined" !== typeof FUNCTION_TABLE) {
      c = FUNCTION_TABLE[b];
    } else {
      c = g["dynCall_" + a];
      void 0 === c && (c = g["dynCall_" + a.replace(/f/g, "d")], void 0 === c && K("No dynCall invoker for signature: " + a));
      for (var d = [], e = 1; e < a.length; ++e) {
        d.push("a" + e);
      }
      e = "return function " + ("dynCall_" + a + "_" + b) + "(" + d.join(", ") + ") {\n";
      e += "    return dynCall(rawFunction" + (d.length ? ", " : "") + d.join(", ") + ");\n";
      c = (new Function("dynCall", "rawFunction", e + "};\n"))(c, b);
    }
  }
  "function" !== typeof c && K("unknown function pointer with signature " + a + ": " + b);
  return c;
}
var $b = void 0;
function ac(a) {
  a = bc(a);
  var b = J(a);
  cc(a);
  return b;
}
function dc(a, b) {
  function c(a) {
    e[a] || nb[a] || (ob[a] ? ob[a].forEach(c) : (d.push(a), e[a] = !0));
  }
  var d = [], e = {};
  b.forEach(c);
  throw new $b(a + ": " + d.map(ac).join([", "]));
}
function ec(a) {
  var b = Function;
  if (!(b instanceof Function)) {
    throw new TypeError("new_ called with constructor type " + typeof b + " which is not a function");
  }
  var c = qb(b.name || "unknownFunctionName", function() {
  });
  c.prototype = b.prototype;
  c = new c;
  a = b.apply(c, a);
  return a instanceof Object ? a : c;
}
function fc(a, b, c, d, e) {
  var f = b.length;
  2 > f && K("argTypes array size mismatch! Must at least get return value and 'this' types!");
  var k = null !== b[1] && null !== c, l = !1;
  for (c = 1; c < b.length; ++c) {
    if (null !== b[c] && void 0 === b[c].Uk) {
      l = !0;
      break;
    }
  }
  var m = "void" !== b[0].name, q = "", r = "";
  for (c = 0; c < f - 2; ++c) {
    q += (0 !== c ? ", " : "") + "arg" + c, r += (0 !== c ? ", " : "") + "arg" + c + "Wired";
  }
  a = "return function " + pb(a) + "(" + q + ") {\nif (arguments.length !== " + (f - 2) + ") {\nthrowBindingError('function " + a + " called with ' + arguments.length + ' arguments, expected " + (f - 2) + " args!');\n}\n";
  l && (a += "var destructors = [];\n");
  var x = l ? "destructors" : "null";
  q = "throwBindingError invoker fn runDestructors retType classParam".split(" ");
  d = [K, d, e, kb, b[0], b[1]];
  k && (a += "var thisWired = classParam.toWireType(" + x + ", this);\n");
  for (c = 0; c < f - 2; ++c) {
    a += "var arg" + c + "Wired = argType" + c + ".toWireType(" + x + ", arg" + c + "); // " + b[c + 2].name + "\n", q.push("argType" + c), d.push(b[c + 2]);
  }
  k && (r = "thisWired" + (0 < r.length ? ", " : "") + r);
  a += (m ? "var rv = " : "") + "invoker(fn" + (0 < r.length ? ", " : "") + r + ");\n";
  if (l) {
    a += "runDestructors(destructors);\n";
  } else {
    for (c = k ? 1 : 2; c < b.length; ++c) {
      f = 1 === c ? "thisWired" : "arg" + (c - 2) + "Wired", null !== b[c].Uk && (a += f + "_dtor(" + f + "); // " + b[c].name + "\n", q.push(f + "_dtor"), d.push(b[c].Uk));
    }
  }
  m && (a += "var ret = retType.fromWireType(rv);\nreturn ret;\n");
  q.push(a + "}\n");
  return ec(q).apply(null, d);
}
function hc(a, b) {
  for (var c = [], d = 0; d < a; d++) {
    c.push(u[(b >> 2) + d]);
  }
  return c;
}
var ic = [], N = [{}, {value:void 0}, {value:null}, {value:!0}, {value:!1}];
function jc(a) {
  4 < a && 0 === --N[a].jm && (N[a] = void 0, ic.push(a));
}
function Sb(a) {
  switch(a) {
    case void 0:
      return 1;
    case null:
      return 2;
    case !0:
      return 3;
    case !1:
      return 4;
    default:
      var b = ic.length ? ic.pop() : N.length;
      N[b] = {jm:1, value:a};
      return b;
  }
}
function kc(a, b, c) {
  switch(b) {
    case 0:
      return function(a) {
        return this.fromWireType((c ? w : y)[a]);
      };
    case 1:
      return function(a) {
        return this.fromWireType((c ? Fa : Ha)[a >> 1]);
      };
    case 2:
      return function(a) {
        return this.fromWireType((c ? u : C)[a >> 2]);
      };
    default:
      throw new TypeError("Unknown integer type: " + a);
  }
}
function lc(a, b) {
  var c = nb[a];
  void 0 === c && K(b + " has unknown type " + ac(a));
  return c;
}
function Qb(a) {
  if (null === a) {
    return "null";
  }
  var b = typeof a;
  return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
}
function mc(a, b) {
  switch(b) {
    case 2:
      return function(a) {
        return this.fromWireType(D[a >> 2]);
      };
    case 3:
      return function(a) {
        return this.fromWireType(Ia[a >> 3]);
      };
    default:
      throw new TypeError("Unknown float type: " + a);
  }
}
function nc(a, b, c) {
  switch(b) {
    case 0:
      return c ? function(a) {
        return w[a];
      } : function(a) {
        return y[a];
      };
    case 1:
      return c ? function(a) {
        return Fa[a >> 1];
      } : function(a) {
        return Ha[a >> 1];
      };
    case 2:
      return c ? function(a) {
        return u[a >> 2];
      } : function(a) {
        return C[a >> 2];
      };
    default:
      throw new TypeError("Unknown integer type: " + a);
  }
}
var oc = {};
function pc(a) {
  var b = oc[a];
  return void 0 === b ? J(a) : b;
}
var qc = [];
function rc(a) {
  a || K("Cannot use deleted val. handle = " + a);
  return N[a].value;
}
function sc(a) {
  var b = qc.length;
  qc.push(a);
  return b;
}
function tc(a, b) {
  for (var c = Array(a), d = 0; d < a; ++d) {
    c[d] = lc(u[(b >> 2) + d], "parameter " + d);
  }
  return c;
}
function uc() {
  t();
}
function vc(a, b) {
  wc = a;
  xc = b;
  if (yc) {
    if (0 == a) {
      zc = function() {
        var a = Math.max(0, Ac + b - uc()) | 0;
        setTimeout(Bc, a);
      };
    } else {
      if (1 == a) {
        zc = function() {
          Cc(Bc);
        };
      } else {
        if (2 == a) {
          if ("undefined" === typeof setImmediate) {
            var c = [];
            addEventListener("message", function(a) {
              if ("setimmediate" === a.data || "setimmediate" === a.data.target) {
                a.stopPropagation(), c.shift()();
              }
            }, !0);
            setImmediate = function(a) {
              c.push(a);
              ha ? (void 0 === g.setImmediates && (g.setImmediates = []), g.setImmediates.push(a), postMessage({target:"setimmediate"})) : postMessage("setimmediate", "*");
            };
          }
          zc = function() {
            setImmediate(Bc);
          };
        }
      }
    }
  }
}
function Dc(a) {
  var b = Ec;
  wa = !0;
  assert(!yc, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
  yc = a;
  Ec = b;
  var c = "undefined" !== typeof b ? function() {
    g.dynCall_vi(a, b);
  } : function() {
    g.dynCall_v(a);
  };
  var d = Fc;
  Bc = function() {
    if (!za) {
      if (0 < Gc.length) {
        var a = Date.now(), b = Gc.shift();
        b.xm(b.Sl);
        if (Lc) {
          var k = Lc, l = 0 == k % 1 ? k - 1 : Math.floor(k);
          Lc = b.En ? l : (8 * k + (l + .5)) / 9;
        }
        console.log('main loop blocker "' + b.name + '" took ' + (Date.now() - a) + " ms");
        g.setStatus && (a = g.statusMessage || "Please wait...", b = Lc, k = Mc.Hn, b ? b < k ? g.setStatus(a + " (" + (k - b) + "/" + k + ")") : g.setStatus(a) : g.setStatus(""));
        d < Fc || setTimeout(Bc, 0);
      } else {
        if (!(d < Fc)) {
          if (Nc = Nc + 1 | 0, 1 == wc && 1 < xc && 0 != Nc % xc) {
            zc();
          } else {
            0 == wc && (Ac = uc());
            a: {
              if (!(za || g.preMainLoop && !1 === g.preMainLoop())) {
                try {
                  c();
                } catch (m) {
                  if (m instanceof pa) {
                    break a;
                  }
                  m && "object" === typeof m && m.stack && ra("exception thrown: " + [m, m.stack]);
                  throw m;
                }
                g.postMainLoop && g.postMainLoop();
              }
            }
            d < Fc || ("object" === typeof SDL && SDL.audio && SDL.audio.dn && SDL.audio.dn(), zc());
          }
        }
      }
    }
  };
}
var zc = null, Fc = 0, yc = null, Ec = 0, wc = 0, xc = 0, Nc = 0, Gc = [], Mc = {}, Ac, Bc, Lc, Oc = !1, Pc = !1, Qc = [];
function Rc() {
  function a() {
    Pc = document.pointerLockElement === g.canvas || document.mozPointerLockElement === g.canvas || document.webkitPointerLockElement === g.canvas || document.msPointerLockElement === g.canvas;
  }
  g.preloadPlugins || (g.preloadPlugins = []);
  if (!Sc) {
    Sc = !0;
    try {
      Tc = !0;
    } catch (c) {
      Tc = !1, console.log("warning: no blob constructor, cannot create blobs with mimetypes");
    }
    Uc = "undefined" != typeof MozBlobBuilder ? MozBlobBuilder : "undefined" != typeof WebKitBlobBuilder ? WebKitBlobBuilder : Tc ? null : console.log("warning: no BlobBuilder");
    Vc = "undefined" != typeof window ? window.URL ? window.URL : window.webkitURL : void 0;
    g.zm || "undefined" !== typeof Vc || (console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available."), g.zm = !0);
    g.preloadPlugins.push({canHandle:function(a) {
      return !g.zm && /\.(jpg|jpeg|png|bmp)$/i.test(a);
    }, handle:function(a, b, e, f) {
      var c = null;
      if (Tc) {
        try {
          c = new Blob([a], {type:Wc(b)}), c.size !== a.length && (c = new Blob([(new Uint8Array(a)).buffer], {type:Wc(b)}));
        } catch (q) {
          sa("Blob constructor present but fails: " + q + "; falling back to blob builder");
        }
      }
      c || (c = new Uc, c.append((new Uint8Array(a)).buffer), c = c.getBlob());
      var d = Vc.createObjectURL(c), m = new Image;
      m.onload = function() {
        assert(m.complete, "Image " + b + " could not be decoded");
        var c = document.createElement("canvas");
        c.width = m.width;
        c.height = m.height;
        c.getContext("2d").drawImage(m, 0, 0);
        g.preloadedImages[b] = c;
        Vc.revokeObjectURL(d);
        e && e(a);
      };
      m.onerror = function() {
        console.log("Image " + d + " could not be decoded");
        f && f();
      };
      m.src = d;
    }});
    g.preloadPlugins.push({canHandle:function(a) {
      return !g.Pn && a.substr(-4) in {".ogg":1, ".wav":1, ".mp3":1};
    }, handle:function(a, b, e, f) {
      function c(c) {
        m || (m = !0, g.preloadedAudios[b] = c, e && e(a));
      }
      function d() {
        m || (m = !0, g.preloadedAudios[b] = new Audio, f && f());
      }
      var m = !1;
      if (Tc) {
        try {
          var q = new Blob([a], {type:Wc(b)});
        } catch (x) {
          return d();
        }
        q = Vc.createObjectURL(q);
        var r = new Audio;
        r.addEventListener("canplaythrough", function() {
          c(r);
        }, !1);
        r.onerror = function() {
          if (!m) {
            console.log("warning: browser could not fully decode audio " + b + ", trying slower base64 approach");
            for (var d = "", e = 0, f = 0, k = 0; k < a.length; k++) {
              for (e = e << 8 | a[k], f += 8; 6 <= f;) {
                var l = e >> f - 6 & 63;
                f -= 6;
                d += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[l];
              }
            }
            2 == f ? (d += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[(e & 3) << 4], d += "==") : 4 == f && (d += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[(e & 15) << 2], d += "=");
            r.src = "data:audio/x-" + b.substr(-3) + ";base64," + d;
            c(r);
          }
        };
        r.src = q;
        Xc(function() {
          c(r);
        });
      } else {
        return d();
      }
    }});
    var b = g.canvas;
    b && (b.requestPointerLock = b.requestPointerLock || b.mozRequestPointerLock || b.webkitRequestPointerLock || b.msRequestPointerLock || function() {
    }, b.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || function() {
    }, b.exitPointerLock = b.exitPointerLock.bind(document), document.addEventListener("pointerlockchange", a, !1), document.addEventListener("mozpointerlockchange", a, !1), document.addEventListener("webkitpointerlockchange", a, !1), document.addEventListener("mspointerlockchange", a, !1), g.elementPointerLock && b.addEventListener("click", function(a) {
      !Pc && g.canvas.requestPointerLock && (g.canvas.requestPointerLock(), a.preventDefault());
    }, !1));
  }
}
function Yc(a, b, c, d) {
  if (b && g.dm && a == g.canvas) {
    return g.dm;
  }
  var e;
  if (b) {
    var f = {antialias:!1, alpha:!1, Il:"undefined" !== typeof WebGL2RenderingContext ? 2 : 1};
    if (d) {
      for (var k in d) {
        f[k] = d[k];
      }
    }
    if ("undefined" !== typeof Zc && (e = aa(a, f))) {
      var l = $c[e].Zl;
    }
  } else {
    l = a.getContext("2d");
  }
  if (!l) {
    return null;
  }
  c && (b || assert("undefined" === typeof O, "cannot set in module if GLctx is used, but we are a non-GL context that would replace it"), g.dm = l, b && ad(e), g.Un = b, Qc.forEach(function(a) {
    a();
  }), Rc());
  return l;
}
var bd = !1, cd = void 0, dd = void 0;
function ed(a, b, c) {
  function d() {
    Oc = !1;
    var a = e.parentNode;
    (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === a ? (e.exitFullscreen = fd, cd && e.requestPointerLock(), Oc = !0, dd ? ("undefined" != typeof SDL && (u[SDL.screen >> 2] = C[SDL.screen >> 2] | 8388608), gd(g.canvas), hd()) : gd(e)) : (a.parentNode.insertBefore(e, a), a.parentNode.removeChild(a), dd ? ("undefined" != typeof SDL && (u[SDL.screen >> 2] = C[SDL.screen >> 
    2] & -8388609), gd(g.canvas), hd()) : gd(e));
    if (g.onFullScreen) {
      g.onFullScreen(Oc);
    }
    if (g.onFullscreen) {
      g.onFullscreen(Oc);
    }
  }
  cd = a;
  dd = b;
  id = c;
  "undefined" === typeof cd && (cd = !0);
  "undefined" === typeof dd && (dd = !1);
  "undefined" === typeof id && (id = null);
  var e = g.canvas;
  bd || (bd = !0, document.addEventListener("fullscreenchange", d, !1), document.addEventListener("mozfullscreenchange", d, !1), document.addEventListener("webkitfullscreenchange", d, !1), document.addEventListener("MSFullscreenChange", d, !1));
  var f = document.createElement("div");
  e.parentNode.insertBefore(f, e);
  f.appendChild(e);
  f.requestFullscreen = f.requestFullscreen || f.mozRequestFullScreen || f.msRequestFullscreen || (f.webkitRequestFullscreen ? function() {
    f.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } : null) || (f.webkitRequestFullScreen ? function() {
    f.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } : null);
  c ? f.requestFullscreen({Vn:c}) : f.requestFullscreen();
}
function fd() {
  if (!Oc) {
    return !1;
  }
  (document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen || document.webkitCancelFullScreen || function() {
  }).apply(document, []);
  return !0;
}
var jd = 0;
function Cc(a) {
  if ("function" === typeof requestAnimationFrame) {
    requestAnimationFrame(a);
  } else {
    var b = Date.now();
    if (0 === jd) {
      jd = b + 1e3 / 60;
    } else {
      for (; b + 2 >= jd;) {
        jd += 1e3 / 60;
      }
    }
    setTimeout(a, Math.max(jd - b, 0));
  }
}
function Xc(a) {
  wa = !0;
  setTimeout(function() {
    za || a();
  }, 1e4);
}
function Wc(a) {
  return {jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png", bmp:"image/bmp", ogg:"audio/ogg", wav:"audio/wav", mp3:"audio/mpeg"}[a.substr(a.lastIndexOf(".") + 1)];
}
var kd = [];
function hd() {
  var a = g.canvas;
  kd.forEach(function(b) {
    b(a.width, a.height);
  });
}
function gd(a, b, c) {
  b && c ? (a.tn = b, a.Qm = c) : (b = a.tn, c = a.Qm);
  var d = b, e = c;
  g.forcedAspectRatio && 0 < g.forcedAspectRatio && (d / e < g.forcedAspectRatio ? d = Math.round(e * g.forcedAspectRatio) : e = Math.round(d / g.forcedAspectRatio));
  if ((document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === a.parentNode && "undefined" != typeof screen) {
    var f = Math.min(screen.width / d, screen.height / e);
    d = Math.round(d * f);
    e = Math.round(e * f);
  }
  dd ? (a.width != d && (a.width = d), a.height != e && (a.height = e), "undefined" != typeof a.style && (a.style.removeProperty("width"), a.style.removeProperty("height"))) : (a.width != b && (a.width = b), a.height != c && (a.height = c), "undefined" != typeof a.style && (d != b || e != c ? (a.style.setProperty("width", d + "px", "important"), a.style.setProperty("height", e + "px", "important")) : (a.style.removeProperty("width"), a.style.removeProperty("height"))));
}
var Sc, Tc, Uc, Vc, id, ld = {};
function md(a) {
  var b = a.getExtension("ANGLE_instanced_arrays");
  b && (a.vertexAttribDivisor = function(a, d) {
    b.vertexAttribDivisorANGLE(a, d);
  }, a.drawArraysInstanced = function(a, d, e, f) {
    b.drawArraysInstancedANGLE(a, d, e, f);
  }, a.drawElementsInstanced = function(a, d, e, f, k) {
    b.drawElementsInstancedANGLE(a, d, e, f, k);
  });
}
function nd(a) {
  var b = a.getExtension("OES_vertex_array_object");
  b && (a.createVertexArray = function() {
    return b.createVertexArrayOES();
  }, a.deleteVertexArray = function(a) {
    b.deleteVertexArrayOES(a);
  }, a.bindVertexArray = function(a) {
    b.bindVertexArrayOES(a);
  }, a.isVertexArray = function(a) {
    return b.isVertexArrayOES(a);
  });
}
function od(a) {
  var b = a.getExtension("WEBGL_draw_buffers");
  b && (a.drawBuffers = function(a, d) {
    b.drawBuffersWEBGL(a, d);
  });
}
var pd = 1, qd = 0, rd = [], P = [], sd = [], td = [], Q = [], R = [], S = [], ud = [], $c = {}, T = null, vd = [], wd = [], xd = [], yd = [], zd = [], Ad = {}, Bd = {}, Cd = {}, Dd = 4;
function U(a) {
  qd || (qd = a);
}
function Ed(a) {
  for (var b = pd++, c = a.length; c < b; c++) {
    a[c] = null;
  }
  return b;
}
var V = [0], Fd = [0];
function Gd(a, b, c) {
  for (var d = "", e = 0; e < a; ++e) {
    var f = c ? u[c + 4 * e >> 2] : -1;
    d += A(u[b + 4 * e >> 2], 0 > f ? void 0 : f);
  }
  return d;
}
function aa(a, b) {
  if (a = 1 < b.Il ? a.getContext("webgl2", b) : a.getContext("webgl", b)) {
    var c = Ba(8), d = {handle:c, attributes:b, version:b.Il, Zl:a};
    a.canvas && (a.canvas.wn = d);
    $c[c] = d;
    ("undefined" === typeof b.um || b.um) && Hd(d);
    b = c;
  } else {
    b = 0;
  }
  return b;
}
function ad(a) {
  T = $c[a];
  g.dm = O = T && T.Zl;
  return !(a && !O);
}
function Hd(a) {
  a || (a = T);
  if (!a.Sm) {
    a.Sm = !0;
    var b = a.Zl;
    2 > a.version && (md(b), nd(b), od(b));
    b.Xk = b.getExtension("EXT_disjoint_timer_query");
    var c = "OES_texture_float OES_texture_half_float OES_standard_derivatives OES_vertex_array_object WEBGL_compressed_texture_s3tc WEBGL_depth_texture OES_element_index_uint EXT_texture_filter_anisotropic EXT_frag_depth WEBGL_draw_buffers ANGLE_instanced_arrays OES_texture_float_linear OES_texture_half_float_linear EXT_blend_minmax EXT_shader_texture_lod WEBGL_compressed_texture_pvrtc EXT_color_buffer_half_float WEBGL_color_buffer_float EXT_sRGB WEBGL_compressed_texture_etc1 EXT_disjoint_timer_query WEBGL_compressed_texture_etc WEBGL_compressed_texture_astc EXT_color_buffer_float WEBGL_compressed_texture_s3tc_srgb EXT_disjoint_timer_query_webgl2 WEBKIT_WEBGL_compressed_texture_pvrtc".split(" ");
    (b.getSupportedExtensions() || []).forEach(function(a) {
      -1 != c.indexOf(a) && b.getExtension(a);
    });
  }
}
function Id(a) {
  var b = P[a];
  a = Ad[a] = {nm:{}, Vl:0, bl:-1, cl:-1};
  for (var c = a.nm, d = O.getProgramParameter(b, 35718), e = 0; e < d; ++e) {
    var f = O.getActiveUniform(b, e), k = f.name;
    a.Vl = Math.max(a.Vl, k.length + 1);
    "]" == k.slice(-1) && (k = k.slice(0, k.lastIndexOf("[")));
    var l = O.getUniformLocation(b, k);
    if (l) {
      var m = Ed(R);
      c[k] = [f.size, m];
      R[m] = l;
      for (var q = 1; q < f.size; ++q) {
        l = O.getUniformLocation(b, k + "[" + q + "]"), m = Ed(R), R[m] = l;
      }
    }
  }
}
var Zc = {}, Jd, Kd, Ld = [];
function Md(a, b, c, d) {
  O.drawElements(a, b, c, d);
}
function W(a, b, c, d) {
  for (var e = 0; e < a; e++) {
    var f = O[c](), k = f && Ed(d);
    f ? (f.name = k, d[k] = f) : U(1282);
    u[b + 4 * e >> 2] = k;
  }
}
function Nd(a, b, c) {
  if (b) {
    var d = void 0;
    switch(a) {
      case 36346:
        d = 1;
        break;
      case 36344:
        0 != c && 1 != c && U(1280);
        return;
      case 34814:
      case 36345:
        d = 0;
        break;
      case 34466:
        var e = O.getParameter(34467);
        d = e ? e.length : 0;
        break;
      case 33309:
        if (2 > T.version) {
          U(1282);
          return;
        }
        d = 2 * (O.getSupportedExtensions() || []).length;
        break;
      case 33307:
      case 33308:
        if (2 > T.version) {
          U(1280);
          return;
        }
        d = 33307 == a ? 3 : 0;
    }
    if (void 0 === d) {
      switch(e = O.getParameter(a), typeof e) {
        case "number":
          d = e;
          break;
        case "boolean":
          d = e ? 1 : 0;
          break;
        case "string":
          U(1280);
          return;
        case "object":
          if (null === e) {
            switch(a) {
              case 34964:
              case 35725:
              case 34965:
              case 36006:
              case 36007:
              case 32873:
              case 34229:
              case 35097:
              case 36389:
              case 34068:
                d = 0;
                break;
              default:
                U(1280);
                return;
            }
          } else {
            if (e instanceof Float32Array || e instanceof Uint32Array || e instanceof Int32Array || e instanceof Array) {
              for (a = 0; a < e.length; ++a) {
                switch(c) {
                  case 0:
                    u[b + 4 * a >> 2] = e[a];
                    break;
                  case 2:
                    D[b + 4 * a >> 2] = e[a];
                    break;
                  case 4:
                    w[b + a >> 0] = e[a] ? 1 : 0;
                }
              }
              return;
            }
            try {
              d = e.name | 0;
            } catch (f) {
              U(1280);
              ra("GL_INVALID_ENUM in glGet" + c + "v: Unknown object returned from WebGL getParameter(" + a + ")! (error: " + f + ")");
              return;
            }
          }
          break;
        default:
          U(1280);
          ra("GL_INVALID_ENUM in glGet" + c + "v: Native code calling glGet" + c + "v(" + a + ") and it returns " + e + " of type " + typeof e + "!");
          return;
      }
    }
    switch(c) {
      case 1:
        G = [d >>> 0, (F = d, 1 <= +Sa(F) ? 0 < F ? (Wa(+Ua(F / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ta((F - +(~~F >>> 0)) / 4294967296) >>> 0 : 0)];
        u[b >> 2] = G[0];
        u[b + 4 >> 2] = G[1];
        break;
      case 0:
        u[b >> 2] = d;
        break;
      case 2:
        D[b >> 2] = d;
        break;
      case 4:
        w[b >> 0] = d ? 1 : 0;
    }
  } else {
    U(1281);
  }
}
function Od(a, b, c, d) {
  if (c) {
    b = O.getIndexedParameter(a, b);
    switch(typeof b) {
      case "boolean":
        a = b ? 1 : 0;
        break;
      case "number":
        a = b;
        break;
      case "object":
        if (null === b) {
          switch(a) {
            case 35983:
            case 35368:
              a = 0;
              break;
            default:
              U(1280);
              return;
          }
        } else {
          if (b instanceof WebGLBuffer) {
            a = b.name | 0;
          } else {
            U(1280);
            return;
          }
        }
        break;
      default:
        U(1280);
        return;
    }
    switch(d) {
      case 1:
        G = [a >>> 0, (F = a, 1 <= +Sa(F) ? 0 < F ? (Wa(+Ua(F / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ta((F - +(~~F >>> 0)) / 4294967296) >>> 0 : 0)];
        u[c >> 2] = G[0];
        u[c + 4 >> 2] = G[1];
        break;
      case 0:
        u[c >> 2] = a;
        break;
      case 2:
        D[c >> 2] = a;
        break;
      case 4:
        w[c >> 0] = a ? 1 : 0;
        break;
      default:
        throw "internal emscriptenWebGLGetIndexed() error, bad type: " + d;
    }
  } else {
    U(1281);
  }
}
function Pd(a) {
  var b = h(a) + 1, c = Ba(b);
  n(a, c, b);
  return c;
}
function Qd(a, b, c, d) {
  if (c) {
    if (a = O.getUniform(P[a], R[b]), "number" == typeof a || "boolean" == typeof a) {
      switch(d) {
        case 0:
          u[c >> 2] = a;
          break;
        case 2:
          D[c >> 2] = a;
          break;
        default:
          throw "internal emscriptenWebGLGetUniform() error, bad type: " + d;
      }
    } else {
      for (b = 0; b < a.length; b++) {
        switch(d) {
          case 0:
            u[c + 4 * b >> 2] = a[b];
            break;
          case 2:
            D[c + 4 * b >> 2] = a[b];
            break;
          default:
            throw "internal emscriptenWebGLGetUniform() error, bad type: " + d;
        }
      }
    }
  } else {
    U(1281);
  }
}
function Rd(a, b, c, d) {
  if (c) {
    if (a = O.getVertexAttrib(a, b), 34975 == b) {
      u[c >> 2] = a.name;
    } else {
      if ("number" == typeof a || "boolean" == typeof a) {
        switch(d) {
          case 0:
            u[c >> 2] = a;
            break;
          case 2:
            D[c >> 2] = a;
            break;
          case 5:
            u[c >> 2] = Math.fround(a);
            break;
          default:
            throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + d;
        }
      } else {
        for (b = 0; b < a.length; b++) {
          switch(d) {
            case 0:
              u[c + 4 * b >> 2] = a[b];
              break;
            case 2:
              D[c + 4 * b >> 2] = a[b];
              break;
            case 5:
              u[c + 4 * b >> 2] = Math.fround(a[b]);
              break;
            default:
              throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + d;
          }
        }
      }
    }
  } else {
    U(1281);
  }
}
function Sd(a) {
  a -= 5120;
  return 0 == a ? w : 1 == a ? y : 2 == a ? Fa : 4 == a ? u : 6 == a ? D : 5 == a || 28922 == a || 28520 == a || 30779 == a || 30782 == a ? C : Ha;
}
function Td(a) {
  return 31 - Math.clz32(a.BYTES_PER_ELEMENT);
}
function Ud(a, b, c, d, e) {
  a = Sd(a);
  var f = Td(a), k = Dd;
  return a.subarray(e >> f, e + d * (c * ({5:3, 6:4, 8:2, 29502:3, 29504:4, 26917:2, 26918:2, 29846:3, 29847:4}[b - 6402] || 1) * (1 << f) + k - 1 & -k) >> f);
}
var Vd = 0;
function Wd(a, b, c, d) {
  a |= 0;
  b |= 0;
  c |= 0;
  d |= 0;
  var e = 0;
  Vd = Vd + 1 | 0;
  for (u[a >> 2] = Vd; (e | 0) < (d | 0);) {
    if (0 == (u[c + (e << 3) >> 2] | 0)) {
      return u[c + (e << 3) >> 2] = Vd, u[c + ((e << 3) + 4) >> 2] = b, u[c + ((e << 3) + 8) >> 2] = 0, ua = d | 0, c | 0;
    }
    e = e + 1 | 0;
  }
  d = 2 * d | 0;
  c = Xd(c | 0, 8 * (d + 1 | 0) | 0) | 0;
  c = Wd(a | 0, b | 0, c | 0, d | 0) | 0;
  ua = d | 0;
  return c | 0;
}
var Yd = {};
function ce() {
  if (!de) {
    var a = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" === typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _:da}, b;
    for (b in Yd) {
      a[b] = Yd[b];
    }
    var c = [];
    for (b in a) {
      c.push(b + "=" + a[b]);
    }
    de = c;
  }
  return de;
}
var de;
function ee(a) {
  return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400);
}
function fe(a, b) {
  for (var c = 0, d = 0; d <= b; c += a[d++]) {
  }
  return c;
}
var ge = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], he = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function ie(a, b) {
  for (a = new Date(a.getTime()); 0 < b;) {
    var c = a.getMonth(), d = (ee(a.getFullYear()) ? ge : he)[c];
    if (b > d - a.getDate()) {
      b -= d - a.getDate() + 1, a.setDate(1), 11 > c ? a.setMonth(c + 1) : (a.setMonth(0), a.setFullYear(a.getFullYear() + 1));
    } else {
      a.setDate(a.getDate() + b);
      break;
    }
  }
  return a;
}
function je(a, b, c, d) {
  function e(a, b, c) {
    for (a = "number" === typeof a ? a.toString() : a || ""; a.length < b;) {
      a = c[0] + a;
    }
    return a;
  }
  function f(a, b) {
    return e(a, b, "0");
  }
  function k(a, b) {
    function c(a) {
      return 0 > a ? -1 : 0 < a ? 1 : 0;
    }
    var d;
    0 === (d = c(a.getFullYear() - b.getFullYear())) && 0 === (d = c(a.getMonth() - b.getMonth())) && (d = c(a.getDate() - b.getDate()));
    return d;
  }
  function l(a) {
    switch(a.getDay()) {
      case 0:
        return new Date(a.getFullYear() - 1, 11, 29);
      case 1:
        return a;
      case 2:
        return new Date(a.getFullYear(), 0, 3);
      case 3:
        return new Date(a.getFullYear(), 0, 2);
      case 4:
        return new Date(a.getFullYear(), 0, 1);
      case 5:
        return new Date(a.getFullYear() - 1, 11, 31);
      case 6:
        return new Date(a.getFullYear() - 1, 11, 30);
    }
  }
  function m(a) {
    a = ie(new Date(a.Sk + 1900, 0, 1), a.Yl);
    var b = l(new Date(a.getFullYear() + 1, 0, 4));
    return 0 >= k(l(new Date(a.getFullYear(), 0, 4)), a) ? 0 >= k(b, a) ? a.getFullYear() + 1 : a.getFullYear() : a.getFullYear() - 1;
  }
  var q = u[d + 40 >> 2];
  d = {qn:u[d >> 2], pn:u[d + 4 >> 2], Wl:u[d + 8 >> 2], Ll:u[d + 12 >> 2], Al:u[d + 16 >> 2], Sk:u[d + 20 >> 2], Xl:u[d + 24 >> 2], Yl:u[d + 28 >> 2], Tn:u[d + 32 >> 2], nn:u[d + 36 >> 2], rn:q ? A(q) : ""};
  c = A(c);
  q = {"%c":"%a %b %d %H:%M:%S %Y", "%D":"%m/%d/%y", "%F":"%Y-%m-%d", "%h":"%b", "%r":"%I:%M:%S %p", "%R":"%H:%M", "%T":"%H:%M:%S", "%x":"%m/%d/%y", "%X":"%H:%M:%S", "%Ec":"%c", "%EC":"%C", "%Ex":"%m/%d/%y", "%EX":"%H:%M:%S", "%Ey":"%y", "%EY":"%Y", "%Od":"%d", "%Oe":"%e", "%OH":"%H", "%OI":"%I", "%Om":"%m", "%OM":"%M", "%OS":"%S", "%Ou":"%u", "%OU":"%U", "%OV":"%V", "%Ow":"%w", "%OW":"%W", "%Oy":"%y"};
  for (var r in q) {
    c = c.replace(new RegExp(r, "g"), q[r]);
  }
  var x = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), B = "January February March April May June July August September October November December".split(" ");
  q = {"%a":function(a) {
    return x[a.Xl].substring(0, 3);
  }, "%A":function(a) {
    return x[a.Xl];
  }, "%b":function(a) {
    return B[a.Al].substring(0, 3);
  }, "%B":function(a) {
    return B[a.Al];
  }, "%C":function(a) {
    return f((a.Sk + 1900) / 100 | 0, 2);
  }, "%d":function(a) {
    return f(a.Ll, 2);
  }, "%e":function(a) {
    return e(a.Ll, 2, " ");
  }, "%g":function(a) {
    return m(a).toString().substring(2);
  }, "%G":function(a) {
    return m(a);
  }, "%H":function(a) {
    return f(a.Wl, 2);
  }, "%I":function(a) {
    a = a.Wl;
    0 == a ? a = 12 : 12 < a && (a -= 12);
    return f(a, 2);
  }, "%j":function(a) {
    return f(a.Ll + fe(ee(a.Sk + 1900) ? ge : he, a.Al - 1), 3);
  }, "%m":function(a) {
    return f(a.Al + 1, 2);
  }, "%M":function(a) {
    return f(a.pn, 2);
  }, "%n":function() {
    return "\n";
  }, "%p":function(a) {
    return 0 <= a.Wl && 12 > a.Wl ? "AM" : "PM";
  }, "%S":function(a) {
    return f(a.qn, 2);
  }, "%t":function() {
    return "\t";
  }, "%u":function(a) {
    return a.Xl || 7;
  }, "%U":function(a) {
    var b = new Date(a.Sk + 1900, 0, 1), c = 0 === b.getDay() ? b : ie(b, 7 - b.getDay());
    a = new Date(a.Sk + 1900, a.Al, a.Ll);
    return 0 > k(c, a) ? f(Math.ceil((31 - c.getDate() + (fe(ee(a.getFullYear()) ? ge : he, a.getMonth() - 1) - 31) + a.getDate()) / 7), 2) : 0 === k(c, b) ? "01" : "00";
  }, "%V":function(a) {
    var b = l(new Date(a.Sk + 1900, 0, 4)), c = l(new Date(a.Sk + 1901, 0, 4)), d = ie(new Date(a.Sk + 1900, 0, 1), a.Yl);
    return 0 > k(d, b) ? "53" : 0 >= k(c, d) ? "01" : f(Math.ceil((b.getFullYear() < a.Sk + 1900 ? a.Yl + 32 - b.getDate() : a.Yl + 1 - b.getDate()) / 7), 2);
  }, "%w":function(a) {
    return a.Xl;
  }, "%W":function(a) {
    var b = new Date(a.Sk, 0, 1), c = 1 === b.getDay() ? b : ie(b, 0 === b.getDay() ? 1 : 7 - b.getDay() + 1);
    a = new Date(a.Sk + 1900, a.Al, a.Ll);
    return 0 > k(c, a) ? f(Math.ceil((31 - c.getDate() + (fe(ee(a.getFullYear()) ? ge : he, a.getMonth() - 1) - 31) + a.getDate()) / 7), 2) : 0 === k(c, b) ? "01" : "00";
  }, "%y":function(a) {
    return (a.Sk + 1900).toString().substring(2);
  }, "%Y":function(a) {
    return a.Sk + 1900;
  }, "%z":function(a) {
    a = a.nn;
    var b = 0 <= a;
    a = Math.abs(a) / 60;
    return (b ? "+" : "-") + String("0000" + (a / 60 * 100 + a % 60)).slice(-4);
  }, "%Z":function(a) {
    return a.rn;
  }, "%%":function() {
    return "%";
  }};
  for (r in q) {
    0 <= c.indexOf(r) && (c = c.replace(new RegExp(r, "g"), q[r](d)));
  }
  r = ke(c, !1);
  if (r.length > b) {
    return 0;
  }
  w.set(r, a);
  return r.length - 1;
}
sb = g.InternalError = rb("InternalError");
for (var le = Array(256), me = 0; 256 > me; ++me) {
  le[me] = String.fromCharCode(me);
}
yb = le;
zb = g.BindingError = rb("BindingError");
Jb.prototype.isAliasOf = function(a) {
  if (!(this instanceof Jb && a instanceof Jb)) {
    return !1;
  }
  var b = this.Ck.Nk.Gk, c = this.Ck.Ik, d = a.Ck.Nk.Gk;
  for (a = a.Ck.Ik; b.al;) {
    c = b.Ml(c), b = b.al;
  }
  for (; d.al;) {
    a = d.Ml(a), d = d.al;
  }
  return b === d && c === a;
};
Jb.prototype.clone = function() {
  this.Ck.Ik || Bb(this);
  if (this.Ck.Jl) {
    return this.Ck.count.value += 1, this;
  }
  var a = Fb(Object.create(Object.getPrototypeOf(this), {Ck:{value:Ab(this.Ck)}}));
  a.Ck.count.value += 1;
  a.Ck.yl = !1;
  return a;
};
Jb.prototype["delete"] = function() {
  this.Ck.Ik || Bb(this);
  this.Ck.yl && !this.Ck.Jl && K("Object already scheduled for deletion");
  Db(this);
  Eb(this.Ck);
  this.Ck.Jl || (this.Ck.Vk = void 0, this.Ck.Ik = void 0);
};
Jb.prototype.isDeleted = function() {
  return !this.Ck.Ik;
};
Jb.prototype.deleteLater = function() {
  this.Ck.Ik || Bb(this);
  this.Ck.yl && !this.Ck.Jl && K("Object already scheduled for deletion");
  Hb.push(this);
  1 === Hb.length && Gb && Gb(Ib);
  this.Ck.yl = !0;
  return this;
};
Yb.prototype.Om = function(a) {
  this.Am && (a = this.Am(a));
  return a;
};
Yb.prototype.tm = function(a) {
  this.Yk && this.Yk(a);
};
Yb.prototype.argPackAdvance = 8;
Yb.prototype.readValueFromPointer = lb;
Yb.prototype.deleteObject = function(a) {
  if (null !== a) {
    a["delete"]();
  }
};
Yb.prototype.fromWireType = function(a) {
  function b() {
    return this.Ul ? Xb(this.Gk.zl, {Nk:this.bn, Ik:c, Zk:this, Vk:a}) : Xb(this.Gk.zl, {Nk:this, Ik:a});
  }
  var c = this.Om(a);
  if (!c) {
    return this.tm(a), null;
  }
  var d = Wb(this.Gk, c);
  if (void 0 !== d) {
    if (0 === d.Ck.count.value) {
      return d.Ck.Ik = c, d.Ck.Vk = a, d.clone();
    }
    d = d.clone();
    this.tm(a);
    return d;
  }
  d = this.Gk.Nm(c);
  d = Kb[d];
  if (!d) {
    return b.call(this);
  }
  d = this.Tl ? d.Fm : d.pointerType;
  var e = Ub(c, this.Gk, d.Gk);
  return null === e ? b.call(this) : this.Ul ? Xb(d.Gk.zl, {Nk:d, Ik:e, Zk:this, Vk:a}) : Xb(d.Gk.zl, {Nk:d, Ik:e});
};
g.getInheritedInstanceCount = function() {
  return Object.keys(Vb).length;
};
g.getLiveInheritedInstances = function() {
  var a = [], b;
  for (b in Vb) {
    Vb.hasOwnProperty(b) && a.push(Vb[b]);
  }
  return a;
};
g.flushPendingDeletes = Ib;
g.setDelayFunction = function(a) {
  Gb = a;
  Hb.length && Gb && Gb(Ib);
};
$b = g.UnboundTypeError = rb("UnboundTypeError");
g.count_emval_handles = function() {
  for (var a = 0, b = 5; b < N.length; ++b) {
    void 0 !== N[b] && ++a;
  }
  return a;
};
g.get_first_emval = function() {
  for (var a = 5; a < N.length; ++a) {
    if (void 0 !== N[a]) {
      return N[a];
    }
  }
  return null;
};
ia ? uc = function() {
  var a = process.hrtime();
  return 1e3 * a[0] + a[1] / 1e6;
} : "undefined" !== typeof dateNow ? uc = dateNow : uc = function() {
  return performance.now();
};
g.requestFullscreen = function(a, b, c) {
  ed(a, b, c);
};
g.requestAnimationFrame = function(a) {
  Cc(a);
};
g.setCanvasSize = function(a, b, c) {
  gd(g.canvas, a, b);
  c || hd();
};
g.pauseMainLoop = function() {
  zc = null;
  Fc++;
};
g.resumeMainLoop = function() {
  Fc++;
  var a = wc, b = xc, c = yc;
  yc = null;
  Dc(c);
  vc(a, b);
  zc();
};
g.getUserMedia = function() {
  window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia);
  window.getUserMedia(void 0);
};
g.createContext = function(a, b, c, d) {
  return Yc(a, b, c, d);
};
for (var O, ne = new Float32Array(256), oe = 0; 256 > oe; oe++) {
  V[oe] = ne.subarray(0, oe + 1);
}
var pe = new Int32Array(256);
for (oe = 0; 256 > oe; oe++) {
  Fd[oe] = pe.subarray(0, oe + 1);
}
for (var qe = 0; 32 > qe; qe++) {
  Ld.push(Array(qe));
}
function ke(a, b) {
  var c = Array(h(a) + 1);
  a = Ea(a, c, 0, c.length);
  b && (c.length = a);
  return c;
}
var Je = {gf:function(a) {
  return Ba(a);
}, Xe:function(a) {
  "uncaught_exception" in re ? re.sn++ : re.sn = 1;
  throw a;
}, M:function() {
}, Jg:function() {
  fb(63);
  return -1;
}, Kg:function(a, b) {
  hb = b;
  try {
    var c = ib.em(), d = H(), e = H();
    H();
    var f = H();
    H();
    return (void 0).read(c, w, d, e, f);
  } catch (k) {
    return t(k), -k.gl;
  }
}, Ig:function(a, b) {
  hb = b;
  try {
    var c = H(), d = H(), e = H(), f = H(), k = H();
    a: {
      var l = H();
      l <<= 12;
      a = !1;
      if (0 !== (f & 16) && 0 !== c % 16384) {
        var m = -28;
      } else {
        if (0 !== (f & 32)) {
          var q = se(16384, d);
          if (!q) {
            m = -48;
            break a;
          }
          c = q;
          e = d;
          var r = 0;
          c |= 0;
          e |= 0;
          var x;
          var B = c + e | 0;
          r = (r | 0) & 255;
          if (67 <= (e | 0)) {
            for (; 0 != (c & 3);) {
              w[c >> 0] = r, c = c + 1 | 0;
            }
            var z = B & -4 | 0;
            var v = r | r << 8 | r << 16 | r << 24;
            for (x = z - 64 | 0; (c | 0) <= (x | 0);) {
              u[c >> 2] = v, u[c + 4 >> 2] = v, u[c + 8 >> 2] = v, u[c + 12 >> 2] = v, u[c + 16 >> 2] = v, u[c + 20 >> 2] = v, u[c + 24 >> 2] = v, u[c + 28 >> 2] = v, u[c + 32 >> 2] = v, u[c + 36 >> 2] = v, u[c + 40 >> 2] = v, u[c + 44 >> 2] = v, u[c + 48 >> 2] = v, u[c + 52 >> 2] = v, u[c + 56 >> 2] = v, u[c + 60 >> 2] = v, c = c + 64 | 0;
            }
            for (; (c | 0) < (z | 0);) {
              u[c >> 2] = v, c = c + 4 | 0;
            }
          }
          for (; (c | 0) < (B | 0);) {
            w[c >> 0] = r, c = c + 1 | 0;
          }
          a = !0;
        } else {
          r = (void 0).Pm(k);
          if (!r) {
            m = -8;
            break a;
          }
          var E = (void 0).Nn(r, y, c, d, l, e, f);
          q = E.Ik;
          a = E.sm;
        }
        ib.ym[q] = {Zm:q, Ym:d, sm:a, fd:k, flags:f, offset:l};
        m = q;
      }
    }
    return m;
  } catch (L) {
    return t(L), -L.gl;
  }
}, W:function(a, b) {
  hb = b;
  try {
    var c = A(H()), d = H();
    return ib.Hm((void 0).stat, c, d);
  } catch (e) {
    return t(e), -e.gl;
  }
}, Og:function(a, b) {
  hb = b;
  try {
    var c = ib.em(), d = H();
    return ib.Hm((void 0).stat, c.path, d);
  } catch (e) {
    return t(e), -e.gl;
  }
}, U:function(a, b) {
  hb = b;
  return 0;
}, V:function(a, b) {
  hb = b;
  try {
    var c = A(H()), d = H(), e = H();
    return (void 0).open(c, d, e).fd;
  } catch (f) {
    return t(f), -f.gl;
  }
}, Ng:function(a, b) {
  hb = b;
  return 0;
}, Hg:function(a, b) {
  hb = b;
  try {
    var c = H();
    var d = H();
    if (-1 === c || 0 === d) {
      var e = -28;
    } else {
      var f = ib.ym[c];
      if (f && d === f.Ym) {
        var k = (void 0).Pm(f.fd);
        ib.Fn(c, k, d, f.flags, f.offset);
        (void 0).On(k);
        ib.ym[c] = null;
        f.sm && cc(f.Zm);
      }
      e = 0;
    }
    return e;
  } catch (l) {
    return t(l), -l.gl;
  }
}, E:function() {
}, H:function(a) {
  var b = jb[a];
  delete jb[a];
  var c = b.elements, d = c.length, e = c.map(function(a) {
    return a.hm;
  }).concat(c.map(function(a) {
    return a.lm;
  })), f = b.Kl, k = b.Yk;
  I([a], e, function(a) {
    c.forEach(function(b, c) {
      var e = a[c], f = b.fm, k = b.gm, l = a[c + d], m = b.km, q = b.mm;
      b.read = function(a) {
        return e.fromWireType(f(k, a));
      };
      b.write = function(a, b) {
        var c = [];
        m(q, a, l.toWireType(c, b));
        kb(c);
      };
    });
    return [{name:b.name, fromWireType:function(a) {
      for (var b = Array(d), e = 0; e < d; ++e) {
        b[e] = c[e].read(a);
      }
      k(a);
      return b;
    }, toWireType:function(a, e) {
      if (d !== e.length) {
        throw new TypeError("Incorrect number of tuple elements for " + b.name + ": expected=" + d + ", actual=" + e.length);
      }
      for (var l = f(), m = 0; m < d; ++m) {
        c[m].write(l, e[m]);
      }
      null !== a && a.push(k, l);
      return l;
    }, argPackAdvance:8, readValueFromPointer:lb, Uk:k}];
  });
}, x:function(a) {
  var b = wb[a];
  delete wb[a];
  var c = b.Kl, d = b.Yk, e = b.wm, f = e.map(function(a) {
    return a.hm;
  }).concat(e.map(function(a) {
    return a.lm;
  }));
  I([a], f, function(a) {
    var f = {};
    e.forEach(function(b, c) {
      var d = a[c], k = b.fm, l = b.gm, m = a[c + e.length], q = b.km, E = b.mm;
      f[b.Jm] = {read:function(a) {
        return d.fromWireType(k(l, a));
      }, write:function(a, b) {
        var c = [];
        q(E, a, m.toWireType(c, b));
        kb(c);
      }};
    });
    return [{name:b.name, fromWireType:function(a) {
      var b = {}, c;
      for (c in f) {
        b[c] = f[c].read(a);
      }
      d(a);
      return b;
    }, toWireType:function(a, b) {
      for (var e in f) {
        if (!(e in b)) {
          throw new TypeError("Missing field");
        }
      }
      var k = c();
      for (e in f) {
        f[e].write(k, b[e]);
      }
      null !== a && a.push(d, k);
      return k;
    }, argPackAdvance:8, readValueFromPointer:lb, Uk:d}];
  });
}, zg:function(a, b, c, d, e) {
  var f = xb(c);
  b = J(b);
  ub(a, {name:b, fromWireType:function(a) {
    return !!a;
  }, toWireType:function(a, b) {
    return b ? d : e;
  }, argPackAdvance:8, readValueFromPointer:function(a) {
    if (1 === c) {
      var d = w;
    } else {
      if (2 === c) {
        d = Fa;
      } else {
        if (4 === c) {
          d = u;
        } else {
          throw new TypeError("Unknown boolean type size: " + b);
        }
      }
    }
    return this.fromWireType(d[a >> f]);
  }, Uk:null});
}, g:function(a, b, c, d, e, f, k, l, m, q, r, x, B) {
  r = J(r);
  f = M(e, f);
  l && (l = M(k, l));
  q && (q = M(m, q));
  B = M(x, B);
  var z = pb(r);
  Mb(z, function() {
    dc("Cannot construct " + r + " due to unbound types", [d]);
  });
  I([a, b, c], d ? [d] : [], function(b) {
    b = b[0];
    if (d) {
      var c = b.Gk;
      var e = c.zl;
    } else {
      e = Jb.prototype;
    }
    b = qb(z, function() {
      if (Object.getPrototypeOf(this) !== k) {
        throw new zb("Use 'new' to construct " + r);
      }
      if (void 0 === m.jl) {
        throw new zb(r + " has no accessible constructor");
      }
      var a = m.jl[arguments.length];
      if (void 0 === a) {
        throw new zb("Tried to invoke ctor of " + r + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(m.jl).toString() + ") parameters instead!");
      }
      return a.apply(this, arguments);
    });
    var k = Object.create(e, {constructor:{value:b}});
    b.prototype = k;
    var m = new Nb(r, b, k, B, c, f, l, q);
    c = new Yb(r, m, !0, !1, !1);
    e = new Yb(r + "*", m, !1, !1, !1);
    var x = new Yb(r + " const*", m, !1, !0, !1);
    Kb[a] = {pointerType:e, Fm:x};
    Zb(z, b);
    return [c, e, x];
  });
}, n:function(a, b, c, d, e, f, k) {
  var l = hc(c, d);
  b = J(b);
  f = M(e, f);
  I([], [a], function(a) {
    function d() {
      dc("Cannot call " + e + " due to unbound types", l);
    }
    a = a[0];
    var e = a.name + "." + b, m = a.Gk.constructor;
    void 0 === m[b] ? (d.wl = c - 1, m[b] = d) : (Lb(m, b, e), m[b].Qk[c - 1] = d);
    I([], l, function(a) {
      a = [a[0], null].concat(a.slice(1));
      a = fc(e, a, null, f, k);
      void 0 === m[b].Qk ? (a.wl = c - 1, m[b] = a) : m[b].Qk[c - 1] = a;
      return [];
    });
    return [];
  });
}, w:function(a, b, c, d, e, f) {
  assert(0 < b);
  var k = hc(b, c);
  e = M(d, e);
  var l = [f], m = [];
  I([], [a], function(a) {
    a = a[0];
    var c = "constructor " + a.name;
    void 0 === a.Gk.jl && (a.Gk.jl = []);
    if (void 0 !== a.Gk.jl[b - 1]) {
      throw new zb("Cannot register multiple constructors with identical number of parameters (" + (b - 1) + ") for class '" + a.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
    }
    a.Gk.jl[b - 1] = function() {
      dc("Cannot construct " + a.name + " due to unbound types", k);
    };
    I([], k, function(d) {
      a.Gk.jl[b - 1] = function() {
        arguments.length !== b - 1 && K(c + " called with " + arguments.length + " arguments, expected " + (b - 1));
        m.length = 0;
        l.length = b;
        for (var a = 1; a < b; ++a) {
          l[a] = d[a].toWireType(m, arguments[a - 1]);
        }
        a = e.apply(null, l);
        kb(m);
        return d[0].fromWireType(a);
      };
      return [];
    });
    return [];
  });
}, d:function(a, b, c, d, e, f, k, l) {
  var m = hc(c, d);
  b = J(b);
  f = M(e, f);
  I([], [a], function(a) {
    function d() {
      dc("Cannot call " + e + " due to unbound types", m);
    }
    a = a[0];
    var e = a.name + "." + b;
    l && a.Gk.cn.push(b);
    var q = a.Gk.zl, z = q[b];
    void 0 === z || void 0 === z.Qk && z.className !== a.name && z.wl === c - 2 ? (d.wl = c - 2, d.className = a.name, q[b] = d) : (Lb(q, b, e), q[b].Qk[c - 2] = d);
    I([], m, function(d) {
      d = fc(e, d, a, f, k);
      void 0 === q[b].Qk ? (d.wl = c - 2, q[b] = d) : q[b].Qk[c - 2] = d;
      return [];
    });
    return [];
  });
}, O:function(a, b, c) {
  a = J(a);
  I([], [b], function(b) {
    b = b[0];
    g[a] = b.fromWireType(c);
    return [];
  });
}, xg:function(a, b) {
  b = J(b);
  ub(a, {name:b, fromWireType:function(a) {
    var b = N[a].value;
    jc(a);
    return b;
  }, toWireType:function(a, b) {
    return Sb(b);
  }, argPackAdvance:8, readValueFromPointer:lb, Uk:null});
}, p:function(a, b, c, d) {
  function e() {
  }
  c = xb(c);
  b = J(b);
  e.values = {};
  ub(a, {name:b, constructor:e, fromWireType:function(a) {
    return this.constructor.values[a];
  }, toWireType:function(a, b) {
    return b.value;
  }, argPackAdvance:8, readValueFromPointer:kc(b, c, d), Uk:null});
  Mb(b, e);
}, o:function(a, b, c) {
  var d = lc(a, "enum");
  b = J(b);
  a = d.constructor;
  d = Object.create(d.constructor.prototype, {value:{value:c}, constructor:{value:qb(d.name + "_" + b, function() {
  })}});
  a.values[c] = d;
  a[b] = d;
}, S:function(a, b, c) {
  c = xb(c);
  b = J(b);
  ub(a, {name:b, fromWireType:function(a) {
    return a;
  }, toWireType:function(a, b) {
    if ("number" !== typeof b && "boolean" !== typeof b) {
      throw new TypeError('Cannot convert "' + Qb(b) + '" to ' + this.name);
    }
    return b;
  }, argPackAdvance:8, readValueFromPointer:mc(b, c), Uk:null});
}, l:function(a, b, c, d, e, f) {
  var k = hc(b, c);
  a = J(a);
  e = M(d, e);
  Mb(a, function() {
    dc("Cannot call " + a + " due to unbound types", k);
  }, b - 1);
  I([], k, function(c) {
    c = [c[0], null].concat(c.slice(1));
    Zb(a, fc(a, c, null, e, f), b - 1);
    return [];
  });
}, A:function(a, b, c, d, e) {
  function f(a) {
    return a;
  }
  b = J(b);
  -1 === e && (e = 4294967295);
  var k = xb(c);
  if (0 === d) {
    var l = 32 - 8 * c;
    f = function(a) {
      return a << l >>> l;
    };
  }
  var m = -1 != b.indexOf("unsigned");
  ub(a, {name:b, fromWireType:f, toWireType:function(a, c) {
    if ("number" !== typeof c && "boolean" !== typeof c) {
      throw new TypeError('Cannot convert "' + Qb(c) + '" to ' + this.name);
    }
    if (c < d || c > e) {
      throw new TypeError('Passing a number "' + Qb(c) + '" from JS side to C/C++ side to an argument of type "' + b + '", which is outside the valid range [' + d + ", " + e + "]!");
    }
    return m ? c >>> 0 : c | 0;
  }, argPackAdvance:8, readValueFromPointer:nc(b, k, 0 !== d), Uk:null});
}, z:function(a, b, c) {
  function d(a) {
    a >>= 2;
    var b = C;
    return new e(b.buffer, b[a + 1], b[a]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][b];
  c = J(c);
  ub(a, {name:c, fromWireType:d, argPackAdvance:8, readValueFromPointer:d}, {Rm:!0});
}, s:function(a, b, c, d, e, f, k, l, m, q, r, x) {
  c = J(c);
  f = M(e, f);
  l = M(k, l);
  q = M(m, q);
  x = M(r, x);
  I([a], [b], function(a) {
    a = a[0];
    return [new Yb(c, a.Gk, !1, !1, !0, a, d, f, l, q, x)];
  });
}, T:function(a, b) {
  b = J(b);
  var c = "std::string" === b;
  ub(a, {name:b, fromWireType:function(a) {
    var b = C[a >> 2];
    if (c) {
      var d = y[a + 4 + b], k = 0;
      0 != d && (k = d, y[a + 4 + b] = 0);
      var l = a + 4;
      for (d = 0; d <= b; ++d) {
        var m = a + 4 + d;
        if (0 == y[m]) {
          l = A(l);
          if (void 0 === q) {
            var q = l;
          } else {
            q += String.fromCharCode(0), q += l;
          }
          l = m + 1;
        }
      }
      0 != k && (y[a + 4 + b] = k);
    } else {
      q = Array(b);
      for (d = 0; d < b; ++d) {
        q[d] = String.fromCharCode(y[a + 4 + d]);
      }
      q = q.join("");
    }
    cc(a);
    return q;
  }, toWireType:function(a, b) {
    b instanceof ArrayBuffer && (b = new Uint8Array(b));
    var d = "string" === typeof b;
    d || b instanceof Uint8Array || b instanceof Uint8ClampedArray || b instanceof Int8Array || K("Cannot pass non-string to std::string");
    var e = (c && d ? function() {
      return h(b);
    } : function() {
      return b.length;
    })(), l = Ba(4 + e + 1);
    C[l >> 2] = e;
    if (c && d) {
      n(b, l + 4, e + 1);
    } else {
      if (d) {
        for (d = 0; d < e; ++d) {
          var m = b.charCodeAt(d);
          255 < m && (cc(l), K("String has UTF-16 code units that do not fit in 8 bits"));
          y[l + 4 + d] = m;
        }
      } else {
        for (d = 0; d < e; ++d) {
          y[l + 4 + d] = b[d];
        }
      }
    }
    null !== a && a.push(cc, l);
    return l;
  }, argPackAdvance:8, readValueFromPointer:lb, Uk:function(a) {
    cc(a);
  }});
}, yg:function(a, b, c) {
  c = J(c);
  if (2 === b) {
    var d = function() {
      return Ha;
    };
    var e = 1;
  } else {
    4 === b && (d = function() {
      return C;
    }, e = 2);
  }
  ub(a, {name:c, fromWireType:function(a) {
    for (var b = d(), c = C[a >> 2], f = Array(c), q = a + 4 >> e, r = 0; r < c; ++r) {
      f[r] = String.fromCharCode(b[q + r]);
    }
    cc(a);
    return f.join("");
  }, toWireType:function(a, c) {
    var f = c.length, k = Ba(4 + f * b), q = d();
    C[k >> 2] = f;
    for (var r = k + 4 >> e, x = 0; x < f; ++x) {
      q[r + x] = c.charCodeAt(x);
    }
    null !== a && a.push(cc, k);
    return k;
  }, argPackAdvance:8, readValueFromPointer:lb, Uk:function(a) {
    cc(a);
  }});
}, J:function(a, b, c, d, e, f) {
  jb[a] = {name:J(b), Kl:M(c, d), Yk:M(e, f), elements:[]};
}, I:function(a, b, c, d, e, f, k, l, m) {
  jb[a].elements.push({hm:b, fm:M(c, d), gm:e, lm:f, km:M(k, l), mm:m});
}, y:function(a, b, c, d, e, f) {
  wb[a] = {name:J(b), Kl:M(c, d), Yk:M(e, f), wm:[]};
}, k:function(a, b, c, d, e, f, k, l, m, q) {
  wb[a].wm.push({Jm:J(b), hm:c, fm:M(d, e), gm:f, lm:k, km:M(l, m), mm:q});
}, Ag:function(a, b) {
  b = J(b);
  ub(a, {Tm:!0, name:b, argPackAdvance:0, fromWireType:function() {
  }, toWireType:function() {
  }});
}, D:function(a, b, c, d) {
  a = qc[a];
  b = rc(b);
  c = pc(c);
  a(b, c, null, d);
}, va:jc, C:function(a, b) {
  b = tc(a, b);
  for (var c = b[0], d = c.name + "_$" + b.slice(1).map(function(a) {
    return a.name;
  }).join("_") + "$", e = ["retType"], f = [c], k = "", l = 0; l < a - 1; ++l) {
    k += (0 !== l ? ", " : "") + "arg" + l, e.push("argType" + l), f.push(b[1 + l]);
  }
  d = "return function " + pb("methodCaller_" + d) + "(handle, name, destructors, args) {\n";
  var m = 0;
  for (l = 0; l < a - 1; ++l) {
    d += "    var arg" + l + " = argType" + l + ".readValueFromPointer(args" + (m ? "+" + m : "") + ");\n", m += b[l + 1].argPackAdvance;
  }
  d += "    var rv = handle[name](" + k + ");\n";
  for (l = 0; l < a - 1; ++l) {
    b[l + 1].deleteObject && (d += "    argType" + l + ".deleteObject(arg" + l + ");\n");
  }
  c.Tm || (d += "    return retType.toWireType(destructors, rv);\n");
  e.push(d + "};\n");
  a = ec(e).apply(null, f);
  return sc(a);
}, sf:function(a) {
  4 < a && (N[a].jm += 1);
}, Ga:function() {
  return Sb([]);
}, Ra:function(a) {
  return Sb(pc(a));
}, se:function() {
  return Sb({});
}, L:function(a, b, c) {
  a = rc(a);
  b = rc(b);
  c = rc(c);
  a[b] = c;
}, B:function(a, b) {
  a = lc(a, "_emval_take_value");
  a = a.readValueFromPointer(b);
  return Sb(a);
}, e:function() {
  t();
}, Dg:function(a, b) {
  if (0 === a) {
    a = Date.now();
  } else {
    if (1 === a) {
      a = uc();
    } else {
      return fb(28), -1;
    }
  }
  u[b >> 2] = a / 1e3 | 0;
  u[b + 4 >> 2] = a % 1e3 * 1E6 | 0;
  return 0;
}, vc:function() {
  return 0;
}, Tg:function(a) {
  return te(a);
}, kc:function(a, b) {
  if (62e3 != a) {
    return 0;
  }
  if (ld[b]) {
    return ld[b];
  }
  switch(b) {
    case 12371:
      a = Aa(ke("Emscripten"));
      break;
    case 12372:
      a = Aa(ke("1.4 Emscripten EGL"));
      break;
    case 12373:
      a = Aa(ke(""));
      break;
    case 12429:
      a = Aa(ke("OpenGL_ES"));
      break;
    default:
      return 0;
  }
  return ld[b] = a;
}, bg:function(a) {
  O.activeTexture(a);
}, ag:function(a, b) {
  O.attachShader(P[a], S[b]);
}, bd:function(a, b) {
  O.beginQuery(a, wd[b]);
}, rg:function(a, b) {
  O.Xk.beginQueryEXT(a, vd[b]);
}, Ic:function(a) {
  O.beginTransformFeedback(a);
}, $f:function(a, b, c) {
  O.bindAttribLocation(P[a], b, A(c));
}, _f:function(a, b) {
  35051 == a ? O.kl = b : 35052 == a && (O.Pk = b);
  O.bindBuffer(a, rd[b]);
}, Ec:function(a, b, c) {
  O.bindBufferBase(a, b, rd[c]);
}, Fc:function(a, b, c, d, e) {
  O.bindBufferRange(a, b, rd[c], d, e);
}, Zf:function(a, b) {
  O.bindFramebuffer(a, sd[b]);
}, Yf:function(a, b) {
  O.bindRenderbuffer(a, td[b]);
}, Ib:function(a, b) {
  O.bindSampler(a, xd[b]);
}, Xf:function(a, b) {
  O.bindTexture(a, Q[b]);
}, zb:function(a, b) {
  O.bindTransformFeedback(a, yd[b]);
}, Nc:function(a) {
  O.bindVertexArray(ud[a]);
}, jg:function(a) {
  O.bindVertexArray(ud[a]);
}, Wf:function(a, b, c, d) {
  O.blendColor(a, b, c, d);
}, Vf:function(a) {
  O.blendEquation(a);
}, Uf:function(a, b) {
  O.blendEquationSeparate(a, b);
}, Tf:function(a, b) {
  O.blendFunc(a, b);
}, Sf:function(a, b, c, d) {
  O.blendFuncSeparate(a, b, c, d);
}, Qc:function(a, b, c, d, e, f, k, l, m, q) {
  O.blitFramebuffer(a, b, c, d, e, f, k, l, m, q);
}, Rf:function(a, b, c, d) {
  2 <= T.version ? c ? O.bufferData(a, y, d, c, b) : O.bufferData(a, b, d) : O.bufferData(a, c ? y.subarray(c, c + b) : b, d);
}, Qf:function(a, b, c, d) {
  2 <= T.version ? O.bufferSubData(a, b, y, d, c) : O.bufferSubData(a, b, y.subarray(d, d + c));
}, Pf:function(a) {
  return O.checkFramebufferStatus(a);
}, Of:function(a) {
  O.clear(a);
}, fc:function(a, b, c, d) {
  O.clearBufferfi(a, b, c, d);
}, gc:function(a, b, c) {
  O.clearBufferfv(a, b, D, c >> 2);
}, ic:function(a, b, c) {
  O.clearBufferiv(a, b, u, c >> 2);
}, hc:function(a, b, c) {
  O.clearBufferuiv(a, b, C, c >> 2);
}, Nf:function(a, b, c, d) {
  O.clearColor(a, b, c, d);
}, Mf:function(a) {
  O.clearDepth(a);
}, Lf:function(a) {
  O.clearStencil(a);
}, Sb:function(a, b, c, d) {
  c >>>= 0;
  d >>>= 0;
  return O.clientWaitSync(zd[a], b, 4294967295 == c && 4294967295 == d ? -1 : +(c >>> 0) + 4294967296 * +(d >>> 0));
}, Kf:function(a, b, c, d) {
  O.colorMask(!!a, !!b, !!c, !!d);
}, Jf:function(a) {
  O.compileShader(S[a]);
}, If:function(a, b, c, d, e, f, k, l) {
  2 <= T.version ? O.Pk ? O.compressedTexImage2D(a, b, c, d, e, f, k, l) : O.compressedTexImage2D(a, b, c, d, e, f, y, l, k) : O.compressedTexImage2D(a, b, c, d, e, f, l ? y.subarray(l, l + k) : null);
}, gd:function(a, b, c, d, e, f, k, l, m) {
  O.Pk ? O.compressedTexImage3D(a, b, c, d, e, f, k, l, m) : O.compressedTexImage3D(a, b, c, d, e, f, k, y, m, l);
}, Hf:function(a, b, c, d, e, f, k, l, m) {
  2 <= T.version ? O.Pk ? O.compressedTexSubImage2D(a, b, c, d, e, f, k, l, m) : O.compressedTexSubImage2D(a, b, c, d, e, f, k, y, m, l) : O.compressedTexSubImage2D(a, b, c, d, e, f, k, m ? y.subarray(m, m + l) : null);
}, fd:function(a, b, c, d, e, f, k, l, m, q, r) {
  O.Pk ? O.compressedTexSubImage3D(a, b, c, d, e, f, k, l, m, q, r) : O.compressedTexSubImage3D(a, b, c, d, e, f, k, l, m, y, r, q);
}, dc:function(a, b, c, d, e) {
  O.copyBufferSubData(a, b, c, d, e);
}, Gf:function(a, b, c, d, e, f, k, l) {
  O.copyTexImage2D(a, b, c, d, e, f, k, l);
}, Ff:function(a, b, c, d, e, f, k, l) {
  O.copyTexSubImage2D(a, b, c, d, e, f, k, l);
}, hd:function(a, b, c, d, e, f, k, l, m) {
  O.copyTexSubImage3D(a, b, c, d, e, f, k, l, m);
}, Ef:function() {
  var a = Ed(P), b = O.createProgram();
  b.name = a;
  P[a] = b;
  return a;
}, Df:function(a) {
  var b = Ed(S);
  S[b] = O.createShader(a);
  return b;
}, Cf:function(a) {
  O.cullFace(a);
}, Bf:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = rd[d];
    e && (O.deleteBuffer(e), e.name = 0, rd[d] = null, d == Jd && (Jd = 0), d == Kd && (Kd = 0), d == O.kl && (O.kl = 0), d == O.Pk && (O.Pk = 0));
  }
}, Af:function(a, b) {
  for (var c = 0; c < a; ++c) {
    var d = u[b + 4 * c >> 2], e = sd[d];
    e && (O.deleteFramebuffer(e), e.name = 0, sd[d] = null);
  }
}, zf:function(a) {
  if (a) {
    var b = P[a];
    b ? (O.deleteProgram(b), b.name = 0, P[a] = null, Ad[a] = null) : U(1281);
  }
}, dd:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = wd[d];
    e && (O.deleteQuery(e), wd[d] = null);
  }
}, tg:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = vd[d];
    e && (O.Xk.deleteQueryEXT(e), vd[d] = null);
  }
}, yf:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = td[d];
    e && (O.deleteRenderbuffer(e), e.name = 0, td[d] = null);
  }
}, Kb:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = xd[d];
    e && (O.deleteSampler(e), e.name = 0, xd[d] = null);
  }
}, xf:function(a) {
  if (a) {
    var b = S[a];
    b ? (O.deleteShader(b), S[a] = null) : U(1281);
  }
}, Tb:function(a) {
  if (a) {
    var b = zd[a];
    b ? (O.deleteSync(b), b.name = 0, zd[a] = null) : U(1281);
  }
}, wf:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = Q[d];
    e && (O.deleteTexture(e), e.name = 0, Q[d] = null);
  }
}, yb:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = yd[d];
    e && (O.deleteTransformFeedback(e), e.name = 0, yd[d] = null);
  }
}, Mc:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2];
    O.deleteVertexArray(ud[d]);
    ud[d] = null;
  }
}, ig:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2];
    O.deleteVertexArray(ud[d]);
    ud[d] = null;
  }
}, vf:function(a) {
  O.depthFunc(a);
}, uf:function(a) {
  O.depthMask(!!a);
}, tf:function(a, b) {
  O.depthRange(a, b);
}, rf:function(a, b) {
  O.detachShader(P[a], S[b]);
}, qf:function(a) {
  O.disable(a);
}, pf:function(a) {
  O.disableVertexAttribArray(a);
}, of:function(a, b, c) {
  O.drawArrays(a, b, c);
}, Xb:function(a, b, c, d) {
  O.drawArraysInstanced(a, b, c, d);
}, eg:function(a, b, c, d) {
  O.drawArraysInstanced(a, b, c, d);
}, gb:function(a, b, c, d) {
  O.drawArraysInstanced(a, b, c, d);
}, od:function(a, b, c, d) {
  O.drawArraysInstanced(a, b, c, d);
}, hb:function(a, b, c, d) {
  O.drawArraysInstanced(a, b, c, d);
}, Yc:function(a, b) {
  for (var c = Ld[a], d = 0; d < a; d++) {
    c[d] = u[b + 4 * d >> 2];
  }
  O.drawBuffers(c);
}, md:function(a, b) {
  for (var c = Ld[a], d = 0; d < a; d++) {
    c[d] = u[b + 4 * d >> 2];
  }
  O.drawBuffers(c);
}, fg:function(a, b) {
  for (var c = Ld[a], d = 0; d < a; d++) {
    c[d] = u[b + 4 * d >> 2];
  }
  O.drawBuffers(c);
}, nf:function(a, b, c, d) {
  O.drawElements(a, b, c, d);
}, Wb:function(a, b, c, d, e) {
  O.drawElementsInstanced(a, b, c, d, e);
}, dg:function(a, b, c, d, e) {
  O.drawElementsInstanced(a, b, c, d, e);
}, eb:function(a, b, c, d, e) {
  O.drawElementsInstanced(a, b, c, d, e);
}, fb:function(a, b, c, d, e) {
  O.drawElementsInstanced(a, b, c, d, e);
}, nd:function(a, b, c, d, e) {
  O.drawElementsInstanced(a, b, c, d, e);
}, kd:function(a, b, c, d, e, f) {
  Md(a, d, e, f);
}, mf:function(a) {
  O.enable(a);
}, lf:function(a) {
  O.enableVertexAttribArray(a);
}, $c:function(a) {
  O.endQuery(a);
}, qg:function(a) {
  O.Xk.endQueryEXT(a);
}, Hc:function() {
  O.endTransformFeedback();
}, Vb:function(a, b) {
  return (a = O.fenceSync(a, b)) ? (b = Ed(zd), a.name = b, zd[b] = a, b) : 0;
}, kf:function() {
  O.finish();
}, jf:function() {
  O.flush();
}, hf:function(a, b, c, d) {
  O.framebufferRenderbuffer(a, b, c, td[d]);
}, ff:function(a, b, c, d, e) {
  O.framebufferTexture2D(a, b, c, Q[d], e);
}, Oc:function(a, b, c, d, e) {
  O.framebufferTextureLayer(a, b, Q[c], d, e);
}, ef:function(a) {
  O.frontFace(a);
}, df:function(a, b) {
  W(a, b, "createBuffer", rd);
}, bf:function(a, b) {
  W(a, b, "createFramebuffer", sd);
}, ed:function(a, b) {
  W(a, b, "createQuery", wd);
}, ug:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = O.Xk.createQueryEXT();
    if (!d) {
      for (U(1282); c < a;) {
        u[b + 4 * c++ >> 2] = 0;
      }
      break;
    }
    var e = Ed(vd);
    d.name = e;
    vd[e] = d;
    u[b + 4 * c >> 2] = e;
  }
}, af:function(a, b) {
  W(a, b, "createRenderbuffer", td);
}, Lb:function(a, b) {
  W(a, b, "createSampler", xd);
}, $e:function(a, b) {
  W(a, b, "createTexture", Q);
}, xb:function(a, b) {
  W(a, b, "createTransformFeedback", yd);
}, Lc:function(a, b) {
  W(a, b, "createVertexArray", ud);
}, hg:function(a, b) {
  W(a, b, "createVertexArray", ud);
}, cf:function(a) {
  O.generateMipmap(a);
}, _e:function(a, b, c, d, e, f, k) {
  a = P[a];
  if (a = O.getActiveAttrib(a, b)) {
    c = 0 < c && k ? n(a.name, k, c) : 0, d && (u[d >> 2] = c), e && (u[e >> 2] = a.size), f && (u[f >> 2] = a.type);
  }
}, Ze:function(a, b, c, d, e, f, k) {
  a = P[a];
  if (a = O.getActiveUniform(a, b)) {
    c = 0 < c && k ? n(a.name, k, c) : 0, d && (u[d >> 2] = c), e && (u[e >> 2] = a.size), f && (u[f >> 2] = a.type);
  }
}, Zb:function(a, b, c, d, e) {
  a = P[a];
  if (a = O.getActiveUniformBlockName(a, b)) {
    e && 0 < c ? (c = n(a, e, c), d && (u[d >> 2] = c)) : d && (u[d >> 2] = 0);
  }
}, _b:function(a, b, c, d) {
  if (d) {
    switch(a = P[a], c) {
      case 35393:
        a = O.getActiveUniformBlockName(a, b);
        u[d >> 2] = a.length + 1;
        break;
      default:
        if (a = O.getActiveUniformBlockParameter(a, b, c)) {
          if ("number" == typeof a) {
            u[d >> 2] = a;
          } else {
            for (b = 0; b < a.length; b++) {
              u[d + 4 * b >> 2] = a[b];
            }
          }
        }
    }
  } else {
    U(1281);
  }
}, bc:function(a, b, c, d, e) {
  if (e) {
    if (0 < b && 0 == c) {
      U(1281);
    } else {
      a = P[a];
      for (var f = [], k = 0; k < b; k++) {
        f.push(u[c + 4 * k >> 2]);
      }
      if (a = O.getActiveUniforms(a, f, d)) {
        for (b = a.length, k = 0; k < b; k++) {
          u[e + 4 * k >> 2] = a[k];
        }
      }
    }
  } else {
    U(1281);
  }
}, Ye:function(a, b, c, d) {
  a = O.getAttachedShaders(P[a]);
  var e = a.length;
  e > b && (e = b);
  u[c >> 2] = e;
  for (b = 0; b < e; ++b) {
    u[d + 4 * b >> 2] = S.indexOf(a[b]);
  }
}, We:function(a, b) {
  return O.getAttribLocation(P[a], A(b));
}, Ve:function(a, b) {
  Nd(a, b, 4);
}, Mb:function(a, b, c) {
  c ? (G = [O.getBufferParameter(a, b) >>> 0, (F = O.getBufferParameter(a, b), 1 <= +Sa(F) ? 0 < F ? (Wa(+Ua(F / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ta((F - +(~~F >>> 0)) / 4294967296) >>> 0 : 0)], u[c >> 2] = G[0], u[c + 4 >> 2] = G[1]) : U(1281);
}, Ue:function(a, b, c) {
  c ? u[c >> 2] = O.getBufferParameter(a, b) : U(1281);
}, Te:function() {
  var a = O.getError() || qd;
  qd = 0;
  return a;
}, Se:function(a, b) {
  Nd(a, b, 2);
}, sc:function(a, b) {
  return O.getFragDataLocation(P[a], A(b));
}, Re:function(a, b, c, d) {
  a = O.getFramebufferAttachmentParameter(a, b, c);
  if (a instanceof WebGLRenderbuffer || a instanceof WebGLTexture) {
    a = a.name | 0;
  }
  u[d >> 2] = a;
}, Nb:function(a, b, c) {
  Od(a, b, c, 1);
}, Pb:function(a, b) {
  Nd(a, b, 1);
}, Jc:function(a, b, c) {
  Od(a, b, c, 0);
}, Qe:function(a, b) {
  Nd(a, b, 0);
}, lb:function(a, b, c, d, e) {
  if (0 > d) {
    U(1281);
  } else {
    if (e) {
      if (a = O.getInternalformatParameter(a, b, c), null !== a) {
        for (b = 0; b < a.length && b < d; ++b) {
          u[e + b >> 2] = a[b];
        }
      }
    } else {
      U(1281);
    }
  }
}, sb:function() {
  U(1282);
}, Oe:function(a, b, c, d) {
  a = O.getProgramInfoLog(P[a]);
  null === a && (a = "(unknown error)");
  b = 0 < b && d ? n(a, d, b) : 0;
  c && (u[c >> 2] = b);
}, Pe:function(a, b, c) {
  if (c) {
    if (a >= pd) {
      U(1281);
    } else {
      var d = Ad[a];
      if (d) {
        if (35716 == b) {
          a = O.getProgramInfoLog(P[a]), null === a && (a = "(unknown error)"), u[c >> 2] = a.length + 1;
        } else {
          if (35719 == b) {
            u[c >> 2] = d.Vl;
          } else {
            if (35722 == b) {
              if (-1 == d.bl) {
                a = P[a];
                var e = O.getProgramParameter(a, 35721);
                for (b = d.bl = 0; b < e; ++b) {
                  d.bl = Math.max(d.bl, O.getActiveAttrib(a, b).name.length + 1);
                }
              }
              u[c >> 2] = d.bl;
            } else {
              if (35381 == b) {
                if (-1 == d.cl) {
                  for (a = P[a], e = O.getProgramParameter(a, 35382), b = d.cl = 0; b < e; ++b) {
                    d.cl = Math.max(d.cl, O.getActiveUniformBlockName(a, b).length + 1);
                  }
                }
                u[c >> 2] = d.cl;
              } else {
                u[c >> 2] = O.getProgramParameter(P[a], b);
              }
            }
          }
        }
      } else {
        U(1282);
      }
    }
  } else {
    U(1281);
  }
}, lg:function(a, b, c) {
  if (c) {
    a = O.Xk.getQueryObjectEXT(vd[a], b);
    var d;
    "boolean" == typeof a ? d = a ? 1 : 0 : d = a;
    G = [d >>> 0, (F = d, 1 <= +Sa(F) ? 0 < F ? (Wa(+Ua(F / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ta((F - +(~~F >>> 0)) / 4294967296) >>> 0 : 0)];
    u[c >> 2] = G[0];
    u[c + 4 >> 2] = G[1];
  } else {
    U(1281);
  }
}, ng:function(a, b, c) {
  if (c) {
    a = O.Xk.getQueryObjectEXT(vd[a], b);
    var d;
    "boolean" == typeof a ? d = a ? 1 : 0 : d = a;
    u[c >> 2] = d;
  } else {
    U(1281);
  }
}, kg:function(a, b, c) {
  if (c) {
    a = O.Xk.getQueryObjectEXT(vd[a], b);
    var d;
    "boolean" == typeof a ? d = a ? 1 : 0 : d = a;
    G = [d >>> 0, (F = d, 1 <= +Sa(F) ? 0 < F ? (Wa(+Ua(F / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ta((F - +(~~F >>> 0)) / 4294967296) >>> 0 : 0)];
    u[c >> 2] = G[0];
    u[c + 4 >> 2] = G[1];
  } else {
    U(1281);
  }
}, Zc:function(a, b, c) {
  if (c) {
    a = O.getQueryParameter(wd[a], b);
    var d;
    "boolean" == typeof a ? d = a ? 1 : 0 : d = a;
    u[c >> 2] = d;
  } else {
    U(1281);
  }
}, mg:function(a, b, c) {
  if (c) {
    a = O.Xk.getQueryObjectEXT(vd[a], b);
    var d;
    "boolean" == typeof a ? d = a ? 1 : 0 : d = a;
    u[c >> 2] = d;
  } else {
    U(1281);
  }
}, _c:function(a, b, c) {
  c ? u[c >> 2] = O.getQuery(a, b) : U(1281);
}, og:function(a, b, c) {
  c ? u[c >> 2] = O.Xk.getQueryEXT(a, b) : U(1281);
}, Ne:function(a, b, c) {
  c ? u[c >> 2] = O.getRenderbufferParameter(a, b) : U(1281);
}, Bb:function(a, b, c) {
  c ? (a = xd[a], D[c >> 2] = O.getSamplerParameter(a, b)) : U(1281);
}, Cb:function(a, b, c) {
  c ? (a = xd[a], u[c >> 2] = O.getSamplerParameter(a, b)) : U(1281);
}, Le:function(a, b, c, d) {
  a = O.getShaderInfoLog(S[a]);
  null === a && (a = "(unknown error)");
  b = 0 < b && d ? n(a, d, b) : 0;
  c && (u[c >> 2] = b);
}, Ke:function(a, b, c, d) {
  a = O.getShaderPrecisionFormat(a, b);
  u[c >> 2] = a.rangeMin;
  u[c + 4 >> 2] = a.rangeMax;
  u[d >> 2] = a.precision;
}, Je:function(a, b, c, d) {
  if (a = O.getShaderSource(S[a])) {
    b = 0 < b && d ? n(a, d, b) : 0, c && (u[c >> 2] = b);
  }
}, Me:function(a, b, c) {
  c ? 35716 == b ? (a = O.getShaderInfoLog(S[a]), null === a && (a = "(unknown error)"), u[c >> 2] = a.length + 1) : 35720 == b ? (a = O.getShaderSource(S[a]), u[c >> 2] = null === a || 0 == a.length ? 0 : a.length + 1) : u[c >> 2] = O.getShaderParameter(S[a], b) : U(1281);
}, Ie:function(a) {
  if (Bd[a]) {
    return Bd[a];
  }
  switch(a) {
    case 7939:
      var b = O.getSupportedExtensions() || [];
      b = b.concat(b.map(function(a) {
        return "GL_" + a;
      }));
      b = Pd(b.join(" "));
      break;
    case 7936:
    case 7937:
    case 37445:
    case 37446:
      (b = O.getParameter(a)) || U(1280);
      b = Pd(b);
      break;
    case 7938:
      b = O.getParameter(7938);
      b = 2 <= T.version ? "OpenGL ES 3.0 (" + b + ")" : "OpenGL ES 2.0 (" + b + ")";
      b = Pd(b);
      break;
    case 35724:
      b = O.getParameter(35724);
      var c = b.match(/^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/);
      null !== c && (3 == c[1].length && (c[1] += "0"), b = "OpenGL ES GLSL ES " + c[1] + " (" + b + ")");
      b = Pd(b);
      break;
    default:
      return U(1280), 0;
  }
  return Bd[a] = b;
}, ec:function(a, b) {
  if (2 > T.version) {
    return U(1282), 0;
  }
  var c = Cd[a];
  if (c) {
    return 0 > b || b >= c.length ? (U(1281), 0) : c[b];
  }
  switch(a) {
    case 7939:
      return c = O.getSupportedExtensions() || [], c = c.concat(c.map(function(a) {
        return "GL_" + a;
      })), c = c.map(function(a) {
        return Pd(a);
      }), c = Cd[a] = c, 0 > b || b >= c.length ? (U(1281), 0) : c[b];
    default:
      return U(1280), 0;
  }
}, Ob:function(a, b, c, d, e) {
  0 > c ? U(1281) : e ? (a = O.getSyncParameter(zd[a], b), u[d >> 2] = a, null !== a && d && (u[d >> 2] = 1)) : U(1281);
}, He:function(a, b, c) {
  c ? D[c >> 2] = O.getTexParameter(a, b) : U(1281);
}, Ge:function(a, b, c) {
  c ? u[c >> 2] = O.getTexParameter(a, b) : U(1281);
}, Cc:function(a, b, c, d, e, f, k) {
  a = P[a];
  if (a = O.getTransformFeedbackVarying(a, b)) {
    k && 0 < c ? (c = n(a.name, k, c), d && (u[d >> 2] = c)) : d && (u[d >> 2] = 0), e && (u[e >> 2] = a.size), f && (u[f >> 2] = a.type);
  }
}, ac:function(a, b) {
  return O.getUniformBlockIndex(P[a], A(b));
}, cc:function(a, b, c, d) {
  if (d) {
    if (0 < b && (0 == c || 0 == d)) {
      U(1281);
    } else {
      a = P[a];
      for (var e = [], f = 0; f < b; f++) {
        e.push(A(u[c + 4 * f >> 2]));
      }
      if (a = O.getUniformIndices(a, e)) {
        for (b = a.length, f = 0; f < b; f++) {
          u[d + 4 * f >> 2] = a[f];
        }
      }
    }
  } else {
    U(1281);
  }
}, De:function(a, b) {
  b = A(b);
  var c = 0;
  if ("]" == b[b.length - 1]) {
    var d = b.lastIndexOf("[");
    c = "]" != b[d + 1] ? parseInt(b.slice(d + 1)) : 0;
    b = b.slice(0, d);
  }
  return (a = Ad[a] && Ad[a].nm[b]) && 0 <= c && c < a[0] ? a[1] + c : -1;
}, Fe:function(a, b, c) {
  Qd(a, b, c, 2);
}, Ee:function(a, b, c) {
  Qd(a, b, c, 0);
}, tc:function(a, b, c) {
  Qd(a, b, c, 0);
}, Ac:function(a, b, c) {
  Rd(a, b, c, 0);
}, zc:function(a, b, c) {
  Rd(a, b, c, 0);
}, Ae:function(a, b, c) {
  c ? u[c >> 2] = O.getVertexAttribOffset(a, b) : U(1281);
}, Ce:function(a, b, c) {
  Rd(a, b, c, 2);
}, Be:function(a, b, c) {
  Rd(a, b, c, 5);
}, ze:function(a, b) {
  O.hint(a, b);
}, pb:function(a, b, c) {
  for (var d = Ld[b], e = 0; e < b; e++) {
    d[e] = u[c + 4 * e >> 2];
  }
  O.invalidateFramebuffer(a, d);
}, ob:function(a, b, c, d, e, f, k) {
  for (var l = Ld[b], m = 0; m < b; m++) {
    l[m] = u[c + 4 * m >> 2];
  }
  O.invalidateSubFramebuffer(a, l, d, e, f, k);
}, ye:function(a) {
  return (a = rd[a]) ? O.isBuffer(a) : 0;
}, xe:function(a) {
  return O.isEnabled(a);
}, we:function(a) {
  return (a = sd[a]) ? O.isFramebuffer(a) : 0;
}, ve:function(a) {
  return (a = P[a]) ? O.isProgram(a) : 0;
}, cd:function(a) {
  return (a = wd[a]) ? O.isQuery(a) : 0;
}, sg:function(a) {
  return (a = vd[a]) ? O.Xk.isQueryEXT(a) : 0;
}, ue:function(a) {
  return (a = td[a]) ? O.isRenderbuffer(a) : 0;
}, Jb:function(a) {
  return (a = xd[a]) ? O.isSampler(a) : 0;
}, te:function(a) {
  return (a = S[a]) ? O.isShader(a) : 0;
}, Ub:function(a) {
  return (a = zd[a]) ? O.isSync(a) : 0;
}, re:function(a) {
  return (a = Q[a]) ? O.isTexture(a) : 0;
}, wb:function(a) {
  return O.isTransformFeedback(yd[a]);
}, Kc:function(a) {
  return (a = ud[a]) ? O.isVertexArray(a) : 0;
}, gg:function(a) {
  return (a = ud[a]) ? O.isVertexArray(a) : 0;
}, qe:function(a) {
  O.lineWidth(a);
}, pe:function(a) {
  O.linkProgram(P[a]);
  Id(a);
}, vb:function() {
  O.pauseTransformFeedback();
}, oe:function(a, b) {
  3317 == a && (Dd = b);
  O.pixelStorei(a, b);
}, ne:function(a, b) {
  O.polygonOffset(a, b);
}, rb:function() {
  U(1280);
}, qb:function() {
  U(1280);
}, pg:function(a, b) {
  O.Xk.queryCounterEXT(vd[a], b);
}, ld:function(a) {
  O.readBuffer(a);
}, me:function(a, b, c, d, e, f, k) {
  if (2 <= T.version) {
    if (O.kl) {
      O.readPixels(a, b, c, d, e, f, k);
    } else {
      var l = Sd(f);
      O.readPixels(a, b, c, d, e, f, l, k >> Td(l));
    }
  } else {
    (k = Ud(f, e, c, d, k)) ? O.readPixels(a, b, c, d, e, f, k) : U(1280);
  }
}, le:function() {
}, ke:function(a, b, c, d) {
  O.renderbufferStorage(a, b, c, d);
}, Pc:function(a, b, c, d, e) {
  O.renderbufferStorageMultisample(a, b, c, d, e);
}, tb:function() {
  O.resumeTransformFeedback();
}, je:function(a, b) {
  O.sampleCoverage(a, !!b);
}, Eb:function(a, b, c) {
  O.samplerParameterf(xd[a], b, c);
}, Db:function(a, b, c) {
  O.samplerParameterf(xd[a], b, D[c >> 2]);
}, Hb:function(a, b, c) {
  O.samplerParameteri(xd[a], b, c);
}, Gb:function(a, b, c) {
  O.samplerParameteri(xd[a], b, u[c >> 2]);
}, ie:function(a, b, c, d) {
  O.scissor(a, b, c, d);
}, he:function() {
  U(1280);
}, ge:function(a, b, c, d) {
  b = Gd(b, c, d);
  O.shaderSource(S[a], b);
}, fe:function(a, b, c) {
  O.stencilFunc(a, b, c);
}, ee:function(a, b, c, d) {
  O.stencilFuncSeparate(a, b, c, d);
}, de:function(a) {
  O.stencilMask(a);
}, ce:function(a, b) {
  O.stencilMaskSeparate(a, b);
}, be:function(a, b, c) {
  O.stencilOp(a, b, c);
}, ae:function(a, b, c, d) {
  O.stencilOpSeparate(a, b, c, d);
}, $d:function(a, b, c, d, e, f, k, l, m) {
  if (2 <= T.version) {
    if (O.Pk) {
      O.texImage2D(a, b, c, d, e, f, k, l, m);
    } else {
      if (m) {
        var q = Sd(l);
        O.texImage2D(a, b, c, d, e, f, k, l, q, m >> Td(q));
      } else {
        O.texImage2D(a, b, c, d, e, f, k, l, null);
      }
    }
  } else {
    O.texImage2D(a, b, c, d, e, f, k, l, m ? Ud(l, k, d, e, m) : null);
  }
}, jd:function(a, b, c, d, e, f, k, l, m, q) {
  if (O.Pk) {
    O.texImage3D(a, b, c, d, e, f, k, l, m, q);
  } else {
    if (q) {
      var r = Sd(m);
      O.texImage3D(a, b, c, d, e, f, k, l, m, r, q >> Td(r));
    } else {
      O.texImage3D(a, b, c, d, e, f, k, l, m, null);
    }
  }
}, _d:function(a, b, c) {
  O.texParameterf(a, b, c);
}, Zd:function(a, b, c) {
  O.texParameterf(a, b, D[c >> 2]);
}, Yd:function(a, b, c) {
  O.texParameteri(a, b, c);
}, Xd:function(a, b, c) {
  O.texParameteri(a, b, u[c >> 2]);
}, nb:function(a, b, c, d, e) {
  O.texStorage2D(a, b, c, d, e);
}, mb:function(a, b, c, d, e, f) {
  O.texStorage3D(a, b, c, d, e, f);
}, Wd:function(a, b, c, d, e, f, k, l, m) {
  if (2 <= T.version) {
    if (O.Pk) {
      O.texSubImage2D(a, b, c, d, e, f, k, l, m);
    } else {
      if (m) {
        var q = Sd(l);
        O.texSubImage2D(a, b, c, d, e, f, k, l, q, m >> Td(q));
      } else {
        O.texSubImage2D(a, b, c, d, e, f, k, l, null);
      }
    }
  } else {
    q = null, m && (q = Ud(l, k, e, f, m)), O.texSubImage2D(a, b, c, d, e, f, k, l, q);
  }
}, id:function(a, b, c, d, e, f, k, l, m, q, r) {
  if (O.Pk) {
    O.texSubImage3D(a, b, c, d, e, f, k, l, m, q, r);
  } else {
    if (r) {
      var x = Sd(q);
      O.texSubImage3D(a, b, c, d, e, f, k, l, m, q, x, r >> Td(x));
    } else {
      O.texSubImage3D(a, b, c, d, e, f, k, l, m, q, null);
    }
  }
}, Dc:function(a, b, c, d) {
  a = P[a];
  for (var e = [], f = 0; f < b; f++) {
    e.push(A(u[c + 4 * f >> 2]));
  }
  O.transformFeedbackVaryings(a, e, d);
}, Vd:function(a, b) {
  O.uniform1f(R[a], b);
}, Ud:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform1fv(R[a], D, c >> 2, b);
  } else {
    if (256 >= b) {
      for (var d = V[b - 1], e = 0; e < b; ++e) {
        d[e] = D[c + 4 * e >> 2];
      }
    } else {
      d = D.subarray(c >> 2, c + 4 * b >> 2);
    }
    O.uniform1fv(R[a], d);
  }
}, Td:function(a, b) {
  O.uniform1i(R[a], b);
}, Sd:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform1iv(R[a], u, c >> 2, b);
  } else {
    if (256 >= b) {
      for (var d = Fd[b - 1], e = 0; e < b; ++e) {
        d[e] = u[c + 4 * e >> 2];
      }
    } else {
      d = u.subarray(c >> 2, c + 4 * b >> 2);
    }
    O.uniform1iv(R[a], d);
  }
}, rc:function(a, b) {
  O.uniform1ui(R[a], b);
}, nc:function(a, b, c) {
  O.uniform1uiv(R[a], C, c >> 2, b);
}, Rd:function(a, b, c) {
  O.uniform2f(R[a], b, c);
}, Qd:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform2fv(R[a], D, c >> 2, 2 * b);
  } else {
    if (256 >= 2 * b) {
      for (var d = V[2 * b - 1], e = 0; e < 2 * b; e += 2) {
        d[e] = D[c + 4 * e >> 2], d[e + 1] = D[c + (4 * e + 4) >> 2];
      }
    } else {
      d = D.subarray(c >> 2, c + 8 * b >> 2);
    }
    O.uniform2fv(R[a], d);
  }
}, Pd:function(a, b, c) {
  O.uniform2i(R[a], b, c);
}, Od:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform2iv(R[a], u, c >> 2, 2 * b);
  } else {
    if (256 >= 2 * b) {
      for (var d = Fd[2 * b - 1], e = 0; e < 2 * b; e += 2) {
        d[e] = u[c + 4 * e >> 2], d[e + 1] = u[c + (4 * e + 4) >> 2];
      }
    } else {
      d = u.subarray(c >> 2, c + 8 * b >> 2);
    }
    O.uniform2iv(R[a], d);
  }
}, qc:function(a, b, c) {
  O.uniform2ui(R[a], b, c);
}, mc:function(a, b, c) {
  O.uniform2uiv(R[a], C, c >> 2, 2 * b);
}, Nd:function(a, b, c, d) {
  O.uniform3f(R[a], b, c, d);
}, Md:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform3fv(R[a], D, c >> 2, 3 * b);
  } else {
    if (256 >= 3 * b) {
      for (var d = V[3 * b - 1], e = 0; e < 3 * b; e += 3) {
        d[e] = D[c + 4 * e >> 2], d[e + 1] = D[c + (4 * e + 4) >> 2], d[e + 2] = D[c + (4 * e + 8) >> 2];
      }
    } else {
      d = D.subarray(c >> 2, c + 12 * b >> 2);
    }
    O.uniform3fv(R[a], d);
  }
}, Ld:function(a, b, c, d) {
  O.uniform3i(R[a], b, c, d);
}, Kd:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform3iv(R[a], u, c >> 2, 3 * b);
  } else {
    if (256 >= 3 * b) {
      for (var d = Fd[3 * b - 1], e = 0; e < 3 * b; e += 3) {
        d[e] = u[c + 4 * e >> 2], d[e + 1] = u[c + (4 * e + 4) >> 2], d[e + 2] = u[c + (4 * e + 8) >> 2];
      }
    } else {
      d = u.subarray(c >> 2, c + 12 * b >> 2);
    }
    O.uniform3iv(R[a], d);
  }
}, pc:function(a, b, c, d) {
  O.uniform3ui(R[a], b, c, d);
}, lc:function(a, b, c) {
  O.uniform3uiv(R[a], C, c >> 2, 3 * b);
}, Jd:function(a, b, c, d, e) {
  O.uniform4f(R[a], b, c, d, e);
}, Id:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform4fv(R[a], D, c >> 2, 4 * b);
  } else {
    if (256 >= 4 * b) {
      for (var d = V[4 * b - 1], e = 0; e < 4 * b; e += 4) {
        d[e] = D[c + 4 * e >> 2], d[e + 1] = D[c + (4 * e + 4) >> 2], d[e + 2] = D[c + (4 * e + 8) >> 2], d[e + 3] = D[c + (4 * e + 12) >> 2];
      }
    } else {
      d = D.subarray(c >> 2, c + 16 * b >> 2);
    }
    O.uniform4fv(R[a], d);
  }
}, Hd:function(a, b, c, d, e) {
  O.uniform4i(R[a], b, c, d, e);
}, Gd:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform4iv(R[a], u, c >> 2, 4 * b);
  } else {
    if (256 >= 4 * b) {
      for (var d = Fd[4 * b - 1], e = 0; e < 4 * b; e += 4) {
        d[e] = u[c + 4 * e >> 2], d[e + 1] = u[c + (4 * e + 4) >> 2], d[e + 2] = u[c + (4 * e + 8) >> 2], d[e + 3] = u[c + (4 * e + 12) >> 2];
      }
    } else {
      d = u.subarray(c >> 2, c + 16 * b >> 2);
    }
    O.uniform4iv(R[a], d);
  }
}, oc:function(a, b, c, d, e) {
  O.uniform4ui(R[a], b, c, d, e);
}, jc:function(a, b, c) {
  O.uniform4uiv(R[a], C, c >> 2, 4 * b);
}, Yb:function(a, b, c) {
  a = P[a];
  O.uniformBlockBinding(a, b, c);
}, Fd:function(a, b, c, d) {
  if (2 <= T.version) {
    O.uniformMatrix2fv(R[a], !!c, D, d >> 2, 4 * b);
  } else {
    if (256 >= 4 * b) {
      for (var e = V[4 * b - 1], f = 0; f < 4 * b; f += 4) {
        e[f] = D[d + 4 * f >> 2], e[f + 1] = D[d + (4 * f + 4) >> 2], e[f + 2] = D[d + (4 * f + 8) >> 2], e[f + 3] = D[d + (4 * f + 12) >> 2];
      }
    } else {
      e = D.subarray(d >> 2, d + 16 * b >> 2);
    }
    O.uniformMatrix2fv(R[a], !!c, e);
  }
}, Xc:function(a, b, c, d) {
  O.uniformMatrix2x3fv(R[a], !!c, D, d >> 2, 6 * b);
}, Vc:function(a, b, c, d) {
  O.uniformMatrix2x4fv(R[a], !!c, D, d >> 2, 8 * b);
}, Ed:function(a, b, c, d) {
  if (2 <= T.version) {
    O.uniformMatrix3fv(R[a], !!c, D, d >> 2, 9 * b);
  } else {
    if (256 >= 9 * b) {
      for (var e = V[9 * b - 1], f = 0; f < 9 * b; f += 9) {
        e[f] = D[d + 4 * f >> 2], e[f + 1] = D[d + (4 * f + 4) >> 2], e[f + 2] = D[d + (4 * f + 8) >> 2], e[f + 3] = D[d + (4 * f + 12) >> 2], e[f + 4] = D[d + (4 * f + 16) >> 2], e[f + 5] = D[d + (4 * f + 20) >> 2], e[f + 6] = D[d + (4 * f + 24) >> 2], e[f + 7] = D[d + (4 * f + 28) >> 2], e[f + 8] = D[d + (4 * f + 32) >> 2];
      }
    } else {
      e = D.subarray(d >> 2, d + 36 * b >> 2);
    }
    O.uniformMatrix3fv(R[a], !!c, e);
  }
}, Wc:function(a, b, c, d) {
  O.uniformMatrix3x2fv(R[a], !!c, D, d >> 2, 6 * b);
}, Tc:function(a, b, c, d) {
  O.uniformMatrix3x4fv(R[a], !!c, D, d >> 2, 12 * b);
}, Dd:function(a, b, c, d) {
  if (2 <= T.version) {
    O.uniformMatrix4fv(R[a], !!c, D, d >> 2, 16 * b);
  } else {
    if (256 >= 16 * b) {
      for (var e = V[16 * b - 1], f = 0; f < 16 * b; f += 16) {
        e[f] = D[d + 4 * f >> 2], e[f + 1] = D[d + (4 * f + 4) >> 2], e[f + 2] = D[d + (4 * f + 8) >> 2], e[f + 3] = D[d + (4 * f + 12) >> 2], e[f + 4] = D[d + (4 * f + 16) >> 2], e[f + 5] = D[d + (4 * f + 20) >> 2], e[f + 6] = D[d + (4 * f + 24) >> 2], e[f + 7] = D[d + (4 * f + 28) >> 2], e[f + 8] = D[d + (4 * f + 32) >> 2], e[f + 9] = D[d + (4 * f + 36) >> 2], e[f + 10] = D[d + (4 * f + 40) >> 2], e[f + 11] = D[d + (4 * f + 44) >> 2], e[f + 12] = D[d + (4 * f + 48) >> 2], e[f + 13] = D[d + (4 * 
        f + 52) >> 2], e[f + 14] = D[d + (4 * f + 56) >> 2], e[f + 15] = D[d + (4 * f + 60) >> 2];
      }
    } else {
      e = D.subarray(d >> 2, d + 64 * b >> 2);
    }
    O.uniformMatrix4fv(R[a], !!c, e);
  }
}, Uc:function(a, b, c, d) {
  O.uniformMatrix4x2fv(R[a], !!c, D, d >> 2, 8 * b);
}, Sc:function(a, b, c, d) {
  O.uniformMatrix4x3fv(R[a], !!c, D, d >> 2, 12 * b);
}, Cd:function(a) {
  O.useProgram(P[a]);
}, Bd:function(a) {
  O.validateProgram(P[a]);
}, Ad:function(a, b) {
  O.vertexAttrib1f(a, b);
}, zd:function(a, b) {
  O.vertexAttrib1f(a, D[b >> 2]);
}, yd:function(a, b, c) {
  O.vertexAttrib2f(a, b, c);
}, xd:function(a, b) {
  O.vertexAttrib2f(a, D[b >> 2], D[b + 4 >> 2]);
}, wd:function(a, b, c, d) {
  O.vertexAttrib3f(a, b, c, d);
}, ud:function(a, b) {
  O.vertexAttrib3f(a, D[b >> 2], D[b + 4 >> 2], D[b + 8 >> 2]);
}, td:function(a, b, c, d, e) {
  O.vertexAttrib4f(a, b, c, d, e);
}, sd:function(a, b) {
  O.vertexAttrib4f(a, D[b >> 2], D[b + 4 >> 2], D[b + 8 >> 2], D[b + 12 >> 2]);
}, Ab:function(a, b) {
  O.vertexAttribDivisor(a, b);
}, cg:function(a, b) {
  O.vertexAttribDivisor(a, b);
}, ib:function(a, b) {
  O.vertexAttribDivisor(a, b);
}, pd:function(a, b) {
  O.vertexAttribDivisor(a, b);
}, kb:function(a, b) {
  O.vertexAttribDivisor(a, b);
}, yc:function(a, b, c, d, e) {
  O.vertexAttribI4i(a, b, c, d, e);
}, wc:function(a, b) {
  O.vertexAttribI4i(a, u[b >> 2], u[b + 4 >> 2], u[b + 8 >> 2], u[b + 12 >> 2]);
}, xc:function(a, b, c, d, e) {
  O.vertexAttribI4ui(a, b, c, d, e);
}, uc:function(a, b) {
  O.vertexAttribI4ui(a, C[b >> 2], C[b + 4 >> 2], C[b + 8 >> 2], C[b + 12 >> 2]);
}, Bc:function(a, b, c, d, e) {
  O.vertexAttribIPointer(a, b, c, d, e);
}, rd:function(a, b, c, d, e, f) {
  O.vertexAttribPointer(a, b, c, !!d, e, f);
}, qd:function(a, b, c, d) {
  O.viewport(a, b, c, d);
}, Rb:function(a, b, c, d) {
  c >>>= 0;
  d >>>= 0;
  O.waitSync(zd[a], b, 4294967295 == c && 4294967295 == d ? -1 : +(c >>> 0) + 4294967296 * +(d >>> 0));
}, f:function(a, b) {
  X(a, b || 1);
  throw "longjmp";
}, vg:function(a, b, c) {
  y.set(y.subarray(b, b + c), a);
}, wg:function(a) {
  var b = w.length;
  if (2147418112 < a) {
    return !1;
  }
  for (var c = 1; 4 >= c; c *= 2) {
    var d = b * (1 + .2 / c);
    d = Math.min(d, a + 100663296);
    d = Math.max(16777216, a, d);
    0 < d % 65536 && (d += 65536 - d % 65536);
    a: {
      try {
        xa.grow(Math.min(2147418112, d) - buffer.byteLength + 65535 >> 16);
        Ja(xa.buffer);
        var e = 1;
        break a;
      } catch (f) {
      }
      e = void 0;
    }
    if (e) {
      return !0;
    }
  }
  return !1;
}, ka:function() {
  return T ? T.handle : 0;
}, $:function(a) {
  return ad(a) ? 0 : -5;
}, Fg:function(a, b) {
  var c = 0;
  ce().forEach(function(d, e) {
    var f = b + c;
    e = u[a + 4 * e >> 2] = f;
    for (f = 0; f < d.length; ++f) {
      w[e++ >> 0] = d.charCodeAt(f);
    }
    w[e >> 0] = 0;
    c += d.length + 1;
  });
  return 0;
}, Gg:function(a, b) {
  var c = ce();
  u[a >> 2] = c.length;
  var d = 0;
  c.forEach(function(a) {
    d += a.length + 1;
  });
  u[b >> 2] = d;
  return 0;
}, Gc:function(a) {
  if (!wa && (za = !0, g.onExit)) {
    g.onExit(a);
  }
  ea(a, new pa(a));
}, N:function() {
  return 0;
}, Eg:function(a, b) {
  try {
    var c = ib.em(a), d = c.tty ? 2 : (void 0).Kn(c.mode) ? 3 : (void 0).Ln(c.mode) ? 7 : 4;
    w[b >> 0] = d;
    return 0;
  } catch (e) {
    return t(e), e.gl;
  }
}, Lg:function(a, b, c, d) {
  try {
    var e = ib.em(a), f = ib.Gn(e, b, c);
    u[d >> 2] = f;
    return 0;
  } catch (k) {
    return t(k), k.gl;
  }
}, db:function() {
  return 0;
}, Mg:function(a, b, c, d) {
  try {
    for (var e = 0, f = 0; f < c; f++) {
      for (var k = u[b + 8 * f >> 2], l = u[b + (8 * f + 4) >> 2], m = 0; m < l; m++) {
        var q = y[k + m], r = gb[a];
        0 === q || 10 === q ? ((1 === a ? qa : ra)(Da(r, 0)), r.length = 0) : r.push(q);
      }
      e += l;
    }
    u[d >> 2] = e;
    return 0;
  } catch (x) {
    return t(x), x.gl;
  }
}, a:function() {
  return ua | 0;
}, $b:function(a) {
  O.activeTexture(a);
}, Qb:function(a, b) {
  O.attachShader(P[a], S[b]);
}, Fb:function(a, b, c) {
  O.bindAttribLocation(P[a], b, A(c));
}, ub:function(a, b) {
  35051 == a ? O.kl = b : 35052 == a && (O.Pk = b);
  O.bindBuffer(a, rd[b]);
}, jb:function(a, b) {
  O.bindFramebuffer(a, sd[b]);
}, cb:function(a, b) {
  O.bindRenderbuffer(a, td[b]);
}, bb:function(a, b) {
  O.bindTexture(a, Q[b]);
}, ab:function(a, b, c, d) {
  O.blendColor(a, b, c, d);
}, $a:function(a) {
  O.blendEquation(a);
}, _a:function(a, b) {
  O.blendFunc(a, b);
}, Za:function(a, b, c, d) {
  2 <= T.version ? c ? O.bufferData(a, y, d, c, b) : O.bufferData(a, b, d) : O.bufferData(a, c ? y.subarray(c, c + b) : b, d);
}, Ya:function(a, b, c, d) {
  2 <= T.version ? O.bufferSubData(a, b, y, d, c) : O.bufferSubData(a, b, y.subarray(d, d + c));
}, Xa:function(a) {
  return O.checkFramebufferStatus(a);
}, Q:function(a) {
  O.clear(a);
}, _:function(a, b, c, d) {
  O.clearColor(a, b, c, d);
}, R:function(a) {
  O.clearStencil(a);
}, Wa:function(a, b, c, d) {
  O.colorMask(!!a, !!b, !!c, !!d);
}, Va:function(a) {
  O.compileShader(S[a]);
}, Ua:function(a, b, c, d, e, f, k, l) {
  2 <= T.version ? O.Pk ? O.compressedTexImage2D(a, b, c, d, e, f, k, l) : O.compressedTexImage2D(a, b, c, d, e, f, y, l, k) : O.compressedTexImage2D(a, b, c, d, e, f, l ? y.subarray(l, l + k) : null);
}, Ta:function(a, b, c, d, e, f, k, l, m) {
  2 <= T.version ? O.Pk ? O.compressedTexSubImage2D(a, b, c, d, e, f, k, l, m) : O.compressedTexSubImage2D(a, b, c, d, e, f, k, y, m, l) : O.compressedTexSubImage2D(a, b, c, d, e, f, k, m ? y.subarray(m, m + l) : null);
}, Sa:function(a, b, c, d, e, f, k, l) {
  O.copyTexSubImage2D(a, b, c, d, e, f, k, l);
}, Qa:function() {
  var a = Ed(P), b = O.createProgram();
  b.name = a;
  P[a] = b;
  return a;
}, Pa:function(a) {
  var b = Ed(S);
  S[b] = O.createShader(a);
  return b;
}, Oa:function(a) {
  O.cullFace(a);
}, Na:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = rd[d];
    e && (O.deleteBuffer(e), e.name = 0, rd[d] = null, d == Jd && (Jd = 0), d == Kd && (Kd = 0), d == O.kl && (O.kl = 0), d == O.Pk && (O.Pk = 0));
  }
}, Ma:function(a, b) {
  for (var c = 0; c < a; ++c) {
    var d = u[b + 4 * c >> 2], e = sd[d];
    e && (O.deleteFramebuffer(e), e.name = 0, sd[d] = null);
  }
}, La:function(a) {
  if (a) {
    var b = P[a];
    b ? (O.deleteProgram(b), b.name = 0, P[a] = null, Ad[a] = null) : U(1281);
  }
}, Ka:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = td[d];
    e && (O.deleteRenderbuffer(e), e.name = 0, td[d] = null);
  }
}, Ja:function(a) {
  if (a) {
    var b = S[a];
    b ? (O.deleteShader(b), S[a] = null) : U(1281);
  }
}, Ia:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = u[b + 4 * c >> 2], e = Q[d];
    e && (O.deleteTexture(e), e.name = 0, Q[d] = null);
  }
}, Ha:function(a) {
  O.depthMask(!!a);
}, Fa:function(a) {
  O.disable(a);
}, Ea:function(a) {
  O.disableVertexAttribArray(a);
}, Da:function(a, b, c) {
  O.drawArrays(a, b, c);
}, Ca:Md, Ba:function(a) {
  O.enable(a);
}, Aa:function(a) {
  O.enableVertexAttribArray(a);
}, za:function() {
  O.finish();
}, ya:function() {
  O.flush();
}, xa:function(a, b, c, d) {
  O.framebufferRenderbuffer(a, b, c, td[d]);
}, wa:function(a, b, c, d, e) {
  O.framebufferTexture2D(a, b, c, Q[d], e);
}, ua:function(a) {
  O.frontFace(a);
}, ta:function(a, b) {
  W(a, b, "createBuffer", rd);
}, sa:function(a, b) {
  W(a, b, "createFramebuffer", sd);
}, ra:function(a, b) {
  W(a, b, "createRenderbuffer", td);
}, qa:function(a, b) {
  W(a, b, "createTexture", Q);
}, pa:function(a) {
  O.generateMipmap(a);
}, oa:function(a, b, c) {
  c ? u[c >> 2] = O.getBufferParameter(a, b) : U(1281);
}, na:function() {
  var a = O.getError() || qd;
  qd = 0;
  return a;
}, ma:function(a, b, c, d) {
  a = O.getFramebufferAttachmentParameter(a, b, c);
  if (a instanceof WebGLRenderbuffer || a instanceof WebGLTexture) {
    a = a.name | 0;
  }
  u[d >> 2] = a;
}, K:function(a, b) {
  Nd(a, b, 0);
}, la:function(a, b, c, d) {
  a = O.getProgramInfoLog(P[a]);
  null === a && (a = "(unknown error)");
  b = 0 < b && d ? n(a, d, b) : 0;
  c && (u[c >> 2] = b);
}, ja:function(a, b, c) {
  if (c) {
    if (a >= pd) {
      U(1281);
    } else {
      var d = Ad[a];
      if (d) {
        if (35716 == b) {
          a = O.getProgramInfoLog(P[a]), null === a && (a = "(unknown error)"), u[c >> 2] = a.length + 1;
        } else {
          if (35719 == b) {
            u[c >> 2] = d.Vl;
          } else {
            if (35722 == b) {
              if (-1 == d.bl) {
                a = P[a];
                var e = O.getProgramParameter(a, 35721);
                for (b = d.bl = 0; b < e; ++b) {
                  d.bl = Math.max(d.bl, O.getActiveAttrib(a, b).name.length + 1);
                }
              }
              u[c >> 2] = d.bl;
            } else {
              if (35381 == b) {
                if (-1 == d.cl) {
                  for (a = P[a], e = O.getProgramParameter(a, 35382), b = d.cl = 0; b < e; ++b) {
                    d.cl = Math.max(d.cl, O.getActiveUniformBlockName(a, b).length + 1);
                  }
                }
                u[c >> 2] = d.cl;
              } else {
                u[c >> 2] = O.getProgramParameter(P[a], b);
              }
            }
          }
        }
      } else {
        U(1282);
      }
    }
  } else {
    U(1281);
  }
}, ia:function(a, b, c) {
  c ? u[c >> 2] = O.getRenderbufferParameter(a, b) : U(1281);
}, ha:function(a, b, c, d) {
  a = O.getShaderInfoLog(S[a]);
  null === a && (a = "(unknown error)");
  b = 0 < b && d ? n(a, d, b) : 0;
  c && (u[c >> 2] = b);
}, ga:function(a, b, c, d) {
  a = O.getShaderPrecisionFormat(a, b);
  u[c >> 2] = a.rangeMin;
  u[c + 4 >> 2] = a.rangeMax;
  u[d >> 2] = a.precision;
}, fa:function(a, b, c) {
  c ? 35716 == b ? (a = O.getShaderInfoLog(S[a]), null === a && (a = "(unknown error)"), u[c >> 2] = a.length + 1) : 35720 == b ? (a = O.getShaderSource(S[a]), u[c >> 2] = null === a || 0 == a.length ? 0 : a.length + 1) : u[c >> 2] = O.getShaderParameter(S[a], b) : U(1281);
}, ea:function(a) {
  if (Bd[a]) {
    return Bd[a];
  }
  switch(a) {
    case 7939:
      var b = O.getSupportedExtensions() || [];
      b = b.concat(b.map(function(a) {
        return "GL_" + a;
      }));
      b = Pd(b.join(" "));
      break;
    case 7936:
    case 7937:
    case 37445:
    case 37446:
      (b = O.getParameter(a)) || U(1280);
      b = Pd(b);
      break;
    case 7938:
      b = O.getParameter(7938);
      b = 2 <= T.version ? "OpenGL ES 3.0 (" + b + ")" : "OpenGL ES 2.0 (" + b + ")";
      b = Pd(b);
      break;
    case 35724:
      b = O.getParameter(35724);
      var c = b.match(/^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/);
      null !== c && (3 == c[1].length && (c[1] += "0"), b = "OpenGL ES GLSL ES " + c[1] + " (" + b + ")");
      b = Pd(b);
      break;
    default:
      return U(1280), 0;
  }
  return Bd[a] = b;
}, da:function(a, b) {
  b = A(b);
  var c = 0;
  if ("]" == b[b.length - 1]) {
    var d = b.lastIndexOf("[");
    c = "]" != b[d + 1] ? parseInt(b.slice(d + 1)) : 0;
    b = b.slice(0, d);
  }
  return (a = Ad[a] && Ad[a].nm[b]) && 0 <= c && c < a[0] ? a[1] + c : -1;
}, ca:function(a) {
  return (a = Q[a]) ? O.isTexture(a) : 0;
}, ba:function(a) {
  O.lineWidth(a);
}, aa:function(a) {
  O.linkProgram(P[a]);
  Id(a);
}, Ih:function(a, b) {
  3317 == a && (Dd = b);
  O.pixelStorei(a, b);
}, Hh:function(a, b, c, d, e, f, k) {
  if (2 <= T.version) {
    if (O.kl) {
      O.readPixels(a, b, c, d, e, f, k);
    } else {
      var l = Sd(f);
      O.readPixels(a, b, c, d, e, f, l, k >> Td(l));
    }
  } else {
    (k = Ud(f, e, c, d, k)) ? O.readPixels(a, b, c, d, e, f, k) : U(1280);
  }
}, Gh:function(a, b, c, d) {
  O.renderbufferStorage(a, b, c, d);
}, Fh:function(a, b, c, d) {
  O.scissor(a, b, c, d);
}, Eh:function(a, b, c, d) {
  b = Gd(b, c, d);
  O.shaderSource(S[a], b);
}, Dh:function(a, b, c) {
  O.stencilFunc(a, b, c);
}, Ch:function(a, b, c, d) {
  O.stencilFuncSeparate(a, b, c, d);
}, Bh:function(a) {
  O.stencilMask(a);
}, Ah:function(a, b) {
  O.stencilMaskSeparate(a, b);
}, zh:function(a, b, c) {
  O.stencilOp(a, b, c);
}, yh:function(a, b, c, d) {
  O.stencilOpSeparate(a, b, c, d);
}, xh:function(a, b, c, d, e, f, k, l, m) {
  if (2 <= T.version) {
    if (O.Pk) {
      O.texImage2D(a, b, c, d, e, f, k, l, m);
    } else {
      if (m) {
        var q = Sd(l);
        O.texImage2D(a, b, c, d, e, f, k, l, q, m >> Td(q));
      } else {
        O.texImage2D(a, b, c, d, e, f, k, l, null);
      }
    }
  } else {
    O.texImage2D(a, b, c, d, e, f, k, l, m ? Ud(l, k, d, e, m) : null);
  }
}, wh:function(a, b, c) {
  O.texParameterf(a, b, c);
}, vh:function(a, b, c) {
  O.texParameterf(a, b, D[c >> 2]);
}, uh:function(a, b, c) {
  O.texParameteri(a, b, c);
}, th:function(a, b, c) {
  O.texParameteri(a, b, u[c >> 2]);
}, sh:function(a, b, c, d, e, f, k, l, m) {
  if (2 <= T.version) {
    if (O.Pk) {
      O.texSubImage2D(a, b, c, d, e, f, k, l, m);
    } else {
      if (m) {
        var q = Sd(l);
        O.texSubImage2D(a, b, c, d, e, f, k, l, q, m >> Td(q));
      } else {
        O.texSubImage2D(a, b, c, d, e, f, k, l, null);
      }
    }
  } else {
    q = null, m && (q = Ud(l, k, e, f, m)), O.texSubImage2D(a, b, c, d, e, f, k, l, q);
  }
}, rh:function(a, b) {
  O.uniform1f(R[a], b);
}, qh:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform1fv(R[a], D, c >> 2, b);
  } else {
    if (256 >= b) {
      for (var d = V[b - 1], e = 0; e < b; ++e) {
        d[e] = D[c + 4 * e >> 2];
      }
    } else {
      d = D.subarray(c >> 2, c + 4 * b >> 2);
    }
    O.uniform1fv(R[a], d);
  }
}, ph:function(a, b) {
  O.uniform1i(R[a], b);
}, oh:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform1iv(R[a], u, c >> 2, b);
  } else {
    if (256 >= b) {
      for (var d = Fd[b - 1], e = 0; e < b; ++e) {
        d[e] = u[c + 4 * e >> 2];
      }
    } else {
      d = u.subarray(c >> 2, c + 4 * b >> 2);
    }
    O.uniform1iv(R[a], d);
  }
}, nh:function(a, b, c) {
  O.uniform2f(R[a], b, c);
}, mh:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform2fv(R[a], D, c >> 2, 2 * b);
  } else {
    if (256 >= 2 * b) {
      for (var d = V[2 * b - 1], e = 0; e < 2 * b; e += 2) {
        d[e] = D[c + 4 * e >> 2], d[e + 1] = D[c + (4 * e + 4) >> 2];
      }
    } else {
      d = D.subarray(c >> 2, c + 8 * b >> 2);
    }
    O.uniform2fv(R[a], d);
  }
}, lh:function(a, b, c) {
  O.uniform2i(R[a], b, c);
}, kh:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform2iv(R[a], u, c >> 2, 2 * b);
  } else {
    if (256 >= 2 * b) {
      for (var d = Fd[2 * b - 1], e = 0; e < 2 * b; e += 2) {
        d[e] = u[c + 4 * e >> 2], d[e + 1] = u[c + (4 * e + 4) >> 2];
      }
    } else {
      d = u.subarray(c >> 2, c + 8 * b >> 2);
    }
    O.uniform2iv(R[a], d);
  }
}, jh:function(a, b, c, d) {
  O.uniform3f(R[a], b, c, d);
}, ih:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform3fv(R[a], D, c >> 2, 3 * b);
  } else {
    if (256 >= 3 * b) {
      for (var d = V[3 * b - 1], e = 0; e < 3 * b; e += 3) {
        d[e] = D[c + 4 * e >> 2], d[e + 1] = D[c + (4 * e + 4) >> 2], d[e + 2] = D[c + (4 * e + 8) >> 2];
      }
    } else {
      d = D.subarray(c >> 2, c + 12 * b >> 2);
    }
    O.uniform3fv(R[a], d);
  }
}, hh:function(a, b, c, d) {
  O.uniform3i(R[a], b, c, d);
}, gh:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform3iv(R[a], u, c >> 2, 3 * b);
  } else {
    if (256 >= 3 * b) {
      for (var d = Fd[3 * b - 1], e = 0; e < 3 * b; e += 3) {
        d[e] = u[c + 4 * e >> 2], d[e + 1] = u[c + (4 * e + 4) >> 2], d[e + 2] = u[c + (4 * e + 8) >> 2];
      }
    } else {
      d = u.subarray(c >> 2, c + 12 * b >> 2);
    }
    O.uniform3iv(R[a], d);
  }
}, fh:function(a, b, c, d, e) {
  O.uniform4f(R[a], b, c, d, e);
}, eh:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform4fv(R[a], D, c >> 2, 4 * b);
  } else {
    if (256 >= 4 * b) {
      for (var d = V[4 * b - 1], e = 0; e < 4 * b; e += 4) {
        d[e] = D[c + 4 * e >> 2], d[e + 1] = D[c + (4 * e + 4) >> 2], d[e + 2] = D[c + (4 * e + 8) >> 2], d[e + 3] = D[c + (4 * e + 12) >> 2];
      }
    } else {
      d = D.subarray(c >> 2, c + 16 * b >> 2);
    }
    O.uniform4fv(R[a], d);
  }
}, dh:function(a, b, c, d, e) {
  O.uniform4i(R[a], b, c, d, e);
}, ch:function(a, b, c) {
  if (2 <= T.version) {
    O.uniform4iv(R[a], u, c >> 2, 4 * b);
  } else {
    if (256 >= 4 * b) {
      for (var d = Fd[4 * b - 1], e = 0; e < 4 * b; e += 4) {
        d[e] = u[c + 4 * e >> 2], d[e + 1] = u[c + (4 * e + 4) >> 2], d[e + 2] = u[c + (4 * e + 8) >> 2], d[e + 3] = u[c + (4 * e + 12) >> 2];
      }
    } else {
      d = u.subarray(c >> 2, c + 16 * b >> 2);
    }
    O.uniform4iv(R[a], d);
  }
}, bh:function(a, b, c, d) {
  if (2 <= T.version) {
    O.uniformMatrix2fv(R[a], !!c, D, d >> 2, 4 * b);
  } else {
    if (256 >= 4 * b) {
      for (var e = V[4 * b - 1], f = 0; f < 4 * b; f += 4) {
        e[f] = D[d + 4 * f >> 2], e[f + 1] = D[d + (4 * f + 4) >> 2], e[f + 2] = D[d + (4 * f + 8) >> 2], e[f + 3] = D[d + (4 * f + 12) >> 2];
      }
    } else {
      e = D.subarray(d >> 2, d + 16 * b >> 2);
    }
    O.uniformMatrix2fv(R[a], !!c, e);
  }
}, ah:function(a, b, c, d) {
  if (2 <= T.version) {
    O.uniformMatrix3fv(R[a], !!c, D, d >> 2, 9 * b);
  } else {
    if (256 >= 9 * b) {
      for (var e = V[9 * b - 1], f = 0; f < 9 * b; f += 9) {
        e[f] = D[d + 4 * f >> 2], e[f + 1] = D[d + (4 * f + 4) >> 2], e[f + 2] = D[d + (4 * f + 8) >> 2], e[f + 3] = D[d + (4 * f + 12) >> 2], e[f + 4] = D[d + (4 * f + 16) >> 2], e[f + 5] = D[d + (4 * f + 20) >> 2], e[f + 6] = D[d + (4 * f + 24) >> 2], e[f + 7] = D[d + (4 * f + 28) >> 2], e[f + 8] = D[d + (4 * f + 32) >> 2];
      }
    } else {
      e = D.subarray(d >> 2, d + 36 * b >> 2);
    }
    O.uniformMatrix3fv(R[a], !!c, e);
  }
}, $g:function(a, b, c, d) {
  if (2 <= T.version) {
    O.uniformMatrix4fv(R[a], !!c, D, d >> 2, 16 * b);
  } else {
    if (256 >= 16 * b) {
      for (var e = V[16 * b - 1], f = 0; f < 16 * b; f += 16) {
        e[f] = D[d + 4 * f >> 2], e[f + 1] = D[d + (4 * f + 4) >> 2], e[f + 2] = D[d + (4 * f + 8) >> 2], e[f + 3] = D[d + (4 * f + 12) >> 2], e[f + 4] = D[d + (4 * f + 16) >> 2], e[f + 5] = D[d + (4 * f + 20) >> 2], e[f + 6] = D[d + (4 * f + 24) >> 2], e[f + 7] = D[d + (4 * f + 28) >> 2], e[f + 8] = D[d + (4 * f + 32) >> 2], e[f + 9] = D[d + (4 * f + 36) >> 2], e[f + 10] = D[d + (4 * f + 40) >> 2], e[f + 11] = D[d + (4 * f + 44) >> 2], e[f + 12] = D[d + (4 * f + 48) >> 2], e[f + 13] = D[d + (4 * 
        f + 52) >> 2], e[f + 14] = D[d + (4 * f + 56) >> 2], e[f + 15] = D[d + (4 * f + 60) >> 2];
      }
    } else {
      e = D.subarray(d >> 2, d + 64 * b >> 2);
    }
    O.uniformMatrix4fv(R[a], !!c, e);
  }
}, _g:function(a) {
  O.useProgram(P[a]);
}, Zg:function(a, b) {
  O.vertexAttrib1f(a, b);
}, Yg:function(a, b) {
  O.vertexAttrib2f(a, D[b >> 2], D[b + 4 >> 2]);
}, Xg:function(a, b) {
  O.vertexAttrib3f(a, D[b >> 2], D[b + 4 >> 2], D[b + 8 >> 2]);
}, Wg:function(a, b) {
  O.vertexAttrib4f(a, D[b >> 2], D[b + 4 >> 2], D[b + 8 >> 2], D[b + 12 >> 2]);
}, Vg:function(a, b, c, d, e, f) {
  O.vertexAttribPointer(a, b, c, !!d, e, f);
}, Ug:function(a, b, c, d) {
  O.viewport(a, b, c, d);
}, m:ue, u:ve, h:we, G:xe, Sg:ye, Z:ze, Y:Ae, X:Be, i:Ce, j:De, t:Ee, v:Fe, Rg:Ge, Pg:He, Qg:Ie, memory:xa, Cg:function() {
  return 0;
}, q:function(a) {
  a = +a;
  return 0 <= a ? +Ua(a + .5) : +Ta(a - .5);
}, F:function(a) {
  a = +a;
  return 0 <= a ? +Ua(a + .5) : +Ta(a - .5);
}, r:Wd, vd:function() {
}, P:function() {
}, ad:function() {
}, Rc:function() {
}, b:function(a) {
  ua = a | 0;
}, Bg:function(a, b, c, d) {
  return je(a, b, c, d);
}, table:ya, c:function(a, b, c) {
  a |= 0;
  b |= 0;
  c |= 0;
  for (var d = 0, e; (d | 0) < (c | 0);) {
    e = u[b + (d << 3) >> 2] | 0;
    if (0 == (e | 0)) {
      break;
    }
    if ((e | 0) == (a | 0)) {
      return u[b + ((d << 3) + 4) >> 2] | 0;
    }
    d = d + 1 | 0;
  }
  return 0;
}}, Ke = function() {
  function a(a) {
    g.asm = a.exports;
    Xa--;
    g.monitorRunDependencies && g.monitorRunDependencies(Xa);
    0 == Xa && (null !== Ya && (clearInterval(Ya), Ya = null), Za && (a = Za, Za = null, a()));
  }
  function b(b) {
    a(b.instance);
  }
  function c(a) {
    return db().then(function(a) {
      return WebAssembly.instantiate(a, d);
    }).then(a, function(a) {
      ra("failed to asynchronously prepare wasm: " + a);
      t(a);
    });
  }
  var d = {env:Je, wasi_snapshot_preview1:Je};
  Xa++;
  g.monitorRunDependencies && g.monitorRunDependencies(Xa);
  if (g.instantiateWasm) {
    try {
      return g.instantiateWasm(d, a);
    } catch (e) {
      return ra("Module.instantiateWasm callback failed with error: " + e), !1;
    }
  }
  (function() {
    if (va || "function" !== typeof WebAssembly.instantiateStreaming || $a() || "function" !== typeof fetch) {
      return c(b);
    }
    fetch(ab, {credentials:"same-origin"}).then(function(a) {
      return WebAssembly.instantiateStreaming(a, d).then(b, function(a) {
        ra("wasm streaming compile failed: " + a);
        ra("falling back to ArrayBuffer instantiation");
        c(b);
      });
    });
  })();
  return {};
}();
g.asm = Ke;
var eb = g.___wasm_call_ctors = function() {
  return (eb = g.___wasm_call_ctors = g.asm.Jh).apply(null, arguments);
}, Ba = g._malloc = function() {
  return (Ba = g._malloc = g.asm.Kh).apply(null, arguments);
}, cc = g._free = function() {
  return (cc = g._free = g.asm.Lh).apply(null, arguments);
}, Xd = g._realloc = function() {
  return (Xd = g._realloc = g.asm.Mh).apply(null, arguments);
}, X = g._setThrew = function() {
  return (X = g._setThrew = g.asm.Nh).apply(null, arguments);
}, re = g.__ZSt18uncaught_exceptionv = function() {
  return (re = g.__ZSt18uncaught_exceptionv = g.asm.Oh).apply(null, arguments);
}, bc = g.___getTypeName = function() {
  return (bc = g.___getTypeName = g.asm.Ph).apply(null, arguments);
};
g.___embind_register_native_and_builtin_types = function() {
  return (g.___embind_register_native_and_builtin_types = g.asm.Qh).apply(null, arguments);
};
var te = g._emscripten_GetProcAddress = function() {
  return (te = g._emscripten_GetProcAddress = g.asm.Rh).apply(null, arguments);
}, se = g._memalign = function() {
  return (se = g._memalign = g.asm.Sh).apply(null, arguments);
}, Le = g.dynCall_v = function() {
  return (Le = g.dynCall_v = g.asm.Th).apply(null, arguments);
}, Me = g.dynCall_vi = function() {
  return (Me = g.dynCall_vi = g.asm.Uh).apply(null, arguments);
}, Ne = g.dynCall_vii = function() {
  return (Ne = g.dynCall_vii = g.asm.Vh).apply(null, arguments);
}, Oe = g.dynCall_viii = function() {
  return (Oe = g.dynCall_viii = g.asm.Wh).apply(null, arguments);
}, Pe = g.dynCall_viiii = function() {
  return (Pe = g.dynCall_viiii = g.asm.Xh).apply(null, arguments);
}, Qe = g.dynCall_viiiii = function() {
  return (Qe = g.dynCall_viiiii = g.asm.Yh).apply(null, arguments);
}, Re = g.dynCall_viiiiii = function() {
  return (Re = g.dynCall_viiiiii = g.asm.Zh).apply(null, arguments);
}, Se = g.dynCall_viiiiiiiii = function() {
  return (Se = g.dynCall_viiiiiiiii = g.asm._h).apply(null, arguments);
}, Te = g.dynCall_ii = function() {
  return (Te = g.dynCall_ii = g.asm.$h).apply(null, arguments);
}, Ue = g.dynCall_iii = function() {
  return (Ue = g.dynCall_iii = g.asm.ai).apply(null, arguments);
}, Ve = g.dynCall_iiii = function() {
  return (Ve = g.dynCall_iiii = g.asm.bi).apply(null, arguments);
}, We = g.dynCall_iiiii = function() {
  return (We = g.dynCall_iiiii = g.asm.ci).apply(null, arguments);
}, Xe = g.dynCall_iiiiii = function() {
  return (Xe = g.dynCall_iiiiii = g.asm.di).apply(null, arguments);
}, Ye = g.dynCall_iiiiiii = function() {
  return (Ye = g.dynCall_iiiiiii = g.asm.ei).apply(null, arguments);
}, Ze = g.dynCall_iiiiiiiiii = function() {
  return (Ze = g.dynCall_iiiiiiiiii = g.asm.fi).apply(null, arguments);
}, Y = g.stackSave = function() {
  return (Y = g.stackSave = g.asm.gi).apply(null, arguments);
};
g.stackAlloc = function() {
  return (g.stackAlloc = g.asm.hi).apply(null, arguments);
};
var Z = g.stackRestore = function() {
  return (Z = g.stackRestore = g.asm.ii).apply(null, arguments);
};
g.dynCall_i = function() {
  return (g.dynCall_i = g.asm.ji).apply(null, arguments);
};
g.dynCall_vif = function() {
  return (g.dynCall_vif = g.asm.ki).apply(null, arguments);
};
g.dynCall_viffi = function() {
  return (g.dynCall_viffi = g.asm.li).apply(null, arguments);
};
g.dynCall_viifi = function() {
  return (g.dynCall_viifi = g.asm.mi).apply(null, arguments);
};
g.dynCall_viffffi = function() {
  return (g.dynCall_viffffi = g.asm.ni).apply(null, arguments);
};
g.dynCall_viiif = function() {
  return (g.dynCall_viiif = g.asm.oi).apply(null, arguments);
};
g.dynCall_viiiiiiii = function() {
  return (g.dynCall_viiiiiiii = g.asm.pi).apply(null, arguments);
};
g.dynCall_viifiiiii = function() {
  return (g.dynCall_viifiiiii = g.asm.qi).apply(null, arguments);
};
g.dynCall_viifiiiiii = function() {
  return (g.dynCall_viifiiiiii = g.asm.ri).apply(null, arguments);
};
g.dynCall_viififiiiii = function() {
  return (g.dynCall_viififiiiii = g.asm.si).apply(null, arguments);
};
g.dynCall_viififiiiiii = function() {
  return (g.dynCall_viififiiiiii = g.asm.ti).apply(null, arguments);
};
g.dynCall_viiffii = function() {
  return (g.dynCall_viiffii = g.asm.ui).apply(null, arguments);
};
g.dynCall_vifffi = function() {
  return (g.dynCall_vifffi = g.asm.vi).apply(null, arguments);
};
g.dynCall_viiff = function() {
  return (g.dynCall_viiff = g.asm.wi).apply(null, arguments);
};
g.dynCall_viiffi = function() {
  return (g.dynCall_viiffi = g.asm.xi).apply(null, arguments);
};
g.dynCall_viiiifiii = function() {
  return (g.dynCall_viiiifiii = g.asm.yi).apply(null, arguments);
};
g.dynCall_viiiffii = function() {
  return (g.dynCall_viiiffii = g.asm.zi).apply(null, arguments);
};
g.dynCall_vifff = function() {
  return (g.dynCall_vifff = g.asm.Ai).apply(null, arguments);
};
g.dynCall_viff = function() {
  return (g.dynCall_viff = g.asm.Bi).apply(null, arguments);
};
g.dynCall_iifii = function() {
  return (g.dynCall_iifii = g.asm.Ci).apply(null, arguments);
};
g.dynCall_vifii = function() {
  return (g.dynCall_vifii = g.asm.Di).apply(null, arguments);
};
g.dynCall_viif = function() {
  return (g.dynCall_viif = g.asm.Ei).apply(null, arguments);
};
g.dynCall_fi = function() {
  return (g.dynCall_fi = g.asm.Fi).apply(null, arguments);
};
g.dynCall_fii = function() {
  return (g.dynCall_fii = g.asm.Gi).apply(null, arguments);
};
g.dynCall_iiffii = function() {
  return (g.dynCall_iiffii = g.asm.Hi).apply(null, arguments);
};
g.dynCall_viffii = function() {
  return (g.dynCall_viffii = g.asm.Ii).apply(null, arguments);
};
g.dynCall_iiifi = function() {
  return (g.dynCall_iiifi = g.asm.Ji).apply(null, arguments);
};
g.dynCall_viffff = function() {
  return (g.dynCall_viffff = g.asm.Ki).apply(null, arguments);
};
g.dynCall_iif = function() {
  return (g.dynCall_iif = g.asm.Li).apply(null, arguments);
};
g.dynCall_iiffi = function() {
  return (g.dynCall_iiffi = g.asm.Mi).apply(null, arguments);
};
g.dynCall_viifffffffffi = function() {
  return (g.dynCall_viifffffffffi = g.asm.Ni).apply(null, arguments);
};
g.dynCall_viffffii = function() {
  return (g.dynCall_viffffii = g.asm.Oi).apply(null, arguments);
};
g.dynCall_vifffff = function() {
  return (g.dynCall_vifffff = g.asm.Pi).apply(null, arguments);
};
g.dynCall_vifffiiff = function() {
  return (g.dynCall_vifffiiff = g.asm.Qi).apply(null, arguments);
};
g.dynCall_iiff = function() {
  return (g.dynCall_iiff = g.asm.Ri).apply(null, arguments);
};
g.dynCall_viffffff = function() {
  return (g.dynCall_viffffff = g.asm.Si).apply(null, arguments);
};
g.dynCall_vifffffffff = function() {
  return (g.dynCall_vifffffffff = g.asm.Ti).apply(null, arguments);
};
g.dynCall_iifff = function() {
  return (g.dynCall_iifff = g.asm.Ui).apply(null, arguments);
};
g.dynCall_iifiii = function() {
  return (g.dynCall_iifiii = g.asm.Vi).apply(null, arguments);
};
g.dynCall_vifiii = function() {
  return (g.dynCall_vifiii = g.asm.Wi).apply(null, arguments);
};
g.dynCall_viifff = function() {
  return (g.dynCall_viifff = g.asm.Xi).apply(null, arguments);
};
g.dynCall_iiffffi = function() {
  return (g.dynCall_iiffffi = g.asm.Yi).apply(null, arguments);
};
g.dynCall_iiiif = function() {
  return (g.dynCall_iiiif = g.asm.Zi).apply(null, arguments);
};
g.dynCall_iiiiiiiii = function() {
  return (g.dynCall_iiiiiiiii = g.asm._i).apply(null, arguments);
};
g.dynCall_iiifiiiii = function() {
  return (g.dynCall_iiifiiiii = g.asm.$i).apply(null, arguments);
};
g.dynCall_iiifiiiiii = function() {
  return (g.dynCall_iiifiiiiii = g.asm.aj).apply(null, arguments);
};
g.dynCall_iiififiiiii = function() {
  return (g.dynCall_iiififiiiii = g.asm.bj).apply(null, arguments);
};
g.dynCall_iiififiiiiii = function() {
  return (g.dynCall_iiififiiiiii = g.asm.cj).apply(null, arguments);
};
g.dynCall_viifffi = function() {
  return (g.dynCall_viifffi = g.asm.dj).apply(null, arguments);
};
g.dynCall_viiiff = function() {
  return (g.dynCall_viiiff = g.asm.ej).apply(null, arguments);
};
g.dynCall_viiiffi = function() {
  return (g.dynCall_viiiffi = g.asm.fj).apply(null, arguments);
};
g.dynCall_viiiiiii = function() {
  return (g.dynCall_viiiiiii = g.asm.gj).apply(null, arguments);
};
g.dynCall_viiffffi = function() {
  return (g.dynCall_viiffffi = g.asm.hj).apply(null, arguments);
};
g.dynCall_viiiiifiii = function() {
  return (g.dynCall_viiiiifiii = g.asm.ij).apply(null, arguments);
};
g.dynCall_viiiiffii = function() {
  return (g.dynCall_viiiiffii = g.asm.jj).apply(null, arguments);
};
g.dynCall_iiiiiiii = function() {
  return (g.dynCall_iiiiiiii = g.asm.kj).apply(null, arguments);
};
g.dynCall_iiif = function() {
  return (g.dynCall_iiif = g.asm.lj).apply(null, arguments);
};
g.dynCall_iiiffi = function() {
  return (g.dynCall_iiiffi = g.asm.mj).apply(null, arguments);
};
g.dynCall_iiifff = function() {
  return (g.dynCall_iiifff = g.asm.nj).apply(null, arguments);
};
g.dynCall_fiii = function() {
  return (g.dynCall_fiii = g.asm.oj).apply(null, arguments);
};
g.dynCall_viiffff = function() {
  return (g.dynCall_viiffff = g.asm.pj).apply(null, arguments);
};
g.dynCall_viiifffffffffi = function() {
  return (g.dynCall_viiifffffffffi = g.asm.qj).apply(null, arguments);
};
g.dynCall_viiffffii = function() {
  return (g.dynCall_viiffffii = g.asm.rj).apply(null, arguments);
};
g.dynCall_viifffff = function() {
  return (g.dynCall_viifffff = g.asm.sj).apply(null, arguments);
};
g.dynCall_viifffiiff = function() {
  return (g.dynCall_viifffiiff = g.asm.tj).apply(null, arguments);
};
g.dynCall_iiiff = function() {
  return (g.dynCall_iiiff = g.asm.uj).apply(null, arguments);
};
g.dynCall_viiffffff = function() {
  return (g.dynCall_viiffffff = g.asm.vj).apply(null, arguments);
};
g.dynCall_viifffffffff = function() {
  return (g.dynCall_viifffffffff = g.asm.wj).apply(null, arguments);
};
g.dynCall_vidi = function() {
  return (g.dynCall_vidi = g.asm.xj).apply(null, arguments);
};
g.dynCall_vid = function() {
  return (g.dynCall_vid = g.asm.yj).apply(null, arguments);
};
g.dynCall_viidi = function() {
  return (g.dynCall_viidi = g.asm.zj).apply(null, arguments);
};
g.dynCall_viid = function() {
  return (g.dynCall_viid = g.asm.Aj).apply(null, arguments);
};
g.dynCall_di = function() {
  return (g.dynCall_di = g.asm.Bj).apply(null, arguments);
};
g.dynCall_dii = function() {
  return (g.dynCall_dii = g.asm.Cj).apply(null, arguments);
};
g.dynCall_iiid = function() {
  return (g.dynCall_iiid = g.asm.Dj).apply(null, arguments);
};
g.dynCall_fiiiiii = function() {
  return (g.dynCall_fiiiiii = g.asm.Ej).apply(null, arguments);
};
g.dynCall_viiiiiff = function() {
  return (g.dynCall_viiiiiff = g.asm.Fj).apply(null, arguments);
};
g.dynCall_viiiiifiiiiii = function() {
  return (g.dynCall_viiiiifiiiiii = g.asm.Gj).apply(null, arguments);
};
g.dynCall_iiifii = function() {
  return (g.dynCall_iiifii = g.asm.Hj).apply(null, arguments);
};
g.dynCall_ji = function() {
  return (g.dynCall_ji = g.asm.Ij).apply(null, arguments);
};
g.dynCall_iiji = function() {
  return (g.dynCall_iiji = g.asm.Jj).apply(null, arguments);
};
g.dynCall_iijjiii = function() {
  return (g.dynCall_iijjiii = g.asm.Kj).apply(null, arguments);
};
g.dynCall_iij = function() {
  return (g.dynCall_iij = g.asm.Lj).apply(null, arguments);
};
g.dynCall_vijjjii = function() {
  return (g.dynCall_vijjjii = g.asm.Mj).apply(null, arguments);
};
g.dynCall_viiiiifi = function() {
  return (g.dynCall_viiiiifi = g.asm.Nj).apply(null, arguments);
};
g.dynCall_viiiiiiifi = function() {
  return (g.dynCall_viiiiiiifi = g.asm.Oj).apply(null, arguments);
};
g.dynCall_viiiiiiiiifi = function() {
  return (g.dynCall_viiiiiiiiifi = g.asm.Pj).apply(null, arguments);
};
g.dynCall_viiiiiiiiiifi = function() {
  return (g.dynCall_viiiiiiiiiifi = g.asm.Qj).apply(null, arguments);
};
g.dynCall_iiiiiiiiiiiiiii = function() {
  return (g.dynCall_iiiiiiiiiiiiiii = g.asm.Rj).apply(null, arguments);
};
g.dynCall_iidi = function() {
  return (g.dynCall_iidi = g.asm.Sj).apply(null, arguments);
};
g.dynCall_viiiiiiiiiiiiiii = function() {
  return (g.dynCall_viiiiiiiiiiiiiii = g.asm.Tj).apply(null, arguments);
};
g.dynCall_viji = function() {
  return (g.dynCall_viji = g.asm.Uj).apply(null, arguments);
};
g.dynCall_vijiii = function() {
  return (g.dynCall_vijiii = g.asm.Vj).apply(null, arguments);
};
g.dynCall_fffff = function() {
  return (g.dynCall_fffff = g.asm.Wj).apply(null, arguments);
};
g.dynCall_viiiiij = function() {
  return (g.dynCall_viiiiij = g.asm.Xj).apply(null, arguments);
};
g.dynCall_fiff = function() {
  return (g.dynCall_fiff = g.asm.Yj).apply(null, arguments);
};
g.dynCall_viiiiiffii = function() {
  return (g.dynCall_viiiiiffii = g.asm.Zj).apply(null, arguments);
};
g.dynCall_viifd = function() {
  return (g.dynCall_viifd = g.asm._j).apply(null, arguments);
};
g.dynCall_viddi = function() {
  return (g.dynCall_viddi = g.asm.$j).apply(null, arguments);
};
g.dynCall_viiiiffi = function() {
  return (g.dynCall_viiiiffi = g.asm.ak).apply(null, arguments);
};
g.dynCall_viijii = function() {
  return (g.dynCall_viijii = g.asm.bk).apply(null, arguments);
};
g.dynCall_jii = function() {
  return (g.dynCall_jii = g.asm.ck).apply(null, arguments);
};
g.dynCall_vijii = function() {
  return (g.dynCall_vijii = g.asm.dk).apply(null, arguments);
};
g.dynCall_vij = function() {
  return (g.dynCall_vij = g.asm.ek).apply(null, arguments);
};
g.dynCall_viiiiff = function() {
  return (g.dynCall_viiiiff = g.asm.fk).apply(null, arguments);
};
g.dynCall_vffff = function() {
  return (g.dynCall_vffff = g.asm.gk).apply(null, arguments);
};
g.dynCall_vf = function() {
  return (g.dynCall_vf = g.asm.hk).apply(null, arguments);
};
g.dynCall_viiiiiiiiii = function() {
  return (g.dynCall_viiiiiiiiii = g.asm.ik).apply(null, arguments);
};
g.dynCall_viiiiiiiiiii = function() {
  return (g.dynCall_viiiiiiiiiii = g.asm.jk).apply(null, arguments);
};
g.dynCall_iiiij = function() {
  return (g.dynCall_iiiij = g.asm.kk).apply(null, arguments);
};
g.dynCall_viiij = function() {
  return (g.dynCall_viiij = g.asm.lk).apply(null, arguments);
};
g.dynCall_iijj = function() {
  return (g.dynCall_iijj = g.asm.mk).apply(null, arguments);
};
g.dynCall_iiiiiiiiiii = function() {
  return (g.dynCall_iiiiiiiiiii = g.asm.nk).apply(null, arguments);
};
g.dynCall_iiiiiiiiiiii = function() {
  return (g.dynCall_iiiiiiiiiiii = g.asm.ok).apply(null, arguments);
};
g.dynCall_jiiii = function() {
  return (g.dynCall_jiiii = g.asm.pk).apply(null, arguments);
};
g.dynCall_diiii = function() {
  return (g.dynCall_diiii = g.asm.qk).apply(null, arguments);
};
g.dynCall_diiiiiiii = function() {
  return (g.dynCall_diiiiiiii = g.asm.rk).apply(null, arguments);
};
g.dynCall_diii = function() {
  return (g.dynCall_diii = g.asm.sk).apply(null, arguments);
};
g.dynCall_jiii = function() {
  return (g.dynCall_jiii = g.asm.tk).apply(null, arguments);
};
g.dynCall_jiji = function() {
  return (g.dynCall_jiji = g.asm.uk).apply(null, arguments);
};
g.dynCall_iidiiii = function() {
  return (g.dynCall_iidiiii = g.asm.vk).apply(null, arguments);
};
g.dynCall_iiiiij = function() {
  return (g.dynCall_iiiiij = g.asm.wk).apply(null, arguments);
};
g.dynCall_iiiiid = function() {
  return (g.dynCall_iiiiid = g.asm.xk).apply(null, arguments);
};
g.dynCall_iiiiijj = function() {
  return (g.dynCall_iiiiijj = g.asm.yk).apply(null, arguments);
};
g.dynCall_iiiiiijj = function() {
  return (g.dynCall_iiiiiijj = g.asm.zk).apply(null, arguments);
};
g.dynCall_vff = function() {
  return (g.dynCall_vff = g.asm.Ak).apply(null, arguments);
};
g.dynCall_vfi = function() {
  return (g.dynCall_vfi = g.asm.Bk).apply(null, arguments);
};
function ue(a, b) {
  var c = Y();
  try {
    return Te(a, b);
  } catch (d) {
    Z(c);
    if (d !== d + 0 && "longjmp" !== d) {
      throw d;
    }
    X(1, 0);
  }
}
function ve(a, b, c) {
  var d = Y();
  try {
    return Ue(a, b, c);
  } catch (e) {
    Z(d);
    if (e !== e + 0 && "longjmp" !== e) {
      throw e;
    }
    X(1, 0);
  }
}
function De(a, b, c) {
  var d = Y();
  try {
    Ne(a, b, c);
  } catch (e) {
    Z(d);
    if (e !== e + 0 && "longjmp" !== e) {
      throw e;
    }
    X(1, 0);
  }
}
function we(a, b, c, d) {
  var e = Y();
  try {
    return Ve(a, b, c, d);
  } catch (f) {
    Z(e);
    if (f !== f + 0 && "longjmp" !== f) {
      throw f;
    }
    X(1, 0);
  }
}
function Ce(a, b) {
  var c = Y();
  try {
    Me(a, b);
  } catch (d) {
    Z(c);
    if (d !== d + 0 && "longjmp" !== d) {
      throw d;
    }
    X(1, 0);
  }
}
function Ee(a, b, c, d) {
  var e = Y();
  try {
    Oe(a, b, c, d);
  } catch (f) {
    Z(e);
    if (f !== f + 0 && "longjmp" !== f) {
      throw f;
    }
    X(1, 0);
  }
}
function ye(a, b, c, d, e, f) {
  var k = Y();
  try {
    return Xe(a, b, c, d, e, f);
  } catch (l) {
    Z(k);
    if (l !== l + 0 && "longjmp" !== l) {
      throw l;
    }
    X(1, 0);
  }
}
function Fe(a, b, c, d, e) {
  var f = Y();
  try {
    Pe(a, b, c, d, e);
  } catch (k) {
    Z(f);
    if (k !== k + 0 && "longjmp" !== k) {
      throw k;
    }
    X(1, 0);
  }
}
function ze(a, b, c, d, e, f, k) {
  var l = Y();
  try {
    return Ye(a, b, c, d, e, f, k);
  } catch (m) {
    Z(l);
    if (m !== m + 0 && "longjmp" !== m) {
      throw m;
    }
    X(1, 0);
  }
}
function xe(a, b, c, d, e) {
  var f = Y();
  try {
    return We(a, b, c, d, e);
  } catch (k) {
    Z(f);
    if (k !== k + 0 && "longjmp" !== k) {
      throw k;
    }
    X(1, 0);
  }
}
function Ge(a, b, c, d, e, f) {
  var k = Y();
  try {
    Qe(a, b, c, d, e, f);
  } catch (l) {
    Z(k);
    if (l !== l + 0 && "longjmp" !== l) {
      throw l;
    }
    X(1, 0);
  }
}
function Ie(a, b, c, d, e, f, k, l, m, q) {
  var r = Y();
  try {
    Se(a, b, c, d, e, f, k, l, m, q);
  } catch (x) {
    Z(r);
    if (x !== x + 0 && "longjmp" !== x) {
      throw x;
    }
    X(1, 0);
  }
}
function He(a, b, c, d, e, f, k) {
  var l = Y();
  try {
    Re(a, b, c, d, e, f, k);
  } catch (m) {
    Z(l);
    if (m !== m + 0 && "longjmp" !== m) {
      throw m;
    }
    X(1, 0);
  }
}
function Ae(a, b, c, d, e, f, k, l, m, q) {
  var r = Y();
  try {
    return Ze(a, b, c, d, e, f, k, l, m, q);
  } catch (x) {
    Z(r);
    if (x !== x + 0 && "longjmp" !== x) {
      throw x;
    }
    X(1, 0);
  }
}
function Be(a) {
  var b = Y();
  try {
    Le(a);
  } catch (c) {
    Z(b);
    if (c !== c + 0 && "longjmp" !== c) {
      throw c;
    }
    X(1, 0);
  }
}
g.asm = Ke;
var $e;
g.then = function(a) {
  if ($e) {
    a(g);
  } else {
    var b = g.onRuntimeInitialized;
    g.onRuntimeInitialized = function() {
      b && b();
      a(g);
    };
  }
  return g;
};
function pa(a) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + a + ")";
  this.status = a;
}
Za = function af() {
  $e || bf();
  $e || (Za = af);
};
function bf() {
  function a() {
    if (!$e && ($e = !0, !za)) {
      Qa = !0;
      La(Na);
      La(Oa);
      if (g.onRuntimeInitialized) {
        g.onRuntimeInitialized();
      }
      if (g.postRun) {
        for ("function" == typeof g.postRun && (g.postRun = [g.postRun]); g.postRun.length;) {
          Pa.unshift(g.postRun.shift());
        }
      }
      La(Pa);
    }
  }
  if (!(0 < Xa)) {
    if (g.preRun) {
      for ("function" == typeof g.preRun && (g.preRun = [g.preRun]); g.preRun.length;) {
        Ra();
      }
    }
    La(Ma);
    0 < Xa || (g.setStatus ? (g.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        g.setStatus("");
      }, 1);
      a();
    }, 1)) : a());
  }
}
g.run = bf;
if (g.preInit) {
  for ("function" == typeof g.preInit && (g.preInit = [g.preInit]); 0 < g.preInit.length;) {
    g.preInit.pop()();
  }
}
wa = !0;
bf();
g.ready = function() {
  return new Promise(function(a, b) {
    g.onAbort = b;
    Qa ? a(g) : Pa.unshift(function() {
      a(g);
    });
  });
};
delete g.then;



  return CanvasKitInit
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
      module.exports = CanvasKitInit;
    else if (typeof define === 'function' && define['amd'])
      define([], function() { return CanvasKitInit; });
    else if (typeof exports === 'object')
      exports["CanvasKitInit"] = CanvasKitInit;
  

export default CanvasKitInit;