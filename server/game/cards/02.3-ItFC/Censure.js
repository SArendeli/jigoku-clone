const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');

class Censure extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel an event',
            when: {
                onCardAbilityInitiated: event => event.card.type === CardTypes.Event
            },
            cannotBeMirrored: true,
            effect: 'cancel {1}',
            effectArgs: context => context.event.card,
            handler: context => context.cancel()
        });
    }

    canPlay(context) {
        if(context.player.imperialFavor !== '') {
            return super.canPlay(context);
        }
        return false;
    }
}

Censure.id = 'censure';

module.exports = Censure;
