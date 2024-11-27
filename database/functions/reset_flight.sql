-- Put cautions when calling this procedure --
-- It will truncate all the related tables too --
CREATE OR REPLACE PROCEDURE reset_flight()
LANGUAGE plpgsql
AS $$
BEGIN
	EXECUTE 'TRUNCATE TABLE "Flight" CASCADE';
    EXECUTE 'ALTER SEQUENCE "Flight_id_seq" RESTART WITH 1';
END;
$$;