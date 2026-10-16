-- ---------------------------------------------------------------------------
-- Restaurante La Mona — barrios de domicilio
--
-- Cómo usarlo: supabase.com -> tu proyecto -> "SQL Editor" -> pega todo -> "Run".
--
-- Se puede volver a ejecutar sin problema. El barrio que ya esté no se duplica;
-- si le cambias el valor aquí y lo vuelves a correr, se actualiza en la base.
-- Para cambiar un barrio suelto no hace falta esto: se hace en el panel,
-- pestaña Domicilios.
--
-- Al final hay dos bloques comentados: precios que el mapa contradice y barrios
-- que no se pudieron leer. Esos no entran solos: hay que quitarles los "--".
-- ---------------------------------------------------------------------------

-- Estaba guardado en minúscula y el cliente lo ve tal cual. Solo es cosmético:
-- si lo prefieres como estaba, borra estas cuatro líneas.
update public.delivery_zones
   set name = 'Los Trupillos'
 where lower(btrim(name)) = 'los trupillos'
   and name <> 'Los Trupillos';

-- Los barrios y su valor de domicilio. Todo en una sola sentencia: o entra
-- completa o no entra nada, y el nombre se compara igual que el índice único de
-- la tabla (lower(btrim(...))), así que no se puede colar un barrio repetido
-- por una mayúscula de diferencia.
with lista (name, fee) as (
  values
    -- De la lista escrita a mano.
    ('La Victoria'::text          , 7000::integer),
    ('La Unión'                   , 7000),
    ('El Campito'                 , 7000),
    ('La Alboraya'                , 7000),
    ('Las Palmas'                 , 8000),
    ('El Santuario'               , 8000),
    ('Las Américas'               , 10000),
    ('Buenos Aires'               , 8000),
    ('La Magdalena'               , 8000),
    ('San Nicolás'                , 10000),
    ('José Antonio Galán'         , 10000),
    ('Villa Blanca'               , 10000),
    ('Las Palmeras'               , 10000),
    ('Ciudadela 20 de Julio'      , 10000),
    ('7 de Abril'                 , 15000),
    ('Las Cayenas'                , 15000),
    ('Villa Sevilla'              , 15000),
    ('Rebolo'                     , 8000),
    ('Montes'                     , 4000),
    ('Boyacá'                     , 5000),
    ('Los Trupillos'              , 5000),
    ('La Luz'                     , 15000),
    ('Las Nieves'                 , 10000),
    ('La Chinita'                 , 15000),
    ('Pasadena'                   , 10000),
    ('Simón Bolívar'              , 5000),
    ('Tayrona'                    , 8000),
    ('Universal'                  , 8000),
    ('El Limón'                   , 8000),
    ('Los Laureles'               , 10000),
    ('Villa del Carmen'           , 12000),
    ('Santa Ana'                  , 9000),
    ('Barlovento'                 , 7000),
    ('Villanueva'                 , 15000),
    ('Chiquinquirá'               , 6000),
    ('San Roque'                  , 10000),
    ('Zona Franca'                , 15000),

    -- De los mapas, con su precio marcado en rojo.
    ('Loma Fresca'                , 4000),
    ('Alfonso López'              , 3000),
    ('Los Pinos'                  , 5000),
    ('Ciudadela de la Salud'      , 5000),
    ('El Valle'                   , 7000),
    ('San Felipe'                 , 7000),
    ('El Silencio'                , 8000),
    ('La Libertad'                , 8000),
    ('Carlos Meisel'              , 8000),
    ('Los Jobos'                  , 8000),
    ('Las Mercedes'               , 8000),
    ('La Sierrita'                , 8000),
    ('El Porvenir'                , 10000),
    ('Atlántico'                  , 10000),
    ('Centro'                     , 10000),
    ('Carrizal'                   , 10000),
    ('El Milagro'                 , 10000),
    ('Bella Arena'                , 10000),
    ('El Limoncito'               , 15000),
    ('Industrial Vía 40'          , 15000),
    ('Zona Portuaria'             , 15000),

    -- De los mapas, sin marca propia: toda la franja norte está rodeada de 15K
    -- (San Salvador, Paraíso y Altos de Riomar), así que heredan ese valor.
    ('Siape'                      , 15000),
    ('San Marino'                 , 15000),
    ('La Floresta'                , 15000),
    ('Las Tres Ave Marías'        , 15000),
    ('El Castillo'                , 15000),
    ('Solaire Norte'              , 15000),
    ('Villa del Este'             , 15000)
),

-- Primero los que ya existen y cambiaron de valor. Los que están igual no se
-- tocan, para que la fecha de "Última actualización" siga diciendo la verdad.
actualizados as (
  update public.delivery_zones z
     set fee = lista.fee
    from lista
   where lower(btrim(z.name)) = lower(btrim(lista.name))
     and z.fee is distinct from lista.fee
  returning z.id
)

-- Y después los que no están todavía.
insert into public.delivery_zones (name, fee)
select lista.name, lista.fee
  from lista
 where not exists (
         select 1
           from public.delivery_zones z
          where lower(btrim(z.name)) = lower(btrim(lista.name))
       );

-- ---------------------------------------------------------------------------
-- PRECIOS QUE EL MAPA CONTRADICE
--
-- Estos ya están guardados, pero el mapa dice otro número. No se aplican solos
-- porque el valor guardado lo escribiste tú: quita los "--" de los que quieras
-- corregir y vuelve a correr el archivo.
-- ---------------------------------------------------------------------------

-- update public.delivery_zones set fee =  7000 where lower(btrim(name)) = 'villate';  -- en vez de 9000
-- update public.delivery_zones set fee =  7000 where lower(btrim(name)) = 'buena esperanza';  -- en vez de 9000
-- update public.delivery_zones set fee = 12000 where lower(btrim(name)) = 'las palmeras';  -- en vez de 10000
-- update public.delivery_zones set fee = 10000 where lower(btrim(name)) = 'simón bolívar';  -- en vez de 5000
-- update public.delivery_zones set fee =  7000 where lower(btrim(name)) = 'el rosario';  -- en vez de 8000

-- ---------------------------------------------------------------------------
-- BARRIOS SIN RESOLVER
--
-- Ninguno entra todavía. Cuando decidas el valor, agrégalo arriba, en el bloque
-- de los mapas, y corre el archivo otra vez.
--
--   San Francisco            9000 o 10000  -- una hoja dice 9K, la otra 10K
--   Modelo                   8000 o 10000  -- una hoja dice 8K, la otra 10K
--   Los Girasoles            12000 o 18000 -- la marca está tachada
--   Las Dunas                8000 o 10000  -- sin marca; Magdalena y Palmas 8K, San Nicolás y Galán 10K
--   Santo Domingo de Guzmán  ?     -- sin marca
--   América                  ?     -- sin marca; El Prado y El Porvenir 10K, Alto Prado 12K
--   Colombia                 ?     -- sin marca; El Prado 10K, Las Delicias 8K
--   Granadillo               ?     -- sin marca; Alto Prado 12K, El Porvenir 10K
--   Primero de Mayo          ?     -- sin marca; Pasadena 10K, La Chinita 15K
-- ---------------------------------------------------------------------------

-- Cuántos barrios quedaron con domicilio.
select count(*) as barrios from public.delivery_zones;
