'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        url: 'images.url',
        preview: true
      },
      {
        spotId: 2,
        url: 'photo.jpeg',
        preview: false
      },
      {
        spotId: 3,
        url: 'pic.url',
        preview: false
      },
      {
        spotId: 4,
        url: 'pic.jpeg',
        preview: true
      },
    ], {})
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkDelete(options);
  }
};