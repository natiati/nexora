const prisma = require('../lib/prisma');
const BaseModel = require('./base.model');
class CategoryModel extends BaseModel { 
    static prismaModel = prisma.category; } //es lo único que cambia
module.exports = CategoryModel;
// clase q hereda de base model y se le asigna el modelo de prisma correspondiente a category