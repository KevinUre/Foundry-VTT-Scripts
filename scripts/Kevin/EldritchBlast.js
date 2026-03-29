let toHitBonus = 0;
let damageBonus = 0;
let agonizing = false;
let crit = false;
let cursed = false;

await game.macros.getName("CommonMacroLibrary").execute();
const lib = window.commonLibrary;

let cachedFormFields = await game.user.getFlag('world', 'CachedFormFields');
if (!cachedFormFields) {
  cachedFormFields = {}
}

const cacheToHitFields = async (html) => {
  await game.user.setFlag('world', 'CachedFormFields', {'ToHit.Modifier': html.find('[name="modifier"]').val()});
  await game.user.setFlag('world', 'CachedFormFields', {'ToHit.Cursed': html.find("[name=modCurse")[0].checked});
}

const cacheDamageFields = async (html) => {
  await game.user.setFlag('world', 'CachedFormFields', {'Damage.Modifier': html.find('[name="modifier"]').val()});
  await game.user.setFlag('world', 'CachedFormFields', {'Damage.Hexed': html.find("[name=modHex")[0].checked});
}

const assembleRollString = (base, html) => {
  let rollString = base;
  rollString += lib.parseModifier(html);
  rollString += `+ ${toHitBonus} + ${game.user.character.system.abilities.cha.mod}+ ${game.user.character.system.attributes.prof}`;
  return rollString;
}

const toHitDialog = new Dialog({
  title: "Eldritch Blast: To Hit Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="modifier">Incidental Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" value="${cachedFormFields.ToHit && cachedFormFields.ToHit.Modifier ? cachedFormFields.ToHit.Modifier : ""}" />
            </div>
            <div class="form-group">
              <label for="modCurse">Target is Cursed</label>
              <input name="modCurse" type="checkbox" ${cachedFormFields.ToHit && cachedFormFields.ToHit.Cursed ? "checked" : ""} />
            </div>
            </form>`,
  buttons: {
    dis: {
      label: "Disadvantage",
      callback: async (html) => {
        await cacheToHitFields(html);
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
        await cacheToHitFields(html);
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
        await cacheToHitFields(html);
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
  title: "Eldritch Blast: Damage Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="modifier">Incidental Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" value="${cachedFormFields.Damage && cachedFormFields.Damage.Modifier ? cachedFormFields.Damage.Modifier : ""}" />
            </div>
            <div class="form-group">
              <label for="modHex">Target is Hexed</label>
              <input name="modHex" type="checkbox" ${cachedFormFields.Damage && cachedFormFields.Damage.Hexed ? "checked" : ""} />
            </div>
            </form>`,
  buttons: {
    ok: {
      label: "Roll",
      callback: async (html) => {
        await cacheDamageFields(html);
        let modHex = html.find("[name=modHex")[0].checked;
        let mod = lib.parseModifier(html);
        let damageDice = 1;
        if(crit) {
          damageDice = 2 * damageDice;
          // mod = mod.replace(/\d+(?=d\d)/g, (match) => parseInt(match)*2);
        }        
        let rollString = `${damageDice}d10[Force]+${damageBonus}[Force]${agonizing ? `+${game.user.character.system.abilities.cha.mod}[Force]` : ''}${cursed ? '+2[Force]' : ''}${mod}`;
        if(modHex) {
          // if(crit) {
          //   rollString += `+2d6[Necrotic]`;
          // } else {
            rollString += `+1d6[Necrotic]`;
          // }
        }
        await new CONFIG.Dice.DamageRoll(rollString).toMessage({flavor: "Damage Roll"});
      }
    }
  }
});

toHitDialog.render(true);