-- La tienda solo se puede modificar desde el servidor: nadie con sesión normal puede tocar precios
REVOKE INSERT, UPDATE, DELETE ON public.shop_items FROM authenticated, anon;
GRANT SELECT ON public.shop_items TO anon, authenticated;
GRANT ALL ON public.shop_items TO service_role;