insert into public.shop_price_reference (key, price) values
('player-structured',250),('player-text',250),('player-vinyl',300),('player-wave',350),('player-cassette',400),('player-dock',200),('player-corner',150),('player-neon',450),('player-orbit',300),('player-poster',500),('player-lcd',350),('player-spectrum',400),('player-capsule',200),('player-terminal',350),('player-hologram',550),
('name-shine',150),('name-rainbow',250),('name-glitch',300),('name-neon',350),('name-typewriter',200),('name-chrome',400),('name-fire',450),('name-ice',400),('name-sparkle',500),('name-gold',400),('name-toxic',250),('name-aqua',200),('name-candy',250),('name-holo',450),('name-shadow3d',200),('name-heartbeat',300),('name-wave',150),('name-terminal',200),('name-blurpulse',300),('name-galaxy',500),('name-strobe',350),
('bg-rain',150),('bg-snow',150),('bg-bubbles',200),('bg-confetti',200),('bg-fireflies',250),('bg-matrix',300),('bg-oldtv',300),('bg-grid',350),('bg-plasma',450),('bg-dither',400),('bg-nebula',500),('bg-sakura',250),('bg-hearts',200),('bg-embers',300),('bg-clouds',150),('bg-vortex',400),('bg-cyberrain',350),('bg-spotlight',200),('bg-lava',400),('bg-smoke',300),('bg-fireworks',500),
('hover-zoom',200),('hover-tilt',200),('hover-glow',250),('hover-float',300),('hover-shine',300),('hover-jelly',350),('hover-rgb',400),('hover-scan',450),('hover-pop',150),('hover-swing',200),('hover-wobble',250),('hover-blur',300),('hover-breathe',350),('hover-skew',250),('hover-flip',400),('hover-hologram',500),('hover-neonpulse',450),
('rex',250),('enojon-rosita',200),('chococat',300),('polvo-blanco',250),('dientes',200),('colegiala-kun',350),('alitas',300),('enamorado',250),('hello-kitty',400),('misterio',600),('skill-issue',300),('cinnamon-roll',400),('my-melody',400),('fantasmita',350),('luna',500),('marcianitos',500),
('a-real-fungi',250),('aim-for-love',350),('air',450),('akuma',600),('ambient-ripples-bubblegum',250),('ambient-ripples-golden',350),('ambient-ripples-lavender',450),('amethyst-choker',600),('angel-headphones',250),('angry',350),('angry-pink',450),('angry-yellow',600),('ares-disc',250),('aries',350),('astral-aura',450),('astrolabe-gold',600),('atakhans-aura-of-malice',250),('aurora',350),('autumn-crown',450),('autumn-foliage',600),('azure-dice',250),('baby-displacer-beast',350),('baker-bear',450),('balance',600),('beach-hat',250),('berry-bunny',350),('berry-cute',450),('black-hole',600),('bloodthirsty',250),('bloodthirsty-gold',350),('bloodthirsty-green',450),('bloomling',600),
('layout-compact',150),('layout-wide',300),('layout-hex',400),('layout-aurora',250),('layout-terminal',300),('layout-cinema',450),('layout-sakura',350),('layout-brutal',300),('layout-holo',500),('layout-poster',400),('layout-vapor',250),('layout-arcade',300),('layout-ivory',200),('layout-nebula',450),('layout-y2k',500)
on conflict (key) do update set price = excluded.price, updated_at = now();

select set_config('app.shop_repair','on',true);
insert into public.shop_items (key, kind, price)
select r.key,
  case
    when r.key like 'player-%' then 'player'
    when r.key like 'name-%' then 'name'
    when r.key like 'bg-%' then 'bg'
    when r.key like 'hover-%' then 'hover'
    when r.key like 'layout-%' then 'layout'
    else 'decoration'
  end,
  r.price
from public.shop_price_reference r
on conflict (key) do update set price = excluded.price, kind = excluded.kind;
select set_config('app.shop_repair','off',true);