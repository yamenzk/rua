# SuccessAnimation.vue
<template>
  <div class="animation-success-account">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 386.46 312.19">
      <g id="Layer_1" data-name="Layer 1">
        <circle class="cls-1 swirl1" cx="159.56" cy="23.16" r="8"/>
        <circle class="cls-2 swirl2" cx="349.18" cy="164.71" r="5.25"/>
        <circle class="cls-2 swirl1" cx="239.24" cy="286.61" r="5.25"/>
        <circle class="cls-2 swirl2" cx="19.41" cy="159.14" r="5.25"/>
        <circle class="cls-3 swirl1" cx="43.87" cy="132.16" r="5"/>
        <circle class="cls-3 bounce2" cx="371.07" cy="190.3" r="5"/>
        <circle class="cls-3 swirl2" cx="112.96" cy="21.16" r="5"/>
        <circle class="cls-3 bounce2" cx="57.68" cy="213.26" r="5"/>
        <circle class="cls-3 swirl1" cx="320.87" cy="201.26" r="7"/>
        <circle class="cls-3" cx="196.4" cy="160.51" r="109.34"/>
      </g>
      <g class="check" id="Layer_2" data-name="Layer 2">
        <circle class="cls-4 bounce" cx="107.96" cy="76.92" r="35.28"/>
        <polyline class="cls-5 bounce" points="91.79 79.85 101.99 90.05 125.51 66.53"/>
      </g>
      <g id="Layer_3" data-name="Layer 3">
        <path class="cls-6 dash" d="M258.53,259c0-34.68-27.82-62.79-62.13-62.79S134.27,224.35,134.27,259"/>
        <circle class="cls-6 dash" cx="196.4" cy="147.46" r="42.84"/>
        <path class="cls-6 dash2" d="M181.12,160a16.26,16.26,0,0,0,30.56-.86"/>
        <circle class="cls-4" cx="180.51" cy="140.1" r="5.33"/>
        <circle class="cls-4" cx="212.45" cy="140.1" r="5.33"/>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.cls-1,.cls-2,.cls-5,.cls-6{fill:none;stroke-miterlimit:10;}
.cls-1,.cls-2{stroke:#d9ffd7;}.cls-1{stroke-width:8px;}
.cls-2{stroke-width:4px;}
.cls-3{fill:#d9ffd7;}
.cls-4{fill:#08bd00;}
.cls-5{stroke:#fff;}
.cls-5,.cls-6{stroke-linecap:round;stroke-width:9px;}
.cls-6{stroke:#08bd00;}

.animation-success-account {
  animation: 800ms cubic-bezier(.5,0,.25,1.6) appear forwards;
}

@keyframes appear {
  0%{
    opacity: 0;
    transform: scale(0)
  }
  100%{opacity: 1}
}

.swirl1 {
  transform-origin: center;
  animation: 3s linear swirl1 infinite alternate;
}

@keyframes swirl1 {
  0% {
    transform: rotate(0deg)
  }
  50% {
    transform: rotate(2deg)
  }
}

.swirl2 {
  animation: 1000ms linear appear, 2s linear swirl2 infinite alternate;
}

@keyframes swirl2 {
  0% {
    transform: rotate(0deg)
  }
  50% {
    transform: rotate(-2deg)
  }
}

.bounce, .bounce2 {
  animation: 1500ms ease-in-out bounce infinite alternate;
}

.check {
  opacity: 0;
  transform-origin: center;
  animation: 800ms cubic-bezier(.5,0,.25,1.6) appear 900ms forwards;
}

.bounce2 {
  animation-delay: 150ms;
  animation-duration: 1250ms;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-15px);
  }
}

.dash,.dash2 {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: dash ease-in-out 3000ms forwards;
}

.dash {
  animation-delay: 500ms;
  animation-iteration-count: 1;
}

.dash2 {
  animation-delay: 650ms;
  animation-duration: 1700ms
}

@keyframes dash {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>