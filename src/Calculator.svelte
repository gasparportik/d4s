<script lang="ts">
    import {
        loadRollHistory,
        saveRollHistory,
        parseCombinationString,
        evaluateRolls,
        randomRoll,
        formatAge,
        formatNumberMetric,
    } from './functions';
    import Chart from './Chart.svelte';
    import Icon from './Icon.svelte';

    // basic stuff
    export let removeSelf = () => {};
    export let source = '2d6+2';
    let diceString: string;
    let name: string | undefined;
    let dice: DiceConfig;
    function serializeCombination(ds: string, n: string) {
        source = ds + (n ? ':' + n : '');
    }

    $: [diceString, name = ''] = source.split(':');
    $: dice = parseCombinationString(diceString);
    $: serializeCombination(diceString, name);

    // naming
    let renaming = false;
    let renameInput: HTMLInputElement;
    function rename() {
        renaming = true;
        setTimeout(() => {
            renameInput.focus();
            renameInput.select();
        }, 10);
    }
    function renameKeyup(e: KeyboardEvent) {
        if (e.keyCode === 13) {
            renaming = false;
        }
    }

    // rolls and history
    export let rollIndex = 0;
    let latestRollCollapsed = false;
    let rollHistoryCollapsed = false;
    let latestRoll = null;
    let rollHistory = loadRollHistory(diceString);
    let realAverage: number;
    let realTotal: number;
    let t = timeTick();
    $: if (diceString) {
        rollHistory = loadRollHistory(diceString);
    }
    $: if (rollIndex > 0) {
        newRoll();
    }
    $: if (rollHistory.length > 0) {
        saveRollHistory(diceString, rollHistory);
    }
    $: realTotal = rollHistory.reduce((a, r) => a + r.value, 0);
    $: realAverage = realTotal / rollHistory.length;
    function timeTick() {
        return Math.round(new Date().getTime() / 1000);
    }
    function tickTock() {
        t = timeTick();
        window.setTimeout(tickTock, 1000);
    }
    tickTock();
    function newRoll(e?: MouseEvent) {
        let rollCount = 1;
        if (e && e.altKey) {
            const answer = prompt('How many rolls would you like?');
            rollCount = answer ? +answer : 0;
        } else if (e && e.shiftKey) {
            rollCount = 100;
        } else if (e && e.ctrlKey) {
            rollCount = 1000;
        }
        if (rollCount > 1) {
            const allRolls = [];
            for (let i = 1; i < rollCount; ++i) {
                allRolls.push(randomRoll(dice, true));
            }
            latestRoll = randomRoll(dice);
            rollHistory = [latestRoll, ...allRolls.reverse(), ...rollHistory];
            return;
        }
        latestRoll = randomRoll(dice);
        latestRoll.time = timeTick();
        rollHistory = [latestRoll, ...rollHistory];
    }
    function clearHistory() {
        rollHistory = [];
        saveRollHistory(diceString, null);
    }

    // evaluation
    let statsCollapsed = false;
    let chartCollapsed = false;
    let tableCollapsed = false;
    let stats: ReturnType<typeof evaluateRolls>;
    let rolls: StatisticalRoll[];
    let maxChance: number;
    $: stats = evaluateRolls(dice);
    $: rolls = stats.rolls;
    $: maxChance = rolls.reduce((a, r) => Math.max(a, r.chance), 0);

    // settings
    export let settings: any;
    let showStats: boolean;
    let showHistory: boolean;
    let showChart: boolean;
    let showTable: boolean;
    $: showStats = settings && settings.showStats;
    $: showHistory = settings && settings.showHistory;
    $: showChart = settings && settings.showChart;
    $: showTable = settings && settings.showTable;
</script>

<style>
    header.renaming .name-field,
    header:not(.renaming) .rename-field {
        display: none;
    }
    header .die-formula {
        display: block;
        width: 100%;
        box-sizing: border-box;
        min-width: 0;
    }

    .section-head {
        display: flex;
        flex-direction: row;
    }
    .section-head > span {
        cursor: pointer;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
    }
    .section-head > span,
    .section-head > input {
        flex: 1 1 auto;
    }
    .section-head button {
        flex: 0 0 auto;
    }

    .table table {
        width: 100%;
    }
