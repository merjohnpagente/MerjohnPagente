<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f2027"/>
      <stop offset="50%" stop-color="#203a43"/>
      <stop offset="100%" stop-color="#2c5364"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- rounded square background -->
  <rect x="4" y="4" width="112" height="112" rx="24" fill="url(#g)"/>

  <!-- circuit lines -->
  <g stroke="#7fd1ff" stroke-width="2" opacity="0.6" fill="none">
    <path d="M20 60 H40 M80 60 H100 M60 20 V40 M60 80 V100"/>
  </g>

  <!-- pulsing brain chip -->
  <g filter="url(#glow)">
    <rect x="42" y="42" width="36" height="36" rx="6" fill="none" stroke="#7fd1ff" stroke-width="2.5">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
    </rect>
    <circle cx="60" cy="60" r="6" fill="#7fd1ff">
      <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
    </circle>
  </g>

  <!-- dot grid -->
  <g fill="#7fd1ff" opacity="0.5">
    <circle cx="30" cy="30" r="2"/>
    <circle cx="90" cy="30" r="2"/>
    <circle cx="30" cy="90" r="2"/>
    <circle cx="90" cy="90" r="2"/>
  </g>
</svg>
