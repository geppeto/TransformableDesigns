var cjs = (function (root) {
	var cjs_call = function(arg0, arg1) {
		var _ = cjs._;
		if(arguments.length === 0) {
			return cjs.create("constraint", undefined);
		} else if(_.isString(arg0)) { //Assume it's a selector, arg1 is the context
			if(arg1 === true) {
				return cjs.create("constraint", arg0);
			} else {
				return cjs.create("constraint", arg0);
				//return cjs.$.apply(cjs, arguments);
			}
		} else if(_.isFunction(arg0)) {
			if(arg1 === true) {
				return cjs.create("constraint", arg0, true);
			} else {
				return cjs.create("constraint", arg0);
			}
		} else if(cjs.is_fsm(arg0)) {
			return cjs.create("fsm_constraint", arg0, arg1);
		} else if(_.has(arg0, "condition") && _.has(arg0, "value")) {
			var args = _.toArray(arguments);
			args.unshift("conditional_constraint");
			return cjs.create.apply(cjs, args);
		} else {
			return cjs.constraint.apply(cjs, arguments);
		}
		
	};
	var cjs = function () {
		return cjs_call.apply(this, arguments);
	};

	cjs.$ = cjs.query = function(arg0, arg1) {
		var _ = cjs._;
		if(_.isString(arg0)) { //Assume it's a selector, arg1 is the context
			return cjs.create("selector_constraint", arg0, arg1);
		} else {
			return cjs.create("constraint", arg0, arg1);
		}
	};

	var factories = {};
	cjs.define = function(type, factory) {
		factories[type] = factory;
	};
	cjs.create = function(type) {
		if(factories.hasOwnProperty(type)) {
			var factory = factories[type];
			var args = [].slice.call(arguments, 1);
			return factory.apply(root, args);
		} else {
			return undefined;
		}
	};

	var types = {};
	cjs.type = function(type_name, value) {
		if(arguments.length === 1) {
			return types[type_name];
		} else if(arguments.length > 1) {
			types[type_name] = value;
		}
	};

	if (typeof exports !== 'undefined') {
		cjs._is_node = true;
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = cjs;
		}
		exports.cjs = cjs;
	} else {
		cjs._is_node = false;
		var _old_cjs = root.cjs;
		root.cjs = cjs;
		cjs.noConflict = function () {
			root.cjs = _old_cjs;
			return cjs;
		};
	}

	cjs.Exception = function(message) {
			var tmp = Error.prototype.constructor.apply(this, arguments);

			for (var p in tmp) {
				if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
			}

			this.message = tmp.message;
		};
	cjs.Exception.prototype = new Error();

	cjs._debug = false;
	cjs.version = "0.6.1";

	return cjs;
}(this));
//     Underscore.js 1.3.1
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  /*
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }
  */
	root['_'] = _;

  // Current version.
  _.VERSION = '1.3.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var result = [];
    _.reduce(initial, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
        memo[memo.length] = el;
        result[result.length] = array[i];
      }
      return memo;
    }, []);
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape || noMatch, function(match, code) {
           return "',_.escape(" + unescape(code) + "),'";
         })
         .replace(c.interpolate || noMatch, function(match, code) {
           return "'," + unescape(code) + ",'";
         })
         .replace(c.evaluate || noMatch, function(match, code) {
           return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    if (data) return func(data, _);
    return function(data) {
      return func.call(this, data, _);
    };
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(cjs);
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){
if(cjs._is_node){return;}

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rReturn = /\r\n/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;

	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];

			parts.push( m[1] );

			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context, seed );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}

				set = posProcess( selector, set, seed );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];

		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
    var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( rReturn, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );

			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}

			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},

	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},

		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) ) {
						if ( node.nodeType === 1 ) {
							return false;
						}
					}

					if ( type === "first" ) {
						return true;
					}

					node = elem;

					/* falls through */
				case "last":
					while ( (node = node.nextSibling) ) {
						if ( node.nodeType === 1 ) {
							return false;
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}

					doneName = match[0];
					parent = elem.parentNode;

					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;

						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						}

						parent[ expando ] = doneName;
					}

					diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},

		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}
// Expose origPOS
// "global" as in regardless of relation to brackets/parens
Expr.match.globalPOS = origPOS;

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}

	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}

		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );

				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );

					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}

				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );

					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}

						} else {
							return makeArray( [], extra );
						}
					}

					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}

			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );

		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try {
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem[ expando ] = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context, seed ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet, seed );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

