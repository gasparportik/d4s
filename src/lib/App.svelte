<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import Calculator from "./Calculator.svelte";
  import Icon from "./Icon.svelte";

  import "$lib/globals.css";

  const debounce = (callback: Function, wait = 300) => {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => callback(...args), wait);
    };
  };
  function parseParams(search: URLSearchParams): Record<string, string> {
    const result: Record<string, string> = {};
    Array.from(search.entries()).forEach(([key, value]) => {
      result[key] = value.replace(/ /g, "+");
    });
    return result;
  }
  const updateParams = debounce((d: string) => {
    const usp = new URLSearchParams({ d });
    try {
      replaceState("?" + usp.toString(), {});
    } catch (e) {
      console.error("Failed to update URL", e);
    }
  }, 1000);

  let diceGroups = $state<string[]>([]);
  function parseGroups(params: Record<string, string>) {
    diceGroups = (params.d || "").split("|").filter((g) => !!g);
  }
  $effect(() => parseGroups(parseParams(page.url.searchParams)));
  $effect(() => updateParams(diceGroups.join("|")));

  let settingsVisible = $state(false);
  let helpVisible = $state(false);
  let roller = $state(false);
  let settings = $state({
    showAggregate: false,
    showChart: true,
    showStats: true,
    showHistory: true,
    showTable: true,
  });

  function add() {
    diceGroups = [
      ...diceGroups,
      `d${Math.floor(Math.random() * 8) + 1}+${Math.floor(Math.random() * 10)}`,
    ];
  }
  function remove(index: number) {
    diceGroups = diceGroups.filter((_, i) => i !== index);
  }
  function rollAll() {
    roller = !roller;
  }
</script>

<header class="app-header">
  <h1 class="app-title">
    <img class="logo" src="logo.svg" alt="d4s" />
    <span class="title-long">D&D die distribution statistics</span>
  </h1>
  <div class="actions">
    <button onclick={add} title="Add new calculator">
      <Icon name="plus" />
    </button>
    <button onclick={rollAll} title="Roll all">
      <Icon name="rollDice" />
    </button>
    <button onclick={() => (settingsVisible = !settingsVisible)} title="Settings">
      <Icon name="settings" />
    </button>
    <button onclick={() => (helpVisible = !helpVisible)} title="Help">
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
          <a href="?d=2d6+3|d12+d4-1">example</a>
        </p>
      </div>
    {/if}
    {#each diceGroups as group, i}
      <Calculator {settings} {roller} removeSelf={() => remove(i)} bind:source={diceGroups[i]} />
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

<style>
  .app-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .app-content {
    flex: 1 1 auto;
  }
  .calculators {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    /* justify-items: stretch; */
  }
  aside:not(.visible) {
    display: none;
  }
</style>
