describe('Master Alchemist', function() {
    integration(function() {
        describe('Master Alchemist\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['master-alchemist', 'serene-warrior']
                    },
                    player2: {
                        inPlay: ['serene-warrior']
                    }
                });
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    ring: 'air',
                    attackers: ['serene-warrior'],
                    defenders: []
                });
                this.player2.pass();
            });

            it('should cost 1 fate', function() {
                let fate = this.player1.fate;
                this.player1.clickCard('master-alchemist');
                this.player1.clickPrompt('Pay costs first');
                this.player1.clickRing('fire');
                this.player1.clickCard('serene-warrior');
                this.player1.clickPrompt('Honor Serene Warrior');
                expect(this.player1.fate).toBe(fate - 1);
            });

            it('should place 1 fate on Fire ring', function() {
                let fate = this.game.rings.fire.fate;
                this.player1.clickCard('master-alchemist');
                this.player1.clickPrompt('Pay costs first');
                this.player1.clickRing('fire');
                this.player1.clickCard('serene-warrior');
                this.player1.clickPrompt('Honor Serene Warrior');
                expect(this.game.rings.fire.fate).toBe(fate + 1);
            });

            it('should be able to honor chosen character', function() {
                let sereneWarrior = this.player1.findCardByName('serene-warrior');
                expect(sereneWarrior.isHonored).toBe(false);
                this.player1.clickCard('master-alchemist');
                this.player1.clickPrompt('Pay costs first');
                this.player1.clickRing('fire');
                this.player1.clickCard('serene-warrior');
                this.player1.clickPrompt('Honor Serene Warrior');
                expect(sereneWarrior.isHonored).toBe(true);
            });

            it('should be able to dishonor chosen character', function() {
                let sereneWarrior = this.player1.findCardByName('serene-warrior');
                expect(sereneWarrior.isDishonored).toBe(false);
                this.player1.clickCard('master-alchemist');
                this.player1.clickPrompt('Pay costs first');
                this.player1.clickRing('fire');
                this.player1.clickCard('serene-warrior');
                this.player1.clickPrompt('Dishonor Serene Warrior');
                expect(sereneWarrior.isDishonored).toBe(true);
            });
        });

        describe('interaction with{ Young Rumormonger', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['master-alchemist', 'togashi-mitsu']
                    },
                    player2: {
                        inPlay: ['young-rumormonger', 'bayushi-liar']
                    }
                });

                this.togashiMitsu = this.player1.findCardByName('togashi-mitsu');
                this.togashiMitsu.isDishonored = true;
                this.youngRumormonger = this.player2.findCardByName('young-rumormonger');

                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.togashiMitsu]
                });
                this.player1.clickCard(this.youngRumormonger);
                this.player2.clickPrompt('Done');

                this.player2.pass();
            });

            it('should allow Young Rumormonger to redirect honor', function() {
                this.masterAlchemist = this.player1.clickCard('master-alchemist');
                expect(this.player1).toHavePrompt('Master Alchemist');
                this.player1.clickCard(this.togashiMitsu);
                this.player1.clickRing('fire');
                expect(this.player2).toHavePrompt('Triggered Abilities');
            });
        });
    });
});
