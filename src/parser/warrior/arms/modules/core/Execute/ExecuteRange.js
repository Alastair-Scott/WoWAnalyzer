import Analyzer from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';


const EXECUTE_RANGE = 0.2;
const EXECUTE_RANGE_MASSACRE = 0.35;
/**
 * Tracks whether enemies are in Execute range through damage events so that it can be accessed in cast events by other modules.
 * Tracks the duration of the execution range of the fight.
 * @extends Analyzer
 */
class ExecuteRangeTracker extends Analyzer {

  execRange = (this.selectedCombatant.hasTalent(SPELLS.MASSACRE_TALENT_ARMS.id) ? EXECUTE_RANGE_MASSACRE : EXECUTE_RANGE);
  enemyMap = {};

  isExecPhase = false;
  execPhaseStart = 0;
  execPhaseDuration = 0;

  on_byPlayer_damage(event) {
    if(event.targetIsFriendly) {
      return;
    }
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    this.enemyMap[targetString] = event.hitPoints / event.maxHitPoints <= this.execRange;

    if (this.isTargetInExecuteRange(event) && !this.isExecPhase) {
      this.isExecPhase = true;
      this.execPhaseStart = event.timestamp;
    }

    if (!this.isTargetInExecuteRange(event) && this.isExecPhase) {
      this.isExecPhase = false;
      this.execPhaseDuration += event.timestamp - this.execPhaseStart;
    }
  }

  on_finished(event) {
    if (this.isExecPhase) {
      this.execPhaseDuration += event.timestamp - this.execPhaseStart;
    }
  }

  /**
   * Returns whether the target is in Execute range.
   */
  isTargetInExecuteRange({ targetID, targetInstance }) {
    const targetString = encodeTargetString(targetID, targetInstance);
    return this.enemyMap[targetString];
  }

  /**
   * Returns the duration of the execution phase during the fight
   */
  executionPhaseDuration() {
    return this.execPhaseDuration;
  }
}

export default ExecuteRangeTracker;
