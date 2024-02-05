import { IProductionLog, IQueryParams } from '../interfaces';
import db from '../models';

export class ProductionService {
  public createProductionLog = async (productionLogData: IProductionLog, txn?: any) => {
    const requiredFields = ['company', 'weekOf'];
    const allowedCompanies = ['three-m', 'ultra-grip'];

    for (const field of requiredFields) {
      if (!productionLogData[field as keyof IProductionLog]) {
        throw new Error(`${field} is required`);
      }
    }

    if (!allowedCompanies.includes(productionLogData.company)) {
      throw new Error(`Invalid company. Allowed values are ${allowedCompanies.join(', ')}`);
    }

    const existingProductionLog = await db.ProductionLog.findOne({
      where: { company: productionLogData.company, weekOf: productionLogData.weekOf },
    });

    if (existingProductionLog) {
      throw new Error(
        `${productionLogData.company} production log already exists for the week of ${productionLogData.weekOf}`
      );
    }

    const productionLog = await db.ProductionLog.create(productionLogData);

    return productionLog;
  };

  public getProductionLogs = async (params: IQueryParams) => {
    const { filter, sort, page, pageSize, fields } = params;

    let whereClause = filter || {};
    let orderClause: [string, string][] = [];
    let limit = pageSize;
    let offset = page && pageSize ? (page - 1) * pageSize : 0;
    let attributes: string[] | undefined = fields;

    if (sort) {
      const [field, order] = sort.split(',');
      orderClause.push([field, order.toUpperCase()]);
    }

    const productionLogs = await db.ProductionLog.findAll({
      where: whereClause,
      order: orderClause,
      limit,
      offset,
      attributes,
    });

    const total = await db.ProductionLog.count({
      where: whereClause,
    });

    const pages = limit ? Math.ceil(total / limit) : 0;

    return { productionLogs, total, pages };
  };

  public getProductionLog = async (productionLogId: string) => {
    const productionLog = await db.ProductionLog.findOne({
      where: { id: productionLogId },
    });

    if (!productionLog) {
      throw new Error('Production log not found');
    }

    return productionLog;
  };

  public updateProductionLog = async () => {};

  public deleteProductionLog = async () => {};
}
