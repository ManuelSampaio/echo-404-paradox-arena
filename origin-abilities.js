/* Operator ability rules are independent of the renderer and persistent saves. */
(() => {
 'use strict';
 class Ability {
  constructor(operator){this.operator=operator;this.config=OriginFeel.abilities[operator];if(!this.config)throw Error('Unknown operator ability');this.cooldown=0;this.active=0;this.airUsed=false;this.uses=0;}
  tick(dt,{grounded=false}={}){const elapsed=Math.max(0,Math.min(dt,.05));this.cooldown=Math.max(0,this.cooldown-elapsed);this.active=Math.max(0,this.active-elapsed);if(grounded)this.airUsed=false;}
  ready({grounded=false,hasEcho=false,recording=false}={}){if(this.cooldown>0)return false;if(this.operator==='nyra')return !grounded&&!this.airUsed;if(this.operator==='kai7')return hasEcho&&!recording;return true;}
  use(context){if(!this.ready(context))return false;this.cooldown=this.config.cooldown;this.active=this.config.duration||0;this.airUsed=this.operator==='nyra';this.uses++;return true;}
 }
 window.OriginAbilities={Ability};
})();
