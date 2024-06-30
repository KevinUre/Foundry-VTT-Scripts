const damageDialog = new Dialog({
  title: "Pact Weapon",
  content: `<form class="flexcol">
            <div class="form-group">
              <label for="modShape">Weapon Shape</label>
              <select name="modShape">
                <option value="Greatsword">Greatsword (Slashing)</option>
                <option value="Maul">Maul (Bludgeoning)</option>
                <option value="Glaive">Glaive (Slashing)</option>
                <option value="Pike">Pike (Piercing)</option>
                <option value="Longsword">Longsword (Slashing)</option>
                <option value="Morningstar">Morningstar (Piercing)</option>
                <option value="Flail">Flail (Bludgeoning)</option>
              </select>
            </div>
            </form>`,
  buttons: {
    ok: {
      label: "Set Weapon Type",
      callback: async (html) => {
        let modShape = html.find("[name=modShape")[0].value;
        let pactWeapon = {
          name: 'Short Sword',
          damageNumerator: '1',
          damageDenominator: '6',
          damageType: 'Slashing'
        }
        switch (String(modShape)) {
          case 'Greatsword':
            pactWeapon.name = modShape;
            pactWeapon.damageNumerator = '2';
            pactWeapon.damageDenominator = '6';
            pactWeapon.damageType = 'Slashing';
            break;
          case 'Maul':
            pactWeapon.name = modShape;
            pactWeapon.damageNumerator = '2';
            pactWeapon.damageDenominator = '6';
            pactWeapon.damageType = 'Bludgeoning';
            break;
          case 'Glaive':
            pactWeapon.name = modShape;
            pactWeapon.damageNumerator = '1';
            pactWeapon.damageDenominator = '10';
            pactWeapon.damageType = 'Slashing';
            break;
          case 'Pike':
            pactWeapon.name = modShape;
            pactWeapon.damageNumerator = '1';
            pactWeapon.damageDenominator = '10';
            pactWeapon.damageType = 'Piercing';
            break;
          case 'Longsword':
            pactWeapon.name = modShape;
            pactWeapon.damageNumerator = '1';
            pactWeapon.damageDenominator = '8';
            pactWeapon.damageType = 'Slashing';
            break;
          case 'Morningstar':
            pactWeapon.name = modShape;
            pactWeapon.damageNumerator = '1';
            pactWeapon.damageDenominator = '8';
            pactWeapon.damageType = 'Piercing';
            break;
          case 'Flail':
            pactWeapon.name = modShape;
            pactWeapon.damageNumerator = '1';
            pactWeapon.damageDenominator = '8';
            pactWeapon.damageType = 'Bludgeoning';
            break;
        }
        let currentUser = game.user;
        game.user.setFlag('world', 'PactWeapon', pactWeapon).then(() => {
          ui.notifications.info(`Set Pact Weapon to a ${pactWeapon.name}`);
        }).catch(err => {
          ui.notifications.error(`Failed to set flag for user ${currentUser.name}: ${err}`)
        });
      }
    }
  }
});

damageDialog.render(true);