cjs.Sizzle = Sizzle;

})();
/*jslint unparam: true */
(function(cjs) {
	var _ = cjs._;
	var rdashAlpha = /-([a-z]|[0-9])/ig, rmsPrefix = /^-ms-/;
	var fcamelCase = function(all, letter) {
		return String(letter).toUpperCase();
	};

	_.mixin({
		remove_index: function(arr, from, to) {
			//http://ejohn.org/blog/javascript-array-remove/
			var rest = arr.slice((to || from) + 1 || arr.length);
			arr.length = from < 0 ? arr.length + from : from;
			return arr.push.apply(arr, rest);
		}
		, remove: function(arr, obj) {
			var objIndex = _.index_of(arr, obj);

			if(objIndex>=0) {
				_.remove_index(arr, objIndex);
			}
		}
		, remove_all: function(arr, obj) {
			var objIndex;
			do {
				objIndex = _.index_of(arr, obj);

				if(objIndex>=0) {
					_.remove_index(arr, objIndex);
				}
			} while(objIndex >= 0);
		}
		, index_of: function(arr, item, equality_check) {
			if(equality_check === undefined) { equality_check = function(a,b) { return a === b; }; }
			return _.index_where(arr, function(x) { return equality_check(item, x); });
		}
		, index_where: function(arr, test) {
			var i, len = arr.length;
			for(i = 0; i<len; i++) {
				if(test(arr[i], i)) { return i; }
			}
			return -1;
		}
		, clear: function(arr) {
			arr.length = 0;
		}
		, insert_at: function(arr, item, index) {
			var rest;
			if(index===undefined) { return arr.push(item); }

			rest = arr.slice(index);
			arr.length = index;
			arr.push(item);
			return arr.push.apply(arr, rest);
		}
		, set_index: function(arr, old_index, new_index) {
			if(old_index>=0 && old_index < arr.length && new_index>=0 && new_index < arr.length) {
				var obj = arr[old_index];
				_.remove_index(arr, old_index);
				/*
				if(new_index > old_index) {
					new_index--; //Account for the fact that the indicies shift
				}
				*/
				_.insert_at(arr, obj, new_index);
				return obj;
			}
			return false;
		}
		, diff: function(oldArray, newArray, equality_check) {
			/*
			   diff returns an object with attributes:
			   removed, added, and moved.
			   Every item in removed has the format: {item, index}
			   Every item in added has the format: {item, index}
			   Every item in moved has the format: {from_index, to_index}

			   When oldArray removes every item in removed, adds every item in added,
			   and moves every item in moved in sequence, it will result in an array
			   that is equivalent to newArray.
			*/
			var old_arr = _.clone(oldArray)
				, new_arr = _.clone(newArray)
				, removed = []
				, added = []
				, moved = []
				, old_arr_clone = _.clone(old_arr)
				, new_arr_clone = _.clone(new_arr)
				, i, j;

			if(equality_check === undefined) { equality_check = function(a,b) { return a === b; }; }

			//Figure out removed
			for(i = 0; i<old_arr_clone.length; i++) {
				var old_item = old_arr_clone[i];
				var new_index = _.index_of(new_arr_clone, old_item, equality_check);
				if(new_index >= 0) {
					_.remove_index(new_arr_clone, new_index);
				}
				else {
					var removed_item = {
						item: old_item,
						index: i
					};
					_.remove_index(old_arr_clone, i);
					i--;

					removed.push(removed_item);
				}
			}

			//Figure out added
			old_arr_clone = _.clone(old_arr); //...reset the old array, which was mutated in the previous step
			for(i = 0; i<new_arr.length; i++) {
				var new_item = new_arr[i];
				var old_index = _.index_of(old_arr_clone, new_item, equality_check);
				if(old_index >= 0) {
					_.remove_index(old_arr_clone, old_index);
				}
				else {
					var added_item = {
						item: new_item,
						index: i
					};

					added.push(added_item);
				}
			}

			//Figure out moved by first creating an array with all of the right elements...
			var after_removing_and_adding = _.clone(old_arr);
			for(i = removed.length-1; i>=0; i--) { //Go in reverse to prevent index shifting
				var rm_index = removed[i].index;
				_.remove_index(after_removing_and_adding, rm_index);
			}
			for(i = 0; i<added.length; i++) {
				_.insert_at(after_removing_and_adding, added[i].item, added[i].index);
			}

			var added_contains_index = function(i) {
				_.any(added, function(a) {
					return a.index === i;
				});
			};
			//And then figuring out where elements may be swapped...
			var swaps = [];
			for(i = 0; i < after_removing_and_adding.length; i++) {
				var is_item = new_arr[i];
				if(!added_contains_index(i)) {
					for(j = i+1; j < after_removing_and_adding.length; j++) {
						if(!added_contains_index(i) && equality_check(after_removing_and_adding[j], is_item)) {
							swaps.push({from: j, to: i, from_item: after_removing_and_adding[j], to_item: after_removing_and_adding[i] });
							//Note that always, from > to

							var temp = after_removing_and_adding[j];
							after_removing_and_adding[j] = after_removing_and_adding[i];
							after_removing_and_adding[i] = temp;
							break;
						}
					}
				}
			}
			for(i = 0; i<swaps.length; i++) {
				var swap = swaps[i];
				var moveCommand1 = {
					from_index: swap.from,
					to_index: swap.to,
					item: swap.from_item
				};
				var moveCommand2 = {
					from_index: swap.to+1,
					to_index: swap.from,
					item: swap.to_item
				};
				if(moveCommand1.from_index!==moveCommand1.to_index) {
					moved.push(moveCommand1);
				}
				if(moveCommand2.from_index!==moveCommand2.to_index) {
					moved.push(moveCommand2);
				}
				//These two move commands are equivalent to a swap command
			}

			return {removed: removed, added: added, moved: moved};
		}

		, proto_extend: function (subClass, superClass) {
				var F = function() {};
				F.prototype = superClass.prototype;
				subClass.prototype = new F();
				subClass.prototype.constructor = subClass;
				
				subClass.superclass = superClass.prototype;
				if(superClass.prototype.constructor === Object.prototype.constructor) {
					superClass.prototype.constructor = superClass;
				}
			}
		// Convert dashed to camelCase; used by the css and data modules
		// Microsoft forgot to hump their vendor prefix (#9572)
		, camel_case: function(string) {
				return string.replace( rmsPrefix, "ms-" ).replace(rdashAlpha, fcamelCase);
			}

	});
	_.isTextElement = function(obj) {
		return !!(obj && obj.nodeType === 3);
	};
	_.isCommentElement = function(obj) {
		return !!(obj && obj.nodeType === 8);
	};
}(cjs));
/*
   Graph: A way of keeping track of nodes and edges

   Depends on:
	core.js
	array_utils.js
*/
(function(cjs) {
var _ = cjs._;

//Assume that nodes are part of at most one graph ever
var Node = function() {
	this.outgoingEdges = [];
	this.incomingEdges = [];
};

(function(my) {
	var proto = my.prototype;

	proto.addOutgoingEdge = function(edge) {
		this.outgoingEdges.push(edge);
	};
	proto.addIncomingEdge = function(edge) {
		this.incomingEdges.push(edge);
	};

	proto.removeOutgoingEdge = function(edge) {
		_.remove(this.outgoingEdges, edge);
	};
	proto.removeIncomingEdge = function(edge) {
		_.remove(this.incomingEdges, edge);
	};

	proto.getOutgoing = function() {
		return this.outgoingEdges;
	};
	proto.getIncoming = function() {
		return this.incomingEdges;
	};

	proto.destroy = function() {
		this.incomingEdges.forEach(function(edge) {
			var fromNode = edge.fromNode;
			fromNode.removeOutgoingEdge(edge);
		});
		_.clear(this.incomingEdges);

		this.outgoingEdges.forEach(function(edge) {
			var toNode = edge.toNode;
			toNode.removeIncomingEdge(edge);
		});
		_.clear(this.outgoingEdges);
	};

	proto.pointsAt = function(recursive) {
		recursive = recursive === true;
		var rv = []
			, i;
		for(i = 0; i<this.outgoingEdges.length; i++) {
			var outgoingEdge = this.outgoingEdges[i];
			var node = outgoingEdge.toNode;

			if(!_.contains(rv, node)) {
				rv.push(node);
				if(recursive) {
					rv = _.unique(rv, node.pointsAt(true));
				}
			}
		}
		return rv;
	};

	proto.pointsAtMe = function(recursive) {
		recursive = recursive === true;
		var rv = []
			, i;
		for(i = 0; i<this.incomingEdges.length; i++) {
			var incomingEdge = this.incomingEdges[i];
			var node = incomingEdge.fromNode;

			if(!_.contains(rv, node)) {
				rv.push(node);
				if(recursive) {
					rv = _.unique(rv, node.pointsAtMe(true));
				}
			}
		}
		return rv;
	};

	proto.getEdgeTo = function(toNode) {
		var i;
		for(i = 0; i<this.outgoingEdges.length; i++) {
			var outgoingEdge = this.outgoingEdges[i];
			if(outgoingEdge.fromNode === this && outgoingEdge.toNode === toNode) { return outgoingEdge; }
		}
		return null;
	};
	proto.hasEdgeTo = function(toNode) {
		return this.getEdgeTo(toNode)!==null;
	};
}(Node));

var Edge = function(fromNode, toNode) {
	this.fromNode = fromNode;
	this.toNode = toNode;
};

var Graph = function() {
};

(function(my) {
	var proto = my.prototype;
	proto.create_node = function() {
		var node = new Node();
		this.addNode(node);
		return node;
	};

	proto.hasEdge = function(arg0, arg1) {
		var fromNode, toNode, edge;
		if(arg0 instanceof Edge) {
			edge = arg0;
			fromNode = edge.fromNode;
			toNode = edge.toNode;
		}
		else {
			fromNode = arg0;
			toNode = arg1;
		}
		return fromNode.hasEdgeTo(toNode);
	};
	proto.getEdge = function(fromNode, toNode) {
		return fromNode.getEdgeTo(toNode);
	};
	proto.doAddEdge = function(edge) {
		edge.fromNode.addOutgoingEdge(edge);
		edge.toNode.addIncomingEdge(edge);

		return edge;
	};
	proto.addEdge = function(arg0, arg1){
		var fromNode, toNode, edge;
		if(arg0 instanceof Edge) {
			edge = arg0;
			fromNode = edge.fromNode;
			toNode = edge.toNode;
		}
		else {
			fromNode = arg0;
			toNode = arg1;
			edge = new Edge(fromNode, toNode);
		}
		if(!this.hasEdge(fromNode, toNode)) {
			return this.doAddEdge(edge);
		}
		return null;
	};

	proto.removeEdge = function(fromNode, toNode) {
		var edge = this.getEdge(fromNode, toNode);
		if(edge!==null) {
			fromNode.removeOutgoingEdge(edge);
			toNode.removeIncomingEdge(edge);
		}
		return edge;
	};

	proto.hasNode = function(node) {
		return node instanceof Node;
	};

	proto.addNode = function() { };

	proto.removeNode = function(node) {
		node.destroy();
	};
}(Graph));


cjs.define("graph", function() {
	return new Graph();
});
cjs.type("node", Node);
cjs.type("edge", Edge);

}(cjs));
/*
   Edge from A -> B means A sends data to B
   ---

   Constraint Solver: Implements constraint solving, as described in:
   Brad Vander Zanden, Brad A. Myers, Dario A. Giuse, and Pedro Szekely. 1994. Integrating pointer variables into one-way constraint models. ACM Trans. Comput.-Hum. Interact. 1, 2 (June 1994), 161-213. DOI=10.1145/180171.180174 http://doi.acm.org/10.1145/180171.180174

   Depends on:
	core.js
	quick_dict.js
	notifications.js
	object_oriented_utils.js
*/
(function(cjs) {
var _ = cjs._;
var Node = cjs.type("node");
var Edge = cjs.type("edge");
//CONSTRAINT SOLVER

var id = 0;
var ConstraintNode = function(obj, options) {
	Node.call(this);
	this.obj = obj;
	this.ood = true;
	this.value = null;

	this.options = _.extend({
						auto_add_outgoing_dependencies: true,
						auto_add_incoming_dependencies: true},
						options);
	
	this.timestamp = 0;
	
	this.obj.__constraint_solver_node__ = this;
	this.id = id++;
};
_.proto_extend(ConstraintNode, Node);
(function(my) {
	var proto = my.prototype;

	proto.cs_eval = function() {
		return this.obj.cs_eval();
	};

	proto.nullify = function(reasonChain) {
		this.ood = true;
		if(cjs._debug) {
			this.nullified_reason_chain = reasonChain;
		}
	};

	proto.getId = function() {
		return this.id;
	};
}(ConstraintNode));


var ConstraintEdge = function(fromNode, toNode) {
	Edge.call(this, fromNode, toNode);
	
	this.timestamp = 0;
};
_.proto_extend(ConstraintEdge, Edge);

var ConstraintSolver = function() {
	this.graph = cjs.create("graph");
	this.stack = [];
	this.listeners = [];
};

(function(my) {
	var proto = my.prototype;

	proto.getNode = function(obj) {
		var node = obj.__constraint_solver_node__ || null;
		return node;
	};

	proto.hasNode = function(obj) {
		return this.getNode(obj)!==null;
	};

	proto.addObject = function(obj, options) {
		var node = this.getNode(obj);
		
		if(node===null) {
			node = new ConstraintNode(obj, options);
					
			this.graph.addNode(node);
			if(cjs._debug_constraint_solver) {
				this.objToNode.set(obj, node);
			}
		}
		return node;
	};

	proto.removeObject = function(obj) {
		var node = this.getNode(obj);
		
		if(node!==null) {
			this.graph.removeNode(node);
			delete obj.__constraint_solver_node__;

			this.notify({
				type: "node_removed",
				node: node,
				obj: obj
			});
		}
		if(cjs._debug_constraint_solver) {
			this.objToNode.unset(obj);
		}
	};

	proto.addDependency = function(fromObj, toObj) {
		var fromNode = this.getNode(fromObj);
		var toNode = this.getNode(toObj);
		
		return this.addNodeDependency(fromNode, toNode);
	};

	proto.addNodeDependency = function(fromNode, toNode) {
		var edge = new ConstraintEdge(fromNode, toNode);
		this.graph.addEdge(edge);

		this.notify({
			type: "dependency_added"
			, fromNode: fromNode
			, toNode: toNode
			, nodes: [fromNode, toNode]
		});

		return edge;
	};

	proto.getNodeDependency = function(fromNode, toNode) {
		return this.graph.getEdge(fromNode, toNode);
	};

	proto.removeDependency = function(fromObj, toObj) {
		var fromNode = this.getNode(fromObj);
		var toNode = this.getNode(toObj);
		
		this.removeNodeDependency(fromNode, toNode);
	};

	proto.removeNodeDependency = function(fromNode, toNode) {
		this.graph.removeEdge(fromNode, toNode);
		this.notify({
			type: "dependency_removed"
			, fromNode: fromNode
			, toNode: toNode
			, nodes: [fromNode, toNode]
		});
	};

	proto.dependsOnMe = proto.influences = function(obj, recursive) {
		return this.get_outgoing(obj, recursive);
	};

	proto.dependsOn = function(obj, recursive) {
		return this.get_incoming(obj, recursive);
	};

	proto.isOOD = function(obj) {
		var node = this.getNode(obj);
		return node !== null && node.ood;
	};

	proto.nullify = function(obj) {
		var rv = this.doNullify(obj);

		return rv;
	};

	proto.doNullify = function(obj) {
		var node = this.getNode(obj);
		var rv = this.nullifyNode(node);

		this.notify({
			type: "root_nullify",
			node: node
		});

		return rv;
	};

	proto.nullifyAndEval = function(obj) {
		var rv = this.doNullifyAndEval(obj);

		return rv;
	};

	proto.doNullifyAndEval = function(obj) {
		var node = this.getNode(obj);
		var rv = this.nullifyAndEvalNode(node);

		this.notify({
			type: "root_nullify",
			node: node
		});

		return rv;
	};


	proto.get_outgoing = function(obj, recursive) {
		return this.get_node_outgoing(this.getNode(obj), recursive).map(function(x) {
			return x.obj;
		});
	};
	proto.get_node_outgoing = function(node, recursive) {
		return node.pointsAt(recursive);
	};

	proto.get_incoming = function(obj, recursive) {
		return this.get_node_incoming(this.getNode(obj), recursive).map(function(x) {
			return x.obj;
		});
	};
	proto.get_node_incoming = function(node, recursive) {
		return node.pointsAtMe(recursive);
	};

	proto.doNullifyNode = function(node, reasonChain, recursiveCall, recursiveCallContext) {
		if(recursiveCallContext === undefined) { recursiveCallContext = this; }
		var i, outgoingEdges;

		node.nullify(reasonChain);

		this.notify({
			type: "nullify",
			node: node,
			reason: reasonChain
		});

		outgoingEdges = node.getOutgoing();
		for(i = 0; i<outgoingEdges.length; i++) {
			var outgoingEdge = outgoingEdges[i];
			var dependentNode = outgoingEdge.toNode;

			if(outgoingEdge.timestamp < dependentNode.timestamp) {
				var toNode = outgoingEdge.toNode;
				var fromNode = node;
				if(fromNode.options.auto_add_outgoing_dependencies && toNode.options.auto_add_incoming_dependencies) {
					this.removeNodeDependency(node, dependentNode);
					i--;
				}
				else {
					recursiveCall.call(recursiveCallContext, dependentNode, reasonChain.concat(node.obj));
				}
			}
			else if(!dependentNode.ood) {
				recursiveCall.call(recursiveCallContext, dependentNode, reasonChain.concat(node.obj));
			}
		}
	};

	proto.nullifyNode = function(node, reasonChain) {
		if(reasonChain === undefined) { reasonChain = []; }

		this.doNullifyNode(node, reasonChain, this.nullifyNode);
	};

	proto.nullifyAndEvalNode = function(node, reasonChain) {
		if(reasonChain === undefined) { reasonChain = []; }
		this.doNullifyNode(node, reasonChain, this.nullifyAndEvalNode);
		return this.getNodeValue(node);
	};

	proto.getValue = function(obj) {
		return this.getNodeValue(this.getNode(obj));
	};

	proto.getNodeValue = function(node) {
		var demanding_var = _.last(this.stack);

		if(demanding_var) {
			var dependency_edge = this.getNodeDependency(node, demanding_var);
			if(!dependency_edge) {
				if(node.options.auto_add_outgoing_dependencies && demanding_var.options.auto_add_incoming_dependencies) {
					dependency_edge = this.addNodeDependency(node, demanding_var);
				}
			}
			if(dependency_edge!==null) {
				dependency_edge.timestamp = demanding_var.timestamp+1;
			}
		}

		if(node.ood) {
			this.stack.push(node);
			this.doEvalNode(node);
			this.stack.pop();
		}

		return node.value;
	};

	proto.doEvalNode = function(node) {
		node.ood = false;
		node.value = node.cs_eval();
		node.timestamp++;
	};

	proto.doEval = function(obj) {
		return this.doEvalNode(this.getNode(obj));
	};

	proto.dependency_paths = function(from) {
		var node = this.getNode(from);
		var paths = node.outgoingPaths();

		var rv = paths.map(function(nodes_path) {
			var objs_path = nodes_path.map(function(node) {
				return node.obj;
			});

			return objs_path;
		});

		return rv;
	};

	proto.notify = function(message) {
		_(this.listeners)	.chain()
							.filter(function(listener) {
								return listener.filter(message);
							})
							.map(function(listener) {
								listener.notify(message);
							});
	};

	var listener_id = 0;
	proto.on = proto.add_listener = function(arg0, arg1) {
		var self = this;
		var interested_in_type = function() {
			return true;
		};
		var interested_in_node = function() {
			return true;
		};

		var filter = function(notification) {
			var nodes = notification.nodes || [notification.node];
			return interested_in_type(notification.type) &&
					_.any(nodes, interested_in_node);
		};

		var notify = _.last(arguments);

		var filter_types = null;
		var filter_objs = null;

		if(arguments.length >= 2) {
			filter_types = arg0;
		}
		if(arguments.length >= 3) {
			filter_objs = arg1;
		}

		if(filter_types!==null) {
			if(_.isFunction(filter_types)) {
				if(arguments.length === 2) {
					filter = arg0;
				}
				else if(arguments.length >= 3) {
					interested_in_type = arg0;
				}
			}
			else if(_.isString(filter_types)) {
				if(filter_types === "*") {
					interested_in_type = function() {
						return true;
					};
				}
				else {
					var interesting_types = filter_types.split(" ");
					interested_in_type = function(type) {
						return _.contains(interesting_types, type);
					};
				}
			}
		}
		if(filter_objs!==null) {
			var interested_in_objs = [];
			if(_.isArray(filter_objs)) {
				interested_in_objs = filter_objs;
			}
			else {
				interested_in_objs = [filter_objs];
			}

			var interested = function(node, obj) {
				if(_.isNumber(obj)) {
					return node.getId() === obj;
				} else if(obj instanceof Node) {
					return node === obj;
				} else {
					var n = self.getNode(obj);
					return node === n;
				}
			};

			interested_in_node = function(node) {
				var i;
				for(i = 0; i<interested_in_objs.length; i++) {
					var obj = interested_in_objs[i];
					if(interested(node, obj)) {
						return true;
					}
				}
				return false;
			};
		}

		var listener = {
			filter: filter,
			id: listener_id,
			notify: notify
		};
		if(cjs._debug) {
			listener.interested_in_type = interested_in_type;
			listener.interested_in_node = interested_in_node;
		}
		this.listeners.push(listener);
		listener_id++;
		return listener_id;
	};

	proto.off = proto.remove_listener = function(listener_id) {
		this.listeners = _.reject(this.listeners, function(listener) {
			return listener.id === listener_id;
		});
	};
}(ConstraintSolver));



cjs._constraint_solver = new ConstraintSolver();
}(cjs));
(function(cjs) {
var _ = cjs._;

var State = function(fsm, name) {
	this._name = name;
	this.fsm = fsm;
	//var graph = this.fsm.get_graph();
	//this.node = graph.create_node();
};

(function(my) {
	var proto = my.prototype;
	proto.get_name = function() { return this._name; };
	proto.get_node = function() { return this.node; };
}(State));

var Transition = function(fsm, from_state, to_state, name) {
	this.fsm = fsm;
	this.from = from_state;
	this.to = to_state;
	this.name = name;

	//var graph = this.fsm.get_graph();
	//this.edge = graph.addEdge(this.get_from().get_node(), this.get_to().get_node());
};
(function(my) {
	var proto = my.prototype;
	proto.get_from = function() { return this.from; };
	proto.get_to = function() { return this.to; };
	proto.get_name = function() { return this.name; };
	proto.run = function() {
		var args = _.toArray(arguments);
		args.unshift(this);
		args.unshift(this.get_to());
		this.fsm.set_state.apply(this.fsm, args);
	};
}(Transition));

var StateSelector = function(state_name) {
	this.state_name = state_name;
};
(function(my) {
	var proto = my.prototype;
	proto.matches = function(state) {
		if(state instanceof State) {
			return this.state_name === state.get_name();
		} else if(_.isString(state)) {
			return this.state_name === state;
		} else { return false; }
	};
	proto.is = function(str) { return str === "state"; };
}(StateSelector));

var AnyStateSelector = function() { };
(function(my) {
	var proto = my.prototype;
	proto.matches = function(state) {return state instanceof State;};
	proto.is = function(str) { return str === "*"; };
}(AnyStateSelector));

var TransitionSelector = function(pre, from_state_selector, to_state_selector) {
	this.is_pre = pre;
	this.from_state_selector = from_state_selector;
	this.to_state_selector = to_state_selector;
};
(function(my) {
	var proto = my.prototype;
	proto.matches = function(transition, pre) {
		if(transition instanceof Transition) {
			var from_state = transition.get_from();
			var to_state = transition.get_to();
			return this.from_state_selector.matches(from_state) &&
					this.to_state_selector.matches(to_state) &&
					this.is_pre === pre;
		} else { return false; }
	};
	proto.is = function(str) { return str === "transition"; };
}(TransitionSelector));

var MultiSelector = function(selectors) {
	this.selectors = selectors;
};

(function(my) {
	var proto = my.prototype;
	proto.matches = function() {
		var match_args = arguments;
		return _.any(this.selectors, function(selector) {
			return selector.matches.apply(selector, match_args);
		});
	};
	proto.is = function(str) { return str === "multi"; };
}(MultiSelector));

var parse_single_state_spec = function(str) {
	if(str === "*") {
		return new AnyStateSelector();
	} else {
		return new StateSelector(str);
	}
};

var parse_state_spec = function(str) {
	var state_spec_strs = str.split(",");
	if(state_spec_strs.length === 1) {
		return parse_single_state_spec(state_spec_strs[0]);
	} else {
		var state_specs = _.map(state_spec_strs, function(state_spec_str) {
			return parse_single_state_spec(state_spec_str);
		});
		return new MultiSelector(state_specs);
	}
};

var parse_transition_spec = function(left_str, transition_str, right_str) {
	var left_to_right_transition, right_to_left_transition;
	var left_state_spec = parse_state_spec(left_str);
	var right_state_spec = parse_state_spec(right_str);

	if(transition_str === "<->") {
		left_to_right_transition = new TransitionSelector(false, left_state_spec, right_state_spec);
		right_to_left_transition = new TransitionSelector(false, right_state_spec, left_state_spec);
		return new MultiSelector(left_to_right_transition, right_to_left_transition);
	} else if(transition_str === ">-<") {
		left_to_right_transition = new TransitionSelector(true, left_state_spec, right_state_spec);
		right_to_left_transition = new TransitionSelector(true, right_state_spec, left_state_spec);
		return new MultiSelector(left_to_right_transition, right_to_left_transition);
	} else if(transition_str === "->") {
		return new TransitionSelector(false, left_state_spec, right_state_spec);
	} else if(transition_str === ">-") {
		return new TransitionSelector(true, left_state_spec, right_state_spec);
	} else if(transition_str === "<-") {
		return new TransitionSelector(false, right_state_spec, left_state_spec);
	} else if(transition_str === "-<") {
		return new TransitionSelector(true, right_state_spec, left_state_spec);
	} else { return null; }
};

var parse_spec = function(str) {
	var transition_separator_regex = new RegExp("^([a-zA-Z0-9,\\-*]+)((<->|>-<|->|>-|<-|-<)([a-zA-Z0-9,\\-*]+))?$");
	var matches = str.match(transition_separator_regex);
	if(matches === null) {
		return null;
	} else {
		//"A": ["A", "A", undefined, undefined, undefined]
		//"A->b": ["A->b", "A", "->b", "->", "b"]
		if(matches[2] === undefined) {
			var states_str = matches[1];
			return parse_state_spec(states_str);
		} else {
			var from_state_str = matches[1], transition_str = matches[3], to_state_str = matches[4];
			return parse_transition_spec(from_state_str, transition_str, to_state_str);
		}
	}
};


var state_listener_id = 0;
var StateListener = function(selector, callback) {
	this.selector = selector;
	this.callback = callback;
	this.id = state_listener_id++;
};
(function(my) {
	var proto = my.prototype;
	proto.interested_in = function() {
		return this.selector.matches.apply(this.selector, arguments);
	};
	proto.run = function() {
		this.callback();
	};
}(StateListener));

var FSM = function() {
	//this.graph = cjs.create("graph");
	this.states = [];
	this.transitions = [];
	this._state = null;
	this.listeners = [];
	this.chain_state = null;
	this.did_transition = false;
	this.blocked = false;

	this.state = cjs.create("constraint", _.bind(function() {
		if(this._state) {
			return this._state.get_name();
		} else {
			return null;
		}
	}, this));
};
(function(my) {
	var proto = my.prototype;
	proto.create_state = function(state_name) {
		var state = new State(this, state_name);
		this.states.push(state);
		return state;
	};
	proto.add_state = function(state_name) {
		var state = this.state_with_name(state_name);
		if(state === null) {
			state = this.create_state.apply(this, arguments);
			if(this.get_state() === null) { this._state = state; }
		}

		this.chain_state = state;
		return this;
	};
	proto.state_with_name = function(state_name) {
		var rv = _.find(this.states, function(state) {
			return state.get_name() === state_name;
		});
		if(rv === undefined) { return null; }
		else { return rv; }
	};
	proto.get_state = function() {
		return this._state;
	};
	proto.add_transition = function(add_transition_fn, to_state_name, deferred) {
		var from_state = this.chain_state;
		var do_transition = this.get_transition(from_state, to_state_name, deferred);


		add_transition_fn.call(this, do_transition, this);

		return this;
	};
	proto.get_transition = function(from_state, to_state, deferred) {
		var from_state_name = from_state;
		var to_state_name = to_state;
		if(!_.isString(from_state)) {
			from_state_name = from_state.get_name();
		}
		if(!_.isString(to_state)) {
			to_state_name = to_state.get_name();
		}
		
		var transition = new Transition(this, from_state_name, to_state_name);
		var self = this;
		var do_transition = function() {
			if(self.is(from_state_name) && ! self.is_blocked()) {
				var args = _.toArray(arguments);
				//self.block();
				if(deferred === false) {
					transition.run.apply(transition, args);
				} else {
					_.defer(function() {
						transition.run.apply(transition, args);
					});
				}
				//_.delay(_.bind(self.unblock, self));
			}
		};
		this.transitions.push(transition);
		return do_transition;
	};
	proto.set_state = function(state, transition) {
		var from_state = this.get_state();
		var to_state = _.isString(state) ? this.state_with_name(state) : state;
		this.did_transition = true;

		_.forEach(this.listeners, function(listener) {
			if(listener.interested_in(transition, true)) {
				listener.run(transition, to_state, from_state);
			}
		});
		this._state = to_state;
		this.state.nullify();
		_.forEach(this.listeners, function(listener) {
			if(listener.interested_in(transition, false)) {
				listener.run(transition, to_state, from_state);
			}
			if(listener.interested_in(to_state)) {
				listener.run(transition, to_state, from_state);
			}
		});
	};
	proto.destroy = function() {
		//this.graph.destroy();
		delete this.states;
		delete this.transitions;
		delete this._state;
		//delete this.graph;
	};
	proto.starts_at = function(state_name) {
		var state = this.state_with_name(state_name);
		if(state === null) {
			state = this.create_state(state_name);
		}
		if(!this.did_transition) {
			this._state = state;
		}
		return this;
	};
	proto.is = function(state_name) {
		var state = this.get_state();
		if(state === null) { return false; }
		else {
			if(_.isString(state_name)) {
				return state.get_name() === state_name;
			} else {
				return state === state_name;
			}
		}
	};
	proto.on = proto.addEventListener = function(spec_str, callback) {
		var selector;
		if(_.isString(spec_str)) {
			selector = this.parse_selector(spec_str);
		} else {
			selector = spec_str;
		}
		var listener = new StateListener(selector, callback);
		this.listeners.push(listener);
		return this;
	};
	proto.off = proto.removeEventListener = function(listener_callback) {
		this.listeners = _.reject(this.listeners, function(listener) {
			return listener.callback === listener_callback;
		});
		return this;
	};
	proto.last_callback = function() {
		var last_listener = _.last(this.listeners);
		if(last_listener) {
			return last_listener.callback;
		} else {
			return null;
		}
	};
	proto.parse_selector = function(spec_str) {
		var selector = parse_spec(spec_str);
		if(selector === null) {
			throw new Error("Unrecognized format for state/transition spec. Please see documentation.");
		}
		return selector;
	};
	proto.block = function() {
		this.blocked = true;
	};
	proto.unblock = function() {
		this.blocked = false;
	};
	proto.is_blocked = function() {
		return this.blocked === true;
	};
}(FSM));

var create_fsm = function() {
	return new FSM();
};
cjs.fsm = create_fsm;
cjs.define("fsm", cjs.fsm);
cjs.is_fsm = function(obj) {
	return obj instanceof FSM;
};
}(cjs));
(function(cjs, root) {
	var _ = cjs._;
	var constraint_solver = cjs._constraint_solver;
	var get_time = function() { return (new Date()).getTime(); };

	var Listener = function(constraint, callback, update_interval, context) {
		this.context = context;
		this.update_interval = update_interval;
		this.last_update = 0;

		this.update_timeout = null;

		this.callback = callback;
		this.constraint = constraint;
		//if(context === undefined) debugger;
		this.last_val = null;
	};
	(function(my) {
		var proto = my.prototype;
		proto.run = function() {
			var context = this.context || root;
			this.last_update = get_time();
			var val = this.constraint.get();
			if(!_.isEqual(this.last_val, val)) {
				this.callback.call(context, val, this.last_val);
				this.last_val = _.clone(val);
			}
		};
		proto.on_change = function() {
			if(_.isNumber(this.update_interval) && this.update_interval >= 0) {
				var curr_time = get_time();
				if(curr_time - this.last_update < this.update_interval) {
					this.__callback_args = arguments;
					if(!_.has(this, "__callback_timeout")) {
						this.__callback_timeout = _.delay(_.bind(function() {
							this.run.apply(this, this.__callback_args);
							delete this.__callback_timeout;
							delete this.__callback_args;
						}, this), this.last_update + this.update_interval - curr_time);
					}
				} else {
					this.run.apply(this, arguments);
				}
			} else {
				this.run.apply(this, arguments);
			}
		};
	}(Listener));

	var Constraint = function() {
		var node = constraint_solver.addObject(this);

		this.literal = false;
		this.set.apply(this, arguments);
		this.listeners = [];
		this.cs_listener_id = null;

		this.history = {
			value: undefined
			, time: undefined
		};
		this.id = "constraint_"+node.getId();
		this.destroy_callbacks = [];
		this.bindings = [];
		this.invalidate = _.bind(this.nullify, this);
	};

	(function(my) {
		var proto = my.prototype;
		proto.destroy = function() {
			_.forEach(this.destroy_callbacks, function(callback) {
				callback();
			});
			_.forEach(this.bindings, function(binding) {
				binding.destroy();
			});
			constraint_solver.removeObject(this);
		};
		proto.on_destroy = function() {
			this.destroy_callbacks.push.apply(this.destroy_callbacks, arguments);
		};
		proto.off_destroy = function(func) {
			_.remove_all(this.destroy_callbacks, func);
		};
		proto.nullify = function() {
			constraint_solver.nullify(this);
		};
		proto.nullifyAndEval = function() {
			//Create a copy of what our value was
			var history = _.clone(this.history);

			//The historical value will be erased in nullifyAndEval, as we will get re-evaled...
			var new_value = constraint_solver.nullifyAndEval(this);

			//...so repopulate the history as if we just only got nullified.
			this.history.value = history.value;
			this.history.time = history.time;

			// And act as if we were just nullified...
			//this.on_nullified();

			return new_value;
		};
		proto.cs_eval = function() {
			var rv;
			if(_.has(this, "value")) {
				if(this.literal) {
					rv = this.value;
				} else if(_.isFunction(this.value)){
					rv = this.value();
				} else {
					rv = cjs.get(this.value);
				}
			}

			this.history.value = rv;
			this.history.time = get_time();

			return rv;
		};
		proto.set = function(value, literal, update_fn) {
			var was_literal = this.literal;
			var old_value = this.value;

			if(arguments.length < 2) {
				this.literal = !_.isFunction(value) && !cjs.is_constraint(value);
			} else {
				this.literal = literal === true;
			}

			this.value = value;

			
			if(was_literal !== this.literal || old_value !== this.value) {
				this.nullify();
			}

			if(_.isFunction(update_fn)) {
				this.update(update_fn);
			}
			return this;
		};
		proto.get = function() {
			return constraint_solver.getValue(this);
		};
		proto.update = function(arg0) {
			if(arguments.length === 0) {
				this.nullify();
			} else {
				var self = this;
				var do_nullify = function() {
					self.nulllify();
				};
				if(_.isFunction(arg0)) {
					arg0(do_nullify);
				}
			}
			return this;
		};

		proto._on = function(event_type, callback) {
			var node = constraint_solver.getNode(this);
			var listener_id = constraint_solver.add_listener(event_type, node, callback);
			return _.bind(this._off, this, listener_id);
		};
		proto._off = function(listener_id) {
			constraint_solver.remove_listener(listener_id);
		};

		proto.onChange = function(callback, update_interval, context) {
			context = context || this;
			var listener = new Listener(this, callback, update_interval, context);

			this.listeners.push(listener);
			if(this.is_ood) {
				_.defer(_.bind(this.update_on_change_listeners, this));
			}
			if(this.cs_listener_id === null) {
				this.cs_listener_id = this._on("nullify", _.bind(this.update_on_change_listeners, this));
			}
			this.last_listener = listener;
			return this;
		};
		proto.offChange = function(id) {
			this.listeners = _.reject(this.listeners, function(listener) {
				return listener === id || listener.callback === id;
			});
			if(this.listeners.length === 0) {
				if(this.cs_listener_id !== null) {
					this._off(this.cs_listener_id);
					this.cs_listener_id = null;
				}
			}
			return this;
		};
		proto.is_ood = function() {
			var node = cjs._constraint_solver.getNode(this);
			return node.isOOD();
		};
		proto.update_on_change_listeners = function() {
			_.defer(_.bind(function() {
				/*
				var old_value = this.history.value;
				var old_timestamp = this.history.timestamp;
				var value = this.get();
				if(value !== old_value) {
					var event = {
						value: value
						, timestamp: get_time()
						//, constraint: this
						, old_value: old_value
						, old_timestamp: old_timestamp
					};
					*/
					_.forEach(this.listeners, function(listener) {
						listener.on_change();
					});
					/*
				}
				*/
			}, this));
		};
		proto.influences = proto.depends_on_me = function(recursive) {
			return constraint_solver.influences(this, recursive);
		};
		proto.depends_on = function(recursive) {
			return constraint_solver.dependsOn(this, recursive);
		};
		proto.length = function() {
			var val = this.get();
			return val.length;
		};
		proto.push_binding = function(binding) {
			this.bindings.push(binding);
		};
	}(Constraint));

	var create_constraint = function(arg0, arg1, arg2, arg3) {
		var constraint;
		if(arguments.length === 0) {
			constraint = new Constraint(undefined);
		} else if(arguments.length === 1) {
			constraint = new Constraint(arg0);
		} else {
			if(arguments.length === 2 && _.isBoolean(arg1)) {
				constraint = new Constraint(arg0, arg1);
			} else {
				constraint = new Constraint(arg0, arg1, arg2, arg3);
			}
		}

		return constraint;
	};

	cjs.constraint = create_constraint;
	cjs.define("constraint", cjs.constraint);

	cjs.constraint.raw_mixin = function(propname, propval) {
		Constraint.prototype[propname] = function() {
			var args = _.toArray(arguments);
			args.unshift(this);
			return propval.apply(this, args);
		};
		cjs.constraint[propname] = function() {
			var args = _.toArray(arguments);
			return propval.apply(this, args);
		};
	};

	cjs.constraint.mixin = function(arg0, arg1) {
		var mixin_obj;
		if(_.isString(arg0)) {
			mixin_obj = {};
			mixin_obj[arg0] = arg1;
		} else {
			mixin_obj = arg0;
		}

		_.forEach(mixin_obj, function(propval, propname) {
			cjs.constraint.raw_mixin(propname, function() {
				var args = _.toArray(arguments);
				return cjs.create("constraint", function() {
					var val = cjs.get(_.first(args));
					return propval.apply(this, ([val]).concat(_.rest(args)));
				});
			});
		});
	};

	cjs.is_constraint = function(obj, recursive) {
		if(obj instanceof Constraint) {
			return true;
		} else {
			if(recursive === true) {
				if(_.isArray(obj)) {
					return _.any(obj, function(o) {
						return cjs.is_constraint(o, recursive);
					});
				}
				return false;
			} else {
				return false;
			}
		}
	};
	cjs.get = function(obj, recursive) {
		var rv = obj;
		while(cjs.is_constraint(rv)) {
			rv = rv.get();
		}
		if(recursive === true) {
			if(_.isArray(rv)) {
				rv = _.map(rv, function(elem) {
					return cjs.get(elem, recursive);
				});
			}
		}
		return rv;
	};
	cjs.get_item = function(obj, index, recurse) {
		recurse = recurse !==false;
		var o = cjs.get(obj);
		var i = cjs.get(index);

		var rv = o[i];
		if(recurse) {
			while(cjs.is_constraint(rv)) {
				rv = cjs.get(rv);
			}
		}
		return rv;
	};
}(cjs, this));
/*jslint eqeq: true*/
(function(cjs) {
var _ = cjs._;
cjs.constraint.mixin({
	unit: function(val, unit_name) {
		return parseFloat(val) + String(unit_name);
	}

	, add: function() {
		var values = _.map(arguments, function(arg) {
			return cjs.get(arg);
		});
		return _.reduce(values, function(memo, val) {
			return memo + val;
		}, 0);
	}

	, sub: function() {
		var values = _.map(arguments, function(arg) {
			return cjs.get(arg);
		});
		var first_val = _.first(values);
		var other_vals = _.rest(values);
		return _.reduce(other_vals, function(memo, val) {
			return memo - val;
		}, first_val);
	}

	, mul: function() {
		var values = _.map(arguments, function(arg) {
			return cjs.get(arg);
		});
		return _.reduce(values, function(memo, val) {
			return memo * val;
		}, 1);
	}

	, div: function() {
		var values = _.map(arguments, function(arg) {
			return cjs.get(arg);
		});
		var first_val = _.first(values);
		var other_vals = _.rest(values);
		return _.reduce(other_vals, function(memo, val) {
			return memo / val;
		}, first_val);
	}

	, clone: function(val) {
		return val;
	}
	
	, isNull: function(val) {
		return val === null;
	}
	, isUndefined: function(val) {
		return val === undefined;
	}
	, eq: function(val, to_val) {
		return val == to_val;
	}
	, eqeq: function(val, to_val) {
		return val === to_val;
	}
	, round: function(val) {
		return Math.round(val);
	}
});

cjs.constraint.raw_mixin("snapshot", function(constraint) {
	var val = constraint.get();
	var rv = cjs.create("constraint", val);
	rv.basis = constraint;
	return rv;
});
}(cjs));
(function(cjs) {
var _ = cjs._;

cjs.constraint.raw_mixin("push", function(constraint) {
	var my_val = constraint.get();
	my_val.push.apply(my_val, _.rest(arguments));
	constraint.nullify();

	return constraint;
});

cjs.constraint.raw_mixin("forEach", function(constraint, add_fn, remove_fn, move_fn) {
	if(_.isFunction(add_fn)) {
		var val = constraint.get();
		_.forEach(val, add_fn);
		constraint.onAdd(add_fn);
	}
	if(_.isFunction(remove_fn)) {
		constraint.onRemove(remove_fn);
	}
	if(_.isFunction(move_fn)) {
		constraint.onMove(remove_fn);
	}
	return constraint;
});

cjs.constraint.raw_mixin("map", function(constraint, add_fn, remove_fn, move_fn) {
	var cached_constraint_val = constraint.get();
	if(_.isUndefined(cached_constraint_val)) {
		cached_constraint_val = [];
	} else if(!_.isArray(cached_constraint_val)) {
		cached_constraint_val = [cached_constraint_val];
	}
	var cached_my_val = _.map(cached_constraint_val, add_fn);

	var rv = cjs.create("constraint", function() {
		var constraint_val = constraint.get();
		if(!_.isArray(constraint_val)) {
			constraint_val = [constraint_val];
		}
		var diff = _.diff(cached_constraint_val, constraint_val);
		var my_val = _.clone(cached_my_val);

		_.forEach(diff.removed, function(x) {
			var mapped_val = my_val[x.index];
			if(_.isFunction(remove_fn)) {
				remove_fn(x.item, x.index, mapped_val);
			}
			_.remove_index(my_val, x.index);
		});
		_.forEach(diff.added, function(x) {
			var mapped_val;
			if(_.isFunction(add_fn)) {
				mapped_val = add_fn(x.item, x.index);
			}
			_.insert_at(my_val, mapped_val, x.index);
		});
		_.forEach(diff.moved, function(x) {
			if(_.isFunction(move_fn)) {
				move_fn(x.item, x.to_index, x.from_index);
			}
			_.set_index(my_val, x.from_index, x.to_index);
		});

		cached_constraint_val = constraint_val;
		cached_my_val = my_val;

		return my_val;
	});

	return rv;
});


cjs.constraint.mixin({
	join: function(arr, str) {
		var rv = arr.join(str);
		return rv;
	}

	, first: function(arr) {
		return cjs.get_item(arr, 0);
	}
	, last: function(arr) {
		return cjs.get_item(arr, _.size(arr)-1);
	}
});
cjs.constraint.raw_mixin("item", function(constraint) {
	var prop_names = _.rest(arguments);
	return cjs.create("constraint", function() {
		var val = cjs.get(constraint);
		_.forEach(prop_names, function(prop_name) {
			var pn = cjs.get(prop_name);
			if(!_.isUndefined(val) && _.has(val, pn)) {
				val = val[pn];
			}
		});
		return cjs.get(val);
	});
});


var get_array_change_listener = function(constraint) {
	if(_.has(constraint, "__array_change_listener")) {
		return constraint.__array_change_listener;
	}

	var constraint_getter = function() {
		var value = cjs.get(constraint, true);
		if(!_.isArray(value)) {
			value = [value];
		}
		return value;
	};

	var cached_value = constraint_getter();

	var change_listener = function() {
		var value = constraint_getter();
		var diff = _.diff(cached_value, value);
		cached_value = _.clone(value);
		_.forEach(diff.removed, function(x) {
			_.forEach(change_listener.removed_listeners, function(removed_listener) {
				removed_listener(x.item, x.index);
			});
		});
		_.forEach(diff.added, function(x) {
			_.forEach(change_listener.added_listeners, function(added_listener) {
				added_listener(x.item, x.index);
			});
		});
		_.forEach(diff.moved, function(x) {
			_.forEach(change_listener.moved_listeners, function(moved_listener) {
				moved_listener(x.item, x.to_index, x.from_index);
			});
		});
	};
	change_listener.added_listeners = [];
	change_listener.removed_listeners = [];
	change_listener.moved_listeners = [];

	change_listener.empty_sub_listeners = function() {
		return _.isEmpty(change_listener.added_listeners) &&
				_.isEmpty(change_listener.removed_listeners) &&
				_.isEmpty(change_listener.moved_listeners);
	};
	change_listener.remove_self = function() {
		change_listener.added_listeners = change_listener.removed_listeners = change_listener.moved_listeners = null;
	};

	constraint.on_destroy(change_listener.remove_self);
	constraint.onChange(change_listener);
	return change_listener;
};
var remove_array_change_listener = function(constraint) {
	var array_change_listener = get_array_change_listener(constraint);
	constraint.off_destroy(array_change_listener.remove_self);
	array_change_listener.remove_self();
	constraint.offChange(array_change_listener);
	delete constraint.__array_change_listener;
};

cjs.constraint.raw_mixin("onAdd", function(constraint, func) {
	var array_change_listener = get_array_change_listener(constraint);
	array_change_listener.added_listeners.push(func);
	return constraint;
});
cjs.constraint.raw_mixin("offAdd", function(constraint, func) {
	var array_change_listener = get_array_change_listener(constraint);
	_.removeAll(array_change_listener.added_listeners, func);
	if(array_change_listener.has_no_sub_listeners()) {
		remove_array_change_listener(constraint);
	}
	return constraint;
});

cjs.constraint.raw_mixin("onRemove", function(constraint, func) {
	var array_change_listener = get_array_change_listener(constraint);
	array_change_listener.removed_listeners.push(func);
	return constraint;
});
cjs.constraint.raw_mixin("offRemove", function(constraint, func) {
	var array_change_listener = get_array_change_listener(constraint);
	_.removeAll(array_change_listener.removed_listeners, func);
	if(array_change_listener.has_no_sub_listeners()) {
		remove_array_change_listener(constraint);
	}
	return constraint;
});

cjs.constraint.raw_mixin("onMove", function(constraint, func) {
	var array_change_listener = get_array_change_listener(constraint);
	array_change_listener.moved_listeners.push(func);
	return constraint;
});
cjs.constraint.raw_mixin("offMove", function(constraint, func) {
	var array_change_listener = get_array_change_listener(constraint);
	_.removeAll(array_change_listener.moved_listeners, func);
	if(array_change_listener.has_no_sub_listeners()) {
		remove_array_change_listener(constraint);
	}
	return constraint;
});


cjs.constraint.mixin({
	pluck: function(arr, prop_name) {
		var rv =  _.pluck(arr, prop_name);
		return rv;
	}
});
cjs.constraint.mixin({
	filter: function(arr, func) {
		var rv = _.filter(arr, func);
		return rv;
	}});

cjs.concat = function() {
	var args = _.toArray(arguments);
	var rv = cjs.create("constraint", function() {
		return _.map(args, function(arg) {
			return cjs.get(arg);
		}).join("");
	});
	return rv;
};

}(cjs));
/*global document:true */
(function(cjs) {if(!cjs._is_node) {
var _ = cjs._;
cjs.define("input_value_constraint", function(inp) {
	var constraint = cjs.create("constraint", function() {
		return inp.value;
	});
	var on_change = function() {
		constraint.nullify();
	};
	var activate = function() {
		inp.addEventListener("keyup", on_change);
		inp.addEventListener("input", on_change);
		inp.addEventListener("paste", on_change);
		inp.addEventListener("propertychange", on_change);
	};
	var deactivate = function() {
		inp.removeEventListener("keyup", on_change);
		inp.removeEventListener("input", on_change);
		inp.removeEventListener("paste", on_change);
		inp.removeEventListener("propertychange", on_change);
	};
	constraint.on_destroy(deactivate);

	activate();
	return constraint;
});

cjs.define("checked_inputs", function(inps) {
	var constraint = cjs.create("constraint", function() {
		return _.filter(inps, function(inp) {
			return inp.checked;
		});
	});
	var on_change = function() {
		constraint.nullify();
	};
	var activate = function() {
		_.forEach(inps, function(inp) {
			inp.addEventListener("change", on_change);
		});
	};
	var deactivate = function() {
		_.forEach(inps, function(inp) {
			inp.removeEventListener("change", on_change);
		});
	};
	constraint.on_destroy(deactivate);

	activate();
	return constraint;
});

cjs.define("selector_constraint", function(selector, context) {
	var _oldval = [];
	var constraint;

	var nullify_fn = function() {
		constraint.nullify();
	};

	var activate = function() {
		document.addEventListener("DOMSubtreeModified", nullify_fn);
	};
	var deactivate = function() {
		document.removeEventListener("DOMSubtreeModified", nullify_fn);
		_.forEach(_oldval, function(elem) {
			elem.removeEventListener("DOMAttrModified", nullify_fn);
		});
	};

	constraint = cjs.create("constraint", function() {
		var rv = cjs.Sizzle.call(cjs.Sizzle, cjs.get(selector), cjs.get(context, true));

		_.forEach(_oldval, function(elem) {
			elem.removeEventListener("DOMAttrModified", nullify_fn);
		});
		_.forEach(rv, function(elem) {
			elem.addEventListener("DOMAttrModified", nullify_fn);
		});

		_oldval = rv;
		return rv;
	});

	constraint.on_destroy(deactivate);
	activate();

	return constraint;
});

cjs.define("children_constraint", function(elem) {
	var constraint;

	var nullify_fn = function() {
		constraint.nullify();
	};

	var activate = function() {
		elem.addEventListener("DOMSubtreeModified", nullify_fn);
	};
	var deactivate = function() {
		elem.removeEventListener("DOMSubtreeModified", nullify_fn);
	};

	constraint = cjs.create("constraint", function() {
		return elem.childNodes;
	});

	constraint.on_destroy(deactivate);
	activate();

	return constraint;
});

cjs.define("text_constraint", function(elem) {
	var constraint;

	var nullify_fn = function() {
		constraint.nullify();
	};

	var activate = function() {
		elem.addEventListener("DOMSubtreeModified", nullify_fn);
	};
	var deactivate = function() {
		elem.removeEventListener("DOMSubtreeModified", nullify_fn);
	};

	constraint = cjs.create("constraint", function() {
		return elem.innerText;
	});

	constraint.on_destroy(deactivate);
	activate();

	return constraint;
});

cjs.define("html_constraint", function(elem) {
	var constraint;

	var nullify_fn = function() {
		constraint.nullify();
	};

	var activate = function() {
		elem.addEventListener("DOMSubtreeModified", nullify_fn);
	};
	var deactivate = function() {
		elem.removeEventListener("DOMSubtreeModified", nullify_fn);
	};

	constraint = cjs.create("constraint", function() {
		return elem.innerHTML;
	});

	constraint.on_destroy(deactivate);
	activate();

	return constraint;
});

cjs.define("attr_constraint", function(elem, prop_name) {
	var constraint;

	var nullify_fn = function() {
		constraint.nullify();
	};

	var activate = function() {
		elem.addEventListener("DOMAttrModified", nullify_fn);
	};
	var deactivate = function() {
		elem.removeEventListener("DOMAttrModified", nullify_fn);
	};

	constraint = cjs.create("constraint", function() {
		return elem.style[prop_name];
	});

	constraint.on_destroy(deactivate);
	activate();

	return constraint;
});

cjs.define("css_constraint", function(elem, prop_name) {
	var constraint;

	var nullify_fn = function(e) {
		if(e.attrName === "style") {
			constraint.nullify();
		}
	};

	var activate = function() {
		elem.addEventListener("DOMAttrModified", nullify_fn);
	};
	var deactivate = function() {
		elem.removeEventListener("DOMAttrModified", nullify_fn);
	};

	var name = _.camel_case(prop_name);
	constraint = cjs.create("constraint", function() {
		return elem.style[name];
	});

	constraint.on_destroy(deactivate);
	activate();

	return constraint;
});

}}(cjs));
/*global document:true */
(function(cjs) {if(!cjs._is_node) {

cjs.constraint.raw_mixin("css", function(elems, propname) {
		if(arguments.length === 2) {
			return cjs.map(elems, function(elem) {
				return cjs.create("css_constraint", elem, propname);
			});
		} else {
			var binding = cjs.binding.css.apply(cjs.binding, arguments);
			elems.push_binding(binding);
			return elems;
		}
	});

cjs.constraint.raw_mixin("attr", function(elems, propname) {
		if(arguments.length === 2) {
			return cjs.map(elems, function(elem) {
				return cjs.create("attr_constraint", elem, propname);
			});
		} else {
			var binding = cjs.binding.attr.apply(cjs.binding, arguments);
			elems.push_binding(binding);
			return elems;
		}
	});

cjs.constraint.raw_mixin("text", function(elems) {
		if(arguments.length === 1) {
			return cjs.map(elems, function(elem) {
				return cjs.create("text_constraint", elem);
			});
		} else {
			var binding = cjs.binding.text.apply(cjs.binding, arguments);
			elems.push_binding(binding);
			return elems;
		}
	});

cjs.constraint.raw_mixin("html", function(elems) {
		if(arguments.length === 1) {
			return cjs.map(elems, function(elem) {
				return cjs.create("html_constraint", elem);
			});
		} else {
			var binding = cjs.binding.html.apply(cjs.binding, arguments);
			elems.push_binding(binding);
			return elems;
		}
	});

cjs.constraint.raw_mixin("val", function(elems) {
		if(arguments.length === 1) {
			return cjs.map(elems, function(elem) {
				return cjs.create("input_value_constraint", elem);
			});
		} else {
			var binding = cjs.binding.val.apply(cjs.binding, arguments);
			elems.push_binding(binding);
			return elems;
		}
	});

cjs.constraint.raw_mixin("children", function(elems) {
		if(arguments.length === 1) {
			return cjs.map(elems, function(elem) {
				return cjs.create("children_constraint", elem);
			});
		} else {
			var binding = cjs.binding.children.apply(cjs.binding, arguments);
			elems.push_binding(binding);
			return elems;
		}
	});

}}(cjs));
/*global document:true */
(function(cjs, root) {if(!cjs._is_node) {
var _ = cjs._;

var mouse = {
	x: cjs.constraint()
	, y: cjs.constraint()
};

root.addEventListener("mousemove", function(event) {
	mouse.x.set(event.pageX);
	mouse.y.set(event.pageY);
});

cjs.mouse = mouse;


var modifiers = {alt: false, ctrl: false, shift: false};
var keyboard = {
	pressed: cjs.constraint([])
	, modifiers : cjs.constraint(modifiers)
};


var update_modifiers = function(event) {
	var new_modifiers = {
		alt: event.altKey
		, ctrl: event.ctrlKey
		, shift: event.shiftKey
	};

	if(!_.isEqual(new_modifiers, modifiers)) {
		modifiers = new_modifiers;
		keyboard.modifiers.set(modifiers);
	}
};

var pressed_keys = [];
root.addEventListener("keydown", function(event) {
	update_modifiers(event);

	var keyCode = event.keyCode;
	pressed_keys = _.union(pressed_keys, [keyCode]);
	keyboard.pressed.set(pressed_keys);
});

root.addEventListener("keyup", function(event) {
	update_modifiers(event);

	var keyCode = event.keyCode;
	pressed_keys = _.without(pressed_keys, keyCode);
	keyboard.pressed.set(pressed_keys);
});

cjs.keyboard = keyboard;

cjs.time = cjs.constraint(function() {
	return (new Date()).getTime();
});
root.setInterval(_.bind(cjs.time.nullify, cjs.time), 10);

cjs.touches = cjs([]);
root.addEventListener("touchstart", function(event) {
	cjs.touches.set(event.touches);
});
root.addEventListener("touchmove", function(event) {
	cjs.touches.set(event.touches);
});
root.addEventListener("touchend", function(event) {
	cjs.touches.set(event.touches);
});

}}(cjs, this));
(function (cjs, root) {
var _ = cjs._;
var timings = {
	linear: function(percentage, start, end, current) {
		return percentage;
	}
	, _default: function(percentage) {
		return percentage;
	}
};
var speeds = {
	slow: 600
	, fast: 200
	, _default: 400
};
var defaults = {
	speed: "_default"
	, in_filter: function(x) {
		return x;
	}
	, out_filter: function(x) {
		return x;
	}
	, timing: "ease-in-out"
};
var get_time = function() {
	return (new Date()).getTime();
};

var Animation = function(options, unfiltered_from, unfiltered_to) {
	this.options = options;

	this.unfiltered_from = unfiltered_from;
	this.unfiltered_to = unfiltered_to;

	this.from = options.in_filter(this.unfiltered_from);
	this.to = options.in_filter(this.unfiltered_to);

	this.current = this.start;
	this.timing = _.isString(options.timing) ? (timings[options.timing] || timings._default) : options.timing;
	this.speed = _.isString(options.speed) ? (speeds[options.speed] || speeds._default) : options.speed;

	this.start_time = null;
	this.end_time = null;

	this.started = false;
	this.done = false;
};
(function(my) {
	var proto = my.prototype;
	proto.get = function(time) {
		if(!this.started) {
			return options.out_filter(this.from);
		} else if(this.done) {
			return options.out_filter(this.to);
		}
		time = time || get_time();
		var raw_percentage = (time - this.start_time) / (this.end_time - this.start_time);
		var percentage = this.timing(raw_percentage, this.start_time, this.end_time, this.current);

		var current_value;

		if(_.isArray(this.from) && _.isArray(this.to) &&  _.size(this.from) === _.size(this.to)) {
			current_value = _.map(this.from, function(from, index) {
				var to = this.to[index];
				return to * percentage + from * (1 - percentage);
			});
		} else {
			current_value = this.to * percentage + this.from * (1 - percentage);
		}

		return this.options.out_filter(current_value);
	}
	proto.start = function() {
		this.start_time = get_time();
		this.end_time = this.start_time + this.speed;
		this.started = true;
	};
	proto.stop = function() {
		this.done = true;
		return this;
	};
}(Animation));

cjs.constraint.raw_mixin("anim", function(based_on, options) {
	options = _.extend({}, defaults, options);
	var current_animation = null;
	var current_animation_end_timeout = null;

	based_on.onChange(function(new_val, old_val) {
		if(current_animation_end_timeout !== null) {
			root.clearTimeout(current_animation_end_timeout);
		}

		current_animation = new Animation(_.clone(options), old_val, new_val);
		current_animation.start();

		current_animation_end_timeout = root.setTimeout(function() {
			current_animation_end_timeout = null;
			current_animation = null;
		}, current_animation.speed);
	});

	var new_constraint = cjs.create("constraint", function() {
		if(current_animation === null) {
			return cjs.get(based_on);
		} else {
			var rv = current_animation.get();
			_.defer(function() {
				new_constraint.nullify();
			});
			return rv;
		}
	});
	return new_constraint;
});
}(cjs, this));
(function(cjs) {
	var _ = cjs._;

	var Binding = function(options, autoactivate) {
		this.options = _.clone(options);

		this.update = this.options.update || function(){};

		this._activated = false;
		if(autoactivate !== false) {
			this.activate();
		}
	};
	(function(my) {
		var proto = my.prototype;
		proto.activate = function() {
			if(!this.is_activated()) {
				this._activated = true;
				if(_.isFunction(this.options.activate)) { this.options.activate(); }
				this.update();
			}
		};
		proto.deactivate = function() {
			if(this.is_activated()) {
				this._activated = false;
				if(_.isFunction(this.options.deactivate)) { this.options.deactivate(); }
			}
		};
		proto.destroy = function() {
			this.deactivate();
			if(_.isFunction(this.options.destroy)) { this.options.destroy(); }
		};
		proto.is_activated = function() {
			return this._activated;
		};
	}(Binding));

	var create_binding = function(options, autoactivate) {
		return new Binding(options, autoactivate);
	};
	cjs.binding = create_binding;
	cjs.define("binding", cjs.binding);

	var create_group_binding = function(options) {
		options = _.clone(options);
		var objs = options.objs;

		var activate, deactivate, update, destroy;
		var binding;

		var activate_fn = function() {
			if(_.isFunction(options.activate_fn)) {
				return options.activate_fn.apply(this, arguments);
			}
		};
		var deactivate_fn = function() {
			if(_.isFunction(options.deactivate_fn)) {
				return options.deactivate_fn.apply(this, arguments);
			}
		};
		var update_fn = function() {
			if(_.isFunction(options.update_fn)) {
				return options.update_fn.apply(this, arguments);
			}
		};
		var destroy_fn = function() {
			if(_.isFunction(options.destroy_fn)) {
				return options.destroy_fn.apply(this, arguments);
			}
		};

		if(cjs.is_constraint(objs)) {
			var get_objs = function() {
				var val = objs.get();
				if(_.isArray(val)) {
					return val;
				} else {
					return [val];
				}
			};
			var binding_objs = _.map(get_objs(), function(obj) {
				var rv = cjs.create("binding", {
					activate: _.bind(activate_fn, obj, obj)
					, deactivate: _.bind(deactivate_fn, obj, obj)
					, update: _.bind(update_fn, obj, obj)
					, destroy: _.bind(destroy_fn, obj, obj)
				}, false);
				if(binding && binding.is_activated()) {
					rv.activate();
				}
				return rv;
			});


			var cached_val = _.clone(get_objs());
			var on_change = function() {
				var val = get_objs();
				var diff = _.diff(cached_val, val);

				_.forEach(diff.added, function(x) {
					var obj = x.item;
					var mapped_val = cjs.create("binding", {
						activate: _.bind(activate_fn, obj, obj)
						, deactivate: _.bind(deactivate_fn, obj, obj)
						, update: _.bind(update_fn, obj, obj)
						, destroy: _.bind(destroy_fn, obj, obj)
					}, false);
					if(binding && binding.is_activated()) {
						mapped_val.activate();
					}
					_.insert_at(binding_objs, mapped_val, x.index);
				});
				_.forEach(diff.removed, function(x) {
					var binding = binding_objs[x.index];
					binding.destroy();
					_.remove_index(binding_objs, x.index);
				});
				_.forEach(diff.moved, function(x) {
					_.set_index(binding_objs, x.from_index, x.to_index);
				});

				cached_val = _.clone(val);
			};

			activate = function() {
				if(_.isFunction(options.activate)) {
					options.activate();
				}
				_.forEach(binding_objs, function(x) {
					x.activate();
				});
				objs.onChange(on_change, options.update_interval);
			};

			deactivate = function() {
				_.forEach(binding_objs, function(x) {
					x.deactivate();
				});
				if(_.isFunction(options.deactivate)) {
					options.deactivate();
				}
				objs.offChange(on_change);
			};

			update = function() {
				_.forEach(binding_objs, function(x) {
					x.update();
				});
				if(_.isFunction(options.update)) {
					options.update();
				}
			};

			destroy = function() {
				_.forEach(binding_objs, function(x) {
					x.destroy();
				});
				if(_.isFunction(options.destroy)) {
					options.destroy();
				}
			};

			binding = cjs.create("binding", {
				activate: activate, deactivate: deactivate, update: update, destroy: destroy
			}, false);
		} else {
			if(!_.isArray(objs)) {
				objs = [objs];
			}

			var bindings = _.map(objs, function(obj) {
				return cjs.create("binding", {
					activate: _.bind(activate_fn, obj, obj)
					, deactivate: _.bind(deactivate_fn, obj, obj)
					, update: _.bind(update_fn, obj, obj)
					, destroy: _.bind(destroy_fn, obj, obj)
				});
			});

			activate = function() {
				if(_.isFunction(options.activate)) {
					options.activate();
				}
				_.forEach(bindings, function(x) {
					x.activate();
				});
			};

			deactivate = function() {
				_.forEach(bindings, function(x) {
					x.deactivate();
				});
				if(_.isFunction(options.deactivate)) {
					options.deactivate();
				}
			};

			update = function() {
				_.forEach(bindings, function(x) {
					x.update();
				});
				if(_.isFunction(options.update)) {
					options.update();
				}
			};

			destroy = function() {
				_.forEach(bindings, function(x) {
					x.destroy();
				});
				if(_.isFunction(options.destroy)) {
					options.destroy();
				}
			};

			binding = cjs.create("binding", {
				activate: activate, deactivate: deactivate, update: update, destroy: destroy
			}, false);
		}
		return binding;
	};
	cjs.define("group_binding", create_group_binding);

	var BindingWrapper = function(context) {
		this.context = context;
		this.last_bindings = [];
		this.last_binding = null;
	};
	(function(my) {
		var proto = my.prototype;
		proto.forEach = function(func) {
			_.forEach(this.context, func);
		};
		proto.map = function(func) {
			return _.map(this.context, func);
		};
	}(BindingWrapper));

	cjs.binding.raw_mixin = function(propname, propval) {
		cjs.binding[propname] = function() {
			return propval.apply(this, arguments);
		};

		BindingWrapper.prototype[propname] = function() {
			var self = this;
			var args = _.toArray(arguments);
			this.last_bindings = this.map(function(obj) {
				this.last_binding = cjs.binding[propname].apply(self, ([obj]).concat(args));
				return this.last_binding;
			});
			return this;
		};
	};

	cjs.binding.mixin = function(arg0, arg1) {
		var mixin_obj;
		if(_.isString(arg0)) {
			mixin_obj = {};
			mixin_obj[arg0] = arg1;
		} else {
			mixin_obj = arg0;
		}

		_.forEach(mixin_obj, function(propval, propname) {
			cjs.binding.raw_mixin(propname, propval);
			if(!_.has(cjs.constraint, propname)) {
				cjs.constraint.raw_mixin(propname, function(elems) {
					var binding = cjs.binding[propname].apply(cjs.binding, arguments);
					elems.push_binding(binding);
					return elems;
				});
			}
		});
	};

	cjs.binding.mixin("bind", function(objs, constraint, setter, update_interval, do_activate) {
		var update_fn = function(obj) {
			var val = cjs.get(constraint);
			setter(obj, val, constraint);
		};

		var rv;

		rv = cjs.create("group_binding", {
			objs: objs
			, update_fn: update_fn
			, activate: function() {
				//this refers to the group binding object
				if(cjs.is_constraint(constraint)) {
					constraint.onChange(rv.update);
				}
			}
			, deactivate: function() {
				if(cjs.is_constraint(constraint)) {
					constraint.offChange(rv.update);
				}
			}
			, update_interval: update_interval
		}, false);
		if(do_activate !== false) {
			rv.activate();
		}
		return rv;
	});
	/*

	cjs.binding.define = function(arg0, arg1) {
		var mixin_obj;
		if(_.isString(arg0)) {
			mixin_obj = {};
			mixin_obj[arg0] = arg1;
		} else {
			mixin_obj = arg0;
		}
		_.forEach(mixin_obj, function(setter, propname) {
			cjs.binding.mixin(propname, function(objs) {
				return cjs.binding.bind(objs, constraint, setter);
			});
		});
	};
	*/
}(cjs));
//Binding: constraint -> DOM element
/*global document:true */
(function(cjs) {if(!cjs._is_node) {
var _ = cjs._;

cjs.binding.mixin({
	css: function(objs, prop_name, constraint) {
		var name = _.camel_case(prop_name);
		var setter = function(obj, val) {
			obj.style[name] = val;
		};
		return cjs.binding.bind(objs, constraint, setter);
	}
	, attr: function(objs, prop_name, constraint) {
		var setter = function(obj, val) {
			obj.setAttribute(prop_name, val);
		};
		return cjs.binding.bind(objs, constraint, setter);
	}
	, "class": function(objs) {
		var vals = _.rest(arguments);
		var constraint = cjs(function() {
			return _.map(vals, function(val) {
				return cjs.get(val);
			}).join(" ");
		});
		var setter = function(obj, val) {
			obj.className = val;
		};
		return cjs.binding.bind(objs, constraint, setter);
	}
	, html: function(objs, constraint) {
		var setter = function(obj, val) {
			obj.innerHTML = val;
		};
		return cjs.binding.bind(objs, constraint, setter);
	}
	, val: function(objs, constraint) {
		var setter = function(obj, val) {
			obj.val = val;
		};
		return cjs.binding.bind(objs, constraint, setter);
	}
});


var insert_at = function(child_node, parent_node, index) {
	var children = parent_node.childNodes;
	if(children.length <= index) {
		parent_node.appendChild(child_node);
	} else {
		var before_child = children[index];
		parent_node.insertBefore(child_node, before_child);
	}
};
var remove = function(child_node) {
	var parentNode = child_node.parentNode;
	if(parentNode !== null) {
		parentNode.removeChild(child_node);
	}
};

var remove_index = function(parent_node, index) {
	var children = parent_node.childNodes;
	if(children.length > index) {
		var child_node = children[index];
		remove(child_node);
	}
};

var move_child = function(parent_node, to_index, from_index) {
	var children = parent_node.childNodes;
	if(children.length > from_index) {
		var child_node = children[from_index];
		if(parent_node) {
			if(from_index < to_index) { //If it's less than the index we're inserting at...
				to_index++; //Increase the index by 1, to make up for the fact that we're removing me at the beginning
			}
			insert_at(child_node, parent_node, to_index);
		}
	}
};

/*
var element_data = [];

var get_data_obj = function(elem) {
	var data_obj_index = _.index_where(element_data, function(obj) {
		return obj.elem === elem;
	});

	if(data_obj_index < 0) {
		return null;
	} else {
		return element_data[data_obj_index];
	}
};

var get_data = function(elem, key) {
	var data_obj = get_data_obj(elem);

	if(data_obj === null) {
		return null;
	} else {
		return data_obj.data[key];
	}
};

var set_data = function(elem, key, value) {
	var data_obj = get_data_obj(elem);

	if(data_obj === null) {
		data_obj = {
			elem: elem
			, data: {}
		};
		element_data.push(data_obj);
	}

	data_obj.data[key] = value;
};
*/


var convert_item = function(item) {
	if(_.isElement(item) || _.isTextElement(item) || _.isCommentElement(item)) {
		return item;
	} else {
		var node = document.createTextNode(item);
		return node;
	}
};

cjs.binding.mixin("children", function(elem) {
	var child_constraints = _.rest(arguments);
	var children = cjs.create("constraint", function() {
			var dom_nodes = _.map(child_constraints, function(cc) {
					return cjs.get(cc);
				});
			var c_constraints = _.flatten(dom_nodes);

			return c_constraints;
	});

	var cached_value = [];

	var update_fn = function() {
		var value = cjs.get(children, true);
		if(!_.isArray(value)) {
			value = [value];
		}
		value = _.flatten(value);

		if(_.isElement(elem)) {
			var diff = _.diff(cached_value, value)
				, removed = diff.removed
				, added = diff.added
				, moved = diff.moved;

			_.forEach(removed, function(x) {
				remove_index(elem, x.index);
			});
			_.forEach(added, function(x) {
				var item = convert_item(x.item);
				insert_at(item, elem, x.index);
			});
			_.forEach(moved, function(x) {
				move_child(elem, x.to_index, x.from_index);
			});
		} else if(_.isTextElement(elem) || _.isCommentElement(elem)) {
			elem.nodeValue = _.map(value, function(child) {
				return String(child);
			}).join("");
		}

		cached_value = _.clone(value); //Value may be mutated, so clone it
	};

	return cjs.create("binding", {
		update: update_fn
		, activate: function() {
			//Clear the existing children of the element
			_.times(elem.childNodes.length, function() {
				elem.removeChild(elem.firstChild);
			});
			cached_value = [];
			if(cjs.is_constraint(children, true)) {
				children.onChange(update_fn);
			}
		}
		, deactivate: function() {
			children.offChange(update_fn);
		}
	});
});

cjs.define("dom_text", function() {
	var rv = document.createTextNode('');
	var args = _.toArray(arguments);
	args.unshift(rv);
	cjs.binding.children.apply(cjs, args);
	return rv;
});

cjs.define("dom_comment", function() {
	var rv = document.createComment('');
	var args = _.toArray(arguments);
	args.unshift(rv);
	cjs.binding.children.apply(cjs, args);
	return rv;
});

cjs.define("dom_element", function(tag, attributes) {
	var rv = document.createElement(tag);
	var args = _.rest(arguments, 2);
	args.unshift(rv);
	_.forEach(attributes, function(value, key) {
		cjs.binding.attr(rv, key, value);
	});
	cjs.binding.children.apply(cjs, args);
	return rv;
});

cjs.binding.mixin("text", cjs.binding.children);

}}(cjs));
/*global document:true */
(function(cjs) {if(!cjs._is_node) {
cjs.binding.mixin({
	val: function(objs, constraint) {
		var setter = function(obj, val) {
			obj.value = val;
		};
		return cjs.binding.bind(objs, constraint, setter);
	}
});
}}(cjs));
(function(cjs) {
var _ = cjs._;

cjs.on = function(event_type, target) {
	var context = this;

	var rv = function(do_something) {
		target.addEventListener(event_type, do_something);
	};

	rv.guard = function(guard_func) {
		return function(do_something) {
			target.addEventListener(event_type, function() {
				var args = _.toArray(arguments);
				if(guard_func.apply(context, args)) {
					do_something.apply(context, args);
				}
			});
		};
	};

	return rv;
};

}(cjs));
(function(cjs) {
	var _ = cjs._;
	var create_fsm_constraint = function(fsm, specs) {
		var state_spec_strs = _.keys(specs)
			, selectors = []
			, values = []
			, last_transition_value;

		var getter = function() {
			var i;
			var fsm_got = cjs.get(fsm);
			if(!cjs.is_fsm(fsm_got)) {
				return undefined;
			}
			var state = fsm_got.get_state();
			for(i = 0; i<selectors.length; i++) {
				var selector = selectors[i];
				if(selector.matches(state)) {
					var value = values[i];
					if(_.isFunction(value)) {
						return value(state);
					} else {
						return cjs.get(value);
					}
				}
			}
			return last_transition_value;
		};

		var constraint = cjs.create("constraint", getter);

		var uninstall_listeners = function(){};
		var install_listeners = function(fsm) {
			var uninstall_funcs = [];
			uninstall_listeners();
			if(!cjs.is_fsm(fsm)) {
				return;
			}

			selectors = _.map(state_spec_strs, function(state_spec_str) {
				return fsm.parse_selector(state_spec_str);
			});
			values = _.values(specs);

			_.forEach(selectors, function(selector) {
				if(selector.is("transition")) {
					fsm.on(selector, function() {
						last_transition_value = constraint.nullifyAndEval();
					});
					uninstall_funcs.push(_.bind(fsm.off, fsm, fsm.last_callback()));
				} else {
					fsm.on(selector, function() {
					//	constraint.nullify();
						last_transition_value = constraint.nullifyAndEval();
					});
					uninstall_funcs.push(_.bind(fsm.off, fsm, fsm.last_callback()));
				}
			});
			uninstall_listeners = function() {
				_.forEach(uninstall_funcs, function(uninstall_func) {
					uninstall_func();
				});
			};
		};

		if(cjs.is_constraint(fsm)) {
			fsm.onChange(function(val) {
				uninstall_listeners();
				install_listeners(val);
			});
			install_listeners(fsm.get());
		} else {
			install_listeners(fsm);
		}

		return constraint;
	};
	cjs.define("fsm_constraint", create_fsm_constraint);
	cjs.constraint.fsm = create_fsm_constraint;
}(cjs));
(function(cjs) {
	var _ = cjs._;
	var create_fsm_binding = function(fsm, specs) {
		var state_spec_strs = _.keys(specs)
			, selectors = _.map(state_spec_strs, function(state_spec_str) {
				return fsm.parse_selector(state_spec_str);
			})
			, bindings = _.values(specs);

				
		var last_binding;
		var deactivate_fns = [];
		var activate = function() {
			fsm.on("*", function() {
				if(!_.isUndefined(last_binding)) {
					last_binding.deactivate();
				}
			});
			deactivate_fns.push(fsm.last_callback());

			_.forEach(selectors, function(selector, index) {
				var binding = bindings[index];
				if(selector.is("transition")) {
					fsm.on(selector, function() {
						last_binding = undefined;
						binding.activate();
						binding.deactivate();
					});
					deactivate_fns.push(fsm.last_callback());
				} else {
					fsm.on(selector, function() {
						if(!_.isUndefined(last_binding)) {
							last_binding.deactivate();
						}
						binding.activate();
						last_binding = binding;
					});
					deactivate_fns.push(fsm.last_callback());
					if(fsm.is(selector)) {
						binding.activate();
						last_binding = binding;
					}
				}
			});
		};

		var deactivate = function() {
			_.forEach(deactivate_fns, function(deactivate_fn) {
				fsm.off(deactivate_fn);
			});
		};
		var update = function() {
			_.forEach(bindings, function(binding) {
				if(binding.is_activated()) {
					binding.update();
				}
			});
		};

		var binding = cjs.create("binding", {
			activate: activate
			, deactivate: deactivate
			, update: update
		});

		return binding;
	};
	cjs.define("fsm_binding", create_fsm_binding);

	cjs.binding.mixin("bind_check_fsm", function(objs, arg0, arg1, arg2) {
		var setter;
		if(cjs.is_fsm(arg0)) {
			var fsm = arg0;
			var vals = arg1;
			setter = arg2;
			var bindings = {};
			_.forEach(vals, function(constraint, key) {
				bindings[key] = cjs.binding.bind(objs, constraint, setter, false);
			});
			return cjs.create("fsm_binding", fsm, bindings);
		} else {
			var constraint = arg0;
			setter = arg1;
			return cjs.binding.bind(objs, constraint, setter);
		}

	});
}(cjs));
(function(cjs, root) {
	var _ = cjs._;
	var create_async_constraint = function(invoke_callback, timeout_interval) {
		var async_fsm = cjs	.create("fsm")
							.add_state("pending")
							.add_transition(function(do_transition ) {
								if(_.isNumber(timeout_interval)) {
									root.setTimeout(function() {
										do_transition("timeout");
									}, timeout_interval);
								}
							}, "rejected", false)
							.add_state("resolved")
							.add_state("rejected")
							.starts_at("pending");

		var do_resolved_transition = async_fsm.get_transition("pending", "resolved", false);
		var do_rejected_transition = async_fsm.get_transition("pending", "rejected", false);

		if(_.isNumber(timeout_interval)) {
			root.setTimeout(function() {
				do_rejected_transition("timeout");
			}, timeout_interval);
		}
		var resolved_value, rejected_value;
		var resolved = function(value) {
			resolved_value = value;
			do_resolved_transition(value);
		};

		var rejected = function(message) {
			rejected_value = message;
			do_rejected_transition(message);
		};

		invoke_callback(resolved, rejected);


		var constraint = cjs.create("fsm_constraint", async_fsm, {
			"pending": undefined
			, "resolved": function() {
				return cjs.get(resolved_value);
			}
			, "rejected": function() {
				return cjs.get(rejected_value);
			}
		});

		constraint.is_pending = function() {
			return constraint.$state.get() === "pending";
		};
		constraint.is_resolved = function() {
			return constraint.$state.get() === "resolved";
		};
		constraint.is_rejected = function() {
			return constraint.$state.get() === "rejected";
		};

		constraint.state = async_fsm;


		return constraint;
	};
	cjs.define("async_constraint", create_async_constraint);
	cjs.async = cjs.constraint.async = create_async_constraint;
}(cjs, this));
(function(cjs) {
	var _ = cjs._;
	var create_conditional_constraint = function() {
		var args = _.map(arguments, function(arg) {
			var rv = {};
			if(_.has(arg, "condition")) {
				if(_.isFunction(arg.condition)) {
					rv.condition = cjs.create("constraint", arg.condition);
				} else {
					rv.condition = arg.condition;
				}
			}
			if(_.has(arg, "value")) {
				if(_.isFunction(arg.value)) {
					rv.value = cjs.create("constraint", arg.value);
				} else {
					rv.value = arg.value;
				}
			}
			return rv;
		});

		var getter = function() {
			var i, len;
			for(i = 0,len=args.length; i<args.length; i++) {
				var arg = args[i];
				var condition = arg.condition, value = arg.value;

				if(!_.has(arg, "condition") || cjs.get(condition)) {
					return cjs.get(value);
				}
			}
			return undefined;
		};
		return cjs.create("constraint", getter);
	};
	cjs.define("conditional_constraint", create_conditional_constraint);
}(cjs));
/*jslint evil: true regexp: true*/
/*global console: true, document:true */
(function(cjs) {
	var _ = cjs._;

	cjs.__parsers = {};
	cjs.__ir_builders = {};
	cjs.__template_builders = {};

	var script_regex = /^#(\w+)$/;
	cjs.template = function(a,b,c,d) {
		var template_type = "handlebars"
			, str
			, data = undefined
			, options = {};
		if(arguments.length === 1) {
			str = a;
		} else if(arguments.length === 2) {
			str = a;
			data = b;
		} else if(arguments.length === 3) {
			str = a;
			data = b;
			options = c;
		} else  {
			template_type = a;
			str = b;
			data = c;
			options = d;
		} 

		var matches = str.match(script_regex);
		if(!_.isNull(matches)) {
			var script_id = matches[1];
			var scripts = document.getElementsByTagName("script");
			var template_script = null;
			_.forEach(scripts, function(script) {
				var type = script.getAttribute("type");
				if(type === "cjs/template") {
					var id = script.getAttribute("id");
					if(id === script_id) {
						template_script = script;
					}
				}
			});
			if(_.isNull(template_script)) {
				str = "Could not find &lt;script type='cjs/template' id='" + script_id + "'&gt;(...)&lt;/script&gt;";
			} else {
				str = template_script.innerText;
			}
		}

		return cjs.__template_builders[template_type](str, data, options);
	};
}(cjs));
(function (cjs) {
	"use strict";

	var unary_ops = ["-", "!"], // Permissible unary operations
		binary_ops = ["+", "-", "*", "/", "&&", "||", "&", "|", "<<", ">>", "===", "==", ">=", "<=",  "<", ">"]; //Permissible binary operations

	//Trim the left hand side of a string
	var ltrim_regex = /^\s+/,
		ltrim = function (str) {
			return str.replace(ltrim_regex, '');
		};

	var Parser = function (expr, options) {
		this.expr = expr;
		this.options = options;
		this.buffer = this.expr;
		this.curr_node = null;
	};

	(function (my) {
		var proto = my.prototype;
		proto.tokenize = function () {
			var rv = [];
			var last_buffer = this.buffer;
			while (this.buffer) {
				this.gobble_expression();
				if (this.curr_node === false) {
					throw new Error("Unexpected " + this.buffer);
				} else {
					rv.push(this.curr_node);
				}
				if (this.buffer === last_buffer) {
					throw new Error("Could not parse " + this.buffer);
				} else {
					last_buffer = this.buffer;
				}
			}
			if (rv.length === 1) {
				rv = rv[0];
			} else {
				rv = {
					type: "compound",
					statements: rv
				};
			}
			return rv;
		};

		proto.gobble_expression = function () {
			var node;
			this.curr_node = null;

			do {
				this.buffer = ltrim(this.buffer);
				node = false;
				if (node === false) {
					node = this.gobble_token();
				}
				if (node === false) {
					node = this.parse_fn_call();
				}
				if (node === false) {
					node = this.parse_parens();
				}
				if (node === false) {
					node = this.parse_binary_op();
				}
				if (node === false) {
					node = this.parse_unary_op();
				}

				if (node) {
					this.curr_node = node;
				} else {
					var separator_node = this.parse_separator();
					if (separator_node) {
						break;
					}
				}
			} while (node);


			return this.curr_node;
		};

		proto.gobble_token = function () {
			var node = false;
			if (node === false) {
				if (this.curr_node === null) {
					node = this.parse_variable();
				}
			}
			if (node === false) {
				node = this.parse_dot_property();
			}
			if (node === false) {
				node = this.parse_square_brackets_property();
			}
			if (node === false) {
				node = this.parse_constant();
			}
			return node;
		};

		var var_regex = new RegExp("^([A-Za-z_$][A-Za-z_$0-9]*)");
		proto.parse_variable = function () {
			var match = this.buffer.match(var_regex);
			if (match) { // We're dealing with a variable name
				var var_name = match[1];
				this.buffer = this.buffer.substr(match[0].length);
				return {
					type: "var",
					var_name: var_name,
					text: match[0]
				};
			}
			return false;
		};
		proto.parse_dot_property = function () {
			if (this.buffer[0] === ".") {
				if (this.curr_node === null) {
					throw new Error("Unexpected .");
				}

				this.buffer = this.buffer.substr(1);
				var prop_node = this.parse_variable();
				if (prop_node) {
					var node = {
						type: "prop",
						subtype: "dot",
						parent: this.curr_node,
						child: prop_node
					};
					return node;
				} else {
					throw new Error("Unexpected property '" + this.buffer[0] + "'");
				}
			}
			return false;
		};
		var open_square_brackets_regex = new RegExp("^\\[");
		var close_square_brackets_regex = new RegExp("^\\]");
		proto.parse_square_brackets_property = function () {
			var buffers = [];
			var match = this.buffer.match(open_square_brackets_regex);
			if (match) {// We're dealing with square brackets
				buffers.push(this.buffer);
				this.buffer = this.buffer.substr(match[0].length); // Kill the open bracket
				buffers.push(this.buffer);
				var old_curr_node = this.curr_node;
				this.curr_node = null;
				var contents = this.gobble_expression();
				if (contents) {
					match = this.buffer.match(close_square_brackets_regex);
					if (match) {
						buffers.push(this.buffer);
						this.buffer = this.buffer.substr(match[0].length); // Kill the close bracket
						buffers.push(this.buffer);

						var outer_text = buffers[0].substring(0, buffers[0].length - buffers[3].length);
						var inner_text = buffers[1].substring(0, buffers[1].length - buffers[2].length);
						var node = {
							type: "prop",
							subtype: "square_brackets",
							parent: old_curr_node,
							child: contents,
							outer_text: outer_text,
							inner_text: inner_text
						};
						return node;
					} else {
						throw new Error("Unclosed [");
					}
				} else {
					throw new Error("Unexpected property '" + match[1] + "'");
				}
			}
			return false;
		};
		var start_str_regex = new RegExp("^['\"]");
		var number_regex = new RegExp("^(\\d+(\\.\\d+)?)");
		proto.parse_constant = function () {
			var match, node;
			match = this.buffer.match(number_regex);
			if (match) {
				this.buffer = this.buffer.substr(match[0].length);
				node = {
					type: "constant",
					text: match[0],
					value: parseFloat(match[1])
				};
				return node;
			} else {
				match = this.buffer.match(start_str_regex);
				if (match) {
					var quote_type = match[0];
					var matching_quote_index = this.buffer.indexOf(quote_type, quote_type.length);

					if (matching_quote_index >= 0) {
						var content = this.buffer.substring(1, matching_quote_index);
						node = {
							type: "constant",
							text: this.buffer.substring(0, matching_quote_index + 1),
							value: content
						};
						this.buffer = this.buffer.substr(matching_quote_index + 1);
						return node;
					} else {
						throw new Error("Unclosed quote in " + match[0]);
					}
				}
			}
			return false;
		};
		var open_paren_regex = new RegExp("^\\(");
		var fn_arg_regex = new RegExp("^\\s*,");
		var close_paren_regex = new RegExp("^\\s*\\)");
		proto.parse_fn_call = function () {
			if (this.curr_node && (this.curr_node.type === "prop" || this.curr_node.type === "var" || this.curr_node.type === "fn_call")) {
				var match = this.buffer.match(open_paren_regex);
				if (match) {
					var arg_node = false;
					this.buffer = this.buffer.substr(match[0].length); // Kill the open paren
					var args = [];
					var old_curr_node = this.curr_node;
					do {
						this.curr_node = null;
						arg_node = this.gobble_expression();
						args.push(arg_node);
						match = this.buffer.match(fn_arg_regex);
						if (match) {
							this.buffer = this.buffer.substr(match[0].length);
						} else {
							match = this.buffer.match(close_paren_regex);
							if (match) {
								this.buffer = this.buffer.substr(match[0].length);
								break;
							}
						}
					} while (arg_node);
					//this.curr_node = old_curr_node;
					var node = {
						type: "fn_call",
						args: args,
						fn: old_curr_node
					};
					return node;
				}
			}
			return false;
		};

		var starts_with = function (str, substr) {
			return str.substr(0, substr.length) === substr;
		};

		proto.parse_parens = function () {
			var match = this.buffer.match(open_paren_regex);

			if (match) {
				this.buffer = this.buffer.substr(match[0].length);
				var previous_node = this.curr_node;
				this.curr_node = null;
				var contents = this.gobble_expression();
				match = this.buffer.match(close_paren_regex);
				if (match) {
					this.buffer = this.buffer.substr(match[0].length);
					var node = {
						type: "grouping",
						contents: contents
					};
					return node;
				} else {
					throw new Error("Unclosed (");
				}
			}
			return false;
		};
		proto.parse_unary_op = function () {
			var i, leni;
			for (i = 0, leni = unary_ops.length; i < leni; i += 1) {
				var unary_op = unary_ops[i];
				if (starts_with(this.buffer, unary_op)) {
					this.buffer = this.buffer.substr(unary_op.length);
					var operand = this.gobble_expression();

					var node = {
						type: "op",
						subtype: "unary",
						op: unary_op,
						operands: [operand]
					};
					return node;
				}
			}
			return false;
		};
		proto.parse_binary_op = function () {
			if (this.curr_node !== null) {
				var i, len;
				for (i = 0, len = binary_ops.length; i < len; i += 1) {
					var binary_op = binary_ops[i];
					if (starts_with(this.buffer, binary_op)) {
						this.buffer = this.buffer.substr(binary_op.length);
						var operand_1 = this.curr_node;
						this.curr_node = null;
						var operand_2 = this.gobble_expression();

						var node = {
							type: "op",
							subtype: "binary",
							op: binary_op,
							operands: [operand_1, operand_2]
						};
						return node;
					}
				}
			}
			return false;
		};
		var separator_regex = new RegExp("^[;,]");
		proto.parse_separator = function () {
			var match = this.buffer.match(separator_regex);
			if (match) {
				this.buffer = this.buffer.substr(match[0].length);
				var node = {
					type: "separator",
					separator: match[0],
				};
				return node;
			}
			return false;
		};
	}(Parser));

	var do_parse = function (expr, options) {
		var parser = new Parser(expr, options);
		return parser.tokenize();
	};
	do_parse.version = "0.0.4";

	cjs.__parsers.expression = do_parse;
}(cjs));
/*jslint evil: true regexp: true*/

