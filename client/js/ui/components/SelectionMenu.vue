<template>
  <section>
    <div id="selectionmenu">
      <ul id="optionlist"></ul>
    </div>
  </section>
</template>

<script>
module.exports = new Promise(async (resolve, reject) => {
  const Command = (await import("/js/models/Command.js")).Command;
  const { ClientToServerCommand } = await import("/js/Proto.js");

  resolve({
    name: "SelectionMenu",
    data() {
      return {};
    },
    mounted() {
      let selectionMenuContainer = document.getElementById("selectionmenu");

      selectionMenuContainer.addEventListener(
        "mouseup",
        (e) => {
          e.preventDefault();
          if(e.target.value == undefined) return;
          var c = new Command();
          c.setContent(ClientToServerCommand.SELECTMENUOPTIONBYINDEX, [
            e.target.value,
          ]);
          c.send();
        },
        true
      );
    },
    computed: {},
    methods: {},
    watch: {},
  });
});
</script>

<style scoped>
#selectionmenucontainer {
  display: none;
  z-index: 12;
  position: absolute;
}

#selectionmenu {
  display: none;
  z-index: 10;
  position: absolute;
  background-color: white;
  border: 1px solid black;
}

#optionlist {
  list-style-type: none;
  font-size: 13px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
}

.selectoption {
  position: relative;
  padding-left: 5px;
  height: 100%;
  font-weight: normal;
  display: block;
  padding: 0 2px 1px 2px;
  white-space: pre;
  min-height: 1.2em;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}

.selectoption:hover {
  color: white;
  background-color: rgba(59, 143, 251, 255);
}
</style>
