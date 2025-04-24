<script lang="ts">
  import * as mdi from "@mdi/js";
  const options = {
    plus: mdi.mdiPlus,
    rollDice: mdi.mdiDiceMultiple,
    rollDie: mdi.mdiDice5,
    edit: mdi.mdiPencil,
    settings: mdi.mdiCog,
    help: mdi.mdiHelp,
    delete: mdi.mdiTrashCan,
    clear: mdi.mdiCancel,
  };
  type Props = {
    name: keyof typeof options;
    size?: string;
    color?: string;
  };
  let { name, size, color = "currentColor" }: Props = $props();

  const path = $derived(options[name] || "");
</script>

<svg class="icon" style:--size={size} viewBox="0 0 24 24">
  <path class="icon-color" fill={color} d={path} />
</svg>

<style>
  .icon {
    width: var(--size, 100%);
    height: var(--size, 100%);
  }
</style>
