import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required for seed');

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ROLES = [
  { code: 'PIM_MANAGER', name: 'PIM Manager' },
  { code: 'MARKETING', name: 'Marketing' },
  { code: 'LOGISTICA', name: 'Logística' },
  { code: 'TECNICO_LEGAL', name: 'Técnico Legal' },
  { code: 'DAM_MANAGER', name: 'DAM Manager' },
  { code: 'IT_ADMIN', name: 'IT Admin' },
];

const PERMISSIONS = [
  { code: 'products:read', name: 'Leer productos', module: 'products' },
  { code: 'products:write', name: 'Escribir productos', module: 'products' },
  { code: 'attributes:read', name: 'Leer atributos', module: 'attributes' },
  { code: 'attributes:write', name: 'Escribir atributos', module: 'attributes' },
  { code: 'categories:read', name: 'Leer categorías', module: 'categories' },
  { code: 'categories:write', name: 'Escribir categorías', module: 'categories' },
  { code: 'dam:read', name: 'Leer DAM', module: 'dam' },
  { code: 'dam:write', name: 'Escribir DAM', module: 'dam' },
  { code: 'workflows:read', name: 'Leer workflows', module: 'workflows' },
  { code: 'workflows:write', name: 'Escribir workflows', module: 'workflows' },
  { code: 'imports:read', name: 'Leer imports', module: 'imports' },
  { code: 'imports:write', name: 'Escribir imports', module: 'imports' },
  { code: 'channels:read', name: 'Leer canales', module: 'channels' },
  { code: 'channels:write', name: 'Escribir canales', module: 'channels' },
  { code: 'mappings:read', name: 'Leer mappings', module: 'mappings' },
  { code: 'mappings:write', name: 'Escribir mappings', module: 'mappings' },
  { code: 'gdsn:read', name: 'Leer GDSN', module: 'gdsn' },
  { code: 'gdsn:write', name: 'Escribir GDSN', module: 'gdsn' },
  { code: 'users:read', name: 'Leer usuarios', module: 'users' },
  { code: 'users:invite', name: 'Invitar usuarios', module: 'users' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  PIM_MANAGER: ['*'],
  IT_ADMIN: ['*'],
  MARKETING: ['products:read', 'products:write', 'dam:read', 'workflows:read', 'workflows:write'],
  LOGISTICA: ['imports:read', 'imports:write', 'channels:read', 'channels:write', 'gdsn:read', 'gdsn:write'],
  TECNICO_LEGAL: ['attributes:read', 'attributes:write', 'workflows:read', 'workflows:write'],
  DAM_MANAGER: ['products:read', 'dam:read', 'dam:write'],
};

async function main() {
  const passwordHash = await bcrypt.hash('lumify2025', 10);

  for (const role of ROLES) {
    await prisma.role.upsert({ where: { code: role.code }, update: { name: role.name }, create: role });
  }

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module },
      create: perm,
    });
  }

  const allPerms = await prisma.permission.findMany();
  const allRoles = await prisma.role.findMany();

  for (const role of allRoles) {
    const codes = ROLE_PERMISSIONS[role.code] ?? [];
    if (codes.includes('*')) continue;
    for (const code of codes) {
      const perm = allPerms.find((p) => p.code === code);
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'empresa-demo' },
    update: { name: 'Empresa Demo' },
    create: { name: 'Empresa Demo', slug: 'empresa-demo' },
  });

  const users = [
    { email: 'admin@lumify.io', name: 'Admin', initials: 'AD', role: 'PIM_MANAGER' },
    { email: 'm.garcia@empresa.com', name: 'María García', initials: 'MG', role: 'MARKETING' },
    { email: 'p.serra@empresa.com', name: 'Pau Serra', initials: 'PS', role: 'IT_ADMIN' },
    { email: 'c.pons@empresa.com', name: 'Carlos Pons', initials: 'CP', role: 'LOGISTICA' },
    { email: 'a.puig@empresa.com', name: 'Ana Puig', initials: 'AP', role: 'TECNICO_LEGAL' },
    { email: 'j.mas@empresa.com', name: 'Joan Mas', initials: 'JM', role: 'DAM_MANAGER' },
  ];

  for (const u of users) {
    const role = allRoles.find((r) => r.code === u.role)!;
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, initials: u.initials, passwordHash },
      create: { email: u.email, name: u.name, initials: u.initials, passwordHash },
    });
    await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: { roleId: role.id, status: u.email === 'a.puig@empresa.com' ? 'inactive' : 'active' },
      create: { tenantId: tenant.id, userId: user.id, roleId: role.id, status: u.email === 'a.puig@empresa.com' ? 'inactive' : 'active' },
    });
  }

  const group = await prisma.attributeGroup.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'GRP-GENERAL' } },
    update: {},
    create: { tenantId: tenant.id, code: 'GRP-GENERAL', name: 'General' },
  });

  const attributes = [
    { code: 'color_primario', name: 'Color primario', type: 'color', channels: ['E-Commerce'], status: 'published' },
    { code: 'peso_neto', name: 'Peso neto', type: 'number', channels: ['E-Commerce', 'GDSN'], status: 'published' },
    { code: 'descripcion_larga', name: 'Descripción larga', type: 'text', channels: ['E-Commerce'], status: 'published' },
    { code: 'gtin', name: 'GTIN', type: 'identifier', channels: ['GDSN'], status: 'published' },
    { code: 'certificado_ce', name: 'Certificado CE', type: 'boolean', channels: ['GDSN'], status: 'draft' },
  ];

  for (const attr of attributes) {
    await prisma.attribute.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: attr.code } },
      update: attr,
      create: { tenantId: tenant.id, groupId: group.id, ...attr },
    });
  }

  const categories = [
    { code: 'CAT-001', name: 'Calzado', level: 0 },
    { code: 'CAT-002', name: 'Trail Running', level: 1 },
    { code: 'CAT-003', name: 'Zapatillas', level: 2 },
    { code: 'CAT-010', name: 'Accesorios', level: 0 },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: cat.code } },
      update: { name: cat.name, level: cat.level },
      create: { tenantId: tenant.id, code: cat.code, name: cat.name, level: cat.level },
    });
    catMap[cat.code] = created.id;
  }

  const products = [
    { code: 'PRD-00812', name: 'Zapatilla Trail Pro X5', status: 'published' },
    { code: 'PRD-00813', name: 'Zapatilla Urban Lite', status: 'draft' },
    { code: 'PRD-00814', name: 'Mochila Trail 30L', status: 'published' },
    { code: 'PRD-00815', name: 'Bastones Carbono Z', status: 'incomplete' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: p.code } },
      update: { name: p.name, status: p.status, categoryId: catMap['CAT-003'] },
      create: { tenantId: tenant.id, code: p.code, name: p.name, status: p.status, categoryId: catMap['CAT-003'] },
    });
  }

  const channels = [
    { name: 'E-Commerce', connector: 'Shopify', productCount: 10919, status: 'connected', lastSyncAt: new Date() },
    { name: 'Marketplace', connector: 'Amazon SP', productCount: 7965, status: 'connected', lastSyncAt: new Date(Date.now() - 3600000) },
    { name: 'GDSN / GS1', connector: '1WorldSync', productCount: 6167, status: 'connected', lastSyncAt: new Date(Date.now() - 7200000) },
    { name: 'ERP / SAP', connector: 'SAP S/4', productCount: 2312, status: 'pending', lastSyncAt: new Date(Date.now() - 43200000) },
    { name: 'Print / Catálogo', connector: 'InDesign API', productCount: 4882, status: 'connected', lastSyncAt: new Date(Date.now() - 86400000) },
  ];

  for (const ch of channels) {
    const existing = await prisma.channel.findFirst({ where: { tenantId: tenant.id, name: ch.name } });
    if (existing) await prisma.channel.update({ where: { id: existing.id }, data: ch });
    else await prisma.channel.create({ data: { tenantId: tenant.id, ...ch } });
  }

  for (const job of [
    { code: 'IMP-0089', type: 'CSV', status: 'completed', rowCount: 1240 },
    { code: 'IMP-0090', type: 'XLSX', status: 'pending', rowCount: 0 },
  ]) {
    await prisma.importJob.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: job.code } },
      update: job,
      create: { tenantId: tenant.id, ...job },
    });
  }

  for (const job of [{ code: 'EXP-0212', type: 'attributes', status: 'completed', rowCount: 48 }]) {
    await prisma.exportJob.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: job.code } },
      update: job,
      create: { tenantId: tenant.id, ...job },
    });
  }

  let profile = await prisma.mappingProfile.findFirst({ where: { tenantId: tenant.id } });
  if (!profile) {
    profile = await prisma.mappingProfile.create({
      data: { tenantId: tenant.id, name: 'Shopify → Lumify', source: 'shopify', target: 'lumify' },
    });
  }

  for (const rule of [
    { name: 'title → name', sourceField: 'title', targetField: 'name', transform: 'direct' },
    { name: 'body_html → descripcion_larga', sourceField: 'body_html', targetField: 'descripcion_larga', transform: 'strip_html' },
  ]) {
    const exists = await prisma.mappingRule.findFirst({ where: { profileId: profile.id, name: rule.name } });
    if (!exists) await prisma.mappingRule.create({ data: { profileId: profile.id, ...rule } });
  }

  const wfNames = ['Revisión Legal', 'Traducción EN', 'Publicación GDSN'];
  const workflows = [];
  for (const name of wfNames) {
    let wf = await prisma.workflow.findFirst({ where: { tenantId: tenant.id, name } });
    if (!wf) wf = await prisma.workflow.create({ data: { tenantId: tenant.id, name, status: 'active' } });
    workflows.push(wf);
  }

  const taskData = [
    { workflowId: workflows[0].id, productName: 'Zapatilla Trail Pro X5', stage: 'Aprobación legal', priority: 'high', status: 'pending' },
    { workflowId: workflows[1].id, productName: 'Mochila Trail 30L', stage: 'Revisión marketing', priority: 'normal', status: 'in_progress' },
    { workflowId: workflows[2].id, productName: 'Bastones Carbono Z', stage: 'Enriquecimiento', priority: 'medium', status: 'blocked' },
  ];
  for (const t of taskData) {
    const exists = await prisma.workflowTask.findFirst({ where: { workflowId: t.workflowId, productName: t.productName } });
    if (!exists) await prisma.workflowTask.create({ data: t });
  }

  for (const pub of [
    { gtin: '08400812345678', productName: 'Zapatilla Trail Pro X5', dataPool: '1WorldSync', recipient: 'Carrefour', status: 'accepted', sentAt: new Date() },
    { gtin: '08400812345679', productName: 'Mochila Trail 30L', dataPool: 'Salsify', recipient: 'Decathlon', status: 'accepted', sentAt: new Date() },
    { gtin: '08400812345680', productName: 'Bastones Carbono Z', dataPool: '1WorldSync', recipient: 'El Corte Inglés', status: 'rejected', sentAt: new Date(Date.now() - 86400000) },
  ]) {
    const exists = await prisma.gdsnPublication.findFirst({ where: { tenantId: tenant.id, gtin: pub.gtin } });
    if (!exists) await prisma.gdsnPublication.create({ data: { tenantId: tenant.id, ...pub } });
  }

  const prd812 = await prisma.product.findUnique({ where: { tenantId_code: { tenantId: tenant.id, code: 'PRD-00812' } } });
  const prd814 = await prisma.product.findUnique({ where: { tenantId_code: { tenantId: tenant.id, code: 'PRD-00814' } } });

  for (const asset of [
    { name: 'trail-pro-x5-hero.jpg', type: 'image', sizeBytes: 2516582, productId: prd812?.id, channel: 'E-Commerce' },
    { name: 'mochila-trail-30L-ficha.pdf', type: 'pdf', sizeBytes: 860160, productId: prd814?.id, channel: 'Print' },
    { name: 'trail-pro-x5-video.mp4', type: 'video', sizeBytes: 193273528, productId: prd812?.id, channel: 'Social' },
  ]) {
    const exists = await prisma.digitalAsset.findFirst({ where: { tenantId: tenant.id, name: asset.name } });
    if (!exists) await prisma.digitalAsset.create({ data: { tenantId: tenant.id, ...asset } });
  }

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@lumify.io' } });
  for (const log of [
    { action: 'import_completed', module: 'imports', message: 'Importación CSV completada — 1.240 productos' },
    { action: 'attribute_published', module: 'attributes', message: 'Nuevo atributo color_primario publicado en canal E-Commerce' },
    { action: 'workflow_pending', module: 'workflows', message: 'Workflow Revisión Legal pendiente de aprobación' },
    { action: 'gdsn_sync', module: 'gdsn', message: 'Sincronización GDSN completada — 892 GTINs enviados' },
    { action: 'mapping_error', module: 'mappings', message: 'Error de mapeo en canal Marketplace — 3 productos fallidos' },
  ]) {
    await prisma.auditLog.create({ data: { tenantId: tenant.id, userId: adminUser?.id, ...log } });
  }

  console.log('Seed completed for tenant:', tenant.slug);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
