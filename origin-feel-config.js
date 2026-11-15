/* Phase 1 tuning. Times are seconds; movement values are world pixels/second. */
(() => {
 'use strict';
 window.OriginFeel={
  coyote:.11,jumpBuffer:.12,
  horizontal:{maxSpeed:310,groundAcceleration:1900,airAcceleration:1400,groundBrake:2400,airBrake:650},
  jumps:{shortSpeed:480,highSpeed:700,keyboardReleaseFactor:.5,shortMinHold:.09,highMinHold:.18,touchReleaseFactor:.55},
  dash:{speed:620,duration:.14,cooldown:1.05}
 };
})();
