const _ = require('underscore');

const AbilityLimit = require('./abilitylimit.js');
const CannotRestriction = require('./cannotrestriction.js');
const EffectBuilder = require('./Effects/EffectBuilder');
const { EffectNames, Durations } = require('./Constants');

/* Types of effect
    1. Static effects - do something for a period
    2. Dynamic effects - like static, but what they do depends on the game state
    3. Detached effects - do something when applied, and on expiration, but can be ignored in the interim
*/

const Effects = {
    // Card effects
    addFaction: (faction) => EffectBuilder.card.static(EffectNames.AddFaction, faction),
    addGloryWhileDishonored: () => EffectBuilder.card.static(EffectNames.AddGloryWhileDishonored),
    addKeyword: (keyword) => EffectBuilder.card.static(EffectNames.AddKeyword, keyword),
    addTrait: (trait) => EffectBuilder.card.static(EffectNames.AddTrait, trait),
    blank: () => EffectBuilder.card.static(EffectNames.Blank),
    canBeSeenWhenFacedown: () => EffectBuilder.card.static(EffectNames.CanBeSeenWhenFacedown),
    cannotParticipateAsAttacker: (type = 'both') => EffectBuilder.card.static(EffectNames.CannotParticipateAsAttacker, type),
    cannotParticipateAsDefender: (type = 'both') => EffectBuilder.card.static(EffectNames.CannotParticipateAsDefender, type),
    cardCannot: (properties) => EffectBuilder.card.static(EffectNames.AbilityRestrictions, new CannotRestriction(properties)),
    customDetachedCard: (properties) => EffectBuilder.card.detached(EffectNames.CustomEffect, properties),
    delayedEffect: (properties) => EffectBuilder.card.detached(EffectNames.DelayedEffect, {
        apply: (card, context) => {
            properties.target = card;
            properties.context = properties.context || context;
            return context.source.delayedEffect(() => properties);
        },
        unapply: (card, context, effect) => context.game.effectEngine.removeDelayedEffect(effect)
    }),
    doesNotBow: () => EffectBuilder.card.static(EffectNames.DoesNotBow),
    doesNotReady: () => EffectBuilder.card.static(EffectNames.DoesNotReady),
    gainAbility: (abilityType, properties) => EffectBuilder.card.detached(EffectNames.GainAbility, {
        apply: (card, context) => {
            let ability;
            if(abilityType === Durations.Persistent) {
                ability = card.persistentEffect(properties);
                return ability;
            } else if(abilityType === 'action') {
                ability = card.action(properties);
            } else {
                ability = card.triggeredAbility(abilityType, properties);
                ability.registerEvents();
            }
            if(context.source.grantedAbilityLimits) {
                if(context.source.grantedAbilityLimits[card.uuid]) {
                    ability.limit = context.source.grantedAbilityLimits[card.uuid];
                } else {
                    context.source.grantedAbilityLimits[card.uuid] = ability.limit;
                }
            }
            return ability;
        },
        unapply: (card, context, ability) => {
            if(abilityType === Durations.Persistent) {
                if(ability.ref) {
                    card.removeEffectFromEngine(ability.ref);
                }
                card.abilities.persistentEffects = card.abilities.persistentEffects.filter(a => a !== ability);
            } else if(abilityType === 'action') {
                card.abilities.actions = card.abilities.actions.filter(a => a !== ability);
            } else {
                card.abilities.reactions = card.abilities.reactions.filter(a => a !== ability);
                ability.unregisterEvents();
            }
        }
    }),
    gainPlayAction: (playActionClass) => EffectBuilder.card.detached(EffectNames.GainPlayAction, {
        apply: card => {
            let action = new playActionClass(card);
            card.abilities.playActions.push(action);
            return action;
        },
        unapply: (card, context, playAction) => card.abilities.playActions = card.abilities.playActions.filter(action => action !== playAction)
    }),
    immunity: (properties) => EffectBuilder.card.static(EffectNames.AbilityRestrictions, new CannotRestriction(properties)),
    increaseLimitOnAbilities: (amount) => EffectBuilder.card.static(EffectNames.IncreaseLimitOnAbilities, amount),
    modifyBaseMilitarySkill: (value) => EffectBuilder.card.flexible(EffectNames.ModifyBaseMilitarySkill, value),
    modifyBasePoliticalSkill: (value) => EffectBuilder.card.flexible(EffectNames.ModifyBasePoliticalSkill, value),
    modifyBaseProvinceStrength: (value) => EffectBuilder.card.flexible(EffectNames.ModifyBaseProvinceStrength, value),
    modifyBothSkills: (value) => EffectBuilder.card.flexible(EffectNames.ModifyBothSkills, value),
    modifyDuelGlory: (value) => EffectBuilder.card.static(EffectNames.ModifyDuelGlory, value),
    modifyDuelMilitarySkill: (value) => EffectBuilder.card.static(EffectNames.ModifyDuelMilitarySkill, value),
    modifyDuelPoliticalSkill: (value) => EffectBuilder.card.static(EffectNames.ModifyDuelPoliticalSkill, value),
    modifyGlory: (value) => EffectBuilder.card.flexible(EffectNames.ModifyGlory, value),
    modifyMilitarySkill: (value) => EffectBuilder.card.flexible(EffectNames.ModifyMilitarySkill, value),
    modifyMilitarySkillMultiplier: (value) => EffectBuilder.card.flexible(EffectNames.ModifyMilitarySkillMultiplier, value),
    modifyPoliticalSkill: (value) => EffectBuilder.card.flexible(EffectNames.ModifyPoliticalSkill, value),
    modifyPoliticalSkillMultiplier: (value) => EffectBuilder.card.flexible(EffectNames.ModifyPoliticalSkillMultiplier, value),
    modifyProvinceStrength: (value) => EffectBuilder.card.flexible(EffectNames.ModifyProvinceStrength, value),
    modifyProvinceStrengthMultiplier: (value) => EffectBuilder.card.flexible(EffectNames.ModifyProvinceStrengthMultiplier, value),
    setBaseMilitarySkill: (value) => EffectBuilder.card.static(EffectNames.SetBaseMilitarySkill, value),
    setBasePoliticalSkill: (value) => EffectBuilder.card.static(EffectNames.SetBasePoliticalSkill, value),
    setBaseProvinceStrength: (value) => EffectBuilder.card.static(EffectNames.SetBaseProvinceStrength, value),
    setDash: (type) => EffectBuilder.card.static(EffectNames.SetDash, type),
    setGlory: (value) => EffectBuilder.card.static(EffectNames.SetGlory, value),
    setMilitarySkill: (value) => EffectBuilder.card.static(EffectNames.SetMilitarySkill, value),
    setPoliticalSkill: (value) => EffectBuilder.card.static(EffectNames.SetPoliticalSkill, value),
    setProvinceStrength: (value) => EffectBuilder.card.static(EffectNames.SetProvinceStrength, value),
    takeControl: (player) => EffectBuilder.card.static(EffectNames.TakeControl, player),
    terminalCondition: (properties) => EffectBuilder.card.detached(EffectNames.TerminalCondition, {
        apply: (card, context) => {
            properties.target = card;
            properties.context = properties.context || context;
            return context.source.terminalCondition(() => properties);
        },
        unapply: (card, context, effect) => context.game.effectEngine.removeTerminalCondition(effect)
    }),
    // Ring effects
    addElement: (element) => EffectBuilder.ring.static(EffectNames.AddElement, element),
    cannotDeclareRing: (match) => EffectBuilder.ring.static(EffectNames.CannotDeclare, match), // TODO: Add this to lasting effect checks
    considerRingAsClaimed: (match) => EffectBuilder.ring.static(EffectNames.ConsiderRingAsClaimed, match), // TODO: Add this to lasting effect checks
    // Player effects
    additionalCharactersInConflict: (amount) => EffectBuilder.player.flexible(EffectNames.AdditionalCharactersInConflict, amount),
    additionalConflict: (type) => EffectBuilder.player.detached(EffectNames.AdditionalConflict, {
        apply: player => player.addConflictOpportunity(type),
        unapply: () => true
    }),
    alternateFatePool: (match) => EffectBuilder.player.static(EffectNames.AlternateFatePool, match),
    canPlayFromOwn: (location, cards) => EffectBuilder.player.detached(EffectNames.CanPlayFromOwn, {
        apply: (player) => player.addPlayableLocation('playFromHand', player, location, cards),
        unapply: (player, context, location) => player.removePlayableLocation(location)
    }),
    changePlayerGloryModifier: (value) => EffectBuilder.player.static(EffectNames.ChangePlayerGloryModifier, value),
    changePlayerSkillModifier: (value) => EffectBuilder.player.flexible(EffectNames.ChangePlayerSkillModifier, value),
    customDetachedPlayer: (properties) => EffectBuilder.player.detached(EffectNames.CustomEffect, properties),
    gainActionPhasePriority: () => EffectBuilder.player.detached(EffectNames.GainActionPhasePriority, {
        apply: player => player.actionPhasePriority = true,
        unapply: player => player.actionPhasePriority = false
    }),
    increaseCost: (properties) => Effects.reduceCost(_.extend(properties, { amount: -properties.amount })),
    playerCannot: (properties) => EffectBuilder.player.static(EffectNames.AbilityRestrictions, new CannotRestriction(properties)),
    reduceCost: (properties) => EffectBuilder.player.detached(EffectNames.CostReducer, {
        apply: (player, context) => player.addCostReducer(context.source, properties),
        unapply: (player, context, reducer) => player.removeCostReducer(reducer)
    }),
    reduceNextPlayedCardCost: (amount, match) => EffectBuilder.player.detached(EffectNames.CostReducer, {
        apply: (player, context) => player.addCostReducer(context.source, { amount: amount, match: match, limit: AbilityLimit.fixed(1) }),
        unapply: (player, context, reducer) => player.removeCostReducer(reducer)
    }),
    setMaxConflicts: (amount) => EffectBuilder.player.static(EffectNames.SetMaxConflicts, amount),
    showTopConflictCard: () => EffectBuilder.player.static(EffectNames.ShowTopConflictCard),
    // Conflict effects
    contributeToConflict: (card) => EffectBuilder.conflict.flexible(EffectNames.ContributeToConflict, card),
    changeConflictSkillFunction: (func) => EffectBuilder.conflict.static(EffectNames.ChangeConflictSkillFunction, func), // TODO: Add this to lasting effect checks
    modifyConflictElementsToResolve: (value) => EffectBuilder.conflict.static(EffectNames.ModifyConflictElementsToResolve, value), // TODO: Add this to lasting effect checks
    restrictNumberOfDefenders: (value) => EffectBuilder.conflict.static(EffectNames.RestrictNumberOfDefenders, value) // TODO: Add this to lasting effect checks
};

module.exports = Effects;
