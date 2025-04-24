<script>
    import * as mdi from '@mdi/js';

    export let name;
    export let size = 'auto';
    export let color = '#000';

    $: path =
        {
            plus: mdi.mdiPlus,
            rollDice: mdi.mdiDiceMultiple,
            rollDie: mdi.mdiDice5,
            settings: mdi.mdiSettings,
            help: mdi.mdiHelp,
            delete: mdi.mdiTrashCan,
            clear: mdi.mdiCancel,
        }[name] || '';
</script>

<style>
    .icon {
        width: 100%;
        height: 100%;
    }
</style>

<svg
    class="icon"
    style={size !== 'auto' ? `width: ${size}; height: ${size};` : ''}
    viewBox="0 0 24 24">
    <path class="icon-color" fill={color} d={path} />
</svg>
