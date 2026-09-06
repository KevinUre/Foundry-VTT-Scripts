const storedRolls = await game.user.getFlag(
  "world",
  "LastAttack"
);

if (!storedRolls?.length) {
  ui.notifications.error("No previous damage roll found.");
  return;
}

const damageRolls = storedRolls.map(data =>
  new CONFIG.Dice.DamageRoll(
    data.formula,
    {},
    {
      type: data.type,
      properties: data.properties ?? []
    }
  )
);

await Promise.all(damageRolls.map(r => r.evaluate()));

await ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ actor: game.user.character }),
  flavor: "Savage Attacker Reroll",
  rolls: damageRolls
});