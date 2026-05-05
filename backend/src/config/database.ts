export type DatabaseMode = 'production' | 'development';

const productionConnectionString =
  'postgresql://neondb_owner:npg_hIguoSkMAc16@ep-fragrant-dawn-aoe2l8ts.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const developmentConnectionString =
  'postgresql://neondb_owner:npg_hIguoSkMAc16@ep-summer-firefly-aovwphhd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function normalizeDatabaseMode(mode: string | undefined): DatabaseMode {
  return mode === 'development' || mode === 'dev' ? 'development' : 'production';
}

export const databaseMode = normalizeDatabaseMode(process.env.DB_MODE);

export const connectionString =
  process.env.DATABASE_URL ||
  (databaseMode === 'development' ? developmentConnectionString : productionConnectionString);
