-- Put cautions when calling this procedure --
-- It will truncate all the related tables too --
CREATE OR REPLACE PROCEDURE reset_user()
LANGUAGE plpgsql
AS $$
BEGIN
	EXECUTE 'TRUNCATE TABLE "User" CASCADE';
    EXECUTE 'ALTER SEQUENCE "User_id_seq" RESTART WITH 1';
END;
$$;