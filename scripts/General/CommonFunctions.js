window.commonLibrary = {

  criticalChatMessage: () => {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: `
        <img width="100%" height="100%" src="https://i.makeagif.com/media/11-06-2015/XblDPx.gif" />
      `,
    });
  },

  validateModifier: (str) => {
    return /^(\s*[+-]?\s*\d?d?\d+\s*(\[\w+?\])?)*$/.test(str);
  },

  parseModifier: (html) => {
    let modifier = html.find('[name="modifier"]').val();
    let modString = ``;
    if(modifier && modifier !== '' && window.commonLibrary.validateModifier(modifier)) { 
      if(modifier[0] === '-') {
        modString = modifier;
      } else if (modifier[0] === '+') {
        modString = modifier;
      } else {
        modString = `+${modifier}`; 
      }
    }
    return modString;
  },

  extractRollValue: (roll) => {
    if (roll.terms[0].fn) {
      return roll.terms[0].result;
    } else {
      return roll.terms[0].results[0].result;
    }
  },

  rollWrapper: async (rollMsg, customCritCheck) => {
    let crit = false;
    let roll = new Roll(`${rollMsg}`);
    await roll.evaluate();
    await roll.toMessage({flavor: "Roll to Hit"});
    if(window.commonLibrary.extractRollValue(roll) == 20) { 
      crit = true; 
      if(game.user.id === 'ZcOC8UObKz0A1oan') {window.commonLibrary.criticalChatMessage(); }
    }
    if(customCritCheck && customCritCheck(roll)) { 
      crit = true; 
      if(game.user.id === 'ZcOC8UObKz0A1oan') {window.commonLibrary.criticalChatMessage(); } 
    }
    if(window.commonLibrary.extractRollValue(roll) == 1) {
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
    return crit;
  },

  skillCodes: {
    Acrobatics: 'acr',
    'Animal Handling': 'ani',
    Arcana: 'arc',
    Athletics: 'ath',
    Deception: 'dec',
    History: 'his',
    Insight: 'ins',
    Intimidation: 'itm',
    Investigation: 'inv',
    Medicine: 'med',
    Nature: 'nat',
    Perception: 'prc',
    Performance: 'prf',
    Persuasion: 'per',
    Religion: 'rel',
    'Slight of Hand': 'slt',
    Stealth: 'ste',
    Survival: 'sur',
  },
}