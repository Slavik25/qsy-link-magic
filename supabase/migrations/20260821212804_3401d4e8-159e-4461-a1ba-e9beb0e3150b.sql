INSERT INTO public.shop_items (key, kind, price) VALUES
('player-structured','player',250),('player-text','player',250),('player-vinyl','player',300),
('player-wave','player',350),('player-cassette','player',400),('player-dock','player',200),
('player-corner','player',150),('player-neon','player',450),
('layout-compact','layout',150),('layout-wide','layout',300),('layout-hex','layout',400),
('layout-aurora','layout',250),('layout-terminal','layout',300),('layout-cinema','layout',450),
('layout-sakura','layout',350),('layout-brutal','layout',300),('layout-holo','layout',500),
('layout-poster','layout',400)
ON CONFLICT (key) DO UPDATE SET price = EXCLUDED.price, kind = EXCLUDED.kind;