<script lang="ts">
  // this component is heavily inspired by the svelte examples:
  // https://svelte.dev/examples#area-chart
  // https://svelte.dev/examples#bar-chart
  import { scaleLinear, sparsify, transformHistory } from "$lib/functions";
  type Props = {
    rolls: StatisticalRoll[];
    history: Roll[];
    barWidth?: number;
  };
  let { rolls, history, barWidth = 6 }: Props = $props();

  const padding = { top: 20, right: 15, bottom: 20, left: 25 };

  let width = $state(500);
  let height = $state(200);

  const points = $derived(rolls.map((roll) => ({ x: roll.value, y: roll.chance })));
  const bars = $derived(transformHistory(history));

  const minX = $derived(points[0].x);
  const maxX = $derived(points[points.length - 1].x);
  const xScale = $derived(scaleLinear([minX, maxX], [padding.left, width - padding.right]));

  const maxY = $derived(Math.max(...points.map((p) => p.y)));
  const yScale = $derived(scaleLinear([0, maxY], [height - padding.bottom, padding.top]));

  const xTicks = $derived(
    sparsify(
      points.map((p) => p.x),
      20,
    ),
  );
  const yTicks = $derived([0, maxY]);

  const path = $derived(`M${points.map((p) => `${xScale(p.x)},${yScale(p.y)}`).join("L")}`);
  const area = $derived(`${path}L${xScale(maxX)},${yScale(0)}L${xScale(minX)},${yScale(0)}Z`);
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <!-- y axis -->
    <g class="axis y-axis" transform="translate(0, {padding.top})">
      {#each yTicks as tick}
        <g class="tick" transform="translate(0, {yScale(tick) - padding.bottom})">
          <line x2="100%" />
          <text y="-4">{tick.toFixed(2)}</text>
        </g>
      {/each}
    </g>

    <!-- x axis -->
    <g class="axis x-axis">
      {#each xTicks as tick}
        <g class="tick" transform="translate({xScale(tick)},{height})">
          <line y1="-{height}" y2="-{padding.bottom}" x1="0" x2="0" />
          <text y="-4">{tick}</text>
        </g>
      {/each}
    </g>

    <!-- data -->
    <path class="path-area" d={area} />
    <path class="path-line" d={path} />
    <g class="bars">
      {#each bars as bar, i}
        <rect
          x={xScale(bar.x) - barWidth / 2}
          y={yScale(bar.y)}
          width={barWidth}
          height={height - padding.bottom - yScale(bar.y)}
        />
      {/each}
    </g>
  </svg>
</div>

<style>
  .chart {
    --line-color: var(--color-bg-2);
    --bar-color: var(--color-bg-2);
    width: 100%;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  svg {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
  }

  .tick {
    font-size: 0.725em;
    font-weight: 200;
  }

  .tick line {
    stroke: var(--axis-color, #aaa);
    stroke-dasharray: 2;
  }

  .tick text {
    fill: var(--text-color, #666);
    text-anchor: start;
  }

  .tick.tick:first-child line {
    stroke-dasharray: 0;
  }

  .x-axis .tick text {
    text-anchor: middle;
  }

  .path-line {
    fill: none;
    stroke: var(--line-color, rgb(0, 0, 0));
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 2;
  }

  .path-area {
    fill: var(--line-color, rgb(0, 0, 0));
    opacity: 0.2;
  }

  .bars > rect {
    fill: var(--bar-color, rgb(50, 50, 50));
    opacity: 0.8;
  }
</style>
