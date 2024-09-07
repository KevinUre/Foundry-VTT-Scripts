await game.macros.getName("CommonMacroLibrary").execute();
const lib = window.commonLibrary;

const dialog = new Dialog({
  title: "Skill Check",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="modifier">Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" />
            </div>
            </form>`,
  buttons: {
    dis: {
      label: "Disadvantage",
      callback: async (html) => {
        let rollString = `min(1d20,1d20)`;
        rollString += lib.parseModifier(html);
        await new Roll(rollString).toMessage();
      }
    },
    normal: {
      label: "Normal",
      callback: async (html) => {
        let rollString = `1d20`;
        rollString += lib.parseModifier(html);
        await new Roll(rollString).toMessage();
      }
    },
    adv: {
      label: "Advantage",
      callback: async (html) => {
        let rollString = `max(1d20,1d20)`;
        rollString += lib.parseModifier(html);
        await new Roll(rollString).toMessage();
      }
    }
  }
});

dialog.render(true);
