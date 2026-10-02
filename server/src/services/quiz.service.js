import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';

const vehicleTypes = ['car', 'motorbike'];
const statuses = ['draft', 'published'];
const licensesByVehicle = { car: ['B1', 'B2'], motorbike: ['A1', 'A2'] };
const questionKey = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');
const invalidQuestion = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parseOptions = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return JSON.parse(value);
  return [];
};

const fromRow = (row, includeAnswer = true) => {
  if (!row) return null;
  const question = {
    _id: row.id,
    vehicleType: row.vehicle_type,
    licenseType: row.license_type,
    question: row.question,
    options: parseOptions(row.options),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includeAnswer) {
    question.correctOption = row.correct_option;
    question.explanation = row.explanation;
  }
  return question;
};

const validatePayload = (payload) => {
  const vehicleType = payload.vehicleType || 'car';
  const licenseType = payload.licenseType || licensesByVehicle[vehicleType]?.[0];
  const question = typeof payload.question === 'string' ? payload.question.trim() : '';
  const options = Array.isArray(payload.options) ? payload.options.map((option) => String(option).trim()) : [];
  const correctOption = Number(payload.correctOption);
  const explanation = typeof payload.explanation === 'string' ? payload.explanation.trim() : '';
  const status = payload.status || 'published';

  if (!vehicleTypes.includes(vehicleType)) throw invalidQuestion('Loại câu hỏi không hợp lệ.');
  if (!licensesByVehicle[vehicleType]?.includes(licenseType)) throw invalidQuestion('Hạng bằng lái không hợp lệ.');
  if (question.length < 5) throw invalidQuestion('Câu hỏi phải có ít nhất 5 ký tự.');
  if (options.length < 2 || options.length > 6 || options.some((option) => !option)) throw invalidQuestion('Câu hỏi cần từ 2 đến 6 đáp án.');
  if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption >= options.length) throw invalidQuestion('Đáp án đúng không hợp lệ.');
  if (!statuses.includes(status)) throw invalidQuestion('Trạng thái câu hỏi không hợp lệ.');

  return { vehicleType, licenseType, question, options, correctOption, explanation, status };
};

export const getPublicQuestions = async (vehicleType = 'car', licenseType = '') => {
  const type = vehicleTypes.includes(vehicleType) ? vehicleType : 'car';
  const license = licensesByVehicle[type].includes(licenseType) ? licenseType : licensesByVehicle[type][0];
  const [rows] = await pool.execute(
    `SELECT * FROM quiz_questions
     WHERE status = 'published' AND vehicle_type = ? AND license_type = ?
     ORDER BY created_at ASC`,
    [type, license],
  );
  return rows.map((row) => fromRow(row, false));
};

export const getAdminQuestions = async () => {
  const [rows] = await pool.query('SELECT * FROM quiz_questions ORDER BY created_at DESC');
  const questions = rows.map((row) => fromRow(row));
  const groups = new Map();
  questions.forEach((item) => {
    const key = `${item.vehicleType}:${item.licenseType}:${questionKey(item.question)}`;
    groups.set(key, (groups.get(key) || 0) + 1);
  });
  return questions.map((item) => {
    const key = `${item.vehicleType}:${item.licenseType}:${questionKey(item.question)}`;
    const duplicateCount = groups.get(key) || 1;
    return { ...item, isDuplicate: duplicateCount > 1, duplicateCount };
  });
};

