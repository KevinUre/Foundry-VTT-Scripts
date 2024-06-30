let toHitBonus = 6;
let damageBonus = 4;

let crit = false;
let pactWeapon = await game.user.getFlag('world', 'PactWeapon');
let cursed = false;

const critical = () => {
  ChatMessage.create({
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: `
      <img width="100%" height="100%" src="https://i.makeagif.com/media/11-06-2015/XblDPx.gif" />
    `,
  });
}

const rollWrapper = async (rollMsg) => {
  let roll = new Roll(`${rollMsg} + ${toHitBonus}`);
  await roll.evaluate();
  await roll.toMessage({flavor: "Roll to Hit"});
  if(roll.total - toHitBonus == 20) { crit = true; critical(); }
  if(roll.total - toHitBonus == 19 && cursed) { crit = true; critical(); }
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

const toHitDialog = new Dialog({
  title: "Pact Weapon: To Hit Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label>Weapon: ${pactWeapon.name}</label>
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
        await rollWrapper('min(1d20,1d20)');
        inputDialog.render(true);
      }
    },
    normal: {
      label: "Normal",
      callback: async (html) => {
        cursed = html.find("[name=modCurse")[0].checked;
        await rollWrapper('1d20');
        inputDialog.render(true);
      }
    },
    adv: {
      label: "Advantage",
      callback: async (html) => {
        cursed = html.find("[name=modCurse")[0].checked;
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
  title: "Pact Weapon: Damage Roll",
  content: `<form class="flexcol">
            <div class="form-group">
              <label>Weapon: ${pactWeapon.name}</label>
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
        let damageDice = pactWeapon.damageNumerator;
        if(crit) {
          damageDice = 2 * damageDice;
        }        
        let rollString = `${damageDice}d${pactWeapon.damageDenominator}[${pactWeapon.damageType}]+${damageBonus}${cursed ? '+2' : ''}`;
        if(modHex) {
          if(crit) {
            rollString += `+2d6[Necrotic]`;
          } else {
            rollString += `+1d6[Necrotic]`;
          }
        }
        await new Roll(rollString).toMessage({flavor: "Damage Roll"});
      }
    }
  }
});

toHitDialog.render(true);