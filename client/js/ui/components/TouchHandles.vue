<template>
  <section class="touchhandles">
    <div style="position: absolute; display: none; pointer-events: none; z-index: 3" id="touchhandle0">
      <img src="" />
    </div>
    <div style="position: absolute; display: none; pointer-events: none; z-index: 3" id="touchhandle1">
      <img src="" />
    </div>
    <div style="position: absolute; display: none; pointer-events: none; z-index: 3" id="touchhandle2">
      <img src="" />
    </div>
  </section>
</template>
<script>
module.exports = new Promise(async (resolve, reject) => {
  resolve({
    name: 'TouchHandles',
    components: {},
    props: [],
    data() {
      return {};
    },
    computed: {},
    mounted() {},
    methods: {},
    watch: {},
  });
});
</script>
<style></style>
