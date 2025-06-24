const { getDatabase } = require('./databaseConnection');

class PackageModel {
    /**
     * Listar todos os pacotes para administração
     * Inclui pacotes ativos e inativos com estatísticas
     */
    static async getAllPackagesAdmin() {
        try {
            const query = `
                SELECT 
                    p.*,
                    COUNT(l.id) as lesson_count,
                    AVG(CASE WHEN up.completed_at IS NOT NULL THEN 1 ELSE 0 END) * 100 as completion_rate
                FROM packages p
                LEFT JOIN lessons l ON p.id = l.package_id
                LEFT JOIN user_progress up ON p.id = up.package_id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `;
            
            const database = getDatabase();
            const packages = await database.all(query);
            
            // Garantir que is_active seja boolean
            return packages.map(pkg => ({
                ...pkg,
                is_active: Boolean(pkg.is_active),
                completion_rate: Math.round(pkg.completion_rate || 0)
            }));
        } catch (error) {
            console.error('Erro ao buscar pacotes para admin:', error);
            throw error;
        }
    }

    /**
     * Buscar pacote por ID para edição
     */
    static async getPackageById(packageId) {
        try {
            const query = `
                SELECT p.*, COUNT(l.id) as lesson_count
                FROM packages p
                LEFT JOIN lessons l ON p.id = l.package_id
                WHERE p.id = ?
                GROUP BY p.id
            `;
            
            const database = getDatabase();
            const packageData = await database.get(query, [packageId]);
            
            if (packageData) {
                packageData.is_active = Boolean(packageData.is_active);
            }
            
            return packageData;
        } catch (error) {
            console.error('Erro ao buscar pacote por ID:', error);
            throw error;
        }
    }

    /**
     * Criar novo pacote
     */
    static async createPackage(packageData) {
        try {
            const query = `
                INSERT INTO packages (
                    name, description, difficulty, duration_hours, 
                    rating, tags, prerequisites, icon, is_active, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `;
            
            const database = getDatabase();
            const result = await database.run(query, [
                packageData.name,
                packageData.description,
                packageData.difficulty,
                packageData.duration_hours || 0,
                packageData.rating || 0,
                packageData.tags || '',
                packageData.prerequisites || '',
                packageData.icon || 'fas fa-code',
                packageData.is_active !== false ? 1 : 0 // Default true
            ]);
            
            return result.lastID;
        } catch (error) {
            console.error('Erro ao criar pacote:', error);
            throw error;
        }
    }

    /**
     * Atualizar pacote existente
     */
    static async updatePackage(packageId, packageData) {
        try {
            const query = `
                UPDATE packages SET
                    name = ?,
                    description = ?,
                    difficulty = ?,
                    duration_hours = ?,
                    rating = ?,
                    tags = ?,
                    prerequisites = ?,
                    icon = ?,
                    is_active = ?
                WHERE id = ?
            `;
            
            const database = getDatabase();
            const result = await database.run(query, [
                packageData.name,
                packageData.description,
                packageData.difficulty,
                packageData.duration_hours || 0,
                packageData.rating || 0,
                packageData.tags || '',
                packageData.prerequisites || '',
                packageData.icon || 'fas fa-code',
                packageData.is_active !== false ? 1 : 0,
                packageId
            ]);
            
            return result.changes > 0;
        } catch (error) {
            console.error('Erro ao atualizar pacote:', error);
            throw error;
        }
    }

    /**
     * Desativar/excluir pacote (soft delete)
     */
    static async deletePackage(packageId) {
        try {
            const database = getDatabase();
            
            // Verificar se há aulas associadas
            const lessonsQuery = 'SELECT COUNT(*) as count FROM lessons WHERE package_id = ?';
            const lessonsResult = await database.get(lessonsQuery, [packageId]);
            
            if (lessonsResult.count > 0) {
                // Soft delete se há aulas associadas
                const query = 'UPDATE packages SET is_active = 0 WHERE id = ?';
                const result = await database.run(query, [packageId]);
                return { 
                    deleted: result.changes > 0, 
                    soft_delete: true,
                    message: 'Pacote desativado com sucesso (possui aulas associadas)'
                };
            } else {
                // Hard delete se não há aulas associadas
                const query = 'DELETE FROM packages WHERE id = ?';
                const result = await database.run(query, [packageId]);
                return { 
                    deleted: result.changes > 0, 
                    soft_delete: false,
                    message: 'Pacote excluído com sucesso'
                };
            }
        } catch (error) {
            console.error('Erro ao excluir pacote:', error);
            throw error;
        }
    }

    /**
     * Reativar pacote
     */
    static async reactivatePackage(packageId) {
        try {
            const query = 'UPDATE packages SET is_active = 1 WHERE id = ?';
            const database = getDatabase();
            const result = await database.run(query, [packageId]);
            return result.changes > 0;
        } catch (error) {
            console.error('Erro ao reativar pacote:', error);
            throw error;
        }
    }

    /**
     * Buscar estatísticas de pacotes
     */
    static async getPackageStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_packages,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_packages,
                    COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_packages,
                    AVG(duration_hours) as avg_duration,
                    AVG(rating) as avg_rating
                FROM packages
            `;
            
            const database = getDatabase();
            const stats = await database.get(query);
            return {
                ...stats,
                avg_duration: Math.round(stats.avg_duration || 0),
                avg_rating: Math.round((stats.avg_rating || 0) * 10) / 10
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas de pacotes:', error);
            throw error;
        }
    }

    /**
     * Validar dados do pacote
     */
    static validatePackageData(packageData) {
        const errors = [];

        // Nome obrigatório
        if (!packageData.name || packageData.name.trim().length < 3) {
            errors.push('Nome do pacote deve ter pelo menos 3 caracteres');
        }

        // Descrição obrigatória
        if (!packageData.description || packageData.description.trim().length < 10) {
            errors.push('Descrição deve ter pelo menos 10 caracteres');
        }

        // Dificuldade válida
        if (!['Iniciante', 'Intermediário', 'Avançado'].includes(packageData.difficulty)) {
            errors.push('Dificuldade deve ser Iniciante, Intermediário ou Avançado');
        }

        // Duração válida
        if (!packageData.duration_hours || packageData.duration_hours < 1 || packageData.duration_hours > 1000) {
            errors.push('Duração deve estar entre 1 e 1000 horas');
        }

        // Rating válido (opcional)
        if (packageData.rating && (packageData.rating < 0 || packageData.rating > 5)) {
            errors.push('Rating deve estar entre 0 e 5');
        }

        return errors;
    }

    /**
     * Listar apenas pacotes ativos (para usuários)
     */
    static async getActivePackages() {
        try {
            const query = `
                SELECT 
                    p.*,
                    COUNT(l.id) as lesson_count
                FROM packages p
                LEFT JOIN lessons l ON p.id = l.package_id
                WHERE p.is_active = 1
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `;
            
            const database = getDatabase();
            const packages = await database.all(query);
            return packages;
        } catch (error) {
            console.error('Erro ao buscar pacotes ativos:', error);
            throw error;
        }
    }
}

module.exports = PackageModel; 