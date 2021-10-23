
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (Iota) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Iota__default = /*#__PURE__*/_interopDefaultLegacy(Iota);

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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var BalanceChoosingType;
    (function (BalanceChoosingType) {
        BalanceChoosingType["I"] = "i";
        BalanceChoosingType["KI"] = "Ki";
        BalanceChoosingType["MI"] = "Mi";
        BalanceChoosingType["GI"] = "Gi";
        BalanceChoosingType["TI"] = "Ti";
        BalanceChoosingType["PI"] = "Pi";
    })(BalanceChoosingType || (BalanceChoosingType = {}));
    // the multiplier values for all the different showing formats of iota
    function getMultiplier(id) {
        switch (id) {
            case BalanceChoosingType.I: {
                return 1000000;
            }
            case BalanceChoosingType.KI: {
                return 1000;
            }
            case BalanceChoosingType.MI: {
                return 1;
            }
            case BalanceChoosingType.GI: {
                return 1 / 1000;
            }
            case BalanceChoosingType.TI: {
                return 1 / 1000000;
            }
            case BalanceChoosingType.PI: {
                return 1 / 1000000;
            }
            default: {
                return 1 / 1000000000;
            }
        }
    }
    // stores the current balance type that is chosen and distributes it to the components
    const chosenBalanceType = writable(BalanceChoosingType.I);
    function changeChosenBalanceType(balanceType) {
        chosenBalanceType.set(balanceType);
    }
    // calculates how the number for the iota balance should be shown based on the type
    function calculateBalanceDisplay(iotaValueBalance, type) {
        if (type === BalanceChoosingType.I) {
            return iotaValueBalance;
        }
        const miota = iotaValueBalance / getMultiplier(BalanceChoosingType.I);
        return (miota * getMultiplier(type)).toFixed(2);
    }

    // Tried to use a map but it made problems in my AddressList even when converting it to an array (maybe I am missing something)
    // addresses writable that distributes the changes to all components
    const addresses = writable([]);
    // Adds address to the writable array addresses
    function addAddress(newAddress) {
        addresses.update($address => {
            const index = $address.findIndex((address => address.addressHash == newAddress.addressHash));
            if (index > -1) {
                throw new Error('Address is already listed');
            }
            $address = [...$address, newAddress];
            return $address;
        });
    }
    // Removes address to the writable array addresses
    function removeAddress(removableAddressHash) {
        addresses.update($address => {
            $address = $address.filter(t => t.addressHash !== removableAddressHash);
            return $address;
        });
    }
    // Adds new Amount to address.balance, is called when mqtt amount change was triggered inside the websocket
    function addBalanceToAddress(addressHash, balance) {
        addresses.update($address => {
            const index = $address.findIndex((address => address.addressHash == addressHash));
            $address[index].balance = $address[index].balance + balance;
            $address = [...$address];
            return $address;
        });
    }

    class MQTTWebsocketListener {
        constructor() {
            // the port where our local websocket runs
            // local port probably makes problems when we want to test on android/ios
            this.conn = new WebSocket('ws://localhost:9090');
            this.conn.onopen = () => {
                console.log("Connected to MQTT WebSocket");
            };
            // Listens to all the messages send from the websocket
            // And sorts them by type
            this.conn.onmessage = (msg) => {
                const data = JSON.parse(msg.data);
                console.log("Got message", data);
                try {
                    switch (data.type) {
                        case "registeredInWebsocket":
                            console.log("Registered in Websocket with " + data.websocketId);
                            break;
                        case "updateBalance":
                            // changes amount with values that the websocket got from his mqtt subscription
                            console.log("Changing amount of " + data.address + " to " + data.amount);
                            addBalanceToAddress(data.address, data.amount);
                            break;
                        case "subscriptionSuccessful":
                            console.log("Subscription for " + data.address + "was successful and is registered with subscription id " + data.subscriptionId);
                            break;
                        case "unSubscriptionSuccessful":
                            console.log("Unsubscription for " + data.address + " with id " + data.subscriptionId + "was successful");
                            break;
                        default:
                            break;
                    }
                }
                catch (e) {
                    console.log('Error', e);
                }
            };
            this.conn.onerror = function (err) {
                console.log("Got error", err);
            };
        }
        // sends to the websocket that it should add a subscription for the address
        // when now a amount change happens it will be send back to the client above
        addSubscription(addressHash) {
            this.conn.send(JSON.stringify({
                type: "subscribe",
                address: addressHash
            }));
        }
        // sends to the websocket that it should remove a subscription for the address
        removeSubscription(addressHash) {
            this.conn.send(JSON.stringify({
                type: "unsubscribe",
                address: addressHash
            }));
        }
    }
    const MQTTListener = new MQTTWebsocketListener();

    /* src\views\AddressItem.svelte generated by Svelte v3.44.0 */

    const { console: console_1 } = globals;
    const file$4 = "src\\views\\AddressItem.svelte";

    function create_fragment$4(ctx) {
    	let ion_item_sliding;
    	let ion_item;
    	let ion_label0;
    	let t0;
    	let t1;
    	let ion_label1;
    	let t2_value = calculateBalanceDisplay(/*iotaBalance*/ ctx[1], /*$chosenBalanceType*/ ctx[3]) + "";
    	let t2;
    	let t3;
    	let t4;
    	let ion_label1_color_value;
    	let t5;
    	let ion_item_options;
    	let ion_item_option;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ion_item_sliding = element("ion-item-sliding");
    			ion_item = element("ion-item");
    			ion_label0 = element("ion-label");
    			t0 = text(/*addressHash*/ ctx[0]);
    			t1 = space();
    			ion_label1 = element("ion-label");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(/*$chosenBalanceType*/ ctx[3]);
    			t5 = space();
    			ion_item_options = element("ion-item-options");
    			ion_item_option = element("ion-item-option");
    			ion_item_option.textContent = "Delete";
    			set_custom_element_data(ion_label0, "class", "ion-text-center");
    			add_location(ion_label0, file$4, 26, 8, 915);
    			set_custom_element_data(ion_label1, "color", ion_label1_color_value = /*onUpdate*/ ctx[2] ? 'tertiary' : '');
    			set_custom_element_data(ion_label1, "class", "ion-text-center");
    			add_location(ion_label1, file$4, 27, 8, 987);
    			add_location(ion_item, file$4, 25, 4, 895);
    			set_custom_element_data(ion_item_option, "color", "danger");
    			add_location(ion_item_option, file$4, 30, 8, 1209);
    			set_custom_element_data(ion_item_options, "side", "end");
    			add_location(ion_item_options, file$4, 29, 4, 1169);
    			add_location(ion_item_sliding, file$4, 24, 0, 871);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ion_item_sliding, anchor);
    			append_dev(ion_item_sliding, ion_item);
    			append_dev(ion_item, ion_label0);
    			append_dev(ion_label0, t0);
    			append_dev(ion_item, t1);
    			append_dev(ion_item, ion_label1);
    			append_dev(ion_label1, t2);
    			append_dev(ion_label1, t3);
    			append_dev(ion_label1, t4);
    			append_dev(ion_item_sliding, t5);
    			append_dev(ion_item_sliding, ion_item_options);
    			append_dev(ion_item_options, ion_item_option);

    			if (!mounted) {
    				dispose = listen_dev(ion_item_option, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*addressHash*/ 1) set_data_dev(t0, /*addressHash*/ ctx[0]);
    			if (dirty & /*iotaBalance, $chosenBalanceType*/ 10 && t2_value !== (t2_value = calculateBalanceDisplay(/*iotaBalance*/ ctx[1], /*$chosenBalanceType*/ ctx[3]) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$chosenBalanceType*/ 8) set_data_dev(t4, /*$chosenBalanceType*/ ctx[3]);

    			if (dirty & /*onUpdate*/ 4 && ion_label1_color_value !== (ion_label1_color_value = /*onUpdate*/ ctx[2] ? 'tertiary' : '')) {
    				set_custom_element_data(ion_label1, "color", ion_label1_color_value);
    			}
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $chosenBalanceType;
    	validate_store(chosenBalanceType, 'chosenBalanceType');
    	component_subscribe($$self, chosenBalanceType, $$value => $$invalidate(3, $chosenBalanceType = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddressItem', slots, []);
    	let { addressHash = '' } = $$props;
    	let { iotaBalance = 0 } = $$props;
    	let onUpdate = false;

    	function remove() {
    		console.log("removing address: " + addressHash);
    		MQTTListener.removeSubscription(addressHash);
    		removeAddress(addressHash);
    	}

    	// changed the color to blue for a short time when value changes
    	function onBalanceChanged(newBalance) {
    		console.log("Balance from address " + addressHash + " changed to " + newBalance);
    		$$invalidate(2, onUpdate = true);

    		setTimeout(
    			() => {
    				$$invalidate(2, onUpdate = false);
    			},
    			1000
    		);
    	}

    	const writable_props = ['addressHash', 'iotaBalance'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<AddressItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => remove();

    	$$self.$$set = $$props => {
    		if ('addressHash' in $$props) $$invalidate(0, addressHash = $$props.addressHash);
    		if ('iotaBalance' in $$props) $$invalidate(1, iotaBalance = $$props.iotaBalance);
    	};

    	$$self.$capture_state = () => ({
    		calculateBalanceDisplay,
    		chosenBalanceType,
    		MQTTListener,
    		removeAddress,
    		addressHash,
    		iotaBalance,
    		onUpdate,
    		remove,
    		onBalanceChanged,
    		$chosenBalanceType
    	});

    	$$self.$inject_state = $$props => {
    		if ('addressHash' in $$props) $$invalidate(0, addressHash = $$props.addressHash);
    		if ('iotaBalance' in $$props) $$invalidate(1, iotaBalance = $$props.iotaBalance);
    		if ('onUpdate' in $$props) $$invalidate(2, onUpdate = $$props.onUpdate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*iotaBalance*/ 2) {
    			// listens to balance changes
    			{
    				onBalanceChanged(iotaBalance);
    			}
    		}
    	};

    	return [addressHash, iotaBalance, onUpdate, $chosenBalanceType, remove, click_handler];
    }

    class AddressItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { addressHash: 0, iotaBalance: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddressItem",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get addressHash() {
    		throw new Error("<AddressItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addressHash(value) {
    		throw new Error("<AddressItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iotaBalance() {
    		throw new Error("<AddressItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iotaBalance(value) {
    		throw new Error("<AddressItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\views\AddressList.svelte generated by Svelte v3.44.0 */
    const file$3 = "src\\views\\AddressList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (7:4) {#each $addresses as address}
    function create_each_block(ctx) {
    	let addressitem;
    	let current;

    	addressitem = new AddressItem({
    			props: {
    				addressHash: /*address*/ ctx[1].addressHash,
    				iotaBalance: /*address*/ ctx[1].balance
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
    		p: function update(ctx, dirty) {
    			const addressitem_changes = {};
    			if (dirty & /*$addresses*/ 1) addressitem_changes.addressHash = /*address*/ ctx[1].addressHash;
    			if (dirty & /*$addresses*/ 1) addressitem_changes.iotaBalance = /*address*/ ctx[1].balance;
    			addressitem.$set(addressitem_changes);
    		},
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
    		source: "(7:4) {#each $addresses as address}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let ion_list;
    	let current;
    	let each_value = /*$addresses*/ ctx[0];
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ion_list, file$3, 5, 0, 140);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ion_list, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ion_list, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$addresses*/ 1) {
    				each_value = /*$addresses*/ ctx[0];
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
    	let $addresses;
    	validate_store(addresses, 'addresses');
    	component_subscribe($$self, addresses, $$value => $$invalidate(0, $addresses = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AddressList', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddressList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ AddressItem, addresses, $addresses });
    	return [$addresses];
    }

    class AddressList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddressList",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const client = new Iota__default["default"].SingleNodeClient("https://api.lb-0.h.chrysalis-devnet.iota.cafe/");
    // info function to see if client connection is available
    async function checkHealth() {
        const health = await client.health();
        console.log(health ? "Connected successfully with iota dev network" : "Problems with connecting to iota dev network");
    }
    // info function that shows teh attributes of the connected node
    async function checkInfo() {
        const info = await client.info();
        console.log("Node Info");
        console.log("\tName:", info.name);
        console.log("\tVersion:", info.version);
        console.log("\tIs Healthy:", info.isHealthy);
        console.log("\tNetwork Id:", info.networkId);
        console.log("\tLatest Milestone Index:", info.latestMilestoneIndex);
        console.log("\tConfirmed Milestone Index:", info.confirmedMilestoneIndex);
        console.log("\tPruning Index:", info.pruningIndex);
        console.log("\tFeatures:", info.features);
        console.log("\tMin PoW Score:", info.minPoWScore);
    }
    // checks the balance of the iota address with the iota singleNodeClient
    async function checkBalance(addressHash) {
        try {
            const address = await client.address(addressHash);
            console.log("Address");
            console.log("\tAddress:", address.address);
            console.log("\tBalance:", address.balance);
            return address.balance;
        }
        catch (e) {
            throw Error("Invalid Address, pls try another");
        }
    }

    /* src\views\EnterAddressField.svelte generated by Svelte v3.44.0 */
    const file$2 = "src\\views\\EnterAddressField.svelte";

    function create_fragment$2(ctx) {
    	let ion_item;
    	let input;
    	let input_class_value;
    	let input_placeholder_value;
    	let t;
    	let ion_button;
    	let ion_icon;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ion_item = element("ion-item");
    			input = element("input");
    			t = space();
    			ion_button = element("ion-button");
    			ion_icon = element("ion-icon");
    			attr_dev(input, "class", input_class_value = "InputButton " + (/*showError*/ ctx[1] ? 'Error' : '') + " svelte-238qgp");

    			attr_dev(input, "placeholder", input_placeholder_value = /*showError*/ ctx[1]
    			? /*errorMessage*/ ctx[2]
    			: 'Enter Address');

    			add_location(input, file$2, 48, 4, 1341);
    			set_custom_element_data(ion_icon, "slot", "icon-only");
    			set_custom_element_data(ion_icon, "name", "add-circle-sharp");
    			add_location(ion_icon, file$2, 50, 8, 1553);
    			set_custom_element_data(ion_button, "size", "middle");
    			add_location(ion_button, file$2, 49, 4, 1481);
    			add_location(ion_item, file$2, 46, 0, 1194);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ion_item, anchor);
    			append_dev(ion_item, input);
    			set_input_value(input, /*currentSearch*/ ctx[0]);
    			append_dev(ion_item, t);
    			append_dev(ion_item, ion_button);
    			append_dev(ion_button, ion_icon);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(ion_button, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*showError*/ 2 && input_class_value !== (input_class_value = "InputButton " + (/*showError*/ ctx[1] ? 'Error' : '') + " svelte-238qgp")) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*showError, errorMessage*/ 6 && input_placeholder_value !== (input_placeholder_value = /*showError*/ ctx[1]
    			? /*errorMessage*/ ctx[2]
    			: 'Enter Address')) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*currentSearch*/ 1 && input.value !== /*currentSearch*/ ctx[0]) {
    				set_input_value(input, /*currentSearch*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ion_item);
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
    	validate_slots('EnterAddressField', slots, []);
    	let currentSearch;
    	let showError = false;
    	let errorMessage = "";

    	async function enterNewAddress() {
    		let balance;

    		try {
    			balance = await checkBalance(currentSearch);
    			addAddress({ addressHash: currentSearch, balance });
    			MQTTListener.addSubscription(currentSearch);
    			$$invalidate(0, currentSearch = '');

    			if (showError) {
    				noErrorAnymore();
    			}
    		} catch(e) {
    			$$invalidate(0, currentSearch = '');
    			throwError(e.message);
    		}
    	}

    	// sets back the displaying of the error
    	function noErrorAnymore() {
    		$$invalidate(1, showError = false);
    		$$invalidate(2, errorMessage = '');
    	}

    	// changes showError so an error will be shown inside the input field
    	function throwError(errorMsg) {
    		$$invalidate(1, showError = true);
    		$$invalidate(2, errorMessage = errorMsg);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EnterAddressField> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		currentSearch = this.value;
    		$$invalidate(0, currentSearch);
    	}

    	const click_handler = () => enterNewAddress();

    	$$self.$capture_state = () => ({
    		addAddress,
    		checkBalance,
    		MQTTListener,
    		currentSearch,
    		showError,
    		errorMessage,
    		enterNewAddress,
    		noErrorAnymore,
    		throwError
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentSearch' in $$props) $$invalidate(0, currentSearch = $$props.currentSearch);
    		if ('showError' in $$props) $$invalidate(1, showError = $$props.showError);
    		if ('errorMessage' in $$props) $$invalidate(2, errorMessage = $$props.errorMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentSearch,
    		showError,
    		errorMessage,
    		enterNewAddress,
    		input_input_handler,
    		click_handler
    	];
    }

    class EnterAddressField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EnterAddressField",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\views\ChangeBalanceTypeToolBar.svelte generated by Svelte v3.44.0 */

    const file$1 = "src\\views\\ChangeBalanceTypeToolBar.svelte";

    function create_fragment$1(ctx) {
    	let ion_toolbar;
    	let ion_button0;
    	let t0;
    	let ion_button0_color_value;
    	let t1;
    	let ion_button1;
    	let t2;
    	let ion_button1_color_value;
    	let t3;
    	let ion_button2;
    	let t4;
    	let ion_button2_color_value;
    	let t5;
    	let ion_button3;
    	let t6;
    	let ion_button3_color_value;
    	let t7;
    	let ion_button4;
    	let t8;
    	let ion_button4_color_value;
    	let t9;
    	let ion_button5;
    	let t10;
    	let ion_button5_color_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ion_toolbar = element("ion-toolbar");
    			ion_button0 = element("ion-button");
    			t0 = text(" i ");
    			t1 = space();
    			ion_button1 = element("ion-button");
    			t2 = text("Ki");
    			t3 = space();
    			ion_button2 = element("ion-button");
    			t4 = text("Mi");
    			t5 = space();
    			ion_button3 = element("ion-button");
    			t6 = text("Gi");
    			t7 = space();
    			ion_button4 = element("ion-button");
    			t8 = text("Ti");
    			t9 = space();
    			ion_button5 = element("ion-button");
    			t10 = text("Ti");

    			set_custom_element_data(ion_button0, "color", ion_button0_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.I
    			? "primary"
    			: "secondary");

    			add_location(ion_button0, file$1, 4, 4, 264);

    			set_custom_element_data(ion_button1, "color", ion_button1_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.KI
    			? "primary"
    			: "secondary");

    			add_location(ion_button1, file$1, 8, 4, 482);

    			set_custom_element_data(ion_button2, "color", ion_button2_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.MI
    			? "primary"
    			: "secondary");

    			add_location(ion_button2, file$1, 12, 4, 691);

    			set_custom_element_data(ion_button3, "color", ion_button3_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.GI
    			? "primary"
    			: "secondary");

    			add_location(ion_button3, file$1, 16, 4, 900);

    			set_custom_element_data(ion_button4, "color", ion_button4_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.TI
    			? "primary"
    			: "secondary");

    			add_location(ion_button4, file$1, 20, 4, 1109);

    			set_custom_element_data(ion_button5, "color", ion_button5_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.PI
    			? "primary"
    			: "secondary");

    			add_location(ion_button5, file$1, 24, 4, 1318);
    			add_location(ion_toolbar, file$1, 3, 0, 245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ion_toolbar, anchor);
    			append_dev(ion_toolbar, ion_button0);
    			append_dev(ion_button0, t0);
    			append_dev(ion_toolbar, t1);
    			append_dev(ion_toolbar, ion_button1);
    			append_dev(ion_button1, t2);
    			append_dev(ion_toolbar, t3);
    			append_dev(ion_toolbar, ion_button2);
    			append_dev(ion_button2, t4);
    			append_dev(ion_toolbar, t5);
    			append_dev(ion_toolbar, ion_button3);
    			append_dev(ion_button3, t6);
    			append_dev(ion_toolbar, t7);
    			append_dev(ion_toolbar, ion_button4);
    			append_dev(ion_button4, t8);
    			append_dev(ion_toolbar, t9);
    			append_dev(ion_toolbar, ion_button5);
    			append_dev(ion_button5, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(ion_button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(ion_button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(ion_button2, "click", /*click_handler_2*/ ctx[3], false, false, false),
    					listen_dev(ion_button3, "click", /*click_handler_3*/ ctx[4], false, false, false),
    					listen_dev(ion_button4, "click", /*click_handler_4*/ ctx[5], false, false, false),
    					listen_dev(ion_button5, "click", /*click_handler_5*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$chosenBalanceType*/ 1 && ion_button0_color_value !== (ion_button0_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.I
    			? "primary"
    			: "secondary")) {
    				set_custom_element_data(ion_button0, "color", ion_button0_color_value);
    			}

    			if (dirty & /*$chosenBalanceType*/ 1 && ion_button1_color_value !== (ion_button1_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.KI
    			? "primary"
    			: "secondary")) {
    				set_custom_element_data(ion_button1, "color", ion_button1_color_value);
    			}

    			if (dirty & /*$chosenBalanceType*/ 1 && ion_button2_color_value !== (ion_button2_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.MI
    			? "primary"
    			: "secondary")) {
    				set_custom_element_data(ion_button2, "color", ion_button2_color_value);
    			}

    			if (dirty & /*$chosenBalanceType*/ 1 && ion_button3_color_value !== (ion_button3_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.GI
    			? "primary"
    			: "secondary")) {
    				set_custom_element_data(ion_button3, "color", ion_button3_color_value);
    			}

    			if (dirty & /*$chosenBalanceType*/ 1 && ion_button4_color_value !== (ion_button4_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.TI
    			? "primary"
    			: "secondary")) {
    				set_custom_element_data(ion_button4, "color", ion_button4_color_value);
    			}

    			if (dirty & /*$chosenBalanceType*/ 1 && ion_button5_color_value !== (ion_button5_color_value = /*$chosenBalanceType*/ ctx[0] === BalanceChoosingType.PI
    			? "primary"
    			: "secondary")) {
    				set_custom_element_data(ion_button5, "color", ion_button5_color_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ion_toolbar);
    			mounted = false;
    			run_all(dispose);
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
    	let $chosenBalanceType;
    	validate_store(chosenBalanceType, 'chosenBalanceType');
    	component_subscribe($$self, chosenBalanceType, $$value => $$invalidate(0, $chosenBalanceType = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ChangeBalanceTypeToolBar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ChangeBalanceTypeToolBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => changeChosenBalanceType(BalanceChoosingType.I);
    	const click_handler_1 = () => changeChosenBalanceType(BalanceChoosingType.KI);
    	const click_handler_2 = () => changeChosenBalanceType(BalanceChoosingType.MI);
    	const click_handler_3 = () => changeChosenBalanceType(BalanceChoosingType.GI);
    	const click_handler_4 = () => changeChosenBalanceType(BalanceChoosingType.TI);
    	const click_handler_5 = () => changeChosenBalanceType(BalanceChoosingType.PI);

    	$$self.$capture_state = () => ({
    		BalanceChoosingType,
    		changeChosenBalanceType,
    		chosenBalanceType,
    		$chosenBalanceType
    	});

    	return [
    		$chosenBalanceType,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class ChangeBalanceTypeToolBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChangeBalanceTypeToolBar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\views\App.svelte generated by Svelte v3.44.0 */
    const file = "src\\views\\App.svelte";

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
    	let ion_item;
    	let ion_label0;
    	let t4;
    	let ion_label1;
    	let t6;
    	let addresslist;
    	let t7;
    	let ion_footer;
    	let changebalancetype;
    	let current;
    	enteraddressfield = new EnterAddressField({ $$inline: true });
    	addresslist = new AddressList({ $$inline: true });
    	changebalancetype = new ChangeBalanceTypeToolBar({ $$inline: true });

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
    			ion_item = element("ion-item");
    			ion_label0 = element("ion-label");
    			ion_label0.textContent = "Address";
    			t4 = space();
    			ion_label1 = element("ion-label");
    			ion_label1.textContent = "Balance";
    			t6 = space();
    			create_component(addresslist.$$.fragment);
    			t7 = space();
    			ion_footer = element("ion-footer");
    			create_component(changebalancetype.$$.fragment);
    			add_location(ion_title, file, 33, 20, 807);
    			add_location(ion_toolbar, file, 32, 16, 773);
    			add_location(ion_header, file, 31, 12, 744);
    			set_custom_element_data(ion_label0, "class", "ion-text-center");
    			add_location(ion_label0, file, 38, 16, 966);
    			set_custom_element_data(ion_label1, "class", "ion-text-center");
    			add_location(ion_label1, file, 39, 16, 1038);
    			add_location(ion_item, file, 37, 12, 939);
    			add_location(ion_content, file, 30, 8, 718);
    			add_location(ion_footer, file, 43, 8, 1176);
    			add_location(ion_app, file, 29, 4, 700);
    			attr_dev(main, "class", "svelte-92w3al");
    			add_location(main, file, 28, 0, 689);
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
    			append_dev(ion_content, ion_item);
    			append_dev(ion_item, ion_label0);
    			append_dev(ion_item, t4);
    			append_dev(ion_item, ion_label1);
    			append_dev(ion_content, t6);
    			mount_component(addresslist, ion_content, null);
    			append_dev(ion_app, t7);
    			append_dev(ion_app, ion_footer);
    			mount_component(changebalancetype, ion_footer, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(enteraddressfield.$$.fragment, local);
    			transition_in(addresslist.$$.fragment, local);
    			transition_in(changebalancetype.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(enteraddressfield.$$.fragment, local);
    			transition_out(addresslist.$$.fragment, local);
    			transition_out(changebalancetype.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(enteraddressfield);
    			destroy_component(addresslist);
    			destroy_component(changebalancetype);
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

    	onMount(async () => {
    		// checks health and info of Iota connection
    		await checkHealth();

    		await checkInfo();
    	});

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
    		onMount,
    		checkHealth,
    		checkInfo,
    		ChangeBalanceType: ChangeBalanceTypeToolBar,
    		name
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
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

})(Iota);
//# sourceMappingURL=bundle.js.map
