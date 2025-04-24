<script lang="ts">
  import {
    evaluateRolls,
    formatAge,
    formatNumberMetric,
    loadRollHistory,
    parseCombinationString,
    randomRoll,
    saveRollHistory,
  } from "$lib/functions";
  import Chart from "./Chart.svelte";
  import Icon from "./Icon.svelte";
  let {
    source = $bindable("2d6+2"),
    removeSelf = () => {},
    settings = {
      showAggregate: false,
      showChart: false,
      showStats: false,
      showHistory: false,
      showTable: false,
    },
    ...props
  } = $props();

  // basic stuff
  function serializeCombination(ds: string, n: string) {
    source = ds + (n ? ":" + n : "");
  }

  let [diceString, name = ""] = $derived(source.split(":"));
  const dice: DiceConfig = $derived(parseCombinationString(diceString));
  $effect(() => serializeCombination(diceString, name));

  // naming
  let renaming = $state(false);
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
  let { rollIndex = 0 } = props;
  let latestRollCollapsed = $state(false);
  let rollHistoryCollapsed = $state(false);
  let latestRoll = $state<Roll | null>(null);
  let rollHistory = $derived(loadRollHistory(diceString));
  let t = $state(timeTick());
  $effect(() => (rollIndex > 0 ? newRoll() : void 0));
  // $: if (rollHistory.length > 0) {
  //     saveRollHistory(diceString, rollHistory);
  // }
  const realTotal = $derived(rollHistory.reduce((a, r) => a + r.value, 0));
  const realAverage = $derived(realTotal / rollHistory.length);
  function timeTick() {
    return Math.round(new Date().getTime() / 1000);
  }
  function tickTock() {
    t = timeTick();
    setTimeout(tickTock, 1000);
  }
  tickTock();
  function newRoll(e?: MouseEvent) {
    let rollCount = 1;
    if (e && e.altKey) {
      const answer = prompt("How many rolls would you like?");
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
  let statsCollapsed = $state(false);
  let chartCollapsed = $state(false);
  let tableCollapsed = $state(false);
  const stats = $derived(evaluateRolls(dice));
  const rolls = $derived(stats.rolls);
  const maxChance = $derived(rolls.reduce((a, r) => Math.max(a, r.chance), 0));

  // settings
  const showStats = $derived(settings?.showStats);
  const showHistory = $derived(settings?.showHistory);
  const showChart = $derived(settings?.showChart);
  const showTable = $derived(settings?.showTable);
</script>

<article class="calculator">
  <header class="header" class:renaming>
    <div class="section-head">
      <input
        class="rename-field"
        bind:this={renameInput}
        onblur={() => (renaming = false)}
        onkeyup={renameKeyup}
        bind:value={name}
      />
      <span class="name-field">{name || "Die formula"}</span>
      <button onclick={rename} title="Rename this calculator">
        <Icon name="edit" size="16px" />
      </button>
      <button onclick={() => removeSelf()} title="Delete this calculator">
        <Icon name="delete" size="16px" />
      </button>
    </div>
    <input
      class="die-formula"
      type="text"
      bind:value={diceString}
      spellcheck="false"
      autocomplete="off"
    />
  </header>

  <details class="roll" open={!latestRollCollapsed}>
    <summary class="section-head">
      Latest roll
      <button onclick={newRoll} title="New roll">
        <Icon name="rollDie" size="16px" />
      </button>
    </summary>
    {#if latestRoll !== null}
      <h4>{latestRoll.value}</h4>
      <small>({latestRoll.dieValues?.join(" + ")} + {dice.bonus})</small>
    {/if}
  </details>

  {#if showHistory}
    <details class="roll-history" open={!rollHistoryCollapsed}>
      <summary class="section-head">
        Roll history({rollHistory.length})
        <button onclick={clearHistory} title="Clear">
          <Icon name="clear" size="16px" />
        </button>
      </summary>
      <ul>
        {#each rollHistory.slice(0, 50) as item}
          <li>
            {item.value}
            {#if item.time}({formatAge(t - item.time)}){/if}
          </li>
        {/each}
      </ul>
    </details>
  {/if}

  {#if showStats}
    <details class="stats" open={!statsCollapsed}>
      <summary class="section-head"> Stats </summary>
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
    </details>
  {/if}

  {#if showChart && rolls.length > 1}
    <details class="chart" open={!chartCollapsed}>
      <summary class="section-head"> Chart </summary>
      <Chart rolls={stats.rolls} history={rollHistory} />
    </details>
  {/if}

  {#if showTable}
    <details class="table" open={!tableCollapsed}>
      <summary class="section-head"> Detailed roll chances </summary>
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
              <td class="chance" style={`--percentage: ${(100 * roll.chance) / maxChance}`}>
                {roll.chance.toFixed(2)}%
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </details>
  {/if}
</article>

<style>
  .calculator {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 0.3rem;
    padding: 0.5rem;
    background: var(--color-panel);
  }

  .calculator .header input {
    border: 1px solid #555;
    border-radius: 0.1em;
    padding: 0.5em;
  }

  .calculator .header .die-formula {
    font-size: 1.5rem;
  }

  .calculator details {
    padding: 0.2em;
  }
  .calculator summary {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
  }

  .calculator .section-head {
    margin-bottom: 0.3em;
    font-weight: bold;
    align-items: center;
  }

  .calculator .section-head button {
    background: transparent;
    border: none;
    padding: 0;
    line-height: 1;
  }

  .calculator .section-head button:hover {
    background: #aaa6;
  }

  .calculator details:not([open]) .section-head {
    text-decoration: line-through;
  }

  .calculator .stats dl {
    margin: 0;
    padding: 1em 0;
    display: grid;
    grid-template-columns: 1fr 1fr;

    /* @media screen and (max-width: $bpu-s) {
            grid-template-columns: 1fr;
        }

        @media screen and (min-width: $bpl-xl) {
            grid-template-columns: 1fr 1fr 1fr 1fr;
        } */
  }
  .calculator .stats dl div {
    padding: 0 0.5em;
  }

  .calculator .stats dl dt {
    float: left;
  }

  .calculator .stats dl dd {
    margin-left: 0;
    float: right;
    text-align: right;
  }

  .calculator .roll h4 {
    font-size: 2rem;
    margin: 0;
  }

  .calculator .roll-history ul {
    max-height: 5em;
    overflow: auto;
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .calculator .chart {
    --line-color: var(--color-bg-2);
    --bar-color: var(--color-bg-2);
  }

  .calculator .table table {
    border-spacing: 0;
  }

  .calculator .table tbody td {
    border-top: 1px solid #666;
    padding: 0.3em 0.5em;
  }

  .calculator .table .chance {
    background: linear-gradient(
      to right,
      hsla(calc(var(--percentage) + 0), 80%, 50%, 0.5) 0%,
      hsla(calc(var(--percentage) + 0), 80%, 50%, 0.5) calc(1% * var(--percentage)),
      rgba(0, 0, 0, 0) calc(1% * var(--percentage) + 1%),
      rgba(0, 0, 0, 0) 100%
    );
  }

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
