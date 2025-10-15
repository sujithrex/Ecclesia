class BurialRegisterService {
    constructor(db) {
        this.db = db;
    }

    async createRegister(registerData, userId) {
        try {
            // Validate required fields with detailed error messages
            const {
                church_id, certificate_number, date_of_death, when_buried, name_of_person_died,
                sex, age, cause_of_death, father_name, mother_name, where_buried,
                signature_who_buried, certified_rev_name, holding_office, certificate_date,
                certificate_place
            } = registerData;

            // Check each field and collect missing fields
            const missingFields = [];
            if (!church_id) missingFields.push('Church');
            if (!certificate_number) missingFields.push('Certificate Number');
            if (!date_of_death) missingFields.push('Date of Death');
            if (!when_buried) missingFields.push('When Buried');
            if (!name_of_person_died) missingFields.push('Name of Person Died');
            if (!sex) missingFields.push('Sex');
            if (!age) missingFields.push('Age');
            if (!cause_of_death) missingFields.push('Cause of Death');
            if (!father_name) missingFields.push('Father Name');
            if (!mother_name) missingFields.push('Mother Name');
            if (!where_buried) missingFields.push('Where Buried');
            if (!signature_who_buried) missingFields.push('Signature Who Buried');
            if (!certified_rev_name) missingFields.push('Certified Rev Name');
            if (!holding_office) missingFields.push('Holding Office');
            if (!certificate_date) missingFields.push('Certificate Date');
            if (!certificate_place) missingFields.push('Certificate Place');

            if (missingFields.length > 0) {
                return {
                    success: false,
                    error: `Missing required fields: ${missingFields.join(', ')}`
                };
            }

            // Validate sex field
            const validSex = ['male', 'female'];
            if (!validSex.includes(sex.toLowerCase())) {
                return { success: false, error: 'Sex must be either male or female' };
            }

            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === church_id);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Create the register
            const result = await this.db.createBurialRegister({
                ...registerData,
                sex: sex.toLowerCase(),
                created_by: userId
            });

            return {
                success: true,
                registerId: result.id,
                message: 'Burial register created successfully'
            };
        } catch (error) {
            console.error('Create burial register error:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                return { success: false, error: 'A register with this number already exists' };
            }
            return { success: false, error: 'Failed to create burial register' };
        }
    }

    async getRegistersByChurch(churchId, userId, page = 1, limit = 8) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const offset = (page - 1) * limit;
            const registers = await this.db.getBurialRegistersByChurch(churchId, limit, offset);
            const totalCount = await this.db.getBurialRegistersCount(churchId);

            return {
                success: true,
                registers: registers,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount: totalCount,
                    limit: limit
                }
            };
        } catch (error) {
            console.error('Get burial registers error:', error);
            return { success: false, error: 'Failed to get burial registers' };
        }
    }

    async getRegisterById(registerId, userId) {
        try {
            const register = await this.db.getBurialRegisterById(registerId);

            if (!register) {
                return { success: false, error: 'Burial register not found' };
            }

            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === register.church_id);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this burial register' };
            }

            return {
                success: true,
                register: register
            };
        } catch (error) {
            console.error('Get burial register error:', error);
            return { success: false, error: 'Failed to get burial register' };
        }
    }

    async updateRegister(registerId, registerData, userId) {
        try {
            // Get existing register to verify access
            const existing = await this.db.getBurialRegisterById(registerId);

            if (!existing) {
                return { success: false, error: 'Burial register not found' };
            }

            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === existing.church_id);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this burial register' };
            }

            // Validate sex field if provided
            if (registerData.sex) {
                const validSex = ['male', 'female'];
                if (!validSex.includes(registerData.sex.toLowerCase())) {
                    return { success: false, error: 'Sex must be either male or female' };
                }
                registerData.sex = registerData.sex.toLowerCase();
            }

            // Update the register
            const result = await this.db.updateBurialRegister(registerId, registerData);

            if (result.changes === 0) {
                return { success: false, error: 'Burial register not found or no changes made' };
            }

            return {
                success: true,
                message: 'Burial register updated successfully'
            };
        } catch (error) {
            console.error('Update burial register error:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                return { success: false, error: 'A register with this number already exists' };
            }
            return { success: false, error: 'Failed to update burial register' };
        }
    }

    async deleteRegister(registerId, userId) {
        try {
            // Get existing register to verify access
            const existing = await this.db.getBurialRegisterById(registerId);

            if (!existing) {
                return { success: false, error: 'Burial register not found' };
            }

            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === existing.church_id);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this burial register' };
            }

            // Delete the register
            const result = await this.db.deleteBurialRegister(registerId);

            if (result.changes === 0) {
                return { success: false, error: 'Burial register not found' };
            }

            return {
                success: true,
                message: 'Burial register deleted successfully'
            };
        } catch (error) {
            console.error('Delete burial register error:', error);
            return { success: false, error: 'Failed to delete burial register' };
        }
    }

    async getNextRegisterNumber(churchId, userId) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const nextNumber = await this.db.getNextBurialRegisterNumber(churchId);

            return {
                success: true,
                registerNumber: nextNumber
            };
        } catch (error) {
            console.error('Get next register number error:', error);
            return { success: false, error: 'Failed to get next register number' };
        }
    }

    async getRegisterDataForPDF(registerId, userId) {
        try {
            // Get register data
            const registerResult = await this.getRegisterById(registerId, userId);

            if (!registerResult.success) {
                return registerResult;
            }

            const register = registerResult.register;

            // Get church information
            const church = await this.db.getChurchById(register.church_id);

            if (!church) {
                return { success: false, error: 'Church not found' };
            }

            return {
                success: true,
                register: register,
                church: church
            };
        } catch (error) {
            console.error('Get burial register data for PDF error:', error);
            return { success: false, error: 'Failed to get burial register data' };
        }
    }
}

module.exports = BurialRegisterService;

