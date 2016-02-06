"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var args = process.argv.slice(2);
var fs = require('fs');
var file = fs.readFileSync(args.shift(), "utf-8");
/* Where the magic happens */
"use strict";
if (args.length === 0) {
	args.push(0);
}
function run(source, input) {
	var _last$input_y$input_x;

	detour.interval = 1;
	detour.turbo = false;
	var lines = source.split("\n"),
	    input_y,
	    input_x;
	source = source.replace(/\s*#.*$/gm, "");
	if (lines.slice(-1)[0] === '') lines.splice(-1);
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var idx = line.indexOf(":");
		if (!input_y && ~idx) input_y = i, input_x = idx;
	}
	if (input_y === undefined) {
		var idx = Math.floor(lines.length / 2);
		if (idx % 2) idx--;
		for (var i = 0; i < lines.length; i++) {
			lines[i] = (i === idx ? ":" : " ") + lines[i];
		}
		input_y = idx;
		input_x = 0;
	}
	var lastln = last(lines, -1).replace(/^\s+/, '');
	if (lastln[0] === "@") {
		last(lines, -1, lastln[0]);
		var ln = lastln.slice(1);
		detour.vars = ln.split("@");
	}
	Item.prototype.x = input_x;
	Item.prototype.y = input_y;
	var max_length = lines.reduce(function (x, y) {
		return x.length > y.length ? x : y;
	}).length;
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];

		if (line.length < max_length) {
			lines[i] += repeat(' ', max_length - line.length);
		}
	}
	detour.chargrid = lines.map(function (x) {
		return x.split('');
	});
	detour.funcgrid = detour.chargrid.map(function (x) {
		return x.map(function (y) {
			return y === "`" ? (function (s) {
				return function (x) {
					var val = eval(s);
					if (typeof val === "string") {
						val = val.split('').reverse().join('');
						for (var i = val.length; i--;) {
							var o = new Item(x);
							o.value = val.charCodeAt(i);
							o.move();
						}
					} else {
						var o = new Item(x);
						o.value = val;
						o.move();
					}
				};
			})(detour.vars.shift()) : detour.fdict[y] || detour.fdict[' '];
		});
	});
	detour.width = detour.chargrid[0].length;
	detour.height = detour.chargrid.length;
	detour.itemgrid = [detour.newgrid(Array)];
	(_last$input_y$input_x = last(detour.itemgrid)[input_y][input_x]).push.apply(_last$input_y$input_x, _toConsumableArray(input.map(function (x) {
		return new Item(x);
	})));
	detour.start = new Date();
	detour.ticks = 0;
	detour.outlist = [];
	if (detour.turbo) {
		detour.go = true;
		while (detour.go) {
			detour.update();
		}
		process.stdout.write(detour.outlist.join("\n") + "\n");
	} else {
		detour.__timeout__ = setInterval(detour.update, detour.interval);
	}
}
function genmatrix(chars) {}

var Item = (function () {
	function Item(val, x, y) {
		_classCallCheck(this, Item);

		var len = arguments.length;
		if (len <= 1) {
			x = 0;
			y = 0;
		} else {
			this.x = x;
			this.y = y;
		}
		if (len) {
			if (typeof val === "object") {
				for (var i in val) {
					this[i] = val[i];
				}
			} else {
				this.value = val;
			}
		}
	}

	_createClass(Item, [{
		key: "move",
		value: function move(x) {
			if (~x) do {
				this._move();
			} while (x--);
			last(detour.itemgrid)[this.y][this.x].unshift(this);
		}
	}, {
		key: "_move",
		value: function _move() {
			this.x = detour.opdict.m(this.x + this.vx, detour.width);
			this.y = detour.opdict.m(this.y + this.vy, detour.height);
		}
	}, {
		key: "comp",
		value: function comp(chars) {
			var i = 1,
			    o = new Item(this);
			o.vals = [];
			while (i) {
				o._move();
				var char = detour.chargrid[o.y][o.x];
				if (char === chars[0]) {
					i++;
				} else if (char === chars[1]) {
					i--;
				} else {
					var _o$vals;

					(_o$vals = o.vals).push.apply(_o$vals, _toConsumableArray(last(detour.itemgrid)[o.y][o.x].concat(last(detour.itemgrid, -2)) || []));
				}
			}
			return o;
		}
	}, {
		key: "concat",
		value: function concat(other) {
			var o = {};
			for (var i in other) {
				if (other.hasOwnProperty(i)) o[i] = other[i];
			}
			for (var i in this) {
				if (this.hasOwnProperty(i)) o[i] = this[i];
			}
			o.other = this.other.concat(other.other);
			return new Item(o);
		}
	}, {
		key: "toString",
		value: function toString() {
			return String(this.value) + ">V<^"[this.dir];
		}
	}, {
		key: "valueOf",
		value: function valueOf() {
			return this.value;
		}
	}, {
		key: "dir",
		set: function set(val) {
			val = detour.opdict.m(val, 4);
			var xy = [- ~val % 2, val % 2].map(function (n) {
				return n * sign((Math.abs(val - 1.5) | 0) * 2 - 1);
			});
			this.vx = xy[0];
			this.vy = xy[1];
		},
		get: function get() {
			if (this.vx === 0) {
				if (this.vy === 1) {
					// [0, +1]
					return 3;
				} else {
					// [0, -1]
					return 1;
				}
			} else {
				if (this.vx === 1) {
					// [+1, 0]
					return 0;
				} else {
					// [-1, 0]
					return 2;
				}
			}
		}
	}]);

	return Item;
})();

