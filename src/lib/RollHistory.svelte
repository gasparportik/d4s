<script lang="ts">
  import { saveRollHistory } from "./functions";
  import { formatAge } from "./functions/formatting";

  type Props = {
    history: Roll[];
    diceString: string;
  };
  let { history, diceString }: Props = $props();
  let t = $state(timeTick());
  function timeTick() {
    return Math.round(new Date().getTime() / 1000);
  }
  function tickTock() {
    t = timeTick();
    setTimeout(tickTock, 1000);
  }
  tickTock();
  $effect(() => {
    if (history.length > 0) {
      saveRollHistory(diceString, history);
    }
  });
</script>

<ul class="roll-history">
  {#each history.slice(0, 50) as item}
    <li>
      {item.value}
      {#if item.time}({formatAge(t - item.time / 1000)}){/if}
    </li>
  {/each}
</ul>

<style>
  .roll-history {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 5em;
    overflow: auto;
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
</style>
