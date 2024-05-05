import { DataSource, DataSourceOptions } from 'typeorm';
import { APP_CONFIG } from './app.config';

export const DATA_SOURCE_OPTIONS: DataSourceOptions = {
    type: 'mysql',
    host: APP_CONFIG.TYPE_ORM.HOST,
    port: APP_CONFIG.TYPE_ORM.PORT ? (APP_CONFIG.TYPE_ORM.PORT as unknown as number) : 3306,
    username: APP_CONFIG.TYPE_ORM.USER_NAME,
    password: APP_CONFIG.TYPE_ORM.PASSWORD,
    database: APP_CONFIG.TYPE_ORM.DATABASE,
    entities: APP_CONFIG.TYPE_ORM.ENTITIES,
    migrationsTableName: APP_CONFIG.TYPE_ORM.MIGRATIONS_TABLE_NAME,
    migrations: [],
    synchronize: APP_CONFIG.TYPE_ORM.SYNCHRONIZE,
    debug: APP_CONFIG.TYPE_ORM.DEBUG,
};
// Use with TypeORM CLI
export const AppDataSource = new DataSource(DATA_SOURCE_OPTIONS);
