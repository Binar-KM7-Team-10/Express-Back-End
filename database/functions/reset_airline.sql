-- Put cautions when calling this procedure --
-- It will truncate all the related tables too --
CREATE OR REPLACE PROCEDURE reset_airline()
LANGUAGE plpgsql
AS $$
BEGIN
	EXECUTE 'TRUNCATE TABLE "Airline" CASCADE';
    EXECUTE 'ALTER SEQUENCE "Airline_id_seq" RESTART WITH 1';
END;
$$;