/*
 * HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * HTMLParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * // or to get an XML string:
 * HTMLtoXML(htmlString);
 *
 * // or to get an XML DOM Document
 * HTMLtoDOM(htmlString);
 *
 * // or to inject into an existing document/DOM node
 * HTMLtoDOM(htmlString, document);
 * HTMLtoDOM(htmlString, document.body);
 *
 */

(function(cjs){

	// Regular Expressions for parsing tags and attributes
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
		attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
		
	// Empty Elements - HTML 4.01
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 4.01
	var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

	// Inline Elements - HTML 4.01
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script,style");

	var HTMLParser = function( html, handler ) {
		var index, chars, match, stack = [], last = html;
		stack.last = function(){
			return this[ this.length - 1 ];
		};

		while ( html ) {
			chars = true;

			// Make sure we're not in a script or style element
			if ( !stack.last() || !special[ stack.last() ] ) {

				// Comment
				if ( html.indexOf("<!--") == 0 ) {
					index = html.indexOf("-->");
	
					if ( index >= 0 ) {
						if ( handler.comment )
							handler.comment( html.substring( 4, index ) );
						html = html.substring( index + 3 );
						chars = false;
					}
	
				// end tag
				} else if ( html.indexOf("</") == 0 ) {
					match = html.match( endTag );
	
					if ( match ) {
						html = html.substring( match[0].length );
						match[0].replace( endTag, parseEndTag );
						chars = false;
					}
	
				// start tag
				} else if ( html.indexOf("<") == 0 ) {
					match = html.match( startTag );
	
					if ( match ) {
						html = html.substring( match[0].length );
						match[0].replace( startTag, parseStartTag );
						chars = false;
					}
				}

				if ( chars ) {
					index = html.indexOf("<");
					
					var text = index < 0 ? html : html.substring( 0, index );
					html = index < 0 ? "" : html.substring( index );
					
					if ( handler.chars )
						handler.chars( text );
				}

			} else {
				html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
					text = text.replace(/<!--(.*?)-->/g, "$1")
						.replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

					if ( handler.chars )
						handler.chars( text );

					return "";
				});

				parseEndTag( "", stack.last() );
			}

			if ( html == last )
				throw "Parse Error: " + html;
			last = html;
		}
		
		// Clean up any remaining tags
		parseEndTag();

		function parseStartTag( tag, tagName, rest, unary ) {
			tagName = tagName.toLowerCase();

			if ( block[ tagName ] ) {
				while ( stack.last() && inline[ stack.last() ] ) {
					parseEndTag( "", stack.last() );
				}
			}

			if ( closeSelf[ tagName ] && stack.last() == tagName ) {
				parseEndTag( "", tagName );
			}

			unary = empty[ tagName ] || !!unary;

			if ( !unary )
				stack.push( tagName );
			
			if ( handler.start ) {
				var attrs = [];
	
				rest.replace(attr, function(match, name) {
					var value = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						fillAttrs[name] ? name : "";
					
					attrs.push({
						name: name,
						value: value,
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});
	
				if ( handler.start )
					handler.start( tagName, attrs, unary );
			}
		}

		function parseEndTag( tag, tagName ) {
			// If no tag name is provided, clean shop
			if ( !tagName )
				var pos = 0;
				
			// Find the closest opened tag of the same type
			else
				for ( var pos = stack.length - 1; pos >= 0; pos-- )
					if ( stack[ pos ] == tagName )
						break;
			
			if ( pos >= 0 ) {
				// Close all the open elements, up the stack
				for ( var i = stack.length - 1; i >= pos; i-- )
					if ( handler.end )
						handler.end( stack[ i ] );
				
				// Remove the open elements from the stack
				stack.length = pos;
			}
		}
	};

	function makeMap(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}
	cjs.__parsers.html = function (expr, handler) {
		HTMLParser(expr, handler);
	};
}(cjs));
(function(cjs) {
//Based on Mu's parser: https://github.com/raycmorgan/Mu
var _ = cjs._;

//These are nodes that don't have to be closed.
// For instance: 
// {{#diagram d}}
//	{{#state A}} a
//	{{#state B}} b
// {{/diagram}}
//
// doesn't require closing {{#state}}
var unclosed_nodes = {
	"diagram": {
		sub_nodes: ["state"]
	}
	, "if": {
		sub_nodes: ["elif", "else"]
	}
};

// Dictates what parents children must have; state must be a direct descendent of diagram
var parent_rules = {
	"state": {
		parent: "diagram"
		, direct: true
	}
};

// elsif and else must come after either if or elsif
var sibling_rules = {
	"elif": {
		follows: ["if", "elif"] //what it may follow
		, direct: true //that it must directly follow
		, or_parent: ["if"] //or the parent can be 'if'
	}
	, "else": {
		follows: ["if", "elif"]
		, direct: true
		, or_parent: ["if"]
	}
};


cjs.__parsers.handlebars = function (template, options) {
	var parser = new Parser(template, options);
	return parser.tokenize();
};

var carriage = '__CJS_CARRIAGE__'
	, carriageRegExp = new RegExp(carriage, 'g')
	, newline = '__CJS_NEWLINE__'
	, newlineRegExp = new RegExp(newline, 'g');



function Parser(template, options) {
	this.template = template	.replace(/\r\n/g, carriage)
								.replace(/\n/g, newline);;
	this.options  = options || {};

	this.sections = [];
	this.tokens   = ['multi'];
	this.partials = [];
	this.buffer   = this.template;
	this.state    = 'static'; // 'static' or 'tag'
	//this.currentLine = '';

	this.setTag(['{{', '}}']);
}

Parser.prototype = {
	tokenize: function () {
		while (this.buffer) {
			this.state === 'static' ? this.scanText() : this.scanTag();
		}

		if (this.sections.length > 0) {
			throw new Error('Encountered an unclosed section.');
		}

		var template = this.template.replace(carriageRegExp, '\r\n')
									.replace(newlineRegExp, '\n');

		return {partials: this.partials, tokens: this.tokens, content: template};
	}

	, appendMultiContent: function (content) {
		var i, len, multi;
		for (i = 0, len = this.sections.length; i < len; i++) {
			multi = this.sections[i][1];
			multi = multi[multi.length - 1][4] += content;
		}
	}

	, setTag: function (tags) {
		this.otag = tags[0] || '{{';
		this.ctag = tags[1] || '}}';
	}

	, scanText: function () {
		// Eat up everything up to the {{
		// if there is anything, then push a new 
		
		var index = this.buffer.indexOf(this.otag);

		if (index === -1) {
			index = this.buffer.length;
		}

		var content = this.buffer.substring(0, index)
									.replace(carriageRegExp, '\r\n')
									.replace(newlineRegExp, '\n');

		if (content !== '') {
			this.appendMultiContent(content);
			this.tokens.push(['static', content]);
		}

		this.buffer = this.buffer.substring(index + this.otag.length);
		this.state  = 'tag';
	}

	, scanTag: function () {
		var ctag = this.ctag
			, matcher = 
					"^" +
					"\\s*" +                           // Skip any whitespace

					"(#|\\^|/|=|!|<|>|&|\\{)?" +       // Check for a tag type and capture it
					"\\s*" +                           // Skip any whitespace
					"([^(?:\\}?" + e(ctag) + ")]+)" +  // Capture the text inside of the tag
					"\\s*" +                           // Skip any whitespace


					"\\}?" +                           // Skip balancing '}' if it exists
					e(ctag) +                          // Find the close of the tag

					"(.*)$"                            // Capture the rest of the string
					;

		matcher = new RegExp(matcher);

		var match = this.buffer.match(matcher);

		if (!match) {
			throw new Error('Encountered an unclosed tag: "' + this.otag + this.buffer + '"');
		}

		var sigil = match[1]
			, content = match[2].trim()
			, remainder = match[3]
			, tagText = this.otag + this.buffer.substring(0, this.buffer.length - remainder.length);

		var tag_name = content_until(content, " ");

		switch (sigil) {
			case undefined:
				this.tokens.push(['mustache', 'etag', tag_name, content]);
				this.appendMultiContent(tagText);
				break;

			case '>':
			case '<':
				this.tokens.push(['mustache', 'partial', tag_name, content]);
				this.partials.push(content);
				this.appendMultiContent(tagText);
				break;

			case '{':
			case '&':
				this.tokens.push(['mustache', 'utag', tag_name, content]);
				this.appendMultiContent(tagText);
				break;

			case '!':
				// Ignore comments
				break;

			case '=':
				this.setTag(content.split(' '));
				this.appendMultiContent(tagText);
				break;

			case '#':
			case '^':
				var type = sigil === '#' ? 'section' : 'inverted_section';


				var res = _.last(this.sections) || []
					, name = res[0]
					, tokens = res[1];
				var unclosed_sub_nodes = _.pluck(unclosed_nodes, "sub_nodes");
				var auto_close = false;
				for(var i = 0, len = unclosed_sub_nodes.length; i<len; i++) {
					if(_.indexOf(unclosed_sub_nodes[i], name) >= 0 && _.indexOf(unclosed_sub_nodes[i], tag_name) >= 0) {
						auto_close = true;
						break;
					}
				}

				if(auto_close) {
					this.tokens = tokens;
					this.sections.pop();
				}

				this.appendMultiContent(tagText);

				if(_.has(parent_rules, tag_name)) {
					var parent_rule = parent_rules[tag_name];
					if(parent_rule.direct === true) {
						var last_section = _.last(this.sections);
						var parent_tag_name = last_section[0];
						if(parent_tag_name !== parent_rule.parent) {
							throw new Error(tag_name + ' must be a direct child of ' + parent);
						}
					} else {
						var found = false;
						for(var i = this.sections.length-1; i>=0; i--) {
							var section = this.sections[i];
							if(section[0] === parent_rule.parent) {
								found = true;
								break;
							}
						}
						if(!found) {
							throw new Error(tag_name + ' must be a child of ' + parent);
						}
					}
				}


				if(_.has(sibling_rules, tag_name)) {
					var sibling = _.last(this.tokens);
					var sibling_tag_name = sibling[2];
					
					var sibling_tag_rules = sibling_rules[tag_name];

					if(sibling_tag_rules.direct) {
						if(_.indexOf(sibling_tag_rules.follows, sibling_tag_name) < 0) {
							var last_section = _.last(this.sections) || [];
							var parent_tag_name = last_section[0];
							if(_.indexOf(sibling_tag_rules.or_parent, parent_tag_name) < 0) {
								var follows_options = _.clone(sibling_tag_rules.follows);
								if(follows_options.length > 1) {
									follows_options[follows_options.length-1] =  "or " + _.last(follows_options);
								}
								var follows_options_str;

								if(follows_options.length > 2) {
									follows_options_str = follows_options.join(", ");
								} else {
									follows_options_str = follows_options.join(" ");
								}

								throw new Error(tag_name + ' must follow ' + follows_options_str);
							}
						}
					}
				}

				block = ['multi'];

				this.tokens.push(['mustache', type, tag_name, content, '', block]);
				this.sections.push([tag_name, this.tokens]);
				this.tokens = block;
				break;

			case '/':
				var res = _.last(this.sections) || []
					, name = res[0]
					, tokens = res[1];

				if (!name) {
					throw new Error('Closing unopened ' + tag_name);
				} else if (name !== tag_name) {
					var auto_close = false;
					if(_.has(unclosed_nodes, tag_name)) {
						var unclosed_children = unclosed_nodes[tag_name].sub_nodes;
						if(_.indexOf(unclosed_children, name) >= 0) {
							auto_close = true;
						}
					}
					if(auto_close) {
						this.sections.pop();

						res = _.last(this.sections) || [];
						name = res[0];
						tokens = res[1];
					} else {
						throw new Error("Unclosed section " + name);
					}
				}
				
				this.tokens = tokens;
				this.sections.pop();
				this.appendMultiContent(tagText);
				break;
		}

		this.buffer = remainder;
		this.state  = 'static';
	}
}


//
// Used to escape RegExp strings
//
function e(text) {
	// thank you Simon Willison
	if(!arguments.callee.sRE) {
		var specials = [
			'/', '.', '*', '+', '?', '|',
			'(', ')', '[', ']', '{', '}', '\\'
		];
		arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
	}

	return text.replace(arguments.callee.sRE, '\\$1');
}

function content_until(str, until_str) {
	var index = str.indexOf(until_str);
	if(index < 0) { return str; }
	else { return str.substring(0, index); }
}

}(cjs));
(function(cjs){
var _ = cjs._;

var IRNode = function(type_str, text_content) {
	var types = type_str.split("/");
	this.type = types[0];
	this.subtype = types[1] || null;

	this.text = text_content;
	this.value = null;
	this.children = [];
	this.parent = null;
};

(function(my) {
	var proto = my.prototype;
	proto.push_child = function(child) {
		this.children.push(child);
		if(child instanceof my) {
			child.set_parent(this);
		}
	};
	proto.insert_child_at = function(child, index) {
		_.insert_at(this.children, child, index);
		
		if(child instanceof my) {
			child.set_parent(this);
		}
	};
	proto.set_children = function(children) {
		this.children = children;
		var self = this;
		_.forEach(this.children, function(child) {
			if(child instanceof my) {
				child.set_parent(self);
			}
		});
	};
	proto.child_index = function(child) {
		return _.index_of(this.children, child);
	};
	proto.set_value = function(value) {
		this.value = value;
	};
	proto.set_parent = function(parent) {
		this.parent = parent;
	};
	proto.remove_child = function(child) {
		_.remove(this.children, child);
		if(child.parent === this) {
			child.set_parent(null);
		}
		return child;
	};
	proto.to_str = function(transformer) {
		if(!_.isFunction(transformer)) {
			transformer = function(child) {
				if(child instanceof my) {
					return child.to_str(transformer);
				} else {
					return child;
				}
			};
		}

		var rv = _.map(this.children, function(child) {
			return transformer(child);
		});
		return rv.join("");
	};
}(IRNode));

var build_ir = function(parse_tree_root, ir_root) {
	var type = parse_tree_root[0];
	var args = _.rest(parse_tree_root);
	if(type === "multi") {
		var children = _.map(args, function(arg) {
			return build_ir(arg, ir_root);
		});
		ir_root.set_children(children);
		return parse_tree_root;
	} else if(type === "static") {
		return args[0];
	} else if(type === "mustache") {
		var subtype = args[0];
		args = _.rest(args);
		if(subtype === "etag" || subtype === "utag") {
			var rv = new IRNode("mustache/variable", args[1]);
			rv.set_value({
				var_name: args[0]
				, escaped: subtype === "etag"
			});
			return rv;
		} else if(subtype === "section" || subtype === "inverted_section") {
			var tag = args[0]
				, tag_content = args[1]
				, text_content = args[2]
				, sub_trees = args[3];

			var rv = new IRNode("mustache/"+subtype, text_content);
			var attribute_start_index = tag_content.indexOf(" ");
			var attributes;
			if(attribute_start_index<0) {
				attributes = null;
			} else {
				attributes = tag_content.substring(attribute_start_index+1);
			}
			rv.set_value({
				tag: tag
				, attributes: attributes
			});

			build_ir(sub_trees, rv);

			return rv;
		} else if(subtype === "partial") {
			var tag = args[0];
			var tag_content = args[1];
			var rv = new IRNode("mustache/partial", tag_content);
			rv.set_value(tag);
			return rv;
		} else {
			console.log("Unknown mustache type", subtype);
		}
	} else {
		console.log("Unknown type", type);
	}
};

var is_tag = function(ir_root, tag_name) {
	return ir_root.type === "mustache" && ir_root.subtype === "section" && ir_root.value && ir_root.value.tag === tag_name;
};
var extract_elses = function(ir_root) {
	if(is_tag(ir_root, "if")) {
		var i, len;

		var children_to_elevate = [];
		for(i = 0, len=ir_root.children.length; i<len; i++) {
			var child = ir_root.children[i];
			if(is_tag(child, "if")) {
				break;
			} else if(is_tag(child, "elif") || is_tag(child, "else")) { // encountered before another if
				children_to_elevate.push(child);
			}
		}
		var if_parent = ir_root.parent;
		var curr_index = if_parent.child_index(ir_root) + 1;
		_.forEach(children_to_elevate, function(child) {
			ir_root.remove_child(child);
			if_parent.insert_child_at(child, curr_index);
			curr_index+=1;
		});
	}

	_.forEach(ir_root.children, function(child) {
		extract_elses(child);
	});
};

var integrate_expressions = function(ir_root) {
	if(_.has(ir_root, "value") && !_.isNull(ir_root.value)) {
		if(_.has(ir_root.value, "attributes") && !_.isNull(ir_root.value.attributes)) {
			var attributes = ir_root.value.attributes;
			var parsed_attributes = cjs.__parsers.expression(attributes);
			ir_root.value.parsed_attributes = parsed_attributes;
		} else if(_.has(ir_root.value, "var_name")) {
			var var_name = ir_root.value.var_name;
			var parsed_var_name = cjs.__parsers.expression(var_name);
			ir_root.value.parsed_var_name = parsed_var_name;
		}
	}
	_.forEach(ir_root.children, function(child) {
		integrate_expressions(child);
	});
};

var extraction_regex = /\{cjs\{([#\/]?)(\d+)\}cjs\}/;
var extract_handlebars = function(str) {
	var buffer = str;
	var rv = [];
	var match;

	do {
		match = buffer.match(extraction_regex);
		if(match) {
			var str_index = buffer.indexOf(match[0]);
			if(str_index > 0) {
				rv.push(buffer.substr(0, str_index));
			}
			buffer = buffer.substr(str_index + match[0].length);
			var modifier = match[1];
			var handlebar_id = parseInt(match[2]);

			rv.push({
				type: "handlebars"
				, modifier: modifier
				, handlebar_id: handlebar_id
			});
		} else {
			rv.push(buffer);
			buffer = "";
		}
	} while (buffer.length > 0);

	return rv;
};

var get_unique_handlebars_opening = function(id) {
	var rv = "{cjs{#"+id+"}cjs}";
	return rv;
};
var get_unique_handlebars_closing = function(id) {
	var rv = "{cjs{/"+id+"}cjs}";
	return rv;
};
var get_unique_handlebars_str = function(id) {
	var rv = "{cjs{"+id+"}cjs}";
	return rv;
};

var integrate_html = function(ir_root) {
	var handlebars_map = [];
	var id = 0;

	var transformer;
	transformer = function(child) {
		if(child instanceof IRNode) {
			if(child.value) {
				if(child.type === "mustache") {
					if(child.subtype === "section") {
						var unique_id = id;
						handlebars_map[unique_id] = child;
						id++;
						var rv = get_unique_handlebars_opening(unique_id) + child.to_str(transformer) + get_unique_handlebars_closing(unique_id);
						return rv;
					} else {
						var unique_id = id;
						handlebars_map[unique_id] = child;
						id++;
						var rv = get_unique_handlebars_str(unique_id);
						return rv;
					}
				} else {
					throw new Exception("Nothing but mustache expressions allowed at this stage of IR building");
				}
			} else {
				return child.to_str(transformer);
			}
		} else {
			return child;
		}
	};

	var stack = [ir_root];
	var str = ir_root.to_str(transformer);
	ir_root.set_children([]);
	cjs.__parsers.html(str, {
		start: function(tag_name, attrs, unary) {
			var parent = _.last(stack);
			var node = new IRNode("html/tag");
			node.value = {
				tag_name: tag_name
			};
			if(!unary) {
				stack.push(node);
			}
			parent.push_child(node);

			var new_node;
			node.attrs = [];
			_.forEach(attrs, function(attr, attr_name) {
				var attr_name = attr.name;
				var attr_value = _.map(extract_handlebars(attr.value), function(child) {
					if(_.isString(child)) {
						return child;
					} else {
						new_node = handlebars_map[child.handlebar_id];
						if(child.modifier === "#") {
							//throw new Error("Cannot handle expressions in attributes yet");
							return new_node;
						} else if(child.modifier === "/") {
							//throw new Error("Cannot handle expressions in attributes yet");
							return false;
						} else {
							return new_node;
						}
					}
				});
				node.attrs.push({
					name: attr_name
					, value: _.compact(attr_value)
				});
			});
		}
		, end: function(tag_name) {
			var node = stack.pop();
			if(node.value.tag_name !== tag_name) {
				throw new Exception("Could not resolve", tag_name, node);
			}
		}
		, chars: function(text) {
			var new_node;
			_.forEach(extract_handlebars(text), function(child) {
				if(_.isString(child)) {
					var parent = _.last(stack);
					parent.push_child(child);
				} else {
					new_node = handlebars_map[child.handlebar_id];
					if(child.modifier === "#") {
						new_node.set_children([]);
						var parent = _.last(stack);
						parent.push_child(new_node);
						stack.push(new_node);
					} else if(child.modifier === "/") {
						var node = stack.pop();
						if(node !== new_node) {
							throw new Exception("Out of order: ", node.text, new_node.text);
						}
					} else {
						var parent = _.last(stack);
						parent.push_child(new_node);
					}
				}
			});
		}
		, comment: function(text) {
			var parent = _.last(stack);
			var new_node = new IRNode("html/comment", text);
			parent.push_child(new_node);
		}
	});
};


cjs.__ir_builders.handlebars = function (parse_tree, options) {
	var root = new IRNode("root", parse_tree.content);
	build_ir(parse_tree.tokens, root);
	extract_elses(root);
	integrate_expressions(root);
	integrate_html(root);
	return root;
};


})(cjs);
(function (cjs) {
	var _ = cjs._;
	var default_container = "span";

	var parsed_var_fn_val = function(node) {
		var type = node.type;
		if(type === "prop") {
			var subtype = node.subtype;
			var parent = node.parent;
			var child = node.child;
			var parent_text = parsed_var_fn_val(parent);
			var child_text = parsed_var_fn_val(child);
			if(subtype === "square_brackets") {
				if(child.type === "constant" && child.subtype === "string") {
					child_text = '"' + child_text + '"';
				}

				return parent_text + ".item(" + child_text + ")";
			} else if(subtype === "dot") {
				return parent_text + ".item('" + child_text + "')";
			} else {
				console.log("Unknown type " + type + "/" + subtype);
			}
		} else if(type === "constant") {
			return node.value;
		} else if(type === "var") {
			return node.var_name;
		} else {
			console.log("Unknown type " + type);
		}
		return "'todo'";
	};

	var helpers = {};

	var to_fn_str= function(node) {
		var rv = ""
			, type = _.isString(node) ? "string" : node.type;
		if(type === "root") {
			if(node.children.length === 1 && node.children[0].type === "html") {
				rv = "return " + to_fn_str(node.children[0]) + ";";
			} else {
				rv = "return cjs.create('dom_element', '" + default_container + "', {} // (root)\n";
				_.forEach(node.children, function(child) {
					var fn_str = to_fn_str(child);
					if(fn_str) {
						rv += ", " + fn_str;
					}
				});
				rv += "\n); // (/root)";
			}
		} else if(type === "string") {
			var text = node.split("\n").join("\\n");
			rv = "cjs.create('dom_text', '"+text+"') // (text /)\n";
		} else if(type === "html") {
			var subtype = node.subtype;
			if(subtype === "tag") {
				var tag = node.value.tag_name;
				rv = "cjs.create('dom_element', '" + tag + "',";
				if(_.size(node.attrs) === 0) {
					rv += " {} // <" + tag + ">\n";
				} else {
					rv += " { // <" + tag + ">\n";
					_.forEach(node.attrs, function(attr, index) {
						var name = attr.name;
						var value = attr.value;
						rv += "\n";
						if(index>0) {
							rv += ", ";
						}
						rv += "'" + name + "': ";

						rv += "cjs.concat(";
						rv += _.map(value, function(v) {
							if(_.isString(v)) {
								return "'" + v + "'";
							} else {
								var parsed_var_name = v.value.parsed_var_name;
								var node_code = parsed_var_fn_val(parsed_var_name);
								return node_code;
							}
						}).join(", ");
						rv += ")";
					});
					rv += "} \n";
				}

				_.forEach(node.children, function(child) {
					rv += "\n, " + to_fn_str(child);
				});
				rv += "\n) // </" + tag + ">\n";
			} else {
				console.log("Unhandled type html/" + subtype);
			}
		} else if(type === "mustache") {
			var subtype = node.subtype;
			if(subtype === "variable") {
				var parsed_var_name = node.value.parsed_var_name;
				var node_code = parsed_var_fn_val(parsed_var_name);

				rv = "cjs.create('dom_text', " + node_code + ") // {{" + node.value.var_name + "}}\n";
			} else if(subtype === "section") {
				var tag = node.value.tag;
				if(_.has(helpers, tag)) {
					rv = helpers[tag](node);
				} else {
					console.log("No helper registered for section " + tag);
				}
			} else {
				console.log("Unhandled type mustache/" + subtype);
			}
		} else {
			console.log("Unhandled type " + type);
		}
		return rv;

	};

	var parser = cjs.__parsers.handlebars;
	var ir_builder = cjs.__ir_builders.handlebars;
	var build_handlebars_template = function(str, data) {
		var parse_tree = parser(str)
			, ir = ir_builder(parse_tree)
			, fn_string = "with (obj) {\n"
							+ to_fn_str(ir)
							+ "\n}";

		var fn;
		try {
			fn = new Function("obj", fn_string);
		} catch(e) {
			console.log(fn_string);
			throw e;
		}

		return _.isUndefined(data) ? fn : fn(data);
	};
	build_handlebars_template.register_helper = function(name, helper) {
		helpers[name] = helper;
	};
	cjs.__template_builders.handlebars = build_handlebars_template;

	build_handlebars_template.register_helper("if", function(node) {
		var parent = node.parent;
		var child_index = -1;
		var conditions = [node];
		var hit_if = false;
		for(var i = 0; i<parent.children.length; i++) {
			var child = parent.children[i];
			if(child === node) {
				hit_if = true;
			} else if(hit_if) {
				if(child.type === "mustache" && child.subtype === "section") {
					if(child.value.tag === "elif") {
						conditions.push(child);
					} else if(child.value.tag === "else") {
						conditions.push(child);
						break;
					} else {
						break;
					}
				} else {
					break;
				}
			}
		}

		var rv = "\ncjs.create('conditional_constraint', // {{#if}}\n";
		_.forEach(conditions, function(condition, index) {
			var parsed_attributes = condition.value.parsed_attributes;
			var condition_code = parsed_var_fn_val(parsed_attributes);

			var type = condition.value.tag;

			if(index > 0) { //if
				rv += ", ";
			}

			rv += "{ ";

			if(type !== "else") {
				rv += "condition: " + condition_code;
				rv += " // {{#" + type + " " + condition.value.attributes + "}}\n, ";
			}
			rv += "value: [";
			_.forEach(condition.children, function(c, i) {
				if(i>0) {
					rv += ", ";
				}
				rv += to_fn_str(c);
			});

			rv += "]} // {{/" + type + " " + condition.value.attributes + "}}\n";
		});
		rv += "\n) // {{/if}}\n";
		return rv;
	});
	build_handlebars_template.register_helper("elif", function(node) {
		return "";
	});
	build_handlebars_template.register_helper("else", function(node) {
		return "";
	});
	build_handlebars_template.register_helper("each", function(node) {
		var parsed_attributes = node.value.parsed_attributes;
		var collection_name, val_name, key_name;
		var attrs;
		if(parsed_attributes.type === "compound") {
			attrs = parsed_attributes.statements;
		} else {
			attrs = [parsed_attributes];
		}

		var rv;
		if(_.size(attrs) >= 1) {
			var collection_name_code = parsed_var_fn_val(attrs[0]);

			var val_name_code = (_.size(attrs) >= 2) ? attrs[1].text : "value";
			var key_name_code = (_.size(attrs) >= 3) ? attrs[2].text : "key";

			rv = collection_name_code + ".map(function(" + val_name_code + ", " + key_name_code + ") { // {{#each " + attrs[0].text + "}}\n";
			rv += "return [ // {{#each}}\n";
			_.forEach(node.children, function(child, index) {
				if(index > 0) {
					rv += ", ";
				}
				rv += to_fn_str(child);
			});
			rv += "];";
			rv += "}) // {{/each}}\n";
		}
		return rv;
	});

	build_handlebars_template.register_helper("diagram", function(node) {
		var diagram_name = parsed_var_fn_val(node.value.parsed_attributes);
		rv = "\ncjs.create('fsm_constraint', " + diagram_name + ", { // {{#diagram " + diagram_name + "}}\n\n";
		var index=0;
		_.forEach(node.children, function(child) {
			if(child.type === "mustache" && child.subtype === "section" && child.value.tag === "state") {
				var state_name = parsed_var_fn_val(child.value.parsed_attributes);
				if(index > 0) {
					rv += ", ";
				}
				rv += "'" + state_name + "': [\n";

				_.forEach(child.children, function(c, i) {
					if(i>0) {
						rv += ", ";
					}
					rv += to_fn_str(c);
				});

				rv += "]";
				index++;
			}
		});
		rv += "}) // {/diagram}\n";
		return rv;
	});
})(cjs);