</style>

<article class="calculator">
    <header class="header" class:renaming>
        <div class="section-head">
            <input
                class="rename-field"
                bind:this={renameInput}
                on:blur={() => (renaming = false)}
                on:keyup={renameKeyup}
                bind:value={name} />
            <span class="name-field" on:dblclick={rename}>{name || 'Die formula'}</span>
            <button on:click={removeSelf} title="Delete this calculator">
                <Icon name="delete" size="16px" />
            </button>
        </div>
        <input
            class="die-formula"
            type="text"
            bind:value={diceString}
            spellcheck="false"
            autocomplete="false" />
    </header>

    <section class="roll" class:collapsed={latestRollCollapsed}>
        <div class="section-head">
            <span on:click={() => (latestRollCollapsed = !latestRollCollapsed)}>Latest roll</span>
            <button on:click={newRoll} title="New roll">
                <Icon name="rollDie" size="16px" />
            </button>
        </div>
        {#if !latestRollCollapsed && latestRoll !== null}
            <h4>{latestRoll.value}</h4>
            <small>({latestRoll.dieValues.join(' + ')} + {dice.bonus})</small>
        {/if}
    </section>

    {#if showHistory}
        <section class="roll-history" class:collapsed={rollHistoryCollapsed}>
            <div class="section-head">
                <span on:click={() => (rollHistoryCollapsed = !rollHistoryCollapsed)}>
                    Roll history({rollHistory.length})
                </span>
                <button on:click={clearHistory} title="Clear">
                    <Icon name="clear" size="16px" />
                </button>
            </div>
            {#if !rollHistoryCollapsed}
                <ul>
                    {#each rollHistory.slice(0, 50) as item}
                        <li>
                            {item.value}
                            {#if item.time}({formatAge(t - item.time)}){/if}
                        </li>
                    {/each}
                </ul>
            {/if}
        </section>
    {/if}

    {#if showStats}
        <section class="stats" class:collapsed={statsCollapsed}>
            <div class="section-head">
                <span on:click={() => (statsCollapsed = !statsCollapsed)}>Stats</span>
            </div>
            {#if !statsCollapsed}
                <dl>
                    <div>
                        <dt>min</dt>
                        <dd>{stats.min}</dd>
                    </div>
                    <div>
                        <dt>max</dt>
                        <dd>{stats.max}</dd>
                    </div>
                    <div>
                        <dt>avg</dt>
                        <dd>{stats.average.toFixed(2)}</dd>
                    </div>
                    <div>
                        <dt>all</dt>
                        <dd>{formatNumberMetric(stats.total)}</dd>
                    </div>
                    {#if rollHistory && rollHistory.length > 0}
                        <div>
                            <dt>ravg</dt>
                            <dd>{realAverage.toFixed(2)}</dd>
                        </div>
                        <div>
                            <dt>tot</dt>
                            <dd>{realTotal}</dd>
                        </div>
                    {/if}
                </dl>
            {/if}
        </section>
    {/if}

    {#if showChart && rolls.length > 1}
        <section class="chart" class:collapsed={chartCollapsed}>
            <div class="section-head">
                <span on:click={() => (chartCollapsed = !chartCollapsed)}>Chart</span>
            </div>
            {#if !chartCollapsed}
                <Chart rolls={stats.rolls} history={rollHistory} />
            {/if}
        </section>
    {/if}

    {#if showTable}
        <section class="table" class:collapsed={tableCollapsed}>
            <div class="section-head">
                <span on:click={() => (tableCollapsed = !tableCollapsed)}>
                    Detailed roll chances
                </span>
            </div>
            {#if !tableCollapsed}
                <table>
                    <thead>
                        <tr>
                            <td>Value</td>
                            <td>Rolls</td>
                            <td>Chance</td>
                        </tr>
                    </thead>
                    <tbody>
                        {#each rolls as roll}
                            <tr>
                                <td>{roll.value}</td>
                                <td>{roll.count}</td>
                                <td
                                    class="chance"
                                    style={`--percentage: ${(100 * roll.chance) / maxChance}`}>
                                    {roll.chance.toFixed(2)}%
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </section>
    {/if}
</article>
