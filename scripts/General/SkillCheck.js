const parseModifier = (html) => {
  let modifier = html.find('[name="modifier"]').val();
  let modString = ``;
  if(modifier && modifier !== '' ) { 
    if(modifier[0] === '-') {
      modString = modifier;
    } else if (modifier[0] === '+') {
      modString = modifier;
    } else {
      modString = `+${modifier}`; 
    }
  }
  return modString;
}

const dialog = new Dialog({
  title: "Skill Check",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="modifier">Modifier</label>
              <input type="text" name="modifier" />
            </div>
            </form>`,
  buttons: {
    dis: {
      label: "Disadvantage",
      callback: async (html) => {
        let rollString = `min(1d20,1d20)`;
        rollString += parseModifier(html);
        await new Roll(rollString).toMessage();
      }
    },
    normal: {
      label: "Normal",
      callback: async (html) => {
        let rollString = `1d20`;
        rollString += parseModifier(html);
        await new Roll(rollString).toMessage();
      }
    },
    adv: {
      label: "Advantage",
      callback: async (html) => {
        let rollString = `max(1d20,1d20)`;
        rollString += parseModifier(html);
        await new Roll(rollString).toMessage();
      }
    }
  }
});

dialog.render(true);
