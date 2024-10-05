let profBonus = 2;
let crit = false;

await game.macros.getName("CommonMacroLibrary").execute();
const lib = window.commonLibrary;

let cachedFormFields = await game.user.getFlag('world', 'CachedFormFields');
if (!cachedFormFields) {
  cachedFormFields = {}
}

const cacheToHitFields = async (html) => {
  await game.user.setFlag('world', 'CachedFormFields', {'ToHit.Modifier': html.find('[name="modifier"]').val()});
}

const cacheDamageFields = async (html) => {
  await game.user.setFlag('world', 'CachedFormFields', {'Damage.Modifier': html.find('[name="modifier"]').val()});
  await game.user.setFlag('world', 'CachedFormFields', {'Damage.Martial': html.find('[name="martial"]').val()});
}

const assembleRollString = (base, html) => {
  let rollString = base;
  rollString += lib.parseModifier(html);
  rollString += ` + ${game.user.character.system.abilities.dex.mod} + ${profBonus}`;
  console.log(rollString);
  return rollString;
}

const toHitDialog = new Dialog({
  title: "Monk Weapon: To Hit Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="modifier">Incidental Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" value="${cachedFormFields.ToHit && cachedFormFields.ToHit.Modifier ? cachedFormFields.ToHit.Modifier : ""}" />
            </div>
            </form>`,
  buttons: {
    dis: {
      label: "Disadvantage",
      callback: async (html) => {
        await cacheToHitFields(html);
        crit = await lib.rollWrapper(
          assembleRollString('min(1d20,1d20)', html)
        );
        inputDialog.render(true);
      }
    },
    normal: {
      label: "Normal",
      callback: async (html) => {
        await cacheToHitFields(html);
        crit = await lib.rollWrapper(
          assembleRollString('1d20', html)
        );
        inputDialog.render(true);
      }
    },
    adv: {
      label: "Advantage",
      callback: async (html) => {
        await cacheToHitFields(html);
        crit = await lib.rollWrapper(
          assembleRollString('max(1d20,1d20)', html)
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
  title: "Monk Weapon: Damage Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="martial">Martial Dice Size</label>
              <input type="text" name="martial" placeholder="4, 6, 8" value="${cachedFormFields.Damage && cachedFormFields.Damage.Martial ? cachedFormFields.Damage.Martial : "6"}" />
            </div>
            <div class="form-group">
              <label for="modifier">Incidental Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" value="${cachedFormFields.Damage && cachedFormFields.Damage.Modifier ? cachedFormFields.Damage.Modifier : ""}" />
            </div>
            </form>`,
  buttons: {
    ok: {
      label: "Roll",
      callback: async (html) => {
        await cacheDamageFields(html);
        let mod = lib.parseModifier(html);
        let martial = html.find('[name="martial"]').val();
        let damageDice = 1;
        if(crit) {
          damageDice = 2 * damageDice;
        }        
        let rollString = `${damageDice}d${martial}[Bludgeoning]+${game.user.character.system.abilities.dex.mod}${mod}`;
        await new Roll(rollString).toMessage({flavor: "Damage Roll"});
      }
    }
  }
});

toHitDialog.render(true);