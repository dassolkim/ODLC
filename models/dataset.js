const Sequelize = require('sequelize')


module.exports = class Dataset extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true
            },
            url: {
                type: Sequelize.STRING(),
                allowNull: false
                // unique: true
            },
            title: {
                type: Sequelize.STRING(),
                allowNull: true,
                unique: false
            },
            issued: {
                type: Sequelize.DATE(),
                allowNull: true
            },
            modified: {
                type: Sequelize.DATE(),
                allowNull: true
            },
            identifier: {
                type: Sequelize.STRING(),
                allowNull: true
            },
            publisher: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: false
            },
        }, {
            sequelize,
            timestamps: true,
            modelName: 'Dataset',
            tableName: 'dataset',
            charset: 'utf8'
        })
    }
    // static associate(db) {
    //     db.DatasetKeyword.hasMany(db.DatasetKeyword, {foreignKey: 'id', targeKey: 'dataset_id'})
    //     db.Distribution.hasMany(db.Distribution, {foreignKey: 'id', targeKey: 'dataset_id'})
    // }
}
