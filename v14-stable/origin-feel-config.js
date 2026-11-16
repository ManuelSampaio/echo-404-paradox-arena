/* Phase 1 movement and Phase 2 operator tuning. Times are seconds; movement values are world pixels/second. */
(() => {
 'use strict';
 window.OriginFeel={
  coyote:.11,jumpBuffer:.12,
  horizontal:{maxSpeed:310,groundAcceleration:1900,airAcceleration:1400,groundBrake:2400,airBrake:650},
  jumps:{shortSpeed:480,highSpeed:700,keyboardReleaseFactor:.5,shortMinHold:.09,highMinHold:.18,touchReleaseFactor:.55},
  dash:{speed:620,duration:.14,cooldown:1.05},
  abilities:{
   axiom:{name:'FASE',icon:'◇',duration:1.5,cooldown:8,color:'#77f5df',label:'Escudo de fase',description:'Bloqueia danos enquanto o escudo está ativo. Não evita quedas.'},
   nyra:{name:'DUPLO',icon:'↑↑',jumpSpeed:560,cooldown:4,color:'#dca0ff',label:'Duplo salto',description:'No ar, toca na habilidade para um segundo salto. Uma vez por voo.'},
   kai7:{name:'ECO ×2',icon:'2×',cooldown:12,color:'#ffc578',label:'Segundo eco',description:'Fixa um eco. Toca na habilidade para gravar outro sem apagar o primeiro. Usa ECO para fixar.'}
  }
 };
})();