export const createQuestion = async (payload) => {
  const question = validatePayload(payload);
  const id = randomUUID();
  await pool.execute(
    `INSERT INTO quiz_questions
      (id, vehicle_type, license_type, question, options, correct_option, explanation, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, question.vehicleType, question.licenseType, question.question, JSON.stringify(question.options), question.correctOption, question.explanation, question.status],
  );
  const [rows] = await pool.execute('SELECT * FROM quiz_questions WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const updateQuestion = async (id, payload) => {
  const question = validatePayload(payload);
  const [result] = await pool.execute(
    `UPDATE quiz_questions
     SET vehicle_type = ?, license_type = ?, question = ?, options = ?, correct_option = ?, explanation = ?, status = ?, updated_at = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [question.vehicleType, question.licenseType, question.question, JSON.stringify(question.options), question.correctOption, question.explanation, question.status, id],
  );
  if (!result.affectedRows) return null;
  const [rows] = await pool.execute('SELECT * FROM quiz_questions WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const deleteQuestion = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM quiz_questions WHERE id = ?', [id]);
  if (!rows.length) return null;
  await pool.execute('DELETE FROM quiz_questions WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

const normalizeImportedVehicle = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (['ô tô', 'oto', 'o to', 'car'].includes(normalized)) return 'car';
  if (['xe máy', 'xe may', 'motorbike', 'motorcycle'].includes(normalized)) return 'motorbike';
  return '';
};

const normalizeImportedCorrectOption = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  const index = optionLabels.indexOf(normalized);
  if (index >= 0) return index;
  const number = Number(normalized);
  return Number.isInteger(number) && number >= 1 && number <= 6 ? number - 1 : -1;
};

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

export const importQuestions = async (rows) => {
  const connection = await pool.getConnection();
  const report = { imported: 0, skipped: 0, errors: [] };
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.query('SELECT vehicle_type, license_type, question FROM quiz_questions');
    const existingKeys = new Set(existingRows.map((row) => `${row.vehicle_type}:${row.license_type}:${questionKey(row.question)}`));
    for (const [index, row] of rows.entries()) {
      const line = index + 2;
      const vehicleType = normalizeImportedVehicle(row[0]);
      const licenseType = String(row[1] || '').trim().toUpperCase();
      const question = String(row[2] || '').trim();
      const options = row.slice(3, 7).map((value) => String(value || '').trim());
      const correctOption = normalizeImportedCorrectOption(row[7]);

      if (!vehicleType || !licensesByVehicle[vehicleType]?.includes(licenseType)) {
        report.errors.push(`Dòng ${line}: loại xe hoặc hạng bằng không hợp lệ.`);
        continue;
      }
      if (question.length < 5 || options.length < 2 || options.some((option) => !option) || correctOption < 0 || correctOption >= options.length) {
        report.errors.push(`Dòng ${line}: câu hỏi, đáp án hoặc cột Câu đúng không hợp lệ.`);
        continue;
      }

      const duplicateKey = `${vehicleType}:${licenseType}:${questionKey(question)}`;
      if (existingKeys.has(duplicateKey)) {
        report.skipped += 1;
        continue;
      }

      await connection.execute(
        `INSERT INTO quiz_questions
          (id, vehicle_type, license_type, question, options, correct_option, explanation, status)
         VALUES (?, ?, ?, ?, ?, ?, '', 'published')`,
        [randomUUID(), vehicleType, licenseType, question, JSON.stringify(options), correctOption],
      );
      existingKeys.add(duplicateKey);
      report.imported += 1;
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return report;
};

export const submitQuiz = async ({ vehicleType = 'car', licenseType = '', answers = [] }) => {
  const questions = await getPublicQuestions(vehicleType, licenseType);
  const answerMap = new Map(
    (Array.isArray(answers) ? answers : [])
      .filter((answer) => answer && typeof answer.questionId === 'string')
      .map((answer) => [answer.questionId, Number(answer.optionIndex)]),
  );
  const type = vehicleTypes.includes(vehicleType) ? vehicleType : 'car';
  const license = licensesByVehicle[type].includes(licenseType) ? licenseType : licensesByVehicle[type][0];
  const [rows] = await pool.execute(
    `SELECT * FROM quiz_questions
     WHERE status = 'published' AND vehicle_type = ? AND license_type = ?`,
    [type, license],
  );
  const questionById = new Map(rows.map((row) => [row.id, row]));
  const results = questions.map((question) => {
    const row = questionById.get(question._id);
    const selectedOption = answerMap.get(question._id);
    const isCorrect = selectedOption === row.correct_option;
    return {
      ...question,
      selectedOption: Number.isInteger(selectedOption) ? selectedOption : null,
      correctOption: row.correct_option,
      explanation: row.explanation,
      isCorrect,
    };
  });
  const score = results.filter((result) => result.isCorrect).length;
  return {
    total: results.length,
    score,
    percentage: results.length ? Math.round((score / results.length) * 100) : 0,
    results,
  };
};
