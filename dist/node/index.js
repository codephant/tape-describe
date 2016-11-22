"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tape = require("tape");

var _tape2 = _interopRequireDefault(_tape);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPrefixedAssert(assertKey, msgIdx) {
	return Object.defineProperty(function prefixedAssert(...args) {
		if (typeof args[msgIdx] === "string") args[msgIdx] = this.__prefix + " (" + args[msgIdx] + ")";else args.splice(msgIdx, 0, this.__prefix);
		return this.__test[assertKey].apply(this.__test, args);
	}, "name", { configurable: true, value: assertKey + "Prefixed" });
}

const decoratedAssertions = ["fail", "pass", "skip", "assert", "true", "ok", "notok", "false", "notOk", "iferror", "ifErr", "ifError", "error", "strictEquals", "strictEqual", "is", "isEqual", "equals", "equal", "isInequal", "doesNotEqual", "not", "isNot", "isNotEqual", "notStrictEquals", "notStrictEqual", "notEquals", "notEqual", "same", "isEquivalent", "deepEquals", "deepEqual", "looseEquals", "looseEqual", "deepLooseEqual", "isInequivalent", "isNotEquivalent", "isNotDeeply", "isNotDeepEqual", "notSame", "notDeeply", "notEquivalent", "notDeepEqual", "notLooseEquals", "notLooseEqual", "notDeepLooseEqual", "throws", "doesNotThrow"].filter(k => typeof _tape2.default.Test.prototype[k] === "function") //future-proofing API changes and maybe typoes
.reduce((o, k) => {
	let v = _tape2.default.Test.prototype[k];
	if (typeof v === "function") {
		let m = String(v).match(/^function \((.+)\)/);
		if (m && m[1].length) {
			let i = m[1].split(",").map(s => s.trim()).indexOf("msg");
			if (i > -1) Object.defineProperty(o, k, { value: createPrefixedAssert(k, i) });
		}
	}
	return o;
}, {});

Object.defineProperties(decoratedAssertions, { end: { value: function endPrefixed() {
			const t = this.__test;
			return t.end.apply(t, arguments);
		} },
	plan: { value: function planPrefixes() {
			const t = this.__test;
			return t.plan.apply(t, arguments);
		} }
});

function prefixedAsserts(prefix, test) {
	const o = Object.create(decoratedAssertions);
	o.__prefix = prefix;
	o.__test = test;
	return o;
}

const firstPair = o => {
	const owns = Object.prototype.hasOwnProperty;
	let k;
	for (k in o) break;
	k = k != null && owns.call(o, k) ? k : null;
	return [k, k == null ? void 0 : o[k]];
};

const noMore = (msg, cb) => _tape2.default.skip(msg, cb);
const only = (msg, cb) => _tape2.default.only(msg, cb);
const many = (...tests) => tests.forEach(t => typeof t === "function" ? t(describe) : describe.apply(void 0, firstPair(t)));

const describe = (tape => {
	function wrapEnsure(t, prefix) {
		return (msg, cb) => t.test("it " + msg, t => cb(prefixedAsserts(prefix + ": " + msg, t)));
	}
	function wrapOuterCb(cb, prefix) {
		return t => {
			const it = wrapEnsure(t, prefix);cb.call(it, it);t.end();
		};
	}
	return function describe(something, cb) {
		tape(something, wrapOuterCb(cb, something));
	};
})(_tape2.default);

Object.defineProperties(describe, { noMore: { value: noMore },
	only: { value: only },
	many: { value: many }
});

exports.default = describe;