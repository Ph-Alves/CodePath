const { getDatabase } = require('./databaseConnection');

class LessonModel {
    /**
     * Listar todas as aulas para administração
     */
    static async getAllLessonsAdmin() {
        try {
            const query = `
                SELECT 
                    l.*,
                    p.name as package_name,
                    p.icon as package_icon,
                    0 as completion_count,
                    0 as completion_rate
                FROM lessons l
                LEFT JOIN packages p ON l.package_id = p.id
                ORDER BY p.name, l.order_sequence
            `;
            
            const database = getDatabase();
            const lessons = await database.all(query);
            return lessons;
        } catch (error) {
            console.error('Erro ao buscar aulas para admin:', error);
            throw error;
        }
    }

    /**
     * Listar aulas por pacote
     */
    static async getLessonsByPackage(packageId) {
        try {
            const query = `
                SELECT 
                    l.*,
                    p.name as package_name,
                    0 as completion_count
                FROM lessons l
                LEFT JOIN packages p ON l.package_id = p.id
                WHERE l.package_id = ?
                ORDER BY l.order_sequence
            `;
            
            const database = getDatabase();
            const lessons = await database.all(query, [packageId]);
            return lessons;
        } catch (error) {
            console.error('Erro ao buscar aulas por pacote:', error);
            throw error;
        }
    }

    /**
     * Buscar aula por ID para edição
     */
    static async getLessonById(lessonId) {
        try {
            const query = `
                SELECT 
                    l.*,
                    p.name as package_name,
                    0 as completion_count
                FROM lessons l
                LEFT JOIN packages p ON l.package_id = p.id
                WHERE l.id = ?
            `;
            
            const database = getDatabase();
            const lesson = await database.get(query, [lessonId]);
            return lesson;
        } catch (error) {
            console.error('Erro ao buscar aula por ID:', error);
            throw error;
        }
    }

    /**
     * Criar nova aula
     */
    static async createLesson(lessonData) {
        try {
            const query = `
                INSERT INTO lessons (
                    package_id, name, description, lesson_number, 
                    order_sequence, created_at
                ) VALUES (?, ?, ?, ?, ?, datetime('now'))
            `;
            
            const database = getDatabase();
            const result = await database.run(query, [
                lessonData.package_id,
                lessonData.name,
                lessonData.description,
                lessonData.lesson_number,
                lessonData.order_sequence
            ]);
            
            return result.lastID;
        } catch (error) {
            console.error('Erro ao criar aula:', error);
            throw error;
        }
    }

    /**
     * Atualizar aula existente
     */
    static async updateLesson(lessonId, lessonData) {
        try {
            const query = `
                UPDATE lessons SET
                    package_id = ?,
                    name = ?,
                    description = ?,
                    lesson_number = ?,
                    order_sequence = ?
                WHERE id = ?
            `;
            
            const database = getDatabase();
            const result = await database.run(query, [
                lessonData.package_id,
                lessonData.name,
                lessonData.description,
                lessonData.lesson_number,
                lessonData.order_sequence,
                lessonId
            ]);
            
            return result.changes > 0;
        } catch (error) {
            console.error('Erro ao atualizar aula:', error);
            throw error;
        }
    }

    /**
     * Excluir aula
     */
    static async deleteLesson(lessonId) {
        try {
            // Como user_progress não tem lesson_id, pular essa verificação
            const database = getDatabase();
            
            // Verificar se há quizzes associados
            const quizzesQuery = 'SELECT COUNT(*) as count FROM quizzes WHERE lesson_id = ?';
            const quizzesResult = await database.get(quizzesQuery, [lessonId]);
            
            if (quizzesResult.count > 0) {
                throw new Error('Não é possível excluir aula com quizzes associados');
            }
            
            // Excluir aula
            const query = 'DELETE FROM lessons WHERE id = ?';
            const result = await database.run(query, [lessonId]);
            
            return { deleted: result.changes > 0 };
        } catch (error) {
            console.error('Erro ao excluir aula:', error);
            throw error;
        }
    }

    /**
     * Reordenar aulas de um pacote
     */
    static async reorderLessons(packageId, lessonOrders) {
        try {
            const database = getDatabase();
            const db = database;
            
            await db.run('BEGIN TRANSACTION');
            
            try {
                for (const { lessonId, newOrder } of lessonOrders) {
                    await db.run(
                        'UPDATE lessons SET order_sequence = ? WHERE id = ? AND package_id = ?',
                        [newOrder, lessonId, packageId]
                    );
                }
                
                await db.run('COMMIT');
                return true;
            } catch (error) {
                await db.run('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Erro ao reordenar aulas:', error);
            throw error;
        }
    }

    /**
     * Buscar estatísticas de aulas
     */
    static async getLessonStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_lessons,
                    COUNT(DISTINCT package_id) as packages_with_lessons,
                    AVG(lesson_number) as avg_lesson_number,
                    MAX(lesson_number) as max_lesson_number
                FROM lessons
            `;
            
            const database = getDatabase();
            const stats = await database.get(query);
            return stats;
        } catch (error) {
            console.error('Erro ao buscar estatísticas de aulas:', error);
            throw error;
        }
    }

    /**
     * Buscar próximo número de sequência para um pacote
     */
    static async getNextOrderSequence(packageId) {
        try {
            const query = `
                SELECT COALESCE(MAX(order_sequence), 0) + 1 as next_order
                FROM lessons 
                WHERE package_id = ?
            `;
            
            const database = getDatabase();
            const result = await database.get(query, [packageId]);
            return result.next_order;
        } catch (error) {
            console.error('Erro ao buscar próxima sequência:', error);
            throw error;
        }
    }

    /**
     * Validar dados da aula
     */
    static validateLessonData(lessonData) {
        const errors = [];

        if (!lessonData.name || lessonData.name.trim().length < 3) {
            errors.push('Nome da aula deve ter pelo menos 3 caracteres');
        }

        if (!lessonData.description || lessonData.description.trim().length < 10) {
            errors.push('Descrição deve ter pelo menos 10 caracteres');
        }

        if (!lessonData.package_id || isNaN(lessonData.package_id)) {
            errors.push('Pacote é obrigatório');
        }

        if (!lessonData.lesson_number || lessonData.lesson_number < 1) {
            errors.push('Número da aula deve ser maior que 0');
        }

        if (!lessonData.order_sequence || lessonData.order_sequence < 1) {
            errors.push('Ordem da sequência deve ser maior que 0');
        }

        return errors;
    }
}

module.exports = LessonModel; 