let weaponDamage = '1d6';
let damageType = 'Piercing';

// Darüber hinausgehende Änderungen sind unzulässig

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
}

const assembleRollString = (base, html) => {
  let rollString = base;
  rollString += lib.parseModifier(html);
  rollString += ` + ${game.user.character.system.abilities.str.mod} + ${game.user.character.system.attributes.prof}`;
  return rollString;
}

const toHitDialog = new Dialog({
  title: "Spear: To Hit Roll",
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

console.log(JSON.stringify(game.user.character.system.spells));

smiteMixIn = ``;
// let smiteInit = false;
let smiteCapable = false;
[1,2,3,4,5].forEach((slotLevel) => {
  if(game.user.character.system.spells[`spell${slotLevel}`].value > 0) {
    // if(!smiteInit) {
    //   smiteInit = true;
    //   smiteMixIn += `<div class="form-group">
    //                   <label for="modSmite">Divine Smite?</label>
    //                   <input name="modSmite" type="checkbox" />
    //                 </div>
    //                 <div class="form-group">
    //                   <label for="modSlot">Slot Level for Smite</label>
    //                   <select name="modSlot">\n`;
    // }
    smiteCapable = true;
    smiteMixIn += `<option value="${slotLevel}">${slotLevel}${((n)=>{return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"})(slotLevel)} Level</option>\n`;
  } else if(game.user.character.system.spells[`spell${slotLevel}`].max > 0) {
    smiteMixIn += `<option value="${slotLevel}" disabled>${slotLevel}${((n)=>{return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"})(slotLevel)} Level</option>\n`;
  }
});
// if(smiteInit) {
//   smiteMixIn += `</select>
//                 </div>
//                 <div class="form-group">
//                   <label for="modUndead">Smite target is Undead?</label>
//                   <input name="modUndead" type="checkbox" />
//                 </div>\n`;
// }

const damageDialog = new Dialog({
  title: "Spear: Damage Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="modifier">Incidental Modifier</label>
              <input type="text" name="modifier" placeholder="-2, +3, +1d4" value="${cachedFormFields.Damage && cachedFormFields.Damage.Modifier ? cachedFormFields.Damage.Modifier : ""}" />
            </div>
            <div class="form-group">
              <label for="modSmite">Divine Smite?</label>
              <input name="modSmite" type="checkbox" ${smiteCapable ? "" : "disabled"} />
            </div>
            <div class="form-group">
              <label for="modSlot">Slot Level for Smite</label>
              <select name="modSlot">
                ${smiteMixIn}
              </select>
            </div>
            <div class="form-group">
              <label for="modUndead">Smite target is Undead?</label>
              <input name="modUndead" type="checkbox" ${smiteCapable ? "" : "disabled"} />
            </div>
            </form>`,
  buttons: {
    ok: {
      label: "Roll",
      callback: async (html) => {
        await cacheDamageFields(html);
        let modShouldSmite = html.find("[name=modSmite")[0].checked;
        let modSmiteLevel = html.find("[name=modSlot")[0].value;
        let modUndead = html.find("[name=modUndead")[0].checked;
        let mod = lib.parseModifier(html);
        let diceFromWeapon = /(\d+?)d/.exec(weaponDamage)[1];
        if(crit) {
          weaponDamage = weaponDamage.replace(`${diceFromWeapon}d`,`${2*diceFromWeapon}d`);
        }  
        let rollString = `${weaponDamage}[${damageType}]+${game.user.character.system.abilities.str.mod}[${damageType}]${mod}`;
        if(modShouldSmite) {
          let smiteDice = `${parseInt(modSmiteLevel)+1}d8`
          if(modUndead) {
            let diceFromSmite = parseInt(/(\d+?)d/.exec(smiteDice)[1]);
            smiteDice = smiteDice.replace(`${diceFromSmite}d`,`${diceFromSmite+1}d`);
          }
          rollString += `+${smiteDice}[Radiant]`;
          game.user.character.update({[`system.spells.spell${modSmiteLevel}.value`]: game.user.character.system.spells[`spell${modSmiteLevel}`].value-1});
        }
        await new CONFIG.Dice.DamageRoll(rollString).toMessage({flavor: "Damage Roll"});
      }
    }
  }
});

toHitDialog.render(true);