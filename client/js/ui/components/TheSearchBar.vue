<template>
  <section id="searchbar" class="searchbar" @keyup.esc="hideSearchBar">
    <input @keyup="search" ref="searchInput" v-model="searchBox.textToSearch" placeholder="Find on page..." />
    <div id="matches">{{ searchBox.matches.active }}/{{ searchBox.matches.amount }}</div>
    <div class="buttons">
      <button class="btn-search-up" @click="searchBackwards">
        <img src="/img/jimber/up.svg" />
      </button>
      <button class="btn-search-down" @click="search">
        <img src="/img/jimber/down.svg" />
      </button>
      <button @click="hideSearchBar">
        <img src="/img/jimber/close.svg" with="18px" height="18px" />
      </button>
    </div>
  </section>
</template>

<script>
module.exports = new Promise(async (resolve, reject) => {
  const physicalBrowser = (await import('/js/state/PhysicalBrowser.js')).physicalBrowser;
  const virtualBrowser = (await import('/js/state/VirtualBrowser.js')).virtualBrowser;

  resolve({
    name: 'ContextMenu',
    components: {},
    props: [],
    data() {
      return {
        physicalBrowser: physicalBrowser,
        searchCriteria: '',
        searchBox: virtualBrowser.searchBox,
        previousActiveElement: null,
      };
    },
    created() {
      this.search();
    },
    mounted() {
      this.previousActiveElement = document.activeElement;
      if (this.previousActiveElement) {
        this.previousActiveElement.blur();
      }
      this.$refs.searchInput.focus();
    },
    methods: {
      search() {
        physicalBrowser.pageSearch(this.searchBox.textToSearch, false);
      },
      searchBackwards() {
        physicalBrowser.pageSearch(this.searchBox.textToSearch, true);
      },
      hideSearchBar() {
        physicalBrowser.showSearchBar = false;
        physicalBrowser.pageSearch('', false);
      },
    },
    beforeDestroy() {
      // TODO: but only when focus has not been on another element in between
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
      }

      physicalBrowser.showSearchBar = false;
      physicalBrowser.pageSearch('', false);
    },
  });
});
</script>
<style scoped>
#searchbar {
  position: fixed;

  box-shadow: 0 0 5px 0px #000;
  right: 168px;
  top: 10px;
  z-index: 10;
  border-radius: 3px;
  /* border: 8px solid #73AD21; */

  /* display: none; */
  background: white;
}

#matches {
  color: #6d6d6d;
  width: 40px;
  display: inline-block;
  margin-right: 10px;
  /* background: blue; */
  /* font-size: small; */
}

.buttons {
  color: #6d6d6d;
  /* margin-top: 7px;

   */
  margin: 8px;
  padding-bottom: 4px;
  display: inline-block;
  border-left: 1px solid #6d6d6d;
}

button {
  padding: 4px;
  margin: 5px 5px 0 5px;
  border: none;
  background: none;
  width: 25px;
  height: 25px;

  justify-content: center;
}
button:hover {
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
}

input {
  color: white;
  border: none;
  color: #000;
  font-size: 1rem;

  /* box-sizing: border-box; */
  padding-left: 20px;
  margin-top: -20px;
  /* padding-top: 0px; */
  padding-right: 10px;
  /* padding-bottom: 20px; */

  text-overflow: ellipsis;

  margin-right: 10px;
}
</style>