Item.prototype.vx = 1;
Item.prototype.vy = 0;
Item.prototype.moving = true;
Item.prototype.other = [];

function setup() {
	for (var i in detour.opdict) {
		var func = detour.opdict[i];
		if (func.length === 1) detour.fdict[i] = (function (f) {
			return function (x) {
				var o = Object.create(x);
				o.value = f(o.value);
				o = new Item(o);
				o.move();
			};
		})(func);else detour.fdict[i] = (function (f) {
			return function (x, y) {
				x = x || new Item();
				var o = x.concat(y);
				o.value = f(x.value, y.value);
				o.move();
			};
		})(func);
	}
	for (var i in detour.reducers) {
		detour.fdict[i] = detour.reducers[i];
		detour.reducelist.push(detour.reducers[i]);
	}
}

function ret(value) {
	return function () {
		return value;
	};
}
function last(object, index, newval) {
	var idx;
	if (arguments.length < 2) {
		index = -1;
	}
	idx = detour.opdict.m(index, object.length);
	if (arguments.length < 3) {
		return object[idx];
	} else {
		return object[idx] = newval;
	}
}

var detour = {
	newgrid: function newgrid(item) {
		item = item || ret();
		var out = Array(detour.height);
		for (var y = 0; y < out.length; y++) {
			out[y] = Array(detour.width);
			for (var x = 0; x < out[y].length; x++) {
				out[y][x] = item();
			}
		}
		return out;
	},
	update: function update() {
		detour.ticks++;
		detour.itemgrid.push(detour.newgrid(Array));
		var table = detour.newgrid(),
		    moving = false,
		    items = detour.itemgrid.slice(-2)[0],
		    reducers = [];
		for (detour.y = 0; detour.y < detour.height; detour.y++) {
			for (detour.x = 0; detour.x < detour.width; detour.x++) {
				var args = items[detour.y][detour.x],
				    func = detour.funcgrid[detour.y][detour.x];
				while (args.length >= func.length && func.length) detour.run(func, args), moving = true;
				if (~detour.reducelist.indexOf(func) && args.length) reducers.push([detour.x, detour.y, args, func]);
			}
		}
		var go = detour.fast || confirm("moving");
		if (moving) {} else if (reducers.length) {
			var reducer = reducers[0],
			    x = reducer[0],
			    y = reducer[1],
			    args = reducer[2],
			    func = reducer[3];
			detour.run(func, args, true);
		} else {
			go = false;
		}
		if (!go) detour.stop();
		for (var y = 0; y < detour.height; y++) {
			for (var x = 0; x < detour.width; x++) {
				var cell = last(detour.itemgrid)[y][x];
				cell.splice.apply(cell, [0, 0].concat(_toConsumableArray(last(detour.itemgrid, -2)[y][x])));
				if (detour.debug) table[y][x] = detour.chargrid[y][x] + "<br> " + cell.join(' ');
			}
		}
		if (detour.itemgrid.length > 20) detour.itemgrid.shift();
	},
	interval: 350,
	fast: true,
	run: function run(func, args) {
		func.apply(undefined, _toConsumableArray(args.splice(-func.length)));
	},
	stop: function stop() {
		if (!detour.turbo) clearInterval(detour.__timeout__);
		detour.go = false;
	},
	table: function table(grid) {
		var out = "<table class='full vert'><tr>";
		for (var i = 0; i < grid.length; i++) {
			out += "\t<tr height='" + String(100 / grid.length) + "%'>\n";
			var array = grid[i];
			for (var j = 0; j < array.length; j++) {
				out += "\t\t<td width='" + String(100 / array.length) + "%'>";
				out += array[j];
				out += "</td>\n";
			}
			out += "\t</tr>\n";
		}
		out += "</table>";
		return out;
	},
	print: function print(x) {
		detour.outlist.push(x);
		if (!detour.turbo) {
			process.stdout.write(String(x) + "\n");
		}
	},
	debug: true,
	chargrid: [],
	funcgrid: [],
	itemgrid: [],
	opdict: {
		",": function _(x) {
			return detour.print(x), x;
		},
		":": function _(x) {
			return x;
		},
		" ": function _(x) {
			return x;
		},
		"<": function _(x) {
			return x - 1;
		},
		">": function _(x) {
			return x + 1;
		},
		"!": function _(x) {
			return -x;
		},
		"n": function n(x) {
			return !x;
		},
		"N": function N(x) {
			return ~x;
		},
		"V": function V(x) {
			return Math.sqrt(x);
		},
		"f": function f(x) {
			return Math.floor(x);
		},
		"c": function c(x) {
			return Math.ceil(x);
		},
		"d": function d(x) {
			return x / 2;
		},
		"D": function D(x) {
			return x * 2;
		},
		"-": function _(x, y) {
			return x - y;
		},
		"+": function _(x, y) {
			return x + y;
		},
		"*": function _(x, y) {
			return x * y;
		},
		"_": function _(x, y) {
			return x / y;
		},
		"m": function m(x, y) {
			return (x % y + y) % y;
		}, // fixed modulo
		"e": function e(x, y) {
			return Math.pow(x, y);
		},
		"o": function o(x, y) {
			return Math.max(x, y);
		},
		"O": function O(x, y) {
			return x | y;
		},
		"Z": function Z(x, y) {
			return x ^ y;
		},
		"a": function a(x, y) {
			return Math.min(x, y);
		},
		"A": function A(x, y) {
			return x & y;
		},
		"0": function _(x) {
			return 0;
		},
		"1": function _(x) {
			return 1;
		},
		"2": function _(x) {
			return 2;
		},
		"3": function _(x) {
			return 3;
		},
		"4": function _(x) {
			return 4;
		},
		"5": function _(x) {
			return 5;
		},
		"6": function _(x) {
			return 6;
		},
		"7": function _(x) {
			return 7;
		},
		"8": function _(x) {
			return 8;
		},
		"9": function _(x) {
			return 9;
		},
		"G": function G(x) {
			return detour.register || 0;
		},
		"g": function g(x) {
			return detour.register = x;
		},
		"H": function H(x) {
			return detour.register2 || 0;
		},
		"h": function h(x) {
			return detour.register2 = x;
		}
	},
	fdict: Object.defineProperties({
		".": function _(x) {
			detour.stop();
			detour.print(x.value);
		},
		"x": function x(_x) {// remove

		},
		"\\": function _(x) {
			// mirror
			var o = new Item(x),
			    temp = o.vx;
			o.vx = o.vy;
			o.vy = temp;
			o.move();
		},
		"/": function _(x) {
			// mirror
			var o = new Item(x),
			    temp = o.vx;
			o.vx = -o.vy;
			o.vy = -temp;
			o.move();
		},
		"?": function _(x) {
			// condition
			var o = new Item(x);
			if (x > 0) {
				o.move(1);
			} else {
				o.move();
			}
		},
		"T": function T(x) {
			// split
			var o = new Item(x);
			if (o.value > 0) o.dir++;
			o.move();
		},
		"Q": function Q(x) {
			// split
			var o = new Item(x);
			if (o.value > 0) {
				o.dir++;
				o._move();
				o.dir--;
				o.move(-1);
			} else {
				o.move();
			}
		},
		"$": function $(x) {
			// dupe
			var o = new Item(x),
			    p = new Item(x);
			o.move(1);
			p.move();
		},
		";": function _(x) {
			// recurse
			var o = new Item(x);
			o.x = Item.prototype.x;
			o.y = Item.prototype.y;
			o.move(-1);
			o.dir = 0;
		},
		"~": function _(x) {
			// filter
			if (x > 0) {
				new Item(x).move();
			}
		},
		"p": function p(x) {
			var o = new Item(x);
			o.dir = 0;
			o.move();
		},
		"q": function q(x) {
			var o = new Item(x);
			o.dir = 2;
			o.move();
		},
		"v": function v(x) {
			var o = new Item(x);
			o.dir = 3;
			o.move();
		},
		"^": function _(x) {
			var o = new Item(x);
			o.dir = 1;
			o.move();
		},
		"{": function _(x) {
			// dupe
			var o = x.comp("{}"),
			    p = new Item(x);
			o.move();
			p.move();
		},
		"(": function _(x) {
			// skip
			var o = x.comp("()");
			o.move();
		},
		"]": function _(x) {
			var o = new Item(x),
			    p = x.comp("][");
			if (x > 0) {
				p.move();
			} else {
				o.move();
			}
		},
		"[": function _(x) {
			var o;
			if (x <= 0) {
				o = x.comp("[]");
			} else {
				o = new Item(x);
			}
			o.move();
		},
		"r": function r(x, y) {
			// range
			var o = new Item(x);
			x = x.value;
			y = y.value;
			var swap,
			    out = [];
			if (x > y) {
				var t = x;
				x = y;
				y = t;
				swap = true;
			}
			while (x <= y) out.push(x++);
			if (!swap) out.reverse();
			for (var i = 0; i < out.length; i++) {
				var obj = new Item(o);
				obj.value = out[i];
				obj.move();
			}
		},
		"R": function R(x) {
			// range
			var o = new Item(x),
			    y;
			y = x.value;
			x = 1;
			var swap,
			    out = [];
			if (x > y) {
				var t = x;
				x = y;
				y = t;
				swap = true;
			}
			while (x <= y) out.push(x++);
			if (!swap) out.reverse();
			for (var i = 0; i < out.length; i++) {
				var obj = new Item(o);
				obj.value = out[i];
				obj.move();
			}
		},
		"s": function s(x, y) {
			// swap
			var o = new Item(x),
			    p = new Item(y);
			o.move();
			p.move();
		}
	}, {
		"%": {
			get: function get() {
				var sign = 1;
				return function (x) {
					var o = new Item(x),
					    temp = o.vx;
					o.vx = sign * o.vy;
					o.vy = sign * temp;
					o.move();
					sign *= -1;
				};
			},
			configurable: true,
			enumerable: true
		}
	}),
	reducers: {
		"L": function L() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			// reduce left
			if (args.length === 1) return new Item(args[0]).move(1);
			var o = new Item(args[0]),
			    x;
			o._move();
			var p = new Item(args[0]);
			// if (args.length%2) args.push((new Item(0)).concat(p))
			var func = detour.opdict[detour.chargrid[o.y][o.x]];
			if (args.length % 2) x = args.pop();
			p.value = args.reduce(func);
			if (typeof x !== "undefined") {
				p.value = [p, x].reduce(func);
			}
			p.move(1);
		},
		"S": function S(x, y) {
			// sum
			var o = new Item(x);
			if (arguments.length > 1) {
				o.value += y.value;
				o.move(-1);
			} else {
				o.move();
			}
		},
		"P": function P(x, y) {
			// product
			var o = new Item(x);
			if (arguments.length > 1) {
				o.value *= y.value;
				o.move(-1);
			} else {
				o.move();
			}
		},
		"&": function _(x, y) {
			// reduce
			var o = new Item(x),
			    p = new Item(x);
			if (arguments.length > 1) {
				o._move();
				p.value = detour.opdict[detour.chargrid[o.y][o.x]](x.value, y.value);
				p.move(-1);
			} else {
				o.move(1);
			}
		},
		"u": function u() {
			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			// string
			detour.print(args.reverse().map(function (x) {
				return x.value;
			}).map(function (x) {
				return String.fromCharCode(x);
			}).join(''));
		}
	},
	reducelist: []
};
setup();
run(file, args.map(Number));
function repeat(iter, count) {
	var out = iter.constructor();
	while (count--) out = out.concat(iter);
	return out;
}
function sign(x) {
	x -= 0;
	if (x === 0) return x;
	return x > 0 ? 1 : -1;
}
function abs(x){
	x -= 0;
	return x > 0 ? x : -x;
}
