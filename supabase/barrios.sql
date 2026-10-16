-- ---------------------------------------------------------------------------
-- Restaurante La Mona — barrios de domicilio
--
-- Cómo usarlo: supabase.com -> tu proyecto -> "SQL Editor" -> pega todo -> "Run".
--
-- Se puede volver a ejecutar sin problema. El barrio que ya esté no se duplica;
-- si le cambias el valor aquí y lo vuelves a correr, se actualiza en la base.
-- Para cambiar un barrio suelto no hace falta esto: se hace en el panel,
-- pestaña Domicilios.
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
    ('La Victoria'::text            , 7000::integer),
    ('La Unión'                     , 7000),
    ('El Campito'                   , 7000),
    ('La Alboraya'                  , 7000),
    ('Las Palmas'                   , 8000),
    ('El Santuario'                 , 8000),
    ('Las Américas'                 , 10000),
    ('Buenos Aires'                 , 8000),
    ('La Magdalena'                 , 8000),
    ('San Nicolás'                  , 10000),
    ('José Antonio Galán'           , 10000),
    ('Villa Blanca'                 , 10000),
    ('Las Palmeras'                 , 12000),
    ('Ciudadela 20 de Julio'        , 10000),
    ('7 de Abril'                   , 15000),
    ('Las Cayenas'                  , 15000),
    ('Villa Sevilla'                , 15000),
    ('Rebolo'                       , 8000),
    ('Montes'                       , 4000),
    ('Boyacá'                       , 5000),
    ('Los Trupillos'                , 5000),
    ('La Luz'                       , 15000),
    ('Las Nieves'                   , 10000),
    ('La Chinita'                   , 15000),
    ('Pasadena'                     , 10000),
    ('Simón Bolívar'                , 10000),
    ('Tayrona'                      , 8000),
    ('Universal'                    , 8000),
    ('El Limón'                     , 8000),
    ('Los Laureles'                 , 10000),
    ('Villa del Carmen'             , 12000),
    ('Santa Ana'                    , 9000),
    ('Barlovento'                   , 7000),
    ('Villanueva'                   , 15000),
    ('Chiquinquirá'                 , 6000),
    ('San Roque'                    , 10000),
    ('Zona Franca'                  , 15000),

    -- De los mapas, con su precio marcado en rojo.
    ('Loma Fresca'                  , 4000),
    ('Alfonso López'                , 3000),
    ('Los Pinos'                    , 5000),
    ('Ciudadela de la Salud'        , 5000),
    ('El Valle'                     , 7000),
    ('San Felipe'                   , 7000),
    ('El Silencio'                  , 8000),
    ('La Libertad'                  , 8000),
    ('Carlos Meisel'                , 8000),
    ('Los Jobos'                    , 8000),
    ('Las Mercedes'                 , 8000),
    ('La Sierrita'                  , 8000),
    ('El Porvenir'                  , 10000),
    ('Atlántico'                    , 10000),
    ('Centro'                       , 10000),
    ('Carrizal'                     , 10000),
    ('El Milagro'                   , 10000),
    ('Bella Arena'                  , 10000),
    ('El Limoncito'                 , 15000),
    ('Industrial Vía 40'            , 15000),
    ('Zona Portuaria'               , 15000),

    -- De los mapas, sin marca propia: toda la franja norte está rodeada de 15K
    -- (San Salvador, Paraíso y Altos de Riomar), así que heredan ese valor.
    ('Siape'                        , 15000),
    ('San Marino'                   , 15000),
    ('La Floresta'                  , 15000),
    ('Las Tres Ave Marías'          , 15000),
    ('El Castillo'                  , 15000),
    ('Solaire Norte'                , 15000),
    ('Villa del Este'               , 15000),

    -- Estaban guardados con otro valor del que marca el mapa. Manda el mapa,
    -- que es la hoja que dice "Precios Fijos". El Rosario se queda en 8.000:
    -- esa misma hoja dice 8K y solo la otra dice 7K.
    ('Villate'                      , 7000),
    ('Buena Esperanza'              , 7000),
    ('El Rosario'                   , 8000),

    -- No tenían un valor claro. Se resolvieron así:
    --   San Francisco y Modelo  la hoja de "Precios Fijos" dice 10K en las dos
    --   Los Girasoles           marca tachada; Cayenas y Villa Sevilla, al lado, 15K
    --   Las Dunas               pegado a San Nicolás y Galán, los dos 10K
    --   los cinco restantes     sin marca, en plena franja de 10K
    -- Son criterio mío: si el restaurante sabe el valor de verdad, lo cambia
    -- en el panel y listo.
    ('San Francisco'                , 10000),
    ('Modelo'                       , 10000),
    ('Los Girasoles'                , 15000),
    ('Las Dunas'                    , 10000),
    ('Santo Domingo de Guzmán'      , 10000),
    ('América'                      , 10000),
    ('Colombia'                     , 10000),
    ('Granadillo'                   , 10000),
    ('Primero de Mayo'              , 10000)
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

-- Cuántos barrios quedaron con domicilio.
select count(*) as barrios from public.delivery_zones;
