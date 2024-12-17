-- Put cautions when calling this procedure --
-- It will truncate all the related tables too --
CREATE OR REPLACE PROCEDURE reset_schedule()
LANGUAGE plpgsql
AS $$
BEGIN
	EXECUTE 'TRUNCATE TABLE "Schedule" CASCADE';
    EXECUTE 'ALTER SEQUENCE "Schedule_id_seq" RESTART WITH 1';
END;
$$;