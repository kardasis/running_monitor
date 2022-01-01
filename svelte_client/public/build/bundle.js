
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$4() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text$1(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text$1(' ');
    }
    function empty$3() {
        return text$1('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children$1(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$4,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children$1(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$4;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/TabBar.svelte generated by Svelte v3.43.2 */

    const { console: console_1$1 } = globals;
    const file$8 = "src/components/TabBar.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Explorer";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Trends";
    			add_location(button0, file$8, 10, 2, 148);
    			add_location(button1, file$8, 11, 2, 215);
    			attr_dev(div, "class", "bar");
    			add_location(div, file$8, 9, 0, 128);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop$4,
    		i: noop$4,
    		o: noop$4,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabBar', slots, []);
    	let { active = '' } = $$props;

    	const selectTab = name => {
    		console.log(name);
    		$$invalidate(1, active = name);
    	};

    	const writable_props = ['active'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<TabBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => selectTab('explorer');
    	const click_handler_1 = () => selectTab('trends');

    	$$self.$$set = $$props => {
    		if ('active' in $$props) $$invalidate(1, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({ active, selectTab });

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) $$invalidate(1, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectTab, active, click_handler, click_handler_1];
    }

    class TabBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal, { active: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabBar",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get active() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function ascending$3(a, b) {
      return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(f) {
      let delta = f;
      let compare1 = f;
      let compare2 = f;

      if (f.length !== 2) {
        delta = (d, x) => f(d) - x;
        compare1 = ascending$3;
        compare2 = (d, x) => ascending$3(f(d), x);
      }

      function left(a, x, lo = 0, hi = a.length) {
        if (lo < hi) {
          if (compare1(x, x) !== 0) return hi;
          do {
            const mid = (lo + hi) >>> 1;
            if (compare2(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          } while (lo < hi);
        }
        return lo;
      }

      function right(a, x, lo = 0, hi = a.length) {
        if (lo < hi) {
          if (compare1(x, x) !== 0) return hi;
          do {
            const mid = (lo + hi) >>> 1;
            if (compare2(a[mid], x) <= 0) lo = mid + 1;
            else hi = mid;
          } while (lo < hi);
        }
        return lo;
      }

      function center(a, x, lo = 0, hi = a.length) {
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function number$3(x) {
      return x === null ? NaN : +x;
    }

    function* numbers(values, valueof) {
      if (valueof === undefined) {
        for (let value of values) {
          if (value != null && (value = +value) >= value) {
            yield value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
            yield value;
          }
        }
      }
    }

    const ascendingBisect = bisector(ascending$3);
    const bisectRight = ascendingBisect.right;
    const bisectLeft = ascendingBisect.left;
    const bisectCenter = bisector(number$3).center;
    var bisect = bisectRight;

    function count$1(values, valueof) {
      let count = 0;
      if (valueof === undefined) {
        for (let value of values) {
          if (value != null && (value = +value) >= value) {
            ++count;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
            ++count;
          }
        }
      }
      return count;
    }

    function length$3(array) {
      return array.length | 0;
    }

    function empty$2(length) {
      return !(length > 0);
    }

    function arrayify(values) {
      return typeof values !== "object" || "length" in values ? values : Array.from(values);
    }

    function reducer(reduce) {
      return values => reduce(...values);
    }

    function cross$2(...values) {
      const reduce = typeof values[values.length - 1] === "function" && reducer(values.pop());
      values = values.map(arrayify);
      const lengths = values.map(length$3);
      const j = values.length - 1;
      const index = new Array(j + 1).fill(0);
      const product = [];
      if (j < 0 || lengths.some(empty$2)) return product;
      while (true) {
        product.push(index.map((j, i) => values[i][j]));
        let i = j;
        while (++index[i] === lengths[i]) {
          if (i === 0) return reduce ? product.map(reduce) : product;
          index[i--] = 0;
        }
      }
    }

    function cumsum(values, valueof) {
      var sum = 0, index = 0;
      return Float64Array.from(values, valueof === undefined
        ? v => (sum += +v || 0)
        : v => (sum += +valueof(v, index++, values) || 0));
    }

    function descending$2(a, b) {
      return a == null || b == null ? NaN
        : b < a ? -1
        : b > a ? 1
        : b >= a ? 0
        : NaN;
    }

    function variance(values, valueof) {
      let count = 0;
      let delta;
      let mean = 0;
      let sum = 0;
      if (valueof === undefined) {
        for (let value of values) {
          if (value != null && (value = +value) >= value) {
            delta = value - mean;
            mean += delta / ++count;
            sum += delta * (value - mean);
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
            delta = value - mean;
            mean += delta / ++count;
            sum += delta * (value - mean);
          }
        }
      }
      if (count > 1) return sum / (count - 1);
    }

    function deviation(values, valueof) {
      const v = variance(values, valueof);
      return v ? Math.sqrt(v) : v;
    }

    function extent$1(values, valueof) {
      let min;
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
      return [min, max];
    }

    // https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
    class Adder {
      constructor() {
        this._partials = new Float64Array(32);
        this._n = 0;
      }
      add(x) {
        const p = this._partials;
        let i = 0;
        for (let j = 0; j < this._n && j < 32; j++) {
          const y = p[j],
            hi = x + y,
            lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
          if (lo) p[i++] = lo;
          x = hi;
        }
        p[i] = x;
        this._n = i + 1;
        return this;
      }
      valueOf() {
        const p = this._partials;
        let n = this._n, x, y, lo, hi = 0;
        if (n > 0) {
          hi = p[--n];
          while (n > 0) {
            x = hi;
            y = p[--n];
            hi = x + y;
            lo = y - (hi - x);
            if (lo) break;
          }
          if (n > 0 && ((lo < 0 && p[n - 1] < 0) || (lo > 0 && p[n - 1] > 0))) {
            y = lo * 2;
            x = hi + y;
            if (y == x - hi) hi = x;
          }
        }
        return hi;
      }
    }

    function fsum(values, valueof) {
      const adder = new Adder();
      if (valueof === undefined) {
        for (let value of values) {
          if (value = +value) {
            adder.add(value);
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if (value = +valueof(value, ++index, values)) {
            adder.add(value);
          }
        }
      }
      return +adder;
    }

    function fcumsum(values, valueof) {
      const adder = new Adder();
      let index = -1;
      return Float64Array.from(values, valueof === undefined
          ? v => adder.add(+v || 0)
          : v => adder.add(+valueof(v, ++index, values) || 0)
      );
    }

    class InternMap extends Map {
      constructor(entries, key = keyof) {
        super();
        Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
        if (entries != null) for (const [key, value] of entries) this.set(key, value);
      }
      get(key) {
        return super.get(intern_get(this, key));
      }
      has(key) {
        return super.has(intern_get(this, key));
      }
      set(key, value) {
        return super.set(intern_set(this, key), value);
      }
      delete(key) {
        return super.delete(intern_delete(this, key));
      }
    }

    class InternSet extends Set {
      constructor(values, key = keyof) {
        super();
        Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
        if (values != null) for (const value of values) this.add(value);
      }
      has(value) {
        return super.has(intern_get(this, value));
      }
      add(value) {
        return super.add(intern_set(this, value));
      }
      delete(value) {
        return super.delete(intern_delete(this, value));
      }
    }

    function intern_get({_intern, _key}, value) {
      const key = _key(value);
      return _intern.has(key) ? _intern.get(key) : value;
    }

    function intern_set({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) return _intern.get(key);
      _intern.set(key, value);
      return value;
    }

    function intern_delete({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) {
        value = _intern.get(key);
        _intern.delete(key);
      }
      return value;
    }

    function keyof(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function identity$9(x) {
      return x;
    }

    function group(values, ...keys) {
      return nest(values, identity$9, identity$9, keys);
    }

    function groups(values, ...keys) {
      return nest(values, Array.from, identity$9, keys);
    }

    function flatten$1(groups, keys) {
      for (let i = 1, n = keys.length; i < n; ++i) {
        groups = groups.flatMap(g => g.pop().map(([key, value]) => [...g, key, value]));
      }
      return groups;
    }

    function flatGroup(values, ...keys) {
      return flatten$1(groups(values, ...keys), keys);
    }

    function flatRollup(values, reduce, ...keys) {
      return flatten$1(rollups(values, reduce, ...keys), keys);
    }

    function rollup(values, reduce, ...keys) {
      return nest(values, identity$9, reduce, keys);
    }

    function rollups(values, reduce, ...keys) {
      return nest(values, Array.from, reduce, keys);
    }

    function index$4(values, ...keys) {
      return nest(values, identity$9, unique, keys);
    }

    function indexes(values, ...keys) {
      return nest(values, Array.from, unique, keys);
    }

    function unique(values) {
      if (values.length !== 1) throw new Error("duplicate key");
      return values[0];
    }

    function nest(values, map, reduce, keys) {
      return (function regroup(values, i) {
        if (i >= keys.length) return reduce(values);
        const groups = new InternMap();
        const keyof = keys[i++];
        let index = -1;
        for (const value of values) {
          const key = keyof(value, ++index, values);
          const group = groups.get(key);
          if (group) group.push(value);
          else groups.set(key, [value]);
        }
        for (const [key, values] of groups) {
          groups.set(key, regroup(values, i));
        }
        return map(groups);
      })(values, 0);
    }

    function permute(source, keys) {
      return Array.from(keys, key => source[key]);
    }

    function sort(values, ...F) {
      if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
      values = Array.from(values);
      let [f] = F;
      if ((f && f.length !== 2) || F.length > 1) {
        const index = Uint32Array.from(values, (d, i) => i);
        if (F.length > 1) {
          F = F.map(f => values.map(f));
          index.sort((i, j) => {
            for (const f of F) {
              const c = ascendingDefined(f[i], f[j]);
              if (c) return c;
            }
          });
        } else {
          f = values.map(f);
          index.sort((i, j) => ascendingDefined(f[i], f[j]));
        }
        return permute(values, index);
      }
      return values.sort(compareDefined(f));
    }

    function compareDefined(compare = ascending$3) {
      if (compare === ascending$3) return ascendingDefined;
      if (typeof compare !== "function") throw new TypeError("compare is not a function");
      return (a, b) => {
        const x = compare(a, b);
        if (x || x === 0) return x;
        return (compare(b, b) === 0) - (compare(a, a) === 0);
      };
    }

    function ascendingDefined(a, b) {
      return (a == null || !(a >= a)) - (b == null || !(b >= b)) || (a < b ? -1 : a > b ? 1 : 0);
    }

    function groupSort(values, reduce, key) {
      return (reduce.length !== 2
        ? sort(rollup(values, reduce, key), (([ak, av], [bk, bv]) => ascending$3(av, bv) || ascending$3(ak, bk)))
        : sort(group(values, key), (([ak, av], [bk, bv]) => reduce(av, bv) || ascending$3(ak, bk))))
        .map(([key]) => key);
    }

    var array$5 = Array.prototype;

    var slice$3 = array$5.slice;

    function constant$b(x) {
      return () => x;
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        let r0 = Math.round(start / step), r1 = Math.round(stop / step);
        if (r0 * step < start) ++r0;
        if (r1 * step > stop) --r1;
        ticks = new Array(n = r1 - r0 + 1);
        while (++i < n) ticks[i] = (r0 + i) * step;
      } else {
        step = -step;
        let r0 = Math.round(start * step), r1 = Math.round(stop * step);
        if (r0 / step < start) ++r0;
        if (r1 / step > stop) --r1;
        ticks = new Array(n = r1 - r0 + 1);
        while (++i < n) ticks[i] = (r0 + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function nice$1(start, stop, count) {
      let prestep;
      while (true) {
        const step = tickIncrement(start, stop, count);
        if (step === prestep || step === 0 || !isFinite(step)) {
          return [start, stop];
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        }
        prestep = step;
      }
    }

    function thresholdSturges(values) {
      return Math.ceil(Math.log(count$1(values)) / Math.LN2) + 1;
    }

    function bin() {
      var value = identity$9,
          domain = extent$1,
          threshold = thresholdSturges;

      function histogram(data) {
        if (!Array.isArray(data)) data = Array.from(data);

        var i,
            n = data.length,
            x,
            values = new Array(n);

        for (i = 0; i < n; ++i) {
          values[i] = value(data[i], i, data);
        }

        var xz = domain(values),
            x0 = xz[0],
            x1 = xz[1],
            tz = threshold(values, x0, x1);

        // Convert number of thresholds into uniform thresholds, and nice the
        // default domain accordingly.
        if (!Array.isArray(tz)) {
          const max = x1, tn = +tz;
          if (domain === extent$1) [x0, x1] = nice$1(x0, x1, tn);
          tz = ticks(x0, x1, tn);

          // If the last threshold is coincident with the domain’s upper bound, the
          // last bin will be zero-width. If the default domain is used, and this
          // last threshold is coincident with the maximum input value, we can
          // extend the niced upper bound by one tick to ensure uniform bin widths;
          // otherwise, we simply remove the last threshold. Note that we don’t
          // coerce values or the domain to numbers, and thus must be careful to
          // compare order (>=) rather than strict equality (===)!
          if (tz[tz.length - 1] >= x1) {
            if (max >= x1 && domain === extent$1) {
              const step = tickIncrement(x0, x1, tn);
              if (isFinite(step)) {
                if (step > 0) {
                  x1 = (Math.floor(x1 / step) + 1) * step;
                } else if (step < 0) {
                  x1 = (Math.ceil(x1 * -step) + 1) / -step;
                }
              }
            } else {
              tz.pop();
            }
          }
        }

        // Remove any thresholds outside the domain.
        var m = tz.length;
        while (tz[0] <= x0) tz.shift(), --m;
        while (tz[m - 1] > x1) tz.pop(), --m;

        var bins = new Array(m + 1),
            bin;

        // Initialize bins.
        for (i = 0; i <= m; ++i) {
          bin = bins[i] = [];
          bin.x0 = i > 0 ? tz[i - 1] : x0;
          bin.x1 = i < m ? tz[i] : x1;
        }

        // Assign data to bins by value, ignoring any outside the domain.
        for (i = 0; i < n; ++i) {
          x = values[i];
          if (x != null && x0 <= x && x <= x1) {
            bins[bisect(tz, x, 0, m)].push(data[i]);
          }
        }

        return bins;
      }

      histogram.value = function(_) {
        return arguments.length ? (value = typeof _ === "function" ? _ : constant$b(_), histogram) : value;
      };

      histogram.domain = function(_) {
        return arguments.length ? (domain = typeof _ === "function" ? _ : constant$b([_[0], _[1]]), histogram) : domain;
      };

      histogram.thresholds = function(_) {
        return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant$b(slice$3.call(_)) : constant$b(_), histogram) : threshold;
      };

      return histogram;
    }

    function max$3(values, valueof) {
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      }
      return max;
    }

    function min$2(values, valueof) {
      let min;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (min > value || (min === undefined && value >= value))) {
            min = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (min > value || (min === undefined && value >= value))) {
            min = value;
          }
        }
      }
      return min;
    }

    // Based on https://github.com/mourner/quickselect
    // ISC license, Copyright 2018 Vladimir Agafonkin.
    function quickselect(array, k, left = 0, right = array.length - 1, compare) {
      compare = compare === undefined ? ascendingDefined : compareDefined(compare);

      while (right > left) {
        if (right - left > 600) {
          const n = right - left + 1;
          const m = k - left + 1;
          const z = Math.log(n);
          const s = 0.5 * Math.exp(2 * z / 3);
          const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
          const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
          const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
          quickselect(array, k, newLeft, newRight, compare);
        }

        const t = array[k];
        let i = left;
        let j = right;

        swap$1(array, left, k);
        if (compare(array[right], t) > 0) swap$1(array, left, right);

        while (i < j) {
          swap$1(array, i, j), ++i, --j;
          while (compare(array[i], t) < 0) ++i;
          while (compare(array[j], t) > 0) --j;
        }

        if (compare(array[left], t) === 0) swap$1(array, left, j);
        else ++j, swap$1(array, j, right);

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
      }
      return array;
    }

    function swap$1(array, i, j) {
      const t = array[i];
      array[i] = array[j];
      array[j] = t;
    }

    function quantile$1(values, p, valueof) {
      values = Float64Array.from(numbers(values, valueof));
      if (!(n = values.length)) return;
      if ((p = +p) <= 0 || n < 2) return min$2(values);
      if (p >= 1) return max$3(values);
      var n,
          i = (n - 1) * p,
          i0 = Math.floor(i),
          value0 = max$3(quickselect(values, i0).subarray(0, i0 + 1)),
          value1 = min$2(values.subarray(i0 + 1));
      return value0 + (value1 - value0) * (i - i0);
    }

    function quantileSorted(values, p, valueof = number$3) {
      if (!(n = values.length)) return;
      if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
      if (p >= 1) return +valueof(values[n - 1], n - 1, values);
      var n,
          i = (n - 1) * p,
          i0 = Math.floor(i),
          value0 = +valueof(values[i0], i0, values),
          value1 = +valueof(values[i0 + 1], i0 + 1, values);
      return value0 + (value1 - value0) * (i - i0);
    }

    function thresholdFreedmanDiaconis(values, min, max) {
      return Math.ceil((max - min) / (2 * (quantile$1(values, 0.75) - quantile$1(values, 0.25)) * Math.pow(count$1(values), -1 / 3)));
    }

    function thresholdScott(values, min, max) {
      return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(count$1(values), -1 / 3)));
    }

    function maxIndex(values, valueof) {
      let max;
      let maxIndex = -1;
      let index = -1;
      if (valueof === undefined) {
        for (const value of values) {
          ++index;
          if (value != null
              && (max < value || (max === undefined && value >= value))) {
            max = value, maxIndex = index;
          }
        }
      } else {
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (max < value || (max === undefined && value >= value))) {
            max = value, maxIndex = index;
          }
        }
      }
      return maxIndex;
    }

    function mean(values, valueof) {
      let count = 0;
      let sum = 0;
      if (valueof === undefined) {
        for (let value of values) {
          if (value != null && (value = +value) >= value) {
            ++count, sum += value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
            ++count, sum += value;
          }
        }
      }
      if (count) return sum / count;
    }

    function median(values, valueof) {
      return quantile$1(values, 0.5, valueof);
    }

    function* flatten(arrays) {
      for (const array of arrays) {
        yield* array;
      }
    }

    function merge(arrays) {
      return Array.from(flatten(arrays));
    }

    function minIndex(values, valueof) {
      let min;
      let minIndex = -1;
      let index = -1;
      if (valueof === undefined) {
        for (const value of values) {
          ++index;
          if (value != null
              && (min > value || (min === undefined && value >= value))) {
            min = value, minIndex = index;
          }
        }
      } else {
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (min > value || (min === undefined && value >= value))) {
            min = value, minIndex = index;
          }
        }
      }
      return minIndex;
    }

    function mode(values, valueof) {
      const counts = new InternMap();
      if (valueof === undefined) {
        for (let value of values) {
          if (value != null && value >= value) {
            counts.set(value, (counts.get(value) || 0) + 1);
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null && value >= value) {
            counts.set(value, (counts.get(value) || 0) + 1);
          }
        }
      }
      let modeValue;
      let modeCount = 0;
      for (const [value, count] of counts) {
        if (count > modeCount) {
          modeCount = count;
          modeValue = value;
        }
      }
      return modeValue;
    }

    function pairs(values, pairof = pair) {
      const pairs = [];
      let previous;
      let first = false;
      for (const value of values) {
        if (first) pairs.push(pairof(previous, value));
        previous = value;
        first = true;
      }
      return pairs;
    }

    function pair(a, b) {
      return [a, b];
    }

    function range$2(start, stop, step) {
      start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

      var i = -1,
          n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
          range = new Array(n);

      while (++i < n) {
        range[i] = start + i * step;
      }

      return range;
    }

    function rank(values, valueof = ascending$3) {
      if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
      let V = Array.from(values);
      const R = new Float64Array(V.length);
      if (valueof.length !== 2) V = V.map(valueof), valueof = ascending$3;
      const compareIndex = (i, j) => valueof(V[i], V[j]);
      let k, r;
      Uint32Array
        .from(V, (_, i) => i)
        .sort(valueof === ascending$3 ? (i, j) => ascendingDefined(V[i], V[j]) : compareDefined(compareIndex))
        .forEach((j, i) => {
          const c = compareIndex(j, k === undefined ? j : k);
          if (c >= 0) {
            if (k === undefined || c > 0) k = j, r = i;
            R[j] = r;
          } else {
            R[j] = NaN;
          }
        });
      return R;
    }

    function least(values, compare = ascending$3) {
      let min;
      let defined = false;
      if (compare.length === 1) {
        let minValue;
        for (const element of values) {
          const value = compare(element);
          if (defined
              ? ascending$3(value, minValue) < 0
              : ascending$3(value, value) === 0) {
            min = element;
            minValue = value;
            defined = true;
          }
        }
      } else {
        for (const value of values) {
          if (defined
              ? compare(value, min) < 0
              : compare(value, value) === 0) {
            min = value;
            defined = true;
          }
        }
      }
      return min;
    }

    function leastIndex(values, compare = ascending$3) {
      if (compare.length === 1) return minIndex(values, compare);
      let minValue;
      let min = -1;
      let index = -1;
      for (const value of values) {
        ++index;
        if (min < 0
            ? compare(value, value) === 0
            : compare(value, minValue) < 0) {
          minValue = value;
          min = index;
        }
      }
      return min;
    }

    function greatest(values, compare = ascending$3) {
      let max;
      let defined = false;
      if (compare.length === 1) {
        let maxValue;
        for (const element of values) {
          const value = compare(element);
          if (defined
              ? ascending$3(value, maxValue) > 0
              : ascending$3(value, value) === 0) {
            max = element;
            maxValue = value;
            defined = true;
          }
        }
      } else {
        for (const value of values) {
          if (defined
              ? compare(value, max) > 0
              : compare(value, value) === 0) {
            max = value;
            defined = true;
          }
        }
      }
      return max;
    }

    function greatestIndex(values, compare = ascending$3) {
      if (compare.length === 1) return maxIndex(values, compare);
      let maxValue;
      let max = -1;
      let index = -1;
      for (const value of values) {
        ++index;
        if (max < 0
            ? compare(value, value) === 0
            : compare(value, maxValue) > 0) {
          maxValue = value;
          max = index;
        }
      }
      return max;
    }

    function scan(values, compare) {
      const index = leastIndex(values, compare);
      return index < 0 ? undefined : index;
    }

    var shuffle$1 = shuffler(Math.random);

    function shuffler(random) {
      return function shuffle(array, i0 = 0, i1 = array.length) {
        let m = i1 - (i0 = +i0);
        while (m) {
          const i = random() * m-- | 0, t = array[m + i0];
          array[m + i0] = array[i + i0];
          array[i + i0] = t;
        }
        return array;
      };
    }

    function sum$2(values, valueof) {
      let sum = 0;
      if (valueof === undefined) {
        for (let value of values) {
          if (value = +value) {
            sum += value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if (value = +valueof(value, ++index, values)) {
            sum += value;
          }
        }
      }
      return sum;
    }

    function transpose(matrix) {
      if (!(n = matrix.length)) return [];
      for (var i = -1, m = min$2(matrix, length$2), transpose = new Array(m); ++i < m;) {
        for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
          row[j] = matrix[j][i];
        }
      }
      return transpose;
    }

    function length$2(d) {
      return d.length;
    }

    function zip() {
      return transpose(arguments);
    }

    function every(values, test) {
      if (typeof test !== "function") throw new TypeError("test is not a function");
      let index = -1;
      for (const value of values) {
        if (!test(value, ++index, values)) {
          return false;
        }
      }
      return true;
    }

    function some(values, test) {
      if (typeof test !== "function") throw new TypeError("test is not a function");
      let index = -1;
      for (const value of values) {
        if (test(value, ++index, values)) {
          return true;
        }
      }
      return false;
    }

    function filter$1(values, test) {
      if (typeof test !== "function") throw new TypeError("test is not a function");
      const array = [];
      let index = -1;
      for (const value of values) {
        if (test(value, ++index, values)) {
          array.push(value);
        }
      }
      return array;
    }

    function map$1(values, mapper) {
      if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
      if (typeof mapper !== "function") throw new TypeError("mapper is not a function");
      return Array.from(values, (value, index) => mapper(value, index, values));
    }

    function reduce(values, reducer, value) {
      if (typeof reducer !== "function") throw new TypeError("reducer is not a function");
      const iterator = values[Symbol.iterator]();
      let done, next, index = -1;
      if (arguments.length < 3) {
        ({done, value} = iterator.next());
        if (done) return;
        ++index;
      }
      while (({done, value: next} = iterator.next()), !done) {
        value = reducer(value, next, ++index, values);
      }
      return value;
    }

    function reverse$1(values) {
      if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
      return Array.from(values).reverse();
    }

    function difference(values, ...others) {
      values = new InternSet(values);
      for (const other of others) {
        for (const value of other) {
          values.delete(value);
        }
      }
      return values;
    }

    function disjoint(values, other) {
      const iterator = other[Symbol.iterator](), set = new InternSet();
      for (const v of values) {
        if (set.has(v)) return false;
        let value, done;
        while (({value, done} = iterator.next())) {
          if (done) break;
          if (Object.is(v, value)) return false;
          set.add(value);
        }
      }
      return true;
    }

    function intersection(values, ...others) {
      values = new InternSet(values);
      others = others.map(set$2);
      out: for (const value of values) {
        for (const other of others) {
          if (!other.has(value)) {
            values.delete(value);
            continue out;
          }
        }
      }
      return values;
    }

    function set$2(values) {
      return values instanceof InternSet ? values : new InternSet(values);
    }

    function superset(values, other) {
      const iterator = values[Symbol.iterator](), set = new Set();
      for (const o of other) {
        const io = intern(o);
        if (set.has(io)) continue;
        let value, done;
        while (({value, done} = iterator.next())) {
          if (done) return false;
          const ivalue = intern(value);
          set.add(ivalue);
          if (Object.is(io, ivalue)) break;
        }
      }
      return true;
    }

    function intern(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function subset(values, other) {
      return superset(other, values);
    }

    function union(...others) {
      const set = new InternSet();
      for (const other of others) {
        for (const o of other) {
          set.add(o);
        }
      }
      return set;
    }

    function identity$8(x) {
      return x;
    }

    var top = 1,
        right = 2,
        bottom = 3,
        left = 4,
        epsilon$6 = 1e-6;

    function translateX(x) {
      return "translate(" + x + ",0)";
    }

    function translateY(y) {
      return "translate(0," + y + ")";
    }

    function number$2(scale) {
      return d => +scale(d);
    }

    function center$1(scale, offset) {
      offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
      if (scale.round()) offset = Math.round(offset);
      return d => +scale(d) + offset;
    }

    function entering() {
      return !this.__axis;
    }

    function axis(orient, scale) {
      var tickArguments = [],
          tickValues = null,
          tickFormat = null,
          tickSizeInner = 6,
          tickSizeOuter = 6,
          tickPadding = 3,
          offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5,
          k = orient === top || orient === left ? -1 : 1,
          x = orient === left || orient === right ? "x" : "y",
          transform = orient === top || orient === bottom ? translateX : translateY;

      function axis(context) {
        var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
            format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$8) : tickFormat,
            spacing = Math.max(tickSizeInner, 0) + tickPadding,
            range = scale.range(),
            range0 = +range[0] + offset,
            range1 = +range[range.length - 1] + offset,
            position = (scale.bandwidth ? center$1 : number$2)(scale.copy(), offset),
            selection = context.selection ? context.selection() : context,
            path = selection.selectAll(".domain").data([null]),
            tick = selection.selectAll(".tick").data(values, scale).order(),
            tickExit = tick.exit(),
            tickEnter = tick.enter().append("g").attr("class", "tick"),
            line = tick.select("line"),
            text = tick.select("text");

        path = path.merge(path.enter().insert("path", ".tick")
            .attr("class", "domain")
            .attr("stroke", "currentColor"));

        tick = tick.merge(tickEnter);

        line = line.merge(tickEnter.append("line")
            .attr("stroke", "currentColor")
            .attr(x + "2", k * tickSizeInner));

        text = text.merge(tickEnter.append("text")
            .attr("fill", "currentColor")
            .attr(x, k * spacing)
            .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

        if (context !== selection) {
          path = path.transition(context);
          tick = tick.transition(context);
          line = line.transition(context);
          text = text.transition(context);

          tickExit = tickExit.transition(context)
              .attr("opacity", epsilon$6)
              .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform"); });

          tickEnter
              .attr("opacity", epsilon$6)
              .attr("transform", function(d) { var p = this.parentNode.__axis; return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset); });
        }

        tickExit.remove();

        path
            .attr("d", orient === left || orient === right
                ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1)
                : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1));

        tick
            .attr("opacity", 1)
            .attr("transform", function(d) { return transform(position(d) + offset); });

        line
            .attr(x + "2", k * tickSizeInner);

        text
            .attr(x, k * spacing)
            .text(format);

        selection.filter(entering)
            .attr("fill", "none")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

        selection
            .each(function() { this.__axis = position; });
      }

      axis.scale = function(_) {
        return arguments.length ? (scale = _, axis) : scale;
      };

      axis.ticks = function() {
        return tickArguments = Array.from(arguments), axis;
      };

      axis.tickArguments = function(_) {
        return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis) : tickArguments.slice();
      };

      axis.tickValues = function(_) {
        return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis) : tickValues && tickValues.slice();
      };

      axis.tickFormat = function(_) {
        return arguments.length ? (tickFormat = _, axis) : tickFormat;
      };

      axis.tickSize = function(_) {
        return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
      };

      axis.tickSizeInner = function(_) {
        return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
      };

      axis.tickSizeOuter = function(_) {
        return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
      };

      axis.tickPadding = function(_) {
        return arguments.length ? (tickPadding = +_, axis) : tickPadding;
      };

      axis.offset = function(_) {
        return arguments.length ? (offset = +_, axis) : offset;
      };

      return axis;
    }

    function axisTop(scale) {
      return axis(top, scale);
    }

    function axisRight(scale) {
      return axis(right, scale);
    }

    function axisBottom(scale) {
      return axis(bottom, scale);
    }

    function axisLeft(scale) {
      return axis(left, scale);
    }

    var noop$3 = {value: () => {}};

    function dispatch() {
      for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
        if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
        _[t] = [];
      }
      return new Dispatch(_);
    }

    function Dispatch(_) {
      this._ = _;
    }

    function parseTypenames$1(typenames, types) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return {type: t, name: name};
      });
    }

    Dispatch.prototype = dispatch.prototype = {
      constructor: Dispatch,
      on: function(typename, callback) {
        var _ = this._,
            T = parseTypenames$1(typename + "", _),
            t,
            i = -1,
            n = T.length;

        // If no callback was specified, return the callback of the given type and name.
        if (arguments.length < 2) {
          while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
          return;
        }

        // If a type was specified, set the callback for the given type and name.
        // Otherwise, if a null callback was specified, remove callbacks of the given name.
        if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
        while (++i < n) {
          if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
          else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
        }

        return this;
      },
      copy: function() {
        var copy = {}, _ = this._;
        for (var t in _) copy[t] = _[t].slice();
        return new Dispatch(copy);
      },
      call: function(type, that) {
        if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      },
      apply: function(type, that, args) {
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      }
    };

    function get$1(type, name) {
      for (var i = 0, n = type.length, c; i < n; ++i) {
        if ((c = type[i]).name === name) {
          return c.value;
        }
      }
    }

    function set$1(type, name, callback) {
      for (var i = 0, n = type.length; i < n; ++i) {
        if (type[i].name === name) {
          type[i] = noop$3, type = type.slice(0, i).concat(type.slice(i + 1));
          break;
        }
      }
      if (callback != null) type.push({name: name, value: callback});
      return type;
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none$2() {}

    function selector(selector) {
      return selector == null ? none$2 : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection$1(subgroups, this._parents);
    }

    // Given something array like (or null), returns something that is strictly an
    // array. This is used to ensure that array-like objects passed to d3.selectAll
    // or selection.selectAll are converted into proper arrays when creating a
    // selection; we don’t ever want to create a selection backed by a live
    // HTMLCollection or NodeList. However, note that selection.selectAll will use a
    // static NodeList as a group, since it safely derived from querySelectorAll.
    function array$4(x) {
      return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
    }

    function empty$1() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty$1 : function() {
        return this.querySelectorAll(selector);
      };
    }

    function arrayAll(select) {
      return function() {
        return array$4(select.apply(this, arguments));
      };
    }

    function selection_selectAll(select) {
      if (typeof select === "function") select = arrayAll(select);
      else select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection$1(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function childMatcher(selector) {
      return function(node) {
        return node.matches(selector);
      };
    }

    var find$1 = Array.prototype.find;

    function childFind(match) {
      return function() {
        return find$1.call(this.children, match);
      };
    }

    function childFirst() {
      return this.firstElementChild;
    }

    function selection_selectChild(match) {
      return this.select(match == null ? childFirst
          : childFind(typeof match === "function" ? match : childMatcher(match)));
    }

    var filter = Array.prototype.filter;

    function children() {
      return Array.from(this.children);
    }

    function childrenFilter(match) {
      return function() {
        return filter.call(this.children, match);
      };
    }

    function selection_selectChildren(match) {
      return this.selectAll(match == null ? children
          : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection$1(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant$a(x) {
      return function() {
        return x;
      };
    }

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = new Map,
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
          if (nodeByKeyValue.has(keyValue)) {
            exit[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = key.call(parent, data[i], i, data) + "";
        if (node = nodeByKeyValue.get(keyValue)) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue.delete(keyValue);
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
          exit[i] = node;
        }
      }
    }

    function datum(node) {
      return node.__data__;
    }

    function selection_data(value, key) {
      if (!arguments.length) return Array.from(this, datum);

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant$a(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection$1(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    // Given some data, this returns an array-like view of it: an object that
    // exposes a length property and allows numeric indexing. Note that unlike
    // selectAll, this isn’t worried about “live” collections because the resulting
    // array will only be used briefly while data is being bound. (It is possible to
    // cause the data to change while iterating by using a key function, but please
    // don’t; we’d rather avoid a gratuitous copy.)
    function arraylike(data) {
      return typeof data === "object" && "length" in data
        ? data // Array, TypedArray, NodeList, array-like
        : Array.from(data); // Map, Set, iterable, string, or anything else
    }

    function selection_exit() {
      return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      if (typeof onenter === "function") {
        enter = onenter(enter);
        if (enter) enter = enter.selection();
      } else {
        enter = enter.append(onenter + "");
      }
      if (onupdate != null) {
        update = onupdate(update);
        if (update) update = update.selection();
      }
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(context) {
      var selection = context.selection ? context.selection() : context;

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection$1(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending$2;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection$1(sortgroups, this._parents).order();
    }

    function ascending$2(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      return Array.from(this);
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      let size = 0;
      for (const node of this) ++size; // eslint-disable-line no-unused-vars
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove$1(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS$1(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant$1(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS$1(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction$1(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS$1(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
          : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove$1(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant$1(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction$1(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove$1 : typeof value === "function"
                ? styleFunction$1
                : styleConstant$1)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant$1(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction$1(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction$1
              : textConstant$1)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      var clone = this.cloneNode(false), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_cloneDeep() {
      var clone = this.cloneNode(true), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    function contextListener(listener) {
      return function(event) {
        listener.call(this, event, this.__data__);
      };
    }

    function parseTypenames(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, options) {
      return function() {
        var on = this.__on, o, listener = contextListener(value);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
            this.addEventListener(o.type, o.listener = listener, o.options = options);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, options);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, options) {
      var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
      return this;
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    function* selection_iterator() {
      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) yield node;
        }
      }
    }

    var root$1 = [null];

    function Selection$1(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection$1([[document.documentElement]], root$1);
    }

    function selection_selection() {
      return this;
    }

    Selection$1.prototype = selection.prototype = {
      constructor: Selection$1,
      select: selection_select,
      selectAll: selection_selectAll,
      selectChild: selection_selectChild,
      selectChildren: selection_selectChildren,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      selection: selection_selection,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch,
      [Symbol.iterator]: selection_iterator
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
          : new Selection$1([[selector]], root$1);
    }

    function create$1(name) {
      return select(creator(name).call(document.documentElement));
    }

    var nextId = 0;

    function local$1() {
      return new Local;
    }

    function Local() {
      this._ = "@" + (++nextId).toString(36);
    }

    Local.prototype = local$1.prototype = {
      constructor: Local,
      get: function(node) {
        var id = this._;
        while (!(id in node)) if (!(node = node.parentNode)) return;
        return node[id];
      },
      set: function(node, value) {
        return node[this._] = value;
      },
      remove: function(node) {
        return this._ in node && delete node[this._];
      },
      toString: function() {
        return this._;
      }
    };

    function sourceEvent(event) {
      let sourceEvent;
      while (sourceEvent = event.sourceEvent) event = sourceEvent;
      return event;
    }

    function pointer(event, node) {
      event = sourceEvent(event);
      if (node === undefined) node = event.currentTarget;
      if (node) {
        var svg = node.ownerSVGElement || node;
        if (svg.createSVGPoint) {
          var point = svg.createSVGPoint();
          point.x = event.clientX, point.y = event.clientY;
          point = point.matrixTransform(node.getScreenCTM().inverse());
          return [point.x, point.y];
        }
        if (node.getBoundingClientRect) {
          var rect = node.getBoundingClientRect();
          return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
        }
      }
      return [event.pageX, event.pageY];
    }

    function pointers(events, node) {
      if (events.target) { // i.e., instanceof Event, not TouchList or iterable
        events = sourceEvent(events);
        if (node === undefined) node = events.currentTarget;
        events = events.touches || [events];
      }
      return Array.from(events, event => pointer(event, node));
    }

    function selectAll(selector) {
      return typeof selector === "string"
          ? new Selection$1([document.querySelectorAll(selector)], [document.documentElement])
          : new Selection$1([array$4(selector)], root$1);
    }

    // These are typically used in conjunction with noevent to ensure that we can
    // preventDefault on the event.
    const nonpassive = {passive: false};
    const nonpassivecapture = {capture: true, passive: false};

    function nopropagation$2(event) {
      event.stopImmediatePropagation();
    }

    function noevent$2(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function dragDisable(view) {
      var root = view.document.documentElement,
          selection = select(view).on("dragstart.drag", noevent$2, nonpassivecapture);
      if ("onselectstart" in root) {
        selection.on("selectstart.drag", noevent$2, nonpassivecapture);
      } else {
        root.__noselect = root.style.MozUserSelect;
        root.style.MozUserSelect = "none";
      }
    }

    function yesdrag(view, noclick) {
      var root = view.document.documentElement,
          selection = select(view).on("dragstart.drag", null);
      if (noclick) {
        selection.on("click.drag", noevent$2, nonpassivecapture);
        setTimeout(function() { selection.on("click.drag", null); }, 0);
      }
      if ("onselectstart" in root) {
        selection.on("selectstart.drag", null);
      } else {
        root.style.MozUserSelect = root.__noselect;
        delete root.__noselect;
      }
    }

    var constant$9 = x => () => x;

    function DragEvent(type, {
      sourceEvent,
      subject,
      target,
      identifier,
      active,
      x, y, dx, dy,
      dispatch
    }) {
      Object.defineProperties(this, {
        type: {value: type, enumerable: true, configurable: true},
        sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
        subject: {value: subject, enumerable: true, configurable: true},
        target: {value: target, enumerable: true, configurable: true},
        identifier: {value: identifier, enumerable: true, configurable: true},
        active: {value: active, enumerable: true, configurable: true},
        x: {value: x, enumerable: true, configurable: true},
        y: {value: y, enumerable: true, configurable: true},
        dx: {value: dx, enumerable: true, configurable: true},
        dy: {value: dy, enumerable: true, configurable: true},
        _: {value: dispatch}
      });
    }

    DragEvent.prototype.on = function() {
      var value = this._.on.apply(this._, arguments);
      return value === this._ ? this : value;
    };

    // Ignore right-click, since that should open the context menu.
    function defaultFilter$2(event) {
      return !event.ctrlKey && !event.button;
    }

    function defaultContainer() {
      return this.parentNode;
    }

    function defaultSubject(event, d) {
      return d == null ? {x: event.x, y: event.y} : d;
    }

    function defaultTouchable$2() {
      return navigator.maxTouchPoints || ("ontouchstart" in this);
    }

    function drag() {
      var filter = defaultFilter$2,
          container = defaultContainer,
          subject = defaultSubject,
          touchable = defaultTouchable$2,
          gestures = {},
          listeners = dispatch("start", "drag", "end"),
          active = 0,
          mousedownx,
          mousedowny,
          mousemoving,
          touchending,
          clickDistance2 = 0;

      function drag(selection) {
        selection
            .on("mousedown.drag", mousedowned)
          .filter(touchable)
            .on("touchstart.drag", touchstarted)
            .on("touchmove.drag", touchmoved, nonpassive)
            .on("touchend.drag touchcancel.drag", touchended)
            .style("touch-action", "none")
            .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
      }

      function mousedowned(event, d) {
        if (touchending || !filter.call(this, event, d)) return;
        var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
        if (!gesture) return;
        select(event.view)
          .on("mousemove.drag", mousemoved, nonpassivecapture)
          .on("mouseup.drag", mouseupped, nonpassivecapture);
        dragDisable(event.view);
        nopropagation$2(event);
        mousemoving = false;
        mousedownx = event.clientX;
        mousedowny = event.clientY;
        gesture("start", event);
      }

      function mousemoved(event) {
        noevent$2(event);
        if (!mousemoving) {
          var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
          mousemoving = dx * dx + dy * dy > clickDistance2;
        }
        gestures.mouse("drag", event);
      }

      function mouseupped(event) {
        select(event.view).on("mousemove.drag mouseup.drag", null);
        yesdrag(event.view, mousemoving);
        noevent$2(event);
        gestures.mouse("end", event);
      }

      function touchstarted(event, d) {
        if (!filter.call(this, event, d)) return;
        var touches = event.changedTouches,
            c = container.call(this, event, d),
            n = touches.length, i, gesture;

        for (i = 0; i < n; ++i) {
          if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
            nopropagation$2(event);
            gesture("start", event, touches[i]);
          }
        }
      }

      function touchmoved(event) {
        var touches = event.changedTouches,
            n = touches.length, i, gesture;

        for (i = 0; i < n; ++i) {
          if (gesture = gestures[touches[i].identifier]) {
            noevent$2(event);
            gesture("drag", event, touches[i]);
          }
        }
      }

      function touchended(event) {
        var touches = event.changedTouches,
            n = touches.length, i, gesture;

        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
        for (i = 0; i < n; ++i) {
          if (gesture = gestures[touches[i].identifier]) {
            nopropagation$2(event);
            gesture("end", event, touches[i]);
          }
        }
      }

      function beforestart(that, container, event, d, identifier, touch) {
        var dispatch = listeners.copy(),
            p = pointer(touch || event, container), dx, dy,
            s;

        if ((s = subject.call(that, new DragEvent("beforestart", {
            sourceEvent: event,
            target: drag,
            identifier,
            active,
            x: p[0],
            y: p[1],
            dx: 0,
            dy: 0,
            dispatch
          }), d)) == null) return;

        dx = s.x - p[0] || 0;
        dy = s.y - p[1] || 0;

        return function gesture(type, event, touch) {
          var p0 = p, n;
          switch (type) {
            case "start": gestures[identifier] = gesture, n = active++; break;
            case "end": delete gestures[identifier], --active; // falls through
            case "drag": p = pointer(touch || event, container), n = active; break;
          }
          dispatch.call(
            type,
            that,
            new DragEvent(type, {
              sourceEvent: event,
              subject: s,
              target: drag,
              identifier,
              active: n,
              x: p[0] + dx,
              y: p[1] + dy,
              dx: p[0] - p0[0],
              dy: p[1] - p0[1],
              dispatch
            }),
            d
          );
        };
      }

      drag.filter = function(_) {
        return arguments.length ? (filter = typeof _ === "function" ? _ : constant$9(!!_), drag) : filter;
      };

      drag.container = function(_) {
        return arguments.length ? (container = typeof _ === "function" ? _ : constant$9(_), drag) : container;
      };

      drag.subject = function(_) {
        return arguments.length ? (subject = typeof _ === "function" ? _ : constant$9(_), drag) : subject;
      };

      drag.touchable = function(_) {
        return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$9(!!_), drag) : touchable;
      };

      drag.on = function() {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? drag : value;
      };

      drag.clickDistance = function(_) {
        return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
      };

      return drag;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl$2(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl$2, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    const radians$1 = Math.PI / 180;
    const degrees$2 = 180 / Math.PI;

    // https://observablehq.com/@mbostock/lab-and-rgb
    const K = 18,
        Xn = 0.96422,
        Yn = 1,
        Zn = 0.82521,
        t0$1 = 4 / 29,
        t1$1 = 6 / 29,
        t2 = 3 * t1$1 * t1$1,
        t3 = t1$1 * t1$1 * t1$1;

    function labConvert(o) {
      if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
      if (o instanceof Hcl) return hcl2lab(o);
      if (!(o instanceof Rgb)) o = rgbConvert(o);
      var r = rgb2lrgb(o.r),
          g = rgb2lrgb(o.g),
          b = rgb2lrgb(o.b),
          y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
      if (r === g && g === b) x = z = y; else {
        x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
        z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
      }
      return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
    }

    function gray(l, opacity) {
      return new Lab(l, 0, 0, opacity == null ? 1 : opacity);
    }

    function lab$1(l, a, b, opacity) {
      return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
    }

    function Lab(l, a, b, opacity) {
      this.l = +l;
      this.a = +a;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Lab, lab$1, extend(Color, {
      brighter: function(k) {
        return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      darker: function(k) {
        return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      rgb: function() {
        var y = (this.l + 16) / 116,
            x = isNaN(this.a) ? y : y + this.a / 500,
            z = isNaN(this.b) ? y : y - this.b / 200;
        x = Xn * lab2xyz(x);
        y = Yn * lab2xyz(y);
        z = Zn * lab2xyz(z);
        return new Rgb(
          lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
          lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
          lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
          this.opacity
        );
      }
    }));

    function xyz2lab(t) {
      return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0$1;
    }

    function lab2xyz(t) {
      return t > t1$1 ? t * t * t : t2 * (t - t0$1);
    }

    function lrgb2rgb(x) {
      return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    }

    function rgb2lrgb(x) {
      return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }

    function hclConvert(o) {
      if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
      if (!(o instanceof Lab)) o = labConvert(o);
      if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
      var h = Math.atan2(o.b, o.a) * degrees$2;
      return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
    }

    function lch(l, c, h, opacity) {
      return arguments.length === 1 ? hclConvert(l) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
    }

    function hcl$2(h, c, l, opacity) {
      return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
    }

    function Hcl(h, c, l, opacity) {
      this.h = +h;
      this.c = +c;
      this.l = +l;
      this.opacity = +opacity;
    }

    function hcl2lab(o) {
      if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
      var h = o.h * radians$1;
      return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
    }

    define(Hcl, hcl$2, extend(Color, {
      brighter: function(k) {
        return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
      },
      darker: function(k) {
        return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
      },
      rgb: function() {
        return hcl2lab(this).rgb();
      }
    }));

    var A = -0.14861,
        B$1 = +1.78277,
        C = -0.29227,
        D$1 = -0.90649,
        E = +1.97294,
        ED = E * D$1,
        EB = E * B$1,
        BC_DA = B$1 * C - D$1 * A;

    function cubehelixConvert(o) {
      if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Rgb)) o = rgbConvert(o);
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
          bl = b - l,
          k = (E * (g - l) - C * bl) / D$1,
          s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
          h = s ? Math.atan2(k, bl) * degrees$2 - 120 : NaN;
      return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
    }

    function cubehelix$3(h, s, l, opacity) {
      return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
    }

    function Cubehelix(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Cubehelix, cubehelix$3, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = isNaN(this.h) ? 0 : (this.h + 120) * radians$1,
            l = +this.l,
            a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
            cosh = Math.cos(h),
            sinh = Math.sin(h);
        return new Rgb(
          255 * (l + a * (A * cosh + B$1 * sinh)),
          255 * (l + a * (C * cosh + D$1 * sinh)),
          255 * (l + a * (E * cosh)),
          this.opacity
        );
      }
    }));

    function basis$1(t1, v0, v1, v2, v3) {
      var t2 = t1 * t1, t3 = t2 * t1;
      return ((1 - 3 * t1 + 3 * t2 - t3) * v0
          + (4 - 6 * t2 + 3 * t3) * v1
          + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
          + t3 * v3) / 6;
    }

    function basis$2(values) {
      var n = values.length - 1;
      return function(t) {
        var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
            v1 = values[i],
            v2 = values[i + 1],
            v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
            v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
        return basis$1((t - i / n) * n, v0, v1, v2, v3);
      };
    }

    function basisClosed$1(values) {
      var n = values.length;
      return function(t) {
        var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
            v0 = values[(i + n - 1) % n],
            v1 = values[i % n],
            v2 = values[(i + 1) % n],
            v3 = values[(i + 2) % n];
        return basis$1((t - i / n) * n, v0, v1, v2, v3);
      };
    }

    var constant$8 = x => () => x;

    function linear$2(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential$1(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function hue$1(a, b) {
      var d = b - a;
      return d ? linear$2(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$8(isNaN(a) ? b : a);
    }

    function gamma$1(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential$1(a, b, y) : constant$8(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear$2(a, d) : constant$8(isNaN(a) ? b : a);
    }

    var interpolateRgb = (function rgbGamma(y) {
      var color = gamma$1(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function rgbSpline(spline) {
      return function(colors) {
        var n = colors.length,
            r = new Array(n),
            g = new Array(n),
            b = new Array(n),
            i, color;
        for (i = 0; i < n; ++i) {
          color = rgb(colors[i]);
          r[i] = color.r || 0;
          g[i] = color.g || 0;
          b[i] = color.b || 0;
        }
        r = spline(r);
        g = spline(g);
        b = spline(b);
        color.opacity = 1;
        return function(t) {
          color.r = r(t);
          color.g = g(t);
          color.b = b(t);
          return color + "";
        };
      };
    }

    var rgbBasis = rgbSpline(basis$2);
    var rgbBasisClosed = rgbSpline(basisClosed$1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function array$3(a, b) {
      return (isNumberArray(b) ? numberArray : genericArray)(a, b);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate$2(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date$1(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object$1(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate$2(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function interpolateString(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate$2(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$8(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
          : b instanceof color ? interpolateRgb
          : b instanceof Date ? date$1
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object$1
          : interpolateNumber)(a, b);
    }

    function discrete(range) {
      var n = range.length;
      return function(t) {
        return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
      };
    }

    function hue(a, b) {
      var i = hue$1(+a, +b);
      return function(t) {
        var x = i(t);
        return x - 360 * Math.floor(x / 360);
      };
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    var degrees$1 = 180 / Math.PI;

    var identity$7 = {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      scaleY: 1
    };

    function decompose(a, b, c, d, e, f) {
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * degrees$1,
        skewX: Math.atan(skewX) * degrees$1,
        scaleX: scaleX,
        scaleY: scaleY
      };
    }

    var svgNode;

    /* eslint-disable no-undef */
    function parseCss(value) {
      const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
      return m.isIdentity ? identity$7 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
    }

    function parseSvg(value) {
      if (value == null) return identity$7;
      if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svgNode.setAttribute("transform", value);
      if (!(value = svgNode.transform.baseVal.consolidate())) return identity$7;
      value = value.matrix;
      return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
    }

    function interpolateTransform(parse, pxComma, pxParen, degParen) {

      function pop(s) {
        return s.length ? s.pop() + " " : "";
      }

      function translate(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push("translate(", null, pxComma, null, pxParen);
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb || yb) {
          s.push("translate(" + xb + pxComma + yb + pxParen);
        }
      }

      function rotate(a, b, s, q) {
        if (a !== b) {
          if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
          q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "rotate(" + b + degParen);
        }
      }

      function skewX(a, b, s, q) {
        if (a !== b) {
          q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "skewX(" + b + degParen);
        }
      }

      function scale(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push(pop(s) + "scale(", null, ",", null, ")");
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb !== 1 || yb !== 1) {
          s.push(pop(s) + "scale(" + xb + "," + yb + ")");
        }
      }

      return function(a, b) {
        var s = [], // string constants and placeholders
            q = []; // number interpolators
        a = parse(a), b = parse(b);
        translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
        rotate(a.rotate, b.rotate, s, q);
        skewX(a.skewX, b.skewX, s, q);
        scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
        a = b = null; // gc
        return function(t) {
          var i = -1, n = q.length, o;
          while (++i < n) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        };
      };
    }

    var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

    var epsilon2$1 = 1e-12;

    function cosh(x) {
      return ((x = Math.exp(x)) + 1 / x) / 2;
    }

    function sinh(x) {
      return ((x = Math.exp(x)) - 1 / x) / 2;
    }

    function tanh(x) {
      return ((x = Math.exp(2 * x)) - 1) / (x + 1);
    }

    var interpolateZoom = (function zoomRho(rho, rho2, rho4) {

      // p0 = [ux0, uy0, w0]
      // p1 = [ux1, uy1, w1]
      function zoom(p0, p1) {
        var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
            ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
            dx = ux1 - ux0,
            dy = uy1 - uy0,
            d2 = dx * dx + dy * dy,
            i,
            S;

        // Special case for u0 ≅ u1.
        if (d2 < epsilon2$1) {
          S = Math.log(w1 / w0) / rho;
          i = function(t) {
            return [
              ux0 + t * dx,
              uy0 + t * dy,
              w0 * Math.exp(rho * t * S)
            ];
          };
        }

        // General case.
        else {
          var d1 = Math.sqrt(d2),
              b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
              b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
              r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
              r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
          S = (r1 - r0) / rho;
          i = function(t) {
            var s = t * S,
                coshr0 = cosh(r0),
                u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
            return [
              ux0 + u * dx,
              uy0 + u * dy,
              w0 * coshr0 / cosh(rho * s + r0)
            ];
          };
        }

        i.duration = S * 1000 * rho / Math.SQRT2;

        return i;
      }

      zoom.rho = function(_) {
        var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
        return zoomRho(_1, _2, _4);
      };

      return zoom;
    })(Math.SQRT2, 2, 4);

    function hsl(hue) {
      return function(start, end) {
        var h = hue((start = hsl$2(start)).h, (end = hsl$2(end)).h),
            s = nogamma(start.s, end.s),
            l = nogamma(start.l, end.l),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.h = h(t);
          start.s = s(t);
          start.l = l(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }
    }

    var hsl$1 = hsl(hue$1);
    var hslLong = hsl(nogamma);

    function lab(start, end) {
      var l = nogamma((start = lab$1(start)).l, (end = lab$1(end)).l),
          a = nogamma(start.a, end.a),
          b = nogamma(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.l = l(t);
        start.a = a(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    function hcl(hue) {
      return function(start, end) {
        var h = hue((start = hcl$2(start)).h, (end = hcl$2(end)).h),
            c = nogamma(start.c, end.c),
            l = nogamma(start.l, end.l),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.h = h(t);
          start.c = c(t);
          start.l = l(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }
    }

    var hcl$1 = hcl(hue$1);
    var hclLong = hcl(nogamma);

    function cubehelix$1(hue) {
      return (function cubehelixGamma(y) {
        y = +y;

        function cubehelix(start, end) {
          var h = hue((start = cubehelix$3(start)).h, (end = cubehelix$3(end)).h),
              s = nogamma(start.s, end.s),
              l = nogamma(start.l, end.l),
              opacity = nogamma(start.opacity, end.opacity);
          return function(t) {
            start.h = h(t);
            start.s = s(t);
            start.l = l(Math.pow(t, y));
            start.opacity = opacity(t);
            return start + "";
          };
        }

        cubehelix.gamma = cubehelixGamma;

        return cubehelix;
      })(1);
    }

    var cubehelix$2 = cubehelix$1(hue$1);
    var cubehelixLong = cubehelix$1(nogamma);

    function piecewise(interpolate, values) {
      if (values === undefined) values = interpolate, interpolate = interpolate$2;
      var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
      while (i < n) I[i] = interpolate(v, v = values[++i]);
      return function(t) {
        var i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
        return I[i](t - i);
      };
    }

    function quantize$1(interpolator, n) {
      var samples = new Array(n);
      for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
      return samples;
    }

    var frame = 0, // is an animation frame pending?
        timeout$1 = 0, // is a timeout pending?
        interval$1 = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

    function now$1() {
      return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
      clockNow = 0;
    }

    function Timer() {
      this._call =
      this._time =
      this._next = null;
    }

    Timer.prototype = timer.prototype = {
      constructor: Timer,
      restart: function(callback, delay, time) {
        if (typeof callback !== "function") throw new TypeError("callback is not a function");
        time = (time == null ? now$1() : +time) + (delay == null ? 0 : +delay);
        if (!this._next && taskTail !== this) {
          if (taskTail) taskTail._next = this;
          else taskHead = this;
          taskTail = this;
        }
        this._call = callback;
        this._time = time;
        sleep();
      },
      stop: function() {
        if (this._call) {
          this._call = null;
          this._time = Infinity;
          sleep();
        }
      }
    };

    function timer(callback, delay, time) {
      var t = new Timer;
      t.restart(callback, delay, time);
      return t;
    }

    function timerFlush() {
      now$1(); // Get the current time, if not already set.
      ++frame; // Pretend we’ve set an alarm, if we haven’t already.
      var t = taskHead, e;
      while (t) {
        if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
        t = t._next;
      }
      --frame;
    }

    function wake() {
      clockNow = (clockLast = clock.now()) + clockSkew;
      frame = timeout$1 = 0;
      try {
        timerFlush();
      } finally {
        frame = 0;
        nap();
        clockNow = 0;
      }
    }

    function poke() {
      var now = clock.now(), delay = now - clockLast;
      if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
      var t0, t1 = taskHead, t2, time = Infinity;
      while (t1) {
        if (t1._call) {
          if (time > t1._time) time = t1._time;
          t0 = t1, t1 = t1._next;
        } else {
          t2 = t1._next, t1._next = null;
          t1 = t0 ? t0._next = t2 : taskHead = t2;
        }
      }
      taskTail = t0;
      sleep(time);
    }

    function sleep(time) {
      if (frame) return; // Soonest alarm already set, or will be.
      if (timeout$1) timeout$1 = clearTimeout(timeout$1);
      var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
      if (delay > 24) {
        if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
        if (interval$1) interval$1 = clearInterval(interval$1);
      } else {
        if (!interval$1) clockLast = clock.now(), interval$1 = setInterval(poke, pokeDelay);
        frame = 1, setFrame(wake);
      }
    }

    function timeout(callback, delay, time) {
      var t = new Timer;
      delay = delay == null ? 0 : +delay;
      t.restart(elapsed => {
        t.stop();
        callback(elapsed + delay);
      }, delay, time);
      return t;
    }

    function interval(callback, delay, time) {
      var t = new Timer, total = delay;
      if (delay == null) return t.restart(callback, delay, time), t;
      t._restart = t.restart;
      t.restart = function(callback, delay, time) {
        delay = +delay, time = time == null ? now$1() : +time;
        t._restart(function tick(elapsed) {
          elapsed += total;
          t._restart(tick, total += delay, time);
          callback(elapsed);
        }, delay, time);
      };
      t.restart(callback, delay, time);
      return t;
    }

    var emptyOn = dispatch("start", "end", "cancel", "interrupt");
    var emptyTween = [];

    var CREATED = 0;
    var SCHEDULED = 1;
    var STARTING = 2;
    var STARTED = 3;
    var RUNNING = 4;
    var ENDING = 5;
    var ENDED = 6;

    function schedule(node, name, id, index, group, timing) {
      var schedules = node.__transition;
      if (!schedules) node.__transition = {};
      else if (id in schedules) return;
      create(node, id, {
        name: name,
        index: index, // For context during callback.
        group: group, // For context during callback.
        on: emptyOn,
        tween: emptyTween,
        time: timing.time,
        delay: timing.delay,
        duration: timing.duration,
        ease: timing.ease,
        timer: null,
        state: CREATED
      });
    }

    function init(node, id) {
      var schedule = get(node, id);
      if (schedule.state > CREATED) throw new Error("too late; already scheduled");
      return schedule;
    }

    function set(node, id) {
      var schedule = get(node, id);
      if (schedule.state > STARTED) throw new Error("too late; already running");
      return schedule;
    }

    function get(node, id) {
      var schedule = node.__transition;
      if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
      return schedule;
    }

    function create(node, id, self) {
      var schedules = node.__transition,
          tween;

      // Initialize the self timer when the transition is created.
      // Note the actual delay is not known until the first callback!
      schedules[id] = self;
      self.timer = timer(schedule, 0, self.time);

      function schedule(elapsed) {
        self.state = SCHEDULED;
        self.timer.restart(start, self.delay, self.time);

        // If the elapsed delay is less than our first sleep, start immediately.
        if (self.delay <= elapsed) start(elapsed - self.delay);
      }

      function start(elapsed) {
        var i, j, n, o;

        // If the state is not SCHEDULED, then we previously errored on start.
        if (self.state !== SCHEDULED) return stop();

        for (i in schedules) {
          o = schedules[i];
          if (o.name !== self.name) continue;

          // While this element already has a starting transition during this frame,
          // defer starting an interrupting transition until that transition has a
          // chance to tick (and possibly end); see d3/d3-transition#54!
          if (o.state === STARTED) return timeout(start);

          // Interrupt the active transition, if any.
          if (o.state === RUNNING) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("interrupt", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }

          // Cancel any pre-empted transitions.
          else if (+i < id) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("cancel", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }
        }

        // Defer the first tick to end of the current frame; see d3/d3#1576.
        // Note the transition may be canceled after start and before the first tick!
        // Note this must be scheduled before the start event; see d3/d3-transition#16!
        // Assuming this is successful, subsequent callbacks go straight to tick.
        timeout(function() {
          if (self.state === STARTED) {
            self.state = RUNNING;
            self.timer.restart(tick, self.delay, self.time);
            tick(elapsed);
          }
        });

        // Dispatch the start event.
        // Note this must be done before the tween are initialized.
        self.state = STARTING;
        self.on.call("start", node, node.__data__, self.index, self.group);
        if (self.state !== STARTING) return; // interrupted
        self.state = STARTED;

        // Initialize the tween, deleting null tween.
        tween = new Array(n = self.tween.length);
        for (i = 0, j = -1; i < n; ++i) {
          if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
            tween[++j] = o;
          }
        }
        tween.length = j + 1;
      }

      function tick(elapsed) {
        var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
            i = -1,
            n = tween.length;

        while (++i < n) {
          tween[i].call(node, t);
        }

        // Dispatch the end event.
        if (self.state === ENDING) {
          self.on.call("end", node, node.__data__, self.index, self.group);
          stop();
        }
      }

      function stop() {
        self.state = ENDED;
        self.timer.stop();
        delete schedules[id];
        for (var i in schedules) return; // eslint-disable-line no-unused-vars
        delete node.__transition;
      }
    }

    function interrupt(node, name) {
      var schedules = node.__transition,
          schedule,
          active,
          empty = true,
          i;

      if (!schedules) return;

      name = name == null ? null : name + "";

      for (i in schedules) {
        if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
        active = schedule.state > STARTING && schedule.state < ENDING;
        schedule.state = ENDED;
        schedule.timer.stop();
        schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
        delete schedules[i];
      }

      if (empty) delete node.__transition;
    }

    function selection_interrupt(name) {
      return this.each(function() {
        interrupt(this, name);
      });
    }

    function tweenRemove(id, name) {
      var tween0, tween1;
      return function() {
        var schedule = set(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = tween0 = tween;
          for (var i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1 = tween1.slice();
              tween1.splice(i, 1);
              break;
            }
          }
        }

        schedule.tween = tween1;
      };
    }

    function tweenFunction(id, name, value) {
      var tween0, tween1;
      if (typeof value !== "function") throw new Error;
      return function() {
        var schedule = set(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = (tween0 = tween).slice();
          for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1[i] = t;
              break;
            }
          }
          if (i === n) tween1.push(t);
        }

        schedule.tween = tween1;
      };
    }

    function transition_tween(name, value) {
      var id = this._id;

      name += "";

      if (arguments.length < 2) {
        var tween = get(this.node(), id).tween;
        for (var i = 0, n = tween.length, t; i < n; ++i) {
          if ((t = tween[i]).name === name) {
            return t.value;
          }
        }
        return null;
      }

      return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
    }

    function tweenValue(transition, name, value) {
      var id = transition._id;

      transition.each(function() {
        var schedule = set(this, id);
        (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
      });

      return function(node) {
        return get(node, id).value[name];
      };
    }

    function interpolate$1(a, b) {
      var c;
      return (typeof b === "number" ? interpolateNumber
          : b instanceof color ? interpolateRgb
          : (c = color(b)) ? (b = c, interpolateRgb)
          : interpolateString)(a, b);
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttribute(name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrConstantNS(fullname, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttributeNS(fullname.space, fullname.local);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrFunction(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttribute(name);
        string0 = this.getAttribute(name);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function attrFunctionNS(fullname, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
        string0 = this.getAttributeNS(fullname.space, fullname.local);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function transition_attr(name, value) {
      var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate$1;
      return this.attrTween(name, typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
          : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
          : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
    }

    function attrInterpolate(name, i) {
      return function(t) {
        this.setAttribute(name, i.call(this, t));
      };
    }

    function attrInterpolateNS(fullname, i) {
      return function(t) {
        this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
      };
    }

    function attrTweenNS(fullname, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function attrTween(name, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_attrTween(name, value) {
      var key = "attr." + name;
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      var fullname = namespace(name);
      return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
    }

    function delayFunction(id, value) {
      return function() {
        init(this, id).delay = +value.apply(this, arguments);
      };
    }

    function delayConstant(id, value) {
      return value = +value, function() {
        init(this, id).delay = value;
      };
    }

    function transition_delay(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? delayFunction
              : delayConstant)(id, value))
          : get(this.node(), id).delay;
    }

    function durationFunction(id, value) {
      return function() {
        set(this, id).duration = +value.apply(this, arguments);
      };
    }

    function durationConstant(id, value) {
      return value = +value, function() {
        set(this, id).duration = value;
      };
    }

    function transition_duration(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? durationFunction
              : durationConstant)(id, value))
          : get(this.node(), id).duration;
    }

    function easeConstant(id, value) {
      if (typeof value !== "function") throw new Error;
      return function() {
        set(this, id).ease = value;
      };
    }

    function transition_ease(value) {
      var id = this._id;

      return arguments.length
          ? this.each(easeConstant(id, value))
          : get(this.node(), id).ease;
    }

    function easeVarying(id, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (typeof v !== "function") throw new Error;
        set(this, id).ease = v;
      };
    }

    function transition_easeVarying(value) {
      if (typeof value !== "function") throw new Error;
      return this.each(easeVarying(this._id, value));
    }

    function transition_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Transition(subgroups, this._parents, this._name, this._id);
    }

    function transition_merge(transition) {
      if (transition._id !== this._id) throw new Error;

      for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Transition(merges, this._parents, this._name, this._id);
    }

    function start(name) {
      return (name + "").trim().split(/^|\s+/).every(function(t) {
        var i = t.indexOf(".");
        if (i >= 0) t = t.slice(0, i);
        return !t || t === "start";
      });
    }

    function onFunction(id, name, listener) {
      var on0, on1, sit = start(name) ? init : set;
      return function() {
        var schedule = sit(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

        schedule.on = on1;
      };
    }

    function transition_on(name, listener) {
      var id = this._id;

      return arguments.length < 2
          ? get(this.node(), id).on.on(name)
          : this.each(onFunction(id, name, listener));
    }

    function removeFunction(id) {
      return function() {
        var parent = this.parentNode;
        for (var i in this.__transition) if (+i !== id) return;
        if (parent) parent.removeChild(this);
      };
    }

    function transition_remove() {
      return this.on("end.remove", removeFunction(this._id));
    }

    function transition_select(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
            schedule(subgroup[i], name, id, i, subgroup, get(node, id));
          }
        }
      }

      return new Transition(subgroups, this._parents, name, id);
    }

    function transition_selectAll(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
              if (child = children[k]) {
                schedule(child, name, id, k, children, inherit);
              }
            }
            subgroups.push(children);
            parents.push(node);
          }
        }
      }

      return new Transition(subgroups, parents, name, id);
    }

    var Selection = selection.prototype.constructor;

    function transition_selection() {
      return new Selection(this._groups, this._parents);
    }

    function styleNull(name, interpolate) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            string1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, string10 = string1);
      };
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = styleValue(this, name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function styleFunction(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            value1 = value(this),
            string1 = value1 + "";
        if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function styleMaybeRemove(id, name) {
      var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
      return function() {
        var schedule = set(this, id),
            on = schedule.on,
            listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

        schedule.on = on1;
      };
    }

    function transition_style(name, value, priority) {
      var i = (name += "") === "transform" ? interpolateTransformCss : interpolate$1;
      return value == null ? this
          .styleTween(name, styleNull(name, i))
          .on("end.style." + name, styleRemove(name))
        : typeof value === "function" ? this
          .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
          .each(styleMaybeRemove(this._id, name))
        : this
          .styleTween(name, styleConstant(name, i, value), priority)
          .on("end.style." + name, null);
    }

    function styleInterpolate(name, i, priority) {
      return function(t) {
        this.style.setProperty(name, i.call(this, t), priority);
      };
    }

    function styleTween(name, value, priority) {
      var t, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
        return t;
      }
      tween._value = value;
      return tween;
    }

    function transition_styleTween(name, value, priority) {
      var key = "style." + (name += "");
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var value1 = value(this);
        this.textContent = value1 == null ? "" : value1;
      };
    }

    function transition_text(value) {
      return this.tween("text", typeof value === "function"
          ? textFunction(tweenValue(this, "text", value))
          : textConstant(value == null ? "" : value + ""));
    }

    function textInterpolate(i) {
      return function(t) {
        this.textContent = i.call(this, t);
      };
    }

    function textTween(value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_textTween(value) {
      var key = "text";
      if (arguments.length < 1) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, textTween(value));
    }

    function transition_transition() {
      var name = this._name,
          id0 = this._id,
          id1 = newId();

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            var inherit = get(node, id0);
            schedule(node, name, id1, i, group, {
              time: inherit.time + inherit.delay + inherit.duration,
              delay: 0,
              duration: inherit.duration,
              ease: inherit.ease
            });
          }
        }
      }

      return new Transition(groups, this._parents, name, id1);
    }

    function transition_end() {
      var on0, on1, that = this, id = that._id, size = that.size();
      return new Promise(function(resolve, reject) {
        var cancel = {value: reject},
            end = {value: function() { if (--size === 0) resolve(); }};

        that.each(function() {
          var schedule = set(this, id),
              on = schedule.on;

          // If this node shared a dispatch with the previous node,
          // just assign the updated shared dispatch and we’re done!
          // Otherwise, copy-on-write.
          if (on !== on0) {
            on1 = (on0 = on).copy();
            on1._.cancel.push(cancel);
            on1._.interrupt.push(cancel);
            on1._.end.push(end);
          }

          schedule.on = on1;
        });

        // The selection was empty, resolve end immediately
        if (size === 0) resolve();
      });
    }

    var id = 0;

    function Transition(groups, parents, name, id) {
      this._groups = groups;
      this._parents = parents;
      this._name = name;
      this._id = id;
    }

    function transition(name) {
      return selection().transition(name);
    }

    function newId() {
      return ++id;
    }

    var selection_prototype = selection.prototype;

    Transition.prototype = transition.prototype = {
      constructor: Transition,
      select: transition_select,
      selectAll: transition_selectAll,
      selectChild: selection_prototype.selectChild,
      selectChildren: selection_prototype.selectChildren,
      filter: transition_filter,
      merge: transition_merge,
      selection: transition_selection,
      transition: transition_transition,
      call: selection_prototype.call,
      nodes: selection_prototype.nodes,
      node: selection_prototype.node,
      size: selection_prototype.size,
      empty: selection_prototype.empty,
      each: selection_prototype.each,
      on: transition_on,
      attr: transition_attr,
      attrTween: transition_attrTween,
      style: transition_style,
      styleTween: transition_styleTween,
      text: transition_text,
      textTween: transition_textTween,
      remove: transition_remove,
      tween: transition_tween,
      delay: transition_delay,
      duration: transition_duration,
      ease: transition_ease,
      easeVarying: transition_easeVarying,
      end: transition_end,
      [Symbol.iterator]: selection_prototype[Symbol.iterator]
    };

    const linear$1 = t => +t;

    function quadIn(t) {
      return t * t;
    }

    function quadOut(t) {
      return t * (2 - t);
    }

    function quadInOut(t) {
      return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
    }

    function cubicIn(t) {
      return t * t * t;
    }

    function cubicOut(t) {
      return --t * t * t + 1;
    }

    function cubicInOut(t) {
      return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }

    var exponent$1 = 3;

    var polyIn = (function custom(e) {
      e = +e;

      function polyIn(t) {
        return Math.pow(t, e);
      }

      polyIn.exponent = custom;

      return polyIn;
    })(exponent$1);

    var polyOut = (function custom(e) {
      e = +e;

      function polyOut(t) {
        return 1 - Math.pow(1 - t, e);
      }

      polyOut.exponent = custom;

      return polyOut;
    })(exponent$1);

    var polyInOut = (function custom(e) {
      e = +e;

      function polyInOut(t) {
        return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
      }

      polyInOut.exponent = custom;

      return polyInOut;
    })(exponent$1);

    var pi$4 = Math.PI,
        halfPi$3 = pi$4 / 2;

    function sinIn(t) {
      return (+t === 1) ? 1 : 1 - Math.cos(t * halfPi$3);
    }

    function sinOut(t) {
      return Math.sin(t * halfPi$3);
    }

    function sinInOut(t) {
      return (1 - Math.cos(pi$4 * t)) / 2;
    }

    // tpmt is two power minus ten times t scaled to [0,1]
    function tpmt(x) {
      return (Math.pow(2, -10 * x) - 0.0009765625) * 1.0009775171065494;
    }

    function expIn(t) {
      return tpmt(1 - +t);
    }

    function expOut(t) {
      return 1 - tpmt(t);
    }

    function expInOut(t) {
      return ((t *= 2) <= 1 ? tpmt(1 - t) : 2 - tpmt(t - 1)) / 2;
    }

    function circleIn(t) {
      return 1 - Math.sqrt(1 - t * t);
    }

    function circleOut(t) {
      return Math.sqrt(1 - --t * t);
    }

    function circleInOut(t) {
      return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
    }

    var b1 = 4 / 11,
        b2 = 6 / 11,
        b3 = 8 / 11,
        b4 = 3 / 4,
        b5 = 9 / 11,
        b6 = 10 / 11,
        b7 = 15 / 16,
        b8 = 21 / 22,
        b9 = 63 / 64,
        b0 = 1 / b1 / b1;

    function bounceIn(t) {
      return 1 - bounceOut(1 - t);
    }

    function bounceOut(t) {
      return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
    }

    function bounceInOut(t) {
      return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
    }

    var overshoot = 1.70158;

    var backIn = (function custom(s) {
      s = +s;

      function backIn(t) {
        return (t = +t) * t * (s * (t - 1) + t);
      }

      backIn.overshoot = custom;

      return backIn;
    })(overshoot);

    var backOut = (function custom(s) {
      s = +s;

      function backOut(t) {
        return --t * t * ((t + 1) * s + t) + 1;
      }

      backOut.overshoot = custom;

      return backOut;
    })(overshoot);

    var backInOut = (function custom(s) {
      s = +s;

      function backInOut(t) {
        return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
      }

      backInOut.overshoot = custom;

      return backInOut;
    })(overshoot);

    var tau$5 = 2 * Math.PI,
        amplitude = 1,
        period = 0.3;

    var elasticIn = (function custom(a, p) {
      var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau$5);

      function elasticIn(t) {
        return a * tpmt(-(--t)) * Math.sin((s - t) / p);
      }

      elasticIn.amplitude = function(a) { return custom(a, p * tau$5); };
      elasticIn.period = function(p) { return custom(a, p); };

      return elasticIn;
    })(amplitude, period);

    var elasticOut = (function custom(a, p) {
      var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau$5);

      function elasticOut(t) {
        return 1 - a * tpmt(t = +t) * Math.sin((t + s) / p);
      }

      elasticOut.amplitude = function(a) { return custom(a, p * tau$5); };
      elasticOut.period = function(p) { return custom(a, p); };

      return elasticOut;
    })(amplitude, period);

    var elasticInOut = (function custom(a, p) {
      var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau$5);

      function elasticInOut(t) {
        return ((t = t * 2 - 1) < 0
            ? a * tpmt(-t) * Math.sin((s - t) / p)
            : 2 - a * tpmt(t) * Math.sin((s + t) / p)) / 2;
      }

      elasticInOut.amplitude = function(a) { return custom(a, p * tau$5); };
      elasticInOut.period = function(p) { return custom(a, p); };

      return elasticInOut;
    })(amplitude, period);

    var defaultTiming = {
      time: null, // Set on use.
      delay: 0,
      duration: 250,
      ease: cubicInOut
    };

    function inherit(node, id) {
      var timing;
      while (!(timing = node.__transition) || !(timing = timing[id])) {
        if (!(node = node.parentNode)) {
          throw new Error(`transition ${id} not found`);
        }
      }
      return timing;
    }

    function selection_transition(name) {
      var id,
          timing;

      if (name instanceof Transition) {
        id = name._id, name = name._name;
      } else {
        id = newId(), (timing = defaultTiming).time = now$1(), name = name == null ? null : name + "";
      }

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            schedule(node, name, id, i, group, timing || inherit(node, id));
          }
        }
      }

      return new Transition(groups, this._parents, name, id);
    }

    selection.prototype.interrupt = selection_interrupt;
    selection.prototype.transition = selection_transition;

    var root = [null];

    function active(node, name) {
      var schedules = node.__transition,
          schedule,
          i;

      if (schedules) {
        name = name == null ? null : name + "";
        for (i in schedules) {
          if ((schedule = schedules[i]).state > SCHEDULED && schedule.name === name) {
            return new Transition([[node]], root, name, +i);
          }
        }
      }

      return null;
    }

    var constant$7 = x => () => x;

    function BrushEvent(type, {
      sourceEvent,
      target,
      selection,
      mode,
      dispatch
    }) {
      Object.defineProperties(this, {
        type: {value: type, enumerable: true, configurable: true},
        sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
        target: {value: target, enumerable: true, configurable: true},
        selection: {value: selection, enumerable: true, configurable: true},
        mode: {value: mode, enumerable: true, configurable: true},
        _: {value: dispatch}
      });
    }

    function nopropagation$1(event) {
      event.stopImmediatePropagation();
    }

    function noevent$1(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    var MODE_DRAG = {name: "drag"},
        MODE_SPACE = {name: "space"},
        MODE_HANDLE = {name: "handle"},
        MODE_CENTER = {name: "center"};

    const {abs: abs$3, max: max$2, min: min$1} = Math;

    function number1(e) {
      return [+e[0], +e[1]];
    }

    function number2(e) {
      return [number1(e[0]), number1(e[1])];
    }

    var X = {
      name: "x",
      handles: ["w", "e"].map(type),
      input: function(x, e) { return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]]; },
      output: function(xy) { return xy && [xy[0][0], xy[1][0]]; }
    };

    var Y = {
      name: "y",
      handles: ["n", "s"].map(type),
      input: function(y, e) { return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]]; },
      output: function(xy) { return xy && [xy[0][1], xy[1][1]]; }
    };

    var XY = {
      name: "xy",
      handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
      input: function(xy) { return xy == null ? null : number2(xy); },
      output: function(xy) { return xy; }
    };

    var cursors = {
      overlay: "crosshair",
      selection: "move",
      n: "ns-resize",
      e: "ew-resize",
      s: "ns-resize",
      w: "ew-resize",
      nw: "nwse-resize",
      ne: "nesw-resize",
      se: "nwse-resize",
      sw: "nesw-resize"
    };

    var flipX = {
      e: "w",
      w: "e",
      nw: "ne",
      ne: "nw",
      se: "sw",
      sw: "se"
    };

    var flipY = {
      n: "s",
      s: "n",
      nw: "sw",
      ne: "se",
      se: "ne",
      sw: "nw"
    };

    var signsX = {
      overlay: +1,
      selection: +1,
      n: null,
      e: +1,
      s: null,
      w: -1,
      nw: -1,
      ne: +1,
      se: +1,
      sw: -1
    };

    var signsY = {
      overlay: +1,
      selection: +1,
      n: -1,
      e: null,
      s: +1,
      w: null,
      nw: -1,
      ne: -1,
      se: +1,
      sw: +1
    };

    function type(t) {
      return {type: t};
    }

    // Ignore right-click, since that should open the context menu.
    function defaultFilter$1(event) {
      return !event.ctrlKey && !event.button;
    }

    function defaultExtent$1() {
      var svg = this.ownerSVGElement || this;
      if (svg.hasAttribute("viewBox")) {
        svg = svg.viewBox.baseVal;
        return [[svg.x, svg.y], [svg.x + svg.width, svg.y + svg.height]];
      }
      return [[0, 0], [svg.width.baseVal.value, svg.height.baseVal.value]];
    }

    function defaultTouchable$1() {
      return navigator.maxTouchPoints || ("ontouchstart" in this);
    }

    // Like d3.local, but with the name “__brush” rather than auto-generated.
    function local(node) {
      while (!node.__brush) if (!(node = node.parentNode)) return;
      return node.__brush;
    }

    function empty(extent) {
      return extent[0][0] === extent[1][0]
          || extent[0][1] === extent[1][1];
    }

    function brushSelection(node) {
      var state = node.__brush;
      return state ? state.dim.output(state.selection) : null;
    }

    function brushX() {
      return brush$1(X);
    }

    function brushY() {
      return brush$1(Y);
    }

    function brush() {
      return brush$1(XY);
    }

    function brush$1(dim) {
      var extent = defaultExtent$1,
          filter = defaultFilter$1,
          touchable = defaultTouchable$1,
          keys = true,
          listeners = dispatch("start", "brush", "end"),
          handleSize = 6,
          touchending;

      function brush(group) {
        var overlay = group
            .property("__brush", initialize)
          .selectAll(".overlay")
          .data([type("overlay")]);

        overlay.enter().append("rect")
            .attr("class", "overlay")
            .attr("pointer-events", "all")
            .attr("cursor", cursors.overlay)
          .merge(overlay)
            .each(function() {
              var extent = local(this).extent;
              select(this)
                  .attr("x", extent[0][0])
                  .attr("y", extent[0][1])
                  .attr("width", extent[1][0] - extent[0][0])
                  .attr("height", extent[1][1] - extent[0][1]);
            });

        group.selectAll(".selection")
          .data([type("selection")])
          .enter().append("rect")
            .attr("class", "selection")
            .attr("cursor", cursors.selection)
            .attr("fill", "#777")
            .attr("fill-opacity", 0.3)
            .attr("stroke", "#fff")
            .attr("shape-rendering", "crispEdges");

        var handle = group.selectAll(".handle")
          .data(dim.handles, function(d) { return d.type; });

        handle.exit().remove();

        handle.enter().append("rect")
            .attr("class", function(d) { return "handle handle--" + d.type; })
            .attr("cursor", function(d) { return cursors[d.type]; });

        group
            .each(redraw)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousedown.brush", started)
          .filter(touchable)
            .on("touchstart.brush", started)
            .on("touchmove.brush", touchmoved)
            .on("touchend.brush touchcancel.brush", touchended)
            .style("touch-action", "none")
            .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
      }

      brush.move = function(group, selection, event) {
        if (group.tween) {
          group
              .on("start.brush", function(event) { emitter(this, arguments).beforestart().start(event); })
              .on("interrupt.brush end.brush", function(event) { emitter(this, arguments).end(event); })
              .tween("brush", function() {
                var that = this,
                    state = that.__brush,
                    emit = emitter(that, arguments),
                    selection0 = state.selection,
                    selection1 = dim.input(typeof selection === "function" ? selection.apply(this, arguments) : selection, state.extent),
                    i = interpolate$2(selection0, selection1);

                function tween(t) {
                  state.selection = t === 1 && selection1 === null ? null : i(t);
                  redraw.call(that);
                  emit.brush();
                }

                return selection0 !== null && selection1 !== null ? tween : tween(1);
              });
        } else {
          group
              .each(function() {
                var that = this,
                    args = arguments,
                    state = that.__brush,
                    selection1 = dim.input(typeof selection === "function" ? selection.apply(that, args) : selection, state.extent),
                    emit = emitter(that, args).beforestart();

                interrupt(that);
                state.selection = selection1 === null ? null : selection1;
                redraw.call(that);
                emit.start(event).brush(event).end(event);
              });
        }
      };

      brush.clear = function(group, event) {
        brush.move(group, null, event);
      };

      function redraw() {
        var group = select(this),
            selection = local(this).selection;

        if (selection) {
          group.selectAll(".selection")
              .style("display", null)
              .attr("x", selection[0][0])
              .attr("y", selection[0][1])
              .attr("width", selection[1][0] - selection[0][0])
              .attr("height", selection[1][1] - selection[0][1]);

          group.selectAll(".handle")
              .style("display", null)
              .attr("x", function(d) { return d.type[d.type.length - 1] === "e" ? selection[1][0] - handleSize / 2 : selection[0][0] - handleSize / 2; })
              .attr("y", function(d) { return d.type[0] === "s" ? selection[1][1] - handleSize / 2 : selection[0][1] - handleSize / 2; })
              .attr("width", function(d) { return d.type === "n" || d.type === "s" ? selection[1][0] - selection[0][0] + handleSize : handleSize; })
              .attr("height", function(d) { return d.type === "e" || d.type === "w" ? selection[1][1] - selection[0][1] + handleSize : handleSize; });
        }

        else {
          group.selectAll(".selection,.handle")
              .style("display", "none")
              .attr("x", null)
              .attr("y", null)
              .attr("width", null)
              .attr("height", null);
        }
      }

      function emitter(that, args, clean) {
        var emit = that.__brush.emitter;
        return emit && (!clean || !emit.clean) ? emit : new Emitter(that, args, clean);
      }

      function Emitter(that, args, clean) {
        this.that = that;
        this.args = args;
        this.state = that.__brush;
        this.active = 0;
        this.clean = clean;
      }

      Emitter.prototype = {
        beforestart: function() {
          if (++this.active === 1) this.state.emitter = this, this.starting = true;
          return this;
        },
        start: function(event, mode) {
          if (this.starting) this.starting = false, this.emit("start", event, mode);
          else this.emit("brush", event);
          return this;
        },
        brush: function(event, mode) {
          this.emit("brush", event, mode);
          return this;
        },
        end: function(event, mode) {
          if (--this.active === 0) delete this.state.emitter, this.emit("end", event, mode);
          return this;
        },
        emit: function(type, event, mode) {
          var d = select(this.that).datum();
          listeners.call(
            type,
            this.that,
            new BrushEvent(type, {
              sourceEvent: event,
              target: brush,
              selection: dim.output(this.state.selection),
              mode,
              dispatch: listeners
            }),
            d
          );
        }
      };

      function started(event) {
        if (touchending && !event.touches) return;
        if (!filter.apply(this, arguments)) return;

        var that = this,
            type = event.target.__data__.type,
            mode = (keys && event.metaKey ? type = "overlay" : type) === "selection" ? MODE_DRAG : (keys && event.altKey ? MODE_CENTER : MODE_HANDLE),
            signX = dim === Y ? null : signsX[type],
            signY = dim === X ? null : signsY[type],
            state = local(that),
            extent = state.extent,
            selection = state.selection,
            W = extent[0][0], w0, w1,
            N = extent[0][1], n0, n1,
            E = extent[1][0], e0, e1,
            S = extent[1][1], s0, s1,
            dx = 0,
            dy = 0,
            moving,
            shifting = signX && signY && keys && event.shiftKey,
            lockX,
            lockY,
            points = Array.from(event.touches || [event], t => {
              const i = t.identifier;
              t = pointer(t, that);
              t.point0 = t.slice();
              t.identifier = i;
              return t;
            });

        interrupt(that);
        var emit = emitter(that, arguments, true).beforestart();

        if (type === "overlay") {
          if (selection) moving = true;
          const pts = [points[0], points[1] || points[0]];
          state.selection = selection = [[
              w0 = dim === Y ? W : min$1(pts[0][0], pts[1][0]),
              n0 = dim === X ? N : min$1(pts[0][1], pts[1][1])
            ], [
              e0 = dim === Y ? E : max$2(pts[0][0], pts[1][0]),
              s0 = dim === X ? S : max$2(pts[0][1], pts[1][1])
            ]];
          if (points.length > 1) move(event);
        } else {
          w0 = selection[0][0];
          n0 = selection[0][1];
          e0 = selection[1][0];
          s0 = selection[1][1];
        }

        w1 = w0;
        n1 = n0;
        e1 = e0;
        s1 = s0;

        var group = select(that)
            .attr("pointer-events", "none");

        var overlay = group.selectAll(".overlay")
            .attr("cursor", cursors[type]);

        if (event.touches) {
          emit.moved = moved;
          emit.ended = ended;
        } else {
          var view = select(event.view)
              .on("mousemove.brush", moved, true)
              .on("mouseup.brush", ended, true);
          if (keys) view
              .on("keydown.brush", keydowned, true)
              .on("keyup.brush", keyupped, true);

          dragDisable(event.view);
        }

        redraw.call(that);
        emit.start(event, mode.name);

        function moved(event) {
          for (const p of event.changedTouches || [event]) {
            for (const d of points)
              if (d.identifier === p.identifier) d.cur = pointer(p, that);
          }
          if (shifting && !lockX && !lockY && points.length === 1) {
            const point = points[0];
            if (abs$3(point.cur[0] - point[0]) > abs$3(point.cur[1] - point[1]))
              lockY = true;
            else
              lockX = true;
          }
          for (const point of points)
            if (point.cur) point[0] = point.cur[0], point[1] = point.cur[1];
          moving = true;
          noevent$1(event);
          move(event);
        }

        function move(event) {
          const point = points[0], point0 = point.point0;
          var t;

          dx = point[0] - point0[0];
          dy = point[1] - point0[1];

          switch (mode) {
            case MODE_SPACE:
            case MODE_DRAG: {
              if (signX) dx = max$2(W - w0, min$1(E - e0, dx)), w1 = w0 + dx, e1 = e0 + dx;
              if (signY) dy = max$2(N - n0, min$1(S - s0, dy)), n1 = n0 + dy, s1 = s0 + dy;
              break;
            }
            case MODE_HANDLE: {
              if (points[1]) {
                if (signX) w1 = max$2(W, min$1(E, points[0][0])), e1 = max$2(W, min$1(E, points[1][0])), signX = 1;
                if (signY) n1 = max$2(N, min$1(S, points[0][1])), s1 = max$2(N, min$1(S, points[1][1])), signY = 1;
              } else {
                if (signX < 0) dx = max$2(W - w0, min$1(E - w0, dx)), w1 = w0 + dx, e1 = e0;
                else if (signX > 0) dx = max$2(W - e0, min$1(E - e0, dx)), w1 = w0, e1 = e0 + dx;
                if (signY < 0) dy = max$2(N - n0, min$1(S - n0, dy)), n1 = n0 + dy, s1 = s0;
                else if (signY > 0) dy = max$2(N - s0, min$1(S - s0, dy)), n1 = n0, s1 = s0 + dy;
              }
              break;
            }
            case MODE_CENTER: {
              if (signX) w1 = max$2(W, min$1(E, w0 - dx * signX)), e1 = max$2(W, min$1(E, e0 + dx * signX));
              if (signY) n1 = max$2(N, min$1(S, n0 - dy * signY)), s1 = max$2(N, min$1(S, s0 + dy * signY));
              break;
            }
          }

          if (e1 < w1) {
            signX *= -1;
            t = w0, w0 = e0, e0 = t;
            t = w1, w1 = e1, e1 = t;
            if (type in flipX) overlay.attr("cursor", cursors[type = flipX[type]]);
          }

          if (s1 < n1) {
            signY *= -1;
            t = n0, n0 = s0, s0 = t;
            t = n1, n1 = s1, s1 = t;
            if (type in flipY) overlay.attr("cursor", cursors[type = flipY[type]]);
          }

          if (state.selection) selection = state.selection; // May be set by brush.move!
          if (lockX) w1 = selection[0][0], e1 = selection[1][0];
          if (lockY) n1 = selection[0][1], s1 = selection[1][1];

          if (selection[0][0] !== w1
              || selection[0][1] !== n1
              || selection[1][0] !== e1
              || selection[1][1] !== s1) {
            state.selection = [[w1, n1], [e1, s1]];
            redraw.call(that);
            emit.brush(event, mode.name);
          }
        }

        function ended(event) {
          nopropagation$1(event);
          if (event.touches) {
            if (event.touches.length) return;
            if (touchending) clearTimeout(touchending);
            touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
          } else {
            yesdrag(event.view, moving);
            view.on("keydown.brush keyup.brush mousemove.brush mouseup.brush", null);
          }
          group.attr("pointer-events", "all");
          overlay.attr("cursor", cursors.overlay);
          if (state.selection) selection = state.selection; // May be set by brush.move (on start)!
          if (empty(selection)) state.selection = null, redraw.call(that);
          emit.end(event, mode.name);
        }

        function keydowned(event) {
          switch (event.keyCode) {
            case 16: { // SHIFT
              shifting = signX && signY;
              break;
            }
            case 18: { // ALT
              if (mode === MODE_HANDLE) {
                if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
                if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
                mode = MODE_CENTER;
                move(event);
              }
              break;
            }
            case 32: { // SPACE; takes priority over ALT
              if (mode === MODE_HANDLE || mode === MODE_CENTER) {
                if (signX < 0) e0 = e1 - dx; else if (signX > 0) w0 = w1 - dx;
                if (signY < 0) s0 = s1 - dy; else if (signY > 0) n0 = n1 - dy;
                mode = MODE_SPACE;
                overlay.attr("cursor", cursors.selection);
                move(event);
              }
              break;
            }
            default: return;
          }
          noevent$1(event);
        }

        function keyupped(event) {
          switch (event.keyCode) {
            case 16: { // SHIFT
              if (shifting) {
                lockX = lockY = shifting = false;
                move(event);
              }
              break;
            }
            case 18: { // ALT
              if (mode === MODE_CENTER) {
                if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
                if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
                mode = MODE_HANDLE;
                move(event);
              }
              break;
            }
            case 32: { // SPACE
              if (mode === MODE_SPACE) {
                if (event.altKey) {
                  if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
                  if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
                  mode = MODE_CENTER;
                } else {
                  if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
                  if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
                  mode = MODE_HANDLE;
                }
                overlay.attr("cursor", cursors[type]);
                move(event);
              }
              break;
            }
            default: return;
          }
          noevent$1(event);
        }
      }

      function touchmoved(event) {
        emitter(this, arguments).moved(event);
      }

      function touchended(event) {
        emitter(this, arguments).ended(event);
      }

      function initialize() {
        var state = this.__brush || {selection: null};
        state.extent = number2(extent.apply(this, arguments));
        state.dim = dim;
        return state;
      }

      brush.extent = function(_) {
        return arguments.length ? (extent = typeof _ === "function" ? _ : constant$7(number2(_)), brush) : extent;
      };

      brush.filter = function(_) {
        return arguments.length ? (filter = typeof _ === "function" ? _ : constant$7(!!_), brush) : filter;
      };

      brush.touchable = function(_) {
        return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$7(!!_), brush) : touchable;
      };

      brush.handleSize = function(_) {
        return arguments.length ? (handleSize = +_, brush) : handleSize;
      };

      brush.keyModifiers = function(_) {
        return arguments.length ? (keys = !!_, brush) : keys;
      };

      brush.on = function() {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? brush : value;
      };

      return brush;
    }

    var abs$2 = Math.abs;
    var cos$2 = Math.cos;
    var sin$2 = Math.sin;
    var pi$3 = Math.PI;
    var halfPi$2 = pi$3 / 2;
    var tau$4 = pi$3 * 2;
    var max$1 = Math.max;
    var epsilon$5 = 1e-12;

    function range$1(i, j) {
      return Array.from({length: j - i}, (_, k) => i + k);
    }

    function compareValue(compare) {
      return function(a, b) {
        return compare(
          a.source.value + a.target.value,
          b.source.value + b.target.value
        );
      };
    }

    function chord() {
      return chord$1(false, false);
    }

    function chordTranspose() {
      return chord$1(false, true);
    }

    function chordDirected() {
      return chord$1(true, false);
    }

    function chord$1(directed, transpose) {
      var padAngle = 0,
          sortGroups = null,
          sortSubgroups = null,
          sortChords = null;

      function chord(matrix) {
        var n = matrix.length,
            groupSums = new Array(n),
            groupIndex = range$1(0, n),
            chords = new Array(n * n),
            groups = new Array(n),
            k = 0, dx;

        matrix = Float64Array.from({length: n * n}, transpose
            ? (_, i) => matrix[i % n][i / n | 0]
            : (_, i) => matrix[i / n | 0][i % n]);

        // Compute the scaling factor from value to angle in [0, 2pi].
        for (let i = 0; i < n; ++i) {
          let x = 0;
          for (let j = 0; j < n; ++j) x += matrix[i * n + j] + directed * matrix[j * n + i];
          k += groupSums[i] = x;
        }
        k = max$1(0, tau$4 - padAngle * n) / k;
        dx = k ? padAngle : tau$4 / n;

        // Compute the angles for each group and constituent chord.
        {
          let x = 0;
          if (sortGroups) groupIndex.sort((a, b) => sortGroups(groupSums[a], groupSums[b]));
          for (const i of groupIndex) {
            const x0 = x;
            if (directed) {
              const subgroupIndex = range$1(~n + 1, n).filter(j => j < 0 ? matrix[~j * n + i] : matrix[i * n + j]);
              if (sortSubgroups) subgroupIndex.sort((a, b) => sortSubgroups(a < 0 ? -matrix[~a * n + i] : matrix[i * n + a], b < 0 ? -matrix[~b * n + i] : matrix[i * n + b]));
              for (const j of subgroupIndex) {
                if (j < 0) {
                  const chord = chords[~j * n + i] || (chords[~j * n + i] = {source: null, target: null});
                  chord.target = {index: i, startAngle: x, endAngle: x += matrix[~j * n + i] * k, value: matrix[~j * n + i]};
                } else {
                  const chord = chords[i * n + j] || (chords[i * n + j] = {source: null, target: null});
                  chord.source = {index: i, startAngle: x, endAngle: x += matrix[i * n + j] * k, value: matrix[i * n + j]};
                }
              }
              groups[i] = {index: i, startAngle: x0, endAngle: x, value: groupSums[i]};
            } else {
              const subgroupIndex = range$1(0, n).filter(j => matrix[i * n + j] || matrix[j * n + i]);
              if (sortSubgroups) subgroupIndex.sort((a, b) => sortSubgroups(matrix[i * n + a], matrix[i * n + b]));
              for (const j of subgroupIndex) {
                let chord;
                if (i < j) {
                  chord = chords[i * n + j] || (chords[i * n + j] = {source: null, target: null});
                  chord.source = {index: i, startAngle: x, endAngle: x += matrix[i * n + j] * k, value: matrix[i * n + j]};
                } else {
                  chord = chords[j * n + i] || (chords[j * n + i] = {source: null, target: null});
                  chord.target = {index: i, startAngle: x, endAngle: x += matrix[i * n + j] * k, value: matrix[i * n + j]};
                  if (i === j) chord.source = chord.target;
                }
                if (chord.source && chord.target && chord.source.value < chord.target.value) {
                  const source = chord.source;
                  chord.source = chord.target;
                  chord.target = source;
                }
              }
              groups[i] = {index: i, startAngle: x0, endAngle: x, value: groupSums[i]};
            }
            x += dx;
          }
        }

        // Remove empty chords.
        chords = Object.values(chords);
        chords.groups = groups;
        return sortChords ? chords.sort(sortChords) : chords;
      }

      chord.padAngle = function(_) {
        return arguments.length ? (padAngle = max$1(0, _), chord) : padAngle;
      };

      chord.sortGroups = function(_) {
        return arguments.length ? (sortGroups = _, chord) : sortGroups;
      };

      chord.sortSubgroups = function(_) {
        return arguments.length ? (sortSubgroups = _, chord) : sortSubgroups;
      };

      chord.sortChords = function(_) {
        return arguments.length ? (_ == null ? sortChords = null : (sortChords = compareValue(_))._ = _, chord) : sortChords && sortChords._;
      };

      return chord;
    }

    const pi$2 = Math.PI,
        tau$3 = 2 * pi$2,
        epsilon$4 = 1e-6,
        tauEpsilon = tau$3 - epsilon$4;

    function Path$1() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }

    function path() {
      return new Path$1;
    }

    Path$1.prototype = path.prototype = {
      constructor: Path$1,
      moveTo: function(x, y) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
      },
      closePath: function() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      },
      lineTo: function(x, y) {
        this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      quadraticCurveTo: function(x1, y1, x, y) {
        this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) {
        this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      arcTo: function(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        var x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon$4));

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$4) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
          var x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi$2 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon$4) {
            this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
          }

          this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
        }
      },
      arc: function(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r, ccw = !!ccw;
        var dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._ += "M" + x0 + "," + y0;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon$4 || Math.abs(this._y1 - y0) > epsilon$4) {
          this._ += "L" + x0 + "," + y0;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau$3 + tau$3;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon$4) {
          this._ += "A" + r + "," + r + ",0," + (+(da >= pi$2)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
        }
      },
      rect: function(x, y, w, h) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
      },
      toString: function() {
        return this._;
      }
    };

    var slice$2 = Array.prototype.slice;

    function constant$6(x) {
      return function() {
        return x;
      };
    }

    function defaultSource$1(d) {
      return d.source;
    }

    function defaultTarget(d) {
      return d.target;
    }

    function defaultRadius$1(d) {
      return d.radius;
    }

    function defaultStartAngle(d) {
      return d.startAngle;
    }

    function defaultEndAngle(d) {
      return d.endAngle;
    }

    function defaultPadAngle() {
      return 0;
    }

    function defaultArrowheadRadius() {
      return 10;
    }

    function ribbon(headRadius) {
      var source = defaultSource$1,
          target = defaultTarget,
          sourceRadius = defaultRadius$1,
          targetRadius = defaultRadius$1,
          startAngle = defaultStartAngle,
          endAngle = defaultEndAngle,
          padAngle = defaultPadAngle,
          context = null;

      function ribbon() {
        var buffer,
            s = source.apply(this, arguments),
            t = target.apply(this, arguments),
            ap = padAngle.apply(this, arguments) / 2,
            argv = slice$2.call(arguments),
            sr = +sourceRadius.apply(this, (argv[0] = s, argv)),
            sa0 = startAngle.apply(this, argv) - halfPi$2,
            sa1 = endAngle.apply(this, argv) - halfPi$2,
            tr = +targetRadius.apply(this, (argv[0] = t, argv)),
            ta0 = startAngle.apply(this, argv) - halfPi$2,
            ta1 = endAngle.apply(this, argv) - halfPi$2;

        if (!context) context = buffer = path();

        if (ap > epsilon$5) {
          if (abs$2(sa1 - sa0) > ap * 2 + epsilon$5) sa1 > sa0 ? (sa0 += ap, sa1 -= ap) : (sa0 -= ap, sa1 += ap);
          else sa0 = sa1 = (sa0 + sa1) / 2;
          if (abs$2(ta1 - ta0) > ap * 2 + epsilon$5) ta1 > ta0 ? (ta0 += ap, ta1 -= ap) : (ta0 -= ap, ta1 += ap);
          else ta0 = ta1 = (ta0 + ta1) / 2;
        }

        context.moveTo(sr * cos$2(sa0), sr * sin$2(sa0));
        context.arc(0, 0, sr, sa0, sa1);
        if (sa0 !== ta0 || sa1 !== ta1) {
          if (headRadius) {
            var hr = +headRadius.apply(this, arguments), tr2 = tr - hr, ta2 = (ta0 + ta1) / 2;
            context.quadraticCurveTo(0, 0, tr2 * cos$2(ta0), tr2 * sin$2(ta0));
            context.lineTo(tr * cos$2(ta2), tr * sin$2(ta2));
            context.lineTo(tr2 * cos$2(ta1), tr2 * sin$2(ta1));
          } else {
            context.quadraticCurveTo(0, 0, tr * cos$2(ta0), tr * sin$2(ta0));
            context.arc(0, 0, tr, ta0, ta1);
          }
        }
        context.quadraticCurveTo(0, 0, sr * cos$2(sa0), sr * sin$2(sa0));
        context.closePath();

        if (buffer) return context = null, buffer + "" || null;
      }

      if (headRadius) ribbon.headRadius = function(_) {
        return arguments.length ? (headRadius = typeof _ === "function" ? _ : constant$6(+_), ribbon) : headRadius;
      };

      ribbon.radius = function(_) {
        return arguments.length ? (sourceRadius = targetRadius = typeof _ === "function" ? _ : constant$6(+_), ribbon) : sourceRadius;
      };

      ribbon.sourceRadius = function(_) {
        return arguments.length ? (sourceRadius = typeof _ === "function" ? _ : constant$6(+_), ribbon) : sourceRadius;
      };

      ribbon.targetRadius = function(_) {
        return arguments.length ? (targetRadius = typeof _ === "function" ? _ : constant$6(+_), ribbon) : targetRadius;
      };

      ribbon.startAngle = function(_) {
        return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$6(+_), ribbon) : startAngle;
      };

      ribbon.endAngle = function(_) {
        return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$6(+_), ribbon) : endAngle;
      };

      ribbon.padAngle = function(_) {
        return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$6(+_), ribbon) : padAngle;
      };

      ribbon.source = function(_) {
        return arguments.length ? (source = _, ribbon) : source;
      };

      ribbon.target = function(_) {
        return arguments.length ? (target = _, ribbon) : target;
      };

      ribbon.context = function(_) {
        return arguments.length ? ((context = _ == null ? null : _), ribbon) : context;
      };

      return ribbon;
    }

    function ribbon$1() {
      return ribbon();
    }

    function ribbonArrow() {
      return ribbon(defaultArrowheadRadius);
    }

    var array$2 = Array.prototype;

    var slice$1 = array$2.slice;

    function ascending$1(a, b) {
      return a - b;
    }

    function area$3(ring) {
      var i = 0, n = ring.length, area = ring[n - 1][1] * ring[0][0] - ring[n - 1][0] * ring[0][1];
      while (++i < n) area += ring[i - 1][1] * ring[i][0] - ring[i - 1][0] * ring[i][1];
      return area;
    }

    var constant$5 = x => () => x;

    function contains$2(ring, hole) {
      var i = -1, n = hole.length, c;
      while (++i < n) if (c = ringContains(ring, hole[i])) return c;
      return 0;
    }

    function ringContains(ring, point) {
      var x = point[0], y = point[1], contains = -1;
      for (var i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
        var pi = ring[i], xi = pi[0], yi = pi[1], pj = ring[j], xj = pj[0], yj = pj[1];
        if (segmentContains(pi, pj, point)) return 0;
        if (((yi > y) !== (yj > y)) && ((x < (xj - xi) * (y - yi) / (yj - yi) + xi))) contains = -contains;
      }
      return contains;
    }

    function segmentContains(a, b, c) {
      var i; return collinear$1(a, b, c) && within(a[i = +(a[0] === b[0])], c[i], b[i]);
    }

    function collinear$1(a, b, c) {
      return (b[0] - a[0]) * (c[1] - a[1]) === (c[0] - a[0]) * (b[1] - a[1]);
    }

    function within(p, q, r) {
      return p <= q && q <= r || r <= q && q <= p;
    }

    function noop$2() {}

    var cases = [
      [],
      [[[1.0, 1.5], [0.5, 1.0]]],
      [[[1.5, 1.0], [1.0, 1.5]]],
      [[[1.5, 1.0], [0.5, 1.0]]],
      [[[1.0, 0.5], [1.5, 1.0]]],
      [[[1.0, 1.5], [0.5, 1.0]], [[1.0, 0.5], [1.5, 1.0]]],
      [[[1.0, 0.5], [1.0, 1.5]]],
      [[[1.0, 0.5], [0.5, 1.0]]],
      [[[0.5, 1.0], [1.0, 0.5]]],
      [[[1.0, 1.5], [1.0, 0.5]]],
      [[[0.5, 1.0], [1.0, 0.5]], [[1.5, 1.0], [1.0, 1.5]]],
      [[[1.5, 1.0], [1.0, 0.5]]],
      [[[0.5, 1.0], [1.5, 1.0]]],
      [[[1.0, 1.5], [1.5, 1.0]]],
      [[[0.5, 1.0], [1.0, 1.5]]],
      []
    ];

    function contours() {
      var dx = 1,
          dy = 1,
          threshold = thresholdSturges,
          smooth = smoothLinear;

      function contours(values) {
        var tz = threshold(values);

        // Convert number of thresholds into uniform thresholds.
        if (!Array.isArray(tz)) {
          const e = extent$1(values), ts = tickStep(e[0], e[1], tz);
          tz = ticks(Math.floor(e[0] / ts) * ts, Math.floor(e[1] / ts - 1) * ts, tz);
        } else {
          tz = tz.slice().sort(ascending$1);
        }

        return tz.map(value => contour(values, value));
      }

      // Accumulate, smooth contour rings, assign holes to exterior rings.
      // Based on https://github.com/mbostock/shapefile/blob/v0.6.2/shp/polygon.js
      function contour(values, value) {
        var polygons = [],
            holes = [];

        isorings(values, value, function(ring) {
          smooth(ring, values, value);
          if (area$3(ring) > 0) polygons.push([ring]);
          else holes.push(ring);
        });

        holes.forEach(function(hole) {
          for (var i = 0, n = polygons.length, polygon; i < n; ++i) {
            if (contains$2((polygon = polygons[i])[0], hole) !== -1) {
              polygon.push(hole);
              return;
            }
          }
        });

        return {
          type: "MultiPolygon",
          value: value,
          coordinates: polygons
        };
      }

      // Marching squares with isolines stitched into rings.
      // Based on https://github.com/topojson/topojson-client/blob/v3.0.0/src/stitch.js
      function isorings(values, value, callback) {
        var fragmentByStart = new Array,
            fragmentByEnd = new Array,
            x, y, t0, t1, t2, t3;

        // Special case for the first row (y = -1, t2 = t3 = 0).
        x = y = -1;
        t1 = values[0] >= value;
        cases[t1 << 1].forEach(stitch);
        while (++x < dx - 1) {
          t0 = t1, t1 = values[x + 1] >= value;
          cases[t0 | t1 << 1].forEach(stitch);
        }
        cases[t1 << 0].forEach(stitch);

        // General case for the intermediate rows.
        while (++y < dy - 1) {
          x = -1;
          t1 = values[y * dx + dx] >= value;
          t2 = values[y * dx] >= value;
          cases[t1 << 1 | t2 << 2].forEach(stitch);
          while (++x < dx - 1) {
            t0 = t1, t1 = values[y * dx + dx + x + 1] >= value;
            t3 = t2, t2 = values[y * dx + x + 1] >= value;
            cases[t0 | t1 << 1 | t2 << 2 | t3 << 3].forEach(stitch);
          }
          cases[t1 | t2 << 3].forEach(stitch);
        }

        // Special case for the last row (y = dy - 1, t0 = t1 = 0).
        x = -1;
        t2 = values[y * dx] >= value;
        cases[t2 << 2].forEach(stitch);
        while (++x < dx - 1) {
          t3 = t2, t2 = values[y * dx + x + 1] >= value;
          cases[t2 << 2 | t3 << 3].forEach(stitch);
        }
        cases[t2 << 3].forEach(stitch);

        function stitch(line) {
          var start = [line[0][0] + x, line[0][1] + y],
              end = [line[1][0] + x, line[1][1] + y],
              startIndex = index(start),
              endIndex = index(end),
              f, g;
          if (f = fragmentByEnd[startIndex]) {
            if (g = fragmentByStart[endIndex]) {
              delete fragmentByEnd[f.end];
              delete fragmentByStart[g.start];
              if (f === g) {
                f.ring.push(end);
                callback(f.ring);
              } else {
                fragmentByStart[f.start] = fragmentByEnd[g.end] = {start: f.start, end: g.end, ring: f.ring.concat(g.ring)};
              }
            } else {
              delete fragmentByEnd[f.end];
              f.ring.push(end);
              fragmentByEnd[f.end = endIndex] = f;
            }
          } else if (f = fragmentByStart[endIndex]) {
            if (g = fragmentByEnd[startIndex]) {
              delete fragmentByStart[f.start];
              delete fragmentByEnd[g.end];
              if (f === g) {
                f.ring.push(end);
                callback(f.ring);
              } else {
                fragmentByStart[g.start] = fragmentByEnd[f.end] = {start: g.start, end: f.end, ring: g.ring.concat(f.ring)};
              }
            } else {
              delete fragmentByStart[f.start];
              f.ring.unshift(start);
              fragmentByStart[f.start = startIndex] = f;
            }
          } else {
            fragmentByStart[startIndex] = fragmentByEnd[endIndex] = {start: startIndex, end: endIndex, ring: [start, end]};
          }
        }
      }

      function index(point) {
        return point[0] * 2 + point[1] * (dx + 1) * 4;
      }

      function smoothLinear(ring, values, value) {
        ring.forEach(function(point) {
          var x = point[0],
              y = point[1],
              xt = x | 0,
              yt = y | 0,
              v0,
              v1 = values[yt * dx + xt];
          if (x > 0 && x < dx && xt === x) {
            v0 = values[yt * dx + xt - 1];
            point[0] = x + (value - v0) / (v1 - v0) - 0.5;
          }
          if (y > 0 && y < dy && yt === y) {
            v0 = values[(yt - 1) * dx + xt];
            point[1] = y + (value - v0) / (v1 - v0) - 0.5;
          }
        });
      }

      contours.contour = contour;

      contours.size = function(_) {
        if (!arguments.length) return [dx, dy];
        var _0 = Math.floor(_[0]), _1 = Math.floor(_[1]);
        if (!(_0 >= 0 && _1 >= 0)) throw new Error("invalid size");
        return dx = _0, dy = _1, contours;
      };

      contours.thresholds = function(_) {
        return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant$5(slice$1.call(_)) : constant$5(_), contours) : threshold;
      };

      contours.smooth = function(_) {
        return arguments.length ? (smooth = _ ? smoothLinear : noop$2, contours) : smooth === smoothLinear;
      };

      return contours;
    }

    // TODO Optimize edge cases.
    // TODO Optimize index calculation.
    // TODO Optimize arguments.
    function blurX(source, target, r) {
      var n = source.width,
          m = source.height,
          w = (r << 1) + 1;
      for (var j = 0; j < m; ++j) {
        for (var i = 0, sr = 0; i < n + r; ++i) {
          if (i < n) {
            sr += source.data[i + j * n];
          }
          if (i >= r) {
            if (i >= w) {
              sr -= source.data[i - w + j * n];
            }
            target.data[i - r + j * n] = sr / Math.min(i + 1, n - 1 + w - i, w);
          }
        }
      }
    }

    // TODO Optimize edge cases.
    // TODO Optimize index calculation.
    // TODO Optimize arguments.
    function blurY(source, target, r) {
      var n = source.width,
          m = source.height,
          w = (r << 1) + 1;
      for (var i = 0; i < n; ++i) {
        for (var j = 0, sr = 0; j < m + r; ++j) {
          if (j < m) {
            sr += source.data[i + j * n];
          }
          if (j >= r) {
            if (j >= w) {
              sr -= source.data[i + (j - w) * n];
            }
            target.data[i + (j - r) * n] = sr / Math.min(j + 1, m - 1 + w - j, w);
          }
        }
      }
    }

    function defaultX$1(d) {
      return d[0];
    }

    function defaultY$1(d) {
      return d[1];
    }

    function defaultWeight() {
      return 1;
    }

    function density() {
      var x = defaultX$1,
          y = defaultY$1,
          weight = defaultWeight,
          dx = 960,
          dy = 500,
          r = 20, // blur radius
          k = 2, // log2(grid cell size)
          o = r * 3, // grid offset, to pad for blur
          n = (dx + o * 2) >> k, // grid width
          m = (dy + o * 2) >> k, // grid height
          threshold = constant$5(20);

      function density(data) {
        var values0 = new Float32Array(n * m),
            values1 = new Float32Array(n * m),
            pow2k = Math.pow(2, -k);

        data.forEach(function(d, i, data) {
          var xi = (x(d, i, data) + o) * pow2k,
              yi = (y(d, i, data) + o) * pow2k,
              wi = +weight(d, i, data);
          if (xi >= 0 && xi < n && yi >= 0 && yi < m) {
            var x0 = Math.floor(xi),
                y0 = Math.floor(yi),
                xt = xi - x0 - 0.5,
                yt = yi - y0 - 0.5;
            values0[x0 + y0 * n] += (1 - xt) * (1 - yt) * wi;
            values0[x0 + 1 + y0 * n] += xt * (1 - yt) * wi;
            values0[x0 + 1 + (y0 + 1) * n] += xt * yt * wi;
            values0[x0 + (y0 + 1) * n] += (1 - xt) * yt * wi;
          }
        });

        // TODO Optimize.
        blurX({width: n, height: m, data: values0}, {width: n, height: m, data: values1}, r >> k);
        blurY({width: n, height: m, data: values1}, {width: n, height: m, data: values0}, r >> k);
        blurX({width: n, height: m, data: values0}, {width: n, height: m, data: values1}, r >> k);
        blurY({width: n, height: m, data: values1}, {width: n, height: m, data: values0}, r >> k);
        blurX({width: n, height: m, data: values0}, {width: n, height: m, data: values1}, r >> k);
        blurY({width: n, height: m, data: values1}, {width: n, height: m, data: values0}, r >> k);

        var tz = threshold(values0);

        // Convert number of thresholds into uniform thresholds.
        if (!Array.isArray(tz)) {
          var stop = max$3(values0);
          tz = tickStep(0, stop, tz);
          tz = range$2(0, Math.floor(stop / tz) * tz, tz);
          tz.shift();
        }

        return contours()
            .thresholds(tz)
            .size([n, m])
          (values0)
            .map(transform);
      }

      function transform(geometry) {
        geometry.value *= Math.pow(2, -2 * k); // Density in points per square pixel.
        geometry.coordinates.forEach(transformPolygon);
        return geometry;
      }

      function transformPolygon(coordinates) {
        coordinates.forEach(transformRing);
      }

      function transformRing(coordinates) {
        coordinates.forEach(transformPoint);
      }

      // TODO Optimize.
      function transformPoint(coordinates) {
        coordinates[0] = coordinates[0] * Math.pow(2, k) - o;
        coordinates[1] = coordinates[1] * Math.pow(2, k) - o;
      }

      function resize() {
        o = r * 3;
        n = (dx + o * 2) >> k;
        m = (dy + o * 2) >> k;
        return density;
      }

      density.x = function(_) {
        return arguments.length ? (x = typeof _ === "function" ? _ : constant$5(+_), density) : x;
      };

      density.y = function(_) {
        return arguments.length ? (y = typeof _ === "function" ? _ : constant$5(+_), density) : y;
      };

      density.weight = function(_) {
        return arguments.length ? (weight = typeof _ === "function" ? _ : constant$5(+_), density) : weight;
      };

      density.size = function(_) {
        if (!arguments.length) return [dx, dy];
        var _0 = +_[0], _1 = +_[1];
        if (!(_0 >= 0 && _1 >= 0)) throw new Error("invalid size");
        return dx = _0, dy = _1, resize();
      };

      density.cellSize = function(_) {
        if (!arguments.length) return 1 << k;
        if (!((_ = +_) >= 1)) throw new Error("invalid cell size");
        return k = Math.floor(Math.log(_) / Math.LN2), resize();
      };

      density.thresholds = function(_) {
        return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant$5(slice$1.call(_)) : constant$5(_), density) : threshold;
      };

      density.bandwidth = function(_) {
        if (!arguments.length) return Math.sqrt(r * (r + 1));
        if (!((_ = +_) >= 0)) throw new Error("invalid bandwidth");
        return r = Math.round((Math.sqrt(4 * _ * _ + 1) - 1) / 2), resize();
      };

      return density;
    }

    const epsilon$3 = 1.1102230246251565e-16;
    const splitter = 134217729;
    const resulterrbound = (3 + 8 * epsilon$3) * epsilon$3;

    // fast_expansion_sum_zeroelim routine from oritinal code
    function sum$1(elen, e, flen, f, h) {
        let Q, Qnew, hh, bvirt;
        let enow = e[0];
        let fnow = f[0];
        let eindex = 0;
        let findex = 0;
        if ((fnow > enow) === (fnow > -enow)) {
            Q = enow;
            enow = e[++eindex];
        } else {
            Q = fnow;
            fnow = f[++findex];
        }
        let hindex = 0;
        if (eindex < elen && findex < flen) {
            if ((fnow > enow) === (fnow > -enow)) {
                Qnew = enow + Q;
                hh = Q - (Qnew - enow);
                enow = e[++eindex];
            } else {
                Qnew = fnow + Q;
                hh = Q - (Qnew - fnow);
                fnow = f[++findex];
            }
            Q = Qnew;
            if (hh !== 0) {
                h[hindex++] = hh;
            }
            while (eindex < elen && findex < flen) {
                if ((fnow > enow) === (fnow > -enow)) {
                    Qnew = Q + enow;
                    bvirt = Qnew - Q;
                    hh = Q - (Qnew - bvirt) + (enow - bvirt);
                    enow = e[++eindex];
                } else {
                    Qnew = Q + fnow;
                    bvirt = Qnew - Q;
                    hh = Q - (Qnew - bvirt) + (fnow - bvirt);
                    fnow = f[++findex];
                }
                Q = Qnew;
                if (hh !== 0) {
                    h[hindex++] = hh;
                }
            }
        }
        while (eindex < elen) {
            Qnew = Q + enow;
            bvirt = Qnew - Q;
            hh = Q - (Qnew - bvirt) + (enow - bvirt);
            enow = e[++eindex];
            Q = Qnew;
            if (hh !== 0) {
                h[hindex++] = hh;
            }
        }
        while (findex < flen) {
            Qnew = Q + fnow;
            bvirt = Qnew - Q;
            hh = Q - (Qnew - bvirt) + (fnow - bvirt);
            fnow = f[++findex];
            Q = Qnew;
            if (hh !== 0) {
                h[hindex++] = hh;
            }
        }
        if (Q !== 0 || hindex === 0) {
            h[hindex++] = Q;
        }
        return hindex;
    }

    function estimate(elen, e) {
        let Q = e[0];
        for (let i = 1; i < elen; i++) Q += e[i];
        return Q;
    }

    function vec(n) {
        return new Float64Array(n);
    }

    const ccwerrboundA = (3 + 16 * epsilon$3) * epsilon$3;
    const ccwerrboundB = (2 + 12 * epsilon$3) * epsilon$3;
    const ccwerrboundC = (9 + 64 * epsilon$3) * epsilon$3 * epsilon$3;

    const B = vec(4);
    const C1 = vec(8);
    const C2 = vec(12);
    const D = vec(16);
    const u = vec(4);

    function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
        let acxtail, acytail, bcxtail, bcytail;
        let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;

        const acx = ax - cx;
        const bcx = bx - cx;
        const acy = ay - cy;
        const bcy = by - cy;

        s1 = acx * bcy;
        c = splitter * acx;
        ahi = c - (c - acx);
        alo = acx - ahi;
        c = splitter * bcy;
        bhi = c - (c - bcy);
        blo = bcy - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acy * bcx;
        c = splitter * acy;
        ahi = c - (c - acy);
        alo = acy - ahi;
        c = splitter * bcx;
        bhi = c - (c - bcx);
        blo = bcx - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        B[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        B[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        B[2] = _j - (u3 - bvirt) + (_i - bvirt);
        B[3] = u3;

        let det = estimate(4, B);
        let errbound = ccwerrboundB * detsum;
        if (det >= errbound || -det >= errbound) {
            return det;
        }

        bvirt = ax - acx;
        acxtail = ax - (acx + bvirt) + (bvirt - cx);
        bvirt = bx - bcx;
        bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
        bvirt = ay - acy;
        acytail = ay - (acy + bvirt) + (bvirt - cy);
        bvirt = by - bcy;
        bcytail = by - (bcy + bvirt) + (bvirt - cy);

        if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
            return det;
        }

        errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
        det += (acx * bcytail + bcy * acxtail) - (acy * bcxtail + bcx * acytail);
        if (det >= errbound || -det >= errbound) return det;

        s1 = acxtail * bcy;
        c = splitter * acxtail;
        ahi = c - (c - acxtail);
        alo = acxtail - ahi;
        c = splitter * bcy;
        bhi = c - (c - bcy);
        blo = bcy - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acytail * bcx;
        c = splitter * acytail;
        ahi = c - (c - acytail);
        alo = acytail - ahi;
        c = splitter * bcx;
        bhi = c - (c - bcx);
        blo = bcx - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const C1len = sum$1(4, B, 4, u, C1);

        s1 = acx * bcytail;
        c = splitter * acx;
        ahi = c - (c - acx);
        alo = acx - ahi;
        c = splitter * bcytail;
        bhi = c - (c - bcytail);
        blo = bcytail - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acy * bcxtail;
        c = splitter * acy;
        ahi = c - (c - acy);
        alo = acy - ahi;
        c = splitter * bcxtail;
        bhi = c - (c - bcxtail);
        blo = bcxtail - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const C2len = sum$1(C1len, C1, 4, u, C2);

        s1 = acxtail * bcytail;
        c = splitter * acxtail;
        ahi = c - (c - acxtail);
        alo = acxtail - ahi;
        c = splitter * bcytail;
        bhi = c - (c - bcytail);
        blo = bcytail - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acytail * bcxtail;
        c = splitter * acytail;
        ahi = c - (c - acytail);
        alo = acytail - ahi;
        c = splitter * bcxtail;
        bhi = c - (c - bcxtail);
        blo = bcxtail - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const Dlen = sum$1(C2len, C2, 4, u, D);

        return D[Dlen - 1];
    }

    function orient2d(ax, ay, bx, by, cx, cy) {
        const detleft = (ay - cy) * (bx - cx);
        const detright = (ax - cx) * (by - cy);
        const det = detleft - detright;

        if (detleft === 0 || detright === 0 || (detleft > 0) !== (detright > 0)) return det;

        const detsum = Math.abs(detleft + detright);
        if (Math.abs(det) >= ccwerrboundA * detsum) return det;

        return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
    }

    const EPSILON = Math.pow(2, -52);
    const EDGE_STACK = new Uint32Array(512);

    class Delaunator {

        static from(points, getX = defaultGetX, getY = defaultGetY) {
            const n = points.length;
            const coords = new Float64Array(n * 2);

            for (let i = 0; i < n; i++) {
                const p = points[i];
                coords[2 * i] = getX(p);
                coords[2 * i + 1] = getY(p);
            }

            return new Delaunator(coords);
        }

        constructor(coords) {
            const n = coords.length >> 1;
            if (n > 0 && typeof coords[0] !== 'number') throw new Error('Expected coords to contain numbers.');

            this.coords = coords;

            // arrays that will store the triangulation graph
            const maxTriangles = Math.max(2 * n - 5, 0);
            this._triangles = new Uint32Array(maxTriangles * 3);
            this._halfedges = new Int32Array(maxTriangles * 3);

            // temporary arrays for tracking the edges of the advancing convex hull
            this._hashSize = Math.ceil(Math.sqrt(n));
            this._hullPrev = new Uint32Array(n); // edge to prev edge
            this._hullNext = new Uint32Array(n); // edge to next edge
            this._hullTri = new Uint32Array(n); // edge to adjacent triangle
            this._hullHash = new Int32Array(this._hashSize).fill(-1); // angular edge hash

            // temporary arrays for sorting points
            this._ids = new Uint32Array(n);
            this._dists = new Float64Array(n);

            this.update();
        }

        update() {
            const {coords, _hullPrev: hullPrev, _hullNext: hullNext, _hullTri: hullTri, _hullHash: hullHash} =  this;
            const n = coords.length >> 1;

            // populate an array of point indices; calculate input data bbox
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            for (let i = 0; i < n; i++) {
                const x = coords[2 * i];
                const y = coords[2 * i + 1];
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                this._ids[i] = i;
            }
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;

            let minDist = Infinity;
            let i0, i1, i2;

            // pick a seed point close to the center
            for (let i = 0; i < n; i++) {
                const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
                if (d < minDist) {
                    i0 = i;
                    minDist = d;
                }
            }
            const i0x = coords[2 * i0];
            const i0y = coords[2 * i0 + 1];

            minDist = Infinity;

            // find the point closest to the seed
            for (let i = 0; i < n; i++) {
                if (i === i0) continue;
                const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
                if (d < minDist && d > 0) {
                    i1 = i;
                    minDist = d;
                }
            }
            let i1x = coords[2 * i1];
            let i1y = coords[2 * i1 + 1];

            let minRadius = Infinity;

            // find the third point which forms the smallest circumcircle with the first two
            for (let i = 0; i < n; i++) {
                if (i === i0 || i === i1) continue;
                const r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
                if (r < minRadius) {
                    i2 = i;
                    minRadius = r;
                }
            }
            let i2x = coords[2 * i2];
            let i2y = coords[2 * i2 + 1];

            if (minRadius === Infinity) {
                // order collinear points by dx (or dy if all x are identical)
                // and return the list as a hull
                for (let i = 0; i < n; i++) {
                    this._dists[i] = (coords[2 * i] - coords[0]) || (coords[2 * i + 1] - coords[1]);
                }
                quicksort(this._ids, this._dists, 0, n - 1);
                const hull = new Uint32Array(n);
                let j = 0;
                for (let i = 0, d0 = -Infinity; i < n; i++) {
                    const id = this._ids[i];
                    if (this._dists[id] > d0) {
                        hull[j++] = id;
                        d0 = this._dists[id];
                    }
                }
                this.hull = hull.subarray(0, j);
                this.triangles = new Uint32Array(0);
                this.halfedges = new Uint32Array(0);
                return;
            }

            // swap the order of the seed points for counter-clockwise orientation
            if (orient2d(i0x, i0y, i1x, i1y, i2x, i2y) < 0) {
                const i = i1;
                const x = i1x;
                const y = i1y;
                i1 = i2;
                i1x = i2x;
                i1y = i2y;
                i2 = i;
                i2x = x;
                i2y = y;
            }

            const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
            this._cx = center.x;
            this._cy = center.y;

            for (let i = 0; i < n; i++) {
                this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
            }

            // sort the points by distance from the seed triangle circumcenter
            quicksort(this._ids, this._dists, 0, n - 1);

            // set up the seed triangle as the starting hull
            this._hullStart = i0;
            let hullSize = 3;

            hullNext[i0] = hullPrev[i2] = i1;
            hullNext[i1] = hullPrev[i0] = i2;
            hullNext[i2] = hullPrev[i1] = i0;

            hullTri[i0] = 0;
            hullTri[i1] = 1;
            hullTri[i2] = 2;

            hullHash.fill(-1);
            hullHash[this._hashKey(i0x, i0y)] = i0;
            hullHash[this._hashKey(i1x, i1y)] = i1;
            hullHash[this._hashKey(i2x, i2y)] = i2;

            this.trianglesLen = 0;
            this._addTriangle(i0, i1, i2, -1, -1, -1);

            for (let k = 0, xp, yp; k < this._ids.length; k++) {
                const i = this._ids[k];
                const x = coords[2 * i];
                const y = coords[2 * i + 1];

                // skip near-duplicate points
                if (k > 0 && Math.abs(x - xp) <= EPSILON && Math.abs(y - yp) <= EPSILON) continue;
                xp = x;
                yp = y;

                // skip seed triangle points
                if (i === i0 || i === i1 || i === i2) continue;

                // find a visible edge on the convex hull using edge hash
                let start = 0;
                for (let j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
                    start = hullHash[(key + j) % this._hashSize];
                    if (start !== -1 && start !== hullNext[start]) break;
                }

                start = hullPrev[start];
                let e = start, q;
                while (q = hullNext[e], orient2d(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1]) >= 0) {
                    e = q;
                    if (e === start) {
                        e = -1;
                        break;
                    }
                }
                if (e === -1) continue; // likely a near-duplicate point; skip it

                // add the first triangle from the point
                let t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);

                // recursively flip triangles from the point until they satisfy the Delaunay condition
                hullTri[i] = this._legalize(t + 2);
                hullTri[e] = t; // keep track of boundary triangles on the hull
                hullSize++;

                // walk forward through the hull, adding more triangles and flipping recursively
                let n = hullNext[e];
                while (q = hullNext[n], orient2d(x, y, coords[2 * n], coords[2 * n + 1], coords[2 * q], coords[2 * q + 1]) < 0) {
                    t = this._addTriangle(n, i, q, hullTri[i], -1, hullTri[n]);
                    hullTri[i] = this._legalize(t + 2);
                    hullNext[n] = n; // mark as removed
                    hullSize--;
                    n = q;
                }

                // walk backward from the other side, adding more triangles and flipping
                if (e === start) {
                    while (q = hullPrev[e], orient2d(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1]) < 0) {
                        t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
                        this._legalize(t + 2);
                        hullTri[q] = t;
                        hullNext[e] = e; // mark as removed
                        hullSize--;
                        e = q;
                    }
                }

                // update the hull indices
                this._hullStart = hullPrev[i] = e;
                hullNext[e] = hullPrev[n] = i;
                hullNext[i] = n;

                // save the two new edges in the hash table
                hullHash[this._hashKey(x, y)] = i;
                hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
            }

            this.hull = new Uint32Array(hullSize);
            for (let i = 0, e = this._hullStart; i < hullSize; i++) {
                this.hull[i] = e;
                e = hullNext[e];
            }

            // trim typed triangle mesh arrays
            this.triangles = this._triangles.subarray(0, this.trianglesLen);
            this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
        }

        _hashKey(x, y) {
            return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
        }

        _legalize(a) {
            const {_triangles: triangles, _halfedges: halfedges, coords} = this;

            let i = 0;
            let ar = 0;

            // recursion eliminated with a fixed-size stack
            while (true) {
                const b = halfedges[a];

                /* if the pair of triangles doesn't satisfy the Delaunay condition
                 * (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
                 * then do the same check/flip recursively for the new pair of triangles
                 *
                 *           pl                    pl
                 *          /||\                  /  \
                 *       al/ || \bl            al/    \a
                 *        /  ||  \              /      \
                 *       /  a||b  \    flip    /___ar___\
                 *     p0\   ||   /p1   =>   p0\---bl---/p1
                 *        \  ||  /              \      /
                 *       ar\ || /br             b\    /br
                 *          \||/                  \  /
                 *           pr                    pr
                 */
                const a0 = a - a % 3;
                ar = a0 + (a + 2) % 3;

                if (b === -1) { // convex hull edge
                    if (i === 0) break;
                    a = EDGE_STACK[--i];
                    continue;
                }

                const b0 = b - b % 3;
                const al = a0 + (a + 1) % 3;
                const bl = b0 + (b + 2) % 3;

                const p0 = triangles[ar];
                const pr = triangles[a];
                const pl = triangles[al];
                const p1 = triangles[bl];

                const illegal = inCircle(
                    coords[2 * p0], coords[2 * p0 + 1],
                    coords[2 * pr], coords[2 * pr + 1],
                    coords[2 * pl], coords[2 * pl + 1],
                    coords[2 * p1], coords[2 * p1 + 1]);

                if (illegal) {
                    triangles[a] = p1;
                    triangles[b] = p0;

                    const hbl = halfedges[bl];

                    // edge swapped on the other side of the hull (rare); fix the halfedge reference
                    if (hbl === -1) {
                        let e = this._hullStart;
                        do {
                            if (this._hullTri[e] === bl) {
                                this._hullTri[e] = a;
                                break;
                            }
                            e = this._hullPrev[e];
                        } while (e !== this._hullStart);
                    }
                    this._link(a, hbl);
                    this._link(b, halfedges[ar]);
                    this._link(ar, bl);

                    const br = b0 + (b + 1) % 3;

                    // don't worry about hitting the cap: it can only happen on extremely degenerate input
                    if (i < EDGE_STACK.length) {
                        EDGE_STACK[i++] = br;
                    }
                } else {
                    if (i === 0) break;
                    a = EDGE_STACK[--i];
                }
            }

            return ar;
        }

        _link(a, b) {
            this._halfedges[a] = b;
            if (b !== -1) this._halfedges[b] = a;
        }

        // add a new triangle given vertex indices and adjacent half-edge ids
        _addTriangle(i0, i1, i2, a, b, c) {
            const t = this.trianglesLen;

            this._triangles[t] = i0;
            this._triangles[t + 1] = i1;
            this._triangles[t + 2] = i2;

            this._link(t, a);
            this._link(t + 1, b);
            this._link(t + 2, c);

            this.trianglesLen += 3;

            return t;
        }
    }

    // monotonically increases with real angle, but doesn't need expensive trigonometry
    function pseudoAngle(dx, dy) {
        const p = dx / (Math.abs(dx) + Math.abs(dy));
        return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
    }

    function dist(ax, ay, bx, by) {
        const dx = ax - bx;
        const dy = ay - by;
        return dx * dx + dy * dy;
    }

    function inCircle(ax, ay, bx, by, cx, cy, px, py) {
        const dx = ax - px;
        const dy = ay - py;
        const ex = bx - px;
        const ey = by - py;
        const fx = cx - px;
        const fy = cy - py;

        const ap = dx * dx + dy * dy;
        const bp = ex * ex + ey * ey;
        const cp = fx * fx + fy * fy;

        return dx * (ey * cp - bp * fy) -
               dy * (ex * cp - bp * fx) +
               ap * (ex * fy - ey * fx) < 0;
    }

    function circumradius(ax, ay, bx, by, cx, cy) {
        const dx = bx - ax;
        const dy = by - ay;
        const ex = cx - ax;
        const ey = cy - ay;

        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const d = 0.5 / (dx * ey - dy * ex);

        const x = (ey * bl - dy * cl) * d;
        const y = (dx * cl - ex * bl) * d;

        return x * x + y * y;
    }

    function circumcenter(ax, ay, bx, by, cx, cy) {
        const dx = bx - ax;
        const dy = by - ay;
        const ex = cx - ax;
        const ey = cy - ay;

        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const d = 0.5 / (dx * ey - dy * ex);

        const x = ax + (ey * bl - dy * cl) * d;
        const y = ay + (dx * cl - ex * bl) * d;

        return {x, y};
    }

    function quicksort(ids, dists, left, right) {
        if (right - left <= 20) {
            for (let i = left + 1; i <= right; i++) {
                const temp = ids[i];
                const tempDist = dists[temp];
                let j = i - 1;
                while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
                ids[j + 1] = temp;
            }
        } else {
            const median = (left + right) >> 1;
            let i = left + 1;
            let j = right;
            swap(ids, median, i);
            if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
            if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
            if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);

            const temp = ids[i];
            const tempDist = dists[temp];
            while (true) {
                do i++; while (dists[ids[i]] < tempDist);
                do j--; while (dists[ids[j]] > tempDist);
                if (j < i) break;
                swap(ids, i, j);
            }
            ids[left + 1] = ids[j];
            ids[j] = temp;

            if (right - i + 1 >= j - left) {
                quicksort(ids, dists, i, right);
                quicksort(ids, dists, left, j - 1);
            } else {
                quicksort(ids, dists, left, j - 1);
                quicksort(ids, dists, i, right);
            }
        }
    }

    function swap(arr, i, j) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    function defaultGetX(p) {
        return p[0];
    }
    function defaultGetY(p) {
        return p[1];
    }

    const epsilon$2 = 1e-6;

    class Path {
      constructor() {
        this._x0 = this._y0 = // start of current subpath
        this._x1 = this._y1 = null; // end of current subpath
        this._ = "";
      }
      moveTo(x, y) {
        this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
      }
      closePath() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      }
      lineTo(x, y) {
        this._ += `L${this._x1 = +x},${this._y1 = +y}`;
      }
      arc(x, y, r) {
        x = +x, y = +y, r = +r;
        const x0 = x + r;
        const y0 = y;
        if (r < 0) throw new Error("negative radius");
        if (this._x1 === null) this._ += `M${x0},${y0}`;
        else if (Math.abs(this._x1 - x0) > epsilon$2 || Math.abs(this._y1 - y0) > epsilon$2) this._ += "L" + x0 + "," + y0;
        if (!r) return;
        this._ += `A${r},${r},0,1,1,${x - r},${y}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`;
      }
      rect(x, y, w, h) {
        this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${+w}v${+h}h${-w}Z`;
      }
      value() {
        return this._ || null;
      }
    }

    class Polygon {
      constructor() {
        this._ = [];
      }
      moveTo(x, y) {
        this._.push([x, y]);
      }
      closePath() {
        this._.push(this._[0].slice());
      }
      lineTo(x, y) {
        this._.push([x, y]);
      }
      value() {
        return this._.length ? this._ : null;
      }
    }

    class Voronoi {
      constructor(delaunay, [xmin, ymin, xmax, ymax] = [0, 0, 960, 500]) {
        if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
        this.delaunay = delaunay;
        this._circumcenters = new Float64Array(delaunay.points.length * 2);
        this.vectors = new Float64Array(delaunay.points.length * 2);
        this.xmax = xmax, this.xmin = xmin;
        this.ymax = ymax, this.ymin = ymin;
        this._init();
      }
      update() {
        this.delaunay.update();
        this._init();
        return this;
      }
      _init() {
        const {delaunay: {points, hull, triangles}, vectors} = this;

        // Compute circumcenters.
        const circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);
        for (let i = 0, j = 0, n = triangles.length, x, y; i < n; i += 3, j += 2) {
          const t1 = triangles[i] * 2;
          const t2 = triangles[i + 1] * 2;
          const t3 = triangles[i + 2] * 2;
          const x1 = points[t1];
          const y1 = points[t1 + 1];
          const x2 = points[t2];
          const y2 = points[t2 + 1];
          const x3 = points[t3];
          const y3 = points[t3 + 1];

          const dx = x2 - x1;
          const dy = y2 - y1;
          const ex = x3 - x1;
          const ey = y3 - y1;
          const ab = (dx * ey - dy * ex) * 2;

          if (Math.abs(ab) < 1e-9) {
            // degenerate case (collinear diagram)
            // almost equal points (degenerate triangle)
            // the circumcenter is at the infinity, in a
            // direction that is:
            // 1. orthogonal to the halfedge.
            let a = 1e9;
            // 2. points away from the center; since the list of triangles starts
            // in the center, the first point of the first triangle
            // will be our reference
            const r = triangles[0] * 2;
            a *= Math.sign((points[r] - x1) * ey - (points[r + 1] - y1) * ex);
            x = (x1 + x3) / 2 - a * ey;
            y = (y1 + y3) / 2 + a * ex;
          } else {
            const d = 1 / ab;
            const bl = dx * dx + dy * dy;
            const cl = ex * ex + ey * ey;
            x = x1 + (ey * bl - dy * cl) * d;
            y = y1 + (dx * cl - ex * bl) * d;
          }
          circumcenters[j] = x;
          circumcenters[j + 1] = y;
        }

        // Compute exterior cell rays.
        let h = hull[hull.length - 1];
        let p0, p1 = h * 4;
        let x0, x1 = points[2 * h];
        let y0, y1 = points[2 * h + 1];
        vectors.fill(0);
        for (let i = 0; i < hull.length; ++i) {
          h = hull[i];
          p0 = p1, x0 = x1, y0 = y1;
          p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
          vectors[p0 + 2] = vectors[p1] = y0 - y1;
          vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
        }
      }
      render(context) {
        const buffer = context == null ? context = new Path : undefined;
        const {delaunay: {halfedges, inedges, hull}, circumcenters, vectors} = this;
        if (hull.length <= 1) return null;
        for (let i = 0, n = halfedges.length; i < n; ++i) {
          const j = halfedges[i];
          if (j < i) continue;
          const ti = Math.floor(i / 3) * 2;
          const tj = Math.floor(j / 3) * 2;
          const xi = circumcenters[ti];
          const yi = circumcenters[ti + 1];
          const xj = circumcenters[tj];
          const yj = circumcenters[tj + 1];
          this._renderSegment(xi, yi, xj, yj, context);
        }
        let h0, h1 = hull[hull.length - 1];
        for (let i = 0; i < hull.length; ++i) {
          h0 = h1, h1 = hull[i];
          const t = Math.floor(inedges[h1] / 3) * 2;
          const x = circumcenters[t];
          const y = circumcenters[t + 1];
          const v = h0 * 4;
          const p = this._project(x, y, vectors[v + 2], vectors[v + 3]);
          if (p) this._renderSegment(x, y, p[0], p[1], context);
        }
        return buffer && buffer.value();
      }
      renderBounds(context) {
        const buffer = context == null ? context = new Path : undefined;
        context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
        return buffer && buffer.value();
      }
      renderCell(i, context) {
        const buffer = context == null ? context = new Path : undefined;
        const points = this._clip(i);
        if (points === null || !points.length) return;
        context.moveTo(points[0], points[1]);
        let n = points.length;
        while (points[0] === points[n-2] && points[1] === points[n-1] && n > 1) n -= 2;
        for (let i = 2; i < n; i += 2) {
          if (points[i] !== points[i-2] || points[i+1] !== points[i-1])
            context.lineTo(points[i], points[i + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
      }
      *cellPolygons() {
        const {delaunay: {points}} = this;
        for (let i = 0, n = points.length / 2; i < n; ++i) {
          const cell = this.cellPolygon(i);
          if (cell) cell.index = i, yield cell;
        }
      }
      cellPolygon(i) {
        const polygon = new Polygon;
        this.renderCell(i, polygon);
        return polygon.value();
      }
      _renderSegment(x0, y0, x1, y1, context) {
        let S;
        const c0 = this._regioncode(x0, y0);
        const c1 = this._regioncode(x1, y1);
        if (c0 === 0 && c1 === 0) {
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
        } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
          context.moveTo(S[0], S[1]);
          context.lineTo(S[2], S[3]);
        }
      }
      contains(i, x, y) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
        return this.delaunay._step(i, x, y) === i;
      }
      *neighbors(i) {
        const ci = this._clip(i);
        if (ci) for (const j of this.delaunay.neighbors(i)) {
          const cj = this._clip(j);
          // find the common edge
          if (cj) loop: for (let ai = 0, li = ci.length; ai < li; ai += 2) {
            for (let aj = 0, lj = cj.length; aj < lj; aj += 2) {
              if (ci[ai] == cj[aj]
              && ci[ai + 1] == cj[aj + 1]
              && ci[(ai + 2) % li] == cj[(aj + lj - 2) % lj]
              && ci[(ai + 3) % li] == cj[(aj + lj - 1) % lj]
              ) {
                yield j;
                break loop;
              }
            }
          }
        }
      }
      _cell(i) {
        const {circumcenters, delaunay: {inedges, halfedges, triangles}} = this;
        const e0 = inedges[i];
        if (e0 === -1) return null; // coincident point
        const points = [];
        let e = e0;
        do {
          const t = Math.floor(e / 3);
          points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation
          e = halfedges[e];
        } while (e !== e0 && e !== -1);
        return points;
      }
      _clip(i) {
        // degenerate case (1 valid point: return the box)
        if (i === 0 && this.delaunay.hull.length === 1) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        const points = this._cell(i);
        if (points === null) return null;
        const {vectors: V} = this;
        const v = i * 4;
        return V[v] || V[v + 1]
            ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3])
            : this._clipFinite(i, points);
      }
      _clipFinite(i, points) {
        const n = points.length;
        let P = null;
        let x0, y0, x1 = points[n - 2], y1 = points[n - 1];
        let c0, c1 = this._regioncode(x1, y1);
        let e0, e1 = 0;
        for (let j = 0; j < n; j += 2) {
          x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
          c0 = c1, c1 = this._regioncode(x1, y1);
          if (c0 === 0 && c1 === 0) {
            e0 = e1, e1 = 0;
            if (P) P.push(x1, y1);
            else P = [x1, y1];
          } else {
            let S, sx0, sy0, sx1, sy1;
            if (c0 === 0) {
              if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
              [sx0, sy0, sx1, sy1] = S;
            } else {
              if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
              [sx1, sy1, sx0, sy0] = S;
              e0 = e1, e1 = this._edgecode(sx0, sy0);
              if (e0 && e1) this._edge(i, e0, e1, P, P.length);
              if (P) P.push(sx0, sy0);
              else P = [sx0, sy0];
            }
            e0 = e1, e1 = this._edgecode(sx1, sy1);
            if (e0 && e1) this._edge(i, e0, e1, P, P.length);
            if (P) P.push(sx1, sy1);
            else P = [sx1, sy1];
          }
        }
        if (P) {
          e0 = e1, e1 = this._edgecode(P[0], P[1]);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        return P;
      }
      _clipSegment(x0, y0, x1, y1, c0, c1) {
        while (true) {
          if (c0 === 0 && c1 === 0) return [x0, y0, x1, y1];
          if (c0 & c1) return null;
          let x, y, c = c0 || c1;
          if (c & 0b1000) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;
          else if (c & 0b0100) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;
          else if (c & 0b0010) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;
          else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
          if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);
          else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
        }
      }
      _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
        let P = Array.from(points), p;
        if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
        if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);
        if (P = this._clipFinite(i, P)) {
          for (let j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
            c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
            if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
          }
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
        }
        return P;
      }
      _edge(i, e0, e1, P, j) {
        while (e0 !== e1) {
          let x, y;
          switch (e0) {
            case 0b0101: e0 = 0b0100; continue; // top-left
            case 0b0100: e0 = 0b0110, x = this.xmax, y = this.ymin; break; // top
            case 0b0110: e0 = 0b0010; continue; // top-right
            case 0b0010: e0 = 0b1010, x = this.xmax, y = this.ymax; break; // right
            case 0b1010: e0 = 0b1000; continue; // bottom-right
            case 0b1000: e0 = 0b1001, x = this.xmin, y = this.ymax; break; // bottom
            case 0b1001: e0 = 0b0001; continue; // bottom-left
            case 0b0001: e0 = 0b0101, x = this.xmin, y = this.ymin; break; // left
          }
          // Note: this implicitly checks for out of bounds: if P[j] or P[j+1] are
          // undefined, the conditional statement will be executed.
          if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
            P.splice(j, 0, x, y), j += 2;
          }
        }
        if (P.length > 4) {
          for (let i = 0; i < P.length; i+= 2) {
            const j = (i + 2) % P.length, k = (i + 4) % P.length;
            if (P[i] === P[j] && P[j] === P[k]
            || P[i + 1] === P[j + 1] && P[j + 1] === P[k + 1])
              P.splice(j, 2), i -= 2;
          }
        }
        return j;
      }
      _project(x0, y0, vx, vy) {
        let t = Infinity, c, x, y;
        if (vy < 0) { // top
          if (y0 <= this.ymin) return null;
          if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
        } else if (vy > 0) { // bottom
          if (y0 >= this.ymax) return null;
          if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
        }
        if (vx > 0) { // right
          if (x0 >= this.xmax) return null;
          if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
        } else if (vx < 0) { // left
          if (x0 <= this.xmin) return null;
          if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
        }
        return [x, y];
      }
      _edgecode(x, y) {
        return (x === this.xmin ? 0b0001
            : x === this.xmax ? 0b0010 : 0b0000)
            | (y === this.ymin ? 0b0100
            : y === this.ymax ? 0b1000 : 0b0000);
      }
      _regioncode(x, y) {
        return (x < this.xmin ? 0b0001
            : x > this.xmax ? 0b0010 : 0b0000)
            | (y < this.ymin ? 0b0100
            : y > this.ymax ? 0b1000 : 0b0000);
      }
    }

    const tau$2 = 2 * Math.PI, pow$2 = Math.pow;

    function pointX(p) {
      return p[0];
    }

    function pointY(p) {
      return p[1];
    }

    // A triangulation is collinear if all its triangles have a non-null area
    function collinear(d) {
      const {triangles, coords} = d;
      for (let i = 0; i < triangles.length; i += 3) {
        const a = 2 * triangles[i],
              b = 2 * triangles[i + 1],
              c = 2 * triangles[i + 2],
              cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1])
                    - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
        if (cross > 1e-10) return false;
      }
      return true;
    }

    function jitter(x, y, r) {
      return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
    }

    class Delaunay {
      static from(points, fx = pointX, fy = pointY, that) {
        return new Delaunay("length" in points
            ? flatArray(points, fx, fy, that)
            : Float64Array.from(flatIterable(points, fx, fy, that)));
      }
      constructor(points) {
        this._delaunator = new Delaunator(points);
        this.inedges = new Int32Array(points.length / 2);
        this._hullIndex = new Int32Array(points.length / 2);
        this.points = this._delaunator.coords;
        this._init();
      }
      update() {
        this._delaunator.update();
        this._init();
        return this;
      }
      _init() {
        const d = this._delaunator, points = this.points;

        // check for collinear
        if (d.hull && d.hull.length > 2 && collinear(d)) {
          this.collinear = Int32Array.from({length: points.length/2}, (_,i) => i)
            .sort((i, j) => points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1]); // for exact neighbors
          const e = this.collinear[0], f = this.collinear[this.collinear.length - 1],
            bounds = [ points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1] ],
            r = 1e-8 * Math.hypot(bounds[3] - bounds[1], bounds[2] - bounds[0]);
          for (let i = 0, n = points.length / 2; i < n; ++i) {
            const p = jitter(points[2 * i], points[2 * i + 1], r);
            points[2 * i] = p[0];
            points[2 * i + 1] = p[1];
          }
          this._delaunator = new Delaunator(points);
        } else {
          delete this.collinear;
        }

        const halfedges = this.halfedges = this._delaunator.halfedges;
        const hull = this.hull = this._delaunator.hull;
        const triangles = this.triangles = this._delaunator.triangles;
        const inedges = this.inedges.fill(-1);
        const hullIndex = this._hullIndex.fill(-1);

        // Compute an index from each point to an (arbitrary) incoming halfedge
        // Used to give the first neighbor of each point; for this reason,
        // on the hull we give priority to exterior halfedges
        for (let e = 0, n = halfedges.length; e < n; ++e) {
          const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
          if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
        }
        for (let i = 0, n = hull.length; i < n; ++i) {
          hullIndex[hull[i]] = i;
        }

        // degenerate case: 1 or 2 (distinct) points
        if (hull.length <= 2 && hull.length > 0) {
          this.triangles = new Int32Array(3).fill(-1);
          this.halfedges = new Int32Array(3).fill(-1);
          this.triangles[0] = hull[0];
          inedges[hull[0]] = 1;
          if (hull.length === 2) {
            inedges[hull[1]] = 0;
            this.triangles[1] = hull[1];
            this.triangles[2] = hull[1];
          }
        }
      }
      voronoi(bounds) {
        return new Voronoi(this, bounds);
      }
      *neighbors(i) {
        const {inedges, hull, _hullIndex, halfedges, triangles, collinear} = this;

        // degenerate case with several collinear points
        if (collinear) {
          const l = collinear.indexOf(i);
          if (l > 0) yield collinear[l - 1];
          if (l < collinear.length - 1) yield collinear[l + 1];
          return;
        }

        const e0 = inedges[i];
        if (e0 === -1) return; // coincident point
        let e = e0, p0 = -1;
        do {
          yield p0 = triangles[e];
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) return; // bad triangulation
          e = halfedges[e];
          if (e === -1) {
            const p = hull[(_hullIndex[i] + 1) % hull.length];
            if (p !== p0) yield p;
            return;
          }
        } while (e !== e0);
      }
      find(x, y, i = 0) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
        const i0 = i;
        let c;
        while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) i = c;
        return c;
      }
      _step(i, x, y) {
        const {inedges, hull, _hullIndex, halfedges, triangles, points} = this;
        if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
        let c = i;
        let dc = pow$2(x - points[i * 2], 2) + pow$2(y - points[i * 2 + 1], 2);
        const e0 = inedges[i];
        let e = e0;
        do {
          let t = triangles[e];
          const dt = pow$2(x - points[t * 2], 2) + pow$2(y - points[t * 2 + 1], 2);
          if (dt < dc) dc = dt, c = t;
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation
          e = halfedges[e];
          if (e === -1) {
            e = hull[(_hullIndex[i] + 1) % hull.length];
            if (e !== t) {
              if (pow$2(x - points[e * 2], 2) + pow$2(y - points[e * 2 + 1], 2) < dc) return e;
            }
            break;
          }
        } while (e !== e0);
        return c;
      }
      render(context) {
        const buffer = context == null ? context = new Path : undefined;
        const {points, halfedges, triangles} = this;
        for (let i = 0, n = halfedges.length; i < n; ++i) {
          const j = halfedges[i];
          if (j < i) continue;
          const ti = triangles[i] * 2;
          const tj = triangles[j] * 2;
          context.moveTo(points[ti], points[ti + 1]);
          context.lineTo(points[tj], points[tj + 1]);
        }
        this.renderHull(context);
        return buffer && buffer.value();
      }
      renderPoints(context, r) {
        if (r === undefined && (!context || typeof context.moveTo !== "function")) r = context, context = null;
        r = r == undefined ? 2 : +r;
        const buffer = context == null ? context = new Path : undefined;
        const {points} = this;
        for (let i = 0, n = points.length; i < n; i += 2) {
          const x = points[i], y = points[i + 1];
          context.moveTo(x + r, y);
          context.arc(x, y, r, 0, tau$2);
        }
        return buffer && buffer.value();
      }
      renderHull(context) {
        const buffer = context == null ? context = new Path : undefined;
        const {hull, points} = this;
        const h = hull[0] * 2, n = hull.length;
        context.moveTo(points[h], points[h + 1]);
        for (let i = 1; i < n; ++i) {
          const h = 2 * hull[i];
          context.lineTo(points[h], points[h + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
      }
      hullPolygon() {
        const polygon = new Polygon;
        this.renderHull(polygon);
        return polygon.value();
      }
      renderTriangle(i, context) {
        const buffer = context == null ? context = new Path : undefined;
        const {points, triangles} = this;
        const t0 = triangles[i *= 3] * 2;
        const t1 = triangles[i + 1] * 2;
        const t2 = triangles[i + 2] * 2;
        context.moveTo(points[t0], points[t0 + 1]);
        context.lineTo(points[t1], points[t1 + 1]);
        context.lineTo(points[t2], points[t2 + 1]);
        context.closePath();
        return buffer && buffer.value();
      }
      *trianglePolygons() {
        const {triangles} = this;
        for (let i = 0, n = triangles.length / 3; i < n; ++i) {
          yield this.trianglePolygon(i);
        }
      }
      trianglePolygon(i) {
        const polygon = new Polygon;
        this.renderTriangle(i, polygon);
        return polygon.value();
      }
    }

    function flatArray(points, fx, fy, that) {
      const n = points.length;
      const array = new Float64Array(n * 2);
      for (let i = 0; i < n; ++i) {
        const p = points[i];
        array[i * 2] = fx.call(that, p, i, points);
        array[i * 2 + 1] = fy.call(that, p, i, points);
      }
      return array;
    }

    function* flatIterable(points, fx, fy, that) {
      let i = 0;
      for (const p of points) {
        yield fx.call(that, p, i, points);
        yield fy.call(that, p, i, points);
        ++i;
      }
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad$2(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear$1(year) {
      return year < 0 ? "-" + pad$2(-year, 6)
        : year > 9999 ? "+" + pad$2(year, 6)
        : pad$2(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear$1(date.getUTCFullYear()) + "-" + pad$2(date.getUTCMonth() + 1, 2) + "-" + pad$2(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad$2(hours, 2) + ":" + pad$2(minutes, 2) + ":" + pad$2(seconds, 2) + "." + pad$2(milliseconds, 3) + "Z"
          : seconds ? "T" + pad$2(hours, 2) + ":" + pad$2(minutes, 2) + ":" + pad$2(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad$2(hours, 2) + ":" + pad$2(minutes, 2) + "Z"
          : "");
    }

    function dsvFormat(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv$1 = dsvFormat(",");

    var csvParse = csv$1.parse;
    var csvParseRows = csv$1.parseRows;
    var csvFormat = csv$1.format;
    var csvFormatBody = csv$1.formatBody;
    var csvFormatRows = csv$1.formatRows;
    var csvFormatRow = csv$1.formatRow;
    var csvFormatValue = csv$1.formatValue;

    var tsv$1 = dsvFormat("\t");

    var tsvParse = tsv$1.parse;
    var tsvParseRows = tsv$1.parseRows;
    var tsvFormat = tsv$1.format;
    var tsvFormatBody = tsv$1.formatBody;
    var tsvFormatRows = tsv$1.formatRows;
    var tsvFormatRow = tsv$1.formatRow;
    var tsvFormatValue = tsv$1.formatValue;

    function autoType(object) {
      for (var key in object) {
        var value = object[key].trim(), number, m;
        if (!value) value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "NaN") value = NaN;
        else if (!isNaN(number = +value)) value = number;
        else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
          if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
          value = new Date(value);
        }
        else continue;
        object[key] = value;
      }
      return object;
    }

    // https://github.com/d3/d3-dsv/issues/45
    const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

    function responseBlob(response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      return response.blob();
    }

    function blob(input, init) {
      return fetch(input, init).then(responseBlob);
    }

    function responseArrayBuffer(response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      return response.arrayBuffer();
    }

    function buffer(input, init) {
      return fetch(input, init).then(responseArrayBuffer);
    }

    function responseText(response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      return response.text();
    }

    function text(input, init) {
      return fetch(input, init).then(responseText);
    }

    function dsvParse(parse) {
      return function(input, init, row) {
        if (arguments.length === 2 && typeof init === "function") row = init, init = undefined;
        return text(input, init).then(function(response) {
          return parse(response, row);
        });
      };
    }

    function dsv(delimiter, input, init, row) {
      if (arguments.length === 3 && typeof init === "function") row = init, init = undefined;
      var format = dsvFormat(delimiter);
      return text(input, init).then(function(response) {
        return format.parse(response, row);
      });
    }

    var csv = dsvParse(csvParse);
    var tsv = dsvParse(tsvParse);

    function image(input, init) {
      return new Promise(function(resolve, reject) {
        var image = new Image;
        for (var key in init) image[key] = init[key];
        image.onerror = reject;
        image.onload = function() { resolve(image); };
        image.src = input;
      });
    }

    function responseJson(response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      if (response.status === 204 || response.status === 205) return;
      return response.json();
    }

    function json(input, init) {
      return fetch(input, init).then(responseJson);
    }

    function parser(type) {
      return (input, init) => text(input, init)
        .then(text => (new DOMParser).parseFromString(text, type));
    }

    var xml = parser("application/xml");

    var html = parser("text/html");

    var svg = parser("image/svg+xml");

    function center(x, y) {
      var nodes, strength = 1;

      if (x == null) x = 0;
      if (y == null) y = 0;

      function force() {
        var i,
            n = nodes.length,
            node,
            sx = 0,
            sy = 0;

        for (i = 0; i < n; ++i) {
          node = nodes[i], sx += node.x, sy += node.y;
        }

        for (sx = (sx / n - x) * strength, sy = (sy / n - y) * strength, i = 0; i < n; ++i) {
          node = nodes[i], node.x -= sx, node.y -= sy;
        }
      }

      force.initialize = function(_) {
        nodes = _;
      };

      force.x = function(_) {
        return arguments.length ? (x = +_, force) : x;
      };

      force.y = function(_) {
        return arguments.length ? (y = +_, force) : y;
      };

      force.strength = function(_) {
        return arguments.length ? (strength = +_, force) : strength;
      };

      return force;
    }

    function tree_add(d) {
      const x = +this._x.call(null, d),
          y = +this._y.call(null, d);
      return add(this.cover(x, y), x, y, d);
    }

    function add(tree, x, y, d) {
      if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

      var parent,
          node = tree._root,
          leaf = {data: d},
          x0 = tree._x0,
          y0 = tree._y0,
          x1 = tree._x1,
          y1 = tree._y1,
          xm,
          ym,
          xp,
          yp,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return tree._root = leaf, tree;

      // Find the existing leaf for the new point, or add it.
      while (node.length) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
      }

      // Is the new point is exactly coincident with the existing point?
      xp = +tree._x.call(null, node.data);
      yp = +tree._y.call(null, node.data);
      if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

      // Otherwise, split the leaf node until the old and new point are separated.
      do {
        parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
      return parent[j] = node, parent[i] = leaf, tree;
    }

    function addAll(data) {
      var d, i, n = data.length,
          x,
          y,
          xz = new Array(n),
          yz = new Array(n),
          x0 = Infinity,
          y0 = Infinity,
          x1 = -Infinity,
          y1 = -Infinity;

      // Compute the points and their extent.
      for (i = 0; i < n; ++i) {
        if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
        xz[i] = x;
        yz[i] = y;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }

      // If there were no (valid) points, abort.
      if (x0 > x1 || y0 > y1) return this;

      // Expand the tree to cover the new points.
      this.cover(x0, y0).cover(x1, y1);

      // Add the new points.
      for (i = 0; i < n; ++i) {
        add(this, xz[i], yz[i], data[i]);
      }

      return this;
    }

    function tree_cover(x, y) {
      if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

      var x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1;

      // If the quadtree has no extent, initialize them.
      // Integer extent are necessary so that if we later double the extent,
      // the existing quadrant boundaries don’t change due to floating point error!
      if (isNaN(x0)) {
        x1 = (x0 = Math.floor(x)) + 1;
        y1 = (y0 = Math.floor(y)) + 1;
      }

      // Otherwise, double repeatedly to cover.
      else {
        var z = x1 - x0 || 1,
            node = this._root,
            parent,
            i;

        while (x0 > x || x >= x1 || y0 > y || y >= y1) {
          i = (y < y0) << 1 | (x < x0);
          parent = new Array(4), parent[i] = node, node = parent, z *= 2;
          switch (i) {
            case 0: x1 = x0 + z, y1 = y0 + z; break;
            case 1: x0 = x1 - z, y1 = y0 + z; break;
            case 2: x1 = x0 + z, y0 = y1 - z; break;
            case 3: x0 = x1 - z, y0 = y1 - z; break;
          }
        }

        if (this._root && this._root.length) this._root = node;
      }

      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      return this;
    }

    function tree_data() {
      var data = [];
      this.visit(function(node) {
        if (!node.length) do data.push(node.data); while (node = node.next)
      });
      return data;
    }

    function tree_extent(_) {
      return arguments.length
          ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
          : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
    }

    function Quad(node, x0, y0, x1, y1) {
      this.node = node;
      this.x0 = x0;
      this.y0 = y0;
      this.x1 = x1;
      this.y1 = y1;
    }

    function tree_find(x, y, radius) {
      var data,
          x0 = this._x0,
          y0 = this._y0,
          x1,
          y1,
          x2,
          y2,
          x3 = this._x1,
          y3 = this._y1,
          quads = [],
          node = this._root,
          q,
          i;

      if (node) quads.push(new Quad(node, x0, y0, x3, y3));
      if (radius == null) radius = Infinity;
      else {
        x0 = x - radius, y0 = y - radius;
        x3 = x + radius, y3 = y + radius;
        radius *= radius;
      }

      while (q = quads.pop()) {

        // Stop searching if this quadrant can’t contain a closer node.
        if (!(node = q.node)
            || (x1 = q.x0) > x3
            || (y1 = q.y0) > y3
            || (x2 = q.x1) < x0
            || (y2 = q.y1) < y0) continue;

        // Bisect the current quadrant.
        if (node.length) {
          var xm = (x1 + x2) / 2,
              ym = (y1 + y2) / 2;

          quads.push(
            new Quad(node[3], xm, ym, x2, y2),
            new Quad(node[2], x1, ym, xm, y2),
            new Quad(node[1], xm, y1, x2, ym),
            new Quad(node[0], x1, y1, xm, ym)
          );

          // Visit the closest quadrant first.
          if (i = (y >= ym) << 1 | (x >= xm)) {
            q = quads[quads.length - 1];
            quads[quads.length - 1] = quads[quads.length - 1 - i];
            quads[quads.length - 1 - i] = q;
          }
        }

        // Visit this point. (Visiting coincident points isn’t necessary!)
        else {
          var dx = x - +this._x.call(null, node.data),
              dy = y - +this._y.call(null, node.data),
              d2 = dx * dx + dy * dy;
          if (d2 < radius) {
            var d = Math.sqrt(radius = d2);
            x0 = x - d, y0 = y - d;
            x3 = x + d, y3 = y + d;
            data = node.data;
          }
        }
      }

      return data;
    }

    function tree_remove(d) {
      if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

      var parent,
          node = this._root,
          retainer,
          previous,
          next,
          x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1,
          x,
          y,
          xm,
          ym,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return this;

      // Find the leaf node for the point.
      // While descending, also retain the deepest parent with a non-removed sibling.
      if (node.length) while (true) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
        if (!node.length) break;
        if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
      }

      // Find the point to remove.
      while (node.data !== d) if (!(previous = node, node = node.next)) return this;
      if (next = node.next) delete node.next;

      // If there are multiple coincident points, remove just the point.
      if (previous) return (next ? previous.next = next : delete previous.next), this;

      // If this is the root point, remove it.
      if (!parent) return this._root = next, this;

      // Remove this leaf.
      next ? parent[i] = next : delete parent[i];

      // If the parent now contains exactly one leaf, collapse superfluous parents.
      if ((node = parent[0] || parent[1] || parent[2] || parent[3])
          && node === (parent[3] || parent[2] || parent[1] || parent[0])
          && !node.length) {
        if (retainer) retainer[j] = node;
        else this._root = node;
      }

      return this;
    }

    function removeAll(data) {
      for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
      return this;
    }

    function tree_root() {
      return this._root;
    }

    function tree_size() {
      var size = 0;
      this.visit(function(node) {
        if (!node.length) do ++size; while (node = node.next)
      });
      return size;
    }

    function tree_visit(callback) {
      var quads = [], q, node = this._root, child, x0, y0, x1, y1;
      if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
          var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
        }
      }
      return this;
    }

    function tree_visitAfter(callback) {
      var quads = [], next = [], q;
      if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        var node = q.node;
        if (node.length) {
          var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
        }
        next.push(q);
      }
      while (q = next.pop()) {
        callback(q.node, q.x0, q.y0, q.x1, q.y1);
      }
      return this;
    }

    function defaultX(d) {
      return d[0];
    }

    function tree_x(_) {
      return arguments.length ? (this._x = _, this) : this._x;
    }

    function defaultY(d) {
      return d[1];
    }

    function tree_y(_) {
      return arguments.length ? (this._y = _, this) : this._y;
    }

    function quadtree(nodes, x, y) {
      var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
      return nodes == null ? tree : tree.addAll(nodes);
    }

    function Quadtree(x, y, x0, y0, x1, y1) {
      this._x = x;
      this._y = y;
      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      this._root = undefined;
    }

    function leaf_copy(leaf) {
      var copy = {data: leaf.data}, next = copy;
      while (leaf = leaf.next) next = next.next = {data: leaf.data};
      return copy;
    }

    var treeProto = quadtree.prototype = Quadtree.prototype;

    treeProto.copy = function() {
      var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
          node = this._root,
          nodes,
          child;

      if (!node) return copy;

      if (!node.length) return copy._root = leaf_copy(node), copy;

      nodes = [{source: node, target: copy._root = new Array(4)}];
      while (node = nodes.pop()) {
        for (var i = 0; i < 4; ++i) {
          if (child = node.source[i]) {
            if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
            else node.target[i] = leaf_copy(child);
          }
        }
      }

      return copy;
    };

    treeProto.add = tree_add;
    treeProto.addAll = addAll;
    treeProto.cover = tree_cover;
    treeProto.data = tree_data;
    treeProto.extent = tree_extent;
    treeProto.find = tree_find;
    treeProto.remove = tree_remove;
    treeProto.removeAll = removeAll;
    treeProto.root = tree_root;
    treeProto.size = tree_size;
    treeProto.visit = tree_visit;
    treeProto.visitAfter = tree_visitAfter;
    treeProto.x = tree_x;
    treeProto.y = tree_y;

    function constant$4(x) {
      return function() {
        return x;
      };
    }

    function jiggle(random) {
      return (random() - 0.5) * 1e-6;
    }

    function x$3(d) {
      return d.x + d.vx;
    }

    function y$3(d) {
      return d.y + d.vy;
    }

    function collide(radius) {
      var nodes,
          radii,
          random,
          strength = 1,
          iterations = 1;

      if (typeof radius !== "function") radius = constant$4(radius == null ? 1 : +radius);

      function force() {
        var i, n = nodes.length,
            tree,
            node,
            xi,
            yi,
            ri,
            ri2;

        for (var k = 0; k < iterations; ++k) {
          tree = quadtree(nodes, x$3, y$3).visitAfter(prepare);
          for (i = 0; i < n; ++i) {
            node = nodes[i];
            ri = radii[node.index], ri2 = ri * ri;
            xi = node.x + node.vx;
            yi = node.y + node.vy;
            tree.visit(apply);
          }
        }

        function apply(quad, x0, y0, x1, y1) {
          var data = quad.data, rj = quad.r, r = ri + rj;
          if (data) {
            if (data.index > node.index) {
              var x = xi - data.x - data.vx,
                  y = yi - data.y - data.vy,
                  l = x * x + y * y;
              if (l < r * r) {
                if (x === 0) x = jiggle(random), l += x * x;
                if (y === 0) y = jiggle(random), l += y * y;
                l = (r - (l = Math.sqrt(l))) / l * strength;
                node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
                node.vy += (y *= l) * r;
                data.vx -= x * (r = 1 - r);
                data.vy -= y * r;
              }
            }
            return;
          }
          return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
        }
      }

      function prepare(quad) {
        if (quad.data) return quad.r = radii[quad.data.index];
        for (var i = quad.r = 0; i < 4; ++i) {
          if (quad[i] && quad[i].r > quad.r) {
            quad.r = quad[i].r;
          }
        }
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length, node;
        radii = new Array(n);
        for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
      }

      force.initialize = function(_nodes, _random) {
        nodes = _nodes;
        random = _random;
        initialize();
      };

      force.iterations = function(_) {
        return arguments.length ? (iterations = +_, force) : iterations;
      };

      force.strength = function(_) {
        return arguments.length ? (strength = +_, force) : strength;
      };

      force.radius = function(_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : radius;
      };

      return force;
    }

    function index$3(d) {
      return d.index;
    }

    function find(nodeById, nodeId) {
      var node = nodeById.get(nodeId);
      if (!node) throw new Error("node not found: " + nodeId);
      return node;
    }

    function link$2(links) {
      var id = index$3,
          strength = defaultStrength,
          strengths,
          distance = constant$4(30),
          distances,
          nodes,
          count,
          bias,
          random,
          iterations = 1;

      if (links == null) links = [];

      function defaultStrength(link) {
        return 1 / Math.min(count[link.source.index], count[link.target.index]);
      }

      function force(alpha) {
        for (var k = 0, n = links.length; k < iterations; ++k) {
          for (var i = 0, link, source, target, x, y, l, b; i < n; ++i) {
            link = links[i], source = link.source, target = link.target;
            x = target.x + target.vx - source.x - source.vx || jiggle(random);
            y = target.y + target.vy - source.y - source.vy || jiggle(random);
            l = Math.sqrt(x * x + y * y);
            l = (l - distances[i]) / l * alpha * strengths[i];
            x *= l, y *= l;
            target.vx -= x * (b = bias[i]);
            target.vy -= y * b;
            source.vx += x * (b = 1 - b);
            source.vy += y * b;
          }
        }
      }

      function initialize() {
        if (!nodes) return;

        var i,
            n = nodes.length,
            m = links.length,
            nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d])),
            link;

        for (i = 0, count = new Array(n); i < m; ++i) {
          link = links[i], link.index = i;
          if (typeof link.source !== "object") link.source = find(nodeById, link.source);
          if (typeof link.target !== "object") link.target = find(nodeById, link.target);
          count[link.source.index] = (count[link.source.index] || 0) + 1;
          count[link.target.index] = (count[link.target.index] || 0) + 1;
        }

        for (i = 0, bias = new Array(m); i < m; ++i) {
          link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
        }

        strengths = new Array(m), initializeStrength();
        distances = new Array(m), initializeDistance();
      }

      function initializeStrength() {
        if (!nodes) return;

        for (var i = 0, n = links.length; i < n; ++i) {
          strengths[i] = +strength(links[i], i, links);
        }
      }

      function initializeDistance() {
        if (!nodes) return;

        for (var i = 0, n = links.length; i < n; ++i) {
          distances[i] = +distance(links[i], i, links);
        }
      }

      force.initialize = function(_nodes, _random) {
        nodes = _nodes;
        random = _random;
        initialize();
      };

      force.links = function(_) {
        return arguments.length ? (links = _, initialize(), force) : links;
      };

      force.id = function(_) {
        return arguments.length ? (id = _, force) : id;
      };

      force.iterations = function(_) {
        return arguments.length ? (iterations = +_, force) : iterations;
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initializeStrength(), force) : strength;
      };

      force.distance = function(_) {
        return arguments.length ? (distance = typeof _ === "function" ? _ : constant$4(+_), initializeDistance(), force) : distance;
      };

      return force;
    }

    // https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
    const a$1 = 1664525;
    const c$3 = 1013904223;
    const m = 4294967296; // 2^32

    function lcg$1() {
      let s = 1;
      return () => (s = (a$1 * s + c$3) % m) / m;
    }

    function x$2(d) {
      return d.x;
    }

    function y$2(d) {
      return d.y;
    }

    var initialRadius = 10,
        initialAngle = Math.PI * (3 - Math.sqrt(5));

    function simulation(nodes) {
      var simulation,
          alpha = 1,
          alphaMin = 0.001,
          alphaDecay = 1 - Math.pow(alphaMin, 1 / 300),
          alphaTarget = 0,
          velocityDecay = 0.6,
          forces = new Map(),
          stepper = timer(step),
          event = dispatch("tick", "end"),
          random = lcg$1();

      if (nodes == null) nodes = [];

      function step() {
        tick();
        event.call("tick", simulation);
        if (alpha < alphaMin) {
          stepper.stop();
          event.call("end", simulation);
        }
      }

      function tick(iterations) {
        var i, n = nodes.length, node;

        if (iterations === undefined) iterations = 1;

        for (var k = 0; k < iterations; ++k) {
          alpha += (alphaTarget - alpha) * alphaDecay;

          forces.forEach(function(force) {
            force(alpha);
          });

          for (i = 0; i < n; ++i) {
            node = nodes[i];
            if (node.fx == null) node.x += node.vx *= velocityDecay;
            else node.x = node.fx, node.vx = 0;
            if (node.fy == null) node.y += node.vy *= velocityDecay;
            else node.y = node.fy, node.vy = 0;
          }
        }

        return simulation;
      }

      function initializeNodes() {
        for (var i = 0, n = nodes.length, node; i < n; ++i) {
          node = nodes[i], node.index = i;
          if (node.fx != null) node.x = node.fx;
          if (node.fy != null) node.y = node.fy;
          if (isNaN(node.x) || isNaN(node.y)) {
            var radius = initialRadius * Math.sqrt(0.5 + i), angle = i * initialAngle;
            node.x = radius * Math.cos(angle);
            node.y = radius * Math.sin(angle);
          }
          if (isNaN(node.vx) || isNaN(node.vy)) {
            node.vx = node.vy = 0;
          }
        }
      }

      function initializeForce(force) {
        if (force.initialize) force.initialize(nodes, random);
        return force;
      }

      initializeNodes();

      return simulation = {
        tick: tick,

        restart: function() {
          return stepper.restart(step), simulation;
        },

        stop: function() {
          return stepper.stop(), simulation;
        },

        nodes: function(_) {
          return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
        },

        alpha: function(_) {
          return arguments.length ? (alpha = +_, simulation) : alpha;
        },

        alphaMin: function(_) {
          return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
        },

        alphaDecay: function(_) {
          return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
        },

        alphaTarget: function(_) {
          return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
        },

        velocityDecay: function(_) {
          return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
        },

        randomSource: function(_) {
          return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
        },

        force: function(name, _) {
          return arguments.length > 1 ? ((_ == null ? forces.delete(name) : forces.set(name, initializeForce(_))), simulation) : forces.get(name);
        },

        find: function(x, y, radius) {
          var i = 0,
              n = nodes.length,
              dx,
              dy,
              d2,
              node,
              closest;

          if (radius == null) radius = Infinity;
          else radius *= radius;

          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dx = x - node.x;
            dy = y - node.y;
            d2 = dx * dx + dy * dy;
            if (d2 < radius) closest = node, radius = d2;
          }

          return closest;
        },

        on: function(name, _) {
          return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
        }
      };
    }

    function manyBody() {
      var nodes,
          node,
          random,
          alpha,
          strength = constant$4(-30),
          strengths,
          distanceMin2 = 1,
          distanceMax2 = Infinity,
          theta2 = 0.81;

      function force(_) {
        var i, n = nodes.length, tree = quadtree(nodes, x$2, y$2).visitAfter(accumulate);
        for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length, node;
        strengths = new Array(n);
        for (i = 0; i < n; ++i) node = nodes[i], strengths[node.index] = +strength(node, i, nodes);
      }

      function accumulate(quad) {
        var strength = 0, q, c, weight = 0, x, y, i;

        // For internal nodes, accumulate forces from child quadrants.
        if (quad.length) {
          for (x = y = i = 0; i < 4; ++i) {
            if ((q = quad[i]) && (c = Math.abs(q.value))) {
              strength += q.value, weight += c, x += c * q.x, y += c * q.y;
            }
          }
          quad.x = x / weight;
          quad.y = y / weight;
        }

        // For leaf nodes, accumulate forces from coincident quadrants.
        else {
          q = quad;
          q.x = q.data.x;
          q.y = q.data.y;
          do strength += strengths[q.data.index];
          while (q = q.next);
        }

        quad.value = strength;
      }

      function apply(quad, x1, _, x2) {
        if (!quad.value) return true;

        var x = quad.x - node.x,
            y = quad.y - node.y,
            w = x2 - x1,
            l = x * x + y * y;

        // Apply the Barnes-Hut approximation if possible.
        // Limit forces for very close nodes; randomize direction if coincident.
        if (w * w / theta2 < l) {
          if (l < distanceMax2) {
            if (x === 0) x = jiggle(random), l += x * x;
            if (y === 0) y = jiggle(random), l += y * y;
            if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
            node.vx += x * quad.value * alpha / l;
            node.vy += y * quad.value * alpha / l;
          }
          return true;
        }

        // Otherwise, process points directly.
        else if (quad.length || l >= distanceMax2) return;

        // Limit forces for very close nodes; randomize direction if coincident.
        if (quad.data !== node || quad.next) {
          if (x === 0) x = jiggle(random), l += x * x;
          if (y === 0) y = jiggle(random), l += y * y;
          if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
        }

        do if (quad.data !== node) {
          w = strengths[quad.data.index] * alpha / l;
          node.vx += x * w;
          node.vy += y * w;
        } while (quad = quad.next);
      }

      force.initialize = function(_nodes, _random) {
        nodes = _nodes;
        random = _random;
        initialize();
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : strength;
      };

      force.distanceMin = function(_) {
        return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
      };

      force.distanceMax = function(_) {
        return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
      };

      force.theta = function(_) {
        return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
      };

      return force;
    }

    function radial$1(radius, x, y) {
      var nodes,
          strength = constant$4(0.1),
          strengths,
          radiuses;

      if (typeof radius !== "function") radius = constant$4(+radius);
      if (x == null) x = 0;
      if (y == null) y = 0;

      function force(alpha) {
        for (var i = 0, n = nodes.length; i < n; ++i) {
          var node = nodes[i],
              dx = node.x - x || 1e-6,
              dy = node.y - y || 1e-6,
              r = Math.sqrt(dx * dx + dy * dy),
              k = (radiuses[i] - r) * strengths[i] * alpha / r;
          node.vx += dx * k;
          node.vy += dy * k;
        }
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length;
        strengths = new Array(n);
        radiuses = new Array(n);
        for (i = 0; i < n; ++i) {
          radiuses[i] = +radius(nodes[i], i, nodes);
          strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
        }
      }

      force.initialize = function(_) {
        nodes = _, initialize();
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : strength;
      };

      force.radius = function(_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : radius;
      };

      force.x = function(_) {
        return arguments.length ? (x = +_, force) : x;
      };

      force.y = function(_) {
        return arguments.length ? (y = +_, force) : y;
      };

      return force;
    }

    function x$1(x) {
      var strength = constant$4(0.1),
          nodes,
          strengths,
          xz;

      if (typeof x !== "function") x = constant$4(x == null ? 0 : +x);

      function force(alpha) {
        for (var i = 0, n = nodes.length, node; i < n; ++i) {
          node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
        }
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length;
        strengths = new Array(n);
        xz = new Array(n);
        for (i = 0; i < n; ++i) {
          strengths[i] = isNaN(xz[i] = +x(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
        }
      }

      force.initialize = function(_) {
        nodes = _;
        initialize();
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : strength;
      };

      force.x = function(_) {
        return arguments.length ? (x = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : x;
      };

      return force;
    }

    function y$1(y) {
      var strength = constant$4(0.1),
          nodes,
          strengths,
          yz;

      if (typeof y !== "function") y = constant$4(y == null ? 0 : +y);

      function force(alpha) {
        for (var i = 0, n = nodes.length, node; i < n; ++i) {
          node = nodes[i], node.vy += (yz[i] - node.y) * strengths[i] * alpha;
        }
      }

      function initialize() {
        if (!nodes) return;
        var i, n = nodes.length;
        strengths = new Array(n);
        yz = new Array(n);
        for (i = 0; i < n; ++i) {
          strengths[i] = isNaN(yz[i] = +y(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
        }
      }

      force.initialize = function(_) {
        nodes = _;
        initialize();
      };

      force.strength = function(_) {
        return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : strength;
      };

      force.y = function(_) {
        return arguments.length ? (y = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : y;
      };

      return force;
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity$6(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale$1(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$6 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$6 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale$1;
    var format;
    var formatPrefix;

    defaultLocale$2({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale$2(definition) {
      locale$1 = formatLocale$1(definition);
      format = locale$1.format;
      formatPrefix = locale$1.formatPrefix;
      return locale$1;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    var epsilon$1 = 1e-6;
    var epsilon2 = 1e-12;
    var pi$1 = Math.PI;
    var halfPi$1 = pi$1 / 2;
    var quarterPi = pi$1 / 4;
    var tau$1 = pi$1 * 2;

    var degrees = 180 / pi$1;
    var radians = pi$1 / 180;

    var abs$1 = Math.abs;
    var atan = Math.atan;
    var atan2$1 = Math.atan2;
    var cos$1 = Math.cos;
    var ceil = Math.ceil;
    var exp = Math.exp;
    var hypot = Math.hypot;
    var log$1 = Math.log;
    var pow$1 = Math.pow;
    var sin$1 = Math.sin;
    var sign$1 = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    var sqrt$2 = Math.sqrt;
    var tan = Math.tan;

    function acos$1(x) {
      return x > 1 ? 0 : x < -1 ? pi$1 : Math.acos(x);
    }

    function asin$1(x) {
      return x > 1 ? halfPi$1 : x < -1 ? -halfPi$1 : Math.asin(x);
    }

    function haversin(x) {
      return (x = sin$1(x / 2)) * x;
    }

    function noop$1() {}

    function streamGeometry(geometry, stream) {
      if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
        streamGeometryType[geometry.type](geometry, stream);
      }
    }

    var streamObjectType = {
      Feature: function(object, stream) {
        streamGeometry(object.geometry, stream);
      },
      FeatureCollection: function(object, stream) {
        var features = object.features, i = -1, n = features.length;
        while (++i < n) streamGeometry(features[i].geometry, stream);
      }
    };

    var streamGeometryType = {
      Sphere: function(object, stream) {
        stream.sphere();
      },
      Point: function(object, stream) {
        object = object.coordinates;
        stream.point(object[0], object[1], object[2]);
      },
      MultiPoint: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
      },
      LineString: function(object, stream) {
        streamLine(object.coordinates, stream, 0);
      },
      MultiLineString: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamLine(coordinates[i], stream, 0);
      },
      Polygon: function(object, stream) {
        streamPolygon(object.coordinates, stream);
      },
      MultiPolygon: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamPolygon(coordinates[i], stream);
      },
      GeometryCollection: function(object, stream) {
        var geometries = object.geometries, i = -1, n = geometries.length;
        while (++i < n) streamGeometry(geometries[i], stream);
      }
    };

    function streamLine(coordinates, stream, closed) {
      var i = -1, n = coordinates.length - closed, coordinate;
      stream.lineStart();
      while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
      stream.lineEnd();
    }

    function streamPolygon(coordinates, stream) {
      var i = -1, n = coordinates.length;
      stream.polygonStart();
      while (++i < n) streamLine(coordinates[i], stream, 1);
      stream.polygonEnd();
    }

    function geoStream(object, stream) {
      if (object && streamObjectType.hasOwnProperty(object.type)) {
        streamObjectType[object.type](object, stream);
      } else {
        streamGeometry(object, stream);
      }
    }

    var areaRingSum$1 = new Adder();

    // hello?

    var areaSum$1 = new Adder(),
        lambda00$2,
        phi00$2,
        lambda0$2,
        cosPhi0$1,
        sinPhi0$1;

    var areaStream$1 = {
      point: noop$1,
      lineStart: noop$1,
      lineEnd: noop$1,
      polygonStart: function() {
        areaRingSum$1 = new Adder();
        areaStream$1.lineStart = areaRingStart$1;
        areaStream$1.lineEnd = areaRingEnd$1;
      },
      polygonEnd: function() {
        var areaRing = +areaRingSum$1;
        areaSum$1.add(areaRing < 0 ? tau$1 + areaRing : areaRing);
        this.lineStart = this.lineEnd = this.point = noop$1;
      },
      sphere: function() {
        areaSum$1.add(tau$1);
      }
    };

    function areaRingStart$1() {
      areaStream$1.point = areaPointFirst$1;
    }

    function areaRingEnd$1() {
      areaPoint$1(lambda00$2, phi00$2);
    }

    function areaPointFirst$1(lambda, phi) {
      areaStream$1.point = areaPoint$1;
      lambda00$2 = lambda, phi00$2 = phi;
      lambda *= radians, phi *= radians;
      lambda0$2 = lambda, cosPhi0$1 = cos$1(phi = phi / 2 + quarterPi), sinPhi0$1 = sin$1(phi);
    }

    function areaPoint$1(lambda, phi) {
      lambda *= radians, phi *= radians;
      phi = phi / 2 + quarterPi; // half the angular distance from south pole

      // Spherical excess E for a spherical triangle with vertices: south pole,
      // previous point, current point.  Uses a formula derived from Cagnoli’s
      // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
      var dLambda = lambda - lambda0$2,
          sdLambda = dLambda >= 0 ? 1 : -1,
          adLambda = sdLambda * dLambda,
          cosPhi = cos$1(phi),
          sinPhi = sin$1(phi),
          k = sinPhi0$1 * sinPhi,
          u = cosPhi0$1 * cosPhi + k * cos$1(adLambda),
          v = k * sdLambda * sin$1(adLambda);
      areaRingSum$1.add(atan2$1(v, u));

      // Advance the previous points.
      lambda0$2 = lambda, cosPhi0$1 = cosPhi, sinPhi0$1 = sinPhi;
    }

    function area$2(object) {
      areaSum$1 = new Adder();
      geoStream(object, areaStream$1);
      return areaSum$1 * 2;
    }

    function spherical(cartesian) {
      return [atan2$1(cartesian[1], cartesian[0]), asin$1(cartesian[2])];
    }

    function cartesian(spherical) {
      var lambda = spherical[0], phi = spherical[1], cosPhi = cos$1(phi);
      return [cosPhi * cos$1(lambda), cosPhi * sin$1(lambda), sin$1(phi)];
    }

    function cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function cartesianCross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    // TODO return a
    function cartesianAddInPlace(a, b) {
      a[0] += b[0], a[1] += b[1], a[2] += b[2];
    }

    function cartesianScale(vector, k) {
      return [vector[0] * k, vector[1] * k, vector[2] * k];
    }

    // TODO return d
    function cartesianNormalizeInPlace(d) {
      var l = sqrt$2(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l, d[1] /= l, d[2] /= l;
    }

    var lambda0$1, phi0, lambda1, phi1, // bounds
        lambda2, // previous lambda-coordinate
        lambda00$1, phi00$1, // first point
        p0, // previous 3D point
        deltaSum,
        ranges,
        range;

    var boundsStream$2 = {
      point: boundsPoint$1,
      lineStart: boundsLineStart,
      lineEnd: boundsLineEnd,
      polygonStart: function() {
        boundsStream$2.point = boundsRingPoint;
        boundsStream$2.lineStart = boundsRingStart;
        boundsStream$2.lineEnd = boundsRingEnd;
        deltaSum = new Adder();
        areaStream$1.polygonStart();
      },
      polygonEnd: function() {
        areaStream$1.polygonEnd();
        boundsStream$2.point = boundsPoint$1;
        boundsStream$2.lineStart = boundsLineStart;
        boundsStream$2.lineEnd = boundsLineEnd;
        if (areaRingSum$1 < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
        else if (deltaSum > epsilon$1) phi1 = 90;
        else if (deltaSum < -epsilon$1) phi0 = -90;
        range[0] = lambda0$1, range[1] = lambda1;
      },
      sphere: function() {
        lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
      }
    };

    function boundsPoint$1(lambda, phi) {
      ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
      if (phi < phi0) phi0 = phi;
      if (phi > phi1) phi1 = phi;
    }

    function linePoint(lambda, phi) {
      var p = cartesian([lambda * radians, phi * radians]);
      if (p0) {
        var normal = cartesianCross(p0, p),
            equatorial = [normal[1], -normal[0], 0],
            inflection = cartesianCross(equatorial, normal);
        cartesianNormalizeInPlace(inflection);
        inflection = spherical(inflection);
        var delta = lambda - lambda2,
            sign = delta > 0 ? 1 : -1,
            lambdai = inflection[0] * degrees * sign,
            phii,
            antimeridian = abs$1(delta) > 180;
        if (antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
          phii = inflection[1] * degrees;
          if (phii > phi1) phi1 = phii;
        } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
          phii = -inflection[1] * degrees;
          if (phii < phi0) phi0 = phii;
        } else {
          if (phi < phi0) phi0 = phi;
          if (phi > phi1) phi1 = phi;
        }
        if (antimeridian) {
          if (lambda < lambda2) {
            if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
          } else {
            if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
          }
        } else {
          if (lambda1 >= lambda0$1) {
            if (lambda < lambda0$1) lambda0$1 = lambda;
            if (lambda > lambda1) lambda1 = lambda;
          } else {
            if (lambda > lambda2) {
              if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
            } else {
              if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
            }
          }
        }
      } else {
        ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
      }
      if (phi < phi0) phi0 = phi;
      if (phi > phi1) phi1 = phi;
      p0 = p, lambda2 = lambda;
    }

    function boundsLineStart() {
      boundsStream$2.point = linePoint;
    }

    function boundsLineEnd() {
      range[0] = lambda0$1, range[1] = lambda1;
      boundsStream$2.point = boundsPoint$1;
      p0 = null;
    }

    function boundsRingPoint(lambda, phi) {
      if (p0) {
        var delta = lambda - lambda2;
        deltaSum.add(abs$1(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
      } else {
        lambda00$1 = lambda, phi00$1 = phi;
      }
      areaStream$1.point(lambda, phi);
      linePoint(lambda, phi);
    }

    function boundsRingStart() {
      areaStream$1.lineStart();
    }

    function boundsRingEnd() {
      boundsRingPoint(lambda00$1, phi00$1);
      areaStream$1.lineEnd();
      if (abs$1(deltaSum) > epsilon$1) lambda0$1 = -(lambda1 = 180);
      range[0] = lambda0$1, range[1] = lambda1;
      p0 = null;
    }

    // Finds the left-right distance between two longitudes.
    // This is almost the same as (lambda1 - lambda0 + 360°) % 360°, except that we want
    // the distance between ±180° to be 360°.
    function angle(lambda0, lambda1) {
      return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
    }

    function rangeCompare(a, b) {
      return a[0] - b[0];
    }

    function rangeContains(range, x) {
      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
    }

    function bounds(feature) {
      var i, n, a, b, merged, deltaMax, delta;

      phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
      ranges = [];
      geoStream(feature, boundsStream$2);

      // First, sort ranges by their minimum longitudes.
      if (n = ranges.length) {
        ranges.sort(rangeCompare);

        // Then, merge any ranges that overlap.
        for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
          b = ranges[i];
          if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
          } else {
            merged.push(a = b);
          }
        }

        // Finally, find the largest gap between the merged ranges.
        // The final bounding box will be the inverse of this gap.
        for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
          b = merged[i];
          if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
        }
      }

      ranges = range = null;

      return lambda0$1 === Infinity || phi0 === Infinity
          ? [[NaN, NaN], [NaN, NaN]]
          : [[lambda0$1, phi0], [lambda1, phi1]];
    }

    var W0, W1,
        X0$1, Y0$1, Z0$1,
        X1$1, Y1$1, Z1$1,
        X2$1, Y2$1, Z2$1,
        lambda00, phi00, // first point
        x0$4, y0$4, z0; // previous point

    var centroidStream$1 = {
      sphere: noop$1,
      point: centroidPoint$1,
      lineStart: centroidLineStart$1,
      lineEnd: centroidLineEnd$1,
      polygonStart: function() {
        centroidStream$1.lineStart = centroidRingStart$1;
        centroidStream$1.lineEnd = centroidRingEnd$1;
      },
      polygonEnd: function() {
        centroidStream$1.lineStart = centroidLineStart$1;
        centroidStream$1.lineEnd = centroidLineEnd$1;
      }
    };

    // Arithmetic mean of Cartesian vectors.
    function centroidPoint$1(lambda, phi) {
      lambda *= radians, phi *= radians;
      var cosPhi = cos$1(phi);
      centroidPointCartesian(cosPhi * cos$1(lambda), cosPhi * sin$1(lambda), sin$1(phi));
    }

    function centroidPointCartesian(x, y, z) {
      ++W0;
      X0$1 += (x - X0$1) / W0;
      Y0$1 += (y - Y0$1) / W0;
      Z0$1 += (z - Z0$1) / W0;
    }

    function centroidLineStart$1() {
      centroidStream$1.point = centroidLinePointFirst;
    }

    function centroidLinePointFirst(lambda, phi) {
      lambda *= radians, phi *= radians;
      var cosPhi = cos$1(phi);
      x0$4 = cosPhi * cos$1(lambda);
      y0$4 = cosPhi * sin$1(lambda);
      z0 = sin$1(phi);
      centroidStream$1.point = centroidLinePoint;
      centroidPointCartesian(x0$4, y0$4, z0);
    }

    function centroidLinePoint(lambda, phi) {
      lambda *= radians, phi *= radians;
      var cosPhi = cos$1(phi),
          x = cosPhi * cos$1(lambda),
          y = cosPhi * sin$1(lambda),
          z = sin$1(phi),
          w = atan2$1(sqrt$2((w = y0$4 * z - z0 * y) * w + (w = z0 * x - x0$4 * z) * w + (w = x0$4 * y - y0$4 * x) * w), x0$4 * x + y0$4 * y + z0 * z);
      W1 += w;
      X1$1 += w * (x0$4 + (x0$4 = x));
      Y1$1 += w * (y0$4 + (y0$4 = y));
      Z1$1 += w * (z0 + (z0 = z));
      centroidPointCartesian(x0$4, y0$4, z0);
    }

    function centroidLineEnd$1() {
      centroidStream$1.point = centroidPoint$1;
    }

    // See J. E. Brock, The Inertia Tensor for a Spherical Triangle,
    // J. Applied Mechanics 42, 239 (1975).
    function centroidRingStart$1() {
      centroidStream$1.point = centroidRingPointFirst;
    }

    function centroidRingEnd$1() {
      centroidRingPoint(lambda00, phi00);
      centroidStream$1.point = centroidPoint$1;
    }

    function centroidRingPointFirst(lambda, phi) {
      lambda00 = lambda, phi00 = phi;
      lambda *= radians, phi *= radians;
      centroidStream$1.point = centroidRingPoint;
      var cosPhi = cos$1(phi);
      x0$4 = cosPhi * cos$1(lambda);
      y0$4 = cosPhi * sin$1(lambda);
      z0 = sin$1(phi);
      centroidPointCartesian(x0$4, y0$4, z0);
    }

    function centroidRingPoint(lambda, phi) {
      lambda *= radians, phi *= radians;
      var cosPhi = cos$1(phi),
          x = cosPhi * cos$1(lambda),
          y = cosPhi * sin$1(lambda),
          z = sin$1(phi),
          cx = y0$4 * z - z0 * y,
          cy = z0 * x - x0$4 * z,
          cz = x0$4 * y - y0$4 * x,
          m = hypot(cx, cy, cz),
          w = asin$1(m), // line weight = angle
          v = m && -w / m; // area weight multiplier
      X2$1.add(v * cx);
      Y2$1.add(v * cy);
      Z2$1.add(v * cz);
      W1 += w;
      X1$1 += w * (x0$4 + (x0$4 = x));
      Y1$1 += w * (y0$4 + (y0$4 = y));
      Z1$1 += w * (z0 + (z0 = z));
      centroidPointCartesian(x0$4, y0$4, z0);
    }

    function centroid$1(object) {
      W0 = W1 =
      X0$1 = Y0$1 = Z0$1 =
      X1$1 = Y1$1 = Z1$1 = 0;
      X2$1 = new Adder();
      Y2$1 = new Adder();
      Z2$1 = new Adder();
      geoStream(object, centroidStream$1);

      var x = +X2$1,
          y = +Y2$1,
          z = +Z2$1,
          m = hypot(x, y, z);

      // If the area-weighted ccentroid is undefined, fall back to length-weighted ccentroid.
      if (m < epsilon2) {
        x = X1$1, y = Y1$1, z = Z1$1;
        // If the feature has zero length, fall back to arithmetic mean of point vectors.
        if (W1 < epsilon$1) x = X0$1, y = Y0$1, z = Z0$1;
        m = hypot(x, y, z);
        // If the feature still has an undefined ccentroid, then return.
        if (m < epsilon2) return [NaN, NaN];
      }

      return [atan2$1(y, x) * degrees, asin$1(z / m) * degrees];
    }

    function constant$3(x) {
      return function() {
        return x;
      };
    }

    function compose(a, b) {

      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }

      if (a.invert && b.invert) compose.invert = function(x, y) {
        return x = b.invert(x, y), x && a.invert(x[0], x[1]);
      };

      return compose;
    }

    function rotationIdentity(lambda, phi) {
      return [abs$1(lambda) > pi$1 ? lambda + Math.round(-lambda / tau$1) * tau$1 : lambda, phi];
    }

    rotationIdentity.invert = rotationIdentity;

    function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
      return (deltaLambda %= tau$1) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
        : rotationLambda(deltaLambda))
        : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
        : rotationIdentity);
    }

    function forwardRotationLambda(deltaLambda) {
      return function(lambda, phi) {
        return lambda += deltaLambda, [lambda > pi$1 ? lambda - tau$1 : lambda < -pi$1 ? lambda + tau$1 : lambda, phi];
      };
    }

    function rotationLambda(deltaLambda) {
      var rotation = forwardRotationLambda(deltaLambda);
      rotation.invert = forwardRotationLambda(-deltaLambda);
      return rotation;
    }

    function rotationPhiGamma(deltaPhi, deltaGamma) {
      var cosDeltaPhi = cos$1(deltaPhi),
          sinDeltaPhi = sin$1(deltaPhi),
          cosDeltaGamma = cos$1(deltaGamma),
          sinDeltaGamma = sin$1(deltaGamma);

      function rotation(lambda, phi) {
        var cosPhi = cos$1(phi),
            x = cos$1(lambda) * cosPhi,
            y = sin$1(lambda) * cosPhi,
            z = sin$1(phi),
            k = z * cosDeltaPhi + x * sinDeltaPhi;
        return [
          atan2$1(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
          asin$1(k * cosDeltaGamma + y * sinDeltaGamma)
        ];
      }

      rotation.invert = function(lambda, phi) {
        var cosPhi = cos$1(phi),
            x = cos$1(lambda) * cosPhi,
            y = sin$1(lambda) * cosPhi,
            z = sin$1(phi),
            k = z * cosDeltaGamma - y * sinDeltaGamma;
        return [
          atan2$1(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
          asin$1(k * cosDeltaPhi - x * sinDeltaPhi)
        ];
      };

      return rotation;
    }

    function rotation(rotate) {
      rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

      function forward(coordinates) {
        coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
        return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
      }

      forward.invert = function(coordinates) {
        coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
        return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
      };

      return forward;
    }

    // Generates a circle centered at [0°, 0°], with a given radius and precision.
    function circleStream(stream, radius, delta, direction, t0, t1) {
      if (!delta) return;
      var cosRadius = cos$1(radius),
          sinRadius = sin$1(radius),
          step = direction * delta;
      if (t0 == null) {
        t0 = radius + direction * tau$1;
        t1 = radius - step / 2;
      } else {
        t0 = circleRadius(cosRadius, t0);
        t1 = circleRadius(cosRadius, t1);
        if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau$1;
      }
      for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
        point = spherical([cosRadius, -sinRadius * cos$1(t), -sinRadius * sin$1(t)]);
        stream.point(point[0], point[1]);
      }
    }

    // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
    function circleRadius(cosRadius, point) {
      point = cartesian(point), point[0] -= cosRadius;
      cartesianNormalizeInPlace(point);
      var radius = acos$1(-point[1]);
      return ((-point[2] < 0 ? -radius : radius) + tau$1 - epsilon$1) % tau$1;
    }

    function circle$2() {
      var center = constant$3([0, 0]),
          radius = constant$3(90),
          precision = constant$3(6),
          ring,
          rotate,
          stream = {point: point};

      function point(x, y) {
        ring.push(x = rotate(x, y));
        x[0] *= degrees, x[1] *= degrees;
      }

      function circle() {
        var c = center.apply(this, arguments),
            r = radius.apply(this, arguments) * radians,
            p = precision.apply(this, arguments) * radians;
        ring = [];
        rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
        circleStream(stream, r, p, 1);
        c = {type: "Polygon", coordinates: [ring]};
        ring = rotate = null;
        return c;
      }

      circle.center = function(_) {
        return arguments.length ? (center = typeof _ === "function" ? _ : constant$3([+_[0], +_[1]]), circle) : center;
      };

      circle.radius = function(_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant$3(+_), circle) : radius;
      };

      circle.precision = function(_) {
        return arguments.length ? (precision = typeof _ === "function" ? _ : constant$3(+_), circle) : precision;
      };

      return circle;
    }

    function clipBuffer() {
      var lines = [],
          line;
      return {
        point: function(x, y, m) {
          line.push([x, y, m]);
        },
        lineStart: function() {
          lines.push(line = []);
        },
        lineEnd: noop$1,
        rejoin: function() {
          if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
        },
        result: function() {
          var result = lines;
          lines = [];
          line = null;
          return result;
        }
      };
    }

    function pointEqual(a, b) {
      return abs$1(a[0] - b[0]) < epsilon$1 && abs$1(a[1] - b[1]) < epsilon$1;
    }

    function Intersection(point, points, other, entry) {
      this.x = point;
      this.z = points;
      this.o = other; // another intersection
      this.e = entry; // is an entry?
      this.v = false; // visited
      this.n = this.p = null; // next & previous
    }

    // A generalized polygon clipping algorithm: given a polygon that has been cut
    // into its visible line segments, and rejoins the segments by interpolating
    // along the clip edge.
    function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
      var subject = [],
          clip = [],
          i,
          n;

      segments.forEach(function(segment) {
        if ((n = segment.length - 1) <= 0) return;
        var n, p0 = segment[0], p1 = segment[n], x;

        if (pointEqual(p0, p1)) {
          if (!p0[2] && !p1[2]) {
            stream.lineStart();
            for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
            stream.lineEnd();
            return;
          }
          // handle degenerate cases by moving the point
          p1[0] += 2 * epsilon$1;
        }

        subject.push(x = new Intersection(p0, segment, null, true));
        clip.push(x.o = new Intersection(p0, null, x, false));
        subject.push(x = new Intersection(p1, segment, null, false));
        clip.push(x.o = new Intersection(p1, null, x, true));
      });

      if (!subject.length) return;

      clip.sort(compareIntersection);
      link$1(subject);
      link$1(clip);

      for (i = 0, n = clip.length; i < n; ++i) {
        clip[i].e = startInside = !startInside;
      }

      var start = subject[0],
          points,
          point;

      while (1) {
        // Find first unvisited intersection.
        var current = start,
            isSubject = true;
        while (current.v) if ((current = current.n) === start) return;
        points = current.z;
        stream.lineStart();
        do {
          current.v = current.o.v = true;
          if (current.e) {
            if (isSubject) {
              for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.n.x, 1, stream);
            }
            current = current.n;
          } else {
            if (isSubject) {
              points = current.p.z;
              for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.p.x, -1, stream);
            }
            current = current.p;
          }
          current = current.o;
          points = current.z;
          isSubject = !isSubject;
        } while (!current.v);
        stream.lineEnd();
      }
    }

    function link$1(array) {
      if (!(n = array.length)) return;
      var n,
          i = 0,
          a = array[0],
          b;
      while (++i < n) {
        a.n = b = array[i];
        b.p = a;
        a = b;
      }
      a.n = b = array[0];
      b.p = a;
    }

    function longitude(point) {
      return abs$1(point[0]) <= pi$1 ? point[0] : sign$1(point[0]) * ((abs$1(point[0]) + pi$1) % tau$1 - pi$1);
    }

    function polygonContains(polygon, point) {
      var lambda = longitude(point),
          phi = point[1],
          sinPhi = sin$1(phi),
          normal = [sin$1(lambda), -cos$1(lambda), 0],
          angle = 0,
          winding = 0;

      var sum = new Adder();

      if (sinPhi === 1) phi = halfPi$1 + epsilon$1;
      else if (sinPhi === -1) phi = -halfPi$1 - epsilon$1;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        if (!(m = (ring = polygon[i]).length)) continue;
        var ring,
            m,
            point0 = ring[m - 1],
            lambda0 = longitude(point0),
            phi0 = point0[1] / 2 + quarterPi,
            sinPhi0 = sin$1(phi0),
            cosPhi0 = cos$1(phi0);

        for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
          var point1 = ring[j],
              lambda1 = longitude(point1),
              phi1 = point1[1] / 2 + quarterPi,
              sinPhi1 = sin$1(phi1),
              cosPhi1 = cos$1(phi1),
              delta = lambda1 - lambda0,
              sign = delta >= 0 ? 1 : -1,
              absDelta = sign * delta,
              antimeridian = absDelta > pi$1,
              k = sinPhi0 * sinPhi1;

          sum.add(atan2$1(k * sign * sin$1(absDelta), cosPhi0 * cosPhi1 + k * cos$1(absDelta)));
          angle += antimeridian ? delta + sign * tau$1 : delta;

          // Are the longitudes either side of the point’s meridian (lambda),
          // and are the latitudes smaller than the parallel (phi)?
          if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
            var arc = cartesianCross(cartesian(point0), cartesian(point1));
            cartesianNormalizeInPlace(arc);
            var intersection = cartesianCross(normal, arc);
            cartesianNormalizeInPlace(intersection);
            var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin$1(intersection[2]);
            if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
              winding += antimeridian ^ delta >= 0 ? 1 : -1;
            }
          }
        }
      }

      // First, determine whether the South pole is inside or outside:
      //
      // It is inside if:
      // * the polygon winds around it in a clockwise direction.
      // * the polygon does not (cumulatively) wind around it, but has a negative
      //   (counter-clockwise) area.
      //
      // Second, count the (signed) number of times a segment crosses a lambda
      // from the point to the South pole.  If it is zero, then the point is the
      // same side as the South pole.

      return (angle < -epsilon$1 || angle < epsilon$1 && sum < -epsilon2) ^ (winding & 1);
    }

    function clip(pointVisible, clipLine, interpolate, start) {
      return function(sink) {
        var line = clipLine(sink),
            ringBuffer = clipBuffer(),
            ringSink = clipLine(ringBuffer),
            polygonStarted = false,
            polygon,
            segments,
            ring;

        var clip = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            clip.point = pointRing;
            clip.lineStart = ringStart;
            clip.lineEnd = ringEnd;
            segments = [];
            polygon = [];
          },
          polygonEnd: function() {
            clip.point = point;
            clip.lineStart = lineStart;
            clip.lineEnd = lineEnd;
            segments = merge(segments);
            var startInside = polygonContains(polygon, start);
            if (segments.length) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
            } else if (startInside) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              interpolate(null, null, 1, sink);
              sink.lineEnd();
            }
            if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
            segments = polygon = null;
          },
          sphere: function() {
            sink.polygonStart();
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
            sink.polygonEnd();
          }
        };

        function point(lambda, phi) {
          if (pointVisible(lambda, phi)) sink.point(lambda, phi);
        }

        function pointLine(lambda, phi) {
          line.point(lambda, phi);
        }

        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }

        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }

        function pointRing(lambda, phi) {
          ring.push([lambda, phi]);
          ringSink.point(lambda, phi);
        }

        function ringStart() {
          ringSink.lineStart();
          ring = [];
        }

        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringSink.lineEnd();

          var clean = ringSink.clean(),
              ringSegments = ringBuffer.result(),
              i, n = ringSegments.length, m,
              segment,
              point;

          ring.pop();
          polygon.push(ring);
          ring = null;

          if (!n) return;

          // No intersections.
          if (clean & 1) {
            segment = ringSegments[0];
            if ((m = segment.length - 1) > 0) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
              sink.lineEnd();
            }
            return;
          }

          // Rejoin connected segments.
          // TODO reuse ringBuffer.rejoin()?
          if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

          segments.push(ringSegments.filter(validSegment));
        }

        return clip;
      };
    }

    function validSegment(segment) {
      return segment.length > 1;
    }

    // Intersections are sorted along the clip edge. For both antimeridian cutting
    // and circle clipping, the same comparison is used.
    function compareIntersection(a, b) {
      return ((a = a.x)[0] < 0 ? a[1] - halfPi$1 - epsilon$1 : halfPi$1 - a[1])
           - ((b = b.x)[0] < 0 ? b[1] - halfPi$1 - epsilon$1 : halfPi$1 - b[1]);
    }

    var clipAntimeridian = clip(
      function() { return true; },
      clipAntimeridianLine,
      clipAntimeridianInterpolate,
      [-pi$1, -halfPi$1]
    );

    // Takes a line and cuts into visible segments. Return values: 0 - there were
    // intersections or the line was empty; 1 - no intersections; 2 - there were
    // intersections, and the first and last segments should be rejoined.
    function clipAntimeridianLine(stream) {
      var lambda0 = NaN,
          phi0 = NaN,
          sign0 = NaN,
          clean; // no intersections

      return {
        lineStart: function() {
          stream.lineStart();
          clean = 1;
        },
        point: function(lambda1, phi1) {
          var sign1 = lambda1 > 0 ? pi$1 : -pi$1,
              delta = abs$1(lambda1 - lambda0);
          if (abs$1(delta - pi$1) < epsilon$1) { // line crosses a pole
            stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi$1 : -halfPi$1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            stream.point(lambda1, phi0);
            clean = 0;
          } else if (sign0 !== sign1 && delta >= pi$1) { // line crosses antimeridian
            if (abs$1(lambda0 - sign0) < epsilon$1) lambda0 -= sign0 * epsilon$1; // handle degeneracies
            if (abs$1(lambda1 - sign1) < epsilon$1) lambda1 -= sign1 * epsilon$1;
            phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            clean = 0;
          }
          stream.point(lambda0 = lambda1, phi0 = phi1);
          sign0 = sign1;
        },
        lineEnd: function() {
          stream.lineEnd();
          lambda0 = phi0 = NaN;
        },
        clean: function() {
          return 2 - clean; // if intersections, rejoin first and last segments
        }
      };
    }

    function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
      var cosPhi0,
          cosPhi1,
          sinLambda0Lambda1 = sin$1(lambda0 - lambda1);
      return abs$1(sinLambda0Lambda1) > epsilon$1
          ? atan((sin$1(phi0) * (cosPhi1 = cos$1(phi1)) * sin$1(lambda1)
              - sin$1(phi1) * (cosPhi0 = cos$1(phi0)) * sin$1(lambda0))
              / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
          : (phi0 + phi1) / 2;
    }

    function clipAntimeridianInterpolate(from, to, direction, stream) {
      var phi;
      if (from == null) {
        phi = direction * halfPi$1;
        stream.point(-pi$1, phi);
        stream.point(0, phi);
        stream.point(pi$1, phi);
        stream.point(pi$1, 0);
        stream.point(pi$1, -phi);
        stream.point(0, -phi);
        stream.point(-pi$1, -phi);
        stream.point(-pi$1, 0);
        stream.point(-pi$1, phi);
      } else if (abs$1(from[0] - to[0]) > epsilon$1) {
        var lambda = from[0] < to[0] ? pi$1 : -pi$1;
        phi = direction * lambda / 2;
        stream.point(-lambda, phi);
        stream.point(0, phi);
        stream.point(lambda, phi);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function clipCircle(radius) {
      var cr = cos$1(radius),
          delta = 6 * radians,
          smallRadius = cr > 0,
          notHemisphere = abs$1(cr) > epsilon$1; // TODO optimise for this common case

      function interpolate(from, to, direction, stream) {
        circleStream(stream, radius, delta, direction, from, to);
      }

      function visible(lambda, phi) {
        return cos$1(lambda) * cos$1(phi) > cr;
      }

      // Takes a line and cuts into visible segments. Return values used for polygon
      // clipping: 0 - there were intersections or the line was empty; 1 - no
      // intersections 2 - there were intersections, and the first and last segments
      // should be rejoined.
      function clipLine(stream) {
        var point0, // previous point
            c0, // code for previous point
            v0, // visibility of previous point
            v00, // visibility of first point
            clean; // no intersections
        return {
          lineStart: function() {
            v00 = v0 = false;
            clean = 1;
          },
          point: function(lambda, phi) {
            var point1 = [lambda, phi],
                point2,
                v = visible(lambda, phi),
                c = smallRadius
                  ? v ? 0 : code(lambda, phi)
                  : v ? code(lambda + (lambda < 0 ? pi$1 : -pi$1), phi) : 0;
            if (!point0 && (v00 = v0 = v)) stream.lineStart();
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
                point1[2] = 1;
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                // outside going in
                stream.lineStart();
                point2 = intersect(point1, point0);
                stream.point(point2[0], point2[1]);
              } else {
                // inside going out
                point2 = intersect(point0, point1);
                stream.point(point2[0], point2[1], 2);
                stream.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              // If the codes for two points are different, or are both zero,
              // and there this segment intersects with the small circle.
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                } else {
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1], 3);
                }
              }
            }
            if (v && (!point0 || !pointEqual(point0, point1))) {
              stream.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function() {
            if (v0) stream.lineEnd();
            point0 = null;
          },
          // Rejoin first and last segments if there were intersections and the first
          // and last points were visible.
          clean: function() {
            return clean | ((v00 && v0) << 1);
          }
        };
      }

      // Intersects the great circle between a and b with the clip circle.
      function intersect(a, b, two) {
        var pa = cartesian(a),
            pb = cartesian(b);

        // We have two planes, n1.p = d1 and n2.p = d2.
        // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
        var n1 = [1, 0, 0], // normal
            n2 = cartesianCross(pa, pb),
            n2n2 = cartesianDot(n2, n2),
            n1n2 = n2[0], // cartesianDot(n1, n2),
            determinant = n2n2 - n1n2 * n1n2;

        // Two polar points.
        if (!determinant) return !two && a;

        var c1 =  cr * n2n2 / determinant,
            c2 = -cr * n1n2 / determinant,
            n1xn2 = cartesianCross(n1, n2),
            A = cartesianScale(n1, c1),
            B = cartesianScale(n2, c2);
        cartesianAddInPlace(A, B);

        // Solve |p(t)|^2 = 1.
        var u = n1xn2,
            w = cartesianDot(A, u),
            uu = cartesianDot(u, u),
            t2 = w * w - uu * (cartesianDot(A, A) - 1);

        if (t2 < 0) return;

        var t = sqrt$2(t2),
            q = cartesianScale(u, (-w - t) / uu);
        cartesianAddInPlace(q, A);
        q = spherical(q);

        if (!two) return q;

        // Two intersection points.
        var lambda0 = a[0],
            lambda1 = b[0],
            phi0 = a[1],
            phi1 = b[1],
            z;

        if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

        var delta = lambda1 - lambda0,
            polar = abs$1(delta - pi$1) < epsilon$1,
            meridian = polar || delta < epsilon$1;

        if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

        // Check that the first point is between a and b.
        if (meridian
            ? polar
              ? phi0 + phi1 > 0 ^ q[1] < (abs$1(q[0] - lambda0) < epsilon$1 ? phi0 : phi1)
              : phi0 <= q[1] && q[1] <= phi1
            : delta > pi$1 ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
          var q1 = cartesianScale(u, (-w + t) / uu);
          cartesianAddInPlace(q1, A);
          return [q, spherical(q1)];
        }
      }

      // Generates a 4-bit vector representing the location of a point relative to
      // the small circle's bounding box.
      function code(lambda, phi) {
        var r = smallRadius ? radius : pi$1 - radius,
            code = 0;
        if (lambda < -r) code |= 1; // left
        else if (lambda > r) code |= 2; // right
        if (phi < -r) code |= 4; // below
        else if (phi > r) code |= 8; // above
        return code;
      }

      return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi$1, radius - pi$1]);
    }

    function clipLine(a, b, x0, y0, x1, y1) {
      var ax = a[0],
          ay = a[1],
          bx = b[0],
          by = b[1],
          t0 = 0,
          t1 = 1,
          dx = bx - ax,
          dy = by - ay,
          r;

      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
      if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
      return true;
    }

    var clipMax = 1e9, clipMin = -clipMax;

    // TODO Use d3-polygon’s polygonContains here for the ring check?
    // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

    function clipRectangle(x0, y0, x1, y1) {

      function visible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }

      function interpolate(from, to, direction, stream) {
        var a = 0, a1 = 0;
        if (from == null
            || (a = corner(from, direction)) !== (a1 = corner(to, direction))
            || comparePoint(from, to) < 0 ^ direction > 0) {
          do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          stream.point(to[0], to[1]);
        }
      }

      function corner(p, direction) {
        return abs$1(p[0] - x0) < epsilon$1 ? direction > 0 ? 0 : 3
            : abs$1(p[0] - x1) < epsilon$1 ? direction > 0 ? 2 : 1
            : abs$1(p[1] - y0) < epsilon$1 ? direction > 0 ? 1 : 0
            : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
      }

      function compareIntersection(a, b) {
        return comparePoint(a.x, b.x);
      }

      function comparePoint(a, b) {
        var ca = corner(a, 1),
            cb = corner(b, 1);
        return ca !== cb ? ca - cb
            : ca === 0 ? b[1] - a[1]
            : ca === 1 ? a[0] - b[0]
            : ca === 2 ? a[1] - b[1]
            : b[0] - a[0];
      }

      return function(stream) {
        var activeStream = stream,
            bufferStream = clipBuffer(),
            segments,
            polygon,
            ring,
            x__, y__, v__, // first point
            x_, y_, v_, // previous point
            first,
            clean;

        var clipStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: polygonStart,
          polygonEnd: polygonEnd
        };

        function point(x, y) {
          if (visible(x, y)) activeStream.point(x, y);
        }

        function polygonInside() {
          var winding = 0;

          for (var i = 0, n = polygon.length; i < n; ++i) {
            for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
              a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
              if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
              else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
            }
          }

          return winding;
        }

        // Buffer geometry within a polygon and then clip it en masse.
        function polygonStart() {
          activeStream = bufferStream, segments = [], polygon = [], clean = true;
        }

        function polygonEnd() {
          var startInside = polygonInside(),
              cleanInside = clean && startInside,
              visible = (segments = merge(segments)).length;
          if (cleanInside || visible) {
            stream.polygonStart();
            if (cleanInside) {
              stream.lineStart();
              interpolate(null, null, 1, stream);
              stream.lineEnd();
            }
            if (visible) {
              clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
            }
            stream.polygonEnd();
          }
          activeStream = stream, segments = polygon = ring = null;
        }

        function lineStart() {
          clipStream.point = linePoint;
          if (polygon) polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }

        // TODO rather than special-case polygons, simply handle them separately.
        // Ideally, coincident intersection points should be jittered to avoid
        // clipping issues.
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_) bufferStream.rejoin();
            segments.push(bufferStream.result());
          }
          clipStream.point = point;
          if (v_) activeStream.lineEnd();
        }

        function linePoint(x, y) {
          var v = visible(x, y);
          if (polygon) ring.push([x, y]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
            }
          } else {
            if (v && v_) activeStream.point(x, y);
            else {
              var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                  b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
              if (clipLine(a, b, x0, y0, x1, y1)) {
                if (!v_) {
                  activeStream.lineStart();
                  activeStream.point(a[0], a[1]);
                }
                activeStream.point(b[0], b[1]);
                if (!v) activeStream.lineEnd();
                clean = false;
              } else if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }

        return clipStream;
      };
    }

    function extent() {
      var x0 = 0,
          y0 = 0,
          x1 = 960,
          y1 = 500,
          cache,
          cacheStream,
          clip;

      return clip = {
        stream: function(stream) {
          return cache && cacheStream === stream ? cache : cache = clipRectangle(x0, y0, x1, y1)(cacheStream = stream);
        },
        extent: function(_) {
          return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clip) : [[x0, y0], [x1, y1]];
        }
      };
    }

    var lengthSum$1,
        lambda0,
        sinPhi0,
        cosPhi0;

    var lengthStream$1 = {
      sphere: noop$1,
      point: noop$1,
      lineStart: lengthLineStart,
      lineEnd: noop$1,
      polygonStart: noop$1,
      polygonEnd: noop$1
    };

    function lengthLineStart() {
      lengthStream$1.point = lengthPointFirst$1;
      lengthStream$1.lineEnd = lengthLineEnd;
    }

    function lengthLineEnd() {
      lengthStream$1.point = lengthStream$1.lineEnd = noop$1;
    }

    function lengthPointFirst$1(lambda, phi) {
      lambda *= radians, phi *= radians;
      lambda0 = lambda, sinPhi0 = sin$1(phi), cosPhi0 = cos$1(phi);
      lengthStream$1.point = lengthPoint$1;
    }

    function lengthPoint$1(lambda, phi) {
      lambda *= radians, phi *= radians;
      var sinPhi = sin$1(phi),
          cosPhi = cos$1(phi),
          delta = abs$1(lambda - lambda0),
          cosDelta = cos$1(delta),
          sinDelta = sin$1(delta),
          x = cosPhi * sinDelta,
          y = cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosDelta,
          z = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosDelta;
      lengthSum$1.add(atan2$1(sqrt$2(x * x + y * y), z));
      lambda0 = lambda, sinPhi0 = sinPhi, cosPhi0 = cosPhi;
    }

    function length$1(object) {
      lengthSum$1 = new Adder();
      geoStream(object, lengthStream$1);
      return +lengthSum$1;
    }

    var coordinates = [null, null],
        object = {type: "LineString", coordinates: coordinates};

    function distance(a, b) {
      coordinates[0] = a;
      coordinates[1] = b;
      return length$1(object);
    }

    var containsObjectType = {
      Feature: function(object, point) {
        return containsGeometry(object.geometry, point);
      },
      FeatureCollection: function(object, point) {
        var features = object.features, i = -1, n = features.length;
        while (++i < n) if (containsGeometry(features[i].geometry, point)) return true;
        return false;
      }
    };

    var containsGeometryType = {
      Sphere: function() {
        return true;
      },
      Point: function(object, point) {
        return containsPoint(object.coordinates, point);
      },
      MultiPoint: function(object, point) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) if (containsPoint(coordinates[i], point)) return true;
        return false;
      },
      LineString: function(object, point) {
        return containsLine(object.coordinates, point);
      },
      MultiLineString: function(object, point) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) if (containsLine(coordinates[i], point)) return true;
        return false;
      },
      Polygon: function(object, point) {
        return containsPolygon(object.coordinates, point);
      },
      MultiPolygon: function(object, point) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) if (containsPolygon(coordinates[i], point)) return true;
        return false;
      },
      GeometryCollection: function(object, point) {
        var geometries = object.geometries, i = -1, n = geometries.length;
        while (++i < n) if (containsGeometry(geometries[i], point)) return true;
        return false;
      }
    };

    function containsGeometry(geometry, point) {
      return geometry && containsGeometryType.hasOwnProperty(geometry.type)
          ? containsGeometryType[geometry.type](geometry, point)
          : false;
    }

    function containsPoint(coordinates, point) {
      return distance(coordinates, point) === 0;
    }

    function containsLine(coordinates, point) {
      var ao, bo, ab;
      for (var i = 0, n = coordinates.length; i < n; i++) {
        bo = distance(coordinates[i], point);
        if (bo === 0) return true;
        if (i > 0) {
          ab = distance(coordinates[i], coordinates[i - 1]);
          if (
            ab > 0 &&
            ao <= ab &&
            bo <= ab &&
            (ao + bo - ab) * (1 - Math.pow((ao - bo) / ab, 2)) < epsilon2 * ab
          )
            return true;
        }
        ao = bo;
      }
      return false;
    }

    function containsPolygon(coordinates, point) {
      return !!polygonContains(coordinates.map(ringRadians), pointRadians(point));
    }

    function ringRadians(ring) {
      return ring = ring.map(pointRadians), ring.pop(), ring;
    }

    function pointRadians(point) {
      return [point[0] * radians, point[1] * radians];
    }

    function contains$1(object, point) {
      return (object && containsObjectType.hasOwnProperty(object.type)
          ? containsObjectType[object.type]
          : containsGeometry)(object, point);
    }

    function graticuleX(y0, y1, dy) {
      var y = range$2(y0, y1 - epsilon$1, dy).concat(y1);
      return function(x) { return y.map(function(y) { return [x, y]; }); };
    }

    function graticuleY(x0, x1, dx) {
      var x = range$2(x0, x1 - epsilon$1, dx).concat(x1);
      return function(y) { return x.map(function(x) { return [x, y]; }); };
    }

    function graticule() {
      var x1, x0, X1, X0,
          y1, y0, Y1, Y0,
          dx = 10, dy = dx, DX = 90, DY = 360,
          x, y, X, Y,
          precision = 2.5;

      function graticule() {
        return {type: "MultiLineString", coordinates: lines()};
      }

      function lines() {
        return range$2(ceil(X0 / DX) * DX, X1, DX).map(X)
            .concat(range$2(ceil(Y0 / DY) * DY, Y1, DY).map(Y))
            .concat(range$2(ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return abs$1(x % DX) > epsilon$1; }).map(x))
            .concat(range$2(ceil(y0 / dy) * dy, y1, dy).filter(function(y) { return abs$1(y % DY) > epsilon$1; }).map(y));
      }

      graticule.lines = function() {
        return lines().map(function(coordinates) { return {type: "LineString", coordinates: coordinates}; });
      };

      graticule.outline = function() {
        return {
          type: "Polygon",
          coordinates: [
            X(X0).concat(
            Y(Y1).slice(1),
            X(X1).reverse().slice(1),
            Y(Y0).reverse().slice(1))
          ]
        };
      };

      graticule.extent = function(_) {
        if (!arguments.length) return graticule.extentMinor();
        return graticule.extentMajor(_).extentMinor(_);
      };

      graticule.extentMajor = function(_) {
        if (!arguments.length) return [[X0, Y0], [X1, Y1]];
        X0 = +_[0][0], X1 = +_[1][0];
        Y0 = +_[0][1], Y1 = +_[1][1];
        if (X0 > X1) _ = X0, X0 = X1, X1 = _;
        if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
        return graticule.precision(precision);
      };

      graticule.extentMinor = function(_) {
        if (!arguments.length) return [[x0, y0], [x1, y1]];
        x0 = +_[0][0], x1 = +_[1][0];
        y0 = +_[0][1], y1 = +_[1][1];
        if (x0 > x1) _ = x0, x0 = x1, x1 = _;
        if (y0 > y1) _ = y0, y0 = y1, y1 = _;
        return graticule.precision(precision);
      };

      graticule.step = function(_) {
        if (!arguments.length) return graticule.stepMinor();
        return graticule.stepMajor(_).stepMinor(_);
      };

      graticule.stepMajor = function(_) {
        if (!arguments.length) return [DX, DY];
        DX = +_[0], DY = +_[1];
        return graticule;
      };

      graticule.stepMinor = function(_) {
        if (!arguments.length) return [dx, dy];
        dx = +_[0], dy = +_[1];
        return graticule;
      };

      graticule.precision = function(_) {
        if (!arguments.length) return precision;
        precision = +_;
        x = graticuleX(y0, y1, 90);
        y = graticuleY(x0, x1, precision);
        X = graticuleX(Y0, Y1, 90);
        Y = graticuleY(X0, X1, precision);
        return graticule;
      };

      return graticule
          .extentMajor([[-180, -90 + epsilon$1], [180, 90 - epsilon$1]])
          .extentMinor([[-180, -80 - epsilon$1], [180, 80 + epsilon$1]]);
    }

    function graticule10() {
      return graticule()();
    }

    function interpolate(a, b) {
      var x0 = a[0] * radians,
          y0 = a[1] * radians,
          x1 = b[0] * radians,
          y1 = b[1] * radians,
          cy0 = cos$1(y0),
          sy0 = sin$1(y0),
          cy1 = cos$1(y1),
          sy1 = sin$1(y1),
          kx0 = cy0 * cos$1(x0),
          ky0 = cy0 * sin$1(x0),
          kx1 = cy1 * cos$1(x1),
          ky1 = cy1 * sin$1(x1),
          d = 2 * asin$1(sqrt$2(haversin(y1 - y0) + cy0 * cy1 * haversin(x1 - x0))),
          k = sin$1(d);

      var interpolate = d ? function(t) {
        var B = sin$1(t *= d) / k,
            A = sin$1(d - t) / k,
            x = A * kx0 + B * kx1,
            y = A * ky0 + B * ky1,
            z = A * sy0 + B * sy1;
        return [
          atan2$1(y, x) * degrees,
          atan2$1(z, sqrt$2(x * x + y * y)) * degrees
        ];
      } : function() {
        return [x0 * degrees, y0 * degrees];
      };

      interpolate.distance = d;

      return interpolate;
    }

    var identity$5 = x => x;

    var areaSum = new Adder(),
        areaRingSum = new Adder(),
        x00$2,
        y00$2,
        x0$3,
        y0$3;

    var areaStream = {
      point: noop$1,
      lineStart: noop$1,
      lineEnd: noop$1,
      polygonStart: function() {
        areaStream.lineStart = areaRingStart;
        areaStream.lineEnd = areaRingEnd;
      },
      polygonEnd: function() {
        areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$1;
        areaSum.add(abs$1(areaRingSum));
        areaRingSum = new Adder();
      },
      result: function() {
        var area = areaSum / 2;
        areaSum = new Adder();
        return area;
      }
    };

    function areaRingStart() {
      areaStream.point = areaPointFirst;
    }

    function areaPointFirst(x, y) {
      areaStream.point = areaPoint;
      x00$2 = x0$3 = x, y00$2 = y0$3 = y;
    }

    function areaPoint(x, y) {
      areaRingSum.add(y0$3 * x - x0$3 * y);
      x0$3 = x, y0$3 = y;
    }

    function areaRingEnd() {
      areaPoint(x00$2, y00$2);
    }

    var pathArea = areaStream;

    var x0$2 = Infinity,
        y0$2 = x0$2,
        x1 = -x0$2,
        y1 = x1;

    var boundsStream = {
      point: boundsPoint,
      lineStart: noop$1,
      lineEnd: noop$1,
      polygonStart: noop$1,
      polygonEnd: noop$1,
      result: function() {
        var bounds = [[x0$2, y0$2], [x1, y1]];
        x1 = y1 = -(y0$2 = x0$2 = Infinity);
        return bounds;
      }
    };

    function boundsPoint(x, y) {
      if (x < x0$2) x0$2 = x;
      if (x > x1) x1 = x;
      if (y < y0$2) y0$2 = y;
      if (y > y1) y1 = y;
    }

    var boundsStream$1 = boundsStream;

    // TODO Enforce positive area for exterior, negative area for interior?

    var X0 = 0,
        Y0 = 0,
        Z0 = 0,
        X1 = 0,
        Y1 = 0,
        Z1 = 0,
        X2 = 0,
        Y2 = 0,
        Z2 = 0,
        x00$1,
        y00$1,
        x0$1,
        y0$1;

    var centroidStream = {
      point: centroidPoint,
      lineStart: centroidLineStart,
      lineEnd: centroidLineEnd,
      polygonStart: function() {
        centroidStream.lineStart = centroidRingStart;
        centroidStream.lineEnd = centroidRingEnd;
      },
      polygonEnd: function() {
        centroidStream.point = centroidPoint;
        centroidStream.lineStart = centroidLineStart;
        centroidStream.lineEnd = centroidLineEnd;
      },
      result: function() {
        var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
            : Z1 ? [X1 / Z1, Y1 / Z1]
            : Z0 ? [X0 / Z0, Y0 / Z0]
            : [NaN, NaN];
        X0 = Y0 = Z0 =
        X1 = Y1 = Z1 =
        X2 = Y2 = Z2 = 0;
        return centroid;
      }
    };

    function centroidPoint(x, y) {
      X0 += x;
      Y0 += y;
      ++Z0;
    }

    function centroidLineStart() {
      centroidStream.point = centroidPointFirstLine;
    }

    function centroidPointFirstLine(x, y) {
      centroidStream.point = centroidPointLine;
      centroidPoint(x0$1 = x, y0$1 = y);
    }

    function centroidPointLine(x, y) {
      var dx = x - x0$1, dy = y - y0$1, z = sqrt$2(dx * dx + dy * dy);
      X1 += z * (x0$1 + x) / 2;
      Y1 += z * (y0$1 + y) / 2;
      Z1 += z;
      centroidPoint(x0$1 = x, y0$1 = y);
    }

    function centroidLineEnd() {
      centroidStream.point = centroidPoint;
    }

    function centroidRingStart() {
      centroidStream.point = centroidPointFirstRing;
    }

    function centroidRingEnd() {
      centroidPointRing(x00$1, y00$1);
    }

    function centroidPointFirstRing(x, y) {
      centroidStream.point = centroidPointRing;
      centroidPoint(x00$1 = x0$1 = x, y00$1 = y0$1 = y);
    }

    function centroidPointRing(x, y) {
      var dx = x - x0$1,
          dy = y - y0$1,
          z = sqrt$2(dx * dx + dy * dy);

      X1 += z * (x0$1 + x) / 2;
      Y1 += z * (y0$1 + y) / 2;
      Z1 += z;

      z = y0$1 * x - x0$1 * y;
      X2 += z * (x0$1 + x);
      Y2 += z * (y0$1 + y);
      Z2 += z * 3;
      centroidPoint(x0$1 = x, y0$1 = y);
    }

    var pathCentroid = centroidStream;

    function PathContext(context) {
      this._context = context;
    }

    PathContext.prototype = {
      _radius: 4.5,
      pointRadius: function(_) {
        return this._radius = _, this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._context.closePath();
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._context.moveTo(x, y);
            this._point = 1;
            break;
          }
          case 1: {
            this._context.lineTo(x, y);
            break;
          }
          default: {
            this._context.moveTo(x + this._radius, y);
            this._context.arc(x, y, this._radius, 0, tau$1);
            break;
          }
        }
      },
      result: noop$1
    };

    var lengthSum = new Adder(),
        lengthRing,
        x00,
        y00,
        x0,
        y0;

    var lengthStream = {
      point: noop$1,
      lineStart: function() {
        lengthStream.point = lengthPointFirst;
      },
      lineEnd: function() {
        if (lengthRing) lengthPoint(x00, y00);
        lengthStream.point = noop$1;
      },
      polygonStart: function() {
        lengthRing = true;
      },
      polygonEnd: function() {
        lengthRing = null;
      },
      result: function() {
        var length = +lengthSum;
        lengthSum = new Adder();
        return length;
      }
    };

    function lengthPointFirst(x, y) {
      lengthStream.point = lengthPoint;
      x00 = x0 = x, y00 = y0 = y;
    }

    function lengthPoint(x, y) {
      x0 -= x, y0 -= y;
      lengthSum.add(sqrt$2(x0 * x0 + y0 * y0));
      x0 = x, y0 = y;
    }

    var pathMeasure = lengthStream;

    function PathString() {
      this._string = [];
    }

    PathString.prototype = {
      _radius: 4.5,
      _circle: circle$1(4.5),
      pointRadius: function(_) {
        if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
        return this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._string.push("Z");
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._string.push("M", x, ",", y);
            this._point = 1;
            break;
          }
          case 1: {
            this._string.push("L", x, ",", y);
            break;
          }
          default: {
            if (this._circle == null) this._circle = circle$1(this._radius);
            this._string.push("M", x, ",", y, this._circle);
            break;
          }
        }
      },
      result: function() {
        if (this._string.length) {
          var result = this._string.join("");
          this._string = [];
          return result;
        } else {
          return null;
        }
      }
    };

    function circle$1(radius) {
      return "m0," + radius
          + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
          + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
          + "z";
    }

    function index$2(projection, context) {
      var pointRadius = 4.5,
          projectionStream,
          contextStream;

      function path(object) {
        if (object) {
          if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
          geoStream(object, projectionStream(contextStream));
        }
        return contextStream.result();
      }

      path.area = function(object) {
        geoStream(object, projectionStream(pathArea));
        return pathArea.result();
      };

      path.measure = function(object) {
        geoStream(object, projectionStream(pathMeasure));
        return pathMeasure.result();
      };

      path.bounds = function(object) {
        geoStream(object, projectionStream(boundsStream$1));
        return boundsStream$1.result();
      };

      path.centroid = function(object) {
        geoStream(object, projectionStream(pathCentroid));
        return pathCentroid.result();
      };

      path.projection = function(_) {
        return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$5) : (projection = _).stream, path) : projection;
      };

      path.context = function(_) {
        if (!arguments.length) return context;
        contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
        if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
        return path;
      };

      path.pointRadius = function(_) {
        if (!arguments.length) return pointRadius;
        pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };

      return path.projection(projection).context(context);
    }

    function transform$1(methods) {
      return {
        stream: transformer$3(methods)
      };
    }

    function transformer$3(methods) {
      return function(stream) {
        var s = new TransformStream;
        for (var key in methods) s[key] = methods[key];
        s.stream = stream;
        return s;
      };
    }

    function TransformStream() {}

    TransformStream.prototype = {
      constructor: TransformStream,
      point: function(x, y) { this.stream.point(x, y); },
      sphere: function() { this.stream.sphere(); },
      lineStart: function() { this.stream.lineStart(); },
      lineEnd: function() { this.stream.lineEnd(); },
      polygonStart: function() { this.stream.polygonStart(); },
      polygonEnd: function() { this.stream.polygonEnd(); }
    };

    function fit(projection, fitBounds, object) {
      var clip = projection.clipExtent && projection.clipExtent();
      projection.scale(150).translate([0, 0]);
      if (clip != null) projection.clipExtent(null);
      geoStream(object, projection.stream(boundsStream$1));
      fitBounds(boundsStream$1.result());
      if (clip != null) projection.clipExtent(clip);
      return projection;
    }

    function fitExtent(projection, extent, object) {
      return fit(projection, function(b) {
        var w = extent[1][0] - extent[0][0],
            h = extent[1][1] - extent[0][1],
            k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
            x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
            y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitSize(projection, size, object) {
      return fitExtent(projection, [[0, 0], size], object);
    }

    function fitWidth(projection, width, object) {
      return fit(projection, function(b) {
        var w = +width,
            k = w / (b[1][0] - b[0][0]),
            x = (w - k * (b[1][0] + b[0][0])) / 2,
            y = -k * b[0][1];
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitHeight(projection, height, object) {
      return fit(projection, function(b) {
        var h = +height,
            k = h / (b[1][1] - b[0][1]),
            x = -k * b[0][0],
            y = (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    var maxDepth = 16, // maximum depth of subdivision
        cosMinDistance = cos$1(30 * radians); // cos(minimum angular distance)

    function resample(project, delta2) {
      return +delta2 ? resample$1(project, delta2) : resampleNone(project);
    }

    function resampleNone(project) {
      return transformer$3({
        point: function(x, y) {
          x = project(x, y);
          this.stream.point(x[0], x[1]);
        }
      });
    }

    function resample$1(project, delta2) {

      function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0,
            dy = y1 - y0,
            d2 = dx * dx + dy * dy;
        if (d2 > 4 * delta2 && depth--) {
          var a = a0 + a1,
              b = b0 + b1,
              c = c0 + c1,
              m = sqrt$2(a * a + b * b + c * c),
              phi2 = asin$1(c /= m),
              lambda2 = abs$1(abs$1(c) - 1) < epsilon$1 || abs$1(lambda0 - lambda1) < epsilon$1 ? (lambda0 + lambda1) / 2 : atan2$1(b, a),
              p = project(lambda2, phi2),
              x2 = p[0],
              y2 = p[1],
              dx2 = x2 - x0,
              dy2 = y2 - y0,
              dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > delta2 // perpendicular projected distance
              || abs$1((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
              || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
            resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
          }
        }
      }
      return function(stream) {
        var lambda00, x00, y00, a00, b00, c00, // first point
            lambda0, x0, y0, a0, b0, c0; // previous point

        var resampleStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
          polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
        };

        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }

        function lineStart() {
          x0 = NaN;
          resampleStream.point = linePoint;
          stream.lineStart();
        }

        function linePoint(lambda, phi) {
          var c = cartesian([lambda, phi]), p = project(lambda, phi);
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }

        function lineEnd() {
          resampleStream.point = point;
          stream.lineEnd();
        }

        function ringStart() {
          lineStart();
          resampleStream.point = ringPoint;
          resampleStream.lineEnd = ringEnd;
        }

        function ringPoint(lambda, phi) {
          linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resampleStream.point = linePoint;
        }

        function ringEnd() {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
          resampleStream.lineEnd = lineEnd;
          lineEnd();
        }

        return resampleStream;
      };
    }

    var transformRadians = transformer$3({
      point: function(x, y) {
        this.stream.point(x * radians, y * radians);
      }
    });

    function transformRotate(rotate) {
      return transformer$3({
        point: function(x, y) {
          var r = rotate(x, y);
          return this.stream.point(r[0], r[1]);
        }
      });
    }

    function scaleTranslate(k, dx, dy, sx, sy) {
      function transform(x, y) {
        x *= sx; y *= sy;
        return [dx + k * x, dy - k * y];
      }
      transform.invert = function(x, y) {
        return [(x - dx) / k * sx, (dy - y) / k * sy];
      };
      return transform;
    }

    function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
      if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
      var cosAlpha = cos$1(alpha),
          sinAlpha = sin$1(alpha),
          a = cosAlpha * k,
          b = sinAlpha * k,
          ai = cosAlpha / k,
          bi = sinAlpha / k,
          ci = (sinAlpha * dy - cosAlpha * dx) / k,
          fi = (sinAlpha * dx + cosAlpha * dy) / k;
      function transform(x, y) {
        x *= sx; y *= sy;
        return [a * x - b * y + dx, dy - b * x - a * y];
      }
      transform.invert = function(x, y) {
        return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
      };
      return transform;
    }

    function projection(project) {
      return projectionMutator(function() { return project; })();
    }

    function projectionMutator(projectAt) {
      var project,
          k = 150, // scale
          x = 480, y = 250, // translate
          lambda = 0, phi = 0, // center
          deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
          alpha = 0, // post-rotate angle
          sx = 1, // reflectX
          sy = 1, // reflectX
          theta = null, preclip = clipAntimeridian, // pre-clip angle
          x0 = null, y0, x1, y1, postclip = identity$5, // post-clip extent
          delta2 = 0.5, // precision
          projectResample,
          projectTransform,
          projectRotateTransform,
          cache,
          cacheStream;

      function projection(point) {
        return projectRotateTransform(point[0] * radians, point[1] * radians);
      }

      function invert(point) {
        point = projectRotateTransform.invert(point[0], point[1]);
        return point && [point[0] * degrees, point[1] * degrees];
      }

      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
      };

      projection.preclip = function(_) {
        return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
      };

      projection.postclip = function(_) {
        return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
      };

      projection.clipAngle = function(_) {
        return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
      };

      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$5) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      projection.scale = function(_) {
        return arguments.length ? (k = +_, recenter()) : k;
      };

      projection.translate = function(_) {
        return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
      };

      projection.center = function(_) {
        return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
      };

      projection.rotate = function(_) {
        return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
      };

      projection.angle = function(_) {
        return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
      };

      projection.reflectX = function(_) {
        return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
      };

      projection.reflectY = function(_) {
        return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
      };

      projection.precision = function(_) {
        return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt$2(delta2);
      };

      projection.fitExtent = function(extent, object) {
        return fitExtent(projection, extent, object);
      };

      projection.fitSize = function(size, object) {
        return fitSize(projection, size, object);
      };

      projection.fitWidth = function(width, object) {
        return fitWidth(projection, width, object);
      };

      projection.fitHeight = function(height, object) {
        return fitHeight(projection, height, object);
      };

      function recenter() {
        var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
            transform = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
        rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
        projectTransform = compose(project, transform);
        projectRotateTransform = compose(rotate, projectTransform);
        projectResample = resample(projectTransform, delta2);
        return reset();
      }

      function reset() {
        cache = cacheStream = null;
        return projection;
      }

      return function() {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return recenter();
      };
    }

    function conicProjection(projectAt) {
      var phi0 = 0,
          phi1 = pi$1 / 3,
          m = projectionMutator(projectAt),
          p = m(phi0, phi1);

      p.parallels = function(_) {
        return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
      };

      return p;
    }

    function cylindricalEqualAreaRaw(phi0) {
      var cosPhi0 = cos$1(phi0);

      function forward(lambda, phi) {
        return [lambda * cosPhi0, sin$1(phi) / cosPhi0];
      }

      forward.invert = function(x, y) {
        return [x / cosPhi0, asin$1(y * cosPhi0)];
      };

      return forward;
    }

    function conicEqualAreaRaw(y0, y1) {
      var sy0 = sin$1(y0), n = (sy0 + sin$1(y1)) / 2;

      // Are the parallels symmetrical around the Equator?
      if (abs$1(n) < epsilon$1) return cylindricalEqualAreaRaw(y0);

      var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt$2(c) / n;

      function project(x, y) {
        var r = sqrt$2(c - 2 * n * sin$1(y)) / n;
        return [r * sin$1(x *= n), r0 - r * cos$1(x)];
      }

      project.invert = function(x, y) {
        var r0y = r0 - y,
            l = atan2$1(x, abs$1(r0y)) * sign$1(r0y);
        if (r0y * n < 0)
          l -= pi$1 * sign$1(x) * sign$1(r0y);
        return [l / n, asin$1((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
      };

      return project;
    }

    function conicEqualArea() {
      return conicProjection(conicEqualAreaRaw)
          .scale(155.424)
          .center([0, 33.6442]);
    }

    function albers() {
      return conicEqualArea()
          .parallels([29.5, 45.5])
          .scale(1070)
          .translate([480, 250])
          .rotate([96, 0])
          .center([-0.6, 38.7]);
    }

    // The projections must have mutually exclusive clip regions on the sphere,
    // as this will avoid emitting interleaving lines and polygons.
    function multiplex(streams) {
      var n = streams.length;
      return {
        point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
        sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
        lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
        lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
        polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
        polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
      };
    }

    // A composite projection for the United States, configured by default for
    // 960×500. The projection also works quite well at 960×600 if you change the
    // scale to 1285 and adjust the translate accordingly. The set of standard
    // parallels for each region comes from USGS, which is published here:
    // http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
    function albersUsa() {
      var cache,
          cacheStream,
          lower48 = albers(), lower48Point,
          alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
          hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
          point, pointStream = {point: function(x, y) { point = [x, y]; }};

      function albersUsa(coordinates) {
        var x = coordinates[0], y = coordinates[1];
        return point = null,
            (lower48Point.point(x, y), point)
            || (alaskaPoint.point(x, y), point)
            || (hawaiiPoint.point(x, y), point);
      }

      albersUsa.invert = function(coordinates) {
        var k = lower48.scale(),
            t = lower48.translate(),
            x = (coordinates[0] - t[0]) / k,
            y = (coordinates[1] - t[1]) / k;
        return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
            : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
            : lower48).invert(coordinates);
      };

      albersUsa.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
      };

      albersUsa.precision = function(_) {
        if (!arguments.length) return lower48.precision();
        lower48.precision(_), alaska.precision(_), hawaii.precision(_);
        return reset();
      };

      albersUsa.scale = function(_) {
        if (!arguments.length) return lower48.scale();
        lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
        return albersUsa.translate(lower48.translate());
      };

      albersUsa.translate = function(_) {
        if (!arguments.length) return lower48.translate();
        var k = lower48.scale(), x = +_[0], y = +_[1];

        lower48Point = lower48
            .translate(_)
            .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
            .stream(pointStream);

        alaskaPoint = alaska
            .translate([x - 0.307 * k, y + 0.201 * k])
            .clipExtent([[x - 0.425 * k + epsilon$1, y + 0.120 * k + epsilon$1], [x - 0.214 * k - epsilon$1, y + 0.234 * k - epsilon$1]])
            .stream(pointStream);

        hawaiiPoint = hawaii
            .translate([x - 0.205 * k, y + 0.212 * k])
            .clipExtent([[x - 0.214 * k + epsilon$1, y + 0.166 * k + epsilon$1], [x - 0.115 * k - epsilon$1, y + 0.234 * k - epsilon$1]])
            .stream(pointStream);

        return reset();
      };

      albersUsa.fitExtent = function(extent, object) {
        return fitExtent(albersUsa, extent, object);
      };

      albersUsa.fitSize = function(size, object) {
        return fitSize(albersUsa, size, object);
      };

      albersUsa.fitWidth = function(width, object) {
        return fitWidth(albersUsa, width, object);
      };

      albersUsa.fitHeight = function(height, object) {
        return fitHeight(albersUsa, height, object);
      };

      function reset() {
        cache = cacheStream = null;
        return albersUsa;
      }

      return albersUsa.scale(1070);
    }

    function azimuthalRaw(scale) {
      return function(x, y) {
        var cx = cos$1(x),
            cy = cos$1(y),
            k = scale(cx * cy);
            if (k === Infinity) return [2, 0];
        return [
          k * cy * sin$1(x),
          k * sin$1(y)
        ];
      }
    }

    function azimuthalInvert(angle) {
      return function(x, y) {
        var z = sqrt$2(x * x + y * y),
            c = angle(z),
            sc = sin$1(c),
            cc = cos$1(c);
        return [
          atan2$1(x * sc, z * cc),
          asin$1(z && y * sc / z)
        ];
      }
    }

    var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
      return sqrt$2(2 / (1 + cxcy));
    });

    azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
      return 2 * asin$1(z / 2);
    });

    function azimuthalEqualArea() {
      return projection(azimuthalEqualAreaRaw)
          .scale(124.75)
          .clipAngle(180 - 1e-3);
    }

    var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
      return (c = acos$1(c)) && c / sin$1(c);
    });

    azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
      return z;
    });

    function azimuthalEquidistant() {
      return projection(azimuthalEquidistantRaw)
          .scale(79.4188)
          .clipAngle(180 - 1e-3);
    }

    function mercatorRaw(lambda, phi) {
      return [lambda, log$1(tan((halfPi$1 + phi) / 2))];
    }

    mercatorRaw.invert = function(x, y) {
      return [x, 2 * atan(exp(y)) - halfPi$1];
    };

    function mercator() {
      return mercatorProjection(mercatorRaw)
          .scale(961 / tau$1);
    }

    function mercatorProjection(project) {
      var m = projection(project),
          center = m.center,
          scale = m.scale,
          translate = m.translate,
          clipExtent = m.clipExtent,
          x0 = null, y0, x1, y1; // clip extent

      m.scale = function(_) {
        return arguments.length ? (scale(_), reclip()) : scale();
      };

      m.translate = function(_) {
        return arguments.length ? (translate(_), reclip()) : translate();
      };

      m.center = function(_) {
        return arguments.length ? (center(_), reclip()) : center();
      };

      m.clipExtent = function(_) {
        return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      function reclip() {
        var k = pi$1 * scale(),
            t = m(rotation(m.rotate()).invert([0, 0]));
        return clipExtent(x0 == null
            ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
            ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
            : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
      }

      return reclip();
    }

    function tany(y) {
      return tan((halfPi$1 + y) / 2);
    }

    function conicConformalRaw(y0, y1) {
      var cy0 = cos$1(y0),
          n = y0 === y1 ? sin$1(y0) : log$1(cy0 / cos$1(y1)) / log$1(tany(y1) / tany(y0)),
          f = cy0 * pow$1(tany(y0), n) / n;

      if (!n) return mercatorRaw;

      function project(x, y) {
        if (f > 0) { if (y < -halfPi$1 + epsilon$1) y = -halfPi$1 + epsilon$1; }
        else { if (y > halfPi$1 - epsilon$1) y = halfPi$1 - epsilon$1; }
        var r = f / pow$1(tany(y), n);
        return [r * sin$1(n * x), f - r * cos$1(n * x)];
      }

      project.invert = function(x, y) {
        var fy = f - y, r = sign$1(n) * sqrt$2(x * x + fy * fy),
          l = atan2$1(x, abs$1(fy)) * sign$1(fy);
        if (fy * n < 0)
          l -= pi$1 * sign$1(x) * sign$1(fy);
        return [l / n, 2 * atan(pow$1(f / r, 1 / n)) - halfPi$1];
      };

      return project;
    }

    function conicConformal() {
      return conicProjection(conicConformalRaw)
          .scale(109.5)
          .parallels([30, 30]);
    }

    function equirectangularRaw(lambda, phi) {
      return [lambda, phi];
    }

    equirectangularRaw.invert = equirectangularRaw;

    function equirectangular() {
      return projection(equirectangularRaw)
          .scale(152.63);
    }

    function conicEquidistantRaw(y0, y1) {
      var cy0 = cos$1(y0),
          n = y0 === y1 ? sin$1(y0) : (cy0 - cos$1(y1)) / (y1 - y0),
          g = cy0 / n + y0;

      if (abs$1(n) < epsilon$1) return equirectangularRaw;

      function project(x, y) {
        var gy = g - y, nx = n * x;
        return [gy * sin$1(nx), g - gy * cos$1(nx)];
      }

      project.invert = function(x, y) {
        var gy = g - y,
            l = atan2$1(x, abs$1(gy)) * sign$1(gy);
        if (gy * n < 0)
          l -= pi$1 * sign$1(x) * sign$1(gy);
        return [l / n, g - sign$1(n) * sqrt$2(x * x + gy * gy)];
      };

      return project;
    }

    function conicEquidistant() {
      return conicProjection(conicEquidistantRaw)
          .scale(131.154)
          .center([0, 13.9389]);
    }

    var A1 = 1.340264,
        A2 = -0.081106,
        A3 = 0.000893,
        A4 = 0.003796,
        M = sqrt$2(3) / 2,
        iterations = 12;

    function equalEarthRaw(lambda, phi) {
      var l = asin$1(M * sin$1(phi)), l2 = l * l, l6 = l2 * l2 * l2;
      return [
        lambda * cos$1(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
        l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
      ];
    }

    equalEarthRaw.invert = function(x, y) {
      var l = y, l2 = l * l, l6 = l2 * l2 * l2;
      for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
        fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
        fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
        l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
        if (abs$1(delta) < epsilon2) break;
      }
      return [
        M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos$1(l),
        asin$1(sin$1(l) / M)
      ];
    };

    function equalEarth() {
      return projection(equalEarthRaw)
          .scale(177.158);
    }

    function gnomonicRaw(x, y) {
      var cy = cos$1(y), k = cos$1(x) * cy;
      return [cy * sin$1(x) / k, sin$1(y) / k];
    }

    gnomonicRaw.invert = azimuthalInvert(atan);

    function gnomonic() {
      return projection(gnomonicRaw)
          .scale(144.049)
          .clipAngle(60);
    }

    function identity$4() {
      var k = 1, tx = 0, ty = 0, sx = 1, sy = 1, // scale, translate and reflect
          alpha = 0, ca, sa, // angle
          x0 = null, y0, x1, y1, // clip extent
          kx = 1, ky = 1,
          transform = transformer$3({
            point: function(x, y) {
              var p = projection([x, y]);
              this.stream.point(p[0], p[1]);
            }
          }),
          postclip = identity$5,
          cache,
          cacheStream;

      function reset() {
        kx = k * sx;
        ky = k * sy;
        cache = cacheStream = null;
        return projection;
      }

      function projection (p) {
        var x = p[0] * kx, y = p[1] * ky;
        if (alpha) {
          var t = y * ca - x * sa;
          x = x * ca + y * sa;
          y = t;
        }    
        return [x + tx, y + ty];
      }
      projection.invert = function(p) {
        var x = p[0] - tx, y = p[1] - ty;
        if (alpha) {
          var t = y * ca + x * sa;
          x = x * ca - y * sa;
          y = t;
        }
        return [x / kx, y / ky];
      };
      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transform(postclip(cacheStream = stream));
      };
      projection.postclip = function(_) {
        return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
      };
      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$5) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };
      projection.scale = function(_) {
        return arguments.length ? (k = +_, reset()) : k;
      };
      projection.translate = function(_) {
        return arguments.length ? (tx = +_[0], ty = +_[1], reset()) : [tx, ty];
      };
      projection.angle = function(_) {
        return arguments.length ? (alpha = _ % 360 * radians, sa = sin$1(alpha), ca = cos$1(alpha), reset()) : alpha * degrees;
      };
      projection.reflectX = function(_) {
        return arguments.length ? (sx = _ ? -1 : 1, reset()) : sx < 0;
      };
      projection.reflectY = function(_) {
        return arguments.length ? (sy = _ ? -1 : 1, reset()) : sy < 0;
      };
      projection.fitExtent = function(extent, object) {
        return fitExtent(projection, extent, object);
      };
      projection.fitSize = function(size, object) {
        return fitSize(projection, size, object);
      };
      projection.fitWidth = function(width, object) {
        return fitWidth(projection, width, object);
      };
      projection.fitHeight = function(height, object) {
        return fitHeight(projection, height, object);
      };

      return projection;
    }

    function naturalEarth1Raw(lambda, phi) {
      var phi2 = phi * phi, phi4 = phi2 * phi2;
      return [
        lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4))),
        phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4)))
      ];
    }

    naturalEarth1Raw.invert = function(x, y) {
      var phi = y, i = 25, delta;
      do {
        var phi2 = phi * phi, phi4 = phi2 * phi2;
        phi -= delta = (phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4))) - y) /
            (1.007226 + phi2 * (0.015085 * 3 + phi4 * (-0.044475 * 7 + 0.028874 * 9 * phi2 - 0.005916 * 11 * phi4)));
      } while (abs$1(delta) > epsilon$1 && --i > 0);
      return [
        x / (0.8707 + (phi2 = phi * phi) * (-0.131979 + phi2 * (-0.013791 + phi2 * phi2 * phi2 * (0.003971 - 0.001529 * phi2)))),
        phi
      ];
    };

    function naturalEarth1() {
      return projection(naturalEarth1Raw)
          .scale(175.295);
    }

    function orthographicRaw(x, y) {
      return [cos$1(y) * sin$1(x), sin$1(y)];
    }

    orthographicRaw.invert = azimuthalInvert(asin$1);

    function orthographic() {
      return projection(orthographicRaw)
          .scale(249.5)
          .clipAngle(90 + epsilon$1);
    }

    function stereographicRaw(x, y) {
      var cy = cos$1(y), k = 1 + cos$1(x) * cy;
      return [cy * sin$1(x) / k, sin$1(y) / k];
    }

    stereographicRaw.invert = azimuthalInvert(function(z) {
      return 2 * atan(z);
    });

    function stereographic() {
      return projection(stereographicRaw)
          .scale(250)
          .clipAngle(142);
    }

    function transverseMercatorRaw(lambda, phi) {
      return [log$1(tan((halfPi$1 + phi) / 2)), -lambda];
    }

    transverseMercatorRaw.invert = function(x, y) {
      return [-y, 2 * atan(exp(x)) - halfPi$1];
    };

    function transverseMercator() {
      var m = mercatorProjection(transverseMercatorRaw),
          center = m.center,
          rotate = m.rotate;

      m.center = function(_) {
        return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
      };

      m.rotate = function(_) {
        return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
      };

      return rotate([0, 0, 90])
          .scale(159.155);
    }

    function defaultSeparation$1(a, b) {
      return a.parent === b.parent ? 1 : 2;
    }

    function meanX(children) {
      return children.reduce(meanXReduce, 0) / children.length;
    }

    function meanXReduce(x, c) {
      return x + c.x;
    }

    function maxY(children) {
      return 1 + children.reduce(maxYReduce, 0);
    }

    function maxYReduce(y, c) {
      return Math.max(y, c.y);
    }

    function leafLeft(node) {
      var children;
      while (children = node.children) node = children[0];
      return node;
    }

    function leafRight(node) {
      var children;
      while (children = node.children) node = children[children.length - 1];
      return node;
    }

    function cluster() {
      var separation = defaultSeparation$1,
          dx = 1,
          dy = 1,
          nodeSize = false;

      function cluster(root) {
        var previousNode,
            x = 0;

        // First walk, computing the initial x & y values.
        root.eachAfter(function(node) {
          var children = node.children;
          if (children) {
            node.x = meanX(children);
            node.y = maxY(children);
          } else {
            node.x = previousNode ? x += separation(node, previousNode) : 0;
            node.y = 0;
            previousNode = node;
          }
        });

        var left = leafLeft(root),
            right = leafRight(root),
            x0 = left.x - separation(left, right) / 2,
            x1 = right.x + separation(right, left) / 2;

        // Second walk, normalizing x & y to the desired size.
        return root.eachAfter(nodeSize ? function(node) {
          node.x = (node.x - root.x) * dx;
          node.y = (root.y - node.y) * dy;
        } : function(node) {
          node.x = (node.x - x0) / (x1 - x0) * dx;
          node.y = (1 - (root.y ? node.y / root.y : 1)) * dy;
        });
      }

      cluster.separation = function(x) {
        return arguments.length ? (separation = x, cluster) : separation;
      };

      cluster.size = function(x) {
        return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? null : [dx, dy]);
      };

      cluster.nodeSize = function(x) {
        return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? [dx, dy] : null);
      };

      return cluster;
    }

    function count(node) {
      var sum = 0,
          children = node.children,
          i = children && children.length;
      if (!i) sum = 1;
      else while (--i >= 0) sum += children[i].value;
      node.value = sum;
    }

    function node_count() {
      return this.eachAfter(count);
    }

    function node_each(callback, that) {
      let index = -1;
      for (const node of this) {
        callback.call(that, node, ++index, this);
      }
      return this;
    }

    function node_eachBefore(callback, that) {
      var node = this, nodes = [node], children, i, index = -1;
      while (node = nodes.pop()) {
        callback.call(that, node, ++index, this);
        if (children = node.children) {
          for (i = children.length - 1; i >= 0; --i) {
            nodes.push(children[i]);
          }
        }
      }
      return this;
    }

    function node_eachAfter(callback, that) {
      var node = this, nodes = [node], next = [], children, i, n, index = -1;
      while (node = nodes.pop()) {
        next.push(node);
        if (children = node.children) {
          for (i = 0, n = children.length; i < n; ++i) {
            nodes.push(children[i]);
          }
        }
      }
      while (node = next.pop()) {
        callback.call(that, node, ++index, this);
      }
      return this;
    }

    function node_find(callback, that) {
      let index = -1;
      for (const node of this) {
        if (callback.call(that, node, ++index, this)) {
          return node;
        }
      }
    }

    function node_sum(value) {
      return this.eachAfter(function(node) {
        var sum = +value(node.data) || 0,
            children = node.children,
            i = children && children.length;
        while (--i >= 0) sum += children[i].value;
        node.value = sum;
      });
    }

    function node_sort(compare) {
      return this.eachBefore(function(node) {
        if (node.children) {
          node.children.sort(compare);
        }
      });
    }

    function node_path(end) {
      var start = this,
          ancestor = leastCommonAncestor(start, end),
          nodes = [start];
      while (start !== ancestor) {
        start = start.parent;
        nodes.push(start);
      }
      var k = nodes.length;
      while (end !== ancestor) {
        nodes.splice(k, 0, end);
        end = end.parent;
      }
      return nodes;
    }

    function leastCommonAncestor(a, b) {
      if (a === b) return a;
      var aNodes = a.ancestors(),
          bNodes = b.ancestors(),
          c = null;
      a = aNodes.pop();
      b = bNodes.pop();
      while (a === b) {
        c = a;
        a = aNodes.pop();
        b = bNodes.pop();
      }
      return c;
    }

    function node_ancestors() {
      var node = this, nodes = [node];
      while (node = node.parent) {
        nodes.push(node);
      }
      return nodes;
    }

    function node_descendants() {
      return Array.from(this);
    }

    function node_leaves() {
      var leaves = [];
      this.eachBefore(function(node) {
        if (!node.children) {
          leaves.push(node);
        }
      });
      return leaves;
    }

    function node_links() {
      var root = this, links = [];
      root.each(function(node) {
        if (node !== root) { // Don’t include the root’s parent, if any.
          links.push({source: node.parent, target: node});
        }
      });
      return links;
    }

    function* node_iterator() {
      var node = this, current, next = [node], children, i, n;
      do {
        current = next.reverse(), next = [];
        while (node = current.pop()) {
          yield node;
          if (children = node.children) {
            for (i = 0, n = children.length; i < n; ++i) {
              next.push(children[i]);
            }
          }
        }
      } while (next.length);
    }

    function hierarchy(data, children) {
      if (data instanceof Map) {
        data = [undefined, data];
        if (children === undefined) children = mapChildren;
      } else if (children === undefined) {
        children = objectChildren;
      }

      var root = new Node$1(data),
          node,
          nodes = [root],
          child,
          childs,
          i,
          n;

      while (node = nodes.pop()) {
        if ((childs = children(node.data)) && (n = (childs = Array.from(childs)).length)) {
          node.children = childs;
          for (i = n - 1; i >= 0; --i) {
            nodes.push(child = childs[i] = new Node$1(childs[i]));
            child.parent = node;
            child.depth = node.depth + 1;
          }
        }
      }

      return root.eachBefore(computeHeight);
    }

    function node_copy() {
      return hierarchy(this).eachBefore(copyData);
    }

    function objectChildren(d) {
      return d.children;
    }

    function mapChildren(d) {
      return Array.isArray(d) ? d[1] : null;
    }

    function copyData(node) {
      if (node.data.value !== undefined) node.value = node.data.value;
      node.data = node.data.data;
    }

    function computeHeight(node) {
      var height = 0;
      do node.height = height;
      while ((node = node.parent) && (node.height < ++height));
    }

    function Node$1(data) {
      this.data = data;
      this.depth =
      this.height = 0;
      this.parent = null;
    }

    Node$1.prototype = hierarchy.prototype = {
      constructor: Node$1,
      count: node_count,
      each: node_each,
      eachAfter: node_eachAfter,
      eachBefore: node_eachBefore,
      find: node_find,
      sum: node_sum,
      sort: node_sort,
      path: node_path,
      ancestors: node_ancestors,
      descendants: node_descendants,
      leaves: node_leaves,
      links: node_links,
      copy: node_copy,
      [Symbol.iterator]: node_iterator
    };

    function array$1(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function shuffle(array) {
      var m = array.length,
          t,
          i;

      while (m) {
        i = Math.random() * m-- | 0;
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      return array;
    }

    function enclose(circles) {
      var i = 0, n = (circles = shuffle(Array.from(circles))).length, B = [], p, e;

      while (i < n) {
        p = circles[i];
        if (e && enclosesWeak(e, p)) ++i;
        else e = encloseBasis(B = extendBasis(B, p)), i = 0;
      }

      return e;
    }

    function extendBasis(B, p) {
      var i, j;

      if (enclosesWeakAll(p, B)) return [p];

      // If we get here then B must have at least one element.
      for (i = 0; i < B.length; ++i) {
        if (enclosesNot(p, B[i])
            && enclosesWeakAll(encloseBasis2(B[i], p), B)) {
          return [B[i], p];
        }
      }

      // If we get here then B must have at least two elements.
      for (i = 0; i < B.length - 1; ++i) {
        for (j = i + 1; j < B.length; ++j) {
          if (enclosesNot(encloseBasis2(B[i], B[j]), p)
              && enclosesNot(encloseBasis2(B[i], p), B[j])
              && enclosesNot(encloseBasis2(B[j], p), B[i])
              && enclosesWeakAll(encloseBasis3(B[i], B[j], p), B)) {
            return [B[i], B[j], p];
          }
        }
      }

      // If we get here then something is very wrong.
      throw new Error;
    }

    function enclosesNot(a, b) {
      var dr = a.r - b.r, dx = b.x - a.x, dy = b.y - a.y;
      return dr < 0 || dr * dr < dx * dx + dy * dy;
    }

    function enclosesWeak(a, b) {
      var dr = a.r - b.r + Math.max(a.r, b.r, 1) * 1e-9, dx = b.x - a.x, dy = b.y - a.y;
      return dr > 0 && dr * dr > dx * dx + dy * dy;
    }

    function enclosesWeakAll(a, B) {
      for (var i = 0; i < B.length; ++i) {
        if (!enclosesWeak(a, B[i])) {
          return false;
        }
      }
      return true;
    }

    function encloseBasis(B) {
      switch (B.length) {
        case 1: return encloseBasis1(B[0]);
        case 2: return encloseBasis2(B[0], B[1]);
        case 3: return encloseBasis3(B[0], B[1], B[2]);
      }
    }

    function encloseBasis1(a) {
      return {
        x: a.x,
        y: a.y,
        r: a.r
      };
    }

    function encloseBasis2(a, b) {
      var x1 = a.x, y1 = a.y, r1 = a.r,
          x2 = b.x, y2 = b.y, r2 = b.r,
          x21 = x2 - x1, y21 = y2 - y1, r21 = r2 - r1,
          l = Math.sqrt(x21 * x21 + y21 * y21);
      return {
        x: (x1 + x2 + x21 / l * r21) / 2,
        y: (y1 + y2 + y21 / l * r21) / 2,
        r: (l + r1 + r2) / 2
      };
    }

    function encloseBasis3(a, b, c) {
      var x1 = a.x, y1 = a.y, r1 = a.r,
          x2 = b.x, y2 = b.y, r2 = b.r,
          x3 = c.x, y3 = c.y, r3 = c.r,
          a2 = x1 - x2,
          a3 = x1 - x3,
          b2 = y1 - y2,
          b3 = y1 - y3,
          c2 = r2 - r1,
          c3 = r3 - r1,
          d1 = x1 * x1 + y1 * y1 - r1 * r1,
          d2 = d1 - x2 * x2 - y2 * y2 + r2 * r2,
          d3 = d1 - x3 * x3 - y3 * y3 + r3 * r3,
          ab = a3 * b2 - a2 * b3,
          xa = (b2 * d3 - b3 * d2) / (ab * 2) - x1,
          xb = (b3 * c2 - b2 * c3) / ab,
          ya = (a3 * d2 - a2 * d3) / (ab * 2) - y1,
          yb = (a2 * c3 - a3 * c2) / ab,
          A = xb * xb + yb * yb - 1,
          B = 2 * (r1 + xa * xb + ya * yb),
          C = xa * xa + ya * ya - r1 * r1,
          r = -(A ? (B + Math.sqrt(B * B - 4 * A * C)) / (2 * A) : C / B);
      return {
        x: x1 + xa + xb * r,
        y: y1 + ya + yb * r,
        r: r
      };
    }

    function place(b, a, c) {
      var dx = b.x - a.x, x, a2,
          dy = b.y - a.y, y, b2,
          d2 = dx * dx + dy * dy;
      if (d2) {
        a2 = a.r + c.r, a2 *= a2;
        b2 = b.r + c.r, b2 *= b2;
        if (a2 > b2) {
          x = (d2 + b2 - a2) / (2 * d2);
          y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
          c.x = b.x - x * dx - y * dy;
          c.y = b.y - x * dy + y * dx;
        } else {
          x = (d2 + a2 - b2) / (2 * d2);
          y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
          c.x = a.x + x * dx - y * dy;
          c.y = a.y + x * dy + y * dx;
        }
      } else {
        c.x = a.x + c.r;
        c.y = a.y;
      }
    }

    function intersects(a, b) {
      var dr = a.r + b.r - 1e-6, dx = b.x - a.x, dy = b.y - a.y;
      return dr > 0 && dr * dr > dx * dx + dy * dy;
    }

    function score(node) {
      var a = node._,
          b = node.next._,
          ab = a.r + b.r,
          dx = (a.x * b.r + b.x * a.r) / ab,
          dy = (a.y * b.r + b.y * a.r) / ab;
      return dx * dx + dy * dy;
    }

    function Node(circle) {
      this._ = circle;
      this.next = null;
      this.previous = null;
    }

    function packEnclose(circles) {
      if (!(n = (circles = array$1(circles)).length)) return 0;

      var a, b, c, n, aa, ca, i, j, k, sj, sk;

      // Place the first circle.
      a = circles[0], a.x = 0, a.y = 0;
      if (!(n > 1)) return a.r;

      // Place the second circle.
      b = circles[1], a.x = -b.r, b.x = a.r, b.y = 0;
      if (!(n > 2)) return a.r + b.r;

      // Place the third circle.
      place(b, a, c = circles[2]);

      // Initialize the front-chain using the first three circles a, b and c.
      a = new Node(a), b = new Node(b), c = new Node(c);
      a.next = c.previous = b;
      b.next = a.previous = c;
      c.next = b.previous = a;

      // Attempt to place each remaining circle…
      pack: for (i = 3; i < n; ++i) {
        place(a._, b._, c = circles[i]), c = new Node(c);

        // Find the closest intersecting circle on the front-chain, if any.
        // “Closeness” is determined by linear distance along the front-chain.
        // “Ahead” or “behind” is likewise determined by linear distance.
        j = b.next, k = a.previous, sj = b._.r, sk = a._.r;
        do {
          if (sj <= sk) {
            if (intersects(j._, c._)) {
              b = j, a.next = b, b.previous = a, --i;
              continue pack;
            }
            sj += j._.r, j = j.next;
          } else {
            if (intersects(k._, c._)) {
              a = k, a.next = b, b.previous = a, --i;
              continue pack;
            }
            sk += k._.r, k = k.previous;
          }
        } while (j !== k.next);

        // Success! Insert the new circle c between a and b.
        c.previous = a, c.next = b, a.next = b.previous = b = c;

        // Compute the new closest circle pair to the centroid.
        aa = score(a);
        while ((c = c.next) !== b) {
          if ((ca = score(c)) < aa) {
            a = c, aa = ca;
          }
        }
        b = a.next;
      }

      // Compute the enclosing circle of the front chain.
      a = [b._], c = b; while ((c = c.next) !== b) a.push(c._); c = enclose(a);

      // Translate the circles to put the enclosing circle around the origin.
      for (i = 0; i < n; ++i) a = circles[i], a.x -= c.x, a.y -= c.y;

      return c.r;
    }

    function siblings(circles) {
      packEnclose(circles);
      return circles;
    }

    function optional(f) {
      return f == null ? null : required(f);
    }

    function required(f) {
      if (typeof f !== "function") throw new Error;
      return f;
    }

    function constantZero() {
      return 0;
    }

    function constant$2(x) {
      return function() {
        return x;
      };
    }

    function defaultRadius(d) {
      return Math.sqrt(d.value);
    }

    function index$1() {
      var radius = null,
          dx = 1,
          dy = 1,
          padding = constantZero;

      function pack(root) {
        root.x = dx / 2, root.y = dy / 2;
        if (radius) {
          root.eachBefore(radiusLeaf(radius))
              .eachAfter(packChildren(padding, 0.5))
              .eachBefore(translateChild(1));
        } else {
          root.eachBefore(radiusLeaf(defaultRadius))
              .eachAfter(packChildren(constantZero, 1))
              .eachAfter(packChildren(padding, root.r / Math.min(dx, dy)))
              .eachBefore(translateChild(Math.min(dx, dy) / (2 * root.r)));
        }
        return root;
      }

      pack.radius = function(x) {
        return arguments.length ? (radius = optional(x), pack) : radius;
      };

      pack.size = function(x) {
        return arguments.length ? (dx = +x[0], dy = +x[1], pack) : [dx, dy];
      };

      pack.padding = function(x) {
        return arguments.length ? (padding = typeof x === "function" ? x : constant$2(+x), pack) : padding;
      };

      return pack;
    }

    function radiusLeaf(radius) {
      return function(node) {
        if (!node.children) {
          node.r = Math.max(0, +radius(node) || 0);
        }
      };
    }

    function packChildren(padding, k) {
      return function(node) {
        if (children = node.children) {
          var children,
              i,
              n = children.length,
              r = padding(node) * k || 0,
              e;

          if (r) for (i = 0; i < n; ++i) children[i].r += r;
          e = packEnclose(children);
          if (r) for (i = 0; i < n; ++i) children[i].r -= r;
          node.r = e + r;
        }
      };
    }

    function translateChild(k) {
      return function(node) {
        var parent = node.parent;
        node.r *= k;
        if (parent) {
          node.x = parent.x + k * node.x;
          node.y = parent.y + k * node.y;
        }
      };
    }

    function roundNode(node) {
      node.x0 = Math.round(node.x0);
      node.y0 = Math.round(node.y0);
      node.x1 = Math.round(node.x1);
      node.y1 = Math.round(node.y1);
    }

    function treemapDice(parent, x0, y0, x1, y1) {
      var nodes = parent.children,
          node,
          i = -1,
          n = nodes.length,
          k = parent.value && (x1 - x0) / parent.value;

      while (++i < n) {
        node = nodes[i], node.y0 = y0, node.y1 = y1;
        node.x0 = x0, node.x1 = x0 += node.value * k;
      }
    }

    function partition() {
      var dx = 1,
          dy = 1,
          padding = 0,
          round = false;

      function partition(root) {
        var n = root.height + 1;
        root.x0 =
        root.y0 = padding;
        root.x1 = dx;
        root.y1 = dy / n;
        root.eachBefore(positionNode(dy, n));
        if (round) root.eachBefore(roundNode);
        return root;
      }

      function positionNode(dy, n) {
        return function(node) {
          if (node.children) {
            treemapDice(node, node.x0, dy * (node.depth + 1) / n, node.x1, dy * (node.depth + 2) / n);
          }
          var x0 = node.x0,
              y0 = node.y0,
              x1 = node.x1 - padding,
              y1 = node.y1 - padding;
          if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
          if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
          node.x0 = x0;
          node.y0 = y0;
          node.x1 = x1;
          node.y1 = y1;
        };
      }

      partition.round = function(x) {
        return arguments.length ? (round = !!x, partition) : round;
      };

      partition.size = function(x) {
        return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
      };

      partition.padding = function(x) {
        return arguments.length ? (padding = +x, partition) : padding;
      };

      return partition;
    }

    var preroot = {depth: -1},
        ambiguous = {};

    function defaultId(d) {
      return d.id;
    }

    function defaultParentId(d) {
      return d.parentId;
    }

    function stratify() {
      var id = defaultId,
          parentId = defaultParentId;

      function stratify(data) {
        var nodes = Array.from(data),
            n = nodes.length,
            d,
            i,
            root,
            parent,
            node,
            nodeId,
            nodeKey,
            nodeByKey = new Map;

        for (i = 0; i < n; ++i) {
          d = nodes[i], node = nodes[i] = new Node$1(d);
          if ((nodeId = id(d, i, data)) != null && (nodeId += "")) {
            nodeKey = node.id = nodeId;
            nodeByKey.set(nodeKey, nodeByKey.has(nodeKey) ? ambiguous : node);
          }
          if ((nodeId = parentId(d, i, data)) != null && (nodeId += "")) {
            node.parent = nodeId;
          }
        }

        for (i = 0; i < n; ++i) {
          node = nodes[i];
          if (nodeId = node.parent) {
            parent = nodeByKey.get(nodeId);
            if (!parent) throw new Error("missing: " + nodeId);
            if (parent === ambiguous) throw new Error("ambiguous: " + nodeId);
            if (parent.children) parent.children.push(node);
            else parent.children = [node];
            node.parent = parent;
          } else {
            if (root) throw new Error("multiple roots");
            root = node;
          }
        }

        if (!root) throw new Error("no root");
        root.parent = preroot;
        root.eachBefore(function(node) { node.depth = node.parent.depth + 1; --n; }).eachBefore(computeHeight);
        root.parent = null;
        if (n > 0) throw new Error("cycle");

        return root;
      }

      stratify.id = function(x) {
        return arguments.length ? (id = required(x), stratify) : id;
      };

      stratify.parentId = function(x) {
        return arguments.length ? (parentId = required(x), stratify) : parentId;
      };

      return stratify;
    }

    function defaultSeparation(a, b) {
      return a.parent === b.parent ? 1 : 2;
    }

    // function radialSeparation(a, b) {
    //   return (a.parent === b.parent ? 1 : 2) / a.depth;
    // }

    // This function is used to traverse the left contour of a subtree (or
    // subforest). It returns the successor of v on this contour. This successor is
    // either given by the leftmost child of v or by the thread of v. The function
    // returns null if and only if v is on the highest level of its subtree.
    function nextLeft(v) {
      var children = v.children;
      return children ? children[0] : v.t;
    }

    // This function works analogously to nextLeft.
    function nextRight(v) {
      var children = v.children;
      return children ? children[children.length - 1] : v.t;
    }

    // Shifts the current subtree rooted at w+. This is done by increasing
    // prelim(w+) and mod(w+) by shift.
    function moveSubtree(wm, wp, shift) {
      var change = shift / (wp.i - wm.i);
      wp.c -= change;
      wp.s += shift;
      wm.c += change;
      wp.z += shift;
      wp.m += shift;
    }

    // All other shifts, applied to the smaller subtrees between w- and w+, are
    // performed by this function. To prepare the shifts, we have to adjust
    // change(w+), shift(w+), and change(w-).
    function executeShifts(v) {
      var shift = 0,
          change = 0,
          children = v.children,
          i = children.length,
          w;
      while (--i >= 0) {
        w = children[i];
        w.z += shift;
        w.m += shift;
        shift += w.s + (change += w.c);
      }
    }

    // If vi-’s ancestor is a sibling of v, returns vi-’s ancestor. Otherwise,
    // returns the specified (default) ancestor.
    function nextAncestor(vim, v, ancestor) {
      return vim.a.parent === v.parent ? vim.a : ancestor;
    }

    function TreeNode(node, i) {
      this._ = node;
      this.parent = null;
      this.children = null;
      this.A = null; // default ancestor
      this.a = this; // ancestor
      this.z = 0; // prelim
      this.m = 0; // mod
      this.c = 0; // change
      this.s = 0; // shift
      this.t = null; // thread
      this.i = i; // number
    }

    TreeNode.prototype = Object.create(Node$1.prototype);

    function treeRoot(root) {
      var tree = new TreeNode(root, 0),
          node,
          nodes = [tree],
          child,
          children,
          i,
          n;

      while (node = nodes.pop()) {
        if (children = node._.children) {
          node.children = new Array(n = children.length);
          for (i = n - 1; i >= 0; --i) {
            nodes.push(child = node.children[i] = new TreeNode(children[i], i));
            child.parent = node;
          }
        }
      }

      (tree.parent = new TreeNode(null, 0)).children = [tree];
      return tree;
    }

    // Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
    function tree() {
      var separation = defaultSeparation,
          dx = 1,
          dy = 1,
          nodeSize = null;

      function tree(root) {
        var t = treeRoot(root);

        // Compute the layout using Buchheim et al.’s algorithm.
        t.eachAfter(firstWalk), t.parent.m = -t.z;
        t.eachBefore(secondWalk);

        // If a fixed node size is specified, scale x and y.
        if (nodeSize) root.eachBefore(sizeNode);

        // If a fixed tree size is specified, scale x and y based on the extent.
        // Compute the left-most, right-most, and depth-most nodes for extents.
        else {
          var left = root,
              right = root,
              bottom = root;
          root.eachBefore(function(node) {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
            if (node.depth > bottom.depth) bottom = node;
          });
          var s = left === right ? 1 : separation(left, right) / 2,
              tx = s - left.x,
              kx = dx / (right.x + s + tx),
              ky = dy / (bottom.depth || 1);
          root.eachBefore(function(node) {
            node.x = (node.x + tx) * kx;
            node.y = node.depth * ky;
          });
        }

        return root;
      }

      // Computes a preliminary x-coordinate for v. Before that, FIRST WALK is
      // applied recursively to the children of v, as well as the function
      // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
      // node v is placed to the midpoint of its outermost children.
      function firstWalk(v) {
        var children = v.children,
            siblings = v.parent.children,
            w = v.i ? siblings[v.i - 1] : null;
        if (children) {
          executeShifts(v);
          var midpoint = (children[0].z + children[children.length - 1].z) / 2;
          if (w) {
            v.z = w.z + separation(v._, w._);
            v.m = v.z - midpoint;
          } else {
            v.z = midpoint;
          }
        } else if (w) {
          v.z = w.z + separation(v._, w._);
        }
        v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
      }

      // Computes all real x-coordinates by summing up the modifiers recursively.
      function secondWalk(v) {
        v._.x = v.z + v.parent.m;
        v.m += v.parent.m;
      }

      // The core of the algorithm. Here, a new subtree is combined with the
      // previous subtrees. Threads are used to traverse the inside and outside
      // contours of the left and right subtree up to the highest common level. The
      // vertices used for the traversals are vi+, vi-, vo-, and vo+, where the
      // superscript o means outside and i means inside, the subscript - means left
      // subtree and + means right subtree. For summing up the modifiers along the
      // contour, we use respective variables si+, si-, so-, and so+. Whenever two
      // nodes of the inside contours conflict, we compute the left one of the
      // greatest uncommon ancestors using the function ANCESTOR and call MOVE
      // SUBTREE to shift the subtree and prepare the shifts of smaller subtrees.
      // Finally, we add a new thread (if necessary).
      function apportion(v, w, ancestor) {
        if (w) {
          var vip = v,
              vop = v,
              vim = w,
              vom = vip.parent.children[0],
              sip = vip.m,
              sop = vop.m,
              sim = vim.m,
              som = vom.m,
              shift;
          while (vim = nextRight(vim), vip = nextLeft(vip), vim && vip) {
            vom = nextLeft(vom);
            vop = nextRight(vop);
            vop.a = v;
            shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
            if (shift > 0) {
              moveSubtree(nextAncestor(vim, v, ancestor), v, shift);
              sip += shift;
              sop += shift;
            }
            sim += vim.m;
            sip += vip.m;
            som += vom.m;
            sop += vop.m;
          }
          if (vim && !nextRight(vop)) {
            vop.t = vim;
            vop.m += sim - sop;
          }
          if (vip && !nextLeft(vom)) {
            vom.t = vip;
            vom.m += sip - som;
            ancestor = v;
          }
        }
        return ancestor;
      }

      function sizeNode(node) {
        node.x *= dx;
        node.y = node.depth * dy;
      }

      tree.separation = function(x) {
        return arguments.length ? (separation = x, tree) : separation;
      };

      tree.size = function(x) {
        return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], tree) : (nodeSize ? null : [dx, dy]);
      };

      tree.nodeSize = function(x) {
        return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], tree) : (nodeSize ? [dx, dy] : null);
      };

      return tree;
    }

    function treemapSlice(parent, x0, y0, x1, y1) {
      var nodes = parent.children,
          node,
          i = -1,
          n = nodes.length,
          k = parent.value && (y1 - y0) / parent.value;

      while (++i < n) {
        node = nodes[i], node.x0 = x0, node.x1 = x1;
        node.y0 = y0, node.y1 = y0 += node.value * k;
      }
    }

    var phi = (1 + Math.sqrt(5)) / 2;

    function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
      var rows = [],
          nodes = parent.children,
          row,
          nodeValue,
          i0 = 0,
          i1 = 0,
          n = nodes.length,
          dx, dy,
          value = parent.value,
          sumValue,
          minValue,
          maxValue,
          newRatio,
          minRatio,
          alpha,
          beta;

      while (i0 < n) {
        dx = x1 - x0, dy = y1 - y0;

        // Find the next non-empty node.
        do sumValue = nodes[i1++].value; while (!sumValue && i1 < n);
        minValue = maxValue = sumValue;
        alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
        beta = sumValue * sumValue * alpha;
        minRatio = Math.max(maxValue / beta, beta / minValue);

        // Keep adding nodes while the aspect ratio maintains or improves.
        for (; i1 < n; ++i1) {
          sumValue += nodeValue = nodes[i1].value;
          if (nodeValue < minValue) minValue = nodeValue;
          if (nodeValue > maxValue) maxValue = nodeValue;
          beta = sumValue * sumValue * alpha;
          newRatio = Math.max(maxValue / beta, beta / minValue);
          if (newRatio > minRatio) { sumValue -= nodeValue; break; }
          minRatio = newRatio;
        }

        // Position and record the row orientation.
        rows.push(row = {value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1)});
        if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
        else treemapSlice(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
        value -= sumValue, i0 = i1;
      }

      return rows;
    }

    var squarify = (function custom(ratio) {

      function squarify(parent, x0, y0, x1, y1) {
        squarifyRatio(ratio, parent, x0, y0, x1, y1);
      }

      squarify.ratio = function(x) {
        return custom((x = +x) > 1 ? x : 1);
      };

      return squarify;
    })(phi);

    function index() {
      var tile = squarify,
          round = false,
          dx = 1,
          dy = 1,
          paddingStack = [0],
          paddingInner = constantZero,
          paddingTop = constantZero,
          paddingRight = constantZero,
          paddingBottom = constantZero,
          paddingLeft = constantZero;

      function treemap(root) {
        root.x0 =
        root.y0 = 0;
        root.x1 = dx;
        root.y1 = dy;
        root.eachBefore(positionNode);
        paddingStack = [0];
        if (round) root.eachBefore(roundNode);
        return root;
      }

      function positionNode(node) {
        var p = paddingStack[node.depth],
            x0 = node.x0 + p,
            y0 = node.y0 + p,
            x1 = node.x1 - p,
            y1 = node.y1 - p;
        if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
        if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
        node.x0 = x0;
        node.y0 = y0;
        node.x1 = x1;
        node.y1 = y1;
        if (node.children) {
          p = paddingStack[node.depth + 1] = paddingInner(node) / 2;
          x0 += paddingLeft(node) - p;
          y0 += paddingTop(node) - p;
          x1 -= paddingRight(node) - p;
          y1 -= paddingBottom(node) - p;
          if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
          if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
          tile(node, x0, y0, x1, y1);
        }
      }

      treemap.round = function(x) {
        return arguments.length ? (round = !!x, treemap) : round;
      };

      treemap.size = function(x) {
        return arguments.length ? (dx = +x[0], dy = +x[1], treemap) : [dx, dy];
      };

      treemap.tile = function(x) {
        return arguments.length ? (tile = required(x), treemap) : tile;
      };

      treemap.padding = function(x) {
        return arguments.length ? treemap.paddingInner(x).paddingOuter(x) : treemap.paddingInner();
      };

      treemap.paddingInner = function(x) {
        return arguments.length ? (paddingInner = typeof x === "function" ? x : constant$2(+x), treemap) : paddingInner;
      };

      treemap.paddingOuter = function(x) {
        return arguments.length ? treemap.paddingTop(x).paddingRight(x).paddingBottom(x).paddingLeft(x) : treemap.paddingTop();
      };

      treemap.paddingTop = function(x) {
        return arguments.length ? (paddingTop = typeof x === "function" ? x : constant$2(+x), treemap) : paddingTop;
      };

      treemap.paddingRight = function(x) {
        return arguments.length ? (paddingRight = typeof x === "function" ? x : constant$2(+x), treemap) : paddingRight;
      };

      treemap.paddingBottom = function(x) {
        return arguments.length ? (paddingBottom = typeof x === "function" ? x : constant$2(+x), treemap) : paddingBottom;
      };

      treemap.paddingLeft = function(x) {
        return arguments.length ? (paddingLeft = typeof x === "function" ? x : constant$2(+x), treemap) : paddingLeft;
      };

      return treemap;
    }

    function binary(parent, x0, y0, x1, y1) {
      var nodes = parent.children,
          i, n = nodes.length,
          sum, sums = new Array(n + 1);

      for (sums[0] = sum = i = 0; i < n; ++i) {
        sums[i + 1] = sum += nodes[i].value;
      }

      partition(0, n, parent.value, x0, y0, x1, y1);

      function partition(i, j, value, x0, y0, x1, y1) {
        if (i >= j - 1) {
          var node = nodes[i];
          node.x0 = x0, node.y0 = y0;
          node.x1 = x1, node.y1 = y1;
          return;
        }

        var valueOffset = sums[i],
            valueTarget = (value / 2) + valueOffset,
            k = i + 1,
            hi = j - 1;

        while (k < hi) {
          var mid = k + hi >>> 1;
          if (sums[mid] < valueTarget) k = mid + 1;
          else hi = mid;
        }

        if ((valueTarget - sums[k - 1]) < (sums[k] - valueTarget) && i + 1 < k) --k;

        var valueLeft = sums[k] - valueOffset,
            valueRight = value - valueLeft;

        if ((x1 - x0) > (y1 - y0)) {
          var xk = value ? (x0 * valueRight + x1 * valueLeft) / value : x1;
          partition(i, k, valueLeft, x0, y0, xk, y1);
          partition(k, j, valueRight, xk, y0, x1, y1);
        } else {
          var yk = value ? (y0 * valueRight + y1 * valueLeft) / value : y1;
          partition(i, k, valueLeft, x0, y0, x1, yk);
          partition(k, j, valueRight, x0, yk, x1, y1);
        }
      }
    }

    function sliceDice(parent, x0, y0, x1, y1) {
      (parent.depth & 1 ? treemapSlice : treemapDice)(parent, x0, y0, x1, y1);
    }

    var resquarify = (function custom(ratio) {

      function resquarify(parent, x0, y0, x1, y1) {
        if ((rows = parent._squarify) && (rows.ratio === ratio)) {
          var rows,
              row,
              nodes,
              i,
              j = -1,
              n,
              m = rows.length,
              value = parent.value;

          while (++j < m) {
            row = rows[j], nodes = row.children;
            for (i = row.value = 0, n = nodes.length; i < n; ++i) row.value += nodes[i].value;
            if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += (y1 - y0) * row.value / value : y1);
            else treemapSlice(row, x0, y0, value ? x0 += (x1 - x0) * row.value / value : x1, y1);
            value -= row.value;
          }
        } else {
          parent._squarify = rows = squarifyRatio(ratio, parent, x0, y0, x1, y1);
          rows.ratio = ratio;
        }
      }

      resquarify.ratio = function(x) {
        return custom((x = +x) > 1 ? x : 1);
      };

      return resquarify;
    })(phi);

    function area$1(polygon) {
      var i = -1,
          n = polygon.length,
          a,
          b = polygon[n - 1],
          area = 0;

      while (++i < n) {
        a = b;
        b = polygon[i];
        area += a[1] * b[0] - a[0] * b[1];
      }

      return area / 2;
    }

    function centroid(polygon) {
      var i = -1,
          n = polygon.length,
          x = 0,
          y = 0,
          a,
          b = polygon[n - 1],
          c,
          k = 0;

      while (++i < n) {
        a = b;
        b = polygon[i];
        k += c = a[0] * b[1] - b[0] * a[1];
        x += (a[0] + b[0]) * c;
        y += (a[1] + b[1]) * c;
      }

      return k *= 3, [x / k, y / k];
    }

    // Returns the 2D cross product of AB and AC vectors, i.e., the z-component of
    // the 3D cross product in a quadrant I Cartesian coordinate system (+x is
    // right, +y is up). Returns a positive value if ABC is counter-clockwise,
    // negative if clockwise, and zero if the points are collinear.
    function cross$1(a, b, c) {
      return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    }

    function lexicographicOrder(a, b) {
      return a[0] - b[0] || a[1] - b[1];
    }

    // Computes the upper convex hull per the monotone chain algorithm.
    // Assumes points.length >= 3, is sorted by x, unique in y.
    // Returns an array of indices into points in left-to-right order.
    function computeUpperHullIndexes(points) {
      const n = points.length,
          indexes = [0, 1];
      let size = 2, i;

      for (i = 2; i < n; ++i) {
        while (size > 1 && cross$1(points[indexes[size - 2]], points[indexes[size - 1]], points[i]) <= 0) --size;
        indexes[size++] = i;
      }

      return indexes.slice(0, size); // remove popped points
    }

    function hull(points) {
      if ((n = points.length) < 3) return null;

      var i,
          n,
          sortedPoints = new Array(n),
          flippedPoints = new Array(n);

      for (i = 0; i < n; ++i) sortedPoints[i] = [+points[i][0], +points[i][1], i];
      sortedPoints.sort(lexicographicOrder);
      for (i = 0; i < n; ++i) flippedPoints[i] = [sortedPoints[i][0], -sortedPoints[i][1]];

      var upperIndexes = computeUpperHullIndexes(sortedPoints),
          lowerIndexes = computeUpperHullIndexes(flippedPoints);

      // Construct the hull polygon, removing possible duplicate endpoints.
      var skipLeft = lowerIndexes[0] === upperIndexes[0],
          skipRight = lowerIndexes[lowerIndexes.length - 1] === upperIndexes[upperIndexes.length - 1],
          hull = [];

      // Add upper hull in right-to-l order.
      // Then add lower hull in left-to-right order.
      for (i = upperIndexes.length - 1; i >= 0; --i) hull.push(points[sortedPoints[upperIndexes[i]][2]]);
      for (i = +skipLeft; i < lowerIndexes.length - skipRight; ++i) hull.push(points[sortedPoints[lowerIndexes[i]][2]]);

      return hull;
    }

    function contains(polygon, point) {
      var n = polygon.length,
          p = polygon[n - 1],
          x = point[0], y = point[1],
          x0 = p[0], y0 = p[1],
          x1, y1,
          inside = false;

      for (var i = 0; i < n; ++i) {
        p = polygon[i], x1 = p[0], y1 = p[1];
        if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside;
        x0 = x1, y0 = y1;
      }

      return inside;
    }

    function length(polygon) {
      var i = -1,
          n = polygon.length,
          b = polygon[n - 1],
          xa,
          ya,
          xb = b[0],
          yb = b[1],
          perimeter = 0;

      while (++i < n) {
        xa = xb;
        ya = yb;
        b = polygon[i];
        xb = b[0];
        yb = b[1];
        xa -= xb;
        ya -= yb;
        perimeter += Math.hypot(xa, ya);
      }

      return perimeter;
    }

    var defaultSource = Math.random;

    var uniform = (function sourceRandomUniform(source) {
      function randomUniform(min, max) {
        min = min == null ? 0 : +min;
        max = max == null ? 1 : +max;
        if (arguments.length === 1) max = min, min = 0;
        else max -= min;
        return function() {
          return source() * max + min;
        };
      }

      randomUniform.source = sourceRandomUniform;

      return randomUniform;
    })(defaultSource);

    var int$1 = (function sourceRandomInt(source) {
      function randomInt(min, max) {
        if (arguments.length < 2) max = min, min = 0;
        min = Math.floor(min);
        max = Math.floor(max) - min;
        return function() {
          return Math.floor(source() * max + min);
        };
      }

      randomInt.source = sourceRandomInt;

      return randomInt;
    })(defaultSource);

    var normal = (function sourceRandomNormal(source) {
      function randomNormal(mu, sigma) {
        var x, r;
        mu = mu == null ? 0 : +mu;
        sigma = sigma == null ? 1 : +sigma;
        return function() {
          var y;

          // If available, use the second previously-generated uniform random.
          if (x != null) y = x, x = null;

          // Otherwise, generate a new x and y.
          else do {
            x = source() * 2 - 1;
            y = source() * 2 - 1;
            r = x * x + y * y;
          } while (!r || r > 1);

          return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r);
        };
      }

      randomNormal.source = sourceRandomNormal;

      return randomNormal;
    })(defaultSource);

    var logNormal = (function sourceRandomLogNormal(source) {
      var N = normal.source(source);

      function randomLogNormal() {
        var randomNormal = N.apply(this, arguments);
        return function() {
          return Math.exp(randomNormal());
        };
      }

      randomLogNormal.source = sourceRandomLogNormal;

      return randomLogNormal;
    })(defaultSource);

    var irwinHall = (function sourceRandomIrwinHall(source) {
      function randomIrwinHall(n) {
        if ((n = +n) <= 0) return () => 0;
        return function() {
          for (var sum = 0, i = n; i > 1; --i) sum += source();
          return sum + i * source();
        };
      }

      randomIrwinHall.source = sourceRandomIrwinHall;

      return randomIrwinHall;
    })(defaultSource);

    var bates = (function sourceRandomBates(source) {
      var I = irwinHall.source(source);

      function randomBates(n) {
        // use limiting distribution at n === 0
        if ((n = +n) === 0) return source;
        var randomIrwinHall = I(n);
        return function() {
          return randomIrwinHall() / n;
        };
      }

      randomBates.source = sourceRandomBates;

      return randomBates;
    })(defaultSource);

    var exponential = (function sourceRandomExponential(source) {
      function randomExponential(lambda) {
        return function() {
          return -Math.log1p(-source()) / lambda;
        };
      }

      randomExponential.source = sourceRandomExponential;

      return randomExponential;
    })(defaultSource);

    var pareto = (function sourceRandomPareto(source) {
      function randomPareto(alpha) {
        if ((alpha = +alpha) < 0) throw new RangeError("invalid alpha");
        alpha = 1 / -alpha;
        return function() {
          return Math.pow(1 - source(), alpha);
        };
      }

      randomPareto.source = sourceRandomPareto;

      return randomPareto;
    })(defaultSource);

    var bernoulli = (function sourceRandomBernoulli(source) {
      function randomBernoulli(p) {
        if ((p = +p) < 0 || p > 1) throw new RangeError("invalid p");
        return function() {
          return Math.floor(source() + p);
        };
      }

      randomBernoulli.source = sourceRandomBernoulli;

      return randomBernoulli;
    })(defaultSource);

    var geometric = (function sourceRandomGeometric(source) {
      function randomGeometric(p) {
        if ((p = +p) < 0 || p > 1) throw new RangeError("invalid p");
        if (p === 0) return () => Infinity;
        if (p === 1) return () => 1;
        p = Math.log1p(-p);
        return function() {
          return 1 + Math.floor(Math.log1p(-source()) / p);
        };
      }

      randomGeometric.source = sourceRandomGeometric;

      return randomGeometric;
    })(defaultSource);

    var gamma = (function sourceRandomGamma(source) {
      var randomNormal = normal.source(source)();

      function randomGamma(k, theta) {
        if ((k = +k) < 0) throw new RangeError("invalid k");
        // degenerate distribution if k === 0
        if (k === 0) return () => 0;
        theta = theta == null ? 1 : +theta;
        // exponential distribution if k === 1
        if (k === 1) return () => -Math.log1p(-source()) * theta;

        var d = (k < 1 ? k + 1 : k) - 1 / 3,
            c = 1 / (3 * Math.sqrt(d)),
            multiplier = k < 1 ? () => Math.pow(source(), 1 / k) : () => 1;
        return function() {
          do {
            do {
              var x = randomNormal(),
                  v = 1 + c * x;
            } while (v <= 0);
            v *= v * v;
            var u = 1 - source();
          } while (u >= 1 - 0.0331 * x * x * x * x && Math.log(u) >= 0.5 * x * x + d * (1 - v + Math.log(v)));
          return d * v * multiplier() * theta;
        };
      }

      randomGamma.source = sourceRandomGamma;

      return randomGamma;
    })(defaultSource);

    var beta = (function sourceRandomBeta(source) {
      var G = gamma.source(source);

      function randomBeta(alpha, beta) {
        var X = G(alpha),
            Y = G(beta);
        return function() {
          var x = X();
          return x === 0 ? 0 : x / (x + Y());
        };
      }

      randomBeta.source = sourceRandomBeta;

      return randomBeta;
    })(defaultSource);

    var binomial = (function sourceRandomBinomial(source) {
      var G = geometric.source(source),
          B = beta.source(source);

      function randomBinomial(n, p) {
        n = +n;
        if ((p = +p) >= 1) return () => n;
        if (p <= 0) return () => 0;
        return function() {
          var acc = 0, nn = n, pp = p;
          while (nn * pp > 16 && nn * (1 - pp) > 16) {
            var i = Math.floor((nn + 1) * pp),
                y = B(i, nn - i + 1)();
            if (y <= pp) {
              acc += i;
              nn -= i;
              pp = (pp - y) / (1 - y);
            } else {
              nn = i - 1;
              pp /= y;
            }
          }
          var sign = pp < 0.5,
              pFinal = sign ? pp : 1 - pp,
              g = G(pFinal);
          for (var s = g(), k = 0; s <= nn; ++k) s += g();
          return acc + (sign ? k : nn - k);
        };
      }

      randomBinomial.source = sourceRandomBinomial;

      return randomBinomial;
    })(defaultSource);

    var weibull = (function sourceRandomWeibull(source) {
      function randomWeibull(k, a, b) {
        var outerFunc;
        if ((k = +k) === 0) {
          outerFunc = x => -Math.log(x);
        } else {
          k = 1 / k;
          outerFunc = x => Math.pow(x, k);
        }
        a = a == null ? 0 : +a;
        b = b == null ? 1 : +b;
        return function() {
          return a + b * outerFunc(-Math.log1p(-source()));
        };
      }

      randomWeibull.source = sourceRandomWeibull;

      return randomWeibull;
    })(defaultSource);

    var cauchy = (function sourceRandomCauchy(source) {
      function randomCauchy(a, b) {
        a = a == null ? 0 : +a;
        b = b == null ? 1 : +b;
        return function() {
          return a + b * Math.tan(Math.PI * source());
        };
      }

      randomCauchy.source = sourceRandomCauchy;

      return randomCauchy;
    })(defaultSource);

    var logistic = (function sourceRandomLogistic(source) {
      function randomLogistic(a, b) {
        a = a == null ? 0 : +a;
        b = b == null ? 1 : +b;
        return function() {
          var u = source();
          return a + b * Math.log(u / (1 - u));
        };
      }

      randomLogistic.source = sourceRandomLogistic;

      return randomLogistic;
    })(defaultSource);

    var poisson = (function sourceRandomPoisson(source) {
      var G = gamma.source(source),
          B = binomial.source(source);

      function randomPoisson(lambda) {
        return function() {
          var acc = 0, l = lambda;
          while (l > 16) {
            var n = Math.floor(0.875 * l),
                t = G(n)();
            if (t > l) return acc + B(n - 1, l / t)();
            acc += n;
            l -= t;
          }
          for (var s = -Math.log1p(-source()), k = 0; s <= l; ++k) s -= Math.log1p(-source());
          return acc + k;
        };
      }

      randomPoisson.source = sourceRandomPoisson;

      return randomPoisson;
    })(defaultSource);

    // https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
    const mul = 0x19660D;
    const inc = 0x3C6EF35F;
    const eps = 1 / 0x100000000;

    function lcg(seed = Math.random()) {
      let state = (0 <= seed && seed < 1 ? seed / eps : Math.abs(seed)) | 0;
      return () => (state = mul * state + inc | 0, eps * (state >>> 0));
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    function initInterpolator(domain, interpolator) {
      switch (arguments.length) {
        case 0: break;
        case 1: {
          if (typeof domain === "function") this.interpolator(domain);
          else this.range(domain);
          break;
        }
        default: {
          this.domain(domain);
          if (typeof interpolator === "function") this.interpolator(interpolator);
          else this.range(interpolator);
          break;
        }
      }
      return this;
    }

    const implicit = Symbol("implicit");

    function ordinal() {
      var index = new InternMap(),
          domain = [],
          range = [],
          unknown = implicit;

      function scale(d) {
        let i = index.get(d);
        if (i === undefined) {
          if (unknown !== implicit) return unknown;
          index.set(d, i = domain.push(d) - 1);
        }
        return range[i % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = new InternMap();
        for (const value of _) {
          if (index.has(value)) continue;
          index.set(value, domain.push(value) - 1);
        }
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal(domain, range).unknown(unknown);
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function band() {
      var scale = ordinal().unknown(undefined),
          domain = scale.domain,
          ordinalRange = scale.range,
          r0 = 0,
          r1 = 1,
          step,
          bandwidth,
          round = false,
          paddingInner = 0,
          paddingOuter = 0,
          align = 0.5;

      delete scale.unknown;

      function rescale() {
        var n = domain().length,
            reverse = r1 < r0,
            start = reverse ? r1 : r0,
            stop = reverse ? r0 : r1;
        step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
        if (round) step = Math.floor(step);
        start += (stop - start - step * (n - paddingInner)) * align;
        bandwidth = step * (1 - paddingInner);
        if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
        var values = range$2(n).map(function(i) { return start + step * i; });
        return ordinalRange(reverse ? values.reverse() : values);
      }

      scale.domain = function(_) {
        return arguments.length ? (domain(_), rescale()) : domain();
      };

      scale.range = function(_) {
        return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
      };

      scale.rangeRound = function(_) {
        return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
      };

      scale.bandwidth = function() {
        return bandwidth;
      };

      scale.step = function() {
        return step;
      };

      scale.round = function(_) {
        return arguments.length ? (round = !!_, rescale()) : round;
      };

      scale.padding = function(_) {
        return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
      };

      scale.paddingInner = function(_) {
        return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
      };

      scale.paddingOuter = function(_) {
        return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
      };

      scale.align = function(_) {
        return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
      };

      scale.copy = function() {
        return band(domain(), [r0, r1])
            .round(round)
            .paddingInner(paddingInner)
            .paddingOuter(paddingOuter)
            .align(align);
      };

      return initRange.apply(rescale(), arguments);
    }

    function pointish(scale) {
      var copy = scale.copy;

      scale.padding = scale.paddingOuter;
      delete scale.paddingInner;
      delete scale.paddingOuter;

      scale.copy = function() {
        return pointish(copy());
      };

      return scale;
    }

    function point$4() {
      return pointish(band.apply(null, arguments).paddingInner(1));
    }

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number$1(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity$3(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisect(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy$1(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer$2() {
      var domain = unit,
          range = unit,
          interpolate = interpolate$2,
          transform,
          untransform,
          unknown,
          clamp = identity$3,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$3) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$3, rescale()) : clamp !== identity$3;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate = _, rescale()) : interpolate;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer$2()(identity$3, identity$3);
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear() {
      var scale = continuous();

      scale.copy = function() {
        return copy$1(scale, linear());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function identity$2(domain) {
      var unknown;

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : x;
      }

      scale.invert = scale;

      scale.domain = scale.range = function(_) {
        return arguments.length ? (domain = Array.from(_, number$1), scale) : domain.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return identity$2(domain).unknown(unknown);
      };

      domain = arguments.length ? Array.from(domain, number$1) : [0, 1];

      return linearish(scale);
    }

    function nice(domain, interval) {
      domain = domain.slice();

      var i0 = 0,
          i1 = domain.length - 1,
          x0 = domain[i0],
          x1 = domain[i1],
          t;

      if (x1 < x0) {
        t = i0, i0 = i1, i1 = t;
        t = x0, x0 = x1, x1 = t;
      }

      domain[i0] = interval.floor(x0);
      domain[i1] = interval.ceil(x1);
      return domain;
    }

    function transformLog(x) {
      return Math.log(x);
    }

    function transformExp(x) {
      return Math.exp(x);
    }

    function transformLogn(x) {
      return -Math.log(-x);
    }

    function transformExpn(x) {
      return -Math.exp(-x);
    }

    function pow10(x) {
      return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
    }

    function powp(base) {
      return base === 10 ? pow10
          : base === Math.E ? Math.exp
          : x => Math.pow(base, x);
    }

    function logp(base) {
      return base === Math.E ? Math.log
          : base === 10 && Math.log10
          || base === 2 && Math.log2
          || (base = Math.log(base), x => Math.log(x) / base);
    }

    function reflect(f) {
      return (x, k) => -f(-x, k);
    }

    function loggish(transform) {
      const scale = transform(transformLog, transformExp);
      const domain = scale.domain;
      let base = 10;
      let logs;
      let pows;

      function rescale() {
        logs = logp(base), pows = powp(base);
        if (domain()[0] < 0) {
          logs = reflect(logs), pows = reflect(pows);
          transform(transformLogn, transformExpn);
        } else {
          transform(transformLog, transformExp);
        }
        return scale;
      }

      scale.base = function(_) {
        return arguments.length ? (base = +_, rescale()) : base;
      };

      scale.domain = function(_) {
        return arguments.length ? (domain(_), rescale()) : domain();
      };

      scale.ticks = count => {
        const d = domain();
        let u = d[0];
        let v = d[d.length - 1];
        const r = v < u;

        if (r) ([u, v] = [v, u]);

        let i = logs(u);
        let j = logs(v);
        let k;
        let t;
        const n = count == null ? 10 : +count;
        let z = [];

        if (!(base % 1) && j - i < n) {
          i = Math.floor(i), j = Math.ceil(j);
          if (u > 0) for (; i <= j; ++i) {
            for (k = 1; k < base; ++k) {
              t = i < 0 ? k / pows(-i) : k * pows(i);
              if (t < u) continue;
              if (t > v) break;
              z.push(t);
            }
          } else for (; i <= j; ++i) {
            for (k = base - 1; k >= 1; --k) {
              t = i > 0 ? k / pows(-i) : k * pows(i);
              if (t < u) continue;
              if (t > v) break;
              z.push(t);
            }
          }
          if (z.length * 2 < n) z = ticks(u, v, n);
        } else {
          z = ticks(i, j, Math.min(j - i, n)).map(pows);
        }
        return r ? z.reverse() : z;
      };

      scale.tickFormat = (count, specifier) => {
        if (count == null) count = 10;
        if (specifier == null) specifier = base === 10 ? "s" : ",";
        if (typeof specifier !== "function") {
          if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null) specifier.trim = true;
          specifier = format(specifier);
        }
        if (count === Infinity) return specifier;
        const k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
        return d => {
          let i = d / pows(Math.round(logs(d)));
          if (i * base < base - 0.5) i *= base;
          return i <= k ? specifier(d) : "";
        };
      };

      scale.nice = () => {
        return domain(nice(domain(), {
          floor: x => pows(Math.floor(logs(x))),
          ceil: x => pows(Math.ceil(logs(x)))
        }));
      };

      return scale;
    }

    function log() {
      const scale = loggish(transformer$2()).domain([1, 10]);
      scale.copy = () => copy$1(scale, log()).base(scale.base());
      initRange.apply(scale, arguments);
      return scale;
    }

    function transformSymlog(c) {
      return function(x) {
        return Math.sign(x) * Math.log1p(Math.abs(x / c));
      };
    }

    function transformSymexp(c) {
      return function(x) {
        return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
      };
    }

    function symlogish(transform) {
      var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));

      scale.constant = function(_) {
        return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
      };

      return linearish(scale);
    }

    function symlog() {
      var scale = symlogish(transformer$2());

      scale.copy = function() {
        return copy$1(scale, symlog()).constant(scale.constant());
      };

      return initRange.apply(scale, arguments);
    }

    function transformPow(exponent) {
      return function(x) {
        return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
      };
    }

    function transformSqrt(x) {
      return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
    }

    function transformSquare(x) {
      return x < 0 ? -x * x : x * x;
    }

    function powish(transform) {
      var scale = transform(identity$3, identity$3),
          exponent = 1;

      function rescale() {
        return exponent === 1 ? transform(identity$3, identity$3)
            : exponent === 0.5 ? transform(transformSqrt, transformSquare)
            : transform(transformPow(exponent), transformPow(1 / exponent));
      }

      scale.exponent = function(_) {
        return arguments.length ? (exponent = +_, rescale()) : exponent;
      };

      return linearish(scale);
    }

    function pow() {
      var scale = powish(transformer$2());

      scale.copy = function() {
        return copy$1(scale, pow()).exponent(scale.exponent());
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function sqrt$1() {
      return pow.apply(null, arguments).exponent(0.5);
    }

    function square$1(x) {
      return Math.sign(x) * x * x;
    }

    function unsquare(x) {
      return Math.sign(x) * Math.sqrt(Math.abs(x));
    }

    function radial() {
      var squared = continuous(),
          range = [0, 1],
          round = false,
          unknown;

      function scale(x) {
        var y = unsquare(squared(x));
        return isNaN(y) ? unknown : round ? Math.round(y) : y;
      }

      scale.invert = function(y) {
        return squared.invert(square$1(y));
      };

      scale.domain = function(_) {
        return arguments.length ? (squared.domain(_), scale) : squared.domain();
      };

      scale.range = function(_) {
        return arguments.length ? (squared.range((range = Array.from(_, number$1)).map(square$1)), scale) : range.slice();
      };

      scale.rangeRound = function(_) {
        return scale.range(_).round(true);
      };

      scale.round = function(_) {
        return arguments.length ? (round = !!_, scale) : round;
      };

      scale.clamp = function(_) {
        return arguments.length ? (squared.clamp(_), scale) : squared.clamp();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return radial(squared.domain(), range)
            .round(round)
            .clamp(squared.clamp())
            .unknown(unknown);
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function quantile() {
      var domain = [],
          range = [],
          thresholds = [],
          unknown;

      function rescale() {
        var i = 0, n = Math.max(1, range.length);
        thresholds = new Array(n - 1);
        while (++i < n) thresholds[i - 1] = quantileSorted(domain, i / n);
        return scale;
      }

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : range[bisect(thresholds, x)];
      }

      scale.invertExtent = function(y) {
        var i = range.indexOf(y);
        return i < 0 ? [NaN, NaN] : [
          i > 0 ? thresholds[i - 1] : domain[0],
          i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
        ];
      };

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [];
        for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
        domain.sort(ascending$3);
        return rescale();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.quantiles = function() {
        return thresholds.slice();
      };

      scale.copy = function() {
        return quantile()
            .domain(domain)
            .range(range)
            .unknown(unknown);
      };

      return initRange.apply(scale, arguments);
    }

    function quantize() {
      var x0 = 0,
          x1 = 1,
          n = 1,
          domain = [0.5],
          range = [0, 1],
          unknown;

      function scale(x) {
        return x != null && x <= x ? range[bisect(domain, x, 0, n)] : unknown;
      }

      function rescale() {
        var i = -1;
        domain = new Array(n);
        while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
        return scale;
      }

      scale.domain = function(_) {
        return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1];
      };

      scale.range = function(_) {
        return arguments.length ? (n = (range = Array.from(_)).length - 1, rescale()) : range.slice();
      };

      scale.invertExtent = function(y) {
        var i = range.indexOf(y);
        return i < 0 ? [NaN, NaN]
            : i < 1 ? [x0, domain[0]]
            : i >= n ? [domain[n - 1], x1]
            : [domain[i - 1], domain[i]];
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : scale;
      };

      scale.thresholds = function() {
        return domain.slice();
      };

      scale.copy = function() {
        return quantize()
            .domain([x0, x1])
            .range(range)
            .unknown(unknown);
      };

      return initRange.apply(linearish(scale), arguments);
    }

    function threshold() {
      var domain = [0.5],
          range = [0, 1],
          unknown,
          n = 1;

      function scale(x) {
        return x != null && x <= x ? range[bisect(domain, x, 0, n)] : unknown;
      }

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : range.slice();
      };

      scale.invertExtent = function(y) {
        var i = range.indexOf(y);
        return [domain[i - 1], domain[i]];
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return threshold()
            .domain(domain)
            .range(range)
            .unknown(unknown);
      };

      return initRange.apply(scale, arguments);
    }

    var t0 = new Date,
        t1 = new Date;

    function newInterval(floori, offseti, count, field) {

      function interval(date) {
        return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
      }

      interval.floor = function(date) {
        return floori(date = new Date(+date)), date;
      };

      interval.ceil = function(date) {
        return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
      };

      interval.round = function(date) {
        var d0 = interval(date),
            d1 = interval.ceil(date);
        return date - d0 < d1 - date ? d0 : d1;
      };

      interval.offset = function(date, step) {
        return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
      };

      interval.range = function(start, stop, step) {
        var range = [], previous;
        start = interval.ceil(start);
        step = step == null ? 1 : Math.floor(step);
        if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
        do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
        while (previous < start && start < stop);
        return range;
      };

      interval.filter = function(test) {
        return newInterval(function(date) {
          if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
        }, function(date, step) {
          if (date >= date) {
            if (step < 0) while (++step <= 0) {
              while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
            } else while (--step >= 0) {
              while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
            }
          }
        });
      };

      if (count) {
        interval.count = function(start, end) {
          t0.setTime(+start), t1.setTime(+end);
          floori(t0), floori(t1);
          return Math.floor(count(t0, t1));
        };

        interval.every = function(step) {
          step = Math.floor(step);
          return !isFinite(step) || !(step > 0) ? null
              : !(step > 1) ? interval
              : interval.filter(field
                  ? function(d) { return field(d) % step === 0; }
                  : function(d) { return interval.count(0, d) % step === 0; });
        };
      }

      return interval;
    }

    var millisecond = newInterval(function() {
      // noop
    }, function(date, step) {
      date.setTime(+date + step);
    }, function(start, end) {
      return end - start;
    });

    // An optimized implementation for this simple case.
    millisecond.every = function(k) {
      k = Math.floor(k);
      if (!isFinite(k) || !(k > 0)) return null;
      if (!(k > 1)) return millisecond;
      return newInterval(function(date) {
        date.setTime(Math.floor(date / k) * k);
      }, function(date, step) {
        date.setTime(+date + step * k);
      }, function(start, end) {
        return (end - start) / k;
      });
    };

    var millisecond$1 = millisecond;
    var milliseconds = millisecond.range;

    const durationSecond = 1000;
    const durationMinute = durationSecond * 60;
    const durationHour = durationMinute * 60;
    const durationDay = durationHour * 24;
    const durationWeek = durationDay * 7;
    const durationMonth = durationDay * 30;
    const durationYear = durationDay * 365;

    var second = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds());
    }, function(date, step) {
      date.setTime(+date + step * durationSecond);
    }, function(start, end) {
      return (end - start) / durationSecond;
    }, function(date) {
      return date.getUTCSeconds();
    });

    var utcSecond = second;
    var seconds = second.range;

    var minute = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
    }, function(date, step) {
      date.setTime(+date + step * durationMinute);
    }, function(start, end) {
      return (end - start) / durationMinute;
    }, function(date) {
      return date.getMinutes();
    });

    var timeMinute = minute;
    var minutes = minute.range;

    var hour = newInterval(function(date) {
      date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
    }, function(date, step) {
      date.setTime(+date + step * durationHour);
    }, function(start, end) {
      return (end - start) / durationHour;
    }, function(date) {
      return date.getHours();
    });

    var timeHour = hour;
    var hours = hour.range;

    var day = newInterval(
      date => date.setHours(0, 0, 0, 0),
      (date, step) => date.setDate(date.getDate() + step),
      (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
      date => date.getDate() - 1
    );

    var timeDay = day;
    var days = day.range;

    function weekday(i) {
      return newInterval(function(date) {
        date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setDate(date.getDate() + step * 7);
      }, function(start, end) {
        return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
      });
    }

    var sunday = weekday(0);
    var monday = weekday(1);
    var tuesday = weekday(2);
    var wednesday = weekday(3);
    var thursday = weekday(4);
    var friday = weekday(5);
    var saturday = weekday(6);

    var sundays = sunday.range;
    var mondays = monday.range;
    var tuesdays = tuesday.range;
    var wednesdays = wednesday.range;
    var thursdays = thursday.range;
    var fridays = friday.range;
    var saturdays = saturday.range;

    var month = newInterval(function(date) {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setMonth(date.getMonth() + step);
    }, function(start, end) {
      return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
    }, function(date) {
      return date.getMonth();
    });

    var timeMonth = month;
    var months$1 = month.range;

    var year = newInterval(function(date) {
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step);
    }, function(start, end) {
      return end.getFullYear() - start.getFullYear();
    }, function(date) {
      return date.getFullYear();
    });

    // An optimized implementation for this simple case.
    year.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setFullYear(Math.floor(date.getFullYear() / k) * k);
        date.setMonth(0, 1);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setFullYear(date.getFullYear() + step * k);
      });
    };

    var timeYear = year;
    var years = year.range;

    var utcMinute = newInterval(function(date) {
      date.setUTCSeconds(0, 0);
    }, function(date, step) {
      date.setTime(+date + step * durationMinute);
    }, function(start, end) {
      return (end - start) / durationMinute;
    }, function(date) {
      return date.getUTCMinutes();
    });

    var utcMinute$1 = utcMinute;
    var utcMinutes = utcMinute.range;

    var utcHour = newInterval(function(date) {
      date.setUTCMinutes(0, 0, 0);
    }, function(date, step) {
      date.setTime(+date + step * durationHour);
    }, function(start, end) {
      return (end - start) / durationHour;
    }, function(date) {
      return date.getUTCHours();
    });

    var utcHour$1 = utcHour;
    var utcHours = utcHour.range;

    var utcDay = newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step);
    }, function(start, end) {
      return (end - start) / durationDay;
    }, function(date) {
      return date.getUTCDate() - 1;
    });

    var utcDay$1 = utcDay;
    var utcDays = utcDay.range;

    function utcWeekday(i) {
      return newInterval(function(date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCDate(date.getUTCDate() + step * 7);
      }, function(start, end) {
        return (end - start) / durationWeek;
      });
    }

    var utcSunday = utcWeekday(0);
    var utcMonday = utcWeekday(1);
    var utcTuesday = utcWeekday(2);
    var utcWednesday = utcWeekday(3);
    var utcThursday = utcWeekday(4);
    var utcFriday = utcWeekday(5);
    var utcSaturday = utcWeekday(6);

    var utcSundays = utcSunday.range;
    var utcMondays = utcMonday.range;
    var utcTuesdays = utcTuesday.range;
    var utcWednesdays = utcWednesday.range;
    var utcThursdays = utcThursday.range;
    var utcFridays = utcFriday.range;
    var utcSaturdays = utcSaturday.range;

    var utcMonth = newInterval(function(date) {
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCMonth(date.getUTCMonth() + step);
    }, function(start, end) {
      return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
    }, function(date) {
      return date.getUTCMonth();
    });

    var utcMonth$1 = utcMonth;
    var utcMonths = utcMonth.range;

    var utcYear = newInterval(function(date) {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step);
    }, function(start, end) {
      return end.getUTCFullYear() - start.getUTCFullYear();
    }, function(date) {
      return date.getUTCFullYear();
    });

    // An optimized implementation for this simple case.
    utcYear.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCFullYear(date.getUTCFullYear() + step * k);
      });
    };

    var utcYear$1 = utcYear;
    var utcYears = utcYear.range;

    function ticker(year, month, week, day, hour, minute) {

      const tickIntervals = [
        [utcSecond,  1,      durationSecond],
        [utcSecond,  5,  5 * durationSecond],
        [utcSecond, 15, 15 * durationSecond],
        [utcSecond, 30, 30 * durationSecond],
        [minute,  1,      durationMinute],
        [minute,  5,  5 * durationMinute],
        [minute, 15, 15 * durationMinute],
        [minute, 30, 30 * durationMinute],
        [  hour,  1,      durationHour  ],
        [  hour,  3,  3 * durationHour  ],
        [  hour,  6,  6 * durationHour  ],
        [  hour, 12, 12 * durationHour  ],
        [   day,  1,      durationDay   ],
        [   day,  2,  2 * durationDay   ],
        [  week,  1,      durationWeek  ],
        [ month,  1,      durationMonth ],
        [ month,  3,  3 * durationMonth ],
        [  year,  1,      durationYear  ]
      ];

      function ticks(start, stop, count) {
        const reverse = stop < start;
        if (reverse) [start, stop] = [stop, start];
        const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
        const ticks = interval ? interval.range(start, +stop + 1) : []; // inclusive stop
        return reverse ? ticks.reverse() : ticks;
      }

      function tickInterval(start, stop, count) {
        const target = Math.abs(stop - start) / count;
        const i = bisector(([,, step]) => step).right(tickIntervals, target);
        if (i === tickIntervals.length) return year.every(tickStep(start / durationYear, stop / durationYear, count));
        if (i === 0) return millisecond$1.every(Math.max(tickStep(start, stop, count), 1));
        const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
        return t.every(step);
      }

      return [ticks, tickInterval];
    }

    const [utcTicks, utcTickInterval] = ticker(utcYear$1, utcMonth$1, utcSunday, utcDay$1, utcHour$1, utcMinute$1);
    const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, sunday, timeDay, timeHour, timeMinute);

    function localDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
      }
      return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
    }

    function utcDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
      }
      return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
    }

    function newDate(y, m, d) {
      return {y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0};
    }

    function formatLocale(locale) {
      var locale_dateTime = locale.dateTime,
          locale_date = locale.date,
          locale_time = locale.time,
          locale_periods = locale.periods,
          locale_weekdays = locale.days,
          locale_shortWeekdays = locale.shortDays,
          locale_months = locale.months,
          locale_shortMonths = locale.shortMonths;

      var periodRe = formatRe(locale_periods),
          periodLookup = formatLookup(locale_periods),
          weekdayRe = formatRe(locale_weekdays),
          weekdayLookup = formatLookup(locale_weekdays),
          shortWeekdayRe = formatRe(locale_shortWeekdays),
          shortWeekdayLookup = formatLookup(locale_shortWeekdays),
          monthRe = formatRe(locale_months),
          monthLookup = formatLookup(locale_months),
          shortMonthRe = formatRe(locale_shortMonths),
          shortMonthLookup = formatLookup(locale_shortMonths);

      var formats = {
        "a": formatShortWeekday,
        "A": formatWeekday,
        "b": formatShortMonth,
        "B": formatMonth,
        "c": null,
        "d": formatDayOfMonth,
        "e": formatDayOfMonth,
        "f": formatMicroseconds,
        "g": formatYearISO,
        "G": formatFullYearISO,
        "H": formatHour24,
        "I": formatHour12,
        "j": formatDayOfYear,
        "L": formatMilliseconds,
        "m": formatMonthNumber,
        "M": formatMinutes,
        "p": formatPeriod,
        "q": formatQuarter,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatSeconds,
        "u": formatWeekdayNumberMonday,
        "U": formatWeekNumberSunday,
        "V": formatWeekNumberISO,
        "w": formatWeekdayNumberSunday,
        "W": formatWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatYear,
        "Y": formatFullYear,
        "Z": formatZone,
        "%": formatLiteralPercent
      };

      var utcFormats = {
        "a": formatUTCShortWeekday,
        "A": formatUTCWeekday,
        "b": formatUTCShortMonth,
        "B": formatUTCMonth,
        "c": null,
        "d": formatUTCDayOfMonth,
        "e": formatUTCDayOfMonth,
        "f": formatUTCMicroseconds,
        "g": formatUTCYearISO,
        "G": formatUTCFullYearISO,
        "H": formatUTCHour24,
        "I": formatUTCHour12,
        "j": formatUTCDayOfYear,
        "L": formatUTCMilliseconds,
        "m": formatUTCMonthNumber,
        "M": formatUTCMinutes,
        "p": formatUTCPeriod,
        "q": formatUTCQuarter,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatUTCSeconds,
        "u": formatUTCWeekdayNumberMonday,
        "U": formatUTCWeekNumberSunday,
        "V": formatUTCWeekNumberISO,
        "w": formatUTCWeekdayNumberSunday,
        "W": formatUTCWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatUTCYear,
        "Y": formatUTCFullYear,
        "Z": formatUTCZone,
        "%": formatLiteralPercent
      };

      var parses = {
        "a": parseShortWeekday,
        "A": parseWeekday,
        "b": parseShortMonth,
        "B": parseMonth,
        "c": parseLocaleDateTime,
        "d": parseDayOfMonth,
        "e": parseDayOfMonth,
        "f": parseMicroseconds,
        "g": parseYear,
        "G": parseFullYear,
        "H": parseHour24,
        "I": parseHour24,
        "j": parseDayOfYear,
        "L": parseMilliseconds,
        "m": parseMonthNumber,
        "M": parseMinutes,
        "p": parsePeriod,
        "q": parseQuarter,
        "Q": parseUnixTimestamp,
        "s": parseUnixTimestampSeconds,
        "S": parseSeconds,
        "u": parseWeekdayNumberMonday,
        "U": parseWeekNumberSunday,
        "V": parseWeekNumberISO,
        "w": parseWeekdayNumberSunday,
        "W": parseWeekNumberMonday,
        "x": parseLocaleDate,
        "X": parseLocaleTime,
        "y": parseYear,
        "Y": parseFullYear,
        "Z": parseZone,
        "%": parseLiteralPercent
      };

      // These recursive directive definitions must be deferred.
      formats.x = newFormat(locale_date, formats);
      formats.X = newFormat(locale_time, formats);
      formats.c = newFormat(locale_dateTime, formats);
      utcFormats.x = newFormat(locale_date, utcFormats);
      utcFormats.X = newFormat(locale_time, utcFormats);
      utcFormats.c = newFormat(locale_dateTime, utcFormats);

      function newFormat(specifier, formats) {
        return function(date) {
          var string = [],
              i = -1,
              j = 0,
              n = specifier.length,
              c,
              pad,
              format;

          if (!(date instanceof Date)) date = new Date(+date);

          while (++i < n) {
            if (specifier.charCodeAt(i) === 37) {
              string.push(specifier.slice(j, i));
              if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
              else pad = c === "e" ? " " : "0";
              if (format = formats[c]) c = format(date, pad);
              string.push(c);
              j = i + 1;
            }
          }

          string.push(specifier.slice(j, i));
          return string.join("");
        };
      }

      function newParse(specifier, Z) {
        return function(string) {
          var d = newDate(1900, undefined, 1),
              i = parseSpecifier(d, specifier, string += "", 0),
              week, day;
          if (i != string.length) return null;

          // If a UNIX timestamp is specified, return it.
          if ("Q" in d) return new Date(d.Q);
          if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

          // If this is utcParse, never use the local timezone.
          if (Z && !("Z" in d)) d.Z = 0;

          // The am-pm flag is 0 for AM, and 1 for PM.
          if ("p" in d) d.H = d.H % 12 + d.p * 12;

          // If the month was not specified, inherit from the quarter.
          if (d.m === undefined) d.m = "q" in d ? d.q : 0;

          // Convert day-of-week and week-of-year to day-of-year.
          if ("V" in d) {
            if (d.V < 1 || d.V > 53) return null;
            if (!("w" in d)) d.w = 1;
            if ("Z" in d) {
              week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
              week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
              week = utcDay$1.offset(week, (d.V - 1) * 7);
              d.y = week.getUTCFullYear();
              d.m = week.getUTCMonth();
              d.d = week.getUTCDate() + (d.w + 6) % 7;
            } else {
              week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
              week = day > 4 || day === 0 ? monday.ceil(week) : monday(week);
              week = timeDay.offset(week, (d.V - 1) * 7);
              d.y = week.getFullYear();
              d.m = week.getMonth();
              d.d = week.getDate() + (d.w + 6) % 7;
            }
          } else if ("W" in d || "U" in d) {
            if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
            day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
            d.m = 0;
            d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
          }

          // If a time zone is specified, all fields are interpreted as UTC and then
          // offset according to the specified time zone.
          if ("Z" in d) {
            d.H += d.Z / 100 | 0;
            d.M += d.Z % 100;
            return utcDate(d);
          }

          // Otherwise, all fields are in local time.
          return localDate(d);
        };
      }

      function parseSpecifier(d, specifier, string, j) {
        var i = 0,
            n = specifier.length,
            m = string.length,
            c,
            parse;

        while (i < n) {
          if (j >= m) return -1;
          c = specifier.charCodeAt(i++);
          if (c === 37) {
            c = specifier.charAt(i++);
            parse = parses[c in pads ? specifier.charAt(i++) : c];
            if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
          } else if (c != string.charCodeAt(j++)) {
            return -1;
          }
        }

        return j;
      }

      function parsePeriod(d, string, i) {
        var n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseShortWeekday(d, string, i) {
        var n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseWeekday(d, string, i) {
        var n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseShortMonth(d, string, i) {
        var n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseMonth(d, string, i) {
        var n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
      }

      function parseLocaleDateTime(d, string, i) {
        return parseSpecifier(d, locale_dateTime, string, i);
      }

      function parseLocaleDate(d, string, i) {
        return parseSpecifier(d, locale_date, string, i);
      }

      function parseLocaleTime(d, string, i) {
        return parseSpecifier(d, locale_time, string, i);
      }

      function formatShortWeekday(d) {
        return locale_shortWeekdays[d.getDay()];
      }

      function formatWeekday(d) {
        return locale_weekdays[d.getDay()];
      }

      function formatShortMonth(d) {
        return locale_shortMonths[d.getMonth()];
      }

      function formatMonth(d) {
        return locale_months[d.getMonth()];
      }

      function formatPeriod(d) {
        return locale_periods[+(d.getHours() >= 12)];
      }

      function formatQuarter(d) {
        return 1 + ~~(d.getMonth() / 3);
      }

      function formatUTCShortWeekday(d) {
        return locale_shortWeekdays[d.getUTCDay()];
      }

      function formatUTCWeekday(d) {
        return locale_weekdays[d.getUTCDay()];
      }

      function formatUTCShortMonth(d) {
        return locale_shortMonths[d.getUTCMonth()];
      }

      function formatUTCMonth(d) {
        return locale_months[d.getUTCMonth()];
      }

      function formatUTCPeriod(d) {
        return locale_periods[+(d.getUTCHours() >= 12)];
      }

      function formatUTCQuarter(d) {
        return 1 + ~~(d.getUTCMonth() / 3);
      }

      return {
        format: function(specifier) {
          var f = newFormat(specifier += "", formats);
          f.toString = function() { return specifier; };
          return f;
        },
        parse: function(specifier) {
          var p = newParse(specifier += "", false);
          p.toString = function() { return specifier; };
          return p;
        },
        utcFormat: function(specifier) {
          var f = newFormat(specifier += "", utcFormats);
          f.toString = function() { return specifier; };
          return f;
        },
        utcParse: function(specifier) {
          var p = newParse(specifier += "", true);
          p.toString = function() { return specifier; };
          return p;
        }
      };
    }

    var pads = {"-": "", "_": " ", "0": "0"},
        numberRe = /^\s*\d+/, // note: ignores next directive
        percentRe = /^%/,
        requoteRe = /[\\^$*+?|[\]().{}]/g;

    function pad$1(value, fill, width) {
      var sign = value < 0 ? "-" : "",
          string = (sign ? -value : value) + "",
          length = string.length;
      return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
    }

    function requote(s) {
      return s.replace(requoteRe, "\\$&");
    }

    function formatRe(names) {
      return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
    }

    function formatLookup(names) {
      return new Map(names.map((name, i) => [name.toLowerCase(), i]));
    }

    function parseWeekdayNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.w = +n[0], i + n[0].length) : -1;
    }

    function parseWeekdayNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.u = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.U = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberISO(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.V = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.W = +n[0], i + n[0].length) : -1;
    }

    function parseFullYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 4));
      return n ? (d.y = +n[0], i + n[0].length) : -1;
    }

    function parseYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }

    function parseZone(d, string, i) {
      var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
      return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
    }

    function parseQuarter(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
    }

    function parseMonthNumber(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
    }

    function parseDayOfMonth(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.d = +n[0], i + n[0].length) : -1;
    }

    function parseDayOfYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }

    function parseHour24(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.H = +n[0], i + n[0].length) : -1;
    }

    function parseMinutes(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.M = +n[0], i + n[0].length) : -1;
    }

    function parseSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.S = +n[0], i + n[0].length) : -1;
    }

    function parseMilliseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.L = +n[0], i + n[0].length) : -1;
    }

    function parseMicroseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 6));
      return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
    }

    function parseLiteralPercent(d, string, i) {
      var n = percentRe.exec(string.slice(i, i + 1));
      return n ? i + n[0].length : -1;
    }

    function parseUnixTimestamp(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }

    function parseUnixTimestampSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.s = +n[0], i + n[0].length) : -1;
    }

    function formatDayOfMonth(d, p) {
      return pad$1(d.getDate(), p, 2);
    }

    function formatHour24(d, p) {
      return pad$1(d.getHours(), p, 2);
    }

    function formatHour12(d, p) {
      return pad$1(d.getHours() % 12 || 12, p, 2);
    }

    function formatDayOfYear(d, p) {
      return pad$1(1 + timeDay.count(timeYear(d), d), p, 3);
    }

    function formatMilliseconds(d, p) {
      return pad$1(d.getMilliseconds(), p, 3);
    }

    function formatMicroseconds(d, p) {
      return formatMilliseconds(d, p) + "000";
    }

    function formatMonthNumber(d, p) {
      return pad$1(d.getMonth() + 1, p, 2);
    }

    function formatMinutes(d, p) {
      return pad$1(d.getMinutes(), p, 2);
    }

    function formatSeconds(d, p) {
      return pad$1(d.getSeconds(), p, 2);
    }

    function formatWeekdayNumberMonday(d) {
      var day = d.getDay();
      return day === 0 ? 7 : day;
    }

    function formatWeekNumberSunday(d, p) {
      return pad$1(sunday.count(timeYear(d) - 1, d), p, 2);
    }

    function dISO(d) {
      var day = d.getDay();
      return (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
    }

    function formatWeekNumberISO(d, p) {
      d = dISO(d);
      return pad$1(thursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
    }

    function formatWeekdayNumberSunday(d) {
      return d.getDay();
    }

    function formatWeekNumberMonday(d, p) {
      return pad$1(monday.count(timeYear(d) - 1, d), p, 2);
    }

    function formatYear(d, p) {
      return pad$1(d.getFullYear() % 100, p, 2);
    }

    function formatYearISO(d, p) {
      d = dISO(d);
      return pad$1(d.getFullYear() % 100, p, 2);
    }

    function formatFullYear(d, p) {
      return pad$1(d.getFullYear() % 10000, p, 4);
    }

    function formatFullYearISO(d, p) {
      var day = d.getDay();
      d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
      return pad$1(d.getFullYear() % 10000, p, 4);
    }

    function formatZone(d) {
      var z = d.getTimezoneOffset();
      return (z > 0 ? "-" : (z *= -1, "+"))
          + pad$1(z / 60 | 0, "0", 2)
          + pad$1(z % 60, "0", 2);
    }

    function formatUTCDayOfMonth(d, p) {
      return pad$1(d.getUTCDate(), p, 2);
    }

    function formatUTCHour24(d, p) {
      return pad$1(d.getUTCHours(), p, 2);
    }

    function formatUTCHour12(d, p) {
      return pad$1(d.getUTCHours() % 12 || 12, p, 2);
    }

    function formatUTCDayOfYear(d, p) {
      return pad$1(1 + utcDay$1.count(utcYear$1(d), d), p, 3);
    }

    function formatUTCMilliseconds(d, p) {
      return pad$1(d.getUTCMilliseconds(), p, 3);
    }

    function formatUTCMicroseconds(d, p) {
      return formatUTCMilliseconds(d, p) + "000";
    }

    function formatUTCMonthNumber(d, p) {
      return pad$1(d.getUTCMonth() + 1, p, 2);
    }

    function formatUTCMinutes(d, p) {
      return pad$1(d.getUTCMinutes(), p, 2);
    }

    function formatUTCSeconds(d, p) {
      return pad$1(d.getUTCSeconds(), p, 2);
    }

    function formatUTCWeekdayNumberMonday(d) {
      var dow = d.getUTCDay();
      return dow === 0 ? 7 : dow;
    }

    function formatUTCWeekNumberSunday(d, p) {
      return pad$1(utcSunday.count(utcYear$1(d) - 1, d), p, 2);
    }

    function UTCdISO(d) {
      var day = d.getUTCDay();
      return (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
    }

    function formatUTCWeekNumberISO(d, p) {
      d = UTCdISO(d);
      return pad$1(utcThursday.count(utcYear$1(d), d) + (utcYear$1(d).getUTCDay() === 4), p, 2);
    }

    function formatUTCWeekdayNumberSunday(d) {
      return d.getUTCDay();
    }

    function formatUTCWeekNumberMonday(d, p) {
      return pad$1(utcMonday.count(utcYear$1(d) - 1, d), p, 2);
    }

    function formatUTCYear(d, p) {
      return pad$1(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCYearISO(d, p) {
      d = UTCdISO(d);
      return pad$1(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCFullYear(d, p) {
      return pad$1(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCFullYearISO(d, p) {
      var day = d.getUTCDay();
      d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
      return pad$1(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCZone() {
      return "+0000";
    }

    function formatLiteralPercent() {
      return "%";
    }

    function formatUnixTimestamp(d) {
      return +d;
    }

    function formatUnixTimestampSeconds(d) {
      return Math.floor(+d / 1000);
    }

    var locale;
    var timeFormat;
    var timeParse;
    var utcFormat;
    var utcParse;

    defaultLocale$1({
      dateTime: "%x, %X",
      date: "%-m/%-d/%Y",
      time: "%-I:%M:%S %p",
      periods: ["AM", "PM"],
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    });

    function defaultLocale$1(definition) {
      locale = formatLocale(definition);
      timeFormat = locale.format;
      timeParse = locale.parse;
      utcFormat = locale.utcFormat;
      utcParse = locale.utcParse;
      return locale;
    }

    var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

    function formatIsoNative(date) {
      return date.toISOString();
    }

    var formatIso = Date.prototype.toISOString
        ? formatIsoNative
        : utcFormat(isoSpecifier);

    var formatIso$1 = formatIso;

    function parseIsoNative(string) {
      var date = new Date(string);
      return isNaN(date) ? null : date;
    }

    var parseIso = +new Date("2000-01-01T00:00:00.000Z")
        ? parseIsoNative
        : utcParse(isoSpecifier);

    var parseIso$1 = parseIso;

    function date(t) {
      return new Date(t);
    }

    function number(t) {
      return t instanceof Date ? +t : +new Date(+t);
    }

    function calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format) {
      var scale = continuous(),
          invert = scale.invert,
          domain = scale.domain;

      var formatMillisecond = format(".%L"),
          formatSecond = format(":%S"),
          formatMinute = format("%I:%M"),
          formatHour = format("%I %p"),
          formatDay = format("%a %d"),
          formatWeek = format("%b %d"),
          formatMonth = format("%B"),
          formatYear = format("%Y");

      function tickFormat(date) {
        return (second(date) < date ? formatMillisecond
            : minute(date) < date ? formatSecond
            : hour(date) < date ? formatMinute
            : day(date) < date ? formatHour
            : month(date) < date ? (week(date) < date ? formatDay : formatWeek)
            : year(date) < date ? formatMonth
            : formatYear)(date);
      }

      scale.invert = function(y) {
        return new Date(invert(y));
      };

      scale.domain = function(_) {
        return arguments.length ? domain(Array.from(_, number)) : domain().map(date);
      };

      scale.ticks = function(interval) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], interval == null ? 10 : interval);
      };

      scale.tickFormat = function(count, specifier) {
        return specifier == null ? tickFormat : format(specifier);
      };

      scale.nice = function(interval) {
        var d = domain();
        if (!interval || typeof interval.range !== "function") interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
        return interval ? domain(nice(d, interval)) : scale;
      };

      scale.copy = function() {
        return copy$1(scale, calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format));
      };

      return scale;
    }

    function time() {
      return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, sunday, timeDay, timeHour, timeMinute, utcSecond, timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]), arguments);
    }

    function utcTime() {
      return initRange.apply(calendar(utcTicks, utcTickInterval, utcYear$1, utcMonth$1, utcSunday, utcDay$1, utcHour$1, utcMinute$1, utcSecond, utcFormat).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]), arguments);
    }

    function transformer$1() {
      var x0 = 0,
          x1 = 1,
          t0,
          t1,
          k10,
          transform,
          interpolator = identity$3,
          clamp = false,
          unknown;

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
      }

      scale.domain = function(_) {
        return arguments.length ? ([x0, x1] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = !!_, scale) : clamp;
      };

      scale.interpolator = function(_) {
        return arguments.length ? (interpolator = _, scale) : interpolator;
      };

      function range(interpolate) {
        return function(_) {
          var r0, r1;
          return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)];
        };
      }

      scale.range = range(interpolate$2);

      scale.rangeRound = range(interpolateRound);

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t) {
        transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
        return scale;
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .interpolator(source.interpolator())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function sequential() {
      var scale = linearish(transformer$1()(identity$3));

      scale.copy = function() {
        return copy(scale, sequential());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function sequentialLog() {
      var scale = loggish(transformer$1()).domain([1, 10]);

      scale.copy = function() {
        return copy(scale, sequentialLog()).base(scale.base());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function sequentialSymlog() {
      var scale = symlogish(transformer$1());

      scale.copy = function() {
        return copy(scale, sequentialSymlog()).constant(scale.constant());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function sequentialPow() {
      var scale = powish(transformer$1());

      scale.copy = function() {
        return copy(scale, sequentialPow()).exponent(scale.exponent());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function sequentialSqrt() {
      return sequentialPow.apply(null, arguments).exponent(0.5);
    }

    function sequentialQuantile() {
      var domain = [],
          interpolator = identity$3;

      function scale(x) {
        if (x != null && !isNaN(x = +x)) return interpolator((bisect(domain, x, 1) - 1) / (domain.length - 1));
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [];
        for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
        domain.sort(ascending$3);
        return scale;
      };

      scale.interpolator = function(_) {
        return arguments.length ? (interpolator = _, scale) : interpolator;
      };

      scale.range = function() {
        return domain.map((d, i) => interpolator(i / (domain.length - 1)));
      };

      scale.quantiles = function(n) {
        return Array.from({length: n + 1}, (_, i) => quantile$1(domain, i / n));
      };

      scale.copy = function() {
        return sequentialQuantile(interpolator).domain(domain);
      };

      return initInterpolator.apply(scale, arguments);
    }

    function transformer() {
      var x0 = 0,
          x1 = 0.5,
          x2 = 1,
          s = 1,
          t0,
          t1,
          t2,
          k10,
          k21,
          interpolator = identity$3,
          transform,
          clamp = false,
          unknown;

      function scale(x) {
        return isNaN(x = +x) ? unknown : (x = 0.5 + ((x = +transform(x)) - t1) * (s * x < s * t1 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x)) : x));
      }

      scale.domain = function(_) {
        return arguments.length ? ([x0, x1, x2] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), t2 = transform(x2 = +x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1, scale) : [x0, x1, x2];
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = !!_, scale) : clamp;
      };

      scale.interpolator = function(_) {
        return arguments.length ? (interpolator = _, scale) : interpolator;
      };

      function range(interpolate) {
        return function(_) {
          var r0, r1, r2;
          return arguments.length ? ([r0, r1, r2] = _, interpolator = piecewise(interpolate, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)];
        };
      }

      scale.range = range(interpolate$2);

      scale.rangeRound = range(interpolateRound);

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t) {
        transform = t, t0 = t(x0), t1 = t(x1), t2 = t(x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1;
        return scale;
      };
    }

    function diverging$1() {
      var scale = linearish(transformer()(identity$3));

      scale.copy = function() {
        return copy(scale, diverging$1());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function divergingLog() {
      var scale = loggish(transformer()).domain([0.1, 1, 10]);

      scale.copy = function() {
        return copy(scale, divergingLog()).base(scale.base());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function divergingSymlog() {
      var scale = symlogish(transformer());

      scale.copy = function() {
        return copy(scale, divergingSymlog()).constant(scale.constant());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function divergingPow() {
      var scale = powish(transformer());

      scale.copy = function() {
        return copy(scale, divergingPow()).exponent(scale.exponent());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function divergingSqrt() {
      return divergingPow.apply(null, arguments).exponent(0.5);
    }

    function colors(specifier) {
      var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
      while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
      return colors;
    }

    var category10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

    var Accent = colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");

    var Dark2 = colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");

    var Paired = colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");

    var Pastel1 = colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");

    var Pastel2 = colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");

    var Set1 = colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");

    var Set2 = colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");

    var Set3 = colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");

    var Tableau10 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");

    var ramp$1 = scheme => rgbBasis(scheme[scheme.length - 1]);

    var scheme$q = new Array(3).concat(
      "d8b365f5f5f55ab4ac",
      "a6611adfc27d80cdc1018571",
      "a6611adfc27df5f5f580cdc1018571",
      "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
      "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
      "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
      "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
      "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
      "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
    ).map(colors);

    var BrBG = ramp$1(scheme$q);

    var scheme$p = new Array(3).concat(
      "af8dc3f7f7f77fbf7b",
      "7b3294c2a5cfa6dba0008837",
      "7b3294c2a5cff7f7f7a6dba0008837",
      "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
      "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
      "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
      "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
      "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
      "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
    ).map(colors);

    var PRGn = ramp$1(scheme$p);

    var scheme$o = new Array(3).concat(
      "e9a3c9f7f7f7a1d76a",
      "d01c8bf1b6dab8e1864dac26",
      "d01c8bf1b6daf7f7f7b8e1864dac26",
      "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
      "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
      "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
      "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
      "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
      "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
    ).map(colors);

    var PiYG = ramp$1(scheme$o);

    var scheme$n = new Array(3).concat(
      "998ec3f7f7f7f1a340",
      "5e3c99b2abd2fdb863e66101",
      "5e3c99b2abd2f7f7f7fdb863e66101",
      "542788998ec3d8daebfee0b6f1a340b35806",
      "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
      "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
      "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
      "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
      "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
    ).map(colors);

    var PuOr = ramp$1(scheme$n);

    var scheme$m = new Array(3).concat(
      "ef8a62f7f7f767a9cf",
      "ca0020f4a58292c5de0571b0",
      "ca0020f4a582f7f7f792c5de0571b0",
      "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
      "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
      "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
      "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
      "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
      "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
    ).map(colors);

    var RdBu = ramp$1(scheme$m);

    var scheme$l = new Array(3).concat(
      "ef8a62ffffff999999",
      "ca0020f4a582bababa404040",
      "ca0020f4a582ffffffbababa404040",
      "b2182bef8a62fddbc7e0e0e09999994d4d4d",
      "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
      "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
      "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
      "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
      "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
    ).map(colors);

    var RdGy = ramp$1(scheme$l);

    var scheme$k = new Array(3).concat(
      "fc8d59ffffbf91bfdb",
      "d7191cfdae61abd9e92c7bb6",
      "d7191cfdae61ffffbfabd9e92c7bb6",
      "d73027fc8d59fee090e0f3f891bfdb4575b4",
      "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
      "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
      "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
      "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
      "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
    ).map(colors);

    var RdYlBu = ramp$1(scheme$k);

    var scheme$j = new Array(3).concat(
      "fc8d59ffffbf91cf60",
      "d7191cfdae61a6d96a1a9641",
      "d7191cfdae61ffffbfa6d96a1a9641",
      "d73027fc8d59fee08bd9ef8b91cf601a9850",
      "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
      "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
      "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
      "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
      "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
    ).map(colors);

    var RdYlGn = ramp$1(scheme$j);

    var scheme$i = new Array(3).concat(
      "fc8d59ffffbf99d594",
      "d7191cfdae61abdda42b83ba",
      "d7191cfdae61ffffbfabdda42b83ba",
      "d53e4ffc8d59fee08be6f59899d5943288bd",
      "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
      "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
      "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
      "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
      "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
    ).map(colors);

    var Spectral = ramp$1(scheme$i);

    var scheme$h = new Array(3).concat(
      "e5f5f999d8c92ca25f",
      "edf8fbb2e2e266c2a4238b45",
      "edf8fbb2e2e266c2a42ca25f006d2c",
      "edf8fbccece699d8c966c2a42ca25f006d2c",
      "edf8fbccece699d8c966c2a441ae76238b45005824",
      "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
      "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
    ).map(colors);

    var BuGn = ramp$1(scheme$h);

    var scheme$g = new Array(3).concat(
      "e0ecf49ebcda8856a7",
      "edf8fbb3cde38c96c688419d",
      "edf8fbb3cde38c96c68856a7810f7c",
      "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
      "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
      "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
      "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
    ).map(colors);

    var BuPu = ramp$1(scheme$g);

    var scheme$f = new Array(3).concat(
      "e0f3dba8ddb543a2ca",
      "f0f9e8bae4bc7bccc42b8cbe",
      "f0f9e8bae4bc7bccc443a2ca0868ac",
      "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
      "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
      "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
      "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
    ).map(colors);

    var GnBu = ramp$1(scheme$f);

    var scheme$e = new Array(3).concat(
      "fee8c8fdbb84e34a33",
      "fef0d9fdcc8afc8d59d7301f",
      "fef0d9fdcc8afc8d59e34a33b30000",
      "fef0d9fdd49efdbb84fc8d59e34a33b30000",
      "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
      "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
      "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
    ).map(colors);

    var OrRd = ramp$1(scheme$e);

    var scheme$d = new Array(3).concat(
      "ece2f0a6bddb1c9099",
      "f6eff7bdc9e167a9cf02818a",
      "f6eff7bdc9e167a9cf1c9099016c59",
      "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
      "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
      "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
      "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
    ).map(colors);

    var PuBuGn = ramp$1(scheme$d);

    var scheme$c = new Array(3).concat(
      "ece7f2a6bddb2b8cbe",
      "f1eef6bdc9e174a9cf0570b0",
      "f1eef6bdc9e174a9cf2b8cbe045a8d",
      "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
      "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
      "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
      "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
    ).map(colors);

    var PuBu = ramp$1(scheme$c);

    var scheme$b = new Array(3).concat(
      "e7e1efc994c7dd1c77",
      "f1eef6d7b5d8df65b0ce1256",
      "f1eef6d7b5d8df65b0dd1c77980043",
      "f1eef6d4b9dac994c7df65b0dd1c77980043",
      "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
      "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
      "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
    ).map(colors);

    var PuRd = ramp$1(scheme$b);

    var scheme$a = new Array(3).concat(
      "fde0ddfa9fb5c51b8a",
      "feebe2fbb4b9f768a1ae017e",
      "feebe2fbb4b9f768a1c51b8a7a0177",
      "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
      "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
      "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
      "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
    ).map(colors);

    var RdPu = ramp$1(scheme$a);

    var scheme$9 = new Array(3).concat(
      "edf8b17fcdbb2c7fb8",
      "ffffcca1dab441b6c4225ea8",
      "ffffcca1dab441b6c42c7fb8253494",
      "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
      "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
      "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
      "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
    ).map(colors);

    var YlGnBu = ramp$1(scheme$9);

    var scheme$8 = new Array(3).concat(
      "f7fcb9addd8e31a354",
      "ffffccc2e69978c679238443",
      "ffffccc2e69978c67931a354006837",
      "ffffccd9f0a3addd8e78c67931a354006837",
      "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
      "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
      "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
    ).map(colors);

    var YlGn = ramp$1(scheme$8);

    var scheme$7 = new Array(3).concat(
      "fff7bcfec44fd95f0e",
      "ffffd4fed98efe9929cc4c02",
      "ffffd4fed98efe9929d95f0e993404",
      "ffffd4fee391fec44ffe9929d95f0e993404",
      "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
      "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
      "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
    ).map(colors);

    var YlOrBr = ramp$1(scheme$7);

    var scheme$6 = new Array(3).concat(
      "ffeda0feb24cf03b20",
      "ffffb2fecc5cfd8d3ce31a1c",
      "ffffb2fecc5cfd8d3cf03b20bd0026",
      "ffffb2fed976feb24cfd8d3cf03b20bd0026",
      "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
      "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
      "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
    ).map(colors);

    var YlOrRd = ramp$1(scheme$6);

    var scheme$5 = new Array(3).concat(
      "deebf79ecae13182bd",
      "eff3ffbdd7e76baed62171b5",
      "eff3ffbdd7e76baed63182bd08519c",
      "eff3ffc6dbef9ecae16baed63182bd08519c",
      "eff3ffc6dbef9ecae16baed64292c62171b5084594",
      "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
      "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
    ).map(colors);

    var Blues = ramp$1(scheme$5);

    var scheme$4 = new Array(3).concat(
      "e5f5e0a1d99b31a354",
      "edf8e9bae4b374c476238b45",
      "edf8e9bae4b374c47631a354006d2c",
      "edf8e9c7e9c0a1d99b74c47631a354006d2c",
      "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
      "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
      "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
    ).map(colors);

    var Greens = ramp$1(scheme$4);

    var scheme$3 = new Array(3).concat(
      "f0f0f0bdbdbd636363",
      "f7f7f7cccccc969696525252",
      "f7f7f7cccccc969696636363252525",
      "f7f7f7d9d9d9bdbdbd969696636363252525",
      "f7f7f7d9d9d9bdbdbd969696737373525252252525",
      "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
      "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
    ).map(colors);

    var Greys = ramp$1(scheme$3);

    var scheme$2 = new Array(3).concat(
      "efedf5bcbddc756bb1",
      "f2f0f7cbc9e29e9ac86a51a3",
      "f2f0f7cbc9e29e9ac8756bb154278f",
      "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
      "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
      "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
      "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
    ).map(colors);

    var Purples = ramp$1(scheme$2);

    var scheme$1 = new Array(3).concat(
      "fee0d2fc9272de2d26",
      "fee5d9fcae91fb6a4acb181d",
      "fee5d9fcae91fb6a4ade2d26a50f15",
      "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
      "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
      "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
      "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
    ).map(colors);

    var Reds = ramp$1(scheme$1);

    var scheme = new Array(3).concat(
      "fee6cefdae6be6550d",
      "feeddefdbe85fd8d3cd94701",
      "feeddefdbe85fd8d3ce6550da63603",
      "feeddefdd0a2fdae6bfd8d3ce6550da63603",
      "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
      "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
      "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
    ).map(colors);

    var Oranges = ramp$1(scheme);

    function cividis(t) {
      t = Math.max(0, Math.min(1, t));
      return "rgb("
          + Math.max(0, Math.min(255, Math.round(-4.54 - t * (35.34 - t * (2381.73 - t * (6402.7 - t * (7024.72 - t * 2710.57))))))) + ", "
          + Math.max(0, Math.min(255, Math.round(32.49 + t * (170.73 + t * (52.82 - t * (131.46 - t * (176.58 - t * 67.37))))))) + ", "
          + Math.max(0, Math.min(255, Math.round(81.24 + t * (442.36 - t * (2482.43 - t * (6167.24 - t * (6614.94 - t * 2475.67)))))))
          + ")";
    }

    var cubehelix = cubehelixLong(cubehelix$3(300, 0.5, 0.0), cubehelix$3(-240, 0.5, 1.0));

    var warm = cubehelixLong(cubehelix$3(-100, 0.75, 0.35), cubehelix$3(80, 1.50, 0.8));

    var cool = cubehelixLong(cubehelix$3(260, 0.75, 0.35), cubehelix$3(80, 1.50, 0.8));

    var c$2 = cubehelix$3();

    function rainbow(t) {
      if (t < 0 || t > 1) t -= Math.floor(t);
      var ts = Math.abs(t - 0.5);
      c$2.h = 360 * t - 100;
      c$2.s = 1.5 - 1.5 * ts;
      c$2.l = 0.8 - 0.9 * ts;
      return c$2 + "";
    }

    var c$1 = rgb(),
        pi_1_3 = Math.PI / 3,
        pi_2_3 = Math.PI * 2 / 3;

    function sinebow(t) {
      var x;
      t = (0.5 - t) * Math.PI;
      c$1.r = 255 * (x = Math.sin(t)) * x;
      c$1.g = 255 * (x = Math.sin(t + pi_1_3)) * x;
      c$1.b = 255 * (x = Math.sin(t + pi_2_3)) * x;
      return c$1 + "";
    }

    function turbo(t) {
      t = Math.max(0, Math.min(1, t));
      return "rgb("
          + Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) + ", "
          + Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) + ", "
          + Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66)))))))
          + ")";
    }

    function ramp(range) {
      var n = range.length;
      return function(t) {
        return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
      };
    }

    var viridis = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

    var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

    var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

    var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

    function constant$1(x) {
      return function constant() {
        return x;
      };
    }

    var abs = Math.abs;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var max = Math.max;
    var min = Math.min;
    var sin = Math.sin;
    var sqrt = Math.sqrt;

    var epsilon = 1e-12;
    var pi = Math.PI;
    var halfPi = pi / 2;
    var tau = 2 * pi;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
    }

    function asin(x) {
      return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
    }

    function arcInnerRadius(d) {
      return d.innerRadius;
    }

    function arcOuterRadius(d) {
      return d.outerRadius;
    }

    function arcStartAngle(d) {
      return d.startAngle;
    }

    function arcEndAngle(d) {
      return d.endAngle;
    }

    function arcPadAngle(d) {
      return d && d.padAngle; // Note: optional!
    }

    function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
      var x10 = x1 - x0, y10 = y1 - y0,
          x32 = x3 - x2, y32 = y3 - y2,
          t = y32 * x10 - x32 * y10;
      if (t * t < epsilon) return;
      t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
      return [x0 + t * x10, y0 + t * y10];
    }

    // Compute perpendicular offset line of length rc.
    // http://mathworld.wolfram.com/Circle-LineIntersection.html
    function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
      var x01 = x0 - x1,
          y01 = y0 - y1,
          lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01),
          ox = lo * y01,
          oy = -lo * x01,
          x11 = x0 + ox,
          y11 = y0 + oy,
          x10 = x1 + ox,
          y10 = y1 + oy,
          x00 = (x11 + x10) / 2,
          y00 = (y11 + y10) / 2,
          dx = x10 - x11,
          dy = y10 - y11,
          d2 = dx * dx + dy * dy,
          r = r1 - rc,
          D = x11 * y10 - x10 * y11,
          d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D)),
          cx0 = (D * dy - dx * d) / d2,
          cy0 = (-D * dx - dy * d) / d2,
          cx1 = (D * dy + dx * d) / d2,
          cy1 = (-D * dx + dy * d) / d2,
          dx0 = cx0 - x00,
          dy0 = cy0 - y00,
          dx1 = cx1 - x00,
          dy1 = cy1 - y00;

      // Pick the closer of the two intersection points.
      // TODO Is there a faster way to determine which intersection to use?
      if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

      return {
        cx: cx0,
        cy: cy0,
        x01: -ox,
        y01: -oy,
        x11: cx0 * (r1 / r - 1),
        y11: cy0 * (r1 / r - 1)
      };
    }

    function arc() {
      var innerRadius = arcInnerRadius,
          outerRadius = arcOuterRadius,
          cornerRadius = constant$1(0),
          padRadius = null,
          startAngle = arcStartAngle,
          endAngle = arcEndAngle,
          padAngle = arcPadAngle,
          context = null;

      function arc() {
        var buffer,
            r,
            r0 = +innerRadius.apply(this, arguments),
            r1 = +outerRadius.apply(this, arguments),
            a0 = startAngle.apply(this, arguments) - halfPi,
            a1 = endAngle.apply(this, arguments) - halfPi,
            da = abs(a1 - a0),
            cw = a1 > a0;

        if (!context) context = buffer = path();

        // Ensure that the outer radius is always larger than the inner radius.
        if (r1 < r0) r = r1, r1 = r0, r0 = r;

        // Is it a point?
        if (!(r1 > epsilon)) context.moveTo(0, 0);

        // Or is it a circle or annulus?
        else if (da > tau - epsilon) {
          context.moveTo(r1 * cos(a0), r1 * sin(a0));
          context.arc(0, 0, r1, a0, a1, !cw);
          if (r0 > epsilon) {
            context.moveTo(r0 * cos(a1), r0 * sin(a1));
            context.arc(0, 0, r0, a1, a0, cw);
          }
        }

        // Or is it a circular or annular sector?
        else {
          var a01 = a0,
              a11 = a1,
              a00 = a0,
              a10 = a1,
              da0 = da,
              da1 = da,
              ap = padAngle.apply(this, arguments) / 2,
              rp = (ap > epsilon) && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)),
              rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
              rc0 = rc,
              rc1 = rc,
              t0,
              t1;

          // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
          if (rp > epsilon) {
            var p0 = asin(rp / r0 * sin(ap)),
                p1 = asin(rp / r1 * sin(ap));
            if ((da0 -= p0 * 2) > epsilon) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
            else da0 = 0, a00 = a10 = (a0 + a1) / 2;
            if ((da1 -= p1 * 2) > epsilon) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
            else da1 = 0, a01 = a11 = (a0 + a1) / 2;
          }

          var x01 = r1 * cos(a01),
              y01 = r1 * sin(a01),
              x10 = r0 * cos(a10),
              y10 = r0 * sin(a10);

          // Apply rounded corners?
          if (rc > epsilon) {
            var x11 = r1 * cos(a11),
                y11 = r1 * sin(a11),
                x00 = r0 * cos(a00),
                y00 = r0 * sin(a00),
                oc;

            // Restrict the corner radius according to the sector angle.
            if (da < pi && (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10))) {
              var ax = x01 - oc[0],
                  ay = y01 - oc[1],
                  bx = x11 - oc[0],
                  by = y11 - oc[1],
                  kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2),
                  lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
              rc0 = min(rc, (r0 - lc) / (kc - 1));
              rc1 = min(rc, (r1 - lc) / (kc + 1));
            }
          }

          // Is the sector collapsed to a line?
          if (!(da1 > epsilon)) context.moveTo(x01, y01);

          // Does the sector’s outer ring have rounded corners?
          else if (rc1 > epsilon) {
            t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
            t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

            context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

            // Have the corners merged?
            if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

            // Otherwise, draw the two corners and the ring.
            else {
              context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
              context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
              context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
            }
          }

          // Or is the outer ring just a circular arc?
          else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

          // Is there no inner ring, and it’s a circular sector?
          // Or perhaps it’s an annular sector collapsed due to padding?
          if (!(r0 > epsilon) || !(da0 > epsilon)) context.lineTo(x10, y10);

          // Does the sector’s inner ring (or point) have rounded corners?
          else if (rc0 > epsilon) {
            t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
            t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

            context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

            // Have the corners merged?
            if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

            // Otherwise, draw the two corners and the ring.
            else {
              context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
              context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
              context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
            }
          }

          // Or is the inner ring just a circular arc?
          else context.arc(0, 0, r0, a10, a00, cw);
        }

        context.closePath();

        if (buffer) return context = null, buffer + "" || null;
      }

      arc.centroid = function() {
        var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
            a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
        return [cos(a) * r, sin(a) * r];
      };

      arc.innerRadius = function(_) {
        return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant$1(+_), arc) : innerRadius;
      };

      arc.outerRadius = function(_) {
        return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant$1(+_), arc) : outerRadius;
      };

      arc.cornerRadius = function(_) {
        return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant$1(+_), arc) : cornerRadius;
      };

      arc.padRadius = function(_) {
        return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant$1(+_), arc) : padRadius;
      };

      arc.startAngle = function(_) {
        return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$1(+_), arc) : startAngle;
      };

      arc.endAngle = function(_) {
        return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$1(+_), arc) : endAngle;
      };

      arc.padAngle = function(_) {
        return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$1(+_), arc) : padAngle;
      };

      arc.context = function(_) {
        return arguments.length ? ((context = _ == null ? null : _), arc) : context;
      };

      return arc;
    }

    var slice = Array.prototype.slice;

    function array(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function Linear(context) {
      this._context = context;
    }

    Linear.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // falls through
          default: this._context.lineTo(x, y); break;
        }
      }
    };

    function curveLinear(context) {
      return new Linear(context);
    }

    function x(p) {
      return p[0];
    }

    function y(p) {
      return p[1];
    }

    function line(x$1, y$1) {
      var defined = constant$1(true),
          context = null,
          curve = curveLinear,
          output = null;

      x$1 = typeof x$1 === "function" ? x$1 : (x$1 === undefined) ? x : constant$1(x$1);
      y$1 = typeof y$1 === "function" ? y$1 : (y$1 === undefined) ? y : constant$1(y$1);

      function line(data) {
        var i,
            n = (data = array(data)).length,
            d,
            defined0 = false,
            buffer;

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) output.lineStart();
            else output.lineEnd();
          }
          if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      line.x = function(_) {
        return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$1(+_), line) : x$1;
      };

      line.y = function(_) {
        return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$1(+_), line) : y$1;
      };

      line.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant$1(!!_), line) : defined;
      };

      line.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
      };

      line.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
      };

      return line;
    }

    function area(x0, y0, y1) {
      var x1 = null,
          defined = constant$1(true),
          context = null,
          curve = curveLinear,
          output = null;

      x0 = typeof x0 === "function" ? x0 : (x0 === undefined) ? x : constant$1(+x0);
      y0 = typeof y0 === "function" ? y0 : (y0 === undefined) ? constant$1(0) : constant$1(+y0);
      y1 = typeof y1 === "function" ? y1 : (y1 === undefined) ? y : constant$1(+y1);

      function area(data) {
        var i,
            j,
            k,
            n = (data = array(data)).length,
            d,
            defined0 = false,
            buffer,
            x0z = new Array(n),
            y0z = new Array(n);

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) {
              j = i;
              output.areaStart();
              output.lineStart();
            } else {
              output.lineEnd();
              output.lineStart();
              for (k = i - 1; k >= j; --k) {
                output.point(x0z[k], y0z[k]);
              }
              output.lineEnd();
              output.areaEnd();
            }
          }
          if (defined0) {
            x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
            output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
          }
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      function arealine() {
        return line().defined(defined).curve(curve).context(context);
      }

      area.x = function(_) {
        return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$1(+_), x1 = null, area) : x0;
      };

      area.x0 = function(_) {
        return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$1(+_), area) : x0;
      };

      area.x1 = function(_) {
        return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant$1(+_), area) : x1;
      };

      area.y = function(_) {
        return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$1(+_), y1 = null, area) : y0;
      };

      area.y0 = function(_) {
        return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$1(+_), area) : y0;
      };

      area.y1 = function(_) {
        return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant$1(+_), area) : y1;
      };

      area.lineX0 =
      area.lineY0 = function() {
        return arealine().x(x0).y(y0);
      };

      area.lineY1 = function() {
        return arealine().x(x0).y(y1);
      };

      area.lineX1 = function() {
        return arealine().x(x1).y(y0);
      };

      area.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant$1(!!_), area) : defined;
      };

      area.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
      };

      area.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
      };

      return area;
    }

    function descending$1(a, b) {
      return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
    }

    function identity$1(d) {
      return d;
    }

    function pie() {
      var value = identity$1,
          sortValues = descending$1,
          sort = null,
          startAngle = constant$1(0),
          endAngle = constant$1(tau),
          padAngle = constant$1(0);

      function pie(data) {
        var i,
            n = (data = array(data)).length,
            j,
            k,
            sum = 0,
            index = new Array(n),
            arcs = new Array(n),
            a0 = +startAngle.apply(this, arguments),
            da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)),
            a1,
            p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)),
            pa = p * (da < 0 ? -1 : 1),
            v;

        for (i = 0; i < n; ++i) {
          if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
            sum += v;
          }
        }

        // Optionally sort the arcs by previously-computed values or by data.
        if (sortValues != null) index.sort(function(i, j) { return sortValues(arcs[i], arcs[j]); });
        else if (sort != null) index.sort(function(i, j) { return sort(data[i], data[j]); });

        // Compute the arcs! They are stored in the original data's order.
        for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
          j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
            data: data[j],
            index: i,
            value: v,
            startAngle: a0,
            endAngle: a1,
            padAngle: p
          };
        }

        return arcs;
      }

      pie.value = function(_) {
        return arguments.length ? (value = typeof _ === "function" ? _ : constant$1(+_), pie) : value;
      };

      pie.sortValues = function(_) {
        return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
      };

      pie.sort = function(_) {
        return arguments.length ? (sort = _, sortValues = null, pie) : sort;
      };

      pie.startAngle = function(_) {
        return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$1(+_), pie) : startAngle;
      };

      pie.endAngle = function(_) {
        return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$1(+_), pie) : endAngle;
      };

      pie.padAngle = function(_) {
        return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$1(+_), pie) : padAngle;
      };

      return pie;
    }

    var curveRadialLinear = curveRadial$1(curveLinear);

    function Radial(curve) {
      this._curve = curve;
    }

    Radial.prototype = {
      areaStart: function() {
        this._curve.areaStart();
      },
      areaEnd: function() {
        this._curve.areaEnd();
      },
      lineStart: function() {
        this._curve.lineStart();
      },
      lineEnd: function() {
        this._curve.lineEnd();
      },
      point: function(a, r) {
        this._curve.point(r * Math.sin(a), r * -Math.cos(a));
      }
    };

    function curveRadial$1(curve) {

      function radial(context) {
        return new Radial(curve(context));
      }

      radial._curve = curve;

      return radial;
    }

    function lineRadial(l) {
      var c = l.curve;

      l.angle = l.x, delete l.x;
      l.radius = l.y, delete l.y;

      l.curve = function(_) {
        return arguments.length ? c(curveRadial$1(_)) : c()._curve;
      };

      return l;
    }

    function lineRadial$1() {
      return lineRadial(line().curve(curveRadialLinear));
    }

    function areaRadial() {
      var a = area().curve(curveRadialLinear),
          c = a.curve,
          x0 = a.lineX0,
          x1 = a.lineX1,
          y0 = a.lineY0,
          y1 = a.lineY1;

      a.angle = a.x, delete a.x;
      a.startAngle = a.x0, delete a.x0;
      a.endAngle = a.x1, delete a.x1;
      a.radius = a.y, delete a.y;
      a.innerRadius = a.y0, delete a.y0;
      a.outerRadius = a.y1, delete a.y1;
      a.lineStartAngle = function() { return lineRadial(x0()); }, delete a.lineX0;
      a.lineEndAngle = function() { return lineRadial(x1()); }, delete a.lineX1;
      a.lineInnerRadius = function() { return lineRadial(y0()); }, delete a.lineY0;
      a.lineOuterRadius = function() { return lineRadial(y1()); }, delete a.lineY1;

      a.curve = function(_) {
        return arguments.length ? c(curveRadial$1(_)) : c()._curve;
      };

      return a;
    }

    function pointRadial(x, y) {
      return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
    }

    function linkSource(d) {
      return d.source;
    }

    function linkTarget(d) {
      return d.target;
    }

    function link(curve) {
      var source = linkSource,
          target = linkTarget,
          x$1 = x,
          y$1 = y,
          context = null;

      function link() {
        var buffer, argv = slice.call(arguments), s = source.apply(this, argv), t = target.apply(this, argv);
        if (!context) context = buffer = path();
        curve(context, +x$1.apply(this, (argv[0] = s, argv)), +y$1.apply(this, argv), +x$1.apply(this, (argv[0] = t, argv)), +y$1.apply(this, argv));
        if (buffer) return context = null, buffer + "" || null;
      }

      link.source = function(_) {
        return arguments.length ? (source = _, link) : source;
      };

      link.target = function(_) {
        return arguments.length ? (target = _, link) : target;
      };

      link.x = function(_) {
        return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$1(+_), link) : x$1;
      };

      link.y = function(_) {
        return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$1(+_), link) : y$1;
      };

      link.context = function(_) {
        return arguments.length ? ((context = _ == null ? null : _), link) : context;
      };

      return link;
    }

    function curveHorizontal(context, x0, y0, x1, y1) {
      context.moveTo(x0, y0);
      context.bezierCurveTo(x0 = (x0 + x1) / 2, y0, x0, y1, x1, y1);
    }

    function curveVertical(context, x0, y0, x1, y1) {
      context.moveTo(x0, y0);
      context.bezierCurveTo(x0, y0 = (y0 + y1) / 2, x1, y0, x1, y1);
    }

    function curveRadial(context, x0, y0, x1, y1) {
      var p0 = pointRadial(x0, y0),
          p1 = pointRadial(x0, y0 = (y0 + y1) / 2),
          p2 = pointRadial(x1, y0),
          p3 = pointRadial(x1, y1);
      context.moveTo(p0[0], p0[1]);
      context.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
    }

    function linkHorizontal() {
      return link(curveHorizontal);
    }

    function linkVertical() {
      return link(curveVertical);
    }

    function linkRadial() {
      var l = link(curveRadial);
      l.angle = l.x, delete l.x;
      l.radius = l.y, delete l.y;
      return l;
    }

    var circle = {
      draw: function(context, size) {
        var r = Math.sqrt(size / pi);
        context.moveTo(r, 0);
        context.arc(0, 0, r, 0, tau);
      }
    };

    var cross = {
      draw: function(context, size) {
        var r = Math.sqrt(size / 5) / 2;
        context.moveTo(-3 * r, -r);
        context.lineTo(-r, -r);
        context.lineTo(-r, -3 * r);
        context.lineTo(r, -3 * r);
        context.lineTo(r, -r);
        context.lineTo(3 * r, -r);
        context.lineTo(3 * r, r);
        context.lineTo(r, r);
        context.lineTo(r, 3 * r);
        context.lineTo(-r, 3 * r);
        context.lineTo(-r, r);
        context.lineTo(-3 * r, r);
        context.closePath();
      }
    };

    var tan30 = Math.sqrt(1 / 3),
        tan30_2 = tan30 * 2;

    var diamond = {
      draw: function(context, size) {
        var y = Math.sqrt(size / tan30_2),
            x = y * tan30;
        context.moveTo(0, -y);
        context.lineTo(x, 0);
        context.lineTo(0, y);
        context.lineTo(-x, 0);
        context.closePath();
      }
    };

    var ka = 0.89081309152928522810,
        kr = Math.sin(pi / 10) / Math.sin(7 * pi / 10),
        kx = Math.sin(tau / 10) * kr,
        ky = -Math.cos(tau / 10) * kr;

    var star = {
      draw: function(context, size) {
        var r = Math.sqrt(size * ka),
            x = kx * r,
            y = ky * r;
        context.moveTo(0, -r);
        context.lineTo(x, y);
        for (var i = 1; i < 5; ++i) {
          var a = tau * i / 5,
              c = Math.cos(a),
              s = Math.sin(a);
          context.lineTo(s * r, -c * r);
          context.lineTo(c * x - s * y, s * x + c * y);
        }
        context.closePath();
      }
    };

    var square = {
      draw: function(context, size) {
        var w = Math.sqrt(size),
            x = -w / 2;
        context.rect(x, x, w, w);
      }
    };

    var sqrt3 = Math.sqrt(3);

    var triangle = {
      draw: function(context, size) {
        var y = -Math.sqrt(size / (sqrt3 * 3));
        context.moveTo(0, y * 2);
        context.lineTo(-sqrt3 * y, -y);
        context.lineTo(sqrt3 * y, -y);
        context.closePath();
      }
    };

    var c = -0.5,
        s$1 = Math.sqrt(3) / 2,
        k = 1 / Math.sqrt(12),
        a = (k / 2 + 1) * 3;

    var wye = {
      draw: function(context, size) {
        var r = Math.sqrt(size / a),
            x0 = r / 2,
            y0 = r * k,
            x1 = x0,
            y1 = r * k + r,
            x2 = -x1,
            y2 = y1;
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(c * x0 - s$1 * y0, s$1 * x0 + c * y0);
        context.lineTo(c * x1 - s$1 * y1, s$1 * x1 + c * y1);
        context.lineTo(c * x2 - s$1 * y2, s$1 * x2 + c * y2);
        context.lineTo(c * x0 + s$1 * y0, c * y0 - s$1 * x0);
        context.lineTo(c * x1 + s$1 * y1, c * y1 - s$1 * x1);
        context.lineTo(c * x2 + s$1 * y2, c * y2 - s$1 * x2);
        context.closePath();
      }
    };

    var symbols = [
      circle,
      cross,
      diamond,
      square,
      star,
      triangle,
      wye
    ];

    function symbol(type, size) {
      var context = null;
      type = typeof type === "function" ? type : constant$1(type || circle);
      size = typeof size === "function" ? size : constant$1(size === undefined ? 64 : +size);

      function symbol() {
        var buffer;
        if (!context) context = buffer = path();
        type.apply(this, arguments).draw(context, +size.apply(this, arguments));
        if (buffer) return context = null, buffer + "" || null;
      }

      symbol.type = function(_) {
        return arguments.length ? (type = typeof _ === "function" ? _ : constant$1(_), symbol) : type;
      };

      symbol.size = function(_) {
        return arguments.length ? (size = typeof _ === "function" ? _ : constant$1(+_), symbol) : size;
      };

      symbol.context = function(_) {
        return arguments.length ? (context = _ == null ? null : _, symbol) : context;
      };

      return symbol;
    }

    function noop() {}

    function point$3(that, x, y) {
      that._context.bezierCurveTo(
        (2 * that._x0 + that._x1) / 3,
        (2 * that._y0 + that._y1) / 3,
        (that._x0 + 2 * that._x1) / 3,
        (that._y0 + 2 * that._y1) / 3,
        (that._x0 + 4 * that._x1 + x) / 6,
        (that._y0 + 4 * that._y1 + y) / 6
      );
    }

    function Basis(context) {
      this._context = context;
    }

    Basis.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 =
        this._y0 = this._y1 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 3: point$3(this, this._x1, this._y1); // falls through
          case 2: this._context.lineTo(this._x1, this._y1); break;
        }
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; break;
          case 2: this._point = 3; this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6); // falls through
          default: point$3(this, x, y); break;
        }
        this._x0 = this._x1, this._x1 = x;
        this._y0 = this._y1, this._y1 = y;
      }
    };

    function basis(context) {
      return new Basis(context);
    }

    function BasisClosed(context) {
      this._context = context;
    }

    BasisClosed.prototype = {
      areaStart: noop,
      areaEnd: noop,
      lineStart: function() {
        this._x0 = this._x1 = this._x2 = this._x3 = this._x4 =
        this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 1: {
            this._context.moveTo(this._x2, this._y2);
            this._context.closePath();
            break;
          }
          case 2: {
            this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
            this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
            this._context.closePath();
            break;
          }
          case 3: {
            this.point(this._x2, this._y2);
            this.point(this._x3, this._y3);
            this.point(this._x4, this._y4);
            break;
          }
        }
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._x2 = x, this._y2 = y; break;
          case 1: this._point = 2; this._x3 = x, this._y3 = y; break;
          case 2: this._point = 3; this._x4 = x, this._y4 = y; this._context.moveTo((this._x0 + 4 * this._x1 + x) / 6, (this._y0 + 4 * this._y1 + y) / 6); break;
          default: point$3(this, x, y); break;
        }
        this._x0 = this._x1, this._x1 = x;
        this._y0 = this._y1, this._y1 = y;
      }
    };

    function basisClosed(context) {
      return new BasisClosed(context);
    }

    function BasisOpen(context) {
      this._context = context;
    }

    BasisOpen.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 =
        this._y0 = this._y1 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; break;
          case 1: this._point = 2; break;
          case 2: this._point = 3; var x0 = (this._x0 + 4 * this._x1 + x) / 6, y0 = (this._y0 + 4 * this._y1 + y) / 6; this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0); break;
          case 3: this._point = 4; // falls through
          default: point$3(this, x, y); break;
        }
        this._x0 = this._x1, this._x1 = x;
        this._y0 = this._y1, this._y1 = y;
      }
    };

    function basisOpen(context) {
      return new BasisOpen(context);
    }

    class Bump {
      constructor(context, x) {
        this._context = context;
        this._x = x;
      }
      areaStart() {
        this._line = 0;
      }
      areaEnd() {
        this._line = NaN;
      }
      lineStart() {
        this._point = 0;
      }
      lineEnd() {
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      }
      point(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: {
            this._point = 1;
            if (this._line) this._context.lineTo(x, y);
            else this._context.moveTo(x, y);
            break;
          }
          case 1: this._point = 2; // falls through
          default: {
            if (this._x) this._context.bezierCurveTo(this._x0 = (this._x0 + x) / 2, this._y0, this._x0, y, x, y);
            else this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y) / 2, x, this._y0, x, y);
            break;
          }
        }
        this._x0 = x, this._y0 = y;
      }
    }

    function bumpX(context) {
      return new Bump(context, true);
    }

    function bumpY(context) {
      return new Bump(context, false);
    }

    function Bundle(context, beta) {
      this._basis = new Basis(context);
      this._beta = beta;
    }

    Bundle.prototype = {
      lineStart: function() {
        this._x = [];
        this._y = [];
        this._basis.lineStart();
      },
      lineEnd: function() {
        var x = this._x,
            y = this._y,
            j = x.length - 1;

        if (j > 0) {
          var x0 = x[0],
              y0 = y[0],
              dx = x[j] - x0,
              dy = y[j] - y0,
              i = -1,
              t;

          while (++i <= j) {
            t = i / j;
            this._basis.point(
              this._beta * x[i] + (1 - this._beta) * (x0 + t * dx),
              this._beta * y[i] + (1 - this._beta) * (y0 + t * dy)
            );
          }
        }

        this._x = this._y = null;
        this._basis.lineEnd();
      },
      point: function(x, y) {
        this._x.push(+x);
        this._y.push(+y);
      }
    };

    var bundle = (function custom(beta) {

      function bundle(context) {
        return beta === 1 ? new Basis(context) : new Bundle(context, beta);
      }

      bundle.beta = function(beta) {
        return custom(+beta);
      };

      return bundle;
    })(0.85);

    function point$2(that, x, y) {
      that._context.bezierCurveTo(
        that._x1 + that._k * (that._x2 - that._x0),
        that._y1 + that._k * (that._y2 - that._y0),
        that._x2 + that._k * (that._x1 - x),
        that._y2 + that._k * (that._y1 - y),
        that._x2,
        that._y2
      );
    }

    function Cardinal(context, tension) {
      this._context = context;
      this._k = (1 - tension) / 6;
    }

    Cardinal.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 = this._x2 =
        this._y0 = this._y1 = this._y2 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 2: this._context.lineTo(this._x2, this._y2); break;
          case 3: point$2(this, this._x1, this._y1); break;
        }
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; this._x1 = x, this._y1 = y; break;
          case 2: this._point = 3; // falls through
          default: point$2(this, x, y); break;
        }
        this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
        this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
      }
    };

    var cardinal = (function custom(tension) {

      function cardinal(context) {
        return new Cardinal(context, tension);
      }

      cardinal.tension = function(tension) {
        return custom(+tension);
      };

      return cardinal;
    })(0);

    function CardinalClosed(context, tension) {
      this._context = context;
      this._k = (1 - tension) / 6;
    }

    CardinalClosed.prototype = {
      areaStart: noop,
      areaEnd: noop,
      lineStart: function() {
        this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
        this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 1: {
            this._context.moveTo(this._x3, this._y3);
            this._context.closePath();
            break;
          }
          case 2: {
            this._context.lineTo(this._x3, this._y3);
            this._context.closePath();
            break;
          }
          case 3: {
            this.point(this._x3, this._y3);
            this.point(this._x4, this._y4);
            this.point(this._x5, this._y5);
            break;
          }
        }
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
          case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
          case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
          default: point$2(this, x, y); break;
        }
        this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
        this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
      }
    };

    var cardinalClosed = (function custom(tension) {

      function cardinal(context) {
        return new CardinalClosed(context, tension);
      }

      cardinal.tension = function(tension) {
        return custom(+tension);
      };

      return cardinal;
    })(0);

    function CardinalOpen(context, tension) {
      this._context = context;
      this._k = (1 - tension) / 6;
    }

    CardinalOpen.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 = this._x2 =
        this._y0 = this._y1 = this._y2 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; break;
          case 1: this._point = 2; break;
          case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
          case 3: this._point = 4; // falls through
          default: point$2(this, x, y); break;
        }
        this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
        this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
      }
    };

    var cardinalOpen = (function custom(tension) {

      function cardinal(context) {
        return new CardinalOpen(context, tension);
      }

      cardinal.tension = function(tension) {
        return custom(+tension);
      };

      return cardinal;
    })(0);

    function point$1(that, x, y) {
      var x1 = that._x1,
          y1 = that._y1,
          x2 = that._x2,
          y2 = that._y2;

      if (that._l01_a > epsilon) {
        var a = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a,
            n = 3 * that._l01_a * (that._l01_a + that._l12_a);
        x1 = (x1 * a - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
        y1 = (y1 * a - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
      }

      if (that._l23_a > epsilon) {
        var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a,
            m = 3 * that._l23_a * (that._l23_a + that._l12_a);
        x2 = (x2 * b + that._x1 * that._l23_2a - x * that._l12_2a) / m;
        y2 = (y2 * b + that._y1 * that._l23_2a - y * that._l12_2a) / m;
      }

      that._context.bezierCurveTo(x1, y1, x2, y2, that._x2, that._y2);
    }

    function CatmullRom(context, alpha) {
      this._context = context;
      this._alpha = alpha;
    }

    CatmullRom.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 = this._x2 =
        this._y0 = this._y1 = this._y2 = NaN;
        this._l01_a = this._l12_a = this._l23_a =
        this._l01_2a = this._l12_2a = this._l23_2a =
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 2: this._context.lineTo(this._x2, this._y2); break;
          case 3: this.point(this._x2, this._y2); break;
        }
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;

        if (this._point) {
          var x23 = this._x2 - x,
              y23 = this._y2 - y;
          this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
        }

        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; break;
          case 2: this._point = 3; // falls through
          default: point$1(this, x, y); break;
        }

        this._l01_a = this._l12_a, this._l12_a = this._l23_a;
        this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
        this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
        this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
      }
    };

    var catmullRom = (function custom(alpha) {

      function catmullRom(context) {
        return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
      }

      catmullRom.alpha = function(alpha) {
        return custom(+alpha);
      };

      return catmullRom;
    })(0.5);

    function CatmullRomClosed(context, alpha) {
      this._context = context;
      this._alpha = alpha;
    }

    CatmullRomClosed.prototype = {
      areaStart: noop,
      areaEnd: noop,
      lineStart: function() {
        this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
        this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
        this._l01_a = this._l12_a = this._l23_a =
        this._l01_2a = this._l12_2a = this._l23_2a =
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 1: {
            this._context.moveTo(this._x3, this._y3);
            this._context.closePath();
            break;
          }
          case 2: {
            this._context.lineTo(this._x3, this._y3);
            this._context.closePath();
            break;
          }
          case 3: {
            this.point(this._x3, this._y3);
            this.point(this._x4, this._y4);
            this.point(this._x5, this._y5);
            break;
          }
        }
      },
      point: function(x, y) {
        x = +x, y = +y;

        if (this._point) {
          var x23 = this._x2 - x,
              y23 = this._y2 - y;
          this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
        }

        switch (this._point) {
          case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
          case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
          case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
          default: point$1(this, x, y); break;
        }

        this._l01_a = this._l12_a, this._l12_a = this._l23_a;
        this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
        this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
        this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
      }
    };

    var catmullRomClosed = (function custom(alpha) {

      function catmullRom(context) {
        return alpha ? new CatmullRomClosed(context, alpha) : new CardinalClosed(context, 0);
      }

      catmullRom.alpha = function(alpha) {
        return custom(+alpha);
      };

      return catmullRom;
    })(0.5);

    function CatmullRomOpen(context, alpha) {
      this._context = context;
      this._alpha = alpha;
    }

    CatmullRomOpen.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 = this._x2 =
        this._y0 = this._y1 = this._y2 = NaN;
        this._l01_a = this._l12_a = this._l23_a =
        this._l01_2a = this._l12_2a = this._l23_2a =
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;

        if (this._point) {
          var x23 = this._x2 - x,
              y23 = this._y2 - y;
          this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
        }

        switch (this._point) {
          case 0: this._point = 1; break;
          case 1: this._point = 2; break;
          case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
          case 3: this._point = 4; // falls through
          default: point$1(this, x, y); break;
        }

        this._l01_a = this._l12_a, this._l12_a = this._l23_a;
        this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
        this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
        this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
      }
    };

    var catmullRomOpen = (function custom(alpha) {

      function catmullRom(context) {
        return alpha ? new CatmullRomOpen(context, alpha) : new CardinalOpen(context, 0);
      }

      catmullRom.alpha = function(alpha) {
        return custom(+alpha);
      };

      return catmullRom;
    })(0.5);

    function LinearClosed(context) {
      this._context = context;
    }

    LinearClosed.prototype = {
      areaStart: noop,
      areaEnd: noop,
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._point) this._context.closePath();
      },
      point: function(x, y) {
        x = +x, y = +y;
        if (this._point) this._context.lineTo(x, y);
        else this._point = 1, this._context.moveTo(x, y);
      }
    };

    function linearClosed(context) {
      return new LinearClosed(context);
    }

    function sign(x) {
      return x < 0 ? -1 : 1;
    }

    // Calculate the slopes of the tangents (Hermite-type interpolation) based on
    // the following paper: Steffen, M. 1990. A Simple Method for Monotonic
    // Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
    // NOV(II), P. 443, 1990.
    function slope3(that, x2, y2) {
      var h0 = that._x1 - that._x0,
          h1 = x2 - that._x1,
          s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
          s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
          p = (s0 * h1 + s1 * h0) / (h0 + h1);
      return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
    }

    // Calculate a one-sided slope.
    function slope2(that, t) {
      var h = that._x1 - that._x0;
      return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
    }

    // According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
    // "you can express cubic Hermite interpolation in terms of cubic Bézier curves
    // with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
    function point(that, t0, t1) {
      var x0 = that._x0,
          y0 = that._y0,
          x1 = that._x1,
          y1 = that._y1,
          dx = (x1 - x0) / 3;
      that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
    }

    function MonotoneX(context) {
      this._context = context;
    }

    MonotoneX.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x0 = this._x1 =
        this._y0 = this._y1 =
        this._t0 = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        switch (this._point) {
          case 2: this._context.lineTo(this._x1, this._y1); break;
          case 3: point(this, this._t0, slope2(this, this._t0)); break;
        }
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        var t1 = NaN;

        x = +x, y = +y;
        if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; break;
          case 2: this._point = 3; point(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
          default: point(this, this._t0, t1 = slope3(this, x, y)); break;
        }

        this._x0 = this._x1, this._x1 = x;
        this._y0 = this._y1, this._y1 = y;
        this._t0 = t1;
      }
    };

    function MonotoneY(context) {
      this._context = new ReflectContext(context);
    }

    (MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
      MonotoneX.prototype.point.call(this, y, x);
    };

    function ReflectContext(context) {
      this._context = context;
    }

    ReflectContext.prototype = {
      moveTo: function(x, y) { this._context.moveTo(y, x); },
      closePath: function() { this._context.closePath(); },
      lineTo: function(x, y) { this._context.lineTo(y, x); },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
    };

    function monotoneX(context) {
      return new MonotoneX(context);
    }

    function monotoneY(context) {
      return new MonotoneY(context);
    }

    function Natural(context) {
      this._context = context;
    }

    Natural.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x = [];
        this._y = [];
      },
      lineEnd: function() {
        var x = this._x,
            y = this._y,
            n = x.length;

        if (n) {
          this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
          if (n === 2) {
            this._context.lineTo(x[1], y[1]);
          } else {
            var px = controlPoints(x),
                py = controlPoints(y);
            for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
              this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
            }
          }
        }

        if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
        this._line = 1 - this._line;
        this._x = this._y = null;
      },
      point: function(x, y) {
        this._x.push(+x);
        this._y.push(+y);
      }
    };

    // See https://www.particleincell.com/2012/bezier-splines/ for derivation.
    function controlPoints(x) {
      var i,
          n = x.length - 1,
          m,
          a = new Array(n),
          b = new Array(n),
          r = new Array(n);
      a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
      for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
      a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
      for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
      a[n - 1] = r[n - 1] / b[n - 1];
      for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
      b[n - 1] = (x[n] + a[n - 1]) / 2;
      for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
      return [a, b];
    }

    function natural(context) {
      return new Natural(context);
    }

    function Step(context, t) {
      this._context = context;
      this._t = t;
    }

    Step.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x = this._y = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // falls through
          default: {
            if (this._t <= 0) {
              this._context.lineTo(this._x, y);
              this._context.lineTo(x, y);
            } else {
              var x1 = this._x * (1 - this._t) + x * this._t;
              this._context.lineTo(x1, this._y);
              this._context.lineTo(x1, y);
            }
            break;
          }
        }
        this._x = x, this._y = y;
      }
    };

    function step(context) {
      return new Step(context, 0.5);
    }

    function stepBefore(context) {
      return new Step(context, 0);
    }

    function stepAfter(context) {
      return new Step(context, 1);
    }

    function none$1(series, order) {
      if (!((n = series.length) > 1)) return;
      for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
        s0 = s1, s1 = series[order[i]];
        for (j = 0; j < m; ++j) {
          s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
        }
      }
    }

    function none(series) {
      var n = series.length, o = new Array(n);
      while (--n >= 0) o[n] = n;
      return o;
    }

    function stackValue(d, key) {
      return d[key];
    }

    function stackSeries(key) {
      const series = [];
      series.key = key;
      return series;
    }

    function stack() {
      var keys = constant$1([]),
          order = none,
          offset = none$1,
          value = stackValue;

      function stack(data) {
        var sz = Array.from(keys.apply(this, arguments), stackSeries),
            i, n = sz.length, j = -1,
            oz;

        for (const d of data) {
          for (i = 0, ++j; i < n; ++i) {
            (sz[i][j] = [0, +value(d, sz[i].key, j, data)]).data = d;
          }
        }

        for (i = 0, oz = array(order(sz)); i < n; ++i) {
          sz[oz[i]].index = i;
        }

        offset(sz, oz);
        return sz;
      }

      stack.keys = function(_) {
        return arguments.length ? (keys = typeof _ === "function" ? _ : constant$1(Array.from(_)), stack) : keys;
      };

      stack.value = function(_) {
        return arguments.length ? (value = typeof _ === "function" ? _ : constant$1(+_), stack) : value;
      };

      stack.order = function(_) {
        return arguments.length ? (order = _ == null ? none : typeof _ === "function" ? _ : constant$1(Array.from(_)), stack) : order;
      };

      stack.offset = function(_) {
        return arguments.length ? (offset = _ == null ? none$1 : _, stack) : offset;
      };

      return stack;
    }

    function expand(series, order) {
      if (!((n = series.length) > 0)) return;
      for (var i, n, j = 0, m = series[0].length, y; j < m; ++j) {
        for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0;
        if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y;
      }
      none$1(series, order);
    }

    function diverging(series, order) {
      if (!((n = series.length) > 0)) return;
      for (var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
        for (yp = yn = 0, i = 0; i < n; ++i) {
          if ((dy = (d = series[order[i]][j])[1] - d[0]) > 0) {
            d[0] = yp, d[1] = yp += dy;
          } else if (dy < 0) {
            d[1] = yn, d[0] = yn += dy;
          } else {
            d[0] = 0, d[1] = dy;
          }
        }
      }
    }

    function silhouette(series, order) {
      if (!((n = series.length) > 0)) return;
      for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
        for (var i = 0, y = 0; i < n; ++i) y += series[i][j][1] || 0;
        s0[j][1] += s0[j][0] = -y / 2;
      }
      none$1(series, order);
    }

    function wiggle(series, order) {
      if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
      for (var y = 0, j = 1, s0, m, n; j < m; ++j) {
        for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
          var si = series[order[i]],
              sij0 = si[j][1] || 0,
              sij1 = si[j - 1][1] || 0,
              s3 = (sij0 - sij1) / 2;
          for (var k = 0; k < i; ++k) {
            var sk = series[order[k]],
                skj0 = sk[j][1] || 0,
                skj1 = sk[j - 1][1] || 0;
            s3 += skj0 - skj1;
          }
          s1 += sij0, s2 += s3 * sij0;
        }
        s0[j - 1][1] += s0[j - 1][0] = y;
        if (s1) y -= s2 / s1;
      }
      s0[j - 1][1] += s0[j - 1][0] = y;
      none$1(series, order);
    }

    function appearance(series) {
      var peaks = series.map(peak);
      return none(series).sort(function(a, b) { return peaks[a] - peaks[b]; });
    }

    function peak(series) {
      var i = -1, j = 0, n = series.length, vi, vj = -Infinity;
      while (++i < n) if ((vi = +series[i][1]) > vj) vj = vi, j = i;
      return j;
    }

    function ascending(series) {
      var sums = series.map(sum);
      return none(series).sort(function(a, b) { return sums[a] - sums[b]; });
    }

    function sum(series) {
      var s = 0, i = -1, n = series.length, v;
      while (++i < n) if (v = +series[i][1]) s += v;
      return s;
    }

    function descending(series) {
      return ascending(series).reverse();
    }

    function insideOut(series) {
      var n = series.length,
          i,
          j,
          sums = series.map(sum),
          order = appearance(series),
          top = 0,
          bottom = 0,
          tops = [],
          bottoms = [];

      for (i = 0; i < n; ++i) {
        j = order[i];
        if (top < bottom) {
          top += sums[j];
          tops.push(j);
        } else {
          bottom += sums[j];
          bottoms.push(j);
        }
      }

      return bottoms.reverse().concat(tops);
    }

    function reverse(series) {
      return none(series).reverse();
    }

    var constant = x => () => x;

    function ZoomEvent(type, {
      sourceEvent,
      target,
      transform,
      dispatch
    }) {
      Object.defineProperties(this, {
        type: {value: type, enumerable: true, configurable: true},
        sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
        target: {value: target, enumerable: true, configurable: true},
        transform: {value: transform, enumerable: true, configurable: true},
        _: {value: dispatch}
      });
    }

    function Transform(k, x, y) {
      this.k = k;
      this.x = x;
      this.y = y;
    }

    Transform.prototype = {
      constructor: Transform,
      scale: function(k) {
        return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
      },
      translate: function(x, y) {
        return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
      },
      apply: function(point) {
        return [point[0] * this.k + this.x, point[1] * this.k + this.y];
      },
      applyX: function(x) {
        return x * this.k + this.x;
      },
      applyY: function(y) {
        return y * this.k + this.y;
      },
      invert: function(location) {
        return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
      },
      invertX: function(x) {
        return (x - this.x) / this.k;
      },
      invertY: function(y) {
        return (y - this.y) / this.k;
      },
      rescaleX: function(x) {
        return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
      },
      rescaleY: function(y) {
        return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
      },
      toString: function() {
        return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
      }
    };

    var identity = new Transform(1, 0, 0);

    transform.prototype = Transform.prototype;

    function transform(node) {
      while (!node.__zoom) if (!(node = node.parentNode)) return identity;
      return node.__zoom;
    }

    function nopropagation(event) {
      event.stopImmediatePropagation();
    }

    function noevent(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // Ignore right-click, since that should open the context menu.
    // except for pinch-to-zoom, which is sent as a wheel+ctrlKey event
    function defaultFilter(event) {
      return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    }

    function defaultExtent() {
      var e = this;
      if (e instanceof SVGElement) {
        e = e.ownerSVGElement || e;
        if (e.hasAttribute("viewBox")) {
          e = e.viewBox.baseVal;
          return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
        }
        return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
      }
      return [[0, 0], [e.clientWidth, e.clientHeight]];
    }

    function defaultTransform() {
      return this.__zoom || identity;
    }

    function defaultWheelDelta(event) {
      return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (event.ctrlKey ? 10 : 1);
    }

    function defaultTouchable() {
      return navigator.maxTouchPoints || ("ontouchstart" in this);
    }

    function defaultConstrain(transform, extent, translateExtent) {
      var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
          dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
          dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
          dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
      return transform.translate(
        dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
        dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
      );
    }

    function zoom() {
      var filter = defaultFilter,
          extent = defaultExtent,
          constrain = defaultConstrain,
          wheelDelta = defaultWheelDelta,
          touchable = defaultTouchable,
          scaleExtent = [0, Infinity],
          translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]],
          duration = 250,
          interpolate = interpolateZoom,
          listeners = dispatch("start", "zoom", "end"),
          touchstarting,
          touchfirst,
          touchending,
          touchDelay = 500,
          wheelDelay = 150,
          clickDistance2 = 0,
          tapDistance = 10;

      function zoom(selection) {
        selection
            .property("__zoom", defaultTransform)
            .on("wheel.zoom", wheeled, {passive: false})
            .on("mousedown.zoom", mousedowned)
            .on("dblclick.zoom", dblclicked)
          .filter(touchable)
            .on("touchstart.zoom", touchstarted)
            .on("touchmove.zoom", touchmoved)
            .on("touchend.zoom touchcancel.zoom", touchended)
            .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
      }

      zoom.transform = function(collection, transform, point, event) {
        var selection = collection.selection ? collection.selection() : collection;
        selection.property("__zoom", defaultTransform);
        if (collection !== selection) {
          schedule(collection, transform, point, event);
        } else {
          selection.interrupt().each(function() {
            gesture(this, arguments)
              .event(event)
              .start()
              .zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform)
              .end();
          });
        }
      };

      zoom.scaleBy = function(selection, k, p, event) {
        zoom.scaleTo(selection, function() {
          var k0 = this.__zoom.k,
              k1 = typeof k === "function" ? k.apply(this, arguments) : k;
          return k0 * k1;
        }, p, event);
      };

      zoom.scaleTo = function(selection, k, p, event) {
        zoom.transform(selection, function() {
          var e = extent.apply(this, arguments),
              t0 = this.__zoom,
              p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p,
              p1 = t0.invert(p0),
              k1 = typeof k === "function" ? k.apply(this, arguments) : k;
          return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
        }, p, event);
      };

      zoom.translateBy = function(selection, x, y, event) {
        zoom.transform(selection, function() {
          return constrain(this.__zoom.translate(
            typeof x === "function" ? x.apply(this, arguments) : x,
            typeof y === "function" ? y.apply(this, arguments) : y
          ), extent.apply(this, arguments), translateExtent);
        }, null, event);
      };

      zoom.translateTo = function(selection, x, y, p, event) {
        zoom.transform(selection, function() {
          var e = extent.apply(this, arguments),
              t = this.__zoom,
              p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
          return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(
            typeof x === "function" ? -x.apply(this, arguments) : -x,
            typeof y === "function" ? -y.apply(this, arguments) : -y
          ), e, translateExtent);
        }, p, event);
      };

      function scale(transform, k) {
        k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
        return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
      }

      function translate(transform, p0, p1) {
        var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
        return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
      }

      function centroid(extent) {
        return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
      }

      function schedule(transition, transform, point, event) {
        transition
            .on("start.zoom", function() { gesture(this, arguments).event(event).start(); })
            .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).event(event).end(); })
            .tween("zoom", function() {
              var that = this,
                  args = arguments,
                  g = gesture(that, args).event(event),
                  e = extent.apply(that, args),
                  p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point,
                  w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
                  a = that.__zoom,
                  b = typeof transform === "function" ? transform.apply(that, args) : transform,
                  i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
              return function(t) {
                if (t === 1) t = b; // Avoid rounding error on end.
                else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
                g.zoom(null, t);
              };
            });
      }

      function gesture(that, args, clean) {
        return (!clean && that.__zooming) || new Gesture(that, args);
      }

      function Gesture(that, args) {
        this.that = that;
        this.args = args;
        this.active = 0;
        this.sourceEvent = null;
        this.extent = extent.apply(that, args);
        this.taps = 0;
      }

      Gesture.prototype = {
        event: function(event) {
          if (event) this.sourceEvent = event;
          return this;
        },
        start: function() {
          if (++this.active === 1) {
            this.that.__zooming = this;
            this.emit("start");
          }
          return this;
        },
        zoom: function(key, transform) {
          if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
          if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
          if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
          this.that.__zoom = transform;
          this.emit("zoom");
          return this;
        },
        end: function() {
          if (--this.active === 0) {
            delete this.that.__zooming;
            this.emit("end");
          }
          return this;
        },
        emit: function(type) {
          var d = select(this.that).datum();
          listeners.call(
            type,
            this.that,
            new ZoomEvent(type, {
              sourceEvent: this.sourceEvent,
              target: zoom,
              type,
              transform: this.that.__zoom,
              dispatch: listeners
            }),
            d
          );
        }
      };

      function wheeled(event, ...args) {
        if (!filter.apply(this, arguments)) return;
        var g = gesture(this, args).event(event),
            t = this.__zoom,
            k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))),
            p = pointer(event);

        // If the mouse is in the same location as before, reuse it.
        // If there were recent wheel events, reset the wheel idle timeout.
        if (g.wheel) {
          if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
            g.mouse[1] = t.invert(g.mouse[0] = p);
          }
          clearTimeout(g.wheel);
        }

        // If this wheel event won’t trigger a transform change, ignore it.
        else if (t.k === k) return;

        // Otherwise, capture the mouse point and location at the start.
        else {
          g.mouse = [p, t.invert(p)];
          interrupt(this);
          g.start();
        }

        noevent(event);
        g.wheel = setTimeout(wheelidled, wheelDelay);
        g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));

        function wheelidled() {
          g.wheel = null;
          g.end();
        }
      }

      function mousedowned(event, ...args) {
        if (touchending || !filter.apply(this, arguments)) return;
        var currentTarget = event.currentTarget,
            g = gesture(this, args, true).event(event),
            v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
            p = pointer(event, currentTarget),
            x0 = event.clientX,
            y0 = event.clientY;

        dragDisable(event.view);
        nopropagation(event);
        g.mouse = [p, this.__zoom.invert(p)];
        interrupt(this);
        g.start();

        function mousemoved(event) {
          noevent(event);
          if (!g.moved) {
            var dx = event.clientX - x0, dy = event.clientY - y0;
            g.moved = dx * dx + dy * dy > clickDistance2;
          }
          g.event(event)
           .zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event, currentTarget), g.mouse[1]), g.extent, translateExtent));
        }

        function mouseupped(event) {
          v.on("mousemove.zoom mouseup.zoom", null);
          yesdrag(event.view, g.moved);
          noevent(event);
          g.event(event).end();
        }
      }

      function dblclicked(event, ...args) {
        if (!filter.apply(this, arguments)) return;
        var t0 = this.__zoom,
            p0 = pointer(event.changedTouches ? event.changedTouches[0] : event, this),
            p1 = t0.invert(p0),
            k1 = t0.k * (event.shiftKey ? 0.5 : 2),
            t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);

        noevent(event);
        if (duration > 0) select(this).transition().duration(duration).call(schedule, t1, p0, event);
        else select(this).call(zoom.transform, t1, p0, event);
      }

      function touchstarted(event, ...args) {
        if (!filter.apply(this, arguments)) return;
        var touches = event.touches,
            n = touches.length,
            g = gesture(this, args, event.changedTouches.length === n).event(event),
            started, i, t, p;

        nopropagation(event);
        for (i = 0; i < n; ++i) {
          t = touches[i], p = pointer(t, this);
          p = [p, this.__zoom.invert(p), t.identifier];
          if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
          else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
        }

        if (touchstarting) touchstarting = clearTimeout(touchstarting);

        if (started) {
          if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
          interrupt(this);
          g.start();
        }
      }

      function touchmoved(event, ...args) {
        if (!this.__zooming) return;
        var g = gesture(this, args).event(event),
            touches = event.changedTouches,
            n = touches.length, i, t, p, l;

        noevent(event);
        for (i = 0; i < n; ++i) {
          t = touches[i], p = pointer(t, this);
          if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
          else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
        }
        t = g.that.__zoom;
        if (g.touch1) {
          var p0 = g.touch0[0], l0 = g.touch0[1],
              p1 = g.touch1[0], l1 = g.touch1[1],
              dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
              dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
          t = scale(t, Math.sqrt(dp / dl));
          p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
          l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
        }
        else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
        else return;

        g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
      }

      function touchended(event, ...args) {
        if (!this.__zooming) return;
        var g = gesture(this, args).event(event),
            touches = event.changedTouches,
            n = touches.length, i, t;

        nopropagation(event);
        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() { touchending = null; }, touchDelay);
        for (i = 0; i < n; ++i) {
          t = touches[i];
          if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
          else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
        }
        if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
        if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
        else {
          g.end();
          // If this was a dbltap, reroute to the (optional) dblclick.zoom handler.
          if (g.taps === 2) {
            t = pointer(t, this);
            if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
              var p = select(this).on("dblclick.zoom");
              if (p) p.apply(this, arguments);
            }
          }
        }
      }

      zoom.wheelDelta = function(_) {
        return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom) : wheelDelta;
      };

      zoom.filter = function(_) {
        return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), zoom) : filter;
      };

      zoom.touchable = function(_) {
        return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom) : touchable;
      };

      zoom.extent = function(_) {
        return arguments.length ? (extent = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
      };

      zoom.scaleExtent = function(_) {
        return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
      };

      zoom.translateExtent = function(_) {
        return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
      };

      zoom.constrain = function(_) {
        return arguments.length ? (constrain = _, zoom) : constrain;
      };

      zoom.duration = function(_) {
        return arguments.length ? (duration = +_, zoom) : duration;
      };

      zoom.interpolate = function(_) {
        return arguments.length ? (interpolate = _, zoom) : interpolate;
      };

      zoom.on = function() {
        var value = listeners.on.apply(listeners, arguments);
        return value === listeners ? zoom : value;
      };

      zoom.clickDistance = function(_) {
        return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
      };

      zoom.tapDistance = function(_) {
        return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
      };

      return zoom;
    }

    var d3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        bisect: bisect,
        bisectRight: bisectRight,
        bisectLeft: bisectLeft,
        bisectCenter: bisectCenter,
        ascending: ascending$3,
        bisector: bisector,
        count: count$1,
        cross: cross$2,
        cumsum: cumsum,
        descending: descending$2,
        deviation: deviation,
        extent: extent$1,
        Adder: Adder,
        fsum: fsum,
        fcumsum: fcumsum,
        group: group,
        flatGroup: flatGroup,
        flatRollup: flatRollup,
        groups: groups,
        index: index$4,
        indexes: indexes,
        rollup: rollup,
        rollups: rollups,
        groupSort: groupSort,
        bin: bin,
        histogram: bin,
        thresholdFreedmanDiaconis: thresholdFreedmanDiaconis,
        thresholdScott: thresholdScott,
        thresholdSturges: thresholdSturges,
        max: max$3,
        maxIndex: maxIndex,
        mean: mean,
        median: median,
        merge: merge,
        min: min$2,
        minIndex: minIndex,
        mode: mode,
        nice: nice$1,
        pairs: pairs,
        permute: permute,
        quantile: quantile$1,
        quantileSorted: quantileSorted,
        quickselect: quickselect,
        range: range$2,
        rank: rank,
        least: least,
        leastIndex: leastIndex,
        greatest: greatest,
        greatestIndex: greatestIndex,
        scan: scan,
        shuffle: shuffle$1,
        shuffler: shuffler,
        sum: sum$2,
        ticks: ticks,
        tickIncrement: tickIncrement,
        tickStep: tickStep,
        transpose: transpose,
        variance: variance,
        zip: zip,
        every: every,
        some: some,
        filter: filter$1,
        map: map$1,
        reduce: reduce,
        reverse: reverse$1,
        sort: sort,
        difference: difference,
        disjoint: disjoint,
        intersection: intersection,
        subset: subset,
        superset: superset,
        union: union,
        InternMap: InternMap,
        InternSet: InternSet,
        axisTop: axisTop,
        axisRight: axisRight,
        axisBottom: axisBottom,
        axisLeft: axisLeft,
        brush: brush,
        brushX: brushX,
        brushY: brushY,
        brushSelection: brushSelection,
        chord: chord,
        chordTranspose: chordTranspose,
        chordDirected: chordDirected,
        ribbon: ribbon$1,
        ribbonArrow: ribbonArrow,
        color: color,
        rgb: rgb,
        hsl: hsl$2,
        lab: lab$1,
        hcl: hcl$2,
        lch: lch,
        gray: gray,
        cubehelix: cubehelix$3,
        contours: contours,
        contourDensity: density,
        Delaunay: Delaunay,
        Voronoi: Voronoi,
        dispatch: dispatch,
        drag: drag,
        dragDisable: dragDisable,
        dragEnable: yesdrag,
        dsvFormat: dsvFormat,
        csvParse: csvParse,
        csvParseRows: csvParseRows,
        csvFormat: csvFormat,
        csvFormatBody: csvFormatBody,
        csvFormatRows: csvFormatRows,
        csvFormatRow: csvFormatRow,
        csvFormatValue: csvFormatValue,
        tsvParse: tsvParse,
        tsvParseRows: tsvParseRows,
        tsvFormat: tsvFormat,
        tsvFormatBody: tsvFormatBody,
        tsvFormatRows: tsvFormatRows,
        tsvFormatRow: tsvFormatRow,
        tsvFormatValue: tsvFormatValue,
        autoType: autoType,
        easeLinear: linear$1,
        easeQuad: quadInOut,
        easeQuadIn: quadIn,
        easeQuadOut: quadOut,
        easeQuadInOut: quadInOut,
        easeCubic: cubicInOut,
        easeCubicIn: cubicIn,
        easeCubicOut: cubicOut,
        easeCubicInOut: cubicInOut,
        easePoly: polyInOut,
        easePolyIn: polyIn,
        easePolyOut: polyOut,
        easePolyInOut: polyInOut,
        easeSin: sinInOut,
        easeSinIn: sinIn,
        easeSinOut: sinOut,
        easeSinInOut: sinInOut,
        easeExp: expInOut,
        easeExpIn: expIn,
        easeExpOut: expOut,
        easeExpInOut: expInOut,
        easeCircle: circleInOut,
        easeCircleIn: circleIn,
        easeCircleOut: circleOut,
        easeCircleInOut: circleInOut,
        easeBounce: bounceOut,
        easeBounceIn: bounceIn,
        easeBounceOut: bounceOut,
        easeBounceInOut: bounceInOut,
        easeBack: backInOut,
        easeBackIn: backIn,
        easeBackOut: backOut,
        easeBackInOut: backInOut,
        easeElastic: elasticOut,
        easeElasticIn: elasticIn,
        easeElasticOut: elasticOut,
        easeElasticInOut: elasticInOut,
        blob: blob,
        buffer: buffer,
        dsv: dsv,
        csv: csv,
        tsv: tsv,
        image: image,
        json: json,
        text: text,
        xml: xml,
        html: html,
        svg: svg,
        forceCenter: center,
        forceCollide: collide,
        forceLink: link$2,
        forceManyBody: manyBody,
        forceRadial: radial$1,
        forceSimulation: simulation,
        forceX: x$1,
        forceY: y$1,
        formatDefaultLocale: defaultLocale$2,
        get format () { return format; },
        get formatPrefix () { return formatPrefix; },
        formatLocale: formatLocale$1,
        formatSpecifier: formatSpecifier,
        FormatSpecifier: FormatSpecifier,
        precisionFixed: precisionFixed,
        precisionPrefix: precisionPrefix,
        precisionRound: precisionRound,
        geoArea: area$2,
        geoBounds: bounds,
        geoCentroid: centroid$1,
        geoCircle: circle$2,
        geoClipAntimeridian: clipAntimeridian,
        geoClipCircle: clipCircle,
        geoClipExtent: extent,
        geoClipRectangle: clipRectangle,
        geoContains: contains$1,
        geoDistance: distance,
        geoGraticule: graticule,
        geoGraticule10: graticule10,
        geoInterpolate: interpolate,
        geoLength: length$1,
        geoPath: index$2,
        geoAlbers: albers,
        geoAlbersUsa: albersUsa,
        geoAzimuthalEqualArea: azimuthalEqualArea,
        geoAzimuthalEqualAreaRaw: azimuthalEqualAreaRaw,
        geoAzimuthalEquidistant: azimuthalEquidistant,
        geoAzimuthalEquidistantRaw: azimuthalEquidistantRaw,
        geoConicConformal: conicConformal,
        geoConicConformalRaw: conicConformalRaw,
        geoConicEqualArea: conicEqualArea,
        geoConicEqualAreaRaw: conicEqualAreaRaw,
        geoConicEquidistant: conicEquidistant,
        geoConicEquidistantRaw: conicEquidistantRaw,
        geoEqualEarth: equalEarth,
        geoEqualEarthRaw: equalEarthRaw,
        geoEquirectangular: equirectangular,
        geoEquirectangularRaw: equirectangularRaw,
        geoGnomonic: gnomonic,
        geoGnomonicRaw: gnomonicRaw,
        geoIdentity: identity$4,
        geoProjection: projection,
        geoProjectionMutator: projectionMutator,
        geoMercator: mercator,
        geoMercatorRaw: mercatorRaw,
        geoNaturalEarth1: naturalEarth1,
        geoNaturalEarth1Raw: naturalEarth1Raw,
        geoOrthographic: orthographic,
        geoOrthographicRaw: orthographicRaw,
        geoStereographic: stereographic,
        geoStereographicRaw: stereographicRaw,
        geoTransverseMercator: transverseMercator,
        geoTransverseMercatorRaw: transverseMercatorRaw,
        geoRotation: rotation,
        geoStream: geoStream,
        geoTransform: transform$1,
        cluster: cluster,
        hierarchy: hierarchy,
        Node: Node$1,
        pack: index$1,
        packSiblings: siblings,
        packEnclose: enclose,
        partition: partition,
        stratify: stratify,
        tree: tree,
        treemap: index,
        treemapBinary: binary,
        treemapDice: treemapDice,
        treemapSlice: treemapSlice,
        treemapSliceDice: sliceDice,
        treemapSquarify: squarify,
        treemapResquarify: resquarify,
        interpolate: interpolate$2,
        interpolateArray: array$3,
        interpolateBasis: basis$2,
        interpolateBasisClosed: basisClosed$1,
        interpolateDate: date$1,
        interpolateDiscrete: discrete,
        interpolateHue: hue,
        interpolateNumber: interpolateNumber,
        interpolateNumberArray: numberArray,
        interpolateObject: object$1,
        interpolateRound: interpolateRound,
        interpolateString: interpolateString,
        interpolateTransformCss: interpolateTransformCss,
        interpolateTransformSvg: interpolateTransformSvg,
        interpolateZoom: interpolateZoom,
        interpolateRgb: interpolateRgb,
        interpolateRgbBasis: rgbBasis,
        interpolateRgbBasisClosed: rgbBasisClosed,
        interpolateHsl: hsl$1,
        interpolateHslLong: hslLong,
        interpolateLab: lab,
        interpolateHcl: hcl$1,
        interpolateHclLong: hclLong,
        interpolateCubehelix: cubehelix$2,
        interpolateCubehelixLong: cubehelixLong,
        piecewise: piecewise,
        quantize: quantize$1,
        path: path,
        polygonArea: area$1,
        polygonCentroid: centroid,
        polygonHull: hull,
        polygonContains: contains,
        polygonLength: length,
        quadtree: quadtree,
        randomUniform: uniform,
        randomInt: int$1,
        randomNormal: normal,
        randomLogNormal: logNormal,
        randomBates: bates,
        randomIrwinHall: irwinHall,
        randomExponential: exponential,
        randomPareto: pareto,
        randomBernoulli: bernoulli,
        randomGeometric: geometric,
        randomBinomial: binomial,
        randomGamma: gamma,
        randomBeta: beta,
        randomWeibull: weibull,
        randomCauchy: cauchy,
        randomLogistic: logistic,
        randomPoisson: poisson,
        randomLcg: lcg,
        scaleBand: band,
        scalePoint: point$4,
        scaleIdentity: identity$2,
        scaleLinear: linear,
        scaleLog: log,
        scaleSymlog: symlog,
        scaleOrdinal: ordinal,
        scaleImplicit: implicit,
        scalePow: pow,
        scaleSqrt: sqrt$1,
        scaleRadial: radial,
        scaleQuantile: quantile,
        scaleQuantize: quantize,
        scaleThreshold: threshold,
        scaleTime: time,
        scaleUtc: utcTime,
        scaleSequential: sequential,
        scaleSequentialLog: sequentialLog,
        scaleSequentialPow: sequentialPow,
        scaleSequentialSqrt: sequentialSqrt,
        scaleSequentialSymlog: sequentialSymlog,
        scaleSequentialQuantile: sequentialQuantile,
        scaleDiverging: diverging$1,
        scaleDivergingLog: divergingLog,
        scaleDivergingPow: divergingPow,
        scaleDivergingSqrt: divergingSqrt,
        scaleDivergingSymlog: divergingSymlog,
        tickFormat: tickFormat,
        schemeCategory10: category10,
        schemeAccent: Accent,
        schemeDark2: Dark2,
        schemePaired: Paired,
        schemePastel1: Pastel1,
        schemePastel2: Pastel2,
        schemeSet1: Set1,
        schemeSet2: Set2,
        schemeSet3: Set3,
        schemeTableau10: Tableau10,
        interpolateBrBG: BrBG,
        schemeBrBG: scheme$q,
        interpolatePRGn: PRGn,
        schemePRGn: scheme$p,
        interpolatePiYG: PiYG,
        schemePiYG: scheme$o,
        interpolatePuOr: PuOr,
        schemePuOr: scheme$n,
        interpolateRdBu: RdBu,
        schemeRdBu: scheme$m,
        interpolateRdGy: RdGy,
        schemeRdGy: scheme$l,
        interpolateRdYlBu: RdYlBu,
        schemeRdYlBu: scheme$k,
        interpolateRdYlGn: RdYlGn,
        schemeRdYlGn: scheme$j,
        interpolateSpectral: Spectral,
        schemeSpectral: scheme$i,
        interpolateBuGn: BuGn,
        schemeBuGn: scheme$h,
        interpolateBuPu: BuPu,
        schemeBuPu: scheme$g,
        interpolateGnBu: GnBu,
        schemeGnBu: scheme$f,
        interpolateOrRd: OrRd,
        schemeOrRd: scheme$e,
        interpolatePuBuGn: PuBuGn,
        schemePuBuGn: scheme$d,
        interpolatePuBu: PuBu,
        schemePuBu: scheme$c,
        interpolatePuRd: PuRd,
        schemePuRd: scheme$b,
        interpolateRdPu: RdPu,
        schemeRdPu: scheme$a,
        interpolateYlGnBu: YlGnBu,
        schemeYlGnBu: scheme$9,
        interpolateYlGn: YlGn,
        schemeYlGn: scheme$8,
        interpolateYlOrBr: YlOrBr,
        schemeYlOrBr: scheme$7,
        interpolateYlOrRd: YlOrRd,
        schemeYlOrRd: scheme$6,
        interpolateBlues: Blues,
        schemeBlues: scheme$5,
        interpolateGreens: Greens,
        schemeGreens: scheme$4,
        interpolateGreys: Greys,
        schemeGreys: scheme$3,
        interpolatePurples: Purples,
        schemePurples: scheme$2,
        interpolateReds: Reds,
        schemeReds: scheme$1,
        interpolateOranges: Oranges,
        schemeOranges: scheme,
        interpolateCividis: cividis,
        interpolateCubehelixDefault: cubehelix,
        interpolateRainbow: rainbow,
        interpolateWarm: warm,
        interpolateCool: cool,
        interpolateSinebow: sinebow,
        interpolateTurbo: turbo,
        interpolateViridis: viridis,
        interpolateMagma: magma,
        interpolateInferno: inferno,
        interpolatePlasma: plasma,
        create: create$1,
        creator: creator,
        local: local$1,
        matcher: matcher,
        namespace: namespace,
        namespaces: namespaces,
        pointer: pointer,
        pointers: pointers,
        select: select,
        selectAll: selectAll,
        selection: selection,
        selector: selector,
        selectorAll: selectorAll,
        style: styleValue,
        window: defaultView,
        arc: arc,
        area: area,
        line: line,
        pie: pie,
        areaRadial: areaRadial,
        radialArea: areaRadial,
        lineRadial: lineRadial$1,
        radialLine: lineRadial$1,
        pointRadial: pointRadial,
        linkHorizontal: linkHorizontal,
        linkVertical: linkVertical,
        linkRadial: linkRadial,
        symbol: symbol,
        symbols: symbols,
        symbolCircle: circle,
        symbolCross: cross,
        symbolDiamond: diamond,
        symbolSquare: square,
        symbolStar: star,
        symbolTriangle: triangle,
        symbolWye: wye,
        curveBasisClosed: basisClosed,
        curveBasisOpen: basisOpen,
        curveBasis: basis,
        curveBumpX: bumpX,
        curveBumpY: bumpY,
        curveBundle: bundle,
        curveCardinalClosed: cardinalClosed,
        curveCardinalOpen: cardinalOpen,
        curveCardinal: cardinal,
        curveCatmullRomClosed: catmullRomClosed,
        curveCatmullRomOpen: catmullRomOpen,
        curveCatmullRom: catmullRom,
        curveLinearClosed: linearClosed,
        curveLinear: curveLinear,
        curveMonotoneX: monotoneX,
        curveMonotoneY: monotoneY,
        curveNatural: natural,
        curveStep: step,
        curveStepAfter: stepAfter,
        curveStepBefore: stepBefore,
        stack: stack,
        stackOffsetExpand: expand,
        stackOffsetDiverging: diverging,
        stackOffsetNone: none$1,
        stackOffsetSilhouette: silhouette,
        stackOffsetWiggle: wiggle,
        stackOrderAppearance: appearance,
        stackOrderAscending: ascending,
        stackOrderDescending: descending,
        stackOrderInsideOut: insideOut,
        stackOrderNone: none,
        stackOrderReverse: reverse,
        timeInterval: newInterval,
        timeMillisecond: millisecond$1,
        timeMilliseconds: milliseconds,
        utcMillisecond: millisecond$1,
        utcMilliseconds: milliseconds,
        timeSecond: utcSecond,
        timeSeconds: seconds,
        utcSecond: utcSecond,
        utcSeconds: seconds,
        timeMinute: timeMinute,
        timeMinutes: minutes,
        timeHour: timeHour,
        timeHours: hours,
        timeDay: timeDay,
        timeDays: days,
        timeWeek: sunday,
        timeWeeks: sundays,
        timeSunday: sunday,
        timeSundays: sundays,
        timeMonday: monday,
        timeMondays: mondays,
        timeTuesday: tuesday,
        timeTuesdays: tuesdays,
        timeWednesday: wednesday,
        timeWednesdays: wednesdays,
        timeThursday: thursday,
        timeThursdays: thursdays,
        timeFriday: friday,
        timeFridays: fridays,
        timeSaturday: saturday,
        timeSaturdays: saturdays,
        timeMonth: timeMonth,
        timeMonths: months$1,
        timeYear: timeYear,
        timeYears: years,
        utcMinute: utcMinute$1,
        utcMinutes: utcMinutes,
        utcHour: utcHour$1,
        utcHours: utcHours,
        utcDay: utcDay$1,
        utcDays: utcDays,
        utcWeek: utcSunday,
        utcWeeks: utcSundays,
        utcSunday: utcSunday,
        utcSundays: utcSundays,
        utcMonday: utcMonday,
        utcMondays: utcMondays,
        utcTuesday: utcTuesday,
        utcTuesdays: utcTuesdays,
        utcWednesday: utcWednesday,
        utcWednesdays: utcWednesdays,
        utcThursday: utcThursday,
        utcThursdays: utcThursdays,
        utcFriday: utcFriday,
        utcFridays: utcFridays,
        utcSaturday: utcSaturday,
        utcSaturdays: utcSaturdays,
        utcMonth: utcMonth$1,
        utcMonths: utcMonths,
        utcYear: utcYear$1,
        utcYears: utcYears,
        utcTicks: utcTicks,
        utcTickInterval: utcTickInterval,
        timeTicks: timeTicks,
        timeTickInterval: timeTickInterval,
        timeFormatDefaultLocale: defaultLocale$1,
        get timeFormat () { return timeFormat; },
        get timeParse () { return timeParse; },
        get utcFormat () { return utcFormat; },
        get utcParse () { return utcParse; },
        timeFormatLocale: formatLocale,
        isoFormat: formatIso$1,
        isoParse: parseIso$1,
        now: now$1,
        timer: timer,
        timerFlush: timerFlush,
        timeout: timeout,
        interval: interval,
        transition: transition,
        active: active,
        interrupt: interrupt,
        zoom: zoom,
        zoomTransform: transform,
        zoomIdentity: identity,
        ZoomTransform: Transform
    });

    /* src/components/RunChart.svelte generated by Svelte v3.43.2 */
    const file$7 = "src/components/RunChart.svelte";

    function create_fragment$7(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "chart");
    			attr_dev(div, "class", "svelte-lk3kdn");
    			add_location(div, file$7, 63, 0, 2060);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[2](div);
    		},
    		p: noop$4,
    		i: noop$4,
    		o: noop$4,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RunChart', slots, []);
    	let { run } = $$props;
    	let chartDiv;
    	const margin = { top: 10, right: 30, bottom: 30, left: 30 };

    	afterUpdate(() => {
    		const width = chartDiv.offsetWidth - margin.left - margin.right;
    		const height = 300 - margin.top - margin.bottom;
    		select('#chart > *').remove();
    		var svg = select("#chart").append("svg").attr("width", width).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    		// x-axis
    		var x = linear().domain(extent$1(run.data, t => t.time)).range([0, width]);

    		svg.append("g").attr("transform", "translate(0," + height + ")").call(axisBottom(x).tickFormat(t => `${(t - t % 60) / 60}:${t % 60}`));

    		// y-axis
    		const y = linear().domain([0, max$3(run.data, t => t.speed)]).range([height, 0]);

    		svg.append("g").call(axisLeft(y));

    		svg.append('path').datum(run.data).attr('stroke', 'black').attr('fill', 'none').attr("d", line().x(function (d) {
    			return x(d.time);
    		}).y(function (d) {
    			return y(d.speed);
    		}));

    		svg.append('rect').attr('x', x(run.maxRectangle.start)).attr('y', y(run.maxRectangle.height)).attr('width', x(run.maxRectangle.end - run.maxRectangle.start)).attr('height', y(0) - y(run.maxRectangle.height)).attr('stroke', 'white').attr('fill', '#69a3b2');
    		const bestMileAverageSpeed = 3600.0 / run.bestMile.mileTime;
    		svg.append('rect').attr('x', x(run.bestMile.left)).attr('y', y(bestMileAverageSpeed)).attr('width', x(run.bestMile.right - run.bestMile.left)).attr('height', y(0) - y(bestMileAverageSpeed)).attr('stroke', '888888').attr('fill', '#44444488');
    	});

    	const writable_props = ['run'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RunChart> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			chartDiv = $$value;
    			$$invalidate(0, chartDiv);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('run' in $$props) $$invalidate(1, run = $$props.run);
    	};

    	$$self.$capture_state = () => ({
    		d3,
    		onMount,
    		afterUpdate,
    		run,
    		chartDiv,
    		margin
    	});

    	$$self.$inject_state = $$props => {
    		if ('run' in $$props) $$invalidate(1, run = $$props.run);
    		if ('chartDiv' in $$props) $$invalidate(0, chartDiv = $$props.chartDiv);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [chartDiv, run, div_binding];
    }

    class RunChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal, { run: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RunChart",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*run*/ ctx[1] === undefined && !('run' in props)) {
    			console.warn("<RunChart> was created without expected prop 'run'");
    		}
    	}

    	get run() {
    		throw new Error("<RunChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set run(value) {
    		throw new Error("<RunChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function pad(num, size) {
        let s = num.toString();
        while (s.length < size)
            s = "0" + s;
        return s;
    }
    const durationString = function (input) {
        if (!input)
            return '0:00';
        const seconds = Math.round(input);
        const s = seconds % 60;
        const m = ((seconds - s) / 60) % 60;
        const h = (seconds - s - 60 * m) / 3600;
        if (h > 0) {
            return `${h}:${pad(m, 2)}:${pad(s, 2)}`;
        }
        else {
            return `${m}:${pad(s, 2)}`;
        }
    };

    /* src/components/Run.svelte generated by Svelte v3.43.2 */
    const file$6 = "src/components/Run.svelte";

    function create_fragment$6(ctx) {
    	let div21;
    	let h2;
    	let t0;
    	let t1;
    	let div20;
    	let div9;
    	let div2;
    	let div0;
    	let div1;
    	let t3;
    	let t4;
    	let div5;
    	let div3;
    	let div4;
    	let t6;
    	let t7;
    	let div8;
    	let div6;
    	let div7;
    	let t9;
    	let t10;
    	let div19;
    	let div12;
    	let div10;
    	let div11;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let div15;
    	let div13;
    	let div14;
    	let t18;
    	let t19;
    	let div18;
    	let div16;
    	let div17;
    	let t21;
    	let t22;
    	let runchart;
    	let current;

    	runchart = new RunChart({
    			props: { run: /*run*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div21 = element("div");
    			h2 = element("h2");
    			t0 = text$1(/*startTime*/ ctx[4]);
    			t1 = space();
    			div20 = element("div");
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Distance:";
    			div1 = element("div");
    			t3 = text$1(/*runDistance*/ ctx[1]);
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "Time:";
    			div4 = element("div");
    			t6 = text$1(/*runDuration*/ ctx[8]);
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			div6.textContent = "Speed:";
    			div7 = element("div");
    			t9 = text$1(/*runSpeed*/ ctx[7]);
    			t10 = space();
    			div19 = element("div");
    			div12 = element("div");
    			div10 = element("div");
    			div10.textContent = "Fastest Mile:";
    			div11 = element("div");
    			t12 = text$1(/*fastestMileTime*/ ctx[6]);
    			t13 = text$1(" / ");
    			t14 = text$1(/*fastestMileSpeed*/ ctx[5]);
    			t15 = text$1(" mph");
    			t16 = space();
    			div15 = element("div");
    			div13 = element("div");
    			div13.textContent = "Largest rect:";
    			div14 = element("div");
    			t18 = text$1(/*largestRect*/ ctx[3]);
    			t19 = space();
    			div18 = element("div");
    			div16 = element("div");
    			div16.textContent = "Calories";
    			div17 = element("div");
    			t21 = text$1(/*calories*/ ctx[2]);
    			t22 = space();
    			create_component(runchart.$$.fragment);
    			attr_dev(h2, "class", "title svelte-16r6onq");
    			add_location(h2, file$6, 23, 2, 1014);
    			attr_dev(div0, "class", "label svelte-16r6onq");
    			add_location(div0, file$6, 27, 8, 1136);
    			attr_dev(div1, "class", "data-content svelte-16r6onq");
    			add_location(div1, file$6, 27, 42, 1170);
    			attr_dev(div2, "class", "stat svelte-16r6onq");
    			add_location(div2, file$6, 26, 6, 1109);
    			attr_dev(div3, "class", "label svelte-16r6onq");
    			add_location(div3, file$6, 30, 8, 1263);
    			attr_dev(div4, "class", "data-content svelte-16r6onq");
    			add_location(div4, file$6, 30, 38, 1293);
    			attr_dev(div5, "class", "stat svelte-16r6onq");
    			add_location(div5, file$6, 29, 6, 1236);
    			attr_dev(div6, "class", "label svelte-16r6onq");
    			add_location(div6, file$6, 33, 8, 1386);
    			attr_dev(div7, "class", "data-content svelte-16r6onq");
    			add_location(div7, file$6, 33, 39, 1417);
    			attr_dev(div8, "class", "stat svelte-16r6onq");
    			add_location(div8, file$6, 32, 6, 1359);
    			attr_dev(div9, "class", "column svelte-16r6onq");
    			add_location(div9, file$6, 25, 4, 1082);
    			attr_dev(div10, "class", "label svelte-16r6onq");
    			add_location(div10, file$6, 38, 8, 1543);
    			attr_dev(div11, "class", "data-content svelte-16r6onq");
    			add_location(div11, file$6, 38, 46, 1581);
    			attr_dev(div12, "class", "stat svelte-16r6onq");
    			add_location(div12, file$6, 37, 6, 1516);
    			attr_dev(div13, "class", "label svelte-16r6onq");
    			add_location(div13, file$6, 41, 8, 1704);
    			attr_dev(div14, "class", "data-content svelte-16r6onq");
    			add_location(div14, file$6, 41, 46, 1742);
    			attr_dev(div15, "class", "stat svelte-16r6onq");
    			add_location(div15, file$6, 40, 6, 1677);
    			attr_dev(div16, "class", "label svelte-16r6onq");
    			add_location(div16, file$6, 44, 8, 1835);
    			attr_dev(div17, "class", "data-content svelte-16r6onq");
    			add_location(div17, file$6, 44, 41, 1868);
    			attr_dev(div18, "class", "stat svelte-16r6onq");
    			add_location(div18, file$6, 43, 6, 1808);
    			attr_dev(div19, "class", "column svelte-16r6onq");
    			add_location(div19, file$6, 36, 4, 1489);
    			attr_dev(div20, "class", "metadata row svelte-16r6onq");
    			add_location(div20, file$6, 24, 2, 1051);
    			attr_dev(div21, "class", "run-container svelte-16r6onq");
    			add_location(div21, file$6, 22, 0, 984);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div21, anchor);
    			append_dev(div21, h2);
    			append_dev(h2, t0);
    			append_dev(div21, t1);
    			append_dev(div21, div20);
    			append_dev(div20, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div9, t4);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div5, div4);
    			append_dev(div4, t6);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div8, div7);
    			append_dev(div7, t9);
    			append_dev(div20, t10);
    			append_dev(div20, div19);
    			append_dev(div19, div12);
    			append_dev(div12, div10);
    			append_dev(div12, div11);
    			append_dev(div11, t12);
    			append_dev(div11, t13);
    			append_dev(div11, t14);
    			append_dev(div11, t15);
    			append_dev(div19, t16);
    			append_dev(div19, div15);
    			append_dev(div15, div13);
    			append_dev(div15, div14);
    			append_dev(div14, t18);
    			append_dev(div19, t19);
    			append_dev(div19, div18);
    			append_dev(div18, div16);
    			append_dev(div18, div17);
    			append_dev(div17, t21);
    			append_dev(div21, t22);
    			mount_component(runchart, div21, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*startTime*/ 16) set_data_dev(t0, /*startTime*/ ctx[4]);
    			if (!current || dirty & /*runDistance*/ 2) set_data_dev(t3, /*runDistance*/ ctx[1]);
    			if (!current || dirty & /*runDuration*/ 256) set_data_dev(t6, /*runDuration*/ ctx[8]);
    			if (!current || dirty & /*runSpeed*/ 128) set_data_dev(t9, /*runSpeed*/ ctx[7]);
    			if (!current || dirty & /*fastestMileTime*/ 64) set_data_dev(t12, /*fastestMileTime*/ ctx[6]);
    			if (!current || dirty & /*fastestMileSpeed*/ 32) set_data_dev(t14, /*fastestMileSpeed*/ ctx[5]);
    			if (!current || dirty & /*largestRect*/ 8) set_data_dev(t18, /*largestRect*/ ctx[3]);
    			if (!current || dirty & /*calories*/ 4) set_data_dev(t21, /*calories*/ ctx[2]);
    			const runchart_changes = {};
    			if (dirty & /*run*/ 1) runchart_changes.run = /*run*/ ctx[0];
    			runchart.$set(runchart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(runchart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(runchart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div21);
    			destroy_component(runchart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let runDistance;
    	let runDuration;
    	let runSpeed;
    	let fastestMileTime;
    	let fastestMileSpeed;
    	let startTime;
    	let largestRect;
    	let calories;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Run', slots, []);
    	let { run = {} } = $$props;

    	const calculateDisplayTime = time => {
    		const res = new Date(0);
    		res.setUTCSeconds(time / 1000);
    		return res.toDateString() + ' ' + res.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    	};

    	const writable_props = ['run'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Run> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('run' in $$props) $$invalidate(0, run = $$props.run);
    	};

    	$$self.$capture_state = () => ({
    		RunChart,
    		durationString,
    		run,
    		calculateDisplayTime,
    		calories,
    		largestRect,
    		startTime,
    		fastestMileSpeed,
    		fastestMileTime,
    		runDistance,
    		runSpeed,
    		runDuration
    	});

    	$$self.$inject_state = $$props => {
    		if ('run' in $$props) $$invalidate(0, run = $$props.run);
    		if ('calories' in $$props) $$invalidate(2, calories = $$props.calories);
    		if ('largestRect' in $$props) $$invalidate(3, largestRect = $$props.largestRect);
    		if ('startTime' in $$props) $$invalidate(4, startTime = $$props.startTime);
    		if ('fastestMileSpeed' in $$props) $$invalidate(5, fastestMileSpeed = $$props.fastestMileSpeed);
    		if ('fastestMileTime' in $$props) $$invalidate(6, fastestMileTime = $$props.fastestMileTime);
    		if ('runDistance' in $$props) $$invalidate(1, runDistance = $$props.runDistance);
    		if ('runSpeed' in $$props) $$invalidate(7, runSpeed = $$props.runSpeed);
    		if ('runDuration' in $$props) $$invalidate(8, runDuration = $$props.runDuration);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*run*/ 1) {
    			$$invalidate(1, runDistance = run.data[run.data.length - 1].distance.toFixed(3));
    		}

    		if ($$self.$$.dirty & /*run*/ 1) {
    			$$invalidate(8, runDuration = durationString(run.data[run.data.length - 1].time));
    		}

    		if ($$self.$$.dirty & /*runDistance, run*/ 3) {
    			$$invalidate(7, runSpeed = (runDistance / run.data[run.data.length - 1].time * 3600).toFixed(3) + ' mph');
    		}

    		if ($$self.$$.dirty & /*run*/ 1) {
    			$$invalidate(6, fastestMileTime = durationString(run.bestMile.mileTime));
    		}

    		if ($$self.$$.dirty & /*run*/ 1) {
    			$$invalidate(5, fastestMileSpeed = (3600.0 / run.bestMile.mileTime).toFixed(2));
    		}

    		if ($$self.$$.dirty & /*run*/ 1) {
    			$$invalidate(4, startTime = calculateDisplayTime(run.startTime));
    		}

    		if ($$self.$$.dirty & /*run*/ 1) {
    			$$invalidate(3, largestRect = `${(run.maxRectangle.area / 3600).toFixed(2)}, ${durationString(run.maxRectangle.end - run.maxRectangle.start)} * ${run.maxRectangle.height.toFixed(2)}`);
    		}

    		if ($$self.$$.dirty & /*run*/ 1) {
    			$$invalidate(2, calories = run.totalCalories?.toFixed(0));
    		}
    	};

    	return [
    		run,
    		runDistance,
    		calories,
    		largestRect,
    		startTime,
    		fastestMileSpeed,
    		fastestMileTime,
    		runSpeed,
    		runDuration
    	];
    }

    class Run extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal, { run: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Run",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get run() {
    		throw new Error("<Run>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set run(value) {
    		throw new Error("<Run>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/RunSelectorButton.svelte generated by Svelte v3.43.2 */
    const file$5 = "src/components/RunSelectorButton.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let h3;
    	let t1;
    	let p0;
    	let t2;
    	let t3_value = /*run*/ ctx[0].totalDistance.toFixed(2) + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9_value = /*run*/ ctx[0].totalCalories.toFixed(0) + "";
    	let t9;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = `${/*date*/ ctx[3]()}`;
    			t1 = space();
    			p0 = element("p");
    			t2 = text$1("dist: ");
    			t3 = text$1(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text$1("time: ");
    			t6 = text$1(/*runDuration*/ ctx[2]);
    			t7 = space();
    			p2 = element("p");
    			t8 = text$1("cals: ");
    			t9 = text$1(t9_value);
    			attr_dev(h3, "class", "svelte-1hrzupx");
    			add_location(h3, file$5, 22, 7, 635);
    			attr_dev(p0, "class", "svelte-1hrzupx");
    			add_location(p0, file$5, 23, 7, 660);
    			attr_dev(p1, "class", "svelte-1hrzupx");
    			add_location(p1, file$5, 24, 7, 711);
    			attr_dev(p2, "class", "svelte-1hrzupx");
    			add_location(p2, file$5, 25, 7, 745);
    			attr_dev(button, "class", button_class_value = "run-button " + (/*selected*/ ctx[1] ? 'selected' : '') + " svelte-1hrzupx");
    			add_location(button, file$5, 20, 0, 532);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, h3);
    			append_dev(button, t1);
    			append_dev(button, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(button, t4);
    			append_dev(button, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(button, t7);
    			append_dev(button, p2);
    			append_dev(p2, t8);
    			append_dev(p2, t9);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*run*/ 1 && t3_value !== (t3_value = /*run*/ ctx[0].totalDistance.toFixed(2) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*runDuration*/ 4) set_data_dev(t6, /*runDuration*/ ctx[2]);
    			if (dirty & /*run*/ 1 && t9_value !== (t9_value = /*run*/ ctx[0].totalCalories.toFixed(0) + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*selected*/ 2 && button_class_value !== (button_class_value = "run-button " + (/*selected*/ ctx[1] ? 'selected' : '') + " svelte-1hrzupx")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop$4,
    		o: noop$4,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let runDuration;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RunSelectorButton', slots, []);
    	let { run, selected, clickHandler } = $$props;

    	const date = () => {
    		const timestamp = run.runId.split('-')[1].split('.')[0];
    		const date = new Date(0);
    		date.setUTCSeconds(timestamp / 1000);

    		const options = {
    			weekday: 'short',
    			month: 'short',
    			day: 'numeric',
    			year: 'numeric'
    		};

    		return date.toLocaleDateString('en-US', options);
    	};

    	const activateRun = () => {
    		clickHandler(run);
    	};

    	const writable_props = ['run', 'selected', 'clickHandler'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RunSelectorButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => activateRun();

    	$$self.$$set = $$props => {
    		if ('run' in $$props) $$invalidate(0, run = $$props.run);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('clickHandler' in $$props) $$invalidate(5, clickHandler = $$props.clickHandler);
    	};

    	$$self.$capture_state = () => ({
    		durationString,
    		run,
    		selected,
    		clickHandler,
    		date,
    		activateRun,
    		runDuration
    	});

    	$$self.$inject_state = $$props => {
    		if ('run' in $$props) $$invalidate(0, run = $$props.run);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('clickHandler' in $$props) $$invalidate(5, clickHandler = $$props.clickHandler);
    		if ('runDuration' in $$props) $$invalidate(2, runDuration = $$props.runDuration);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*run*/ 1) {
    			$$invalidate(2, runDuration = durationString(run.totalTime));
    		}
    	};

    	return [run, selected, runDuration, date, activateRun, clickHandler, click_handler];
    }

    class RunSelectorButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal, { run: 0, selected: 1, clickHandler: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RunSelectorButton",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*run*/ ctx[0] === undefined && !('run' in props)) {
    			console.warn("<RunSelectorButton> was created without expected prop 'run'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !('selected' in props)) {
    			console.warn("<RunSelectorButton> was created without expected prop 'selected'");
    		}

    		if (/*clickHandler*/ ctx[5] === undefined && !('clickHandler' in props)) {
    			console.warn("<RunSelectorButton> was created without expected prop 'clickHandler'");
    		}
    	}

    	get run() {
    		throw new Error("<RunSelectorButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set run(value) {
    		throw new Error("<RunSelectorButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<RunSelectorButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<RunSelectorButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickHandler() {
    		throw new Error("<RunSelectorButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickHandler(value) {
    		throw new Error("<RunSelectorButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const API_BASE = 'https://runner.arikardasis.com';

    var api = {
        reprocessAllRuns: async function (runId) {
        },
        processRun: async function (runId) {
            const url = `${API_BASE}/process_run?bucketName=arikardasis-runs&objectKey=${runId}.json`;
            const res = await fetch(url);
            return res.json();
        },
        getRunData: async function (runId) {
            if (runId === '')
                return null;
            const res = (await fetch(`${API_BASE}/run_data/${runId}`));
            return res.json();
        },
        getRuns: async function () {
            const res = await fetch(`${API_BASE}/runs`);
            return (await res.json()).Items;
        }
    };

    /* src/components/RunSelector.svelte generated by Svelte v3.43.2 */
    const file$4 = "src/components/RunSelector.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (32:4) {#each runs as run (run)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let runselectorbutton;
    	let current;

    	runselectorbutton = new RunSelectorButton({
    			props: {
    				run: /*run*/ ctx[6],
    				clickHandler: /*runClickedHandler*/ ctx[3],
    				selected: /*selectedRun*/ ctx[0] == /*run*/ ctx[6].runId
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty$3();
    			create_component(runselectorbutton.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(runselectorbutton, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const runselectorbutton_changes = {};
    			if (dirty & /*runs*/ 2) runselectorbutton_changes.run = /*run*/ ctx[6];
    			if (dirty & /*selectedRun, runs*/ 3) runselectorbutton_changes.selected = /*selectedRun*/ ctx[0] == /*run*/ ctx[6].runId;
    			runselectorbutton.$set(runselectorbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(runselectorbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(runselectorbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(runselectorbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:4) {#each runs as run (run)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let button;
    	let t1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*runs*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*run*/ ctx[6];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Refresh";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(button, file$4, 28, 2, 602);
    			attr_dev(div0, "class", "run-list svelte-1amfgc2");
    			add_location(div0, file$4, 30, 2, 663);
    			attr_dev(div1, "class", "container svelte-1amfgc2");
    			add_location(div1, file$4, 27, 0, 576);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*runs, runClickedHandler, selectedRun*/ 11) {
    				each_value = /*runs*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RunSelector', slots, []);
    	let { selectedRun = '' } = $$props;
    	let { runs = [] } = $$props;

    	const activateRun = runId => {
    		$$invalidate(0, selectedRun = runId);
    	};

    	onMount(async () => {
    		$$invalidate(1, runs = await api.getRuns());
    		runs.sort((a, b) => b.startTime - a.startTime);
    		activateRun(runs[0].runId);
    	});

    	const refreshData = async () => {
    		await api.reproessAllRuns();
    	};

    	const runClickedHandler = run => {
    		$$invalidate(0, selectedRun = run.runId);
    	};

    	const writable_props = ['selectedRun', 'runs'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RunSelector> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => refreshData();

    	$$self.$$set = $$props => {
    		if ('selectedRun' in $$props) $$invalidate(0, selectedRun = $$props.selectedRun);
    		if ('runs' in $$props) $$invalidate(1, runs = $$props.runs);
    	};

    	$$self.$capture_state = () => ({
    		RunSelectorButton,
    		api,
    		onMount,
    		selectedRun,
    		runs,
    		activateRun,
    		refreshData,
    		runClickedHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedRun' in $$props) $$invalidate(0, selectedRun = $$props.selectedRun);
    		if ('runs' in $$props) $$invalidate(1, runs = $$props.runs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedRun, runs, refreshData, runClickedHandler, click_handler];
    }

    class RunSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal, { selectedRun: 0, runs: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RunSelector",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get selectedRun() {
    		throw new Error("<RunSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedRun(value) {
    		throw new Error("<RunSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get runs() {
    		throw new Error("<RunSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set runs(value) {
    		throw new Error("<RunSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Explorer.svelte generated by Svelte v3.43.2 */

    const { Object: Object_1$1 } = globals;
    const file$3 = "src/components/Explorer.svelte";

    // (16:2) {#if run}
    function create_if_block$2(ctx) {
    	let run_1;
    	let current;

    	run_1 = new Run({
    			props: { run: /*run*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(run_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(run_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const run_1_changes = {};
    			if (dirty & /*run*/ 4) run_1_changes.run = /*run*/ ctx[2];
    			run_1.$set(run_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(run_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(run_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(run_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(16:2) {#if run}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let runselector;
    	let updating_selectedRun;
    	let updating_runs;
    	let t;
    	let current;

    	function runselector_selectedRun_binding(value) {
    		/*runselector_selectedRun_binding*/ ctx[3](value);
    	}

    	function runselector_runs_binding(value) {
    		/*runselector_runs_binding*/ ctx[4](value);
    	}

    	let runselector_props = {};

    	if (/*activeRunName*/ ctx[0] !== void 0) {
    		runselector_props.selectedRun = /*activeRunName*/ ctx[0];
    	}

    	if (/*runs*/ ctx[1] !== void 0) {
    		runselector_props.runs = /*runs*/ ctx[1];
    	}

    	runselector = new RunSelector({ props: runselector_props, $$inline: true });
    	binding_callbacks.push(() => bind(runselector, 'selectedRun', runselector_selectedRun_binding));
    	binding_callbacks.push(() => bind(runselector, 'runs', runselector_runs_binding));
    	let if_block = /*run*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(runselector.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "explorer-container svelte-cgyeme");
    			add_location(div, file$3, 13, 0, 388);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(runselector, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const runselector_changes = {};

    			if (!updating_selectedRun && dirty & /*activeRunName*/ 1) {
    				updating_selectedRun = true;
    				runselector_changes.selectedRun = /*activeRunName*/ ctx[0];
    				add_flush_callback(() => updating_selectedRun = false);
    			}

    			if (!updating_runs && dirty & /*runs*/ 2) {
    				updating_runs = true;
    				runselector_changes.runs = /*runs*/ ctx[1];
    				add_flush_callback(() => updating_runs = false);
    			}

    			runselector.$set(runselector_changes);

    			if (/*run*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*run*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(runselector.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(runselector.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(runselector);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Explorer', slots, []);
    	let activeRunName = '';
    	let runs = [];
    	let run = null;
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Explorer> was created with unknown prop '${key}'`);
    	});

    	function runselector_selectedRun_binding(value) {
    		activeRunName = value;
    		$$invalidate(0, activeRunName);
    	}

    	function runselector_runs_binding(value) {
    		runs = value;
    		$$invalidate(1, runs);
    	}

    	$$self.$capture_state = () => ({
    		Run,
    		RunSelector,
    		api,
    		activeRunName,
    		runs,
    		run
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeRunName' in $$props) $$invalidate(0, activeRunName = $$props.activeRunName);
    		if ('runs' in $$props) $$invalidate(1, runs = $$props.runs);
    		if ('run' in $$props) $$invalidate(2, run = $$props.run);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*activeRunName, runs*/ 3) {
    			api.getRunData(activeRunName).then(res => {
    				if (!res) return null;
    				$$invalidate(2, run = Object.assign(Object.assign({}, runs.find(run => run.runId === activeRunName)), { data: res }));
    			});
    		}
    	};

    	return [
    		activeRunName,
    		runs,
    		run,
    		runselector_selectedRun_binding,
    		runselector_runs_binding
    	];
    }

    class Explorer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Explorer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/TrendChart.svelte generated by Svelte v3.43.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$2 = "src/components/TrendChart.svelte";

    function create_fragment$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "chart");
    			attr_dev(div, "class", "svelte-m38tn0");
    			add_location(div, file$2, 63, 0, 2185);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[2](div);
    		},
    		p: noop$4,
    		i: noop$4,
    		o: noop$4,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TrendChart', slots, []);
    	let { data } = $$props;
    	let chartDiv;
    	const margin = { top: 10, right: 30, bottom: 30, left: 30 };

    	afterUpdate(() => {
    		const width = chartDiv.offsetWidth - margin.left - margin.right;
    		const height = 800 - margin.top - margin.bottom;
    		select('#chart > *').remove();
    		var svg = select("#chart").append("svg").attr("width", width).attr("height", height + margin.top + margin.bottom).attr('stroke', 'white').attr('fill', '#dddddd').append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    		// x-axis
    		var x = linear().domain(extent$1(data.runs, r => r.startTime)).range([0, width]);

    		console.log(Object.values(data.weeks).map(w => x(w.weekStart.toMillis())));
    		svg.append("g").attr("transform", "translate(0," + height + ")").call(axisBottom(x).tickValues(Object.values(data.weeks).map(w => w.weekStart.toMillis())).tickFormat(timeFormat('%x')));

    		// y-axis
    		const y = linear().domain([0, max$3(data.runs, r => r.totalDistance)]).range([height, 0]);

    		svg.append("g").call(axisLeft(y));

    		for (let key in data.weeks) {
    			const week = data.weeks[key];
    			const weekStart = week.weekStart;
    			const weekEnd = weekStart.plus({ days: 7 });
    			const rectX = max$3([x(weekStart.toMillis()), x(data.runs[0].startTime)]);
    			const rectWidth = x(weekEnd.toMillis()) - rectX;
    			svg.append('rect').attr('x', rectX).attr('y', y(week.distance / 7)).attr('width', rectWidth).attr('height', y(0) - y(week.distance / 7)).attr('stroke', 'white').attr('fill', '#555');
    		}

    		svg.append('path').datum(data.runs).attr('stroke', 'red').attr('fill', 'none').attr("d", line().x(function (d) {
    			return x(d.startTime);
    		}).y(function (d) {
    			return y(d.totalDistance);
    		}));
    	});

    	const writable_props = ['data'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<TrendChart> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			chartDiv = $$value;
    			$$invalidate(0, chartDiv);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ d3, afterUpdate, data, chartDiv, margin });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('chartDiv' in $$props) $$invalidate(0, chartDiv = $$props.chartDiv);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [chartDiv, data, div_binding];
    }

    class TrendChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, { data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TrendChart",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[1] === undefined && !('data' in props)) {
    			console_1.warn("<TrendChart> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<TrendChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<TrendChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
      return Constructor;
    }

    function _extends() {
      _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }

        return target;
      };

      return _extends.apply(this, arguments);
    }

    function _inheritsLoose(subClass, superClass) {
      subClass.prototype = Object.create(superClass.prototype);
      subClass.prototype.constructor = subClass;

      _setPrototypeOf(subClass, superClass);
    }

    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };

      return _setPrototypeOf(o, p);
    }

    function _isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;

      try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
        return true;
      } catch (e) {
        return false;
      }
    }

    function _construct(Parent, args, Class) {
      if (_isNativeReflectConstruct()) {
        _construct = Reflect.construct;
      } else {
        _construct = function _construct(Parent, args, Class) {
          var a = [null];
          a.push.apply(a, args);
          var Constructor = Function.bind.apply(Parent, a);
          var instance = new Constructor();
          if (Class) _setPrototypeOf(instance, Class.prototype);
          return instance;
        };
      }

      return _construct.apply(null, arguments);
    }

    function _isNativeFunction(fn) {
      return Function.toString.call(fn).indexOf("[native code]") !== -1;
    }

    function _wrapNativeSuper(Class) {
      var _cache = typeof Map === "function" ? new Map() : undefined;

      _wrapNativeSuper = function _wrapNativeSuper(Class) {
        if (Class === null || !_isNativeFunction(Class)) return Class;

        if (typeof Class !== "function") {
          throw new TypeError("Super expression must either be null or a function");
        }

        if (typeof _cache !== "undefined") {
          if (_cache.has(Class)) return _cache.get(Class);

          _cache.set(Class, Wrapper);
        }

        function Wrapper() {
          return _construct(Class, arguments, _getPrototypeOf(this).constructor);
        }

        Wrapper.prototype = Object.create(Class.prototype, {
          constructor: {
            value: Wrapper,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
        return _setPrototypeOf(Wrapper, Class);
      };

      return _wrapNativeSuper(Class);
    }

    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null) return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;

      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }

      return target;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _createForOfIteratorHelperLoose(o, allowArrayLike) {
      var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
      if (it) return (it = it.call(o)).next.bind(it);

      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    // these aren't really private, but nor are they really useful to document

    /**
     * @private
     */
    var LuxonError = /*#__PURE__*/function (_Error) {
      _inheritsLoose(LuxonError, _Error);

      function LuxonError() {
        return _Error.apply(this, arguments) || this;
      }

      return LuxonError;
    }( /*#__PURE__*/_wrapNativeSuper(Error));
    /**
     * @private
     */


    var InvalidDateTimeError = /*#__PURE__*/function (_LuxonError) {
      _inheritsLoose(InvalidDateTimeError, _LuxonError);

      function InvalidDateTimeError(reason) {
        return _LuxonError.call(this, "Invalid DateTime: " + reason.toMessage()) || this;
      }

      return InvalidDateTimeError;
    }(LuxonError);
    /**
     * @private
     */

    var InvalidIntervalError = /*#__PURE__*/function (_LuxonError2) {
      _inheritsLoose(InvalidIntervalError, _LuxonError2);

      function InvalidIntervalError(reason) {
        return _LuxonError2.call(this, "Invalid Interval: " + reason.toMessage()) || this;
      }

      return InvalidIntervalError;
    }(LuxonError);
    /**
     * @private
     */

    var InvalidDurationError = /*#__PURE__*/function (_LuxonError3) {
      _inheritsLoose(InvalidDurationError, _LuxonError3);

      function InvalidDurationError(reason) {
        return _LuxonError3.call(this, "Invalid Duration: " + reason.toMessage()) || this;
      }

      return InvalidDurationError;
    }(LuxonError);
    /**
     * @private
     */

    var ConflictingSpecificationError = /*#__PURE__*/function (_LuxonError4) {
      _inheritsLoose(ConflictingSpecificationError, _LuxonError4);

      function ConflictingSpecificationError() {
        return _LuxonError4.apply(this, arguments) || this;
      }

      return ConflictingSpecificationError;
    }(LuxonError);
    /**
     * @private
     */

    var InvalidUnitError = /*#__PURE__*/function (_LuxonError5) {
      _inheritsLoose(InvalidUnitError, _LuxonError5);

      function InvalidUnitError(unit) {
        return _LuxonError5.call(this, "Invalid unit " + unit) || this;
      }

      return InvalidUnitError;
    }(LuxonError);
    /**
     * @private
     */

    var InvalidArgumentError = /*#__PURE__*/function (_LuxonError6) {
      _inheritsLoose(InvalidArgumentError, _LuxonError6);

      function InvalidArgumentError() {
        return _LuxonError6.apply(this, arguments) || this;
      }

      return InvalidArgumentError;
    }(LuxonError);
    /**
     * @private
     */

    var ZoneIsAbstractError = /*#__PURE__*/function (_LuxonError7) {
      _inheritsLoose(ZoneIsAbstractError, _LuxonError7);

      function ZoneIsAbstractError() {
        return _LuxonError7.call(this, "Zone is an abstract class") || this;
      }

      return ZoneIsAbstractError;
    }(LuxonError);

    /**
     * @private
     */
    var n = "numeric",
        s = "short",
        l = "long";
    var DATE_SHORT = {
      year: n,
      month: n,
      day: n
    };
    var DATE_MED = {
      year: n,
      month: s,
      day: n
    };
    var DATE_MED_WITH_WEEKDAY = {
      year: n,
      month: s,
      day: n,
      weekday: s
    };
    var DATE_FULL = {
      year: n,
      month: l,
      day: n
    };
    var DATE_HUGE = {
      year: n,
      month: l,
      day: n,
      weekday: l
    };
    var TIME_SIMPLE = {
      hour: n,
      minute: n
    };
    var TIME_WITH_SECONDS = {
      hour: n,
      minute: n,
      second: n
    };
    var TIME_WITH_SHORT_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      timeZoneName: s
    };
    var TIME_WITH_LONG_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      timeZoneName: l
    };
    var TIME_24_SIMPLE = {
      hour: n,
      minute: n,
      hourCycle: "h23"
    };
    var TIME_24_WITH_SECONDS = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23"
    };
    var TIME_24_WITH_SHORT_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23",
      timeZoneName: s
    };
    var TIME_24_WITH_LONG_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23",
      timeZoneName: l
    };
    var DATETIME_SHORT = {
      year: n,
      month: n,
      day: n,
      hour: n,
      minute: n
    };
    var DATETIME_SHORT_WITH_SECONDS = {
      year: n,
      month: n,
      day: n,
      hour: n,
      minute: n,
      second: n
    };
    var DATETIME_MED = {
      year: n,
      month: s,
      day: n,
      hour: n,
      minute: n
    };
    var DATETIME_MED_WITH_SECONDS = {
      year: n,
      month: s,
      day: n,
      hour: n,
      minute: n,
      second: n
    };
    var DATETIME_MED_WITH_WEEKDAY = {
      year: n,
      month: s,
      day: n,
      weekday: s,
      hour: n,
      minute: n
    };
    var DATETIME_FULL = {
      year: n,
      month: l,
      day: n,
      hour: n,
      minute: n,
      timeZoneName: s
    };
    var DATETIME_FULL_WITH_SECONDS = {
      year: n,
      month: l,
      day: n,
      hour: n,
      minute: n,
      second: n,
      timeZoneName: s
    };
    var DATETIME_HUGE = {
      year: n,
      month: l,
      day: n,
      weekday: l,
      hour: n,
      minute: n,
      timeZoneName: l
    };
    var DATETIME_HUGE_WITH_SECONDS = {
      year: n,
      month: l,
      day: n,
      weekday: l,
      hour: n,
      minute: n,
      second: n,
      timeZoneName: l
    };

    /**
     * @private
     */
    // TYPES

    function isUndefined(o) {
      return typeof o === "undefined";
    }
    function isNumber(o) {
      return typeof o === "number";
    }
    function isInteger(o) {
      return typeof o === "number" && o % 1 === 0;
    }
    function isString(o) {
      return typeof o === "string";
    }
    function isDate(o) {
      return Object.prototype.toString.call(o) === "[object Date]";
    } // CAPABILITIES

    function hasRelative() {
      try {
        return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
      } catch (e) {
        return false;
      }
    } // OBJECTS AND ARRAYS

    function maybeArray(thing) {
      return Array.isArray(thing) ? thing : [thing];
    }
    function bestBy(arr, by, compare) {
      if (arr.length === 0) {
        return undefined;
      }

      return arr.reduce(function (best, next) {
        var pair = [by(next), next];

        if (!best) {
          return pair;
        } else if (compare(best[0], pair[0]) === best[0]) {
          return best;
        } else {
          return pair;
        }
      }, null)[1];
    }
    function pick(obj, keys) {
      return keys.reduce(function (a, k) {
        a[k] = obj[k];
        return a;
      }, {});
    }
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    } // NUMBERS AND STRINGS

    function integerBetween(thing, bottom, top) {
      return isInteger(thing) && thing >= bottom && thing <= top;
    } // x % n but takes the sign of n instead of x

    function floorMod(x, n) {
      return x - n * Math.floor(x / n);
    }
    function padStart(input, n) {
      if (n === void 0) {
        n = 2;
      }

      var minus = input < 0 ? "-" : "";
      var target = minus ? input * -1 : input;
      var result;

      if (target.toString().length < n) {
        result = ("0".repeat(n) + target).slice(-n);
      } else {
        result = target.toString();
      }

      return "" + minus + result;
    }
    function parseInteger(string) {
      if (isUndefined(string) || string === null || string === "") {
        return undefined;
      } else {
        return parseInt(string, 10);
      }
    }
    function parseFloating(string) {
      if (isUndefined(string) || string === null || string === "") {
        return undefined;
      } else {
        return parseFloat(string);
      }
    }
    function parseMillis(fraction) {
      // Return undefined (instead of 0) in these cases, where fraction is not set
      if (isUndefined(fraction) || fraction === null || fraction === "") {
        return undefined;
      } else {
        var f = parseFloat("0." + fraction) * 1000;
        return Math.floor(f);
      }
    }
    function roundTo(number, digits, towardZero) {
      if (towardZero === void 0) {
        towardZero = false;
      }

      var factor = Math.pow(10, digits),
          rounder = towardZero ? Math.trunc : Math.round;
      return rounder(number * factor) / factor;
    } // DATE BASICS

    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    function daysInYear(year) {
      return isLeapYear(year) ? 366 : 365;
    }
    function daysInMonth(year, month) {
      var modMonth = floorMod(month - 1, 12) + 1,
          modYear = year + (month - modMonth) / 12;

      if (modMonth === 2) {
        return isLeapYear(modYear) ? 29 : 28;
      } else {
        return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
      }
    } // covert a calendar object to a local timestamp (epoch, but with the offset baked in)

    function objToLocalTS(obj) {
      var d = Date.UTC(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond); // for legacy reasons, years between 0 and 99 are interpreted as 19XX; revert that

      if (obj.year < 100 && obj.year >= 0) {
        d = new Date(d);
        d.setUTCFullYear(d.getUTCFullYear() - 1900);
      }

      return +d;
    }
    function weeksInWeekYear(weekYear) {
      var p1 = (weekYear + Math.floor(weekYear / 4) - Math.floor(weekYear / 100) + Math.floor(weekYear / 400)) % 7,
          last = weekYear - 1,
          p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
      return p1 === 4 || p2 === 3 ? 53 : 52;
    }
    function untruncateYear(year) {
      if (year > 99) {
        return year;
      } else return year > 60 ? 1900 + year : 2000 + year;
    } // PARSING

    function parseZoneInfo(ts, offsetFormat, locale, timeZone) {
      if (timeZone === void 0) {
        timeZone = null;
      }

      var date = new Date(ts),
          intlOpts = {
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      };

      if (timeZone) {
        intlOpts.timeZone = timeZone;
      }

      var modified = _extends({
        timeZoneName: offsetFormat
      }, intlOpts);

      var parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find(function (m) {
        return m.type.toLowerCase() === "timezonename";
      });
      return parsed ? parsed.value : null;
    } // signedOffset('-5', '30') -> -330

    function signedOffset(offHourStr, offMinuteStr) {
      var offHour = parseInt(offHourStr, 10); // don't || this because we want to preserve -0

      if (Number.isNaN(offHour)) {
        offHour = 0;
      }

      var offMin = parseInt(offMinuteStr, 10) || 0,
          offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
      return offHour * 60 + offMinSigned;
    } // COERCION

    function asNumber(value) {
      var numericValue = Number(value);
      if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue)) throw new InvalidArgumentError("Invalid unit value " + value);
      return numericValue;
    }
    function normalizeObject(obj, normalizer) {
      var normalized = {};

      for (var u in obj) {
        if (hasOwnProperty(obj, u)) {
          var v = obj[u];
          if (v === undefined || v === null) continue;
          normalized[normalizer(u)] = asNumber(v);
        }
      }

      return normalized;
    }
    function formatOffset(offset, format) {
      var hours = Math.trunc(Math.abs(offset / 60)),
          minutes = Math.trunc(Math.abs(offset % 60)),
          sign = offset >= 0 ? "+" : "-";

      switch (format) {
        case "short":
          return "" + sign + padStart(hours, 2) + ":" + padStart(minutes, 2);

        case "narrow":
          return "" + sign + hours + (minutes > 0 ? ":" + minutes : "");

        case "techie":
          return "" + sign + padStart(hours, 2) + padStart(minutes, 2);

        default:
          throw new RangeError("Value format " + format + " is out of range for property format");
      }
    }
    function timeObject(obj) {
      return pick(obj, ["hour", "minute", "second", "millisecond"]);
    }
    var ianaRegex = /[A-Za-z_+-]{1,256}(:?\/[A-Za-z0-9_+-]{1,256}(\/[A-Za-z0-9_+-]{1,256})?)?/;

    /**
     * @private
     */


    var monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    function months(length) {
      switch (length) {
        case "narrow":
          return [].concat(monthsNarrow);

        case "short":
          return [].concat(monthsShort);

        case "long":
          return [].concat(monthsLong);

        case "numeric":
          return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

        case "2-digit":
          return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

        default:
          return null;
      }
    }
    var weekdaysLong = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
    function weekdays(length) {
      switch (length) {
        case "narrow":
          return [].concat(weekdaysNarrow);

        case "short":
          return [].concat(weekdaysShort);

        case "long":
          return [].concat(weekdaysLong);

        case "numeric":
          return ["1", "2", "3", "4", "5", "6", "7"];

        default:
          return null;
      }
    }
    var meridiems = ["AM", "PM"];
    var erasLong = ["Before Christ", "Anno Domini"];
    var erasShort = ["BC", "AD"];
    var erasNarrow = ["B", "A"];
    function eras(length) {
      switch (length) {
        case "narrow":
          return [].concat(erasNarrow);

        case "short":
          return [].concat(erasShort);

        case "long":
          return [].concat(erasLong);

        default:
          return null;
      }
    }
    function meridiemForDateTime(dt) {
      return meridiems[dt.hour < 12 ? 0 : 1];
    }
    function weekdayForDateTime(dt, length) {
      return weekdays(length)[dt.weekday - 1];
    }
    function monthForDateTime(dt, length) {
      return months(length)[dt.month - 1];
    }
    function eraForDateTime(dt, length) {
      return eras(length)[dt.year < 0 ? 0 : 1];
    }
    function formatRelativeTime(unit, count, numeric, narrow) {
      if (numeric === void 0) {
        numeric = "always";
      }

      if (narrow === void 0) {
        narrow = false;
      }

      var units = {
        years: ["year", "yr."],
        quarters: ["quarter", "qtr."],
        months: ["month", "mo."],
        weeks: ["week", "wk."],
        days: ["day", "day", "days"],
        hours: ["hour", "hr."],
        minutes: ["minute", "min."],
        seconds: ["second", "sec."]
      };
      var lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;

      if (numeric === "auto" && lastable) {
        var isDay = unit === "days";

        switch (count) {
          case 1:
            return isDay ? "tomorrow" : "next " + units[unit][0];

          case -1:
            return isDay ? "yesterday" : "last " + units[unit][0];

          case 0:
            return isDay ? "today" : "this " + units[unit][0];

        }
      }

      var isInPast = Object.is(count, -0) || count < 0,
          fmtValue = Math.abs(count),
          singular = fmtValue === 1,
          lilUnits = units[unit],
          fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
      return isInPast ? fmtValue + " " + fmtUnit + " ago" : "in " + fmtValue + " " + fmtUnit;
    }

    function stringifyTokens(splits, tokenToString) {
      var s = "";

      for (var _iterator = _createForOfIteratorHelperLoose(splits), _step; !(_step = _iterator()).done;) {
        var token = _step.value;

        if (token.literal) {
          s += token.val;
        } else {
          s += tokenToString(token.val);
        }
      }

      return s;
    }

    var _macroTokenToFormatOpts = {
      D: DATE_SHORT,
      DD: DATE_MED,
      DDD: DATE_FULL,
      DDDD: DATE_HUGE,
      t: TIME_SIMPLE,
      tt: TIME_WITH_SECONDS,
      ttt: TIME_WITH_SHORT_OFFSET,
      tttt: TIME_WITH_LONG_OFFSET,
      T: TIME_24_SIMPLE,
      TT: TIME_24_WITH_SECONDS,
      TTT: TIME_24_WITH_SHORT_OFFSET,
      TTTT: TIME_24_WITH_LONG_OFFSET,
      f: DATETIME_SHORT,
      ff: DATETIME_MED,
      fff: DATETIME_FULL,
      ffff: DATETIME_HUGE,
      F: DATETIME_SHORT_WITH_SECONDS,
      FF: DATETIME_MED_WITH_SECONDS,
      FFF: DATETIME_FULL_WITH_SECONDS,
      FFFF: DATETIME_HUGE_WITH_SECONDS
    };
    /**
     * @private
     */

    var Formatter = /*#__PURE__*/function () {
      Formatter.create = function create(locale, opts) {
        if (opts === void 0) {
          opts = {};
        }

        return new Formatter(locale, opts);
      };

      Formatter.parseFormat = function parseFormat(fmt) {
        var current = null,
            currentFull = "",
            bracketed = false;
        var splits = [];

        for (var i = 0; i < fmt.length; i++) {
          var c = fmt.charAt(i);

          if (c === "'") {
            if (currentFull.length > 0) {
              splits.push({
                literal: bracketed,
                val: currentFull
              });
            }

            current = null;
            currentFull = "";
            bracketed = !bracketed;
          } else if (bracketed) {
            currentFull += c;
          } else if (c === current) {
            currentFull += c;
          } else {
            if (currentFull.length > 0) {
              splits.push({
                literal: false,
                val: currentFull
              });
            }

            currentFull = c;
            current = c;
          }
        }

        if (currentFull.length > 0) {
          splits.push({
            literal: bracketed,
            val: currentFull
          });
        }

        return splits;
      };

      Formatter.macroTokenToFormatOpts = function macroTokenToFormatOpts(token) {
        return _macroTokenToFormatOpts[token];
      };

      function Formatter(locale, formatOpts) {
        this.opts = formatOpts;
        this.loc = locale;
        this.systemLoc = null;
      }

      var _proto = Formatter.prototype;

      _proto.formatWithSystemDefault = function formatWithSystemDefault(dt, opts) {
        if (this.systemLoc === null) {
          this.systemLoc = this.loc.redefaultToSystem();
        }

        var df = this.systemLoc.dtFormatter(dt, _extends({}, this.opts, opts));
        return df.format();
      };

      _proto.formatDateTime = function formatDateTime(dt, opts) {
        if (opts === void 0) {
          opts = {};
        }

        var df = this.loc.dtFormatter(dt, _extends({}, this.opts, opts));
        return df.format();
      };

      _proto.formatDateTimeParts = function formatDateTimeParts(dt, opts) {
        if (opts === void 0) {
          opts = {};
        }

        var df = this.loc.dtFormatter(dt, _extends({}, this.opts, opts));
        return df.formatToParts();
      };

      _proto.resolvedOptions = function resolvedOptions(dt, opts) {
        if (opts === void 0) {
          opts = {};
        }

        var df = this.loc.dtFormatter(dt, _extends({}, this.opts, opts));
        return df.resolvedOptions();
      };

      _proto.num = function num(n, p) {
        if (p === void 0) {
          p = 0;
        }

        // we get some perf out of doing this here, annoyingly
        if (this.opts.forceSimple) {
          return padStart(n, p);
        }

        var opts = _extends({}, this.opts);

        if (p > 0) {
          opts.padTo = p;
        }

        return this.loc.numberFormatter(opts).format(n);
      };

      _proto.formatDateTimeFromString = function formatDateTimeFromString(dt, fmt) {
        var _this = this;

        var knownEnglish = this.loc.listingMode() === "en",
            useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory",
            string = function string(opts, extract) {
          return _this.loc.extract(dt, opts, extract);
        },
            formatOffset = function formatOffset(opts) {
          if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
            return "Z";
          }

          return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
        },
            meridiem = function meridiem() {
          return knownEnglish ? meridiemForDateTime(dt) : string({
            hour: "numeric",
            hourCycle: "h12"
          }, "dayperiod");
        },
            month = function month(length, standalone) {
          return knownEnglish ? monthForDateTime(dt, length) : string(standalone ? {
            month: length
          } : {
            month: length,
            day: "numeric"
          }, "month");
        },
            weekday = function weekday(length, standalone) {
          return knownEnglish ? weekdayForDateTime(dt, length) : string(standalone ? {
            weekday: length
          } : {
            weekday: length,
            month: "long",
            day: "numeric"
          }, "weekday");
        },
            maybeMacro = function maybeMacro(token) {
          var formatOpts = Formatter.macroTokenToFormatOpts(token);

          if (formatOpts) {
            return _this.formatWithSystemDefault(dt, formatOpts);
          } else {
            return token;
          }
        },
            era = function era(length) {
          return knownEnglish ? eraForDateTime(dt, length) : string({
            era: length
          }, "era");
        },
            tokenToString = function tokenToString(token) {
          // Where possible: http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles
          switch (token) {
            // ms
            case "S":
              return _this.num(dt.millisecond);

            case "u": // falls through

            case "SSS":
              return _this.num(dt.millisecond, 3);
            // seconds

            case "s":
              return _this.num(dt.second);

            case "ss":
              return _this.num(dt.second, 2);
            // fractional seconds

            case "uu":
              return _this.num(Math.floor(dt.millisecond / 10), 2);

            case "uuu":
              return _this.num(Math.floor(dt.millisecond / 100));
            // minutes

            case "m":
              return _this.num(dt.minute);

            case "mm":
              return _this.num(dt.minute, 2);
            // hours

            case "h":
              return _this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);

            case "hh":
              return _this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);

            case "H":
              return _this.num(dt.hour);

            case "HH":
              return _this.num(dt.hour, 2);
            // offset

            case "Z":
              // like +6
              return formatOffset({
                format: "narrow",
                allowZ: _this.opts.allowZ
              });

            case "ZZ":
              // like +06:00
              return formatOffset({
                format: "short",
                allowZ: _this.opts.allowZ
              });

            case "ZZZ":
              // like +0600
              return formatOffset({
                format: "techie",
                allowZ: _this.opts.allowZ
              });

            case "ZZZZ":
              // like EST
              return dt.zone.offsetName(dt.ts, {
                format: "short",
                locale: _this.loc.locale
              });

            case "ZZZZZ":
              // like Eastern Standard Time
              return dt.zone.offsetName(dt.ts, {
                format: "long",
                locale: _this.loc.locale
              });
            // zone

            case "z":
              // like America/New_York
              return dt.zoneName;
            // meridiems

            case "a":
              return meridiem();
            // dates

            case "d":
              return useDateTimeFormatter ? string({
                day: "numeric"
              }, "day") : _this.num(dt.day);

            case "dd":
              return useDateTimeFormatter ? string({
                day: "2-digit"
              }, "day") : _this.num(dt.day, 2);
            // weekdays - standalone

            case "c":
              // like 1
              return _this.num(dt.weekday);

            case "ccc":
              // like 'Tues'
              return weekday("short", true);

            case "cccc":
              // like 'Tuesday'
              return weekday("long", true);

            case "ccccc":
              // like 'T'
              return weekday("narrow", true);
            // weekdays - format

            case "E":
              // like 1
              return _this.num(dt.weekday);

            case "EEE":
              // like 'Tues'
              return weekday("short", false);

            case "EEEE":
              // like 'Tuesday'
              return weekday("long", false);

            case "EEEEE":
              // like 'T'
              return weekday("narrow", false);
            // months - standalone

            case "L":
              // like 1
              return useDateTimeFormatter ? string({
                month: "numeric",
                day: "numeric"
              }, "month") : _this.num(dt.month);

            case "LL":
              // like 01, doesn't seem to work
              return useDateTimeFormatter ? string({
                month: "2-digit",
                day: "numeric"
              }, "month") : _this.num(dt.month, 2);

            case "LLL":
              // like Jan
              return month("short", true);

            case "LLLL":
              // like January
              return month("long", true);

            case "LLLLL":
              // like J
              return month("narrow", true);
            // months - format

            case "M":
              // like 1
              return useDateTimeFormatter ? string({
                month: "numeric"
              }, "month") : _this.num(dt.month);

            case "MM":
              // like 01
              return useDateTimeFormatter ? string({
                month: "2-digit"
              }, "month") : _this.num(dt.month, 2);

            case "MMM":
              // like Jan
              return month("short", false);

            case "MMMM":
              // like January
              return month("long", false);

            case "MMMMM":
              // like J
              return month("narrow", false);
            // years

            case "y":
              // like 2014
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : _this.num(dt.year);

            case "yy":
              // like 14
              return useDateTimeFormatter ? string({
                year: "2-digit"
              }, "year") : _this.num(dt.year.toString().slice(-2), 2);

            case "yyyy":
              // like 0012
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : _this.num(dt.year, 4);

            case "yyyyyy":
              // like 000012
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : _this.num(dt.year, 6);
            // eras

            case "G":
              // like AD
              return era("short");

            case "GG":
              // like Anno Domini
              return era("long");

            case "GGGGG":
              return era("narrow");

            case "kk":
              return _this.num(dt.weekYear.toString().slice(-2), 2);

            case "kkkk":
              return _this.num(dt.weekYear, 4);

            case "W":
              return _this.num(dt.weekNumber);

            case "WW":
              return _this.num(dt.weekNumber, 2);

            case "o":
              return _this.num(dt.ordinal);

            case "ooo":
              return _this.num(dt.ordinal, 3);

            case "q":
              // like 1
              return _this.num(dt.quarter);

            case "qq":
              // like 01
              return _this.num(dt.quarter, 2);

            case "X":
              return _this.num(Math.floor(dt.ts / 1000));

            case "x":
              return _this.num(dt.ts);

            default:
              return maybeMacro(token);
          }
        };

        return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
      };

      _proto.formatDurationFromString = function formatDurationFromString(dur, fmt) {
        var _this2 = this;

        var tokenToField = function tokenToField(token) {
          switch (token[0]) {
            case "S":
              return "millisecond";

            case "s":
              return "second";

            case "m":
              return "minute";

            case "h":
              return "hour";

            case "d":
              return "day";

            case "M":
              return "month";

            case "y":
              return "year";

            default:
              return null;
          }
        },
            tokenToString = function tokenToString(lildur) {
          return function (token) {
            var mapped = tokenToField(token);

            if (mapped) {
              return _this2.num(lildur.get(mapped), token.length);
            } else {
              return token;
            }
          };
        },
            tokens = Formatter.parseFormat(fmt),
            realTokens = tokens.reduce(function (found, _ref) {
          var literal = _ref.literal,
              val = _ref.val;
          return literal ? found : found.concat(val);
        }, []),
            collapsed = dur.shiftTo.apply(dur, realTokens.map(tokenToField).filter(function (t) {
          return t;
        }));

        return stringifyTokens(tokens, tokenToString(collapsed));
      };

      return Formatter;
    }();

    var Invalid = /*#__PURE__*/function () {
      function Invalid(reason, explanation) {
        this.reason = reason;
        this.explanation = explanation;
      }

      var _proto = Invalid.prototype;

      _proto.toMessage = function toMessage() {
        if (this.explanation) {
          return this.reason + ": " + this.explanation;
        } else {
          return this.reason;
        }
      };

      return Invalid;
    }();

    /**
     * @interface
     */

    var Zone = /*#__PURE__*/function () {
      function Zone() {}

      var _proto = Zone.prototype;

      /**
       * Returns the offset's common name (such as EST) at the specified timestamp
       * @abstract
       * @param {number} ts - Epoch milliseconds for which to get the name
       * @param {Object} opts - Options to affect the format
       * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
       * @param {string} opts.locale - What locale to return the offset name in.
       * @return {string}
       */
      _proto.offsetName = function offsetName(ts, opts) {
        throw new ZoneIsAbstractError();
      }
      /**
       * Returns the offset's value as a string
       * @abstract
       * @param {number} ts - Epoch milliseconds for which to get the offset
       * @param {string} format - What style of offset to return.
       *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
       * @return {string}
       */
      ;

      _proto.formatOffset = function formatOffset(ts, format) {
        throw new ZoneIsAbstractError();
      }
      /**
       * Return the offset in minutes for this zone at the specified timestamp.
       * @abstract
       * @param {number} ts - Epoch milliseconds for which to compute the offset
       * @return {number}
       */
      ;

      _proto.offset = function offset(ts) {
        throw new ZoneIsAbstractError();
      }
      /**
       * Return whether this Zone is equal to another zone
       * @abstract
       * @param {Zone} otherZone - the zone to compare
       * @return {boolean}
       */
      ;

      _proto.equals = function equals(otherZone) {
        throw new ZoneIsAbstractError();
      }
      /**
       * Return whether this Zone is valid.
       * @abstract
       * @type {boolean}
       */
      ;

      _createClass(Zone, [{
        key: "type",
        get:
        /**
         * The type of zone
         * @abstract
         * @type {string}
         */
        function get() {
          throw new ZoneIsAbstractError();
        }
        /**
         * The name of this zone.
         * @abstract
         * @type {string}
         */

      }, {
        key: "name",
        get: function get() {
          throw new ZoneIsAbstractError();
        }
        /**
         * Returns whether the offset is known to be fixed for the whole year.
         * @abstract
         * @type {boolean}
         */

      }, {
        key: "isUniversal",
        get: function get() {
          throw new ZoneIsAbstractError();
        }
      }, {
        key: "isValid",
        get: function get() {
          throw new ZoneIsAbstractError();
        }
      }]);

      return Zone;
    }();

    var singleton$1 = null;
    /**
     * Represents the local zone for this JavaScript environment.
     * @implements {Zone}
     */

    var SystemZone = /*#__PURE__*/function (_Zone) {
      _inheritsLoose(SystemZone, _Zone);

      function SystemZone() {
        return _Zone.apply(this, arguments) || this;
      }

      var _proto = SystemZone.prototype;

      /** @override **/
      _proto.offsetName = function offsetName(ts, _ref) {
        var format = _ref.format,
            locale = _ref.locale;
        return parseZoneInfo(ts, format, locale);
      }
      /** @override **/
      ;

      _proto.formatOffset = function formatOffset$1(ts, format) {
        return formatOffset(this.offset(ts), format);
      }
      /** @override **/
      ;

      _proto.offset = function offset(ts) {
        return -new Date(ts).getTimezoneOffset();
      }
      /** @override **/
      ;

      _proto.equals = function equals(otherZone) {
        return otherZone.type === "system";
      }
      /** @override **/
      ;

      _createClass(SystemZone, [{
        key: "type",
        get:
        /** @override **/
        function get() {
          return "system";
        }
        /** @override **/

      }, {
        key: "name",
        get: function get() {
          return new Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        /** @override **/

      }, {
        key: "isUniversal",
        get: function get() {
          return false;
        }
      }, {
        key: "isValid",
        get: function get() {
          return true;
        }
      }], [{
        key: "instance",
        get:
        /**
         * Get a singleton instance of the local zone
         * @return {SystemZone}
         */
        function get() {
          if (singleton$1 === null) {
            singleton$1 = new SystemZone();
          }

          return singleton$1;
        }
      }]);

      return SystemZone;
    }(Zone);

    var matchingRegex = RegExp("^" + ianaRegex.source + "$");
    var dtfCache = {};

    function makeDTF(zone) {
      if (!dtfCache[zone]) {
        dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
          hour12: false,
          timeZone: zone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      }

      return dtfCache[zone];
    }

    var typeToPos = {
      year: 0,
      month: 1,
      day: 2,
      hour: 3,
      minute: 4,
      second: 5
    };

    function hackyOffset(dtf, date) {
      var formatted = dtf.format(date).replace(/\u200E/g, ""),
          parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted),
          fMonth = parsed[1],
          fDay = parsed[2],
          fYear = parsed[3],
          fHour = parsed[4],
          fMinute = parsed[5],
          fSecond = parsed[6];
      return [fYear, fMonth, fDay, fHour, fMinute, fSecond];
    }

    function partsOffset(dtf, date) {
      var formatted = dtf.formatToParts(date),
          filled = [];

      for (var i = 0; i < formatted.length; i++) {
        var _formatted$i = formatted[i],
            type = _formatted$i.type,
            value = _formatted$i.value,
            pos = typeToPos[type];

        if (!isUndefined(pos)) {
          filled[pos] = parseInt(value, 10);
        }
      }

      return filled;
    }

    var ianaZoneCache = {};
    /**
     * A zone identified by an IANA identifier, like America/New_York
     * @implements {Zone}
     */

    var IANAZone = /*#__PURE__*/function (_Zone) {
      _inheritsLoose(IANAZone, _Zone);

      /**
       * @param {string} name - Zone name
       * @return {IANAZone}
       */
      IANAZone.create = function create(name) {
        if (!ianaZoneCache[name]) {
          ianaZoneCache[name] = new IANAZone(name);
        }

        return ianaZoneCache[name];
      }
      /**
       * Reset local caches. Should only be necessary in testing scenarios.
       * @return {void}
       */
      ;

      IANAZone.resetCache = function resetCache() {
        ianaZoneCache = {};
        dtfCache = {};
      }
      /**
       * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
       * @param {string} s - The string to check validity on
       * @example IANAZone.isValidSpecifier("America/New_York") //=> true
       * @example IANAZone.isValidSpecifier("Fantasia/Castle") //=> true
       * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
       * @return {boolean}
       */
      ;

      IANAZone.isValidSpecifier = function isValidSpecifier(s) {
        return !!(s && s.match(matchingRegex));
      }
      /**
       * Returns whether the provided string identifies a real zone
       * @param {string} zone - The string to check
       * @example IANAZone.isValidZone("America/New_York") //=> true
       * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
       * @example IANAZone.isValidZone("Sport~~blorp") //=> false
       * @return {boolean}
       */
      ;

      IANAZone.isValidZone = function isValidZone(zone) {
        if (!zone) {
          return false;
        }

        try {
          new Intl.DateTimeFormat("en-US", {
            timeZone: zone
          }).format();
          return true;
        } catch (e) {
          return false;
        }
      };

      function IANAZone(name) {
        var _this;

        _this = _Zone.call(this) || this;
        /** @private **/

        _this.zoneName = name;
        /** @private **/

        _this.valid = IANAZone.isValidZone(name);
        return _this;
      }
      /** @override **/


      var _proto = IANAZone.prototype;

      /** @override **/
      _proto.offsetName = function offsetName(ts, _ref) {
        var format = _ref.format,
            locale = _ref.locale;
        return parseZoneInfo(ts, format, locale, this.name);
      }
      /** @override **/
      ;

      _proto.formatOffset = function formatOffset$1(ts, format) {
        return formatOffset(this.offset(ts), format);
      }
      /** @override **/
      ;

      _proto.offset = function offset(ts) {
        var date = new Date(ts);
        if (isNaN(date)) return NaN;

        var dtf = makeDTF(this.name),
            _ref2 = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date),
            year = _ref2[0],
            month = _ref2[1],
            day = _ref2[2],
            hour = _ref2[3],
            minute = _ref2[4],
            second = _ref2[5]; // because we're using hour12 and https://bugs.chromium.org/p/chromium/issues/detail?id=1025564&can=2&q=%2224%3A00%22%20datetimeformat


        var adjustedHour = hour === 24 ? 0 : hour;
        var asUTC = objToLocalTS({
          year: year,
          month: month,
          day: day,
          hour: adjustedHour,
          minute: minute,
          second: second,
          millisecond: 0
        });
        var asTS = +date;
        var over = asTS % 1000;
        asTS -= over >= 0 ? over : 1000 + over;
        return (asUTC - asTS) / (60 * 1000);
      }
      /** @override **/
      ;

      _proto.equals = function equals(otherZone) {
        return otherZone.type === "iana" && otherZone.name === this.name;
      }
      /** @override **/
      ;

      _createClass(IANAZone, [{
        key: "type",
        get: function get() {
          return "iana";
        }
        /** @override **/

      }, {
        key: "name",
        get: function get() {
          return this.zoneName;
        }
        /** @override **/

      }, {
        key: "isUniversal",
        get: function get() {
          return false;
        }
      }, {
        key: "isValid",
        get: function get() {
          return this.valid;
        }
      }]);

      return IANAZone;
    }(Zone);

    var singleton = null;
    /**
     * A zone with a fixed offset (meaning no DST)
     * @implements {Zone}
     */

    var FixedOffsetZone = /*#__PURE__*/function (_Zone) {
      _inheritsLoose(FixedOffsetZone, _Zone);

      /**
       * Get an instance with a specified offset
       * @param {number} offset - The offset in minutes
       * @return {FixedOffsetZone}
       */
      FixedOffsetZone.instance = function instance(offset) {
        return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
      }
      /**
       * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
       * @param {string} s - The offset string to parse
       * @example FixedOffsetZone.parseSpecifier("UTC+6")
       * @example FixedOffsetZone.parseSpecifier("UTC+06")
       * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
       * @return {FixedOffsetZone}
       */
      ;

      FixedOffsetZone.parseSpecifier = function parseSpecifier(s) {
        if (s) {
          var r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);

          if (r) {
            return new FixedOffsetZone(signedOffset(r[1], r[2]));
          }
        }

        return null;
      };

      function FixedOffsetZone(offset) {
        var _this;

        _this = _Zone.call(this) || this;
        /** @private **/

        _this.fixed = offset;
        return _this;
      }
      /** @override **/


      var _proto = FixedOffsetZone.prototype;

      /** @override **/
      _proto.offsetName = function offsetName() {
        return this.name;
      }
      /** @override **/
      ;

      _proto.formatOffset = function formatOffset$1(ts, format) {
        return formatOffset(this.fixed, format);
      }
      /** @override **/
      ;

      /** @override **/
      _proto.offset = function offset() {
        return this.fixed;
      }
      /** @override **/
      ;

      _proto.equals = function equals(otherZone) {
        return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
      }
      /** @override **/
      ;

      _createClass(FixedOffsetZone, [{
        key: "type",
        get: function get() {
          return "fixed";
        }
        /** @override **/

      }, {
        key: "name",
        get: function get() {
          return this.fixed === 0 ? "UTC" : "UTC" + formatOffset(this.fixed, "narrow");
        }
      }, {
        key: "isUniversal",
        get: function get() {
          return true;
        }
      }, {
        key: "isValid",
        get: function get() {
          return true;
        }
      }], [{
        key: "utcInstance",
        get:
        /**
         * Get a singleton instance of UTC
         * @return {FixedOffsetZone}
         */
        function get() {
          if (singleton === null) {
            singleton = new FixedOffsetZone(0);
          }

          return singleton;
        }
      }]);

      return FixedOffsetZone;
    }(Zone);

    /**
     * A zone that failed to parse. You should never need to instantiate this.
     * @implements {Zone}
     */

    var InvalidZone = /*#__PURE__*/function (_Zone) {
      _inheritsLoose(InvalidZone, _Zone);

      function InvalidZone(zoneName) {
        var _this;

        _this = _Zone.call(this) || this;
        /**  @private */

        _this.zoneName = zoneName;
        return _this;
      }
      /** @override **/


      var _proto = InvalidZone.prototype;

      /** @override **/
      _proto.offsetName = function offsetName() {
        return null;
      }
      /** @override **/
      ;

      _proto.formatOffset = function formatOffset() {
        return "";
      }
      /** @override **/
      ;

      _proto.offset = function offset() {
        return NaN;
      }
      /** @override **/
      ;

      _proto.equals = function equals() {
        return false;
      }
      /** @override **/
      ;

      _createClass(InvalidZone, [{
        key: "type",
        get: function get() {
          return "invalid";
        }
        /** @override **/

      }, {
        key: "name",
        get: function get() {
          return this.zoneName;
        }
        /** @override **/

      }, {
        key: "isUniversal",
        get: function get() {
          return false;
        }
      }, {
        key: "isValid",
        get: function get() {
          return false;
        }
      }]);

      return InvalidZone;
    }(Zone);

    /**
     * @private
     */
    function normalizeZone(input, defaultZone) {

      if (isUndefined(input) || input === null) {
        return defaultZone;
      } else if (input instanceof Zone) {
        return input;
      } else if (isString(input)) {
        var lowered = input.toLowerCase();
        if (lowered === "local" || lowered === "system") return defaultZone;else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;else if (IANAZone.isValidSpecifier(lowered)) return IANAZone.create(input);else return FixedOffsetZone.parseSpecifier(lowered) || new InvalidZone(input);
      } else if (isNumber(input)) {
        return FixedOffsetZone.instance(input);
      } else if (typeof input === "object" && input.offset && typeof input.offset === "number") {
        // This is dumb, but the instanceof check above doesn't seem to really work
        // so we're duck checking it
        return input;
      } else {
        return new InvalidZone(input);
      }
    }

    var now = function now() {
      return Date.now();
    },
        defaultZone = "system",
        defaultLocale = null,
        defaultNumberingSystem = null,
        defaultOutputCalendar = null,
        throwOnInvalid;
    /**
     * Settings contains static getters and setters that control Luxon's overall behavior. Luxon is a simple library with few options, but the ones it does have live here.
     */


    var Settings = /*#__PURE__*/function () {
      function Settings() {}

      /**
       * Reset Luxon's global caches. Should only be necessary in testing scenarios.
       * @return {void}
       */
      Settings.resetCaches = function resetCaches() {
        Locale.resetCache();
        IANAZone.resetCache();
      };

      _createClass(Settings, null, [{
        key: "now",
        get:
        /**
         * Get the callback for returning the current timestamp.
         * @type {function}
         */
        function get() {
          return now;
        }
        /**
         * Set the callback for returning the current timestamp.
         * The function should return a number, which will be interpreted as an Epoch millisecond count
         * @type {function}
         * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
         * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
         */
        ,
        set: function set(n) {
          now = n;
        }
        /**
         * Set the default time zone to create DateTimes in. Does not affect existing instances.
         * Use the value "system" to reset this value to the system's time zone.
         * @type {string}
         */

      }, {
        key: "defaultZone",
        get:
        /**
         * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
         * The default value is the system's time zone (the one set on the machine that runs this code).
         * @type {Zone}
         */
        function get() {
          return normalizeZone(defaultZone, SystemZone.instance);
        }
        /**
         * Get the default locale to create DateTimes with. Does not affect existing instances.
         * @type {string}
         */
        ,
        set: function set(zone) {
          defaultZone = zone;
        }
      }, {
        key: "defaultLocale",
        get: function get() {
          return defaultLocale;
        }
        /**
         * Set the default locale to create DateTimes with. Does not affect existing instances.
         * @type {string}
         */
        ,
        set: function set(locale) {
          defaultLocale = locale;
        }
        /**
         * Get the default numbering system to create DateTimes with. Does not affect existing instances.
         * @type {string}
         */

      }, {
        key: "defaultNumberingSystem",
        get: function get() {
          return defaultNumberingSystem;
        }
        /**
         * Set the default numbering system to create DateTimes with. Does not affect existing instances.
         * @type {string}
         */
        ,
        set: function set(numberingSystem) {
          defaultNumberingSystem = numberingSystem;
        }
        /**
         * Get the default output calendar to create DateTimes with. Does not affect existing instances.
         * @type {string}
         */

      }, {
        key: "defaultOutputCalendar",
        get: function get() {
          return defaultOutputCalendar;
        }
        /**
         * Set the default output calendar to create DateTimes with. Does not affect existing instances.
         * @type {string}
         */
        ,
        set: function set(outputCalendar) {
          defaultOutputCalendar = outputCalendar;
        }
        /**
         * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
         * @type {boolean}
         */

      }, {
        key: "throwOnInvalid",
        get: function get() {
          return throwOnInvalid;
        }
        /**
         * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
         * @type {boolean}
         */
        ,
        set: function set(t) {
          throwOnInvalid = t;
        }
      }]);

      return Settings;
    }();

    var _excluded = ["base"];
    var intlDTCache = {};

    function getCachedDTF(locString, opts) {
      if (opts === void 0) {
        opts = {};
      }

      var key = JSON.stringify([locString, opts]);
      var dtf = intlDTCache[key];

      if (!dtf) {
        dtf = new Intl.DateTimeFormat(locString, opts);
        intlDTCache[key] = dtf;
      }

      return dtf;
    }

    var intlNumCache = {};

    function getCachedINF(locString, opts) {
      if (opts === void 0) {
        opts = {};
      }

      var key = JSON.stringify([locString, opts]);
      var inf = intlNumCache[key];

      if (!inf) {
        inf = new Intl.NumberFormat(locString, opts);
        intlNumCache[key] = inf;
      }

      return inf;
    }

    var intlRelCache = {};

    function getCachedRTF(locString, opts) {
      if (opts === void 0) {
        opts = {};
      }

      var _opts = opts;
          _opts.base;
          var cacheKeyOpts = _objectWithoutPropertiesLoose(_opts, _excluded); // exclude `base` from the options


      var key = JSON.stringify([locString, cacheKeyOpts]);
      var inf = intlRelCache[key];

      if (!inf) {
        inf = new Intl.RelativeTimeFormat(locString, opts);
        intlRelCache[key] = inf;
      }

      return inf;
    }

    var sysLocaleCache = null;

    function systemLocale() {
      if (sysLocaleCache) {
        return sysLocaleCache;
      } else {
        sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
        return sysLocaleCache;
      }
    }

    function parseLocaleString(localeStr) {
      // I really want to avoid writing a BCP 47 parser
      // see, e.g. https://github.com/wooorm/bcp-47
      // Instead, we'll do this:
      // a) if the string has no -u extensions, just leave it alone
      // b) if it does, use Intl to resolve everything
      // c) if Intl fails, try again without the -u
      var uIndex = localeStr.indexOf("-u-");

      if (uIndex === -1) {
        return [localeStr];
      } else {
        var options;
        var smaller = localeStr.substring(0, uIndex);

        try {
          options = getCachedDTF(localeStr).resolvedOptions();
        } catch (e) {
          options = getCachedDTF(smaller).resolvedOptions();
        }

        var _options = options,
            numberingSystem = _options.numberingSystem,
            calendar = _options.calendar; // return the smaller one so that we can append the calendar and numbering overrides to it

        return [smaller, numberingSystem, calendar];
      }
    }

    function intlConfigString(localeStr, numberingSystem, outputCalendar) {
      if (outputCalendar || numberingSystem) {
        localeStr += "-u";

        if (outputCalendar) {
          localeStr += "-ca-" + outputCalendar;
        }

        if (numberingSystem) {
          localeStr += "-nu-" + numberingSystem;
        }

        return localeStr;
      } else {
        return localeStr;
      }
    }

    function mapMonths(f) {
      var ms = [];

      for (var i = 1; i <= 12; i++) {
        var dt = DateTime.utc(2016, i, 1);
        ms.push(f(dt));
      }

      return ms;
    }

    function mapWeekdays(f) {
      var ms = [];

      for (var i = 1; i <= 7; i++) {
        var dt = DateTime.utc(2016, 11, 13 + i);
        ms.push(f(dt));
      }

      return ms;
    }

    function listStuff(loc, length, defaultOK, englishFn, intlFn) {
      var mode = loc.listingMode(defaultOK);

      if (mode === "error") {
        return null;
      } else if (mode === "en") {
        return englishFn(length);
      } else {
        return intlFn(length);
      }
    }

    function supportsFastNumbers(loc) {
      if (loc.numberingSystem && loc.numberingSystem !== "latn") {
        return false;
      } else {
        return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === "latn";
      }
    }
    /**
     * @private
     */


    var PolyNumberFormatter = /*#__PURE__*/function () {
      function PolyNumberFormatter(intl, forceSimple, opts) {
        this.padTo = opts.padTo || 0;
        this.floor = opts.floor || false;

        if (!forceSimple) {
          var intlOpts = {
            useGrouping: false
          };
          if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
          this.inf = getCachedINF(intl, intlOpts);
        }
      }

      var _proto = PolyNumberFormatter.prototype;

      _proto.format = function format(i) {
        if (this.inf) {
          var fixed = this.floor ? Math.floor(i) : i;
          return this.inf.format(fixed);
        } else {
          // to match the browser's numberformatter defaults
          var _fixed = this.floor ? Math.floor(i) : roundTo(i, 3);

          return padStart(_fixed, this.padTo);
        }
      };

      return PolyNumberFormatter;
    }();
    /**
     * @private
     */


    var PolyDateFormatter = /*#__PURE__*/function () {
      function PolyDateFormatter(dt, intl, opts) {
        this.opts = opts;
        var z;

        if (dt.zone.isUniversal) {
          // UTC-8 or Etc/UTC-8 are not part of tzdata, only Etc/GMT+8 and the like.
          // That is why fixed-offset TZ is set to that unless it is:
          // 1. Representing offset 0 when UTC is used to maintain previous behavior and does not become GMT.
          // 2. Unsupported by the browser:
          //    - some do not support Etc/
          //    - < Etc/GMT-14, > Etc/GMT+12, and 30-minute or 45-minute offsets are not part of tzdata
          var gmtOffset = -1 * (dt.offset / 60);
          var offsetZ = gmtOffset >= 0 ? "Etc/GMT+" + gmtOffset : "Etc/GMT" + gmtOffset;

          if (dt.offset !== 0 && IANAZone.create(offsetZ).valid) {
            z = offsetZ;
            this.dt = dt;
          } else {
            // Not all fixed-offset zones like Etc/+4:30 are present in tzdata.
            // So we have to make do. Two cases:
            // 1. The format options tell us to show the zone. We can't do that, so the best
            // we can do is format the date in UTC.
            // 2. The format options don't tell us to show the zone. Then we can adjust them
            // the time and tell the formatter to show it to us in UTC, so that the time is right
            // and the bad zone doesn't show up.
            z = "UTC";

            if (opts.timeZoneName) {
              this.dt = dt;
            } else {
              this.dt = dt.offset === 0 ? dt : DateTime.fromMillis(dt.ts + dt.offset * 60 * 1000);
            }
          }
        } else if (dt.zone.type === "system") {
          this.dt = dt;
        } else {
          this.dt = dt;
          z = dt.zone.name;
        }

        var intlOpts = _extends({}, this.opts);

        if (z) {
          intlOpts.timeZone = z;
        }

        this.dtf = getCachedDTF(intl, intlOpts);
      }

      var _proto2 = PolyDateFormatter.prototype;

      _proto2.format = function format() {
        return this.dtf.format(this.dt.toJSDate());
      };

      _proto2.formatToParts = function formatToParts() {
        return this.dtf.formatToParts(this.dt.toJSDate());
      };

      _proto2.resolvedOptions = function resolvedOptions() {
        return this.dtf.resolvedOptions();
      };

      return PolyDateFormatter;
    }();
    /**
     * @private
     */


    var PolyRelFormatter = /*#__PURE__*/function () {
      function PolyRelFormatter(intl, isEnglish, opts) {
        this.opts = _extends({
          style: "long"
        }, opts);

        if (!isEnglish && hasRelative()) {
          this.rtf = getCachedRTF(intl, opts);
        }
      }

      var _proto3 = PolyRelFormatter.prototype;

      _proto3.format = function format(count, unit) {
        if (this.rtf) {
          return this.rtf.format(count, unit);
        } else {
          return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
        }
      };

      _proto3.formatToParts = function formatToParts(count, unit) {
        if (this.rtf) {
          return this.rtf.formatToParts(count, unit);
        } else {
          return [];
        }
      };

      return PolyRelFormatter;
    }();
    /**
     * @private
     */


    var Locale = /*#__PURE__*/function () {
      Locale.fromOpts = function fromOpts(opts) {
        return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.defaultToEN);
      };

      Locale.create = function create(locale, numberingSystem, outputCalendar, defaultToEN) {
        if (defaultToEN === void 0) {
          defaultToEN = false;
        }

        var specifiedLocale = locale || Settings.defaultLocale; // the system locale is useful for human readable strings but annoying for parsing/formatting known formats

        var localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
        var numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
        var outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
        return new Locale(localeR, numberingSystemR, outputCalendarR, specifiedLocale);
      };

      Locale.resetCache = function resetCache() {
        sysLocaleCache = null;
        intlDTCache = {};
        intlNumCache = {};
        intlRelCache = {};
      };

      Locale.fromObject = function fromObject(_temp) {
        var _ref = _temp === void 0 ? {} : _temp,
            locale = _ref.locale,
            numberingSystem = _ref.numberingSystem,
            outputCalendar = _ref.outputCalendar;

        return Locale.create(locale, numberingSystem, outputCalendar);
      };

      function Locale(locale, numbering, outputCalendar, specifiedLocale) {
        var _parseLocaleString = parseLocaleString(locale),
            parsedLocale = _parseLocaleString[0],
            parsedNumberingSystem = _parseLocaleString[1],
            parsedOutputCalendar = _parseLocaleString[2];

        this.locale = parsedLocale;
        this.numberingSystem = numbering || parsedNumberingSystem || null;
        this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
        this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
        this.weekdaysCache = {
          format: {},
          standalone: {}
        };
        this.monthsCache = {
          format: {},
          standalone: {}
        };
        this.meridiemCache = null;
        this.eraCache = {};
        this.specifiedLocale = specifiedLocale;
        this.fastNumbersCached = null;
      }

      var _proto4 = Locale.prototype;

      _proto4.listingMode = function listingMode(defaultOK) {

        var isActuallyEn = this.isEnglish();
        var hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
        return isActuallyEn && hasNoWeirdness ? "en" : "intl";
      };

      _proto4.clone = function clone(alts) {
        if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
          return this;
        } else {
          return Locale.create(alts.locale || this.specifiedLocale, alts.numberingSystem || this.numberingSystem, alts.outputCalendar || this.outputCalendar, alts.defaultToEN || false);
        }
      };

      _proto4.redefaultToEN = function redefaultToEN(alts) {
        if (alts === void 0) {
          alts = {};
        }

        return this.clone(_extends({}, alts, {
          defaultToEN: true
        }));
      };

      _proto4.redefaultToSystem = function redefaultToSystem(alts) {
        if (alts === void 0) {
          alts = {};
        }

        return this.clone(_extends({}, alts, {
          defaultToEN: false
        }));
      };

      _proto4.months = function months$1(length, format, defaultOK) {
        var _this = this;

        if (format === void 0) {
          format = false;
        }

        if (defaultOK === void 0) {
          defaultOK = true;
        }

        return listStuff(this, length, defaultOK, months, function () {
          var intl = format ? {
            month: length,
            day: "numeric"
          } : {
            month: length
          },
              formatStr = format ? "format" : "standalone";

          if (!_this.monthsCache[formatStr][length]) {
            _this.monthsCache[formatStr][length] = mapMonths(function (dt) {
              return _this.extract(dt, intl, "month");
            });
          }

          return _this.monthsCache[formatStr][length];
        });
      };

      _proto4.weekdays = function weekdays$1(length, format, defaultOK) {
        var _this2 = this;

        if (format === void 0) {
          format = false;
        }

        if (defaultOK === void 0) {
          defaultOK = true;
        }

        return listStuff(this, length, defaultOK, weekdays, function () {
          var intl = format ? {
            weekday: length,
            year: "numeric",
            month: "long",
            day: "numeric"
          } : {
            weekday: length
          },
              formatStr = format ? "format" : "standalone";

          if (!_this2.weekdaysCache[formatStr][length]) {
            _this2.weekdaysCache[formatStr][length] = mapWeekdays(function (dt) {
              return _this2.extract(dt, intl, "weekday");
            });
          }

          return _this2.weekdaysCache[formatStr][length];
        });
      };

      _proto4.meridiems = function meridiems$1(defaultOK) {
        var _this3 = this;

        if (defaultOK === void 0) {
          defaultOK = true;
        }

        return listStuff(this, undefined, defaultOK, function () {
          return meridiems;
        }, function () {
          // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
          // for AM and PM. This is probably wrong, but it's makes parsing way easier.
          if (!_this3.meridiemCache) {
            var intl = {
              hour: "numeric",
              hourCycle: "h12"
            };
            _this3.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(function (dt) {
              return _this3.extract(dt, intl, "dayperiod");
            });
          }

          return _this3.meridiemCache;
        });
      };

      _proto4.eras = function eras$1(length, defaultOK) {
        var _this4 = this;

        if (defaultOK === void 0) {
          defaultOK = true;
        }

        return listStuff(this, length, defaultOK, eras, function () {
          var intl = {
            era: length
          }; // This is problematic. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
          // to definitely enumerate them.

          if (!_this4.eraCache[length]) {
            _this4.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(function (dt) {
              return _this4.extract(dt, intl, "era");
            });
          }

          return _this4.eraCache[length];
        });
      };

      _proto4.extract = function extract(dt, intlOpts, field) {
        var df = this.dtFormatter(dt, intlOpts),
            results = df.formatToParts(),
            matching = results.find(function (m) {
          return m.type.toLowerCase() === field;
        });
        return matching ? matching.value : null;
      };

      _proto4.numberFormatter = function numberFormatter(opts) {
        if (opts === void 0) {
          opts = {};
        }

        // this forcesimple option is never used (the only caller short-circuits on it, but it seems safer to leave)
        // (in contrast, the rest of the condition is used heavily)
        return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
      };

      _proto4.dtFormatter = function dtFormatter(dt, intlOpts) {
        if (intlOpts === void 0) {
          intlOpts = {};
        }

        return new PolyDateFormatter(dt, this.intl, intlOpts);
      };

      _proto4.relFormatter = function relFormatter(opts) {
        if (opts === void 0) {
          opts = {};
        }

        return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
      };

      _proto4.isEnglish = function isEnglish() {
        return this.locale === "en" || this.locale.toLowerCase() === "en-us" || new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us");
      };

      _proto4.equals = function equals(other) {
        return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
      };

      _createClass(Locale, [{
        key: "fastNumbers",
        get: function get() {
          if (this.fastNumbersCached == null) {
            this.fastNumbersCached = supportsFastNumbers(this);
          }

          return this.fastNumbersCached;
        }
      }]);

      return Locale;
    }();

    /*
     * This file handles parsing for well-specified formats. Here's how it works:
     * Two things go into parsing: a regex to match with and an extractor to take apart the groups in the match.
     * An extractor is just a function that takes a regex match array and returns a { year: ..., month: ... } object
     * parse() does the work of executing the regex and applying the extractor. It takes multiple regex/extractor pairs to try in sequence.
     * Extractors can take a "cursor" representing the offset in the match to look at. This makes it easy to combine extractors.
     * combineExtractors() does the work of combining them, keeping track of the cursor through multiple extractions.
     * Some extractions are super dumb and simpleParse and fromStrings help DRY them.
     */

    function combineRegexes() {
      for (var _len = arguments.length, regexes = new Array(_len), _key = 0; _key < _len; _key++) {
        regexes[_key] = arguments[_key];
      }

      var full = regexes.reduce(function (f, r) {
        return f + r.source;
      }, "");
      return RegExp("^" + full + "$");
    }

    function combineExtractors() {
      for (var _len2 = arguments.length, extractors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        extractors[_key2] = arguments[_key2];
      }

      return function (m) {
        return extractors.reduce(function (_ref, ex) {
          var mergedVals = _ref[0],
              mergedZone = _ref[1],
              cursor = _ref[2];

          var _ex = ex(m, cursor),
              val = _ex[0],
              zone = _ex[1],
              next = _ex[2];

          return [_extends({}, mergedVals, val), mergedZone || zone, next];
        }, [{}, null, 1]).slice(0, 2);
      };
    }

    function parse(s) {
      if (s == null) {
        return [null, null];
      }

      for (var _len3 = arguments.length, patterns = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        patterns[_key3 - 1] = arguments[_key3];
      }

      for (var _i = 0, _patterns = patterns; _i < _patterns.length; _i++) {
        var _patterns$_i = _patterns[_i],
            regex = _patterns$_i[0],
            extractor = _patterns$_i[1];
        var m = regex.exec(s);

        if (m) {
          return extractor(m);
        }
      }

      return [null, null];
    }

    function simpleParse() {
      for (var _len4 = arguments.length, keys = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        keys[_key4] = arguments[_key4];
      }

      return function (match, cursor) {
        var ret = {};
        var i;

        for (i = 0; i < keys.length; i++) {
          ret[keys[i]] = parseInteger(match[cursor + i]);
        }

        return [ret, null, cursor + i];
      };
    } // ISO and SQL parsing


    var offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/,
        isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,
        isoTimeRegex = RegExp("" + isoTimeBaseRegex.source + offsetRegex.source + "?"),
        isoTimeExtensionRegex = RegExp("(?:T" + isoTimeRegex.source + ")?"),
        isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,
        isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/,
        isoOrdinalRegex = /(\d{4})-?(\d{3})/,
        extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay"),
        extractISOOrdinalData = simpleParse("year", "ordinal"),
        sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/,
        // dumbed-down version of the ISO one
    sqlTimeRegex = RegExp(isoTimeBaseRegex.source + " ?(?:" + offsetRegex.source + "|(" + ianaRegex.source + "))?"),
        sqlTimeExtensionRegex = RegExp("(?: " + sqlTimeRegex.source + ")?");

    function int(match, pos, fallback) {
      var m = match[pos];
      return isUndefined(m) ? fallback : parseInteger(m);
    }

    function extractISOYmd(match, cursor) {
      var item = {
        year: int(match, cursor),
        month: int(match, cursor + 1, 1),
        day: int(match, cursor + 2, 1)
      };
      return [item, null, cursor + 3];
    }

    function extractISOTime(match, cursor) {
      var item = {
        hours: int(match, cursor, 0),
        minutes: int(match, cursor + 1, 0),
        seconds: int(match, cursor + 2, 0),
        milliseconds: parseMillis(match[cursor + 3])
      };
      return [item, null, cursor + 4];
    }

    function extractISOOffset(match, cursor) {
      var local = !match[cursor] && !match[cursor + 1],
          fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]),
          zone = local ? null : FixedOffsetZone.instance(fullOffset);
      return [{}, zone, cursor + 3];
    }

    function extractIANAZone(match, cursor) {
      var zone = match[cursor] ? IANAZone.create(match[cursor]) : null;
      return [{}, zone, cursor + 1];
    } // ISO time parsing


    var isoTimeOnly = RegExp("^T?" + isoTimeBaseRegex.source + "$"); // ISO duration parsing

    var isoDuration = /^-?P(?:(?:(-?\d{1,9}(?:\.\d{1,9})?)Y)?(?:(-?\d{1,9}(?:\.\d{1,9})?)M)?(?:(-?\d{1,9}(?:\.\d{1,9})?)W)?(?:(-?\d{1,9}(?:\.\d{1,9})?)D)?(?:T(?:(-?\d{1,9}(?:\.\d{1,9})?)H)?(?:(-?\d{1,9}(?:\.\d{1,9})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,9}))?S)?)?)$/;

    function extractISODuration(match) {
      var s = match[0],
          yearStr = match[1],
          monthStr = match[2],
          weekStr = match[3],
          dayStr = match[4],
          hourStr = match[5],
          minuteStr = match[6],
          secondStr = match[7],
          millisecondsStr = match[8];
      var hasNegativePrefix = s[0] === "-";
      var negativeSeconds = secondStr && secondStr[0] === "-";

      var maybeNegate = function maybeNegate(num, force) {
        if (force === void 0) {
          force = false;
        }

        return num !== undefined && (force || num && hasNegativePrefix) ? -num : num;
      };

      return [{
        years: maybeNegate(parseFloating(yearStr)),
        months: maybeNegate(parseFloating(monthStr)),
        weeks: maybeNegate(parseFloating(weekStr)),
        days: maybeNegate(parseFloating(dayStr)),
        hours: maybeNegate(parseFloating(hourStr)),
        minutes: maybeNegate(parseFloating(minuteStr)),
        seconds: maybeNegate(parseFloating(secondStr), secondStr === "-0"),
        milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
      }];
    } // These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
    // and not just that we're in -240 *right now*. But since I don't think these are used that often
    // I'm just going to ignore that


    var obsOffsets = {
      GMT: 0,
      EDT: -4 * 60,
      EST: -5 * 60,
      CDT: -5 * 60,
      CST: -6 * 60,
      MDT: -6 * 60,
      MST: -7 * 60,
      PDT: -7 * 60,
      PST: -8 * 60
    };

    function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
      var result = {
        year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
        month: monthsShort.indexOf(monthStr) + 1,
        day: parseInteger(dayStr),
        hour: parseInteger(hourStr),
        minute: parseInteger(minuteStr)
      };
      if (secondStr) result.second = parseInteger(secondStr);

      if (weekdayStr) {
        result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
      }

      return result;
    } // RFC 2822/5322


    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;

    function extractRFC2822(match) {
      var weekdayStr = match[1],
          dayStr = match[2],
          monthStr = match[3],
          yearStr = match[4],
          hourStr = match[5],
          minuteStr = match[6],
          secondStr = match[7],
          obsOffset = match[8],
          milOffset = match[9],
          offHourStr = match[10],
          offMinuteStr = match[11],
          result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      var offset;

      if (obsOffset) {
        offset = obsOffsets[obsOffset];
      } else if (milOffset) {
        offset = 0;
      } else {
        offset = signedOffset(offHourStr, offMinuteStr);
      }

      return [result, new FixedOffsetZone(offset)];
    }

    function preprocessRFC2822(s) {
      // Remove comments and folding whitespace and replace multiple-spaces with a single space
      return s.replace(/\([^)]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
    } // http date


    var rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
        rfc850 = /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
        ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

    function extractRFC1123Or850(match) {
      var weekdayStr = match[1],
          dayStr = match[2],
          monthStr = match[3],
          yearStr = match[4],
          hourStr = match[5],
          minuteStr = match[6],
          secondStr = match[7],
          result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      return [result, FixedOffsetZone.utcInstance];
    }

    function extractASCII(match) {
      var weekdayStr = match[1],
          monthStr = match[2],
          dayStr = match[3],
          hourStr = match[4],
          minuteStr = match[5],
          secondStr = match[6],
          yearStr = match[7],
          result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      return [result, FixedOffsetZone.utcInstance];
    }

    var isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
    var isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
    var isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
    var isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
    var extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset);
    var extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset);
    var extractISOOrdinalDateAndTime = combineExtractors(extractISOOrdinalData, extractISOTime, extractISOOffset);
    var extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset);
    /**
     * @private
     */

    function parseISODate(s) {
      return parse(s, [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset], [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime], [isoTimeCombinedRegex, extractISOTimeAndOffset]);
    }
    function parseRFC2822Date(s) {
      return parse(preprocessRFC2822(s), [rfc2822, extractRFC2822]);
    }
    function parseHTTPDate(s) {
      return parse(s, [rfc1123, extractRFC1123Or850], [rfc850, extractRFC1123Or850], [ascii, extractASCII]);
    }
    function parseISODuration(s) {
      return parse(s, [isoDuration, extractISODuration]);
    }
    var extractISOTimeOnly = combineExtractors(extractISOTime);
    function parseISOTimeOnly(s) {
      return parse(s, [isoTimeOnly, extractISOTimeOnly]);
    }
    var sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
    var sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
    var extractISOYmdTimeOffsetAndIANAZone = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset, extractIANAZone);
    var extractISOTimeOffsetAndIANAZone = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
    function parseSQL(s) {
      return parse(s, [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeOffsetAndIANAZone], [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]);
    }

    var INVALID$2 = "Invalid Duration"; // unit conversion constants

    var lowOrderMatrix = {
      weeks: {
        days: 7,
        hours: 7 * 24,
        minutes: 7 * 24 * 60,
        seconds: 7 * 24 * 60 * 60,
        milliseconds: 7 * 24 * 60 * 60 * 1000
      },
      days: {
        hours: 24,
        minutes: 24 * 60,
        seconds: 24 * 60 * 60,
        milliseconds: 24 * 60 * 60 * 1000
      },
      hours: {
        minutes: 60,
        seconds: 60 * 60,
        milliseconds: 60 * 60 * 1000
      },
      minutes: {
        seconds: 60,
        milliseconds: 60 * 1000
      },
      seconds: {
        milliseconds: 1000
      }
    },
        casualMatrix = _extends({
      years: {
        quarters: 4,
        months: 12,
        weeks: 52,
        days: 365,
        hours: 365 * 24,
        minutes: 365 * 24 * 60,
        seconds: 365 * 24 * 60 * 60,
        milliseconds: 365 * 24 * 60 * 60 * 1000
      },
      quarters: {
        months: 3,
        weeks: 13,
        days: 91,
        hours: 91 * 24,
        minutes: 91 * 24 * 60,
        seconds: 91 * 24 * 60 * 60,
        milliseconds: 91 * 24 * 60 * 60 * 1000
      },
      months: {
        weeks: 4,
        days: 30,
        hours: 30 * 24,
        minutes: 30 * 24 * 60,
        seconds: 30 * 24 * 60 * 60,
        milliseconds: 30 * 24 * 60 * 60 * 1000
      }
    }, lowOrderMatrix),
        daysInYearAccurate = 146097.0 / 400,
        daysInMonthAccurate = 146097.0 / 4800,
        accurateMatrix = _extends({
      years: {
        quarters: 4,
        months: 12,
        weeks: daysInYearAccurate / 7,
        days: daysInYearAccurate,
        hours: daysInYearAccurate * 24,
        minutes: daysInYearAccurate * 24 * 60,
        seconds: daysInYearAccurate * 24 * 60 * 60,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000
      },
      quarters: {
        months: 3,
        weeks: daysInYearAccurate / 28,
        days: daysInYearAccurate / 4,
        hours: daysInYearAccurate * 24 / 4,
        minutes: daysInYearAccurate * 24 * 60 / 4,
        seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000 / 4
      },
      months: {
        weeks: daysInMonthAccurate / 7,
        days: daysInMonthAccurate,
        hours: daysInMonthAccurate * 24,
        minutes: daysInMonthAccurate * 24 * 60,
        seconds: daysInMonthAccurate * 24 * 60 * 60,
        milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000
      }
    }, lowOrderMatrix); // units ordered by size

    var orderedUnits$1 = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
    var reverseUnits = orderedUnits$1.slice(0).reverse(); // clone really means "create another instance just like this one, but with these changes"

    function clone$1(dur, alts, clear) {
      if (clear === void 0) {
        clear = false;
      }

      // deep merge for vals
      var conf = {
        values: clear ? alts.values : _extends({}, dur.values, alts.values || {}),
        loc: dur.loc.clone(alts.loc),
        conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy
      };
      return new Duration(conf);
    }

    function antiTrunc(n) {
      return n < 0 ? Math.floor(n) : Math.ceil(n);
    } // NB: mutates parameters


    function convert(matrix, fromMap, fromUnit, toMap, toUnit) {
      var conv = matrix[toUnit][fromUnit],
          raw = fromMap[fromUnit] / conv,
          sameSign = Math.sign(raw) === Math.sign(toMap[toUnit]),
          // ok, so this is wild, but see the matrix in the tests
      added = !sameSign && toMap[toUnit] !== 0 && Math.abs(raw) <= 1 ? antiTrunc(raw) : Math.trunc(raw);
      toMap[toUnit] += added;
      fromMap[fromUnit] -= added * conv;
    } // NB: mutates parameters


    function normalizeValues(matrix, vals) {
      reverseUnits.reduce(function (previous, current) {
        if (!isUndefined(vals[current])) {
          if (previous) {
            convert(matrix, vals, previous, vals, current);
          }

          return current;
        } else {
          return previous;
        }
      }, null);
    }
    /**
     * A Duration object represents a period of time, like "2 months" or "1 day, 1 hour". Conceptually, it's just a map of units to their quantities, accompanied by some additional configuration and methods for creating, parsing, interrogating, transforming, and formatting them. They can be used on their own or in conjunction with other Luxon types; for example, you can use {@link DateTime#plus} to add a Duration object to a DateTime, producing another DateTime.
     *
     * Here is a brief overview of commonly used methods and getters in Duration:
     *
     * * **Creation** To create a Duration, use {@link Duration#fromMillis}, {@link Duration#fromObject}, or {@link Duration#fromISO}.
     * * **Unit values** See the {@link Duration#years}, {@link Duration.months}, {@link Duration#weeks}, {@link Duration#days}, {@link Duration#hours}, {@link Duration#minutes}, {@link Duration#seconds}, {@link Duration#milliseconds} accessors.
     * * **Configuration** See  {@link Duration#locale} and {@link Duration#numberingSystem} accessors.
     * * **Transformation** To create new Durations out of old ones use {@link Duration#plus}, {@link Duration#minus}, {@link Duration#normalize}, {@link Duration#set}, {@link Duration#reconfigure}, {@link Duration#shiftTo}, and {@link Duration#negate}.
     * * **Output** To convert the Duration into other representations, see {@link Duration#as}, {@link Duration#toISO}, {@link Duration#toFormat}, and {@link Duration#toJSON}
     *
     * There's are more methods documented below. In addition, for more information on subtler topics like internationalization and validity, see the external documentation.
     */


    var Duration = /*#__PURE__*/function () {
      /**
       * @private
       */
      function Duration(config) {
        var accurate = config.conversionAccuracy === "longterm" || false;
        /**
         * @access private
         */

        this.values = config.values;
        /**
         * @access private
         */

        this.loc = config.loc || Locale.create();
        /**
         * @access private
         */

        this.conversionAccuracy = accurate ? "longterm" : "casual";
        /**
         * @access private
         */

        this.invalid = config.invalid || null;
        /**
         * @access private
         */

        this.matrix = accurate ? accurateMatrix : casualMatrix;
        /**
         * @access private
         */

        this.isLuxonDuration = true;
      }
      /**
       * Create Duration from a number of milliseconds.
       * @param {number} count of milliseconds
       * @param {Object} opts - options for parsing
       * @param {string} [opts.locale='en-US'] - the locale to use
       * @param {string} opts.numberingSystem - the numbering system to use
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @return {Duration}
       */


      Duration.fromMillis = function fromMillis(count, opts) {
        return Duration.fromObject({
          milliseconds: count
        }, opts);
      }
      /**
       * Create a Duration from a JavaScript object with keys like 'years' and 'hours'.
       * If this object is empty then a zero milliseconds duration is returned.
       * @param {Object} obj - the object to create the DateTime from
       * @param {number} obj.years
       * @param {number} obj.quarters
       * @param {number} obj.months
       * @param {number} obj.weeks
       * @param {number} obj.days
       * @param {number} obj.hours
       * @param {number} obj.minutes
       * @param {number} obj.seconds
       * @param {number} obj.milliseconds
       * @param {Object} [opts=[]] - options for creating this Duration
       * @param {string} [opts.locale='en-US'] - the locale to use
       * @param {string} opts.numberingSystem - the numbering system to use
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @return {Duration}
       */
      ;

      Duration.fromObject = function fromObject(obj, opts) {
        if (opts === void 0) {
          opts = {};
        }

        if (obj == null || typeof obj !== "object") {
          throw new InvalidArgumentError("Duration.fromObject: argument expected to be an object, got " + (obj === null ? "null" : typeof obj));
        }

        return new Duration({
          values: normalizeObject(obj, Duration.normalizeUnit),
          loc: Locale.fromObject(opts),
          conversionAccuracy: opts.conversionAccuracy
        });
      }
      /**
       * Create a Duration from DurationLike.
       *
       * @param {Object | number | Duration} durationLike
       * One of:
       * - object with keys like 'years' and 'hours'.
       * - number representing milliseconds
       * - Duration instance
       * @return {Duration}
       */
      ;

      Duration.fromDurationLike = function fromDurationLike(durationLike) {
        if (isNumber(durationLike)) {
          return Duration.fromMillis(durationLike);
        } else if (Duration.isDuration(durationLike)) {
          return durationLike;
        } else if (typeof durationLike === "object") {
          return Duration.fromObject(durationLike);
        } else {
          throw new InvalidArgumentError("Unknown duration argument " + durationLike + " of type " + typeof durationLike);
        }
      }
      /**
       * Create a Duration from an ISO 8601 duration string.
       * @param {string} text - text to parse
       * @param {Object} opts - options for parsing
       * @param {string} [opts.locale='en-US'] - the locale to use
       * @param {string} opts.numberingSystem - the numbering system to use
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
       * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
       * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
       * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
       * @return {Duration}
       */
      ;

      Duration.fromISO = function fromISO(text, opts) {
        var _parseISODuration = parseISODuration(text),
            parsed = _parseISODuration[0];

        if (parsed) {
          return Duration.fromObject(parsed, opts);
        } else {
          return Duration.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
        }
      }
      /**
       * Create a Duration from an ISO 8601 time string.
       * @param {string} text - text to parse
       * @param {Object} opts - options for parsing
       * @param {string} [opts.locale='en-US'] - the locale to use
       * @param {string} opts.numberingSystem - the numbering system to use
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @see https://en.wikipedia.org/wiki/ISO_8601#Times
       * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
       * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
       * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
       * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
       * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
       * @return {Duration}
       */
      ;

      Duration.fromISOTime = function fromISOTime(text, opts) {
        var _parseISOTimeOnly = parseISOTimeOnly(text),
            parsed = _parseISOTimeOnly[0];

        if (parsed) {
          return Duration.fromObject(parsed, opts);
        } else {
          return Duration.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
        }
      }
      /**
       * Create an invalid Duration.
       * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
       * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
       * @return {Duration}
       */
      ;

      Duration.invalid = function invalid(reason, explanation) {
        if (explanation === void 0) {
          explanation = null;
        }

        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
        }

        var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

        if (Settings.throwOnInvalid) {
          throw new InvalidDurationError(invalid);
        } else {
          return new Duration({
            invalid: invalid
          });
        }
      }
      /**
       * @private
       */
      ;

      Duration.normalizeUnit = function normalizeUnit(unit) {
        var normalized = {
          year: "years",
          years: "years",
          quarter: "quarters",
          quarters: "quarters",
          month: "months",
          months: "months",
          week: "weeks",
          weeks: "weeks",
          day: "days",
          days: "days",
          hour: "hours",
          hours: "hours",
          minute: "minutes",
          minutes: "minutes",
          second: "seconds",
          seconds: "seconds",
          millisecond: "milliseconds",
          milliseconds: "milliseconds"
        }[unit ? unit.toLowerCase() : unit];
        if (!normalized) throw new InvalidUnitError(unit);
        return normalized;
      }
      /**
       * Check if an object is a Duration. Works across context boundaries
       * @param {object} o
       * @return {boolean}
       */
      ;

      Duration.isDuration = function isDuration(o) {
        return o && o.isLuxonDuration || false;
      }
      /**
       * Get  the locale of a Duration, such 'en-GB'
       * @type {string}
       */
      ;

      var _proto = Duration.prototype;

      /**
       * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
       * * `S` for milliseconds
       * * `s` for seconds
       * * `m` for minutes
       * * `h` for hours
       * * `d` for days
       * * `M` for months
       * * `y` for years
       * Notes:
       * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
       * * The duration will be converted to the set of units in the format string using {@link Duration#shiftTo} and the Durations's conversion accuracy setting.
       * @param {string} fmt - the format string
       * @param {Object} opts - options
       * @param {boolean} [opts.floor=true] - floor numerical values
       * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
       * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
       * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
       * @return {string}
       */
      _proto.toFormat = function toFormat(fmt, opts) {
        if (opts === void 0) {
          opts = {};
        }

        // reverse-compat since 1.2; we always round down now, never up, and we do it by default
        var fmtOpts = _extends({}, opts, {
          floor: opts.round !== false && opts.floor !== false
        });

        return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID$2;
      }
      /**
       * Returns a JavaScript object with this Duration's values.
       * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
       * @return {Object}
       */
      ;

      _proto.toObject = function toObject() {
        if (!this.isValid) return {};
        return _extends({}, this.values);
      }
      /**
       * Returns an ISO 8601-compliant string representation of this Duration.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
       * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
       * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
       * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
       * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
       * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
       * @return {string}
       */
      ;

      _proto.toISO = function toISO() {
        // we could use the formatter, but this is an easier way to get the minimum string
        if (!this.isValid) return null;
        var s = "P";
        if (this.years !== 0) s += this.years + "Y";
        if (this.months !== 0 || this.quarters !== 0) s += this.months + this.quarters * 3 + "M";
        if (this.weeks !== 0) s += this.weeks + "W";
        if (this.days !== 0) s += this.days + "D";
        if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0) s += "T";
        if (this.hours !== 0) s += this.hours + "H";
        if (this.minutes !== 0) s += this.minutes + "M";
        if (this.seconds !== 0 || this.milliseconds !== 0) // this will handle "floating point madness" by removing extra decimal places
          // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
          s += roundTo(this.seconds + this.milliseconds / 1000, 3) + "S";
        if (s === "P") s += "T0S";
        return s;
      }
      /**
       * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
       * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Times
       * @param {Object} opts - options
       * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
       * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
       * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
       * @param {string} [opts.format='extended'] - choose between the basic and extended format
       * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
       * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
       * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
       * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
       * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
       * @return {string}
       */
      ;

      _proto.toISOTime = function toISOTime(opts) {
        if (opts === void 0) {
          opts = {};
        }

        if (!this.isValid) return null;
        var millis = this.toMillis();
        if (millis < 0 || millis >= 86400000) return null;
        opts = _extends({
          suppressMilliseconds: false,
          suppressSeconds: false,
          includePrefix: false,
          format: "extended"
        }, opts);
        var value = this.shiftTo("hours", "minutes", "seconds", "milliseconds");
        var fmt = opts.format === "basic" ? "hhmm" : "hh:mm";

        if (!opts.suppressSeconds || value.seconds !== 0 || value.milliseconds !== 0) {
          fmt += opts.format === "basic" ? "ss" : ":ss";

          if (!opts.suppressMilliseconds || value.milliseconds !== 0) {
            fmt += ".SSS";
          }
        }

        var str = value.toFormat(fmt);

        if (opts.includePrefix) {
          str = "T" + str;
        }

        return str;
      }
      /**
       * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
       * @return {string}
       */
      ;

      _proto.toJSON = function toJSON() {
        return this.toISO();
      }
      /**
       * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
       * @return {string}
       */
      ;

      _proto.toString = function toString() {
        return this.toISO();
      }
      /**
       * Returns an milliseconds value of this Duration.
       * @return {number}
       */
      ;

      _proto.toMillis = function toMillis() {
        return this.as("milliseconds");
      }
      /**
       * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
       * @return {number}
       */
      ;

      _proto.valueOf = function valueOf() {
        return this.toMillis();
      }
      /**
       * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
       * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
       * @return {Duration}
       */
      ;

      _proto.plus = function plus(duration) {
        if (!this.isValid) return this;
        var dur = Duration.fromDurationLike(duration),
            result = {};

        for (var _iterator = _createForOfIteratorHelperLoose(orderedUnits$1), _step; !(_step = _iterator()).done;) {
          var k = _step.value;

          if (hasOwnProperty(dur.values, k) || hasOwnProperty(this.values, k)) {
            result[k] = dur.get(k) + this.get(k);
          }
        }

        return clone$1(this, {
          values: result
        }, true);
      }
      /**
       * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
       * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
       * @return {Duration}
       */
      ;

      _proto.minus = function minus(duration) {
        if (!this.isValid) return this;
        var dur = Duration.fromDurationLike(duration);
        return this.plus(dur.negate());
      }
      /**
       * Scale this Duration by the specified amount. Return a newly-constructed Duration.
       * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
       * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits(x => x * 2) //=> { hours: 2, minutes: 60 }
       * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits((x, u) => u === "hour" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
       * @return {Duration}
       */
      ;

      _proto.mapUnits = function mapUnits(fn) {
        if (!this.isValid) return this;
        var result = {};

        for (var _i = 0, _Object$keys = Object.keys(this.values); _i < _Object$keys.length; _i++) {
          var k = _Object$keys[_i];
          result[k] = asNumber(fn(this.values[k], k));
        }

        return clone$1(this, {
          values: result
        }, true);
      }
      /**
       * Get the value of unit.
       * @param {string} unit - a unit such as 'minute' or 'day'
       * @example Duration.fromObject({years: 2, days: 3}).get('years') //=> 2
       * @example Duration.fromObject({years: 2, days: 3}).get('months') //=> 0
       * @example Duration.fromObject({years: 2, days: 3}).get('days') //=> 3
       * @return {number}
       */
      ;

      _proto.get = function get(unit) {
        return this[Duration.normalizeUnit(unit)];
      }
      /**
       * "Set" the values of specified units. Return a newly-constructed Duration.
       * @param {Object} values - a mapping of units to numbers
       * @example dur.set({ years: 2017 })
       * @example dur.set({ hours: 8, minutes: 30 })
       * @return {Duration}
       */
      ;

      _proto.set = function set(values) {
        if (!this.isValid) return this;

        var mixed = _extends({}, this.values, normalizeObject(values, Duration.normalizeUnit));

        return clone$1(this, {
          values: mixed
        });
      }
      /**
       * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
       * @example dur.reconfigure({ locale: 'en-GB' })
       * @return {Duration}
       */
      ;

      _proto.reconfigure = function reconfigure(_temp) {
        var _ref = _temp === void 0 ? {} : _temp,
            locale = _ref.locale,
            numberingSystem = _ref.numberingSystem,
            conversionAccuracy = _ref.conversionAccuracy;

        var loc = this.loc.clone({
          locale: locale,
          numberingSystem: numberingSystem
        }),
            opts = {
          loc: loc
        };

        if (conversionAccuracy) {
          opts.conversionAccuracy = conversionAccuracy;
        }

        return clone$1(this, opts);
      }
      /**
       * Return the length of the duration in the specified unit.
       * @param {string} unit - a unit such as 'minutes' or 'days'
       * @example Duration.fromObject({years: 1}).as('days') //=> 365
       * @example Duration.fromObject({years: 1}).as('months') //=> 12
       * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
       * @return {number}
       */
      ;

      _proto.as = function as(unit) {
        return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
      }
      /**
       * Reduce this Duration to its canonical representation in its current units.
       * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
       * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
       * @return {Duration}
       */
      ;

      _proto.normalize = function normalize() {
        if (!this.isValid) return this;
        var vals = this.toObject();
        normalizeValues(this.matrix, vals);
        return clone$1(this, {
          values: vals
        }, true);
      }
      /**
       * Convert this Duration into its representation in a different set of units.
       * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
       * @return {Duration}
       */
      ;

      _proto.shiftTo = function shiftTo() {
        for (var _len = arguments.length, units = new Array(_len), _key = 0; _key < _len; _key++) {
          units[_key] = arguments[_key];
        }

        if (!this.isValid) return this;

        if (units.length === 0) {
          return this;
        }

        units = units.map(function (u) {
          return Duration.normalizeUnit(u);
        });
        var built = {},
            accumulated = {},
            vals = this.toObject();
        var lastUnit;

        for (var _iterator2 = _createForOfIteratorHelperLoose(orderedUnits$1), _step2; !(_step2 = _iterator2()).done;) {
          var k = _step2.value;

          if (units.indexOf(k) >= 0) {
            lastUnit = k;
            var own = 0; // anything we haven't boiled down yet should get boiled to this unit

            for (var ak in accumulated) {
              own += this.matrix[ak][k] * accumulated[ak];
              accumulated[ak] = 0;
            } // plus anything that's already in this unit


            if (isNumber(vals[k])) {
              own += vals[k];
            }

            var i = Math.trunc(own);
            built[k] = i;
            accumulated[k] = (own * 1000 - i * 1000) / 1000; // plus anything further down the chain that should be rolled up in to this

            for (var down in vals) {
              if (orderedUnits$1.indexOf(down) > orderedUnits$1.indexOf(k)) {
                convert(this.matrix, vals, down, built, k);
              }
            } // otherwise, keep it in the wings to boil it later

          } else if (isNumber(vals[k])) {
            accumulated[k] = vals[k];
          }
        } // anything leftover becomes the decimal for the last unit
        // lastUnit must be defined since units is not empty


        for (var key in accumulated) {
          if (accumulated[key] !== 0) {
            built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
          }
        }

        return clone$1(this, {
          values: built
        }, true).normalize();
      }
      /**
       * Return the negative of this Duration.
       * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
       * @return {Duration}
       */
      ;

      _proto.negate = function negate() {
        if (!this.isValid) return this;
        var negated = {};

        for (var _i2 = 0, _Object$keys2 = Object.keys(this.values); _i2 < _Object$keys2.length; _i2++) {
          var k = _Object$keys2[_i2];
          negated[k] = -this.values[k];
        }

        return clone$1(this, {
          values: negated
        }, true);
      }
      /**
       * Get the years.
       * @type {number}
       */
      ;

      /**
       * Equality check
       * Two Durations are equal iff they have the same units and the same values for each unit.
       * @param {Duration} other
       * @return {boolean}
       */
      _proto.equals = function equals(other) {
        if (!this.isValid || !other.isValid) {
          return false;
        }

        if (!this.loc.equals(other.loc)) {
          return false;
        }

        function eq(v1, v2) {
          // Consider 0 and undefined as equal
          if (v1 === undefined || v1 === 0) return v2 === undefined || v2 === 0;
          return v1 === v2;
        }

        for (var _iterator3 = _createForOfIteratorHelperLoose(orderedUnits$1), _step3; !(_step3 = _iterator3()).done;) {
          var u = _step3.value;

          if (!eq(this.values[u], other.values[u])) {
            return false;
          }
        }

        return true;
      };

      _createClass(Duration, [{
        key: "locale",
        get: function get() {
          return this.isValid ? this.loc.locale : null;
        }
        /**
         * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
         *
         * @type {string}
         */

      }, {
        key: "numberingSystem",
        get: function get() {
          return this.isValid ? this.loc.numberingSystem : null;
        }
      }, {
        key: "years",
        get: function get() {
          return this.isValid ? this.values.years || 0 : NaN;
        }
        /**
         * Get the quarters.
         * @type {number}
         */

      }, {
        key: "quarters",
        get: function get() {
          return this.isValid ? this.values.quarters || 0 : NaN;
        }
        /**
         * Get the months.
         * @type {number}
         */

      }, {
        key: "months",
        get: function get() {
          return this.isValid ? this.values.months || 0 : NaN;
        }
        /**
         * Get the weeks
         * @type {number}
         */

      }, {
        key: "weeks",
        get: function get() {
          return this.isValid ? this.values.weeks || 0 : NaN;
        }
        /**
         * Get the days.
         * @type {number}
         */

      }, {
        key: "days",
        get: function get() {
          return this.isValid ? this.values.days || 0 : NaN;
        }
        /**
         * Get the hours.
         * @type {number}
         */

      }, {
        key: "hours",
        get: function get() {
          return this.isValid ? this.values.hours || 0 : NaN;
        }
        /**
         * Get the minutes.
         * @type {number}
         */

      }, {
        key: "minutes",
        get: function get() {
          return this.isValid ? this.values.minutes || 0 : NaN;
        }
        /**
         * Get the seconds.
         * @return {number}
         */

      }, {
        key: "seconds",
        get: function get() {
          return this.isValid ? this.values.seconds || 0 : NaN;
        }
        /**
         * Get the milliseconds.
         * @return {number}
         */

      }, {
        key: "milliseconds",
        get: function get() {
          return this.isValid ? this.values.milliseconds || 0 : NaN;
        }
        /**
         * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
         * on invalid DateTimes or Intervals.
         * @return {boolean}
         */

      }, {
        key: "isValid",
        get: function get() {
          return this.invalid === null;
        }
        /**
         * Returns an error code if this Duration became invalid, or null if the Duration is valid
         * @return {string}
         */

      }, {
        key: "invalidReason",
        get: function get() {
          return this.invalid ? this.invalid.reason : null;
        }
        /**
         * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
         * @type {string}
         */

      }, {
        key: "invalidExplanation",
        get: function get() {
          return this.invalid ? this.invalid.explanation : null;
        }
      }]);

      return Duration;
    }();

    var INVALID$1 = "Invalid Interval"; // checks if the start is equal to or before the end

    function validateStartEnd(start, end) {
      if (!start || !start.isValid) {
        return Interval.invalid("missing or invalid start");
      } else if (!end || !end.isValid) {
        return Interval.invalid("missing or invalid end");
      } else if (end < start) {
        return Interval.invalid("end before start", "The end of an interval must be after its start, but you had start=" + start.toISO() + " and end=" + end.toISO());
      } else {
        return null;
      }
    }
    /**
     * An Interval object represents a half-open interval of time, where each endpoint is a {@link DateTime}. Conceptually, it's a container for those two endpoints, accompanied by methods for creating, parsing, interrogating, comparing, transforming, and formatting them.
     *
     * Here is a brief overview of the most commonly used methods and getters in Interval:
     *
     * * **Creation** To create an Interval, use {@link Interval#fromDateTimes}, {@link Interval#after}, {@link Interval#before}, or {@link Interval#fromISO}.
     * * **Accessors** Use {@link Interval#start} and {@link Interval#end} to get the start and end.
     * * **Interrogation** To analyze the Interval, use {@link Interval#count}, {@link Interval#length}, {@link Interval#hasSame}, {@link Interval#contains}, {@link Interval#isAfter}, or {@link Interval#isBefore}.
     * * **Transformation** To create other Intervals out of this one, use {@link Interval#set}, {@link Interval#splitAt}, {@link Interval#splitBy}, {@link Interval#divideEqually}, {@link Interval#merge}, {@link Interval#xor}, {@link Interval#union}, {@link Interval#intersection}, or {@link Interval#difference}.
     * * **Comparison** To compare this Interval to another one, use {@link Interval#equals}, {@link Interval#overlaps}, {@link Interval#abutsStart}, {@link Interval#abutsEnd}, {@link Interval#engulfs}
     * * **Output** To convert the Interval into other representations, see {@link Interval#toString}, {@link Interval#toISO}, {@link Interval#toISODate}, {@link Interval#toISOTime}, {@link Interval#toFormat}, and {@link Interval#toDuration}.
     */


    var Interval = /*#__PURE__*/function () {
      /**
       * @private
       */
      function Interval(config) {
        /**
         * @access private
         */
        this.s = config.start;
        /**
         * @access private
         */

        this.e = config.end;
        /**
         * @access private
         */

        this.invalid = config.invalid || null;
        /**
         * @access private
         */

        this.isLuxonInterval = true;
      }
      /**
       * Create an invalid Interval.
       * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
       * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
       * @return {Interval}
       */


      Interval.invalid = function invalid(reason, explanation) {
        if (explanation === void 0) {
          explanation = null;
        }

        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
        }

        var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

        if (Settings.throwOnInvalid) {
          throw new InvalidIntervalError(invalid);
        } else {
          return new Interval({
            invalid: invalid
          });
        }
      }
      /**
       * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
       * @param {DateTime|Date|Object} start
       * @param {DateTime|Date|Object} end
       * @return {Interval}
       */
      ;

      Interval.fromDateTimes = function fromDateTimes(start, end) {
        var builtStart = friendlyDateTime(start),
            builtEnd = friendlyDateTime(end);
        var validateError = validateStartEnd(builtStart, builtEnd);

        if (validateError == null) {
          return new Interval({
            start: builtStart,
            end: builtEnd
          });
        } else {
          return validateError;
        }
      }
      /**
       * Create an Interval from a start DateTime and a Duration to extend to.
       * @param {DateTime|Date|Object} start
       * @param {Duration|Object|number} duration - the length of the Interval.
       * @return {Interval}
       */
      ;

      Interval.after = function after(start, duration) {
        var dur = Duration.fromDurationLike(duration),
            dt = friendlyDateTime(start);
        return Interval.fromDateTimes(dt, dt.plus(dur));
      }
      /**
       * Create an Interval from an end DateTime and a Duration to extend backwards to.
       * @param {DateTime|Date|Object} end
       * @param {Duration|Object|number} duration - the length of the Interval.
       * @return {Interval}
       */
      ;

      Interval.before = function before(end, duration) {
        var dur = Duration.fromDurationLike(duration),
            dt = friendlyDateTime(end);
        return Interval.fromDateTimes(dt.minus(dur), dt);
      }
      /**
       * Create an Interval from an ISO 8601 string.
       * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
       * @param {string} text - the ISO string to parse
       * @param {Object} [opts] - options to pass {@link DateTime#fromISO} and optionally {@link Duration#fromISO}
       * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
       * @return {Interval}
       */
      ;

      Interval.fromISO = function fromISO(text, opts) {
        var _split = (text || "").split("/", 2),
            s = _split[0],
            e = _split[1];

        if (s && e) {
          var start, startIsValid;

          try {
            start = DateTime.fromISO(s, opts);
            startIsValid = start.isValid;
          } catch (e) {
            startIsValid = false;
          }

          var end, endIsValid;

          try {
            end = DateTime.fromISO(e, opts);
            endIsValid = end.isValid;
          } catch (e) {
            endIsValid = false;
          }

          if (startIsValid && endIsValid) {
            return Interval.fromDateTimes(start, end);
          }

          if (startIsValid) {
            var dur = Duration.fromISO(e, opts);

            if (dur.isValid) {
              return Interval.after(start, dur);
            }
          } else if (endIsValid) {
            var _dur = Duration.fromISO(s, opts);

            if (_dur.isValid) {
              return Interval.before(end, _dur);
            }
          }
        }

        return Interval.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
      }
      /**
       * Check if an object is an Interval. Works across context boundaries
       * @param {object} o
       * @return {boolean}
       */
      ;

      Interval.isInterval = function isInterval(o) {
        return o && o.isLuxonInterval || false;
      }
      /**
       * Returns the start of the Interval
       * @type {DateTime}
       */
      ;

      var _proto = Interval.prototype;

      /**
       * Returns the length of the Interval in the specified unit.
       * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
       * @return {number}
       */
      _proto.length = function length(unit) {
        if (unit === void 0) {
          unit = "milliseconds";
        }

        return this.isValid ? this.toDuration.apply(this, [unit]).get(unit) : NaN;
      }
      /**
       * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
       * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
       * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
       * @param {string} [unit='milliseconds'] - the unit of time to count.
       * @return {number}
       */
      ;

      _proto.count = function count(unit) {
        if (unit === void 0) {
          unit = "milliseconds";
        }

        if (!this.isValid) return NaN;
        var start = this.start.startOf(unit),
            end = this.end.startOf(unit);
        return Math.floor(end.diff(start, unit).get(unit)) + 1;
      }
      /**
       * Returns whether this Interval's start and end are both in the same unit of time
       * @param {string} unit - the unit of time to check sameness on
       * @return {boolean}
       */
      ;

      _proto.hasSame = function hasSame(unit) {
        return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
      }
      /**
       * Return whether this Interval has the same start and end DateTimes.
       * @return {boolean}
       */
      ;

      _proto.isEmpty = function isEmpty() {
        return this.s.valueOf() === this.e.valueOf();
      }
      /**
       * Return whether this Interval's start is after the specified DateTime.
       * @param {DateTime} dateTime
       * @return {boolean}
       */
      ;

      _proto.isAfter = function isAfter(dateTime) {
        if (!this.isValid) return false;
        return this.s > dateTime;
      }
      /**
       * Return whether this Interval's end is before the specified DateTime.
       * @param {DateTime} dateTime
       * @return {boolean}
       */
      ;

      _proto.isBefore = function isBefore(dateTime) {
        if (!this.isValid) return false;
        return this.e <= dateTime;
      }
      /**
       * Return whether this Interval contains the specified DateTime.
       * @param {DateTime} dateTime
       * @return {boolean}
       */
      ;

      _proto.contains = function contains(dateTime) {
        if (!this.isValid) return false;
        return this.s <= dateTime && this.e > dateTime;
      }
      /**
       * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
       * @param {Object} values - the values to set
       * @param {DateTime} values.start - the starting DateTime
       * @param {DateTime} values.end - the ending DateTime
       * @return {Interval}
       */
      ;

      _proto.set = function set(_temp) {
        var _ref = _temp === void 0 ? {} : _temp,
            start = _ref.start,
            end = _ref.end;

        if (!this.isValid) return this;
        return Interval.fromDateTimes(start || this.s, end || this.e);
      }
      /**
       * Split this Interval at each of the specified DateTimes
       * @param {...DateTime} dateTimes - the unit of time to count.
       * @return {Array}
       */
      ;

      _proto.splitAt = function splitAt() {
        var _this = this;

        if (!this.isValid) return [];

        for (var _len = arguments.length, dateTimes = new Array(_len), _key = 0; _key < _len; _key++) {
          dateTimes[_key] = arguments[_key];
        }

        var sorted = dateTimes.map(friendlyDateTime).filter(function (d) {
          return _this.contains(d);
        }).sort(),
            results = [];
        var s = this.s,
            i = 0;

        while (s < this.e) {
          var added = sorted[i] || this.e,
              next = +added > +this.e ? this.e : added;
          results.push(Interval.fromDateTimes(s, next));
          s = next;
          i += 1;
        }

        return results;
      }
      /**
       * Split this Interval into smaller Intervals, each of the specified length.
       * Left over time is grouped into a smaller interval
       * @param {Duration|Object|number} duration - The length of each resulting interval.
       * @return {Array}
       */
      ;

      _proto.splitBy = function splitBy(duration) {
        var dur = Duration.fromDurationLike(duration);

        if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
          return [];
        }

        var s = this.s,
            idx = 1,
            next;
        var results = [];

        while (s < this.e) {
          var added = this.start.plus(dur.mapUnits(function (x) {
            return x * idx;
          }));
          next = +added > +this.e ? this.e : added;
          results.push(Interval.fromDateTimes(s, next));
          s = next;
          idx += 1;
        }

        return results;
      }
      /**
       * Split this Interval into the specified number of smaller intervals.
       * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
       * @return {Array}
       */
      ;

      _proto.divideEqually = function divideEqually(numberOfParts) {
        if (!this.isValid) return [];
        return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
      }
      /**
       * Return whether this Interval overlaps with the specified Interval
       * @param {Interval} other
       * @return {boolean}
       */
      ;

      _proto.overlaps = function overlaps(other) {
        return this.e > other.s && this.s < other.e;
      }
      /**
       * Return whether this Interval's end is adjacent to the specified Interval's start.
       * @param {Interval} other
       * @return {boolean}
       */
      ;

      _proto.abutsStart = function abutsStart(other) {
        if (!this.isValid) return false;
        return +this.e === +other.s;
      }
      /**
       * Return whether this Interval's start is adjacent to the specified Interval's end.
       * @param {Interval} other
       * @return {boolean}
       */
      ;

      _proto.abutsEnd = function abutsEnd(other) {
        if (!this.isValid) return false;
        return +other.e === +this.s;
      }
      /**
       * Return whether this Interval engulfs the start and end of the specified Interval.
       * @param {Interval} other
       * @return {boolean}
       */
      ;

      _proto.engulfs = function engulfs(other) {
        if (!this.isValid) return false;
        return this.s <= other.s && this.e >= other.e;
      }
      /**
       * Return whether this Interval has the same start and end as the specified Interval.
       * @param {Interval} other
       * @return {boolean}
       */
      ;

      _proto.equals = function equals(other) {
        if (!this.isValid || !other.isValid) {
          return false;
        }

        return this.s.equals(other.s) && this.e.equals(other.e);
      }
      /**
       * Return an Interval representing the intersection of this Interval and the specified Interval.
       * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
       * Returns null if the intersection is empty, meaning, the intervals don't intersect.
       * @param {Interval} other
       * @return {Interval}
       */
      ;

      _proto.intersection = function intersection(other) {
        if (!this.isValid) return this;
        var s = this.s > other.s ? this.s : other.s,
            e = this.e < other.e ? this.e : other.e;

        if (s >= e) {
          return null;
        } else {
          return Interval.fromDateTimes(s, e);
        }
      }
      /**
       * Return an Interval representing the union of this Interval and the specified Interval.
       * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
       * @param {Interval} other
       * @return {Interval}
       */
      ;

      _proto.union = function union(other) {
        if (!this.isValid) return this;
        var s = this.s < other.s ? this.s : other.s,
            e = this.e > other.e ? this.e : other.e;
        return Interval.fromDateTimes(s, e);
      }
      /**
       * Merge an array of Intervals into a equivalent minimal set of Intervals.
       * Combines overlapping and adjacent Intervals.
       * @param {Array} intervals
       * @return {Array}
       */
      ;

      Interval.merge = function merge(intervals) {
        var _intervals$sort$reduc = intervals.sort(function (a, b) {
          return a.s - b.s;
        }).reduce(function (_ref2, item) {
          var sofar = _ref2[0],
              current = _ref2[1];

          if (!current) {
            return [sofar, item];
          } else if (current.overlaps(item) || current.abutsStart(item)) {
            return [sofar, current.union(item)];
          } else {
            return [sofar.concat([current]), item];
          }
        }, [[], null]),
            found = _intervals$sort$reduc[0],
            final = _intervals$sort$reduc[1];

        if (final) {
          found.push(final);
        }

        return found;
      }
      /**
       * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
       * @param {Array} intervals
       * @return {Array}
       */
      ;

      Interval.xor = function xor(intervals) {
        var _Array$prototype;

        var start = null,
            currentCount = 0;

        var results = [],
            ends = intervals.map(function (i) {
          return [{
            time: i.s,
            type: "s"
          }, {
            time: i.e,
            type: "e"
          }];
        }),
            flattened = (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, ends),
            arr = flattened.sort(function (a, b) {
          return a.time - b.time;
        });

        for (var _iterator = _createForOfIteratorHelperLoose(arr), _step; !(_step = _iterator()).done;) {
          var i = _step.value;
          currentCount += i.type === "s" ? 1 : -1;

          if (currentCount === 1) {
            start = i.time;
          } else {
            if (start && +start !== +i.time) {
              results.push(Interval.fromDateTimes(start, i.time));
            }

            start = null;
          }
        }

        return Interval.merge(results);
      }
      /**
       * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
       * @param {...Interval} intervals
       * @return {Array}
       */
      ;

      _proto.difference = function difference() {
        var _this2 = this;

        for (var _len2 = arguments.length, intervals = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          intervals[_key2] = arguments[_key2];
        }

        return Interval.xor([this].concat(intervals)).map(function (i) {
          return _this2.intersection(i);
        }).filter(function (i) {
          return i && !i.isEmpty();
        });
      }
      /**
       * Returns a string representation of this Interval appropriate for debugging.
       * @return {string}
       */
      ;

      _proto.toString = function toString() {
        if (!this.isValid) return INVALID$1;
        return "[" + this.s.toISO() + " \u2013 " + this.e.toISO() + ")";
      }
      /**
       * Returns an ISO 8601-compliant string representation of this Interval.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
       * @param {Object} opts - The same options as {@link DateTime#toISO}
       * @return {string}
       */
      ;

      _proto.toISO = function toISO(opts) {
        if (!this.isValid) return INVALID$1;
        return this.s.toISO(opts) + "/" + this.e.toISO(opts);
      }
      /**
       * Returns an ISO 8601-compliant string representation of date of this Interval.
       * The time components are ignored.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
       * @return {string}
       */
      ;

      _proto.toISODate = function toISODate() {
        if (!this.isValid) return INVALID$1;
        return this.s.toISODate() + "/" + this.e.toISODate();
      }
      /**
       * Returns an ISO 8601-compliant string representation of time of this Interval.
       * The date components are ignored.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
       * @param {Object} opts - The same options as {@link DateTime#toISO}
       * @return {string}
       */
      ;

      _proto.toISOTime = function toISOTime(opts) {
        if (!this.isValid) return INVALID$1;
        return this.s.toISOTime(opts) + "/" + this.e.toISOTime(opts);
      }
      /**
       * Returns a string representation of this Interval formatted according to the specified format string.
       * @param {string} dateFormat - the format string. This string formats the start and end time. See {@link DateTime#toFormat} for details.
       * @param {Object} opts - options
       * @param {string} [opts.separator =  ' – '] - a separator to place between the start and end representations
       * @return {string}
       */
      ;

      _proto.toFormat = function toFormat(dateFormat, _temp2) {
        var _ref3 = _temp2 === void 0 ? {} : _temp2,
            _ref3$separator = _ref3.separator,
            separator = _ref3$separator === void 0 ? " – " : _ref3$separator;

        if (!this.isValid) return INVALID$1;
        return "" + this.s.toFormat(dateFormat) + separator + this.e.toFormat(dateFormat);
      }
      /**
       * Return a Duration representing the time spanned by this interval.
       * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
       * @param {Object} opts - options that affect the creation of the Duration
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
       * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
       * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
       * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
       * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
       * @return {Duration}
       */
      ;

      _proto.toDuration = function toDuration(unit, opts) {
        if (!this.isValid) {
          return Duration.invalid(this.invalidReason);
        }

        return this.e.diff(this.s, unit, opts);
      }
      /**
       * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
       * @param {function} mapFn
       * @return {Interval}
       * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
       * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
       */
      ;

      _proto.mapEndpoints = function mapEndpoints(mapFn) {
        return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
      };

      _createClass(Interval, [{
        key: "start",
        get: function get() {
          return this.isValid ? this.s : null;
        }
        /**
         * Returns the end of the Interval
         * @type {DateTime}
         */

      }, {
        key: "end",
        get: function get() {
          return this.isValid ? this.e : null;
        }
        /**
         * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
         * @type {boolean}
         */

      }, {
        key: "isValid",
        get: function get() {
          return this.invalidReason === null;
        }
        /**
         * Returns an error code if this Interval is invalid, or null if the Interval is valid
         * @type {string}
         */

      }, {
        key: "invalidReason",
        get: function get() {
          return this.invalid ? this.invalid.reason : null;
        }
        /**
         * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
         * @type {string}
         */

      }, {
        key: "invalidExplanation",
        get: function get() {
          return this.invalid ? this.invalid.explanation : null;
        }
      }]);

      return Interval;
    }();

    /**
     * The Info class contains static methods for retrieving general time and date related data. For example, it has methods for finding out if a time zone has a DST, for listing the months in any supported locale, and for discovering which of Luxon features are available in the current environment.
     */

    var Info = /*#__PURE__*/function () {
      function Info() {}

      /**
       * Return whether the specified zone contains a DST.
       * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
       * @return {boolean}
       */
      Info.hasDST = function hasDST(zone) {
        if (zone === void 0) {
          zone = Settings.defaultZone;
        }

        var proto = DateTime.now().setZone(zone).set({
          month: 12
        });
        return !zone.isUniversal && proto.offset !== proto.set({
          month: 6
        }).offset;
      }
      /**
       * Return whether the specified zone is a valid IANA specifier.
       * @param {string} zone - Zone to check
       * @return {boolean}
       */
      ;

      Info.isValidIANAZone = function isValidIANAZone(zone) {
        return IANAZone.isValidSpecifier(zone) && IANAZone.isValidZone(zone);
      }
      /**
       * Converts the input into a {@link Zone} instance.
       *
       * * If `input` is already a Zone instance, it is returned unchanged.
       * * If `input` is a string containing a valid time zone name, a Zone instance
       *   with that name is returned.
       * * If `input` is a string that doesn't refer to a known time zone, a Zone
       *   instance with {@link Zone#isValid} == false is returned.
       * * If `input is a number, a Zone instance with the specified fixed offset
       *   in minutes is returned.
       * * If `input` is `null` or `undefined`, the default zone is returned.
       * @param {string|Zone|number} [input] - the value to be converted
       * @return {Zone}
       */
      ;

      Info.normalizeZone = function normalizeZone$1(input) {
        return normalizeZone(input, Settings.defaultZone);
      }
      /**
       * Return an array of standalone month names.
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
       * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.numberingSystem=null] - the numbering system
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @param {string} [opts.outputCalendar='gregory'] - the calendar
       * @example Info.months()[0] //=> 'January'
       * @example Info.months('short')[0] //=> 'Jan'
       * @example Info.months('numeric')[0] //=> '1'
       * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
       * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
       * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
       * @return {Array}
       */
      ;

      Info.months = function months(length, _temp) {
        if (length === void 0) {
          length = "long";
        }

        var _ref = _temp === void 0 ? {} : _temp,
            _ref$locale = _ref.locale,
            locale = _ref$locale === void 0 ? null : _ref$locale,
            _ref$numberingSystem = _ref.numberingSystem,
            numberingSystem = _ref$numberingSystem === void 0 ? null : _ref$numberingSystem,
            _ref$locObj = _ref.locObj,
            locObj = _ref$locObj === void 0 ? null : _ref$locObj,
            _ref$outputCalendar = _ref.outputCalendar,
            outputCalendar = _ref$outputCalendar === void 0 ? "gregory" : _ref$outputCalendar;

        return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
      }
      /**
       * Return an array of format month names.
       * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
       * changes the string.
       * See {@link Info#months}
       * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.numberingSystem=null] - the numbering system
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @param {string} [opts.outputCalendar='gregory'] - the calendar
       * @return {Array}
       */
      ;

      Info.monthsFormat = function monthsFormat(length, _temp2) {
        if (length === void 0) {
          length = "long";
        }

        var _ref2 = _temp2 === void 0 ? {} : _temp2,
            _ref2$locale = _ref2.locale,
            locale = _ref2$locale === void 0 ? null : _ref2$locale,
            _ref2$numberingSystem = _ref2.numberingSystem,
            numberingSystem = _ref2$numberingSystem === void 0 ? null : _ref2$numberingSystem,
            _ref2$locObj = _ref2.locObj,
            locObj = _ref2$locObj === void 0 ? null : _ref2$locObj,
            _ref2$outputCalendar = _ref2.outputCalendar,
            outputCalendar = _ref2$outputCalendar === void 0 ? "gregory" : _ref2$outputCalendar;

        return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
      }
      /**
       * Return an array of standalone week names.
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
       * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.numberingSystem=null] - the numbering system
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @example Info.weekdays()[0] //=> 'Monday'
       * @example Info.weekdays('short')[0] //=> 'Mon'
       * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
       * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
       * @return {Array}
       */
      ;

      Info.weekdays = function weekdays(length, _temp3) {
        if (length === void 0) {
          length = "long";
        }

        var _ref3 = _temp3 === void 0 ? {} : _temp3,
            _ref3$locale = _ref3.locale,
            locale = _ref3$locale === void 0 ? null : _ref3$locale,
            _ref3$numberingSystem = _ref3.numberingSystem,
            numberingSystem = _ref3$numberingSystem === void 0 ? null : _ref3$numberingSystem,
            _ref3$locObj = _ref3.locObj,
            locObj = _ref3$locObj === void 0 ? null : _ref3$locObj;

        return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
      }
      /**
       * Return an array of format week names.
       * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
       * changes the string.
       * See {@link Info#weekdays}
       * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
       * @param {Object} opts - options
       * @param {string} [opts.locale=null] - the locale code
       * @param {string} [opts.numberingSystem=null] - the numbering system
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @return {Array}
       */
      ;

      Info.weekdaysFormat = function weekdaysFormat(length, _temp4) {
        if (length === void 0) {
          length = "long";
        }

        var _ref4 = _temp4 === void 0 ? {} : _temp4,
            _ref4$locale = _ref4.locale,
            locale = _ref4$locale === void 0 ? null : _ref4$locale,
            _ref4$numberingSystem = _ref4.numberingSystem,
            numberingSystem = _ref4$numberingSystem === void 0 ? null : _ref4$numberingSystem,
            _ref4$locObj = _ref4.locObj,
            locObj = _ref4$locObj === void 0 ? null : _ref4$locObj;

        return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
      }
      /**
       * Return an array of meridiems.
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @example Info.meridiems() //=> [ 'AM', 'PM' ]
       * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
       * @return {Array}
       */
      ;

      Info.meridiems = function meridiems(_temp5) {
        var _ref5 = _temp5 === void 0 ? {} : _temp5,
            _ref5$locale = _ref5.locale,
            locale = _ref5$locale === void 0 ? null : _ref5$locale;

        return Locale.create(locale).meridiems();
      }
      /**
       * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
       * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @example Info.eras() //=> [ 'BC', 'AD' ]
       * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
       * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
       * @return {Array}
       */
      ;

      Info.eras = function eras(length, _temp6) {
        if (length === void 0) {
          length = "short";
        }

        var _ref6 = _temp6 === void 0 ? {} : _temp6,
            _ref6$locale = _ref6.locale,
            locale = _ref6$locale === void 0 ? null : _ref6$locale;

        return Locale.create(locale, null, "gregory").eras(length);
      }
      /**
       * Return the set of available features in this environment.
       * Some features of Luxon are not available in all environments. For example, on older browsers, relative time formatting support is not available. Use this function to figure out if that's the case.
       * Keys:
       * * `relative`: whether this environment supports relative time formatting
       * @example Info.features() //=> { relative: false }
       * @return {Object}
       */
      ;

      Info.features = function features() {
        return {
          relative: hasRelative()
        };
      };

      return Info;
    }();

    function dayDiff(earlier, later) {
      var utcDayStart = function utcDayStart(dt) {
        return dt.toUTC(0, {
          keepLocalTime: true
        }).startOf("day").valueOf();
      },
          ms = utcDayStart(later) - utcDayStart(earlier);

      return Math.floor(Duration.fromMillis(ms).as("days"));
    }

    function highOrderDiffs(cursor, later, units) {
      var differs = [["years", function (a, b) {
        return b.year - a.year;
      }], ["quarters", function (a, b) {
        return b.quarter - a.quarter;
      }], ["months", function (a, b) {
        return b.month - a.month + (b.year - a.year) * 12;
      }], ["weeks", function (a, b) {
        var days = dayDiff(a, b);
        return (days - days % 7) / 7;
      }], ["days", dayDiff]];
      var results = {};
      var lowestOrder, highWater;

      for (var _i = 0, _differs = differs; _i < _differs.length; _i++) {
        var _differs$_i = _differs[_i],
            unit = _differs$_i[0],
            differ = _differs$_i[1];

        if (units.indexOf(unit) >= 0) {
          var _cursor$plus;

          lowestOrder = unit;
          var delta = differ(cursor, later);
          highWater = cursor.plus((_cursor$plus = {}, _cursor$plus[unit] = delta, _cursor$plus));

          if (highWater > later) {
            var _cursor$plus2;

            cursor = cursor.plus((_cursor$plus2 = {}, _cursor$plus2[unit] = delta - 1, _cursor$plus2));
            delta -= 1;
          } else {
            cursor = highWater;
          }

          results[unit] = delta;
        }
      }

      return [cursor, results, highWater, lowestOrder];
    }

    function _diff (earlier, later, units, opts) {
      var _highOrderDiffs = highOrderDiffs(earlier, later, units),
          cursor = _highOrderDiffs[0],
          results = _highOrderDiffs[1],
          highWater = _highOrderDiffs[2],
          lowestOrder = _highOrderDiffs[3];

      var remainingMillis = later - cursor;
      var lowerOrderUnits = units.filter(function (u) {
        return ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0;
      });

      if (lowerOrderUnits.length === 0) {
        if (highWater < later) {
          var _cursor$plus3;

          highWater = cursor.plus((_cursor$plus3 = {}, _cursor$plus3[lowestOrder] = 1, _cursor$plus3));
        }

        if (highWater !== cursor) {
          results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
        }
      }

      var duration = Duration.fromObject(results, opts);

      if (lowerOrderUnits.length > 0) {
        var _Duration$fromMillis;

        return (_Duration$fromMillis = Duration.fromMillis(remainingMillis, opts)).shiftTo.apply(_Duration$fromMillis, lowerOrderUnits).plus(duration);
      } else {
        return duration;
      }
    }

    var numberingSystems = {
      arab: "[\u0660-\u0669]",
      arabext: "[\u06F0-\u06F9]",
      bali: "[\u1B50-\u1B59]",
      beng: "[\u09E6-\u09EF]",
      deva: "[\u0966-\u096F]",
      fullwide: "[\uFF10-\uFF19]",
      gujr: "[\u0AE6-\u0AEF]",
      hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
      khmr: "[\u17E0-\u17E9]",
      knda: "[\u0CE6-\u0CEF]",
      laoo: "[\u0ED0-\u0ED9]",
      limb: "[\u1946-\u194F]",
      mlym: "[\u0D66-\u0D6F]",
      mong: "[\u1810-\u1819]",
      mymr: "[\u1040-\u1049]",
      orya: "[\u0B66-\u0B6F]",
      tamldec: "[\u0BE6-\u0BEF]",
      telu: "[\u0C66-\u0C6F]",
      thai: "[\u0E50-\u0E59]",
      tibt: "[\u0F20-\u0F29]",
      latn: "\\d"
    };
    var numberingSystemsUTF16 = {
      arab: [1632, 1641],
      arabext: [1776, 1785],
      bali: [6992, 7001],
      beng: [2534, 2543],
      deva: [2406, 2415],
      fullwide: [65296, 65303],
      gujr: [2790, 2799],
      khmr: [6112, 6121],
      knda: [3302, 3311],
      laoo: [3792, 3801],
      limb: [6470, 6479],
      mlym: [3430, 3439],
      mong: [6160, 6169],
      mymr: [4160, 4169],
      orya: [2918, 2927],
      tamldec: [3046, 3055],
      telu: [3174, 3183],
      thai: [3664, 3673],
      tibt: [3872, 3881]
    };
    var hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
    function parseDigits(str) {
      var value = parseInt(str, 10);

      if (isNaN(value)) {
        value = "";

        for (var i = 0; i < str.length; i++) {
          var code = str.charCodeAt(i);

          if (str[i].search(numberingSystems.hanidec) !== -1) {
            value += hanidecChars.indexOf(str[i]);
          } else {
            for (var key in numberingSystemsUTF16) {
              var _numberingSystemsUTF = numberingSystemsUTF16[key],
                  min = _numberingSystemsUTF[0],
                  max = _numberingSystemsUTF[1];

              if (code >= min && code <= max) {
                value += code - min;
              }
            }
          }
        }

        return parseInt(value, 10);
      } else {
        return value;
      }
    }
    function digitRegex(_ref, append) {
      var numberingSystem = _ref.numberingSystem;

      if (append === void 0) {
        append = "";
      }

      return new RegExp("" + numberingSystems[numberingSystem || "latn"] + append);
    }

    var MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";

    function intUnit(regex, post) {
      if (post === void 0) {
        post = function post(i) {
          return i;
        };
      }

      return {
        regex: regex,
        deser: function deser(_ref) {
          var s = _ref[0];
          return post(parseDigits(s));
        }
      };
    }

    var NBSP = String.fromCharCode(160);
    var spaceOrNBSP = "( |" + NBSP + ")";
    var spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");

    function fixListRegex(s) {
      // make dots optional and also make them literal
      // make space and non breakable space characters interchangeable
      return s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
    }

    function stripInsensitivities(s) {
      return s.replace(/\./g, "") // ignore dots that were made optional
      .replace(spaceOrNBSPRegExp, " ") // interchange space and nbsp
      .toLowerCase();
    }

    function oneOf(strings, startIndex) {
      if (strings === null) {
        return null;
      } else {
        return {
          regex: RegExp(strings.map(fixListRegex).join("|")),
          deser: function deser(_ref2) {
            var s = _ref2[0];
            return strings.findIndex(function (i) {
              return stripInsensitivities(s) === stripInsensitivities(i);
            }) + startIndex;
          }
        };
      }
    }

    function offset(regex, groups) {
      return {
        regex: regex,
        deser: function deser(_ref3) {
          var h = _ref3[1],
              m = _ref3[2];
          return signedOffset(h, m);
        },
        groups: groups
      };
    }

    function simple(regex) {
      return {
        regex: regex,
        deser: function deser(_ref4) {
          var s = _ref4[0];
          return s;
        }
      };
    }

    function escapeToken(value) {
      return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }

    function unitForToken(token, loc) {
      var one = digitRegex(loc),
          two = digitRegex(loc, "{2}"),
          three = digitRegex(loc, "{3}"),
          four = digitRegex(loc, "{4}"),
          six = digitRegex(loc, "{6}"),
          oneOrTwo = digitRegex(loc, "{1,2}"),
          oneToThree = digitRegex(loc, "{1,3}"),
          oneToSix = digitRegex(loc, "{1,6}"),
          oneToNine = digitRegex(loc, "{1,9}"),
          twoToFour = digitRegex(loc, "{2,4}"),
          fourToSix = digitRegex(loc, "{4,6}"),
          literal = function literal(t) {
        return {
          regex: RegExp(escapeToken(t.val)),
          deser: function deser(_ref5) {
            var s = _ref5[0];
            return s;
          },
          literal: true
        };
      },
          unitate = function unitate(t) {
        if (token.literal) {
          return literal(t);
        }

        switch (t.val) {
          // era
          case "G":
            return oneOf(loc.eras("short", false), 0);

          case "GG":
            return oneOf(loc.eras("long", false), 0);
          // years

          case "y":
            return intUnit(oneToSix);

          case "yy":
            return intUnit(twoToFour, untruncateYear);

          case "yyyy":
            return intUnit(four);

          case "yyyyy":
            return intUnit(fourToSix);

          case "yyyyyy":
            return intUnit(six);
          // months

          case "M":
            return intUnit(oneOrTwo);

          case "MM":
            return intUnit(two);

          case "MMM":
            return oneOf(loc.months("short", true, false), 1);

          case "MMMM":
            return oneOf(loc.months("long", true, false), 1);

          case "L":
            return intUnit(oneOrTwo);

          case "LL":
            return intUnit(two);

          case "LLL":
            return oneOf(loc.months("short", false, false), 1);

          case "LLLL":
            return oneOf(loc.months("long", false, false), 1);
          // dates

          case "d":
            return intUnit(oneOrTwo);

          case "dd":
            return intUnit(two);
          // ordinals

          case "o":
            return intUnit(oneToThree);

          case "ooo":
            return intUnit(three);
          // time

          case "HH":
            return intUnit(two);

          case "H":
            return intUnit(oneOrTwo);

          case "hh":
            return intUnit(two);

          case "h":
            return intUnit(oneOrTwo);

          case "mm":
            return intUnit(two);

          case "m":
            return intUnit(oneOrTwo);

          case "q":
            return intUnit(oneOrTwo);

          case "qq":
            return intUnit(two);

          case "s":
            return intUnit(oneOrTwo);

          case "ss":
            return intUnit(two);

          case "S":
            return intUnit(oneToThree);

          case "SSS":
            return intUnit(three);

          case "u":
            return simple(oneToNine);

          case "uu":
            return simple(oneOrTwo);

          case "uuu":
            return intUnit(one);
          // meridiem

          case "a":
            return oneOf(loc.meridiems(), 0);
          // weekYear (k)

          case "kkkk":
            return intUnit(four);

          case "kk":
            return intUnit(twoToFour, untruncateYear);
          // weekNumber (W)

          case "W":
            return intUnit(oneOrTwo);

          case "WW":
            return intUnit(two);
          // weekdays

          case "E":
          case "c":
            return intUnit(one);

          case "EEE":
            return oneOf(loc.weekdays("short", false, false), 1);

          case "EEEE":
            return oneOf(loc.weekdays("long", false, false), 1);

          case "ccc":
            return oneOf(loc.weekdays("short", true, false), 1);

          case "cccc":
            return oneOf(loc.weekdays("long", true, false), 1);
          // offset/zone

          case "Z":
          case "ZZ":
            return offset(new RegExp("([+-]" + oneOrTwo.source + ")(?::(" + two.source + "))?"), 2);

          case "ZZZ":
            return offset(new RegExp("([+-]" + oneOrTwo.source + ")(" + two.source + ")?"), 2);
          // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
          // because we don't have any way to figure out what they are

          case "z":
            return simple(/[a-z_+-/]{1,256}?/i);

          default:
            return literal(t);
        }
      };

      var unit = unitate(token) || {
        invalidReason: MISSING_FTP
      };
      unit.token = token;
      return unit;
    }

    var partTypeStyleToTokenVal = {
      year: {
        "2-digit": "yy",
        numeric: "yyyyy"
      },
      month: {
        numeric: "M",
        "2-digit": "MM",
        short: "MMM",
        long: "MMMM"
      },
      day: {
        numeric: "d",
        "2-digit": "dd"
      },
      weekday: {
        short: "EEE",
        long: "EEEE"
      },
      dayperiod: "a",
      dayPeriod: "a",
      hour: {
        numeric: "h",
        "2-digit": "hh"
      },
      minute: {
        numeric: "m",
        "2-digit": "mm"
      },
      second: {
        numeric: "s",
        "2-digit": "ss"
      }
    };

    function tokenForPart(part, locale, formatOpts) {
      var type = part.type,
          value = part.value;

      if (type === "literal") {
        return {
          literal: true,
          val: value
        };
      }

      var style = formatOpts[type];
      var val = partTypeStyleToTokenVal[type];

      if (typeof val === "object") {
        val = val[style];
      }

      if (val) {
        return {
          literal: false,
          val: val
        };
      }

      return undefined;
    }

    function buildRegex(units) {
      var re = units.map(function (u) {
        return u.regex;
      }).reduce(function (f, r) {
        return f + "(" + r.source + ")";
      }, "");
      return ["^" + re + "$", units];
    }

    function match(input, regex, handlers) {
      var matches = input.match(regex);

      if (matches) {
        var all = {};
        var matchIndex = 1;

        for (var i in handlers) {
          if (hasOwnProperty(handlers, i)) {
            var h = handlers[i],
                groups = h.groups ? h.groups + 1 : 1;

            if (!h.literal && h.token) {
              all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
            }

            matchIndex += groups;
          }
        }

        return [matches, all];
      } else {
        return [matches, {}];
      }
    }

    function dateTimeFromMatches(matches) {
      var toField = function toField(token) {
        switch (token) {
          case "S":
            return "millisecond";

          case "s":
            return "second";

          case "m":
            return "minute";

          case "h":
          case "H":
            return "hour";

          case "d":
            return "day";

          case "o":
            return "ordinal";

          case "L":
          case "M":
            return "month";

          case "y":
            return "year";

          case "E":
          case "c":
            return "weekday";

          case "W":
            return "weekNumber";

          case "k":
            return "weekYear";

          case "q":
            return "quarter";

          default:
            return null;
        }
      };

      var zone = null;
      var specificOffset;

      if (!isUndefined(matches.z)) {
        zone = IANAZone.create(matches.z);
      }

      if (!isUndefined(matches.Z)) {
        if (!zone) {
          zone = new FixedOffsetZone(matches.Z);
        }

        specificOffset = matches.Z;
      }

      if (!isUndefined(matches.q)) {
        matches.M = (matches.q - 1) * 3 + 1;
      }

      if (!isUndefined(matches.h)) {
        if (matches.h < 12 && matches.a === 1) {
          matches.h += 12;
        } else if (matches.h === 12 && matches.a === 0) {
          matches.h = 0;
        }
      }

      if (matches.G === 0 && matches.y) {
        matches.y = -matches.y;
      }

      if (!isUndefined(matches.u)) {
        matches.S = parseMillis(matches.u);
      }

      var vals = Object.keys(matches).reduce(function (r, k) {
        var f = toField(k);

        if (f) {
          r[f] = matches[k];
        }

        return r;
      }, {});
      return [vals, zone, specificOffset];
    }

    var dummyDateTimeCache = null;

    function getDummyDateTime() {
      if (!dummyDateTimeCache) {
        dummyDateTimeCache = DateTime.fromMillis(1555555555555);
      }

      return dummyDateTimeCache;
    }

    function maybeExpandMacroToken(token, locale) {
      if (token.literal) {
        return token;
      }

      var formatOpts = Formatter.macroTokenToFormatOpts(token.val);

      if (!formatOpts) {
        return token;
      }

      var formatter = Formatter.create(locale, formatOpts);
      var parts = formatter.formatDateTimeParts(getDummyDateTime());
      var tokens = parts.map(function (p) {
        return tokenForPart(p, locale, formatOpts);
      });

      if (tokens.includes(undefined)) {
        return token;
      }

      return tokens;
    }

    function expandMacroTokens(tokens, locale) {
      var _Array$prototype;

      return (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, tokens.map(function (t) {
        return maybeExpandMacroToken(t, locale);
      }));
    }
    /**
     * @private
     */


    function explainFromTokens(locale, input, format) {
      var tokens = expandMacroTokens(Formatter.parseFormat(format), locale),
          units = tokens.map(function (t) {
        return unitForToken(t, locale);
      }),
          disqualifyingUnit = units.find(function (t) {
        return t.invalidReason;
      });

      if (disqualifyingUnit) {
        return {
          input: input,
          tokens: tokens,
          invalidReason: disqualifyingUnit.invalidReason
        };
      } else {
        var _buildRegex = buildRegex(units),
            regexString = _buildRegex[0],
            handlers = _buildRegex[1],
            regex = RegExp(regexString, "i"),
            _match = match(input, regex, handlers),
            rawMatches = _match[0],
            matches = _match[1],
            _ref6 = matches ? dateTimeFromMatches(matches) : [null, null, undefined],
            result = _ref6[0],
            zone = _ref6[1],
            specificOffset = _ref6[2];

        if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
          throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
        }

        return {
          input: input,
          tokens: tokens,
          regex: regex,
          rawMatches: rawMatches,
          matches: matches,
          result: result,
          zone: zone,
          specificOffset: specificOffset
        };
      }
    }
    function parseFromTokens(locale, input, format) {
      var _explainFromTokens = explainFromTokens(locale, input, format),
          result = _explainFromTokens.result,
          zone = _explainFromTokens.zone,
          specificOffset = _explainFromTokens.specificOffset,
          invalidReason = _explainFromTokens.invalidReason;

      return [result, zone, specificOffset, invalidReason];
    }

    var nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
        leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

    function unitOutOfRange(unit, value) {
      return new Invalid("unit out of range", "you specified " + value + " (of type " + typeof value + ") as a " + unit + ", which is invalid");
    }

    function dayOfWeek(year, month, day) {
      var js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      return js === 0 ? 7 : js;
    }

    function computeOrdinal(year, month, day) {
      return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
    }

    function uncomputeOrdinal(year, ordinal) {
      var table = isLeapYear(year) ? leapLadder : nonLeapLadder,
          month0 = table.findIndex(function (i) {
        return i < ordinal;
      }),
          day = ordinal - table[month0];
      return {
        month: month0 + 1,
        day: day
      };
    }
    /**
     * @private
     */


    function gregorianToWeek(gregObj) {
      var year = gregObj.year,
          month = gregObj.month,
          day = gregObj.day,
          ordinal = computeOrdinal(year, month, day),
          weekday = dayOfWeek(year, month, day);
      var weekNumber = Math.floor((ordinal - weekday + 10) / 7),
          weekYear;

      if (weekNumber < 1) {
        weekYear = year - 1;
        weekNumber = weeksInWeekYear(weekYear);
      } else if (weekNumber > weeksInWeekYear(year)) {
        weekYear = year + 1;
        weekNumber = 1;
      } else {
        weekYear = year;
      }

      return _extends({
        weekYear: weekYear,
        weekNumber: weekNumber,
        weekday: weekday
      }, timeObject(gregObj));
    }
    function weekToGregorian(weekData) {
      var weekYear = weekData.weekYear,
          weekNumber = weekData.weekNumber,
          weekday = weekData.weekday,
          weekdayOfJan4 = dayOfWeek(weekYear, 1, 4),
          yearInDays = daysInYear(weekYear);
      var ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 3,
          year;

      if (ordinal < 1) {
        year = weekYear - 1;
        ordinal += daysInYear(year);
      } else if (ordinal > yearInDays) {
        year = weekYear + 1;
        ordinal -= daysInYear(weekYear);
      } else {
        year = weekYear;
      }

      var _uncomputeOrdinal = uncomputeOrdinal(year, ordinal),
          month = _uncomputeOrdinal.month,
          day = _uncomputeOrdinal.day;

      return _extends({
        year: year,
        month: month,
        day: day
      }, timeObject(weekData));
    }
    function gregorianToOrdinal(gregData) {
      var year = gregData.year,
          month = gregData.month,
          day = gregData.day;
      var ordinal = computeOrdinal(year, month, day);
      return _extends({
        year: year,
        ordinal: ordinal
      }, timeObject(gregData));
    }
    function ordinalToGregorian(ordinalData) {
      var year = ordinalData.year,
          ordinal = ordinalData.ordinal;

      var _uncomputeOrdinal2 = uncomputeOrdinal(year, ordinal),
          month = _uncomputeOrdinal2.month,
          day = _uncomputeOrdinal2.day;

      return _extends({
        year: year,
        month: month,
        day: day
      }, timeObject(ordinalData));
    }
    function hasInvalidWeekData(obj) {
      var validYear = isInteger(obj.weekYear),
          validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear)),
          validWeekday = integerBetween(obj.weekday, 1, 7);

      if (!validYear) {
        return unitOutOfRange("weekYear", obj.weekYear);
      } else if (!validWeek) {
        return unitOutOfRange("week", obj.week);
      } else if (!validWeekday) {
        return unitOutOfRange("weekday", obj.weekday);
      } else return false;
    }
    function hasInvalidOrdinalData(obj) {
      var validYear = isInteger(obj.year),
          validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));

      if (!validYear) {
        return unitOutOfRange("year", obj.year);
      } else if (!validOrdinal) {
        return unitOutOfRange("ordinal", obj.ordinal);
      } else return false;
    }
    function hasInvalidGregorianData(obj) {
      var validYear = isInteger(obj.year),
          validMonth = integerBetween(obj.month, 1, 12),
          validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));

      if (!validYear) {
        return unitOutOfRange("year", obj.year);
      } else if (!validMonth) {
        return unitOutOfRange("month", obj.month);
      } else if (!validDay) {
        return unitOutOfRange("day", obj.day);
      } else return false;
    }
    function hasInvalidTimeData(obj) {
      var hour = obj.hour,
          minute = obj.minute,
          second = obj.second,
          millisecond = obj.millisecond;
      var validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0,
          validMinute = integerBetween(minute, 0, 59),
          validSecond = integerBetween(second, 0, 59),
          validMillisecond = integerBetween(millisecond, 0, 999);

      if (!validHour) {
        return unitOutOfRange("hour", hour);
      } else if (!validMinute) {
        return unitOutOfRange("minute", minute);
      } else if (!validSecond) {
        return unitOutOfRange("second", second);
      } else if (!validMillisecond) {
        return unitOutOfRange("millisecond", millisecond);
      } else return false;
    }

    var INVALID = "Invalid DateTime";
    var MAX_DATE = 8.64e15;

    function unsupportedZone(zone) {
      return new Invalid("unsupported zone", "the zone \"" + zone.name + "\" is not supported");
    } // we cache week data on the DT object and this intermediates the cache


    function possiblyCachedWeekData(dt) {
      if (dt.weekData === null) {
        dt.weekData = gregorianToWeek(dt.c);
      }

      return dt.weekData;
    } // clone really means, "make a new object with these modifications". all "setters" really use this
    // to create a new object while only changing some of the properties


    function clone(inst, alts) {
      var current = {
        ts: inst.ts,
        zone: inst.zone,
        c: inst.c,
        o: inst.o,
        loc: inst.loc,
        invalid: inst.invalid
      };
      return new DateTime(_extends({}, current, alts, {
        old: current
      }));
    } // find the right offset a given local time. The o input is our guess, which determines which
    // offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST)


    function fixOffset(localTS, o, tz) {
      // Our UTC time is just a guess because our offset is just a guess
      var utcGuess = localTS - o * 60 * 1000; // Test whether the zone matches the offset for this ts

      var o2 = tz.offset(utcGuess); // If so, offset didn't change and we're done

      if (o === o2) {
        return [utcGuess, o];
      } // If not, change the ts by the difference in the offset


      utcGuess -= (o2 - o) * 60 * 1000; // If that gives us the local time we want, we're done

      var o3 = tz.offset(utcGuess);

      if (o2 === o3) {
        return [utcGuess, o2];
      } // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time


      return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3)];
    } // convert an epoch timestamp into a calendar object with the given offset


    function tsToObj(ts, offset) {
      ts += offset * 60 * 1000;
      var d = new Date(ts);
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        hour: d.getUTCHours(),
        minute: d.getUTCMinutes(),
        second: d.getUTCSeconds(),
        millisecond: d.getUTCMilliseconds()
      };
    } // convert a calendar object to a epoch timestamp


    function objToTS(obj, offset, zone) {
      return fixOffset(objToLocalTS(obj), offset, zone);
    } // create a new DT instance by adding a duration, adjusting for DSTs


    function adjustTime(inst, dur) {
      var oPre = inst.o,
          year = inst.c.year + Math.trunc(dur.years),
          month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3,
          c = _extends({}, inst.c, {
        year: year,
        month: month,
        day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
      }),
          millisToAdd = Duration.fromObject({
        years: dur.years - Math.trunc(dur.years),
        quarters: dur.quarters - Math.trunc(dur.quarters),
        months: dur.months - Math.trunc(dur.months),
        weeks: dur.weeks - Math.trunc(dur.weeks),
        days: dur.days - Math.trunc(dur.days),
        hours: dur.hours,
        minutes: dur.minutes,
        seconds: dur.seconds,
        milliseconds: dur.milliseconds
      }).as("milliseconds"),
          localTS = objToLocalTS(c);

      var _fixOffset = fixOffset(localTS, oPre, inst.zone),
          ts = _fixOffset[0],
          o = _fixOffset[1];

      if (millisToAdd !== 0) {
        ts += millisToAdd; // that could have changed the offset by going over a DST, but we want to keep the ts the same

        o = inst.zone.offset(ts);
      }

      return {
        ts: ts,
        o: o
      };
    } // helper useful in turning the results of parsing into real dates
    // by handling the zone options


    function parseDataToDateTime(parsed, parsedZone, opts, format, text, specificOffset) {
      var setZone = opts.setZone,
          zone = opts.zone;

      if (parsed && Object.keys(parsed).length !== 0) {
        var interpretationZone = parsedZone || zone,
            inst = DateTime.fromObject(parsed, _extends({}, opts, {
          zone: interpretationZone,
          specificOffset: specificOffset
        }));
        return setZone ? inst : inst.setZone(zone);
      } else {
        return DateTime.invalid(new Invalid("unparsable", "the input \"" + text + "\" can't be parsed as " + format));
      }
    } // if you want to output a technical format (e.g. RFC 2822), this helper
    // helps handle the details


    function toTechFormat(dt, format, allowZ) {
      if (allowZ === void 0) {
        allowZ = true;
      }

      return dt.isValid ? Formatter.create(Locale.create("en-US"), {
        allowZ: allowZ,
        forceSimple: true
      }).formatDateTimeFromString(dt, format) : null;
    } // technical time formats (e.g. the time part of ISO 8601), take some options
    // and this commonizes their handling


    function toTechTimeFormat(dt, _ref) {
      var _ref$suppressSeconds = _ref.suppressSeconds,
          suppressSeconds = _ref$suppressSeconds === void 0 ? false : _ref$suppressSeconds,
          _ref$suppressMillisec = _ref.suppressMilliseconds,
          suppressMilliseconds = _ref$suppressMillisec === void 0 ? false : _ref$suppressMillisec,
          includeOffset = _ref.includeOffset,
          _ref$includePrefix = _ref.includePrefix,
          includePrefix = _ref$includePrefix === void 0 ? false : _ref$includePrefix,
          _ref$includeZone = _ref.includeZone,
          includeZone = _ref$includeZone === void 0 ? false : _ref$includeZone,
          _ref$spaceZone = _ref.spaceZone,
          spaceZone = _ref$spaceZone === void 0 ? false : _ref$spaceZone,
          _ref$format = _ref.format,
          format = _ref$format === void 0 ? "extended" : _ref$format;
      var fmt = format === "basic" ? "HHmm" : "HH:mm";

      if (!suppressSeconds || dt.second !== 0 || dt.millisecond !== 0) {
        fmt += format === "basic" ? "ss" : ":ss";

        if (!suppressMilliseconds || dt.millisecond !== 0) {
          fmt += ".SSS";
        }
      }

      if ((includeZone || includeOffset) && spaceZone) {
        fmt += " ";
      }

      if (includeZone) {
        fmt += "z";
      } else if (includeOffset) {
        fmt += format === "basic" ? "ZZZ" : "ZZ";
      }

      var str = toTechFormat(dt, fmt);

      if (includePrefix) {
        str = "T" + str;
      }

      return str;
    } // defaults for unspecified units in the supported calendars


    var defaultUnitValues = {
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    },
        defaultWeekUnitValues = {
      weekNumber: 1,
      weekday: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    },
        defaultOrdinalUnitValues = {
      ordinal: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }; // Units in the supported calendars, sorted by bigness

    var orderedUnits = ["year", "month", "day", "hour", "minute", "second", "millisecond"],
        orderedWeekUnits = ["weekYear", "weekNumber", "weekday", "hour", "minute", "second", "millisecond"],
        orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"]; // standardize case and plurality in units

    function normalizeUnit(unit) {
      var normalized = {
        year: "year",
        years: "year",
        month: "month",
        months: "month",
        day: "day",
        days: "day",
        hour: "hour",
        hours: "hour",
        minute: "minute",
        minutes: "minute",
        quarter: "quarter",
        quarters: "quarter",
        second: "second",
        seconds: "second",
        millisecond: "millisecond",
        milliseconds: "millisecond",
        weekday: "weekday",
        weekdays: "weekday",
        weeknumber: "weekNumber",
        weeksnumber: "weekNumber",
        weeknumbers: "weekNumber",
        weekyear: "weekYear",
        weekyears: "weekYear",
        ordinal: "ordinal"
      }[unit.toLowerCase()];
      if (!normalized) throw new InvalidUnitError(unit);
      return normalized;
    } // this is a dumbed down version of fromObject() that runs about 60% faster
    // but doesn't do any validation, makes a bunch of assumptions about what units
    // are present, and so on.
    // this is a dumbed down version of fromObject() that runs about 60% faster
    // but doesn't do any validation, makes a bunch of assumptions about what units
    // are present, and so on.


    function quickDT(obj, opts) {
      var zone = normalizeZone(opts.zone, Settings.defaultZone),
          loc = Locale.fromObject(opts),
          tsNow = Settings.now();
      var ts, o; // assume we have the higher-order units

      if (!isUndefined(obj.year)) {
        for (var _iterator = _createForOfIteratorHelperLoose(orderedUnits), _step; !(_step = _iterator()).done;) {
          var u = _step.value;

          if (isUndefined(obj[u])) {
            obj[u] = defaultUnitValues[u];
          }
        }

        var invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);

        if (invalid) {
          return DateTime.invalid(invalid);
        }

        var offsetProvis = zone.offset(tsNow);

        var _objToTS = objToTS(obj, offsetProvis, zone);

        ts = _objToTS[0];
        o = _objToTS[1];
      } else {
        ts = tsNow;
      }

      return new DateTime({
        ts: ts,
        zone: zone,
        loc: loc,
        o: o
      });
    }

    function diffRelative(start, end, opts) {
      var round = isUndefined(opts.round) ? true : opts.round,
          format = function format(c, unit) {
        c = roundTo(c, round || opts.calendary ? 0 : 2, true);
        var formatter = end.loc.clone(opts).relFormatter(opts);
        return formatter.format(c, unit);
      },
          differ = function differ(unit) {
        if (opts.calendary) {
          if (!end.hasSame(start, unit)) {
            return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
          } else return 0;
        } else {
          return end.diff(start, unit).get(unit);
        }
      };

      if (opts.unit) {
        return format(differ(opts.unit), opts.unit);
      }

      for (var _iterator2 = _createForOfIteratorHelperLoose(opts.units), _step2; !(_step2 = _iterator2()).done;) {
        var unit = _step2.value;
        var count = differ(unit);

        if (Math.abs(count) >= 1) {
          return format(count, unit);
        }
      }

      return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
    }

    function lastOpts(argList) {
      var opts = {},
          args;

      if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
        opts = argList[argList.length - 1];
        args = Array.from(argList).slice(0, argList.length - 1);
      } else {
        args = Array.from(argList);
      }

      return [opts, args];
    }
    /**
     * A DateTime is an immutable data structure representing a specific date and time and accompanying methods. It contains class and instance methods for creating, parsing, interrogating, transforming, and formatting them.
     *
     * A DateTime comprises of:
     * * A timestamp. Each DateTime instance refers to a specific millisecond of the Unix epoch.
     * * A time zone. Each instance is considered in the context of a specific zone (by default the local system's zone).
     * * Configuration properties that effect how output strings are formatted, such as `locale`, `numberingSystem`, and `outputCalendar`.
     *
     * Here is a brief overview of the most commonly used functionality it provides:
     *
     * * **Creation**: To create a DateTime from its components, use one of its factory class methods: {@link DateTime#local}, {@link DateTime#utc}, and (most flexibly) {@link DateTime#fromObject}. To create one from a standard string format, use {@link DateTime#fromISO}, {@link DateTime#fromHTTP}, and {@link DateTime#fromRFC2822}. To create one from a custom string format, use {@link DateTime#fromFormat}. To create one from a native JS date, use {@link DateTime#fromJSDate}.
     * * **Gregorian calendar and time**: To examine the Gregorian properties of a DateTime individually (i.e as opposed to collectively through {@link DateTime#toObject}), use the {@link DateTime#year}, {@link DateTime#month},
     * {@link DateTime#day}, {@link DateTime#hour}, {@link DateTime#minute}, {@link DateTime#second}, {@link DateTime#millisecond} accessors.
     * * **Week calendar**: For ISO week calendar attributes, see the {@link DateTime#weekYear}, {@link DateTime#weekNumber}, and {@link DateTime#weekday} accessors.
     * * **Configuration** See the {@link DateTime#locale} and {@link DateTime#numberingSystem} accessors.
     * * **Transformation**: To transform the DateTime into other DateTimes, use {@link DateTime#set}, {@link DateTime#reconfigure}, {@link DateTime#setZone}, {@link DateTime#setLocale}, {@link DateTime.plus}, {@link DateTime#minus}, {@link DateTime#endOf}, {@link DateTime#startOf}, {@link DateTime#toUTC}, and {@link DateTime#toLocal}.
     * * **Output**: To convert the DateTime to other representations, use the {@link DateTime#toRelative}, {@link DateTime#toRelativeCalendar}, {@link DateTime#toJSON}, {@link DateTime#toISO}, {@link DateTime#toHTTP}, {@link DateTime#toObject}, {@link DateTime#toRFC2822}, {@link DateTime#toString}, {@link DateTime#toLocaleString}, {@link DateTime#toFormat}, {@link DateTime#toMillis} and {@link DateTime#toJSDate}.
     *
     * There's plenty others documented below. In addition, for more information on subtler topics like internationalization, time zones, alternative calendars, validity, and so on, see the external documentation.
     */


    var DateTime = /*#__PURE__*/function () {
      /**
       * @access private
       */
      function DateTime(config) {
        var zone = config.zone || Settings.defaultZone;
        var invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
        /**
         * @access private
         */

        this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;
        var c = null,
            o = null;

        if (!invalid) {
          var unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);

          if (unchanged) {
            var _ref2 = [config.old.c, config.old.o];
            c = _ref2[0];
            o = _ref2[1];
          } else {
            var ot = zone.offset(this.ts);
            c = tsToObj(this.ts, ot);
            invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
            c = invalid ? null : c;
            o = invalid ? null : ot;
          }
        }
        /**
         * @access private
         */


        this._zone = zone;
        /**
         * @access private
         */

        this.loc = config.loc || Locale.create();
        /**
         * @access private
         */

        this.invalid = invalid;
        /**
         * @access private
         */

        this.weekData = null;
        /**
         * @access private
         */

        this.c = c;
        /**
         * @access private
         */

        this.o = o;
        /**
         * @access private
         */

        this.isLuxonDateTime = true;
      } // CONSTRUCT

      /**
       * Create a DateTime for the current instant, in the system's time zone.
       *
       * Use Settings to override these default values if needed.
       * @example DateTime.now().toISO() //~> now in the ISO format
       * @return {DateTime}
       */


      DateTime.now = function now() {
        return new DateTime({});
      }
      /**
       * Create a local DateTime
       * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
       * @param {number} [month=1] - The month, 1-indexed
       * @param {number} [day=1] - The day of the month, 1-indexed
       * @param {number} [hour=0] - The hour of the day, in 24-hour time
       * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
       * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
       * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
       * @example DateTime.local()                                  //~> now
       * @example DateTime.local({ zone: "America/New_York" })      //~> now, in US east coast time
       * @example DateTime.local(2017)                              //~> 2017-01-01T00:00:00
       * @example DateTime.local(2017, 3)                           //~> 2017-03-01T00:00:00
       * @example DateTime.local(2017, 3, 12, { locale: "fr" })     //~> 2017-03-12T00:00:00, with a French locale
       * @example DateTime.local(2017, 3, 12, 5)                    //~> 2017-03-12T05:00:00
       * @example DateTime.local(2017, 3, 12, 5, { zone: "utc" })   //~> 2017-03-12T05:00:00, in UTC
       * @example DateTime.local(2017, 3, 12, 5, 45)                //~> 2017-03-12T05:45:00
       * @example DateTime.local(2017, 3, 12, 5, 45, 10)            //~> 2017-03-12T05:45:10
       * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765)       //~> 2017-03-12T05:45:10.765
       * @return {DateTime}
       */
      ;

      DateTime.local = function local() {
        var _lastOpts = lastOpts(arguments),
            opts = _lastOpts[0],
            args = _lastOpts[1],
            year = args[0],
            month = args[1],
            day = args[2],
            hour = args[3],
            minute = args[4],
            second = args[5],
            millisecond = args[6];

        return quickDT({
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
          second: second,
          millisecond: millisecond
        }, opts);
      }
      /**
       * Create a DateTime in UTC
       * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
       * @param {number} [month=1] - The month, 1-indexed
       * @param {number} [day=1] - The day of the month
       * @param {number} [hour=0] - The hour of the day, in 24-hour time
       * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
       * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
       * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
       * @param {Object} options - configuration options for the DateTime
       * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
       * @param {string} [options.outputCalendar] - the output calendar to set on the resulting DateTime instance
       * @param {string} [options.numberingSystem] - the numbering system to set on the resulting DateTime instance
       * @example DateTime.utc()                                              //~> now
       * @example DateTime.utc(2017)                                          //~> 2017-01-01T00:00:00Z
       * @example DateTime.utc(2017, 3)                                       //~> 2017-03-01T00:00:00Z
       * @example DateTime.utc(2017, 3, 12)                                   //~> 2017-03-12T00:00:00Z
       * @example DateTime.utc(2017, 3, 12, 5)                                //~> 2017-03-12T05:00:00Z
       * @example DateTime.utc(2017, 3, 12, 5, 45)                            //~> 2017-03-12T05:45:00Z
       * @example DateTime.utc(2017, 3, 12, 5, 45, { locale: "fr" })          //~> 2017-03-12T05:45:00Z with a French locale
       * @example DateTime.utc(2017, 3, 12, 5, 45, 10)                        //~> 2017-03-12T05:45:10Z
       * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765, { locale: "fr" }) //~> 2017-03-12T05:45:10.765Z with a French locale
       * @return {DateTime}
       */
      ;

      DateTime.utc = function utc() {
        var _lastOpts2 = lastOpts(arguments),
            opts = _lastOpts2[0],
            args = _lastOpts2[1],
            year = args[0],
            month = args[1],
            day = args[2],
            hour = args[3],
            minute = args[4],
            second = args[5],
            millisecond = args[6];

        opts.zone = FixedOffsetZone.utcInstance;
        return quickDT({
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
          second: second,
          millisecond: millisecond
        }, opts);
      }
      /**
       * Create a DateTime from a JavaScript Date object. Uses the default zone.
       * @param {Date} date - a JavaScript Date object
       * @param {Object} options - configuration options for the DateTime
       * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
       * @return {DateTime}
       */
      ;

      DateTime.fromJSDate = function fromJSDate(date, options) {
        if (options === void 0) {
          options = {};
        }

        var ts = isDate(date) ? date.valueOf() : NaN;

        if (Number.isNaN(ts)) {
          return DateTime.invalid("invalid input");
        }

        var zoneToUse = normalizeZone(options.zone, Settings.defaultZone);

        if (!zoneToUse.isValid) {
          return DateTime.invalid(unsupportedZone(zoneToUse));
        }

        return new DateTime({
          ts: ts,
          zone: zoneToUse,
          loc: Locale.fromObject(options)
        });
      }
      /**
       * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
       * @param {number} milliseconds - a number of milliseconds since 1970 UTC
       * @param {Object} options - configuration options for the DateTime
       * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
       * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
       * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @return {DateTime}
       */
      ;

      DateTime.fromMillis = function fromMillis(milliseconds, options) {
        if (options === void 0) {
          options = {};
        }

        if (!isNumber(milliseconds)) {
          throw new InvalidArgumentError("fromMillis requires a numerical input, but received a " + typeof milliseconds + " with value " + milliseconds);
        } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
          // this isn't perfect because because we can still end up out of range because of additional shifting, but it's a start
          return DateTime.invalid("Timestamp out of range");
        } else {
          return new DateTime({
            ts: milliseconds,
            zone: normalizeZone(options.zone, Settings.defaultZone),
            loc: Locale.fromObject(options)
          });
        }
      }
      /**
       * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
       * @param {number} seconds - a number of seconds since 1970 UTC
       * @param {Object} options - configuration options for the DateTime
       * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
       * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
       * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @return {DateTime}
       */
      ;

      DateTime.fromSeconds = function fromSeconds(seconds, options) {
        if (options === void 0) {
          options = {};
        }

        if (!isNumber(seconds)) {
          throw new InvalidArgumentError("fromSeconds requires a numerical input");
        } else {
          return new DateTime({
            ts: seconds * 1000,
            zone: normalizeZone(options.zone, Settings.defaultZone),
            loc: Locale.fromObject(options)
          });
        }
      }
      /**
       * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
       * @param {Object} obj - the object to create the DateTime from
       * @param {number} obj.year - a year, such as 1987
       * @param {number} obj.month - a month, 1-12
       * @param {number} obj.day - a day of the month, 1-31, depending on the month
       * @param {number} obj.ordinal - day of the year, 1-365 or 366
       * @param {number} obj.weekYear - an ISO week year
       * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
       * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
       * @param {number} obj.hour - hour of the day, 0-23
       * @param {number} obj.minute - minute of the hour, 0-59
       * @param {number} obj.second - second of the minute, 0-59
       * @param {number} obj.millisecond - millisecond of the second, 0-999
       * @param {Object} opts - options for creating this DateTime
       * @param {string|Zone} [opts.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
       * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
       * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
       * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
       * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'utc' }),
       * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'local' })
       * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'America/New_York' })
       * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
       * @return {DateTime}
       */
      ;

      DateTime.fromObject = function fromObject(obj, opts) {
        if (opts === void 0) {
          opts = {};
        }

        obj = obj || {};
        var zoneToUse = normalizeZone(opts.zone, Settings.defaultZone);

        if (!zoneToUse.isValid) {
          return DateTime.invalid(unsupportedZone(zoneToUse));
        }

        var tsNow = Settings.now(),
            offsetProvis = !isUndefined(opts.specificOffset) ? opts.specificOffset : zoneToUse.offset(tsNow),
            normalized = normalizeObject(obj, normalizeUnit),
            containsOrdinal = !isUndefined(normalized.ordinal),
            containsGregorYear = !isUndefined(normalized.year),
            containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day),
            containsGregor = containsGregorYear || containsGregorMD,
            definiteWeekDef = normalized.weekYear || normalized.weekNumber,
            loc = Locale.fromObject(opts); // cases:
        // just a weekday -> this week's instance of that weekday, no worries
        // (gregorian data or ordinal) + (weekYear or weekNumber) -> error
        // (gregorian month or day) + ordinal -> error
        // otherwise just use weeks or ordinals or gregorian, depending on what's specified

        if ((containsGregor || containsOrdinal) && definiteWeekDef) {
          throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
        }

        if (containsGregorMD && containsOrdinal) {
          throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
        }

        var useWeekData = definiteWeekDef || normalized.weekday && !containsGregor; // configure ourselves to deal with gregorian dates or week stuff

        var units,
            defaultValues,
            objNow = tsToObj(tsNow, offsetProvis);

        if (useWeekData) {
          units = orderedWeekUnits;
          defaultValues = defaultWeekUnitValues;
          objNow = gregorianToWeek(objNow);
        } else if (containsOrdinal) {
          units = orderedOrdinalUnits;
          defaultValues = defaultOrdinalUnitValues;
          objNow = gregorianToOrdinal(objNow);
        } else {
          units = orderedUnits;
          defaultValues = defaultUnitValues;
        } // set default values for missing stuff


        var foundFirst = false;

        for (var _iterator3 = _createForOfIteratorHelperLoose(units), _step3; !(_step3 = _iterator3()).done;) {
          var u = _step3.value;
          var v = normalized[u];

          if (!isUndefined(v)) {
            foundFirst = true;
          } else if (foundFirst) {
            normalized[u] = defaultValues[u];
          } else {
            normalized[u] = objNow[u];
          }
        } // make sure the values we have are in range


        var higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized),
            invalid = higherOrderInvalid || hasInvalidTimeData(normalized);

        if (invalid) {
          return DateTime.invalid(invalid);
        } // compute the actual time


        var gregorian = useWeekData ? weekToGregorian(normalized) : containsOrdinal ? ordinalToGregorian(normalized) : normalized,
            _objToTS2 = objToTS(gregorian, offsetProvis, zoneToUse),
            tsFinal = _objToTS2[0],
            offsetFinal = _objToTS2[1],
            inst = new DateTime({
          ts: tsFinal,
          zone: zoneToUse,
          o: offsetFinal,
          loc: loc
        }); // gregorian data + weekday serves only to validate


        if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
          return DateTime.invalid("mismatched weekday", "you can't specify both a weekday of " + normalized.weekday + " and a date of " + inst.toISO());
        }

        return inst;
      }
      /**
       * Create a DateTime from an ISO 8601 string
       * @param {string} text - the ISO string
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
       * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
       * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
       * @param {string} [opts.outputCalendar] - the output calendar to set on the resulting DateTime instance
       * @param {string} [opts.numberingSystem] - the numbering system to set on the resulting DateTime instance
       * @example DateTime.fromISO('2016-05-25T09:08:34.123')
       * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
       * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
       * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
       * @example DateTime.fromISO('2016-W05-4')
       * @return {DateTime}
       */
      ;

      DateTime.fromISO = function fromISO(text, opts) {
        if (opts === void 0) {
          opts = {};
        }

        var _parseISODate = parseISODate(text),
            vals = _parseISODate[0],
            parsedZone = _parseISODate[1];

        return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
      }
      /**
       * Create a DateTime from an RFC 2822 string
       * @param {string} text - the RFC 2822 string
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
       * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
       * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
       * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
       * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
       * @return {DateTime}
       */
      ;

      DateTime.fromRFC2822 = function fromRFC2822(text, opts) {
        if (opts === void 0) {
          opts = {};
        }

        var _parseRFC2822Date = parseRFC2822Date(text),
            vals = _parseRFC2822Date[0],
            parsedZone = _parseRFC2822Date[1];

        return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
      }
      /**
       * Create a DateTime from an HTTP header date
       * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
       * @param {string} text - the HTTP header date
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
       * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
       * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
       * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
       * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
       * @return {DateTime}
       */
      ;

      DateTime.fromHTTP = function fromHTTP(text, opts) {
        if (opts === void 0) {
          opts = {};
        }

        var _parseHTTPDate = parseHTTPDate(text),
            vals = _parseHTTPDate[0],
            parsedZone = _parseHTTPDate[1];

        return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
      }
      /**
       * Create a DateTime from an input string and format string.
       * Defaults to en-US if no locale has been specified, regardless of the system's locale. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).
       * @param {string} text - the string to parse
       * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
       * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
       * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
       * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @return {DateTime}
       */
      ;

      DateTime.fromFormat = function fromFormat(text, fmt, opts) {
        if (opts === void 0) {
          opts = {};
        }

        if (isUndefined(text) || isUndefined(fmt)) {
          throw new InvalidArgumentError("fromFormat requires an input string and a format");
        }

        var _opts = opts,
            _opts$locale = _opts.locale,
            locale = _opts$locale === void 0 ? null : _opts$locale,
            _opts$numberingSystem = _opts.numberingSystem,
            numberingSystem = _opts$numberingSystem === void 0 ? null : _opts$numberingSystem,
            localeToUse = Locale.fromOpts({
          locale: locale,
          numberingSystem: numberingSystem,
          defaultToEN: true
        }),
            _parseFromTokens = parseFromTokens(localeToUse, text, fmt),
            vals = _parseFromTokens[0],
            parsedZone = _parseFromTokens[1],
            specificOffset = _parseFromTokens[2],
            invalid = _parseFromTokens[3];

        if (invalid) {
          return DateTime.invalid(invalid);
        } else {
          return parseDataToDateTime(vals, parsedZone, opts, "format " + fmt, text, specificOffset);
        }
      }
      /**
       * @deprecated use fromFormat instead
       */
      ;

      DateTime.fromString = function fromString(text, fmt, opts) {
        if (opts === void 0) {
          opts = {};
        }

        return DateTime.fromFormat(text, fmt, opts);
      }
      /**
       * Create a DateTime from a SQL date, time, or datetime
       * Defaults to en-US if no locale has been specified, regardless of the system's locale
       * @param {string} text - the string to parse
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
       * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
       * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
       * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @example DateTime.fromSQL('2017-05-15')
       * @example DateTime.fromSQL('2017-05-15 09:12:34')
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
       * @example DateTime.fromSQL('09:12:34.342')
       * @return {DateTime}
       */
      ;

      DateTime.fromSQL = function fromSQL(text, opts) {
        if (opts === void 0) {
          opts = {};
        }

        var _parseSQL = parseSQL(text),
            vals = _parseSQL[0],
            parsedZone = _parseSQL[1];

        return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
      }
      /**
       * Create an invalid DateTime.
       * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent
       * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
       * @return {DateTime}
       */
      ;

      DateTime.invalid = function invalid(reason, explanation) {
        if (explanation === void 0) {
          explanation = null;
        }

        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
        }

        var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

        if (Settings.throwOnInvalid) {
          throw new InvalidDateTimeError(invalid);
        } else {
          return new DateTime({
            invalid: invalid
          });
        }
      }
      /**
       * Check if an object is a DateTime. Works across context boundaries
       * @param {object} o
       * @return {boolean}
       */
      ;

      DateTime.isDateTime = function isDateTime(o) {
        return o && o.isLuxonDateTime || false;
      } // INFO

      /**
       * Get the value of unit.
       * @param {string} unit - a unit such as 'minute' or 'day'
       * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
       * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
       * @return {number}
       */
      ;

      var _proto = DateTime.prototype;

      _proto.get = function get(unit) {
        return this[unit];
      }
      /**
       * Returns whether the DateTime is valid. Invalid DateTimes occur when:
       * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
       * * The DateTime was created by an operation on another invalid date
       * @type {boolean}
       */
      ;

      /**
       * Returns the resolved Intl options for this DateTime.
       * This is useful in understanding the behavior of formatting methods
       * @param {Object} opts - the same options as toLocaleString
       * @return {Object}
       */
      _proto.resolvedLocaleOptions = function resolvedLocaleOptions(opts) {
        if (opts === void 0) {
          opts = {};
        }

        var _Formatter$create$res = Formatter.create(this.loc.clone(opts), opts).resolvedOptions(this),
            locale = _Formatter$create$res.locale,
            numberingSystem = _Formatter$create$res.numberingSystem,
            calendar = _Formatter$create$res.calendar;

        return {
          locale: locale,
          numberingSystem: numberingSystem,
          outputCalendar: calendar
        };
      } // TRANSFORM

      /**
       * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
       *
       * Equivalent to {@link DateTime#setZone}('utc')
       * @param {number} [offset=0] - optionally, an offset from UTC in minutes
       * @param {Object} [opts={}] - options to pass to `setZone()`
       * @return {DateTime}
       */
      ;

      _proto.toUTC = function toUTC(offset, opts) {
        if (offset === void 0) {
          offset = 0;
        }

        if (opts === void 0) {
          opts = {};
        }

        return this.setZone(FixedOffsetZone.instance(offset), opts);
      }
      /**
       * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
       *
       * Equivalent to `setZone('local')`
       * @return {DateTime}
       */
      ;

      _proto.toLocal = function toLocal() {
        return this.setZone(Settings.defaultZone);
      }
      /**
       * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
       *
       * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link DateTime#plus}. You may wish to use {@link DateTime#toLocal} and {@link DateTime#toUTC} which provide simple convenience wrappers for commonly used zones.
       * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link DateTime#Zone} class.
       * @param {Object} opts - options
       * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
       * @return {DateTime}
       */
      ;

      _proto.setZone = function setZone(zone, _temp) {
        var _ref3 = _temp === void 0 ? {} : _temp,
            _ref3$keepLocalTime = _ref3.keepLocalTime,
            keepLocalTime = _ref3$keepLocalTime === void 0 ? false : _ref3$keepLocalTime,
            _ref3$keepCalendarTim = _ref3.keepCalendarTime,
            keepCalendarTime = _ref3$keepCalendarTim === void 0 ? false : _ref3$keepCalendarTim;

        zone = normalizeZone(zone, Settings.defaultZone);

        if (zone.equals(this.zone)) {
          return this;
        } else if (!zone.isValid) {
          return DateTime.invalid(unsupportedZone(zone));
        } else {
          var newTS = this.ts;

          if (keepLocalTime || keepCalendarTime) {
            var offsetGuess = zone.offset(this.ts);
            var asObj = this.toObject();

            var _objToTS3 = objToTS(asObj, offsetGuess, zone);

            newTS = _objToTS3[0];
          }

          return clone(this, {
            ts: newTS,
            zone: zone
          });
        }
      }
      /**
       * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
       * @param {Object} properties - the properties to set
       * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
       * @return {DateTime}
       */
      ;

      _proto.reconfigure = function reconfigure(_temp2) {
        var _ref4 = _temp2 === void 0 ? {} : _temp2,
            locale = _ref4.locale,
            numberingSystem = _ref4.numberingSystem,
            outputCalendar = _ref4.outputCalendar;

        var loc = this.loc.clone({
          locale: locale,
          numberingSystem: numberingSystem,
          outputCalendar: outputCalendar
        });
        return clone(this, {
          loc: loc
        });
      }
      /**
       * "Set" the locale. Returns a newly-constructed DateTime.
       * Just a convenient alias for reconfigure({ locale })
       * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
       * @return {DateTime}
       */
      ;

      _proto.setLocale = function setLocale(locale) {
        return this.reconfigure({
          locale: locale
        });
      }
      /**
       * "Set" the values of specified units. Returns a newly-constructed DateTime.
       * You can only set units with this method; for "setting" metadata, see {@link DateTime#reconfigure} and {@link DateTime#setZone}.
       * @param {Object} values - a mapping of units to numbers
       * @example dt.set({ year: 2017 })
       * @example dt.set({ hour: 8, minute: 30 })
       * @example dt.set({ weekday: 5 })
       * @example dt.set({ year: 2005, ordinal: 234 })
       * @return {DateTime}
       */
      ;

      _proto.set = function set(values) {
        if (!this.isValid) return this;
        var normalized = normalizeObject(values, normalizeUnit),
            settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday),
            containsOrdinal = !isUndefined(normalized.ordinal),
            containsGregorYear = !isUndefined(normalized.year),
            containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day),
            containsGregor = containsGregorYear || containsGregorMD,
            definiteWeekDef = normalized.weekYear || normalized.weekNumber;

        if ((containsGregor || containsOrdinal) && definiteWeekDef) {
          throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
        }

        if (containsGregorMD && containsOrdinal) {
          throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
        }

        var mixed;

        if (settingWeekStuff) {
          mixed = weekToGregorian(_extends({}, gregorianToWeek(this.c), normalized));
        } else if (!isUndefined(normalized.ordinal)) {
          mixed = ordinalToGregorian(_extends({}, gregorianToOrdinal(this.c), normalized));
        } else {
          mixed = _extends({}, this.toObject(), normalized); // if we didn't set the day but we ended up on an overflow date,
          // use the last day of the right month

          if (isUndefined(normalized.day)) {
            mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
          }
        }

        var _objToTS4 = objToTS(mixed, this.o, this.zone),
            ts = _objToTS4[0],
            o = _objToTS4[1];

        return clone(this, {
          ts: ts,
          o: o
        });
      }
      /**
       * Add a period of time to this DateTime and return the resulting DateTime
       *
       * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
       * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
       * @example DateTime.now().plus(123) //~> in 123 milliseconds
       * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
       * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
       * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
       * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
       * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
       * @return {DateTime}
       */
      ;

      _proto.plus = function plus(duration) {
        if (!this.isValid) return this;
        var dur = Duration.fromDurationLike(duration);
        return clone(this, adjustTime(this, dur));
      }
      /**
       * Subtract a period of time to this DateTime and return the resulting DateTime
       * See {@link DateTime#plus}
       * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
       @return {DateTime}
      */
      ;

      _proto.minus = function minus(duration) {
        if (!this.isValid) return this;
        var dur = Duration.fromDurationLike(duration).negate();
        return clone(this, adjustTime(this, dur));
      }
      /**
       * "Set" this DateTime to the beginning of a unit of time.
       * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
       * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
       * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
       * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
       * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
       * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
       * @return {DateTime}
       */
      ;

      _proto.startOf = function startOf(unit) {
        if (!this.isValid) return this;
        var o = {},
            normalizedUnit = Duration.normalizeUnit(unit);

        switch (normalizedUnit) {
          case "years":
            o.month = 1;
          // falls through

          case "quarters":
          case "months":
            o.day = 1;
          // falls through

          case "weeks":
          case "days":
            o.hour = 0;
          // falls through

          case "hours":
            o.minute = 0;
          // falls through

          case "minutes":
            o.second = 0;
          // falls through

          case "seconds":
            o.millisecond = 0;
            break;
          // no default, invalid units throw in normalizeUnit()
        }

        if (normalizedUnit === "weeks") {
          o.weekday = 1;
        }

        if (normalizedUnit === "quarters") {
          var q = Math.ceil(this.month / 3);
          o.month = (q - 1) * 3 + 1;
        }

        return this.set(o);
      }
      /**
       * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
       * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
       * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
       * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
       * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
       * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
       * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
       * @return {DateTime}
       */
      ;

      _proto.endOf = function endOf(unit) {
        var _this$plus;

        return this.isValid ? this.plus((_this$plus = {}, _this$plus[unit] = 1, _this$plus)).startOf(unit).minus(1) : this;
      } // OUTPUT

      /**
       * Returns a string representation of this DateTime formatted according to the specified format string.
       * **You may not want this.** See {@link DateTime#toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
       * Defaults to en-US if no locale has been specified, regardless of the system's locale.
       * @param {string} fmt - the format string
       * @param {Object} opts - opts to override the configuration options on this DateTime
       * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
       * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
       * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
       * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
       * @return {string}
       */
      ;

      _proto.toFormat = function toFormat(fmt, opts) {
        if (opts === void 0) {
          opts = {};
        }

        return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID;
      }
      /**
       * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
       * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
       * of the DateTime in the assigned locale.
       * Defaults to the system's locale if no locale has been specified
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
       * @param formatOpts {Object} - Intl.DateTimeFormat constructor options and configuration options
       * @param {Object} opts - opts to override the configuration options on this DateTime
       * @example DateTime.now().toLocaleString(); //=> 4/20/2017
       * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
       * @example DateTime.now().toLocaleString({ locale: 'en-gb' }); //=> '20/04/2017'
       * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
       * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
       * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
       * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
       * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
       * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); //=> '11:32'
       * @return {string}
       */
      ;

      _proto.toLocaleString = function toLocaleString(formatOpts, opts) {
        if (formatOpts === void 0) {
          formatOpts = DATE_SHORT;
        }

        if (opts === void 0) {
          opts = {};
        }

        return this.isValid ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this) : INVALID;
      }
      /**
       * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
       * Defaults to the system's locale if no locale has been specified
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
       * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
       * @example DateTime.now().toLocaleParts(); //=> [
       *                                   //=>   { type: 'day', value: '25' },
       *                                   //=>   { type: 'literal', value: '/' },
       *                                   //=>   { type: 'month', value: '05' },
       *                                   //=>   { type: 'literal', value: '/' },
       *                                   //=>   { type: 'year', value: '1982' }
       *                                   //=> ]
       */
      ;

      _proto.toLocaleParts = function toLocaleParts(opts) {
        if (opts === void 0) {
          opts = {};
        }

        return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
      }
      /**
       * Returns an ISO 8601-compliant string representation of this DateTime
       * @param {Object} opts - options
       * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
       * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
       * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
       * @param {string} [opts.format='extended'] - choose between the basic and extended format
       * @example DateTime.utc(1982, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
       * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
       * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
       * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
       * @return {string}
       */
      ;

      _proto.toISO = function toISO(opts) {
        if (opts === void 0) {
          opts = {};
        }

        if (!this.isValid) {
          return null;
        }

        return this.toISODate(opts) + "T" + this.toISOTime(opts);
      }
      /**
       * Returns an ISO 8601-compliant string representation of this DateTime's date component
       * @param {Object} opts - options
       * @param {string} [opts.format='extended'] - choose between the basic and extended format
       * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
       * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
       * @return {string}
       */
      ;

      _proto.toISODate = function toISODate(_temp3) {
        var _ref5 = _temp3 === void 0 ? {} : _temp3,
            _ref5$format = _ref5.format,
            format = _ref5$format === void 0 ? "extended" : _ref5$format;

        var fmt = format === "basic" ? "yyyyMMdd" : "yyyy-MM-dd";

        if (this.year > 9999) {
          fmt = "+" + fmt;
        }

        return toTechFormat(this, fmt);
      }
      /**
       * Returns an ISO 8601-compliant string representation of this DateTime's week date
       * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
       * @return {string}
       */
      ;

      _proto.toISOWeekDate = function toISOWeekDate() {
        return toTechFormat(this, "kkkk-'W'WW-c");
      }
      /**
       * Returns an ISO 8601-compliant string representation of this DateTime's time component
       * @param {Object} opts - options
       * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
       * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
       * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
       * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
       * @param {string} [opts.format='extended'] - choose between the basic and extended format
       * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
       * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
       * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
       * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
       * @return {string}
       */
      ;

      _proto.toISOTime = function toISOTime(_temp4) {
        var _ref6 = _temp4 === void 0 ? {} : _temp4,
            _ref6$suppressMillise = _ref6.suppressMilliseconds,
            suppressMilliseconds = _ref6$suppressMillise === void 0 ? false : _ref6$suppressMillise,
            _ref6$suppressSeconds = _ref6.suppressSeconds,
            suppressSeconds = _ref6$suppressSeconds === void 0 ? false : _ref6$suppressSeconds,
            _ref6$includeOffset = _ref6.includeOffset,
            includeOffset = _ref6$includeOffset === void 0 ? true : _ref6$includeOffset,
            _ref6$includePrefix = _ref6.includePrefix,
            includePrefix = _ref6$includePrefix === void 0 ? false : _ref6$includePrefix,
            _ref6$format = _ref6.format,
            format = _ref6$format === void 0 ? "extended" : _ref6$format;

        return toTechTimeFormat(this, {
          suppressSeconds: suppressSeconds,
          suppressMilliseconds: suppressMilliseconds,
          includeOffset: includeOffset,
          includePrefix: includePrefix,
          format: format
        });
      }
      /**
       * Returns an RFC 2822-compatible string representation of this DateTime, always in UTC
       * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
       * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
       * @return {string}
       */
      ;

      _proto.toRFC2822 = function toRFC2822() {
        return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
      }
      /**
       * Returns a string representation of this DateTime appropriate for use in HTTP headers.
       * Specifically, the string conforms to RFC 1123.
       * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
       * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
       * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
       * @return {string}
       */
      ;

      _proto.toHTTP = function toHTTP() {
        return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
      }
      /**
       * Returns a string representation of this DateTime appropriate for use in SQL Date
       * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
       * @return {string}
       */
      ;

      _proto.toSQLDate = function toSQLDate() {
        return toTechFormat(this, "yyyy-MM-dd");
      }
      /**
       * Returns a string representation of this DateTime appropriate for use in SQL Time
       * @param {Object} opts - options
       * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
       * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
       * @example DateTime.utc().toSQL() //=> '05:15:16.345'
       * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
       * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
       * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
       * @return {string}
       */
      ;

      _proto.toSQLTime = function toSQLTime(_temp5) {
        var _ref7 = _temp5 === void 0 ? {} : _temp5,
            _ref7$includeOffset = _ref7.includeOffset,
            includeOffset = _ref7$includeOffset === void 0 ? true : _ref7$includeOffset,
            _ref7$includeZone = _ref7.includeZone,
            includeZone = _ref7$includeZone === void 0 ? false : _ref7$includeZone;

        return toTechTimeFormat(this, {
          includeOffset: includeOffset,
          includeZone: includeZone,
          spaceZone: true
        });
      }
      /**
       * Returns a string representation of this DateTime appropriate for use in SQL DateTime
       * @param {Object} opts - options
       * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
       * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
       * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
       * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
       * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
       * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
       * @return {string}
       */
      ;

      _proto.toSQL = function toSQL(opts) {
        if (opts === void 0) {
          opts = {};
        }

        if (!this.isValid) {
          return null;
        }

        return this.toSQLDate() + " " + this.toSQLTime(opts);
      }
      /**
       * Returns a string representation of this DateTime appropriate for debugging
       * @return {string}
       */
      ;

      _proto.toString = function toString() {
        return this.isValid ? this.toISO() : INVALID;
      }
      /**
       * Returns the epoch milliseconds of this DateTime. Alias of {@link DateTime#toMillis}
       * @return {number}
       */
      ;

      _proto.valueOf = function valueOf() {
        return this.toMillis();
      }
      /**
       * Returns the epoch milliseconds of this DateTime.
       * @return {number}
       */
      ;

      _proto.toMillis = function toMillis() {
        return this.isValid ? this.ts : NaN;
      }
      /**
       * Returns the epoch seconds of this DateTime.
       * @return {number}
       */
      ;

      _proto.toSeconds = function toSeconds() {
        return this.isValid ? this.ts / 1000 : NaN;
      }
      /**
       * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
       * @return {string}
       */
      ;

      _proto.toJSON = function toJSON() {
        return this.toISO();
      }
      /**
       * Returns a BSON serializable equivalent to this DateTime.
       * @return {Date}
       */
      ;

      _proto.toBSON = function toBSON() {
        return this.toJSDate();
      }
      /**
       * Returns a JavaScript object with this DateTime's year, month, day, and so on.
       * @param opts - options for generating the object
       * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
       * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
       * @return {Object}
       */
      ;

      _proto.toObject = function toObject(opts) {
        if (opts === void 0) {
          opts = {};
        }

        if (!this.isValid) return {};

        var base = _extends({}, this.c);

        if (opts.includeConfig) {
          base.outputCalendar = this.outputCalendar;
          base.numberingSystem = this.loc.numberingSystem;
          base.locale = this.loc.locale;
        }

        return base;
      }
      /**
       * Returns a JavaScript Date equivalent to this DateTime.
       * @return {Date}
       */
      ;

      _proto.toJSDate = function toJSDate() {
        return new Date(this.isValid ? this.ts : NaN);
      } // COMPARE

      /**
       * Return the difference between two DateTimes as a Duration.
       * @param {DateTime} otherDateTime - the DateTime to compare this one to
       * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
       * @param {Object} opts - options that affect the creation of the Duration
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @example
       * var i1 = DateTime.fromISO('1982-05-25T09:45'),
       *     i2 = DateTime.fromISO('1983-10-14T10:30');
       * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
       * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
       * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
       * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
       * @return {Duration}
       */
      ;

      _proto.diff = function diff(otherDateTime, unit, opts) {
        if (unit === void 0) {
          unit = "milliseconds";
        }

        if (opts === void 0) {
          opts = {};
        }

        if (!this.isValid || !otherDateTime.isValid) {
          return Duration.invalid("created by diffing an invalid DateTime");
        }

        var durOpts = _extends({
          locale: this.locale,
          numberingSystem: this.numberingSystem
        }, opts);

        var units = maybeArray(unit).map(Duration.normalizeUnit),
            otherIsLater = otherDateTime.valueOf() > this.valueOf(),
            earlier = otherIsLater ? this : otherDateTime,
            later = otherIsLater ? otherDateTime : this,
            diffed = _diff(earlier, later, units, durOpts);

        return otherIsLater ? diffed.negate() : diffed;
      }
      /**
       * Return the difference between this DateTime and right now.
       * See {@link DateTime#diff}
       * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
       * @param {Object} opts - options that affect the creation of the Duration
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @return {Duration}
       */
      ;

      _proto.diffNow = function diffNow(unit, opts) {
        if (unit === void 0) {
          unit = "milliseconds";
        }

        if (opts === void 0) {
          opts = {};
        }

        return this.diff(DateTime.now(), unit, opts);
      }
      /**
       * Return an Interval spanning between this DateTime and another DateTime
       * @param {DateTime} otherDateTime - the other end point of the Interval
       * @return {Interval}
       */
      ;

      _proto.until = function until(otherDateTime) {
        return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
      }
      /**
       * Return whether this DateTime is in the same unit of time as another DateTime.
       * Higher-order units must also be identical for this function to return `true`.
       * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link DateTime#setZone} to convert one of the dates if needed.
       * @param {DateTime} otherDateTime - the other DateTime
       * @param {string} unit - the unit of time to check sameness on
       * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
       * @return {boolean}
       */
      ;

      _proto.hasSame = function hasSame(otherDateTime, unit) {
        if (!this.isValid) return false;
        var inputMs = otherDateTime.valueOf();
        var otherZoneDateTime = this.setZone(otherDateTime.zone, {
          keepLocalTime: true
        });
        return otherZoneDateTime.startOf(unit) <= inputMs && inputMs <= otherZoneDateTime.endOf(unit);
      }
      /**
       * Equality check
       * Two DateTimes are equal iff they represent the same millisecond, have the same zone and location, and are both valid.
       * To compare just the millisecond values, use `+dt1 === +dt2`.
       * @param {DateTime} other - the other DateTime
       * @return {boolean}
       */
      ;

      _proto.equals = function equals(other) {
        return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
      }
      /**
       * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
       * platform supports Intl.RelativeTimeFormat. Rounds down by default.
       * @param {Object} options - options that affect the output
       * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
       * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
       * @param {string|string[]} options.unit - use a specific unit or array of units; if omitted, or an array, the method will pick the best unit. Use an array or one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
       * @param {boolean} [options.round=true] - whether to round the numbers in the output.
       * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
       * @param {string} options.locale - override the locale of this DateTime
       * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
       * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
       * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
       * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
       * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
       * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
       * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
       */
      ;

      _proto.toRelative = function toRelative(options) {
        if (options === void 0) {
          options = {};
        }

        if (!this.isValid) return null;
        var base = options.base || DateTime.fromObject({}, {
          zone: this.zone
        }),
            padding = options.padding ? this < base ? -options.padding : options.padding : 0;
        var units = ["years", "months", "days", "hours", "minutes", "seconds"];
        var unit = options.unit;

        if (Array.isArray(options.unit)) {
          units = options.unit;
          unit = undefined;
        }

        return diffRelative(base, this.plus(padding), _extends({}, options, {
          numeric: "always",
          units: units,
          unit: unit
        }));
      }
      /**
       * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
       * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
       * @param {Object} options - options that affect the output
       * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
       * @param {string} options.locale - override the locale of this DateTime
       * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
       * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
       * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
       * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
       * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
       * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
       */
      ;

      _proto.toRelativeCalendar = function toRelativeCalendar(options) {
        if (options === void 0) {
          options = {};
        }

        if (!this.isValid) return null;
        return diffRelative(options.base || DateTime.fromObject({}, {
          zone: this.zone
        }), this, _extends({}, options, {
          numeric: "auto",
          units: ["years", "months", "days"],
          calendary: true
        }));
      }
      /**
       * Return the min of several date times
       * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
       * @return {DateTime} the min DateTime, or undefined if called with no argument
       */
      ;

      DateTime.min = function min() {
        for (var _len = arguments.length, dateTimes = new Array(_len), _key = 0; _key < _len; _key++) {
          dateTimes[_key] = arguments[_key];
        }

        if (!dateTimes.every(DateTime.isDateTime)) {
          throw new InvalidArgumentError("min requires all arguments be DateTimes");
        }

        return bestBy(dateTimes, function (i) {
          return i.valueOf();
        }, Math.min);
      }
      /**
       * Return the max of several date times
       * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
       * @return {DateTime} the max DateTime, or undefined if called with no argument
       */
      ;

      DateTime.max = function max() {
        for (var _len2 = arguments.length, dateTimes = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          dateTimes[_key2] = arguments[_key2];
        }

        if (!dateTimes.every(DateTime.isDateTime)) {
          throw new InvalidArgumentError("max requires all arguments be DateTimes");
        }

        return bestBy(dateTimes, function (i) {
          return i.valueOf();
        }, Math.max);
      } // MISC

      /**
       * Explain how a string would be parsed by fromFormat()
       * @param {string} text - the string to parse
       * @param {string} fmt - the format the string is expected to be in (see description)
       * @param {Object} options - options taken by fromFormat()
       * @return {Object}
       */
      ;

      DateTime.fromFormatExplain = function fromFormatExplain(text, fmt, options) {
        if (options === void 0) {
          options = {};
        }

        var _options = options,
            _options$locale = _options.locale,
            locale = _options$locale === void 0 ? null : _options$locale,
            _options$numberingSys = _options.numberingSystem,
            numberingSystem = _options$numberingSys === void 0 ? null : _options$numberingSys,
            localeToUse = Locale.fromOpts({
          locale: locale,
          numberingSystem: numberingSystem,
          defaultToEN: true
        });
        return explainFromTokens(localeToUse, text, fmt);
      }
      /**
       * @deprecated use fromFormatExplain instead
       */
      ;

      DateTime.fromStringExplain = function fromStringExplain(text, fmt, options) {
        if (options === void 0) {
          options = {};
        }

        return DateTime.fromFormatExplain(text, fmt, options);
      } // FORMAT PRESETS

      /**
       * {@link DateTime#toLocaleString} format like 10/14/1983
       * @type {Object}
       */
      ;

      _createClass(DateTime, [{
        key: "isValid",
        get: function get() {
          return this.invalid === null;
        }
        /**
         * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
         * @type {string}
         */

      }, {
        key: "invalidReason",
        get: function get() {
          return this.invalid ? this.invalid.reason : null;
        }
        /**
         * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
         * @type {string}
         */

      }, {
        key: "invalidExplanation",
        get: function get() {
          return this.invalid ? this.invalid.explanation : null;
        }
        /**
         * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
         *
         * @type {string}
         */

      }, {
        key: "locale",
        get: function get() {
          return this.isValid ? this.loc.locale : null;
        }
        /**
         * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
         *
         * @type {string}
         */

      }, {
        key: "numberingSystem",
        get: function get() {
          return this.isValid ? this.loc.numberingSystem : null;
        }
        /**
         * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
         *
         * @type {string}
         */

      }, {
        key: "outputCalendar",
        get: function get() {
          return this.isValid ? this.loc.outputCalendar : null;
        }
        /**
         * Get the time zone associated with this DateTime.
         * @type {Zone}
         */

      }, {
        key: "zone",
        get: function get() {
          return this._zone;
        }
        /**
         * Get the name of the time zone.
         * @type {string}
         */

      }, {
        key: "zoneName",
        get: function get() {
          return this.isValid ? this.zone.name : null;
        }
        /**
         * Get the year
         * @example DateTime.local(2017, 5, 25).year //=> 2017
         * @type {number}
         */

      }, {
        key: "year",
        get: function get() {
          return this.isValid ? this.c.year : NaN;
        }
        /**
         * Get the quarter
         * @example DateTime.local(2017, 5, 25).quarter //=> 2
         * @type {number}
         */

      }, {
        key: "quarter",
        get: function get() {
          return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
        }
        /**
         * Get the month (1-12).
         * @example DateTime.local(2017, 5, 25).month //=> 5
         * @type {number}
         */

      }, {
        key: "month",
        get: function get() {
          return this.isValid ? this.c.month : NaN;
        }
        /**
         * Get the day of the month (1-30ish).
         * @example DateTime.local(2017, 5, 25).day //=> 25
         * @type {number}
         */

      }, {
        key: "day",
        get: function get() {
          return this.isValid ? this.c.day : NaN;
        }
        /**
         * Get the hour of the day (0-23).
         * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
         * @type {number}
         */

      }, {
        key: "hour",
        get: function get() {
          return this.isValid ? this.c.hour : NaN;
        }
        /**
         * Get the minute of the hour (0-59).
         * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
         * @type {number}
         */

      }, {
        key: "minute",
        get: function get() {
          return this.isValid ? this.c.minute : NaN;
        }
        /**
         * Get the second of the minute (0-59).
         * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
         * @type {number}
         */

      }, {
        key: "second",
        get: function get() {
          return this.isValid ? this.c.second : NaN;
        }
        /**
         * Get the millisecond of the second (0-999).
         * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
         * @type {number}
         */

      }, {
        key: "millisecond",
        get: function get() {
          return this.isValid ? this.c.millisecond : NaN;
        }
        /**
         * Get the week year
         * @see https://en.wikipedia.org/wiki/ISO_week_date
         * @example DateTime.local(2014, 12, 31).weekYear //=> 2015
         * @type {number}
         */

      }, {
        key: "weekYear",
        get: function get() {
          return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
        }
        /**
         * Get the week number of the week year (1-52ish).
         * @see https://en.wikipedia.org/wiki/ISO_week_date
         * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
         * @type {number}
         */

      }, {
        key: "weekNumber",
        get: function get() {
          return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
        }
        /**
         * Get the day of the week.
         * 1 is Monday and 7 is Sunday
         * @see https://en.wikipedia.org/wiki/ISO_week_date
         * @example DateTime.local(2014, 11, 31).weekday //=> 4
         * @type {number}
         */

      }, {
        key: "weekday",
        get: function get() {
          return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
        }
        /**
         * Get the ordinal (meaning the day of the year)
         * @example DateTime.local(2017, 5, 25).ordinal //=> 145
         * @type {number|DateTime}
         */

      }, {
        key: "ordinal",
        get: function get() {
          return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
        }
        /**
         * Get the human readable short month name, such as 'Oct'.
         * Defaults to the system's locale if no locale has been specified
         * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
         * @type {string}
         */

      }, {
        key: "monthShort",
        get: function get() {
          return this.isValid ? Info.months("short", {
            locObj: this.loc
          })[this.month - 1] : null;
        }
        /**
         * Get the human readable long month name, such as 'October'.
         * Defaults to the system's locale if no locale has been specified
         * @example DateTime.local(2017, 10, 30).monthLong //=> October
         * @type {string}
         */

      }, {
        key: "monthLong",
        get: function get() {
          return this.isValid ? Info.months("long", {
            locObj: this.loc
          })[this.month - 1] : null;
        }
        /**
         * Get the human readable short weekday, such as 'Mon'.
         * Defaults to the system's locale if no locale has been specified
         * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
         * @type {string}
         */

      }, {
        key: "weekdayShort",
        get: function get() {
          return this.isValid ? Info.weekdays("short", {
            locObj: this.loc
          })[this.weekday - 1] : null;
        }
        /**
         * Get the human readable long weekday, such as 'Monday'.
         * Defaults to the system's locale if no locale has been specified
         * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
         * @type {string}
         */

      }, {
        key: "weekdayLong",
        get: function get() {
          return this.isValid ? Info.weekdays("long", {
            locObj: this.loc
          })[this.weekday - 1] : null;
        }
        /**
         * Get the UTC offset of this DateTime in minutes
         * @example DateTime.now().offset //=> -240
         * @example DateTime.utc().offset //=> 0
         * @type {number}
         */

      }, {
        key: "offset",
        get: function get() {
          return this.isValid ? +this.o : NaN;
        }
        /**
         * Get the short human name for the zone's current offset, for example "EST" or "EDT".
         * Defaults to the system's locale if no locale has been specified
         * @type {string}
         */

      }, {
        key: "offsetNameShort",
        get: function get() {
          if (this.isValid) {
            return this.zone.offsetName(this.ts, {
              format: "short",
              locale: this.locale
            });
          } else {
            return null;
          }
        }
        /**
         * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
         * Defaults to the system's locale if no locale has been specified
         * @type {string}
         */

      }, {
        key: "offsetNameLong",
        get: function get() {
          if (this.isValid) {
            return this.zone.offsetName(this.ts, {
              format: "long",
              locale: this.locale
            });
          } else {
            return null;
          }
        }
        /**
         * Get whether this zone's offset ever changes, as in a DST.
         * @type {boolean}
         */

      }, {
        key: "isOffsetFixed",
        get: function get() {
          return this.isValid ? this.zone.isUniversal : null;
        }
        /**
         * Get whether the DateTime is in a DST.
         * @type {boolean}
         */

      }, {
        key: "isInDST",
        get: function get() {
          if (this.isOffsetFixed) {
            return false;
          } else {
            return this.offset > this.set({
              month: 1
            }).offset || this.offset > this.set({
              month: 5
            }).offset;
          }
        }
        /**
         * Returns true if this DateTime is in a leap year, false otherwise
         * @example DateTime.local(2016).isInLeapYear //=> true
         * @example DateTime.local(2013).isInLeapYear //=> false
         * @type {boolean}
         */

      }, {
        key: "isInLeapYear",
        get: function get() {
          return isLeapYear(this.year);
        }
        /**
         * Returns the number of days in this DateTime's month
         * @example DateTime.local(2016, 2).daysInMonth //=> 29
         * @example DateTime.local(2016, 3).daysInMonth //=> 31
         * @type {number}
         */

      }, {
        key: "daysInMonth",
        get: function get() {
          return daysInMonth(this.year, this.month);
        }
        /**
         * Returns the number of days in this DateTime's year
         * @example DateTime.local(2016).daysInYear //=> 366
         * @example DateTime.local(2013).daysInYear //=> 365
         * @type {number}
         */

      }, {
        key: "daysInYear",
        get: function get() {
          return this.isValid ? daysInYear(this.year) : NaN;
        }
        /**
         * Returns the number of weeks in this DateTime's year
         * @see https://en.wikipedia.org/wiki/ISO_week_date
         * @example DateTime.local(2004).weeksInWeekYear //=> 53
         * @example DateTime.local(2013).weeksInWeekYear //=> 52
         * @type {number}
         */

      }, {
        key: "weeksInWeekYear",
        get: function get() {
          return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
        }
      }], [{
        key: "DATE_SHORT",
        get: function get() {
          return DATE_SHORT;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'Oct 14, 1983'
         * @type {Object}
         */

      }, {
        key: "DATE_MED",
        get: function get() {
          return DATE_MED;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'Fri, Oct 14, 1983'
         * @type {Object}
         */

      }, {
        key: "DATE_MED_WITH_WEEKDAY",
        get: function get() {
          return DATE_MED_WITH_WEEKDAY;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'October 14, 1983'
         * @type {Object}
         */

      }, {
        key: "DATE_FULL",
        get: function get() {
          return DATE_FULL;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'Tuesday, October 14, 1983'
         * @type {Object}
         */

      }, {
        key: "DATE_HUGE",
        get: function get() {
          return DATE_HUGE;
        }
        /**
         * {@link DateTime#toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "TIME_SIMPLE",
        get: function get() {
          return TIME_SIMPLE;
        }
        /**
         * {@link DateTime#toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "TIME_WITH_SECONDS",
        get: function get() {
          return TIME_WITH_SECONDS;
        }
        /**
         * {@link DateTime#toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "TIME_WITH_SHORT_OFFSET",
        get: function get() {
          return TIME_WITH_SHORT_OFFSET;
        }
        /**
         * {@link DateTime#toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "TIME_WITH_LONG_OFFSET",
        get: function get() {
          return TIME_WITH_LONG_OFFSET;
        }
        /**
         * {@link DateTime#toLocaleString} format like '09:30', always 24-hour.
         * @type {Object}
         */

      }, {
        key: "TIME_24_SIMPLE",
        get: function get() {
          return TIME_24_SIMPLE;
        }
        /**
         * {@link DateTime#toLocaleString} format like '09:30:23', always 24-hour.
         * @type {Object}
         */

      }, {
        key: "TIME_24_WITH_SECONDS",
        get: function get() {
          return TIME_24_WITH_SECONDS;
        }
        /**
         * {@link DateTime#toLocaleString} format like '09:30:23 EDT', always 24-hour.
         * @type {Object}
         */

      }, {
        key: "TIME_24_WITH_SHORT_OFFSET",
        get: function get() {
          return TIME_24_WITH_SHORT_OFFSET;
        }
        /**
         * {@link DateTime#toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
         * @type {Object}
         */

      }, {
        key: "TIME_24_WITH_LONG_OFFSET",
        get: function get() {
          return TIME_24_WITH_LONG_OFFSET;
        }
        /**
         * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_SHORT",
        get: function get() {
          return DATETIME_SHORT;
        }
        /**
         * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_SHORT_WITH_SECONDS",
        get: function get() {
          return DATETIME_SHORT_WITH_SECONDS;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_MED",
        get: function get() {
          return DATETIME_MED;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_MED_WITH_SECONDS",
        get: function get() {
          return DATETIME_MED_WITH_SECONDS;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_MED_WITH_WEEKDAY",
        get: function get() {
          return DATETIME_MED_WITH_WEEKDAY;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_FULL",
        get: function get() {
          return DATETIME_FULL;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_FULL_WITH_SECONDS",
        get: function get() {
          return DATETIME_FULL_WITH_SECONDS;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_HUGE",
        get: function get() {
          return DATETIME_HUGE;
        }
        /**
         * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
         * @type {Object}
         */

      }, {
        key: "DATETIME_HUGE_WITH_SECONDS",
        get: function get() {
          return DATETIME_HUGE_WITH_SECONDS;
        }
      }]);

      return DateTime;
    }();
    function friendlyDateTime(dateTimeish) {
      if (DateTime.isDateTime(dateTimeish)) {
        return dateTimeish;
      } else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) {
        return DateTime.fromJSDate(dateTimeish);
      } else if (dateTimeish && typeof dateTimeish === "object") {
        return DateTime.fromObject(dateTimeish);
      } else {
        throw new InvalidArgumentError("Unknown datetime argument: " + dateTimeish + ", of type " + typeof dateTimeish);
      }
    }

    var DateTime_1 = DateTime;

    /* src/components/Trends.svelte generated by Svelte v3.43.2 */
    const file$1 = "src/components/Trends.svelte";

    // (24:2) {#if data}
    function create_if_block$1(ctx) {
    	let trendchart;
    	let current;

    	trendchart = new TrendChart({
    			props: { data: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(trendchart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(trendchart, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const trendchart_changes = {};
    			if (dirty & /*data*/ 1) trendchart_changes.data = /*data*/ ctx[0];
    			trendchart.$set(trendchart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(trendchart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(trendchart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(trendchart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(24:2) {#if data}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let current;
    	let if_block = /*data*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			add_location(main, file$1, 22, 0, 768);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Trends', slots, []);
    	let data;

    	onMount(async () => {
    		const runs = await api.getRuns();
    		runs.sort((a, b) => a.startTime - b.startTime);
    		runs.map(r => new DateTime_1(r.startTime));
    		const weeks = {};

    		runs.forEach(r => {
    			const weekTime = DateTime_1.fromMillis(r.startTime).startOf('week');

    			const week = weeks[weekTime] || {
    				distance: 0,
    				calories: 0,
    				time: 0,
    				weekStart: weekTime
    			};

    			week.distance += r.totalDistance;
    			week.calories += r.totalCalories;
    			week.time += r.totalTime;
    			weeks[weekTime] = week;
    		});

    		$$invalidate(0, data = { runs, weeks });
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Trends> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ TrendChart, api, onMount, DateTime: DateTime_1, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class Trends extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Trends",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.2 */
    const file = "src/App.svelte";

    // (11:37) 
    function create_if_block_1(ctx) {
    	let trends;
    	let current;
    	trends = new Trends({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(trends.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(trends, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(trends.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(trends.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(trends, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(11:37) ",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#if selectedTab === 'explorer'}
    function create_if_block(ctx) {
    	let explorer;
    	let current;
    	explorer = new Explorer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(explorer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(explorer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(explorer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(explorer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(explorer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(9:2) {#if selectedTab === 'explorer'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let tabbar;
    	let updating_active;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	function tabbar_active_binding(value) {
    		/*tabbar_active_binding*/ ctx[1](value);
    	}

    	let tabbar_props = {};

    	if (/*selectedTab*/ ctx[0] !== void 0) {
    		tabbar_props.active = /*selectedTab*/ ctx[0];
    	}

    	tabbar = new TabBar({ props: tabbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabbar, 'active', tabbar_active_binding));
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedTab*/ ctx[0] === 'explorer') return 0;
    		if (/*selectedTab*/ ctx[0] === 'trends') return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(tabbar.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(main, "class", "svelte-1qq47ll");
    			add_location(main, file, 6, 0, 208);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(tabbar, main, null);
    			append_dev(main, t);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabbar_changes = {};

    			if (!updating_active && dirty & /*selectedTab*/ 1) {
    				updating_active = true;
    				tabbar_changes.active = /*selectedTab*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			tabbar.$set(tabbar_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(tabbar);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let selectedTab = 'trends';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function tabbar_active_binding(value) {
    		selectedTab = value;
    		$$invalidate(0, selectedTab);
    	}

    	$$self.$capture_state = () => ({ TabBar, Explorer, Trends, selectedTab });

    	$$self.$inject_state = $$props => {
    		if ('selectedTab' in $$props) $$invalidate(0, selectedTab = $$props.selectedTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedTab, tabbar_active_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
