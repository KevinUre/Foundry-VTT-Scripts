await game.macros.getName("CommonMacroLibrary").execute();
const lib = window.commonLibrary;

let rollString = await game.user.getFlag('world', 'LastAttack');
if(!rollString) {
    ui.notifications.error(`Failed to get flag for Savage Attack: ${err}`)
} else {
    await new CONFIG.Dice.DamageRoll(rollString).toMessage({flavor: "Savager Attacker Reroll"});
}
