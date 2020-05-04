import Sequelize from 'sequelize';

import models from '../app/models';

import databaseConfig from '../config/database';

class Database {
  constructor() {
    this.connection = new Sequelize(databaseConfig);
    models.map((model) => model.init(this.connection));
    models.map(
      (model) =>
        typeof model.associate === 'function' &&
        model.associate(this.connection.models)
    );
  }
}

export default new Database();
