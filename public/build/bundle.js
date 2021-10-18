
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
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
                const nodes = children(options.target);
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
            this.$destroy = noop;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
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

    /* src\AddressItem.svelte generated by Svelte v3.44.0 */
    const file$2 = "src\\AddressItem.svelte";

    function create_fragment$3(ctx) {
    	let ion_item_sliding;
    	let ion_item;
    	let ion_label;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let ion_item_options;
    	let ion_item_option;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ion_item_sliding = element("ion-item-sliding");
    			ion_item = element("ion-item");
    			ion_label = element("ion-label");
    			t0 = text(/*addressNumber*/ ctx[0]);
    			t1 = space();
    			t2 = text(/*iotaBalance*/ ctx[1]);
    			t3 = space();
    			ion_item_options = element("ion-item-options");
    			ion_item_option = element("ion-item-option");
    			ion_item_option.textContent = "Unread";
    			add_location(ion_label, file$2, 10, 8, 243);
    			add_location(ion_item, file$2, 9, 4, 223);
    			add_location(ion_item_option, file$2, 13, 8, 357);
    			set_custom_element_data(ion_item_options, "side", "end");
    			add_location(ion_item_options, file$2, 12, 4, 318);
    			add_location(ion_item_sliding, file$2, 8, 0, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ion_item_sliding, anchor);
    			append_dev(ion_item_sliding, ion_item);
    			append_dev(ion_item, ion_label);
    			append_dev(ion_label, t0);
    			append_dev(ion_label, t1);
    			append_dev(ion_label, t2);
    			append_dev(ion_item_sliding, t3);
    			append_dev(ion_item_sliding, ion_item_options);
    			append_dev(ion_item_options, ion_item_option);

    			if (!mounted) {
    				dispose = listen_dev(ion_item_option, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*addressNumber*/ 1) set_data_dev(t0, /*addressNumber*/ ctx[0]);
    			if (dirty & /*iotaBalance*/ 2) set_data_dev(t2, /*iotaBalance*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ion_item_sliding);
    			mounted = false;
    			dispose();
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

    function remove() {
    	
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddressItem', slots, []);
    	let { addressNumber } = $$props;
    	let { iotaBalance } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ['addressNumber', 'iotaBalance'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddressItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => remove();

    	$$self.$$set = $$props => {
    		if ('addressNumber' in $$props) $$invalidate(0, addressNumber = $$props.addressNumber);
    		if ('iotaBalance' in $$props) $$invalidate(1, iotaBalance = $$props.iotaBalance);
    	};

    	$$self.$capture_state = () => ({
    		addressNumber,
    		iotaBalance,
    		createEventDispatcher,
    		dispatch,
    		remove
    	});

    	$$self.$inject_state = $$props => {
    		if ('addressNumber' in $$props) $$invalidate(0, addressNumber = $$props.addressNumber);
    		if ('iotaBalance' in $$props) $$invalidate(1, iotaBalance = $$props.iotaBalance);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [addressNumber, iotaBalance, click_handler];
    }

    class AddressItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { addressNumber: 0, iotaBalance: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddressItem",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*addressNumber*/ ctx[0] === undefined && !('addressNumber' in props)) {
    			console.warn("<AddressItem> was created without expected prop 'addressNumber'");
    		}

    		if (/*iotaBalance*/ ctx[1] === undefined && !('iotaBalance' in props)) {
    			console.warn("<AddressItem> was created without expected prop 'iotaBalance'");
    		}
    	}

    	get addressNumber() {
    		throw new Error("<AddressItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addressNumber(value) {
    		throw new Error("<AddressItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iotaBalance() {
    		throw new Error("<AddressItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iotaBalance(value) {
    		throw new Error("<AddressItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\AddressList.svelte generated by Svelte v3.44.0 */
    const file$1 = "src\\AddressList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (24:4) {#each allAddressesArray as address}
    function create_each_block(ctx) {
    	let addressitem;
    	let current;

    	addressitem = new AddressItem({
    			props: {
    				addressNumber: /*address*/ ctx[5].address,
    				iotaBalance: /*address*/ ctx[5].iotaAmount
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(addressitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addressitem, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addressitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addressitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addressitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(24:4) {#each allAddressesArray as address}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let ion_list;
    	let ion_item;
    	let ion_input;
    	let t0;
    	let ion_button;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*allAddressesArray*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ion_list = element("ion-list");
    			ion_item = element("ion-item");
    			ion_input = element("ion-input");
    			t0 = space();
    			ion_button = element("ion-button");
    			ion_button.textContent = "Enter";
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_custom_element_data(ion_input, "placeholder", "Enter Address");
    			add_location(ion_input, file$1, 19, 8, 627);
    			add_location(ion_button, file$1, 20, 8, 711);
    			add_location(ion_item, file$1, 18, 4, 607);
    			add_location(ion_list, file$1, 16, 0, 589);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ion_list, anchor);
    			append_dev(ion_list, ion_item);
    			append_dev(ion_item, ion_input);
    			append_dev(ion_item, t0);
    			append_dev(ion_item, ion_button);
    			append_dev(ion_list, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ion_list, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(ion_input, "input", /*handleInput*/ ctx[3], false, false, false),
    					listen_dev(ion_button, "click", /*click_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*allAddressesArray*/ 2) {
    				each_value = /*allAddressesArray*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ion_list, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

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
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ion_list);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('AddressList', slots, []);
    	let currentSearch;
    	const allAddressesArray = [];

    	for (let i = 0; i < 10; i++) {
    		let iotaAddress = {
    			address: Math.floor(Math.random() * 1000000000),
    			iotaAmount: Math.floor(Math.random() * 1000000000)
    		};

    		allAddressesArray.push(iotaAddress);
    	}

    	function addAddress(addressNumber) {
    		let iotaAddress = {
    			address: addressNumber,
    			iotaAmount: Math.floor(Math.random() * 1000000000)
    		};

    		allAddressesArray.push(iotaAddress);
    	}

    	function handleInput(e) {
    		$$invalidate(0, currentSearch = e.target.value);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddressList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => addAddress(currentSearch);

    	$$self.$capture_state = () => ({
    		AddressItem,
    		currentSearch,
    		allAddressesArray,
    		addAddress,
    		handleInput
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentSearch' in $$props) $$invalidate(0, currentSearch = $$props.currentSearch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentSearch, allAddressesArray, addAddress, handleInput, click_handler];
    }

    class AddressList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddressList",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\EnterAddressField.svelte generated by Svelte v3.44.0 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
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

    function EnterNewAddress() {
    	
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EnterAddressField', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EnterAddressField> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ EnterNewAddress });
    	return [];
    }

    class EnterAddressField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EnterAddressField",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let ion_app;
    	let ion_content;
    	let ion_header;
    	let ion_toolbar;
    	let ion_title;
    	let t0;
    	let t1;
    	let enteraddressfield;
    	let t2;
    	let addresslist;
    	let t3;
    	let ion_footer;
    	let ion_button;
    	let current;
    	let mounted;
    	let dispose;
    	enteraddressfield = new EnterAddressField({ $$inline: true });
    	addresslist = new AddressList({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			ion_app = element("ion-app");
    			ion_content = element("ion-content");
    			ion_header = element("ion-header");
    			ion_toolbar = element("ion-toolbar");
    			ion_title = element("ion-title");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			create_component(enteraddressfield.$$.fragment);
    			t2 = space();
    			create_component(addresslist.$$.fragment);
    			t3 = space();
    			ion_footer = element("ion-footer");
    			ion_button = element("ion-button");
    			ion_button.textContent = "Greet";
    			add_location(ion_title, file, 11, 5, 264);
    			add_location(ion_toolbar, file, 10, 4, 245);
    			add_location(ion_header, file, 9, 3, 228);
    			add_location(ion_content, file, 8, 2, 211);
    			set_custom_element_data(ion_button, "color", "secondary");
    			set_custom_element_data(ion_button, "expand", "block");
    			add_location(ion_button, file, 18, 3, 407);
    			add_location(ion_footer, file, 17, 2, 391);
    			add_location(ion_app, file, 7, 1, 199);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file, 6, 0, 191);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, ion_app);
    			append_dev(ion_app, ion_content);
    			append_dev(ion_content, ion_header);
    			append_dev(ion_header, ion_toolbar);
    			append_dev(ion_toolbar, ion_title);
    			append_dev(ion_title, t0);
    			append_dev(ion_content, t1);
    			mount_component(enteraddressfield, ion_content, null);
    			append_dev(ion_content, t2);
    			mount_component(addresslist, ion_content, null);
    			append_dev(ion_app, t3);
    			append_dev(ion_app, ion_footer);
    			append_dev(ion_footer, ion_button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(ion_button, "click", /*greet*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(enteraddressfield.$$.fragment, local);
    			transition_in(addresslist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(enteraddressfield.$$.fragment, local);
    			transition_out(addresslist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(enteraddressfield);
    			destroy_component(addresslist);
    			mounted = false;
    			dispose();
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
    	let { name } = $$props;
    	const greet = () => alert('hi');
    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		AddressList,
    		EnterAddressField,
    		name,
    		greet
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, greet];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'IOTA Address App'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
