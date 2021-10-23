import App from './views/App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'IOTA Address App'
	}
});

export default app;
