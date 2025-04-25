<script lang="ts">
  type Props = {
    rolls: StatisticalRoll[];
    history: Roll[];
  };
  let { rolls, history }: Props = $props();

  const maxChance = $derived(rolls.reduce((a, r) => Math.max(a, r.chance), 0));
  const distribution = $derived(
    history.reduce(
      (a, r) => {
        a[r.value] = (a[r.value] || 0) + 1;
        return a;
      },
      {} as Record<number, number>,
    ),
  );
</script>

<div class="table">
  <table>
    <thead>
      <tr>
        <td>Value</td>
        <td>Rolls</td>
        <td>Actual</td>
        <td>Chance</td>
      </tr>
    </thead>
    <tbody>
      {#each rolls.slice(0, 12) as roll}
        <tr>
          <td>{roll.value}</td>
          <td>{roll.count}</td>
          <td>{distribution[roll.value] ?? 0}</td>
          <td class="chance" style={`--percentage: ${(100 * roll.chance) / maxChance}`}>
            {roll.chance.toFixed(2)}%
          </td>
        </tr>
      {/each}
    </tbody>
    {#if rolls.length > 12}
      <tfoot>
        <tr>
          <td colspan="3" class="more">
            {rolls.length - 12} more values
          </td>
        </tr>
      </tfoot>
    {/if}
  </table>
</div>

<style>
  .table table {
    width: 100%;
  }

  .table table {
    border-spacing: 0;
  }

  .table tbody td {
    border-top: 1px solid #666;
    padding: 0.3em 0.5em;
  }

  .table .chance {
    background: linear-gradient(
      to right,
      hsla(calc(var(--percentage) + 0), 80%, 50%, 0.5) 0%,
      hsla(calc(var(--percentage) + 0), 80%, 50%, 0.5) calc(1% * var(--percentage)),
      rgba(0, 0, 0, 0) calc(1% * var(--percentage) + 1%),
      rgba(0, 0, 0, 0) 100%
    );
  }
</style>
