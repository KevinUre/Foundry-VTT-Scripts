let toHitBonus = 1;
let damageBonus = 1;

let crit = false;
let pactWeapon = await game.user.getFlag('world', 'PactWeapon');
let cursed = false;

await game.macros.getName("CommonMacroLibrary").execute();
const lib = window.commonLibrary;

const assembleRollString = (base, html) => {
  let rollString = base;
  rollString += lib.parseModifier(html);
  rollString += `+ ${toHitBonus} + ${game.user.character.system.abilities.cha.mod}+ ${game.user.character.system.attributes.prof}`;
  return rollString;
}

const toHitDialog = new Dialog({
  title: "Pact Weapon: To Hit Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label>Weapon: ${pactWeapon.name}</label>
            </div>
            <div class="form-group">
              <label for="modifier">Incidental Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" />
            </div>
            <div class="form-group">
              <label for="modCurse">Target is Cursed</label>
              <input name="modCurse" type="checkbox" />
            </div>
            </form>`,
  buttons: {
    dis: {
      label: "Disadvantage",
      callback: async (html) => {
        cursed = html.find("[name=modCurse")[0].checked;
        crit = await lib.rollWrapper(
          assembleRollString('min(1d20,1d20)', html),
          (roll) => lib.extractRollValue(roll) == 19 && cursed
        );
        inputDialog.render(true);
      }
    },
    normal: {
      label: "Normal",
      callback: async (html) => {
        cursed = html.find("[name=modCurse")[0].checked;
        crit = await lib.rollWrapper(
          assembleRollString('1d20', html),
          (roll) => lib.extractRollValue(roll) == 19 && cursed
        );
        inputDialog.render(true);
      }
    },
    adv: {
      label: "Advantage",
      callback: async (html) => {
        cursed = html.find("[name=modCurse")[0].checked;
        crit = await lib.rollWrapper(
          assembleRollString('max(1d20,1d20)', html),
          (roll) => lib.extractRollValue(roll) == 19 && cursed
        );
        inputDialog.render(true);
      }
    }
  }
});

const inputDialog = new Dialog({
  title: "Did you hit?",
  buttons: {
    miss: {
      label: "Miss",
      callback: async (html) => {
      }
    },
    hit: {
      label: "Hit",
      callback: async (html) => {
        damageDialog.render(true);
      }
    }
  }
});

const damageDialog = new Dialog({
  title: "Pact Weapon: Damage Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label>Weapon: ${pactWeapon.name}</label>
            </div>
            <div class="form-group">
              <label for="modifier">Incidental Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" />
            </div>
            <div class="form-group">
              <label for="modHex">Target is Hexed</label>
              <input name="modHex" type="checkbox" />
            </div>
            </form>`,
  buttons: {
    ok: {
      label: "Roll",
      callback: async (html) => {
        let modHex = html.find("[name=modHex")[0].checked;
        let mod = lib.parseModifier(html);
        let damageDice = pactWeapon.damageNumerator;
        if(crit) {
          damageDice = 2 * damageDice;
          // mod = mod.replace(/\d+(?=d\d)/g, (match) => parseInt(match)*2);
        }
        let rollString = `${damageDice}d${pactWeapon.damageDenominator}[${pactWeapon.damageType}]+${damageBonus}+${game.user.character.system.abilities.cha.mod}${cursed ? '+2' : ''}${mod}`;
        if(modHex) {
          // if(crit) {
          //   rollString += `+2d6[Necrotic]`;
          // } else {
            rollString += `+1d6[Necrotic]`;
          // }
        }
        await new Roll(rollString).toMessage({flavor: "Damage Roll"});
      }
    }
  }
});

toHitDialog.render(true);