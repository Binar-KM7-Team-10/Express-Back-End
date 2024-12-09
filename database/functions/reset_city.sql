-- Put cautions when calling this procedure --
-- It will truncate all the related tables too --
CREATE OR REPLACE PROCEDURE reset_airport()
LANGUAGE plpgsql
AS $$
BEGIN
	EXECUTE 'TRUNCATE TABLE "City" CASCADE';
    EXECUTE 'ALTER SEQUENCE "City_id_seq" RESTART WITH 1';
END;
$$;