import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { PrismaAdminHelpers } from './prisma-admin.helpers.js';

@Injectable()
export class PrismaAdminService {
  private readonly dmmf: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: PrismaAdminHelpers,
  ) {
    // @ts-ignore - Acessando a propriedade interna do Prisma Client
    this.dmmf = this.prisma._baseDmmf;
  }

  getModels() {
    const models = this.dmmf.modelMap;
    return {
      models: Object.keys(models).map((modelName) => ({
        name: modelName,
        fields: models[modelName].fields.length,
      })),
      page: 'Models',
      helpers: this.getHelpers(),
    };
  }

  async getModelData(modelName: string) {
    if (!this.prisma[this.toCamelCase(modelName)]) {
      throw new NotFoundException(`Modelo ${modelName} não encontrado`);
    }

    const model = this.dmmf.modelMap[modelName];
    if (!model) {
      throw new NotFoundException(`Modelo ${modelName} não encontrado`);
    }

    const data = await this.prisma[this.toCamelCase(modelName)].findMany({
      take: 100,
    });

    return {
      modelName,
      fields: model.fields,
      data,
      page: `Modelo: ${modelName}`,
      helpers: this.getHelpers(),
    };
  }

  async getRecordData(modelName: string, id: string) {
    if (!this.prisma[this.toCamelCase(modelName)]) {
      throw new NotFoundException(`Modelo ${modelName} não encontrado`);
    }

    const model = this.dmmf.modelMap[modelName];
    if (!model) {
      throw new NotFoundException(`Modelo ${modelName} não encontrado`);
    }

    const primaryKey = model.fields.find((f) => f.isId);
    if (!primaryKey) {
      throw new NotFoundException(`Modelo ${modelName} não tem chave primária`);
    }

    const record = await this.prisma[this.toCamelCase(modelName)].findUnique({
      where: { [primaryKey.name]: id },
    });

    if (!record) {
      throw new NotFoundException(`Registro com ID ${id} não encontrado`);
    }

    return {
      modelName,
      fields: model.fields,
      record,
      page: `Registro: ${id}`,
      helpers: this.getHelpers(),
    };
  }

  async updateRecord(modelName: string, id: string, data: any) {
    if (!this.prisma[this.toCamelCase(modelName)]) {
      throw new NotFoundException(`Modelo ${modelName} não encontrado`);
    }

    const model = this.dmmf.modelMap[modelName];
    if (!model) {
      throw new NotFoundException(`Modelo ${modelName} não encontrado`);
    }

    const primaryKey = model.fields.find((f) => f.isId);
    if (!primaryKey) {
      throw new NotFoundException(`Modelo ${modelName} não tem chave primária`);
    }

    // Limpar dados antes de atualizar
    const cleanData = this.cleanUpdateData(data, model.fields);

    return this.prisma[this.toCamelCase(modelName)].update({
      where: { [primaryKey.name]: id },
      data: cleanData,
    });
  }

  private cleanUpdateData(data: any, fields: any[]): any {
    const result = {};

    fields.forEach((field) => {
      if (data[field.name] !== undefined) {
        // Converter tipos conforme necessário
        if (field.type === 'Int' || field.type === 'Float') {
          result[field.name] = Number(data[field.name]);
        } else if (field.type === 'Boolean') {
          result[field.name] = data[field.name] === 'true';
        } else if (field.type === 'DateTime') {
          result[field.name] = new Date(data[field.name]);
        } else {
          result[field.name] = data[field.name];
        }
      }
    });

    return result;
  }

  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private getHelpers() {
    return {
      isObject: this.helpers.isObject,
      isDate: this.helpers.isDate,
      isBoolean: this.helpers.isBoolean,
      formatDate: this.helpers.formatDate,
      formatDateInput: this.formatDateInput,
      isJsonField: this.helpers.isJsonField,
      isTextField: this.helpers.isTextField,
      isDateField: this.helpers.isDateField,
      isBooleanField: this.helpers.isBooleanField,
    };
  }

  private formatDateInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
