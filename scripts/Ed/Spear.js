let toHitBonus = 5;
let damageBonus = 3;
let weaponDamage = '1d8';
let weaponDamageVersatile = '1d10';
let damageType = 'Piercing';

// Darüber hinausgehende Änderungen sind unzulässig

let crit = false;

const rollWrapper = async (rollMsg) => {
  let roll = new Roll(`${rollMsg} + ${toHitBonus}`);
  await roll.evaluate();
  await roll.toMessage({flavor: "Roll to Hit"});
  if(roll.total - toHitBonus == 20) { crit = true; critical(); }
  if(roll.total - toHitBonus == 1) {
    let confirmRoll = new Roll('1d20');
    await confirmRoll.evaluate();
    await confirmRoll.toMessage({flavor: "Crit Fail Confirm Roll"});
    if(confirmRoll.total == 1) {
      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: `Crit Failure confirmed: ${confirmRoll.total}`
      }, {});
    } else {
      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: `Not a crit fail: ${confirmRoll.total}`
      }, {});
    }
  }
};

const toHitDialogNew = new Dialog({
  title: "To Hit Roll",
  buttons: {
    dis: {
      label: "Disadvantage",
      callback: async (html) => {
        await rollWrapper('min(1d20,1d20)');
        inputDialog.render(true);
      }
    },
    normal: {
      label: "Normal",
      callback: async (html) => {
        await rollWrapper('1d20');
        inputDialog.render(true);
      }
    },
    adv: {
      label: "Advantage",
      callback: async (html) => {
        await rollWrapper('max(1d20,1d20)');
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
  title: "Damage Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="modVersatile">Versatile?</label>
              <input name="modVersatile" type="checkbox" />
            </div>
            <div class="form-group">
              <label for="modSmite">Divine Smite?</label>
              <input name="modSmite" type="checkbox" />
            </div>
            <div class="form-group">
              <label for="modSlot">Slot Level for Smite</label>
              <select name="modSlot">
                <option value="2d8">1st Level</option>
                <option value="3d8">2nd Level</option>
                <option value="4d8">3rd Level</option>
                <option value="5d8">4th Level</option>
                <option value="6d8">5th Level</option>
              </select>
            </div>
            <div class="form-group">
              <label for="modUndead">Smite target is Undead?/label>
              <input name="modUndead" type="checkbox" />
            </div>
            </form>`,
  buttons: {
    ok: {
      label: "Roll",
      callback: async (html) => {
        let modShouldSmite = html.find("[name=modSmite")[0].checked;
        let modSmiteLevel = html.find("[name=modSlot")[0].value;
        let modUndead = html.find("[name=modUndead")[0].checked;
        if (html.find("[name=modVersatile")[0].checked) { weaponDamage = weaponDamageVersatile; }
        let diceFromWeapon = /(\d+?)d/.exec(weaponDamage)[1];
        if(crit) {
          weaponDamage = weaponDamage.replace(`${diceFromWeapon}d`,`${2*diceFromWeapon}d`);
        }
        let rollString = `${weaponDamage}[${damageType}]+${damageBonus}`;
        if(modShouldSmite) {
          if(modUndead) {
            let diceFromSmite = /(\d+?)d/.exec(modSmiteLevel)[1];
            modSmiteLevel = modSmiteLevel.replace(`${diceFromSmite}d`,`${diceFromSmite+1}d`);
          }
          if(crit) {
            let diceFromSmite = /(\d+?)d/.exec(modSmiteLevel)[1];
            modSmiteLevel = modSmiteLevel.replace(`${diceFromSmite}d`,`${2*diceFromSmite}d`);
          }
        }
        rollString += `+${modSmiteLevel}[Radiant]`
        await new Roll(rollString).toMessage({flavor: 'Roll for Damage'});
      }
    }
  }
});

toHitDialogNew.render(true);


