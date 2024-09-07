let crit = false;
let pactWeapon = await game.user.getFlag('world', 'PactWeapon');
let cursed = false;

let toHitBonus = pactWeapon.toHitBonus;
let damageBonus = pactWeapon.damageBonus;

await game.macros.getName("CommonMacroLibrary").execute();
const lib = window.commonLibrary;

let cachedFormFields = await game.user.getFlag('world', 'CachedFormFields');
if (!cachedFormFields) {
  cachedFormFields = {}
}
console.log(JSON.stringify(cachedFormFields))

const cacheToHitFields = async (html) => {
  await game.user.setFlag('world', 'CachedFormFields', {'ToHit.Modifier': html.find('[name="modifier"]').val()});
  await game.user.setFlag('world', 'CachedFormFields', {'ToHit.Cursed': html.find("[name=modCurse")[0].checked});
}

extrasToBeCached = [];
const cacheDamageFields = async (html) => {
  await game.user.setFlag('world', 'CachedFormFields', {'Damage.Modifier': html.find('[name="modifier"]').val()});
  await game.user.setFlag('world', 'CachedFormFields', {'Damage.Hexed': html.find("[name=modHex")[0].checked});
  for (const extra of extrasToBeCached) {
    switch(extra.type) {
      case 'Checkbox':
        const value = {}
        value[`Damage.${extra.name}`] = html.find(`[name=mod${extra.name}`)[0].checked;
        await game.user.setFlag('world', 'CachedFormFields', value);
        break;
    }
  }
}

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

extraDamageMixIn = ``;
pactWeapon.extraDamages.forEach(element => {
  if(typeof element === 'object') {
    let name = Object.keys(element)[0];
    let newMixIn = `<div class="form-group">
                      <label for="mod${name.replaceAll(' ','')}">${name}</label>
                      <input name="mod${name.replaceAll(' ','')}" type="checkbox" ${cachedFormFields.Damage && cachedFormFields.Damage[name.replaceAll(' ','')] ? "checked" : ""} />
                    </div>\n`;
    extraDamageMixIn += newMixIn;
    extrasToBeCached.push({
      name: name.replaceAll(' ',''),
      type: 'Checkbox'
    })
  }
});

console.log(extraDamageMixIn)

const damageDialog = new Dialog({
  title: "Pact Weapon: Damage Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label>Weapon: ${pactWeapon.name}</label>
            </div>
            <div class="form-group">
              <label for="modifier">Incidental Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" value="${cachedFormFields.Damage && cachedFormFields.Damage.Modifier ? cachedFormFields.Damage.Modifier : ""}" />
            </div>
            <div class="form-group">
              <label for="modHex">Target is Hexed</label>
              <input name="modHex" type="checkbox" ${cachedFormFields.Damage && cachedFormFields.Damage.Hexed ? "checked" : ""} />
            </div>
            ${extraDamageMixIn}
            </form>`,
  buttons: {
    ok: {
      label: "Roll",
      callback: async (html) => {
        await cacheDamageFields(html);
        let modHex = html.find("[name=modHex")[0].checked;
        let mod = lib.parseModifier(html);
        let damageDice = pactWeapon.damageNumerator;
        let rollString = `${damageDice}d${pactWeapon.damageDenominator}[${pactWeapon.damageType}]+${damageBonus}+${game.user.character.system.abilities.cha.mod}${mod}`;
        if (cursed) { rollString += `+${game.user.character.system.attributes.prof}`}
        pactWeapon.extraDamages.forEach(element => {
          if(typeof element === 'object') {
            let name = Object.keys(element)[0];
            let mod = html.find(`[name=mod${name.replaceAll(' ','')}`)[0].checked;
            if(mod) { rollString += `+${element[name]}` }
          }
          else {
            rollString += `+${element}`
          }
        });
        rollString = rollString.replace(/Physical/g, (match) => pactWeapon.damageType);
        if(crit) {
          rollString = rollString.replace(/\d+(?=d\d)/g, (match) => parseInt(match)*2);
        }
        if(modHex) {
            rollString += `+1d6[Necrotic]`;
        }
        await new Roll(rollString).toMessage({flavor: "Damage Roll"});
      }
    }
  }
});

toHitDialog.render(true);