const DrawCard = require('../../drawcard.js');
const { Locations, Players, CardTypes } = require('../../Constants');

class IkomaEiji extends DrawCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Put a character into play',
            when: {
                afterConflict: (event, context) => event.conflict.loser === context.player && event.conflict.conflictType === 'political'
            },
            effect: 'put a character into play',
            gameAction: ability.actions.putIntoPlay(context => ({
                promptForSelect: {
                    cardType: CardTypes.Character,
                    location: [Locations.Provinces, Locations.DynastyDiscardPile],
                    controller: Players.Self,
                    cardCondition: card => card.hasTrait('bushi') && card.costLessThan(4),
                    message: '{0} puts {1} into play with {2}\'s ability',
                    messageArgs: card => [context.player, card, context.source]
                }
            }))
        });
    }
}

IkomaEiji.id = 'ikoma-eiji';

module.exports = IkomaEiji;
