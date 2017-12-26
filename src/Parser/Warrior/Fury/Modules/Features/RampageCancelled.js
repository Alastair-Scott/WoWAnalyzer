import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';

class RampageCancelled extends Analyzer {

  // Rampage is in fact 5 separate spells cast in this sequence
  rampage = [SPELLS.RAMPAGE_1.id, SPELLS.RAMPAGE_2.id, SPELLS.RAMPAGE_3.id, SPELLS.RAMPAGE_4.id, SPELLS.RAMPAGE_5.id]
  counter = {}

  on_initialized() {    
    for (let i = 0; i < this.rampage.length; i++) {
        this.counter[this.rampage[i]] = 0;
    }
  }

  on_byPlayer_damage(event) {
    if (!this.rampage.includes(event.ability.guid)) {
        return;
    }

    this.counter[event.ability.guid]++;
  }

  get suggestionThresholdsFrothingBerserker() {
    return {
      isGreaterThan: {
        minor: 0,
        average: 0.02,
        major: 0.05,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
      isGreaterThan: {
          minor,
          average,
          major,
        },
      } = this.suggestionThresholdsFrothingBerserker;
    
    const max = Object.values(this.counter).reduce((max, current) => current > max ? current : max, 0);
    const wasted = Object.keys(this.counter).reduce((acc, current) => acc + max - this.counter[current], 0);

    when(wasted / (5 * max)).isGreaterThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You are cancelling your <SpellLink id={SPELLS.RAMPAGE.id} /> cast by casting another Rampage immediately after. Wait for it to finish before casting another.</Wrapper>)
          .icon(SPELLS.RAMPAGE.icon)
          .actual(`${(actual * 100).toFixed(2)}% (${wasted} out of ${max * 5}) of your Rampage hits were cancelled.`)
          .recommended(`0% is recommended`)
          .regular(average).major(major);
      });
  }
}

export default RampageCancelled;
