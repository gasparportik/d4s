<script>
    import Calculator from './Calculator.svelte';
    import Icon from './Icon.svelte';
    import { parseParams, updateParams, onParamsChanged } from './functions';

    let diceGroups = [];
    function parseGroups(params) {
        diceGroups = (params.d || '').split('|').filter(g => !!g);
    }
    onParamsChanged(parseGroups);
    parseGroups(parseParams());
    $: updateParams({ d: diceGroups.join('|') });

    let settingsVisible = false;
    let helpVisible = false;
    let settings = {
        showAggregate: false,
        showChart: true,
        showStats: true,
        showHistory: true,
        showTable: true,
    };

    function add() {
        diceGroups = [...diceGroups, ''];
    }
    function remove(index) {
        diceGroups = diceGroups.filter((_, i) => i !== index);
    }

    let rollIndex = 0;
    function rollAll() {
        rollIndex += 1;
    }
</script>

<style>
    .app-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .calculators {
        display: flex;
        flex-direction: row;
        justify-items: stretch;
    }
    aside:not(.visible) {
        display: none;
    }
    .app-content {
        flex: 1 1 auto;
    }
    :global(.calculators > .calculator) {
        flex: 1 1 0;
    }
</style>

<header class="app-header">
    <h1 class="app-title">
        <img class="logo" src="logo.svg" alt="d4s" />
        <span class="title-long">D&D die distribution statistics</span>
    </h1>
    <div class="actions">
        <button on:click={add} title="Add new calculator">
            <Icon name="plus" />
        </button>
        <button on:click={rollAll} title="Roll all">
            <Icon name="rollDice" />
        </button>
        <button on:click={() => (settingsVisible = !settingsVisible)} title="Settings">
            <Icon name="settings" />
        </button>
        <button on:click={() => (helpVisible = !helpVisible)} title="Help">
            <Icon name="help" />
        </button>
    </div>
</header>
<aside class="app-settings" class:visible={settingsVisible}>
    <label>
        <input type="checkbox" bind:checked={settings.showHistory} />
        Show history
    </label>
    <label>
        <input type="checkbox" bind:checked={settings.showStats} />
        Show stats
    </label>
    <label>
        <input type="checkbox" bind:checked={settings.showChart} />
        Show charts
    </label>
    <label>
        <input type="checkbox" bind:checked={settings.showTable} />
        Show tables
    </label>
</aside>
<main class="app-content">
    <div class="calculators">
        {#if settings.showAggregate}
            <div class="calculator">
                <header>a</header>
            </div>
        {/if}
        {#if !diceGroups.length}
            <div class="empty-hint">
                <h3>Hey, looks like you haven't configured any dice groups yet!</h3>
                <p>
                    Click the [+] button above or try the following
                    <a href="#d=2d6+3|d12+d4-1">example</a>
                </p>
            </div>
        {/if}
        {#each diceGroups as group, i}
            <Calculator {settings} {rollIndex} removeSelf={() => remove(i)} bind:source={group} />
        {/each}
    </div>
</main>
<aside class="help-overlay" class:visible={helpVisible}>
    <h2>How to write formulas</h2>
    <dl>
        <dt>d[number]</dt>
        <dd>a die of [number] many sides</dd>
        <dt>[count]d[number]</dt>
        <dd>[count] number of dice of [number] many sides</dd>
        <dt>d[number1][+-]d[number2]</dt>
        <dd>a combination of dice</dd>
        <dt>[dice]+[bonus]</dt>
        <dd>add a static number bonus of [bonus] to the [dice] formula</dd>
    </dl>
</aside>
