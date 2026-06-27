import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Category } from 'src/categories/category.entity';
import { Supplier } from 'src/suppliers/supplier.entity';
import { Product } from 'src/products/product.entity';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    console.log('🌱 Seeding database...');

    // Clear all tables respecting FK constraints
    await dataSource.query(`
        TRUNCATE TABLE movement, product, category, supplier RESTART IDENTITY CASCADE
    `);

    const categoryRepo = dataSource.getRepository(Category);
    const supplierRepo = dataSource.getRepository(Supplier);
    const productRepo = dataSource.getRepository(Product);

    // Seed Categories
    const categories = await categoryRepo.save([
        { name: 'GPU', description: 'Graphics Cards' },
        { name: 'CPU', description: 'Processors' },
        { name: 'RAM', description: 'Memory Modules' },
        { name: 'Storage', description: 'SSDs and HDDs' },
    ]);

    // Seed Suppliers
    const suppliers = await supplierRepo.save([
        { name: 'TechDistrib MX', company: 'TechDistrib México S.A.', email: 'ventas@techdistrib.mx', phone: '4421234567' },
        { name: 'CompuMayoreo', company: 'CompuMayoreo del Bajío', email: 'pedidos@compumayoreo.mx', phone: '4429876543' },
    ]);

      // Seed Products
    const products = await productRepo.save([
        { name: 'RTX 4070 Super', price: 12500, stock: 15, category: categories[0], supplier: suppliers[0] },
        { name: 'RX 7800 XT', price: 9800, stock: 8, category: categories[0], supplier: suppliers[1] },
        { name: 'Ryzen 7 7700X', price: 6200, stock: 20, category: categories[1], supplier: suppliers[0] },
        { name: 'Kingston Fury 32GB DDR5', price: 2800, stock: 45, category: categories[2], supplier: suppliers[1] },
        { name: 'Samsung 990 Pro 1TB', price: 3100, stock: 30, category: categories[3], supplier: suppliers[0] },
    ]);

    // Seed Movements
    const movementRepo = dataSource.getRepository('movement');
    await movementRepo.save([
        { product: products[0], type: 'in', quantity: 20, notes: 'Compra inicial' },
        { product: products[0], type: 'out', quantity: 5, notes: 'Venta cliente' },
        { product: products[1], type: 'in', quantity: 15, notes: 'Compra inicial' },
        { product: products[1], type: 'out', quantity: 7, notes: 'Venta mayoreo' },
        { product: products[2], type: 'in', quantity: 25, notes: 'Restock' },
        { product: products[3], type: 'in', quantity: 50, notes: 'Compra inicial' },
        { product: products[3], type: 'out', quantity: 5, notes: 'Venta cliente' },
        { product: products[4], type: 'in', quantity: 35, notes: 'Compra inicial' },
        { product: products[4], type: 'out', quantity: 5, notes: 'Venta cliente' },
    ]);
    console.log('✅ Seed complete!');
    await app.close();
}

bootstrap();