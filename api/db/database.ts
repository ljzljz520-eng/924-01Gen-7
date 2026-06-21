import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'stickers.db');

let db: Database | null = null;

function ensureDirExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function saveDatabase() {
  if (!db) return;
  try {
    ensureDirExists(dbDir);
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

function loadExistingDatabase(SQL: any): Database | null {
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      return new SQL.Database(fileBuffer);
    }
  } catch (error) {
    console.error('Failed to load existing database:', error);
  }
  return null;
}

export async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(__dirname, '../../node_modules/sql.js/dist', file),
  });

  ensureDirExists(dbDir);
  const existingDb = loadExistingDatabase(SQL);
  
  if (existingDb) {
    db = existingDb;
    console.log('Database loaded from file');
  } else {
    db = new SQL.Database();
    console.log('New database created');
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stickers (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(20) NOT NULL,
      print_size VARCHAR(20) NOT NULL,
      color_mode VARCHAR(10) NOT NULL,
      license_type VARCHAR(20) NOT NULL,
      width_mm FLOAT NOT NULL,
      height_mm FLOAT NOT NULL,
      tags TEXT,
      image_url VARCHAR(500) NOT NULL,
      preview_url VARCHAR(500) NOT NULL,
      author_id VARCHAR(36) NOT NULL,
      author_name VARCHAR(100) NOT NULL,
      downloads INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      pack_name VARCHAR(255),
      sticker_ids TEXT NOT NULL,
      format VARCHAR(10) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS themes (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      cover_url VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS theme_stickers (
      theme_id VARCHAR(36),
      sticker_id VARCHAR(36),
      PRIMARY KEY (theme_id, sticker_id)
    );
  `);

  saveDatabase();

  const result = db.exec('SELECT COUNT(*) as count FROM stickers');
  const count = result[0]?.values[0]?.[0] as number || 0;
  
  if (count === 0) {
    const sampleStickers = [
      ['1', '春日樱花日期贴', '粉嫩樱花风格的日期记录贴纸，适合记录每天的美好时光', 'date', 'medium', 'cmyk', 'personal', 40, 40, '樱花,春日,粉色', '/images/stickers/date-sakura.png', '/images/previews/date-sakura.png', 'author1', '小樱', 128],
      ['2', '晴朗天气图标', '可爱风格的晴天天气贴纸，让你的手账充满阳光', 'weather', 'small', 'rgb', 'personal', 30, 30, '晴天,太阳,可爱', '/images/stickers/weather-sunny.png', '/images/previews/weather-sunny.png', 'author1', '小樱', 256],
      ['3', '旅行打卡地标', '世界各地著名地标剪影贴纸，记录你的旅行足迹', 'travel', 'large', 'cmyk', 'commercial', 60, 80, '旅行,地标,打卡', '/images/stickers/travel-landmark.png', '/images/previews/travel-landmark.png', 'author2', '旅人', 512],
      ['4', '学习计划便签', '简洁实用的学习计划模板贴纸，提高学习效率', 'study', 'medium', 'rgb', 'personal', 50, 70, '学习,计划,便签', '/images/stickers/study-plan.png', '/images/previews/study-plan.png', 'author2', '旅人', 384],
      ['5', '萌系猫咪日期贴', '超萌猫咪造型的日期贴纸，每天都有好心情', 'date', 'medium', 'rgb', 'personal', 45, 45, '猫咪,萌系,可爱', '/images/stickers/date-cat.png', '/images/previews/date-cat.png', 'author1', '小樱', 420],
      ['6', '彩虹天气贴纸', '彩虹云朵天气贴纸套装，包含各种天气图标', 'weather', 'small', 'cmyk', 'personal', 35, 35, '彩虹,云朵,天气', '/images/stickers/weather-rainbow.png', '/images/previews/weather-rainbow.png', 'author3', '糖糖', 310],
      ['7', '复古相机旅行贴', '复古相机和旅行元素贴纸，记录旅途美好', 'travel', 'medium', 'cmyk', 'commercial', 55, 55, '复古,相机,旅行', '/images/stickers/travel-camera.png', '/images/previews/travel-camera.png', 'author2', '旅人', 280],
      ['8', '学霸养成计划', '学霸主题学习计划贴纸，激励自己努力学习', 'study', 'large', 'rgb', 'personal', 65, 85, '学霸,学习,励志', '/images/stickers/study-scholar.png', '/images/previews/study-scholar.png', 'author3', '糖糖', 195],
      ['9', '简约数字日期贴', '极简风格数字日期贴纸，百搭各种手账风格', 'date', 'small', 'cmyk', 'commercial', 30, 30, '简约,数字,百搭', '/images/stickers/date-minimal.png', '/images/previews/date-minimal.png', 'author4', '设计师小王', 450],
      ['10', '手绘天气预报', '手绘风格天气预报贴纸，让记录天气更有趣', 'weather', 'medium', 'rgb', 'personal', 45, 45, '手绘,天气,预报', '/images/stickers/weather-handdrawn.png', '/images/previews/weather-handdrawn.png', 'author1', '小樱', 275],
      ['11', '世界美食旅行贴', '各国美食贴纸，记录旅途中的味蕾体验', 'travel', 'medium', 'cmyk', 'personal', 50, 50, '美食,世界,旅行', '/images/stickers/travel-food.png', '/images/previews/travel-food.png', 'author2', '旅人', 390],
      ['12', '番茄钟学习贴纸', '番茄工作法主题学习贴纸，提高专注力', 'study', 'medium', 'rgb', 'personal', 45, 45, '番茄钟,效率,专注', '/images/stickers/study-pomodoro.png', '/images/previews/study-pomodoro.png', 'author3', '糖糖', 220],
    ];

    const insertStmt = db.prepare(
      'INSERT INTO stickers (id, title, description, category, print_size, color_mode, license_type, width_mm, height_mm, tags, image_url, preview_url, author_id, author_name, downloads) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    for (const sticker of sampleStickers) {
      insertStmt.run(sticker);
    }

    const insertThemeStmt = db.prepare(
      'INSERT INTO themes (id, name, description, cover_url) VALUES (?, ?, ?, ?)'
    );

    const insertThemeStickerStmt = db.prepare(
      'INSERT INTO theme_stickers (theme_id, sticker_id) VALUES (?, ?)'
    );

    const themes = [
      ['t1', '春日樱花季', '樱花盛开的季节，用粉色装点你的手账', '/images/stickers/date-sakura.png'],
      ['t2', '旅行达人', '旅行必备贴纸套装，记录每一段旅程', '/images/stickers/travel-landmark.png'],
      ['t3', '学霸养成', '学习计划贴纸合集，让学习更有动力', '/images/stickers/study-scholar.png'],
      ['t4', '可爱萌宠', '超萌宠物主题贴纸，治愈每一天', '/images/stickers/date-cat.png'],
    ];

    for (const theme of themes) {
      insertThemeStmt.run(theme);
    }

    const themeStickers = [
      ['t1', '1'], ['t1', '2'], ['t1', '5'],
      ['t2', '3'], ['t2', '7'], ['t2', '11'],
      ['t3', '4'], ['t3', '8'], ['t3', '12'],
      ['t4', '5'], ['t4', '6'], ['t4', '10'],
    ];

    for (const ts of themeStickers) {
      insertThemeStickerStmt.run(ts);
    }

    saveDatabase();
    console.log('Database initialized with sample data');
  }
}
